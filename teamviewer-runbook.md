# TeamViewer runbook — installing Alysa on Shawn's Mac

Written so Shawn can read over your shoulder and know what is
happening. No jargon in the on-screen parts. Explanations in italics
are for Jason only, so you know why each step is here.

Target time: 30 to 45 minutes end to end, most of it the interview.

Before you connect, ask Shawn to have handy:
- His current Alysa Discord bot's token (the long string from the
  Discord developer portal). If he doesn't have it saved, we reset it
  on the site.
- Login for his claude.ai account.
- Login for the Google account Alysa will read email and calendar for.

## Step 1 — Copy the folder onto his Mac

Drag the `811 memory alysa` folder from TeamViewer's file transfer
window to his Desktop.

*Jason: file transfer is the "Files" panel in the TeamViewer sidebar.
If it's disabled on his side, zip and email the folder instead.*

## Step 2 — Run the grill-me interview

This is the memory and personality build. Open his Claude Code
terminal (or a Cowork session if he prefers) and paste:

```
/grill-me — I'm setting up Alysa for the first time. Use the script at
~/Desktop/811 memory alysa/onboarding-grill.md. Save the capture into
~/Desktop/811 memory alysa/cowork-skills/alysa-memory/notes/ as one file
per topic, and also update ~/Desktop/811 memory alysa/cowork-skills/alysa/voice-and-rules.md
as we go.
```

Sit with Shawn while it runs. It will ask him one question at a time.
Answer as him if he asks you to clarify. When he says "enough" or "we're
done", it stops.

*Jason: the grill script is tuned so every answer lands in one of two
places. Facts about Shawn, his team, his people, his companies, and his
preferences go into `alysa-memory/notes/` as one small markdown file per
topic, with the index in `alysa-memory/MEMORY.md`. Rules about how Alysa
should talk and act go into `alysa/voice-and-rules.md`. Both are already
scaffolded empty in the kit.*

## Step 3 — Upload the five skills to his claude.ai account

In his browser, sign in to claude.ai. Go to Settings → Skills (or
Cowork → Skills, whichever surface he uses). Click "Upload skill" or
the drag-and-drop area, and upload each of these five folders one at a
time:

- `cowork-skills/alysa/`
- `cowork-skills/alysa-memory/`
- `cowork-skills/alysa-inbox/`
- `cowork-skills/alysa-tasks/`
- `cowork-skills/alysa-calendar/`

*Jason: each folder has its own `SKILL.md` at the root — that's the
one claude.ai reads.*

Test: open a new claude.ai chat and type "who are you". You should get
an Alysa reply that references Shawn by name. If it doesn't, the
skills didn't load; refresh and try again.

## Step 4 — Connect Google (inbox and calendar)

In claude.ai, in the same skills or connectors area, connect his Google
account. Grant Gmail read and Calendar read access. The `alysa-inbox`
and `alysa-calendar` skills use whatever Google connector claude.ai
provides, so no extra setup on our side.

*Jason: if his account doesn't have the Google connector available,
these two hats degrade gracefully — Alysa will say she can't read the
inbox until it's connected. Not a blocker for the demo.*

## Step 5 — Install the always-on Discord bot

Open his Terminal. Paste, one block at a time:

```
cd ~/Desktop/"811 memory alysa"/alysa-bot
./setup.sh
```

The setup script will:
1. Install Node (via Homebrew) if it isn't there.
2. Install the Claude Code CLI if it isn't there.
3. Ask him to sign into Claude Code once, in the browser.
4. Ask him for his Discord bot token and paste it in.
5. Ask him for his Discord channel ID and paste it in.
6. Ask him for his Discord user ID and paste it in.

*Jason: user ID and channel ID come from Discord. Right-click the
channel, "Copy Channel ID". Right-click his own name, "Copy User ID".
He may need to turn on Developer Mode in Discord settings first
(Settings → Advanced → Developer Mode).*

Then test it lives, still in Terminal:

```
node bot.js
```

Send a message in the Discord channel. Reply should come back within
20–30 seconds. Stop the test with Ctrl-C.

Install it as always-on:

```
./install-launchd.sh
```

This makes the bot start with his Mac and restart itself if it
crashes. He never has to touch Terminal again after this.

## Step 6 — Install the memory sync

Alysa's memory lives on Shawn's Mac disk. This step keeps it in sync
with the copy uploaded to his claude.ai account, so both surfaces
always see the same facts.

Still in Terminal:

```
cd ~/Desktop/"811 memory alysa"/sync
./install-sync.sh
```

The script will:
1. Install Playwright and Chromium (~200MB, one-time).
2. Open Chrome to claude.ai. **Sign in as Shawn.** Close the window
   after login lands.
3. Verify the saved login works.
4. Register a launchd job that runs every 15 minutes.

*Jason: this reuses your own `upload-skills.js` engine, ported verbatim
into the kit. Same Playwright + saved-session pattern Caroline uses.
If a claude.ai UI selector shifts, the fixes go in
`sync/upload-skills.js` the same way you fix Caroline.*

Test it manually:

```
bash ~/Desktop/"811 memory alysa"/sync/sync-memory.sh
tail -f ~/Library/Logs/alysa-bot/sync-memory.log
```

Should log "Sync OK." within a minute or two.

## Step 7 — Confirm the whole loop

Send three test messages in Discord:

1. "who are you" — should identify as Alysa, mention Shawn.
2. "what's on my calendar today" — should read the calendar via the
   `alysa-calendar` skill.
3. "any important emails" — should scan inbox via `alysa-inbox`.

Then a fourth test to confirm the sync loop:

4. On Discord: "Alysa, remember that my dog's name is Rex." She
   should confirm and quietly fire the sync.
5. Wait 30 seconds. Open a fresh claude.ai chat. Ask: "What's my
   dog's name?" She should say Rex.

If all four work, the demo is ready.

## What to tell Shawn before you leave

- His Mac needs to stay on and awake for the Discord bot and the
  memory sync to work. If it sleeps, Alysa goes quiet and his
  claude.ai memory stops updating until it wakes.
- Anything he chats with Alysa on Discord runs the same as if he
  typed it into claude.ai. Same account, same skills.
- To add a new fact for Alysa to remember, he tells her in chat —
  ideally on Discord, since that's where writes stick. On claude.ai,
  she'll acknowledge but ask him to repeat it on Discord.
- The kill switch: `~/Desktop/"811 memory alysa"/alysa-bot/KILL`.
  Create that empty file and the bot stops responding. Delete it to
  resume. The same file also stops the memory sync.

## Troubleshooting quick hits

- Bot silent, no reply: `tail -f ~/Library/Logs/alysa-bot/bridge.log`
  in Terminal — look for the last few lines.
- "Not logged in" errors: run `./relogin.sh` inside the `alysa-bot`
  folder, sign in again.
- Skills not loading in claude.ai: re-upload them. Skill uploads are
  overwrite-on-name so it's safe to redo.
- Memory not syncing to claude.ai: check
  `~/Library/Logs/alysa-bot/sync-memory.log`. If it says "no saved
  login", run `cd ~/Desktop/"811 memory alysa"/sync && node
  upload-skills.js --login`.
