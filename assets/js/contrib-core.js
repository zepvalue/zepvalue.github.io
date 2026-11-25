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

  // Month labels for the graph header: one entry for each column that holds
  // the 1st of a month. The first column also gets its month when there are
  // at least 3 columns before the next label, so the labels never overlap.
  // Returns [{ col, label }].
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var monthOf = function (d) { return MONTHS[Number(d.date.slice(5, 7)) - 1]; };
  function monthLabels(weeks) {
    var out = [];
    weeks.forEach(function (week, col) {
      week.forEach(function (d) {
        if (d && d.date.slice(8) === "01") out.push({ col: col, label: monthOf(d) });
      });
    });
    var room = out.length ? out[0].col : weeks.length;
    if (room >= 3) {
      var first = weeks[0].filter(Boolean)[0];
      out.unshift({ col: 0, label: monthOf(first) });
    }
    return out;
  }

  // The days in the last n week columns. The first kept day is a Sunday, so
  // buildWeeks gives exactly n columns. days must be ascending.
  function lastWeeks(days, n) {
    if (!days.length) return days;
    var last = new Date(days[days.length - 1].date + "T00:00:00Z");
    last.setUTCDate(last.getUTCDate() - last.getUTCDay() - 7 * (n - 1));
    var start = last.toISOString().slice(0, 10);
    return days.filter(function (d) { return d.date >= start; });
  }

  // Sum of every day's commits, for the "N contributions in the last year" line.
  function totalCount(days) {
    return days.reduce(function (s, d) { return s + d.count; }, 0);
  }

  var api = {
    levelFor: levelFor, buildWeeks: buildWeeks, monthLabels: monthLabels,
    totalCount: totalCount, lastWeeks: lastWeeks
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ContribCore = api;
})(typeof window !== "undefined" ? window : globalThis);
