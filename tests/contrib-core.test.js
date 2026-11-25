// Tests for the pure helpers behind the home contribution graph.
// Run: node --test tests/contrib-core.test.js   (or: make test)
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildWeeks, levelFor } = require("../assets/js/contrib-core.js");

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
