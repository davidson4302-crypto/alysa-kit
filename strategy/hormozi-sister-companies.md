# Six Sister Companies, One Customer Base

*A Hormozi-framework working doc — run in dependency order, not in parallel.*

> **Read the last section first.** Run against the actual six entities, the
> default finding below does **not** hold — this portfolio is a vertically
> integrated delivery chain, not one business wearing six hats. The framework
> stands; the verdict changes. See "Run against the actual six" at the end, and
> `reevo-requirements-review.md` for the source.

---

## The premise, stated honestly

Six companies sharing one customer base is not a portfolio. It is **one business
with six SKUs and five sets of redundant overhead.** That is the starting
assumption, and the burden of proof is on each entity to escape it.

This is not a stylistic preference. It follows from Hormozi's own definition of
market selection: *pain, purchasing power, targetability.* If all six pass those
three tests against the **same** people, then all six are competing for the same
wallet, the same attention, and the same operator hours. They are offers. The
LLC wrapper is an accounting artifact, not a business boundary.

The good news is that this is the strongest position in the market — if you
structure it correctly. **The business that can spend the most to acquire a
customer wins.** Six monetization paths against one acquisition event means you
can outbid every single-product competitor for the same customer and still print
money. Most six-company owners never collect that advantage, because they run
six separate CACs against six separate P&Ls and wonder why nothing scales.

---

## Order of operations

```
1. SIMPLIFY   → which of the six are actually companies
2. STRUCTURE  → who owns what, one customer record, shared CAC
3. LADDER     → sequence the survivors, maximize LTGP
4. NAMING     → brand architecture follows from 1-3, never precedes it
```

Doing 4 first is the classic failure: six logos, six websites, six brand
identities, built before anyone decided which entities survive. Naming is the
**last** step because it encodes decisions the first three steps make.

---

# 1. SIMPLIFY — The Consolidation Test

Run every entity through this. Four questions.

| # | Question | Pass condition |
|---|----------|----------------|
| 1 | **Own avatar?** | Its buyer would *not* buy the others. Different person, not different mood. |
| 2 | **Own acquisition channel?** | It gets customers from a source no other entity uses. |
| 3 | **Standalone P&L?** | Profitable on its own CAC, without the others feeding it customers. |
| 4 | **Own operator?** | Someone other than you runs it day-to-day and could keep running it. |

**Scoring:**

- **4/4** → Real company. Keep it separate.
- **2–3/4** → Offer wearing a company costume. Absorb it as a rung on the ladder.
- **0–1/4** → Kill or park. It is consuming attention and returning a hobby.

By definition, if the premise is true (*one* customer base), **question 1 fails
for at least five of the six.** That is the whole finding. Expect the honest
answer to be: one company, five offers.

### The focus constraint

Hormozi's rule for sub-$10M operators: *one avatar, one channel, one offer,
until it is boring.* Six things running at once is not diversification — it is
five distractions and a tax bill. Diversification protects capital you already
have; it does not build capital you don't. At this stage the binding constraint
is **your attention**, and six entities divide it six ways while the market
rewards depth.

The counter-argument worth taking seriously: entities exist for reasons that
aren't strategic — liability isolation, regulatory licensing, a partner who owns
30% of one of them, an existing contract that can't be novated. Those are real
and they survive this test. But they are **legal** reasons to keep an entity,
not **operational** reasons to run it as a separate business. Keep the LLC, fold
the operation.

### Kill / park / absorb — and the wake-up condition

Nothing gets killed without a written wake-up condition. Parking is reversible;
that is why it beats killing, and why it beats limping along.

For each entity that fails the test, write one line:

> *"[Entity] goes dormant. It wakes when [specific, measurable trigger] — at
> which point it gets [named operator] and [budget]."*

Triggers that count: the core business passes $X/mo, a named operator is hired,
inbound demand for that specific offer exceeds N/month unprompted. Triggers that
don't count: "when I have more time," "when things settle down."

---

# 2. STRUCTURE — Wire it so LTGP is even measurable

You cannot maximize lifetime gross profit per customer if six systems each hold
a fragment of the customer. Structure comes before the ladder because the ladder
is unmeasurable without it.

### Non-negotiable: one customer record

**One CRM. One customer ID. Six product flags.**

