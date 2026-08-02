// PART 2–3: sections 03 (contract), 04 (autonomy), 05 (loop).
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre, diagram } from "./ui.mjs";
import { contractDiagram, autonomyDiagram, loopDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "公式");
const FRAMEWORK = badge("framework", "本資料の整理");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsB = [
    // ────────────────────────────────────────────────────────────── 03
    {
        id: "contract",
        num: "03",
        eyebrow: "Delegation Contract",
        title: "Delegation Contract —— 委譲を仕様化する 8 フィールド",
        lead: "Delegation Contract は本資料の中心概念です。作業を始める前に、成功・境界・証拠・意思決定ゲートを検査可能にする 8 つのフィールドからなります。本節では、その各フィールドを GitHub のどこに書けば実際にエージェントに効くのかを確定させます —— ここが最も実用価値の高い節です。",
        html: `
${principle(
    "A Delegation Contract makes success, boundaries, proof, and decision gates inspectable before work begins.<br>The contract grants bounded authority—not a blank check.",
    "委譲契約は、作業を始める前に「成功・境界・証拠・意思決定ゲート」を検査可能にする。契約が与えるのは〈境界のある権限〉であって、白紙委任ではない。",
)}

${diagram(
    contractDiagram(),
    "Delegation Contract を構成する 8 フィールドの一覧。緑（構造的に強制可）の 5 つ —— Scope + Out / Tools + Constraints / Acceptance / Verification + Evidence / Human gates —— は ruleset や required checks などの決定的な仕組みに落とせる。各フィールドの実装先は直後の表で対応づける。",
)}

${table(
    ["フィールド", "フィールドの定義", "GitHub 上の実装先", "強制力"],
    [
        [
            `<strong>Outcome + Why</strong>`,
            "観測可能な結果と、その業務上・技術上の目的",
            "<strong>Issue のタイトルと本文</strong>（Copilot にアサインする Issue そのもの）",
            `<span class="soft">プロンプトのみ</span>`,
        ],
        [
            `<strong>Scope + Out</strong>`,
            "作業してよい範囲と、明示的に変えてはならないもの",
            `Issue 本文の明示的除外 ＋ ${c(".github/instructions/*.instructions.md")} の <code>applyTo</code><br>＋ <strong>ruleset / branch protection</strong> のパス制限<br>＋ <strong>CODEOWNERS</strong>`,
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Context</strong>`,
            "リポジトリ知識・現在の振る舞い・決定事項・前提",
            `${c("AGENTS.md")} / ${c(".github/copilot-instructions.md")} / <strong>Copilot Spaces</strong> / リンクした Issue・PR / MCP`,
            `<span class="soft">プロンプトのみ</span>`,
        ],
        [
            `<strong>Tools + Constraints</strong>`,
            "許可された能力・制限・ポリシー・予算",
            `${c(".github/workflows/copilot-setup-steps.yml")}（<code>permissions:</code>・<code>timeout-minutes</code>）<br>＋ <strong>firewall allowlist</strong><br>＋ リポジトリ MCP 設定 ／ <strong>Agents secrets</strong><br>＋ custom agent の <code>tools:</code> frontmatter<br>＋ <strong>AI Controls</strong>（組織 / Enterprise ポリシー）`,
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Acceptance</strong>`,
            "「完了」を定義する観測可能な条件",
            "Issue の受け入れ条件 ＋ <strong>required status checks</strong>",
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Verification + Evidence</strong>`,
            "繰り返し可能なチェックと、レビュー用に返す証拠",
            `<strong>GitHub Actions</strong> ワークフロー / <strong>CodeQL</strong> / <strong>Dependabot</strong> / <strong>secret scanning</strong><br>＋ <strong>session log</strong>・<strong>Verified 署名コミット</strong>`,
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Escalate</strong>`,
            "作業を止めるべき曖昧さ・リスク・失敗条件",
            `Issue / PR コメントで ${c("@copilot")} に差し戻し<br>＋ <strong>「Approve and run workflows」で既定停止</strong>する構造`,
            `<span class="mid">半構造的</span>`,
        ],
        [
            `<strong>Human gates</strong>`,
            "説明責任を持つ人に残す、名前のついた意思決定",
            `<strong>required reviews</strong> / <strong>CODEOWNERS 必須承認</strong> / <strong>environments の required reviewers</strong> / <strong>merge queue</strong> / <strong>deployment protection rules</strong>`,
            `<span class="hard">構造的に強制可</span>`,
        ],
    ],
    { widths: ["14%", "22%", "44%", "20%"] },
)}

${callout(
    "key",
    "8 フィールドのうち 5 つは「お願い」ではなく「構造」にできる",
    `<p>これが本資料の最重要ポイントです。Delegation Contract を Issue 本文だけに書くと、全フィールドが<strong>確率的な指示</strong>のままです。しかし Scope / Tools / Acceptance / Verification / Human gates の 5 つは、ruleset・required checks・firewall・environments といった<strong>決定的な仕組み</strong>に落とせます。<br>これが「<em>Reason probabilistically. Verify deterministically.</em>（確率的に推論し、決定的に検証する）」の実装上の意味であり、「<em>Autonomous execution does not require autonomous acceptance.</em>（自律的な実行は、自律的な受け入れを必要としない）」を担保する仕掛けです（§07・§08）。</p>`,
)}

<h3>構造的保証の核心：エージェントは自分の PR を承認できない</h3>
${docQuote(
    "Copilot cloud agent cannot mark its pull requests as \"Ready for review\" and cannot approve or merge a pull request.",
    "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations",
    "docs.github.com — Risks and mitigations for Copilot cloud agent",
)}
<p>さらに <strong>タスクを依頼した人自身の承認も required approvals にカウントされません</strong>。つまり「自分で投げて自分で承認する」経路が構造的に塞がれています。「委譲は成果を実行する責任を移すのであって、マージする権限を移すのではない」は、比喩ではなく製品仕様の記述です。</p>

<h3>認証モジュールへの適用例を、実際のリポジトリ資産に置き換える</h3>
${table(
    ["契約フィールドの値（認証モジュール例・抜粋）", "対応する実物"],
    [
        [
            "「認証のコード・構成・テスト・必要な依存を変更してよい。ロール・UI・スキーマ・ロールアウトは除外する」",
            `<code>.github/instructions/auth.instructions.md</code> に <code>applyTo: "**/auth/**"</code>。ロール・UI・スキーマの各パスは <strong>CODEOWNERS</strong> でセキュリティ／アーキ担当を必須レビュアに。ロールアウトは <strong>environment</strong> の required reviewers に分離。`,
        ],
        [
            "「承認済み依存でリポジトリと CI のツールを使う。本番シークレットは一切露出しない」",
            `<strong>firewall allowlist</strong> を承認済み依存レジストリに限定。本番シークレットは <strong>Agents secrets に置かない</strong>（Actions / Codespaces / Dependabot の secrets は cloud agent に自動的に渡らない仕様）。`,
        ],
        [
            "「ビルド・認証テスト・互換テスト・スキャンを通す。実行コマンド・結果・受け入れ条件への対応を返す」",
            `required status checks に build / auth テスト / 互換テスト / CodeQL を登録。「コマンド・結果」は <strong>session log</strong> と Actions のログが担う。「受け入れ条件への対応づけ」は PR 本文に人が書かせる（自動化されない）。`,
        ],
        [
            "「ロール・スキーマ・セキュリティ基準・振る舞いの曖昧さがあれば制御を返す」",
            `該当パスを <strong>CODEOWNERS</strong> と ruleset で保護しておけば、エージェントがそこに触れた瞬間に必須レビューが発火する。<em>「エスカレーションを頼む」のではなく「触ると止まる」形にする</em>。`,
        ],
        [
            "「計画・PR・リリース・本番公開を、それぞれ別に承認する」",
            `plan → Agents UI での research/plan 段階レビュー。PR → required reviews。release / production → <strong>environments</strong> の deployment protection rules（reviewers・wait timer・branch 制限・admin bypass 禁止）。`,
        ],
    ],
    { widths: ["40%", "60%"] },
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 04
    {
        id: "autonomy",
        num: "04",
        eyebrow: "Autonomy Budget",
        title: "Autonomy Budget —— 自律性を 4 次元で配分する",
        lead: "自律性はオン／オフのスイッチではなく、タスクごとに配分する予算です。本資料は自律性を Scope / Capability / Compute / Decision の 4 次元に分解します。すべての予算は可逆性・影響範囲（blast radius）・証跡の質に応じて調整し、拡大は一度に 1 次元ずつ行います。各次元に対応する実際の設定項目を列挙します。",
        html: `
${principle(
    "Autonomy has multiple dimensions that teams allocate per task. Expand it only when work is reversible, contained, and strongly evidenced.<br>Increase autonomy one bounded dimension at a time.",
    "自律性は複数の次元を持ち、チームはそれをタスクごとに配分する。拡大してよいのは、作業が可逆で・影響が封じ込められ・強く証跡づけられているときだけ。自律性は一度に 1 つの次元ずつ上げる。",
)}

${diagram(
    autonomyDiagram(),
    "自律性を Scope / Capability / Compute / Decision の 4 次元に分解し、それぞれを低→高の帯で表した図。自律性はオン・オフのスイッチではなく次元ごとに配分する「予算」であり、拡大は一度に 1 次元ずつ行う。各次元に対応する実際の設定項目は直後のカードで確認できる。",
)}

${cards(
    [
        {
            title: "Scope budget",
            badge: FRAMEWORK,
            body: `<p class="muted">ファイル・コンポーネント・リポジトリ・Issue の境界</p>
      <ul class="plain tight">
        <li><strong>既定で強い制約がある</strong>：エージェントは <code>copilot/…</code> ブランチ 1 本にしか push できない（<code>@copilot</code> で既存 PR に呼んだ場合のみその PR のブランチ）</li>
        <li>1 タスク ＝ 1 ブランチ ＝ 1 PR</li>
        <li>エージェントの認証情報は単純な push 操作のみ。<strong>直接 git コマンドは実行できない</strong></li>
        <li>ruleset / branch protection のパス制限</li>
        <li>CODEOWNERS による必須レビュー領域</li>
      </ul>`,
        },
        {
            title: "Capability budget",
            badge: FRAMEWORK,
            body: `<p class="muted">ツール・ネットワーク・PR / ワークフロー権限</p>
      <ul class="plain tight">
        <li><strong>firewall は既定で ON</strong>。推奨依存 allowlist 付き。組織／リポジトリでカスタム allowlist 可、リポジトリ独自ルールを禁止するポリシーもある</li>
        <li>リポジトリ MCP 設定（tools のみ・読み取り既定）</li>
        <li><code>copilot-setup-steps.yml</code> の <code>permissions:</code></li>
        <li>専用 <strong>Agents secrets / variables</strong>（Actions・Codespaces・Dependabot の secrets は渡らない。値はログでマスク）</li>
        <li>custom agent の <code>tools:</code> / <code>mcp-servers:</code></li>
        <li><strong>AI Controls</strong>：cloud agent の有効化範囲、third-party agents、custom agents、code review、MCP、モデル可用性を個別制御</li>
      </ul>`,
        },
        {
            title: "Compute budget",
            badge: FRAMEWORK,
            body: `<p class="muted">実行時間と並列度</p>
      <ul class="plain tight">
        <li><code>copilot-setup-steps.yml</code> の <code>timeout-minutes</code>（<strong>上限 59 分</strong>）</li>
        <li>GitHub Actions 分の消費上限</li>
        <li>AI Credits と <strong>budgets</strong> 設定</li>
        <li>並列度は Agents パネルで人が投入する数に等しい ＝ <strong>実質的にレビュー容量が上限</strong></li>
      </ul>`,
        },
        {
            title: "Decision budget",
            badge: FRAMEWORK,
            body: `<p class="muted">必須承認と停止条件</p>
      <ul class="plain tight">
        <li>required approvals / CODEOWNERS 必須承認</li>
        <li><strong>「Approve and run workflows」</strong>：既定では、write 権限者がクリックするまでワークフローが走らない</li>
        <li>environments の required reviewers・wait timer・self-review 禁止</li>
        <li>merge queue / linear history / signed commits</li>
        <li>ruleset の bypass actor 設定（Copilot を bypass にするか否かは明示的な統治判断）</li>
      </ul>`,
        },
    ],
    { cols: 2 },
)}

${callout(
    "note",
    "既定値がすでに保守的である、という事実の使い方",
    `<p>「エージェントは勝手に何でもやるのでは」と問われたとき、有効な回答は 4 つの既定値です —— <strong>(1)</strong> 専用ブランチ 1 本にしか push できない、<strong>(2)</strong> 自分の PR を Ready にも Approve にも Merge にもできない、<strong>(3)</strong> ワークフローは人がクリックするまで走らない、<strong>(4)</strong> ネットワークは既定でファイアウォール越し。<br>自律性を「予算」として語ることが有効なのは、これらが<em>すべて緩められる</em>からです。緩める判断こそが統治です。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 05
    {
        id: "loop",
        num: "05",
        eyebrow: "Modernization Loop",
        title: "Agentic Modernization Loop —— 5 つの変換と機能マップ",
        lead: "モダナイゼーションは、Code→Doc / Doc→Plan / Plan→Work / Work→PR / PR→Learning という 5 つの変換を回すループとして設計できます。ループは不確実性を小さくレビュー可能な変更に変え、レビュー済みの結果を組織知識へ戻します。各変換で「どの機能を使い、何を成果物として残すか」を確定させます。",
        html: `
${principle(
    "The loop turns uncertainty into small, reviewable changes and feeds every reviewed result back into organizational knowledge.<br>Bounded delegation sits at the center; human gates connect every stage.",
    "ループは不確実性を、小さくレビュー可能な変更へと変え、レビュー済みの結果をすべて組織知識へ戻す。中心には境界のある委譲があり、各段を人間のゲートがつなぐ。",
)}

${diagram(
    loopDiagram(),
    "Code→Doc / Doc→Plan / Plan→Work / Work→PR / PR→Learning の 5 変換が時計回りに一周し、PR→Learning がふたたび Code→Doc に戻る循環。中心には「境界のある委譲」があり、各変換をつなぐのは人間のゲートである。各変換で使う機能・残す成果物・人間のゲートは直後の表で確認できる。",
)}

${table(
    ["変換", "使う機能", "リポジトリに残す成果物", "人間のゲート"],
    [
        [
            `<strong>Code → Doc</strong><br><span class="muted">構造・振る舞い・ルール・不確実性を復元する</span>`,
            `Copilot Chat（リポジトリ横断の説明）<br>Copilot Spaces（対象範囲を束ねる）<br>${PP} Modernize CLI の assess`,
            `<code>docs/</code> 配下の構造・フロー・業務ルール記述<br><strong>「前提と未確定事項」の一覧</strong>`,
            "ドメインオーナーによる検証。<em>復元されたドキュメントは、検証されるまで仮説にすぎない</em>",
        ],
        [
            `<strong>（安全網）</strong><br><span class="muted">振る舞いの安全網を作る</span>`,
            `Copilot Chat のテスト生成<br>App modernization for Java（既存テスト移行 ＋ 新規ユニットテスト生成、behavioral-integrity 検証）`,
            "characterization テスト（現行の観測可能な振る舞いを固定するテスト）",
            "<strong>どれが意図した振る舞いでどれが欠陥か</strong>を人が判定する",
        ],
        [
            `<strong>Doc → Plan</strong><br><span class="muted">目標・選択肢・リスク・移行の波を定義する</span>`,
            `${PP} <strong>modernization agent（Modernize CLI）</strong> の assess → plan<br>Dependabot / Advisory Database（既知脆弱性）<br>CodeQL（セキュリティ所見）`,
            "編集可能・順序付きのタスクと成功条件を持つ計画ファイル",
            "<strong>戦略・順序・リスクは人が選ぶ</strong>。アセスメントは事実であって戦略決定ではない",
        ],
        [
            `<strong>Plan → Work</strong><br><span class="muted">境界があり独立に検証可能なタスクを作る</span>`,
            "GitHub Issues（＝ Delegation Contract の器）<br>Issue テンプレート／ラベル",
            "1 つの観測可能な成果・明示的依存・境界・検証手段・ロールバック手順を持つ Issue 群",
            "Issue の粒度承認（＝スプリント計画）",
        ],
        [
            `<strong>Work → PR</strong><br><span class="muted">実装・検証・報告し、人間のレビューを求める</span>`,
            `<strong>GitHub Copilot cloud agent</strong><br>GitHub Actions / CodeQL / secret scanning<br>Copilot code review`,
            `<code>copilot/…</code> ブランチ、draft PR、Verified 署名コミット、session log`,
            "required reviews / CODEOWNERS / environments。<strong>エージェントは承認もマージもできない</strong>",
        ],
        [
            `<strong>PR → Learning</strong><br><span class="muted">instructions・テスト・計画・今後の作業を改善する</span>`,
            `既存のテレメトリ・インシデント・サポート基盤<br>${PP} Copilot Memory<br>custom instructions / custom agents の更新`,
            `更新された <code>AGENTS.md</code> / <code>*.instructions.md</code>、強化されたテスト、runbook、次の Delegation Contract`,
            "どのシグナルが優先度・統制・ロールアウトを変えるかをオーナーが決める",
        ],
    ],
    { widths: ["18%", "26%", "30%", "26%"] },
)}

${callout(
    "warn",
    "PR → Learning に対応する専用の Copilot 製品は存在しない",
    `<p>自律的なデプロイ後モニタリングやインシデント相関を担う専用の Copilot 機能は、確認できる範囲では<strong>存在しません</strong>。この段は運用モデルの合成であって、専用の Copilot 監視機能ではありません。<br>
    したがってこの段は<strong>既存の可観測性基盤 ＋ 人間の運用プロセス</strong>で実装するしかありません。Copilot 側で唯一この方向にあるのが ${PP} <strong>Copilot Memory</strong>（リポジトリ事実の永続化・28 日で失効）ですが、これは運用シグナルの取り込み機構ではありません。提案時に「ここは製品機能ではなく運用設計」と明示することが誠実です。</p>`,
)}

<h3>Agents UI の research / plan / iterate 段階</h3>
<p>Agents UI から起動した場合、cloud agent は次の流れをたどります —— 承認された Issue → エージェントの調査 → 提案された計画 → 人による確認・軌道修正 → ブランチ作業 → チェック実行 → draft PR。「人が範囲・アプローチ・前提を確認または軌道修正する」ステップが挟まるのは、この投入経路の特徴です。</p>
${callout(
    "note",
    "投入経路によって挙動が違う",
    `<p>Agents UI から起動した場合、cloud agent は PR を作る前に調査・計画・反復ができます。<strong>それ以外の多くの投入経路（Issue アサイン、<code>@copilot</code> など）では、すぐに PR を開きます。</strong><br>「人が範囲・アプローチ・前提を確認または軌道修正する」ステップを実際に成立させたいなら、<strong>Agents UI から投入する</strong>必要があります。この差は運用設計に直結します。</p>`,
)}
`,
    },
];
