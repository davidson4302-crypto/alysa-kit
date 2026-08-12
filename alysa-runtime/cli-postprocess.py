#!/usr/bin/env python3
"""Post-process a `script`-captured CLI transcript for Alysa's memory log.

Runs after every dw-wrapped CLI session ends. If the session mentioned Alysa
by name, logs the cleaned transcript into her shared conversation store so
she sees it on every other surface. If not mentioned, deletes the transcript
and exits — no leftover recordings of unrelated work.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path.home() / ".alysa"))
try:
    import alysa_log as A
except Exception as e:
    sys.stderr.write(f"[dw-postprocess] log helper unavailable: {e}\n")
    sys.exit(0)

ANSI_CSI = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")
ANSI_OSC = re.compile(r"\x1b\][^\x07]*(\x07|\x1b\\)")
ANSI_C1 = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")
TRIGGER = re.compile(r"\balysa\b", re.IGNORECASE)

KNOWN_SURFACES = {
    "grok": "grok-cli",
    "codex": "codex-cli",
    "qwen": "other",
    "claude": "claude-code",
}


def clean(text: str) -> str:
    text = ANSI_CSI.sub("", text)
    text = ANSI_OSC.sub("", text)
    text = ANSI_C1.sub("", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def surface_for(cmd: str) -> str:
    key = cmd.lower().split("/")[-1]
    return KNOWN_SURFACES.get(key, "other")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cmd", required=True)
    ap.add_argument("--transcript", required=True)
    args = ap.parse_args()

    path = pathlib.Path(args.transcript)
    if not path.exists():
        return 0

    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return 0

    if not TRIGGER.search(raw):
        try: path.unlink()
        except Exception: pass
        return 0

    cleaned = clean(raw)
    if not cleaned:
        try: path.unlink()
        except Exception: pass
        return 0

    surface = surface_for(args.cmd)
    label = f"[{args.cmd} session transcript, cleaned]"

    try:
        A.log_turn(
            surface=surface, user="Shawn", direction="in",
            text=label + "\n\n" + cleaned, model=args.cmd,
            surface_id=path.name, external_id=f"{surface}:{path.stem}",
        )
    except Exception as e:
        sys.stderr.write(f"[dw-postprocess] log failed: {e}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
