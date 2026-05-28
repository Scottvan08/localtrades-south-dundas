# BuiltLocal SD&G

Prototype for a rural-first local services directory for Stormont, Dundas and Glengarry.

The app helps residents find local trades, contractors, and service providers who actually serve the surrounding rural area. It is currently a static public directory using an SD&G CSV seed database, Leaflet maps, local-area filtering, contractor profiles, guided quote intake, claim modals, and mock Pro/business access.

The lead product direction is SMS-first: residents submit a short guided request, BuiltLocal creates a Job Snapshot, and the hosted API can text one matched provider at a time. See `docs/SMS_LEADS_MVP.md` for the Vercel, Supabase, Twilio, and cellphone test setup.

## Local Preview

Run the local static server:

```bash
node server.mjs
```

Then open:

```text
http://localhost:8000/
```

## GitHub Pages

This prototype is static and can be deployed directly with GitHub Pages from the `main` branch.

## Development Workflow

After every development update, verify locally, commit the change, and push it to GitHub so the GitHub Pages version stays current.

See `DEVELOPMENT.md`.
