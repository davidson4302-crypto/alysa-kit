# Review: Reevo CRM Structure & Automation Requirements

*Source: `Reevo_CRM_Structure_Narrative` — prepared for Reevo by Cultivation
Warehouse and affiliated entities. Reviewed against `hormozi-sister-companies.md`
and `crm-setup.md` on this branch.*

---

## First, a correction to the earlier analysis

The two docs already on this branch were written on a stated premise: six
companies selling six offers to **one shared customer base**, structured as a
value ladder. The default Hormozi finding followed from that — *six companies at
one avatar is one business with five distractions.*

That finding does not hold here, and the reason matters.

This is not six offers ascending against one buyer over time. It is **six
entities each capturing a different margin pool on the same transaction**:

```
CW            design, specification, energy modeling      fee revenue
Sustainable   distribution and resale                     distribution margin
Illuminar     LED manufacture                             product margin
BENCH         benching / racking manufacture              product margin
What Rebates  rebate recovery                             % of realized rebate
(future)      RO, controls, HVAC, …                       category margin
```

That is a **vertically integrated delivery chain**, not a portfolio of
distractions. Each entity occupies a different position in the value chain of
one project rather than competing for the same wallet moment. Two of them —
Illuminar and BENCH — are manufacturers, which means they can in principle sell
through channels that never touch CW at all. Consolidation is the wrong
prescription. The document is right and the earlier default was wrong.

**What survives the correction, and matters more than the rest:**

| Hormozi mechanism | Where it already exists in the document |
|---|---|
| Front-end that absorbs CAC | §6 — the consulting/design agreement, first opportunity on a project, seeds every downstream category |
| Client-financed acquisition | §6 — the rebateable per-category deposit, credited against equipment in the same category |
| Urgency that isn't manufactured | §8.3 — the order-by Gantt: a deadline the client's own construction schedule created |
| Attach rate as the headline metric | §9 — asked for explicitly, feeding the adjacency matrix |
| One customer record across entities | §12 — two-axis segmentation with account hierarchy |

The document arrived at the right structure independently. The Hormozi lens adds
little to it. What follows is where I'd push back before it goes to a vendor.

---

## What's strong

**It leads with workflow, not features.** Most requirements docs are a feature
list that forces the vendor to guess at the business. This explains the business
and lets the vendor propose. That inversion is why it will get better answers.

**Scope Opportunity vs. Bid Option (§3.1) is the best idea in the document.**
Modeling ~50 categories with 2–6 vendor variants each as *sibling opportunities*
is what inflates a pipeline tenfold and makes win rate meaningless. Category-level
opportunity with mutually-exclusive child bids is correct.

**"Not Selected ≠ Lost" is the sharpest observation in it.** Losing a sibling
option to your own recommendation is not a loss. Almost every CRM conflates
these, and the conflation quietly destroys the win-rate data you'd later want for
probability calibration. Getting this right at setup is worth more than it looks.

**§7.2's decomposition is textbook.** The old flat rank field collapsed five
independent variables — purchase history, quote status, contractual position,
category, fulfillment progress — into one picklist, which is why it had to grow
multiplicatively and still couldn't express the combinations that mattered.
Splitting stage / history-multiplier / category-override / manual-override /
fulfillment is the right decomposition, and pulling fulfillment out of the
probability list is the single most valuable part of it.

**The human-in-the-loop line in §11 is drawn in exactly the right place.** Act
freely on reversible and additive (link email, file a document, create a contact,
draft a task); propose-only on anything touching money, stage, probability, or
date. That is the correct boundary, stated more precisely than most teams manage
after a year of using such a system.

**§8.3, the order-by Gantt, is the highest-commercial-value ask in the document.**
Backward-scheduling from lead times produces a close deadline the client's own
schedule created rather than one you invented. That is a genuinely strong sales
mechanism, and it also happens to make the cashflow forecast follow reality
because order dates drive deposit dates. If the vendor can only build three
things, this should be one of them.

**§4.3 correctly identifies change propagation as revenue, not hygiene.** Treating
downstream re-review as a billing trigger rather than a project-management nicety
is the right frame, and "today this depends on someone remembering" is an honest
statement of what it currently costs.

---

## What I'd change before sending it

