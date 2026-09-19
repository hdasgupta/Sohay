# WBFFMH Appointment App

Monorepo with independent Vite/React frontend and Express/PostgreSQL backend.

## Local setup
1. Run `./scripts/setup.sh`.
2. Fill `backend/.env` and `frontend/.env` from the examples.
3. Run `./scripts/db.sh apply`.
4. Run `./scripts/backend.sh run`.
5. Run `./scripts/frontend.sh run`.

## Deployment
Set Render web-service environment variables from `backend/.env.example`, using the production Vercel URL in `FRONTEND_URL`. Deploy `frontend/` to Vercel with `npm run build` and output directory `dist`. The included Render cron runs at 18:30 UTC, which is 00:00 IST.

## JaaS recording / Google Drive
Configure JaaS credentials and a Google OAuth refresh token for the Google Drive account that should receive recordings. Set the JaaS recording webhook to `POST /api/webhooks/jaas/recording`. Doctor-side meeting startup requests recording automatically; completed recording payloads are downloaded and uploaded to the configured Drive folder.

## Security
Do not commit `.env` files. The generated project ignores them. The built-in first-run admin uses the requested email with a salted bcrypt hash for the requested default password; setting `ADMIN_PASSWORD` overrides it with a freshly salted bcrypt hash.
