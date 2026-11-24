// Tests for the pure helpers behind the /apps/ panel deck.
// Run: node --test tests/panels-core.test.js   (or: make test)
const test = require("node:test");
const assert = require("node:assert/strict");
const { parseHash, nearestIndex, neighbor, namedPanel } = require("../assets/js/panels-core.js");

const panels = ["products", "open-source", "backend", "web"];
const projects = { ubqart: 0, "zippy-fit": 0, firecomm: 1, sharad: 3 };

test("parseHash: empty hash goes to the first panel, no sheet", () => {
  assert.deepEqual(parseHash("", panels, projects), { panel: 0, project: null });
  assert.deepEqual(parseHash("#", panels, projects), { panel: 0, project: null });
});

test("parseHash: panel id selects that panel", () => {
  assert.deepEqual(parseHash("#backend", panels, projects), { panel: 2, project: null });
});

test("parseHash: project id selects its panel and opens its sheet", () => {
  assert.deepEqual(parseHash("#firecomm", panels, projects), { panel: 1, project: "firecomm" });
});

test("parseHash: unknown id falls back to the first panel", () => {
  assert.deepEqual(parseHash("#nope", panels, projects), { panel: 0, project: null });
});

test("parseHash: decodes percent-encoded ids", () => {
  assert.deepEqual(parseHash("#zippy%2Dfit", panels, projects), { panel: 0, project: "zippy-fit" });
});

test("namedPanel: index only when the hash names a panel", () => {
  assert.equal(namedPanel("#backend", panels), 2);
  assert.equal(namedPanel("#products", panels), 0);
  assert.equal(namedPanel("", panels), -1);
  assert.equal(namedPanel("#firecomm", panels), -1);
  assert.equal(namedPanel("#nope", panels), -1);
});

test("nearestIndex: picks the panel whose offset is closest", () => {
  const offsets = [0, 400, 800, 1200];
  assert.equal(nearestIndex(0, offsets), 0);
  assert.equal(nearestIndex(190, offsets), 0);
  assert.equal(nearestIndex(210, offsets), 1);
  assert.equal(nearestIndex(5000, offsets), 3);
});

test("nearestIndex: empty list gives 0", () => {
  assert.equal(nearestIndex(100, []), 0);
});

test("neighbor: steps inside the list and stops at the ends", () => {
  const ids = ["a", "b", "c"];
  assert.equal(neighbor(ids, "b", 1), "c");
  assert.equal(neighbor(ids, "b", -1), "a");
  assert.equal(neighbor(ids, "c", 1), null);
  assert.equal(neighbor(ids, "a", -1), null);
  assert.equal(neighbor(ids, "x", 1), null);
});
