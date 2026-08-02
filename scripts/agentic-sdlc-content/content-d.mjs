// PART 5: sections 10 (ladder), 11 (billing), 12 (antipatterns).
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre, diagram } from "./ui.mjs";
import { ladderDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "公式");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsD = [
    // ────────────────────────────────────────────────────────────── 10
    {
        id: "ladder",
        num: "10",
        eyebrow: "導入",
        title: "採用ラダーと各段の Definition of Ready",
        lead: "Assist → Collaborate → Delegate → Standardize → Orchestrate という採用ラダーは、§01 の相互作用モードとは別軸です —— こちらは組織の成熟度、§01 は対話の様式を表します。ここでは「次の段に上がってよい」と判断するための、具体的なリポジトリ資産のチェックリスト（Definition of Ready）を置きます。",
        html: `
${principle(
    "Increase delegation only after repository context and verification mature enough to support the next level safely.<br>Context and verification mature first; autonomy and orchestration follow.",
    "委譲を増やしてよいのは、リポジトリのコンテキストと検証が、次の段を安全に支えられるだけ成熟したあとだけ。まずコンテキストと検証が成熟し、自律性とオーケストレーションはそのあとに続く。",
)}

${diagram(
    ladderDiagram(),
    "Assist → Collaborate → Delegate → Standardize → Orchestrate の 5 段が左下から右上へ上る階段。上の段ほど委譲の範囲が広がるが、上がる前提はエージェントの能力ではなくリポジトリ側のコンテキストと検証の成熟である。各段の Definition of Ready は直後の表で確認できる。",
)}

${table(
    ["段", "定義", "この段に上がる前に揃っているべきもの（Definition of Ready）"],
    [
        [
            `<strong>1. Assist</strong>`,
            "人がすべてのステップを所有し、境界のある提案に Copilot を使う",
            ul([
                "Copilot ライセンスの割り当て",
                "組織ポリシー（AI Controls）の初期設定：どのクライアント・どのモデルを許可するか",
                "必要なら content exclusion の設定（Business / Enterprise）",
            ]),
        ],
        [
            `<strong>2. Collaborate</strong>`,
            "人とエージェントが調査・計画・実装・検証を共有する",
            ul([
                `<strong><code>.github/copilot-instructions.md</code> が存在し、実際に守られている</strong>`,
                "ビルドとテストが 1 コマンドで再現できる",
                "IDE Agent mode / Copilot CLI の利用ポリシーが決まっている",
                `<span class="warn-inline">注意：IDE の Agent mode では content exclusion が効かない</span>`,
            ]),
        ],
        [
            `<strong>3. Delegate</strong>`,
            "エージェントが境界のある契約を実行し、判断可能な PR を返す",
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
            "チームが instructions・skills・workflows・evidence formats・gates を再利用する",
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
            "複数の境界ある作業を、統治とレビュー容量の範囲内でポートフォリオ横断に走らせる",
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
    "土台は context と verification —— 段が上がるほど増えるのはリポジトリ側の資産",
    `<p>採用ラダーの土台にあるのは <em>context &amp; verification</em> です。上の表を見ると、段が上がるほど増えるのは<strong>エージェントの能力ではなくリポジトリ側の資産</strong>であることが分かります。Delegate 段に必要なものはほぼすべて「リポジトリに何が置いてあるか」であり、Copilot の設定ではありません。<br>つまり導入プロジェクトの実作業の大半は、<strong>Copilot の導入ではなくリポジトリの整備</strong>です。これは提案の工数見積もりに直結する洞察です。</p>`,
)}

<h3>最初の 1 件を「委譲」まで持っていく最小セット</h3>
<p>可逆で重要なモダナイゼーションタスクを 1 件選び、その Delegation Contract を書く —— そこから本当に委譲まで到達するために最低限必要なのは、次の 4 つだけです：</p>
${steps([
    { title: "① 対象領域の characterization テスト", body: "変更前の振る舞いを固定する。ここが無いと「検証」が空回りする（§07）。" },
    { title: "② required status checks", body: "そのテストとビルドが、通らなければマージできない状態になっていること。" },
    { title: "③ 8 フィールドを埋めた Issue", body: "Outcome+Why / Scope+Out / Context / Tools+Constraints / Acceptance / Verification+Evidence / Escalate / Human gates（§03）。" },
    { title: "④ CODEOWNERS", body: "契約の Escalate 欄に書いた「触ってほしくない領域」を、実際に必須レビューが発火する形にしておく。" },
])}
`,
    },

    // ────────────────────────────────────────────────────────────── 11
    {
        id: "billing",
        num: "11",
        eyebrow: "コスト",
        title: "この運用モデルのコスト構造",
        lead: "Compute budget（§04）を実務で語るには、課金モデルの理解が不可欠です。2026 年 6 月に課金モデルが変わっている点にも注意が必要です。ここでは AI Credits と Actions 分の 2 系統を整理します。",
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
    "Compute budget を実務で語るときの要点",
    `<p>cloud agent は <strong>AI Credits と Actions 分の 2 系統</strong>を同時に消費します。したがって「並列度を上げる」判断は 2 種類の予算に同時に効きます（§04）。<br>
    ただし実務上のボトルネックは通常コストではなく<strong>レビュー容量</strong>です。採用ラダーの Orchestrate 段が「統治とレビュー容量の範囲内で」と条件づけているのはそのためで、人間が「作業のループ」から「意思決定のループ」へ移るという転換も、同じ制約を別角度から述べたものです。<strong>投入できるタスク数の上限は、承認できる人の数で決まります</strong>（§10）。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 12
    {
        id: "antipatterns",
        num: "12",
        eyebrow: "アンチパターン",
        title: "委譲してはいけない作業と、よくある失敗",
        lead: "委譲は万能ではありません。そもそも境界を切れない作業、検証手段のない作業は、委譲すると統治が空回りします。ここでは「非同期の委譲（Delegation）に載せてはいけない作業」と、載せられる作業でも起きがちな「運用上の失敗パターン」を、回避策とともに整理します。判断はすべて本資料の他節に裏づけられます。",
        html: `
${principle(
    "If you cannot draw the boundary, define the check, or reverse the change, the work is not ready to delegate—make it ready first.",
    "境界を引けない・チェックを定義できない・変更を巻き戻せない作業は、まだ委譲できる状態にない。まず委譲できる状態にすることが先。",
)}

<h3>委譲（非同期）に載せてはいけない作業</h3>
${table(
    ["作業の型", "なぜ委譲に向かないか", "先にやるべきこと"],
    [
        [
            "<strong>境界を切れない横断的リファクタ</strong>",
            "1 タスク ＝ 1 ブランチ ＝ 1 PR の制約に収まらず、Scope budget を定義できない。巨大 PR になりレビュー不能に",
            `波（wave）に分割し、独立に検証可能な Issue 群に落とす（§05 Plan → Work）。Scope を <code>applyTo</code> と CODEOWNERS で構造化する（§03・§04）`,
        ],
        [
            "<strong>検証手段のない作業</strong>",
            "決定的チェックが存在しないと、受け入れが人間の目視に逆戻りする。「決定的に検証する」の決定的側が空になる",
            "先に characterization テストと required status checks を用意する（§07）。網が無いなら、網を張る作業を先に委譲する",
        ],
        [
            "<strong>仕様が未確定な作業</strong>",
            "受け入れ条件（Acceptance）が書けないため、契約が「白紙委任」になる。エージェントは確率的に埋めてしまう",
            `Conversation / Collaboration モードで仕様を固めてから委譲する（§01）。未確定なら Agents UI の research/plan 段で人が軌道修正する（§05）`,
        ],
        [
            "<strong>ロールバック不能な変更</strong>",
            "可逆性が低い作業は Autonomy budget を上げてはいけない対象。失敗の blast radius が大きい",
            "environments と deployment protection rules でマージ／リリース／本番を分離し、人間ゲートを置く（§08）。まず可逆な部分だけを委譲する",
        ],
        [
            "<strong>機密情報へのアクセスが必要な作業</strong>",
            "本番シークレットは Agents secrets に置くべきでなく、firewall は MCP・setup steps をカバーしない。漏洩経路になりうる",
            "シークレットに触れない形に作業を切り直す（§09）。どうしても必要なら委譲対象から外し、人間が実施する",
        ],
    ],
    { widths: ["24%", "40%", "36%"] },
)}

<h3>載せられる作業でも起きる、運用上の失敗パターン</h3>
${cards(
    [
        {
            title: "コンテキストを整えずに委譲する",
            badge: badge("warn", "失敗"),
            body: `<p class="muted">症状：エージェントが規約を無視した実装を返す。レビューで指摘が積み上がる。</p>
      <p>原因は Persistent context の不足です。トークンを増やしても直りません —— <code>AGENTS.md</code> と <code>*.instructions.md</code> を先に整える（§02）。矛盾する指示を複数階層に置かない。</p>`,
        },
        {
            title: "検証を人間の目視に戻す",
            badge: badge("warn", "失敗"),
            body: `<p class="muted">症状：レビュアが差分を目で追って正しさを判断している。</p>
      <p>決定的チェックが弱いサインです。required status checks・CodeQL・テストを厚くし、人間のレビューは「差分ではなく判断」（アーキ適合・互換・運用影響）に集中させる（§07・§08）。</p>`,
        },
        {
            title: "PR を巨大化させる",
            badge: badge("warn", "失敗"),
            body: `<p class="muted">症状：1 つの PR が数十ファイルに及び、レビューされないまま滞留する。</p>
      <p>Scope budget が広すぎます。Plan → Work で「1 つの観測可能な成果」に割る（§05）。ループは<em>小さくレビュー可能な変更</em>を生むためにある。</p>`,
        },
        {
            title: "レビュー容量を超えて並列投入する",
            badge: badge("warn", "失敗"),
            body: `<p class="muted">症状：エージェント PR が承認待ちで積み上がる。</p>
      <p>並列度の実質的な上限は<strong>承認できる人の数</strong>です。コストではなくレビュー容量で並列度を決める（§10・§11）。</p>`,
        },
        {
            title: "Copilot code review を承認ゲート扱いする",
            badge: badge("warn", "失敗"),
            body: `<p class="muted">症状：自動レビューが付いたから安全、とみなしてマージする。</p>
      <p>Copilot code review は<strong>常に Comment</strong>で、ゲートではなくシグナルです。CODEOWNERS で人間の必須レビューを別に置く（§08）。</p>`,
        },
        {
            title: "エスカレーションを「お願い」で済ませる",
            badge: badge("warn", "失敗"),
            body: `<p class="muted">症状：「危険なら止めて」とプロンプトに書くが、実際には止まらない。</p>
      <p>プロンプトは確率的です。触れてほしくない領域は CODEOWNERS と ruleset で「触ると必須レビューが発火する」構造にする —— <em>頼むのではなく、止まる形にする</em>（§03・§04）。</p>`,
        },
    ],
    { cols: 3 },
)}

${callout(
    "key",
    "アンチパターンの共通構造",
    `<p>上のどの失敗も、根は同じです —— <strong>確率的な指示（プロンプト）で済ませられるはずのない統治を、プロンプトに委ねている</strong>こと。委譲が安全に回るのは、境界・検証・ゲートが<em>構造</em>になっているときだけです（§03 の「8 フィールドのうち 5 つは構造にできる」）。委譲してよいかどうか迷ったら、「境界を引けるか」「チェックを定義できるか」「巻き戻せるか」の 3 問に答えてください。1 つでも No なら、まずその No を Yes にする作業が先です。</p>`,
)}
`,
    },
];
