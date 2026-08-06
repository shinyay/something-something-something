import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const matrix = JSON.parse(await readFile("copilot-app-v1.1.4/assets/release-matrix.json", "utf8"));
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

if (
  matrix.versionCount !== 19 ||
  matrix.itemCount !== 687 ||
  matrix.categoryCounts?.Added !== 88 ||
  matrix.categoryCounts?.Changed !== 97 ||
  matrix.categoryCounts?.Fixed !== 500 ||
  matrix.categoryCounts?.Removed !== 2
) {
  throw new Error("Release matrix must contain 19 versions, 687 items, and canonical category counts");
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
    <span class="version-pill version-pill--current">v1.1.4</span>
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
      <a href="${prefix}/copilot-app-v1.1.4/">${i18n({ ja: "v1.1.4 機能ガイド", en: "v1.1.4 feature guide" })}</a>
      <a href="${prefix}/copilot-app-v1.1.4/releases.html">${i18n({ ja: "全リリース差分", en: "Full release delta" })}</a>
      <a href="${prefix}/copilot-app-v1.1.4-hands-on/">${i18n({ ja: "25 ラボ", en: "25 labs" })}</a>
      <a href="${prefix}/copilot-app-v1.1.2/">${i18n({ ja: "v1.1.2 アーカイブ", en: "v1.1.2 archive" })}</a>
      <a href="${prefix}/copilot-app-v1.0.12/">${i18n({ ja: "v1.0.12 アーカイブ", en: "v1.0.12 archive" })}</a>
    </div>
    <p>${i18n({ ja: "非公式ガイドです。製品の可用性、ポリシー、料金は公式ソースを確認してください。", en: "This is an unofficial guide. Confirm product availability, policy, and pricing in official sources." })}</p>
  </div>
</footer>`;
}

function card({ eyebrow, title, body, badge, href, action, attributes = "" }) {
  return `<article class="card"${attributes ? ` ${attributes}` : ""}>
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
    assetPrefix: "../copilot-app-v1.1.4/assets",
  })}
