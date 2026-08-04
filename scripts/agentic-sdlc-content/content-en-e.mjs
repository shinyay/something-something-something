// English translation of PART 5: sections 12 (ladder), 13 (billing),
// 14 (measurement), 15 (antipatterns).
// Terminology is bound by TERMS in ./i18n.mjs — do not diverge from it.
//
// Translation discipline enforced here (same as ./content-en-d.mjs):
//   * docQuote quotations are English originals and are never altered.
//   * principle() blockquotes are already English; the Japanese gloss (2nd arg)
//     is dropped because it is redundant for an English reader.
//   * <code> contents, URLs, file names, and setting values stay untranslated.
//   * Cross-references (§12, §13, …) point at the same section numbers, and the
//     provenance split — GitHub product specification vs. this guide's own
//     framing — is preserved claim for claim. Negative assertions ("not
//     included", "not causal") are kept at full strength, never softened.
//   * Every <strong> in the Japanese source is carried to the semantically
//     equivalent English span; en strong count >= ja strong count per section.
//   * The ladder diagram is the shared one from ./diagrams.mjs, called with "en"
//     so that only its labels, <title>, and <desc> change; the geometry is
//     shared and the Japanese output stays byte-for-byte identical.
import { badge, table, callout, principle, docQuote, cards, steps, ul, diagram } from "./ui.mjs";
import { ladderDiagram } from "./diagrams.mjs";

const FRAMEWORK = badge("framework", "This guide's framing");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsEnE = [
    // ────────────────────────────────────────────────────────────── 12
    {
        id: "ladder",
        num: "12",
        eyebrow: "Adoption",
        title: "The adoption ladder and each step's Definition of Ready",
        lead: `The Assist → Collaborate → Delegate → Standardize → Orchestrate adoption ladder is a different axis from the interaction modes of §01 — this one represents organizational maturity, while §01 represents the style of the dialogue. Here we lay out a concrete checklist of repository assets (a Definition of Ready) for deciding that you may climb to the next step.`,
        html: `
${principle(
    "Increase delegation only after repository context and verification mature enough to support the next level safely.<br>Context and verification mature first; autonomy and orchestration follow.",
)}

${diagram(
    ladderDiagram("en"),
    "Five steps — Assist → Collaborate → Delegate → Standardize → Orchestrate — climb from bottom-left to top-right. Higher steps widen the scope of delegation, but what gates the climb is not the agent's capability; it is the maturity of the repository's own context and verification. The Definition of Ready for each step is in the table that follows.",
)}

${table(
    ["Step", "Definition", "What must be in place before you climb to this step (Definition of Ready)"],
    [
        [
            `<strong>1. Assist</strong>`,
            "A human owns every step and uses Copilot for bounded suggestions",
            ul([
                "Copilot licenses assigned",
                "Initial organization policy (AI Controls): which clients and which models are allowed",
                "content exclusion configured if needed (Business / Enterprise)",
            ]),
        ],
        [
            `<strong>2. Collaborate</strong>`,
            "A human and the agent share research, planning, implementation, and verification",
            ul([
                `<strong><code>.github/copilot-instructions.md</code> exists and is actually followed</strong>`,
                "Build and test reproduce with a single command",
                "A usage policy for IDE Agent mode / Copilot CLI is decided",
                `<span class="warn-inline">Caution: content exclusion does not apply in the IDE's Agent mode</span>`,
            ]),
        ],
        [
            `<strong>3. Delegate</strong>`,
            "The agent executes a bounded contract and returns a PR you can act on",
            ul([
                "<strong>required status checks are defined and actually block merges</strong>",
                "CODEOWNERS is configured, with required reviewers on critical areas",
                `<code>copilot-setup-steps.yml</code> makes dependency resolution reproducible`,
                "The firewall allowlist is limited to approved registries",
                "<strong>An Issue template with the 8 fields of the Delegation Contract</strong>",
                "characterization tests exist for the area being delegated",
            ]),
        ],
        [
            `<strong>4. Standardize</strong>`,
            "The team reuses instructions, skills, workflows, evidence formats, and gates",
            ul([
                `A system of <code>AGENTS.md</code> plus path-scoped <code>*.instructions.md</code> is in place`,
                `${PP} custom agents via <code>.github/agents/*.md</code> (a typed delegation target per role)`,
                "A PR body template (including an acceptance-criteria mapping field and an Uncertainty field)",
                "Organization-level instructions (Business / Enterprise)",
                "Separation of merge / release / production via environments and deployment protection rules",
            ]),
        ],
        [
            `<strong>5. Orchestrate</strong>`,
            "Run multiple bounded units of work across a portfolio, within governance and review capacity",
            ul([
                "Rules for operating multiple tasks in the Agents panel",
                "<strong>A measured value for review capacity</strong> (= the practical ceiling on concurrency)",
                `A routine of periodically reviewing the audit log <code>actor:Copilot</code>`,
                "budgets set and monitored for AI Credits / Actions minutes",
                `A policy that accounts for the fact that <span class="warn-inline">content exclusion does not apply</span> when using third-party agents`,
            ]),
        ],
    ],
    { widths: ["12%", "26%", "62%"] },
)}

