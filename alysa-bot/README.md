# Alysa bot

The always-on Discord bridge for Shawn's Alysa. Runs as a launchd job
on his Mac. Each Discord message is forwarded to the local `claude`
CLI, which loads the Alysa skills from `~/.claude/skills/` (installed
by `setup.sh`) and replies as Alysa. Reply goes back into Discord.

## Files

| File | What it is |
|------|------------|
| `bot.js` | The bridge itself. Node.js, ~230 lines. |
| `alysa-log.js` | Alysa's unified conversation log. Every surface she runs on (Discord now, Cowork, and any future channel Shawn adds — WhatsApp, voice line, iMessage) writes turns here and reads recent history from it, so Alysa has one continuous memory across surfaces. Append-only JSONL at `~/Library/Application Support/Alysa/conversations/YYYY-MM-DD-<machine>.jsonl`. Set `ALYSA_LOG_DIR` env var to redirect (e.g. into iCloud/Dropbox if a second machine is added). |
| `config.json.template` | Copied to `config.json` by setup; contains channel ID, user ID, working dir, paths. |
| `setup.sh` | One-time install: Homebrew + Node + Claude CLI + skills + config + token prompt. |
| `run-bot.sh` | launchd entry point. |
| `install-launchd.sh` | Registers the launchd job. |
| `com.shawn.alysa-bot.plist.template` | launchd job definition. |
| `relogin.sh` | Refresh Claude login. |
| `secrets/` | Discord token, created by setup, mode 600. |
| `work/` | Working directory Claude runs from. Contains a CLAUDE.md that pins Alysa identity. |
| `KILL` | Create this empty file to silence the bot; delete to resume. |

## Kill switch

```
touch ~/Desktop/"811 memory alysa"/alysa-bot/KILL
```

Bot stays running, but replies with a lock icon reaction instead of an
Alysa reply. Delete the file to resume.

## Unified memory across surfaces

Every message Shawn sends to Alysa on Discord and every reply she sends back gets
logged as a turn in `alysa-log.js`. Before each new reply the bot prepends the
last week of turns (all surfaces, up to 12k characters) to the prompt, so Alysa
picks up mid-thread even after a bot restart or a switch to a different channel.

Add a new surface later (a voice line, WhatsApp, iMessage): all it has to do is
`require('./alysa-log.js')` and call `logTurn` on each turn and `recall` before
each reply. No other integration needed.

## Uninstall

```
launchctl bootout gui/$(id -u)/com.shawn.alysa-bot
rm ~/Library/LaunchAgents/com.shawn.alysa-bot.plist
```