<body>
${siteHeader({
  home: "./",
  links: [
    { href: "../copilot-app-v1.1.4/", label: { ja: "最新ガイド", en: "Latest guide" } },
    { href: "../copilot-app-v1.1.4-hands-on/", label: { ja: "学習システム", en: "Learning system" } },
    { href: "../copilot-app-v1.1.4/releases.html", label: { ja: "リリース差分", en: "Releases" } },
  ],
})}
<section class="hero" aria-labelledby="hub-title">
  <div class="hero__inner">
    <p class="eyebrow">Stable entry · Last checked 2026-08-07</p>
    <h1 id="hub-title">${i18n({ ja: "GitHub Copilot App バージョンハブ", en: "GitHub Copilot App version hub" })}</h1>
    <p class="lede">${i18n({ ja: "常に最新ガイドへ到達できる安定 URL です。現在版 v1.1.4 と、履歴として保存した v1.1.2 / v1.0.12 を明確に分けています。", en: "A stable URL that always leads to the latest guide, with current v1.1.4 clearly separated from the preserved v1.1.2 and v1.0.12 archives." })}</p>
    <div class="hero-actions">
      <a class="button button--primary" href="../copilot-app-v1.1.4/">${i18n({ ja: "v1.1.4 機能ガイド", en: "v1.1.4 feature guide" })} ${svg(icons.arrow)}</a>
      <a class="button" href="../copilot-app-v1.1.4-hands-on/">${i18n({ ja: "25 ラボで学ぶ", en: "Learn with 25 labs" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="section">
    <div class="section-heading"><p class="eyebrow">Current</p><h2>${i18n({ ja: "現在の推奨バージョン", en: "Current recommended version" })}</h2></div>
    <div class="card-grid">
      ${card({ eyebrow: "v1.1.4", title: { ja: "完全機能ガイド", en: "Complete feature guide" }, body: { ja: "v1.1.4 の機能、v1.1.2 からの移行影響、可用性、ポリシー、プラットフォーム境界を俯瞰します。", en: "Survey v1.1.4 capabilities, migration impact from v1.1.2, availability, policy, and platform boundaries." }, href: "../copilot-app-v1.1.4/", action: { ja: "機能ガイドを開く", en: "Open feature guide" }, badge: { className: "badge--success", label: { ja: "現在版", en: "Current" } } })}
      ${card({ eyebrow: "19 releases · 687 items", title: { ja: "v1.0.12 からの完全差分", en: "Complete delta from v1.0.12" }, body: { ja: "v1.0.13 から v1.1.4 まで、公式 687 項目を英語原文と日本語訳で検索できます。", en: "Search all 687 official items from v1.0.13 through v1.1.4 in original English and Japanese." }, href: "../copilot-app-v1.1.4/releases.html", action: { ja: "リリースを検索", en: "Explore releases" } })}
      ${card({ eyebrow: "6 journeys · 10 tracks · 25 labs", title: { ja: "二次元学習システム", en: "Two-dimensional learning system" }, body: { ja: "成果を横断するジャーニーと、領域を深掘りするトラックの両方から再利用可能なラボへ進みます。", en: "Reach reusable labs through outcome-spanning journeys or domain-focused deep-dive tracks." }, href: "../copilot-app-v1.1.4-hands-on/", action: { ja: "学習マトリクスを開く", en: "Open learning matrix" } })}
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
      ${card({ eyebrow: "v1.1.2", title: { ja: "機能ガイド（アーカイブ）", en: "Feature guide (archive)" }, body: { ja: "2026-07-28 公開版の歴史的スナップショットです。新規利用には v1.1.4 を使ってください。", en: "A historical snapshot of the release published on 2026-07-28. Use v1.1.4 for current work." }, href: "../copilot-app-v1.1.2/", action: { ja: "v1.1.2 を開く", en: "Open v1.1.2" }, badge: { label: { ja: "履歴", en: "Archive" } } })}
      ${card({ eyebrow: "21 guides", title: { ja: "v1.1.2 ハンズオン（アーカイブ）", en: "v1.1.2 hands-on (archive)" }, body: { ja: "旧 5 パス / 21 ガイドを当時の内容のまま参照できます。", en: "Reference the previous five-path, 21-guide edition in its historical form." }, href: "../copilot-app-v1.1.2-hands-on/", action: { ja: "旧ハンズオンを開く", en: "Open archived hands-on" } })}
      ${card({ eyebrow: "v1.0.12", title: { ja: "機能ガイド（アーカイブ）", en: "Feature guide (archive)" }, body: { ja: "2026-07-01 時点の歴史的スナップショットです。本文は当時の内容を保持しています。", en: "A historical snapshot as of 2026-07-01. Its body remains as originally published." }, href: "../copilot-app-v1.0.12/", action: { ja: "アーカイブを開く", en: "Open archive" }, badge: { label: { ja: "履歴", en: "Archive" } } })}
      ${card({ eyebrow: "15 guides", title: { ja: "v1.0.12 ハンズオン（アーカイブ）", en: "v1.0.12 hands-on (archive)" }, body: { ja: "初期 15 ガイドを履歴として参照できます。新規学習には v1.1.4 版を使ってください。", en: "Reference the original 15 guides as history. Use the v1.1.4 edition for new learning." }, href: "../copilot-app-v1.0.12-hands-on/", action: { ja: "旧ガイドを開く", en: "Open old guides" } })}
    </div>
  </section>
</main>
${footer("..")}
</body>
</html>`;
}

const capabilityCards = [
  {
    id: "sessions-worktrees",
    title: { ja: "セッション、worktree、保存場所", en: "Sessions, worktrees, and location" },
    body: { ja: "ローカルセッションを専用ブランチと worktree に分離し、リポジトリ・ブランチ・名前のプレースホルダーで新規 worktree の保存先を構成します。", en: "Isolate local sessions on dedicated branches and worktrees, then configure new worktree paths with repository, branch, and name placeholders." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["04", "24"],
  },
  {
    id: "models-context",
    title: { ja: "モデル、Auto、推論量、BYOK、キャッシュ", en: "Models, Auto, reasoning, BYOK, and cache" },
    body: { ja: "タスクにモデルと推論量を合わせ、Auto の実モデル・AI Credits・キャッシュ詳細と、モデル変更時の再利用コンテキストを確認します。BYOK は Public preview です。", en: "Match model and reasoning effort to the task, then inspect Auto's actual model, AI Credits, cache details, and reused context after a model change. BYOK is public preview." },
    badge: { ja: "BYOK は Public preview", en: "BYOK public preview" },
    preview: true,
    labs: ["02", "20"],
  },
  {
    id: "planning",
    title: { ja: "計画レビューと実行モード", en: "Plan review and execution modes" },
    body: { ja: "Interactive、Plan、Autopilot をリスクに合わせ、描画チェックリスト・検索・Markdown 編集・承認フォーカスを備えた標準 Plan レビューで実行前に合意します。Plan tab は閉じて Add tab から復元できます。", en: "Match Interactive, Plan, or Autopilot to risk and agree before execution through the standard Plan review with a rendered checklist, search, Markdown editing, and focused approval. Plan tabs can be closed and restored from Add tab." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["03", "05"],
  },
  {
    id: "orchestration",
    title: { ja: "Session Grid、nested sessions、side chats、forks", en: "Session Grid, nested sessions, side chats, and forks" },
    body: { ja: "複数セッションを Grid で監督し、nested session、`/side`、quick chat、handoff を使い分けます。fork は v1.1.4 でトップレベル表示です。", en: "Supervise concurrent sessions in the Grid and choose among nested sessions, `/side`, quick chats, and handoffs. Forks appear as top-level entries in v1.1.4." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["05", "06", "07"],
  },
  {
    id: "files-diffs",
    title: { ja: "Files、ローカル編集、差分、アーカイブ", en: "Files, local editing, diffs, and archives" },
    body: { ja: "Files でテキストやコードを直接編集して自動保存し、進行中・コミット済み・アーカイブ済み差分を確認します。復元不能な差分は明示的な説明に変わります。", en: "Edit text and code directly in Files with automatic saving, then inspect live, committed, and archived diffs. Unrecoverable archived changes now show an explicit explanation." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["09"],
  },
  {
    id: "progressive-loading",
    title: { ja: "段階的 loading と大規模データ", en: "Progressive loading and large data" },
    body: { ja: "Files は即時に開き、Issue conversation、PR diff、large session history は準備済み部分から段階的に表示されます。v1.1.4 は transcript を disk から先に読み、長い diff 行の強調表示も改善します。", en: "Files open immediately while issue conversations, PR diffs, and large session history render progressively from available data. v1.1.4 also reads transcripts from disk first and improves highlighting for very long diff lines." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["07", "09", "11"],
  },
  {
    id: "browser-canvas",
    title: { ja: "Browser、Present、Canvases と成果物", en: "Browser, Present, Canvases, and artifacts" },
    body: { ja: "ブラウザープレビュー、全画面 Present、ファイル・terminal・diff・文書・表計算などの Canvases を検証可能な共有サーフェスとして使います。", en: "Use browser previews, full-screen Present, and canvases for files, terminals, diffs, documents, spreadsheets, and other inspectable shared surfaces." },
    badge: { ja: "一部は拡張依存", en: "Some surfaces extension-dependent" },
    labs: ["09", "10"],
  },
  {
    id: "my-work",
    title: { ja: "My Work と優先順位", en: "My Work and prioritization" },
    body: { ja: "Issue と pull request をセクション、検索、`has:` / `no:` 条件で整理し、完了項目や重複を Up next から除外して次の作業を選びます。", en: "Organize issues and pull requests with sections, search, and `has:` / `no:` qualifiers, then choose the next item without stale completed or duplicate Up next entries." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["11"],
  },
  {
    id: "issues-deep-links",
    title: { ja: "Issue、別リポジトリ、milestone、deep link", en: "Issues, cross-repository targets, milestones, and deep links" },
    body: { ja: "現在のセッションとは別のリポジトリに Issue を作成し、Issue / PR の milestone を表示・編集し、安全な hosted `ghapp://` deep link で目的の画面を開きます。", en: "Create an issue in a repository other than the current session, view or edit issue/PR milestones, and open exact app surfaces through safe hosted `ghapp://` deep links." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["12", "23"],
  },
  {
    id: "copilot-review",
    title: { ja: "PR レビューと Copilot code review", en: "PR review and Copilot code review" },
    body: { ja: "Files changed、inline comment、draft review、CI を確認し、Copilot code review を要求・再要求してから人の判断でレビューを送信します。", en: "Inspect Files changed, inline comments, draft review threads, and CI, request or re-request a Copilot code review, then submit the review with human judgment." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["13", "22"],
  },
  {
    id: "stacks-merge",
    title: { ja: "stacked PR、merge queue、Agent Merge", en: "Stacked PRs, merge queue, and Agent Merge" },
    body: { ja: "stack status と navigation menu で関連 PR を移動し、merge drawer の stack summary、queue position、必須チェックを確認して stack または単独 PR を着地します。", en: "Navigate related PRs through stack status and the stack menu, then inspect the merge-drawer summary, queue position, and required checks before landing a stack or a single PR." },
    badge: { ja: "権限・リポジトリ設定依存", en: "Permission and repository dependent" },
    labs: ["14", "22"],
  },
  {
    id: "automations",
    title: { ja: "ローカル / cloud automations", en: "Local and cloud automations" },
    body: { ja: "手動・定期・イベントトリガー、smart query、変更ファイル条件、最小権限ツール、実行状態、transient network retry を組み合わせます。Cloud automation は plan・policy・repository 条件に依存します。", en: "Combine manual, scheduled, and event triggers with smart queries, changed-file filters, least-privilege tools, run status, and transient-network retry. Cloud automation depends on plan, policy, and repository conditions." },
    badge: { ja: "ポリシー依存", en: "Policy dependent" },
    labs: ["16", "17"],
  },
  {
    id: "customization",
    title: { ja: "instructions、custom agents、MCP、skills、plugins", en: "Instructions, custom agents, MCP, skills, and plugins" },
    body: { ja: "アプリ管理の指示と file-backed instructions の出典を区別し、custom agent、MCP、plugin、user / repository skill（`.github/skills/` を含む）を信頼境界内で追加します。", en: "Distinguish app-managed guidance from discovered file-backed instructions, then add custom agents, MCP, plugins, and user or repository skills—including `.github/skills/`—within explicit trust boundaries." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["18", "19"],
  },
  {
    id: "memory-insights",
    title: { ja: "Chronicle、Insights、context、cost", en: "Chronicle, Insights, context, and cost" },
    body: { ja: "`/chronicle`、Insights、`/context`、`/compact` で履歴・文脈・コストを観測します。Memory は CLI / cloud agent / code review の公式境界と App の表示を混同しません。", en: "Observe history, context, and cost with `/chronicle`, Insights, `/context`, and `/compact`. Keep the documented CLI/cloud-agent/code-review Memory boundary distinct from app history surfaces." },
    badge: { ja: "境界に注意", en: "Mind the boundary" },
    labs: ["20"],
  },
  {
    id: "security-attribution",
    title: { ja: "Security、permissions、commit attribution", en: "Security, permissions, and commit attribution" },
    body: { ja: "権限プロンプト、レビュー、最小権限、自動化の信頼境界を維持し、agent-authored commit の `Co-authored-by` trailer を設定で制御します。", en: "Maintain permission prompts, review, least privilege, and automation trust boundaries, and control the `Co-authored-by` trailer on agent-authored commits through settings." },
    badge: { ja: "設定・ポリシー依存", en: "Setting and policy dependent" },
    labs: ["15", "24"],
  },
  {
    id: "accessibility-recovery",
    title: { ja: "Accessibility、storage、diagnostics、recovery", en: "Accessibility, storage, diagnostics, and recovery" },
    body: { ja: "Shift+Tab、focus、screen reader、sound、pinned-session 保護、storage、startup diagnostics、debug logs、workspace initialization failure を観測して安全に復旧します。", en: "Operate Shift+Tab, focus, screen-reader, sound, pinned-session protection, storage, startup diagnostics, debug logs, and workspace-initialization failures with safe recovery." },
    badge: { ja: "提供中", en: "Available" },
    labs: ["21", "24"],
  },
  {
    id: "platforms",
    title: { ja: "Windows、macOS、Linux、WSL、VS Code、Cloud", en: "Windows, macOS, Linux, WSL, VS Code, and cloud" },
    body: { ja: "公式 OS ビルド、Windows PowerShell profile の環境反映、WSL remote、VS Code handoff、ローカル / worktree / GitHub-hosted cloud sandbox の境界を使い分けます。", en: "Choose among official OS builds, Windows PowerShell-profile environment pickup, WSL remote, VS Code handoff, and local, worktree, or GitHub-hosted cloud-sandbox boundaries." },
    badge: { ja: "Cloud は Public preview", en: "Cloud public preview" },
    preview: true,
    labs: ["08", "24"],
  },
];

const labFiles = {
  "02": "02-models-auto-byok.html",
  "03": "03-first-session-modes.html",
  "04": "04-worktrees-parallel-sessions.html",
  "05": "05-orchestration-nested-sessions.html",
  "06": "06-session-grid-side-chats.html",
  "07": "07-chat-archive-rewind-compact.html",
  "08": "08-cloud-wsl-vscode-cli-handoff.html",
  "09": "09-files-diffs-browser-present-mode.html",
  "10": "10-canvases-artifacts.html",
  "11": "11-my-work-filters.html",
  "12": "12-issues-deep-links.html",
  "13": "13-pull-request-review.html",
  "14": "14-agent-merge-ci-queue.html",
  "15": "15-security-review-rubber-duck.html",
  "16": "16-local-automations.html",
  "17": "17-cloud-automations.html",
  "18": "18-custom-agents.html",
  "19": "19-mcp-skills-plugins-canvas-extensions.html",
  "20": "20-memory-chronicle-insights.html",
  "21": "21-accessibility-storage-lifecycle-recovery.html",
  "22": "22-stacked-pr-copilot-review.html",
  "23": "23-cross-repo-issues-milestones.html",
  "24": "24-worktree-attribution-diagnostics.html",
};

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
    title: "GitHub Copilot App v1.1.4 — Complete feature guide",
    description: "Bilingual complete guide to GitHub Copilot App v1.1.4 and every change since v1.0.12.",
  })}
