// PART 3–4: sections 07 (modernization), 08 (verification), 09 (pr), 10 (security), 11 (recovery).
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre, diagram } from "./ui.mjs";
import { prDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "公式");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");
const FRAMEWORK = badge("framework", "本資料の整理");

export const sectionsC = [
    // ────────────────────────────────────────────────────────────── 06
    {
        id: "modernization",
        num: "07",
        eyebrow: "モダナイゼーション",
        title: "モダナイゼーション専用ツールの現状",
        lead: "モダナイゼーションには専用のツール群があります。この領域は名称と構成が変わっているため、傘の名称・エージェント・提供状態・前提を現状に即して整理し、汎用の Modernization Loop（§05）との対応を示します。",
        html: `
${table(
    ["項目", "現行の内容"],
    [
        ["傘の名称", `${OFFICIAL} <strong>GitHub Copilot modernization</strong>`],
        ["エージェント / CLI", `${OFFICIAL} <strong>GitHub Copilot modernization agent</strong>（<strong>Modernize CLI</strong> として提供）`],
        ["対象", "Java / .NET / <strong>C++</strong> のアップグレード、サポートされる Azure 移行シナリオ。<em>「Java 版と .NET 版が別々」という整理はもはや正確ではない</em>（言語別のドキュメント・体験は残る）"],
        ["提供状態", `${GA} IDE でのランタイム／フレームワーク／ツールセット アップグレード（.NET・Java・C++）、IDE の移行シナリオ（.NET・Java）<br>${PP} <strong>Modernize CLI のアセスメントと計画立案</strong>`],
        ["前提", "GitHub Copilot サブスクリプション ＋ GitHub CLI 2.45 以上。クイックスタートは Free / Pro / Pro+ / Business / Enterprise を列挙"],
        ["cloud agent 連携", "CLI から cloud agent に作業を委譲できる。その分は cloud agent の AI Credits ＋ Actions 分を消費する"],
    ],
    { widths: ["18%", "82%"] },
)}

${docQuote(
    "The modernization agent, delivered via the Modernize CLI, enables architects and application owners to orchestrate assessment, migration planning, and framework upgrade automation across multiple applications simultaneously.",
    "https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/overview",
    "learn.microsoft.com — GitHub Copilot app modernization overview",
)}

<h3>レガシーの 3 つの形 —— Three forms of legacy（Code / Knowledge / Process）${FRAMEWORK}</h3>
<p>モダナイゼーションを「古いコードを新しいコードに変える」だけと捉えると、最も難しい部分を取りこぼします。本資料は、レガシーが <strong>3 つの形</strong>で存在すると整理します（公式の製品区分ではなく<strong>本資料の整理語彙</strong>です・§16）。ツールが直接扱えるのは 1 つ目だけで、残り 2 つは委譲の設計で埋めます。</p>
${cards(
    [
        {
            title: "Code —— コードのレガシー",
            badge: FRAMEWORK,
            body: `古い言語・フレームワーク・依存・ランタイム。<strong>Modernize CLI / upgrade agent が直接扱える</strong>のはここ（Assess → Plan → Execute）。3 つの中で最も自動化が進んでいる層です。`,
        },
        {
            title: "Knowledge —— 知識のレガシー",
            badge: FRAMEWORK,
            body: `「なぜこう書かれたか」が失われた状態 —— ドキュメント不在、設計意図の消失、暗黙の業務ルール。<strong>characterization テストと Copilot による説明</strong>（コード→自然言語）で観測可能な形に復元します（§05・§08）。`,
        },
        {
            title: "Process —— プロセスのレガシー",
            badge: FRAMEWORK,
            body: `手作業のビルド・属人的なリリース・検証の欠如。ここが埋まっていないと、変換したコードを<strong>安全に受け入れる関門</strong>が無い。ruleset・CI・Evidence Package（§08・§09）で決定的ゲートを先に作ります。`,
        },
    ],
    { cols: 3 },
)}
${callout(
    "note",
    "順序が逆になりやすい",
    `<p>直感に反して、<strong>Code を変える前に Process を、Process の前に Knowledge を</strong>固めるのが安全です。知識（期待される振る舞い）が無ければ検証の網は書けず、検証の網（決定的ゲート）が無ければコード変換を安全に受け入れられません。だからこそ modernize-legacy-code チュートリアル（後述）は「テスト計画を先に作る」順序を採ります —— これは Knowledge → Process → Code の実務的な現れです。</p>`,
)}

<h3>Assess → Plan → Execute と、Loop の各段の対応</h3>
${table(
    ["Modernize CLI の段階", "内容", "Loop の対応段（§05）"],
    [
        ["<strong>Assess</strong>", "コード・構成・依存・クラウド適合性・リスク・機会を分析。<strong>複数リポジトリを横断して集約できる</strong>", "Doc → Plan の前半（証拠に基づく機会評価）"],
        ["<strong>Plan</strong>", "編集可能・レビュー可能な順序付きタスクと成功条件を生成", "Doc → Plan の後半（目標と移行戦略の定義）"],
        ["<strong>Execute</strong>", "変換・依存アップグレードの適用、ビルド／テスト検証、CVE のスキャンと修復、追跡可能なコミット、cloud agent への委譲", "Work → PR（実装を委譲し、判断は保持する）"],
    ],
    { widths: ["16%", "54%", "30%"] },
)}

${callout(
    "key",
    "「人が戦略を選ぶ」という原則は、この製品構造と一致する",
    `<p>アセスメントは<em>事実の把握であって、戦略決定ではありません</em>。戦略・順序・リスク受容は人が選びます。Modernize CLI の Plan 段が生成するのは<strong>「編集可能・レビュー可能」な計画</strong>であり、実行前に人が変更できる形になっています。運用モデルの原則と製品の設計思想がここで一致しており、説明の説得力が高い箇所です。</p>`,
)}

${pre("powershell", "# Windows\nwinget install GitHub.Copilot.modernization.agent\n\n# macOS / Linux\nbrew tap microsoft/modernize https://github.com/microsoft/modernize-cli\nbrew install modernize")}
<p class="muted">対話型 TUI の <code>modernize</code> と、ヘッドレスの <code>modernize &lt;command&gt;</code> の両方をサポート。</p>

${callout(
    "warn",
    "状態ファイルのパスは統一されていない",
    `<p>ドキュメント上、Modernize CLI のページは <code>.github/modernize/…</code> を示し、実行に関する 1 ページは <code>.github/modernization/…</code> を参照し、IDE のアップグレードエージェントは <code>.github/upgrades/{scenarioId}</code> を使います。<strong>これらを 1 つのパスに正規化して説明しないでください</strong>（ドキュメントに存在しないパスになります）。</p>`,
)}

<h3>docs.github.com の「Modernizing legacy code」チュートリアルは別物</h3>
<p>${a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "docs.github.com/copilot/tutorials/modernize-legacy-code")} は <strong>Modernize CLI のチュートリアルではありません</strong>。Copilot Chat 主導の COBOL → Node.js 変換ワークフローを教えるものです：</p>
${ul([
    "① clone してコンパイル・実行し、現状を動かす",
    "② ファイルとデータフローを Copilot に説明させる",
    "③ <strong>業務ロジックのテスト計画を先に作る</strong>",
    "④ COBOL ファイルを反復的に Node.js へ翻訳",
    "⑤ Node アプリを組み立ててデバッグ",
    "⑥ ③ の計画から Jest のユニット／統合テストを生成",
    "⑦ テスト実行、失敗修正、リファイン",
])}
<p>③ が ⑥ より前に来るのが要点で、これが「振る舞いの安全網を作る」の実務的な手順に対応します（§05）。<strong>実装を変える前に、期待される振る舞いを人間がレビューできる形にする</strong>という順序です。</p>
`,
    },

    // ────────────────────────────────────────────────────────────── 07
    {
        id: "verification",
        num: "08",
        eyebrow: "検証",
        title: "確率的に推論し、決定的に検証する",
        lead: "「Reason probabilistically. Verify deterministically.（確率的に推論し、決定的に検証する）」は、この運用モデルで最も実装に近い主張です。確率的側は明らかですが、決定的側は何で構成されるのかを機能単位で確定させます。",
        html: `
${principle(
    "Use agent reasoning to interpret, explore, and propose. Accept work through repeatable checks with explicit pass or fail criteria.",
    "エージェントの推論は「解釈・探索・提案」に使う。作業の受け入れは、明示的な合否基準を持つ〈繰り返し可能なチェック〉を通して行う。",
)}

${table(
    ["層", "機能", "何を保証するか", "cloud agent での扱い"],
    [
        [
            `<span class="prob">確率的</span>`,
            "Copilot Chat / Agent mode / cloud agent の推論",
            "意図の解釈、パターンの発見、選択肢の提案",
            "session log に推論・ツール実行の履歴が残る",
        ],
        [
            `<span class="det">決定的</span>`,
            `<strong>GitHub Actions</strong>（ビルド・テスト）`,
            "コンパイルと、仕様化された振る舞い",
            `<strong>既定では自動実行されない</strong>。write 権限者が「Approve and run workflows」を押すまで待つ`,
        ],
        [
            `<span class="det">決定的</span>`,
            `<strong>CodeQL</strong>（code scanning）`,
            "設定したクエリ・ルールに対する評価",
            `<strong>GHAS / Code Security なしでも cloud agent に組み込まれている</strong>`,
        ],
        [
            `<span class="det">決定的</span>`,
            `<strong>Dependabot / GitHub Advisory Database</strong>`,
            "既知脆弱性を持つ依存の検出、承認済み依存範囲の逸脱検出",
            "同上（組み込み）",
        ],
        [
            `<span class="det">決定的</span>`,
            `<strong>secret scanning</strong>`,
            "コミットされたシークレットの検出",
            "同上（組み込み）",
        ],
        [
            `<span class="det">決定的</span>`,
            `<strong>required status checks</strong>`,
            "上記のどれが「通らないとマージできない」かの定義",
            "エージェントの PR にも同じく適用される",
        ],
        [
            `<span class="mixed">中間</span>`,
            `<strong>Copilot code review</strong>`,
            "問題の可能性の指摘と修正提案",
            `${GA}。ただし<strong>常に "Comment" レビュー</strong>で、Approve も Request changes もしない ＝ <strong>マージゲートにはならない</strong>`,
        ],
    ],
    { widths: ["10%", "24%", "32%", "34%"] },
)}

${callout(
    "key",
    "見落とされやすい重要事実：cloud agent には GHAS なしでセキュリティ検証が組み込まれている",
    `<p>公式の risks-and-mitigations は、cloud agent の作業に対して <strong>CodeQL・Advisory Database による依存チェック・secret scanning・Copilot code review</strong> が働き、これらは <strong>GHAS / Code Security の契約を必要としない</strong>と明記しています。<br>
    静的解析と CodeQL が設定済みのルール・クエリを評価する仕組みは、GHAS 顧客だけの話ではありません。これは提案の敷居を下げる材料になります。</p>`,
)}

<h3>決定的マージゲート —— ruleset で「通らなければマージできない」を設計する</h3>
<p>検証を「参考情報」から「関門」へ変えるのは ruleset です。エージェントの PR も人間の PR と同じく、これらのゲートを通らなければマージできません。branch protection / required status checks / linear history / signed commits に加え、<strong>解析結果そのものをマージ条件にできる</strong>ルールが揃っています。</p>
${table(
    ["ruleset ルール", "何がマージをブロックするか", "状態"],
    [
        [
            "<strong>Require code scanning results</strong>",
            "必須ツールが指定重大度のアラートを検出／解析が進行中／ツールが未設定 —— のいずれか",
            OFFICIAL,
        ],
        [
            "<strong>Require code quality results</strong>",
            `GitHub Code Quality の解析が進行中／失敗／指定重大度以上の結果 —— のいずれか`,
            `${OFFICIAL} <span class="muted">Code Quality は 2026-07-20 GA</span>`,
        ],
        [
            "<strong>Restrict code coverage</strong>",
            `2 つの閾値でブロック：<strong>Minimum coverage percentage</strong>（PR ブランチの集約カバレッジが設定値未満）と <strong>Maximum coverage drop</strong>（既定ブランチ比で設定ポイント数以上低下）。Code Quality 有効かつカバレッジデータのアップロードが前提`,
            `${PP}`,
        ],
        [
            "<strong>Require deployments to succeed before merging</strong>",
            "指定環境へのデプロイ成功を必須化（例：既定ブランチへのマージ前に staging へのデプロイ成功を要求）",
            OFFICIAL,
        ],
    ],
    { widths: ["26%", "56%", "18%"] },
)}
${docQuote(
    "This feature is in public preview and subject to change.",
    "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets",
    "GitHub Docs — Available rules for rulesets（Restrict code coverage）",
)}
<p>「Copilot code review は Comment のみでブロックしない」（上表）ことと合わせて読むべきです —— <strong>ブロックしたい検証は、レビューコメントではなく ruleset 側に置く</strong>。これが決定的検証の設計原則です（§09）。</p>

<h3>エージェントがテストも書くときは「テストの意図」を先にレビューする</h3>
<p>エージェントに実装とテストの両方を任せると、<strong>実装に都合よくテストが書かれる</strong>危険があります（通ることを目的にテストが歪む）。§07 の modernize-legacy-code の手順が「<strong>業務ロジックのテスト計画を先に作り、それに対してテストを生成する</strong>」順序を採るのはこのためです。これを一般化します。</p>
${steps([
    { title: "1. テストの意図を人がレビューする", body: "「何を・なぜ守るのか」（テスト計画・受け入れ条件）を、実装より先に人が確認する。ここが検証の網の設計点。" },
    { title: "2. 意図に沿ってテストを生成させる", body: "承認された意図に対してエージェントがテストを書く。characterization テストは observed behavior を固定する（§05・§07）。" },
    { title: "3. 実装を生成させ、テストと ruleset で検証する", body: "テストが先に存在するので、実装がテストを通すために歪む余地が減る。決定的ゲート（上表）が最終判定を担う。" },
])}

${callout(
    "warn",
    "flaky テストはゲートを非決定にする —— 隔離する",
    `<p>実行のたびに成否が揺れる <strong>flaky（不安定）テスト</strong>は、決定的マージゲートの前提を壊します。ゲートに載った flaky テストは「再現可能に判定する」という決定性を失わせ、<strong>エージェントの PR を理由なく落とすか、逆に再実行で無理やり通す</strong>運用を招きます。<br>対処は<strong>隔離</strong>です —— flaky と判明したテストを必須ゲートから外し（quarantine）、別枠で原因を追跡する。決定的検証を名乗るには、ゲートに載せるテストが決定的であることが前提です。</p>`,
)}

<h3>「決定的」の意味を誤解させないための注記</h3>
<p>ここでの「決定的（deterministic）」とは、<em>設定された入力の範囲で明示的かつ再現可能</em>という意味であって、<strong>無謬という意味ではありません</strong>。CodeQL は<strong>設定したクエリしか見ません</strong>。テストは<strong>書いた振る舞いしか守りません</strong>。<br>だから characterization テスト（§05）が先に来ます —— 検証の網が存在しない状態では、決定的検証は「何も検出しない」を再現可能に返すだけです。</p>

${callout(
    "warn",
    "characterization test という機能名は存在しない",
    `<p>「characterization testing」という名前の GitHub 機能は<strong>ありません</strong>。実装手段は次のいずれかです：<br>
    ① Copilot Chat のユニットテスト生成、② ${a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "modernize-legacy-code チュートリアル")}が教える「業務ロジックのテスト計画を先に作り、それに対してテストを生成する」手順、③ App modernization for Java の既存テスト移行＋新規ユニットテスト生成（behavioral-integrity 検証を含む）。<br>
    characterization テストは<strong>正しさではなく、観測された振る舞いを保存する</strong>もの —— レガシー改修の一般原則としては正しく、製品機能名としては提示すべきではありません。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 08
    {
        id: "pr",
        num: "09",
        eyebrow: "ガバナンス",
        title: "PR をガバナンス境界にする 5 つの構造的保証",
        lead: "「The pull request is the governance boundary（PR がガバナンス境界である）」と「Autonomous execution does not require autonomous acceptance（自律的な実行は、自律的な受け入れを必要としない）」は、比喩ではなく製品仕様で裏づけられます。何が保証され、何が保証されないのかを分けます。",
        html: `
${principle(
    "The pull request reconnects intent, delegated execution, verification, and accountable human acceptance.<br>Autonomous execution does not require autonomous acceptance.",
    "PR は「意図・委譲された実行・検証・説明責任を持つ人間の受け入れ」を再接続する点である。自律的な実行は、自律的な受け入れを必要としない。",
)}

${diagram(
    prDiagram(),
    "人間・エージェント・PR・CI の 4 レーン。エージェントは委譲を受けて copilot/… ブランチ 1 本に実装し draft PR を作るが、境界線の右側にある Ready 化・Approve・Merge はどれも実行できない（×）。受け入れは人間がレビューして行う。各保証の詳細は直後の一覧で確認できる。",
)}

<h3>製品仕様で保証されること</h3>
${steps([
    {
        title: "書き込み権限のない人はエージェントを起動できない",
        body: "リポジトリへの write アクセスを持つユーザーだけがトリガーできます。write 権限のない人のコメントはプロンプトに渡されません。さらに、隠し文字と HTML コメントはプロンプト到達前にフィルタされます（プロンプトインジェクション対策）。",
    },
    {
        title: "エージェントは 1 本のブランチにしか push できない",
        body: `通常は新規に <code>copilot/…</code> ブランチが作られ、そこにしか push できません。<code>@copilot</code> で既存 PR に呼んだ場合はその PR のブランチ。<strong>エージェントは直接 git コマンドを実行できず</strong>、単純な push 操作に限定されます。ブランチ保護と required checks は当然に適用されます。`,
    },
    {
        title: "エージェントは自分の PR を Ready にも Approve にも Merge にもできない",
        body: "加えて、<strong>タスクを依頼した本人の承認も required approvals にカウントされません</strong>。「投げた人が承認する」抜け道が構造的に塞がれています。",
    },
    {
        title: "ワークフローは既定で自動実行されない",
        body: "write 権限者が <strong>Approve and run workflows</strong> をクリックするまで走りません。自動実行させることは可能ですが、それは明示的なオプトインです。",
    },
    {
        title: "成果物は追跡可能",
        body: "コミットは Copilot が author、依頼者が co-author の <strong>Verified 署名コミット</strong>で、session log にリンクします。Enterprise の監査ログは <code>actor:Copilot</code> で過去 180 日を検索でき、<code>actor_is_agent</code>・<code>agent_session_id</code>・<code>user</code> フィールドを持ちます。",
    },
])}

<h3>Evidence Package —— PR に「何を根拠に受け入れるか」を束ねる ${FRAMEWORK}</h3>
<p>本資料は、エージェントが PR で返すべき成果物のまとまりを <strong>Evidence Package</strong> と呼びます。これは公式の製品機能名ではなく<strong>本資料の整理語彙</strong>で（§16）、次の 3 つの素材からなります。人がマージを判断するのは、コードそのものではなく、この束に対してです。</p>
${cards(
    [
        {
            title: "Code —— 変更そのもの",
            badge: OFFICIAL,
            body: `<code>copilot/…</code> ブランチ上の <strong>Verified 署名コミット</strong>と diff。author は Copilot、co-author は依頼者で、session log へ辿れます。`,
        },
        {
            title: "Evidence —— 検証の証跡",
            badge: OFFICIAL,
            body: `ビルド・テスト・CodeQL・依存チェック・secret scanning・Copilot code review の結果が PR に添付されます。<strong>決定的ゲート（§08）を通ったという事実</strong>がここに現れます。`,
        },
        {
            title: "Uncertainty —— 未解決事項と前提",
            badge: FRAMEWORK,
            body: `未解決の論点・置いた前提・明示的な質問。<strong>エージェントは書けますが、書くことは強制されません</strong>（下表）。<code>AGENTS.md</code> で Uncertainty セクションを必須化して埋めます。`,
        },
    ],
    { cols: 3 },
)}
${callout(
    "note",
    "Evidence Package は「素材」であって「判定」ではない",
    `<p>3 つの素材は自動で揃いますが、<strong>受け入れ条件への対応づけ（この証跡がこの条件を満たす、という写像）は自動生成されません</strong>（下表）。Evidence Package はレビューを不要にするものではなく、<strong>レビューを「コードを読む」から「証跡と条件を突き合わせる」へ引き上げる</strong>ための整理です。§08 の決定的ゲートが Evidence の質を、この節の PR 構造が受け入れの説明責任を担保します。</p>`,
)}

<h3>保証されないこと（人が設計する必要がある部分）</h3>
${table(
    ["この運用モデルが要求すること", "現状", "運用でどう埋めるか"],
    [
        [
            "「Delegation Contract と Issue を、エージェントのセッション・ブランチ・結果の変更にリンクする」",
            `<span class="mid">部分的</span> Issue → PR → session log のリンクは自動。<strong>Delegation Contract 自体の版管理は自動化されない</strong>`,
            "契約を Issue 本文に置き、編集履歴を残す。テンプレート化して 8 フィールドの欠落を防ぐ",
        ],
        [
            "「すべての受け入れ条件に証拠を対応づける」",
            `<span class="neg">なし</span> checks の pass/fail は出るが、<strong>受け入れ条件への対応づけは自動生成されない</strong>`,
            "PR 本文テンプレートに受け入れ条件のチェックリストを置き、レビュアが埋める",
        ],
        [
            "「未解決事項と前提を列挙する」「明示的な質問をする」（不確実性の申告）",
            `<span class="mid">プロンプト依存</span> エージェントは書けるが、<strong>書くことは強制されない</strong>`,
            `<code>AGENTS.md</code> に「PR 本文には必ず Uncertainty セクションを設け、未解決事項と前提を列挙すること」を明記する`,
        ],
        [
            "「アーキテクチャ適合性・互換性・運用影響をレビューする」",
            `<span class="neg">人間のみ</span> Copilot code review は <strong>常に Comment レビュー</strong>で承認判断をしない`,
            "CODEOWNERS でアーキテクチャ／セキュリティ担当を必須レビュアに割り当てる",
        ],
        [
            "「マージ・リリース・本番デプロイを、明示的で、場合によっては別々のゲートとして扱う」",
            `<span class="pos">可能</span>`,
            "environments ＋ deployment protection rules で 3 つを分離。required reviewers、wait timer、self-review 禁止、admin bypass 禁止を設定",
        ],
        [
            "「エージェントの自動実行そのものを、コードと一緒にバージョン管理する」",
            `<span class="neg">なし</span> <strong>automations の定義は Git にコミットされない</strong>。リポジトリのコンテンツとは別に保存され、PR を経由せず変更できる`,
            "automation は「PR がガバナンス境界」テーゼの<strong>抜け道</strong>。誰がどの automation を持つかを別途棚卸しし、生成物（PR）側の ruleset で受け止める（§06・§10）",
        ],
    ],
    { widths: ["30%", "34%", "36%"] },
)}

${callout(
    "warn",
    "統治上の穴：automations は Git 管理外・バージョン管理外",
    `${docQuote(
        "Automations are stored separately from your repository's contents. They are not committed to Git, so they are not versioned alongside your code or managed through pull requests.",
        "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations",
        "GitHub Docs — About Copilot automations",
    )}
    <p>automations（§06）は cloud agent をスケジュール／イベントで無人実行しますが、その<strong>定義自体は PR を通らず、Git 履歴にも残りません</strong>。「PR がガバナンス境界」という本資料のテーゼに対する実在の抜け道です。ただし automation が<strong>生み出す</strong> PR は通常どおり ruleset・required reviews を通るため、<strong>入口（automation 定義）は棚卸しで、出口（生成 PR）は決定的ゲートで</strong>二重に受け止めるのが現実的な統治です。</p>`,
)}

${callout(
    "note",
    "Copilot code review の位置づけを間違えない",
    `${docQuote(
        "Copilot always leaves a 'Comment' review, not an 'Approve' review or a 'Request changes' review.",
        "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review",
        "docs.github.com — Using Copilot code review",
    )}
  <p>つまり Copilot code review は<strong>ゲートではなくシグナル</strong>です。人間に求められるのは「差分だけでなく判断をレビューする」こと —— Copilot が指摘しない層、すなわちアーキテクチャ適合性、互換性、運用影響、残存する不確実性 —— の判断です。自動レビューが入ることで人間のレビューが不要になるのではなく、<strong>人間のレビューが上位の論点に集中できる</strong>という整理が正確です。</p>
  <p class="muted">なお Copilot code review は既定で手動（PR の Reviewers から Copilot を指名）。新規 PR に対する自動レビューは設定で有効化でき、draft や新規 push も対象にできます。custom instructions・<code>AGENTS.md</code>・path-specific instructions・agent skills・MCP を尊重します（agent skills と MCP のサポートは 2026-07-29 に GA）。</p>`,
)}

${callout(
    "update",
    "code review のエージェント的機能 —— 全体解析と、cloud agent への修正受け渡し",
    `<p>Copilot code review は単なる差分コメンタではなく、エージェント的な機能を備えます。ただし前段の「Comment のみ・非ブロッキング」という性質はこれらでも変わりません。</p>
  ${ul([
      `<strong>full project context gathering</strong> ${a("https://docs.github.com/en/copilot/concepts/agents/code-review", "（公式）")}：差分だけでなくリポジトリ全体を解析し、変更の波及を踏まえた指摘を行う`,
      `<strong>提案を cloud agent に渡して修正適用 PR を自動作成</strong> ${PP}：レビュー指摘をそのまま cloud agent に委譲し、修正 PR を起こせる。ただし生成された PR は通常どおり ruleset・required reviews を通る（§08）`,
      `対象外ファイル：依存管理ファイル（<code>package.json</code>・<code>Gemfile.lock</code> 等）、ログファイル、SVG はレビューされない`,
  ])}
  <p class="muted">利用可能面には <strong>Azure DevOps</strong> ${PP} も含まれます。Copilot ライセンスを持たない組織メンバーにも GitHub.com 上で利用可能にできます（Business / Enterprise・2 つのポリシーを有効化・既定は無効）。</p>`,
)}

<h3>merge queue —— 複数のエージェント PR を直列に統合する</h3>
<p>並列委譲（§06）を進めると、<strong>同じ既定ブランチに向かう PR が同時に複数</strong>生まれます。各 PR は自分の作成時点の base では緑でも、順に取り込むと相互作用で壊れうる —— これは人間の PR と同じ問題ですが、エージェントの並列度が上がるほど頻度が増します。<strong>merge queue</strong> はこれを直列化します。</p>
${ul([
    "queue は各 PR を<strong>先行 PR を取り込んだ状態で</strong>一時ブランチに構築し、required status checks を評価してから順にマージする —— 「マージ直前の組み合わせ」で緑を確認する",
    "エージェント PR も人間 PR も同じ queue を通る。エージェント側に特別扱いは無く、<strong>ruleset（§08）で required checks を必須化しておけば queue がそれを強制する</strong>",
    "並列度の上限がレビュー容量なら、<strong>統合の直列点が merge queue</strong>。並列に作り、直列に受け入れる —— この非対称が「自律実行 ≠ 自律受け入れ」の運用面での現れです",
])}`,
    },

    // ────────────────────────────────────────────────────────────── 10
    {
        id: "security",
        num: "10",
        eyebrow: "セキュリティ",
        title: "委譲の前提となるセキュリティ設定と、残る穴",
        lead: "セキュリティは、作業を委譲してよいか・どう実行してよいか・受け入れる前に何が真でなければならないかを決めます。本節では Before execution / During execution / Before acceptance の 3 段に実設定を対応させ、さらに現場でよくある誤解を 1 点、技術的に正しい形に正します。",
        html: `
${principle(
    "Security determines whether work may be delegated, how it may execute, and what must be true before humans can accept it.<br>Stop and escalate on unexpected dependencies, sensitive data, permission gaps, or policy violations.",
    "セキュリティは、委譲の可否・実行の仕方・受け入れ前に満たすべき条件を決める。予期しない依存・機微データ・権限の欠落・ポリシー違反があれば、止めてエスカレーションする。",
)}

${cards(
    [
        {
            title: "① Before execution",
            body: `<p class="muted">情報源・ツール・ネットワーク・スコープ・依存・シークレット取り扱いを承認する</p>
      <ul class="plain tight">
        <li><strong>firewall allowlist</strong>（既定 ON・推奨依存 allowlist 付き）</li>
        <li>リポジトリ MCP 設定（tools のみ・GitHub 既定トークンは読み取り専用）</li>
        <li><strong>Agents secrets / variables</strong>（Actions・Codespaces・Dependabot の secrets は渡らない）</li>
        <li><strong>AI Controls</strong>：cloud agent / third-party agents / custom agents / code review / MCP / モデルを個別に許可</li>
        <li><strong>content exclusion</strong>（Business・Enterprise）</li>
      </ul>`,
        },
        {
            title: "② During execution",
            body: `<p class="muted">最小権限・隔離・ビルド・テスト・スキャン・帰属可能なログ</p>
      <ul class="plain tight">
        <li>write 権限者のみトリガー可。非 write 権限者のコメントは渡らない</li>
        <li>隠し文字・HTML コメントをフィルタ</li>
        <li><code>copilot/…</code> ブランチ 1 本に限定。git 直接実行不可</li>
        <li>ephemeral 環境（Ubuntu 既定。Ubuntu x64 / Windows 64-bit 対応、macOS 非対応）</li>
        <li>組み込みの CodeQL・依存チェック・secret scanning</li>
        <li>secret 値は session log 上でマスク</li>
      </ul>`,
        },
        {
            title: "③ Before acceptance",
            body: `<p class="muted">チェック・セキュリティレビュー・人間の承認・保持される監査証跡</p>
      <ul class="plain tight">
        <li>required status checks</li>
        <li>required reviews / CODEOWNERS</li>
        <li>ワークフローは <strong>Approve and run workflows</strong> まで停止</li>
        <li>Verified 署名コミット ＋ session log</li>
        <li>監査ログ <code>actor:Copilot</code>（180 日）、AI Controls のセッション一覧</li>
        <li>${PP} agentic audit-log streaming（EMU・特定のデータレジデンシー環境）</li>
      </ul>`,
        },
    ],
    { cols: 3 },
)}

${callout(
    "update",
    "よくある誤解：content exclusion は cloud agent に適用されない、という理解は誤り",
    `<p>「content exclusion は Copilot cloud agent には効かない」と説明されることがありますが、これは<strong>現行ドキュメントと食い違います</strong>。${a("https://docs.github.com/en/copilot/reference/supported-surfaces-for-policies", "Supported surfaces for GitHub Copilot policies")} の表では、content exclusion は次のように示されています：</p>
  ${table(
      ["サーフェス", "content exclusion"],
      [
          ["IDEs", `<span class="pos">適用される</span>`],
          ["<strong>Copilot cloud agent</strong>", `<span class="pos">適用される</span>`],
          ["Copilot Chat in GitHub", `<span class="pos">適用される</span>`],
          ["Copilot code review", `<span class="pos">適用される</span>`],
          ["Third-party agents", `<span class="neg">適用されない</span>`],
          ["Copilot CLI", `<span class="neg">適用されない</span>`],
          ["GitHub Copilot app", `<span class="neg">適用されない</span>`],
          ["Spark", `<span class="neg">適用されない</span>`],
      ],
      { widths: ["60%", "40%"] },
  )}
  <p>正しくは「content exclusion は cloud agent に適用されるが、<strong>third-party agents と Copilot CLI には適用されない</strong>」です。委譲先を Claude / Codex などのサードパーティエージェントに広げる判断は、この点で意味が変わります。</p>`,
)}

${callout(
    "warn",
    "content exclusion のもう 1 つの重要な限界",
    `${docQuote(
        "Content exclusion is currently not supported in Edit and Agent modes of Copilot Chat in Visual Studio Code and other editors.",
        "https://docs.github.com/en/copilot/concepts/context/content-exclusion",
        "docs.github.com — Content exclusion",
    )}
  <p>つまり IDE の Agent mode では content exclusion が効きません。さらに、IDE が提供するセマンティック情報や型情報から間接的に文脈が漏れうること、シンボリックリンクとリモートファイルシステム上のリポジトリは非対応であることも明記されています。</p>`,
)}

<h3>firewall の穴（現在も有効）</h3>
${ul([
    "firewall がカバーするのは <strong>Actions アプライアンス内で Bash から起動されたエージェントプロセスのみ</strong>",
    "<strong>MCP サーバーはカバーしない</strong>",
    `<strong><code>copilot-setup-steps.yml</code> の setup steps はカバーしない</strong>`,
    "高度な攻撃は回避しうる、と公式ドキュメント自身が述べている",
])}
<p>「予期しない依存・機微データ・権限の欠落・ポリシー違反で止めてエスカレーションする」という原則は、この穴を人間の側で塞ぐ設計要求として読むのが正確です。<strong>MCP サーバーを追加する判断は、firewall を通らない経路を 1 本増やす判断</strong>であり、Delegation Contract の Tools + Constraints フィールドで明示的に扱うべき事項です（§03）。</p>

<h3>automations のプロンプトインジェクション既定 —— 外部からの発火を既定で無視する</h3>
<p>automations（§06）は issue 作成や PR オープンといった<strong>リポジトリのイベントで cloud agent を無人発火</strong>できます。ここには「外部コントリビュータが issue を開いて Copilot を勝手に動かす」という攻撃面が生まれますが、既定で塞がれています。</p>
${docQuote(
    "By default, automations ignore events triggered by users who do not have write access to the repository.",
    "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations",
    "GitHub Docs — About Copilot automations",
)}
${ul([
    "既定で <strong>write 権限を持たないユーザーが発火させたイベントは無視</strong>される（オプトインで許可は可能）",
    "automations は <strong>private / internal リポジトリのみ</strong>で、<strong>1 つのリポジトリにスコープ</strong>され、そのリポジトリ内でしか行動できない",
    "スコープ制御の主手段は <strong>tools の選択</strong> ——「Grant only the tools that the task needs（タスクに必要なツールだけを与える）」",
])}
<p>この既定は §09 の「write 権限のない人はエージェントを起動できない」と同じ思想の automation 版です。ただし前述のとおり <strong>automation 定義自体は Git 管理外</strong>（§09）なので、誰がどの automation を、どのトリガと tools で持っているかは<strong>コードレビューの外側で棚卸しする</strong>必要があります。</p>
`,
    },

    // ────────────────────────────────────────────────────────────── 11
    {
        id: "recovery",
        num: "11",
        eyebrow: "Deviation & Recovery",
        title: "逸脱と回復 —— エージェントが外れたときに何をするか",
        lead: "§15 は「委譲してはいけない作業」と運用上の失敗パターンを扱いますが、実行の最中にエージェントが外れたときの復旧手順は、これまで本資料に欠けていました。本節は、実行中の介入・停止・放棄・再試行の判断と、そのとき状態がどう残るかを確定させます。ここに書く事実はすべて一次情報で確認済みのものだけです。",
        html: `
${principle(
    "When an agent goes off course, recovery is a decision—steer, stop, abandon, or retry—and every choice leaves state behind.",
    "エージェントが外れたときの回復は「軌道修正・停止・放棄・再試行」の意思決定であり、どれを選んでも状態が残る。何が残るかを知らないまま止めるのが最悪の一手である。",
)}

<h3>4 つの介入 —— いつ何を選ぶか</h3>
${table(
    ["介入", "何をする操作か", "選ぶ状況", "残る状態 / 注意"],
    [
        [
            `<strong>軌道修正（steering）</strong>`,
            "セッション実行中に追加プロンプトを送って方向を変える",
            "方向は合っているが細部を直したい / 前提を補足したい",
            `<strong>現在のツール呼び出しが完了してから反映</strong>される。<span class="neg">AI Credits を消費</span>。<strong>サードパーティ連携のエージェントには送れない</strong>`,
        ],
        [
            `<strong>停止（stop session）</strong>`,
            "実行中のセッションを止める",
            "明らかに誤った方向に進んでいて、続けても無駄なとき",
            `<strong>Actions の実行は終了するが、<span class="neg">すでに push 済みのコミットはブランチに残る</span></strong>。停止＝巻き戻しではない`,
        ],
        [
            `<strong>放棄（abandon）</strong>`,
            "そのセッションの成果を採用せず捨てる",
            "やり直した方が早い / 前提そのものが誤っていた",
            `クラウドセッションは <strong>archive はできるが削除はできない</strong>（ローカルセッションのみ削除可）。履歴は残る`,
        ],
        [
            `<strong>再試行（retry）</strong>`,
            "同じ依頼をもう一度エージェントに実行させる",
            "一時的な失敗・タイムアウトで、依頼自体は妥当なとき",
            `汎用の「再実行」ボタンは無い。<strong>Issue なら unassign → 再 assign、PR コメントなら同じコメントを再投稿</strong>`,
        ],
    ],
    { widths: ["16%", "26%", "28%", "30%"] },
)}

${callout(
    "warn",
    "止めても状態は消えない —— push 済みコミットの扱い",
    `<p>停止操作は Actions の実行を終わらせますが、<strong>エージェントがすでに <code>copilot/…</code> ブランチに push したコミットはそのまま残ります</strong>。したがって「止めた ＝ 何も起きなかったことになる」ではありません。残ったブランチ・draft PR をどう扱うか（放棄するのか、人が引き継ぐのか）まで含めて判断する必要があります。§09 の「PR がガバナンス境界」というテーゼは、ここでも効きます —— 未レビューのコミットが残っても、マージ関門を越えない限り既定ブランチには入りません。</p>`,
)}

<h3>停滞したセッションのタイムアウト</h3>
<p>${OFFICIAL} 一次情報が定めているのは<strong>停滞したセッションの扱い</strong>です。セッションはしばらく停滞して見えたあとに再び動き出すことがあり、停滞したままの場合に<strong>1 時間でタイムアウト</strong>します。復帰手段も決まっていて、Issue 割り当てなら <strong>unassign → 再 assign</strong>、PR コメントへの応答中に停滞したなら<strong>同じコメントをもう一度投稿</strong>します（上表の「再試行」に対応）。</p>
${docQuote(
    "If the session remains stuck, it will time out after an hour. You can retry by unassigning the issue and then reassigning it to Copilot.",
    "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent",
    "docs.github.com — Troubleshooting GitHub Copilot cloud agent",
)}
<p>${FRAMEWORK} 一方で、<strong>正常に進行しているセッションの実行時間そのものに上限があるとは公開ドキュメントに書かれていません</strong>。したがって「1 時間」を、1 セッションに詰め込める作業量の設計上限として当てにするのは誤りです。それでも §06 の分解規準（独立してレビュー・マージできる単位まで下げる）は有効で、根拠はタイムアウトではなく<strong>停滞や逸脱が起きたときに失うものの大きさ</strong>にあります —— 1 セッションが長大なほど、巻き戻す範囲が広く、再実行のコストも高くなります。</p>

<h3>iterate と abandon の判断基準</h3>
${cards(
    [
        {
            title: "iterate（続けて直す）を選ぶ",
            badge: FRAMEWORK,
            body: `方向は正しく、Diff の大半が採用できる。残りの誤りは追加プロンプト（steering）や PR コメントで収束させられる見込みがある。<strong>前提は生きている</strong>。`,
        },
        {
            title: "abandon（捨ててやり直す）を選ぶ",
            badge: FRAMEWORK,
            body: `前提そのものが誤っていた、または Diff が広範に誤っていて手直しより再委譲が速い。<strong>Delegation Contract（§03）の Scope や Acceptance を書き直してから</strong>やり直すのが正しい。同じ契約で再試行しても同じ所で外れる。`,
        },
    ],
    { cols: 2 },
)}

${callout(
    "warn",
    "CLI のローカル巻き戻し（/undo・/rewind）は手作業を上書きしうる",
    `<p>GitHub Copilot CLI の <code>/undo</code>（別名 <code>/rewind</code>、二重 Esc でも起動）はスナップショットを復元しますが、<strong>スナップショット以降のすべての変更を元に戻し、その間に作られた新規ファイルを削除します</strong>。エージェントの変更と<strong>人が手で加えた変更を区別しない</strong>ため、巻き戻しは手作業を巻き添えにしえます。しかもこの操作は取り消せません。巻き戻す前に、手元の未コミット変更を退避してください。</p>`,
)}

<h3>失敗を構造に還す —— PR → Learning の実務版</h3>
<p>回復の最後の一手は、同じ失敗を<strong>二度と起こさない仕組みに落とす</strong>ことです。これは §05 の変換ループ「PR → Learning」を、逸脱という具体的な入力に対して回した姿にほかなりません。逸脱の型ごとに、落とし先が決まっています。</p>
${table(
    ["逸脱の型", "落とし先", "接続する節"],
    [
        [
            "エージェントが同じ勘違い（規約・前提）を繰り返す",
            `<code>*.instructions.md</code> / <code>AGENTS.md</code> / <strong>agent skills</strong>（<code>.github/skills</code>）に明文化する`,
            "§02 Context Engineering",
        ],
        [
            "退行（once-fixed が再び壊れる）",
            "その挙動を固定する <strong>characterization テスト</strong>を追加し、以後の PR で必ず走らせる",
            "§07 modernization / §08 verification",
        ],
        [
            "危険な操作・ポリシー違反に踏み込んだ",
            `<strong>hooks の <code>preToolUse</code></strong> で当該ツール実行を拒否する / ${c("ruleset")} で関門を足す`,
            "§04 autonomy / §08 verification",
        ],
        [
            "未レビューの変更がマージ関門を越えかけた",
            `required checks・required reviews・CODEOWNERS を締める（${c("ruleset")}）`,
            "§08 verification / §09 pr",
        ],
    ],
    { widths: ["34%", "44%", "22%"] },
)}
${callout(
    "key",
    "回復の成否は「次の委譲が同じ所で外れないか」で測る",
    `<p>停止や巻き戻しは対症療法です。<strong>逸脱を instructions / agent skills / characterization テスト / ruleset のいずれかに落とし切って初めて回復は完了</strong>します。落とし切れたかどうかは、次節以降で扱う計測（§14）で「同種の逸脱が減っているか」として観測できます。回復を個人の記憶に留めるのは、統治の失敗です。</p>`,
)}
`,
    },
];
