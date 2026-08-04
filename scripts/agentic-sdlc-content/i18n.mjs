// Single source of truth for chrome strings and for the ja⇄en terminology contract.
//
// `ui` holds every string the renderer would otherwise hard-code, keyed by language.
// Strings that interpolate a number are functions.
//
// `TERMS` is the binding glossary for future translation batches. When a new
// section is translated, its wording must match this table so terminology does
// not drift between batches.

export const LANGS = ["ja", "en"];

export const ui = {
    ja: {
        htmlLang: "ja",
        langName: "日本語",
        description:
            "GitHub Copilot の技術的観点から Agentic SDLC を解説する自立した実践ガイド。境界のある検証可能な作業を設計・委譲・統治するための 19 節の日本語ディープダイブ。",
        skipLink: "本文へ移動",
        tocSummary: (n) => `目次 — 全 ${n} 節`,
        tocTitle: "目次",
        tocNavLabel: "セクション",
        tocFoot: "Public Preview 表記の機能は仕様変更の可能性があります。",
        heroEyebrow: "実践ガイド · 日本語",
        heroLede: (n) =>
            `GitHub Copilot のエージェント機能を前提に、モダナイゼーションを「境界のある・検証可能な作業」として設計し、エージェントに委譲し、人間が統治するための実践ガイドです。概念の定義から、それを GitHub 上で成立させる具体的な機能・ファイル・設定・ガバナンス境界までを、一次情報に基づいて一気通貫で扱います。全 ${n} 節。`,
        heroMetaSections: (n) => `全 ${n} 節`,
        slideLabel: "関連する登壇資料（PDF・46 ページ）",
        slideNote: "本文を読むのにスライドは不要です",
        footerDisclaimer:
            "本資料は GitHub Copilot に関する非公式の技術資料です。製品の可用性、ポリシー、料金は各節の一次情報リンク（§17）で確認してください。",
        langSwitchLabel: "言語",
        untranslatedNotice: "この節はまだ翻訳されていません。",
    },
    en: {
        htmlLang: "en",
        langName: "English",
        description:
            "A standalone practical guide to the Agentic SDLC from a GitHub Copilot engineering perspective. A 19-section deep dive on designing, delegating, and governing bounded, verifiable work.",
        skipLink: "Skip to content",
        tocSummary: (n) => `Contents — ${n} sections`,
        tocTitle: "Contents",
        tocNavLabel: "Sections",
        tocFoot: "Features marked Public Preview may still change.",
        heroEyebrow: "Practical guide · English",
        heroLede: (n) =>
            `A practical guide to designing modernization as bounded, verifiable work, delegating it to GitHub Copilot's agentic capabilities, and governing it as a human. It runs from the concepts themselves through to the specific GitHub features, files, settings, and governance boundaries that make them real, with every technical claim checked against a primary source. ${n} sections.`,
        heroMetaSections: (n) => `${n} sections`,
        slideLabel: "Companion slide deck (PDF, 46 pages)",
        slideNote: "You do not need the slides to read this guide",
        footerDisclaimer:
            "This is an unofficial technical guide to GitHub Copilot. Confirm product availability, policies, and pricing against the primary sources linked in each section (§17).",
        langSwitchLabel: "Language",
        untranslatedNotice: "Not yet translated — the Japanese text is shown below.",
    },
};

/**
 * Binding ja⇄en glossary. Every translation batch must follow it.
 * `en: null` means the term is a proper noun that stays in English verbatim in
 * both languages and must never be translated.
 */
