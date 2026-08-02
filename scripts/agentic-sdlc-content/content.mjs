import { sectionsA } from "./content-a.mjs";
import { sectionsB } from "./content-b.mjs";
import { sectionsC } from "./content-c.mjs";
import { sectionsD } from "./content-d.mjs";
import { sectionsE } from "./content-e.mjs";

export const meta = {
    title: "Agentic SDLC 実践ガイド",
    subtitle: "GitHub Copilot で『境界のある・検証可能な作業』を設計し、委譲し、統治する",
    tagline: "GitHub Copilot 技術ディープダイブ",
    verified: "2026 年 8 月時点の一次情報に基づき検証",
};

export const sections = [...sectionsA, ...sectionsB, ...sectionsC, ...sectionsD, ...sectionsE];

// TOC part grouping. Every section id must appear exactly once, in reading order.
export const parts = [
    { title: "PART 1 — 出発点", ids: ["overview"] },
    { title: "PART 2 — 委譲できる形に設計する", ids: ["continuum", "context", "contract", "autonomy"] },
    { title: "PART 3 — 実行する", ids: ["loop", "modernization"] },
    { title: "PART 4 — 信頼する", ids: ["verification", "pr", "security"] },
    { title: "PART 5 — 運用する", ids: ["ladder", "billing", "antipatterns"] },
    { title: "PART 6 — リファレンス", ids: ["glossary", "sources", "deck-map"] },
];
