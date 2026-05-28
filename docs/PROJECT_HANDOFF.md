# BuiltLocal Project Handoff

Last updated: May 28, 2026.

This document is meant for a new computer or collaborator whose only context is the repository.

## Product Summary

BuiltLocal is a rural-first services directory and lead-routing product for Stormont, Dundas and Glengarry.

The early public value is simple: residents can search a structured local directory instead of trying to sort through old Facebook recommendation posts. The stronger business value is lead handling: make it much easier for busy contractors to see, claim, and respond to quote requests without logging into a dashboard.

Current visible geography:

- Stormont, Dundas and Glengarry
- Local area filters for North/South Dundas, North/South Stormont, North/South Glengarry, and Cornwall & Area
- Default product language uses `SD&G Rural Area`

Current data:

- `sdg-seed-listings.csv` has 244 public listings.
- Listings are sourced from trusted public sources, municipal/chamber directories, YellowPages, BBB/provider websites, and manually verified local additions.
- Reviews/ratings are not imported from third parties.
- BuiltLocal review UI currently uses honest empty states.

## Deployment Status

Verified May 28, 2026:

- GitHub Pages public site is live: `https://scottvan08.github.io/localtrades-south-dundas/`
- Vercel app/API is live: `https://localtrades-south-dundas.vercel.app`
- Vercel health endpoint responds at: `https://localtrades-south-dundas.vercel.app/api/health`
- Health endpoint currently reports:
  - `supabase: true`
  - `twilio: true`
  - `openai: false`
  - `publicSiteUrl: https://scottvan08.github.io/localtrades-south-dundas`
  - `publicApiUrl: https://localtrades-south-dundas.vercel.app`
  - `webhookValidation: false`
- Reviews admin lives at `/admin/` and requires `ADMIN_REVIEW_SECRET`; MVP admin PIN is `2468` when Vercel is set to `ADMIN_REVIEW_SECRET=2468`.

Do not commit Vercel, Supabase, Twilio, OpenAI, or personal phone secrets.

## Architecture

### Public Directory

Files:

- `index.html`
- `app.js`
- `styles.css`
- `sdg-seed-listings.csv`

Key functions:

- CSV-backed directory search
- Category and keyword search with fuzzy matching
- List/map result views using Leaflet
- Profile cards
- Direct quote versus SMS matching quote choices
- Claim business modal
- Mobile-first public landing and directory UI

### Pro Dashboard

Files:

- `pro/index.html`
- `pro/pro.js`
- `styles.css`

Current status:

- Static/simulated auth only.
- Demo login: `demo@builtlocal.ca` / `2468`.
- Demo company: `BuiltLocal Demo Co.`
- Uses browser `localStorage`, not Supabase auth.
- Public profile edits in Pro do not sync back to the seed CSV yet.

Pro direction:

- Treat Pro as a lead triage app, not a full CRM.
- Mobile Pro should prioritize new leads, contact actions, notes, and status changes.
- Current lead statuses are simplified to `New`, `Claimed`, `Contacted`, `Handled`, plus `Rejected`.
- `Handled` removes a lead from Active view but keeps it recoverable.
- Reject is local/static in Pro for now; future live behavior should re-enter SMS matching.

### No-Login Lead Card

Files:

- `lead/index.html`
- `lead/lead.js`
- `api/leads/[token].js`

Purpose:

- Contractor opens an SMS link.
- Contractor sees a Job Snapshot without signing in.
- Contractor can claim or pass.
- Homeowner contact is masked until claim.

### Vercel API

Files:

- `api/leads.js`
- `api/leads/[token].js`
- `api/twilio/inbound.js`
- `api/twilio/status.js`
- `api/routing/sweep.js`
- `api/_lib/sms-leads.js`
- `api/health.js`
- `api/reviews.js`
- `api/admin/reviews.js`

Purpose:

- Receive quote intake submissions.
- Generate a fallback or AI Job Snapshot.
- Store leads in Supabase.
- Match providers by service/category and town/service area.
- Send Twilio SMS to one provider at a time.
- Handle provider replies.
- Notify homeowner by SMS after claim when the homeowner contact is a phone number.
- Accept public review submissions, keep them pending, and expose only approved reviews publicly.
- Let the private admin page approve or reject pending reviews.

