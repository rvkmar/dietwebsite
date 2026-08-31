# Security response headers — Cloudflare setup for dietchennai.org

Reference: Section 5.3 / Phase 1 of `DIET-Chennai-Website-Audit.docx`. A direct
check of `https://dietchennai.org/` found none of the standard protective
response headers set. This can't be applied from this session (no Cloudflare
dashboard access here) — it needs to be added on your end, in either of two
ways below. Values were chosen by checking what the live site actually loads
(Google Fonts, the Cloudflare Insights beacon script, a Google search form,
and — only on `/admin`— the Decap CMS loader from unpkg.com), not copied from
a generic template.

## Option A — Transform Rules (no code, ~5 minutes)

**Update 1, verified live 31 Aug 2026:** the two-rule setup below was applied
and the site-wide headers are live and correct (confirmed via `curl -sI`).
But `/admin` was *also* getting the site-wide CSP instead of its own — Decap
CMS's loader script from unpkg.com was being blocked, and the CMS editor was
a blank page. Root cause: Transform Rules don't stop at the first match
the way this doc originally implied — every rule whose condition matches a
request runs, in the order listed, and for **Modify Response Header** actions
a later rule's value for the same header name *overwrites* an earlier rule's
value. `/admin` matched both rules' conditions as originally written (its
hostname is still `dietchennai.org`), so whichever rule was evaluated second
won outright — in this case, the site-wide one. **Fixed by making the two
rules' conditions mutually exclusive** (Rule 2 below now explicitly excludes
`/admin`) so each request matches exactly one rule.

**Update 2, verified live right after Update 1 was applied:** with the rule
conflict fixed, `/admin` moved past the blank-page state to a real, different
error — Decap CMS's own config loader evaluates the fetched `config.yml` via
something CSP treats as `eval()`-like, and threw `EvalError: Evaluating a
string as JavaScript violates the following Content Security Policy
directive because 'unsafe-eval' is not an allowed source of script`. This is
Decap CMS's own requirement, not a mistake in the values below — its config
parser needs `'unsafe-eval'` in `script-src` to run at all. **Rule 1's CSP
value below has been updated to include it** (`script-src 'self'
'unsafe-eval' https://unpkg.com`) — this is scoped to `/admin` only, so the
public site's CSP (Rule 2) is unaffected and stays without `'unsafe-eval'`.
If you already created Rule 1 from the version of this doc without it, edit
that one header value to match what's below and re-save.

Cloudflare dashboard → your zone → **Rules → Transform Rules → Modify Response
Header**. Add (or fix) these two rules:

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
`api.github.com`. It also needs `'unsafe-eval'` — see Update 2 above; this is
Decap's own config parser, not something optional. Everything else is
identical to Rule 2.)

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

After saving, verify **both** paths — this is exactly the check that caught
the overwrite bug above, so it's worth doing for real rather than assuming:
```
curl -sI https://dietchennai.org/ | grep -i "content-security-policy"
curl -sI https://dietchennai.org/admin/ | grep -i "content-security-policy"
```
The second command's output must contain both `unpkg.com` and `'unsafe-eval'`.
If it's missing either, the fix hasn't fully taken — check the Transform
Rules list again before assuming it's fixed. Also open `/admin` in a browser
afterward and confirm the CMS's actual editor UI loads (the collection list
in the left sidebar), not just a blank page or an "Error loading the CMS
configuration" screen — both of those are CSP failures specific to Decap and
won't show as a failed HTTP status, only as an in-page error or console
message.

**Separate, unrelated issue also seen live while checking this:** `/admin`'s
loader script itself
(`https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js`) returned `503` a
few times in a row from unpkg.com's own CDN, independent of anything above —
navigating to that exact URL directly worked and resolved to version
3.16.0, so it's likely a transient unpkg hiccup rather than a real outage.
Worth knowing regardless: `admin/index.html` loads Decap CMS from a floating
`^3.0.0` version range with no fallback, so the CMS editor's availability is
fully dependent on unpkg.com being up at the moment someone opens it. Pinning
an exact version (e.g. `decap-cms@3.16.0`) wouldn't fix an unpkg outage but
would at least stop an unannounced new Decap release from ever silently
changing the editor's behavior underneath you. Not fixed here since it's a
content/config decision, not a headers one — flagging it because it surfaced
during this same check.

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
