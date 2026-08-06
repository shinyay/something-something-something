// Renders the GitHub Copilot App v1.1.4 two-dimensional hands-on learning system into
// copilot-app-v1.1.4-hands-on/. All content comes from scripts/learning-content-v1.1.4.mjs,
// which loads the 21 archived guides (read-only) and defines the four new v1.1.4 labs plus the
// six journeys and ten tracks. This script only renders HTML/CSS/JS output; it never edits the
// archived scripts/guide-content/path-*.json files.
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadLabs } from "./learning-content-v1.1.4.mjs";

const { labs, byId, journeys, tracks, manifest } = await loadLabs();

if (labs.length !== 25) throw new Error(`Expected exactly 25 labs; found ${labs.length}`);
if (journeys.length !== 6) throw new Error(`Expected exactly 6 journeys; found ${journeys.length}`);
if (tracks.length !== 10) throw new Error(`Expected exactly 10 tracks; found ${tracks.length}`);

const archivedFilenames = new Map(manifest.paths.flatMap((path) => path.guides.map((entry) => [entry.id, entry.filename])));
const newFilenames = new Map([
  ["22", "22-stacked-pr-copilot-review.html"],
  ["23", "23-cross-repo-issues-milestones.html"],
  ["24", "24-worktree-attribution-diagnostics.html"],
  ["25", "25-capstone-issue-to-landed-pr.html"],
]);
const filenameById = new Map([...archivedFilenames, ...newFilenames]);
for (const lab of labs) {
  if (!filenameById.has(lab.id)) throw new Error(`Missing filename mapping for lab ${lab.id}`);
}

const timeBuckets = ["30", "45", "60", "60+"];
function timeBucket(minutes) {
  if (minutes <= 30) return "30";
  if (minutes <= 45) return "45";
  if (minutes <= 60) return "60";
  return "60+";
}
for (const lab of labs) lab.timeBucket = timeBucket(lab.estimatedMinutes);

const platformKeys = ["windows", "macos", "linux", "wsl"];
const platformLabel = { windows: "Windows", macos: "macOS", linux: "Linux", wsl: "WSL" };

const difficultyOrder = ["beginner", "intermediate", "advanced"];
const statusOrder = ["current", "preview"];

// ---------------------------------------------------------------------------
// Shared rendering helpers (theme script/variables copied verbatim per the
// mandatory design contract — see the web-artifacts-builder skill).
// ---------------------------------------------------------------------------

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

function cleanHtml(value) {
  return `${value.replace(/[ \t]+$/gm, "").trimEnd()}\n`;
}

function i18n(value, className = "") {
  if (!value?.ja || !value?.en) throw new Error(`Missing bilingual value: ${JSON.stringify(value)}`);
  const classAttribute = className ? ` ${className}` : "";
  return `<span class="ja${classAttribute}" lang="ja">${inlineMarkdown(value.ja)}</span><span class="en${classAttribute}" lang="en">${inlineMarkdown(value.en)}</span>`;
}

function optionLabel(value) {
  return `${escapeHtml(value.ja)} / ${escapeHtml(value.en)}`;
}

function svg(path, size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"></path></svg>`;
}

const icons = {
  mark: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z",
  globe: "M8 0a8 8 0 100 16A8 8 0 008 0ZM5.78 8.75a9.64 9.64 0 001.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0010.22 8.75Zm4.44-1.5a9.64 9.64 0 00-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 00-.857 1.215A9.64 9.64 0 005.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 004.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.437-2.874-1.581-4.948Zm-2.733-1.5h2.733c.144-2.074.866-3.756 1.58-4.948.12-.197.237-.381.353-.552a6.507 6.507 0 00-4.666 5.5Zm10.181 1.5c-.144 2.074-.866 3.756-1.58 4.948-.12.197-.237.381-.353.552a6.507 6.507 0 004.666-5.5Zm2.733-1.5a6.507 6.507 0 00-4.666-5.5c.123.181.24.365.352.552.715 1.192 1.437 2.874 1.581 4.948Z",
  sun: "M8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13z",
  arrowLeft: "M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h8.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06Z",
  arrowRight: "M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L11.44 8.5H1.75a.75.75 0 010-1.5h9.69L8.22 4.03a.75.75 0 010-1.06Z",
};

const themeScript = `<script>
  (() => {
    const param = new URLSearchParams(window.location.search).get("scoutTheme");
    const theme =
      param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  })();
</script>`;

const preferenceScript = `<script>
  (() => {
    document.documentElement.classList.add("js");
    try {
      const param = new URLSearchParams(window.location.search).get("scoutTheme");
      const storedTheme = localStorage.getItem("copilot-app-docs-theme");
      if (!param && (storedTheme === "light" || storedTheme === "dark")) {
        document.documentElement.setAttribute("data-theme", storedTheme);
      }
      const storedLanguage = localStorage.getItem("copilot-app-docs-language");
      const language = storedLanguage === "en" ? "en" : "ja";
      document.documentElement.setAttribute("data-lang", language);
      document.documentElement.setAttribute("lang", language);
    } catch {
      document.documentElement.setAttribute("data-lang", "ja");
    }
  })();
</script>`;

