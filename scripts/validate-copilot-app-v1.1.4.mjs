import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { loadLabs } from "./learning-content-v1.1.4.mjs";

const [canonicalChangelogPath, releasesApiPath] = process.argv.slice(2);
const errors = [];
const notes = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function normalizeNewlines(text) {
  return text.replaceAll("\r\n", "\n");
}

function versionTokens(text) {
  return [...new Set([...text.matchAll(/\bv\d+\.\d+\.\d+\b/g)].map((match) => match[0]))].sort();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

async function filesMatching(directory, pattern) {
  return (await readdir(directory))
    .filter((name) => pattern.test(name))
    .map((name) => join(directory, name));
}

function parseChangelog(changelog, targetVersions) {
  const categories = new Set(["Added", "Changed", "Fixed", "Removed"]);
  const parsed = new Map();
  for (const block of changelog.split(/^## (?=v)/m).slice(1)) {
    const lines = block.split(/\r?\n/);
    const version = lines.shift().trim();
    if (!targetVersions.includes(version)) continue;
    const items = [];
    let category = null;
    let current = null;
    const flush = () => {
      if (category && current) items.push({ category, en: current.trim() });
      current = null;
    };
    for (const line of lines) {
      const heading = line.match(/^### (.+)$/);
      if (heading) {
        flush();
        category = categories.has(heading[1]) ? heading[1] : null;
      } else if (category && line.startsWith("- ")) {
        flush();
        current = line.slice(2);
      } else if (category && current && line.trim()) {
        current += ` ${line.trim()}`;
      }
    }
    flush();
    parsed.set(version, items);
  }
  return parsed;
}

function rgb(hex) {
  const value = hex.slice(1);
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255);
}

function luminance(hex) {
  const weights = [0.2126, 0.7152, 0.0722];
  return rgb(hex)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce((sum, channel, index) => sum + channel * weights[index], 0);
}

function contrast(first, second) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const matrix = JSON.parse(
  await readFile("copilot-app-v1.1.4/assets/release-matrix.json", "utf8"),
);
const learning = await loadLabs();
const { labs: guides, byId: guideById, journeys, tracks } = learning;

check(matrix.versionCount === 19, "Release matrix versionCount is not 19");
check(matrix.itemCount === 687, "Release matrix itemCount is not 687");
check(matrix.releases.length === 19, "Release matrix does not contain 19 releases");
check(matrix.latest === "v1.1.4", "Release matrix latest version is not v1.1.4");
check(matrix.baseline === "v1.0.12", "Release matrix baseline is not v1.0.12");
const matrixItems = matrix.releases.flatMap((release) => release.items);
check(matrixItems.length === 687, `Release matrix has ${matrixItems.length} items instead of 687`);
check(new Set(matrixItems.map((item) => item.id)).size === 687, "Release matrix item ids are not unique");
check(matrixItems.every((item) => item.en.trim() && item.ja.trim()), "Release matrix has blank EN/JA text");
const accessibilityPattern =
  /screen reader|voiceover|keyboard|\b(?:auto)?focus(?:ed|es|ing)?\b(?!\s+(?:on reporting|instructions)\b)|accessible|accessibility|high.contrast|\bime\b|composition|page up|page down|home\/end|shift\+tab|option\+enter/i;
const featureAreaCounts = matrixItems.reduce((result, item) => {
  result[item.featureArea] = (result[item.featureArea] || 0) + 1;
  return result;
}, {});
const expectedFeatureAreaCounts = {
  "Accessibility & input": 95,
  Automations: 22,
  "Canvases, files & browser": 57,
  "Experience & reliability": 51,
  Extensibility: 30,
  "GitHub lifecycle": 239,
  "Models & account": 40,
  "Platforms & environments": 32,
  "Sessions & orchestration": 121,
};
const actualFeatureAreas = Object.keys(featureAreaCounts).sort();
const expectedFeatureAreas = Object.keys(expectedFeatureAreaCounts).sort();
check(
  JSON.stringify(actualFeatureAreas) === JSON.stringify(expectedFeatureAreas),
  `Feature area keys are ${actualFeatureAreas.join(", ")}, expected ${expectedFeatureAreas.join(", ")}`,
);
for (const [area, expected] of Object.entries(expectedFeatureAreaCounts)) {
  check(
    featureAreaCounts[area] === expected,
    `${area} count is ${featureAreaCounts[area]}, expected ${expected}`,
  );
}
const featureAreaTotal = Object.values(featureAreaCounts).reduce((sum, value) => sum + value, 0);
check(featureAreaTotal === 687, `Feature area counts sum to ${featureAreaTotal}, expected 687`);
check(
  matrixItems
    .filter((item) => item.featureArea === "Accessibility & input")
    .every((item) => accessibilityPattern.test(item.en)),
  "Accessibility facet contains an item without a bounded accessibility/input match",
);

const categoryCounts = matrixItems.reduce((result, item) => {
  result[item.category] = (result[item.category] || 0) + 1;
  return result;
}, {});
check(categoryCounts.Added === 88, `Added count is ${categoryCounts.Added}, expected 88`);
check(categoryCounts.Changed === 97, `Changed count is ${categoryCounts.Changed}, expected 97`);
check(categoryCounts.Fixed === 500, `Fixed count is ${categoryCounts.Fixed}, expected 500`);
check(categoryCounts.Removed === 2, `Removed count is ${categoryCounts.Removed}, expected 2`);
check(
  JSON.stringify(matrix.categoryCounts) === JSON.stringify(categoryCounts),
  "Stored categoryCounts do not match matrix items",
);
check(
  matrix.releases.every((release) =>
    release.items.every((item) => ["Added", "Changed", "Fixed", "Removed"].includes(item.category)),
  ),
  "Release matrix includes a highlight or unsupported category",
);
const release114 = matrix.releases.find((release) => release.version === "v1.1.4");
const release113 = matrix.releases.find((release) => release.version === "v1.1.3");
check(release114?.publishedAt === "2026-08-06T01:32:18Z", "v1.1.4 published date differs");
check(release113?.publishedAt === "2026-08-04T05:25:43Z", "v1.1.3 published date differs");
check(release114?.items.length === 86, "v1.1.4 does not contain 86 non-highlight items");
check(release113?.items.length === 139, "v1.1.3 does not contain 139 non-highlight items");
check(
  release113?.items.filter((item) => item.category === "Removed").length === 1,
  "v1.1.3 must contain exactly one formal Removed item",
);
check(
  release113?.items.filter(
    (item) => item.category === "Changed" && item.en.startsWith("Removed"),
  ).length === 2,
  "v1.1.3 must keep the two Removed-leading bullets in Changed",
);

if (canonicalChangelogPath && releasesApiPath) {
  const targetVersions = [
    ...Array.from({ length: 14 }, (_, index) => `v1.0.${index + 13}`),
    "v1.1.0",
    "v1.1.1",
    "v1.1.2",
    "v1.1.3",
    "v1.1.4",
  ];
  const parsed = parseChangelog(await readFile(canonicalChangelogPath, "utf8"), targetVersions);
  const releasesApi = JSON.parse(
    (await readFile(releasesApiPath, "utf8")).replace(/^\uFEFF/, ""),
  );
  check(releasesApi[0]?.tag_name === "v1.1.4", `Latest API tag is ${releasesApi[0]?.tag_name}`);
  for (const release of matrix.releases) {
    const canonicalItems = parsed.get(release.version);
    check(Boolean(canonicalItems), `Canonical changelog is missing ${release.version}`);
    if (canonicalItems) {
      check(
        canonicalItems.length === release.items.length,
        `${release.version} matrix count ${release.items.length} differs from canonical ${canonicalItems.length}`,
      );
      canonicalItems.forEach((item, index) => {
        const matrixItem = release.items[index];
        check(
          matrixItem?.category === item.category && matrixItem?.en === item.en,
          `${release.version} item ${index + 1} differs from canonical wording/category`,
        );
      });
    }
    const apiRelease = releasesApi.find((entry) => entry.tag_name === release.version);
    check(Boolean(apiRelease), `Releases API is missing ${release.version}`);
    check(
      apiRelease?.published_at === release.publishedAt,
      `${release.version} published date differs from Releases API`,
    );
  }
  notes.push("Canonical changelog wording and Releases API dates match the matrix");
} else {
  notes.push("Canonical source parity skipped because source file paths were not supplied");
}

const releaseHtml = await readFile("copilot-app-v1.1.4/releases.html", "utf8");
const renderedItems = [
  ...releaseHtml.matchAll(
    /<li class="release-item" id="([^"]+)"[^>]*data-release-item[\s\S]*?<\/li>/g,
  ),
];
check(renderedItems.length === 687, `Release explorer renders ${renderedItems.length} items`);
check(
  new Set(renderedItems.map((match) => match[1])).size === 687,
  "Release explorer item ids are not unique",
);
check(count(releaseHtml, /data-release-version(?=[ >])/g) === 19, "Release explorer version count is not 19");
for (const item of matrixItems) {
  const matches = renderedItems.filter((match) => match[1] === item.id);
  check(matches.length === 1, `Rendered release item ${item.id} appears ${matches.length} times`);
  if (matches[0]) {
    check(matches[0][0].includes(inlineMarkdown(item.en)), `${item.id} English wording differs`);
    check(matches[0][0].includes(inlineMarkdown(item.ja)), `${item.id} Japanese wording differs`);
    check(
      matches[0][0].includes(`data-category="${item.category}"`),
      `${item.id} category data differs`,
    );
    check(
      matches[0][0].includes(`data-feature="${escapeHtml(item.featureArea)}"`),
      `${item.id} feature area data differs`,
    );
    check(
      matches[0][0].includes(`<span class="badge">${escapeHtml(item.featureArea)}</span>`),
      `${item.id} does not render its feature tag`,
    );
  }
}
check(
  releaseHtml.includes("data-release-version-filter"),
  "Release explorer is missing the version filter",
);
for (const release of matrix.releases) {
  const versionId = release.version.replaceAll(".", "-");
  const start = releaseHtml.indexOf(`id="${versionId}" data-release-version`);
  check(start >= 0, `Release explorer is missing ${release.version}`);
  const end = releaseHtml.indexOf("</article>", start);
  const section = start >= 0 ? releaseHtml.slice(start, end) : "";
  for (const category of ["Added", "Changed", "Fixed", "Removed"]) {
    const expected = release.items.some((item) => item.category === category);
    check(
      section.includes(`data-category="${category}"`) === expected,
      `${release.version} ${category} section applicability is incorrect`,
    );
  }
}

