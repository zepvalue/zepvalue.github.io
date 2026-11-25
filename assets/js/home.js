/* Home page — live GitHub sidebar, clock, and typed bio.
   All network calls are best-effort: on failure the skeletons simply stay or
   are replaced with a dash, so the page never looks broken. */
(function () {
  "use strict";

  var root = document.querySelector(".layout");
  if (!root) return;
  var TZ = root.dataset.timezone || "UTC";

  // ── Typed bio ─────────────────────────────────────────────────────────────
  (function typeBio() {
    var el = document.getElementById("typed");
    var strings = document.getElementById("typed-strings");
    if (!el || !strings || typeof Typed === "undefined") {
      if (el && strings) el.textContent = strings.textContent.trim();
      return;
    }
    var count = strings.querySelectorAll("span").length;
    new Typed("#typed", {
      stringsElement: "#typed-strings",
      typeSpeed: 55, backSpeed: 25, backDelay: 2200,
      startDelay: 300, loop: count > 1, showCursor: false
    });
  })();

  // ── Live clock ────────────────────────────────────────────────────────────
  (function clock() {
    var el = document.getElementById("clock");
    if (!el) return;
    function offsetLabel(now) {
      try {
        var parts = new Intl.DateTimeFormat("en-US", {
          timeZone: TZ, timeZoneName: "shortOffset"
        }).formatToParts(now);
        var name = parts.find(function (p) { return p.type === "timeZoneName"; });
        return name ? name.value.replace("GMT", "UTC") : "UTC";
      } catch (e) { return "UTC"; }
    }
    function tick() {
      var now = new Date();
      var time;
      try {
        time = new Intl.DateTimeFormat("en-GB", {
          timeZone: TZ, hour: "2-digit", minute: "2-digit",
          second: "2-digit", hour12: false
        }).format(now);
      } catch (e) {
        time = now.toLocaleTimeString();
      }
      el.textContent = time + " · " + offsetLabel(now);
    }
    tick();
    setInterval(tick, 1000);
  })();

  // ── Published npm packages ────────────────────────────────────────────────
  (function npmPackages() {
    // Fills every match on the page: the npm card and the projects deck.
    if (!document.querySelector("[data-np]")) return;
    var PKGS = ["firecomm", "two-auth"];
    var set = function (sel, val) {
      if (val == null) return;
      document.querySelectorAll(sel).forEach(function (el) { el.textContent = val; });
    };
    var npm = function (url) {
      return fetch(url).then(function (r) { return r.ok ? r.json() : Promise.reject(); });
    };

    // The npm card shows one all-time total, written daily by the Action
    // (scripts/fetch-npm.js). Rounded down so it never overstates.
    fetch("/assets/data/npm.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        if (!d || !d.total) return;
        var t = d.total >= 1000 ? Math.floor(d.total / 100) / 10 + "k+" : String(d.total);
        set("#npm-total", t + " downloads");
      })
      .catch(function () { /* keep the static figure */ });

    // The deck shows each package's last-year figure.
    PKGS.forEach(function (pkg) {
      npm("https://api.npmjs.org/downloads/point/last-year/" + pkg)
        .then(function (d) {
          set('[data-np="' + pkg + '-dl"]', compact(d.downloads) + " ↓/yr");
        })
        .catch(function () {});
      npm("https://registry.npmjs.org/" + pkg + "/latest")
        .then(function (d) { set('[data-np="' + pkg + '-v"]', "v" + d.version); })
        .catch(function () {});
    });
  })();

  function compact(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return String(n);
  }

  // ── Contribution graph (static JSON written daily by the Action) ─────────
  (function contributionGraph() {
    var box = document.getElementById("gh-contrib");
    if (!box || !window.ContribCore) return;
    fetch("/assets/data/contributions.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        var days = (data && data.days) || [];
        if (!days.length) return;
        box.innerHTML = renderGraph(days);
      })
      .catch(function () { /* leave the card without a graph */ });
  })();

  // GitHub-style graph: month row, weekday labels, day grid, legend.
  // Shows the last 21 weeks so it fits the left column.
  var GRAPH_WEEKS = 21;
  function renderGraph(allDays) {
    var CC = window.ContribCore;
    var days = CC.lastWeeks(allDays, GRAPH_WEEKS);
    var max = days.reduce(function (m, d) { return Math.max(m, d.count); }, 0);
    var weeks = CC.buildWeeks(days);
    var cols = "repeat(" + weeks.length + ", minmax(0, 1fr))";

    var cells = [];
    weeks.forEach(function (week) {
      week.forEach(function (d) {
        if (!d) {
          cells.push('<span class="contrib-cell is-empty"></span>');
        } else {
          cells.push('<span class="contrib-cell level-' + CC.levelFor(d.count, max) +
            '" title="' + d.count + " contributions on " + d.date + '"></span>');
        }
      });
    });

    var months = CC.monthLabels(weeks).map(function (m) {
      return '<span style="grid-column:' + (m.col + 1) + '">' + m.label + "</span>";
    }).join("");
    var dayNames = ["", "Mon", "", "Wed", "", "Fri", ""].map(function (t) {
      return "<span>" + t + "</span>";
    }).join("");
    var legend = [0, 1, 2, 3, 4].map(function (l) {
      return '<span class="contrib-cell level-' + l + '"></span>';
    }).join("");

    return '<p class="contrib-total">' + CC.totalCount(days).toLocaleString("en-US") +
      " contributions in the last " + GRAPH_WEEKS + " weeks</p>" +
      '<div class="contrib-chart">' +
        '<div class="contrib-months" style="grid-template-columns:' + cols + '">' + months + "</div>" +
        '<div class="contrib-days">' + dayNames + "</div>" +
        '<div class="contrib-grid" style="grid-template-columns:' + cols + '">' + cells.join("") + "</div>" +
      "</div>" +
      '<div class="contrib-legend"><span>Less</span>' + legend + "<span>More</span></div>";
  }
})();
