#!/usr/bin/env python3
"""Claude Code UserPromptSubmit hook — Alysa name-mention trigger.

Runs on every user message. If the message mentions Alysa by name (or the
current session is already flagged as an Alysa session), logs the user turn
into her shared conversation store so Discord, Cowork, and any other surface
sees it.

Once "Alysa" is mentioned in a session, the whole session is flagged. Marker
lives at ~/.alysa/active-sessions/<session_id>.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path.home() / ".alysa"))
try:
    import alysa_log as A
except Exception as e:
    sys.stderr.write(f"[alysa-hook] log helper unavailable: {e}\n")
    sys.exit(0)


ACTIVE_DIR = pathlib.Path.home() / ".alysa" / "active-sessions"
ACTIVE_DIR.mkdir(parents=True, exist_ok=True)

TRIGGER = re.compile(r"\balysa\b", re.IGNORECASE)


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    session_id = payload.get("session_id") or "unknown"
    prompt = payload.get("prompt") or payload.get("user_message") or ""
    if not isinstance(prompt, str):
        prompt = str(prompt or "")

    marker = ACTIVE_DIR / session_id
    is_active = marker.exists()

    if not is_active and TRIGGER.search(prompt):
        marker.write_text("triggered by name mention\n")
        is_active = True

    if not is_active:
        return 0

    try:
        A.log_turn(
            surface="claude-code", user="Shawn", direction="in",
            text=prompt, surface_id=session_id,
            external_id=f"cc:{session_id}:{payload.get('cwd','')}:{hash(prompt) & 0xffffffff:x}",
        )
    except Exception as e:
        sys.stderr.write(f"[alysa-hook] log failed: {e}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
