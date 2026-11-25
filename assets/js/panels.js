// /apps/ panel deck: prev/next arrows, URL hash sync, and the project sheet.
// Needs panels-core.js (window.PanelsCore). Without JS the page still works:
// panels stack and each item is a normal link.
(function () {
  var core = window.PanelsCore;
  var deck = document.querySelector("[data-deck]");
  var dialog = document.querySelector("[data-sheet-dialog]");
  if (!core || !deck || !dialog || typeof dialog.showModal !== "function") return;

  var track = deck.querySelector("[data-track]");
  var panels = Array.prototype.slice.call(deck.querySelectorAll("[data-panel]"));
  var bar = deck.querySelector("[data-bar]");
  var count = deck.querySelector("[data-count]");
  var tabsNav = deck.querySelector("[data-tabs]");
  var tabs = Array.prototype.slice.call(deck.querySelectorAll("[data-tab]"));
  var prevBtn = deck.querySelector("[data-prev]");
  var nextBtn = deck.querySelector("[data-next]");
  var body = dialog.querySelector("[data-sheet-body]");
  var sheetPrev = dialog.querySelector("[data-sheet-prev]");
  var sheetNext = dialog.querySelector("[data-sheet-next]");
  var sheetClose = dialog.querySelector("[data-sheet-close]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var panelIds = panels.map(function (p) { return p.id; });
  var projectPanels = {};                              // projectId -> panel index
  var panelProjects = panels.map(function () { return []; }); // panel index -> [projectId]
  panels.forEach(function (panel, i) {
    panel.querySelectorAll("[data-sheet]").forEach(function (a) {
      projectPanels[a.dataset.sheet] = i;
      panelProjects[i].push(a.dataset.sheet);
    });
  });

  var current = 0;
  var openId = null;
  var opener = null;

  deck.classList.add("is-ready");
  bar.hidden = false;

  // ── Deck ────────────────────────────────────────────────────────────────

  function offsets() {
    var first = panels[0].offsetLeft;
    return panels.map(function (p) { return p.offsetLeft - first; });
  }

  function update() {
    var offs = offsets();
    var left = track.scrollLeft;
    var maxLeft = track.scrollWidth - track.clientWidth;
    current = core.nearestIndex(left, offs);

    // Last panel that is fully visible (2–3 show at once on wide screens).
    var last = current;
    for (var i = current + 1; i < panels.length; i++) {
      if (offs[i] + panels[i].offsetWidth <= left + track.clientWidth + 2) last = i;
    }
    var range = last > current ? (current + 1) + "–" + (last + 1) : String(current + 1);
    count.textContent = range + " / " + panels.length;
    prevBtn.disabled = left <= 1;
    nextBtn.disabled = left >= maxLeft - 1;

    // Tabs: every visible panel is highlighted; the first one is "current".
    tabs.forEach(function (tab, i) {
      tab.classList.toggle("is-active", i >= current && i <= last);
      if (i === current) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });
    fitHeight(current, last);

    var active = tabs[current];
    if (active && tabsNav.scrollWidth > tabsNav.clientWidth) {
      // Keep the current tab in view inside the tab row (no page scroll).
      var l = active.offsetLeft - tabsNav.offsetLeft;
      if (l < tabsNav.scrollLeft || l + active.offsetWidth > tabsNav.scrollLeft + tabsNav.clientWidth) {
        tabsNav.scrollLeft = l - 8;
      }
    }
  }

  // Where the CSS sets --deck-fit: 1 (the home deck on phones), the deck is as
  // tall as the panel in view, so a short panel leaves no gap above the arrows.
  // Elsewhere the CSS height stays.
  function fitHeight(first, last) {
    var fit = getComputedStyle(deck).getPropertyValue("--deck-fit").trim() === "1";
    if (!fit) { track.style.height = ""; return; }
    var heights = panels.map(function (p) { return p.offsetHeight; });
    track.style.height = core.visibleHeight(heights, first, last) + "px";
  }

  function go(i, smooth) {
    i = Math.max(0, Math.min(panels.length - 1, i));
    track.scrollTo({ left: offsets()[i], behavior: smooth && !reduceMotion ? "smooth" : "auto" });
  }

  function setHash(id) {
    if (location.hash.slice(1) === id) return;
    history.replaceState(history.state, "", "#" + id);
  }

  var frame = 0;
  var settle = 0;
  track.addEventListener("scroll", function () {
    if (!frame) frame = requestAnimationFrame(function () { frame = 0; update(); });
    clearTimeout(settle);
    settle = setTimeout(function () { if (!dialog.open) setHash(panelIds[current]); }, 150);
  }, { passive: true });

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function (e) {
      e.preventDefault(); // the href is the no-JS fallback
      go(i, true);
      setHash(panelIds[i]);
    });
  });

  prevBtn.addEventListener("click", function () { go(current - 1, true); });
  nextBtn.addEventListener("click", function () { go(current + 1, true); });
  window.addEventListener("resize", update);

  document.addEventListener("keydown", function (e) {
    if (dialog.open || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var active = document.activeElement;
    if (active && active !== document.body && !deck.contains(active)) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1, true); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1, true); }
  });

  // ── Sheet ───────────────────────────────────────────────────────────────

  function openSheet(id, push) {
    var tpl = document.getElementById("sheet-" + id);
    if (!tpl) return;
    body.replaceChildren(tpl.content.cloneNode(true));
    body.scrollTop = 0;
    openId = id;

    var list = panelProjects[projectPanels[id]];
    sheetPrev.disabled = !core.neighbor(list, id, -1);
    sheetNext.disabled = !core.neighbor(list, id, 1);

    if (!dialog.open) {
      dialog.showModal();
      sheetClose.focus();
    } else if (document.activeElement && document.activeElement.disabled) {
      sheetClose.focus();
    }

    if (push) {
      var state = { sheet: id };
      if (history.state && history.state.sheet) history.replaceState(state, "", "#" + id);
      else history.pushState(state, "", "#" + id);
    }
  }

  function step(dir) {
    var next = core.neighbor(panelProjects[projectPanels[openId]], openId, dir);
    if (next) openSheet(next, true);
  }

  deck.addEventListener("click", function (e) {
    var link = e.target.closest("[data-sheet]");
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    opener = link;
    openSheet(link.dataset.sheet, true);
  });

  // Runs once per close. It is called directly by closeSheet() and, for Esc,
  // by the dialog's "close" event, so it does not depend on event timing.
  // fromHistory: the back button closed the sheet, so do not go back again.
  function onClosed(fromHistory) {
    if (openId === null) return;
    openId = null;
    if (!fromHistory) {
      if (history.state && history.state.sheet) {
        history.back(); // removes the sheet entry; popstate then sees no project
      } else if (core.parseHash(location.hash, panelIds, projectPanels).project) {
        setHash(panelIds[current]); // opened from a shared link: no entry to go back to
      }
    }
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  }

  function closeSheet(fromHistory) {
    if (dialog.open) dialog.close();
    onClosed(fromHistory);
  }

  sheetPrev.addEventListener("click", function () { step(-1); });
  sheetNext.addEventListener("click", function () { step(1); });
  sheetClose.addEventListener("click", function () { closeSheet(false); });

  // A click on the backdrop lands on the <dialog> itself (its content fills it).
  dialog.addEventListener("click", function (e) { if (e.target === dialog) closeSheet(false); });

  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  });

  dialog.addEventListener("close", function () { onClosed(false); }); // Esc

  // ── Hash ────────────────────────────────────────────────────────────────

  window.addEventListener("popstate", function () {
    var r = core.parseHash(location.hash, panelIds, projectPanels);
    if (r.project) {
      if (r.panel !== current) go(r.panel, false);
      openSheet(r.project, false);
    } else if (dialog.open) {
      closeSheet(true);
    } else {
      // An in-page link such as <a href="/#products"> lands here too.
      var named = core.namedPanel(location.hash, panelIds);
      if (named !== -1) go(named, true);
    }
  });

  var start = core.parseHash(location.hash, panelIds, projectPanels);
  go(start.panel, false);
  update();
  if (start.project) openSheet(start.project, false);
})();
