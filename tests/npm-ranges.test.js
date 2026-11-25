// Tests for the date chunking behind the all-time npm download total.
// Run: node --test tests/npm-ranges.test.js   (or: make test)
const test = require("node:test");
const assert = require("node:assert/strict");
const { chunkRanges } = require("../scripts/fetch-npm.js");

test("chunkRanges: one range when the span fits in maxDays", () => {
  assert.deepEqual(chunkRanges("2026-01-01", "2026-03-01", 540), [["2026-01-01", "2026-03-01"]]);
});

test("chunkRanges: splits a long span into back-to-back ranges with no gap or overlap", () => {
  const r = chunkRanges("2020-01-01", "2022-12-31", 365);
  assert.deepEqual(r[0], ["2020-01-01", "2020-12-30"]);
  assert.deepEqual(r[1], ["2020-12-31", "2021-12-30"]);
  assert.equal(r[r.length - 1][1], "2022-12-31");
  for (let i = 1; i < r.length; i++) {
    const prevEnd = new Date(r[i - 1][1] + "T00:00:00Z");
    prevEnd.setUTCDate(prevEnd.getUTCDate() + 1);
    assert.equal(prevEnd.toISOString().slice(0, 10), r[i][0]);
  }
});

test("chunkRanges: never starts before npm's first day of data (2015-01-10)", () => {
  const r = chunkRanges("2014-06-01", "2015-02-01", 540);
  assert.deepEqual(r, [["2015-01-10", "2015-02-01"]]);
});
