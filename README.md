# Fyloo Pin Scheduler

A minimal Pinterest scheduling web app for one account (the Fyloo account), written from scratch with its own simple design.
Built with Next.js App Router + TypeScript, deployable on the Vercel Hobby plan
with no paid services.

## What it does (v1)

- Pinterest OAuth connect (API v5), scopes: boards:read, boards:write,
  pins:read, pins:write.
- Boards page: list boards, create a board.
- Composer: pick a board, upload an image, set title, description,
  tags, destination link, and either publish now or queue for a schedule
  date/time.
- Queue page: list queued pins with status (queued / published / failed).
- `/api/publish-due`: publishes every queued pin whose time has arrived.
  Called by Vercel Cron (daily on Hobby) or an external cron.

## How pins are published

Pinterest API v5 media upload flow: register media, upload image bytes,
wait for processing, then create the pin from the media id. Queued pins
upload their image immediately and store the media id; publishing later
only creates the pin.

Note on tags: Pinterest API v5 has no tag field on pin creation, so tags
entered in the Composer are appended as hashtags at the end of the
description. This is intentional and visible in the published pin text.

## Setup

### 1. Create a Pinterest app

1. Go to https://developers.pinterest.com and sign in with the Pinterest
   account that owns the boards (the Fyloo account).
2. Create an app. Request scopes: boards:read, boards:write, pins:read,
   pins:write. Standard access covers these for your own account; if
   Pinterest asks for app review, submit it and wait for approval.
3. Set the app redirect URI to your deployed callback URL, for example:
   `https://your-app.vercel.app/api/auth/callback`
   (for local dev: `http://localhost:3000/api/auth/callback`).
4. Copy the App ID (Client ID) and App Secret (Client Secret).

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `PINTEREST_CLIENT_ID`
- `PINTEREST_CLIENT_SECRET`
- `PINTEREST_REDIRECT_URI` (must match the redirect URI in the Pinterest app)
- `CRON_SECRET` (optional; if set, external cron callers must send
  `Authorization: Bearer <secret>` to `/api/publish-due`)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (see KV below)

### 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, click Connect Pinterest, approve, then use
Boards / Composer / Queue.

### 4. Deploy on Vercel

1. Push this folder to a Git repo and import it in Vercel.
2. Set the same env vars in the Vercel project settings.
3. Update the Pinterest app redirect URI to the Vercel callback URL.
4. Deploy. The `vercel.json` cron runs `/api/publish-due` once daily.

### 5. Connect durable queue storage (required for production)

The queue and the OAuth token are stored in Vercel KV (Upstash Redis)
when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.
Without them, the app falls back to a JSON file under `data/`, which
works locally but does NOT survive on Vercel serverless functions: queued
pins and the login session would be lost between invocations.

To connect KV: in Vercel, go to Storage, create an Upstash Redis
database, and connect it to this project (this sets the two env vars
automatically), then redeploy. Alternative: set the two vars manually
from your Upstash dashboard.

For more frequent publishing than the daily Hobby cron, use an external
cron service (for example cron-job.org) to call
`https://your-app.vercel.app/api/publish-due` on your schedule, with
`Authorization: Bearer <CRON_SECRET>` if you set one.

## What is NOT built yet

- Analytics page (impressions, saves, outbound clicks per pin).
- Bulk CSV import of pins.
- Multi-user support (this app stores one account token only).
- Token storage in KV on the OAuth callback path is already supported
  through the same store, but if KV is absent on Vercel the token file
  fallback will not persist; set `PINTEREST_ACCESS_TOKEN` as a fallback
  env var or connect KV.
- Pinterest native scheduling: the API has no schedule endpoint, so
  scheduling is this app's own queue plus the publish-due endpoint.
