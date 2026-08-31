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
  // In-flight fetch promises, keyed by source name. Several elements on a
  // single page can ask for the same source (e.g. the homepage's principal
  // photo, name, and designation all read "principal") before the first
  // request has resolved — without this, each one raced in and fired its
  // own duplicate network request. Sharing the in-flight promise here means
  // only the first caller actually fetches; everyone else awaits the same
  // promise and the result still gets cached for any later calls too.
  var inflight = {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fetchJSON(name, cb) {
    if (cache.hasOwnProperty(name)) { cb(cache[name]); return; }
    if (!inflight[name]) {
      inflight[name] = fetch(DATA_BASE + name + ".json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; })
        .then(function (data) {
          cache[name] = data;
          delete inflight[name];
          return data;
        });
    }
    inflight[name].then(cb);
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
        // data-i18n-image-en/ta let the existing js/language.js bilingual
        // toggle (updateImages()) swap this image on language switch, same
        // as the old hardcoded banner did.
        var taAttr = b.image_ta ? ' data-i18n-image-ta="' + esc(b.image_ta) + '"' : "";
        return '<li><img src="' + esc(b.image) + '" data-i18n-image-en="' + esc(b.image) + '"' +
          taAttr + ' alt="' + esc(b.alt || "") + '"></li>';
      }).join("");
      // The homepage's js/custom.js deliberately skips initializing this
      // particular flexslider on window.load (see the note there) so that
      // it only ever gets initialized once, here, on the real slides —
      // initializing it before this data arrived would apply
      // display:none to these slides (flexslider's default CSS state for
      // slides it has never activated) and leave the banner invisible.
      if (window.jQuery && jQuery.fn.flexslider) {
        var $slider = jQuery(el).closest(".flexslider");
        if ($slider.length && !$slider.data("flexslider")) {
          $slider.flexslider({
            animation: "slide",
            pausePlay: true,
            controlNav: false,
            start: function () { jQuery("body").removeClass("loading"); }
          });
        }
      }
    });
  }

  function staffCardHTML(m) {
    return '<div class="card"><div class="card-inner">' +
      '<div class="card-front">' +
      '<img src="' + esc(m.photo) + '" alt="' + esc((m.name || "Staff") + " Photo") + '">' +
      '<h3>' + esc(m.name) + '</h3>' +
      '<p>' + esc(m.designation) + '</p>' +
      '</div>' +
      '<div class="card-back">' +
      '<p><strong>Qualification:</strong> ' + esc(m.qualification) + '</p>' +
      '<p><strong>' + esc(m._expLabel) + ':</strong> ' + esc(m.experience) + '</p>' +
      '<p><strong>Email:</strong> ' + esc(m.email) + '</p>' +
      '<p><strong>Phone:</strong> ' + esc(m.phone) + '</p>' +
      '</div>' +
      '</div></div>';
  }

  function renderStaffGrid(el) {
    // Renders academic-faculty.json / admin-staff.json as the site's
    // existing flip-card markup (.card > .card-inner > .card-front/.card-back)
    // so the existing CSS/flip animation keeps working unchanged.
    var source = el.getAttribute("data-cms-grid");
    var expLabel = el.getAttribute("data-cms-exp-label") || "Experience";
    // Optional: prepend a single-record file (e.g. "principal") as the first
    // card, so that person only needs to be edited in ONE place (their own
    // dedicated collection) instead of also duplicating them in this list.
    var prependSource = el.getAttribute("data-cms-grid-prepend");

    fetchJSON(source, function (data) {
      var list = data && data.items ? data.items.slice() : [];
      function finish(prepended) {
        var all = prepended ? [prepended].concat(list) : list;
        if (!all.length) return;
        all.forEach(function (m) { m._expLabel = expLabel; });
        el.innerHTML = all.map(staffCardHTML).join("");
      }
      if (prependSource) {
        fetchJSON(prependSource, function (p) { finish(p || null); });
      } else {
        finish(null);
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

  function renderImage(el) {
    // <img data-cms-image="photo" data-cms-source="principal"> — sets src
    // from an arbitrary flat JSON data file (not a list). Used for a single
    // person/record whose photo appears on more than one page (e.g. the
    // Principal on the homepage and the Principal's Desk page) so it only
    // needs to be uploaded once.
    var key = el.getAttribute("data-cms-image");
    var source = el.getAttribute("data-cms-source") || "site-settings";
    fetchJSON(source, function (data) {
      if (data && data[key]) { el.src = data[key]; }
    });
  }

  function renderText(el) {
    // <h2 data-cms-text="name" data-cms-text-ta="name_ta" data-cms-source="principal">
    // Sets textContent from an arbitrary flat JSON data file (not a list) —
    // same idea as renderImage(), for text instead of an image src. If
    // data-cms-text-ta is also present, this additionally sets
    // data-i18n-text-en/ta attributes so js/language.js's updateText()
    // (mirroring its existing updateImages() banner-swap mechanism) can
    // swap this element's text when a visitor toggles the site language.
    var key = el.getAttribute("data-cms-text");
    var taKey = el.getAttribute("data-cms-text-ta");
    var source = el.getAttribute("data-cms-source") || "site-settings";
    fetchJSON(source, function (data) {
      if (!data || !data[key]) return;
      el.textContent = data[key];
      if (taKey) {
        el.setAttribute("data-i18n-text-en", data[key]);
        if (data[taKey]) { el.setAttribute("data-i18n-text-ta", data[taKey]); }
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
    var grids = document.querySelectorAll("[data-cms-grid]");
    for (var k = 0; k < grids.length; k++) { renderStaffGrid(grids[k]); }
    var images = document.querySelectorAll("[data-cms-image]");
    for (var m = 0; m < images.length; m++) { renderImage(images[m]); }
    var texts = document.querySelectorAll("[data-cms-text]");
    for (var n = 0; n < texts.length; n++) { renderText(texts[n]); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
