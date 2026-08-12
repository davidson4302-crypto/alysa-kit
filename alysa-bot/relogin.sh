#!/bin/bash
# Refresh Claude Code auth when the bot reports "not logged in".
set -e
echo "Opening Claude login in browser. Sign in as Shawn."
claude /login
echo
echo "Done. The bot will pick up the new login on the next message."