function checkPair(value, context) {
  check(Boolean(value?.ja?.trim()), `${context} is missing Japanese`);
  check(Boolean(value?.en?.trim()), `${context} is missing English`);
}

check(journeys.length === 6, `Learning system has ${journeys.length} journeys instead of 6`);
check(tracks.length === 10, `Learning system has ${tracks.length} tracks instead of 10`);
check(guides.length === 25, `Learning content contains ${guides.length} labs instead of 25`);
check(guideById.size === 25, "Lab ids are not unique");
check(new Set(guides.map((guide) => guide.id)).size === 25, "Lab ids are not unique");

for (const dimension of [...journeys, ...tracks]) {
  checkPair(dimension.title, `${dimension.id} title`);
  checkPair(dimension.summary, `${dimension.id} summary`);
  check(dimension.labs.length > 0, `${dimension.id} has no labs`);
  check(
    new Set(dimension.labs).size === dimension.labs.length,
    `${dimension.id} repeats a lab`,
  );
  for (const labId of dimension.labs) {
    check(guideById.has(labId), `${dimension.id} references unknown lab ${labId}`);
  }
}

for (const guide of guides) {
  for (const [name, value] of [
    ["title", guide.title],
    ["summary", guide.summary],
    ["difficulty", guide.difficulty?.label],
    ["status", guide.status?.label],
    ["status detail", guide.status?.detail],
    ["version", guide.version],
    ["scenario", guide.scenario],
    ["scope", guide.scope],
    ["safety", guide.safety],
    ["persona", guide.persona],
    ["why it matters", guide.whyItMatters],
    ["under the hood", guide.underTheHood],
    ["recovery path", guide.recoveryPath],
    ["stretch exercise", guide.stretchExercise],
    ["provenance note", guide.provenance?.note],
    ["time estimate note", guide.timeNote],
  ]) {
    checkPair(value, `Lab ${guide.id} ${name}`);
  }
  check(["docs", "release-notes", "mixed"].includes(guide.provenance?.primary), `Lab ${guide.id} has invalid provenance`);
  check(guide.journeyIds.length > 0, `Lab ${guide.id} is not mapped to a journey`);
  check(guide.trackIds.length > 0, `Lab ${guide.id} is not mapped to a track`);
  check(guide.estimatedMinutes, `Lab ${guide.id} has no estimated time`);
  check(guide.objectives.length >= 3, `Lab ${guide.id} has fewer than three objectives`);
  check(guide.prerequisites.length >= 3, `Lab ${guide.id} has fewer than three prerequisites`);
  check(guide.commands.length >= 2, `Lab ${guide.id} has fewer than two commands/prompts`);
  check(
    guide.steps.length >= 5 && guide.steps.length <= 8,
    `Lab ${guide.id} does not have 5-8 steps`,
  );
  check(guide.decisionPoints.length >= 2, `Lab ${guide.id} has fewer than two decision points`);
  check(guide.checkpoints.length >= 2, `Lab ${guide.id} has fewer than two checkpoints`);
  check(guide.expected.length >= 3, `Lab ${guide.id} has fewer than three completion checks`);
  check(
    guide.troubleshooting.length >= 3,
    `Lab ${guide.id} has fewer than three troubleshooting entries`,
  );
  check(guide.cleanup.length >= 3, `Lab ${guide.id} has fewer than three cleanup entries`);
  check(guide.successRubric.length >= 3, `Lab ${guide.id} has fewer than three rubric checks`);
  check(guide.related.length >= 3, `Lab ${guide.id} has fewer than three related labs`);
  check(guide.sources.length >= 2, `Lab ${guide.id} has fewer than two sources`);
  const commandIds = new Set(guide.commands.map((command) => command.id));
  for (const step of guide.steps) {
    checkPair(step.title, `Lab ${guide.id} step title`);
    checkPair(step.expected, `Lab ${guide.id} step expected result`);
    step.body.forEach((paragraph) => checkPair(paragraph, `Lab ${guide.id} step paragraph`));
    for (const commandId of step.commandIds || []) {
      check(commandIds.has(commandId), `Lab ${guide.id} references unknown command ${commandId}`);
    }
  }
  for (const platform of ["windows", "macos", "linux", "wsl"]) {
    checkPair(guide.platforms[platform], `Lab ${guide.id} ${platform} note`);
  }
  for (const relatedId of guide.related) {
    check(guideById.has(relatedId), `Lab ${guide.id} has unknown related lab ${relatedId}`);
    check(relatedId !== guide.id, `Lab ${guide.id} relates to itself`);
  }
  for (const source of guide.sources) {
    const url = new URL(source.url);
    check(url.protocol === "https:", `Lab ${guide.id} source is not HTTPS`);
    check(
      url.hostname === "docs.github.com" || url.hostname === "github.com",
      `Lab ${guide.id} source is not an official GitHub domain: ${source.url}`,
    );
  }
  for (const launcher of guide.launchers || []) {
    const url = new URL(launcher.url);
    check(url.protocol === "https:", `Lab ${guide.id} official link is not HTTPS`);
    check(
      url.hostname === "github.com" || url.hostname === "docs.github.com",
      `Lab ${guide.id} official link is not on an official GitHub domain`,
    );
    if (url.pathname === "/copilot/app/launch") {
      const open = url.searchParams.get("open") || "";
      check(open.startsWith("ghapp://"), `Lab ${guide.id} launcher does not wrap ghapp://`);
      check(
        !/(?:api[_-]?key|access[_-]?token|password|secret)=/i.test(open),
        `Lab ${guide.id} launcher may contain a secret`,
      );
    }
  }
  for (const command of guide.commands) {
    check(
      !/(?:api[_-]?key|access[_-]?token|password|secret)\s*=\s*\S+/i.test(command.code),
      `Lab ${guide.id} command may contain a secret`,
    );
  }
}

