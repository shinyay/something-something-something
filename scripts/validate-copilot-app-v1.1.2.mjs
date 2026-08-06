import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

const [canonicalChangelogPath, releasesApiPath] = process.argv.slice(2);
const errors = [];
const notes = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
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
  await readFile("copilot-app-v1.1.2/assets/release-matrix.json", "utf8"),
);
const manifest = JSON.parse(await readFile("scripts/guide-content/manifest.json", "utf8"));
const guideDataFiles = await filesMatching("scripts/guide-content", /^path-\d+\.json$/);
const pathData = await Promise.all(
  guideDataFiles.map(async (file) => JSON.parse(await readFile(file, "utf8"))),
);
const guides = pathData.flatMap((path) => path.guides);
const guideById = new Map(guides.map((guide) => [guide.id, guide]));
const orderedEntries = manifest.paths.flatMap((path) =>
  path.guides.map((entry) => ({ ...entry, pathId: path.id })),
);

check(matrix.versionCount === 17, "Release matrix versionCount is not 17");
check(matrix.itemCount === 462, "Release matrix itemCount is not 462");
check(matrix.releases.length === 17, "Release matrix does not contain 17 releases");
check(matrix.latest === "v1.1.2", "Release matrix latest version is not v1.1.2");
check(matrix.baseline === "v1.0.12", "Release matrix baseline is not v1.0.12");
const matrixItems = matrix.releases.flatMap((release) => release.items);
check(matrixItems.length === 462, `Release matrix has ${matrixItems.length} items instead of 462`);
check(new Set(matrixItems.map((item) => item.id)).size === 462, "Release matrix item ids are not unique");
check(matrixItems.every((item) => item.en.trim() && item.ja.trim()), "Release matrix has blank EN/JA text");

const categoryCounts = matrixItems.reduce((result, item) => {
  result[item.category] = (result[item.category] || 0) + 1;
  return result;
}, {});
check(categoryCounts.Added === 66, `Added count is ${categoryCounts.Added}, expected 66`);
check(categoryCounts.Changed === 73, `Changed count is ${categoryCounts.Changed}, expected 73`);
check(categoryCounts.Fixed === 322, `Fixed count is ${categoryCounts.Fixed}, expected 322`);
check(categoryCounts.Removed === 1, `Removed count is ${categoryCounts.Removed}, expected 1`);

if (canonicalChangelogPath && releasesApiPath) {
  const targetVersions = [
    ...Array.from({ length: 14 }, (_, index) => `v1.0.${index + 13}`),
    "v1.1.0",
    "v1.1.1",
    "v1.1.2",
  ];
  const parsed = parseChangelog(await readFile(canonicalChangelogPath, "utf8"), targetVersions);
  const releasesApi = JSON.parse(
    (await readFile(releasesApiPath, "utf8")).replace(/^\uFEFF/, ""),
  );
  check(releasesApi[0]?.tag_name === "v1.1.2", `Latest API tag is ${releasesApi[0]?.tag_name}`);
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

const releaseHtml = await readFile("copilot-app-v1.1.2/releases.html", "utf8");
const renderedItems = [
  ...releaseHtml.matchAll(
    /<li class="release-item" id="([^"]+)"[^>]*data-release-item[\s\S]*?<\/li>/g,
  ),
];
check(renderedItems.length === 462, `Release explorer renders ${renderedItems.length} items`);
check(
  new Set(renderedItems.map((match) => match[1])).size === 462,
  "Release explorer item ids are not unique",
);
check(count(releaseHtml, /data-release-version(?=[ >])/g) === 17, "Release explorer version count is not 17");
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
  }
}
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

check(manifest.paths.length === 5, "Manifest does not contain exactly five learning paths");
check(orderedEntries.length === 21, "Manifest does not contain exactly 21 guides");
check(guides.length === 21, `Guide content contains ${guides.length} guides`);
check(guideById.size === 21, "Guide ids are not unique");
check(new Set(orderedEntries.map((entry) => entry.filename)).size === 21, "Guide filenames are not unique");

