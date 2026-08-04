// English translation of PART 6: sections 16 (glossary), 17 (sources),
// 18 (deck-map appendix). This is the final translation batch.
// Terminology is bound by TERMS in ./i18n.mjs — do not diverge from it.
//
// Translation discipline enforced here (same as ./content-en-e.mjs):
//   * §17 link titles are the real titles of the pages they point at. They are
//     already English and are reproduced verbatim, punctuation included. Only
//     the parenthetical glosses the Japanese edition adds after a title are
//     translated. Every href is byte-identical to the Japanese edition.
//   * §16 is the terminology contract itself, so every row is reconciled
//     against TERMS. The provenance badges (Official / This guide's framing /
//     blog terminology) match the Japanese edition claim for claim; nothing is
//     promoted or demoted.
//   * §18 row labels are abbreviations of the section titles, so they reuse the
//     wording of the translated titles in ./content-en-a.mjs … -e.mjs. Section
//     numbers (§NN) and slide-number chips are unchanged.
//   * Every <strong> in the Japanese source is carried to the semantically
//     equivalent English span; en strong count >= ja strong count per section.
//     Japanese 「」 quotations become straight quotes, keeping the emphasis.
//   * Negative assertions ("not published officially", "is not automated") are
//     kept at full strength, never softened.
//   * No diagrams appear in PART 6, so ./diagrams.mjs is untouched.
import { badge, a, table, callout, ul } from "./ui.mjs";

const OFFICIAL = badge("official", "Official");
const FRAMEWORK = badge("framework", "This guide's framing");

// Slide-number chips. Used only in the deck-map appendix (§18).
const chips = (...nums) =>
    `<span class="slides">${nums.map((n) => `<span class="slide-chip">S${n}</span>`).join("")}</span>`;

export const sectionsEnF = [
    // ────────────────────────────────────────────────────────────── 16
    {
        id: "glossary",
        num: "16",
        eyebrow: "Terminology",
        title: "Glossary",
        lead: `This guide mixes GitHub's official product names and specifications with vocabulary it introduces for its own framing. Mistake one for the other and the line between product specification and argument blurs. Here we list the main vocabulary together with its provenance — official, or this guide's framing. Holding that distinction is the foundation of this guide's credibility.`,
        html: `
${table(
    ["Term", "Provenance", "The corresponding official concept or implementation, and notes on sourcing"],
    [
        [
            "<strong>The five interaction modes</strong><br>Completion → Conversation → Collaboration → Delegation → Orchestration",
            FRAMEWORK,
            `GitHub uses two categories, "Assistive features" and "Agentic features". This five-stage model is not published officially (§01)`,
        ],
        [
            "<strong>Delegation Contract</strong> (eight fields)",
            FRAMEWORK,
            "No corresponding official feature name. You implement it as a combination of the Issue body + instructions + ruleset + required checks (§03)",
        ],
        [
            "<strong>Autonomy budget</strong> (Scope / Capability / Compute / Decision)",
            FRAMEWORK,
            "Maps onto individual controls such as the firewall, permissions, MCP settings, and required approvals (§04)",
        ],
        [
            "<strong>Five layers</strong> (Intent / Context / Agent / Execution / Governance)",
            FRAMEWORK,
            "Not an official architectural description. It is the backbone this guide introduces in §00 as the organising layer that runs through the whole document (each layer has a framework in this guide that corresponds to it)",
        ],
        [
            "<strong>Agentic Modernization Loop</strong> (five transforms)",
            FRAMEWORK,
            `Partially corresponds to Modernize CLI's Assess → Plan → Execute (§07)`,
        ],
        [
            "<strong>Evidence Package</strong> (Code + Evidence + Uncertainty)",
            FRAMEWORK,
            "The raw material is the session log + check results + Verified signed commits. <strong>Mapping them onto the acceptance criteria is not automated</strong>. Introduced in the body in §09",
        ],
        [
            "<strong>Adoption ladder</strong> (Assist → … → Orchestrate)",
            FRAMEWORK,
            "No corresponding official concept. A different axis from the interaction modes of §01 (organizational maturity)",
        ],
        [
            "<strong>Three forms of legacy</strong> (Code / Knowledge / Process)",
            FRAMEWORK,
            "No corresponding official concept. Introduced in the body in §07 as the three forms of legacy",
        ],
        [
            "<strong>Copilot cloud agent</strong>",
            OFFICIAL,
            "The formal name in the current documentation. Formerly <strong>Copilot coding agent</strong> (GA announced 2025-09)",
        ],
        [
            "<strong>Agent HQ</strong>",
            badge("na", "Blog terminology"),
            "An umbrella name from the GitHub Blog. The actual UI is the <strong>Agents tab / agents panel / agents page</strong>. <strong>mission control</strong> is the conceptual name for the command centre",
        ],
    ],
    { widths: ["26%", "14%", "60%"] },
)}

