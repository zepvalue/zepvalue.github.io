// Writes the last year of GitHub contributions to assets/data/contributions.json.
// Run by .github/workflows/contributions.yml. Needs GITHUB_TOKEN and GITHUB_USER.
// Uses only Node's built-in fetch, so there are no npm dependencies.
const fs = require("node:fs");
const path = require("node:path");

const token = process.env.GITHUB_TOKEN;
const user = process.env.GITHUB_USER;
if (!token || !user) {
  console.error("GITHUB_TOKEN and GITHUB_USER must be set");
  process.exit(1);
}

const QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

async function main() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login: user } })
  });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

  const body = await res.json();
  if (body.errors || !body.data || !body.data.user) {
    throw new Error(`GitHub API error: ${JSON.stringify(body.errors || "no user")}`);
  }

  const weeks = body.data.user.contributionsCollection.contributionCalendar.weeks;
  const days = weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
  );
  if (days.length < 300) throw new Error(`only ${days.length} days returned, not writing`);

  const out = path.join(__dirname, "..", "assets", "data", "contributions.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ updated: new Date().toISOString(), days }) + "\n");
  console.log(`wrote ${days.length} days to ${out}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
