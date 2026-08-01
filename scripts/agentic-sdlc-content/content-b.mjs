// Sections 3–5 of the supplementary guide.
import { badge, c, a, table, callout, deckQuote, docQuote, cards, steps, ul, pre } from "./ui.mjs";

const OFFICIAL = badge("official", "公式");
const FRAMEWORK = badge("framework", "発表者FW");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsB = [
    // ────────────────────────────────────────────────────────────── 3
    {
        id: "contract",
        num: "03",
        eyebrow: "Delegation Contract",
        title: "8 フィールド → GitHub 上の実装先",
        slides: [22, 34, 44],
        lead: "Delegation Contract はこのプレゼンテーションの中心概念で、S22（定義）・S34（認証モジュールへの適用例）・S44（明日のアクション）で同じ 2×4 グリッドが 3 回反復されます。ここが本資料で最も実用価値の高い節です —— 8 フィールドそれぞれを、GitHub のどこに書けば実際にエージェントに効くのかを確定させます。",
        html: `
${deckQuote(
    "A Delegation Contract makes success, boundaries, proof, and decision gates inspectable before work begins.<br>The contract grants bounded authority—not a blank check.",
    "S22 / S34",
)}

${table(
    ["フィールド", "スライドの定義", "GitHub 上の実装先", "強制力"],
    [
        [
            `<strong>Outcome + Why</strong>`,
            "Observable result and its business or technical purpose",
            "<strong>Issue のタイトルと本文</strong>（Copilot にアサインする Issue そのもの）",
            `<span class="soft">プロンプトのみ</span>`,
        ],
        [
            `<strong>Scope + Out</strong>`,
            "Where work may act and what explicitly must not change",
            `Issue 本文の明示的除外 ＋ ${c(".github/instructions/*.instructions.md")} の <code>applyTo</code><br>＋ <strong>ruleset / branch protection</strong> のパス制限<br>＋ <strong>CODEOWNERS</strong>`,
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Context</strong>`,
            "Repository knowledge, current behavior, decisions, and assumptions",
            `${c("AGENTS.md")} / ${c(".github/copilot-instructions.md")} / <strong>Copilot Spaces</strong> / リンクした Issue・PR / MCP`,
            `<span class="soft">プロンプトのみ</span>`,
        ],
        [
            `<strong>Tools + Constraints</strong>`,
            "Permitted capabilities, limits, policies, and budgets",
            `${c(".github/workflows/copilot-setup-steps.yml")}（<code>permissions:</code>・<code>timeout-minutes</code>）<br>＋ <strong>firewall allowlist</strong><br>＋ リポジトリ MCP 設定 ／ <strong>Agents secrets</strong><br>＋ custom agent の <code>tools:</code> frontmatter<br>＋ <strong>AI Controls</strong>（組織 / Enterprise ポリシー）`,
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Acceptance</strong>`,
            "Observable conditions that define done",
            "Issue の受け入れ条件 ＋ <strong>required status checks</strong>",
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Verification + Evidence</strong>`,
            "Repeatable checks and proof returned for review",
            `<strong>GitHub Actions</strong> ワークフロー / <strong>CodeQL</strong> / <strong>Dependabot</strong> / <strong>secret scanning</strong><br>＋ <strong>session log</strong>・<strong>Verified 署名コミット</strong>`,
            `<span class="hard">構造的に強制可</span>`,
        ],
        [
            `<strong>Escalate</strong>`,
            "Ambiguity, risk, or failure conditions that stop the work",
            `Issue / PR コメントで ${c("@copilot")} に差し戻し<br>＋ <strong>「Approve and run workflows」で既定停止</strong>する構造`,
            `<span class="mid">半構造的</span>`,
        ],
        [
            `<strong>Human gates</strong>`,
            "Named decisions that remain with accountable people",
            `<strong>required reviews</strong> / <strong>CODEOWNERS 必須承認</strong> / <strong>environments の required reviewers</strong> / <strong>merge queue</strong> / <strong>deployment protection rules</strong>`,
            `<span class="hard">構造的に強制可</span>`,
        ],
    ],
    { widths: ["14%", "22%", "44%", "20%"] },
)}

${callout(
    "key",
    "8 フィールドのうち 5 つは「お願い」ではなく「構造」にできる",
    `<p>これが本資料の最重要ポイントです。Delegation Contract を Issue 本文だけに書くと、全フィールドが<strong>確率的な指示</strong>のままです。しかし Scope / Tools / Acceptance / Verification / Human gates の 5 つは、ruleset・required checks・firewall・environments といった<strong>決定的な仕組み</strong>に落とせます。<br>これがスライド S24「Reason probabilistically. Verify deterministically.」の実装上の意味であり、S36「Autonomous execution does not require autonomous acceptance.」を担保する仕掛けです。</p>`,
)}