for (const guide of guides.filter((item) => Number(item.id) <= 21)) {
  check(
    guide.version.en.startsWith("Republished for v1.1.4"),
    `Inherited lab ${guide.id} overstates its verification boundary`,
  );
}
for (const guide of guides.filter((item) => Number(item.id) >= 22)) {
  check(
    guide.version.en.startsWith("Verified for v1.1.4"),
    `New lab ${guide.id} is missing its v1.1.4 verification boundary`,
  );
}

const voiceLab = guideById.get("21");
check(
  voiceLab.commands.every((command) => !/^\/voice\b/.test(command.code)),
  "Lab 21 exposes a CLI-only /voice command as an App command",
);
const voiceProcedure = JSON.stringify(voiceLab.steps.find((step) =>
  step.title.en.includes("voice dictation"),
));
for (const unsupported of ["push-to-talk", "toggle mode", "microphone device", "Ctrl+X"]) {
  check(
    !voiceProcedure.includes(unsupported),
    `Lab 21 voice procedure contains unsupported App detail ${unsupported}`,
  );
}
check(
  guideById.get("15").provenance.primary === "docs",
  "Lab 15 does not mark security review and rubber duck as docs-grounded",
);
check(
  guideById.get("19").steps.some(
    (step) =>
      step.body.some((paragraph) => paragraph.en.includes("Settings > Sessions")) &&
      step.body.some((paragraph) => paragraph.en.includes("Settings > Skills")),
  ),
  "Lab 19 does not operationalize distinct instructions and skills discovery surfaces",
);
check(
  !guideById.get("17").successRubric.some((item) =>
    /run history for success, failure, and retries/i.test(item.en),
  ),
  "Lab 17 promises an undocumented retry indicator in run history",
);
check(
  guideById.get("08").commands.some(
    (command) =>
      command.id === "cloud-sandbox-command" &&
      command.code === "copilot --cloud --experimental",
  ),
  "Lab 08 cloud sandbox command omits --experimental",
);
check(
  guideById.get("08").commands.some(
    (command) =>
      command.id === "sandbox-enable-command" &&
      command.code.includes("/experimental on") &&
      command.code.includes("/sandbox enable"),
  ),
  "Lab 08 local sandbox command omits the experimental gate",
);
check(
  !JSON.stringify(guideById.get("06").successRubric).includes("nested-session plan") &&
    !JSON.stringify(guideById.get("06").successRubric).includes("forks display"),
  "Lab 06 rubric assesses work that its steps do not teach",
);
check(
  !JSON.stringify(guideById.get("16").successRubric).includes("least-privilege toolset"),
  "Lab 16 rubric assesses cloud-only permission work",
);
check(
  JSON.stringify(guideById.get("18").objectives) !==
    JSON.stringify(guideById.get("19").objectives),
  "Labs 18 and 19 do not have distinct learning objectives",
);
check(
  journeys.find((journey) => journey.id === "j2")?.labs.join(" ") ===
    "04 06 09 05 07 08 24",
  "Parallel-delivery journey is not ordered from Grid basics to advanced orchestration",
);
check(
  journeys.find((journey) => journey.id === "j3")?.labs.join(" ") ===
    "11 23 12 13 22 14 25",
  "Issue-to-stack journey does not begin with issue targeting before merge work",
);
check(
  tracks.find((track) => track.id === "t9")?.labs.length >= 3,
  "Memory/context track has no basic-to-advanced progression",
);
check(
  !tracks.find((track) => track.id === "t10")?.labs.includes("25"),
  "Cross-domain capstone is incorrectly used as a vertical-track rung",
);
for (const guide of guides) {
  check(
    !/\bguide\s+\d{2}\b/i.test(JSON.stringify(guide)),
    `Lab ${guide.id} uses ambiguous numbered guide terminology`,
  );
  check(
    !/ガイド\s?\d{2}/.test(JSON.stringify(guide)),
    `Lab ${guide.id} uses ambiguous Japanese numbered guide terminology`,
  );
}
for (const labId of ["14", "16", "17", "22", "25"]) {
  check(
    /exclud|含まず/.test(guideById.get(labId).timeNote.en + guideById.get(labId).timeNote.ja),
    `Lab ${labId} time estimate does not disclose external wait time`,
  );
}
for (const labId of ["14", "22"]) {
  const model = guideById.get(labId).underTheHood.en;
  for (const term of ["direct merge", "merge queue", "Merge-as-stack", "Agent Merge"]) {
    check(model.toLowerCase().includes(term.toLowerCase()), `Lab ${labId} mental model omits ${term}`);
  }
}

