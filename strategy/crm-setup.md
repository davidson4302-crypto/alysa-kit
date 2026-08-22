# CRM Setup for Six Offers, One Customer Base

*Companion to `hormozi-sister-companies.md`. This is the structure layer made
concrete — the ladder is unmeasurable without it.*

---

## The one rule everything else follows from

**One portal. One contact record per human. Six product flags.**

Not six CRMs. Not six instances of one CRM. Not one CRM plus a spreadsheet for
the entities that "aren't really sales." One.

Every failure mode in a six-offer portfolio traces back to a split customer
record:

- You pay to advertise to someone who is already your customer.
- Two operators pitch the same person in the same week and both look desperate.
- You cannot compute portfolio LTGP, so you cannot justify the front-end's CAC.
- Attach rate — the headline metric — is unmeasurable, so nobody manages it.

Entity-level reporting is a **property on the record**, never a separate system.
If someone says "but Company 4 needs its own CRM so we can see its numbers,"
the answer is a filtered dashboard, not a second database.

---

## 1. Tool selection

Pick on one axis: *can one contact record carry six product relationships and
still report per-entity?* Most tools can. The ones that can't are disqualified
regardless of other features.

| If the portfolio is… | Use | Why |
|---|---|---|
| Mixed B2C/B2B, marketing-led, needs email + automation in the same system | **HubSpot** | One contact record, multiple deal pipelines, a real product catalog with cost fields, custom properties, calculated rollups. The default answer. |
| Local service / agency / high-volume phone-and-SMS follow-up | **GoHighLevel** | Funnels, calls, SMS, pipelines bundled. Cheaper at volume. Weaker reporting — you'll build the LTGP math outside it. |
| Pure B2B sales, low marketing automation need | **Pipedrive** or **Close** | Clean pipelines, cheap seats. You'll add a separate email tool. |
| Product-led / transactional / heavy dev resource | **Postgres + Metabase, CRM as a thin layer** | Only if you have engineering. The customer record lives in your DB, the CRM is a view. |

**Disqualified as the system of record:** Airtable, Notion, spreadsheets. Fine
as a scratchpad, not as the place customer truth lives — no dedupe, no consent
log, no email-engagement history, no audit trail.

**Cost note:** a single mid-tier portal is almost always cheaper than six
starter plans, before you count the integration work you won't have to do.

---

## 2. Data model

Four objects. Resist adding a fifth.

```
CONTACT   one per human — the single customer record
COMPANY   one per org (B2B only; skip entirely if B2C)
DEAL      one per purchase opportunity, tagged to one of the six offers
PRODUCT   the six offers, each with price AND cost of delivery
```

**The product catalog is not optional.** LTGP is gross profit, not revenue —
Hormozi's whole point in using LTGP over LTV. If the product record doesn't
carry cost of delivery, every downstream number is revenue wearing a profit
costume, and you will overpay for customers on offers that barely clear COGS.

### Contact properties that do the actual work

These are the ones that make the portfolio legible. Everything else is standard.

| Property | Type | Purpose |
|---|---|---|
| `acquisition_offer` | dropdown (6) | Which offer they bought **first**. Never overwritten. |
| `acquisition_source` | dropdown | Channel of the original touch. **Locked at first touch, forever.** |
| `acquisition_date` | date | Start of the LTGP clock. |
| `acquisition_cost` | number | CAC stamped onto the record at acquisition. |
| `offers_owned` | multi-select (6) | The attach-rate engine. |
| `offer_count` | calculated | `count(offers_owned)`. |
| `current_rung` | dropdown (1–6) | Ladder position. |
| `next_best_offer` | calculated | Derived from rung + `offers_owned`. Tells the rep what to sell. |
| `ascension_ready` | boolean | Set by an **outcome event**, not a date. |
| `lifetime_revenue` | rollup | Sum of closed-won deal amounts. |
| `lifetime_gross_profit` | rollup | Revenue − Σ product costs. **This is LTGP.** |
| `pitch_lock_until` | date | Suppression. See §4. |