export const TERMS = [
    // ── provenance badges (§00 legend) ──────────────────────────
    { ja: "公式", en: "Official", note: "バッジ。GitHub / Microsoft 公式ドキュメントに存在する名称" },
    {
        ja: "本資料の整理",
        en: "This guide's framing",
        note: "バッジ。本資料が独自に導入した整理枠組み。文中では \"in this guide's framing\" と展開してよい",
    },
    { ja: "状態表記なし", en: "Status not stated", note: "バッジ。一次情報に GA / Preview の明記がないもの" },
    { ja: "GA", en: "GA", note: "バッジ。両言語で GA のまま" },
    { ja: "Public Preview", en: "Public Preview", note: "バッジ。両言語で Public Preview のまま。訳さない" },

    // ── core operating-model vocabulary ─────────────────────────
    { ja: "委譲", en: "delegation", note: "動詞は delegate。「委譲する」= to delegate" },
    { ja: "統治", en: "governance", note: "動詞は govern。manage / control には置き換えない" },
    {
        ja: "境界のある・検証可能な作業",
        en: "bounded, verifiable work",
        note: "テーゼの中核表現。scoped / testable などに言い換えない",
    },
    { ja: "証跡", en: "evidence", note: "proof / artifact ではなく evidence" },
    { ja: "受け入れ条件", en: "acceptance criteria", note: "単数形 acceptance criterion は使わず常に複数形" },
    { ja: "一次情報", en: "primary source", note: "「一次情報リンク集」= primary-source links (§17)" },
    { ja: "節", en: "section", note: "節番号は §NN 表記を両言語で維持する" },
    { ja: "整理層", en: "organising layer", note: "Five layers を指すときの語" },
    { ja: "相互作用モード", en: "interaction mode", note: "§01。engagement mode とは書かない" },
    { ja: "採用ラダー", en: "adoption ladder", note: "§12。maturity ladder とは書かない" },
    { ja: "逸脱と回復", en: "drift and recovery", note: "§11" },
    { ja: "決定的検証", en: "deterministic verification", note: "§08。「決定的に検証する」= verify deterministically" },
    { ja: "ガバナンス境界", en: "governance boundary", note: "§09。マージ／リリースゲートを指す" },
    { ja: "アンチパターン", en: "anti-pattern", note: "§15" },
    { ja: "用語集", en: "glossary", note: "§16" },
    { ja: "登壇資料との対応表", en: "slide deck mapping", note: "§18" },
    { ja: "コンテキスト設計", en: "context design", note: "§02。Context Engineering は固有語として維持" },
    { ja: "自律性の予算", en: "autonomy budget", note: "固有名としては Autonomy Budget（大文字）を維持" },
    { ja: "委譲契約", en: "delegation contract", note: "固有名としては Delegation Contract（大文字）を維持" },

    // ── enforcement vocabulary (§03 表の第 4 列 ＝ contract 図の凡例) ──
    // 表と図で同じ語を使う。ここがずれると読者が対応づけを失う。
    { ja: "強制力", en: "enforcement", note: "§03 表の列見出し。enforceability とは書かない" },
    {
        ja: "構造的に強制可",
        en: "Structurally enforceable",
        note: "§03 表セル・contract 図の凡例。ruleset や required checks に落とせるもの",
    },
    { ja: "半構造的", en: "Semi-structural", note: "§03 表セル・contract 図の凡例" },
    { ja: "プロンプトのみ", en: "Prompt only", note: "§03 表セル・contract 図の凡例。prompt-only とハイフンでは書かない" },

    // ── autonomy vocabulary (§04。§09・§11・§12 でも反復する) ──
    { ja: "予算", en: "budget", note: "§04。allowance / quota には置き換えない" },
    { ja: "次元", en: "dimension", note: "§04 の 4 次元。axis とは書かない（axis は §00 の枠組み比較で使う語）" },
    { ja: "可逆性", en: "reversibility", note: "「可逆な」= reversible" },
    { ja: "影響範囲", en: "blast radius", note: "§04。日本語版も括弧で blast radius を併記している。scope とは書かない" },
    { ja: "停止条件", en: "stop condition", note: "§04 Decision budget" },
    { ja: "並列度", en: "concurrency", note: "§04・§06。parallelism は「並列」一般を指すときのみ" },
    { ja: "実行資源", en: "compute", note: "§04 の Compute budget。resources とは書かない" },
    { ja: "レビュー容量", en: "review capacity", note: "§01・§12・§13。並列度の実質的上限を指す語" },

    // ── execution-model vocabulary (§01。§05・§06・§13 でも反復する) ──
    { ja: "実行場所", en: "where it runs", note: "§01 の表の列見出し。execution location とは書かない" },
    { ja: "同期性", en: "synchronicity", note: "§01。同期 = synchronous、非同期 = asynchronous" },
    { ja: "非同期・並列", en: "asynchronous, parallel", note: "§01 の Orchestration 行と continuum 図の軸" },
    { ja: "投入経路", en: "entry point", note: "§01。cloud agent にタスクを投入する経路。channel / route とは書かない" },
    {
        ja: "経路",
        en: "entry point / path",
        note: "投入経路を指す裸の「経路」は entry point に揃える（例: Issue アサインの経路）。それ以外の一般的な経路は path。route とは書かない",
    },
    { ja: "課金", en: "billing", note: "§01・§13。charging とは書かない" },
    { ja: "使い捨て環境", en: "ephemeral environment", note: "§01。disposable とは書かない" },
    { ja: "差し戻し", en: "hand back", note: "§03 Escalate。return / reject とは書かない" },
    { ja: "既定", en: "default", note: "「既定で ON」= on by default。preset とは書かない" },
    { ja: "宣言的", en: "declarative", note: "§04 hooks。宣言 ⇄ 強制 = declarative ⇄ enforced の対比を保つ" },

    // ── PART 3 vocabulary (§05 loop, §06 orchestration, §07 modernization) ──
    { ja: "変換", en: "transform", note: "§05 Loop の 5 変換。conversion とは書かない" },
    { ja: "人間のゲート", en: "human gate", note: "§05。human checkpoint とは書かない" },
    { ja: "安全網", en: "safety net", note: "§05・§07。「振る舞いの安全網」= behavioural safety net" },
    {
        ja: "characterization テスト",
        en: "characterization tests",
        note: "§05・§07。米綴りで固定し常に複数形。translate せず characterization のまま",
    },
    {
        ja: "分解規準",
        en: "decomposition criteria",
        note: "§06。単数は decomposition criterion。granularity rules とは書かない",
    },
    { ja: "分解の粒度", en: "granularity of decomposition", note: "§06。語順を固定する" },
    {
        ja: "律速",
        en: "bottleneck",
        note: "§06・§13。「レビューが律速」= review is the bottleneck。rate-limiting とは書かない",
    },
    {
        ja: "衝突面",
        en: "collision surface",
        note: "§06。並列タスクが同じパスに触れる面。conflict surface とは書かない",
    },
    {
        ja: "サブエージェント",
        en: "subagent",
        note: "§06。/fleet のサブエージェント。sub-agent とハイフンでは書かない",
    },
    { ja: "並列ワークスペース", en: "parallel workspaces", note: "§06。GitHub Copilot app の機能名" },
    { ja: "傘の名称", en: "umbrella name", note: "§07。umbrella brand とは書かない" },
    { ja: "移行の波", en: "migration waves", note: "§05・§07。migration phases とは書かない" },
    {
        ja: "決定的ゲート",
        en: "deterministic gate",
        note: "§07・§08・§09。§08 の deterministic verification と整合させる",
    },
    {
        ja: "レガシーの 3 つの形",
        en: "the three forms of legacy",
        note: "§07 FRAMEWORK。Code / Knowledge / Process。公式の製品区分ではない旨を必ず残す",
    },
    { ja: "automations", en: null, note: "§06・§09 の機能名。両言語で小文字のまま維持し訳さない" },
    { ja: "Modernize CLI", en: null, note: "§05・§07 の製品名。両言語で維持し訳さない" },
    { ja: "modernization agent", en: null, note: "§07。GitHub Copilot modernization agent。小文字で維持" },
    { ja: "upgrade agent", en: null, note: "§07。IDE の upgrade agent。小文字で維持" },
    {
        ja: "Assess / Plan / Execute",
        en: null,
        note: "§07 Modernize CLI の 3 段階。両言語で英語のまま。§05 Loop の段と対応づける",
    },
    {
        ja: "Modernization Loop",
        en: null,
        note: "§05。Agentic Modernization Loop の略称としても英語のまま維持",
    },

    // ── proper nouns kept in English verbatim (never translate) ──
    { ja: "Delegation Contract", en: null, note: "翻訳せず維持。日本語版でも英語のまま" },
    { ja: "Autonomy Budget", en: null, note: "翻訳せず維持" },
    { ja: "Agentic Modernization Loop", en: null, note: "翻訳せず維持" },
    { ja: "Evidence Package", en: null, note: "翻訳せず維持" },
    { ja: "Context Engineering", en: null, note: "翻訳せず維持" },
    { ja: "Five layers", en: null, note: "翻訳せず維持。Intent / Context / Agent / Execution / Governance" },
    { ja: "Definition of Ready", en: null, note: "翻訳せず維持" },
    { ja: "Agentic SDLC", en: null, note: "翻訳せず維持" },
    {
        ja: "Completion / Conversation / Collaboration / Delegation / Orchestration",
        en: null,
        note: "§01 の 5 モード名。両言語で英語のまま。Completion を「補完モード」等と訳さない",
    },
    {
        ja: "Persistent context / Task context / Dynamic context",
        en: null,
        note: "§02 の Context 3 分類。両言語で英語のまま",
    },
    { ja: "session log", en: null, note: "§01・§03。cloud agent のセッションログ。小文字のまま維持" },
    {
        ja: "cloud agent",
        en: null,
        note: "正式名は GitHub Copilot cloud agent。小文字で維持し「クラウドエージェント」と訳さない",
    },
    {
        ja: "custom instructions / agent skills / prompt files / custom agents / hooks",
        en: null,
        note: "§02・§04 の公式機能名。小文字表記のまま維持する",
    },

    // ── TOC part titles ─────────────────────────────────────────
    { ja: "PART 1 — 出発点", en: "PART 1 — Starting point", note: "TOC パートタイトル" },
    {
        ja: "PART 2 — 委譲できる形に設計する",
        en: "PART 2 — Designing work you can delegate",
        note: "TOC パートタイトル",
    },
    { ja: "PART 3 — 実行する", en: "PART 3 — Executing", note: "TOC パートタイトル" },
    { ja: "PART 4 — 信頼する", en: "PART 4 — Trusting the result", note: "TOC パートタイトル" },
    { ja: "PART 5 — 運用する", en: "PART 5 — Operating", note: "TOC パートタイトル" },
    { ja: "PART 6 — リファレンス", en: "PART 6 — Reference", note: "TOC パートタイトル" },
];