const handsOnIndex = await readFile("copilot-app-v1.1.4-hands-on/index.html", "utf8");
check(
  count(handsOnIndex, /data-guide-card(?=[ >])/g) === 25,
  "Hands-on index does not render 25 lab cards",
);
check(handsOnIndex.includes('id="journeys"'), "Hands-on index is missing the journeys section");
check(handsOnIndex.includes('id="tracks"'), "Hands-on index is missing the tracks section");
check(handsOnIndex.includes('id="learning-matrix"'), "Hands-on index is missing the learning matrix");

const cardMatches = [
  ...handsOnIndex.matchAll(
    /<article class="card" data-guide-card data-guide-id="([^"]+)"([^>]*)>[\s\S]*?<a class="button" href="([^"]+)"/g,
  ),
];
check(cardMatches.length === 25, `Parsed ${cardMatches.length} lab cards instead of 25`);
const fileByLab = new Map(cardMatches.map((match) => [match[1], match[3]]));
check(fileByLab.size === 25, "Lab cards do not provide 25 unique ids and files");

for (const guide of guides) {
  const card = cardMatches.find((match) => match[1] === guide.id);
  check(Boolean(card), `Hands-on index is missing lab ${guide.id}`);
  if (!card) continue;
  const attributes = card[2];
  check(
    attributes.includes(`data-journeys="${guide.journeyIds.join(" ")}"`),
    `Lab ${guide.id} journey data differs from the content model`,
  );
  check(
    attributes.includes(`data-tracks="${guide.trackIds.join(" ")}"`),
    `Lab ${guide.id} track data differs from the content model`,
  );
  check(
    attributes.includes(`data-provenance="${guide.provenance.primary}"`),
    `Lab ${guide.id} provenance data differs from the content model`,
  );
  const filename = fileByLab.get(guide.id);
  const guidePath = join("copilot-app-v1.1.4-hands-on", filename);
  check(existsSync(guidePath), `Rendered lab is missing: ${guidePath}`);
  if (!existsSync(guidePath)) continue;
  const html = await readFile(guidePath, "utf8");
  check(
    html.includes(`data-guide-id="${guide.id}"`) &&
      html.includes(`data-provenance="${guide.provenance.primary}"`),
    `Lab ${guide.id} rendered metadata is incomplete`,
  );
  for (const section of [
    "persona",
    "objectives",
    "prerequisites",
    "availability",
    "before-you-start",
    "steps",
    "decision-points",
    "checkpoints",
    "results",
    "under-the-hood",
    "troubleshooting",
    "recovery",
    "cleanup",
    "rubric",
    "stretch",
    "platforms",
    "sources",
    "related",
  ]) {
    check(html.includes(`id="${section}"`), `Lab ${guide.id} is missing #${section}`);
  }
}

