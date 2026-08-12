'use strict';

// Alysa — Shawn's always-on Discord bot.
// Self-contained: no gateway, no custom modules. Reads one Discord
// channel, forwards each message to the local `claude` CLI, and
// posts the reply back.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

fs.mkdirSync(path.dirname(config.logFile), { recursive: true });

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  try { fs.appendFileSync(config.logFile, stamped + '\n'); } catch (_) {}
}

function assertConfigured() {
  const problems = [];
  if (!config.allowedChannelId || String(config.allowedChannelId).startsWith('PASTE_'))
    problems.push('allowedChannelId');
  if (!config.allowedUserId || String(config.allowedUserId).startsWith('PASTE_'))
    problems.push('allowedUserId');
  if (!config.tokenFile || !fs.existsSync(config.tokenFile))
    problems.push('tokenFile (Discord bot token file missing)');
  if (problems.length) {
    log(`FATAL: config.json missing or unset: ${problems.join(', ')}`);
    process.exit(1);
  }
}
assertConfigured();

const discordToken = fs.readFileSync(config.tokenFile, 'utf8').trim();

const KILL_SWITCH = path.join(__dirname, 'KILL');
function killSwitchActive() {
  return fs.existsSync(KILL_SWITCH);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// Serialize claude invocations. Overlapping messages otherwise race
// over the working directory and the task ledger file.
let queue = Promise.resolve();

function chunkForDiscord(text) {
  const LIMIT = 1900;
  if (!text) return ['(no reply)'];
  const chunks = [];
  let rest = text;
  while (rest.length > LIMIT) {
    let cut = rest.lastIndexOf('\n', LIMIT);
    if (cut < LIMIT * 0.5) cut = LIMIT;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  chunks.push(rest);
  return chunks;
}

function runClaude(userMessage) {
  return new Promise((resolve) => {
    const args = [
      '-p', userMessage,
      '--permission-mode', config.permissionMode || 'bypassPermissions',
    ];
    if (config.model) args.push('--model', config.model);

    const env = { ...process.env };
    if (config.claudeTokenFile && fs.existsSync(config.claudeTokenFile)) {
      const dedicated = fs.readFileSync(config.claudeTokenFile, 'utf8').trim();
      if (dedicated) env.ANTHROPIC_API_KEY = dedicated;
    }

    const child = spawn(config.claudeExe || 'claude', args, {
      cwd: config.workingDir,
      env,
    });

    let stdout = '';
    let stderr = '';
    let done = false;

    const timeoutMs = (config.timeoutSeconds || 900) * 1000;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      try { child.kill('SIGTERM'); } catch (_) {}
      resolve({ ok: false, output: `Timed out after ${config.timeoutSeconds || 900}s.` });
    }, timeoutMs);

    child.stdout.on('data', (b) => { stdout += b.toString(); });
    child.stderr.on('data', (b) => { stderr += b.toString(); });

    child.on('error', (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ok: false, output: `Failed to launch claude CLI: ${err.message}` });
    });

    child.on('close', (code) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (code === 0) {
        resolve({ ok: true, output: stdout.trim() || '(no output)' });
      } else {
        const combined = (stderr.trim() || stdout.trim() || `exit ${code}`);
        resolve({ ok: false, output: combined });
      }
    });
  });
}

client.once('clientReady', () => {
  log(`Logged in as ${client.user.tag}. Listening on channel ${config.allowedChannelId} for user ${config.allowedUserId}.`);
});
client.once('ready', () => {
  log(`(ready event) Logged in as ${client.user.tag}.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== config.allowedChannelId) return;

  if (message.author.id !== config.allowedUserId) {
    log(`Ignored message from unauthorized user ${message.author.id} (${message.author.tag}).`);
    try { await message.react('🔒'); } catch (_) {}
    return;
  }

  const userMessage = (message.content || '').trim();
  if (!userMessage) return;

  if (killSwitchActive()) {
    log('KILL switch active; not replying.');
    try { await message.react('⛔'); } catch (_) {}
    return;
  }

  log(`Received from ${message.author.tag}: ${userMessage.slice(0, 200)}`);

  queue = queue.then(async () => {
    const typing = setInterval(() => message.channel.sendTyping().catch(() => {}), 8000);
    message.channel.sendTyping().catch(() => {});
    const started = Date.now();
    try {
      const result = await runClaude(userMessage);
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      log(`${result.ok ? 'OK' : 'ERROR'} in ${secs}s for ${message.author.tag}`);

      let body;
      if (result.ok) {
        body = result.output;
      } else if (/not logged in|please run \/login|invalid api key|oauth token|authentication_error|401/i.test(result.output)) {
        log('Detected stale Claude auth; surfaced relogin instructions to Discord.');
        body = "⚠️ My Claude login went stale, so I can't run right now.\n"
             + 'Fix (about 30 seconds): open Terminal and run\n'
             + '`~/Desktop/"811 memory alysa"/alysa-bot/relogin.sh`\n'
             + "Authorize in the browser when it opens, and I'll be back on the next message.";
      } else {
        body = '⚠️ ' + result.output;
      }

      const chunks = chunkForDiscord(body);
      for (const chunk of chunks) {
        await message.reply({ content: chunk, allowedMentions: { repliedUser: false } });
      }
    } catch (err) {
      log(`Unhandled error: ${err.stack || err}`);
      try {
        await message.reply('⚠️ Something went wrong. Check the log.');
      } catch (_) {}
    } finally {
      clearInterval(typing);
    }
  });
});

client.on('error', (err) => log(`Client error: ${err.stack || err}`));
process.on('unhandledRejection', (err) => log(`Unhandled rejection: ${err && err.stack || err}`));

client.login(discordToken).catch((err) => {
  log(`FATAL: Discord login failed: ${err.stack || err}`);
  process.exit(1);
});
