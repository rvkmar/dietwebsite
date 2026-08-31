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

Cloudflare dashboard → your zone → **Rules → Transform Rules → Modify Response
Header** → Create rule. Add these two rules, in this order:

### Rule 1 — "Security headers: /admin" (matches first, so it wins on /admin)

**When incoming requests match:** `URI Path` `starts with` `/admin`

Add these response headers:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://unpkg.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |

(`/admin` needs `unpkg.com` in `script-src`/`connect-src` because
`admin/index.html` loads Decap CMS from there, and the CMS itself talks to
`api.github.com`. Everything else is identical to Rule 2.)

### Rule 2 — "Security headers: site-wide"

**When incoming requests match:** `Hostname` `equals` `dietchennai.org` (or
your working hostname/domain expression — leave broad, Rule 1 above already
takes `/admin` out of scope by matching first)

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

After saving, verify with:
```
curl -sI https://dietchennai.org/ | grep -i "content-security-policy\|x-frame\|x-content-type\|referrer-policy\|permissions-policy\|strict-transport"
```
and confirm the homepage, the mega-menu, the language switch, and `/admin`
still all work — a too-strict CSP fails silently in the browser console, not
as a visible error, so check DevTools console after applying.

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
      ? "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://unpkg.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'"
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