function checkPair(value, context) {
  check(Boolean(value?.ja?.trim()), `${context} is missing Japanese`);
  check(Boolean(value?.en?.trim()), `${context} is missing English`);
}

for (const entry of orderedEntries) {
  const guide = guideById.get(entry.id);
  check(Boolean(guide), `Missing guide data for ${entry.id}`);
  if (!guide) continue;
  const owner = pathData.find((path) => path.guides.some((candidate) => candidate.id === entry.id));
  check(owner?.pathId === entry.pathId, `Guide ${entry.id} is assigned to the wrong learning path`);
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
  ]) {
    checkPair(value, `Guide ${entry.id} ${name}`);
  }
  check(guide.prerequisites.length >= 3, `Guide ${entry.id} has fewer than three prerequisites`);
  check(guide.commands.length >= 2, `Guide ${entry.id} has fewer than two commands/prompts`);
  check(
    guide.steps.length >= 5 && guide.steps.length <= 8,
    `Guide ${entry.id} does not have 5-8 steps`,
  );
  check(guide.expected.length >= 3, `Guide ${entry.id} has fewer than three completion checks`);
  check(
    guide.troubleshooting.length >= 3,
    `Guide ${entry.id} has fewer than three troubleshooting entries`,
  );
  check(guide.cleanup.length >= 3, `Guide ${entry.id} has fewer than three cleanup entries`);
  check(guide.related.length >= 3, `Guide ${entry.id} has fewer than three related guides`);
  check(guide.sources.length >= 2, `Guide ${entry.id} has fewer than two sources`);
  const commandIds = new Set(guide.commands.map((command) => command.id));
  for (const step of guide.steps) {
    checkPair(step.title, `Guide ${entry.id} step title`);
    checkPair(step.expected, `Guide ${entry.id} step expected result`);
    step.body.forEach((paragraph) => checkPair(paragraph, `Guide ${entry.id} step paragraph`));
    for (const commandId of step.commandIds || []) {
      check(commandIds.has(commandId), `Guide ${entry.id} references unknown command ${commandId}`);
    }
  }
  for (const platform of ["windows", "macos", "linux", "wsl"]) {
    checkPair(guide.platforms[platform], `Guide ${entry.id} ${platform} note`);
  }
  for (const relatedId of guide.related) {
    check(guideById.has(relatedId), `Guide ${entry.id} has unknown related guide ${relatedId}`);
    check(relatedId !== entry.id, `Guide ${entry.id} relates to itself`);
  }
  for (const source of guide.sources) {
    const url = new URL(source.url);
    check(url.protocol === "https:", `Guide ${entry.id} source is not HTTPS`);
    check(
      url.hostname === "docs.github.com" || url.hostname === "github.com",
      `Guide ${entry.id} source is not an official GitHub domain: ${source.url}`,
    );
  }
  for (const launcher of guide.launchers || []) {
    const url = new URL(launcher.url);
    check(url.protocol === "https:", `Guide ${entry.id} official link is not HTTPS`);
    check(
      url.hostname === "github.com" || url.hostname === "docs.github.com",
      `Guide ${entry.id} official link is not on an official GitHub domain`,
    );
    if (url.pathname === "/copilot/app/launch") {
      const open = url.searchParams.get("open") || "";
      check(open.startsWith("ghapp://"), `Guide ${entry.id} launcher does not wrap ghapp://`);
      check(
        !/(?:api[_-]?key|access[_-]?token|password|secret)=/i.test(open),
        `Guide ${entry.id} launcher may contain a secret`,
      );
    }
  }
  for (const command of guide.commands) {
    check(
      !/(?:api[_-]?key|access[_-]?token|password|secret)\s*=\s*\S+/i.test(command.code),
      `Guide ${entry.id} command may contain a secret`,
    );
  }

  const guidePath = join("copilot-app-v1.1.2-hands-on", entry.filename);
  check(existsSync(guidePath), `Rendered guide is missing: ${guidePath}`);
}