for (const journey of journeys) {
  const start = handsOnIndex.indexOf(`id="journey-${journey.id}"`);
  const end = handsOnIndex.indexOf("</article>", start);
  const section = start >= 0 ? handsOnIndex.slice(start, end) : "";
  check(start >= 0, `Hands-on index is missing journey ${journey.id}`);
  for (const labId of journey.labs) {
    check(
      section.includes(`>${labId}</span>`),
      `Journey ${journey.id} does not link lab ${labId}`,
    );
  }
}
for (const track of tracks) {
  const start = handsOnIndex.indexOf(`id="track-${track.id}"`);
  const end = handsOnIndex.indexOf("</article>", start);
  const section = start >= 0 ? handsOnIndex.slice(start, end) : "";
  check(start >= 0, `Hands-on index is missing track ${track.id}`);
  for (const labId of track.labs) {
    check(section.includes(`>${labId}</span>`), `Track ${track.id} does not link lab ${labId}`);
  }
}
const matrixStart = handsOnIndex.indexOf('id="learning-matrix"');
const matrixEnd = handsOnIndex.indexOf("</section>", matrixStart);
const matrixSection = matrixStart >= 0 ? handsOnIndex.slice(matrixStart, matrixEnd) : "";
check(handsOnIndex.includes('class="journey-route"'), "Journeys are not rendered as ordered routes");
check(
  handsOnIndex.includes('class="track-progression"') &&
    handsOnIndex.includes("Foundation") &&
    handsOnIndex.includes("Advanced") &&
    handsOnIndex.includes("Integrative"),
  "Tracks do not expose progression roles",
);
check(
  count(
    matrixSection,
    /<a href="[^"]+"><span class="mono">\d{2}<\/span><span class="sr-only">/g,
  ) >= 25,
  "Learning matrix links do not expose descriptive lab names",
);
for (const guide of guides) {
  check(
    matrixSection.includes(`>${guide.id}</span>`),
    `Learning matrix does not contain lab ${guide.id}`,
  );
}

