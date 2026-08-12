# 811 — Memory and Alysa port kit

Everything Jason carries to Shawn over TeamViewer to give him a working
Alysa: the always-on Discord bot rebranded from Darlene, five Cowork
skills that turn Alysa into an inbox / task / calendar EA with memory,
and a sync layer that keeps both surfaces (Discord/Code and claude.ai)
in step.

## What's in here

```
811 memory alysa/
  README.md                    (this file — for Jason, not Shawn)
  teamviewer-runbook.md        (plain-language step-by-step, no jargon)
  onboarding-grill.md          (grill-me script to fill Shawn's memory)
  alysa-bot/                   (the always-on Discord daemon)
  cowork-skills/               (the five skills that ship to claude.ai)
    alysa/                     (core persona, voice, rules)
    alysa-memory/              (his facts, index + notes)
    alysa-inbox/               (Gmail triage hat)
    alysa-tasks/               (task ledger hat)
    alysa-calendar/            (calendar hat)
  sync/                        (keeps disk memory and claude.ai in step)
```

## The three surfaces

**Cowork skills** are how Alysa remembers, thinks, and talks. They
upload to Shawn's claude.ai account once and load in every session,
whether he is chatting on claude.ai, Cowork, or through Discord.

**The bot** makes her always-on in Discord. Runs as a launchd job on
his Mac, listens on one Discord channel, forwards each message to
Claude Code, replies back. No gateway, no custom modules —
self-contained.

**The sync layer** solves the two-surface memory problem. Alysa on
Discord/Code writes memory to disk. Alysa on claude.ai reads a static
uploaded skill. A launchd job (every 15 min) plus a push-on-write hook
inside Alysa's SKILL.md keeps the uploaded copy fresh, so both surfaces
converge. Self-contained Playwright uploader ships in `sync/`, no
external dependency.

## Order of operations on TeamViewer

1. Copy this whole folder onto Shawn's Mac (Desktop is fine).
2. Run the grill-me interview with Shawn (30–45 min) — fills the
   memory skill and the persona skill.
3. Upload the five Cowork skills to his claude.ai account.
4. Install the bot as a launchd job.
5. Install the memory sync job (Playwright + saved claude.ai login).
6. Test: message the Discord channel, get an Alysa reply, then add a
   memory and confirm claude.ai sees it within 30 seconds.

Full step-by-step is in `teamviewer-runbook.md`.

## What was intentionally left out

- **Agent Gateway / gateway-core / outbound-guardian / memory-context.**
  Jason's Darlene bot uses these; Shawn has none of them. Shipping them
  means porting half of Jason's stack. The simplified bot shells
  `claude -p` directly against a working directory Alysa owns.
- **The specialist roster** (TK, Aubry, Abby, Q, Vera, Lyda, etc.).
  Shawn wanted one bot, multiple hats. The three hats are the Cowork
  skills. If a specialist is ever wanted later, add it as another
  skill; don't clone the gateway.
- **Jason's actual memory entries.** The `alysa-memory` skill ships
  empty. Grill fills it during onboarding.