${callout(
    "key",
    "The foundation is context and verification — what grows as you climb is repository-side assets",
    `<p>At the foundation of the adoption ladder is <em>context &amp; verification</em>. The table above shows that what grows as you climb is <strong>not the agent's capability but repository-side assets</strong>. Almost everything the Delegate step needs is "what is placed in the repository", not Copilot settings.<br>In other words, most of the real work in an adoption project is <strong>getting the repository in shape, not adopting Copilot</strong>. This is an insight that feeds directly into the effort estimate for a proposal.</p>`,
)}

<h3>The minimum set to carry your first task all the way to delegation</h3>
<p>Pick one reversible, important modernization task and write its Delegation Contract — the minimum you actually need to reach delegation from there is just these four:</p>
${steps([
    { title: "① characterization tests for the target area", body: "Pin down the behaviour before the change. Without this, \"verification\" spins in place (§08)." },
    { title: "② required status checks", body: "So that those tests and the build must pass before anything can merge." },
    { title: "③ an Issue with all 8 fields filled in", body: "Outcome+Why / Scope+Out / Context / Tools+Constraints / Acceptance / Verification+Evidence / Escalate / Human gates (§03)." },
    { title: "④ CODEOWNERS", body: "Turn the \"areas you don't want touched\" from the contract's Escalate field into something that actually fires a required review." },
])}
`,
    },

    // ────────────────────────────────────────────────────────────── 13
    {
        id: "billing",
        num: "13",
        eyebrow: "Cost",
        title: "The cost structure of this operating model",
        lead: `To discuss the Compute budget (§04) in practice, understanding the billing model is essential. Note too that the billing model changed in June 2026. Here we lay out the two streams: AI Credits and Actions minutes.`,
        html: `
${callout(
    "warn",
    "premium requests are no longer the default billing model",
    `${docQuote(
        "Model multipliers are a concept specific to the legacy premium request-based billing system, and do not apply to GitHub's new usage-based billing model.",
        "https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/model-multipliers-for-annual-plans",
        "docs.github.com — Model multipliers for annual plans (legacy)",
    )}
  <p>premium requests and model multipliers apply only to <strong>existing annual Copilot Pro / Pro+ subscribers who stayed on legacy billing after 1 June 2026</strong>. For any new explanation, use <strong>GitHub AI Credits</strong>.</p>`,
)}

<h3>The current model: GitHub AI Credits</h3>
${cards(
    [
        { title: "Unit", body: `<p class="big">1 AI Credit = <strong>$0.01 USD</strong></p>` },
        { title: "How it's calculated", body: `<p><strong>Token consumption</strong> for input, output, and cache × the published per-model price. <span class="neg">Not a request-multiplier model</span></p>` },
        { title: "Automatic model selection discount", body: `<p>Paid users get a <strong>10% cost discount</strong> in Chat, CLI, the Copilot app, and the cloud agent</p>` },
    ],
    { cols: 3 },
)}

