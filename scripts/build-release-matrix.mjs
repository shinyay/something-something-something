import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const [changelogPath, releasesPath, outputPath] = process.argv.slice(2);

if (!changelogPath || !releasesPath || !outputPath) {
  console.error(
    "Usage: node scripts/build-release-matrix.mjs <changelog.md> <releases.json> <output.json>",
  );
  process.exit(1);
}

const targetVersions = [
  ...Array.from({ length: 14 }, (_, index) => `v1.0.${index + 13}`),
  "v1.1.0",
  "v1.1.1",
  "v1.1.2",
  "v1.1.3",
  "v1.1.4",
];
const categories = new Set(["Added", "Changed", "Fixed", "Removed"]);

function featureArea(text) {
  const value = text.toLowerCase();
  const rules = [
    [
      "Accessibility & input",
      /screen reader|voiceover|keyboard|\b(?:auto)?focus(?:ed|es|ing)?\b(?!\s+(?:on reporting|instructions)\b)|accessible|accessibility|high.contrast|\bime\b|composition|page up|page down|home\/end|shift\+tab|option\+enter/i,
    ],
    ["Sessions & orchestration", /\/compact\b.*\b(?:workspace|chat conversation)\b/],
    [
      "Automations",
      /automation|trigger|scheduled|schedule|cron|workflow run/,
    ],
    [
      "Models & account",
      /model|reasoning effort|copilot seat|sign.in|subscription|quota|usage gauge|byok|provider/,
    ],
    [
      "Extensibility",
      /mcp|skill|extension|custom agent|impeccable|plugin/,
    ],
    [
      "GitHub lifecycle",
      /pull request|\bpr\b|issue|my work|review|diff|commit|merge|check|label|milestone|branch/,
    ],
    [
      "Canvases, files & browser",
      /canvas|excel|artifact|browser|file|editor|preview|image|screenshot|clipboard|syntax highlighting/,
    ],
    [
      "Platforms & environments",
      /windows|macos|linux|wsl|remote|vs code|dock|taskbar|window|workspace|disk space/,
    ],
    [
      "Sessions & orchestration",
      /session|agent|chat|transcript|conversation|composer|autopilot|interactive|plan|side chat|grid|worktree/,
    ],
  ];

  return rules.find(([, pattern]) => pattern.test(value))?.[0] ?? "Experience & reliability";
}

function anchorFor(version) {
  return version.toLowerCase().replaceAll(".", "");
}

function parseItems(block) {
  const lines = block.split(/\r?\n/);
  const version = lines.shift().trim();
  let category = null;
  let currentItem = null;
  const items = [];
  const categoryCounts = new Map();

  function flush() {
    if (!currentItem || !category) return;
    const index = (categoryCounts.get(category) ?? 0) + 1;
    categoryCounts.set(category, index);
    items.push({
      id: `${version.replaceAll(".", "-")}-${category.toLowerCase()}-${String(index).padStart(3, "0")}`,
      category,
      featureArea: featureArea(currentItem),
      en: currentItem.trim(),
      ja: "",
    });
    currentItem = null;
  }

  for (const line of lines) {
    const heading = line.match(/^### (.+)$/);
    if (heading) {
      flush();
      category = categories.has(heading[1]) ? heading[1] : null;
      continue;
    }

    if (!category) continue;
    if (line.startsWith("- ")) {
      flush();
      currentItem = line.slice(2);
      continue;
    }

    if (currentItem && line.trim()) {
      currentItem += ` ${line.trim()}`;
    }
  }
  flush();
  return { version, items };
}

const changelog = await readFile(changelogPath, "utf8");
const releases = JSON.parse((await readFile(releasesPath, "utf8")).replace(/^\uFEFF/, ""));
const releaseByTag = new Map(releases.map((release) => [release.tag_name, release]));
const blocks = changelog.split(/^## (?=v)/m).slice(1);
const parsedByVersion = new Map(
  blocks
    .map(parseItems)
    .filter(({ version }) => targetVersions.includes(version))
    .map((entry) => [entry.version, entry]),
);

const missingVersions = targetVersions.filter((version) => !parsedByVersion.has(version));
if (missingVersions.length) {
  throw new Error(`Missing changelog versions: ${missingVersions.join(", ")}`);
}

const matrix = [...targetVersions]
  .reverse()
  .map((version) => {
    const release = releaseByTag.get(version);
    if (!release?.published_at) {
      throw new Error(`Missing published release date for ${version}`);
    }

    const sourceUrl = `https://github.com/github/app/blob/main/changelog.md#${anchorFor(version)}`;
    return {
      version,
      publishedAt: release.published_at,
      releaseUrl: release.html_url,
      sourceUrl,
      items: parsedByVersion.get(version).items.map((item) => ({
        ...item,
        version,
        publishedAt: release.published_at,
        sourceUrl,
      })),
    };
  });

const itemCount = matrix.reduce((sum, release) => sum + release.items.length, 0);
if (matrix.length !== 19 || itemCount !== 687) {
  throw new Error(`Expected 19 versions and 687 items; found ${matrix.length} and ${itemCount}`);
}
const categoryCounts = matrix
  .flatMap((release) => release.items)
  .reduce(
    (counts, item) => {
      counts[item.category] += 1;
      return counts;
    },
    { Added: 0, Changed: 0, Fixed: 0, Removed: 0 },
  );

const output = {
  generatedFrom: {
    changelog: "https://raw.githubusercontent.com/github/app/main/changelog.md",
    releases: "https://api.github.com/repos/github/app/releases",
  },
  baseline: "v1.0.12",
  latest: matrix[0].version,
  versionCount: matrix.length,
  itemCount,
  categoryCounts,
  releases: matrix,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${matrix.length} releases and ${itemCount} items to ${outputPath}`);
