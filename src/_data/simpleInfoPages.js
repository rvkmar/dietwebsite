// Breadcrumb + <h1>/data-i18n metadata for the "Simple info/policy" page
// family (CMS restructure plan, Tier 2), keyed by page.fileSlug.
//
// Deliberately kept OUT of each page's own front matter (rather than as
// page_i18n_key/page_label/breadcrumb_parent fields there) because Decap
// CMS's file-collection schema is authoritative for the whole front
// matter object on save -- any front-matter field not listed in
// admin/collections/simple_pages.yml would be silently dropped the first
// time an editor saved the page through the CMS. Keeping this structural,
// non-editorial data here means the CMS schema only has to list fields an
// editor should actually be touching (title, description, last_updated,
// intro, sections), with nothing load-bearing at risk of being stripped.
//
// src/_layouts/simple-info.njk looks this up via
// simpleInfoPages[page.fileSlug].
module.exports = {
  disclaimer: { i18nKey: "disclaimer", label: "Disclaimer" },
  "terms-conditions": { i18nKey: "termsconditions", label: "terms and conditions" },
  "website-policies": { i18nKey: "policies", label: "policies" },
  help: { i18nKey: "help", label: "Help" },
  feedback: { i18nKey: "feedback", label: "feedback" },
  "important-links": { i18nKey: "important_links", label: "Important links" },
  "web-manager": { i18nKey: "webmanager", label: "Web manager" },
  newsletters: { i18nKey: "newsletters", label: "newsletters" },
  rti: {
    i18nKey: "rti", label: "RTI",
    parent: { href: "#", i18n: "actsrules", label: "Acts and Rules" },
  },
  "tb-module": {
    i18nKey: "modules", label: "Modules",
    parent: { href: "#", i18n: "textbookmodules", label: "Textbooks and Modules" },
  },
  "tb-textbook": {
    i18nKey: "textbook", label: "Textbooks",
    parent: { href: "#", i18n: "textbookmodules", label: "Textbooks and Modules" },
  },
  sitemap: { i18nKey: "sitemap", label: "Sitemap" },
  library: {
    i18nKey: "library", label: "Library",
    parent: { href: "#", i18n: "departments", label: "Departments" },
  },
  "dept-pste": {
    i18nKey: "pste", label: "PSTE",
    parent: { href: "#", i18n: "departments", label: "Departments" },
  },
  "dept-tpd": {
    i18nKey: "tpd", label: "TPD",
    parent: { href: "#", i18n: "departments", label: "Departments" },
  },
  "dept-etmd": {
    i18nKey: "etmd", label: "ETMD",
    parent: { href: "#", i18n: "departments", label: "Departments" },
  },
  "dept-ae": {
    i18nKey: "ae", label: "AE",
    parent: { href: "#", i18n: "departments", label: "Departments" },
  },
  "dept-fiar": {
    i18nKey: "fiar", label: "FIAR",
    parent: { href: "#", i18n: "departments", label: "Departments" },
  },
  departments: { i18nKey: "departments", label: "Departments" },
  courses: { i18nKey: "courses", label: "Courses" },
  coursetpd: {
    i18nKey: "coursetpd", label: "TPD",
    parent: { href: "#", i18n: "courses", label: "Courses" },
  },
  "activ-calendar": {
    i18nKey: "calendar", label: "calendar",
    parent: { href: "#", i18n: "activities", label: "Activities" },
  },
  "activ-current": {
    i18nKey: "current_activities", label: "current activities",
    parent: { href: "#", i18n: "activities", label: "Activities" },
  },
  "activ-archive": {
    i18nKey: "activity_archive", label: "activities archive",
    parent: { href: "#", i18n: "activities", label: "Activities" },
  },
  "activ-alumni": {
    i18nKey: "alumni", label: "Alumni",
    parent: { href: "#", i18n: "activities", label: "Activities" },
  },
};
