import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const partial = process.argv.includes("--partial");
const manifest = JSON.parse(await readFile("scripts/guide-content/manifest.json", "utf8"));
const contentFiles = (await readdir("scripts/guide-content"))
  .filter((name) => /^path-\d+\.json$/.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const content = await Promise.all(
  contentFiles.map(async (name) => JSON.parse(await readFile(join("scripts/guide-content", name), "utf8"))),
);
const guides = content.flatMap((path) => path.guides);
const guideById = new Map(guides.map((guide) => [guide.id, guide]));
const orderedEntries = manifest.paths.flatMap((path) =>
  path.guides.map((entry) => ({ ...entry, path })),
);

if (!partial && guides.length !== manifest.guideCount) {
  throw new Error(`Expected ${manifest.guideCount} guide records; found ${guides.length}`);
}

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
  if (!value?.ja || !value?.en) {
    throw new Error(`Missing bilingual value: ${JSON.stringify(value)}`);
  }
  const classAttribute = className ? ` ${className}` : "";
  return `<span class="ja${classAttribute}" lang="ja">${inlineMarkdown(value.ja)}</span><span class="en${classAttribute}" lang="en">${inlineMarkdown(value.en)}</span>`;
}

function octicon(path, size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"></path></svg>`;
}

const icons = {
  mark: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z",
  book: "M0 1.75C0 .784.784 0 1.75 0h4.5C7.216 0 8 .784 8 1.75v12.5A1.75 1.75 0 006.25 12.5h-4.5a.25.25 0 00-.25.25v1.5c0 .138.112.25.25.25h4.5a.75.75 0 010 1.5h-4.5A1.75 1.75 0 010 14.25Zm9.75-1.75h4.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0114.25 16h-4.5a.75.75 0 010-1.5h4.5a.25.25 0 00.25-.25v-1.5a.25.25 0 00-.25-.25h-4.5A1.75 1.75 0 008 14.25V1.75A1.75 1.75 0 019.75 0Z",
  globe: "M8 0a8 8 0 100 16A8 8 0 008 0ZM5.78 8.75a9.64 9.64 0 001.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0010.22 8.75Zm4.44-1.5a9.64 9.64 0 00-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 00-.857 1.215A9.64 9.64 0 005.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 004.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.437-2.874-1.581-4.948Zm-2.733-1.5h2.733c.144-2.074.866-3.756 1.58-4.948.12-.197.237-.381.353-.552a6.507 6.507 0 00-4.666 5.5Zm10.181 1.5c-.144 2.074-.866 3.756-1.58 4.948-.12.197-.237.381-.353.552a6.507 6.507 0 004.666-5.5Zm2.733-1.5a6.507 6.507 0 00-4.666-5.5c.123.181.24.365.352.552.715 1.192 1.437 2.874 1.581 4.948Z",
  sun: "M8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13z",
  arrowLeft: "M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h8.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06Z",
  arrowRight: "M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L11.44 8.5H1.75a.75.75 0 010-1.5h9.69L8.22 4.03a.75.75 0 010-1.06Z",
};

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
    <a class="brand" href="index.html" aria-label="GitHub Copilot App v1.1.2 hands-on">
      <span class="brand__mark">${octicon(icons.mark, 26)}</span>
      <span>GitHub Copilot <span class="brand__version">App</span></span>
    </a>
    <span class="version-pill version-pill--current">v1.1.2</span>
    <nav class="header-nav" aria-label="Primary">
      <a href="../copilot-app/"><span class="header-nav__label">${i18n({ ja: "バージョンハブ", en: "Version hub" })}</span></a>
      <a href="../copilot-app-v1.1.2/"><span class="header-nav__label">${i18n({ ja: "機能ガイド", en: "Feature guide" })}</span></a>
      <button class="icon-button" type="button" data-language-toggle><span aria-hidden="true">${octicon(icons.globe)}</span><span data-toggle-label>EN</span></button>
      <button class="icon-button" type="button" data-theme-toggle><span aria-hidden="true">${octicon(icons.sun)}</span><span class="header-nav__label" data-toggle-label>Dark</span></button>
    </nav>
  </div>