const themeVariables = `<style>
:root {
  color-scheme: light;
  --cp-bg: #f7f4ef;
  --cp-bg-elevated: #fcfbf8;
  --cp-surface: #ffffff;
  --cp-surface-soft: #f5f5f5;
  --cp-border: #dedede;
  --cp-border-strong: #919191;
  --cp-text: #242424;
  --cp-text-muted: #5c5c5c;
  --cp-text-soft: #6f6f6f;
  --cp-accent: #b11f4b;
  --cp-accent-hover: #9a1a41;
  --cp-accent-soft: rgba(177, 31, 75, 0.08);
  --cp-accent-fg: #ffffff;
  --cp-success: #16a34a;
  --cp-danger: #dc2626;
  --cp-warning: #f59e0b;
  --cp-link: #0078d4;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
  --cp-overlay: rgba(255, 255, 255, 0.8);
  --cp-panel: rgba(255, 255, 255, 0.86);
  --cp-panel-strong: rgba(255, 255, 255, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.55);
  --cp-highlight: rgba(177, 31, 75, 0.12);
}
html[data-theme="dark"] {
  color-scheme: dark;
  --cp-bg: #3d3b3a;
  --cp-bg-elevated: #343231;
  --cp-surface: #292929;
  --cp-surface-soft: #2e2e2e;
  --cp-border: #474747;
  --cp-border-strong: #5f5f5f;
  --cp-text: #dedede;
  --cp-text-muted: #919191;
  --cp-text-soft: #b0b0b0;
  --cp-accent: #fd8ea1;
  --cp-accent-hover: #fb7b91;
  --cp-accent-soft: rgba(253, 142, 161, 0.14);
  --cp-accent-fg: #1a1a1a;
  --cp-success: #4ade80;
  --cp-danger: #f87171;
  --cp-warning: #fbbf24;
  --cp-link: #4da6ff;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
  --cp-overlay: rgba(41, 41, 41, 0.88);
  --cp-panel: rgba(41, 41, 41, 0.72);
  --cp-panel-strong: rgba(41, 41, 41, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.04);
  --cp-highlight: rgba(253, 142, 161, 0.12);
}
</style>`;

function head(title, description) {
  return `<!DOCTYPE html>
<html lang="ja" data-lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="description" content="${escapeHtml(description)}">
<title>${escapeHtml(title)}</title>
${themeScript}
${preferenceScript}
${themeVariables}
<link rel="stylesheet" href="assets/style.css">
<script src="assets/app.js" defer></script>
</head>`;
}

function header() {
  return `<a class="skip-link" href="#main">${i18n({ ja: "本文へ移動", en: "Skip to main content" })}</a>
<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="index.html" aria-label="GitHub Copilot App v1.1.4 hands-on">
      <span class="brand__mark">${svg(icons.mark, 26)}</span>
      <span>GitHub Copilot <span class="brand__version">App</span></span>
    </a>
    <span class="version-pill version-pill--current">v1.1.4</span>
    <nav class="header-nav" aria-label="Primary">
      <a href="../copilot-app/"><span class="header-nav__label">${i18n({ ja: "バージョンハブ", en: "Version hub" })}</span></a>
      <a href="../copilot-app-v1.1.4/"><span class="header-nav__label">${i18n({ ja: "機能ガイド", en: "Feature guide" })}</span></a>
      <a href="../copilot-app-v1.1.4/releases.html"><span class="header-nav__label">${i18n({ ja: "リリース差分", en: "Releases" })}</span></a>
      <button class="icon-button" type="button" data-language-toggle><span aria-hidden="true">${svg(icons.globe)}</span><span data-toggle-label>EN</span></button>
      <button class="icon-button" type="button" data-theme-toggle><span aria-hidden="true">${svg(icons.sun)}</span><span class="header-nav__label" data-toggle-label>Dark</span></button>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__links">
      <a href="../copilot-app/">${i18n({ ja: "安定版ハブ", en: "Stable hub" })}</a>
      <a href="../copilot-app-v1.1.4/">${i18n({ ja: "v1.1.4 機能ガイド", en: "v1.1.4 feature guide" })}</a>
      <a href="../copilot-app-v1.1.4/releases.html">${i18n({ ja: "全リリース差分", en: "Full release delta" })}</a>
      <a href="../copilot-app-v1.1.2-hands-on/">${i18n({ ja: "v1.1.2 ハンズオン（アーカイブ）", en: "v1.1.2 hands-on (archive)" })}</a>
      <a href="../copilot-app-v1.0.12-hands-on/">${i18n({ ja: "v1.0.12 ハンズオン（アーカイブ）", en: "v1.0.12 hands-on (archive)" })}</a>
    </div>
    <p>${i18n({ ja: "非公式の学習ガイドです。機能の可用性、ポリシー、料金は公式ドキュメントを確認してください。", en: "This is an unofficial learning guide. Confirm feature availability, policy, and pricing in the official documentation." })}</p>
  </div>
</footer>`;
}

function codeBlock(command, labId, index) {
  const codeId = `lab-${labId}-code-${index}`;
  return `<div class="code-block">
  <div class="code-block__label">
    <span>${i18n(command.label)}</span>
    <button class="copy-button" type="button" data-copy="${codeId}" data-ja-label="コピー" data-en-label="Copy">${i18n({ ja: "コピー", en: "Copy" })}</button>
  </div>
  <pre><code id="${codeId}" data-language="${escapeHtml(command.language || "text")}">${escapeHtml(command.code)}</code></pre>
</div>`;
}

