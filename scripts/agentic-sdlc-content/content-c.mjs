// Sections 6–9 of the supplementary guide.
import { badge, c, a, table, callout, deckQuote, docQuote, cards, steps, ul, pre } from "./ui.mjs";

const OFFICIAL = badge("official", "公式");
const FRAMEWORK = badge("framework", "発表者FW");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsC = [
    // ────────────────────────────────────────────────────────────── 6
    {
        id: "verification",
        num: "06",
        eyebrow: "検証",
        title: "「決定的に検証する」の決定的側は具体的に何か",
        slides: [24, 28, 35],
        lead: "S24 の「Reason probabilistically. Verify deterministically.」はこのプレゼンテーションで最も実装に近い主張です。確率的側は明らかですが、決定的側は何で構成されるのかを機能単位で確定させます。",
        html: `
${deckQuote(
    "Use agent reasoning to interpret, explore, and propose. Accept work through repeatable checks with explicit pass or fail criteria.",
    "S24",
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
    S24 の「Static analysis and CodeQL evaluate configured rules and queries」は、GHAS 顧客だけの話ではありません。これは提案の敷居を下げる材料になります。</p>`,
)}

<h3>「決定的」の意味を誤解させないための注記</h3>
<p>S24 のスピーカーノートは自ら注意を書いています —— <em>"'Deterministic' means explicit and repeatable within configured inputs, not infallible."</em>（設定された入力の範囲で明示的かつ再現可能、という意味であって、無謬という意味ではない）。CodeQL は<strong>設定したクエリしか見ません</strong>。テストは<strong>書いた振る舞いしか守りません</strong>。<br>だから S28 の characterization テストが先に来ます —— 検証の網が存在しない状態では、決定的検証は「何も検出しない」を再現可能に返すだけです。</p>

