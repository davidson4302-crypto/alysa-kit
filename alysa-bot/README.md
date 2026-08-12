# Alysa bot

The always-on Discord bridge for Shawn's Alysa. Runs as a launchd job
on his Mac. Each Discord message is forwarded to the local `claude`
CLI, which loads the Alysa skills from `~/.claude/skills/` (installed
by `setup.sh`) and replies as Alysa. Reply goes back into Discord.

## Files

| File | What it is |
|------|------------|
| `bot.js` | The bridge itself. Node.js, ~180 lines. |
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

## Uninstall

```
launchctl bootout gui/$(id -u)/com.shawn.alysa-bot
rm ~/Library/LaunchAgents/com.shawn.alysa-bot.plist
```
