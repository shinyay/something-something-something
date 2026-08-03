// English translation of PART 1: section 00 (overview).
// Terminology is bound by TERMS in ./i18n.mjs — do not diverge from it.
//
// Translation discipline enforced here:
//   * docQuote quotations are English originals and are never altered.
//   * principle() blockquotes are already English; the Japanese gloss (2nd arg)
//     is dropped because it is redundant for an English reader.
//   * <code> contents, URLs, file names, and setting values stay untranslated.
//   * Cross-references (§02, §17, …) point at the same section numbers.
import { badge, table, callout, principle, ul } from "./ui.mjs";

const OFFICIAL = badge("official", "Official");
const FRAMEWORK = badge("framework", "This guide's framing");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");
const UNLABELED = badge("na", "Status not stated");

export const sectionsEnA = [
    // ────────────────────────────────────────────────────────────── 00
    {
        id: "overview",
        num: "00",
        eyebrow: "Introduction",
        title: "What the Agentic SDLC Is",
        lead: "The point of the Agentic SDLC is not to generate more code. It is a change of operating model: work is redesigned into bounded, verifiable units that agents execute and humans govern. This guide covers that idea end to end, together with the specific GitHub features, files, settings, and governance boundaries that make it hold up in practice.",
        html: `
${principle(
    "GitHub Copilot's next value is not generating more code; it is enabling teams to redesign modernization as bounded, verifiable work that agents execute and humans govern.",
)}

<p>That claim is not about <em>what</em> you build. It is about how the work is divided and who is accountable for each part. So this guide first defines a <em>design vocabulary</em> — <strong>Delegation Contract</strong>, <strong>Autonomy Budget</strong>, <strong>Agentic Modernization Loop</strong> — and then maps each term one-to-one onto the concrete GitHub features, files, and settings that make it real. It does not stop at abstractions: it goes all the way down to which file you write what in for an agent to actually act on it.</p>

<h3>A concrete opening scenario</h3>
<p>It is Monday morning and three pull requests are waiting for your review in your repository. An agent opened all three over the weekend — the first fixes a CVE in a dependency, the second adds characterization tests around a legacy authentication module, the third performs a bulk replacement of a deprecated API. All three sit on <code>copilot/…</code> branches, the build and CodeQL have already finished, and their results are attached to the PRs. Your job is not to write code. It is to <strong>check the judgement behind each diff and decide whether to accept it</strong>.<br>
A great deal of design has to be in place before that Monday morning is possible — the surface an agent is allowed to touch, the verification that must pass before anything can merge, the boundaries that trigger a mandatory review the moment they are crossed. This guide builds up those preconditions in order.</p>

<h3>Division of labour between humans and agents</h3>
${table(
    ["Phase", "Human (governance)", "Agent (execution)"],
    [
        ["Intent and priority", "Decide what to do and why", "—"],
        [
            "Context",
            "Design, own, review, and maintain the information (§02)",
            "Reliably find and use the information provided",
        ],
        [
            "Plan, strategy, sequencing",
            "Choose the strategy, the order, and the risk to accept",
            "Propose options, rationale, and a migration plan (§05)",
        ],
        [
            "Implementation",
            "Grant the boundaries and the budget (§03, §04)",
            "Implement changes inside those boundaries and return evidence",
        ],
        [
            "Verification",
            "Define the acceptance criteria and make the final call",
            "Run the deterministic checks and attach the results (§08)",
        ],
        [
            "Merge and release",
            "Decide on approval, merge, and release (§09)",
            `<span class="neg">Cannot</span> (an agent cannot approve or merge its own PR)`,
        ],
    ],
    { widths: ["18%", "44%", "38%"] },
)}

<h3>The three kinds of badge (legend)</h3>
${table(
    ["Badge", "Meaning", "How to use it"],
    [
        [
            OFFICIAL,
            "A product or feature name that appears in official GitHub / Microsoft documentation",
            "Safe to use verbatim in a customer proposal",
        ],
        [
            FRAMEWORK,
            "A framing this guide introduces on its own. Not official terminology",
            "Use it only with an explicit &ldquo;in this guide&rsquo;s framing&rdquo; qualifier",
        ],
        [
            `${GA} ${PP} ${UNLABELED}`,
            "Availability as stated in the primary source. &ldquo;Status not stated&rdquo; means the documentation says neither GA nor Preview",
            "Always present Preview features together with their SLA and change risk",
        ],
    ],
    { widths: ["18%", "48%", "34%"] },
)}

${callout(
    "note",
    "This guide keeps its sources straight",
    `<p>The badges above and the glossary in §16 draw an explicit line between what is an <strong>official GitHub product name or specification</strong> and what is <strong>vocabulary this guide introduces to organise the material</strong>. Every technical assertion has been checked against the primary sources collected in §17 &ldquo;Primary-source links&rdquo;. Being able to separate &ldquo;this is product behaviour&rdquo; from &ldquo;this is our framing&rdquo; is what makes a document of this kind trustworthy.</p>`,
)}

<h3>The scope of the SDLC covered here</h3>
<p>If a document calls itself an SDLC guide, it owes the reader an honest statement of where its coverage begins and ends. This guide covers <strong>intent → design → execution → verification → the governance boundary (the merge / release gate)</strong>.</p>
${callout(
    "key",
    "Running the deployment and observing production are out of scope here — they are not Copilot product features",
    `<p><strong>Carrying out the deployment itself</strong>, and <strong>observing production (incident correlation, escaped defects, deployment success rate, time to restore)</strong>, are not areas GitHub Copilot's product features cover. They are handled by <strong>your existing deployment and observability platforms and by human operational process</strong>.<br>
    So wherever this guide does reach past the merge / release gate — PR → Learning in §05, the limits of measurement in §14 — it says plainly that <strong>this part is operational design, not a product feature</strong>. Not overstating the Agentic SDLC as &ldquo;fully automated all the way to deployment&rdquo; is a condition of arguing honestly in an enterprise setting.</p>`,
)}

<h3>How the six frameworks relate</h3>
<p>This guide uses several organising frameworks. To keep them from blurring together, one table maps how they relate. The backbone is <strong>Five layers</strong> (Intent / Context / Agent / Execution / Governance) — an organising layer that reads delegation as five stacked concerns. Each of the remaining frameworks takes a different axis (mode, contract, budget, cycle, maturity) and expands one place on that backbone.</p>
${table(
    ["Framework", "Which axis", "Where it sits on Five layers", "Section"],
    [
        [
            `<strong>Five layers</strong> (Intent / Context / Agent / Execution / Governance)`,
            `${FRAMEWORK} the <strong>organising layer (backbone)</strong> running through the whole guide`,
            "All five layers",
            "§00 (this section)",
        ],
        [
            "<strong>Five interaction modes</strong>",
            `${FRAMEWORK} the <strong>style</strong> of engagement`,
            "Intent → Agent (how much the human hands over)",
            "§01",
        ],
        [
            "<strong>Delegation Contract</strong> (8 fields)",
            `${FRAMEWORK} the <strong>contract</strong> for delegation`,
            "Agent layer (specifies boundaries, evidence, gates)",
            "§03",
        ],
        [
            "<strong>Autonomy Budget</strong> (4 dimensions)",
            `${FRAMEWORK} the <strong>budget</strong> for authority`,
            "Agent layer (Scope / Capability / Compute / Decision)",
            "§04",
        ],
        [
            "<strong>Agentic Modernization Loop</strong> (5 transformations)",
            `${FRAMEWORK} the <strong>cycle</strong> of the work`,
            "Execution layer (Assess → … → Learning)",
            "§05",
        ],
        [
            "<strong>Adoption ladder</strong> (5 rungs)",
            `${FRAMEWORK} organisational <strong>maturity</strong>`,
            "Governance layer (how deeply every layer is operationalised)",
            "§12",
        ],
    ],
    { widths: ["30%", "24%", "34%", "12%"] },
)}
${callout(
    "note",
    "Do not confuse the axes",
    `<p>Interaction modes (§01) are a <strong>style of engagement</strong>; the adoption ladder (§12) is <strong>organisational maturity</strong>. They are different axes. &ldquo;We are using Delegation mode&rdquo; is not the same statement as &ldquo;our organisation has reached the Delegate rung.&rdquo; Keeping §01 and §12 from being conflated is exactly what the table above is for.</p>`,
)}

<h3>How to read this guide</h3>
<p>The guide is organised into six parts. Read it top to bottom and you get one full pass through the Agentic SDLC — design → execute → trust → operate — but every section also stands on its own as a reference.</p>
${ul([
    "<strong>PART 1 Starting point</strong>: this section. The operating model as a whole.",
    "<strong>PART 2 Designing work you can delegate</strong>: interaction modes (§01), context design (§02), the delegation contract (§03), the autonomy budget (§04).",
    "<strong>PART 3 Executing</strong>: the modernization loop (§05), the orchestration practice that makes parallel delegation work (§06), purpose-built tooling (§07).",
    "<strong>PART 4 Trusting the result</strong>: deterministic verification (§08), the PR as a governance boundary (§09), security (§10), drift and recovery (§11).",
    "<strong>PART 5 Operating</strong>: the adoption ladder (§12), cost structure (§13), measurement (§14), work that must not be delegated (§15).",
    "<strong>PART 6 Reference</strong>: glossary (§16), primary-source links (§17), and the appendix mapping table (§18).",
])}

<h3>Questions this guide answers</h3>
${ul([
    "Which products do GitHub Copilot's interaction modes actually correspond to, and when do you choose which (§01)",
    "&ldquo;Context is not a big prompt&rdquo; — in which concrete files do you implement that (§02)",
    "The 8 fields that specify a delegation — where in GitHub do you write them so an agent acts on them (§03)",
    "&ldquo;Autonomy is a budget&rdquo; — which settings actually allocate it (§04)",
    "At each step of the modernization loop, which feature produces what (§05, §07)",
    "In &ldquo;reason probabilistically, verify deterministically&rdquo;, what exactly is the deterministic half (§08)",
    "What structural guarantees make the PR function as a governance boundary (§09)",
    "Which settings establish the security preconditions, and where do the gaps remain (§10)",
    "What are the entry conditions for each rung of the adoption ladder (§12), and how does this operating model incur cost (§13)",
    "Which work must never be delegated in the first place, and how do you avoid the common failure modes (§15)",
])}
`,
    },
];
