# Development Workflow

## Required After Every Update

After every development update:

1. Verify the change locally.
2. Commit the change to git.
3. Push the commit to GitHub.

This keeps GitHub Pages, Vercel, and the next handoff machine aligned.

## Local Commands

Run the static site locally:

```bash
node server.mjs
```

Open:

```text
http://localhost:8000/
http://localhost:8000/pro/
```

Useful checks before committing:

```bash
node --check app.js
node --check pro/pro.js
node --check lead/lead.js
git diff --check
```

For API changes, also verify:

```text
https://localtrades-south-dundas.vercel.app/api/health
```

## Secrets

Never commit:

- Real Supabase service keys.
- Twilio account/auth values.
- OpenAI keys.
- Personal cellphone numbers.
- Production provider SMS numbers unless they are meant to be public and the owner has opted in.

Use `.env.vercel.example` for environment variable names only.

## Documentation

When product direction changes, update the repo docs in the same pass. The next computer may only have repository context.

Core docs:

- `README.md`
- `docs/PROJECT_HANDOFF.md`
- `docs/PRODUCT_IDEAS.md`
- `docs/SMS_LEADS_MVP.md`
- `REVIEW_STRATEGY.md`
- `JOB_REQUEST_STRATEGY.md`
- `SDG_EXPANSION_SOURCES.md`
