# Visitor counter Worker

Backs the "Total Visitors" figure in the site footer with real data from
Cloudflare's own analytics for this zone (dietchennai.org already sits
behind Cloudflare, so this reuses traffic data Cloudflare already has --
no new tracking script or third-party service is added to the site).

## Why a Worker at all

Cloudflare's traffic numbers are only reachable through the GraphQL
Analytics API, and that call requires a secret API token. A static site's
client-side JavaScript can never hold that token safely -- anyone could
view-source the page and lift it. This Worker is the small trusted
backend that keeps the token as a Worker secret (never in this repo) and
exposes only a plain public number at `/api/visitor-count`.

## What it does

- Every 6 hours (`wrangler.toml` cron trigger), it asks Cloudflare for the
  daily visit counts on any day it hasn't already counted, and adds them
  to a running total kept in Workers KV.
- It does **not** try to back-fill a "since the site launched" number --
  Cloudflare doesn't retain analytics history indefinitely, so there is no
  reliable way to reconstruct that, and guessing one would not be
  honest. The count starts accumulating from whenever you first deploy
  this Worker.
- `GET /api/visitor-count` returns `{"total": <number>, "asOf": "<date>"}`
  and is what the footer script in `src/_includes/footer.njk` fetches.

## One-time setup (you do this in your own Cloudflare account -- Claude
## cannot create accounts, tokens, or credentials on your behalf)

1. Install the Cloudflare CLI, from the repo root:
   ```
   cd workers/visitor-counter
   npm install
   ```
2. Log in (opens a browser window for you to approve):
   ```
   npx wrangler login
   ```
3. Create a Workers KV namespace for the running total:
   ```
   npx wrangler kv namespace create VISITOR_KV
   ```
   Copy the `id` it prints into `wrangler.toml` under `[[kv_namespaces]]`.
4. Find your Zone ID: Cloudflare dashboard → dietchennai.org → Overview →
   right sidebar, "Zone ID". Paste it into `wrangler.toml` as `CF_ZONE_ID`
   (and again under `[[routes]]` if you uncomment that block).
5. Create a scoped API token: Cloudflare dashboard → your profile icon →
   **My Profile → API Tokens → Create Token → Custom token**. Grant it
   exactly **Zone → Analytics → Read**, scoped to the dietchennai.org zone
   only (not "All zones", and no write permissions of any kind). Copy the
   token value once -- Cloudflare only shows it that one time.
6. Store the token as a Worker secret (it will prompt you to paste it;
   this keeps it out of the repo entirely):
   ```
   npx wrangler secret put CF_API_TOKEN
   ```
7. Deploy:
   ```
   npx wrangler deploy
   ```
   This prints the Worker's `*.workers.dev` URL.
8. (Recommended) Uncomment the `[[routes]]` block in `wrangler.toml` and
   redeploy, so the counter lives at `https://dietchennai.org/api/visitor-count`
   -- matching what the footer script already fetches -- instead of the
   `workers.dev` URL. If you'd rather keep the `workers.dev` URL, update
   the fetch URL in `src/_includes/footer.njk` to match.
9. Wait for the first cron run (up to 6 hours), or trigger one manually
   from the Cloudflare dashboard's Worker page ("Triggers" → "Cron
   Triggers" → run now), then check `https://dietchennai.org/api/visitor-count`
   in a browser to confirm it returns a number.

## Updating later

Change `src/index.js`, then `npx wrangler deploy` again from this
directory. The KV-stored running total is untouched by redeploys.
