// PART 1–2: sections 00 (overview), 01 (continuum), 02 (context).
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre, diagram } from "./ui.mjs";
import { continuumDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "公式");
const FRAMEWORK = badge("framework", "本資料の整理");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");
const UNLABELED = badge("na", "状態表記なし");

export const sectionsA = [
    // ────────────────────────────────────────────────────────────── 00
    {
        id: "overview",
        num: "00",
        eyebrow: "はじめに",
        title: "Agentic SDLC とは何か",
        lead: "Agentic SDLC の主眼は「より多くのコードを生成すること」ではありません。作業を境界のある検証可能な単位として再設計し、それをエージェントが実行し、人間が統治する —— この運用モデルへの転換です。本資料は、その考え方と、GitHub 上でそれを成立させる具体的な機能・ファイル・設定・ガバナンス境界を一気通貫で解説します。",
        html: `
${principle(
    "GitHub Copilot's next value is not generating more code; it is enabling teams to redesign modernization as bounded, verifiable work that agents execute and humans govern.",
    "本資料のテーゼ：Copilot の次の価値は「もっとコードを書くこと」ではなく、作業を〈境界があり・検証可能な単位〉として再設計し、エージェントが実行し人間が統治できるようにすることにある。",
)}

<p>この主張は「何を作るか」ではなく「どう仕事を分割し、誰が責任を持つか」に関するものです。したがって本資料は、まず <strong>Delegation Contract</strong>（委譲契約）、<strong>Autonomy Budget</strong>（自律性の予算）、<strong>Agentic Modernization Loop</strong> といった<em>設計語彙</em>を定義し、そのうえで、それらを実際に GitHub 上で成立させる具体的な機能・ファイル・設定を 1 対 1 で対応づけます。抽象論で終わらせず、「どのファイルに何を書けばエージェントに効くのか」まで降ります。</p>

<h3>具体的な導入シナリオ</h3>
<p>月曜の朝、あなたのリポジトリにはレビュー待ちの PR が 3 本あります。いずれも週末のうちにエージェントが開いたものです —— 1 本目は依存ライブラリの CVE 修正、2 本目はレガシーな認証モジュールの特性テスト（characterization test）の追加、3 本目は非推奨 API の一括置換。3 本とも <code>copilot/…</code> ブランチ上にあり、ビルドと CodeQL は既に走り終え、結果が PR に添付されています。あなたがやるのは「コードを書くこと」ではなく、<strong>差分の背後にある判断を検証し、受け入れるかどうかを決めること</strong>です。<br>
この朝の風景が成立するには、その前に多くの設計が要ります —— エージェントが触ってよい範囲、通らなければマージできない検証、触れた瞬間に必須レビューが発火する境界。本資料はこの「前提の設計」を順に組み立てます。</p>

<h3>人間とエージェントの役割分担</h3>
${table(
    ["フェーズ", "人間が担うこと（統治）", "エージェントが担うこと（実行）"],
    [
        ["意図・優先度", "何を・なぜやるかを決める", "—"],
        ["コンテキスト整備", "情報を設計し所有・レビュー・保守する（§02）", "与えられた情報を確実に見つけて利用する"],
        ["計画・戦略・順序", "戦略・順序・リスク受容を選ぶ", "選択肢・根拠・移行計画を提示する（§05）"],
        ["実装", "境界と予算を与える（§03・§04）", "境界内で変更を実装し証跡を返す"],
        ["検証", "受け入れ条件を定義し、最終判断を下す", "決定的チェックを走らせ結果を添える（§08）"],
        ["マージ・リリース", "承認・マージ・リリースを決める（§09）", `<span class="neg">できない</span>（自分の PR を承認・マージ不可）`],
    ],
    { widths: ["18%", "44%", "38%"] },
)}

<h3>3 種類のバッジ（凡例）</h3>
${table(
    ["バッジ", "意味", "扱い方"],
    [
        [OFFICIAL, "GitHub / Microsoft の公式ドキュメントに存在するプロダクト名・機能名", "顧客への提案でそのまま使える"],
        [FRAMEWORK, "本資料が独自に導入した整理枠組み。公式用語ではない", "「本資料の整理では」と明示して使う"],
        [`${GA} ${PP} ${UNLABELED}`, "一次情報での提供状態。「状態表記なし」はドキュメントに GA/Preview の明記がないもの", "Preview は SLA・仕様変更リスクを添えて説明する"],
    ],
    { widths: ["18%", "48%", "34%"] },
)}

${callout(
    "note",
    "本資料は出典規律を持つ",
    `<p>本資料では、どこまでが GitHub の<strong>公式製品名・仕様</strong>で、どこからが<strong>本資料独自の整理語彙</strong>かを、上のバッジと §16「用語集」で明示的に分けています。技術的な断定はすべて §17「一次情報リンク集」の一次情報に基づいて検証済みです。「これは製品仕様」「これは当方の整理」を切り分けられることは、この種の技術資料の信頼性の根幹です。</p>`,
)}

<h3>本資料が扱う SDLC の射程</h3>
<p>「SDLC」を名乗る以上、どこからどこまでを扱うのかを正直に宣言します。本資料が扱うのは <strong>intent（意図）→ 設計 → 実行 → 検証 → ガバナンス境界（マージ／リリースゲート）</strong> までです。</p>
${callout(
    "key",
    "デプロイ実行と本番運用観測は、本資料の射程外（＝ Copilot 製品ではない）",
    `<p><strong>デプロイの実行そのもの</strong>と、<strong>本番運用の観測（インシデント相関・流出欠陥・デプロイ成功率・復旧時間）</strong>は、GitHub Copilot の製品機能が担う領域ではありません。これらは<strong>既存のデプロイ基盤・可観測性基盤と、人間の運用プロセス</strong>が担います。<br>
    したがって本資料でマージ／リリースゲート以降に触れるとき（§05 の PR → Learning、§14 の計測の限界）は、<strong>「ここは製品機能ではなく運用設計だ」と明示</strong>します。Agentic SDLC を「デプロイまで全自動」と誇張しないことが、エンタープライズ提案での誠実さの条件です。</p>`,
)}

<h3>6 つの枠組みの関係</h3>
<p>本資料は複数の整理枠組みを使います。混乱を避けるため、その関係を 1 つの表にまとめます。背骨になるのは <strong>Five layers</strong>（Intent / Context / Agent / Execution / Governance）—— 委譲を「意図・文脈・エージェント・実行・統治」の 5 層で捉える整理層です。残りの枠組みは、それぞれ別の軸（様式・契約・予算・循環・成熟度）でこの背骨のどこかを詳細化します。</p>
${table(
    ["枠組み", "何の軸か", "Five layers 上での位置", "節"],
    [
        [
            `<strong>Five layers</strong>（Intent / Context / Agent / Execution / Governance）`,
            `${FRAMEWORK} 全体を貫く<strong>整理層（背骨）</strong>`,
            "5 層すべて",
            "§00（本節）",
        ],
        [
            "<strong>5 つの相互作用モード</strong>",
            `${FRAMEWORK} 関わり方の<strong>様式</strong>`,
            "Intent → Agent（人がどれだけ手渡すか）",
            "§01",
        ],
        [
            "<strong>Delegation Contract</strong>（8 フィールド）",
            `${FRAMEWORK} 委譲の<strong>契約</strong>`,
            "Agent 層（境界・証拠・ゲートを仕様化）",
            "§03",
        ],
        [
            "<strong>Autonomy Budget</strong>（4 次元）",
            `${FRAMEWORK} 権限の<strong>予算</strong>`,
            "Agent 層（Scope / Capability / Compute / Decision）",
            "§04",
        ],
        [
            "<strong>Agentic Modernization Loop</strong>（5 変換）",
            `${FRAMEWORK} 作業の<strong>循環</strong>`,
            "Execution 層（Assess → … → Learning）",
            "§05",
        ],
        [
            "<strong>採用ラダー</strong>（5 段）",
            `${FRAMEWORK} 組織の<strong>成熟度</strong>`,
            "Governance 層（全層を運用に載せる深さ）",
            "§12",
        ],
    ],
    { widths: ["30%", "24%", "34%", "12%"] },
)}
${callout(
    "note",
    "軸を取り違えない",
    `<p>相互作用モード（§01）は<strong>関わり方の様式</strong>、採用ラダー（§12）は<strong>組織の成熟度</strong>で、別軸です。「Delegation モードを使っている」ことと「組織が Delegate 段に達している」ことは同じではありません。§01 と §12 を混同しないための対応づけが、この表の目的です。</p>`,
)}

<h3>この資料の読み方</h3>
<p>本資料は 6 つのパートで構成されます。上から順に読めば「設計 → 実行 → 信頼 → 運用」の流れで Agentic SDLC を一巡できますが、各節は独立して参照できます。</p>
${ul([
    "<strong>PART 1 出発点</strong>：本節。運用モデルの全体像。",
    "<strong>PART 2 委譲できる形に設計する</strong>：相互作用モード（§01）、コンテキスト設計（§02）、委譲契約（§03）、自律性の予算（§04）。",
    "<strong>PART 3 実行する</strong>：モダナイゼーションのループ（§05）、並列委譲を成立させる Orchestration の実務（§06）、専用ツール（§07）。",
    "<strong>PART 4 信頼する</strong>：決定的検証（§08）、ガバナンス境界としての PR（§09）、セキュリティ（§10）、逸脱と回復（§11）。",
    "<strong>PART 5 運用する</strong>：採用ラダー（§12）、コスト構造（§13）、計測（§14）、委譲してはいけない作業（§15）。",
    "<strong>PART 6 リファレンス</strong>：用語集（§16）、一次情報リンク集（§17）、付録の対応表（§18）。",
])}

<h3>本資料が答える問い</h3>
${ul([
    "GitHub Copilot の相互作用モードは実際にはどのプロダクトに対応し、いつどれを選ぶのか（§01）",
    "「Context は大きなプロンプトではない」を、具体的にどのファイルで実現するのか（§02）",
    "委譲を仕様化する 8 フィールドは、GitHub のどこに書けばエージェントに効くのか（§03）",
    "「自律性は予算である」を、どの設定項目で配分するのか（§04）",
    "モダナイゼーションのループの各段で、どの機能が何を生むのか（§05・§07）",
    "「決定的に検証する」の決定的側とは具体的に何か（§08）",
    "PR がガバナンス境界として機能する構造的な保証は何か（§09）",
    "セキュリティ条件は、どの設定で成立し、どこに穴があるのか（§10）",
    "採用ラダーの各段に上がる前提条件は何か（§12）、この運用モデルのコストはどう発生するのか（§13）",
    "そもそも委譲してはいけない作業は何で、よくある失敗はどう避けるのか（§15）",
])}
`,
    },

    // ────────────────────────────────────────────────────────────── 01
    {
        id: "continuum",
        num: "01",
        eyebrow: "相互作用モード",
        title: "GitHub Copilot の 5 つの相互作用モード",
        lead: "GitHub Copilot との関わり方は、Completion → Conversation → Collaboration → Delegation → Orchestration という 5 つのモードに整理できます。これは本資料の分類軸です。各モードの定義と、対応する実プロダクト・実行場所・同期性・課金、そして「いつどれを選ぶか」を確定させます。",
        html: `
${principle(
    "The useful progression is measured by how much work a person can define and hand off—not by launch dates.",
    "有用な段階分けの尺度は「人がどれだけの作業を定義して手渡せるか」であって、機能のリリース時期ではない。",
)}

${diagram(
    continuumDiagram(),
    "5 つのモードを「同期↔非同期・並列」「ローカル↔クラウド」の平面に置いた全体像。左下の Completion から右上の Orchestration へ進むほど、人が定義して手渡せる作業の量が増える。各モードの定義・対応プロダクト・課金は直後の一覧と表で確認できる。",
)}

<h3>5 つのモードの定義</h3>
${ul([
    "<strong>Completion</strong> —— IDE 内で、書きかけのコードをトークン／行／ブロック単位で補完する。作業は人が主導し、提案は局所的。",
    "<strong>Conversation</strong> —— 質問し、説明を得る。コードやリポジトリについての理解を対話で深める。",
    "<strong>Collaboration</strong> —— 共有セッション内で、人が見ている前でエージェントが境界のあるステップを実行する。ファイルは即座に変わり、人がいつでも止められる。",
    "<strong>Delegation</strong> —— 成果（outcome）を証跡付きで返してもらう。人は実行を見ておらず、成果物が検査可能な形で戻る。",
    "<strong>Orchestration</strong> —— 統治された複数の作業にわたって、繰り返し可能なフローを回す。並列・非同期。",
])}

${table(
    ["モード", "対応するプロダクト", "実行場所", "同期性", "課金"],
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
    "note",
    "いつどのモードを選ぶか",
    `<p>判断の軸は「作業をどこまで<strong>定義して手渡せるか</strong>」です。<strong>Completion / Conversation</strong> は探索・理解の段階、つまり作業がまだ言語化しきれていないときに使います。<strong>Collaboration</strong> は境界は見えているが自分の手元で確かめながら進めたいとき。<strong>Delegation</strong> は「成果・境界・受け入れ条件・検証手段」を書き切れたとき —— ここに来て初めて非同期で手渡せます。<strong>Orchestration</strong> はそれを複数同時に回す段で、実質的な上限は<strong>レビュー容量</strong>です（§12・§13）。可逆性が高く、影響範囲が小さく、証跡の質が良いほど、右のモードへ進めます。</p>`,
)}

${callout(
    "key",
    "Collaboration と Delegation の実体的な境界は「同期／非同期」ではなく「どこで動くか」",
    `<p>Agent mode はあなたのマシンで、あなたが見ている前で動きます。ファイルは即座に変わり、あなたはいつでも止められます。<strong>cloud agent は違います。</strong> GitHub Actions 上の使い捨て環境で動き、あなたは見ていません。だから成果物が <code>copilot/…</code> ブランチと draft PR という「検査可能な形」で返る必要があります。<strong>委譲は「成果を実行する責任」を移すのであって、「マージする権限」を移すのではありません</strong> —— これはこの実行モデルの直接の帰結です（§09）。</p>`,
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

<h3>「管理対象の変化」の実装 —— 差分からセッションへ</h3>
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

<h3>GitHub Copilot app —— エージェント駆動開発の専用面 ${GA}</h3>
<p>2026-06-17 に GA となった <strong>GitHub Copilot app</strong> は、複数のエージェントセッションを同時に扱うための専用デスクトップアプリです。<strong>GitHub Copilot CLI の上に構築</strong>され、macOS / Linux / Windows で動きます。実行モードの分類（Collaboration ↔ Delegation）に、もう 1 つの「実行場所」を加えます。</p>
${cards(
    [
        {
            title: "並列ワークスペース",
            badge: GA,
            body: `複数のエージェントセッションを同時実行し、<strong>各セッションが専用の git worktree とブランチ</strong>を持ちます。新規セッションを <strong>GitHub がホストするクラウドサンドボックス</strong>で動かすこともできます ${PP}。`,
        },
        {
            title: "3 つのセッションモード",
            badge: GA,
            body: `<strong>Interactive</strong>（協調）/ <strong>Plan</strong>（エージェントが計画し人が承認）/ <strong>Autopilot</strong>（完全自律）。セッションごとにモデルと reasoning effort を選択でき、BYOK にも対応します。`,
        },
        {
            title: "GitHub 統合",
            badge: GA,
            body: `Issue の探索とそこからのセッション開始、PR の作成・クローズ・レビュー、<strong>CI チェック結果の確認</strong>、マージまでアプリ内で完結します。automations タブ、<code>/chronicle</code> によるセッション履歴、canvases も備えます。`,
        },
    ],
    { cols: 3 },
)}
${callout(
    "note",
    "GitHub Copilot app ポリシーは Copilot CLI ポリシーとは別",
    `<p>GitHub Copilot app は全 Copilot プランで利用できます。Business / Enterprise では <strong>GitHub Copilot app ポリシー</strong>が有効である必要があり、これは <strong>Copilot CLI ポリシーとは別のポリシー</strong>です（いずれも既定で有効）。組織で有効化状況を確認するときは、この 2 つを混同しないでください。</p>`,
)}

${callout(
    "key",
    "research / plan / iterate は PR を自動生成しない —— Issue アサインとの重要な非対称",
    `${docQuote(
        "Sessions do not create pull requests automatically. To create one immediately, include that in your prompt.",
        "https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/research-plan-iterate",
        "GitHub Docs — Research, plan, and iterate",
    )}
    <p>Agents UI（GitHub.com の cloud agent）から <strong>research → plan → iterate</strong> で起動したセッションは、<strong>PR を自動では作りません</strong>。人が Diff を確認し、納得してから <strong>Create pull request</strong> を押します。<br>
    これは <strong>Issue を Copilot にアサインする経路（必ず PR を作る）とは逆</strong>の挙動です。「人が範囲・アプローチを確認してから PR にする」運用を成立させたいなら、この非対称を理解して<strong>投入経路を選ぶ</strong>必要があります。なお、これらの調査・計画・反復は <strong>GitHub.com の cloud agent のみ</strong>で、Azure Boards / JIRA / Linear / Slack / Teams などの連携は PR 直接作成しかサポートしません。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 02
    {
        id: "context",
        num: "02",
        eyebrow: "Context Engineering",
        title: "Context Engineering —— エージェントが確実に見つけられる情報設計",
        lead: "Context は「大きなプロンプト」ではありません。関連し・最新で・認可された情報を管理されたシステムとして設計することです。本資料は Context を Persistent / Task / Dynamic の 3 種に分け、discoverable・permission-aware・owned・reviewed・maintained という品質要件を課します。これはそのままリポジトリのファイル配置設計になります。",
        html: `
${principle(
    "Context is a managed system of relevant, current, and authorized information—not a one-time prompt enlarged until it works.<br>More tokens do not repair stale, hidden, or unauthorized context.",
    "コンテキストとは、関連し・最新で・認可された情報を管理するシステムであって、動くまで膨らませた一度きりのプロンプトではない。トークンを増やしても、古い・隠れた・非認可のコンテキストは直らない。",
)}

${table(
    ["分類", "実装", "所在", "備考"],
    [
        [
            `<strong>Persistent context</strong><br><span class="muted">アーキテクチャ・規約・ポリシー・リポジトリ知識</span>`,
            `${OFFICIAL} custom instructions`,
            `${c(".github/copilot-instructions.md")}<br>${c("AGENTS.md")}<br>${c(".github/instructions/**/*.instructions.md")}`,
            `<code>AGENTS.md</code> は<strong>ネスト可能</strong>で、ディレクトリツリー上<strong>最も近いファイルが優先</strong>される。<code>*.instructions.md</code> は YAML frontmatter の <code>applyTo</code> glob でパス限定。`,
        ],
        [
            "",
            `${OFFICIAL} <strong>agent skills</strong>`,
            `${c(".github/skills")}`,
            `再利用可能な instruction / script / resource のバンドル。instructions・<code>AGENTS.md</code> が「規約・前提の明文」なのに対し、agent skills は<strong>スクリプトやリソースを含む手順のまとまり</strong>。automations もこれを継承する（§06）。`,
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
            "リポジトリ事実とユーザー選好を永続化。事実は引用元を保持し現ブランチに対して検証される。<strong>28 日未使用で失効</strong>（検証され使用されるたびにタイマーは再開されうる）。cloud agent / code review / CLI が利用。",
        ],
        [
            `<strong>Task context</strong><br><span class="muted">成果・スコープ・受け入れ条件・与えられた参照</span>`,
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
            `<strong>Dynamic context</strong><br><span class="muted">現在のコード・ツール結果・失敗・変わった前提</span>`,
            `${OFFICIAL} <strong>MCP（Model Context Protocol）</strong>`,
            "リポジトリの MCP JSON 設定 / IDE / CLI",
            "外部ツールと文脈を供給。cloud agent と code review は同じリポジトリ MCP 設定を共有する。",
        ],
        [
            "",
            "ビルド・テスト・スキャン結果",
            "GitHub Actions / CodeQL / Dependabot",
            "§08 で扱う。エージェントは失敗結果を読んで反復する。",
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
    `<p>公式ドキュメントは「関連するすべての instruction セットが Copilot に渡される」と明記しています。つまり上位が下位を<strong>上書きする保証はありません</strong>。矛盾する指示を複数の階層に置くと、モデルがどちらを採るかは非決定的です。<br>Context が <em>owned, reviewed, maintained</em> であるべきという要件は、この非決定性への実務的な対処として読むべきです —— 矛盾を残さないことがオーナーシップの中身です。</p>`,
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
    "これは採用ラダーの Standardize 段の実体（§12）",
    `<p>採用ラダーの Standardize 段は「チームが instructions・skills・workflows・evidence formats・gates を再利用する」段です。custom agents は「instructions ＋ tools ＋ model ＋ MCP」を 1 ファイルに束ねて再利用可能にする仕組みで、まさにこの段の具体物です。</p>`,
)}
`,
    },
];
