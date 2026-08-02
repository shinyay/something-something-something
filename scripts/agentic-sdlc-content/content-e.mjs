// PART 6: sections 16 (glossary), 17 (sources), 18 (deck-map appendix).
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre } from "./ui.mjs";

const OFFICIAL = badge("official", "公式");
const FRAMEWORK = badge("framework", "本資料の整理");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

// Slide-number chips. Used only in the deck-map appendix (§18).
const chips = (...nums) =>
    `<span class="slides">${nums.map((n) => `<span class="slide-chip">S${n}</span>`).join("")}</span>`;

export const sectionsE = [
    // ────────────────────────────────────────────────────────────── 13
    {
        id: "glossary",
        num: "16",
        eyebrow: "用語",
        title: "用語集",
        lead: "本資料は、GitHub の公式製品名・仕様と、本資料が独自に導入した整理語彙とを混在させています。どちらであるかを取り違えると、製品仕様と主張の区別が曖昧になります。ここでは主要な語彙を、区分（公式か本資料の整理か）とともに一覧にします。この区別を保つことが、本資料の信頼性の根幹です。",
        html: `
${table(
    ["用語", "区分", "対応する公式概念・実装と、出典上の注記"],
    [
        [
            "<strong>5 つの相互作用モード</strong><br>Completion → Conversation → Collaboration → Delegation → Orchestration",
            FRAMEWORK,
            `GitHub は「Assistive features」と「Agentic features」の 2 分類を使う。この 5 段階モデルは公式には公表されていない（§01）`,
        ],
        [
            "<strong>Delegation Contract</strong>（8 フィールド）",
            FRAMEWORK,
            "対応する公式機能名なし。Issue 本文 ＋ instructions ＋ ruleset ＋ required checks の組み合わせで実装する（§03）",
        ],
        [
            "<strong>Autonomy budget</strong>（Scope / Capability / Compute / Decision）",
            FRAMEWORK,
            "firewall・permissions・MCP 設定・required approvals などの個別制御に対応（§04）",
        ],
        [
            "<strong>Five layers</strong>（Intent / Context / Agent / Execution / Governance）",
            FRAMEWORK,
            "公式のアーキテクチャ表現ではない。本資料が全体を貫く整理層として §00 で導入する背骨（各層に本資料の枠組みが対応）",
        ],
        [
            "<strong>Agentic Modernization Loop</strong>（5 変換）",
            FRAMEWORK,
            `部分的に Modernize CLI の Assess → Plan → Execute に対応する（§07）`,
        ],
        [
            "<strong>Evidence Package</strong>（Code + Evidence + Uncertainty）",
            FRAMEWORK,
            "session log ＋ checks 結果 ＋ Verified 署名コミットが素材。<strong>受け入れ条件へのマッピングは自動化されない</strong>。§09 で本文導入",
        ],
        [
            "<strong>Adoption ladder</strong>（Assist → … → Orchestrate）",
            FRAMEWORK,
            "対応する公式概念なし。§01 の相互作用モードとは別軸（組織の成熟度）",
        ],
        [
            "<strong>Three forms of legacy</strong>（Code / Knowledge / Process）",
            FRAMEWORK,
            "対応する公式概念なし。§07 でレガシーの 3 形態として本文導入",
        ],
        [
            "<strong>Copilot cloud agent</strong>",
            OFFICIAL,
            "現行ドキュメントの正式名。旧名 <strong>Copilot coding agent</strong>（2025-09 に GA 告知）",
        ],
        [
            "<strong>Agent HQ</strong>",
            badge("na", "ブログ用語"),
            "GitHub Blog の傘ブランド。実 UI は <strong>Agents タブ / agents panel / agents ページ</strong>。<strong>mission control</strong> はコマンドセンターの概念名",
        ],
    ],
    { widths: ["26%", "14%", "60%"] },
)}

${callout(
    "key",
    "この区別を明示することが、本資料の最大の信頼性資産",
    `<p>本資料は、技術的な断定を <strong>「これは製品仕様」</strong> と <strong>「これは当方の整理」</strong> に一貫して切り分けています。特に <strong>Delegation Contract</strong> と <strong>Autonomy budget</strong> は後者（本資料の整理）、<strong>「エージェントは自分の PR を承認できない」</strong>は前者（製品仕様）です。<br>
    AI 関連の技術資料では、この 2 つが混ざりやすく、混ざった瞬間に「これは実際に動く仕様なのか、著者の願望なのか」が読めなくなります。バッジと本節が、その境界を可視化しています。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 14
    {
        id: "sources",
        num: "17",
        eyebrow: "出典",
        title: "一次情報リンク集",
        lead: "本資料の主張はすべて以下の一次情報に基づいています。仕様は変わるため、顧客提示前に該当ページの再確認を推奨します。",
        html: `
<h3>GitHub Copilot — エージェント</h3>
${ul([
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent", "About Copilot cloud agent"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations", "Risks and mitigations for Copilot cloud agent") + `<span class="src-note">「自分の PR を承認・マージできない」「<code>copilot/</code> ブランチ限定」「ワークフローは既定で自動実行しない」「firewall の限界」の出典</span>`,
    a("https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/start-copilot-sessions", "Starting Copilot sessions（投入経路）"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/manage-and-track-agents", "Manage and track agents（session log・共有既定値）"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment", "Customize the agent environment（copilot-setup-steps.yml・59 分上限）"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-the-firewall", "Customize the firewall"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/configure-secrets-and-variables", "Configure secrets and variables（Agents secrets・COPILOT_MCP_）"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents", "About custom agents"),
    a("https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents", "About third-party coding agents"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli", "About GitHub Copilot CLI"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet", "Fleet for Copilot CLI（サブエージェントの並列実行）") + `<span class="src-note">§06 の <code>/fleet</code>「独立コンテキスト窓」「逐次依存では利益なし」「AI Credits 増」の出典</span>`,
    a("https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/speed-up-task-completion", "Speed up task completion（/fleet の実務）"),
    a("https://docs.github.com/en/copilot/concepts/agents/github-copilot-app", "About the GitHub Copilot app") + `<span class="src-note">§01・§06 の「並列ワークスペース＝worktree＋ブランチ」「3 セッションモード」「CLI 上に構築」の出典</span>`,
    a("https://docs.github.com/en/copilot/concepts/about-cloud-and-local-sandboxes", "About cloud and local sandboxes（クラウドサンドボックス・Public Preview）"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations", "About Copilot automations") + `<span class="src-note">§06・§09・§10 の「private/internal 限定」「1 リポジトリにスコープ」「Git 管理外」「write 権限なしのイベントを既定で無視」の出典</span>`,
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automation-rationale-and-approvals", "About rationale, confidence, and approvals for issues"),
    a("https://docs.github.com/en/copilot/concepts/agents/hooks", "About hooks for GitHub Copilot") + `<span class="src-note">§04 の <code>preToolUse</code>「ツール実行を承認・拒否できる」8 フック種別・設定形式の出典</span>`,
    a("https://docs.github.com/en/copilot/reference/hooks-reference", "GitHub Copilot hooks reference"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/research-plan-iterate", "Research, plan, and iterate") + `<span class="src-note">§01 の「Sessions do not create pull requests automatically」の出典</span>`,
    a("https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent", "Troubleshoot cloud agent（§11 停止・タイムアウト）"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/roll-back-changes", "Roll back changes（§11 /undo・/rewind）"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-cli/chronicle", "Chronicle（セッション履歴）"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-memory", "Copilot Memory"),
])}

<h3>GitHub Copilot — コンテキストとカスタマイズ</h3>
${ul([
    a("https://docs.github.com/en/copilot/concepts/prompting/response-customization", "Response customization（instructions の優先順位）"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions", "Add repository instructions（applyTo・excludeAgent）"),
    a("https://docs.github.com/en/copilot/reference/custom-instructions-support", "Custom instructions support（クライアント別対応表）"),
    a("https://docs.github.com/en/copilot/concepts/context/spaces", "Copilot Spaces"),
    a("https://docs.github.com/en/copilot/concepts/context/mcp", "MCP concepts"),
    a("https://docs.github.com/en/copilot/concepts/agents/about-agent-skills", "About agent skills") + `<span class="src-note">§02 の Persistent context（<code>.github/skills</code>）の出典。automations も継承する（§06）</span>`,
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills", "Adding agent skills for GitHub Copilot"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent", "MCP and cloud agent"),
    a("https://docs.github.com/en/copilot/concepts/mcp-management", "MCP management（組織ポリシー）"),
    a("https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file", "Prompt files"),
])}

<h3>GitHub Copilot — ガバナンスとセキュリティ</h3>
${ul([
    a("https://docs.github.com/en/copilot/reference/supported-surfaces-for-policies", "Supported surfaces for policies") + `<span class="src-note">§10 の content exclusion 対応表の出典。<strong>「cloud agent には効かない」という誤解を正す根拠</strong></span>`,
    a("https://docs.github.com/en/copilot/concepts/context/content-exclusion", "Content exclusion（Agent mode で効かない件）"),
    a("https://docs.github.com/en/copilot/concepts/policies", "Copilot policies / AI Controls"),
    a("https://docs.github.com/en/copilot/concepts/agents/enterprise-management", "Enterprise management for agents"),
    a("https://docs.github.com/en/copilot/reference/agentic-audit-log-events", "Agentic audit log events（actor:Copilot・180 日）"),
    a("https://docs.github.com/en/copilot/concepts/agents/code-review", "Copilot code review"),
    a("https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review", "Using Copilot code review（常に Comment レビュー）"),
])}

<h3>GitHub プラットフォーム（Copilot 専用ではない統制機構）</h3>
${ul([
    a("https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches", "About protected branches"),
    a("https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets", "About rulesets（競合時は最も厳格な設定が適用）"),
    a("https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets", "Available rules for rulesets") + `<span class="src-note">§08 の「code scanning / code quality / restrict code coverage（Public Preview）/ require deployments to succeed」マージゲートの出典</span>`,
    a("https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/set-merge-protection", "Set code scanning merge protection"),
    a("https://docs.github.com/en/code-security/how-tos/maintain-quality-code/restrict-code-coverage", "Setting code coverage thresholds for pull requests（Public Preview）"),
    a("https://github.blog/changelog/2026-07-20-github-code-quality-is-now-generally-available/", "GitHub Code Quality GA（2026-07-20）"),
    a("https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners", "About CODEOWNERS"),
    a("https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments", "Manage environments（deployment protection rules）"),
])}

<h3>モダナイゼーション</h3>
${ul([
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/overview", "GitHub Copilot app modernization — Overview"),
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/modernization-agent/overview", "Modernization agent — Overview（Assess → Plan → Execute）"),
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/modernization-agent/quickstart", "Modernize CLI — Quickstart"),
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/quickstart-unit-tests", "Quickstart: unit tests"),
    a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "Modernizing legacy code with GitHub Copilot（COBOL → Node.js）"),
])}

<h3>GitHub Copilot — 計測（usage metrics）</h3>
${ul([
    a("https://docs.github.com/en/copilot/concepts/copilot-usage-metrics/copilot-metrics", "GitHub Copilot usage metrics") + `<span class="src-note">§14 の「4 ダッシュボード」「enterprise/org/repository/user 階層」「PR throughput と time to merge」「IDE テレメトリ前提」「Chat・Mobile 対象外」「ライセンス情報は別 API」の出典</span>`,
    a("https://docs.github.com/en/rest/copilot/copilot-usage-metrics", "REST API endpoints for Copilot usage metrics"),
    a("https://docs.github.com/en/copilot/how-tos/administer-copilot/view-impact-dashboard", "View the Copilot impact dashboard（採用 cohort と PR 出力の接続）"),
    a("https://github.blog/changelog/2026-07-17-repository-level-github-copilot-usage-metrics-generally-available/", "Repository-level Copilot usage metrics GA（2026-07-17）"),
    a("https://docs.github.com/en/rest/copilot/copilot-user-management", "REST API endpoints for Copilot user management（ライセンス／シートの source of truth）"),
])}

<h3>課金</h3>
${ul([
    a("https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing", "Models and pricing（AI Credits の計算）"),
    a("https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals", "Usage-based billing for individuals"),
    a("https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises", "Usage-based billing for organizations and enterprises"),
    a("https://docs.github.com/en/copilot/get-started/plans", "Copilot plans"),
])}

<h3>コード スキャンと Autofix</h3>
${ul([
    a("https://docs.github.com/en/code-security/concepts/code-scanning/autofix-for-code-scanning", "Autofix for code scanning"),
    a("https://github.blog/changelog/2026-07-10-agentic-autofix-for-code-scanning-alerts-in-public-preview/", "Agentic autofix in public preview（2026-07-10）"),
])}

${callout(
    "note",
    "検証日",
    `<p>本資料の内容は <strong>2026 年 8 月</strong>時点の一次情報に基づいて検証されています。GitHub Copilot の機能名・提供状態・課金モデルは頻繁に変わります。特に次の 3 点は変化が速いため、提案直前の再確認を強く推奨します：<br>
    ① <strong>Public Preview 機能の GA 昇格</strong>（custom agents、prompt files、Modernize CLI の assess/plan、agentic autofix、third-party agents）<br>
    ② <strong>プロダクト名称</strong>（cloud agent / coding agent の呼称、Agent HQ 周辺の UI 名）<br>
    ③ <strong>課金レート</strong>（AI Credits のプラン別付与量、2026-09-01 で終わる移行プロモーション）</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 15
    {
        id: "deck-map",
        num: "18",
        eyebrow: "付録",
        title: "登壇資料との対応表",
        lead: "本資料は、プレゼンテーション『Starting Agentic SDLC with GitHub Copilot』（46 枚）と同じ運用モデルを、スライドなしで読める技術資料として再構成したものです。以下は、本資料の各節と対応するスライド番号の対応表です。登壇資料を併せて使う場合の参照用であり、本文を読むのにスライドは不要です。",
        html: `
${table(
    ["本資料の節", "対応するスライド"],
    [
        [`<strong>§00</strong> Agentic SDLC とは何か`, chips(1, 2, 8, 18, 45, 46)],
        [`<strong>§01</strong> 5 つの相互作用モード`, chips(12, 13, 14, 15, 16, 17)],
        [`<strong>§02</strong> Context Engineering`, chips(20, 21)],
        [`<strong>§03</strong> Delegation Contract`, chips(22, 34, 44)],
        [`<strong>§04</strong> Autonomy Budget`, chips(23)],
        [`<strong>§05</strong> Agentic Modernization Loop`, chips(25, 27, 28, 29, 30, 31, 32, 33, 40)],
        [`<strong>§06</strong> Orchestration の実務`, `<span class="muted">本資料で追加（対応スライドなし）</span>`],
        [`<strong>§07</strong> モダナイゼーション専用ツール`, chips(28, 29, 30)],
        [`<strong>§08</strong> 確率的推論・決定的検証`, chips(24, 28, 35)],
        [`<strong>§09</strong> ガバナンス境界としての PR`, chips(32, 33, 35, 36, 37)],
        [`<strong>§10</strong> セキュリティ`, chips(38)],
        [`<strong>§11</strong> 逸脱と回復`, `<span class="muted">本資料で追加（対応スライドなし）</span>`],
        [`<strong>§12</strong> 採用ラダー`, chips(42, 43, 44)],
        [`<strong>§13</strong> コスト構造`, `<span class="muted">登壇資料は課金に触れていない（本資料で補った論点）</span>`],
        [`<strong>§14</strong> 計測`, `<span class="muted">本資料で追加（対応スライドなし）</span>`],
        [`<strong>§15</strong> 委譲してはいけない作業`, `<span class="muted">本資料で新規に加えた実践論点</span>`],
        [`<strong>§16</strong> 用語集`, chips(8, 12, 13, 20, 22, 23, 25, 35, 43)],
        [`<strong>§17</strong> 一次情報リンク集`, `<span class="muted">一次情報のみ（スライド非依存）</span>`],
        [`<strong>§18</strong> 本付録`, `<span class="muted">—</span>`],
    ],
    { widths: ["55%", "45%"] },
)}

${callout(
    "note",
    "スライドは補助であって前提ではない",
    `<p>本資料は §00〜§18 だけで、GitHub Copilot の技術的観点から Agentic SDLC を通読できるように書かれています。上の対応表とダウンロードできる PDF は、登壇の現場で本資料とスライドを併用したい場合の橋渡しにすぎません。<strong>スライドを持っていなくても、本文の理解に不足は生じません。</strong></p>`,
)}
`,
    },
];