If Company 3 doesn't know that this person already bought from Company 1, you
cannot sequence, you cannot suppress, and you cannot compute portfolio LTGP.
You will also pay twice to advertise to someone who is already a customer, which
is the most expensive mistake in the entire structure.

This is the single highest-leverage change in this document and it is usually
the least glamorous. Do it first.

### Shared services vs. per-entity

| Layer | Where it lives | Why |
|-------|----------------|-----|
| Marketing / acquisition | **Shared, central** | One brand paying one CAC. Six ad accounts bidding on one avatar is you bidding against yourself. |
| Sales | **Shared, one pipeline** | The rep sells the *next right offer*, not their entity's offer. |
| CRM / customer data | **Shared, one record** | See above. Non-negotiable. |
| Finance / legal / admin | **Shared** | Six bookkeepers for one business is pure overhead drag. |
| Fulfillment / delivery | **Per-entity** | This is the one thing that is genuinely different per offer. |
| P&L reporting | **Per-entity, rolled up** | You still want to see which rung earns. |

### The compensation trap

If operators are paid on **their entity's revenue**, they will fight each other
for the same customer at the same moment, hoard leads, and refuse to hand off.
Six comp plans pulling against one customer base produces exactly the internal
competition the structure exists to eliminate.

**Fix:** pay operators on **portfolio LTGP** and on **handoff quality** — the
attach rate of the *next* rung — not on their own entity's top line. The person
running the front-end must be rewarded for a customer who ascends, or they will
optimize for a sale that ends with them.

### Front-end / back-end: the actual mechanism

This is the assignment that unlocks everything else.

- **One entity is the front-end.** It acquires. It absorbs the CAC. It runs at
  or near breakeven *deliberately.*
- **The other five are back-end.** They never pay to acquire a customer again.
  Their CAC is approximately zero, so their gross profit is nearly all margin.

Most six-company owners resist this because the front-end's P&L looks bad in
isolation. That is the point. The front-end is a **customer-acquisition
machine**, not a profit center, and judging it on standalone margin is how you
end up killing the one thing feeding the other five.

**Which entity is the front-end?** The one that is: lowest price, fastest time
to value, broadest appeal, easiest to explain to a stranger. Not the one with
the best margin — margin is the back-end's job.

---

# 3. LADDER — Maximize LTGP per customer

```
LTGP = Lifetime Gross Profit  (revenue − cost of delivery, over the full relationship)
```

Hormozi uses LTGP rather than LTV on purpose: it nets out delivery cost, which
is what actually determines how much you can afford to spend acquiring someone.

| LTGP : CAC | Status |
|------------|--------|
| < 3 : 1 | Struggling to scale |
| 3 : 1 | Minimum viable |
| > 3 : 1 | Ready to scale |

### The shared-CAC reframe

Compute it two ways and compare:

```
Entity view:     LTGP(entity 1) : CAC          → each entity looks marginal
Portfolio view:  Σ LTGP(1..6)   : CAC(front-end only)   → the real number
```

CAC belongs to the **portfolio**, not to whichever entity happened to close
first. Under the entity view, a front-end at 1.2:1 looks like a failing
business. Under the portfolio view — where that same acquisition seeds five
zero-CAC offers — it may be 8:1 and the best money you spend all year.

Run both. The gap between them is the value of the structure you are building.

### Sequencing rules

1. **Ascending price, ascending commitment.** Each rung costs more and asks
   more. Never sell rung 4 to someone who hasn't experienced rung 1 — you have
   no proof yet, and Perceived Likelihood is a numerator term in the value
   equation.
2. **One wallet moment, one offer.** Never present two offers competing for the
   same decision. Six things offered simultaneously is a menu, and menus reduce
   conversion. The paradox of choice is real and it is expensive.
3. **Triggers are events, not dates.** The handoff to the next rung fires when
   the customer *achieves the outcome* of the current rung — not 30 days later
   on a calendar. Outcome achieved is the moment Perceived Likelihood peaks,
   which is exactly when the next offer is cheapest to sell.
4. **Every rung is a Grand Slam Offer in its own right.** Attractive promotion,
   unmatchable stack, premium price, unbeatable guarantee. A weak rung doesn't
   just underperform — it breaks the chain, because a customer who has a
   mediocre experience at rung 3 never reaches rungs 4–6.

### The four LTGP levers

