# Memory sync

Keeps Shawn's `alysa-memory` skill on claude.ai in step with the
on-disk copy at `~/.claude/skills/alysa-memory/`.

## Why this exists

Alysa runs on two surfaces:

- **Discord / Claude Code CLI** — writes memory notes to disk on
  Shawn's Mac. Real durable writes.
- **claude.ai / Cowork** — reads the uploaded skill artifact. Writes
  inside a claude.ai session don't survive.

So the disk is the source of truth. This folder pushes the disk copy
up to claude.ai on a schedule and on demand, so both surfaces see the
same memory.

## How it works

- `sync-memory.sh` — the runner. Copies the local skill to a staging
  folder and hands it to `upload-skills.js`.
- `upload-skills.js` — self-contained Playwright uploader. Drives
  Chromium via a saved session at `auth.json`. Ships inside the kit,
  no external dependency.
- `com.shawn.alysa-memory-sync.plist.template` — launchd job, every
  15 min.
- `install-sync.sh` — one-time setup: installs Playwright, opens
  Chrome for the claude.ai login, installs the launchd job.

## Triggers

1. **Every 15 min**, launchd fires `sync-memory.sh`.
2. **On memory write**, Alysa runs `bash sync/sync-memory.sh` herself.
   The script debounces to 20s so a burst of writes doesn't queue up
   dozens of browser launches.

## Auth

Saved claude.ai session lives at `auth.json` in this folder. Refresh
with:

```
node upload-skills.js --login
```

Check it's still valid:

```
node upload-skills.js --check
```

## Kill switch

Either of these stops the sync (the runner respects both):

- `sync/KILL` (this folder)
- `alysa-bot/KILL` (bot folder — same switch that silences the bot)

## Manual fallback

If Playwright breaks (claude.ai UI change, expired login), Shawn can
zip `~/.claude/skills/alysa-memory` and drag-drop it into Settings →
Skills in his browser. The skill will overwrite on re-upload.

```
cd ~/.claude/skills
zip -r ~/Desktop/alysa-memory.zip alysa-memory
```