const handsOnIndex = await readFile("copilot-app-v1.1.2-hands-on/index.html", "utf8");
check(
  count(handsOnIndex, /data-guide-card(?=[ >])/g) === 21,
  "Hands-on index does not render 21 guide cards",
);
for (const path of manifest.paths) {
  check(handsOnIndex.includes(`id="${path.id}"`), `Hands-on index is missing path ${path.id}`);
}
for (const entry of orderedEntries) {
  check(
    count(handsOnIndex, new RegExp(`data-guide-id="${entry.id}"`, "g")) === 1,
    `Hands-on index does not contain guide ${entry.id} exactly once`,
  );
}

const newHtmlFiles = [
  "copilot-app/index.html",
  "copilot-app-v1.1.2/index.html",
  "copilot-app-v1.1.2/releases.html",
  "copilot-app-v1.1.2-hands-on/index.html",
  ...(await filesMatching("copilot-app-v1.1.2-hands-on", /^\d{2}-.*\.html$/)),
];
check(newHtmlFiles.length === 25, `Expected 25 new HTML pages, found ${newHtmlFiles.length}`);

const firstThemeScript = `<script>
  (() => {
    const param = new URLSearchParams(window.location.search).get("scoutTheme");
    const theme =
      param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>`;
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
      html.slice(firstScriptStart).replaceAll("\r\n", "\n").startsWith(firstThemeScript),
    `${file} does not use the required theme detection script first`,
  );
  check(
    html.indexOf("document.documentElement.classList.add") < html.indexOf("<link rel=\"stylesheet\""),
    `${file} does not set language preferences before CSS loads`,
  );
  requiredVariables.forEach((variable) =>
    check(html.includes(variable), `${file} is missing exact theme variable ${variable}`),
  );
  check(!html.includes("--gh-"), `${file} contains legacy --gh-* variables`);
  check(count(html, /class="ja(?=[" ])/g) === count(html, /class="en(?=[" ])/g), `${file} has unbalanced JA/EN markup`);
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

const featureCss = await readFile("copilot-app-v1.1.2/assets/style.css", "utf8");
const handsCss = await readFile("copilot-app-v1.1.2-hands-on/assets/style.css", "utf8");
const featureJs = await readFile("copilot-app-v1.1.2/assets/app.js", "utf8");
const handsJs = await readFile("copilot-app-v1.1.2-hands-on/assets/app.js", "utf8");
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
  "copilot-app-v1.1.2-progress",
]) {
  check(featureJs.includes(key), `Persistence key ${key} is missing from app.js`);
}
for (const hook of [
  "data-language-toggle",
  "data-theme-toggle",
  "data-guide-search",
  "data-release-search",
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
await Promise.all(newHtmlFiles.map(validateRelativeLinks));

const featureIndex = await readFile("copilot-app-v1.1.2/index.html", "utf8");
for (const section of [
  "summary",
  "new",
  "capabilities",
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

const archiveFeature = await readFile("copilot-app-v1.0.12/index.html", "utf8");
const archiveHandsOn = await readFile("copilot-app-v1.0.12-hands-on/index.html", "utf8");
check(archiveFeature.includes("../copilot-app-v1.1.4/"), "Feature archive lacks latest-version link");
check(archiveFeature.includes("../copilot-app/"), "Feature archive lacks stable-hub link");
check(
  archiveHandsOn.includes("../copilot-app-v1.1.4-hands-on/"),
  "Hands-on archive lacks latest-version link",
);
check(archiveHandsOn.includes("../copilot-app/"), "Hands-on archive lacks stable-hub link");
check(!existsSync("copilot-app-v1.0.23"), "A prohibited v1.0.23 site was created");

const readme = await readFile("README.md", "utf8");
for (const path of [
  "./copilot-app/",
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
console.log(`- ${manifest.paths.length} learning paths / ${guides.length} unique guides`);
console.log(`- ${newHtmlFiles.length} themed, bilingual, semantic HTML pages`);
notes.forEach((note) => console.log(`- ${note}`));
