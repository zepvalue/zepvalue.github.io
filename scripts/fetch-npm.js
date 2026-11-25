// Writes all-time npm download totals to assets/data/npm.json.
// Run by .github/workflows/contributions.yml (daily). No token needed.
// npm's range API returns at most 18 months per request and has no data
// before 2015-01-10, so the full history is summed in chunks.
const fs = require("node:fs");
const path = require("node:path");

const PKGS = ["firecomm", "two-auth"];
const NPM_FIRST_DAY = "2015-01-10";
const MAX_DAYS = 540; // under npm's 18-month limit

const day = (d) => d.toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return day(d);
};

// [[start, end], ...] covering start..end (inclusive) in spans of maxDays days,
// back to back, never before npm's first day of data.
function chunkRanges(start, end, maxDays) {
  let from = start < NPM_FIRST_DAY ? NPM_FIRST_DAY : start;
  const out = [];
  while (from <= end) {
    const last = addDays(from, maxDays - 1);
    const to = last < end ? last : end;
    out.push([from, to]);
    from = addDays(to, 1);
  }
  return out;
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.json();
}

async function allTime(pkg, today) {
  const meta = await getJson(`https://registry.npmjs.org/${pkg}`);
  const created = meta.time && meta.time.created;
  if (!created) throw new Error(`${pkg}: no creation date`);
  let sum = 0;
  for (const [s, e] of chunkRanges(created.slice(0, 10), today, MAX_DAYS)) {
    const r = await getJson(`https://api.npmjs.org/downloads/range/${s}:${e}/${pkg}`);
    sum += (r.downloads || []).reduce((n, d) => n + d.downloads, 0);
  }
  return sum;
}

async function main() {
  const today = day(new Date());
  const packages = {};
  for (const pkg of PKGS) packages[pkg] = await allTime(pkg, today);
  const total = Object.values(packages).reduce((a, b) => a + b, 0);
  if (!total) throw new Error("total is 0, not writing");

  const out = path.join(__dirname, "..", "assets", "data", "npm.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ updated: new Date().toISOString(), total, packages }) + "\n");
  console.log(`wrote total ${total} (${JSON.stringify(packages)}) to ${out}`);
}

module.exports = { chunkRanges };

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