function minutesLabel(minutes) {
  return bi(`約${minutes}分`, `About ${minutes} min`);
}
function bi(ja, en) {
  return { ja, en };
}

const provenanceLabels = {
  docs: bi("Docs-grounded", "Docs-grounded"),
  "release-notes": bi("Release-note-grounded", "Release-note-grounded"),
  mixed: bi("Docs + Release-note", "Docs + release-note"),
};
const provenanceBadgeClasses = {
  docs: "",
  "release-notes": "badge--accent",
  mixed: "badge--warning",
};
function provenanceLabel(primary) {
  const label = provenanceLabels[primary];
  if (!label) throw new Error(`Unknown provenance primary: ${primary}`);
  return label;
}
function provenanceBadgeClass(primary) {
  if (!(primary in provenanceBadgeClasses)) throw new Error(`Unknown provenance primary: ${primary}`);
  return provenanceBadgeClasses[primary];
}

function labChip(id) {
  const lab = byId.get(id);
  if (!lab) throw new Error(`Unknown related lab ${id}`);
  return `<a class="badge" href="${filenameById.get(id)}"><span class="mono">${id}</span> ${i18n(lab.title)}</a>`;
}

function journeyChip(id) {
  const journey = journeys.find((item) => item.id === id);
  return `<a class="badge badge--accent" href="index.html#journey-${id}">${i18n(journey.title)}</a>`;
}

function trackChip(id) {
  const track = tracks.find((item) => item.id === id);
  return `<a class="badge" href="index.html#track-${id}">${i18n(track.title)}</a>`;
}

// ---------------------------------------------------------------------------
// Lab page renderer
// ---------------------------------------------------------------------------

