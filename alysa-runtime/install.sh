#!/bin/bash
# Alysa runtime install — sets up unified conversation memory across every
# surface Alysa runs on (Discord, Cowork, and any CLI you invoke her from
# by name).
#
# What this installs on Shawn's machine:
#
#   ~/.alysa/alysa_log.py           unified log helper (Python)
#   ~/.alysa/alysa-log.js           unified log helper (Node) — copied from
#                                   the alysa-bot install if present
#   ~/.alysa/dw                     universal CLI wrapper
#   ~/.alysa/dw-register            add a new CLI (grok, codex, qwen, ...)
#   ~/.alysa/cli-postprocess.py     logs a session if "Alysa" was mentioned
#   ~/.alysa/hooks/user-prompt.py   Claude Code hook, name-mention trigger
#   ~/.alysa/hooks/stop.py          Claude Code hook, logs Alysa's reply
#
# It also:
#   - registers `grok` and `codex` in ~/.zshrc so plain invocations wrap
#   - registers the two hooks in ~/.claude/settings.json (backed up first)
#
# Conversation log data lives at:
#   ~/Library/Application Support/Alysa/conversations/YYYY-MM-DD-<machine>.jsonl
# Override with ALYSA_LOG_DIR (e.g. iCloud/Dropbox for a second machine).

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.alysa"

echo "installing Alysa runtime to $DEST"
mkdir -p "$DEST/hooks" "$DEST/cli-transcripts" "$DEST/active-sessions"

cp "$HERE/alysa_log.py" "$DEST/alysa_log.py"
cp "$HERE/dw" "$DEST/dw"
cp "$HERE/dw-register" "$DEST/dw-register"
cp "$HERE/cli-postprocess.py" "$DEST/cli-postprocess.py"
cp "$HERE/hooks/user-prompt.py" "$DEST/hooks/user-prompt.py"
cp "$HERE/hooks/stop.py" "$DEST/hooks/stop.py"
chmod +x "$DEST/dw" "$DEST/dw-register" "$DEST/cli-postprocess.py" \
         "$DEST/hooks/user-prompt.py" "$DEST/hooks/stop.py"

# Mirror the Node helper next to the Python one, so the Discord bot and any
# other Node surface can `require('~/.alysa/alysa-log.js')`.
if [ -f "$HERE/../alysa-bot/alysa-log.js" ]; then
  cp "$HERE/../alysa-bot/alysa-log.js" "$DEST/alysa-log.js"
  echo "installed Node helper (from alysa-bot/)"
fi

# Register grok and codex as auto-wrapped CLIs. Idempotent.
"$DEST/dw-register" grok || true
"$DEST/dw-register" codex || true

# Register Claude Code hooks in ~/.claude/settings.json.
python3 - "$DEST" <<'PY'
import json, os, pathlib, shutil, datetime as dt, sys
dest = pathlib.Path(sys.argv[1])
p = pathlib.Path.home() / ".claude" / "settings.json"
p.parent.mkdir(parents=True, exist_ok=True)
if not p.exists():
    p.write_text("{}")
s = json.loads(p.read_text())
bak = p.with_suffix(f".json.bak-{dt.date.today().isoformat()}")
if not bak.exists():
    shutil.copy(p, bak)
hooks = s.setdefault("hooks", {})
def ensure(event, cmd):
    lst = hooks.setdefault(event, [])
    for group in lst:
        for h in group.get("hooks", []):
            if h.get("command") == cmd:
                return False
    lst.append({"hooks":[{"type":"command","command":cmd,"timeout":5}]})
    return True
a = ensure("UserPromptSubmit", f"python3 {dest}/hooks/user-prompt.py 2>/dev/null || true")
b = ensure("Stop", f"python3 {dest}/hooks/stop.py 2>/dev/null || true")
p.write_text(json.dumps(s, indent=2))
print(f"UserPromptSubmit added: {a}; Stop added: {b}")
PY

echo
echo "done."
echo "open a fresh terminal for the grok/codex shell wraps to take effect."
echo "existing Claude Code sessions pick up the hook after next start; new"
echo "sessions get it immediately."
