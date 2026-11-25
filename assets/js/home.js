/* Home page — live GitHub sidebar, clock, and typed bio.
   All network calls are best-effort: on failure the skeletons simply stay or
   are replaced with a dash, so the page never looks broken. */
(function () {
  "use strict";

  var root = document.querySelector(".layout");
  if (!root) return;
  var USER = root.dataset.githubUser;
  var TZ = root.dataset.timezone || "UTC";

  // ── GitHub language → brand color ─────────────────────────────────────────
  var LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
    HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Shell: "#89e051",
    Ruby: "#701516", Go: "#00ADD8", Java: "#b07219", C: "#555555",
    "C++": "#f34b7d", "C#": "#178600", PHP: "#4F5D95", Rust: "#dea584",
    Vue: "#41b883", Dart: "#00B4AB", Kotlin: "#A97BFF", Swift: "#F05138",
    "Jupyter Notebook": "#DA5B0B", Dockerfile: "#384d54", Makefile: "#427819"
  };
  var langColor = function (l) { return LANG_COLORS[l] || "#71717a"; };

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

    var totalYr = 0, done = 0;
    PKGS.forEach(function (pkg) {
      npm("https://api.npmjs.org/downloads/point/last-year/" + pkg)
        .then(function (d) {
          set('[data-np="' + pkg + '-dl"]', compact(d.downloads) + " ↓/yr");
          totalYr += d.downloads || 0;
        })
        .catch(function () {})
        .then(function () {
          if (++done === PKGS.length && totalYr) {
            set("#npm-total", compact(totalYr) + " downloads / yr");
          }
        });
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
        var max = days.reduce(function (m, d) { return Math.max(m, d.count); }, 0);
        var weeks = window.ContribCore.buildWeeks(days);
        box.innerHTML = weeks.map(function (week) {
          return '<div class="contrib-col">' + week.map(function (d) {
            if (!d) return '<span class="contrib-cell is-empty"></span>';
            var lvl = window.ContribCore.levelFor(d.count, max);
            return '<span class="contrib-cell level-' + lvl + '" title="' +
              d.count + " contributions on " + d.date + '"></span>';
          }).join("") + "</div>";
        }).join("");
      })
      .catch(function () { /* leave the card without a graph */ });
  })();

  if (!USER) return;

  var json = function (url) {
    return fetch(url, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); });
  };

  // ── Pinned fallback from the public repo list ─────────────────
  json("https://api.github.com/users/" + USER + "/repos?per_page=100&sort=pushed")
    .then(function (repos) { fillPinnedIfEmpty(repos || []); })
    .catch(function () { /* leave the pinned card as it is */ });

  function fillPinnedIfEmpty(repos) {
    var box = document.getElementById("gh-pinned");
    if (!box || box.children.length) return; // config already provided pinned
    var top = repos.filter(function (r) { return !r.fork; })
      .sort(function (a, b) { return (b.stargazers_count || 0) - (a.stargazers_count || 0); })
      .slice(0, 2);
    box.innerHTML = top.map(function (r) {
      return '<a class="pinned-repo" href="' + r.html_url + '" target="_blank" rel="noopener">' +
        '<div class="pinned-name">' + r.name + "</div>" +
        (r.description ? '<div class="pinned-desc">' + esc(r.description) + "</div>" : "") +
        '<div class="pinned-meta">' +
        (r.language ? '<span class="lang-dot" style="background:' + langColor(r.language) +
          '"></span><span>' + r.language + "</span>" : "") +
        "</div></a>";
    }).join("");
  }

  // ── Recent activity ───────────────────────────────────────────────────────
  json("https://api.github.com/users/" + USER + "/events/public?per_page=30")
    .then(function (events) {
      var box = document.getElementById("gh-activity");
      if (!box || !events) return;
      var lines = [];
      for (var i = 0; i < events.length && lines.length < 3; i++) {
        var e = events[i], d = describe(e);
        if (d) lines.push({ verb: d.verb, name: d.name, repo: e.repo.name, when: e.created_at });
      }
      if (!lines.length) return;
      box.innerHTML = lines.map(function (l) {
        return '<a class="activity-item" href="https://github.com/' + l.repo + '" target="_blank" rel="noopener">' +
          '<span class="activity-verb">' + esc(l.verb) + "</span>" +
          '<span class="activity-time">' + ago(l.when) + "</span>" +
          '<span class="activity-repo">' + esc(l.name) + "</span></a>";
      }).join("");
    })
    .catch(function () { /* leave skeleton */ });

  function describe(e) {
    var name = e.repo.name.split("/")[1] || e.repo.name;
    var verb;
    switch (e.type) {
      case "PushEvent": verb = "pushed"; break;
      case "CreateEvent": verb = "created"; break;
      case "WatchEvent": verb = "starred"; break;
      case "ForkEvent": verb = "forked"; break;
      case "PullRequestEvent": verb = (e.payload.action || "updated") + " PR"; break;
      case "IssuesEvent": verb = (e.payload.action || "updated") + " issue"; break;
      case "ReleaseEvent": verb = "released"; break;
      default: return null;
    }
    return { verb: verb, name: name };
  }

  function ago(iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 3600) return Math.max(1, Math.floor(s / 60)) + "m";
    if (s < 86400) return Math.floor(s / 3600) + "h";
    return Math.floor(s / 86400) + "d";
  }

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
})();