### 1. This is four products, and the document doesn't say so

As written it asks one vendor for:

- **(a)** a CRM with a non-standard opportunity hierarchy
- **(b)** a cashflow and backward-scheduling engine
- **(c)** an AI ingestion pipeline over email, PDFs, and meeting transcripts
- **(d)** an open-web monitoring and signal-intelligence service

Any vendor will answer "yes" to all four. Delivery will be strong on (a) and
thin on the rest, and the thinness won't surface until implementation.

**Fix:** tier the whole document the way §13 already tiers quoting — *day-one
launch / phase two / directional*. Say plainly which items you would sign
without, and which are deal-breakers. That converts a wish list into a
scoreable spec, and it is the single highest-leverage edit available.

My read of the correct tiering:

| Tier | Items |
|---|---|
| **Day one** | §3 hierarchy, §3.1 bid options, §7 stage/probability split, §8.1 multi-event cash timing, §10.1 routing, §14 reports 1–4 |
| **Phase two** | §5 input-requirement templates and chase, §4.3 change propagation, §8.3 order-by Gantt, §13 QBO/Qwilr |
| **Directional** | §11 full ingestion, §11.1 web monitoring, §7.2C historical calibration |

### 2. The merger is unresolved and the document encodes both states at once

§2 says CW is *currently* the distributor and that post-merger all equipment
routes through Sustainable Pathway. So the entity-routing map has to change
wholesale on a date that hasn't happened yet.

"Configurable, not hard-coded" is necessary but not sufficient. Ask Reevo
directly:

