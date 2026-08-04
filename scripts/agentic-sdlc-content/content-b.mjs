// PART 2–3: sections 03 (contract), 04 (autonomy), 05 (loop), 06 (orchestration).
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
    `<p>これが本資料の最重要ポイントです。Delegation Contract を Issue 本文だけに書くと、全フィールドが<strong>確率的な指示</strong>のままです。しかし Scope / Tools / Acceptance / Verification / Human gates の 5 つは、ruleset・required checks・firewall・environments といった<strong>決定的な仕組み</strong>に落とせます。<br>これが「<em>Reason probabilistically. Verify deterministically.</em>（確率的に推論し、決定的に検証する）」の実装上の意味であり、「<em>Autonomous execution does not require autonomous acceptance.</em>（自律的な実行は、自律的な受け入れを必要としない）」を担保する仕掛けです（§08・§09）。</p>`,
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

<h3>Capability 予算を「宣言」から「強制」へ —— hooks ${OFFICIAL}</h3>
<p>ここまでの Capability 予算（allowlist・permissions・tools）は<strong>宣言的</strong>です。「このツールは許す／許さない」を設定として書きますが、実行時に個別の呼び出しを検査して止める仕組みではありませんでした。<strong>hooks</strong> はこの欠けを埋めます —— エージェントのワークフローの要所でカスタムのシェルコマンドを実行し、<strong>ツール実行を実行時に承認／拒否</strong>できます。</p>
${docQuote(
    "preToolUse … This is the most powerful hook as it can approve or deny tool executions.",
    "https://docs.github.com/en/copilot/concepts/agents/hooks",
    "GitHub Docs — About hooks for GitHub Copilot",
)}
<p>hooks は <strong>Copilot cloud agent と GitHub Copilot CLI</strong> で利用でき、リポジトリの <code>.github/hooks/*.json</code> に置くとそのリポジトリでの Copilot エージェント利用時に常に適用されます（CLI は <code>~/.copilot/hooks/*.json</code> の個人フックも対応）。8 種類の実行点があります。</p>
${table(
    ["フック種別", "実行される時点", "主な用途"],
    [
        [`<code>sessionStart</code> / <code>sessionEnd</code>`, "セッションの開始 / 終了・中断", "環境初期化・監査ログ・一時リソースの後始末"],
        [`<code>userPromptSubmitted</code>`, "ユーザーがプロンプトを送信したとき", "依頼の監査ログ・利用分析"],
        [`<strong><code>preToolUse</code></strong>`, "エージェントがツールを使う<strong>前</strong>", `<strong>ツール実行の承認／拒否</strong>・危険なコマンドのブロック・ポリシー強制・機微操作の承認要求・利用ログ`],
        [`<code>postToolUse</code>`, "ツール完了後（成否を問わず）", "実行結果のログ・統計・監査証跡・性能監視"],
        [`<code>agentStop</code> / <code>subagentStop</code>`, "メイン／サブエージェントの応答完了時", "サブエージェント結果の検査（§06）・完了通知"],
        [`<code>errorOccurred</code>`, "実行中にエラーが起きたとき", "エラーログ・通知・パターン追跡"],
    ],
    { widths: ["26%", "34%", "40%"] },
)}
<p>設定は <code>version: 1</code> と <code>hooks</code> オブジェクトからなり、各フックは <code>type:"command"</code>（必須）に <code>bash</code> / <code>powershell</code>、任意で <code>cwd</code>・<code>env</code>・<code>timeoutSec</code>（既定 30 秒）を持ちます。</p>
${callout(
    "key",
    "hooks は 4 次元のうち Capability を「実行時に効く」次元へ格上げする",
    `<p>allowlist や <code>tools:</code> が「何を許すか」の<strong>宣言</strong>だとすれば、<code>preToolUse</code> は「今まさに実行しようとしている操作を止められるか」の<strong>強制</strong>です。§12 の失敗パターンや §11 の逸脱を、二度と起こさない形（当該ツール実行の拒否・コンプライアンス用の利用ログ）に落とす受け皿になります。ただしフックは同期的にエージェント実行をブロックするため、<strong>実行時間は短く保つ</strong>必要があります（ドキュメントは 5 秒以内を推奨）。</p>`,
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
    したがってこの段は<strong>既存の可観測性基盤 ＋ 人間の運用プロセス</strong>で実装するしかありません。Copilot 側で唯一この方向にあるのが ${PP} <strong>Copilot Memory</strong>（リポジトリ事実の永続化・28 日未使用で失効）ですが、これは運用シグナルの取り込み機構ではありません。提案時に「ここは製品機能ではなく運用設計」と明示することが誠実です。</p>`,
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

    // ────────────────────────────────────────────────────────────── 06
    {
        id: "orchestration",
        num: "06",
        eyebrow: "Orchestration",
        title: "Orchestration の実務 —— 並列委譲を成立させる",
        lead: "§01 と §10 の両方で「オーケストレーション」を頂点に置きながら、本資料はこれまで操作方法を示していませんでした。本節はその欠落を埋めます —— 並列に動かせる 4 つの実体を区別し、何を並列に載せてよいかの分解規準を確定させ、並列度の上限がどこにあるかを明示します。",
        html: `
${principle(
    "Parallelism is bounded by review capacity, not by how many agents you can launch.",
    "並列度を決めるのは「何体のエージェントを起動できるか」ではなく「人がレビューし切れる量」である。委譲を増やすほど、律速は生成側からレビュー側へ移る。",
)}

<h3>並列実行の 4 つの実体 —— 階層が違う</h3>
<p>「エージェントを並列に動かす」と一言で言っても、GitHub には<strong>階層の異なる 4 つの仕組み</strong>があります。サブエージェントは<strong>1 セッションの内側</strong>で、cloud agent タスクや automations は<strong>セッションをまたいで</strong>並列化します。混同すると分解の粒度を誤ります。</p>

${table(
    ["並列の実体", "面 / 起動経路", "並列の単位", "コンテキストの分離", "課金・状態の帰結"],
    [
        [
            `<strong>${c("/fleet")} サブエージェント</strong> ${OFFICIAL}`,
            `GitHub Copilot CLI（1 セッション内）`,
            "サブタスク（メインがオーケストレータ）",
            `<strong>各サブエージェントが独立したコンテキスト窓</strong>（メインとも他のサブエージェントとも別）`,
            `<span class="neg">AI Credits の消費が増える</span>（§13）。状態は 1 ワークツリー内`,
        ],
        [
            `<strong>並列ワークスペース</strong> ${GA}`,
            `GitHub Copilot app（デスクトップ）`,
            "セッション（複数を同時実行）",
            `<strong>各セッションが専用の git worktree とブランチ</strong>`,
            `セッションごとに独立したブランチ。クラウドサンドボックス実行時は Actions も消費 ${PP}`,
        ],
        [
            `<strong>cloud agent の複数タスク</strong> ${OFFICIAL}`,
            `GitHub.com の Agents タブ / ${c("gh agent-task")} / agent-tasks REST API`,
            "タスク＝セッション（セッション間）",
            `各タスクが独立したエフェメラル環境と <code>copilot/…</code> ブランチ`,
            `AI Credits ＋ Actions minutes。push 済みコミットとして残る`,
        ],
        [
            `<strong>automations</strong> ${OFFICIAL}`,
            `スケジュール / リポジトリイベント（無人）`,
            "実行ごとに 1 セッション",
            `リポジトリの cloud agent 設定を継承（1 リポジトリにスコープ）`,
            `AI Credits ＋ Actions minutes。<span class="neg">定義は Git 管理外</span>（§09）`,
        ],
    ],
    { widths: ["20%", "22%", "18%", "22%", "18%"] },
)}

${docQuote(
    "the main Copilot agent … will act as orchestrator, managing the workflow and dependencies between the subtasks. Each subagent has its own context window, separate from the main agent and other subagents.",
    "https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet",
    "GitHub Docs — Fleet for Copilot CLI",
)}

<h3>並列に載せてよいタスクの分解規準</h3>
<p>並列化が利益を生むのは、タスクが<strong>本当に独立している</strong>ときだけです。分解の可否は次の 3 点で判定します。</p>
${cards(
    [
        {
            title: "① 独立性 —— 逐次依存がないこと",
            badge: OFFICIAL,
            body: `一方の出力が他方の入力になる依頼は並列化しても待ちが発生するだけです。ドキュメント原文も <em>「your request is inherently sequential なら <code>/fleet</code> は利益をもたらさないことがある」</em>と明言します。<strong>本質的に逐次な依頼を無理に並列化しない</strong> —— これが第一規準です。`,
        },
        {
            title: "② 衝突面をパスで分離する",
            badge: FRAMEWORK,
            body: `並列タスクが同じファイルを触ると、ブランチ統合時に衝突します。§02 の <code>applyTo</code>（instruction のスコープ）と §03 の <strong>CODEOWNERS</strong> を再利用し、<strong>タスクごとに触るパスを重ならないよう割り当てる</strong>。衝突面を設計時に分離するのがオーケストレータの仕事です。`,
        },
        {
            title: "③ 1 タスク 1 ブランチの帰結",
            badge: FRAMEWORK,
            body: `並列ワークスペースも cloud agent タスクも <strong>1 タスク＝1 ブランチ＝1 PR</strong> が単位です。したがって分解の粒度は「独立してレビュー・マージできる単位」まで下げる必要があります。粒度が粗いと衝突し、細か過ぎるとレビュー負荷（＝律速）が増えます。`,
        },
    ],
    { cols: 3 },
)}

<h3>並列化が向く仕事・向かない仕事</h3>
${table(
    ["向き / 不向き", "例", "根拠"],
    [
        [
            `<span class="pos">向く</span>`,
            "複数ファイルの独立したリファクタ、依存更新、モジュール横断のテスト実行、<strong>新機能のテストスイート作成</strong>",
            `ドキュメントが「複数ステップの独立作業」「新機能のテストスイート作成は並列化に向く」と明記`,
        ],
        [
            `<span class="neg">向かない</span>`,
            "設計→実装→検証のように前段の結論が次段の前提になる一連の作業",
            `逐次依存があると <code>/fleet</code> は利益をもたらさない（AI Credits だけ増える）`,
        ],
    ],
    { widths: ["14%", "50%", "36%"] },
)}

${callout(
    "key",
    "専門化 —— サブエージェントにモデルとカスタムエージェントを割り当てる",
    `<p><code>/fleet</code> のサブエージェントは既定で低コストモデルを使いますが、プロンプト内でモデルを指定できます（例: <em>「… Use GPT-5.3-Codex, to create …」</em>）。<code>@CUSTOM-AGENT-NAME</code> でカスタムエージェントを明示指定すれば、タスクごとに専門化した振る舞いを割り当てられます。<strong>難所には高性能モデル、定型には低コストモデル</strong>という配分が、そのままコスト設計（§13）になります。</p>`,
)}

${callout(
    "note",
    "monorepo と polyrepo の違いは「分解規準」の中に吸収される",
    `<p>monorepo では衝突面の分離がパス割り当て（規準②）で完結し、CODEOWNERS も 1 リポジトリで一元管理できます。polyrepo では 1 タスク 1 ブランチが自然にリポジトリ境界と一致する一方、リポジトリ横断の変更は automations が <strong>1 リポジトリにしか作用できない</strong>制約（§09）に突き当たります。いずれの場合も規準①〜③は変わりません。</p>`,
)}

${callout(
    "warn",
    "並列度を上げてもレビュー容量は増えない",
    `<p>4 つの仕組みのどれを使っても、生成された PR は最終的に<strong>人のレビューという同じ関門</strong>を通ります。並列度を上げるほど律速はレビュー側に移動し、AI Credits（§13）は線形に増えます。<strong>「同時に何体動かせるか」ではなく「同時に何本レビューし切れるか」で並列度を決める</strong> —— これが本資料を貫くテーゼの、オーケストレーションにおける現れです。</p>`,
)}
`,
    },
];
