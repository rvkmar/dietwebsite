/*
 * cms-content.js
 * Fetches JSON data files edited via the Decap CMS admin panel (/admin)
 * and renders them into page elements marked with data-cms-* attributes.
 *
 * Usage on a page:
 *   <ul data-cms-list="announcements"></ul>
 *   <ul data-cms-list="downloads" data-cms-category="forms" data-cms-limit="5"></ul>
 *   <ul data-cms-list="banner"></ul>
 *   <strong data-cms-field="last_updated">18-APR-2025</strong>
 */
(function () {
  var DATA_BASE = "/assets/content/data/";
  var cache = {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fetchJSON(name, cb) {
    if (cache[name]) { cb(cache[name]); return; }
    fetch(DATA_BASE + name + ".json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { cache[name] = data; cb(data); })
      .catch(function () { cb(null); });
  }

  function renderListItem(item) {
    var href = item.file || item.link || "#";
    var isDoc = !!item.file;
    var attrs = href === "#" ? "" :
      (isDoc ? ' target="_blank" title="Opens document in a new window"'
             : ' target="_blank" title="External link that opens in a new window"');
    var icon = isDoc ? ' <i class="fa fa-file-pdf-o"></i>' : "";
    return '<li><i class="fa fa-arrow-right" aria-hidden="true"></i>' +
      '<a href="' + esc(href) + '"' + attrs + '>' + esc(item.title) + icon + '</a></li>';
  }

  function fallback(el) {
    el.innerHTML = '<li><i class="fa fa-arrow-right" aria-hidden="true"></i>' +
      '<a href="#">To be updated</a></li>';
  }

  function renderList(el) {
    var source = el.getAttribute("data-cms-list");
    var category = el.getAttribute("data-cms-category");
    var limit = parseInt(el.getAttribute("data-cms-limit") || "0", 10);
    fetchJSON(source, function (data) {
      var list = data && data.items ? data.items : null;
      if (!list || !list.length) { fallback(el); return; }
      var items = list.slice();
      if (category) { items = items.filter(function (i) { return i.category === category; }); }
      items.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
      if (limit) { items = items.slice(0, limit); }
      if (!items.length) { fallback(el); return; }
      el.innerHTML = items.map(renderListItem).join("");
    });
  }

  function renderBanner(el) {
    fetchJSON("banner", function (data) {
      var list = data && data.items ? data.items : null;
      if (!list || !list.length) return;
      el.innerHTML = list.map(function (b) {
        return '<li><img src="' + esc(b.image) + '" alt="' + esc(b.alt || "") + '"></li>';
      }).join("");
      if (window.jQuery && jQuery(el).closest(".flexslider").length && jQuery.fn.flexslider) {
        try { jQuery(el).closest(".flexslider").flexslider(0); } catch (e) {}
      }
    });
  }

  function renderField(el) {
    var field = el.getAttribute("data-cms-field");
    fetchJSON("site-settings", function (data) {
      if (!data) return;
      if (field === "last_updated" && data.last_updated) {
        el.textContent = " " + data.last_updated;
      }
    });
  }

  function init() {
    var lists = document.querySelectorAll("[data-cms-list]");
    for (var i = 0; i < lists.length; i++) {
      var el = lists[i];
      if (el.getAttribute("data-cms-list") === "banner") { renderBanner(el); }
      else { renderList(el); }
    }
    var fields = document.querySelectorAll("[data-cms-field]");
    for (var j = 0; j < fields.length; j++) { renderField(fields[j]); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