- Can routing rules be **versioned with an effective date**?
- On the switch, is historical data **restated** under the new mapping or
  **preserved** under the old one? (You want preserved, and you want to know
  before you're arguing about it.)
- Do per-entity reports remain comparable across the boundary?

This is worth adding as question 14. It's the kind of thing that is trivial to
configure before launch and extremely expensive to retrofit after.

### 3. Probability calibration has a chicken-and-egg problem

§7.2C asks for per-category probability defaults "calibrated over time from our
own historical win rates." But the historical data was recorded under the old
flat field — the one §7.2 correctly criticizes for conflating stage, purchase
history, category, and fulfillment into a single value.

You cannot cleanly derive per-category base rates from data captured under a
schema that never separated those variables. Realistically:

- Hand-set the category defaults from judgment at launch.
- Accept that clean calibration data starts accumulating on go-live day, which
  means meaningful recalibration is roughly a year out given your cycle times.
- Or budget a specific data-archaeology exercise to reconstruct category and
  stage from the old records — worth doing only if the old system captured
  category as a separate field.

Say which one you're choosing in the document. Otherwise the vendor will quote
"calibrated probability" as a feature and you'll discover the input doesn't
exist.

### 4. §11.1 web monitoring is the ask most likely to disappoint

License awards, permit status, funding rounds, and utility program changes are
real, valuable signals — and they are a different product category from CRM.
They come from jurisdiction-specific databases, permit portals, and licensing
registries that no CRM vendor maintains natively.

Scoping it to active opportunities only is exactly right and shows good
instincts about cost and noise. But I'd unbundle it: source the signal from a
specialist feed and pipe it into Reevo against the account record, rather than
expecting Reevo to build the collection layer. Ask them what ingestion they
support for a third-party signal source — that's a much more answerable
question than "can you monitor the open web."

### 5. The 200,000-contact segmentation is aspirational for most of the database

Axis A (relationship stage) is derivable from your own data — purchase history,
quote history, contact recency. That part will work.

Axis B (facility type, license type, canopy square footage, room count, harvest
frequency, lifecycle stage) is almost entirely **absent** for cold records. On a
200k list, the great majority will have none of it. Without an enrichment plan,
Axis B describes the few thousand accounts you already know well — which you
could already segment by hand.

Either name the enrichment source, or state that Axis B applies to worked
accounts only and let Axis A carry the cold database. And note that
**lifecycle stage — pre-license → design → construction → operating → expanding
— is called out as your single strongest buying signal.** If that's true, it
deserves its own sourcing plan rather than sitting as one attribute among
eleven.

### 6. Consent on a 200k imported list gets one clause and needs more

§12 lists "consent/opt-in status" as a field. Given that the merger will have
multiple entities marketing to a shared database, that is under-specified.

Consent is purpose- and sender-specific. A contact who opted in to What Rebates
has not necessarily consented to hear from Illuminar, and common ownership does
not transfer it. On an imported list at this scale, the provenance of consent is
also frequently unclear — which is a deliverability problem before it is a legal
one, since several entities suddenly mailing one merged list is a recognizable
pattern to inbox providers.

Add a requirement: **consent stored per entity and per source, with import batch
provenance retained**, and sending scoped to the narrowest consent actually held.
Worth a short conversation with counsel before the first cross-entity campaign;
the record merge itself is unaffected.

### 7. Right of last bid can be tracked but not detected

§6's mechanism depends on the client telling you they received a lower bid. The
SLA timer and the 5–10% fee are worth modeling, but the trigger is
self-reported, so realistically you'll capture a fraction of the events.

Fine to track. I would **exclude it from the forecast entirely** rather than
carry it as a probability-weighted revenue event — a line item you can't detect
is a line item that will chronically over-forecast.

### 8. The gap: you ask about revenue splits without stating your own rules

§2 requires "a revenue split allocation where more than one entity earns from the
same transaction," and §10.3 asks Reevo how splits work. But the document never
states **your** split rules.

Reevo cannot meaningfully answer question 4 without them. Bring one worked
example: a real lighting order sold through Sustainable Pathway, using Illuminar
product, with a CW design-fee credit — with actual numbers, showing what each
entity books, what hits each QBO file, and how the intercompany elimination
works at the consolidated level. One page. It will do more to get a useful answer
than the rest of §10 combined.

### 9. The other gap: who owns the customer, and whose compensation does it hit

The document handles record *visibility* well — the five collaborator tiers in
§10.3 are thoughtfully designed, and the Digest tier is a genuinely good call.

But visibility is not the commercial question. When a client CW brought in buys
lighting through SP using Illuminar product, **whose customer is it, and whose
number does it hit?** Notification tiers will not settle that, and a CRM
faithfully reporting per-entity revenue will make the dispute sharper rather than
resolve it.

This is the failure mode I'd worry about most in this structure — not
distraction, but transfer pricing and comp. If each entity's operators are paid
on their own entity's booked revenue, they will optimize against each other on a
shared transaction, and the entity at the front of the chain (CW, doing design
that seeds everything downstream) is the one most likely to be under-rewarded
relative to what it generates.

Decide the rule before the system encodes a default. Then make the CRM report it.

### 10. Minor: make quote-ID revision a field, not a suffix

The proposed `OCDMN-P1-HVAC-TRANE-001` convention is good. Today's format
carries revisions as `-R2`. Keep revision as a **separate structured field**
rather than baked into the identifier string — otherwise matching, sorting, and
"latest revision of this quote" all become string parsing.

---

## Questions I'd add to §15

14. Can entity-routing rules be **versioned with an effective date**, and does
    historical reporting remain comparable across a routing change (the merger)?
15. What is the **data-portability and exit** position — full export including
    custom objects, attachments, and audit history, in what format, on what
    notice?
16. Can you provide a **reference customer running multi-entity revenue splits**
    on single transactions, with separate accounting files?
17. For §11 ingestion: what happens to a proposed change that is **never
    reviewed** — does it expire, escalate, or sit in the queue indefinitely?
18. Can the approval queue be **scoped by field**, so that (for example) date
    changes auto-apply while value and stage changes always require review?

---

## Overall

This is an unusually good requirements document — specific, honest about what is
practice versus rule, and clear about where automation should stop. A vendor who
engages seriously with it is worth working with; one who answers all thirteen
questions affirmatively without qualification is telling you they haven't read it
carefully.

The two edits that would most improve it before sending: **tier the asks**
(§1 above) so the vendor has to commit to a launch scope rather than agreeing to
everything, and **bring your own revenue-split example** (§8 above) so the
multi-entity question can actually be answered.

The two decisions that matter more than anything Reevo builds: **the merger-date
routing switch**, and **who owns the customer and whose comp the shared
transaction hits**. No CRM resolves either. Both will be encoded in the system by
default if you don't decide them deliberately first.