**`acquisition_source` locked at first touch** is the single most-violated rule
in multi-offer CRMs. Most tools will happily overwrite "original source" when a
known contact clicks a new campaign. Turn that off. If a back-end deal can claim
a fresh acquisition source, your CAC math silently double-counts and the
front-end stops looking like it's working.

### Pipelines

One deal pipeline **per offer**, not per entity. Same thing here today, but the
distinction matters the moment an entity carries two offers or an offer gets
folded into another entity.

Keep stages short — 4 to 6. Long pipelines are fiction that reps maintain
instead of selling.

Contact **lifecycle** stages sit above all pipelines and are portfolio-wide:

```
Lead → Qualified → Customer (rung 1) → Ascended (2+ offers) → Champion (referrer)
```

Ascended is the stage that matters. It is the attach-rate metric expressed as a
lifecycle, and it should be the number on the wall.

---

## 3. Attribution: charge CAC once, to the portfolio

The mechanism, concretely:

1. Ad spend and acquisition costs roll up to a **portfolio-level** CAC, not to
   the entity that closed the deal.
2. At first purchase, stamp `acquisition_cost` onto the contact.
3. Every subsequent deal from that contact is **zero-CAC** by definition. It
   inherits the original acquisition; it does not generate a new one.
4. Report `lifetime_gross_profit ÷ acquisition_cost` at the contact level, then
   average across the cohort.

That average is your portfolio LTGP:CAC. It should clear 3:1. Compute the
front-end's standalone ratio too — the gap between the two numbers is the
measured value of the structure, and it's the number that justifies running the
front-end at breakeven when someone inevitably argues it should be "fixed."

**Cohort by acquisition month.** Portfolio LTGP grows over the customer's life,
so a blended all-time average understates recent cohorts and flatters old ones.
Monthly cohorts show whether the ladder is getting better or worse.

---

## 4. Suppression: the rule that stops six operators colliding

Without this, six pipelines will pitch one person simultaneously and you will
train your best customers to ignore you.

**The pitch lock.** When any deal opens against a contact:

- Set `pitch_lock_until` = expected close date + a cooling period.
- No other pipeline may enroll that contact while the lock holds.
- No marketing sequence for a *different* offer may send while the lock holds.

**Enrollment gate.** A contact can only enter an offer's pipeline if:

```
offer NOT IN offers_owned
AND offer == next_best_offer
AND ascension_ready == true
AND pitch_lock_until < today
```

Four conditions, all required. This is Hormozi's *one wallet moment, one offer*
rule turned into a database constraint — which is the only place a rule like
that actually survives contact with a commissioned salesperson.

**Suppress customers from acquisition ads.** Sync `offers_owned` back to your ad
platforms as an exclusion audience. Paying to acquire people you already own is
the most common wasted spend in a portfolio like this, and it is a
fifteen-minute fix.

---

## 5. Ascension automation

Handoffs fire on **outcome events**, never on elapsed time. The moment a
customer achieves the result they were promised is the moment Perceived
Likelihood peaks and the next offer is cheapest to sell. A calendar-based
"day 30 upsell" arrives at a random point in that curve.

Wire it as:

```
TRIGGER   outcome event recorded (result achieved, milestone hit, usage threshold)
    ↓
SET       ascension_ready = true
SET       next_best_offer = <computed>
    ↓
CHECK     enrollment gate (§4)
    ↓
ACTION    task to owner  +  sequence enrolled  +  deal created
```

You need an **outcome field per offer** for this to work — the specific,
recordable thing that means "this rung delivered." If you can't name it for a
given offer, that offer has no defined dream outcome, which is an offer problem
upstream of the CRM.

---

## 6. Migration: merging six lists into one

The dangerous step. Do it in this order.

1. **Export all six.** Freeze writes to the old systems. Do not run parallel
   systems "for a while" — parallel means divergent, permanently.
2. **Choose the match key.** Email primary, phone secondary. Name-matching
   creates false merges that are effectively unrecoverable.
3. **Set conflict rules before you merge**, not during:
   - `acquisition_date` → **earliest** wins
   - `acquisition_offer` / `acquisition_source` → whichever matches the earliest date
   - `offers_owned` → **union** of all six lists
   - contact detail fields → most recently updated wins