Apply in this order — the first two are usually the cheapest wins in a portfolio
that already has six offers built:

| Lever | Move | Why it's available here |
|-------|------|------------------------|
| **Purchase frequency** | More rungs, more often | You already own six things to sell. Most portfolios sell one and forget. |
| **Attach rate** | % of customers owning 2+ offers | Track this as your headline metric. It is the entire thesis in one number. |
| **Price** | Raise it | Price implies value. Underpricing the back-end is common because it "feels easy" to sell. |
| **Retention** | Reduce churn on recurring rungs | Longest lever, slowest to move. |

### Client-financed acquisition

If a customer repays CAC within 30 days, acquisition self-funds and you can
reinvest without a capital constraint. With six offers this is unusually
achievable — you have more ways to engineer front-loaded cash than a
single-product business does:

- Higher upfront price on the front-end
- Order bump at checkout (a back-end offer's smallest unit)
- Day-1 upsell
- Annual prepay option
- Setup / onboarding fee

Target: **30-day gross profit ≥ CAC.** Hit that and the growth ceiling becomes
operational capacity, not cash.

---

# 4. NAMING — Brand architecture, last

Two options. With one shared customer base the answer is usually obvious.

| | **Branded house** (master brand + named offers) | **House of brands** (six standalone) |
|---|---|---|
| Trust cost | Pay once, reuse six times | Pay six times against the same person |
| Customer experience | One partner deepening | Six vendors, one of whom keeps emailing |
| Cross-sell friction | Near zero | Every handoff re-establishes credibility |
| Marketing spend | Compounds | Fragments |
| Exit optionality | Sell the whole | Sell a clean single asset |

**Default: branded house.** Master brand carries the trust; each offer gets a
descriptive, transformation-specific name underneath it. You built the
relationship once — spend it six times.

### When a separate brand is genuinely correct

Four cases, and only four:

1. **Price ceiling conflict** — a premium offer cannot share a name with a
   discount one. The cheap brand caps what the expensive one can charge.
2. **Regulatory / liability separation** — licensing, insurance, compliance.
3. **Genuinely different avatar** — which means it failed the consolidation
   test as a sister company and is a separate business you happen to own.
4. **Exit optionality** — a buyer wants a clean, separable asset with its own
   brand, contracts, and customer list.

"It feels more professional" and "each one deserves its own identity" are not on
this list.

### Naming the rungs (MAGIC)

Once the architecture is set, each offer name should:

- **M**ake a magnetic reason why
- **A**nnounce the avatar
- **G**ive them a goal
- **I**ndicate a time interval
- **C**omplete with a container word

Generic is invisible. Specific transformation names sell.

---

# The dashboard

Five numbers. If you track nothing else, track these.

| Metric | Definition | Why |
|--------|-----------|-----|
| **Portfolio LTGP** | Σ gross profit across all six, per acquired customer | The thesis |
| **Blended CAC** | Total acquisition spend ÷ new customers | Charged to the portfolio, not the entity |
| **Portfolio LTGP:CAC** | Above two, divided | Must clear 3:1 |
| **Attach rate** | % of customers owning 2+ offers | The single best health check on the ladder |
| **30-day payback** | 30-day gross profit ÷ CAC | ≥ 1.0 unlocks client-financed acquisition |

**Watch the attach rate above all.** If it is near zero, you do not have a
portfolio — you have six businesses that happen to share an owner, and none of
the leverage in this document is being collected.

---

# Run against the actual six

*Entities identified from the Reevo CRM requirements document. See
`reevo-requirements-review.md` for the full read.*

## The premise does not hold here — and that is the finding

The framework above assumes six offers ascending against one buyer. These six
are something else: **one project, six entities, each capturing a different
margin pool on the same transaction.** A vertically integrated delivery chain,
not a portfolio of distractions.

Consolidation is therefore the wrong prescription. What carries over is the
front-end/back-end logic, the attach-rate metric, and the comp problem — which
in this structure is the real risk.

## A. Consolidation test

| Entity | Owns | Own avatar? | Own channel? | Standalone P&L? | Own operator? | Verdict |
|---|---|---|---|---|---|---|
| **Cultivation Warehouse** | Design, specification, energy modeling | Shared | **Yes** — the front door | Yes | Yes | **Front-end.** Acquires the project. |
| **Sustainable Pathway** | Equipment distribution and resale | Shared | No — fed by CW | Post-merger | Yes | **Back-end.** Separate for margin + accounting, not for acquisition. |
| **Illuminar** | LED horticultural lighting manufacture | **Potentially own** | Depends on outside channel | Yes | Yes | **Real company** *if* it sells outside the family. Test this. |
| **BENCH** | Benching, racking, mobile systems | **Potentially own** | Depends on outside channel | Yes | Yes | Same test as Illuminar. |
| **What Rebates** | Utility rebate coordination | Partially own | Possibly — utility relationships | Yes | Yes | **Real company**, sellable to facilities that buy no equipment. |
| **Future entities** | RO, controls, HVAC, … | — | — | — | — | Placeholder, not a company. Keep configurable. |

**The open question for Illuminar and BENCH:** what share of their revenue comes
from outside the group? If it's meaningful, they're genuine manufacturers with
their own distribution and the group is a customer among several. If it's near
zero, they're captive product lines and the entity exists for margin capture and
accounting separation — which is legitimate, but a different thing, and it
changes how you'd value or sell them.

## B. Front-end assignment

- **Front-end (absorbs CAC):** Cultivation Warehouse. The consulting and design
  agreement is the first purchase on a project and seeds every downstream
  category. Its rebateable per-category deposit is client-financed acquisition
  in the textbook sense — the customer funds the acquisition and the credit is
  recovered against the equipment sale.
- **Back-end (near-zero CAC):** Sustainable Pathway, Illuminar, BENCH, What
  Rebates. Every category they sell on a CW-originated project inherits an
  acquisition already paid for.
- **Parked:** nothing. This is not a focus problem.

**The corollary nobody will like:** CW's standalone margin will look worse than
the entities it feeds, because it is doing the acquisition work. That is correct
and should be protected, not "fixed."

## C. Sequence

Not a value ladder — the categories are concurrent scope on one project, gated
by design dependency rather than by ascending commitment.

| Position | What | Trigger |
|---|---|---|
| Entry | Consulting / design agreement (CW) | Feasibility review, ROM budget |
| Gate 1 | Facility design | Establishes rooms, sizes, workflow |
| Gate 2 | Benching / racking (BENCH) | Canopy layout, aisle spacing |
| Gate 3 | Lighting (Illuminar) | Fixture positions, mounting, heat load |
| Open field | ~45 remaining categories | Any order after lighting settles |
| Trailing | Rebate coordination (What Rebates) | Follows equipment selection |
| Recurring | Aftercare, change orders, on-site visits | Ongoing; change orders cascade from upstream revisions |

Only the first three gates are genuine technical dependency. Everything after is
practice, and the requirements document is right to ask for soft warnings rather
than hard blocks.

## D. Portfolio math

The numbers to instrument, in order of what they'd change:

```
Attach rate by category         §9 of the requirements doc asks for this already
Portfolio LTGP per project      across all six entities, net of delivery cost
CAC per project                 charged to CW, inherited zero-cost downstream
Change-order capture rate       §4.3 — currently depends on someone remembering
Deposit forfeiture rate         180-day clock; forfeit is a failure, not revenue
```

Change-order capture is the one to watch. The requirements document names it as
revenue routinely left on the table, and unlike most of the wish list it is
mechanical: an upstream revision either flags the downstream categories or it
doesn't.

## E. Brand architecture

Genuine exception territory — the four cases that justify separate brands mostly
apply here:

- **Illuminar / BENCH** — manufacturers selling through channels beyond the
  group. Separate brands are correct; a captive sub-brand would cap them.
- **What Rebates** — sells to facilities that buy no equipment, and its
  independence is arguably part of the pitch. Separate.
- **Cultivation Warehouse / Sustainable Pathway** — same buyer, same project,
  split for distribution margin and accounting. The client experiences these as
  one relationship, and should. This is the pairing where a single client-facing
  brand over two legal entities is worth considering.

## F. The decision no system resolves

When a client CW brought in buys lighting through Sustainable Pathway using
Illuminar product, **whose customer is it and whose compensation does it hit?**

Pay each entity's operators on their own booked revenue and they will optimize
against each other on a shared transaction — with CW, the entity doing the
acquisition, structurally under-rewarded relative to what it generates.

Decide the rule before the CRM encodes a default. Then make the CRM report it.
