# BuiltLocal SD&G

BuiltLocal is a rural-first local services directory for Stormont, Dundas and Glengarry. The product helps residents find trusted trades, contractors, rural property services, and side-gig helpers who actually serve their area.

The current wedge is not "another directory." The product direction is: help residents find someone local, then make quote follow-up extremely fast through SMS-first lead routing.

## Current Status

Last verified from this workspace: May 28, 2026.

- Public GitHub Pages site: `https://scottvan08.github.io/localtrades-south-dundas/`
- Vercel app/API: `https://localtrades-south-dundas.vercel.app`
- Vercel health check: `https://localtrades-south-dundas.vercel.app/api/health`
- Health status at handoff: Supabase configured, Twilio configured, OpenAI not configured, Twilio webhook validation off.
- Public directory seed: 244 SD&G listings in `sdg-seed-listings.csv`.
- Pro dashboard demo credentials: `demo@builtlocal.ca` / `2468`.
- Demo business: `BuiltLocal Demo Co.`
- Reviews admin: `/admin/`, protected by `ADMIN_REVIEW_SECRET` in Vercel.

## What Is In The Repo

- `index.html`, `app.js`, `styles.css`: public directory, map/list search, profiles, claim flow, quote intake, and mobile UI.
- `sdg-seed-listings.csv`: public seed database for SD&G service providers.
- `pro/`: simulated Pro dashboard with localStorage state, lead triage, status handling, notes, voice notes where supported, and mobile-first lead actions.
- `lead/`: no-login provider lead card opened from SMS links.
- `api/`: Vercel serverless API for live SMS lead intake, Twilio inbound replies, lead cards, status callbacks, and routing sweep.
- `admin/`: simple private review moderation page for pending public reviews.
- `supabase/`: SQL schema and test provider insert template.
- `docs/`: implementation notes and handoff context.

## Service Roles

GitHub Pages is the static public storefront. It serves the main BuiltLocal directory and can call the Vercel API when `builtlocal_api_base` is set in browser localStorage.

Vercel hosts the serverless backend and can also serve the static app. It receives quote requests at `/api/leads`, Twilio replies at `/api/twilio/inbound`, lead-card requests at `/api/leads/:token`, and the routing sweep at `/api/routing/sweep`.

Reviews are submitted at `/api/reviews`, remain pending by default, and are approved or rejected from `/admin/` using the private admin passcode.

Supabase is the live database for providers, leads, routing attempts, and SMS message history. Do not store real secrets or personal phone numbers in this repo.

Twilio sends and receives contractor SMS. Providers reply with commands like `YES`, `NO`, `DETAILS`, `PAUSE`, `RESUME`, or `STOP`.

OpenAI is optional. If `OPENAI_API_KEY` is not configured, the API uses the built-in fallback Job Snapshot summary.

## Local Preview

Run the local static server:

```bash
node server.mjs
```

Then open:

```text
http://localhost:8000/
http://localhost:8000/pro/
```

## Live SMS Testing

Read `docs/SMS_LEADS_MVP.md` before touching Twilio, Vercel, or Supabase setup.

The short version:

1. Vercel env vars come from `.env.vercel.example`.
2. Supabase schema comes from `supabase/schema.sql`.
3. Test provider setup comes from `supabase/test-provider.sql`, with the phone number entered privately in Supabase.
4. Twilio inbound webhook points to `https://localtrades-south-dundas.vercel.app/api/twilio/inbound`.
5. Public GitHub Pages testing can be connected to Vercel API with:

```js
localStorage.setItem("builtlocal_api_base", "https://localtrades-south-dundas.vercel.app");
```

## Important Product Context

Core positioning:

> A rural-first local services directory for SD&G that helps residents find trusted trades, contractors, and side-gig helpers who actually serve their area.

Current product bets:

- Local trust beats a generic directory.
- Reviews should be original BuiltLocal reviews only; no third-party review text should be imported.
- Direct quote requests can be a free first-year business feature.
- SMS matching, emergency routing, response automation, and rerouting are the likely premium lead product.
- Pro should feel like a quick lead triage tool, not a heavy CRM.
- The long-term moat is local trust infrastructure: response speed, contractor reliability, service-area data, and lead flow.

See `docs/PROJECT_HANDOFF.md` and `docs/PRODUCT_IDEAS.md` for fuller context.

## Development Workflow

After every development update:

1. Verify locally.
2. Commit.
3. Push to GitHub.

This workflow is intentional. The next machine may only have the repository, so do not leave important state only in local files or chat.