${callout(
    "key",
    "Making this distinction explicit is this guide's greatest credibility asset",
    `<p>This guide consistently separates its technical assertions into <strong>"this is product specification"</strong> and <strong>"this is our own framing"</strong>. In particular, <strong>Delegation Contract</strong> and <strong>Autonomy budget</strong> are the latter (this guide's framing), while <strong>"an agent cannot approve its own PR"</strong> is the former (product specification).<br>
    In technical material about AI these two blur easily, and the moment they blur the reader can no longer tell whether something is a specification that actually works or the author's wish. The badges and this section make that boundary visible.</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 17
    {
        id: "sources",
        num: "17",
        eyebrow: "Sources",
        title: "Primary-source links",
        lead: `Every claim in this guide rests on the primary sources below. Specifications change, so we recommend re-checking the relevant page before you put any of this in front of a customer.`,
        html: `
<h3>GitHub Copilot — agents</h3>
${ul([
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent", "About Copilot cloud agent"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations", "Risks and mitigations for Copilot cloud agent") + `<span class="src-note">Source for "cannot approve or merge its own PR", "restricted to <code>copilot/</code> branches", "workflows do not run automatically by default", and the limits of the firewall</span>`,
    a("https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/start-copilot-sessions", "Starting Copilot sessions (entry points)"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/manage-and-track-agents", "Manage and track agents (session log, sharing defaults)"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment", "Customize the agent environment (copilot-setup-steps.yml, 59-minute limit)"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-the-firewall", "Customize the firewall"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/configure-secrets-and-variables", "Configure secrets and variables (Agents secrets, COPILOT_MCP_)"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents", "About custom agents"),
    a("https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents", "About third-party coding agents"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli", "About GitHub Copilot CLI"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet", "Fleet for Copilot CLI (running subagents in parallel)") + `<span class="src-note">Source for §06's <code>/fleet</code> — "independent context windows", "no benefit when the work is inherently sequential", and the increase in AI Credits</span>`,
    a("https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/speed-up-task-completion", "Speed up task completion (/fleet in practice)"),
    a("https://docs.github.com/en/copilot/concepts/agents/github-copilot-app", "About the GitHub Copilot app") + `<span class="src-note">Source for §01 and §06 — "parallel workspaces = worktree + branch", the three session modes, and "built on the CLI"</span>`,
    a("https://docs.github.com/en/copilot/concepts/about-cloud-and-local-sandboxes", "About cloud and local sandboxes (cloud sandboxes, Public Preview)"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations", "About Copilot automations") + `<span class="src-note">Source for §06, §09, and §10 — "private/internal only", "scoped to a single repository", "outside Git", and "events from users without write access are ignored by default"</span>`,
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automation-rationale-and-approvals", "About rationale, confidence, and approvals for issues"),
    a("https://docs.github.com/en/copilot/concepts/agents/hooks", "About hooks for GitHub Copilot") + `<span class="src-note">Source for §04's <code>preToolUse</code> — "can approve or deny a tool call" — the eight hook types, and the configuration format</span>`,
    a("https://docs.github.com/en/copilot/reference/hooks-reference", "GitHub Copilot hooks reference"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/research-plan-iterate", "Research, plan, and iterate") + `<span class="src-note">Source for §01's "Sessions do not create pull requests automatically"</span>`,
    a("https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent", "Troubleshoot cloud agent (§11 stopping and timeouts)"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/roll-back-changes", "Roll back changes (§11 /undo and /rewind)"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-cli/chronicle", "Chronicle (session history)"),
    a("https://docs.github.com/en/copilot/concepts/agents/copilot-memory", "Copilot Memory"),
])}

<h3>GitHub Copilot — context and customization</h3>
${ul([
    a("https://docs.github.com/en/copilot/concepts/prompting/response-customization", "Response customization (precedence of instructions)"),
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions", "Add repository instructions (applyTo, excludeAgent)"),
    a("https://docs.github.com/en/copilot/reference/custom-instructions-support", "Custom instructions support (support matrix by client)"),
    a("https://docs.github.com/en/copilot/concepts/context/spaces", "Copilot Spaces"),
    a("https://docs.github.com/en/copilot/concepts/context/mcp", "MCP concepts"),
    a("https://docs.github.com/en/copilot/concepts/agents/about-agent-skills", "About agent skills") + `<span class="src-note">Source for §02's Persistent context (<code>.github/skills</code>). automations inherit them too (§06)</span>`,
    a("https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills", "Adding agent skills for GitHub Copilot"),
    a("https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent", "MCP and cloud agent"),
    a("https://docs.github.com/en/copilot/concepts/mcp-management", "MCP management (organization policy)"),
    a("https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file", "Prompt files"),
])}

<h3>GitHub Copilot — governance and security</h3>
${ul([
    a("https://docs.github.com/en/copilot/reference/supported-surfaces-for-policies", "Supported surfaces for policies") + `<span class="src-note">Source for §10's content exclusion support matrix. <strong>The evidence that corrects the misconception that "it does not apply to the cloud agent"</strong></span>`,
    a("https://docs.github.com/en/copilot/concepts/context/content-exclusion", "Content exclusion (why it does not apply in Agent mode)"),
    a("https://docs.github.com/en/copilot/concepts/policies", "Copilot policies / AI Controls"),
    a("https://docs.github.com/en/copilot/concepts/agents/enterprise-management", "Enterprise management for agents"),
    a("https://docs.github.com/en/copilot/reference/agentic-audit-log-events", "Agentic audit log events (actor:Copilot, 180 days)"),
    a("https://docs.github.com/en/copilot/concepts/agents/code-review", "Copilot code review"),
    a("https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review", "Using Copilot code review (always a Comment review)"),
])}

<h3>The GitHub platform (governance mechanisms that are not Copilot-specific)</h3>
${ul([
    a("https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches", "About protected branches"),
    a("https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets", "About rulesets (on conflict, the most restrictive setting applies)"),
    a("https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets", "Available rules for rulesets") + `<span class="src-note">Source for §08's merge gates — "code scanning / code quality / restrict code coverage (Public Preview) / require deployments to succeed"</span>`,
    a("https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/set-merge-protection", "Set code scanning merge protection"),
    a("https://docs.github.com/en/code-security/how-tos/maintain-quality-code/restrict-code-coverage", "Setting code coverage thresholds for pull requests (Public Preview)"),
    a("https://github.blog/changelog/2026-07-20-github-code-quality-is-now-generally-available/", "GitHub Code Quality GA (2026-07-20)"),
    a("https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners", "About CODEOWNERS"),
    a("https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments", "Manage environments (deployment protection rules)"),
])}

<h3>Modernization</h3>
${ul([
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/overview", "GitHub Copilot app modernization — Overview"),
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/modernization-agent/overview", "Modernization agent — Overview (Assess → Plan → Execute)"),
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/modernization-agent/quickstart", "Modernize CLI — Quickstart"),
    a("https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/quickstart-unit-tests", "Quickstart: unit tests"),
    a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "Modernizing legacy code with GitHub Copilot (COBOL → Node.js)"),
])}

<h3>GitHub Copilot — measurement (usage metrics)</h3>
${ul([
    a("https://docs.github.com/en/copilot/concepts/copilot-usage-metrics/copilot-metrics", "GitHub Copilot usage metrics") + `<span class="src-note">Source for §14 — the four dashboards, the enterprise/org/repository/user hierarchy, PR throughput and time to merge, the dependence on IDE telemetry, the exclusion of Chat and Mobile, and license information living behind a separate API</span>`,
    a("https://docs.github.com/en/rest/copilot/copilot-usage-metrics", "REST API endpoints for Copilot usage metrics"),
    a("https://docs.github.com/en/copilot/how-tos/administer-copilot/view-impact-dashboard", "View the Copilot impact dashboard (connecting adoption cohorts to PR output)"),
    a("https://github.blog/changelog/2026-07-17-repository-level-github-copilot-usage-metrics-generally-available/", "Repository-level Copilot usage metrics GA (2026-07-17)"),
    a("https://docs.github.com/en/rest/copilot/copilot-user-management", "REST API endpoints for Copilot user management (source of truth for licenses and seats)"),
])}

<h3>Billing</h3>
${ul([
    a("https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing", "Models and pricing (how AI Credits are calculated)"),
    a("https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals", "Usage-based billing for individuals"),
    a("https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises", "Usage-based billing for organizations and enterprises"),
    a("https://docs.github.com/en/copilot/get-started/plans", "Copilot plans"),
])}

<h3>Code scanning and Autofix</h3>
${ul([
    a("https://docs.github.com/en/code-security/concepts/code-scanning/autofix-for-code-scanning", "Autofix for code scanning"),
    a("https://github.blog/changelog/2026-07-10-agentic-autofix-for-code-scanning-alerts-in-public-preview/", "Agentic autofix in public preview (2026-07-10)"),
])}

${callout(
    "note",
    "Verification date",
    `<p>The contents of this guide were verified against primary sources as of <strong>August 2026</strong>. GitHub Copilot's feature names, availability, and billing model change frequently. These three move fastest, so we strongly recommend re-checking them immediately before you make a proposal:<br>
    ① <strong>Public Preview features graduating to GA</strong> (custom agents, prompt files, Modernize CLI's assess/plan, agentic autofix, third-party agents)<br>
    ② <strong>Product names</strong> (whether it is called cloud agent or coding agent, and the UI names around Agent HQ)<br>
    ③ <strong>Billing rates</strong> (the AI Credits allowance per plan, and the transition promotion that ends on 2026-09-01)</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 18
    {
        id: "deck-map",
        num: "18",
        eyebrow: "Appendix",
        title: "Mapping to the slide deck",
        lead: `This guide takes the same operating model as the presentation "Starting Agentic SDLC with GitHub Copilot" (46 slides) and rebuilds it as a technical document you can read without the slides. Below is a mapping from each section of this guide to the slide numbers it corresponds to. It is there for reference if you are using the deck alongside this guide; you do not need the slides to read the text.`,
        html: `
${table(
    ["Section of this guide", "Corresponding slides"],
    [
        [`<strong>§00</strong> What the Agentic SDLC is`, chips(1, 2, 8, 18, 45, 46)],
        [`<strong>§01</strong> The five interaction modes`, chips(12, 13, 14, 15, 16, 17)],
        [`<strong>§02</strong> Context Engineering`, chips(20, 21)],
        [`<strong>§03</strong> Delegation Contract`, chips(22, 34, 44)],
        [`<strong>§04</strong> Autonomy Budget`, chips(23)],
        [`<strong>§05</strong> Agentic Modernization Loop`, chips(25, 27, 28, 29, 30, 31, 32, 33, 40)],
        [`<strong>§06</strong> Orchestration in practice`, `<span class="muted">Added in this guide (no corresponding slide)</span>`],
        [`<strong>§07</strong> Modernization-specific tooling`, chips(28, 29, 30)],
        [`<strong>§08</strong> Probabilistic reasoning, deterministic verification`, chips(24, 28, 35)],
        [`<strong>§09</strong> The PR as a governance boundary`, chips(32, 33, 35, 36, 37)],
        [`<strong>§10</strong> Security`, chips(38)],
        [`<strong>§11</strong> Drift and recovery`, `<span class="muted">Added in this guide (no corresponding slide)</span>`],
        [`<strong>§12</strong> The adoption ladder`, chips(42, 43, 44)],
        [`<strong>§13</strong> Cost structure`, `<span class="muted">The deck does not discuss billing (a point this guide fills in)</span>`],
        [`<strong>§14</strong> Measurement`, `<span class="muted">Added in this guide (no corresponding slide)</span>`],
        [`<strong>§15</strong> Work you must not delegate`, `<span class="muted">A practical topic added anew in this guide</span>`],
        [`<strong>§16</strong> Glossary`, chips(8, 12, 13, 20, 22, 23, 25, 35, 43)],
        [`<strong>§17</strong> Primary-source links`, `<span class="muted">Primary sources only (independent of the deck)</span>`],
        [`<strong>§18</strong> This appendix`, `<span class="muted">—</span>`],
    ],
    { widths: ["55%", "45%"] },
)}

${callout(
    "note",
    "The slides are an aid, not a prerequisite",
    `<p>This guide is written so that §00–§18 on their own carry you through the Agentic SDLC from a GitHub Copilot technical standpoint. The mapping above, and the downloadable PDF, are only a bridge for anyone who wants to use this guide and the deck together at the event itself. <strong>Not having the slides leaves nothing missing from your understanding of the text.</strong></p>`,
)}
`,
    },
];
