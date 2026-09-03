// Eleventy config for the dietchennai.org rebuild (Phase 2 of the
// August 2026 technical audit's roadmap).
//
// Input lives in src/ (templates, layouts, and migrated page content).
// Output builds to _site/ (gitignored). The GitHub Actions workflow in
// .github/workflows/deploy.yml builds this and publishes _site/ via
// actions/deploy-pages -- nothing here is committed to the repo.
//
// Only the 47 page files (see src/) are Eleventy templates. Everything
// else the site needs at runtime -- CSS, JS, images, fonts, the Decap
// CMS admin panel, the JSON data files cms-content.js fetches, and a
// handful of root-level files (CNAME, robots.txt, sitemap.xml,
// default.html for the 404 page's iframe) -- lives outside src/ and is
// passed straight through untouched, so the build output matches what
// "deploy from branch" used to serve except for the migrated pages.
//
// Deliberately NOT passed through: node_modules, package*.json,
// eleventy.config.js itself, src/ (Eleventy's own input), and git/CI
// metadata (.git*, .github) -- none of that is site content.

module.exports = function (eleventyConfig) {
  const passthroughDirs = [
    "admin", "assets", "css", "js", "fonts", "images", "languages",
    "theme", "less", "scss", "reports", "z_development",
  ];
  for (const dir of passthroughDirs) {
    eleventyConfig.addPassthroughCopy(dir);
  }

  const passthroughFiles = [
    "CNAME", "robots.txt", "sitemap.xml", "default.html",
    "index.html.minified",
  ];
  for (const file of passthroughFiles) {
    eleventyConfig.addPassthroughCopy(file);
  }

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
