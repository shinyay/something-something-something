// Sections 10–13 of the supplementary guide.
import { badge, c, a, table, callout, deckQuote, docQuote, cards, steps, ul, pre } from "./ui.mjs";

const OFFICIAL = badge("official", "公式");
const FRAMEWORK = badge("framework", "発表者FW");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsD = [
    // ────────────────────────────────────────────────────────────── 10
    {
        id: "ladder",
        num: "10",
        eyebrow: "導入",
        title: "採用ラダー → 各段の Definition of Ready",
        slides: [43, 44],
        lead: "S43 の Assist → Collaborate → Delegate → Standardize → Orchestrate は、S12 の相互作用モデルとは別物であるとスライド自身が明示しています（前者は組織の成熟度、後者は対話の様式）。ここでは「次の段に上がってよい」と判断するための、具体的なリポジトリ資産のチェックリストを置きます。",
        html: `
${deckQuote(
    "This organizational maturity ladder is distinct from the interaction continuum in §2: increase delegation only after repository context and verification mature enough to support the next level safely.<br>Context and verification mature first; autonomy and orchestration follow.",
    "S43",
)}

${table(
    ["段", "スライドの定義", "この段に上がる前に揃っているべきもの（Definition of Ready）"],
    [
        [
            `<strong>1. Assist</strong>`,
            "A human owns every step and uses Copilot for bounded suggestions",
            ul([
                "Copilot ライセンスの割り当て",
                "組織ポリシー（AI Controls）の初期設定：どのクライアント・どのモデルを許可するか",
                "必要なら content exclusion の設定（Business / Enterprise）",
            ]),
        ],
        [
            `<strong>2. Collaborate</strong>`,
            "Human and agent share investigation, planning, implementation, and checking",
            ul([
                `<strong><code>.github/copilot-instructions.md</code> が存在し、実際に守られている</strong>`,
                "ビルドとテストが 1 コマンドで再現できる",
                "IDE Agent mode / Copilot CLI の利用ポリシーが決まっている",
                `<span class="warn-inline">注意：IDE の Agent mode では content exclusion が効かない</span>`,
            ]),
        ],
        [
            `<strong>3. Delegate</strong>`,
            "An agent executes a bounded contract and returns a decision-ready pull request",
            ul([
                "<strong>required status checks が定義され、実際にマージを止める</strong>",
                "CODEOWNERS が設定され、重要領域に必須レビュアがいる",
                `<code>copilot-setup-steps.yml</code> で依存解決が再現する`,
                "firewall allowlist が承認済みレジストリに限定されている",
                "<strong>Delegation Contract の 8 フィールドを持つ Issue テンプレート</strong>",
                "characterization テストが、委譲対象領域に存在する",
            ]),
        ],
        [
            `<strong>4. Standardize</strong>`,
            "Teams reuse instructions, skills, workflows, evidence formats, and gates",
            ul([
                `<code>AGENTS.md</code> ＋ パス別 <code>*.instructions.md</code> の体系ができている`,
                `${PP} <code>.github/agents/*.md</code> による custom agents（役割ごとの委譲先の型）`,
                "PR 本文テンプレート（受け入れ条件マッピング欄・Uncertainty 欄を含む）",
                "組織レベル instructions（Business / Enterprise）",
                "environments と deployment protection rules による merge / release / production の分離",
            ]),
        ],
        [
            `<strong>5. Orchestrate</strong>`,
            "Multiple bounded tasks run across the portfolio within governance and review capacity",
            ul([
                "Agents パネルでの複数タスク運用ルール",
                "<strong>レビュー容量の実測値</strong>（＝並列度の実質的な上限）",
                `監査ログ <code>actor:Copilot</code> の定期レビュー運用`,
                "AI Credits / Actions 分の budgets 設定と監視",
                `third-party agents を使う場合、<span class="warn-inline">content exclusion が適用されない</span>ことを踏まえたポリシー`,
            ]),
        ],
    ],
    { widths: ["12%", "26%", "62%"] },
)}

${callout(
    "key",
    "S43 の FOUNDATION ラベルの意味",
    `<p>スライドの階段図の下には <em>FOUNDATION: context &amp; verification</em> と書かれています。上の表を見ると、段が上がるほど増えるのは<strong>エージェントの能力ではなくリポジトリ側の資産</strong>であることが分かります。Delegate 段に必要なものはほぼすべて「リポジトリに何が置いてあるか」であり、Copilot の設定ではありません。<br>つまり導入プロジェクトの実作業の大半は、<strong>Copilot の導入ではなくリポジトリの整備</strong>です。これは提案の工数見積もりに直結する洞察です。</p>`,
)}

<h3>S44 の「明日やること」を実行可能にする最小セット</h3>
<p>S44 の CTA は <em>"Choose one important, reversible modernization task and write its Delegation Contract before your next sprint planning session."</em> です。この 1 件を本当に委譲まで持っていくために最低限必要なのは次の 4 つだけです：</p>
${steps([
    { title: "① 対象領域の characterization テスト", body: "変更前の振る舞いを固定する。ここが無いと「検証」が空回りする。" },
    { title: "② required status checks", body: "そのテストとビルドが、通らなければマージできない状態になっていること。" },
    { title: "③ 8 フィールドを埋めた Issue", body: "Outcome+Why / Scope+Out / Context / Tools+Constraints / Acceptance / Verification+Evidence / Escalate / Human gates。" },
    { title: "④ CODEOWNERS", body: "契約の Escalate 欄に書いた「触ってほしくない領域」を、実際に必須レビューが発火する形にしておく。" },
])}
`,
    },

    // ────────────────────────────────────────────────────────────── 11
    {
        id: "billing",
        num: "11",
        eyebrow: "コスト",
        title: "この運用モデルのコストはどう発生するか",
        slides: [23],
        lead: "スライドは課金に一切触れていませんが、S23 の Compute budget を実務で語るには不可欠な情報です。2026 年 6 月に課金モデルが変わっている点にも注意が必要です。",
        html: `
${callout(
    "warn",
    "premium requests はもう既定の課金モデルではない",
    `${docQuote(
        "Model multipliers are a concept specific to the legacy premium request-based billing system, and do not apply to GitHub's new usage-based billing model.",
        "https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/model-multipliers-for-annual-plans",
        "docs.github.com — Model multipliers for annual plans (legacy)",
    )}
  <p>premium requests とモデル乗数が適用されるのは、2026 年 6 月 1 日以降もレガシー請求に留まった<strong>既存の年額 Copilot Pro / Pro+ 契約者のみ</strong>です。新規の説明では <strong>GitHub AI Credits</strong> を使ってください。</p>`,
)}

<h3>現行モデル：GitHub AI Credits</h3>
${cards(
    [
        { title: "単位", body: `<p class="big">1 AI Credit = <strong>$0.01 USD</strong></p>` },
        { title: "計算方法", body: `<p>入力・出力・キャッシュの<strong>トークン消費量</strong> × モデル別公開価格。<span class="neg">リクエスト乗数モデルではない</span></p>` },
        { title: "自動モデル選択の割引", body: `<p>有料ユーザーは Chat・CLI・Copilot app・cloud agent で <strong>10% のコスト割引</strong></p>` },
    ],
    { cols: 3 },
)}

${table(
    ["機能", "AI Credits", "GitHub Actions 分", "備考"],
    [
        ["code completions / next edit suggestions", `<span class="pos">消費しない</span>`, `<span class="pos">消費しない</span>`, "従来の completion カウントモデルが継続"],
        ["Copilot Chat", `<span class="neg">消費する</span>`, "—", ""],
        ["Agent mode（IDE）", `<span class="neg">消費する</span>`, "—", "プロンプトごとに消費"],
        ["Copilot CLI", `<span class="neg">消費する</span>`, "—", ""],
        ["<strong>Copilot cloud agent</strong>", `<span class="neg">消費する</span>`, `<span class="neg">消費する</span>`, "<strong>2 種類のコストが同時に発生する</strong>"],
        ["Copilot code review", `<span class="neg">消費する</span>`, `<span class="neg">消費する</span>`, "agentic なコンテキスト／ツール実行分"],
        ["agentic autofix", `<span class="neg">消費する</span>`, `<span class="neg">消費する</span>`, `${PP}（2026-07-10〜）`],
        ["Copilot Autofix（従来型）", `<span class="pos">消費しない</span>`, `<span class="pos">消費しない</span>`, "Copilot サブスクリプション不要"],
        ["third-party coding agents", `<span class="neg">消費する</span>`, `<span class="neg">消費する</span>`, `${PP} Anthropic Claude / OpenAI Codex`],
        ["Copilot Spaces", `<span class="neg">消費する</span>`, "—", "質問は Chat インタラクションとして計上"],
    ],
    { widths: ["28%", "16%", "18%", "38%"] },
)}

<h3>プラン別の月次 AI Credits</h3>
${table(
    ["プラン", "価格", "含まれる AI Credits", "cloud agent"],
    [
        ["Free", "無料", "自動モデル選択経由の割当 ＋ 2,000 completions/月", `<span class="neg">対象外</span>`],
        ["Student", "無料", "自動モデル選択経由の割当 ＋ completions 無制限", `<span class="pos">含まれる</span>`],
        ["Pro", "$10/月", "1,500（base 1,000 ＋ flex 500）", `<span class="pos">既定で有効</span>`],
        ["Pro+", "$39/月", "7,000（base 3,900 ＋ flex 3,100）", `<span class="pos">既定で有効</span>`],
        ["Max", "$100/月", "20,000（base 10,000 ＋ flex 10,000）", `<span class="pos">既定で有効</span>`],
        ["Business", "$19/付与シート/月", "1,900/ユーザー/月（請求主体でプール）", `<span class="mid">管理者が有効化するまで無効</span>`],
        ["Enterprise", "$39/付与シート/月", "3,900/ユーザー/月（請求主体でプール）", `<span class="mid">管理者が有効化するまで無効</span>`],
    ],
    { widths: ["16%", "18%", "38%", "28%"] },
)}
<p class="muted">2026 年 6 月 1 日〜9 月 1 日の移行プロモーションとして、既存 Business / Enterprise 顧客はそれぞれ 3,000 / 7,000 クレジット（ユーザー/月）。<strong>未使用分は翌月に繰り越されない。</strong></p>

${callout(
    "note",
    "S23 の Compute budget を実務で語るときの要点",
    `<p>cloud agent は <strong>AI Credits と Actions 分の 2 系統</strong>を同時に消費します。したがって「並列度を上げる」判断は 2 種類の予算に同時に効きます。<br>
    ただし実務上のボトルネックは通常コストではなく<strong>レビュー容量</strong>です。S43 の Orchestrate 段が「within governance and review capacity」と条件づけているのはそのためで、S42「Humans move from the work loop to the decision loop」も同じ制約を別角度から述べています。<strong>投入できるタスク数の上限は、承認できる人の数で決まります。</strong></p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 12
    {
        id: "glossary",
        num: "12",
        eyebrow: "用語",
        title: "発表者フレームワーク / 公式用語 対応表",
        slides: [12, 13, 20, 22, 23, 25, 43],
        lead: "このプレゼンテーションは独自の整理枠組みを多く使っており、スライド自身がそれを申告しています。顧客説明で「これは GitHub の公式用語ですか」と問われたときに即答できるよう、一覧にします。",
        html: `
${table(
    ["本プレゼンテーションの用語", "区分", "最も近い公式概念 / 実装", "スライド自身の申告"],
    [
        [
            "<strong>5 段階の相互作用モデル</strong><br>Completion → Conversation → Collaboration → Delegation → Orchestration",
            FRAMEWORK,
            `GitHub は「Assistive features」と「Agentic features」の 2 分類を使う`,
            `S12 に <code>PRESENTER FRAMEWORK</code> バッジ。ノートに <em>"it does not publish this exact five-stage model"</em>`,
        ],
        [
            "<strong>Delegation Contract</strong>（8 フィールド）",
            FRAMEWORK,
            "対応する公式機能名なし。Issue 本文 ＋ instructions ＋ ruleset ＋ required checks の組み合わせで実装（§03）",
            `<code>SOURCE: User-provided original specification</code>`,
        ],
        [
            "<strong>Autonomy budget</strong>（Scope / Capability / Compute / Decision）",
            FRAMEWORK,
            "firewall・permissions・MCP 設定・required approvals などの個別制御（§04）",
            `<code>SOURCE: Derived (risk-scaled autonomy model …)</code>`,
        ],
        [
            "<strong>Five layers</strong>（Intent / Context / Agent / Execution / Governance）",
            FRAMEWORK,
            "公式のアーキテクチャ表現ではない",
            `ノートに <em>"The layers are a presenter framework, not an official GitHub product architecture."</em>`,
        ],
        [
            "<strong>Agentic Modernization Loop</strong>（5 変換）",
            FRAMEWORK,
            `部分的に Modernize CLI の Assess → Plan → Execute に対応（§09）`,
            `<code>SOURCE: Derived (five-stage loop …)</code>`,
        ],
        [
            "<strong>Evidence Package</strong>（Code + Evidence + Uncertainty）",
            FRAMEWORK,
            "session log ＋ checks 結果 ＋ Verified 署名コミットが素材。<strong>受け入れ条件へのマッピングは自動化されない</strong>",
            `S35。<code>SOURCE:</code> は manage-and-track-agents`,
        ],
        [
            "<strong>Adoption ladder</strong>（Assist → … → Orchestrate）",
            FRAMEWORK,
            "対応する公式概念なし",
            "S43 が「§2 の相互作用モデルとは別物」と明示",
        ],
        [
            "<strong>Three forms of legacy</strong>（Code / Knowledge / Process）",
            FRAMEWORK,
            "対応する公式概念なし",
            "S8",
        ],
        [
            "<strong>Copilot cloud agent</strong>",
            OFFICIAL,
            "現行ドキュメントの正式名。旧名 <strong>Copilot coding agent</strong>（2025-09 に GA 告知）",
            "S13・S32 の <code>SOURCE:</code> が about-cloud-agent",
        ],
        [
            "<strong>Agent HQ</strong>",
            badge("na", "ブログ用語"),
            "GitHub Blog の傘ブランド。実 UI は <strong>Agents タブ / agents panel / agents ページ</strong>。<strong>mission control</strong> はコマンドセンターの概念名",
            "—",
        ],
    ],
    { widths: ["22%", "10%", "38%", "30%"] },
)}

${callout(
    "key",
    "この区別を明示することが、この資料と発表の最大の信頼性資産",
    `<p>元スライドは 46 枚すべてのスピーカーノートに <code>SOURCE:</code> 行を持ち、<code>Derived content declaration</code>・<code>Source caveat</code>・<code>Derivation rationale</code> で「どこまでが公式で、どこからが自分の整理か」を宣言しています。この規律は、AI 関連のプレゼンテーションでは稀です。<br>
    発表の場でも <strong>「これは当社の整理です」と「これは製品仕様です」を口頭で切り分ける</strong>ことで、同じ効果が得られます。特に Delegation Contract と Autonomy budget は前者、「エージェントは自分の PR を承認できない」は後者です。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 13
    {
        id: "sources",
        num: "13",
        eyebrow: "出典",
        title: "一次情報リンク集",
        slides: [],
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
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-memory", "Copilot Memory"),
])}

<h3>GitHub Copilot — コンテキストとカスタマイズ</h3>
${ul([
    a("https://docs.github.com/en/copilot/concepts/prompting/response-customization", "Response customization（instructions の優先順位）"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions", "Add repository instructions（applyTo・excludeAgent）"),
    a("https://docs.github.com/en/copilot/reference/custom-instructions-support", "Custom instructions support（クライアント別対応表）"),
    a("https://docs.github.com/en/copilot/concepts/context/spaces", "Copilot Spaces"),
    a("https://docs.github.com/en/copilot/concepts/context/mcp", "MCP concepts"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent", "MCP and cloud agent"),
    a("https://docs.github.com/en/copilot/concepts/mcp-management", "MCP management（組織ポリシー）"),
    a("https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file", "Prompt files"),
])}

<h3>GitHub Copilot — ガバナンスとセキュリティ</h3>
${ul([
    a("https://docs.github.com/en/copilot/reference/supported-surfaces-for-policies", "Supported surfaces for policies") + `<span class="src-note">§08 の content exclusion 対応表の出典。<strong>スライド S38 のノート記述との差分はここで確認できる</strong></span>`,
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
];