const bannedLearningClaims = [
  /\{repository\}|\{branch\}|\{name\}/,
  /Commit attribution[^.]{0,80}(?:is global|not per session)/i,
  /launch with a corrupted settings profile/i,
  /start a session pointing at a broken repository/i,
  /Agent Merge (?:on|for) (?:the )?(?:whole|entire) stack/i,
  /diagnostics log location/i,
];
for (const pattern of bannedLearningClaims) {
  check(!pattern.test(handsOnIndex), `Hands-on index contains banned claim ${pattern}`);
  for (const [labId, filename] of fileByLab) {
    const html = await readFile(join("copilot-app-v1.1.4-hands-on", filename), "utf8");
    check(!pattern.test(html), `Lab ${labId} contains banned claim ${pattern}`);
  }
}

const deltaCoverage = {
  "03": ["Shift+Tab", "checklist", "Add tab"],
  "06": ["/side", "bulk actions", "quick chat"],
  "07": ["history", "progress"],
  "08": ["PowerShell profile"],
  "09": ["Edit directly in Files", "archived"],
  "15": ["/security-review", "rubber duck"],
  "17": ["transient network error", "may not be visible in run history"],
  "19": ["file-backed instructions", ".github/skills/"],
  "21": ["Voice dictation", "Enable sound"],
  "22": ["Copilot code review", "merge-as-stack", "queue position", "stack menu"],
  "23": ["different repository", "milestone"],
  "24": ["Worktree location", "Commit attribution", "diagnostics", "pinned"],
};
for (const [labId, terms] of Object.entries(deltaCoverage)) {
  const html = await readFile(join("copilot-app-v1.1.4-hands-on", fileByLab.get(labId)), "utf8");
  for (const term of terms) {
    check(
      html.toLowerCase().includes(term.toLowerCase()),
      `Lab ${labId} does not cover required delta term ${term}`,
    );
  }
}

const newHtmlFiles = [
  "copilot-app/index.html",
  "copilot-app-v1.1.4/index.html",
  "copilot-app-v1.1.4/releases.html",
  "copilot-app-v1.1.4-hands-on/index.html",
  ...(await filesMatching("copilot-app-v1.1.4-hands-on", /^\d{2}-.*\.html$/)),
];
check(newHtmlFiles.length === 29, `Expected 29 new HTML pages, found ${newHtmlFiles.length}`);

const firstThemeScript = `<script>
  (() => {
    const param = new URLSearchParams(window.location.search).get("scoutTheme");
    const theme =
      param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>`;
const normalizedFirstThemeScript = normalizeNewlines(firstThemeScript);
const requiredVariables = [
  "--cp-bg: #f7f4ef;",
  "--cp-bg-elevated: #fcfbf8;",
  "--cp-surface: #ffffff;",
  "--cp-surface-soft: #f5f5f5;",
  "--cp-border: #dedede;",
  "--cp-border-strong: #919191;",
  "--cp-text: #242424;",
  "--cp-text-muted: #5c5c5c;",
  "--cp-text-soft: #6f6f6f;",
  "--cp-accent: #b11f4b;",
  "--cp-accent-hover: #9a1a41;",
  "--cp-accent-soft: rgba(177, 31, 75, 0.08);",
  "--cp-accent-fg: #ffffff;",
  "--cp-success: #16a34a;",
  "--cp-danger: #dc2626;",
  "--cp-warning: #f59e0b;",
  "--cp-link: #0078d4;",
  "--cp-bg: #3d3b3a;",
  "--cp-bg-elevated: #343231;",
  "--cp-surface: #292929;",
  "--cp-text: #dedede;",
  "--cp-accent: #fd8ea1;",
  "--cp-accent-fg: #1a1a1a;",
  "--cp-link: #4da6ff;",
];

