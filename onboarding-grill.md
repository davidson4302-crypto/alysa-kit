# Alysa onboarding grill script

Run this via `/grill-me`. It walks Shawn through everything Alysa
needs to know to be useful from day one. One question at a time, answer
captured to disk before the next question.

Two output streams:
- **Facts** land as one small file per topic under
  `cowork-skills/alysa-memory/notes/`, and each gets a line in
  `cowork-skills/alysa-memory/MEMORY.md`.
- **Voice and behavior rules** land in
  `cowork-skills/alysa/voice-and-rules.md`.

Skip any question he can't answer. Capture as a flag, move on.

## Section 1 — Who Shawn is

1. Full name, preferred name he wants Alysa to use.
2. Location and time zone (Alysa needs this for "today", "tonight",
   scheduling language).
3. Company name(s) he owns or runs. One sentence on what each does.
4. His role in each. Founder, CEO, operator, investor.
5. Who reports to him. First names, roles, one line on each.
6. Who he reports to, if anyone. Board, partners, spouse on business
   decisions.

## Section 2 — How Shawn wants Alysa to talk

7. Tone. Warm and personal, or crisp and businesslike?
8. Length. Does he want short answers by default, or full context?
9. Emojis and exclamation points — yes, no, sparingly?
10. Formality of address. "Shawn", "boss", "sir", first name only?
11. Any words or phrases she should never use? (Jason's list: no em
    dashes, no "leverage" as a noun, no "transform" — offer these as
    a starting point, let him keep or drop each.)
12. When she doesn't know something, should she guess and flag it, or
    stop and ask?

## Section 3 — What Alysa is allowed to do without asking

13. Email drafting — does she send, or draft-only-await-approval?
14. Calendar — can she book meetings, or just propose times?
15. Sharing his phone number, email, or address with strangers — yes
    or no (default no).
16. Spending money on his behalf — never, or up to $X?
17. Talking to specific people on his behalf. Names of anyone she can
    reach out to directly (an assistant, a partner). Everyone else
    goes through him.

## Section 4 — The three hats

**Inbox**
18. Which Gmail address is Alysa watching?
19. Who are the senders that always matter (family, key clients, key
    partners)? List names and emails.
20. What categories should she auto-ignore (newsletters, marketing,
    receipts)?
21. When she flags an important email, how does she tell him — Discord
    ping, morning brief, both?

**Tasks**
22. Where does his current task list live (Todoist, Notion, a
    notebook, in his head)?
23. Does he want Alysa to own a task ledger, or read one he already
    keeps?
24. What counts as a "task" vs. a "note" vs. a "someday" for him?
25. When something is done, how does he mark it — tell Alysa in chat,
    check it off in his tool?

**Calendar**
26. Which calendars does she read? (Primary Google, work calendar,
    shared family, etc.)
27. Working hours. What times are open for meetings by default?
28. Protected time — recurring blocks she should never suggest moving.
29. Meeting prep. Does he want a brief before each meeting, and how
    far ahead — morning of, night before, 15 min before?

## Section 5 — People, projects, and running context

30. Top 3 projects or initiatives right now. One line each.
31. Top 3 open questions or decisions he's stuck on.
32. Anyone he's actively deciding whether to hire, fire, partner with,
    or fund. First names only if he's cagey; those go in his memory.
33. Personal — spouse, kids, parents, pets by name if he wants Alysa
    to know. Birthdays, anniversaries. Skip freely.
34. Any hard "never mention this" topics — health, legal, past
    business. Capture and honor.

## Section 6 — The demo close

35. Anything we haven't touched that he wants Alysa to know before we
    turn her on?
36. First real question he wants to ask her after we go live?

## After the grill

When the interview ends, the grill skill should:

1. Write one final index entry into
   `cowork-skills/alysa-memory/MEMORY.md` linking every note file.
2. Reread `cowork-skills/alysa/voice-and-rules.md` and reorganize it
   into three clean sections: Voice, Permissions, People. No content
   changes, just structure.
3. Report to Jason (and Shawn) which of sections 1–6 have gaps still
   open as flags, so we know what to fill in later.
