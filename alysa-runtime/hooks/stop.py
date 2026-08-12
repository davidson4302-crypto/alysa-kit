#!/usr/bin/env python3
"""Claude Code Stop hook — logs Alysa's outgoing message.

Runs when the assistant finishes replying. If the session is flagged as an
Alysa session, reads the last assistant message from the transcript and
logs it to Alysa's shared conversation store.
"""

from __future__ import annotations

import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path.home() / ".alysa"))
try:
    import alysa_log as A
except Exception as e:
    sys.stderr.write(f"[alysa-hook] log helper unavailable: {e}\n")
    sys.exit(0)


ACTIVE_DIR = pathlib.Path.home() / ".alysa" / "active-sessions"


def extract_last_assistant_text(transcript_path: str) -> str:
    path = pathlib.Path(transcript_path)
    if not path.exists():
        return ""
    last_text = ""
    try:
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    row = json.loads(line)
                except Exception:
                    continue
                role = row.get("role") or (row.get("message") or {}).get("role")
                if role != "assistant":
                    continue
                content = row.get("content")
                if content is None:
                    content = (row.get("message") or {}).get("content")
                text_parts: list[str] = []
                if isinstance(content, str):
                    text_parts.append(content)
                elif isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "text":
                            text_parts.append(block.get("text", ""))
                        elif isinstance(block, str):
                            text_parts.append(block)
                combined = "\n".join(t for t in text_parts if t).strip()
                if combined:
                    last_text = combined
    except Exception:
        pass
    return last_text


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    session_id = payload.get("session_id") or "unknown"
    marker = ACTIVE_DIR / session_id
    if not marker.exists():
        return 0

    transcript = payload.get("transcript_path") or ""
    text = extract_last_assistant_text(transcript) if transcript else ""
    if not text:
        return 0

    try:
        A.log_turn(
            surface="claude-code", user="Alysa", direction="out",
            text=text, surface_id=session_id,
            external_id=f"cc:{session_id}:reply:{hash(text) & 0xffffffff:x}",
        )
    except Exception as e:
        sys.stderr.write(f"[alysa-hook] log failed: {e}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
