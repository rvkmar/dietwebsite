#!/usr/bin/env node
/*
 * Assembles admin/config.yml from smaller, maintainable source pieces instead
 * of one hand-edited 1,400+ line file:
 *
 *   admin/config.template.yml     -- everything above "collections:" (backend,
 *                                     site_url, media_folder, etc.), verbatim.
 *   admin/collections/*.yml       -- one fragment per collection, verbatim
 *                                     (comments and formatting preserved --
 *                                     this concatenates raw text, it does not
 *                                     round-trip through a YAML parser, so
 *                                     nothing here rewrites how a fragment
 *                                     looks).
 *   languages/en.json             -- source of truth for the "translations"
 *                                     collection's field list, which is
 *                                     GENERATED here rather than hand-
 *                                     maintained. Every key in en.json
 *                                     becomes one field declaration; adding a
 *                                     new translatable string to the site
 *                                     only means adding it to en.json (and
 *                                     ta.json) -- this file stays in sync
 *                                     automatically instead of needing a
 *                                     second, separately-maintained field
 *                                     list.
 *
 * Run this after editing anything under admin/collections/, admin/
 * config.template.yml, or languages/en.json's key list. CI
 * (.github/workflows/build-cms-config.yml) runs it automatically and commits
 * the result, the same pattern minify-assets.yml already uses for CSS/JS --
 * admin/config.yml itself is generated output, not meant to be hand-edited
 * directly once this is in place.
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE_PATH = path.join(ROOT, "admin", "config.template.yml");
const COLLECTIONS_DIR = path.join(ROOT, "admin", "collections");
const OUTPUT_PATH = path.join(ROOT, "admin", "config.yml");
const EN_JSON_PATH = path.join(ROOT, "languages", "en.json");
const TA_JSON_PATH = path.join(ROOT, "languages", "ta.json");

// Order matches the collection order in the original hand-written
// config.yml, which is also the order editors see in the CMS sidebar.
// "translations" isn't listed here -- it's generated, not read from a file.
const COLLECTION_FRAGMENTS = [
  "site_settings",
  "announcements",
  "circulars",
  "downloads",
  "banner",
  "gallery",
  "academic_faculty",
  "principal",
  "admin_staff",
  "simple_pages",
  "department",
  "course",
  "principals_desk",
  "org_structure",
  "contact_us",
  "about_diet_chennai",
  "about_diet",
  "rti_diet_rules",
];
const TRANSLATIONS_INSERT_AFTER = "admin_staff";
const FINAL_FRAGMENT = "pages"; // always last, after translations

function readFragment(name) {
  const p = path.join(COLLECTIONS_DIR, `${name}.yml`);
  const text = fs.readFileSync(p, "utf8");
  return text.endsWith("\n") ? text : text + "\n";
}

function yamlQuote(str) {
  // Double-quoted YAML scalar with the minimum escaping needed -- matches
  // the quoting style already used throughout the hand-written config.
  return '"' + String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

// A handful of translation keys are effectively vestigial -- superseded by
// a dedicated collection (Principal, Site Settings) that now controls what
// actually renders on the site, but kept in languages/en.json/ta.json so no
// key silently goes unmapped. These extra hints/comments used to be
// hand-written directly in admin/config.yml; since the field list itself is
// now generated, they're preserved here instead of being lost. Add an entry
// here (not to config.yml directly) if another field needs this kind of
// note in the future.
const FIELD_NOTES = {
  principalname: {
    en: "This value is NOT read anywhere on the site anymore \u2014 the Principal's name is now controlled entirely by the Principal collection, so it stays in sync across every page. Left here only so nothing in the translation file goes unmapped.",
    ta: "NOT read anywhere anymore \u2014 use the Principal collection's Name (Tamil) field instead.",
  },
  principaldesignation: {
    en: 'This value is NOT read anywhere on the site anymore \u2014 use the Principal collection\'s "Designation (full title...)" field instead.',
    ta: "NOT read anywhere anymore \u2014 use the Principal collection's Designation (full title, Tamil) field instead.",
  },
  dateupdated: {
    en: "This value is NOT what controls the footer's actual displayed date anymore \u2014 use the Site Settings collection for that. This key is effectively unused now; left here only so nothing in the translation file goes unmapped.",
    ta: "Not what controls the footer's actual date; see the note on the English side.",
  },
};

function generateTranslationsFragment() {
  const en = JSON.parse(fs.readFileSync(EN_JSON_PATH, "utf8"));
  const ta = JSON.parse(fs.readFileSync(TA_JSON_PATH, "utf8"));
  const enKeys = Object.keys(en);
  const taKeys = new Set(Object.keys(ta));

  const missingFromTa = enKeys.filter((k) => !taKeys.has(k));
  if (missingFromTa.length) {
    throw new Error(
      "languages/ta.json is missing key(s) present in en.json: " +
        missingFromTa.join(", ") +
        " -- add them to ta.json before regenerating admin/config.yml, " +
        "otherwise the CMS field list and the actual translation data " +
        "would silently disagree."
    );
  }

  const enFieldLines = enKeys
    .map((key) => {
      const note = FIELD_NOTES[key];
      const hintLine = note
        ? `\n              hint: "${note.en.replace(/"/g, '\\"')}"`
        : "";
      return `            - label: ${key}\n              name: ${key}\n              widget: text${hintLine}`;
    })
    .join("\n");

  const taFieldLines = enKeys
    .map((key) => {
      const hint = String(en[key]).replace(/'/g, "''");
      const note = FIELD_NOTES[key];
      const commentLine = note ? `\n              # ${note.ta}` : "";
      return (
        `            - label: ${key}\n              name: ${key}\n              widget: text\n` +
        `              hint: 'EN: ${hint}'${commentLine}`
      );
    })
    .join("\n");

  return (
    `  - name: "translations"\n` +
    `    label: "Site Translations"\n` +
    `    files:\n` +
    `      - name: "strings_en"\n` +
    `        label: "All Site Text (English)"\n` +
    `        file: "languages/en.json"\n` +
    `        description: "Every piece of translatable text on the site (nav labels, headings, button text, the Principal's name/designation, etc.) — ${enKeys.length} keys, all shown here. Edit the Tamil equivalent of each one in 'All Site Text (Tamil)' below; each field there shows the current English text as a hint so you can match them up. This field list is GENERATED from languages/en.json's actual keys by scripts/build-cms-config.js -- to add a new translatable string, add it to both languages/en.json and languages/ta.json, then regenerate admin/config.yml. Do not hand-edit this block."\n` +
    `        fields:\n${enFieldLines}\n` +
    `      - name: "strings_ta"\n` +
    `        label: "All Site Text (Tamil)"\n` +
    `        file: "languages/ta.json"\n` +
    `        description: "The Tamil translation for every key in 'All Site Text (English)' above. Field order matches exactly; each field's hint shows the current English text for that key so you can translate it without switching tabs. Keep every key present in both files — a key missing from this file will show blank when a visitor switches the site to Tamil. GENERATED, same as above -- do not hand-edit this block."\n` +
    `        fields:\n${taFieldLines}\n\n`
  );
}

function build() {
  const parts = [];

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  parts.push(template.endsWith("\n") ? template : template + "\n");
  parts.push("collections:\n");

  for (const name of COLLECTION_FRAGMENTS) {
    parts.push(readFragment(name));
    if (name === TRANSLATIONS_INSERT_AFTER) {
      parts.push(generateTranslationsFragment());
    }
  }
  parts.push(readFragment(FINAL_FRAGMENT));

  const output = parts.join("");

  // Fail loudly rather than writing something Decap can't parse.
  try {
    yaml.load(output);
  } catch (err) {
    throw new Error(
      "Generated admin/config.yml is not valid YAML -- not writing it. " +
        "Underlying error: " +
        err.message
    );
  }

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`Wrote ${OUTPUT_PATH} (${output.split("\n").length} lines)`);
}

build();
