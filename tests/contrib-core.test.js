// Tests for the pure helpers behind the home contribution graph.
// Run: node --test tests/contrib-core.test.js   (or: make test)
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildWeeks, levelFor, monthLabels, totalCount, lastWeeks } = require("../assets/js/contrib-core.js");

// Consecutive days from start (YYYY-MM-DD), n of them, all with count 1.
function range(start, n) {
  const out = [];
  const d = new Date(start + "T00:00:00Z");
  for (let i = 0; i < n; i++) {
    out.push({ date: d.toISOString().slice(0, 10), count: 1 });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

test("levelFor: zero commits is level 0", () => {
  assert.equal(levelFor(0, 10), 0);
});

test("levelFor: scales non-zero counts to levels 1-4 against the max", () => {
  assert.equal(levelFor(1, 100), 1);
  assert.equal(levelFor(50, 100), 2);
  assert.equal(levelFor(75, 100), 3);
  assert.equal(levelFor(100, 100), 4);
});

test("levelFor: max of 0 never divides by zero", () => {
  assert.equal(levelFor(0, 0), 0);
});

test("buildWeeks: groups days into Sunday-first columns of 7", () => {
  // 2026-11-22 is a Sunday.
  const days = [
    { date: "2026-11-22", count: 1 },
    { date: "2026-11-23", count: 0 },
    { date: "2026-11-24", count: 4 }
  ];
  const weeks = buildWeeks(days);
  assert.equal(weeks.length, 1);
  assert.equal(weeks[0].length, 7);
  assert.equal(weeks[0][0].date, "2026-11-22");
  assert.equal(weeks[0][2].date, "2026-11-24");
});

test("buildWeeks: pads the first week before the first day with null", () => {
  // 2026-11-25 is a Wednesday, so Sun-Tue of that week are empty.
  const weeks = buildWeeks([{ date: "2026-11-25", count: 2 }]);
  assert.equal(weeks[0][0], null);
  assert.equal(weeks[0][2], null);
  assert.equal(weeks[0][3].date, "2026-11-25");
});

test("buildWeeks: crosses into a new column each Sunday", () => {
  const days = [
    { date: "2026-11-28", count: 1 }, // Saturday, last cell of week 1
    { date: "2026-11-29", count: 1 }  // Sunday, first cell of week 2
  ];
  const weeks = buildWeeks(days);
  assert.equal(weeks.length, 2);
  assert.equal(weeks[1][0].date, "2026-11-29");
});

test("buildWeeks: empty input gives no weeks", () => {
  assert.deepEqual(buildWeeks([]), []);
});

test("monthLabels: labels the column that holds the 1st of a month", () => {
  // 2026-11-01 is a Sunday, so it starts column 1 (column 0 is 10-25 to 10-31).
  const days = [];
  for (let d = 25; d <= 31; d++) days.push({ date: `2026-10-${d}`, count: 0 });
  for (let d = 1; d <= 7; d++) days.push({ date: `2026-11-0${d}`, count: 0 });
  assert.deepEqual(monthLabels(buildWeeks(days)), [{ col: 1, label: "Nov" }]);
});

test("monthLabels: no label when the 1st is not in range", () => {
  const days = [{ date: "2026-11-22", count: 0 }, { date: "2026-11-23", count: 0 }];
  assert.deepEqual(monthLabels(buildWeeks(days)), []);
});

test("lastWeeks: keeps exactly n week columns, starting on a Sunday", () => {
  // 2025-11-23 to 2026-11-25 (Wednesday), like the real data.
  const days = range("2025-11-23", 368);
  const kept = lastWeeks(days, 21);
  assert.equal(kept[0].date, "2026-07-05"); // Sunday, 20 weeks before Sun 2026-11-22
  assert.equal(kept[kept.length - 1].date, "2026-11-25");
  assert.equal(buildWeeks(kept).length, 21);
});

test("lastWeeks: returns everything when there are fewer than n weeks", () => {
  const days = range("2026-11-22", 4);
  assert.deepEqual(lastWeeks(days, 21), days);
});

test("monthLabels: labels the first column when the next label is far enough away", () => {
  // Starts Sun 2026-07-05; Aug 1 is in column 3, so column 0 gets "Jul".
  const labels = monthLabels(buildWeeks(range("2026-07-05", 35)));
  assert.deepEqual(labels[0], { col: 0, label: "Jul" });
  assert.deepEqual(labels[1], { col: 3, label: "Aug" });
});

test("monthLabels: skips the first column when the next label is too close", () => {
  // Starts Sun 2026-07-19; Aug 1 is in column 1, so "Jul" would overlap it.
  const labels = monthLabels(buildWeeks(range("2026-07-19", 21)));
  assert.deepEqual(labels, [{ col: 1, label: "Aug" }]);
});

test("totalCount: sums every day's commits", () => {
  const days = [{ date: "2026-11-22", count: 2 }, { date: "2026-11-23", count: 0 }, { date: "2026-11-24", count: 5 }];
  assert.equal(totalCount(days), 7);
});
