#!/bin/bash
# launchd entry point. Runs the bot forever; launchd restarts on crash.
set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

# Ensure Homebrew Node and the global claude CLI are on PATH under launchd.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

exec /usr/bin/env node bot.js