${callout(
    "warn",
    "characterization test という機能名は存在しない",
    `<p>「characterization testing」という名前の GitHub 機能は<strong>ありません</strong>。実装手段は次のいずれかです：<br>
    ① Copilot Chat のユニットテスト生成、② ${a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "modernize-legacy-code チュートリアル")}が教える「業務ロジックのテスト計画を先に作り、それに対してテストを生成する」手順、③ App modernization for Java の既存テスト移行＋新規ユニットテスト生成（behavioral-integrity 検証を含む）。<br>
    S28 の「Characterization tests preserve observations, not necessarily correctness.」というノートは、レガシー改修の一般原則としては正しく、製品機能名としては提示すべきではありません。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 7
    {
        id: "pr",
        num: "07",
        eyebrow: "ガバナンス",
        title: "PR がガバナンス境界として機能する構造的保証",
        slides: [32, 33, 35, 36, 37],
        lead: "S36「The pull request is the governance boundary」と「Autonomous execution does not require autonomous acceptance.」は、比喩ではなく製品仕様で裏づけられます。何が保証され、何が保証されないのかを分けます。",
        html: `
${deckQuote(
    "The pull request reconnects intent, delegated execution, verification, and accountable human acceptance.<br>Autonomous execution does not require autonomous acceptance.",
    "S36",
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

<h3>保証されないこと（人が設計する必要がある部分）</h3>
${table(
    ["S36 / S37 が要求すること", "現状", "運用でどう埋めるか"],
    [
        [
            "「Link the Delegation Contract and issue to the agent session, branch, and resulting change」",
            `<span class="mid">部分的</span> Issue → PR → session log のリンクは自動。<strong>Delegation Contract 自体の版管理は自動化されない</strong>`,
            "契約を Issue 本文に置き、編集履歴を残す。テンプレート化して 8 フィールドの欠落を防ぐ",
        ],
        [
            "「Map evidence to every acceptance criterion」（S35）",
            `<span class="neg">なし</span> checks の pass/fail は出るが、<strong>受け入れ条件への対応づけは自動生成されない</strong>`,
            "PR 本文テンプレートに受け入れ条件のチェックリストを置き、レビュアが埋める",
        ],
        [
            "「List unresolved items and assumptions」「Ask explicit questions」（S35 の UNCERTAINTY）",
            `<span class="mid">プロンプト依存</span> エージェントは書けるが、<strong>書くことは強制されない</strong>`,
            `<code>AGENTS.md</code> に「PR 本文には必ず Uncertainty セクションを設け、未解決事項と前提を列挙すること」を明記する`,
        ],
        [
            "「Review architectural fit, compatibility, operational impact」（S36 ステップ 5）",
            `<span class="neg">人間のみ</span> Copilot code review は <strong>常に Comment レビュー</strong>で承認判断をしない`,
            "CODEOWNERS でアーキテクチャ／セキュリティ担当を必須レビュアに割り当てる",
        ],
        [
            "「Treat merge, release, and production deployment as explicit and potentially separate gates」",
            `<span class="pos">可能</span>`,
            "environments ＋ deployment protection rules で 3 つを分離。required reviewers、wait timer、self-review 禁止、admin bypass 禁止を設定",
        ],
    ],
    { widths: ["30%", "34%", "36%"] },
)}

${callout(
    "note",
    "Copilot code review の位置づけを間違えない",
    `${docQuote(
        "Copilot always leaves a 'Comment' review, not an 'Approve' review or a 'Request changes' review.",
        "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review",
        "docs.github.com — Using Copilot code review",
    )}
  <p>つまり Copilot code review は<strong>ゲートではなくシグナル</strong>です。S37「Review the decision, not only the diff」が人間に求めるのは、Copilot が指摘しない層 —— アーキテクチャ適合性、互換性、運用影響、残存する不確実性 —— の判断です。自動レビューが入ることで人間のレビューが不要になるのではなく、<strong>人間のレビューが上位の論点に集中できる</strong>という整理が正確です。</p>
  <p class="muted">なお Copilot code review は既定で手動（PR の Reviewers から Copilot を指名）。新規 PR に対する自動レビューは設定で有効化でき、draft や新規 push も対象にできます。custom instructions・<code>AGENTS.md</code>・path-specific instructions・agent skills・MCP を尊重します（agent skills と MCP のサポートは 2026-07-29 に GA）。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 8
    {
        id: "security",
        num: "08",
        eyebrow: "セキュリティ",
        title: "委譲の条件としてのセキュリティ ── 成立する設定と、残る穴",
        slides: [38],
        lead: "S38 は「Before execution / During execution / Before acceptance」の 3 段でセキュリティ条件を整理します。ここでは各段の実設定を対応させ、さらにスライドの記述のうち現行ドキュメントと食い違う 1 点を指摘します。",
        html: `
${deckQuote(
    "Security determines whether work may be delegated, how it may execute, and what must be true before humans can accept it.<br>Stop and escalate on unexpected dependencies, sensitive data, permission gaps, or policy violations.",
    "S38",
)}

${cards(
    [
        {
            title: "① Before execution",
            body: `<p class="muted">Approve content sources, tools, network access, scope, dependencies, and secret handling</p>
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
            body: `<p class="muted">Minimum necessary permissions, isolation, builds, tests, scans, and attributable logs</p>
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
            body: `<p class="muted">Checks, security review, human approval, and retained audit evidence</p>
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
    "スライド S38 のノート記述は、現行ドキュメントでは更新されています",
    `<p>S38 のスピーカーノートは <em>"The default firewall does not cover MCP servers or setup-step processes, <strong>and content exclusions do not govern Copilot cloud agent</strong>."</em> と述べています。</p>
  <p><strong>前半（firewall の穴）は現在も正しい</strong>のに対し、<strong>後半は現行ドキュメントと食い違います。</strong> ${a("https://docs.github.com/en/copilot/reference/supported-surfaces-for-policies", "Supported surfaces for GitHub Copilot policies")} の表では、content exclusion は次のように示されています：</p>
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
  <p>したがって発表時は「content exclusion は cloud agent に適用されるが、<strong>third-party agents と Copilot CLI には適用されない</strong>」と述べるのが現状に即しています。委譲先を Claude / Codex などのサードパーティエージェントに広げる判断は、この点で意味が変わります。</p>`,
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

<h3>firewall の穴（スライドの記述どおり、現在も有効）</h3>
${ul([
    "firewall がカバーするのは <strong>Actions アプライアンス内で Bash から起動されたエージェントプロセスのみ</strong>",
    "<strong>MCP サーバーはカバーしない</strong>",
    `<strong><code>copilot-setup-steps.yml</code> の setup steps はカバーしない</strong>`,
    "高度な攻撃は回避しうる、と公式ドキュメント自身が述べている",
])}
<p>S38 の「STOP AND ESCALATE — 予期しない依存、機微データ、権限の欠落、ポリシー違反で止める」は、この穴を人間の側で塞ぐ設計要求として読むのが正確です。<strong>MCP サーバーを追加する判断は、firewall を通らない経路を 1 本増やす判断</strong>であり、Delegation Contract の Tools + Constraints フィールドで明示的に扱うべき事項です。</p>
`,
    },

    // ────────────────────────────────────────────────────────────── 9
    {
        id: "modernization",
        num: "09",
        eyebrow: "モダナイゼーション",
        title: "モダナイゼーション専用ツールの現状",
        slides: [28, 29, 30],
        lead: "S28〜S30 は learn.microsoft.com の App Modernization 系ドキュメントを出典としています。この領域は名称と構成が変わっているため、現状を整理します。",
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

<h3>Assess → Plan → Execute と、スライドの Loop の対応</h3>
${table(
    ["Modernize CLI の段階", "内容", "スライドの対応段"],
    [
        ["<strong>Assess</strong>", "コード・構成・依存・クラウド適合性・リスク・機会を分析。<strong>複数リポジトリを横断して集約できる</strong>", "S29「Assess opportunities with evidence」"],
        ["<strong>Plan</strong>", "編集可能・レビュー可能な順序付きタスクと成功条件を生成", "S30「Define the target and migration strategy」"],
        ["<strong>Execute</strong>", "変換・依存アップグレードの適用、ビルド／テスト検証、CVE のスキャンと修復、追跡可能なコミット、cloud agent への委譲", "S32「Delegate implementation and retain judgment」"],
    ],
    { widths: ["16%", "54%", "30%" ] },
)}

${callout(
    "key",
    "S29 / S30 の「人が戦略を選ぶ」という主張は、この製品構造と一致する",
    `<p>S29 は <em>FACTUAL ASSESSMENT — NOT THE STRATEGY DECISION</em>、S30 は <em>humans choose strategy, sequence, and risk</em> と明示します。Modernize CLI の Plan 段が生成するのは<strong>「編集可能・レビュー可能」な計画</strong>であり、実行前に人が変更できる形になっています。プレゼンテーションの主張と製品の設計思想がここで一致しており、説明の説得力が高い箇所です。</p>`,
)}

${pre("powershell", "# Windows\nwinget install GitHub.Copilot.modernization.agent\n\n# macOS / Linux\nbrew tap microsoft/modernize https://github.com/microsoft/modernize-cli\nbrew install modernize")}
<p class="muted">対話型 TUI の <code>modernize</code> と、ヘッドレスの <code>modernize &lt;command&gt;</code> の両方をサポート。</p>

${callout(
    "warn",
    "状態ファイルのパスは統一されていない",
    `<p>ドキュメント上、Modernize CLI のページは <code>.github/modernize/…</code> を示し、実行に関する 1 ページは <code>.github/modernization/…</code> を参照し、IDE のアップグレードエージェントは <code>.github/upgrades/{scenarioId}</code> を使います。<strong>これらを 1 つのパスに正規化して説明しないでください</strong>（ドキュメントに存在しないパスになります）。</p>`,
)}

<h3>docs.github.com の「Modernizing legacy code」チュートリアルは別物</h3>
<p>S27 の出典 ${a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "docs.github.com/copilot/tutorials/modernize-legacy-code")} は <strong>Modernize CLI のチュートリアルではありません</strong>。Copilot Chat 主導の COBOL → Node.js 変換ワークフローを教えるものです：</p>
${ul([
    "① clone してコンパイル・実行し、現状を動かす",
    "② ファイルとデータフローを Copilot に説明させる",
    "③ <strong>業務ロジックのテスト計画を先に作る</strong>",
    "④ COBOL ファイルを反復的に Node.js へ翻訳",
    "⑤ Node アプリを組み立ててデバッグ",
    "⑥ ③ の計画から Jest のユニット／統合テストを生成",
    "⑦ テスト実行、失敗修正、リファイン",
])}
<p>③ が ⑥ より前に来るのが要点で、これが S28「Create a behavioral safety net」の実務的な手順に対応します。<strong>実装を変える前に、期待される振る舞いを人間がレビューできる形にする</strong>という順序です。</p>
`,
    },
];
