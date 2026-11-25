// Pure helpers for the home contribution graph. No DOM access, so Node can
// test them (tests/contrib-core.test.js). Loaded in the browser as window.ContribCore.
(function (root) {
  // Map a day's commit count to a level 0-4, scaled against the busiest day.
  function levelFor(count, max) {
    if (!count || !max) return 0;
    return Math.min(4, Math.ceil((count / max) * 4));
  }

  // days: [{ date: "YYYY-MM-DD", count }] in ascending order.
  // Returns columns of 7 cells, Sunday first. Cells before the first day
  // (and after the last) are null, so every column has 7 rows.
  function buildWeeks(days) {
    if (!days.length) return [];
    var weeks = [];
    var week = [];
    var first = new Date(days[0].date + "T00:00:00Z").getUTCDay();
    for (var i = 0; i < first; i++) week.push(null);
    days.forEach(function (d) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  }

  var api = { levelFor: levelFor, buildWeeks: buildWeeks };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ContribCore = api;
})(typeof window !== "undefined" ? window : globalThis);