for (const file of newHtmlFiles) {
  const html = await readFile(file, "utf8");
  const firstScriptStart = html.indexOf("<script>");
  check(
    firstScriptStart >= 0 &&
      normalizeNewlines(html.slice(firstScriptStart)).startsWith(normalizedFirstThemeScript),
    `${file} does not use the required theme detection script first`,
  );
  check(
    html.indexOf("document.documentElement.classList.add") >= 0 &&
      html.indexOf("document.documentElement.classList.add") <
        html.indexOf("<link rel=\"stylesheet\""),
    `${file} does not set language preferences before CSS loads`,
  );
  requiredVariables.forEach((variable) =>
    check(html.includes(variable), `${file} is missing exact theme variable ${variable}`),
  );
  check(!html.includes("--gh-"), `${file} contains legacy --gh-* variables`);
  check(count(html, /class="ja(?=[" ])/g) === count(html, /class="en(?=[" ])/g), `${file} has unbalanced JA/EN markup`);
  for (const pair of html.matchAll(
    /<span class="ja[^"]*"[^>]*>([\s\S]*?)<\/span><span class="en[^"]*"[^>]*>([\s\S]*?)<\/span>/g,
  )) {
    const jaVersions = versionTokens(pair[1]);
    const enVersions = versionTokens(pair[2]);
    if (jaVersions.length || enVersions.length) {
      check(
        JSON.stringify(jaVersions) === JSON.stringify(enVersions),
        `${file} has JA/EN version-token drift: ${jaVersions.join(",")} vs ${enVersions.join(",")}`,
      );
    }
  }
  check(count(html, /<h1(?=[ >])/g) === 1, `${file} does not have exactly one h1`);
  check(html.includes('<main id="main"'), `${file} is missing the main landmark`);
  check(html.includes('class="skip-link"'), `${file} is missing a skip link`);
  check(html.includes("<header"), `${file} is missing a header landmark`);
  check(html.includes("<footer"), `${file} is missing a footer landmark`);
  check(!/<option[^>]*>[^<]*<span/i.test(html), `${file} contains invalid markup inside option`);
  check(!/href="ghapp:\/\//i.test(html), `${file} links directly to ghapp:// instead of the hosted launcher`);
  for (const button of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    check(/\btype="button"/.test(button[1]), `${file} has a button without type="button"`);
    check(
      /aria-label=/.test(button[1]) || button[2].replace(/<[^>]+>/g, "").trim(),
      `${file} has a button without an accessible name`,
    );
  }
  for (const input of html.matchAll(/<(input|select)\b[^>]*id="([^"]+)"[^>]*>/g)) {
    check(
      html.includes(`for="${input[2]}"`),
      `${file} field #${input[2]} does not have an associated label`,
    );
  }
  check(
    !/data-release-item[^>]*\shidden(?:[ =]|>)/.test(html),
    `${file} hides core release content without JavaScript`,
  );
}

