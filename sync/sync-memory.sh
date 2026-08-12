#!/bin/bash
# Sync Shawn's local alysa-memory skill up to his claude.ai account.
# Called every 15 min by launchd, and on-demand by Alysa after any
# memory write.
set -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE="$HERE/staging"
LOG="$HOME/Library/Logs/alysa-bot/sync-memory.log"
mkdir -p "$(dirname "$LOG")"

log() { echo "[$(date -u +%FT%TZ)] $*" | tee -a "$LOG"; }

# Debounce: if we ran less than 20 seconds ago, skip. Prevents a burst
# of memory writes from queuing up dozens of Playwright launches.
LAST_RUN_MARKER="$HERE/.last-run"
if [ -f "$LAST_RUN_MARKER" ]; then
  AGE=$(( $(date +%s) - $(date -r "$LAST_RUN_MARKER" +%s) ))
  if [ "$AGE" -lt 20 ]; then
    log "Debounced (last run ${AGE}s ago)."
    exit 0
  fi
fi

# Kill switch — same convention as the bot.
if [ -f "$HERE/KILL" ] || [ -f "$HERE/../alysa-bot/KILL" ]; then
  log "KILL switch active; not syncing."
  exit 0
fi

SRC="$HOME/.claude/skills/alysa-memory"
if [ ! -d "$SRC" ]; then
  log "No local alysa-memory skill at $SRC. Nothing to sync."
  exit 0
fi

# Refresh staging: wipe and re-copy so the queue always holds the
# current disk truth, no stale files.
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp -R "$SRC" "$STAGE/alysa-memory"

cd "$HERE"

# --no-archive so the folder stays in staging for the next run.
if [ "${HEADLESS:-1}" = "1" ]; then
  HEADLESS=1 SKILLS_NEW="$STAGE" SKILLS_INSTALLED="$STAGE/.installed" \
    /usr/bin/env node upload-skills.js --no-archive >> "$LOG" 2>&1
else
  SKILLS_NEW="$STAGE" SKILLS_INSTALLED="$STAGE/.installed" \
    /usr/bin/env node upload-skills.js --no-archive >> "$LOG" 2>&1
fi

RC=$?
touch "$LAST_RUN_MARKER"
if [ "$RC" -eq 0 ]; then
  log "Sync OK."
else
  log "Sync FAILED (exit $RC). See log above."
fi
exit "$RC"