</header>`;
}

function codeBlock(command, guideId, index) {
  const codeId = `guide-${guideId}-code-${index}`;
  return `<div class="code-block">
  <div class="code-block__label">
    <span>${i18n(command.label)}</span>
    <button class="copy-button" type="button" data-copy="${codeId}" data-ja-label="コピー" data-en-label="Copy">${i18n({ ja: "コピー", en: "Copy" })}</button>
  </div>
  <pre><code id="${codeId}" data-language="${escapeHtml(command.language || "text")}">${escapeHtml(command.code)}</code></pre>
</div>`;
}

function guidePage(guide, entry, index) {
  const commandById = new Map((guide.commands || []).map((command) => [command.id, command]));
  const previousEntry = orderedEntries[index - 1];
  const nextEntry = orderedEntries[index + 1];
  const previousGuide = previousEntry ? guideById.get(previousEntry.id) : null;
  const nextGuide = nextEntry ? guideById.get(nextEntry.id) : null;
  const related = guide.related
    .map((id) => {
      const relatedEntry = orderedEntries.find((candidate) => candidate.id === id);
      const relatedGuide = guideById.get(id);
      if (!relatedEntry) throw new Error(`Unknown related guide ${id} in guide ${guide.id}`);
      return `<li><a href="${relatedEntry.filename}"><span class="mono">${id}</span> ${relatedGuide ? i18n(relatedGuide.title) : `Guide ${id}`}</a></li>`;
    })
    .join("\n");
  let codeIndex = 0;

  const steps = guide.steps
    .map((step) => {
      const paragraphs = step.body.map((paragraph) => `<p>${i18n(paragraph)}</p>`).join("\n");
      const commands = (step.commandIds || [])
        .map((id) => {
          const command = commandById.get(id);
          if (!command) throw new Error(`Unknown command ${id} in guide ${guide.id}`);
          codeIndex += 1;
          return codeBlock(command, guide.id, codeIndex);
        })
        .join("\n");
      return `<li class="step">
  <h3>${i18n(step.title)}</h3>
  ${paragraphs}
  ${commands}
  <div class="step__expected"><strong>${i18n({ ja: "期待される結果", en: "Expected result" })}:</strong> ${i18n(step.expected)}</div>
</li>`;
    })
    .join("\n");

  const launchers = (guide.launchers || [])
    .map(
      (launcher) => `<article class="card">
  <h3>${i18n(launcher.label)}</h3>
  <p>${i18n(launcher.description)}</p>
  <div class="card-actions"><a class="button" href="${escapeHtml(launcher.url)}" rel="noopener noreferrer">${i18n({ ja: "公式リンクを開く", en: "Open official link" })} ${octicon(icons.arrowRight)}</a></div>
</article>`,
    )
    .join("\n");

  const troubleshooting = guide.troubleshooting
    .map(
      (item) => `<details>
  <summary>${i18n(item.problem)}</summary>
  <div class="details-body"><p>${i18n(item.fix)}</p></div>
</details>`,
    )
    .join("\n");

  const platforms = Object.entries(guide.platforms)
    .map(
      ([platform, note]) => `<article class="card"><h3>${escapeHtml(platform === "macos" ? "macOS" : platform === "wsl" ? "WSL" : platform[0].toUpperCase() + platform.slice(1))}</h3><p>${i18n(note)}</p></article>`,
    )
    .join("\n");

  const title = `GitHub Copilot App v1.1.2 — ${guide.title.en}`;
  const path = entry.path;
  return `${head(title, guide.summary.en)}
