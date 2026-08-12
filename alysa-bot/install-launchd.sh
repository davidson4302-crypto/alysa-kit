#!/bin/bash
# Install Alysa bot as an always-on launchd job under Shawn's login.
set -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LABEL="com.shawn.alysa-bot"
PLIST_SRC="$HERE/${LABEL}.plist.template"
PLIST_DST="$HOME/Library/LaunchAgents/${LABEL}.plist"

if [ ! -f "$PLIST_SRC" ]; then
  echo "Missing plist template: $PLIST_SRC"
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/Library/Logs/alysa-bot"

sed -e "s|REPLACE_WITH_HOME|$HOME|g" \
    -e "s|REPLACE_WITH_KIT|$HERE|g" \
    "$PLIST_SRC" > "$PLIST_DST"

launchctl bootout gui/$(id -u)/$LABEL 2>/dev/null || true
launchctl bootstrap gui/$(id -u) "$PLIST_DST"

echo "Installed and started: $LABEL"
echo "Log: $HOME/Library/Logs/alysa-bot/bridge.log"
echo "Uninstall: launchctl bootout gui/$(id -u)/$LABEL && rm $PLIST_DST"
