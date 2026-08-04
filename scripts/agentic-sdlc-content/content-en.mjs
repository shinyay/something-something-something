// English edition of the guide.
//
// Every section keeps the id, num, and reading order of the Japanese edition.
// Translated sections come from ./content-en-*.mjs and overwrite the Japanese
// section wholesale; sections that are not translated yet pass through with
// `untranslated: true` so the renderer can mark them up as Japanese content.
//
// To translate another batch: add ./content-en-<letter>.mjs exporting an array
// of sections and register it in TRANSLATED below. Nothing else changes.
import { parts as jaParts, sections as jaSections } from "./content.mjs";
import { sectionsEnA } from "./content-en-a.mjs";
import { sectionsEnB } from "./content-en-b.mjs";
import { sectionsEnC } from "./content-en-c.mjs";

export const meta = {
    title: "Agentic SDLC Practical Guide",
    subtitle:
        "Designing, delegating, and governing bounded, verifiable work with GitHub Copilot",
    tagline: "A GitHub Copilot technical deep dive",
    verified: "Verified against primary sources as of August 2026",
};

const TRANSLATED = [...sectionsEnA, ...sectionsEnB, ...sectionsEnC];

const byId = new Map(TRANSLATED.map((section) => [section.id, section]));
if (byId.size !== TRANSLATED.length) {
    throw new Error("English section ids must be unique");
}
{
    const jaIds = new Set(jaSections.map((section) => section.id));
    for (const id of byId.keys()) {
        if (!jaIds.has(id)) {
            throw new Error(`English translation references unknown section id: ${id}`);
        }
    }
}

export const sections = jaSections.map((section) => {
    const translated = byId.get(section.id);
    return translated
        ? { ...section, ...translated, untranslated: false }
        : { ...section, untranslated: true };
});

// Part ids are inherited verbatim from the Japanese edition so the two tables of
// contents can never drift apart; only the titles are translated.
const PART_TITLES_EN = [
    "PART 1 — Starting point",
    "PART 2 — Designing work you can delegate",
    "PART 3 — Executing",
    "PART 4 — Trusting the result",
    "PART 5 — Operating",
    "PART 6 — Reference",
];

if (PART_TITLES_EN.length !== jaParts.length) {
    throw new Error(
        `English part titles list ${PART_TITLES_EN.length} entries but there are ${jaParts.length} parts`,
    );
}

export const parts = jaParts.map((part, index) => ({
    ...part,
    title: PART_TITLES_EN[index],
}));