4. **Dry-run on a copy.** Review the top 50 merges by hand. Merge collisions are
   where the trust in this system is won or lost.
5. **Merge, never delete.** Deletion loses purchase history, which is LTGP.
6. **Backfill history.** Import closed deals from all six so `lifetime_gross_profit`
   is real from day one rather than starting at zero.
7. **Reconcile.** Total revenue in the new portal must match the sum of the six
   old systems. If it doesn't, stop and find the gap before going live.

### Consent — read this before merging mailing lists

Merging six contact lists into one record is a data operation. Merging six
*mailing* lists into one send list is a legal and deliverability decision, and
they are not the same thing.

Someone who opted in to Company 3 has not necessarily consented to hear from
Company 5. Under GDPR/UK-GDPR, consent is purpose-specific and does not
transfer across brands by virtue of common ownership. CAN-SPAM is looser but
still requires accurate sender identification and a working opt-out per sender.

Practically:

- Store consent **per offer/brand**, not once per contact. Add a
  `consent_scope` multi-select alongside `offers_owned`.
- Honor the narrowest scope you actually have. Unify the *record* immediately;
  unify the *sending* only where consent covers it.
- Re-permission where it doesn't — which is much easier once you've moved to a
  master brand, because then there's one sender to consent to.
- This is also a deliverability question: six domains suddenly mailing one
  merged list is a recognizable spam pattern. One warmed sending domain under
  the master brand is both more compliant and better-delivering.

I'd get an actual opinion from counsel on the consent scope before the first
cross-brand send. The record merge itself is fine to do now.

---

## 7. The dashboard

Five tiles. Everything else is a drill-down.

| Tile | Query | Target |
|---|---|---|
| **Portfolio LTGP:CAC** | avg(`lifetime_gross_profit`) ÷ avg(`acquisition_cost`) | > 3:1 |
| **Attach rate** | % of customers with `offer_count` ≥ 2 | rising, every month |
| **30-day payback** | 30-day gross profit ÷ CAC | ≥ 1.0 |
| **Ascension velocity** | median days rung 1 → rung 2 | falling |
| **Front-end standalone ratio** | rung-1 LTGP ÷ CAC | ~1:1 is correct, not a problem |

Segment every tile by `acquisition_offer`. That tells you which front-end
produces the customers who actually ascend — which is a different question from
which front-end converts best, and a more valuable one.

---

## 8. Anti-patterns

| Don't | Because |
|---|---|
| Six CRM instances "for clean separation" | Separation is a property, not a system. This is the root failure. |
| Contact *ownership* assigned per entity | Operators hoard. Own the relationship centrally, assign the deal. |
| Overwriting original source on new campaigns | Silently double-counts CAC and hides the front-end's real performance. |
| Tracking revenue without cost of delivery | Gives you LTV, not LTGP. Leads to overpaying for low-margin offers. |
| Time-based upsell automation | Fires at a random point in the confidence curve. Use outcome events. |
| Six Zapier webs between six tools | Every integration is a place data diverges. One portal, few integrations. |
| Deleting duplicates | Destroys purchase history. Merge. |
| Running old systems "in parallel for a bit" | Parallel systems diverge permanently. Cut over. |

---

## Build order

Roughly two weeks of real work, sequenced so nothing depends on something later.

| Phase | Work |
|---|---|
| **1. Foundation** | Pick the portal. Build the 6-product catalog *with costs*. Create custom properties. Build the six pipelines. |
| **2. Migration** | Export six, set conflict rules, dry-run, merge, backfill closed deals, reconcile totals. |
| **3. Rules** | Lock original source. Build the enrollment gate and pitch lock. Sync suppression audiences to ad platforms. |
| **4. Automation** | Define one outcome event per offer. Wire ascension triggers. Build sequences per rung. |
| **5. Measurement** | Build the five-tile dashboard. Set the cohort report. Put attach rate on the wall. |
| **6. Comp** | Re-cut operator compensation onto portfolio LTGP + handoff attach rate. |

Phase 6 is last but it is the one that makes the other five stick. A CRM that
measures portfolio LTGP while paying people on entity revenue will lose to the
comp plan every time.