${table(
    ["Feature", "AI Credits", "GitHub Actions minutes", "Notes"],
    [
        ["code completions / next edit suggestions", `<span class="pos">Does not consume</span>`, `<span class="pos">Does not consume</span>`, "The existing completion-count model continues"],
        ["Copilot Chat", `<span class="neg">Consumes</span>`, "—", ""],
        ["Agent mode (IDE)", `<span class="neg">Consumes</span>`, "—", "Consumes per prompt"],
        ["Copilot CLI", `<span class="neg">Consumes</span>`, "—", ""],
        ["<strong>Copilot cloud agent</strong>", `<span class="neg">Consumes</span>`, `<span class="neg">Consumes</span>`, "<strong>Two kinds of cost are incurred at once</strong>"],
        ["Copilot code review", `<span class="neg">Consumes</span>`, `<span class="neg">Consumes</span>`, "For agentic context / tool execution"],
        ["agentic autofix", `<span class="neg">Consumes</span>`, `<span class="neg">Consumes</span>`, `${PP} (from 2026-07-10)`],
        ["Copilot Autofix (legacy)", `<span class="pos">Does not consume</span>`, `<span class="pos">Does not consume</span>`, "No Copilot subscription required"],
        ["third-party coding agents", `<span class="neg">Consumes</span>`, `<span class="neg">Consumes</span>`, `${PP} Anthropic Claude / OpenAI Codex`],
        ["Copilot Spaces", `<span class="neg">Consumes</span>`, "—", "Questions are counted as Chat interactions"],
    ],
    { widths: ["28%", "16%", "18%", "38%"] },
)}

<h3>Monthly AI Credits by plan</h3>
${table(
    ["Plan", "Price", "Included AI Credits", "cloud agent"],
    [
        ["Free", "Free", "An allowance via automatic model selection + 2,000 completions/month", `<span class="neg">Not included</span>`],
        ["Student", "Free", "An allowance via automatic model selection + unlimited completions", `<span class="pos">Included</span>`],
        ["Pro", "$10/month", "1,500 (base 1,000 + flex 500)", `<span class="pos">On by default</span>`],
        ["Pro+", "$39/month", "7,000 (base 3,900 + flex 3,100)", `<span class="pos">On by default</span>`],
        ["Max", "$100/month", "20,000 (base 10,000 + flex 10,000)", `<span class="pos">On by default</span>`],
        ["Business", "$19/assigned seat/month", "1,900/user/month (pooled at the billing entity)", `<span class="mid">Off until an admin enables it</span>`],
        ["Enterprise", "$39/assigned seat/month", "3,900/user/month (pooled at the billing entity)", `<span class="mid">Off until an admin enables it</span>`],
    ],
    { widths: ["16%", "18%", "38%", "28%"] },
)}
<p class="muted">As a migration promotion from 1 June to 1 September 2026, existing Business / Enterprise customers get 3,000 / 7,000 credits respectively (per user/month). <strong>Unused credits do not carry over to the next month.</strong></p>

${callout(
    "warn",
    "Parallelization hits cost directly — /fleet subagents increase AI Credits",
    `<p>The CLI's <code>/fleet</code> (§06) decomposes a task, and <strong>the subagents interact with the LLM in parallel</strong>. Because each subagent holds its own context window and reasons independently, it <strong>consumes more AI Credits than sequential execution does</strong>. The official documentation also states plainly that <code>/fleet</code> brings no benefit for inherently sequential requests.</p>
    ${docQuote(
        "Because each subagent interacts with the LLM independently, using /fleet may increase your AI Credits consumption. For tasks that are inherently sequential, /fleet is unlikely to provide any benefit.",
        "https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/speed-up-task-completion",
        "GitHub Docs — Speed up task completion with Copilot CLI",
    )}
    <p>So the decision to raise concurrency <strong>hits three budgets at once</strong>: AI Credits (for the subagents), Actions minutes (when delegating to the cloud agent), and <strong>review capacity</strong> (the real bottleneck). The benefit of parallelization depends on whether the tasks are independent, while the cost rises unconditionally — an asymmetry you confirm through measurement (§14).</p>`,
)}

