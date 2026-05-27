# BuiltLocal SMS Leads MVP

## What This Adds

BuiltLocal lead routing is now designed around an SMS-first workflow:

- Residents submit a guided `Request Help` intake.
- BuiltLocal creates a Job Snapshot with score, summary, urgency, town, photo count, budget signal, and preferred contact method.
- The API can text one matched provider at a time.
- Providers can reply `YES`, `NO`, `DETAILS`, `PAUSE`, `RESUME`, or `STOP`.
- Providers can open `/lead/?token=...` to claim or pass without signing in.
- The Pro dashboard remains a lead history and analytics layer.

## Quote Choice Model

Residents have two paths:

- `Request this company`: a direct company lead. This is the simple/free first-year path. It targets the selected business only and does not automatically reroute unless the resident chooses matching in a future flow.
- `Match me locally`: a premium SMS routing lead. BuiltLocal sends the Job Snapshot to one matched provider at a time and can reroute if the provider ignores or passes.

Contractors can accept a lead by replying `YES` to SMS, opening the no-login lead card, or using `Accept Lead` in Pro. These actions are intended to mean the same thing: the provider is taking responsibility for the next follow-up and homeowner contact is unlocked.

Routing windows for matched leads:

- Emergency: about 5 minutes before reroute.
- ASAP/today: about 10 minutes before reroute.
- This week: about 30 minutes before reroute.
- Flexible: kept open longer, about 120 minutes before reroute.

Budget range is optional. `Not sure` is treated as a valid answer so residents are not blocked before they know pricing.

## Required Services

Real SMS routing requires these environment variables in the hosted API environment:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_FROM_NUMBER=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PUBLIC_SITE_URL=https://scottvan08.github.io/localtrades-south-dundas
PUBLIC_API_URL=https://your-api-host.example
TWILIO_VALIDATE_WEBHOOKS=true
ROUTING_SWEEP_SECRET=
```

Use `TWILIO_MESSAGING_SERVICE_SID` when available. `TWILIO_FROM_NUMBER` is the fallback sender. `OPENAI_API_KEY` is optional; without it, the API uses the built-in Job Snapshot summary. Toll-free SMS in Canada/US should be verified before relying on production delivery.

For Vercel setup, copy the names from `.env.vercel.example` into Project Settings > Environment Variables. Do not commit real secret values.

## Supabase Setup

Run `supabase/schema.sql` in Supabase SQL editor. Then add opted-in providers to `providers`.

Minimum provider fields:

- `business_name`
- `sms_number` in E.164 format, such as `+16135550198`
- `categories`, for example `{Roofing,General Contractor}`
- `towns_served`, for example `{Morrisburg,Iroquois,South Dundas}`
- `accepts_leads=true`
- `paused=false`

For a one-phone live test, run `supabase/test-provider.sql` after replacing `+1YOURCELLPHONE` with the verified cellphone number that should receive test leads.

## Twilio Webhooks

Configure Twilio Messaging Service or phone number webhooks:

- Incoming messages: `POST https://your-api-host.example/api/twilio/inbound`
- Status callbacks: `POST https://your-api-host.example/api/twilio/status`

For the first trial-account test, set `TWILIO_VALIDATE_WEBHOOKS=false` until the deployed URL is stable. Switch it to `true` before any real provider pilot.

## Live Cellphone Test

1. Deploy the API routes to Vercel.
2. Add the Vercel environment variables from `.env.vercel.example`.
3. Open `https://your-api-host.example/api/health` and confirm `supabase` and `twilio` are `true`.
4. In Supabase, run `supabase/schema.sql`.
5. In Supabase, run `supabase/test-provider.sql` with your verified cellphone number.
6. In Twilio, set the incoming SMS webhook and status callback URLs above.
7. On the public GitHub Pages site, set the API base once in the browser console:

```js
localStorage.setItem("builtlocal_api_base", "https://your-api-host.example");
```

8. Submit a `Request Help` lead for a matching category such as `Roofing`.
9. Confirm the cellphone receives the BuiltLocal lead SMS.
10. Reply `DETAILS`, `YES`, or `NO`.

SMS lead-card links include the API host as a query parameter, so they work on a phone even when that phone has never visited the local test setup.

## Timeout Rerouting

`vercel.json` schedules `/api/routing/sweep` every 5 minutes. The sweep endpoint:

- Finds SMS routing attempts that reached their timeout.
- Marks the ignored attempt as expired.
- Sends the same lead to the next matched provider.
- Marks the lead expired if no more providers are available.

Set `ROUTING_SWEEP_SECRET` if you want to require `Authorization: Bearer ...` for manual sweep calls.

Provider commands:

- `YES` or `CLAIM`: claim lead and unlock homeowner contact.
- `NO` or `PASS`: pass lead.
- `DETAILS`: receive no-login lead card link. `INFO` is avoided in outbound copy because some SMS providers treat it as a built-in help keyword.
- `PAUSE`: temporarily stop new leads.
- `RESUME`: resume new leads.
- `STOP`: opt out.

## Frontend API Base

If the public site remains on GitHub Pages and the API is hosted elsewhere, set the API base in the browser for testing:

```js
localStorage.setItem("builtlocal_api_base", "https://your-api-host.example");
```

For a production build, define `window.BUILTLOCAL_API_BASE` before `app.js` and `lead/lead.js`, or host the frontend and API together on the same Vercel project.

## Current Limitations

- Photo upload is represented as private photo metadata in this pass; real image storage should use Supabase Storage signed URLs.
- Sequential rerouting is available through the scheduled sweep endpoint; production should add alerting around failed sweeps.
- The current provider match is simple category/town matching. Response speed, availability mode, and lead quality history should become routing weights later.