<body>
${siteHeader({
  home: "./",
  links: [
    { href: "../copilot-app/", label: { ja: "バージョンハブ", en: "Version hub" } },
    { href: "releases.html", label: { ja: "リリース差分", en: "Releases" } },
    { href: "../copilot-app-v1.1.4-hands-on/", label: { ja: "学習システム", en: "Learning system" } },
  ],
})}
<section class="hero" aria-labelledby="feature-title">
  <div class="hero__inner">
    <p class="eyebrow">Current stable release · Published 2026-08-06</p>
    <h1 id="feature-title">GitHub Copilot App <span class="mono">v1.1.4</span></h1>
    <p class="lede">${i18n({ ja: "アイデア、並列セッション、Issue、stacked PR、レビュー、CI、マージ、自動化、運用までを一つのデスクトップ体験で管理する現在版の完全ガイドです。v1.0.12 から 19 リリース、687 件の公式変更を追跡しています。", en: "A complete guide to the current desktop experience for managing ideas, parallel sessions, issues, stacked PRs, review, CI, merge, automation, and operations. It tracks 19 releases and 687 official changes since v1.0.12." })}</p>
    <div class="hero-actions">
      <a class="button button--primary" href="../copilot-app-v1.1.4-hands-on/">${i18n({ ja: "25 ラボで試す", en: "Try 25 hands-on labs" })} ${svg(icons.arrow)}</a>
      <a class="button" href="releases.html">${i18n({ ja: "全 687 項目を検索", en: "Search all 687 items" })}</a>
      <a class="button" href="https://github.com/features/ai/github-app" rel="noopener noreferrer">${i18n({ ja: "公式ダウンロード", en: "Official download" })}</a>
    </div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="section" id="summary">
    <div class="section-heading"><p class="eyebrow">Executive summary</p><h2>${i18n({ ja: "v1.0.12 から何が変わったか", en: "What changed since v1.0.12" })}</h2><p>${i18n({ ja: "単機能の追加だけでなく、並列作業の可視化、GitHub ライフサイクル、モデル選択、拡張性、アクセシビリティ、復旧性が段階的に成熟しました。", en: "Beyond individual features, parallel-work visibility, the GitHub lifecycle, model choice, extensibility, accessibility, and recovery matured release by release." })}</p></div>
    <div class="card-grid">
      ${card({ eyebrow: "19", title: { ja: "対象リリース", en: "Covered releases" }, body: { ja: "v1.0.13 から v1.1.4。v1.0.12 を baseline とし、各公式項目を 1 回だけ統合しています。", en: "v1.0.13 through v1.1.4, using v1.0.12 as the baseline and integrating each official item exactly once." } })}
      ${card({ eyebrow: String(counts.Added), title: { ja: "Added", en: "Added" }, body: { ja: "新しいセッション、レビュー、フィルター、モデル、拡張、運用サーフェス。", en: "New session, review, filter, model, extension, and operations surfaces." } })}
      ${card({ eyebrow: String(counts.Changed), title: { ja: "Changed", en: "Changed" }, body: { ja: "性能、レイアウト、ワークフロー、既定値、ポリシー判定を改善。", en: "Improved performance, layout, workflows, defaults, and policy evaluation." } })}
      ${card({ eyebrow: String(counts.Fixed), title: { ja: "Fixed", en: "Fixed" }, body: { ja: "安定性、アクセシビリティ、状態保持、差分、起動、クリップボードを継続修正。", en: "Ongoing fixes for stability, accessibility, state persistence, diffs, startup, and clipboard behavior." } })}
      ${card({ eyebrow: String(counts.Removed), title: { ja: "Removed", en: "Removed" }, body: { ja: "公式 Removed は 2 件。完全な文言はリリースエクスプローラーで確認できます。", en: "Two official Removed items. See their exact wording in the release explorer." }, href: "releases.html?category=Removed", action: { ja: "全差分を確認", en: "View the full delta" } })}
    </div>
  </section>

  <section class="section" id="migration">
    <div class="section-heading"><p class="eyebrow">v1.1.2 → v1.1.4</p><h2>${i18n({ ja: "移行と実務への影響", en: "Migration and operational impact" })}</h2><p>${i18n({ ja: "既存データの変換を要求する移行ではありません。日常フローで増えた観測点、設定、GitHub 状態遷移を理解して使い分けます。", en: "This is not a data-migration release. Update your operating model for the new settings, observability, and GitHub state transitions in daily workflows." })}</p></div>
    <div class="card-grid">
      ${card({ eyebrow: "Parallel work", title: { ja: "会話を止めずに並列化", en: "Parallelize without interrupting work" }, body: { ja: "`/side`、quick chat の Grid 追加、選択セッションの bulk actions を使います。fork は source の子ではなく独立したトップレベル項目として扱います。", en: "Use `/side`, add quick chats to the Grid, and apply bulk actions to selected sessions. Treat forks as independent top-level entries rather than children of their source." }, href: "../copilot-app-v1.1.4-hands-on/06-session-grid-side-chats.html", action: { ja: "並列作業ラボ", en: "Parallel-work lab" } })}
      ${card({ eyebrow: "GitHub lifecycle", title: { ja: "stack と queue を可視化", en: "Make stacks and queues observable" }, body: { ja: "Copilot review の要求 / 再要求、stack status / navigation、merge drawer の summary、merge queue position / removal、Agent Merge の停止理由を確認してから操作します。", en: "Observe Copilot review request/re-request, stack status/navigation, the merge-drawer summary, merge-queue position/removal, and Agent Merge pause reasons before acting." }, href: "../copilot-app-v1.1.4-hands-on/22-stacked-pr-copilot-review.html", action: { ja: "stacked PR ラボ", en: "Stacked-PR lab" } })}
      ${card({ eyebrow: "Repository work", title: { ja: "対象リポジトリと milestone を明示", en: "Make repository and milestone targets explicit" }, body: { ja: "Issue 作成先が現在のセッションと異なる場合は repository を確認し、Issue / PR の milestone 変更を GitHub 上の状態遷移として検証します。", en: "When an issue target differs from the current session, verify the repository explicitly and validate issue/PR milestone edits as GitHub state transitions." }, href: "../copilot-app-v1.1.4-hands-on/23-cross-repo-issues-milestones.html", action: { ja: "Issue / milestone ラボ", en: "Issue and milestone lab" } })}
      ${card({ eyebrow: "Operations", title: { ja: "設定と復旧手順を更新", en: "Update settings and recovery runbooks" }, body: { ja: "Worktree location、Commit attribution、startup diagnostics、workspace initialization failure、pinned-session 保護を、安全な観察と復旧チェックリストとして運用手順に追加します。", en: "Add Worktree location, Commit attribution, startup diagnostics, workspace-initialization failures, and pinned-session protection to runbooks as safe observation and recovery checklists." }, href: "../copilot-app-v1.1.4-hands-on/24-worktree-attribution-diagnostics.html", action: { ja: "運用ラボ", en: "Operations lab" } })}
      ${card({ eyebrow: "Discovery", title: { ja: "instructions と skills の発見面を分ける", en: "Separate instruction and skill discovery" }, body: { ja: "Settings > Sessions の file-backed instructions と source path / copy / reveal、Settings > Skills の `.github/skills/` listing を別々の機能として確認します。", en: "Inspect file-backed instructions with source-path copy/reveal in Settings > Sessions, and `.github/skills/` listing separately in Settings > Skills." }, href: "../copilot-app-v1.1.4-hands-on/19-mcp-skills-plugins-canvas-extensions.html", action: { ja: "拡張ラボ", en: "Extensibility lab" } })}
      ${card({ eyebrow: "Windows", title: { ja: "PowerShell profile の環境を反映", en: "Pick up PowerShell-profile environment" }, body: { ja: "Windows integrated terminal が PowerShell profile の PATH / 環境変更を読み込むことを確認します。WSL remote の接続境界とは分けて扱います。", en: "Verify the Windows integrated terminal picks up PATH and environment changes from the PowerShell profile, separately from the WSL remote connection boundary." }, href: "../copilot-app-v1.1.4-hands-on/08-cloud-wsl-vscode-cli-handoff.html", action: { ja: "platform ラボ", en: "Platform lab" } })}
    </div>
  </section>

  <section class="section" id="evolution">
    <div class="section-heading"><p class="eyebrow">v1.0.12 → v1.1.4</p><h2>${i18n({ ja: "製品の進化", en: "Product evolution" })}</h2></div>
    <ol class="steps">
      <li class="step"><h3>${i18n({ ja: "個別セッションから並列オーケストレーションへ", en: "From individual sessions to parallel orchestration" })}</h3><p>${i18n({ ja: "分離 worktree、nested sessions、Session Grid、side chats、forks、セッション間参照と handoff が一つの監督モデルに統合されました。", en: "Isolated worktrees, nested sessions, Session Grid, side chats, forks, cross-session references, and handoffs now form one supervision model." })}</p></li>
      <li class="step"><h3>${i18n({ ja: "差分確認から GitHub ライフサイクル管理へ", en: "From diff inspection to GitHub lifecycle management" })}</h3><p>${i18n({ ja: "My Work、Issue / PR、inline review、Copilot review、CI、stack、merge queue、Agent Merge をアプリ内で観測・操作できます。", en: "My Work, issues/PRs, inline review, Copilot review, CI, stacks, merge queue, and Agent Merge are observable and actionable in the app." })}</p></li>
      <li class="step"><h3>${i18n({ ja: "単一設定から拡張可能な実行環境へ", en: "From a single setup to an extensible execution environment" })}</h3><p>${i18n({ ja: "Auto、BYOK、reasoning、cloud sandbox、automations、instructions、MCP、skills、plugins、custom agents、Canvas extensions がポリシー境界付きで加わりました。", en: "Auto, BYOK, reasoning controls, cloud sandboxes, automations, instructions, MCP, skills, plugins, custom agents, and Canvas extensions arrived with explicit policy boundaries." })}</p></li>
      <li class="step"><h3>${i18n({ ja: "機能追加から運用可能性へ", en: "From feature growth to operability" })}</h3><p>${i18n({ ja: "progressive loading、accessibility、storage、diagnostics、recovery、cache / credit observability、pinned-session protection、platform fixes が長期運用を支えます。", en: "Progressive loading, accessibility, storage, diagnostics, recovery, cache/credit observability, pinned-session protection, and platform fixes support sustained operation." })}</p></li>
    </ol>
  </section>

  <section class="section" id="new">
    <div class="section-heading"><p class="eyebrow">What's new</p><h2>${i18n({ ja: "v1.1.4 の主要変更", en: "Key changes in v1.1.4" })}</h2><p>${i18n({ ja: "以下は公式 changelog の Added から選んだ 5 項目です。11 Added、9 Changed、66 Fixed の全 86 項目はリリースページにあります。", en: "These five items come from the official Added section. The release page contains all 86 items: 11 Added, 9 Changed, and 66 Fixed." })}</p></div>
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
            href: `../copilot-app-v1.1.4-hands-on/${labFiles[capability.labs[0]]}`,
            action: { ja: `関連ラボ ${capability.labs.join(" / ")}`, en: `Related labs ${capability.labs.join(" / ")}` },
            attributes: `data-capability-id="${capability.id}" data-labs="${capability.labs.join(" ")}"`,
            badge: {
              className: capability.preview ? "badge--warning" : "badge--success",
              label: capability.badge,
            },
          }),
        )
        .join("\n")}
    </div>
  </section>

  <section class="section" id="learning-entry">
    <div class="section-heading"><p class="eyebrow">Learn in two dimensions</p><h2>${i18n({ ja: "成果ジャーニーと領域トラック", en: "Outcome journeys and domain tracks" })}</h2><p>${i18n({ ja: "同じ 25 個の atomic lab を、複数機能を横断する 6 ジャーニーと、基礎から高度へ深掘りする 10 トラックのどちらからでも再利用します。", en: "Reuse the same 25 atomic labs through six multi-feature outcome journeys or ten basic-to-advanced domain tracks." })}</p></div>
    <div class="card-grid">
      ${card({ eyebrow: "6 horizontal journeys", title: { ja: "エンドツーエンド成果から選ぶ", en: "Start from an end-to-end outcome" }, body: { ja: "導入から最初の PR、並列 delivery、Issue から stack merge、自動化、拡張、production operations までを順序付きで学びます。", en: "Follow ordered routes from install to first PR, parallel delivery, issue-to-stack merge, automation, extensibility, and production operations." }, href: "../copilot-app-v1.1.4-hands-on/#journeys", action: { ja: "ジャーニーを選ぶ", en: "Choose a journey" } })}
      ${card({ eyebrow: "10 vertical tracks", title: { ja: "一つの領域を深掘りする", en: "Master one domain deeply" }, body: { ja: "worktree、モデル、オーケストレーション、files / Canvas、My Work、PR、automations、拡張、Chronicle、security / operations を段階的に学びます。", en: "Progress through worktrees, models, orchestration, files/Canvas, My Work, PRs, automations, extensibility, Chronicle, and security/operations." }, href: "../copilot-app-v1.1.4-hands-on/#tracks", action: { ja: "トラックを選ぶ", en: "Choose a track" } })}
      ${card({ eyebrow: "Coverage matrix", title: { ja: "journey・track・lab の交差を確認", en: "Inspect journey, track, and lab intersections" }, body: { ja: "6 journey と 10 track の交点に、再利用される25 labをsemantic tableで表示します。機能taxonomyとの対応は上のcapability mapから各labへ辿れます。", en: "A semantic table shows how 25 reusable labs intersect six journeys and ten tracks. Use the capability map above to trace each taxonomy entry to its labs." }, href: "../copilot-app-v1.1.4-hands-on/#learning-matrix", action: { ja: "学習マトリクス", en: "Learning matrix" } })}
      ${card({ eyebrow: "Capstone · Lab 25", title: { ja: "Issueから着地とcleanupまで統合", en: "Integrate issue-to-landing and cleanup" }, body: { ja: "Plan、実装、review、CI、merge mechanism、commit attribution、session/worktree cleanupを一つの安全なsample repositoryで統合します。", en: "Integrate planning, implementation, review, CI, merge mechanisms, commit attribution, and session/worktree cleanup in one safe sample repository." }, href: "../copilot-app-v1.1.4-hands-on/25-capstone-issue-to-landed-pr.html", action: { ja: "capstoneを開く", en: "Open capstone" } })}
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
      ${card({ title: { ja: "Auto と Credits", en: "Auto and credits" }, body: { ja: "Auto はタスクの複雑さと利用可能なモデルに基づいて選択し、完了応答に実モデル、AI Credits、利用可能な cache details を表示します。公式文書では App の Auto は GA で、有料プランのモデルコストに 10% 割引があります。", en: "Auto selects from available models based on task complexity and shows the actual model, AI Credits, and available cache details on completed responses. Official docs mark Auto in the app as GA and describe a 10% model-cost discount on paid plans." } })}
      ${card({ title: { ja: "推論量と cache boundary", en: "Reasoning and cache boundaries" }, body: { ja: "複雑さに合わせて推論量を選びます。model、reasoning effort、context size、enabled tools / MCP の途中変更は cache を無効化し得るため、変更通知で以前のモデルと再利用コンテキストを確認します。", en: "Match reasoning effort to complexity. Mid-session changes to model, reasoning effort, context size, or enabled tools/MCP can invalidate cache, so inspect the model-change notice for the prior model and reused context." } })}
      ${card({ title: { ja: "BYOK", en: "BYOK" }, body: { ja: "OpenAI、Azure OpenAI、Microsoft Foundry、Anthropic、Ollama、Foundry Local、LM Studio、OpenAI 互換エンドポイントを追加できます。資格情報は system credential store に保存され、BYOK / local model では App の credits usage notification は表示されません。", en: "Add OpenAI, Azure OpenAI, Microsoft Foundry, Anthropic, Ollama, Foundry Local, LM Studio, or an OpenAI-compatible endpoint. Credentials stay in the system credential store, and the app does not show its credits-usage notification for BYOK or local models." }, badge: { className: "badge--warning", label: { ja: "Public preview", en: "Public preview" } } })}
      ${card({ title: { ja: "WSL と Windows 環境", en: "WSL and Windows environment" }, body: { ja: "WSL remote 環境は Windows 側の App から扱います。v1.1.4 の Windows integrated terminal は PowerShell profile の PATH / 環境変更を反映しますが、これは WSL と同一の実行境界ではありません。", en: "Use WSL remote environments from the Windows app. In v1.1.4, Windows integrated terminals pick up PATH and environment changes from the PowerShell profile, but that is not the same execution boundary as WSL." } })}
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
      <li><a href="https://docs.github.com/en/copilot/concepts/models/auto-model-selection">Auto model selection</a></li>
      <li><a href="https://docs.github.com/en/copilot/tutorials/optimize-ai-usage">Optimizing AI usage</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/customize-github-copilot-app">Customize the app</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/working-with-canvas-extensions">Canvas extensions</a></li>
      <li><a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/open-with-deep-links">Deep links</a></li>
      <li><a href="https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations">Cloud automations</a></li>
      <li><a href="https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands">App slash commands</a></li>
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
  <div class="chips"><span class="badge">${escapeHtml(item.featureArea)}</span></div>
  <div class="en" lang="en">${inlineMarkdown(item.en)}</div>
  <div class="ja" lang="ja">${inlineMarkdown(item.ja)}</div>