const featureCss = await readFile("copilot-app-v1.1.4/assets/style.css", "utf8");
const handsCss = await readFile("copilot-app-v1.1.4-hands-on/assets/style.css", "utf8");
const featureJs = await readFile("copilot-app-v1.1.4/assets/app.js", "utf8");
const handsJs = await readFile("copilot-app-v1.1.4-hands-on/assets/app.js", "utf8");
check(featureCss === handsCss, "Feature and hands-on CSS assets differ");
check(featureJs === handsJs, "Feature and hands-on JS assets differ");
check(!/#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i.test(featureCss), "Component CSS hardcodes colors");
check(!/--gh-/i.test(featureCss), "Component CSS contains legacy --gh-* variables");
check(
  featureCss.includes(
    'font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif;',
  ),
  "Component CSS does not use the required sans-serif stack",
);
check(
  featureCss.includes('font-family: Consolas, "Courier New", Courier, monospace;'),
  "Component CSS does not use the required monospace stack",
);
check(featureCss.includes(":focus-visible"), "Component CSS has no visible focus rule");
check(featureCss.includes("@media (prefers-reduced-motion: reduce)"), "Reduced-motion CSS is missing");
check(featureCss.includes("@media print"), "Print CSS is missing");
check(featureCss.includes("@media (max-width: 40rem)"), "Mobile CSS is missing");
check(!/gradient\(/i.test(featureCss), "Component CSS uses a gradient");
check(
  featureCss.includes('html.js[data-lang="ja"] .en') &&
    featureCss.includes("html:not(.js) .en"),
  "No-JS bilingual behavior is not defined",
);

for (const key of [
  "copilot-app-docs-theme",
  "copilot-app-docs-language",
  "copilot-app-v1.1.4-progress",
]) {
  check(featureJs.includes(key), `Persistence key ${key} is missing from app.js`);
}
for (const hook of [
  "data-language-toggle",
  "data-theme-toggle",
  "data-guide-search",
  "data-filter-chip",
  "data-release-search",
  "data-release-version-filter",
  "data-copy",
  "data-guide-complete",
  "data-resume-link",
]) {
  check(featureJs.includes(hook), `Interaction hook ${hook} is missing from app.js`);
}
check(
  !/\bfetch\s*\(|XMLHttpRequest|WebSocket/i.test(featureJs),
  "Guide UI unexpectedly depends on a backend/network API",
);
check(featureJs.includes('setAttribute("aria-valuenow"'), "Progressbar aria-valuenow is not updated");
check(!featureJs.includes("Mark this guide complete"), "Progress UI uses archived guide terminology");
check(
  featureJs.includes('next.querySelector("h3")'),
  "Resume CTA does not derive its title from the lab heading",
);

const contrastPairs = [
  ["light body text", "#242424", "#f7f4ef"],
  ["light soft text", "#6f6f6f", "#f7f4ef"],
  ["light accent links", "#b11f4b", "#f7f4ef"],
  ["light accent button", "#ffffff", "#b11f4b"],
  ["dark body text", "#dedede", "#3d3b3a"],
  ["dark soft text", "#b0b0b0", "#3d3b3a"],
  ["dark accent links", "#fd8ea1", "#3d3b3a"],
  ["dark accent button", "#1a1a1a", "#fd8ea1"],
];
for (const [name, foreground, background] of contrastPairs) {
  const ratio = contrast(foreground, background);
  check(ratio >= 4.5, `${name} contrast is ${ratio.toFixed(2)}:1`);
}

async function validateRelativeLinks(file) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll("&amp;", "&");
    if (/^(?:https?:|mailto:|tel:|data:)/i.test(raw)) continue;
    const [withoutFragment, fragment = ""] = raw.split("#", 2);
    const withoutQuery = withoutFragment.split("?", 1)[0];
    let target = withoutQuery ? resolve(dirname(file), decodeURIComponent(withoutQuery)) : resolve(file);
    if (existsSync(target) && (await stat(target)).isDirectory()) target = join(target, "index.html");
    check(existsSync(target), `${file} has broken relative link ${raw}`);
    if (fragment && existsSync(target) && extname(target).toLowerCase() === ".html") {
      const targetHtml = await readFile(target, "utf8");
      check(
        targetHtml.includes(`id="${fragment}"`),
        `${file} links to missing fragment #${fragment} in ${target}`,
      );
    }
  }
}
const archiveLandingFiles = [
  "copilot-app-v1.1.2/index.html",
  "copilot-app-v1.1.2-hands-on/index.html",
  "copilot-app-v1.0.12/index.html",
  "copilot-app-v1.0.12-hands-on/index.html",
];
await Promise.all([...newHtmlFiles, ...archiveLandingFiles].map(validateRelativeLinks));

const featureIndex = await readFile("copilot-app-v1.1.4/index.html", "utf8");
for (const section of [
  "summary",
  "migration",
  "evolution",
  "new",
  "capabilities",
  "learning-entry",
  "workflow",
  "availability",
  "setup",
  "models",
  "scope",
  "sources",
]) {
  check(featureIndex.includes(`id="${section}"`), `Feature guide is missing #${section}`);
}
for (const term of [
  "My Work",
  "Session Grid",
  "BYOK",
  "WSL",
  "Agent Merge",
  "Canvases",
  "Automations",
  "MCP",
  "Chronicle",
]) {
  check(featureIndex.includes(term), `Feature capability map is missing ${term}`);
}
const capabilities = [
  ...featureIndex.matchAll(/data-capability-id="([^"]+)" data-labs="([^"]+)"/g),
];
check(capabilities.length === 17, `Feature guide renders ${capabilities.length} taxonomy entries instead of 17`);
for (const capability of capabilities) {
  const labIds = capability[2].split(/\s+/).filter(Boolean);
  check(labIds.length > 0, `Capability ${capability[1]} has no lab or reference-only rationale`);
  for (const labId of labIds) {
    check(guideById.has(labId), `Capability ${capability[1]} references unknown lab ${labId}`);
  }
}
const stableHub = await readFile("copilot-app/index.html", "utf8");
for (const path of [
  "../copilot-app-v1.1.4/",
  "../copilot-app-v1.1.4-hands-on/",
  "../copilot-app-v1.1.2/",
  "../copilot-app-v1.1.2-hands-on/",
  "../copilot-app-v1.0.12/",
  "../copilot-app-v1.0.12-hands-on/",
]) {
  check(stableHub.includes(path), `Stable hub does not link ${path}`);
}

const archiveFeature = await readFile("copilot-app-v1.0.12/index.html", "utf8");
const archiveHandsOn = await readFile("copilot-app-v1.0.12-hands-on/index.html", "utf8");
check(archiveFeature.includes("../copilot-app/"), "Feature archive lacks stable-hub link");
check(archiveHandsOn.includes("../copilot-app/"), "Hands-on archive lacks stable-hub link");
const previousFeature = await readFile("copilot-app-v1.1.2/index.html", "utf8");
const previousHandsOn = await readFile("copilot-app-v1.1.2-hands-on/index.html", "utf8");
check(previousFeature.includes("../copilot-app-v1.1.4/"), "v1.1.2 feature archive lacks current link");
check(
  previousHandsOn.includes("../copilot-app-v1.1.4-hands-on/"),
  "v1.1.2 hands-on archive lacks current link",
);
check(archiveFeature.includes("../copilot-app-v1.1.4/"), "v1.0.12 feature archive lacks current link");
check(
  archiveHandsOn.includes("../copilot-app-v1.1.4-hands-on/"),
  "v1.0.12 hands-on archive lacks current link",
);
check(
  previousFeature.includes("callout--archive-notice") &&
    previousHandsOn.includes("callout--archive-notice"),
  "v1.1.2 archive notices are not constrained page callouts",
);
check(!existsSync("copilot-app-v1.0.23"), "A prohibited v1.0.23 site was created");

const readme = await readFile("README.md", "utf8");
for (const path of [
  "./copilot-app/",
  "./copilot-app-v1.1.4/",
  "./copilot-app-v1.1.4-hands-on/",
  "./copilot-app-v1.1.2/",
  "./copilot-app-v1.1.2-hands-on/",
  "./copilot-app-v1.0.12/",
  "./copilot-app-v1.0.12-hands-on/",
]) {
  check(readme.includes(path), `README does not link ${path}`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} problem(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Validation passed");
console.log(`- ${matrix.versionCount} releases / ${matrix.itemCount} exact-once release items`);
console.log(`- ${journeys.length} journeys / ${tracks.length} tracks / ${guides.length} unique labs`);
console.log(`- ${newHtmlFiles.length} themed, bilingual, semantic HTML pages`);
notes.forEach((note) => console.log(`- ${note}`));
