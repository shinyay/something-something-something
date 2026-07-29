import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const matrix = JSON.parse(await readFile("copilot-app-v1.1.2/assets/release-matrix.json", "utf8"));
const manifest = JSON.parse(await readFile("scripts/guide-content/manifest.json", "utf8"));
const guideFiles = (await readdir("scripts/guide-content"))
  .filter((name) => /^path-\d+\.json$/.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const guides = (
  await Promise.all(
    guideFiles.map(async (name) => JSON.parse(await readFile(join("scripts/guide-content", name), "utf8"))),
  )
).flatMap((path) => path.guides);
const guideById = new Map(guides.map((guide) => [guide.id, guide]));

if (matrix.versionCount !== 17 || matrix.itemCount !== 462) {
  throw new Error("Release matrix must contain 17 versions and 462 items");
}
if (manifest.paths.length !== 5 || guides.length !== 21 || guideById.size !== 21) {
  throw new Error("Hands-on content must contain five paths and 21 unique guides");
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

const icons = {
  mark: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z",
  globe: "M8 0a8 8 0 100 16A8 8 0 008 0ZM5.78 8.75a9.64 9.64 0 001.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0010.22 8.75Zm4.44-1.5a9.64 9.64 0 00-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 00-.857 1.215A9.64 9.64 0 005.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 004.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.437-2.874-1.581-4.948Zm-2.733-1.5h2.733c.144-2.074.866-3.756 1.58-4.948.12-.197.237-.381.353-.552a6.507 6.507 0 00-4.666 5.5Zm10.181 1.5c-.144 2.074-.866 3.756-1.58 4.948-.12.197-.237.381-.353.552a6.507 6.507 0 004.666-5.5Zm2.733-1.5a6.507 6.507 0 00-4.666-5.5c.123.181.24.365.352.552.715 1.192 1.437 2.874 1.581 4.948Z",
  sun: "M8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13z",
  arrow: "M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L11.44 8.5H1.75a.75.75 0 010-1.5h9.69L8.22 4.03a.75.75 0 010-1.06Z",
};

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

function i18n(value) {
  if (!value?.ja || !value?.en) throw new Error(`Missing bilingual value: ${JSON.stringify(value)}`);
  return `<span class="ja" lang="ja">${inlineMarkdown(value.ja)}</span><span class="en" lang="en">${inlineMarkdown(value.en)}</span>`;
}

function optionLabel(value) {
  return `${escapeHtml(value.ja)} / ${escapeHtml(value.en)}`;
}

function svg(path, size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function documentHead({ title, description, assetPrefix = "assets" }) {
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
<link rel="stylesheet" href="${assetPrefix}/style.css">
<script src="${assetPrefix}/app.js" defer></script>
</head>`;
}

function siteHeader({ home, links }) {
  return `<a class="skip-link" href="#main">${i18n({ ja: "本文へ移動", en: "Skip to main content" })}</a>
<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="${home}">
      <span class="brand__mark">${svg(icons.mark, 26)}</span>
      <span>GitHub Copilot <span class="brand__version">App</span></span>
    </a>
    <span class="version-pill version-pill--current">v1.1.2</span>
    <nav class="header-nav" aria-label="Primary">
      ${links.map((link) => `<a href="${link.href}"><span class="header-nav__label">${i18n(link.label)}</span></a>`).join("\n")}
      <button class="icon-button" type="button" data-language-toggle>${svg(icons.globe)}<span data-toggle-label>EN</span></button>
      <button class="icon-button" type="button" data-theme-toggle>${svg(icons.sun)}<span class="header-nav__label" data-toggle-label>Dark</span></button>
    </nav>
  </div>
</header>`;
}

function footer(prefix = "..") {
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__links">
      <a href="${prefix}/copilot-app/">${i18n({ ja: "安定版ハブ", en: "Stable hub" })}</a>
      <a href="${prefix}/copilot-app-v1.1.2/">${i18n({ ja: "v1.1.2 機能ガイド", en: "v1.1.2 feature guide" })}</a>
      <a href="${prefix}/copilot-app-v1.1.2/releases.html">${i18n({ ja: "全リリース差分", en: "Full release delta" })}</a>
      <a href="${prefix}/copilot-app-v1.1.2-hands-on/">${i18n({ ja: "21 ハンズオン", en: "21 hands-on guides" })}</a>
      <a href="${prefix}/copilot-app-v1.0.12/">${i18n({ ja: "v1.0.12 アーカイブ", en: "v1.0.12 archive" })}</a>
    </div>
    <p>${i18n({ ja: "非公式ガイドです。製品の可用性、ポリシー、料金は公式ソースを確認してください。", en: "This is an unofficial guide. Confirm product availability, policy, and pricing in official sources." })}</p>
  </div>
</footer>`;
}

function card({ eyebrow, title, body, badge, href, action }) {
  return `<article class="card">
  <div class="card__top">${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : "<span></span>"}${badge ? `<span class="badge ${badge.className || ""}">${i18n(badge.label)}</span>` : ""}</div>
  <h3>${i18n(title)}</h3>
  <p>${i18n(body)}</p>
  ${href ? `<div class="card-actions"><a class="button" href="${href}">${i18n(action || { ja: "開く", en: "Open" })} ${svg(icons.arrow)}</a></div>` : ""}
</article>`;
}

function renderHub() {
  return `${documentHead({
    title: "GitHub Copilot App — Version hub",
    description: "Stable bilingual hub for the current GitHub Copilot App guide and archived versions.",
    assetPrefix: "../copilot-app-v1.1.2/assets",
  })}
<body>
${siteHeader({
  home: "./",
  links: [
    { href: "../copilot-app-v1.1.2/", label: { ja: "最新ガイド", en: "Latest guide" } },
    { href: "../copilot-app-v1.1.2-hands-on/", label: { ja: "ハンズオン", en: "Hands-on" } },
    { href: "../copilot-app-v1.1.2/releases.html", label: { ja: "リリース差分", en: "Releases" } },
  ],
})}
<section class="hero" aria-labelledby="hub-title">
  <div class="hero__inner">
    <p class="eyebrow">Stable entry · Last checked 2026-07-29</p>
    <h1 id="hub-title">${i18n({ ja: "GitHub Copilot App バージョンハブ", en: "GitHub Copilot App version hub" })}</h1>
    <p class="lede">${i18n({ ja: "常に最新ガイドへ到達できる安定 URL です。現在版 v1.1.2 と、履歴として保存した v1.0.12 を明確に分けています。", en: "A stable URL that always leads to the latest guide, with current v1.1.2 clearly separated from the preserved v1.0.12 archive." })}</p>
    <div class="hero-actions">
      <a class="button button--primary" href="../copilot-app-v1.1.2/">${i18n({ ja: "v1.1.2 機能ガイド", en: "v1.1.2 feature guide" })} ${svg(icons.arrow)}</a>
      <a class="button" href="../copilot-app-v1.1.2-hands-on/">${i18n({ ja: "21 ガイドで体験", en: "Learn with 21 guides" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="section">
    <div class="section-heading"><p class="eyebrow">Current</p><h2>${i18n({ ja: "現在の推奨バージョン", en: "Current recommended version" })}</h2></div>
    <div class="card-grid">
      ${card({ eyebrow: "v1.1.2", title: { ja: "完全機能ガイド", en: "Complete feature guide" }, body: { ja: "現在の機能、要件、可用性、ポリシー、モデル、ワークフローを俯瞰します。", en: "Survey current capabilities, requirements, availability, policies, models, and workflows." }, href: "../copilot-app-v1.1.2/", action: { ja: "機能ガイドを開く", en: "Open feature guide" }, badge: { className: "badge--success", label: { ja: "現在版", en: "Current" } } })}
      ${card({ eyebrow: "17 releases · 462 items", title: { ja: "v1.0.12 からの全差分", en: "Full delta from v1.0.12" }, body: { ja: "v1.0.13 から v1.1.2 まで、公式 462 項目を英語原文と日本語訳で検索できます。", en: "Search all 462 official items from v1.0.13 through v1.1.2 in original English and Japanese." }, href: "../copilot-app-v1.1.2/releases.html", action: { ja: "リリースを検索", en: "Explore releases" } })}
      ${card({ eyebrow: "5 paths · 21 guides", title: { ja: "ハンズオン学習", en: "Hands-on learning" }, body: { ja: "進捗を端末内に保存しながら、開始、並列作業、GitHub ライフサイクル、自動化、運用を学びます。", en: "Learn setup, parallel work, the GitHub lifecycle, automation, and operations with local-only progress." }, href: "../copilot-app-v1.1.2-hands-on/", action: { ja: "学習パスを選ぶ", en: "Choose a path" } })}
    </div>
  </section>
  <section class="section">
    <div class="section-heading"><p class="eyebrow">Official</p><h2>${i18n({ ja: "公式ダウンロードとドキュメント", en: "Official download and documentation" })}</h2></div>
    <div class="button-row">
      <a class="button button--primary" href="https://github.com/features/ai/github-app" rel="noopener noreferrer">${i18n({ ja: "公式ダウンロード", en: "Official download" })}</a>
      <a class="button" href="https://docs.github.com/en/copilot/concepts/agents/github-copilot-app" rel="noopener noreferrer">${i18n({ ja: "公式概要", en: "Official overview" })}</a>
      <a class="button" href="https://github.com/github/app/releases/latest" rel="noopener noreferrer">${i18n({ ja: "最新リリース", en: "Latest release" })}</a>
    </div>
  </section>
  <section class="section">
    <div class="section-heading"><p class="eyebrow">Archive</p><h2>${i18n({ ja: "保存された旧版", en: "Preserved archive" })}</h2></div>
    <div class="card-grid">
      ${card({ eyebrow: "v1.0.12", title: { ja: "機能ガイド（アーカイブ）", en: "Feature guide (archive)" }, body: { ja: "2026-07-01 時点の歴史的スナップショットです。本文は当時の内容を保持しています。", en: "A historical snapshot as of 2026-07-01. Its body remains as originally published." }, href: "../copilot-app-v1.0.12/", action: { ja: "アーカイブを開く", en: "Open archive" }, badge: { label: { ja: "履歴", en: "Archive" } } })}
      ${card({ eyebrow: "15 guides", title: { ja: "旧ハンズオン（アーカイブ）", en: "Old hands-on guides (archive)" }, body: { ja: "v1.0.12 の 15 ガイドを履歴として参照できます。新規学習には v1.1.2 版を使ってください。", en: "Reference the 15 v1.0.12 guides as history. Use the v1.1.2 edition for new learning." }, href: "../copilot-app-v1.0.12-hands-on/", action: { ja: "旧ガイドを開く", en: "Open old guides" } })}
    </div>
  </section>
</main>
${footer("..")}
</body>
</html>`;
}

const capabilityCards = [
  {
    title: { ja: "My Work と GitHub ライフサイクル", en: "My Work and the GitHub lifecycle" },
    body: { ja: "Issue とプルリクエストを絞り込み、セッションを開始し、差分、レビュー、CI、マージまで同じアプリで進めます。", en: "Filter issues and pull requests, start sessions, and move through diffs, reviews, CI, and merge in one app." },
    badge: { ja: "提供中", en: "Available" },
  },
  {
    title: { ja: "分離セッションと並列作業", en: "Isolated sessions and parallel work" },
    body: { ja: "各ローカルセッションを専用 git worktree とブランチで分離し、Session Grid とサイドチャットで複数の作業を監督します。", en: "Isolate each local session in a dedicated git worktree and branch, then supervise several streams with Session Grid and side chats." },
    badge: { ja: "提供中", en: "Available" },
  },
  {
    title: { ja: "モード、モデル、Auto、BYOK", en: "Modes, models, Auto, and BYOK" },
    body: { ja: "Interactive、Plan、Autopilot、複数モデル、推論量、Auto を選び、必要に応じて独自モデルプロバイダーを追加します。", en: "Choose Interactive, Plan, or Autopilot plus models, reasoning effort, and Auto, with optional external model providers." },
    badge: { ja: "BYOK はプレビュー", en: "BYOK preview" },
    preview: true,
  },
  {
    title: { ja: "Quick chats、履歴、巻き戻し", en: "Quick chats, history, and rewind" },
    body: { ja: "作業ブランチを作らずに相談し、会話をアーカイブ、編集して巻き戻し、長い履歴を扱います。", en: "Brainstorm without a work branch, archive conversations, edit and rewind, and work with long histories." },
    badge: { ja: "提供中", en: "Available" },
  },
  {
    title: { ja: "Files、差分、ブラウザー、Present", en: "Files, diffs, browser, and Present" },
    body: { ja: "ファイル、コミット、未コミット差分を切り替え、行参照や HTML プレビューを使って成果を確認します。", en: "Switch among files, commits, and uncommitted changes, then verify outcomes with line references and HTML preview." },
    badge: { ja: "提供中", en: "Available" },
  },
  {
    title: { ja: "Canvases と成果物", en: "Canvases and artifacts" },
    body: { ja: "人とエージェントが同じ状態を双方向に編集できる、計画、ボード、文書、表計算などの共有サーフェスを作ります。", en: "Create shared surfaces for plans, boards, documents, and spreadsheets that people and agents can edit bidirectionally." },
    badge: { ja: "提供中", en: "Available" },
  },
  {
    title: { ja: "ローカルとクラウドの自動化", en: "Local and cloud automations" },
    body: { ja: "繰り返しプロンプトを手動またはスケジュールで実行し、クラウドではイベントトリガーと最小権限ツールを構成します。", en: "Run recurring prompts manually or on a schedule, with event triggers and least-privilege tools for cloud runs." },
    badge: { ja: "ポリシー依存", en: "Policy dependent" },
  },
  {
    title: { ja: "Custom agents、MCP、skills、plugins", en: "Custom agents, MCP, skills, and plugins" },
    body: { ja: "リポジトリまたはユーザーの信頼境界でエージェント、ツール、スキル、プラグイン、Canvas extensions を追加します。", en: "Add agents, tools, skills, plugins, and Canvas extensions within repository or user trust boundaries." },
    badge: { ja: "提供中", en: "Available" },
  },
  {
    title: { ja: "Agent Merge とレビュー対応", en: "Agent Merge and review response" },
    body: { ja: "CI やレビューのブロッカーをセッションに解決させ、GitHub の必須条件が満たされたときだけマージします。", en: "Let the session resolve CI and review blockers, merging only after GitHub's required conditions are satisfied." },
    badge: { ja: "提供中", en: "Available" },
  },
  {
    title: { ja: "Security review と rubber duck", en: "Security review and rubber duck" },
    body: { ja: "高信頼度の脆弱性候補と実装上の弱点を別視点で確認します。既存のセキュリティ制御を置き換える機能ではありません。", en: "Check high-confidence vulnerability candidates and implementation weaknesses from another perspective; these do not replace existing security controls." },
    badge: { ja: "一部プレビュー", en: "Partly preview" },
    preview: true,
  },
  {
    title: { ja: "クラウド、WSL、VS Code ハンドオフ", en: "Cloud, WSL, and VS Code handoff" },
    body: { ja: "クラウドサンドボックスで継続し、WSL リモート環境や新しい VS Code ウィンドウへ作業を渡します。", en: "Continue in a cloud sandbox, a WSL remote environment, or a new VS Code window." },
    badge: { ja: "Cloud はプレビュー", en: "Cloud preview" },
    preview: true,
  },
  {
    title: { ja: "Memory、Chronicle、Insights、運用", en: "Memory, Chronicle, Insights, and operations" },
    body: { ja: "永続的な指示とセッション履歴を区別し、利用傾向、アクセシビリティ、ストレージ、復旧を管理します。", en: "Separate durable guidance from session history, then manage usage patterns, accessibility, storage, and recovery." },
    badge: { ja: "境界に注意", en: "Mind the boundary" },
  },
];

function renderFeatureIndex() {
  const latest = matrix.releases[0];
  const counts = matrix.releases
    .flatMap((release) => release.items)
    .reduce((totals, item) => {
      totals[item.category] = (totals[item.category] || 0) + 1;
      return totals;
    }, {});
  const latestHighlights = latest.items.slice(0, 5);
  return `${documentHead({
    title: "GitHub Copilot App v1.1.2 — Complete feature guide",
    description: "Bilingual complete guide to GitHub Copilot App v1.1.2 and every change since v1.0.12.",
  })}
<body>
${siteHeader({
  home: "./",
  links: [
    { href: "../copilot-app/", label: { ja: "バージョンハブ", en: "Version hub" } },
    { href: "releases.html", label: { ja: "リリース差分", en: "Releases" } },
    { href: "../copilot-app-v1.1.2-hands-on/", label: { ja: "ハンズオン", en: "Hands-on" } },
  ],
})}
<section class="hero" aria-labelledby="feature-title">
  <div class="hero__inner">
    <p class="eyebrow">Current release · Published 2026-07-28</p>
    <h1 id="feature-title">GitHub Copilot App <span class="mono">v1.1.2</span></h1>
    <p class="lede">${i18n({ ja: "アイデア、並列セッション、レビュー、CI、マージまでを一つのデスクトップ体験で管理する現在版の完全ガイドです。v1.0.12 から 17 リリース、462 件の公式変更を追跡しています。", en: "A complete guide to the current desktop experience for managing ideas, parallel sessions, review, CI, and merge. It tracks 17 releases and 462 official changes since v1.0.12." })}</p>
    <div class="hero-actions">
      <a class="button button--primary" href="../copilot-app-v1.1.2-hands-on/">${i18n({ ja: "21 ガイドで試す", en: "Try 21 hands-on guides" })} ${svg(icons.arrow)}</a>
      <a class="button" href="releases.html">${i18n({ ja: "全 462 項目を検索", en: "Search all 462 items" })}</a>
      <a class="button" href="https://github.com/features/ai/github-app" rel="noopener noreferrer">${i18n({ ja: "公式ダウンロード", en: "Official download" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="section" id="summary">
    <div class="section-heading"><p class="eyebrow">Executive summary</p><h2>${i18n({ ja: "v1.0.12 から何が変わったか", en: "What changed since v1.0.12" })}</h2><p>${i18n({ ja: "単機能の追加だけでなく、並列作業の可視化、GitHub ライフサイクル、モデル選択、拡張性、アクセシビリティ、復旧性が段階的に成熟しました。", en: "Beyond individual features, parallel-work visibility, the GitHub lifecycle, model choice, extensibility, accessibility, and recovery matured release by release." })}</p></div>
    <div class="card-grid">
      ${card({ eyebrow: "17", title: { ja: "対象リリース", en: "Covered releases" }, body: { ja: "v1.0.13 から v1.1.2。v1.0.23 の独立サイトは作らず、全差分を現在版に統合しています。", en: "v1.0.13 through v1.1.2. There is no separate v1.0.23 site; the full delta is integrated here." } })}
      ${card({ eyebrow: String(counts.Added), title: { ja: "Added", en: "Added" }, body: { ja: "新しいセッション、レビュー、フィルター、モデル、拡張、運用サーフェス。", en: "New session, review, filter, model, extension, and operations surfaces." } })}
      ${card({ eyebrow: String(counts.Changed), title: { ja: "Changed", en: "Changed" }, body: { ja: "性能、レイアウト、ワークフロー、既定値、ポリシー判定を改善。", en: "Improved performance, layout, workflows, defaults, and policy evaluation." } })}
      ${card({ eyebrow: String(counts.Fixed), title: { ja: "Fixed", en: "Fixed" }, body: { ja: "安定性、アクセシビリティ、状態保持、差分、起動、クリップボードを継続修正。", en: "Ongoing fixes for stability, accessibility, state persistence, diffs, startup, and clipboard behavior." } })}
      ${card({ eyebrow: String(counts.Removed), title: { ja: "Removed", en: "Removed" }, body: { ja: "公式 Removed は 1 件。完全な文言はリリースエクスプローラーで確認できます。", en: "One official Removed item. See its exact wording in the release explorer." }, href: "releases.html?category=Removed", action: { ja: "全差分を確認", en: "View the full delta" } })}
    </div>
  </section>

  <section class="section" id="new">
    <div class="section-heading"><p class="eyebrow">What's new</p><h2>${i18n({ ja: "v1.1.2 の主要変更", en: "Key changes in v1.1.2" })}</h2><p>${i18n({ ja: "以下は公式 changelog の Added / Changed から選んだ 5 項目です。修正 14 件を含む全 19 項目はリリースページにあります。", en: "These five items come from the official Added and Changed sections. The release page includes all 19 items, including 14 fixes." })}</p></div>
    <div class="card-grid">
      ${latestHighlights
        .map((item) =>
          card({
            eyebrow: item.category,
            title: featureAreaLabels[item.featureArea],
            body: { ja: item.ja, en: item.en },
            badge: {
              className: item.category === "Added" ? "badge--added" : "badge--changed",
              label: { ja: item.category, en: item.category },
            },
          }),
        )
        .join("\n")}
    </div>
  </section>

  <section class="section" id="capabilities">
    <div class="section-heading"><p class="eyebrow">Capability map</p><h2>${i18n({ ja: "現在の全機能マップ", en: "Complete current capability map" })}</h2></div>
    <div class="card-grid">
      ${capabilityCards
        .map((capability) =>
          card({
            title: capability.title,
            body: capability.body,
            badge: {
              className: capability.preview ? "badge--warning" : "badge--success",
              label: capability.badge,
            },
          }),
        )
        .join("\n")}
    </div>
  </section>

  <section class="section" id="workflow">
    <div class="section-heading"><p class="eyebrow">Workflow</p><h2>${i18n({ ja: "代表的なエンドツーエンドフロー", en: "A representative end-to-end workflow" })}</h2></div>
    <ol class="steps">
      ${[
        [{ ja: "My Work で対象を絞る", en: "Find the work in My Work" }, { ja: "Issue、プルリクエスト、CI 状態を検索条件で整理し、次に扱う 1 件を選びます。", en: "Organize issues, pull requests, and CI state with filters, then choose one item." }],
        [{ ja: "実行場所と自律性を選ぶ", en: "Choose execution and autonomy" }, { ja: "worktree、ローカル、クラウドの実行場所と Interactive、Plan、Autopilot をリスクに合わせて選びます。", en: "Match worktree, local, or cloud execution and Interactive, Plan, or Autopilot to the risk." }],
        [{ ja: "並列セッションを監督する", en: "Supervise parallel sessions" }, { ja: "Session Grid、サイドチャット、Files、Changes、Canvas で複数の進捗と成果を確認します。", en: "Use Session Grid, side chats, Files, Changes, and Canvas to inspect several streams and artifacts." }],
        [{ ja: "レビューと CI を通す", en: "Complete review and CI" }, { ja: "差分とコメントを確認し、必要なら security review や rubber duck を使い、ブロッカーを解消します。", en: "Review diffs and comments, optionally use security review or rubber duck, and resolve blockers." }],
        [{ ja: "GitHub の条件を満たして着地する", en: "Land after GitHub requirements pass" }, { ja: "必須レビュー、ブランチ保護、CI、マージキューの条件を尊重して Agent Merge または手動でマージします。", en: "Respect required reviews, branch protection, CI, and merge-queue conditions, then use Agent Merge or merge manually." }],
      ]
        .map(([title, body]) => `<li class="step"><h3>${i18n(title)}</h3><p>${i18n(body)}</p></li>`)
        .join("\n")}
    </ol>
  </section>

  <section class="section" id="availability">
    <div class="section-heading"><p class="eyebrow">Availability &amp; requirements</p><h2>${i18n({ ja: "可用性、要件、ポリシー", en: "Availability, requirements, and policies" })}</h2></div>
    <div class="card-grid">
      ${card({ title: { ja: "基本要件", en: "Core requirements" }, body: { ja: "Git、GitHub アカウント、Windows / macOS / Linux。Copilot プランまたはローカル BYOK の資格情報が必要です。", en: "Git, a GitHub account, and Windows, macOS, or Linux. Use a Copilot plan or local BYOK credentials." }, badge: { className: "badge--success", label: { ja: "提供中", en: "Available" } } })}
      ${card({ title: { ja: "組織ポリシー", en: "Organization policy" }, body: { ja: "Business / Enterprise では GitHub Copilot App ポリシーが必要です。これは Copilot CLI ポリシーとは別に評価されます。", en: "Business and Enterprise accounts require the GitHub Copilot app policy. It is evaluated separately from the Copilot CLI policy." } })}
      ${card({ title: { ja: "プレビュー機能", en: "Preview features" }, body: { ja: "ローカル BYOK、クラウドサンドボックス、`/security-review` は公式文書で Public preview とされています。変更可能性を前提にしてください。", en: "Official documentation labels local BYOK, cloud sandboxes, and `/security-review` as public preview. Plan for change." }, badge: { className: "badge--warning", label: { ja: "Public preview", en: "Public preview" } } })}
      ${card({ title: { ja: "Cloud Automations", en: "Cloud Automations" }, body: { ja: "対象プラン、private / internal リポジトリ、cloud agent と automations のポリシー、書き込み権限、Actions minutes / AI Credits が関係します。", en: "Applicable plans, private or internal repositories, cloud-agent and automation policies, write access, Actions minutes, and AI Credits all matter." } })}
      ${card({ title: { ja: "安全とデータ", en: "Safety and data" }, body: { ja: "URL、プロンプト、ログにシークレットを含めず、自動化や拡張には最小権限だけを与えます。デバッグログは共有前に機密情報を確認します。", en: "Keep secrets out of URLs, prompts, and logs; grant automations and extensions least privilege; inspect debug logs before sharing." } })}
      ${card({ title: { ja: "プラットフォーム", en: "Platforms" }, body: { ja: "Windows は x64 / ARM64、macOS は Apple Silicon / Intel、Linux は公式リリース資産を使用します。WSL のコードは Windows 側のアプリからリモート接続します。", en: "Use x64 or ARM64 on Windows, Apple Silicon or Intel on macOS, and official release assets on Linux. Connect to WSL code remotely from the Windows app." } })}
    </div>
  </section>

  <section class="section" id="setup">
    <div class="section-heading"><p class="eyebrow">Setup</p><h2>${i18n({ ja: "導入の最短手順", en: "Shortest setup path" })}</h2></div>
    <ol>
      <li>${i18n({ ja: "公式ダウンロードから OS とアーキテクチャに合うビルドを入手します。", en: "Download the build for your OS and architecture from the official page." })}</li>
      <li>${i18n({ ja: "GitHub にサインインします。GHES では GitHub Enterprise を選びます。", en: "Sign in to GitHub; choose GitHub Enterprise for GHES." })}</li>
      <li>${i18n({ ja: "Copilot seat または独自モデルプロバイダーを選びます。キーは資格情報欄だけに入力します。", en: "Choose a Copilot seat or an external model provider; enter keys only in credential fields." })}</li>
      <li>${i18n({ ja: "GitHub リポジトリ、ローカルフォルダー、または Git URL をプロジェクトとして追加します。", en: "Add a GitHub repository, local folder, or Git URL as a project." })}</li>
      <li>${i18n({ ja: "低リスクの探索を Plan または Interactive で開始し、Changes を確認します。", en: "Start a low-risk exploration in Plan or Interactive and inspect Changes." })}</li>
      <li>${i18n({ ja: "必要なポリシーと実行場所を確認してから Autopilot、cloud、automations へ広げます。", en: "Confirm policies and execution boundaries before expanding to Autopilot, cloud, or automations." })}</li>
    </ol>
  </section>

  <section class="section" id="models">
    <div class="section-heading"><p class="eyebrow">Models &amp; environments</p><h2>${i18n({ ja: "モデル、Auto、推論量、BYOK、WSL、Cloud", en: "Models, Auto, reasoning, BYOK, WSL, and cloud" })}</h2></div>
    <div class="card-grid">
      ${card({ title: { ja: "Auto と既定モデル", en: "Auto and the default model" }, body: { ja: "Auto はタスクの複雑さに基づいてモデルを選び、応答ごとの実モデルを表示します。v1.1.2 では既定選択がアカウントで実際に利用可能なモデルに一致します。", en: "Auto chooses based on task complexity and shows the model used for each response. In v1.1.2, the default matches models actually available to the account." } })}
      ${card({ title: { ja: "推論量", en: "Reasoning effort" }, body: { ja: "複雑さに合わせて推論量を選びます。v1.1.2 ではセッション再開やアプリ再起動後も選択が保持されます。", en: "Match reasoning effort to complexity. v1.1.2 preserves the choice across session resume and app restart." } })}
      ${card({ title: { ja: "BYOK", en: "BYOK" }, body: { ja: "OpenAI、Azure OpenAI、Microsoft Foundry、Anthropic、Ollama、Foundry Local、LM Studio、OpenAI 互換エンドポイントを追加できます。資格情報はシステムストアに保存されます。", en: "Add OpenAI, Azure OpenAI, Microsoft Foundry, Anthropic, Ollama, Foundry Local, LM Studio, or an OpenAI-compatible endpoint. Credentials are stored in the system store." }, badge: { className: "badge--warning", label: { ja: "Public preview", en: "Public preview" } } })}
      ${card({ title: { ja: "WSL", en: "WSL" }, body: { ja: "v1.1.2 の WSL リモート環境には GitHub の PR / Issue ワークフロースキルと接続信頼性の改善が含まれます。", en: "v1.1.2 WSL remote environments include GitHub PR and issue workflow skills plus connection reliability improvements." } })}
      ${card({ title: { ja: "Cloud sandboxes", en: "Cloud sandboxes" }, body: { ja: "GitHub ホストの分離 Linux 環境でセッションを継続できます。App から利用できますが、sandbox プラットフォーム自体は CLI にもまたがる隣接機能です。", en: "Continue sessions in isolated GitHub-hosted Linux environments. The app can use them, while the sandbox platform also spans the adjacent CLI surface." }, badge: { className: "badge--warning", label: { ja: "Public preview", en: "Public preview" } } })}
    </div>
  </section>

  <section class="section" id="scope">
    <div class="section-heading"><p class="eyebrow">Scope discipline</p><h2>${i18n({ ja: "App リリースと隣接機能を区別する", en: "Distinguish App releases from adjacent capabilities" })}</h2></div>
    <div class="callout">
      <p>${i18n({ ja: "このサイトのバージョン差分は `github/app` の changelog だけを App リリース事実として扱います。Copilot CLI、SDK、cloud agent、sandbox は App と連携する場合でも、それぞれの公式文書で提供範囲を示し、特定 App バージョンの追加機能としては扱いません。", en: "This site treats only the `github/app` changelog as evidence of version-bound App changes. Copilot CLI, SDK, cloud agent, and sandbox capabilities are scoped through their own official documentation, even when they integrate with the App, and are not attributed to an App release without changelog support." })}</p>
    </div>
  </section>

  <section class="section" id="sources">
    <div class="section-heading"><p class="eyebrow">Official sources</p><h2>${i18n({ ja: "一次情報", en: "Primary sources" })}</h2></div>
    <ul class="source-list">
      <li><a href="https://github.com/github/app/blob/main/changelog.md">github/app changelog</a></li>
      <li><a href="https://api.github.com/repos/github/app/releases">github/app Releases API</a></li>
      <li><a href="https://github.com/github/app#readme">github/app README</a></li>
      <li><a href="https://docs.github.com/en/copilot/concepts/agents/github-copilot-app">About the GitHub Copilot app</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/getting-started">Getting started</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/agent-sessions">Agent sessions</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/managing-issues-and-pull-requests">Issues and pull requests</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/using-automations">Automations</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/use-byok-models">BYOK models</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/working-with-canvas-extensions">Canvas extensions</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/open-with-deep-links">Deep links</a></li>
      <li><a href="https://docs.github.com/en/copilot/concepts/about-cloud-and-local-sandboxes">Cloud and local sandboxes</a></li>
    </ul>
  </section>
</main>
${footer("..")}
</body>
</html>`;
}

const featureAreaLabels = {
  "GitHub lifecycle": { ja: "GitHub ライフサイクル", en: "GitHub lifecycle" },
  "Accessibility & input": { ja: "アクセシビリティと入力", en: "Accessibility & input" },
  "Sessions & orchestration": { ja: "セッションとオーケストレーション", en: "Sessions & orchestration" },
  "Canvases, files & browser": { ja: "Canvas、ファイル、ブラウザー", en: "Canvases, files & browser" },
  "Experience & reliability": { ja: "体験と信頼性", en: "Experience & reliability" },
  "Models & account": { ja: "モデルとアカウント", en: "Models & account" },
  "Platforms & environments": { ja: "プラットフォームと環境", en: "Platforms & environments" },
  Extensibility: { ja: "拡張性", en: "Extensibility" },
  Automations: { ja: "自動化", en: "Automations" },
};

function renderReleases() {
  const featureAreas = [
    ...new Set(matrix.releases.flatMap((release) => release.items.map((item) => item.featureArea))),
  ].sort();
  const categoryOrder = ["Added", "Changed", "Fixed", "Removed"];
  const releases = matrix.releases
    .map((release) => {
      const sections = categoryOrder
        .map((category) => {
          const items = release.items.filter((item) => item.category === category);
          if (!items.length) return "";
          return `<section class="release-category" data-release-category-section data-category="${category}">
  <h3><span class="badge badge--${category.toLowerCase()}">${category}</span> <span class="filter-count">${items.length}</span></h3>
  <ul class="release-items">
    ${items
      .map(
        (item) => `<li class="release-item" id="${item.id}" data-release-item data-category="${item.category}" data-feature="${escapeHtml(item.featureArea)}">
  <div class="en" lang="en">${inlineMarkdown(item.en)}</div>
  <div class="ja" lang="ja">${inlineMarkdown(item.ja)}</div>
</li>`,
      )
      .join("\n")}
  </ul>
</section>`;
        })
        .join("\n");
      return `<article class="release-version" id="${release.version.replaceAll(".", "-")}" data-release-version>
  <header class="release-version__header">
    <div><h2>${escapeHtml(release.version)}</h2><time datetime="${release.publishedAt}">${release.publishedAt.slice(0, 10)}</time></div>
    <div class="button-row"><span class="filter-count">${release.items.length} items</span><a href="${release.sourceUrl}" rel="noopener noreferrer">${i18n({ ja: "公式 changelog", en: "Official changelog" })}</a><a href="${release.releaseUrl}" rel="noopener noreferrer">${i18n({ ja: "リリース", en: "Release" })}</a></div>
  </header>
  ${sections}
</article>`;
    })
    .join("\n");
  return `${documentHead({
    title: "GitHub Copilot App v1.0.12 to v1.1.2 — Release explorer",
    description: "Search every official Added, Changed, Fixed, and Removed item across 17 GitHub Copilot App releases.",
  })}
<body>
${siteHeader({
  home: "./",
  links: [
    { href: "../copilot-app/", label: { ja: "バージョンハブ", en: "Version hub" } },
    { href: "index.html", label: { ja: "機能ガイド", en: "Feature guide" } },
    { href: "../copilot-app-v1.1.2-hands-on/", label: { ja: "ハンズオン", en: "Hands-on" } },
  ],
})}
<section class="hero" aria-labelledby="releases-title">
  <div class="hero__inner">
    <p class="eyebrow">17 releases · 462 official items · Exact-once matrix</p>
    <h1 id="releases-title">${i18n({ ja: "v1.0.12 → v1.1.2 リリースエクスプローラー", en: "v1.0.12 → v1.1.2 release explorer" })}</h1>
    <p class="lede">${i18n({ ja: "v1.0.13 から v1.1.2 までの公式 Added / Changed / Fixed / Removed を、英語原文と忠実な日本語訳で検索できます。JavaScript がなくても全項目を読めます。", en: "Search every official Added, Changed, Fixed, and Removed item from v1.0.13 through v1.1.2 in original English and faithful Japanese. All entries remain readable without JavaScript." })}</p>
    <div class="hero-actions"><a class="button button--primary" href="assets/release-matrix.json">${i18n({ ja: "構造化マトリクス JSON", en: "Structured matrix JSON" })}</a><a class="button" href="index.html">${i18n({ ja: "機能ガイドへ戻る", en: "Back to feature guide" })}</a></div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="filter-panel" aria-labelledby="filter-title">
    <h2 id="filter-title">${i18n({ ja: "リリース項目を絞り込む", en: "Filter release items" })}</h2>
    <div class="filters">
      <div class="field"><label for="release-search">${i18n({ ja: "キーワード", en: "Keyword" })}</label><input id="release-search" type="search" data-release-search placeholder="Auto, WSL, accessibility…"></div>
      <div class="field"><label for="release-category">${i18n({ ja: "カテゴリ", en: "Category" })}</label><select id="release-category" data-release-category><option value="">${optionLabel({ ja: "すべて", en: "All" })}</option>${categoryOrder.map((category) => `<option value="${category}">${category}</option>`).join("")}</select></div>
      <div class="field"><label for="release-feature">${i18n({ ja: "機能領域", en: "Feature area" })}</label><select id="release-feature" data-release-feature><option value="">${optionLabel({ ja: "すべて", en: "All" })}</option>${featureAreas.map((area) => `<option value="${escapeHtml(area)}">${optionLabel(featureAreaLabels[area])}</option>`).join("")}</select></div>
    </div>
    <p class="muted" role="status" aria-live="polite" data-release-filter-status>${matrix.itemCount} items</p>
    <noscript><p class="callout">${i18n({ ja: "JavaScript が無効なためフィルターは使えませんが、全リリース項目はこの下に表示されています。", en: "Filters are unavailable without JavaScript, but every release item is visible below." })}</p></noscript>
  </section>
  <div class="release-list">${releases}</div>
</main>
${footer("..")}
</body>
</html>`;
}

function renderHandsOnIndex() {
  const difficulties = [...new Set(guides.map((guide) => guide.difficulty.key))].sort();
  const statuses = [...new Set(guides.map((guide) => guide.status.key))].sort();
  const pathSections = manifest.paths
    .map((path) => {
      const cards = path.guides
        .map((entry) => {
          const guide = guideById.get(entry.id);
          return `<article class="card" data-guide-card data-guide-id="${guide.id}" data-path="${path.id}" data-difficulty="${guide.difficulty.key}" data-status="${guide.status.key}">
  <div class="card__top"><span class="guide-number">${guide.id}</span><span class="badge badge--success" data-card-progress hidden>${i18n({ ja: "完了", en: "Complete" })}</span></div>
  <h3>${i18n(guide.title)}</h3>
  <p>${i18n(guide.summary)}</p>
  <div class="chips"><span class="badge">${i18n(guide.difficulty.label)}</span><span class="badge ${guide.status.key === "preview" ? "badge--warning" : "badge--accent"}">${i18n(guide.status.label)}</span></div>
  <div class="card-actions"><a class="button" href="${entry.filename}">${i18n({ ja: "ガイドを開く", en: "Open guide" })} ${svg(icons.arrow)}</a></div>
</article>`;
        })
        .join("\n");
      return `<section class="section" id="${path.id}">
  <div class="section-heading"><p class="eyebrow">${i18n({ ja: `学習パス ${path.number}`, en: `Learning path ${path.number}` })}</p><h2>${i18n(path.title)}</h2><p>${i18n(path.summary)}</p></div>
  <div class="card-grid">${cards}</div>
</section>`;
    })
    .join("\n");

  return `${documentHead({
    title: "GitHub Copilot App v1.1.2 — 21 hands-on guides",
    description: "Five bilingual learning paths and 21 practical GitHub Copilot App v1.1.2 guides.",
  })}
<body data-guide-count="${manifest.guideCount}">
${siteHeader({
  home: "./",
  links: [
    { href: "../copilot-app/", label: { ja: "バージョンハブ", en: "Version hub" } },
    { href: "../copilot-app-v1.1.2/", label: { ja: "機能ガイド", en: "Feature guide" } },
    { href: "../copilot-app-v1.1.2/releases.html", label: { ja: "リリース差分", en: "Releases" } },
  ],
})}
<section class="hero" aria-labelledby="hands-title">
  <div class="hero__inner">
    <p class="eyebrow">5 learning paths · 21 unique guides · Local-only progress</p>
    <h1 id="hands-title">${i18n({ ja: "GitHub Copilot App v1.1.2 ハンズオン", en: "GitHub Copilot App v1.1.2 hands-on" })}</h1>
    <p class="lede">${i18n({ ja: "開始と構成から並列作業、GitHub ライフサイクル、自動化、運用までを、コピー可能なプロンプトと安全なリセット手順で学びます。アカウントやバックエンドなしで、このガイド UI の進捗をブラウザー内に保存します。", en: "Learn setup, parallel work, the GitHub lifecycle, automation, and operations with copyable prompts and safe reset steps. The guide UI saves progress in your browser with no account or backend." })}</p>
    <div class="hero-actions">
      <a class="button button--primary" href="#guides" data-resume-link>${i18n({ ja: "再開: ", en: "Resume: " })}<span data-resume-title>${i18n({ ja: "ガイド 01", en: "Guide 01" })}</span> ${svg(icons.arrow)}</a>
      <a class="button" href="../copilot-app-v1.1.2/">${i18n({ ja: "機能マップを見る", en: "View capability map" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="section" id="guides">
    <div class="page-grid page-grid--wide">
      <div>
        <div class="filter-panel" aria-labelledby="guide-filter-title">
          <h2 id="guide-filter-title">${i18n({ ja: "21 ガイドを検索", en: "Search 21 guides" })}</h2>
          <div class="filters">
            <div class="field"><label for="guide-search">${i18n({ ja: "キーワード", en: "Keyword" })}</label><input id="guide-search" type="search" data-guide-search placeholder="WSL, Agent Merge, Canvas…"></div>
            <div class="field"><label for="guide-path">${i18n({ ja: "学習パス", en: "Learning path" })}</label><select id="guide-path" data-guide-path><option value="">${optionLabel({ ja: "すべて", en: "All" })}</option>${manifest.paths.map((path) => `<option value="${path.id}">${path.number}. ${optionLabel(path.title)}</option>`).join("")}</select></div>
            <div class="field"><label for="guide-difficulty">${i18n({ ja: "難易度", en: "Difficulty" })}</label><select id="guide-difficulty" data-guide-difficulty><option value="">${optionLabel({ ja: "すべて", en: "All" })}</option>${difficulties.map((key) => { const guide = guides.find((item) => item.difficulty.key === key); return `<option value="${key}">${optionLabel(guide.difficulty.label)}</option>`; }).join("")}</select></div>
            <div class="field"><label for="guide-status">${i18n({ ja: "状態", en: "Status" })}</label><select id="guide-status" data-guide-status><option value="">${optionLabel({ ja: "すべて", en: "All" })}</option>${statuses.map((key) => { const guide = guides.find((item) => item.status.key === key); return `<option value="${key}">${optionLabel(guide.status.label)}</option>`; }).join("")}</select></div>
          </div>
          <p class="muted" role="status" aria-live="polite" data-guide-filter-status>21 guides</p>
        </div>
      </div>
      <aside class="progress-panel" aria-label="Learning progress">
        <h2>${i18n({ ja: "学習進捗", en: "Learning progress" })}</h2>
        <p data-progress-count>0 / 21</p>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="21" aria-label="Learning progress"><div class="progress-track__fill" data-progress-fill></div></div>
        <button class="progress-button" type="button" data-progress-reset>${i18n({ ja: "進捗をリセット", en: "Reset progress" })}</button>
      </aside>
    </div>
  </section>
  ${pathSections}
</main>
${footer("..")}
</body>
</html>`;
}

await mkdir("copilot-app", { recursive: true });
await writeFile("copilot-app/index.html", cleanHtml(renderHub()), "utf8");
await writeFile("copilot-app-v1.1.2/index.html", cleanHtml(renderFeatureIndex()), "utf8");
await writeFile("copilot-app-v1.1.2/releases.html", cleanHtml(renderReleases()), "utf8");
await writeFile(
  "copilot-app-v1.1.2-hands-on/index.html",
  cleanHtml(renderHandsOnIndex()),
  "utf8",
);
console.log("Rendered stable hub, feature guide, release explorer, and hands-on index");
