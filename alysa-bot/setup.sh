#!/bin/bash
# One-time setup for Shawn's Alysa Discord bot.
# Run in Terminal from this folder.
set -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "$HERE/.." && pwd)"

echo "Alysa bot setup — running out of: $HERE"
echo

# --- Homebrew + Node ---------------------------------------------------
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Install from https://brew.sh, then re-run this script."
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js via Homebrew..."
  brew install node
fi

# --- Claude Code CLI --------------------------------------------------
if ! command -v claude >/dev/null 2>&1; then
  echo "Installing Claude Code CLI globally..."
  npm install -g @anthropic-ai/claude-code
fi

echo "Claude CLI at: $(command -v claude)"
echo

# --- npm deps ---------------------------------------------------------
cd "$HERE"
if [ ! -d node_modules ]; then
  echo "Installing bot dependencies (discord.js)..."
  npm install
fi

# --- Install skills into ~/.claude/skills so the CLI loads them --------
SKILL_SRC="$KIT_ROOT/cowork-skills"
SKILL_DST="$HOME/.claude/skills"
mkdir -p "$SKILL_DST"
for skill in alysa alysa-memory alysa-inbox alysa-tasks alysa-calendar; do
  if [ -d "$SKILL_SRC/$skill" ]; then
    echo "Installing skill locally: $skill"
    rm -rf "$SKILL_DST/$skill"
    cp -R "$SKILL_SRC/$skill" "$SKILL_DST/$skill"
  fi
done

# --- Working directory + CLAUDE.md loader ------------------------------
WORK="$HERE/work"
mkdir -p "$WORK"
cat > "$WORK/CLAUDE.md" <<'EOF'
# Alysa working directory

Every session that runs out of this folder IS Alysa. Read the `alysa`
skill first. It sets voice, permissions, and the three-hat routing
(inbox / tasks / calendar). Consult `alysa-memory` for Shawn's facts.
Never break character.
EOF

# --- Secrets folder ---------------------------------------------------
mkdir -p "$HERE/secrets"
chmod 700 "$HERE/secrets"

# --- Config from template --------------------------------------------
if [ ! -f "$HERE/config.json" ]; then
  cp "$HERE/config.json.template" "$HERE/config.json"
  sed -i '' "s|REPLACE_WITH_HOME|$HOME|g" "$HERE/config.json"
  echo "Wrote $HERE/config.json — edit it now to set channel + user IDs."
fi

# --- Prompt for token ------------------------------------------------
TOKEN_FILE="$HERE/secrets/discord-bot-token.txt"
if [ ! -s "$TOKEN_FILE" ]; then
  echo
  echo "Paste Shawn's Discord bot token, then press Enter (input hidden):"
  read -rs TOKEN
  echo "$TOKEN" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  echo "Saved to $TOKEN_FILE"
fi

# --- Prompt for channel + user IDs -----------------------------------
CFG="$HERE/config.json"
if grep -q "PASTE_ALYSA_CHANNEL_ID" "$CFG"; then
  echo
  echo "Paste the Discord CHANNEL ID Alysa listens in:"
  read -r CHAN
  sed -i '' "s|PASTE_ALYSA_CHANNEL_ID|$CHAN|" "$CFG"
fi
if grep -q "PASTE_SHAWN_DISCORD_USER_ID" "$CFG"; then
  echo "Paste Shawn's Discord USER ID (only he can talk to Alysa):"
  read -r USR
  sed -i '' "s|PASTE_SHAWN_DISCORD_USER_ID|$USR|" "$CFG"
fi

# --- Log folder ------------------------------------------------------
mkdir -p "$HOME/Library/Logs/alysa-bot"

# --- Claude login ----------------------------------------------------
echo
echo "Next: sign into Claude Code once so the bot has an active login."
echo "This opens a browser. Sign in as Shawn."
read -p "Press Enter to continue..." _
claude /login || true

echo
echo "Setup complete."
echo
echo "Test with:"
echo "  node $HERE/bot.js"
echo
echo "Install as always-on with:"
echo "  $HERE/install-launchd.sh"