${callout(
    "note",
    "Key points when discussing the Compute budget in practice",
    `<p>The cloud agent consumes <strong>two streams — AI Credits and Actions minutes</strong> — at the same time. So the decision to "raise concurrency" hits two kinds of budget at once (§04).<br>
    But the practical bottleneck is usually not cost; it is <strong>review capacity</strong>. That is why the Orchestrate step of the adoption ladder is conditioned on "within governance and review capacity", and the shift where humans move from a "loop of doing the work" to a "loop of making decisions" states the same constraint from another angle. <strong>The ceiling on how many tasks you can submit is set by the number of people who can approve them</strong> (§12).<br>
    Whether this cost is "worth it" cannot be settled by opinion — you evaluate it by measuring adoption and PR outcomes (§14).</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 14
    {
        id: "measurement",
        num: "14",
        eyebrow: "Measurement",
        title: "Measurement — governing adoption and impact",
        lead: `The first question in an enterprise adoption evaluation is "is this working?". Being able to talk about cost (§13) but not about impact is a fatally asymmetric proposal. This section fixes, as product fact, the measurement surfaces GitHub actually provides, shows their limits honestly, and lifts the §12 adoption ladder from an inventory check to something evidence-based.`,
        html: `
${principle(
    "Measure what the metrics actually measure—activity and pull request outcomes—and never claim causal productivity you cannot observe.",
)}

<h3>What you can capture — four dashboards and an API hierarchy</h3>
<p>Copilot usage metrics can be captured from several surfaces. All of them ship as product ${GA}, and repository-level metrics became GA on 2026-07-17.</p>
${table(
    ["Surface", "What you get", "Granularity / format"],
    [
        [
            `<strong>usage metrics API</strong>`,
            "Unified telemetry across completion, chat, and agent mode. Breakdowns by feature / IDE / language / model / user, plus a repository-level PR activity report",
            `<strong>enterprise / organization / repository / user</strong> levels`,
        ],
        [
            `<strong>usage metrics dashboard</strong>`,
            "Adoption and engagement over time",
            "28-day trend",
        ],
        [
            `<strong>code generation dashboard</strong>`,
            "Breaks down code generation <strong>by user versus agent</strong>",
            "enterprise / organization",
        ],
        [
            `<strong>impact dashboard</strong>`,
            "Classifies users into <strong>adoption cohorts (depth of adoption)</strong> and connects that adoption <strong>to PR output</strong>",
            "by cohort",
        ],
        [
            `<strong>NDJSON export</strong>`,
            "Raw data for custom BI tools and long-term retention",
            "raw",
        ],
    ],
    { widths: ["24%", "50%", "26%"] },
)}

${docQuote(
    "measure engagement, identify opportunities to increase value, and assess how AI-assisted workflows influence pull request throughput and time to merge.",
    "https://docs.github.com/en/copilot/concepts/copilot-usage-metrics/copilot-metrics",
    "GitHub Docs — Copilot usage metrics",
)}

<h3>The agent dimension and PR outcomes — quantities that matter as an SDLC</h3>
<p>The point of these metrics is that <strong>you can see agent activity connected to PR outcomes</strong>. The PR-lifecycle quantities you get include PRs created and merged, the <strong>median time to merge</strong>, and review-suggestion activity. The code generation dashboard separates user and agent generation, letting you compare PRs authored by Copilot against overall PR activity. This is where §14 pairs with the cost of §13 — <strong>an adoption evaluation only exists once you set "how much you spent" next to "how throughput / cycle time moved"</strong>.</p>

<h3>Limits — do not claim you can measure what you cannot</h3>
${callout(
    "warn",
    "What these metrics cannot measure (always state this in a proposal)",
    `<p><strong>(a) IDE telemetry is assumed.</strong> Most of the metrics <strong>come from client-side IDE telemetry</strong>, so if users have not enabled IDE telemetry, insufficient data is produced. Server-side telemetry is used to capture active users, but <code>totals_by_feature</code> and LoC-style breakdowns stay empty until richer telemetry is available.<br>
    <strong>(b) Some surfaces are out of scope.</strong> <strong>Copilot Chat on GitHub.com and GitHub Mobile are not included</strong>.<br>
    <strong>(c) License information is separate.</strong> Seat / license information is not in this report; the <code>Copilot user management API</code> is the source of truth.<br>
    <strong>(d) It is not causal.</strong> What you can measure is <span class="neg">activity and PR outcomes</span>, <strong>not causal productivity, escaped defects, or deployment success rate</strong>. Measuring those needs the existing platform and human processes that sit outside this guide's scope (§00).</p>`,
)}

<h3>Division of labour with the audit log</h3>
<p>"What happened (activity, PR outcomes)" is carried by usage metrics; "who did what, when, and as which agent" is carried by the <strong>audit log</strong>. §17's <code>agentic-audit-log-events</code> and <code>actor:Copilot</code> / <code>actor_is_agent</code> give you the <strong>attribution and timeline of individual operations</strong> that metrics cannot trace. Governance needs both — metrics secure the trend, the audit log secures accountability.</p>

<h3>Making the adoption ladder (§12) evidence-based</h3>
<p>As it stands, the Definition of Ready in §12 is an <strong>inventory check</strong> of "are the assets in place", not a measurement of outcomes. We map an <strong>observable quantity</strong> from these metrics onto the graduation test for each step.</p>
${table(
    ["Adoption ladder step", "Inventory check (current)", "Observable quantity that backs graduation (from this section)"],
    [
        [
            "Assist / Collaborate",
            "instructions and AGENTS.md are in place",
            "A rising DAU trend, and adoption cohorts not plateauing at the trial stage",
        ],
        [
            "Delegate / Standardize",
            "Verification means (tests, rulesets) exist",
            "Merge counts and median time to merge for Copilot-authored PRs are not deteriorating",
        ],
        [
            "Orchestrate",
            "Orchestration patterns exist",
            "Agent-dimension PR output and how review suggestions are applied (whether review capacity is the bottleneck)",
        ],
    ],
    { widths: ["22%", "34%", "44%"] },
)}
${callout(
    "note",
    "How to handle references to external frameworks such as DORA",
    `<p>Referring to external frameworks such as DORA (deployment frequency, lead time for changes, change failure rate, time to restore) is useful in itself, but they are <strong>${FRAMEWORK} an external framework this guide references to structure an adoption evaluation</strong>, not product metrics that Copilot usage metrics computes directly. Change failure rate and time to restore in particular require observing deployment and production operation (outside §00's scope). A condition for an honest proposal is to <strong>not conflate the numbers the metrics produce (activity, PR outcomes) with the outcome indicators those external frameworks demand</strong>. You must not claim causation.</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 15
    {
        id: "antipatterns",
        num: "15",
        eyebrow: "Anti-patterns",
        title: "Work you must not delegate, and common failures",
        lead: `Delegation is not a cure-all. Work you cannot bound in the first place, or work with no means of verification, makes governance spin in place when delegated. Here we lay out, with mitigations, both "work you must not put on asynchronous Delegation" and the "operational failure patterns" that tend to arise even with work you can delegate. Every judgement is backed by other sections of this guide.`,
        html: `
${principle(
    "If you cannot draw the boundary, define the check, or reverse the change, the work is not ready to delegate—make it ready first.",
)}

<h3>Work you must not put on delegation (async)</h3>
${table(
    ["Type of work", "Why it is unsuited to delegation", "What to do first"],
    [
        [
            "<strong>Cross-cutting refactors you cannot bound</strong>",
            "They do not fit the one task = one branch = one PR constraint, so you cannot define a Scope budget. They become a huge PR that cannot be reviewed",
            `Split into waves and land them as a set of independently verifiable Issues (§05 Plan → Work). Structure Scope with <code>applyTo</code> and CODEOWNERS (§03, §04)`,
        ],
        [
            "<strong>Work with no means of verification</strong>",
            "With no deterministic check, acceptance falls back to human eyeballing. The deterministic side of \"verify deterministically\" is left empty",
            "Prepare characterization tests and required status checks first (§08). If there is no net, delegate the work of stringing the net first",
        ],
        [
            "<strong>Work whose spec is not settled</strong>",
            "Because you cannot write the acceptance criteria, the contract becomes a \"blank cheque\". The agent will fill it in probabilistically",
            `Settle the spec in Conversation / Collaboration mode before delegating (§01). If it is unsettled, a human steers at the research/plan stage of the Agents UI (§05)`,
        ],
        [
            "<strong>Changes that cannot be rolled back</strong>",
            "Work with low reversibility is exactly what you must not raise the Autonomy budget for. The blast radius of failure is large",
            "Separate merge / release / production with environments and deployment protection rules, and place a human gate (§09). Delegate only the reversible parts first",
        ],
        [
            "<strong>Work that needs access to secrets</strong>",
            "Production secrets should not be placed in Agents secrets, and the firewall does not cover MCP or setup steps. It can become a leak path",
            "Re-cut the work into a form that does not touch secrets (§10). If it is truly required, take it out of scope for delegation and have a human do it",
        ],
    ],
    { widths: ["24%", "40%", "36%"] },
)}

<h3>Operational failure patterns that occur even with work you can delegate</h3>
${cards(
    [
        {
            title: "Delegating without preparing context",
            badge: badge("warn", "Failure"),
            body: `<p class="muted">Symptom: the agent returns an implementation that ignores conventions. Review comments pile up.</p>
      <p>The cause is a lack of Persistent context. Adding more tokens will not fix it — get <code>AGENTS.md</code> and <code>*.instructions.md</code> in order first (§02). Do not place contradictory instructions across multiple layers.</p>`,
        },
        {
            title: "Reverting verification to human eyeballing",
            badge: badge("warn", "Failure"),
            body: `<p class="muted">Symptom: reviewers follow the diff by eye to decide whether it is correct.</p>
      <p>A sign that deterministic checks are weak. Thicken required status checks, CodeQL, and tests, and focus human review on "judgement, not the diff" (architectural fit, compatibility, operational impact) (§08, §09).</p>`,
        },
        {
            title: "Letting the PR grow huge",
            badge: badge("warn", "Failure"),
            body: `<p class="muted">Symptom: a single PR spans dozens of files and stalls, unreviewed.</p>
      <p>The Scope budget is too wide. Split it into "one observable outcome" with Plan → Work (§05). The loop exists to produce <em>small, reviewable changes</em>.</p>`,
        },
        {
            title: "Submitting in parallel beyond review capacity",
            badge: badge("warn", "Failure"),
            body: `<p class="muted">Symptom: agent PRs pile up waiting for approval.</p>
      <p>The practical ceiling on concurrency is <strong>the number of people who can approve</strong>. Decide concurrency by review capacity, not cost (§12, §13).</p>`,
        },
        {
            title: "Treating Copilot code review as an approval gate",
            badge: badge("warn", "Failure"),
            body: `<p class="muted">Symptom: treating "an automated review was added" as safe and merging.</p>
      <p>Copilot code review is <strong>always Comment</strong> — a signal, not a gate. Place a required human review separately with CODEOWNERS (§09).</p>`,
        },
        {
            title: "Handling escalation with a \"please\"",
            badge: badge("warn", "Failure"),
            body: `<p class="muted">Symptom: you write "stop if it's dangerous" in the prompt, but it does not actually stop.</p>
      <p>Prompts are probabilistic. Turn areas you do not want touched into a structure — via CODEOWNERS and rulesets — where "touching them fires a required review" — <em>make it stop, rather than asking it to</em> (§03, §04).</p>`,
        },
    ],
    { cols: 3 },
)}

${callout(
    "key",
    "The common structure of the anti-patterns",
    `<p>Every failure above has the same root — <strong>entrusting to the prompt a piece of governance that a probabilistic instruction (the prompt) could never carry</strong>. Delegation runs safely only when boundaries, verification, and gates are <em>structure</em> (§03's "5 of the 8 fields can be made structural"). When unsure whether to delegate, answer three questions: "Can I draw the boundary?", "Can I define the check?", "Can I roll it back?" If even one is No, the work of turning that No into a Yes comes first.</p>`,
)}
`,
    },
];
