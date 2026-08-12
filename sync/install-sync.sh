#!/bin/bash
# One-time setup for the memory sync.
# Installs the launchd job that runs every 15 min.
set -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing memory sync tooling..."

if [ ! -d "$HERE/node_modules" ]; then
  echo "Installing Playwright (this pulls Chromium, one-time ~200MB)..."
  cd "$HERE"
  npm install
  npx playwright install chromium
fi

echo
echo "Sign in to claude.ai once so the sync job has a saved session."
echo "A Chrome window will open. Sign in as Shawn, then close the window."
read -p "Press Enter to continue..." _
cd "$HERE"
/usr/bin/env node upload-skills.js --login

echo
echo "Verifying login..."
/usr/bin/env node upload-skills.js --check || {
  echo "Login check failed. Re-run: node upload-skills.js --login"
  exit 1
}

# launchd
LABEL="com.shawn.alysa-memory-sync"
PLIST_SRC="$HERE/${LABEL}.plist.template"
PLIST_DST="$HOME/Library/LaunchAgents/${LABEL}.plist"

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/Library/Logs/alysa-bot"

sed -e "s|REPLACE_WITH_HOME|$HOME|g" \
    -e "s|REPLACE_WITH_KIT|$HERE|g" \
    "$PLIST_SRC" > "$PLIST_DST"

launchctl bootout gui/$(id -u)/$LABEL 2>/dev/null || true
launchctl bootstrap gui/$(id -u) "$PLIST_DST"

echo
echo "Installed: $LABEL — runs every 15 minutes."
echo "Manual push: bash $HERE/sync-memory.sh"
echo "Log: $HOME/Library/Logs/alysa-bot/sync-memory.log"