<body data-guide-id="${guide.id}" data-guide-count="${manifest.guideCount}">
${header()}
<section class="hero" aria-labelledby="guide-title">
  <div class="hero__inner">
    <p class="eyebrow">${i18n({ ja: `学習パス ${path.number} · ガイド ${guide.id}`, en: `Learning path ${path.number} · Guide ${guide.id}` })}</p>
    <h1 id="guide-title">${i18n(guide.title)}</h1>
    <p class="lede">${i18n(guide.summary)}</p>
    <div class="meta-row" aria-label="Guide metadata">
      <span class="badge">${i18n(guide.difficulty.label)}</span>
      <span class="badge badge--accent">${i18n(guide.status.label)}</span>
      <span class="badge">${i18n(guide.version)}</span>
    </div>
    <div class="hero-actions">
      <a class="button button--primary" href="#steps">${i18n({ ja: "手順を始める", en: "Start the steps" })} ${octicon(icons.arrowRight)}</a>
      <a class="button" href="index.html#guides">${octicon(icons.arrowLeft)} ${i18n({ ja: "21 ガイド一覧", en: "All 21 guides" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <div class="page-grid">
    <div class="main-content">
      <section class="section" id="scenario">
        <div class="section-heading">
          <p class="eyebrow">Scenario &amp; scope</p>
          <h2>${i18n({ ja: "シナリオと対象範囲", en: "Scenario and scope" })}</h2>
        </div>
        <div class="card-grid">
          <article class="card"><h3>${i18n({ ja: "具体的なシナリオ", en: "Concrete scenario" })}</h3><p>${i18n(guide.scenario)}</p></article>
          <article class="card"><h3>${i18n({ ja: "機能の境界", en: "Feature boundary" })}</h3><p>${i18n(guide.scope)}</p></article>
        </div>
        <div class="callout callout--warning"><strong>${i18n({ ja: "安全上の注意", en: "Safety note" })}:</strong> ${i18n(guide.safety)}</div>
      </section>

      <section class="section" id="prerequisites">
        <div class="section-heading"><p class="eyebrow">Prepare</p><h2>${i18n({ ja: "前提条件", en: "Prerequisites" })}</h2></div>
        <ul>${guide.prerequisites.map((item) => `<li>${i18n(item)}</li>`).join("\n")}</ul>
      </section>

      ${
        launchers
          ? `<section class="section" id="launchers">
        <div class="section-heading"><p class="eyebrow">Open safely</p><h2>${i18n({ ja: "公式リンクとランチャー", en: "Official links and launchers" })}</h2></div>
        <div class="card-grid">${launchers}</div>
      </section>`
          : ""
      }

      <section class="section" id="steps">
        <div class="section-heading"><p class="eyebrow">Hands-on</p><h2>${i18n({ ja: "手順", en: "Steps" })}</h2></div>
        <ol class="steps">${steps}</ol>
      </section>

      <section class="section" id="results">
        <div class="section-heading"><p class="eyebrow">Verify</p><h2>${i18n({ ja: "完了時の確認", en: "Completion checks" })}</h2></div>
        <ul>${guide.expected.map((item) => `<li>${i18n(item)}</li>`).join("\n")}</ul>
      </section>

      <section class="section" id="troubleshooting">
        <div class="section-heading"><p class="eyebrow">Recover</p><h2>${i18n({ ja: "トラブルシューティング", en: "Troubleshooting" })}</h2></div>
        ${troubleshooting}
      </section>

      <section class="section" id="cleanup">
        <div class="section-heading"><p class="eyebrow">Reset</p><h2>${i18n({ ja: "クリーンアップとリセット", en: "Cleanup and reset" })}</h2></div>
        <ol>${guide.cleanup.map((item) => `<li>${i18n(item)}</li>`).join("\n")}</ol>
      </section>

      <section class="section" id="platforms">
        <div class="section-heading"><p class="eyebrow">Platforms</p><h2>${i18n({ ja: "プラットフォーム別の注意", en: "Platform-specific notes" })}</h2></div>
        <div class="card-grid">${platforms}</div>
      </section>

      <section class="section" id="sources">
        <div class="section-heading"><p class="eyebrow">Grounding</p><h2>${i18n({ ja: "公式ソース", en: "Official sources" })}</h2></div>
        <ul class="source-list">${guide.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" rel="noopener noreferrer">${escapeHtml(source.title)}</a></li>`).join("\n")}</ul>
      </section>

      <section class="section" id="related">
        <div class="section-heading"><p class="eyebrow">Continue</p><h2>${i18n({ ja: "関連ガイド", en: "Related guides" })}</h2></div>
        <ul>${related}</ul>
      </section>

      <nav class="guide-pagination" aria-label="Guide navigation">
        ${
          previousEntry
            ? `<a href="${previousEntry.filename}">${octicon(icons.arrowLeft)} <span class="muted">${i18n({ ja: "前のガイド", en: "Previous guide" })}</span><br><strong>${previousGuide ? i18n(previousGuide.title) : `Guide ${previousEntry.id}`}</strong></a>`
            : `<a href="index.html">${octicon(icons.arrowLeft)} <span class="muted">${i18n({ ja: "ガイド一覧", en: "Guide index" })}</span><br><strong>${i18n({ ja: "学習パスを選ぶ", en: "Choose a learning path" })}</strong></a>`
        }
        ${
          nextEntry
            ? `<a href="${nextEntry.filename}"><span class="muted">${i18n({ ja: "次のガイド", en: "Next guide" })}</span> ${octicon(icons.arrowRight)}<br><strong>${nextGuide ? i18n(nextGuide.title) : `Guide ${nextEntry.id}`}</strong></a>`
            : `<a href="../copilot-app-v1.1.2/"><span class="muted">${i18n({ ja: "次へ", en: "Next" })}</span> ${octicon(icons.arrowRight)}<br><strong>${i18n({ ja: "機能ガイドへ戻る", en: "Return to feature guide" })}</strong></a>`
        }
      </nav>
    </div>

    <aside class="sticky-panel" aria-label="Guide progress and navigation">
      <div class="progress-panel">
        <h2>${i18n({ ja: "学習進捗", en: "Learning progress" })}</h2>
        <p data-progress-count>0 / ${manifest.guideCount}</p>
        <div class="progress-track" role="progressbar" aria-label="Learning progress" aria-valuemin="0" aria-valuemax="${manifest.guideCount}"><div class="progress-track__fill" data-progress-fill></div></div>
        <button class="progress-button" type="button" data-guide-complete aria-pressed="false">${i18n({ ja: "このガイドを完了にする", en: "Mark this guide complete" })}</button>
      </div>
      <nav class="on-this-page" aria-labelledby="on-this-page-title">
        <h2 id="on-this-page-title">${i18n({ ja: "このページ", en: "On this page" })}</h2>
        <ol>
          <li><a href="#scenario">${i18n({ ja: "シナリオと対象範囲", en: "Scenario and scope" })}</a></li>
          <li><a href="#prerequisites">${i18n({ ja: "前提条件", en: "Prerequisites" })}</a></li>
          <li><a href="#steps">${i18n({ ja: "手順", en: "Steps" })}</a></li>
          <li><a href="#results">${i18n({ ja: "完了時の確認", en: "Completion checks" })}</a></li>
          <li><a href="#troubleshooting">${i18n({ ja: "トラブルシューティング", en: "Troubleshooting" })}</a></li>
          <li><a href="#cleanup">${i18n({ ja: "クリーンアップ", en: "Cleanup" })}</a></li>
          <li><a href="#sources">${i18n({ ja: "公式ソース", en: "Official sources" })}</a></li>
        </ol>
      </nav>
    </aside>
  </div>
</main>
<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__links">
      <a href="../copilot-app/">${i18n({ ja: "安定版ハブ", en: "Stable hub" })}</a>
      <a href="../copilot-app-v1.1.2/">${i18n({ ja: "v1.1.2 機能ガイド", en: "v1.1.2 feature guide" })}</a>
      <a href="../copilot-app-v1.1.2/releases.html">${i18n({ ja: "全リリース差分", en: "Full release delta" })}</a>
      <a href="../copilot-app-v1.0.12-hands-on/">${i18n({ ja: "v1.0.12 アーカイブ", en: "v1.0.12 archive" })}</a>
    </div>
    <p>${i18n({ ja: "非公式の学習ガイドです。機能の可用性とポリシーは公式ドキュメントを確認してください。", en: "This is an unofficial learning guide. Confirm feature availability and policy details in the official documentation." })}</p>
  </div>
</footer>
</body>
</html>`;
}

await mkdir("copilot-app-v1.1.2-hands-on/assets", { recursive: true });
await copyFile("copilot-app-v1.1.2/assets/style.css", "copilot-app-v1.1.2-hands-on/assets/style.css");
await copyFile("copilot-app-v1.1.2/assets/app.js", "copilot-app-v1.1.2-hands-on/assets/app.js");

let rendered = 0;
for (const [index, entry] of orderedEntries.entries()) {
  const guide = guideById.get(entry.id);
  if (!guide) {
    if (partial) continue;
    throw new Error(`Missing guide content for ${entry.id}`);
  }
  if (guide.id !== entry.id) throw new Error(`Guide id mismatch for ${entry.filename}`);
  await writeFile(
    join("copilot-app-v1.1.2-hands-on", entry.filename),
    cleanHtml(guidePage(guide, entry, index)),
    "utf8",
  );
  rendered += 1;
}

console.log(`Rendered ${rendered} guide page${rendered === 1 ? "" : "s"}`);
