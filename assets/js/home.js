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

  if (!USER) return;

  var json = function (url) {
    return fetch(url, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); });
  };

  // ── Profile stats + languages + pinned fallback ───────────────────────────
  Promise.all([
    json("https://api.github.com/users/" + USER),
    json("https://api.github.com/users/" + USER + "/repos?per_page=100&sort=pushed")
  ]).then(function (res) {
    var user = res[0], repos = res[1] || [];
    var stars = repos.reduce(function (s, r) { return s + (r.stargazers_count || 0); }, 0);

    renderStats({
      Repos: user.public_repos,
      Stars: stars,
      Followers: user.followers,
      Following: user.following
    });

    renderLanguages(repos);
    fillPinnedIfEmpty(repos);
  }).catch(function () { /* leave dashes */ });

  function renderStats(map) {
    var grid = document.getElementById("gh-stats");
    if (!grid) return;
    var order = ["Repos", "Stars", "Followers", "Following"];
    grid.innerHTML = order.map(function (k) {
      var v = map[k] == null ? "—" : compact(map[k]);
      return '<div><div class="gh-stat-value">' + v +
        '</div><div class="gh-stat-label">' + k + "</div></div>";
    }).join("");
  }

  function compact(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return String(n);
  }

  function renderLanguages(repos) {
    var totals = {};
    repos.forEach(function (r) {
      if (r.language) totals[r.language] = (totals[r.language] || 0) + 1;
    });
    var entries = Object.keys(totals).map(function (k) {
      return { name: k, count: totals[k] };
    }).sort(function (a, b) { return b.count - a.count; });
    if (!entries.length) return;

    var sum = entries.reduce(function (s, e) { return s + e.count; }, 0);
    var top = entries.slice(0, 5);

    var bar = document.getElementById("gh-lang-bar");
    if (bar) {
      bar.innerHTML = top.map(function (e) {
        var pct = (e.count / sum * 100).toFixed(1);
        return '<span style="width:' + pct + "%;background:" + langColor(e.name) + '"></span>';
      }).join("");
    }
    var list = document.getElementById("gh-lang-list");
    if (list) {
      list.innerHTML = top.map(function (e) {
        var pct = Math.round(e.count / sum * 100);
        return '<span class="lang"><span class="dot" style="background:' +
          langColor(e.name) + '"></span>' + e.name +
          ' <span class="lang-percent">' + pct + "%</span></span>";
      }).join("");
    }
  }

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

  // ── Contribution graph ────────────────────────────────────────────────────
  json("https://github-contributions-api.jogruber.de/v4/" + USER + "?y=last")
    .then(function (data) {
      var days = (data && data.contributions) || [];
      if (!days.length) return;
      var graph = document.getElementById("gh-graph");
      if (!graph) return;

      // group consecutive days into week columns (7 per column)
      var weeks = [], week = [];
      // pad so the first column starts on the correct weekday
      var firstDow = new Date(days[0].date + "T00:00:00").getDay();
      for (var p = 0; p < firstDow; p++) week.push(null);
      days.forEach(function (d) {
        week.push(d);
        if (week.length === 7) { weeks.push(week); week = []; }
      });
      if (week.length) weeks.push(week);

      graph.innerHTML = weeks.map(function (w) {
        return '<div class="week">' + w.map(function (d) {
          if (!d) return '<div class="day" style="visibility:hidden"></div>';
          var lvl = d.level || 0;
          return '<div class="day' + (lvl ? " level-" + lvl : "") +
            '" title="' + d.count + " on " + d.date + '"></div>';
        }).join("") + "</div>";
      }).join("");
    })
    .catch(function () { /* leave skeleton */ });

  // ── Recent activity ───────────────────────────────────────────────────────
  json("https://api.github.com/users/" + USER + "/events/public?per_page=30")
    .then(function (events) {
      var box = document.getElementById("gh-activity");
      if (!box || !events) return;
      var lines = [];
      for (var i = 0; i < events.length && lines.length < 3; i++) {
        var e = events[i], txt = describe(e);
        if (txt) lines.push({ txt: txt, repo: e.repo.name, when: e.created_at });
      }
      if (!lines.length) return;
      box.innerHTML = lines.map(function (l) {
        return '<div class="activity-item">' +
          '<a href="https://github.com/' + l.repo + '" target="_blank" rel="noopener">' +
          esc(l.txt) + "</a>" +
          '<span class="activity-time">' + ago(l.when) + "</span></div>";
      }).join("");
    })
    .catch(function () { /* leave skeleton */ });

  function describe(e) {
    var repo = e.repo.name.split("/")[1] || e.repo.name;
    switch (e.type) {
      case "PushEvent": return "pushed to " + repo;
      case "CreateEvent": return "created " + repo;
      case "WatchEvent": return "starred " + repo;
      case "ForkEvent": return "forked " + repo;
      case "PullRequestEvent": return (e.payload.action || "updated") + " PR · " + repo;
      case "IssuesEvent": return (e.payload.action || "updated") + " issue · " + repo;
      case "ReleaseEvent": return "released " + repo;
      default: return null;
    }
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
