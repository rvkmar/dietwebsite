// Eleventy config for the dietchennai.org rebuild (Phase 2 of the
// August 2026 technical audit's roadmap). See docs/eleventy-plan.md
// for the migration plan this scaffold is the first step of.
//
// Input lives in src/ (templates, layouts, and migrated content).
// Output builds to _site/ (gitignored) during development so this
// branch never overwrites the live flat-HTML site while the
// migration is in progress. Phase 2.6 decides how _site/ actually
// gets published once the migration is complete.

module.exports = function (eleventyConfig) {
  // Static assets continue to live where they already do; just copy
  // them straight through so paths don't change for anything not
  // yet migrated.
  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