<h3>構造的保証の核心：エージェントは自分の PR を承認できない</h3>
${docQuote(
    "Copilot cloud agent cannot mark its pull requests as \"Ready for review\" and cannot approve or merge a pull request.",
    "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations",
    "docs.github.com — Risks and mitigations for Copilot cloud agent",
)}
<p>さらに <strong>タスクを依頼した人自身の承認も required approvals にカウントされません</strong>。つまり「自分で投げて自分で承認する」経路が構造的に塞がれています。S13 の <em>"Delegation transfers responsibility for executing an outcome, not authority to merge it."</em> は、比喩ではなく製品仕様の記述です。</p>

<h3>S34 の認証モジュール例を、実際のリポジトリ資産に置き換える</h3>
${table(
    ["S34 のフィールド値（抜粋）", "対応する実物"],
    [
        [
            "「Change auth code, configuration, tests, and required dependencies; exclude roles, UI, schema, and rollout」",
            `<code>.github/instructions/auth.instructions.md</code> に <code>applyTo: "**/auth/**"</code>。ロール・UI・スキーマの各パスは <strong>CODEOWNERS</strong> でセキュリティ／アーキ担当を必須レビュアに。ロールアウトは <strong>environment</strong> の required reviewers に分離。`,
        ],
        [
            "「Use repository and CI tools with approved dependencies; … expose no production secrets」",
            `<strong>firewall allowlist</strong> を承認済み依存レジストリに限定。本番シークレットは <strong>Agents secrets に置かない</strong>（Actions / Codespaces / Dependabot の secrets は cloud agent に自動的に渡らない仕様）。`,
        ],
        [
            "「Pass builds, auth tests, compatibility cases, and scans; return commands, results, and criteria mapping」",
            `required status checks に build / auth テスト / 互換テスト / CodeQL を登録。「commands, results」は <strong>session log</strong> と Actions のログが担う。「criteria mapping」は PR 本文に人が書かせる（自動化されない）。`,
        ],
        [
            "「Return control on role, schema, security-baseline, or behavioral ambiguity」",
            `該当パスを <strong>CODEOWNERS</strong> と ruleset で保護しておけば、エージェントがそこに触れた瞬間に必須レビューが発火する。<em>「エスカレーションを頼む」のではなく「触ると止まる」形にする</em>。`,
        ],
        [
            "「Approve the plan, pull request, release, and production exposure separately」",
            `plan → Agents UI での research/plan 段階レビュー。PR → required reviews。release / production → <strong>environments</strong> の deployment protection rules（reviewers・wait timer・branch 制限・admin bypass 禁止）。`,
        ],
    ],
    { widths: ["40%", "60%"] },
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 4
    {
        id: "autonomy",
        num: "04",
        eyebrow: "Autonomy Budget",
        title: "「自律性はスイッチではなく予算」の配分先",
        slides: [23],
        lead: "S23 は自律性を Scope / Capability / Compute / Decision の 4 次元に分解し、「Scale every budget to reversibility, blast radius, and evidence quality」と述べます。ここでは各次元に対応する実際の設定項目を列挙します。",
        html: `
${deckQuote(
    "Autonomy has multiple dimensions that teams allocate per task. Expand it only when work is reversible, contained, and strongly evidenced.<br>Increase autonomy one bounded dimension at a time.",
    "S23",
)}

${cards(
    [
        {
            title: "Scope budget",
            badge: FRAMEWORK,
            body: `<p class="muted">Files, components, repositories, and issue boundaries</p>
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
            body: `<p class="muted">Tools, network, and PR or workflow permissions</p>
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
            body: `<p class="muted">Runtime and parallelism</p>
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
            body: `<p class="muted">Required approvals and stopping conditions</p>
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
    `<p>顧客に「エージェントは勝手に何でもやるのでは」と問われたとき、有効な回答は 4 つの既定値です —— <strong>(1)</strong> 専用ブランチ 1 本にしか push できない、<strong>(2)</strong> 自分の PR を Ready にも Approve にも Merge にもできない、<strong>(3)</strong> ワークフローは人がクリックするまで走らない、<strong>(4)</strong> ネットワークは既定でファイアウォール越し。<br>S23 の「予算」の言い方が有効なのは、これらが<em>すべて緩められる</em>からです。緩める判断こそが統治です。</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 5
    {
        id: "loop",
        num: "05",
        eyebrow: "Modernization Loop",
        title: "5 つの変換 → 機能マップ",
        slides: [25, 27, 28, 29, 30, 31, 32, 33, 40],
        lead: "S25 の Agentic Modernization Loop（Code→Doc / Doc→Plan / Plan→Work / Work→PR / PR→Learning）は、S27〜S33 と S40 で 1 段ずつ展開されます。各段で「どの機能を使い、何を成果物として残すか」を確定させます。",
        html: `
${deckQuote(
    "The loop turns uncertainty into small, reviewable changes and feeds every reviewed result back into organizational knowledge.<br>Bounded delegation sits at the center; human gates connect every stage.",
    "S25",
)}

${table(
    ["変換", "対応スライド", "使う機能", "リポジトリに残す成果物", "人間のゲート"],
    [
        [
            `<strong>Code → Doc</strong><br><span class="muted">Recover structure, behavior, rules, and uncertainty</span>`,
            "S27",
            `Copilot Chat（リポジトリ横断の説明）<br>Copilot Spaces（対象範囲を束ねる）<br>${PP} Modernize CLI の assess`,
            `<code>docs/</code> 配下の構造・フロー・業務ルール記述<br><strong>「前提と未確定事項」の一覧</strong>`,
            "ドメインオーナーによる検証。<em>復元されたドキュメントは検証されるまで仮説</em>（S27 逐語）",
        ],
        [
            `<strong>（安全網）</strong><br><span class="muted">Create a behavioral safety net</span>`,
            "S28",
            `Copilot Chat のテスト生成<br>App modernization for Java（既存テスト移行 ＋ 新規ユニットテスト生成、behavioral-integrity 検証）`,
            "characterization テスト（現行の観測可能な振る舞いを固定するテスト）",
            "<strong>どれが意図した振る舞いでどれが欠陥か</strong>を人が判定する（S28 逐語の HUMAN DECISION）",
        ],
        [
            `<strong>Doc → Plan</strong><br><span class="muted">Define the target, options, risks, and migration waves</span>`,
            "S29 / S30",
            `${PP} <strong>modernization agent（Modernize CLI）</strong> の assess → plan<br>Dependabot / Advisory Database（既知脆弱性）<br>CodeQL（セキュリティ所見）`,
            "編集可能・順序付きのタスクと成功条件を持つ計画ファイル",
            "<strong>戦略・順序・リスクは人が選ぶ</strong>。アセスメントは事実であって戦略決定ではない（S29 逐語）",
        ],
        [
            `<strong>Plan → Work</strong><br><span class="muted">Create bounded, independently verifiable tasks</span>`,
            "S31",
            "GitHub Issues（＝ Delegation Contract の器）<br>Issue テンプレート／ラベル",
            "1 つの観測可能な成果・明示的依存・境界・検証手段・ロールバック手順を持つ Issue 群",
            "Issue の粒度承認（＝スプリント計画）",
        ],
        [
            `<strong>Work → PR</strong><br><span class="muted">Implement, check, report, and request human review</span>`,
            "S32 / S33 / S35",
            `<strong>GitHub Copilot cloud agent</strong><br>GitHub Actions / CodeQL / secret scanning<br>Copilot code review`,
            `<code>copilot/…</code> ブランチ、draft PR、Verified 署名コミット、session log`,
            "required reviews / CODEOWNERS / environments。<strong>エージェントは承認もマージもできない</strong>",
        ],
        [
            `<strong>PR → Learning</strong><br><span class="muted">Improve instructions, tests, plans, and future work</span>`,
            "S40",
            `既存のテレメトリ・インシデント・サポート基盤<br>${PP} Copilot Memory<br>custom instructions / custom agents の更新`,
            `更新された <code>AGENTS.md</code> / <code>*.instructions.md</code>、強化されたテスト、runbook、次の Delegation Contract`,
            "どのシグナルが優先度・統制・ロールアウトを変えるかをオーナーが決める",
        ],
    ],
    { widths: ["16%", "9%", "23%", "27%", "25%"] },
)}

${callout(
    "warn",
    "PR → Learning に対応する Copilot 製品は存在しない",
    `<p>スライド S40 のスピーカーノート自身がこう宣言しています —— <em>"Official research found no dedicated Copilot capability for autonomous post-deployment monitoring or incident correlation."</em>、<code>SOURCE: Derived (operating-model synthesis; not a dedicated Copilot monitoring feature)</code>。<br>
    この段は<strong>既存の可観測性基盤 ＋ 人間の運用プロセス</strong>で実装するしかありません。Copilot 側で唯一この方向にあるのが ${PP} <strong>Copilot Memory</strong>（リポジトリ事実の永続化・28 日で失効）ですが、これは運用シグナルの取り込み機構ではありません。提案時に「ここは製品機能ではなく運用設計」と明示することが誠実です。</p>`,
)}

<h3>Agents UI の research / plan / iterate 段階</h3>
<p>S32 は 5 ステップの流れ（承認された Issue → エージェントの調査 → 提案された計画 → 人による確認・軌道修正 → ブランチ作業 → チェック実行 → draft PR）を示します。これは <strong>Agents UI 経由の場合の実際の挙動</strong>に対応します。</p>
${callout(
    "note",
    "投入経路によって挙動が違う",
    `<p>Agents UI から起動した場合、cloud agent は PR を作る前に調査・計画・反復ができます。<strong>それ以外の多くの投入経路（Issue アサイン、<code>@copilot</code> など）では、すぐに PR を開きます。</strong><br>S32 の「Human confirms or redirects scope, approach, and assumptions」というステップ 2 を実際に成立させたいなら、<strong>Agents UI から投入する</strong>必要があります。この差は運用設計に直結します。</p>`,
)}
`,
    },
];
