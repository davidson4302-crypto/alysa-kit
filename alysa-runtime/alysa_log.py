"""Alysa's unified conversation log — Python side.

Mirror of the Node helper (alysa-log.js). Every surface Shawn talks to Alysa
through — Discord, Cowork, and any CLI Alysa is invoked through (Grok, Codex,
qwen, future) — writes turns here and reads recent history from here so she
has one continuous memory across surfaces.

Data lives at ~/Library/Application Support/Alysa/conversations/. Override
with ALYSA_LOG_DIR env var, e.g. point it at an iCloud or Dropbox folder if a
second machine is added.

Two functions matter:
    log_turn(surface, user, direction, text, ...)
    recall(hours=168, max_turns=200, surface=None, user=None) -> str
"""

from __future__ import annotations

import hashlib
import json
import os
import pathlib
import socket
from datetime import datetime, timedelta, timezone

HOME = pathlib.Path(os.path.expanduser("~"))
LOG_DIR = pathlib.Path(os.environ.get(
    "ALYSA_LOG_DIR",
    str(HOME / "Library" / "Application Support" / "Alysa" / "conversations"),
))
LOG_DIR.mkdir(parents=True, exist_ok=True)


def _machine_slug() -> str:
    host = socket.gethostname().lower().split(".")[0]
    return host or "shawn"


MACHINE = _machine_slug()

_ALLOWED_SURFACES = {
    "discord", "cowork", "claude-ai", "claude-code",
    "grok-cli", "codex-cli", "whatsapp", "voice-line",
    "imessage", "sms", "email", "other",
}
_ALLOWED_DIRECTIONS = {"in", "out"}


def _day_file(ts: datetime | None = None) -> pathlib.Path:
    ts = ts or datetime.now(timezone.utc)
    return LOG_DIR / f"{ts.strftime('%Y-%m-%d')}-{MACHINE}.jsonl"


def _day_files_all_machines(ts: datetime | None = None) -> list[pathlib.Path]:
    ts = ts or datetime.now(timezone.utc)
    day = ts.strftime("%Y-%m-%d")
    return sorted(LOG_DIR.glob(f"{day}-*.jsonl"))


def _turn_id(payload: dict) -> str:
    key = f"{payload.get('ts','')}|{payload.get('surface','')}|{payload.get('surface_id','')}|{payload.get('direction','')}|{payload.get('text','')}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]


def log_turn(surface, user, direction, text, *, model=None, surface_id=None, external_id=None, ts=None):
    if surface not in _ALLOWED_SURFACES:
        raise ValueError(f"unknown surface: {surface}")
    if direction not in _ALLOWED_DIRECTIONS:
        raise ValueError(f"direction must be in/out, got {direction!r}")
    text = str(text or "").strip()
    if not text:
        return ""

    at = ts or datetime.now(timezone.utc).isoformat()
    payload = {
        "ts": at, "surface": surface, "surface_id": surface_id or "",
        "user": user or "", "direction": direction,
        "model": model or "", "external_id": external_id or "", "text": text,
    }
    tid = _turn_id(payload)
    payload["turn_id"] = tid

    try:
        at_dt = datetime.fromisoformat(at.replace("Z", "+00:00"))
    except Exception:
        at_dt = datetime.now(timezone.utc)

    for existing in _day_files_all_machines(at_dt):
        try:
            with existing.open("r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    try:
                        row = json.loads(line)
                    except Exception:
                        continue
                    if row.get("turn_id") == tid:
                        return tid
                    if external_id and row.get("external_id") == external_id and row.get("surface") == surface:
                        return row.get("turn_id", tid)
        except Exception:
            continue

    dayf = _day_file(at_dt)
    with dayf.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    return tid


def _iter_recent_files(hours: int) -> list[pathlib.Path]:
    now = datetime.now(timezone.utc)
    days = max(1, (hours // 24) + 2)
    out = []
    for i in reversed(range(days)):
        d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        out.extend(sorted(LOG_DIR.glob(f"{d}-*.jsonl")))
    return out


def recent_turns(hours=168, max_turns=200, surface=None, user=None):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    rows = []
    for path in _iter_recent_files(hours):
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
                    try:
                        row_ts = datetime.fromisoformat(row["ts"].replace("Z", "+00:00"))
                    except Exception:
                        continue
                    if row_ts < cutoff:
                        continue
                    if surface and row.get("surface") != surface:
                        continue
                    if user and row.get("user", "").lower() != user.lower():
                        continue
                    rows.append(row)
        except Exception:
            continue
    rows.sort(key=lambda r: r.get("ts", ""))
    return rows[-max_turns:]


def recall(hours=168, max_turns=200, surface=None, user=None, max_chars=12000):
    rows = recent_turns(hours=hours, max_turns=max_turns, surface=surface, user=user)
    if not rows:
        return ""
    lines = []
    for r in rows:
        who = "Alysa" if r.get("direction") == "out" else (r.get("user") or "Shawn")
        surf = r.get("surface", "?")
        ts = r.get("ts", "")
        lines.append(f"[{ts} {surf}] {who}: {r.get('text','')}")
    text = "\n".join(lines)
    if len(text) > max_chars:
        text = text[-max_chars:]
    return text


def stats():
    total = 0
    by_surface = {}
    by_file = {}
    earliest = ""
    latest = ""
    for path in sorted(LOG_DIR.glob("*.jsonl")):
        n_here = 0
        try:
            with path.open("r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    total += 1
                    n_here += 1
                    try:
                        row = json.loads(line)
                    except Exception:
                        continue
                    s = row.get("surface", "?")
                    by_surface[s] = by_surface.get(s, 0) + 1
                    ts = row.get("ts", "")
                    if ts:
                        if not earliest or ts < earliest:
                            earliest = ts
                        if ts > latest:
                            latest = ts
        except Exception:
            continue
        by_file[path.name] = n_here
    return {"machine": MACHINE, "total_turns": total, "by_surface": by_surface,
            "by_file": by_file, "earliest": earliest, "latest": latest, "dir": str(LOG_DIR)}


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd")

    p_log = sub.add_parser("log")
    p_log.add_argument("--surface", required=True)
    p_log.add_argument("--user", required=True)
    p_log.add_argument("--direction", required=True, choices=["in", "out"])
    p_log.add_argument("--text", required=True)
    p_log.add_argument("--model", default="")
    p_log.add_argument("--surface-id", default="", dest="surface_id")
    p_log.add_argument("--external-id", default="", dest="external_id")
    p_log.add_argument("--ts", default="")

    p_recall = sub.add_parser("recall")
    p_recall.add_argument("--hours", type=int, default=168)
    p_recall.add_argument("--max-turns", type=int, default=200, dest="max_turns")
    p_recall.add_argument("--surface", default=None)
    p_recall.add_argument("--user", default=None)

    sub.add_parser("stats")

    args = ap.parse_args()
    if args.cmd == "log":
        tid = log_turn(args.surface, args.user, args.direction, args.text,
                       model=args.model or None, surface_id=args.surface_id or None,
                       external_id=args.external_id or None, ts=args.ts or None)
        print(tid)
    elif args.cmd == "recall":
        print(recall(hours=args.hours, max_turns=args.max_turns, surface=args.surface, user=args.user))
    elif args.cmd == "stats":
        print(json.dumps(stats(), indent=2))
    else:
        ap.print_help()