</li>`,
      )
      .join("\n")}
  </ul>
</section>`;
        })
        .join("\n");
      return `<article class="release-version" id="${release.version.replaceAll(".", "-")}" data-release-version data-version="${release.version}">
  <header class="release-version__header">
    <div><h2>${escapeHtml(release.version)}</h2><time datetime="${release.publishedAt}">${release.publishedAt.slice(0, 10)}</time></div>
    <div class="button-row"><span class="filter-count">${release.items.length} items</span><a href="${release.sourceUrl}" rel="noopener noreferrer">${i18n({ ja: "公式 changelog", en: "Official changelog" })}</a><a href="${release.releaseUrl}" rel="noopener noreferrer">${i18n({ ja: "リリース", en: "Release" })}</a></div>
  </header>
  ${sections}
</article>`;
    })
    .join("\n");
  return `${documentHead({
    title: "GitHub Copilot App v1.0.12 to v1.1.4 — Release explorer",
    description: "Search every official Added, Changed, Fixed, and Removed item across 19 GitHub Copilot App releases.",
  })}
<body>
${siteHeader({
  home: "./",
  links: [
    { href: "../copilot-app/", label: { ja: "バージョンハブ", en: "Version hub" } },
    { href: "index.html", label: { ja: "機能ガイド", en: "Feature guide" } },
    { href: "../copilot-app-v1.1.4-hands-on/", label: { ja: "学習システム", en: "Learning system" } },
  ],
})}
<section class="hero" aria-labelledby="releases-title">
  <div class="hero__inner">
    <p class="eyebrow">19 releases · 687 official items · Exact-once matrix</p>
    <h1 id="releases-title">${i18n({ ja: "v1.0.12 → v1.1.4 リリースエクスプローラー", en: "v1.0.12 → v1.1.4 release explorer" })}</h1>
    <p class="lede">${i18n({ ja: "v1.0.13 から v1.1.4 までの公式 Added / Changed / Fixed / Removed を、英語原文と忠実な日本語訳で日付・カテゴリ・機能領域とともに検索できます。JavaScript がなくても全項目を読めます。", en: "Search every official Added, Changed, Fixed, and Removed item from v1.0.13 through v1.1.4 in original English and faithful Japanese, with dates, categories, and feature areas. All entries remain readable without JavaScript." })}</p>
    <div class="hero-actions"><a class="button button--primary" href="assets/release-matrix.json">${i18n({ ja: "構造化マトリクス JSON", en: "Structured matrix JSON" })}</a><a class="button" href="index.html">${i18n({ ja: "機能ガイドへ戻る", en: "Back to feature guide" })}</a></div>
  </div>
</section>
<main id="main" class="page-shell">
  <section class="filter-panel" aria-labelledby="filter-title">
    <h2 id="filter-title">${i18n({ ja: "リリース項目を絞り込む", en: "Filter release items" })}</h2>
    <div class="filters">
      <div class="field"><label for="release-search">${i18n({ ja: "キーワード", en: "Keyword" })}</label><input id="release-search" type="search" data-release-search placeholder="Auto, WSL, accessibility…"></div>
      <div class="field"><label for="release-version">${i18n({ ja: "バージョン", en: "Version" })}</label><select id="release-version" data-release-version-filter><option value="">${optionLabel({ ja: "すべて", en: "All" })}</option>${matrix.releases.map((release) => `<option value="${release.version}">${release.version} · ${release.publishedAt.slice(0, 10)}</option>`).join("")}</select></div>
      <div class="field"><label for="release-category">${i18n({ ja: "カテゴリ", en: "Category" })}</label><select id="release-category" data-release-category><option value="">${optionLabel({ ja: "すべて", en: "All" })}</option>${categoryOrder.map((category) => `<option value="${category}">${category} · ${matrix.categoryCounts[category]}</option>`).join("")}</select></div>
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
await writeFile("copilot-app-v1.1.4/index.html", cleanHtml(renderFeatureIndex()), "utf8");
await writeFile("copilot-app-v1.1.4/releases.html", cleanHtml(renderReleases()), "utf8");
console.log("Rendered stable hub, v1.1.4 feature guide, and 19-release explorer");
