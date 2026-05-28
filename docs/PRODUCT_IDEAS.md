# BuiltLocal Product Ideas And Strategy Notes

This document captures product thinking from the build conversation so future work does not lose the reasoning behind the prototype.

## Core Positioning

Original positioning that resonated:

> A rural-first local services directory for South Dundas that helps residents find trusted trades, contractors, and side-gig helpers who actually serve their area.

Expanded SD&G positioning:

> BuiltLocal helps residents in Stormont, Dundas and Glengarry find local contractors who actually respond, then routes quote requests in a way busy providers can act on quickly.

The most important product shift was from "directory" to "buying locally actually happens."

## Why This Exists

Rural residents often ask Facebook groups for recommendations because Google Maps, YellowPages, and word-of-mouth are incomplete or hard to search later.

Observed pain:

- People need trades and rural services urgently.
- Local providers may have little or no web presence.
- Facebook recommendations are chaotic and hard to revisit.
- Residents are unsure which providers serve their exact rural area.
- Contractors are busy, miss calls, and lose jobs through operational chaos.

BuiltLocal should solve both sides:

- Residents get structured search, service-area clarity, reviews, and fast status.
- Providers get high-intent leads in a format they can act on without admin overhead.

## Directory Strategy

The directory is the trust and discovery layer, not the final moat.

Important rules:

- Use trusted public listing facts only.
- Do not import third-party review text.
- Do not show fake ratings or fake completed-job counts.
- Keep listings useful even before businesses claim them.
- Allow businesses to claim profiles later.
- Prefer SD&G-wide category counts while keeping search/filtering local enough that the product feels hyperlocal.

Current dataset direction:

- Start with SD&G coverage, but preserve local feel through town/area filters.
- Cornwall & Area remains useful because many providers are based there and serve rural SD&G.
- Public source confidence matters; weak SEO-only rows should not be imported.

## Reviews Strategy

Reviews are the trust layer locals already want, but they must be original BuiltLocal reviews.

Principles:

- Allow resident-first reviews and business-requested reviews.
- Ask for as little as possible: name, town, private email, provider, service, rating, short review, rough date.
- Manually moderate at launch.
- Show `No local reviews yet` until real reviews exist.
- Only show average star ratings after enough approved reviews exist.
- Do not copy Facebook comments, Google reviews, or YellowPages review text.

## Quote And Lead Strategy

This is likely the strongest product opportunity.

The key insight:

> Contractors do not need another dashboard. They need the easiest way to win worthwhile jobs without wasting time.

The product should turn homeowner chaos into contractor clarity.

Most valuable intake fields:

- Service/category
- Urgency
- Town or nearest community
- Property type
- Short details
- Photos/video later
- Budget signal, optional
- Preferred contact method
- Availability windows
- AI or fallback Job Snapshot

Budget range should remain optional because residents may resist naming a number before getting advice. `Not sure` is a valid answer.

## Direct Quote Versus Matching

Two quote paths should stay clear:

- `Request this company`: direct lead to one business. This can be free in year one to encourage claims and trust.
- `Match me locally`: SMS-first lead routing. This can become premium because it includes routing, rerouting, emergency handling, and response automation.

Direct company request:

- Goes to the selected provider.
- Should generate a lead in Pro and SMS to the provider when live provider data exists.
- Should not automatically reroute unless the resident or business has opted into rerouting.

SMS matching:

- Sends one provider at a time.
- Homeowner contact remains masked until a provider accepts.
- Timeout windows should depend on urgency.
- If ignored or passed, route to the next provider.

Suggested timeout logic:

- Emergency: 5 minutes.
- ASAP/today: 10 minutes.
- This week: 30 minutes.
- Flexible/researching: 120 minutes or manual review.

## SMS-First Provider Experience

The outside-the-box product idea is ultra-frictionless lead handling:

- Contractor gets a concise SMS.
- Contractor replies `YES`, `NO`, or `DETAILS`.
- No login is required to claim.
- SMS link opens a no-login lead card.
- Claim unlocks homeowner contact and sends homeowner a status update.

Example SMS:

```text
BuiltLocal matched lead: Septic repair in Ingleside. ASAP. 3 photos. High intent.
Reply YES to claim, NO to pass, DETAILS for the lead card.
```

After claim:

- Contractor receives homeowner contact and a suggested reply.
- Homeowner receives: `Good news: [company] accepted your BuiltLocal request for [service]. They have your details and should reach out shortly.`

Future automation ideas:

- Remind provider after claim if no contact is marked.
- Ask homeowner later if someone reached out.
- Track response speed as future trust data.
- Re-route ignored emergency leads quickly.
- Let providers set availability: available this week, emergency only, booked out, paused.

## Pro Dashboard Direction

Pro should support SMS workflow, not replace it.

Current UX direction:

- Mobile-first lead inbox.
- Lead queue first.
- Stats only for what needs attention: unreviewed leads and new reviews.
- Clean filters: Active, Unreviewed, New, Claimed, Contacted, Handled, Rejected.
- Lead detail uses app-style bottom actions: Status, Contact, Forward, Reject.
- Status feels like presence: color-coded at top of card.
- Notes have their own save action.
- Voice-to-text notes are useful for busy job sites where supported by the browser.

Avoid:

- Heavy CRM/invoicing/payroll/accounting.
- Making contractors log in just to claim a lead.
- Too many status options before the workflow is proven.

Future Pro ideas:

- `Propose site visit` after claim, not automatic booking. Contractors usually need to speak to the client before confirming scope and timing.
- One-tap suggested reply drafts.
- Voice reply converted into a polished text.
- Simple team forwarding/contact card sharing.
- Availability mode that controls routing.

## Business Model Direction

Potential monetization:

- Free basic public listing.
- Paid claimed profile / Pro membership.
- Featured listing or category promotion.
- SMS matching/routing as premium.
- Emergency routing as premium.
- Direct company leads free in year one to build participation.

Early sales test:

- Ask businesses whether they would pay for profile accuracy, review collection, or lead routing.
- Charge early enough to learn, but avoid overbuilding before provider willingness is clear.

## Long-Term Moat

The moat is not the code or the listings.

Potential defensibility:

- Local trust and brand recognition.
- Contractor response-time data.
- Local service-area data.
- Homeowner lead behavior.
- Contractor reliability history.
- Strong local SEO.
- Relationships with providers.
- Repeat usage and high-intent quote flow.

Possible acquisition interest would likely come from regional media, local lead-generation companies, marketing agencies serving trades, or larger trades platforms. Buyers would care about distribution, contractor relationships, lead flow, and proprietary local data, not the static directory itself.

Also realistic: BuiltLocal could become a profitable regional platform business without selling.

## Near-Term Priorities

1. Keep the public directory accurate and useful.
2. Build original review collection and moderation.
3. Convert more businesses into claimed profiles.
4. Pilot SMS matching with a small set of opted-in providers.
5. Track response behavior and homeowner outcomes.
6. Decide whether Pro revenue starts with profile/reviews, lead routing, or both.