function labPage(lab, index) {
  const commandById = new Map((lab.commands || []).map((command) => [command.id, command]));
  const previous = labs[index - 1];
  const next = labs[index + 1];
  let codeIndex = 0;

  const steps = lab.steps
    .map((step, stepIndex) => {
      const paragraphs = step.body.map((paragraph) => `<p>${i18n(paragraph)}</p>`).join("\n");
      const commands = (step.commandIds || [])
        .map((id) => {
          const command = commandById.get(id);
          if (!command) throw new Error(`Unknown command ${id} in lab ${lab.id}`);
          codeIndex += 1;
          return codeBlock(command, lab.id, codeIndex);
        })
        .join("\n");
      return `<li class="step">
  <h3><span class="mono">${stepIndex + 1}.</span> ${i18n(step.title)}</h3>
  ${paragraphs}
  ${commands}
  <div class="step__expected"><strong>${i18n({ ja: "この段階で期待される状態", en: "Expected state after this phase" })}:</strong> ${i18n(step.expected)}</div>
</li>`;
    })
    .join("\n");

  const launchers = (lab.launchers || [])
    .map(
      (launcher) => `<article class="card">
  <h3>${i18n(launcher.label)}</h3>
  <p>${i18n(launcher.description)}</p>
  <div class="card-actions"><a class="button" href="${escapeHtml(launcher.url)}" rel="noopener noreferrer">${i18n({ ja: "公式リンク／ホスト型ランチャーを開く", en: "Open the official link / hosted launcher" })} ${svg(icons.arrowRight)}</a></div>
</article>`,
    )
    .join("\n");

  const commandsStandalone = (lab.commands || [])
    .filter((command) => !lab.steps.some((step) => (step.commandIds || []).includes(command.id)))
    .map((command) => {
      codeIndex += 1;
      return codeBlock(command, lab.id, codeIndex);
    })
    .join("\n");

  const troubleshooting = lab.troubleshooting
    .map(
      (item) => `<details>
  <summary>${i18n(item.problem)}</summary>
  <div class="details-body"><p>${i18n(item.fix)}</p></div>
</details>`,
    )
    .join("\n");

  const platforms = Object.entries(lab.platforms)
    .map(
      ([platform, note]) => `<article class="card"><h3>${escapeHtml(platformLabel[platform] || platform)}</h3><p>${i18n(note)}</p></article>`,
    )
    .join("\n");

  const objectives = lab.objectives.map((item) => `<li>${i18n(item)}</li>`).join("\n");
  const decisionPoints = lab.decisionPoints.map((item) => `<li>${i18n(item)}</li>`).join("\n");
  const checkpoints = lab.checkpoints.map((item) => `<li>${i18n(item)}</li>`).join("\n");
  const rubric = lab.successRubric.map((item) => `<li>${i18n(item)}</li>`).join("\n");
  const cleanup = lab.cleanup.map((item) => `<li>${i18n(item)}</li>`).join("\n");
  const prerequisites = lab.prerequisites.map((item) => `<li>${i18n(item)}</li>`).join("\n");
  const results = lab.expected.map((item) => `<li>${i18n(item)}</li>`).join("\n");
  const related = lab.related
    .map((id) => `<li>${labChip(id)}</li>`)
    .join("\n");
  const journeyChips = lab.journeyIds.map((id) => journeyChip(id)).join(" ");
  const trackChips = lab.trackIds.map((id) => trackChip(id)).join(" ");
  const sources = lab.sources
    .map((source) => `<li><a href="${escapeHtml(source.url)}" rel="noopener noreferrer">${escapeHtml(source.title)}</a></li>`)
    .join("\n");

  const title = `GitHub Copilot App v1.1.4 — ${lab.title.en}`;
  return `${head(title, lab.summary.en)}
<body data-guide-id="${lab.id}" data-guide-count="25">
${header()}
<section class="hero" aria-labelledby="lab-title">
  <div class="hero__inner">
    <p class="eyebrow">${i18n({ ja: `ラボ ${lab.id} / 25`, en: `Lab ${lab.id} of 25` })}</p>
    <h1 id="lab-title">${i18n(lab.title)}</h1>
    <p class="lede">${i18n(lab.summary)}</p>
    <div class="meta-row" aria-label="Lab metadata">
      <span class="badge">${i18n(lab.difficulty.label)}</span>
      <span class="badge badge--accent">${i18n(lab.status.label)}</span>
      <span class="badge">${i18n(lab.version)}</span>
      <span class="badge">${i18n(minutesLabel(lab.estimatedMinutes))}</span>
      <span class="badge ${provenanceBadgeClass(lab.provenance.primary)}" data-provenance="${lab.provenance.primary}">${i18n(provenanceLabel(lab.provenance.primary))}</span>
    </div>
    <div class="chips" aria-label="Journeys and tracks">${journeyChips} ${trackChips}</div>
    <div class="hero-actions">
      <a class="button button--primary" href="#steps">${i18n({ ja: "手順を始める", en: "Start the steps" })} ${svg(icons.arrowRight)}</a>
      <a class="button" href="index.html#labs">${svg(icons.arrowLeft)} ${i18n({ ja: "25 ラボ一覧", en: "All 25 labs" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <div class="page-grid">
    <div class="main-content">
      <section class="section" id="persona">
        <div class="section-heading"><p class="eyebrow">Scenario &amp; persona</p><h2>${i18n({ ja: "シナリオと担当者像", en: "Scenario and persona" })}</h2></div>
        <div class="card-grid">
          <article class="card"><h3>${i18n({ ja: "具体的なシナリオ", en: "Concrete scenario" })}</h3><p>${i18n(lab.scenario)}</p></article>
          <article class="card"><h3>${i18n({ ja: "担当者像", en: "Persona" })}</h3><p>${i18n(lab.persona)}</p></article>
        </div>
        <div class="callout"><strong>${i18n({ ja: "なぜ重要か", en: "Why it matters" })}:</strong> ${i18n(lab.whyItMatters)}</div>
      </section>

      <section class="section" id="objectives">
        <div class="section-heading"><p class="eyebrow">Goals</p><h2>${i18n({ ja: "学習目標", en: "Learning objectives" })}</h2></div>
        <ul>${objectives}</ul>
      </section>

      <section class="section" id="prerequisites">
        <div class="section-heading"><p class="eyebrow">Prepare</p><h2>${i18n({ ja: "前提条件", en: "Prerequisites" })}</h2></div>
        <ul>${prerequisites}</ul>
      </section>

      <section class="section" id="availability">
        <div class="section-heading"><p class="eyebrow">Availability</p><h2>${i18n({ ja: "公式な提供状況とスコープ", en: "Official availability and scope" })}</h2></div>
        <div class="card-grid">
          <article class="card"><h3>${i18n({ ja: "提供状況", en: "Availability" })}</h3><p>${i18n(lab.status.detail)}</p></article>
          <article class="card"><h3>${i18n({ ja: "対象範囲", en: "Feature boundary" })}</h3><p>${i18n(lab.scope)}</p></article>
          <article class="card"><h3>${i18n({ ja: "時間の見積もり", en: "Time estimate" })}</h3><p>${i18n(lab.timeNote)}</p></article>
          <article class="card"><h3><span class="badge ${provenanceBadgeClass(lab.provenance.primary)}" data-provenance="${lab.provenance.primary}">${i18n(provenanceLabel(lab.provenance.primary))}</span> ${i18n({ ja: "情報源の裏付け", en: "Source provenance" })}</h3><p>${i18n(lab.provenance.note)}</p></article>
        </div>
      </section>

      <section class="section" id="before-you-start">
        <div class="section-heading"><p class="eyebrow">Before you start</p><h2>${i18n({ ja: "開始前の安全確認", en: "Before-you-start safety check" })}</h2></div>
        <div class="callout callout--warning"><strong>${i18n({ ja: "安全・データ・コスト・権限への影響", en: "Safety, data, cost, and permission implications" })}:</strong> ${i18n(lab.safety)}</div>
      </section>

      ${
        launchers || commandsStandalone
          ? `<section class="section" id="launchers">
        <div class="section-heading"><p class="eyebrow">Open safely</p><h2>${i18n({ ja: "コピー可能なプロンプト／コマンドとランチャー", en: "Copyable prompts/commands and launchers" })}</h2></div>
        ${commandsStandalone}
        <div class="card-grid">${launchers}</div>
      </section>`
          : ""
      }

      <section class="section" id="steps">
        <div class="section-heading"><p class="eyebrow">Hands-on</p><h2>${i18n({ ja: "手順", en: "Steps" })}</h2></div>
        <ol class="steps">${steps}</ol>
      </section>

      <section class="section" id="decision-points">
        <div class="section-heading"><p class="eyebrow">Decide</p><h2>${i18n({ ja: "判断点", en: "Decision points" })}</h2></div>
        <ul class="decision-list">${decisionPoints}</ul>
      </section>

      <section class="section" id="checkpoints">
        <div class="section-heading"><p class="eyebrow">Checkpoints</p><h2>${i18n({ ja: "チェックポイント", en: "Checkpoints" })}</h2></div>
        <ul class="checkpoint-list">${checkpoints}</ul>
      </section>

      <section class="section" id="results">
        <div class="section-heading"><p class="eyebrow">Verify</p><h2>${i18n({ ja: "完了時の確認", en: "Completion checks" })}</h2></div>
        <ul>${results}</ul>
      </section>

      <section class="section" id="under-the-hood">
        <div class="section-heading"><p class="eyebrow">Mental model</p><h2>${i18n({ ja: "Under the hood: 内部で何が起きているか", en: "Under the hood: what happens internally" })}</h2></div>
        <p>${i18n(lab.underTheHood)}</p>
      </section>

      <section class="section" id="troubleshooting">
        <div class="section-heading"><p class="eyebrow">Recover</p><h2>${i18n({ ja: "トラブルシューティング（症状から探す）", en: "Troubleshooting (start from your symptom)" })}</h2></div>
        ${troubleshooting}
      </section>

      <section class="section" id="recovery">
        <div class="section-heading"><p class="eyebrow">Recovery path</p><h2>${i18n({ ja: "明示的な復旧手順", en: "Explicit recovery path" })}</h2></div>
        <div class="callout callout--danger">${i18n(lab.recoveryPath)}</div>
      </section>

      <section class="section" id="cleanup">
        <div class="section-heading"><p class="eyebrow">Reset</p><h2>${i18n({ ja: "クリーンアップとリセット", en: "Cleanup and reset" })}</h2></div>
        <ol>${cleanup}</ol>
      </section>

      <section class="section" id="rubric">
        <div class="section-heading"><p class="eyebrow">Success rubric</p><h2>${i18n({ ja: "成功の基準", en: "Success rubric" })}</h2></div>
        <ul class="rubric-list">${rubric}</ul>
      </section>

      <section class="section" id="stretch">
        <div class="section-heading"><p class="eyebrow">Go further</p><h2>${i18n({ ja: "発展課題", en: "Stretch exercise" })}</h2></div>
        <div class="callout callout--success">${i18n(lab.stretchExercise)}</div>
      </section>

      <section class="section" id="platforms">
        <div class="section-heading"><p class="eyebrow">Platforms</p><h2>${i18n({ ja: "プラットフォーム別の注意", en: "Platform-specific notes" })}</h2></div>
        <div class="card-grid">${platforms}</div>
      </section>

      <section class="section" id="sources">
        <div class="section-heading"><p class="eyebrow">Grounding</p><h2>${i18n({ ja: "公式ソース", en: "Official sources" })}</h2></div>
        <ul class="source-list">${sources}</ul>
      </section>

      <section class="section" id="related">
        <div class="section-heading"><p class="eyebrow">Continue</p><h2>${i18n({ ja: "関連ラボ", en: "Related labs" })}</h2></div>
        <ul class="plain-list related-list">${related}</ul>
      </section>

      <nav class="guide-pagination" aria-label="Lab navigation">
        ${
          previous
            ? `<a href="${filenameById.get(previous.id)}">${svg(icons.arrowLeft)} <span class="muted">${i18n({ ja: "前のラボ", en: "Previous lab" })}</span><br><strong>${i18n(previous.title)}</strong></a>`
            : `<a href="index.html">${svg(icons.arrowLeft)} <span class="muted">${i18n({ ja: "ラボ一覧", en: "Lab index" })}</span><br><strong>${i18n({ ja: "ジャーニーとトラックを選ぶ", en: "Choose a journey or track" })}</strong></a>`
        }
        ${
          next
            ? `<a href="${filenameById.get(next.id)}"><span class="muted">${i18n({ ja: "次のラボ", en: "Next lab" })}</span> ${svg(icons.arrowRight)}<br><strong>${i18n(next.title)}</strong></a>`
            : `<a href="../copilot-app-v1.1.4/"><span class="muted">${i18n({ ja: "次へ", en: "Next" })}</span> ${svg(icons.arrowRight)}<br><strong>${i18n({ ja: "機能ガイドへ戻る", en: "Return to the feature guide" })}</strong></a>`
        }
      </nav>
    </div>

    <aside class="sticky-panel" aria-label="Lab progress and navigation">
      <div class="progress-panel">
        <h2>${i18n({ ja: "学習進捗", en: "Learning progress" })}</h2>
        <p data-progress-count>0 / 25</p>
        <div class="progress-track" role="progressbar" aria-label="Learning progress" aria-valuemin="0" aria-valuemax="25"><div class="progress-track__fill" data-progress-fill></div></div>
        <button class="progress-button" type="button" data-guide-complete aria-pressed="false">${i18n({ ja: "このラボを完了にする", en: "Mark this lab complete" })}</button>
      </div>
      <nav class="on-this-page" aria-labelledby="on-this-page-title">
        <h2 id="on-this-page-title">${i18n({ ja: "このページ", en: "On this page" })}</h2>
        <ol>
          <li><a href="#persona">${i18n({ ja: "シナリオと担当者像", en: "Scenario and persona" })}</a></li>
          <li><a href="#objectives">${i18n({ ja: "学習目標", en: "Objectives" })}</a></li>
          <li><a href="#prerequisites">${i18n({ ja: "前提条件", en: "Prerequisites" })}</a></li>
          <li><a href="#availability">${i18n({ ja: "提供状況", en: "Availability" })}</a></li>
          <li><a href="#before-you-start">${i18n({ ja: "開始前の確認", en: "Before you start" })}</a></li>
          <li><a href="#steps">${i18n({ ja: "手順", en: "Steps" })}</a></li>
          <li><a href="#decision-points">${i18n({ ja: "判断点", en: "Decision points" })}</a></li>
          <li><a href="#checkpoints">${i18n({ ja: "チェックポイント", en: "Checkpoints" })}</a></li>
          <li><a href="#results">${i18n({ ja: "完了時の確認", en: "Completion checks" })}</a></li>
          <li><a href="#under-the-hood">${i18n({ ja: "Under the hood", en: "Under the hood" })}</a></li>
          <li><a href="#troubleshooting">${i18n({ ja: "トラブルシューティング", en: "Troubleshooting" })}</a></li>
          <li><a href="#recovery">${i18n({ ja: "復旧手順", en: "Recovery" })}</a></li>
          <li><a href="#cleanup">${i18n({ ja: "クリーンアップ", en: "Cleanup" })}</a></li>
          <li><a href="#rubric">${i18n({ ja: "成功の基準", en: "Success rubric" })}</a></li>
          <li><a href="#stretch">${i18n({ ja: "発展課題", en: "Stretch exercise" })}</a></li>
          <li><a href="#platforms">${i18n({ ja: "プラットフォーム", en: "Platforms" })}</a></li>
          <li><a href="#sources">${i18n({ ja: "公式ソース", en: "Official sources" })}</a></li>
          <li><a href="#related">${i18n({ ja: "関連ラボ", en: "Related labs" })}</a></li>
        </ol>
      </nav>
    </aside>
  </div>
</main>
${footer()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Index page: filters, resume/next, progress, journeys, tracks, and the
// semantic static learning matrix.
// ---------------------------------------------------------------------------

function filterGroup({ id, legend, group, options }) {
  const chips = options
    .map(
      (option) =>
        `<button type="button" class="chip filter-chip" data-filter-chip data-filter-group="${group}" data-filter-value="${escapeHtml(option.value)}" aria-pressed="false">${i18n(option.label)}</button>`,
    )
    .join("\n");
  return `<fieldset class="filter-group" id="${id}">
    <legend>${i18n(legend)}</legend>
    <div class="chips">${chips}</div>
  </fieldset>`;
}

function labCard(lab) {
  return `<article class="card" data-guide-card data-guide-id="${lab.id}" data-difficulty="${lab.difficulty.key}" data-status="${lab.status.key}" data-journeys="${lab.journeyIds.join(" ")}" data-tracks="${lab.trackIds.join(" ")}" data-platforms="${Object.keys(lab.platforms).join(" ")}" data-time="${lab.timeBucket}" data-provenance="${lab.provenance.primary}">
  <div class="card__top"><span class="guide-number">${lab.id}</span><span class="badge badge--success" data-card-progress hidden>${i18n({ ja: "完了", en: "Complete" })}</span></div>
  <h3>${i18n(lab.title)}</h3>
  <p>${i18n(lab.summary)}</p>
  <div class="chips">
    <span class="badge">${i18n(lab.difficulty.label)}</span>
    <span class="badge badge--accent">${i18n(lab.status.label)}</span>
    <span class="badge">${i18n(minutesLabel(lab.estimatedMinutes))}</span>
    <span class="badge ${provenanceBadgeClass(lab.provenance.primary)}">${i18n(provenanceLabel(lab.provenance.primary))}</span>
  </div>
  <div class="card-actions"><a class="button" href="${filenameById.get(lab.id)}">${i18n({ ja: "ラボを開く", en: "Open lab" })} ${svg(icons.arrowRight)}</a></div>
</article>`;
}

function journeyCard(journey) {
  const optional = new Set(journey.optionalLabs || []);
  const labList = journey.labs
    .map(
      (id) =>
        `<li>${labChip(id)}${
          optional.has(id)
            ? ` <span class="badge">${i18n({ ja: "任意", en: "Optional" })}</span>`
            : ""
        }</li>`,
    )
    .join("\n");
  return `<article class="card" id="journey-${journey.id}">
  <div class="card__top"><span class="path-number">${journey.number}</span></div>
  <h3>${i18n(journey.title)}</h3>
  <p>${i18n(journey.summary)}</p>
  <ol class="journey-route">${labList}</ol>
</article>`;
}

function trackCard(track) {
  const integrative = new Set(track.integrativeLabs || []);
  const labList = track.labs
    .map((id, index) => {
      const stage = integrative.has(id)
        ? { ja: "統合", en: "Integrative" }
        : index === 0
          ? { ja: "基礎", en: "Foundation" }
          : index === track.labs.length - 1
            ? { ja: "高度", en: "Advanced" }
            : { ja: "中核", en: "Core" };
      return `<li><span class="badge badge--accent">${i18n(stage)}</span> ${labChip(id)}</li>`;
    })
    .join("\n");
  return `<article class="card" id="track-${track.id}">
  <div class="card__top"><span class="path-number">${track.number}</span></div>
  <h3>${i18n(track.title)}</h3>
  <p>${i18n(track.summary)}</p>
  <ol class="track-progression">${labList}</ol>
</article>`;
}

function learningMatrix() {
  const header = journeys.map((journey) => `<th scope="col">${journey.number}. ${i18n(journey.title)}</th>`).join("\n");
  const rows = tracks
    .map((track) => {
      const cells = journeys
        .map((journey) => {
          const intersection = track.labs.filter((id) => journey.labs.includes(id));
          const content = intersection.length
            ? `<ul class="plain-list matrix-cell-labs">${intersection.map((id) => `<li><a href="${filenameById.get(id)}"><span class="mono">${id}</span><span class="sr-only"> ${i18n(byId.get(id).title)}</span></a></li>`).join("")}</ul>`
            : `<span class="muted">—</span>`;
          return `<td>${content}</td>`;
        })
        .join("\n");
      return `<tr><th scope="row">${track.number}. ${i18n(track.title)}</th>${cells}</tr>`;
    })
    .join("\n");
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="Journey by track coverage matrix">
  <table>
    <caption class="sr-only">${i18n({ ja: "10トラック x 6ジャーニーのラボ対応表", en: "10 tracks by 6 journeys lab coverage table" })}</caption>
    <thead><tr><th scope="col">${i18n({ ja: "トラック ＼ ジャーニー", en: "Track \\ Journey" })}</th>${header}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;
}

function indexPage() {
  const journeyOptions = journeys.map((journey) => ({ value: journey.id, label: bi(`${journey.number}. ${journey.title.ja}`, `${journey.number}. ${journey.title.en}`) }));
  const trackOptions = tracks.map((track) => ({ value: track.id, label: bi(`${track.number}. ${track.title.ja}`, `${track.number}. ${track.title.en}`) }));
  const difficultyOptions = difficultyOrder.map((key) => {
    const lab = labs.find((item) => item.difficulty.key === key);
    return { value: key, label: lab.difficulty.label };
  });
  const statusOptions = statusOrder.filter((key) => labs.some((item) => item.status.key === key)).map((key) => {
    const lab = labs.find((item) => item.status.key === key);
    return { value: key, label: lab.status.label };
  });
  const platformOptions = platformKeys.map((key) => ({ value: key, label: bi(platformLabel[key], platformLabel[key]) }));
  const timeOptions = timeBuckets.map((value) => ({ value, label: bi(`${value}分`, `${value} min`) }));
  const provenanceOptions = ["docs", "release-notes", "mixed"].map((key) => ({ value: key, label: provenanceLabel(key) }));

  const journeySections = journeys.map((journey) => journeyCard(journey)).join("\n");
  const trackSections = tracks.map((track) => trackCard(track)).join("\n");
  const labCards = labs.map((lab) => labCard(lab)).join("\n");

  return `${head(
    "GitHub Copilot App v1.1.4 — 25 hands-on labs across 6 journeys and 10 tracks",
    "Bilingual two-dimensional learning system for GitHub Copilot App v1.1.4: 25 atomic labs reachable through 6 outcome journeys and 10 domain tracks, with local-only progress.",
  )}
<body data-guide-count="25">
${header()}
<section class="hero" aria-labelledby="hands-title">
  <div class="hero__inner">
    <p class="eyebrow">6 journeys · 10 tracks · 25 labs · Local-only progress</p>
    <h1 id="hands-title">${i18n({ ja: "GitHub Copilot App v1.1.4 ハンズオン", en: "GitHub Copilot App v1.1.4 hands-on" })}</h1>
    <p class="lede">${i18n({ ja: "同じ25個の実践ラボを、成果を横断する6つのジャーニーと、領域を深掘りする10のトラックの両方から進められます。アカウントやバックエンドなしで、進捗はこのブラウザーだけに保存されます。", en: "Reach the same 25 hands-on labs through six outcome-spanning journeys or ten domain-deep tracks. Progress is saved only in this browser, with no account or backend." })}</p>
    <div class="hero-actions">
      <a class="button button--primary" href="#labs" data-resume-link>${i18n({ ja: "再開: ", en: "Resume: " })}<span data-resume-title>${i18n({ ja: "ラボ 01", en: "Lab 01" })}</span> ${svg(icons.arrowRight)}</a>
      <a class="button" href="#journeys">${i18n({ ja: "ジャーニーを見る", en: "View journeys" })}</a>
      <a class="button" href="#tracks">${i18n({ ja: "トラックを見る", en: "View tracks" })}</a>
      <a class="button" href="#learning-matrix">${i18n({ ja: "学習マトリクス", en: "Learning matrix" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="section" id="journeys">
    <div class="section-heading"><p class="eyebrow">Horizontal · outcome-spanning</p><h2>${i18n({ ja: "6つのジャーニー", en: "6 journeys" })}</h2><p>${i18n({ ja: "1つの成果を最初から最後まで到達するために、複数のトラックを横断してラボを並べたルートです。", en: "Ordered routes across multiple tracks that carry one outcome from start to finish." })}</p></div>
    <div class="card-grid">${journeySections}</div>
  </section>

  <section class="section" id="tracks">
    <div class="section-heading"><p class="eyebrow">Vertical · domain-deep</p><h2>${i18n({ ja: "10のトラック", en: "10 tracks" })}</h2><p>${i18n({ ja: "1つの領域を基礎から高度な操作まで深掘りするラボの並びです。", en: "A sequence of labs that goes deep on a single domain from basics to advanced operation." })}</p></div>
    <div class="card-grid">${trackSections}</div>
  </section>

  <section class="section" id="learning-matrix">
    <div class="section-heading"><p class="eyebrow">Coverage</p><h2>${i18n({ ja: "学習マトリクス: トラック x ジャーニー", en: "Learning matrix: tracks x journeys" })}</h2><p>${i18n({ ja: "各セルは、その行のトラックと列のジャーニーの両方に属するラボ番号を示します。「—」は意図した非重複であり、未実装のラボを意味しません。すべてのラボは少なくとも1つのジャーニーと1つのトラックに属します。", en: "Each cell lists labs belonging to both the row's track and the column's journey. An em dash marks an intentional non-overlap, not a missing lab. Every lab belongs to at least one journey and one track." })}</p></div>
    ${learningMatrix()}
  </section>

  <section class="section" id="labs">
    <div class="page-grid page-grid--wide">
      <div>
        <div class="filter-panel" aria-labelledby="lab-filter-title">
          <h2 id="lab-filter-title">${i18n({ ja: "25 ラボを検索・絞り込み", en: "Search and filter 25 labs" })}</h2>
          <div class="field"><label for="lab-search">${i18n({ ja: "キーワード", en: "Keyword" })}</label><input id="lab-search" type="search" data-guide-search placeholder="WSL, Agent Merge, worktree…"></div>
          <div class="filter-groups">
            ${filterGroup({ id: "filter-journey", legend: bi("ジャーニー（複数選択可）", "Journey (multi-select)"), group: "journeys", options: journeyOptions })}
            ${filterGroup({ id: "filter-track", legend: bi("トラック（複数選択可）", "Track (multi-select)"), group: "tracks", options: trackOptions })}
            ${filterGroup({ id: "filter-difficulty", legend: bi("難易度（複数選択可）", "Difficulty (multi-select)"), group: "difficulty", options: difficultyOptions })}
            ${filterGroup({ id: "filter-status", legend: bi("提供状況（複数選択可）", "Status (multi-select)"), group: "status", options: statusOptions })}
            ${filterGroup({ id: "filter-platform", legend: bi("プラットフォーム（複数選択可）", "Platform (multi-select)"), group: "platforms", options: platformOptions })}
            ${filterGroup({ id: "filter-time", legend: bi("所要時間（複数選択可）", "Time (multi-select)"), group: "time", options: timeOptions })}
            <p class="muted">${i18n({ ja: "時間filterはhands-on操作の目安です。CI、review、schedule、queue、service latencyの待ち時間は含みません。", en: "Time filters estimate hands-on work only; they exclude waits for CI, review, schedules, queues, and service latency." })}</p>
            ${filterGroup({ id: "filter-provenance", legend: bi("情報源の裏付け（複数選択可）", "Source provenance (multi-select)"), group: "provenance", options: provenanceOptions })}
          </div>
          <div class="hero-actions">
            <button class="button" type="button" data-filter-reset>${i18n({ ja: "フィルターをリセット", en: "Reset filters" })}</button>
          </div>
          <p class="muted" role="status" aria-live="polite" data-guide-filter-status>${i18n({ ja: "25件中25件を表示", en: "Showing 25 of 25" })}</p>
          <noscript><p class="callout">${i18n({ ja: "JavaScriptが無効なためfilter、copy feedback、進捗保存は使えませんが、25ラボの本文とJA/EN内容はすべて読めます。", en: "Without JavaScript, filters, copy feedback, and progress persistence are unavailable, but all 25 labs and both JA/EN editions remain readable." })}</p></noscript>
        </div>
      </div>
      <aside class="progress-panel" aria-label="Learning progress">
        <h2>${i18n({ ja: "学習進捗", en: "Learning progress" })}</h2>
        <p data-progress-count>0 / 25</p>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="25" aria-label="Learning progress"><div class="progress-track__fill" data-progress-fill></div></div>
        <button class="progress-button" type="button" data-progress-reset>${i18n({ ja: "進捗をリセット", en: "Reset progress" })}</button>
      </aside>
    </div>
    <div class="card-grid">${labCards}</div>
  </section>
</main>
${footer()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

const outDir = "copilot-app-v1.1.4-hands-on";
await mkdir(join(outDir, "assets"), { recursive: true });
await copyFile("copilot-app-v1.1.4/assets/style.css", join(outDir, "assets/style.css"));
await copyFile("copilot-app-v1.1.4/assets/app.js", join(outDir, "assets/app.js"));

let rendered = 0;
for (const [index, lab] of labs.entries()) {
  await writeFile(join(outDir, filenameById.get(lab.id)), cleanHtml(labPage(lab, index)), "utf8");
  rendered += 1;
}
await writeFile(join(outDir, "index.html"), cleanHtml(indexPage()), "utf8");

console.log(
  `Rendered ${rendered} lab pages, 1 index page, and copied 2 shared assets into ${outDir}/ ` +
    `(6 journeys, 10 tracks, 25 labs — 4 new: ${["22", "23", "24", "25"].map((id) => filenameById.get(id)).join(", ")})`,
);
