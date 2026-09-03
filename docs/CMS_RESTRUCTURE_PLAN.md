# CMS restructuring plan — admin/config.yml

Written after auditing every page's actual source (not assumptions) so the plan matches what's really
there. This is a **plan only** — nothing here has been implemented yet.

## 1. What's actually in the 47 pages today

Grouping `src/*/index.njk` by real content shape, not by name:

| Group | Count | Pages | Current state |
|---|---|---|---|
| **Already fully data-driven** | 8 | announcements, circulars, downloads, doc-forms, doc-publications, reports, admin-staff, gallery | Page body is just a `data-cms-list`/`data-cms-grid` placeholder rendered at runtime by `cms-content.js`/`gallery-loader.js` from an existing structured JSON collection. Nothing to restructure here — these are the model to extend, not fix. |
| **Empty placeholder stubs** | 26 | activ-alumni, activ-archive, activ-calendar, activ-current, courses, coursetpd, departments, dept-ae, dept-etmd, dept-fiar, dept-pste, dept-tpd, disclaimer, feedback, help, important-links, media, principals-desk, rti, sitemap, tb-module, tb-textbook, terms-conditions, web-manager, website-policies, academic-faculty | Literally `<iframe src="/default.html">` behind a `<!-- TODO -->` comment — no real content exists yet. Nothing to "convert" here; the job is designing the schema these pages *will* use once content is added, so nobody free-types raw HTML into them later. |
| **Legacy HTML fragments loaded via iframe** | 4 | mission-vision, roles-functions, org-structure (partial), district-statistics | Real content, but it lives outside `src/` entirely, in standalone files (`assets/content/about_mission.html`, `about_roles.html`, `statistics/index.html`) loaded into the page through an `<iframe>`. Two of these (`about_mission`, `about_roles`) are already CMS-editable, but only as a second raw-HTML code box — `statistics/index.html` isn't in the CMS at all today. |
| **Simple static content, no iframe** | 3 | library, district_profile, org-structure (image half) | Short, genuinely simple: a paragraph or two, an image, maybe an embedded PDF or external link. Easy to model. |
| **Bespoke long-form pages** | 5 | about-diet-chennai (9 `<h2>` sections), about-diet (4+4 headings), contact-us (address/map/form), coursedeled (course detail + the modal-based apply flow we built this session), rti-diet-rules | Each has its own real shape and deserves its own tailored schema rather than a generic one. |
| **Already structured JSON collections** | — | site_settings, announcements, circulars, downloads, banner, gallery, academic_faculty, principal, admin_staff | Fine as-is; only the translations collection (below) needs work. |
| **Translations** | — | languages/en.json / ta.json | 83 keys × 2 languages, each hand-declared individually — ~600 of the file's 1,448 lines. |

The practical takeaway: **"structure all 47 pages" doesn't mean 47 bespoke schemas.** 8 pages need nothing.
26 need a schema designed now but have no content to migrate. Only 9 pages (the fragment + simple +
bespoke groups) have real existing content to actually move into structured fields.

## 2. Target architecture — three tiers, not one

Right now every non-data-driven page uses the same escape hatch: a single `widget: code,
output_code_only: true` field containing the entire page as an HTML blob. The restructure replaces
that with three tiers, matching the front-matter pattern the site already uses (`title`,
`description`, `last_updated` are already structured front matter — this extends that idea to real
content instead of stopping at metadata):

**Tier 1 — Structured data collections (JSON, extend the existing pattern).**
No template changes needed beyond what already exists. Add nothing new architecturally; just bring
`statistics/index.html`'s data into a JSON collection like `downloads`/`gallery` already are, so it's
CMS-editable instead of being the one fragment with no admin coverage at all.

**Tier 2 — Shared-pattern structured pages.**
For families of pages that share a content shape, define *one* Nunjucks partial and *one* CMS field
schema, reused across every page in the family, instead of one bespoke raw-HTML box per page:
- **Department pages** (dept-ae, dept-etmd, dept-fiar, dept-pste, dept-tpd, and `departments` as the
  index): all five are currently identical empty stubs. One shared schema — department name, HOD,
  faculty (list or link to the existing academic_faculty collection), activities (repeatable
  heading+body), downloads (link into the existing downloads collection filtered by department) —
  rendered by one shared partial. Five CMS entries of the same type instead of five raw-HTML boxes.
- **Simple info/policy pages** (disclaimer, terms-conditions, website-policies, help, feedback,
  important-links, web-manager, media, rti, tb-module, tb-textbook, sitemap, library,
  district_profile): intro paragraph (markdown), optional image, optional embedded-PDF/external-link
  field, and a repeatable "section" list (heading + rich-text body) covers essentially all of these.
- **Activities pages** (activ-alumni, activ-archive, activ-calendar, activ-current): if these will
  eventually hold event-style listings, model them like `announcements`/`circulars` (a JSON list
  collection) rather than free prose — worth confirming with you before building, since it depends on
  what content is actually meant to go here.

