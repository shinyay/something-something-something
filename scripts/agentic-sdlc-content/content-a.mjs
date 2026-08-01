// Sections 0–6 of the supplementary guide.
import { badge, slides, c, a, table, callout, deckQuote, docQuote, cards, steps, ul, pre } from "./ui.mjs";

const OFFICIAL = badge("official", "公式");
const FRAMEWORK = badge("framework", "発表者FW");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");
const UNLABELED = badge("na", "状態表記なし");

export const sectionsA = [
    // ────────────────────────────────────────────────────────────── 0
    {
        id: "intro",
        num: "00",
        eyebrow: "はじめに",
        title: "本資料の位置づけと読み方",
        slides: [1, 2, 46],
        lead: "プレゼンテーション『Starting Agentic SDLC with GitHub Copilot』は、意図的に「操作モデル（どう仕事を設計するか）」に集中し、GitHub Copilot の個別機能の深掘りを避けています。本資料はその欠けている層 —— 各概念を実際に何が実装するのか —— を埋めます。",
        html: `
${deckQuote(
    "GitHub Copilot's next value is not generating more code; it is enabling teams to redesign modernization as bounded, verifiable work that agents execute and humans govern.",
    "S2 / S18 / S45 / S46（逐語・4回反復）",
)}

<p>このテーゼは「何を作るか」ではなく「どう仕事を分割し、誰が責任を持つか」の主張です。したがってスライドは <strong>Delegation Contract</strong>（委譲契約）、<strong>Autonomy Budget</strong>（自律性の予算）、<strong>Agentic Modernization Loop</strong> といった<em>設計語彙</em>を提供します。しかしそれらを実際に GitHub 上で成立させるのは、具体的な機能・ファイル・設定です。本資料はその対応関係を 1 対 1 で示します。</p>

<h3>3 種類のバッジ</h3>
${table(
    ["バッジ", "意味", "扱い方"],
    [
        [OFFICIAL, "GitHub / Microsoft の公式ドキュメントに存在するプロダクト名・機能名", "顧客への提案でそのまま使える"],
        [FRAMEWORK, "本プレゼンテーション独自の整理枠組み。公式用語ではない", "「当社の整理では」と前置きして使う"],
        [`${GA} ${PP} ${UNLABELED}`, "一次情報での提供状態。「状態表記なし」はドキュメントに GA/Preview の明記がないもの", "Preview は SLA・仕様変更リスクを添えて説明する"],
    ],
    { widths: ["18%", "48%", "34%"] },
)}

${callout(
    "note",
    "スライド自身が出典規律を持っている",
    `<p>元スライドのスピーカーノートは全ページに <code>SOURCE:</code> 行を持ち、「User-provided original specification」か「Derived（…）」かを明示し、さらに <code>Source caveat</code> で公式用語との差分を宣言しています。たとえば S12 のノートは「GitHub uses "Assistive features" and "Agentic features"; it does not publish this exact five-stage model.」と自己申告しています。本資料もこの規律を継承します。</p>`,
)}

<h3>本資料が答える問い</h3>
${ul([
    "スライドの 5 段階モデルは、実際にはどのプロダクトに対応するのか（§01）",
    "「Context は大きなプロンプトではない」を、具体的にどのファイルで実現するのか（§02）",
    "Delegation Contract の 8 フィールドは、GitHub のどこに書けばエージェントに効くのか（§03）",
    "「自律性は予算である」を、どの設定項目で配分するのか（§04）",
    "Modernization Loop の各段で、どの機能が何を生むのか（§05）",
    "「決定的に検証する」の決定的側とは具体的に何か（§06）",
    "PR がガバナンス境界として機能する構造的な保証は何か（§07）",
    "セキュリティ条件は、どの設定で成立し、どこに穴があるのか（§08）",
    "モダナイゼーション専用のツールは今どうなっているのか（§09）",
    "採用ラダーの各段に上がる前提条件は何か（§10）",
    "この運用モデルのコストはどう発生するのか（§11・スライドには無い論点）",
])}
`,
    },

    // ────────────────────────────────────────────────────────────── 1
    {
        id: "continuum",
        num: "01",
        eyebrow: "相互作用モデル",
        title: "5 段階の相互作用モデル → 実プロダクト対応",
        slides: [12, 13, 14, 15, 16, 17],
        lead: "スライド S12 は Completion → Conversation → Collaboration → Delegation → Orchestration という 5 段階を提示し、明示的に「PRESENTER FRAMEWORK」と自己申告しています。ここでは各段階に対応する実プロダクトを確定させます。",
        html: `
${deckQuote(
    "The useful progression is measured by how much work a person can define and hand off—not by launch dates.",
    "S12",
)}

${table(
    ["段階", "対応するプロダクト", "実行場所", "同期性", "課金"],
    [
        [
            `<strong>Completion</strong><br><span class="muted">token / line / block</span>`,
            `${OFFICIAL} <strong>GitHub Copilot code suggestions</strong><br><span class="muted">ghost text / next edit suggestions</span>`,
            "IDE のみ",
            "同期",
            `<span class="pos">AI Credits 消費なし</span>`,
        ],
        [
            `<strong>Conversation</strong><br><span class="muted">question / explanation</span>`,
            `${OFFICIAL} <strong>GitHub Copilot Chat</strong>`,
            "GitHub.com / IDE / Mobile / CLI",
            "同期",
            "AI Credits",
        ],
        [
            `<strong>Collaboration</strong><br><span class="muted">bounded steps in a shared session</span>`,
            `${OFFICIAL} <strong>Agent mode</strong>（IDE）<br>${OFFICIAL} <strong>GitHub Copilot CLI</strong>（<code>copilot</code>）`,
            "自分のマシン / ローカル作業ツリー",
            "同期",
            "AI Credits",
        ],
        [
            `<strong>Delegation</strong><br><span class="muted">outcome returned with evidence</span>`,
            `${OFFICIAL} <strong>GitHub Copilot cloud agent</strong>`,
            "GitHub Actions 上の ephemeral 開発環境",
            "<strong>非同期</strong>",
            "AI Credits <strong>＋ Actions 分</strong>",
        ],
        [
            `<strong>Orchestration</strong><br><span class="muted">repeatable flow across governed work</span>`,
            `${OFFICIAL} <strong>Agents タブ / agents panel</strong>（<code>github.com/copilot/agents</code>）<br>${PP} third-party coding agents（Anthropic Claude / OpenAI Codex）`,
            "GitHub.com（横断的な指令面）",
            "非同期・並列",
            "各エージェントの課金に従う",
        ],
    ],
    { widths: ["16%", "30%", "20%", "12%", "22%"] },
)}

${callout(
    "key",
    "Collaboration と Delegation の実体的な境界は「同期／非同期」ではなく「どこで動くか」",
    `<p>Agent mode はあなたのマシンで、あなたが見ている前で動きます。ファイルは即座に変わり、あなたはいつでも止められます。<strong>cloud agent は違います。</strong> GitHub Actions 上の使い捨て環境で動き、あなたは見ていません。だから成果物が <code>copilot/…</code> ブランチと draft PR という「検査可能な形」で返る必要がある —— スライド S13 の「Delegation transfers responsibility for executing an outcome, not authority to merge it.」は、この実行モデルの直接の帰結です。</p>`,
)}

<h3>cloud agent へのタスク投入経路（現行ドキュメントで確認できるもの）</h3>
${ul([
    `リポジトリの <strong>Agents タブ</strong>／グローバル <strong>agents panel</strong>／${a("https://github.com/copilot/agents", "github.com/copilot/agents")}`,
    "ダッシュボードの <strong>Task</strong> プロンプト",
    `GitHub Chat の ${c("/task")}`,
    "Issue を <strong>Copilot</strong> にアサイン",
    `既存 PR のコメントで ${c("@copilot")}`,
    "IDE からの委譲 / GitHub Mobile / REST API / GitHub MCP Server",
    `${PP} GitHub CLI の ${c("gh agent-task create")}（スタンドアロンの <code>copilot</code> CLI とは別物）`,
])}

${callout(
    "warn",
    "名称の変遷に注意",
    `<p>現行ドキュメントの名称は <strong>GitHub Copilot cloud agent</strong> です。2025 年 9 月に GA announcement が出たときの名称は <strong>Copilot coding agent</strong> でした。正式なリネーム告知は確認できていないため、「ドキュメント上の用語が変わった」と説明するのが安全です。<br>
    同様に <strong>Agent HQ</strong> は GitHub Blog の傘ブランドで、実際の UI 名称は <strong>Agents タブ / agents panel / agents ページ</strong>、<strong>mission control</strong> はコマンドセンターという概念名です。</p>`,
)}

<h3>スライドが述べる「管理対象の変化」の実装（S16）</h3>
${cards(
    [
        {
            title: "従来: 差分を管理する",
            body: "レビュー対象は diff。作業の経過はローカルにしか残らない。",
        },
        {
            title: "Agentic: セッションを管理する",
            badge: OFFICIAL,
            body: "cloud agent の <strong>session log</strong> に、進捗・トークン使用量・所要時間・推論／ツール実行ログが残る。コミットは <strong>Verified 署名</strong>付きで、セッションログへ辿れる。依頼者が co-author に入る。",
        },
        {
            title: "共有の既定値",
            badge: badge("warn", "要注意"),
            body: "cloud agent のセッションは、既定でリポジトリにアクセスできる全員に共有される。ローカルセッションは既定で非共有。",
        },
    ],
    { cols: 3 },
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 2
    {
        id: "context",
        num: "02",
        eyebrow: "Context Engineering",
        title: "「Context は大きなプロンプトではない」を実装する",
        slides: [21],
        lead: "S21 は Context を Persistent / Task / Dynamic の 3 種に分け、「discoverable（エージェントが確実に見つけられる場所にある）」「permission-aware, owned, reviewed, maintained」という品質要件を課します。これは抽象論ではなく、そのままリポジトリのファイル配置設計です。",
        html: `
${deckQuote(
    "Context is a managed system of relevant, current, and authorized information—not a one-time prompt enlarged until it works.<br>More tokens do not repair stale, hidden, or unauthorized context.",
    "S21",
)}

${table(
    ["スライドの分類", "実装", "所在", "備考"],
    [
        [
            `<strong>Persistent context</strong><br><span class="muted">Architecture, conventions, policies, repository knowledge</span>`,
            `${OFFICIAL} custom instructions`,
            `${c(".github/copilot-instructions.md")}<br>${c("AGENTS.md")}<br>${c(".github/instructions/**/*.instructions.md")}`,
            `<code>AGENTS.md</code> は<strong>ネスト可能</strong>で、ディレクトリツリー上<strong>最も近いファイルが優先</strong>される。<code>*.instructions.md</code> は YAML frontmatter の <code>applyTo</code> glob でパス限定。`,
        ],
        [
            "",
            `${OFFICIAL} 組織レベル instructions`,
            "Organization の Copilot 設定",
            "Business / Enterprise のみ。GitHub.com Chat・code review・cloud agent に適用。",
        ],
        [
            "",
            `${OFFICIAL} <strong>GitHub Copilot Spaces</strong>`,
            "GitHub.com",
            "リポジトリ・ファイル・PR・Issue・自由記述・画像を束ねた永続コンテキスト。GitHub 由来のソースは自動追従。IDE からは GitHub MCP Server 経由で参照。",
        ],
        [
            "",
            `${PP} <strong>GitHub Copilot Memory</strong>`,
            "リポジトリ / ユーザー",
            "リポジトリ事実とユーザー選好を永続化。事実は引用元を保持し現ブランチに対して検証される。<strong>28 日未使用で失効</strong>。cloud agent / code review / CLI が利用。",
        ],
        [
            `<strong>Task context</strong><br><span class="muted">Outcome, scope, acceptance criteria, supplied references</span>`,
            "Issue 本文（＝ Delegation Contract の置き場所）",
            "GitHub Issues",
            "§03 で全 8 フィールドの対応表を示す。",
        ],
        [
            "",
            `${PP} ${OFFICIAL} <strong>Copilot prompt files</strong>`,
            `${c(".github/prompts/*.prompt.md")}`,
            `再利用可能なプロンプトテンプレート。YAML で <code>agent</code>・<code>description</code>、入力は <code>` + "${input:code:...}" + `</code> 形式。<strong>IDE Chat のみ</strong>（GitHub.com Chat・CLI では未文書化）。`,
        ],
        [
            `<strong>Dynamic context</strong><br><span class="muted">Current code, tool results, failures, changed assumptions</span>`,
            `${OFFICIAL} <strong>MCP（Model Context Protocol）</strong>`,
            "リポジトリの MCP JSON 設定 / IDE / CLI",
            "外部ツールと文脈を供給。cloud agent と code review は同じリポジトリ MCP 設定を共有する。",
        ],
        [
            "",
            "ビルド・テスト・スキャン結果",
            "GitHub Actions / CodeQL / Dependabot",
            "§06 で扱う。エージェントは失敗結果を読んで反復する。",
        ],
    ],
    { widths: ["18%", "22%", "26%", "34%"] },
)}

<h3>custom instructions の優先順位（GitHub.com）</h3>
${steps([
    { title: "1. Personal instructions", body: "個人設定。GitHub.com Chat のみ。" },
    { title: "2. Path-specific instructions", body: `${c(".github/instructions/**/*.instructions.md")} のうち <code>applyTo</code> がマッチしたもの。` },
    { title: "3. Repository-wide instructions", body: c(".github/copilot-instructions.md") },
    { title: "4. Agent instructions", body: `${c("AGENTS.md")}（および対応環境では <code>CLAUDE.md</code> / <code>GEMINI.md</code>）` },
    { title: "5. Organization instructions", body: "組織設定。" },
])}

${callout(
    "warn",
    "これは「優先度ガイダンス」であって決定的なパーサ規則ではない",
    `<p>公式ドキュメントは「関連するすべての instruction セットが Copilot に渡される」と明記しています。つまり上位が下位を<strong>上書きする保証はありません</strong>。矛盾する指示を複数の階層に置くと、モデルがどちらを採るかは非決定的です。<br>スライド S21 の「Context must be … owned, reviewed, and maintained」は、この非決定性への実務的な対処として読むべきです —— 矛盾を残さないことがオーナーシップの中身です。</p>`,
)}

<h3>パス限定 instructions の書式</h3>
${pre("md", "---\napplyTo: \"**/*.java,**/auth/**\"\nexcludeAgent: \"code-review\"\n---\n\n認証モジュールを変更する場合は、既存の characterization テストを先に確認すること。\n公開 API のシグネチャは変更しない。")}
<p class="muted"><code>excludeAgent</code> に指定できるのは <code>code-review</code> または <code>cloud-agent</code>。特定のエージェントにだけ指示を出し分けられます。</p>

<h3>クライアント別サポート状況</h3>
${table(
    ["サーフェス", "対応する instruction 種別"],
    [
        ["GitHub.com Chat", "Personal / repo-wide / organization"],
        ["GitHub.com cloud agent", `repo-wide / path-specific / ${c("AGENTS.md")}・<code>CLAUDE.md</code>・<code>GEMINI.md</code> / organization`],
        ["GitHub.com code review", `repo-wide / path-specific / ${c("AGENTS.md")} / organization`],
        ["VS Code Chat", `repo-wide / path-specific / ${c("AGENTS.md")}`],
        ["Visual Studio Chat", "repo-wide / path-specific"],
        ["JetBrains Chat", "Personal / repo-wide / path-specific"],
        ["Eclipse Chat", "repo-wide のみ"],
        ["Xcode Chat", "repo-wide / path-specific"],
        ["Copilot CLI", `repo-wide / path-specific / agent files / <code>~/.copilot/copilot-instructions.md</code>`],
    ],
    { widths: ["30%", "70%"] },
)}
<p class="muted">最新の対応表: ${a("https://docs.github.com/en/copilot/reference/custom-instructions-support", "docs.github.com — Custom instructions support")}</p>

<h3>MCP を使う際に押さえるべき実装事実</h3>
${ul([
    "<strong>cloud agent / code review は MCP の tools のみ対応</strong>。resources・prompts は非対応。OAuth 認証のリモートサーバーも非対応。",
    "既定で GitHub MCP と Playwright MCP が有効。GitHub の既定トークンは<strong>現リポジトリに対して読み取り専用</strong>。",
    `<strong>一度設定されると、cloud agent / code review は人の承認なしに MCP ツールを使える</strong>。これは §04 の Capability budget の中核。`,
    `MCP に渡す Agents secrets は ${c("COPILOT_MCP_")} プレフィックス必須。通常の Agents secrets にプレフィックスは不要。`,
    `${PP} GitHub MCP Registry（${a("https://github.com/mcp", "github.com/mcp")}）。Business/Enterprise は「Restrict MCP access to registry servers」ポリシーで制限可能だが、<strong>このポリシーは IDE/CLI に効き、cloud agent には効かない</strong>（cloud agent はリポジトリ / custom agent の MCP 設定に従う）。`,
])}

<h3>custom agents —— 再利用可能な「委譲先の型」</h3>
<p>${PP}${badge("na", "サーフェス依存")} ${c(".github/agents/<NAME>.md")} に、名前付きの専門エージェントプロファイルを定義できます。frontmatter で <code>description</code>（必須）、<code>name</code> / <code>tools</code> / <code>model</code> / <code>target</code> / <code>mcp-servers</code>（任意）を指定。組織・Enterprise レベルでは <code>.github</code> / <code>.github-private</code> リポジトリの <code>/agents/</code> に置きます。</p>
${callout(
    "key",
    "これはスライド S43「Standardize」段の実体",
    `<p>S43 の採用ラダーは <em>Standardize: Teams reuse instructions, skills, workflows, evidence formats, and gates</em> と定義しています。custom agents は「instructions ＋ tools ＋ model ＋ MCP」を 1 ファイルに束ねて再利用可能にする仕組みで、まさにこの段の具体物です。</p>`,
)}
`,
    },
];