### Supabase

Files:

- `supabase/schema.sql`
- `supabase/test-provider.sql`

Tables:

- `providers`
- `leads`
- `routing_attempts`
- `messages`
- `reviews`

Use Supabase for live test and future production data. Do not use the static Pro dashboard as a source of truth for live leads yet.

### Twilio

Twilio sends and receives SMS for lead routing.

Current expected inbound webhook:

```text
POST https://localtrades-south-dundas.vercel.app/api/twilio/inbound
```

Status callback endpoint:

```text
POST https://localtrades-south-dundas.vercel.app/api/twilio/status
```

Provider SMS commands:

- `YES`, `Y`, or `CLAIM`: claim lead
- `NO`, `N`, or `PASS`: pass lead
- `DETAILS`, `CARD`, or `INFO`: get the lead-card link
- `PAUSE`: pause new leads
- `RESUME`: resume new leads
- `STOP`: opt out

Outbound copy should prefer `DETAILS` over `INFO` because Twilio or carriers may intercept `INFO` as a built-in keyword.

### Vercel Cron

`vercel.json` currently schedules:

```json
{
  "path": "/api/routing/sweep",
  "schedule": "0 8 * * *"
}
```

This is daily because Vercel Hobby accounts do not allow every-5-minute cron schedules. The original desired production behavior was a frequent sweep for rerouting ignored leads. If upgrading Vercel or moving the worker elsewhere, revisit this.

## Environment Variables

Use `.env.vercel.example` as the source of names.

Required for live SMS:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` or `TWILIO_MESSAGING_SERVICE_SID`
- `PUBLIC_SITE_URL`
- `PUBLIC_API_URL`

Optional:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ROUTING_SWEEP_SECRET`
- `TWILIO_VALIDATE_WEBHOOKS`
- `ADMIN_REVIEW_SECRET`

Current deployed setup has `TWILIO_VALIDATE_WEBHOOKS=false`. Turn it on before a real provider pilot once Twilio webhook URLs are stable.

## Testing Checklist

Local static:

```bash
node server.mjs
```

Open:

```text
http://localhost:8000/
http://localhost:8000/pro/
```

Useful checks:

- Search loads all SD&G listings.
- Category cards and results reflect current `sdg-seed-listings.csv`.
- Quote modal offers `Request this company` and `Match me locally`.
- Pro login works with demo credentials.
- Mobile Pro opens lead detail as a focused screen with bottom actions.
- `Handled` and `Rejected` leads leave Active view but remain recoverable through filters.
- `node --check app.js`
- `node --check pro/pro.js`
- `node --check lead/lead.js`
- `git diff --check`

Live API:

- Visit `/api/health`.
- Submit a test quote with a matching provider in Supabase.
- Confirm Twilio SMS arrives.
- Reply `DETAILS`, `YES`, and `NO` in separate tests.
- Confirm Supabase rows are written in `leads`, `routing_attempts`, and `messages`.

## Known Gaps

- No real auth yet.
- Pro dashboard state is localStorage only.
- Public seed data and Pro profile edits are not synced.
- Review submission and lightweight admin moderation are available; reviews still require manual approval before public display.
- No real photo upload/storage yet; use Supabase Storage signed URLs later.
- Cron sweep is daily on Vercel Hobby, not frequent enough for production emergency rerouting.
- `OPENAI_API_KEY` is not configured; Job Snapshots use fallback summaries.
- SMS webhook validation is currently off.
- Direct company leads only work live when a matching provider row exists in Supabase by normalized business name.

## What To Preserve

- Do not add fake reviews, fake ratings, or copied third-party review text.
- Keep direct quotes and matching clearly distinct.
- Keep homeowner contact masked until claim.
- Keep contractor workflow SMS-first.
- Keep mobile Pro focused on lead triage, not analytics-heavy admin screens.
- Commit and push after every meaningful update.