**Tier 3 — Bespoke structured pages.**
about-diet-chennai, about-diet, contact-us, coursedeled, rti-diet-rules, mission-vision,
roles-functions, org-structure, principals-desk. Each gets fields matching its real sections (e.g.
contact-us: address block, phone/email, map embed URL, feedback-form config; coursedeled: course
name, eligibility, duration, syllabus download, the apply-modal copy). The two iframe'd fragments
(mission-vision, roles-functions) get their content pulled out of `assets/content/*.html` and into
real front-matter fields on their own page, retiring the iframe pattern entirely — better for SEO and
accessibility too, not just CMS ergonomics.

Mechanically, "structured fields" for Tier 2/3 means extending each page's own Nunjucks front matter
with real content fields (the same place `title`/`description` already live) rather than introducing
a fourth content layer. The template then renders named fields (`{{ intro }}`, `{% for s in sections
%}`) instead of dumping one opaque `content | safe` blob. This is what Decap's `widget: markdown` /
`widget: list` / `widget: object` fields are for — Decap can write structured front matter to any
file, `.njk` included.

## 3. Translations: collapse ~600 lines to a real i18n structure

Decap CMS (the version already loaded, `^3.0.0`) supports a `keyvalue` widget and a top-level `i18n`
config block designed for exactly this EN/TA duplication. Two options, to decide during
implementation:
- **`keyvalue` widget**: one field, editors see a live key → value table instead of 166 individually
  declared `widget: text` blocks. Biggest line-count win, least template disruption.
- **Native Decap `i18n`**: editors see EN and TA side-by-side for each key in one editing view instead
  of two separate files. More editor-friendly, more setup (structured folder/file naming Decap
  expects).
Either collapses the 600-line block dramatically; recommend starting with `keyvalue` as the lower-risk
first step, since it doesn't require restructuring `languages/en.json`/`ta.json`'s file layout.

## 4. Keeping config.yml itself maintainable

At 1,448 lines today (and only growing as Tier 2/3 fields get added), a single flat file becomes the
next maintenance problem even after the content model improves. Decap doesn't support native
multi-file config, but the repo already has a precedent for assembling generated output from modular
sources (`minify-assets.yml` does this for CSS/JS). Same idea here: keep the *source* as small
per-domain YAML fragments under `admin/collections/*.yml` (e.g. `pages.yml`, `departments.yml`,
`translations.yml`, `structured-data.yml`), and add a small Node script + GitHub Actions step that
concatenates them into the actual `admin/config.yml` Decap loads — analogous to how minified JS/CSS
are generated today, not committed by hand.

## 5. Editorial workflow — optional, worth a light recommendation

You're the only editor today, so role separation isn't a priority. Still worth considering
`editorial_workflow: true` regardless of team size: it gives every save a draft → review → publish
step (with a preview) before it reaches `main`, rather than every save committing straight to
production. Low cost, cheap insurance, easy to turn on later — flagging it here rather than bundling
it into the core restructure, since it's a workflow change independent of the content-modeling work.

## 6. Suggested phasing

Given the real content distribution above, doing this roughly cheapest/highest-value first:

1. **Translations → `keyvalue`.** Self-contained, no template risk, biggest immediate file-size win.
2. **Config.yml modularization** (Section 4). Do this before adding more fields, not after — otherwise
   every subsequent phase adds more lines to the file we're about to split anyway.
3. **Tier 2 "Simple info/policy" schema + partial**, applied to the 13 stub pages that clearly fit it
   (disclaimer, terms-conditions, website-policies, help, feedback, important-links, web-manager,
   media, rti, tb-module, tb-textbook, sitemap) plus the 3 already-simple pages (library,
   district_profile, org-structure's image half). Sixteen pages move off raw-HTML editing in one
   pass, all using the same low-risk shared template.
4. **Tier 2 "Department" schema + shared partial**, applied to dept-ae/etmd/fiar/pste/tpd +
   `departments`. Six more pages, one more shared pattern.
5. **Retire the two iframe fragments** (mission-vision, roles-functions) into real structured
   front matter, plus bring `statistics/index.html` into a proper JSON collection.
6. **Tier 3 bespoke schemas**, one page at a time, hardest/most custom first or last — your call:
   about-diet-chennai, about-diet, contact-us, coursedeled, rti-diet-rules, principals-desk,
   org-structure (remainder).
7. **Activities family** (activ-alumni/archive/calendar/current) — pending the open question in
   Section 2 about what content actually belongs there.
8. **Editorial workflow toggle** (Section 5) — independent, can happen anytime.

Each phase gets the same treatment as everything else this session: build, verify against the local
`_site/` output (and ideally the Netlify preview), commit, then it's your call when to push.

## 7. Open questions before implementation starts

- **Activities pages**: free-form content, or a structured list like announcements/circulars? Depends
  on what's actually meant to go on activ-alumni/archive/calendar/current.
- **Department pages**: what fields do you actually want per department beyond name/HOD/activities —
  e.g. faculty photos, contact email, specific course links?
- **Translations approach**: `keyvalue` widget (simpler, faster) vs. native Decap `i18n` (nicer
  editing UX, more setup)?
- **Config.yml modularization**: confirm you're fine with a build step generating `admin/config.yml`
  from source fragments (mirrors the existing minify-assets.yml pattern) rather than one hand-edited
  file.
