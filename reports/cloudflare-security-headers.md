# Security response headers — Cloudflare setup for dietchennai.org

Reference: Section 5.3 / Phase 1 of `DIET-Chennai-Website-Audit.docx`. A direct
check of `https://dietchennai.org/` originally found none of the standard
protective response headers set. **These are now applied and verified live**
(see Option A's status note below) — this file is kept as the record of what
was configured and why, and as the reference to come back to if a future
change to the site needs the CSP widened for a new third-party resource.
Values were chosen by checking what the live site actually loads (Google
Fonts, the Cloudflare Insights beacon script, a Google search form, and —
only on `/admin` — the Decap CMS loader from unpkg.com), not copied from a
generic template.

## Option A — Transform Rules (no code, ~5 minutes)

**Status: applied and verified live, 31 Aug 2026.** Both response headers and
the actual pages were checked, not just assumed from the config below:
`curl -sI` confirms all 6 headers on both `https://dietchennai.org/` and
`https://dietchennai.org/admin/`, each with its own correct CSP; the public
site loads with no console errors introduced; and `/admin` loads all the way
to Decap CMS's real "Login with GitHub" screen with a clean console (checked
via `decap-cms-app 3.16.0` / `decap-cms-core 3.18.0` / `decap-cms 3.16.0`
banners logging with no CSP violations alongside them). The two rules below
are the values that ended up working, after two rounds of live debugging
(see history below) — no further changes needed unless something else on the
site starts loading a new third-party resource later.

<details>
<summary>Debugging history (both issues now fixed in the values below)</summary>

Two real problems turned up while verifying this, in sequence:

1. **Rule-order overwrite.** The first version of Rule 2 (site-wide) matched
   broadly on hostname, which meant it also matched `/admin` — and Transform
   Rules don't stop at the first match; every matching rule runs, and for
   *Modify Response Header* actions a later rule's value for the same header
   overwrites an earlier one's. `/admin` was silently getting the site-wide
   CSP (no `unpkg.com`), leaving Decap's loader script blocked and the CMS a
   blank page. Fixed by making Rule 2's condition explicitly exclude
   `/admin`, so the two rules can never both match the same request.
2. **Missing `'unsafe-eval'`.** With the rule conflict fixed, `/admin` got
   further but then threw `EvalError: Evaluating a string as JavaScript
   violates the following Content Security Policy directive because
   'unsafe-eval' is not an allowed source of script` — Decap CMS's own
   config parser requires it to run at all, independent of anything site
   -specific. Added to Rule 1's `script-src`, scoped to `/admin` only.

</details>

Cloudflare dashboard → your zone → **Rules → Transform Rules → Modify Response
Header**. The two rules, as currently applied:

### Rule 1 — "Security headers: /admin"

**When incoming requests match:** `URI Path` `starts with` `/admin`

Add these response headers:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://unpkg.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |

(`/admin` needs `unpkg.com` in `script-src`/`connect-src` because
`admin/index.html` loads Decap CMS from there, and the CMS itself talks to
`api.github.com`. It also needs `'unsafe-eval'` — see the debugging history
above; this is Decap's own config parser, not something optional. Everything
else is identical to Rule 2.)

### Rule 2 — "Security headers: site-wide"

**When incoming requests match:** use **Edit expression** (not the simple
field picker) and enter:

```
(http.host eq "dietchennai.org") and not starts_with(http.request.uri.path, "/admin")
```

This is the important fix — the previous "leave broad" guidance is what
caused the overwrite. Excluding `/admin` here means the two rules can never
both match the same request, so there's nothing left for rule order to get
wrong.

Add these response headers:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; form-action 'self' https://www.google.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |

`style-src` needs `'unsafe-inline'` because the site has inline `style="..."`
attributes and a couple of inline `<style>`/`<script>` blocks in the current
HTML — tightening that further would mean auditing and removing every inline
style first, which is real but separate work (candidate for Phase 2).

To re-verify after any future change here:
```
curl -sI https://dietchennai.org/ | grep -i "content-security-policy"
curl -sI https://dietchennai.org/admin/ | grep -i "content-security-policy"
```
The second command's output must contain both `unpkg.com` and `'unsafe-eval'`.
If it's missing either, check the Transform Rules list before assuming it's
still correct. Also open `/admin` in a browser and confirm it reaches Decap's
actual "Login with GitHub" screen (confirmed working state, checked via
console: `decap-cms-app`/`decap-cms-core`/`decap-cms` version banners log
with no CSP violations alongside them) — not a blank page or an "Error
loading the CMS configuration" screen, both of which are CSP failures
specific to Decap and won't show as a failed HTTP status, only as an in-page
error or console message.

**Separate, unrelated issue also seen live while debugging this:** `/admin`'s
loader script (`https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js`)
returned `503` a few times in a row from unpkg.com's own CDN before working —
navigating to that exact URL directly worked and resolved to version 3.16.0,
so it was a transient unpkg hiccup, not caused by anything here. Worth
knowing regardless: `admin/index.html` loads Decap CMS from a floating
`^3.0.0` version range with no pinned fallback, so the CMS editor's
availability is fully dependent on unpkg.com being up at the moment someone
opens it. Pinning an exact version (e.g. `decap-cms@3.16.0`) wouldn't prevent
an unpkg outage but would at least stop an unannounced new Decap release
from ever silently changing the editor's behavior underneath you. Not fixed
here since it's a content/config decision, not a headers one — flagging it
because it surfaced during this same check.

## Option B — a Cloudflare Worker (if you'd rather manage this as code)

Equivalent to Option A, as a single Worker you attach to a route
(`dietchennai.org/*`):

```js
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
    const isAdmin = new URL(request.url).pathname.startsWith("/admin");

    const csp = isAdmin
      ? "default-src 'self'; script-src 'self' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://unpkg.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'"
      : "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; form-action 'self' https://www.google.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'";

    newHeaders.set("Content-Security-Policy", csp);
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("X-Frame-Options", "SAMEORIGIN");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    newHeaders.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
  },
};
```

Deploy: **Workers & Pages → Create → Deploy this script**, then bind it to a
route for `dietchennai.org/*` (**Workers Routes**, or a **Custom Domain** on
the Worker). This runs entirely at Cloudflare's edge — no change to the
GitHub Pages origin or the static-site architecture either way.

## Which option

Option A (Transform Rules) is the lower-effort, no-code choice and is
sufficient for this — recommended unless you already manage other Workers and
would rather keep this as versioned code.
