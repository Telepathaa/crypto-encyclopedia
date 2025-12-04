(function () {
  "use strict";

  // Utility functions
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    initTOCToggle();
    initPrintButton();
    initSmoothScrolling();
    initActiveSectionHighlight();
    initThemeToggle();
    initStickyHeader();
    initSearch();
    console.log("Modern UI helpers loaded - web looks good now!");
  });

  /* ---------------------------
     1) Toggle TOC
     --------------------------- */
  function initTOCToggle() {
    let btn = $("#tocToggle");
    const toc = $("#toc") || $(".toc");
    if (!toc) return;

    if (!btn) {
      btn = document.createElement("button");
      btn.id = "tocToggle";
      btn.className = "btn";
      btn.textContent = "📖 TOC";
      btn.style.cssText = "background: linear-gradient(45deg, #007bff, #0056b3); color: white; margin: 5px;";
      const nav = $("nav");
      if (nav) nav.insertBefore(btn, nav.firstChild);
      else document.body.insertBefore(btn, document.body.firstChild);
    }

    const isHidden = toc.dataset.hidden === "true" || window.getComputedStyle(toc).display === "none";
    if (isHidden) toc.style.display = "none";

    btn.addEventListener("click", () => {
      const cur = window.getComputedStyle(toc).display;
      toc.style.display = cur === "none" ? "" : "none";
      toc.dataset.hidden = cur === "none" ? "false" : "true";
      btn.classList.toggle("active");
    });
  }

  /* ---------------------------
     2) Print Button
     --------------------------- */
  function initPrintButton() {
    let btn = $("#printBtn");
    if (!btn) {
      const nav = $("nav");
      if (!nav) return;
      btn = document.createElement("button");
      btn.id = "printBtn";
      btn.className = "btn";
      btn.textContent = "🖨️ Print";
      btn.style.cssText = "background: linear-gradient(45deg, #28a745, #1e7e34); color: white; margin: 5px;";
      nav.appendChild(btn);
    }

    btn.addEventListener("click", () => window.print());
  }

  /* ---------------------------
     3) Smooth Scrolling
     --------------------------- */
  function initSmoothScrolling() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href^='#']");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#!")) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    });
  }

  /* ---------------------------
     4) Active Section Highlight
     --------------------------- */
  function initActiveSectionHighlight() {
    const toc = $("#toc") || $(".toc");
    if (!toc) return;
    const links = $$("a[href^='#']", toc);
    if (!links.length) return;
    const ids = links.map((lnk) => lnk.getAttribute("href").slice(1)).filter(Boolean);
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const clearActive = () => links.forEach((l) => l.classList.remove("active"));
    const setActiveById = (id) => {
      clearActive();
      const match = links.find((l) => l.getAttribute("href") === `#${id}`);
      if (match) match.classList.add("active");
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActiveById(visible[0].target.id);
      },
      { root: null, rootMargin: "-50% 0px -50% 0px", threshold: 0.1 }
    );

    sections.forEach((s) => io.observe(s));
  }

  /* ---------------------------
     5) Theme Toggle
     --------------------------- */
  function initThemeToggle() {
    const key = "theme";
    const html = document.documentElement;
    const saved = localStorage.getItem(key);
    if (saved === "light") html.classList.add("light-mode");

    let btn = $("#themeToggle");
    if (!btn) {
      const nav = $("nav") || document.body;
      btn = document.createElement("button");
      btn.id = "themeToggle";
      btn.className = "btn";
      btn.textContent = saved === "light" ? "🌞 Light" : "🌙 Dark";
      btn.style.cssText = "background: linear-gradient(45deg, #6c757d, #495057); color: white; margin: 5px;";
      if (nav.tagName === "NAV") nav.appendChild(btn);
      else nav.insertBefore(btn, nav.firstChild);
    }

    const apply = (mode) => {
      html.classList.toggle("light-mode", mode === "light");
      localStorage.setItem(key, mode);
      btn.textContent = mode === "light" ? "🌞 Light" : "🌙 Dark";
    };

    if (saved) apply(saved);
    else apply("dark");

    btn.addEventListener("click", () => {
      const isLight = html.classList.contains("light-mode");
      apply(isLight ? "dark" : "light");
    });
  }

  /* ---------------------------
     6) Sticky Header
     --------------------------- */
  function initStickyHeader() {
    const header = $("header");
    if (!header) return;
    const stickyClass = "sticky";
    const onScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add(stickyClass);
        header.style.cssText = "position: fixed; top: 0; width: 100%; background: rgba(255,255,255,0.9); box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 1000;";
      } else {
        header.classList.remove(stickyClass);
        header.style.cssText = "";
      }
    };
    window.addEventListener("scroll", throttle(onScroll, 100), { passive: true });
    onScroll();
  }

  /* ---------------------------
     7) Search
     --------------------------- */
  function initSearch() {
    const toc = $("#toc") || $(".toc");
    if (!toc) return;
    let search = $("#pageSearch");
    if (!search) {
      search = document.createElement("input");
      search.id = "pageSearch";
      search.type = "search";
      search.placeholder = "Search TOC...";
      search.style.cssText = "width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;";
      toc.insertBefore(search, toc.firstChild);
    }

    const tocLinks = $$("a", toc);
    const perform = () => {
      const q = (search.value || "").trim().toLowerCase();
      tocLinks.forEach((l) => {
        l.style.display = (l.textContent || "").toLowerCase().includes(q) ? "" : "none";
      });
    };

    search.addEventListener("input", debounce(perform, 200));
  }

  /* ---------------------------
     Helpers
     --------------------------- */
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
})();
