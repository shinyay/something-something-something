// PART 5: sections 12 (ladder), 13 (billing), 14 (measurement), 15 (antipatterns).
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre, diagram } from "./ui.mjs";
import { ladderDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "公式");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");
const FRAMEWORK = badge("framework", "本資料の整理");

export const sectionsD = [
    // ────────────────────────────────────────────────────────────── 10
    {
        id: "ladder",
        num: "12",
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
    { title: "① 対象領域の characterization テスト", body: "変更前の振る舞いを固定する。ここが無いと「検証」が空回りする（§08）。" },
    { title: "② required status checks", body: "そのテストとビルドが、通らなければマージできない状態になっていること。" },
    { title: "③ 8 フィールドを埋めた Issue", body: "Outcome+Why / Scope+Out / Context / Tools+Constraints / Acceptance / Verification+Evidence / Escalate / Human gates（§03）。" },
    { title: "④ CODEOWNERS", body: "契約の Escalate 欄に書いた「触ってほしくない領域」を、実際に必須レビューが発火する形にしておく。" },
])}
`,
    },

    // ────────────────────────────────────────────────────────────── 11
    {
        id: "billing",
        num: "13",
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
    "warn",
    "並列化はコストに直接効く —— /fleet のサブエージェントは AI Credits を増やす",
    `<p>CLI の <code>/fleet</code>（§06）はタスクを分解し、<strong>サブエージェントが並列に LLM とやり取りします</strong>。各サブエージェントは独立したコンテキスト窓を持って個別に推論するため、<strong>逐次実行より AI Credits の消費が増えます</strong>。公式ドキュメントも「本質的に逐次な依頼では <code>/fleet</code> は利益をもたらさない」と明記しています。</p>
    ${docQuote(
        "Because each subagent interacts with the LLM independently, using /fleet may increase your AI Credits consumption. For tasks that are inherently sequential, /fleet is unlikely to provide any benefit.",
        "https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/speed-up-task-completion",
        "GitHub Docs — Speed up task completion with Copilot CLI",
    )}
    <p>したがって並列度を上げる判断は <strong>3 つの予算に同時に効きます</strong>：AI Credits（サブエージェント分）、Actions 分（cloud agent に委譲する場合）、そして<strong>レビュー容量</strong>（真のボトルネック）。並列化の効果は「独立したタスクか」で決まり、コストは無条件に増える —— この非対称を計測（§14）で確かめます。</p>`,
)}

${callout(
    "note",
    "Compute budget を実務で語るときの要点",
    `<p>cloud agent は <strong>AI Credits と Actions 分の 2 系統</strong>を同時に消費します。したがって「並列度を上げる」判断は 2 種類の予算に同時に効きます（§04）。<br>
    ただし実務上のボトルネックは通常コストではなく<strong>レビュー容量</strong>です。採用ラダーの Orchestrate 段が「統治とレビュー容量の範囲内で」と条件づけているのはそのためで、人間が「作業のループ」から「意思決定のループ」へ移るという転換も、同じ制約を別角度から述べたものです。<strong>投入できるタスク数の上限は、承認できる人の数で決まります</strong>（§12）。<br>
    このコストが「見合っているか」は主観では決められません —— 採用と PR outcome を実測して評価します（§14）。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 14
    {
        id: "measurement",
        num: "14",
        eyebrow: "Measurement",
        title: "計測 —— 採用と効果を統治する",
        lead: "エンタープライズの導入評価で最初に問われるのは「これは機能しているか？」です。コスト（§13）を語れて効果を語れないのは、提案として致命的に非対称です。本節は、GitHub が実際に提供する計測面を製品事実として確定させ、その限界を正直に示し、§12 の採用ラダーを在庫チェックから証拠ベースへと引き上げます。",
        html: `
${principle(
    "Measure what the metrics actually measure—activity and pull request outcomes—and never claim causal productivity you cannot observe.",
    "計測できるのは「活動量」と「PR の結果」である。そこから観測できない因果的生産性を主張しないこと —— 誠実な計測が、誇張された ROI 主張より強い。",
)}

<h3>取得できる面 —— 4 つのダッシュボードと API 階層</h3>
<p>Copilot usage metrics は複数の面から取得できます。いずれも製品として提供されており ${GA}、repository 単位のメトリクスは 2026-07-17 に GA になりました。</p>
${table(
    ["取得面", "何が取れるか", "粒度 / 形式"],
    [
        [
            `<strong>usage metrics API</strong>`,
            "完了・チャット・エージェントモードを横断した統合テレメトリ。feature / IDE / 言語 / モデル / ユーザー別の内訳と、リポジトリ単位の PR 活動レポート",
            `<strong>enterprise / organization / repository / user</strong> レベル`,
        ],
        [
            `<strong>usage metrics ダッシュボード</strong>`,
            "採用・エンゲージメントの推移",
            "28 日トレンド",
        ],
        [
            `<strong>code generation ダッシュボード</strong>`,
            "コード生成の内訳を <strong>ユーザーとエージェント別</strong>に分解",
            "enterprise / organization",
        ],
        [
            `<strong>impact ダッシュボード</strong>`,
            "ユーザーを <strong>adoption cohort（採用の深さ）に分類</strong>し、その採用を <strong>PR 出力に接続</strong>",
            "cohort 別",
        ],
        [
            `<strong>NDJSON エクスポート</strong>`,
            "カスタム BI ツール・長期保管向けの生データ",
            "raw",
        ],
    ],
    { widths: ["24%", "50%", "26%"] },
)}

${docQuote(
    "measure engagement, identify opportunities to increase value, and assess how AI-assisted workflows influence pull request throughput and time to merge.",
    "https://docs.github.com/en/copilot/concepts/copilot-usage-metrics/copilot-metrics",
    "GitHub Docs — Copilot usage metrics",
)}

<h3>エージェント次元と PR outcome —— SDLC として意味のある量</h3>
<p>このメトリクスの要点は、<strong>エージェントの活動と PR の結果を接続して見られる</strong>ことです。取れる PR ライフサイクル量には、PR の作成数・マージ数、<strong>マージまでの時間中央値（median time to merge）</strong>、レビュー提案の活動が含まれます。code generation ダッシュボードはユーザーとエージェントの生成内訳を分け、Copilot が作成した PR を全体の PR 活動と比較できます。§14 が §13 のコストと対になるのはこの点です —— <strong>「いくら使ったか」と「スループット／サイクルタイムがどう動いたか」を並べて初めて導入評価になります</strong>。</p>

<h3>限界 —— 測れないものを測れると言わない</h3>
${callout(
    "warn",
    "このメトリクスで測れないこと（必ず提案に明記する）",
    `<p><strong>(a) IDE テレメトリ前提。</strong> 大半のメトリクスは<strong>クライアント側 IDE テレメトリ由来</strong>で、ユーザーが IDE のテレメトリを有効にしていないと十分なデータが出ません。サーバ側テレメトリはアクティブユーザーの補足には使われますが、<code>totals_by_feature</code> や LoC 系の内訳は、より豊富なテレメトリが揃うまで空のままです。<br>
    <strong>(b) 対象外の面がある。</strong> <strong>GitHub.com の Copilot Chat と GitHub Mobile は含まれません</strong>。<br>
    <strong>(c) ライセンス情報は別。</strong> シート／ライセンス情報はこのレポートに含まれず、<code>Copilot user management API</code> が source of truth です。<br>
    <strong>(d) 因果ではない。</strong> 測れるのは<span class="neg">活動量と PR outcome</span>であって、<strong>因果的な生産性・流出欠陥（escaped defects）・デプロイ成功率ではありません</strong>。これらを測るには本資料の射程外（§00）にある既存のプラットフォームと人間のプロセスが要ります。</p>`,
)}

<h3>監査ログとの役割分担</h3>
<p>「何が起きたか（活動量・PR 結果）」は usage metrics が、「誰が・いつ・どのエージェントとして操作したか」は<strong>監査ログ</strong>が担います。§17 の <code>agentic-audit-log-events</code> と <code>actor:Copilot</code> / <code>actor_is_agent</code> は、メトリクスでは辿れない<strong>個々の操作の帰属と時系列</strong>を与えます。統治には両方が要ります —— メトリクスは傾向を、監査ログは説明責任を担保します。</p>

<h3>採用ラダー（§12）を証拠ベースにする</h3>
<p>現状の §12 の Definition of Ready は「資産が置いてあるか」の<strong>在庫チェック</strong>であって、成果の測定ではありません。各段の卒業判定に、このメトリクスから取れる<strong>観測量</strong>を対応づけます。</p>
${table(
    ["採用ラダーの段", "在庫チェック（現状）", "卒業を裏づける観測量（本節から）"],
    [
        [
            "Assist / Delegate",
            "instructions・AGENTS.md が置いてある",
            "DAU の増加トレンド、採用 cohort が試用段で頭打ちになっていないこと",
        ],
        [
            "Supervise",
            "検証手段（テスト・ruleset）がある",
            "Copilot 作成 PR のマージ数・マージ時間中央値が悪化していないこと",
        ],
        [
            "Orchestrate",
            "オーケストレーションの型がある",
            "エージェント次元の PR 出力とレビュー提案の適用状況（レビュー容量が律速になっていないか）",
        ],
    ],
    { widths: ["22%", "34%", "44%"] },
)}
${callout(
    "note",
    "DORA などの外部枠組みに触れるときの作法",
    `<p>DORA（デプロイ頻度・変更のリードタイム・変更失敗率・復旧時間）のような外部枠組みに言及すること自体は有用ですが、それらは <strong>${badge("framework", "本資料の整理")} 本資料が導入評価を構造化するために参照する外部枠組み</strong>であって、Copilot usage metrics が直接算出する製品指標ではありません。とくに変更失敗率・復旧時間はデプロイと本番運用の観測（§00 の射程外）を必要とします。<strong>メトリクスが出す数字（活動量・PR outcome）と、外部枠組みが要求する成果指標を混同しない</strong>ことが、誠実な提案の条件です。因果を主張してはいけません。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 15
    {
        id: "antipatterns",
        num: "15",
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
            "先に characterization テストと required status checks を用意する（§08）。網が無いなら、網を張る作業を先に委譲する",
        ],
        [
            "<strong>仕様が未確定な作業</strong>",
            "受け入れ条件（Acceptance）が書けないため、契約が「白紙委任」になる。エージェントは確率的に埋めてしまう",
            `Conversation / Collaboration モードで仕様を固めてから委譲する（§01）。未確定なら Agents UI の research/plan 段で人が軌道修正する（§05）`,
        ],
        [
            "<strong>ロールバック不能な変更</strong>",
            "可逆性が低い作業は Autonomy budget を上げてはいけない対象。失敗の blast radius が大きい",
            "environments と deployment protection rules でマージ／リリース／本番を分離し、人間ゲートを置く（§09）。まず可逆な部分だけを委譲する",
        ],
        [
            "<strong>機密情報へのアクセスが必要な作業</strong>",
            "本番シークレットは Agents secrets に置くべきでなく、firewall は MCP・setup steps をカバーしない。漏洩経路になりうる",
            "シークレットに触れない形に作業を切り直す（§10）。どうしても必要なら委譲対象から外し、人間が実施する",
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
      <p>決定的チェックが弱いサインです。required status checks・CodeQL・テストを厚くし、人間のレビューは「差分ではなく判断」（アーキ適合・互換・運用影響）に集中させる（§08・§09）。</p>`,
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
      <p>並列度の実質的な上限は<strong>承認できる人の数</strong>です。コストではなくレビュー容量で並列度を決める（§12・§13）。</p>`,
        },
        {
            title: "Copilot code review を承認ゲート扱いする",
            badge: badge("warn", "失敗"),
            body: `<p class="muted">症状：自動レビューが付いたから安全、とみなしてマージする。</p>
      <p>Copilot code review は<strong>常に Comment</strong>で、ゲートではなくシグナルです。CODEOWNERS で人間の必須レビューを別に置く（§09）。</p>`,
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
