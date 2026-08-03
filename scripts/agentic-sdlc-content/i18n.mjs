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

    // ── proper nouns kept in English verbatim (never translate) ──
    { ja: "Delegation Contract", en: null, note: "翻訳せず維持。日本語版でも英語のまま" },
    { ja: "Autonomy Budget", en: null, note: "翻訳せず維持" },
    { ja: "Agentic Modernization Loop", en: null, note: "翻訳せず維持" },
    { ja: "Evidence Package", en: null, note: "翻訳せず維持" },
    { ja: "Context Engineering", en: null, note: "翻訳せず維持" },
    { ja: "Five layers", en: null, note: "翻訳せず維持。Intent / Context / Agent / Execution / Governance" },
    { ja: "Definition of Ready", en: null, note: "翻訳せず維持" },
    { ja: "Agentic SDLC", en: null, note: "翻訳せず維持" },

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
