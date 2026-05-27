# BuiltLocal SMS Leads MVP

## What This Adds

BuiltLocal lead routing is now designed around an SMS-first workflow:

- Residents submit a guided `Request Help` intake.
- BuiltLocal creates a Job Snapshot with score, summary, urgency, town, photo count, budget signal, and preferred contact method.
- The API can text one matched provider at a time.
- Providers can reply `YES`, `NO`, `INFO`, `PAUSE`, `RESUME`, or `STOP`.
- Providers can open `/lead/?token=...` to claim or pass without signing in.
- The Pro dashboard remains a lead history and analytics layer.

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

Use `TWILIO_MESSAGING_SERVICE_SID` when available. `TWILIO_FROM_NUMBER` is the fallback sender. Toll-free SMS in Canada/US should be verified before relying on production delivery.

## Supabase Setup

Run `supabase/schema.sql` in Supabase SQL editor. Then add opted-in providers to `providers`.

Minimum provider fields:

- `business_name`
- `sms_number` in E.164 format, such as `+16135550198`
- `categories`, for example `{Roofing,General Contractor}`
- `towns_served`, for example `{Morrisburg,Iroquois,South Dundas}`
- `accepts_leads=true`
- `paused=false`

## Twilio Webhooks

Configure Twilio Messaging Service or phone number webhooks:

- Incoming messages: `POST https://your-api-host.example/api/twilio/inbound`
- Status callbacks: `POST https://your-api-host.example/api/twilio/status`

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
- `INFO`: receive no-login lead card link.
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
