/* Full-page loading screen controller.
   Intentionally NOT deferred and loaded as the very first thing in
   <body> so it can show the loader immediately and catch the load
   events reliably. Exposes window.showPageLoader()/hidePageLoader()
   so js/language.js can reuse the same overlay for language switches
   instead of a body-opacity fade. */
(function () {
    var MIN_VISIBLE_MS = 650; /* comfortably covers the mobile menu's
        jQuery slideUp('slow') settle animation and the initial menu/
        language setup, so nothing shows through the loader */
    var htmlEl = document.documentElement;
    var loader = null;
    var shownAt = Date.now(); /* loader is visible by default from first paint */
    var hideTimer = null;

    function getLoader() {
        if (!loader) {
            loader = document.getElementById('page-loader');
        }
        return loader;
    }

    function showLoader() {
        var el = getLoader();
        if (!el) return;
        clearTimeout(hideTimer);
        shownAt = Date.now();
        htmlEl.classList.add('page-loader-active');
        el.classList.remove('page-loader-hidden');
    }

    function hideLoaderNow() {
        var el = getLoader();
        if (!el) return;
        el.classList.add('page-loader-hidden');
        htmlEl.classList.remove('page-loader-active');
    }

    function hideLoader() {
        var elapsed = Date.now() - shownAt;
        var wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideLoaderNow, wait);
    }

    /* Initial page load: hide once everything has actually loaded,
       but never let a slow asset hold the loader forever. */
    window.addEventListener('load', hideLoader);
    setTimeout(hideLoaderNow, 4000); /* hard safety fallback */

    window.showPageLoader = showLoader;
    window.hidePageLoader = hideLoader;
})();
