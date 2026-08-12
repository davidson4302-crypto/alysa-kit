---
name: alysa-memory
description: Shawn's personal memory system — his facts, people, companies, preferences, running context. One-line-per-note index at MEMORY.md, one file per topic under notes/. Loads on demand whenever Alysa needs to recall who someone is, what a project is, what Shawn has said before. Alysa writes new notes into this skill when Shawn tells her to remember something.
---

# Alysa memory

The store for everything Shawn wants Alysa to remember across
conversations. Not tasks (those live in `alysa-tasks`). Not calendar
(that's live in Google). Just durable facts and preferences.

## How to read memory

1. Open `MEMORY.md`. It is a one-line-per-note index. Every line
   points at a note file under `notes/`.
2. Skim the index for anything relevant to the current request.
3. Open only the note files that look relevant. Don't bulk-read.

## How to write a new memory

When Shawn says "remember that…", "note for future…", "Alysa, save
this…", or the equivalent:

1. Pick a short kebab-case slug for the note. Examples:
   `shawn-role.md`, `wife-birthday.md`, `key-clients.md`,
   `banned-words.md`.
2. Create the file at `notes/<slug>.md` with this format:

```markdown
---
name: <slug>
description: <one-line summary, so future-Alysa can decide relevance>
type: fact | preference | person | project | rule
---

<the memory itself, in Shawn's words where wording matters>
```

3. Add a line to `MEMORY.md` under the appropriate section:
   `- [Short title](notes/<slug>.md) — one-line hook`.
4. Confirm to Shawn: "Saved that as <slug>."
5. **Push memory to claude.ai** so the Cowork side sees it too. Run
   this Bash tool call, fire-and-forget:
   ```
   bash ~/Desktop/"811 memory alysa"/sync/sync-memory.sh &
   ```
   The script debounces to 20 seconds, so calling it after every
   write is safe. If the tool isn't available (running from a
   claude.ai session, not local Claude Code), skip this step — the
   scheduled sync will pick it up within 15 minutes, and tell Shawn:
   "Saved. It'll show up in claude.ai chat within 15 minutes."

## How to update a memory

If Shawn corrects something or adds detail:
1. Find the existing note.
2. Edit it in place. Do not append duplicates.
3. Update the `MEMORY.md` line if the summary changed.
4. Confirm: "Updated <slug>." Then trigger the sync exactly as in
   step 5 of "How to write a new memory" above.

## How to forget a memory

If Shawn says to forget something:
1. Delete the note file.
2. Delete its line in `MEMORY.md`.
3. Confirm: "Forgot <slug>." Then trigger the sync exactly as in
   step 5 of "How to write a new memory" above.

## Sync model — read this once

Shawn's Mac disk (`~/.claude/skills/alysa-memory/`) is the source of
truth. When Alysa runs through Claude Code (the Discord bot or a local
terminal), memory writes hit disk directly. When Alysa runs on
claude.ai, writes made inside a session don't persist — so Alysa on
claude.ai should either (a) tell Shawn "repeat this to me on Discord
so it sticks" or (b) if the Discord webhook is available in the
session, post the memory request there and trust the Code side to
save it.

A launchd job on Shawn's Mac re-uploads the on-disk skill to
claude.ai every 15 minutes, and Alysa fires it immediately after any
write (see step 5 above). So the two surfaces are never more than 15
minutes out of sync in the worst case, and typically converge in
seconds.

## What NOT to save

- Ephemeral task state (that's `alysa-tasks`).
- Anything he told you in confidence he specifically said not to
  save.
- Recaps of what you did in the current session. Only durable facts.
