# Architecture & style notes — dietchennai.org

This is the internal reference for how the site is built and deployed.
It exists so a future maintainer (including future-you) doesn't have to
reverse-engineer the August 2026 technical audit and the Phase 2
Eleventy migration from commit history.

## The short version

dietchennai.org is a static site built with [Eleventy](https://www.11ty.dev/)
from Nunjucks templates in `src/`, edited in production through
[Decap CMS](https://decapcms.org/) at `/admin`, built and deployed by
GitHub Actions to GitHub Pages, sitting behind Cloudflare. A second
GitHub Actions workflow mirrors the *built output* into a sibling repo
that serves the identical content at diet.ac.in.

## Why Eleventy (Phase 2, August 2026)

Before Phase 2, the site was ~47 hand-maintained static HTML files.
Every page carried its own copy of the `<head>`, header, footer, and
script tags, so a sitewide change (a new nav item, a swapped script,
the Cloudflare Analytics beacon) meant editing 47 files by hand and
inevitably missing a couple. Eleventy was chosen specifically to
eliminate that: one shared layout, one navigation, one script list.

Nothing about the *content* changed in the migration — every page was
verified against its original with a whitespace-normalized full-text
diff before being considered done, and every difference was either a
deliberate fix (documented in that page's commit) or an artifact of
the templating itself (e.g. `{{ last_updated }}` replacing a hardcoded
date).

## Directory structure

```
src/
  _layouts/base.njk       -- the only <html>...</html> wrapper on the site
  _includes/
    head-common.njk       -- <head> contents shared by every page
    header.njk              -- site header, nav, mega-menu
    footer.njk               -- site footer (templates {{ last_updated }})
    scripts.njk               -- every <script> tag every page needs,
                                  including the Cloudflare Analytics beacon
  <slug>/index.njk         -- one file per page (47 of them), front
                               matter + body content only
  index.njk                 -- homepage (permalink: /)
  404.njk                    -- 404 page

admin/config.yml            -- Decap CMS collections (see below)
.github/workflows/           -- build, deploy, mirror, minify, quality gate
eleventy.config.js           -- passthrough copy list + input/output dirs
```

`eleventy.config.js` passes through everything that isn't an Eleventy
template as-is: `css/`, `js/`, `images/`, `fonts/`, `languages/`,
`theme/`, `less/`, `scss/`, `admin/`, plus a handful of root files
(`CNAME`, `robots.txt`, `sitemap.xml`, `default.html`). Those
directories still contain some genuinely legacy standalone HTML
fragments (e.g. `assets/content/statistics/index.html`,
`images/icons/*.html`) that predate Eleventy and are fetched via JS
into a page rather than visited directly — they are not part of the
migration and are excluded from the HTML-validation and analytics
work described below.

## How a page is assembled

`base.njk` is the entire page skeleton:

```njk
<!DOCTYPE html>
<html lang="en">
<head>
{% include "head-common.njk" %}
{% if extraHead %}{{ extraHead | safe }}{% endif %}
</head>
<body>
{% include "header.njk" %}
{{ content | safe }}
{% include "footer.njk" %}
{% include "scripts.njk" %}
{% if extraScript %}{{ extraScript | safe }}{% endif %}
</body>
</html>
```

Every `src/<slug>/index.njk` file supplies front matter
(`title`, `description`, `last_updated`, `layout: base.njk`) and a
body — nothing else. `extraHead` / `extraScript` are escape hatches
for the rare page that needs its own `<style>` or `<script>` (e.g. a
page-specific carousel config) without duplicating the shared includes.
Most pages don't set them.

**Rule of thumb:** if something needs to change on more than one page,
it almost certainly belongs in `_includes/`, not in the individual
page files.

## Content model: two tracks

The site has two genuinely different kinds of "content," and they're
edited differently on purpose:

1. **Page shells** (the 47 `src/<slug>/index.njk` files) — layout,
   static prose, and structural HTML. Edited either by committing to
   the repo directly, or through Decap CMS's "All Website Pages"
   fallback collection (`admin/config.yml`), which is a raw
   `output_code_only: true` code editor over the `.njk` source. This
   is deliberately unstructured — it's an escape hatch for the office
   staff to fix a typo or update a paragraph without a PR, not a
   content-modeling layer.

2. **Structured, frequently-changing content** (announcements,
   circulars, downloads, banner images, gallery, staff listings,
   translations, site settings) — stored as JSON, edited through
   dedicated Decap CMS collections with real fields, and rendered at
   **runtime** by `js/cms-content.js`, which fetches the JSON and
   injects it into `data-cms-list="..."` / `data-cms-category="..."`
   placeholders already present in the page HTML. This is why adding a
   circular or a photo never touches an Eleventy template or triggers
   a rebuild — it's a client-side fetch against a JSON file the CMS
   already updated.

Downloads/Documents routing (e.g. the reports page filtering to just
report-category files) matches on the JSON's own `category` field,
not the page URL — confirmed independent of the `doc-reports` →
`reports` rename in Phase 2.

## Build & deploy pipeline

Three workflows, chained through `workflow_run` rather than three
independent triggers on `push`, so the mirror never gets ahead of what
was actually deployed:

```
push to main
   │
   ▼
deploy.yml            npm ci && npx eleventy → actions/deploy-pages
   │  (on success)
   ▼
sync-to-diet-ac-in.yml   checks out deploy.yml's exact head_sha,
                          rebuilds the same way, rsyncs _site/ into
                          the diet.ac.in repo (--delete, preserves
                          that repo's own CNAME)
```

`minify-assets.yml` runs on pushes that touch `css/`/`js/`, minifies
what changed, and auto-commits the result. Its commit message
deliberately does **not** carry `[skip ci]` — GitHub's `[skip ci]`
convention skips *every* push-triggered workflow on that push, not
just the one that made the commit, so tagging it would have silently
stopped `deploy.yml` (and therefore the mirror) from ever picking up
freshly minified assets. This bit us once; leave it alone.

`quality-checks.yml` runs on PRs into `main` and on every push to the
active development branch (currently `eleventy`) — see below.

GitHub Pages is configured to deploy from GitHub Actions
(`actions/deploy-pages`), not the older "deploy from branch" mode.
Nothing Eleventy generates is ever committed to the repo; `_site/`
only ever exists as a Pages deployment artifact.

## The two domains

- **dietchennai.org** — canonical. Decap CMS lives here at `/admin`
  and is the only place content is edited.
- **diet.ac.in** — a mirror. It receives the *built output* of
  dietchennai.org verbatim (same HTML/CSS/JS) via
  `sync-to-diet-ac-in.yml`. There is no CMS on this domain and none is
  planned — a Cloudflare redirect rule sends `/admin` on diet.ac.in
  back to dietchennai.org, so there's no dead admin UI for someone to
  stumble into on the mirror.

## Quality gate (`quality-checks.yml`)

Three independent jobs, each scoped to what it can verify reliably on
a legacy government site whose content predates this migration:

- **html-validate**, against the 47 real page templates (not the
  legacy passthrough fragments). Report-only — it writes findings to
  the job summary instead of failing the build, because the shared
  includes and per-page content currently carry several hundred
  pre-existing findings (deprecated attributes, missing ARIA
  landmarks, legacy IE conditional comments) that this migration
  preserved rather than introduced. Worth fixing eventually as a
  dedicated accessibility pass; not something to block every PR on
  today.
- **linkinator**, crawling the built site from the homepage and
  failing the job on any broken *internal* link. External links (gov.in
  sites, social platforms) are excluded via an explicit domain list —
  checking third-party sites from a CI runner is inherently flaky and
  a transient external failure shouldn't block an unrelated content
  change.
- **Lighthouse CI**, against the homepage and two representative inner
  pages, asserting performance/accessibility/best-practices/SEO at
  **warn** severity (`lighthouserc.json`). Non-blocking for now since
  these pages have never been budgeted before — tighten the thresholds
  once a few real CI runs establish an actual baseline.

## Known legacy debt (not yet addressed)

- ~600 html-validate findings in the shared includes and page bodies
  (see above) — a real accessibility/standards-compliance backlog,
  intentionally not bulk-fixed blind.
- No staging/preview deploy environment yet — changes are verified
  locally (Live Server against `_site/`) before merging to `main`.
- No professional VAPT (vulnerability assessment / penetration test)
  has been run against the live site; that's a procurement decision,
  not something this pipeline can do for you.
- The pre-Eleventy flat-HTML files at the repo root are still present
  as a fallback and haven't been removed yet — planned for after a
  full cutover verification across both domains once GitHub Pages is
  switched to the Actions deployment source and the `eleventy` branch
  is merged.

## Making a change

- **Fix a typo or a paragraph on an existing page:** edit the relevant
  `src/<slug>/index.njk` directly, or use the CMS's raw page editor at
  `/admin`.
- **Add a circular, download, gallery photo, or staff entry:** use the
  matching structured Decap CMS collection — don't touch a template.
- **Change something that appears on every page** (nav, footer,
  scripts, analytics): edit the relevant file in `src/_includes/`
  once, not each page.
- **Add a whole new page:** create `src/<new-slug>/index.njk` with
  `layout: base.njk` front matter, add it to `admin/config.yml`'s
  "All Website Pages" collection if it should be CMS-editable, and add
  a nav entry in `header.njk` if it should be discoverable.

Always verify locally (`npx eleventy`, then check the output against
Live Server or by serving `_site/`) before committing, and never push
to GitHub without being asked to.
