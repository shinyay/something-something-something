// English translation of PART 3: sections 05 (loop), 06 (orchestration),
// 07 (modernization).
// Terminology is bound by TERMS in ./i18n.mjs — do not diverge from it.
//
// Translation discipline enforced here (same as ./content-en-b.mjs):
//   * docQuote quotations are English originals and are never altered.
//   * principle() blockquotes are already English; the Japanese gloss (2nd arg)
//     is dropped because it is redundant for an English reader.
//   * Embedded partial quotations from the docs use the real documentation
//     wording, not a back-translation of the Japanese paraphrase.
//   * <code> contents, URLs, file names, and setting values stay untranslated.
//   * Cross-references (§05, §09, …) point at the same section numbers, and the
//     provenance split — GitHub product specification vs. this guide's own
//     framing — is preserved claim for claim.
//   * The loop diagram is the shared one from ./diagrams.mjs, called with "en"
//     so that only its labels, <title>, and <desc> change; the geometry is
//     shared and the Japanese output stays byte-for-byte identical.
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre, diagram } from "./ui.mjs";
import { loopDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "Official");
const FRAMEWORK = badge("framework", "This guide's framing");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsEnC = [
    // ────────────────────────────────────────────────────────────── 05
    {
        id: "loop",
        num: "05",
        eyebrow: "Modernization Loop",
        title: "The Agentic Modernization Loop — Five Transforms and a Capability Map",
        lead: "Modernization can be designed as a loop that cycles through five transforms — Code→Doc / Doc→Plan / Plan→Work / Work→PR / PR→Learning. The loop turns uncertainty into small, reviewable changes and feeds every reviewed result back into organizational knowledge. Each transform settles which feature you use and what artefact you leave behind.",
        html: `
${principle(
    "The loop turns uncertainty into small, reviewable changes and feeds every reviewed result back into organizational knowledge.<br>Bounded delegation sits at the center; human gates connect every stage.",
)}

${diagram(
    loopDiagram("en"),
    "The five transforms — Code→Doc / Doc→Plan / Plan→Work / Work→PR / PR→Learning — run clockwise around the ring, and PR→Learning returns to Code→Doc. Bounded delegation sits at the centre, and what connects each transform is a human gate. The feature used, the artefact left behind, and the human gate for each transform are laid out in the table just below.",
)}

${table(
    ["Transform", "Feature used", "Artefact left in the repository", "Human gate"],
    [
        [
            `<strong>Code → Doc</strong><br><span class="muted">recover the structure, behaviour, rules, and uncertainties</span>`,
            `Copilot Chat (cross-repository explanation)<br>Copilot Spaces (bundling the scope)<br>${PP} Modernize CLI assess`,
            `Structure, flow, and business-rule write-ups under <code>docs/</code><br><strong>A list of assumptions and open questions</strong>`,
            "Verification by the domain owner. <em>Recovered documentation is only a hypothesis until it is verified.</em>",
        ],
        [
            `<strong>(safety net)</strong><br><span class="muted">build a behavioural safety net</span>`,
            `Copilot Chat test generation<br>App modernization for Java (migrating existing tests + generating new unit tests, behavioral-integrity verification)`,
            "characterization tests (tests that pin down the current observable behaviour)",
            "<strong>A person decides which behaviour is intended and which is a defect.</strong>",
        ],
        [
            `<strong>Doc → Plan</strong><br><span class="muted">define the goals, options, risks, and migration waves</span>`,
            `${PP} <strong>modernization agent (Modernize CLI)</strong> assess → plan<br>Dependabot / Advisory Database (known vulnerabilities)<br>CodeQL (security findings)`,
            "A plan file with editable, ordered tasks and success conditions",
            "<strong>A person chooses the strategy, the order, and the risks.</strong> An assessment is a set of facts, not a strategy decision.",
        ],
        [
            `<strong>Plan → Work</strong><br><span class="muted">create bounded, independently verifiable tasks</span>`,
            "GitHub Issues (the container for the Delegation Contract)<br>Issue templates / labels",
            "A set of Issues, each with one observable outcome, explicit dependencies, boundaries, a means of verification, and a rollback procedure",
            "Approval of the Issue granularity (i.e. sprint planning)",
        ],
        [
            `<strong>Work → PR</strong><br><span class="muted">implement, verify, report, and ask for human review</span>`,
            `<strong>GitHub Copilot cloud agent</strong><br>GitHub Actions / CodeQL / secret scanning<br>Copilot code review`,
            `A <code>copilot/…</code> branch, a draft PR, Verified-signed commits, and the session log`,
            "required reviews / CODEOWNERS / environments. <strong>The agent can neither approve nor merge.</strong>",
        ],
        [
            `<strong>PR → Learning</strong><br><span class="muted">improve the instructions, the tests, the plan, and future work</span>`,
            `Existing telemetry, incident, and support infrastructure<br>${PP} Copilot Memory<br>updates to custom instructions / custom agents`,
            `An updated <code>AGENTS.md</code> / <code>*.instructions.md</code>, strengthened tests, a runbook, and the next Delegation Contract`,
            "The owner decides which signals change the priorities, the governance, and the rollout.",
        ],
    ],
    { widths: ["18%", "26%", "30%", "26%"] },
)}

${callout(
    "warn",
    "There is no dedicated Copilot product for PR → Learning",
    `<p>As far as can be confirmed, there is <strong>no</strong> dedicated Copilot feature that performs autonomous post-deployment monitoring or incident correlation. This stage is a synthesis of the operating model, not a dedicated Copilot monitoring feature.<br>
    That means this stage can only be implemented with <strong>existing observability infrastructure plus a human operational process</strong>. The one thing on the Copilot side that points in this direction is ${PP} <strong>Copilot Memory</strong> (persisting repository facts, expiring after 28 days without use), but that is not a mechanism for ingesting operational signals. When you propose this, the honest thing is to state plainly that <strong>this is operational design, not a product feature</strong>.</p>`,
)}

<h3>The research / plan / iterate stages in the Agents UI</h3>
<p>Started from the Agents UI, the cloud agent follows this flow — an approved Issue → the agent's research → a proposed plan → human confirmation or course-correction → work on a branch → running the checks → a draft PR. The step where a person confirms or course-corrects the scope, the approach, and the assumptions is what characterises this entry point.</p>
${callout(
    "note",
    "Behaviour differs by entry point",
    `<p>Started from the Agents UI, the cloud agent can research, plan, and iterate before it creates a PR. <strong>From most of the other entry points (assigning an Issue, <code>@copilot</code>, and so on) it opens a PR straight away.</strong><br>
    If you actually want the step where a person confirms or course-corrects the scope, the approach, and the assumptions, you have to <strong>start the work from the Agents UI</strong>. This difference bears directly on operational design.</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 06
    {
        id: "orchestration",
        num: "06",
        eyebrow: "Orchestration",
        title: "Orchestration in Practice — Making Parallel Delegation Work",
        lead: "Both §01 and §10 place orchestration at the top, yet this guide has so far not shown how to operate it. This section fills that gap — it distinguishes the four things you can run in parallel, settles the decomposition criteria for what may be placed in parallel, and makes plain where the ceiling on concurrency lies.",
        html: `
${principle(
    "Parallelism is bounded by review capacity, not by how many agents you can launch.",
)}

<h3>The four things that run in parallel — at different levels</h3>
<p>&ldquo;Run agents in parallel&rdquo; is one phrase, but GitHub has <strong>four mechanisms at different levels</strong>. Subagents parallelise <strong>inside a single session</strong>; cloud agent tasks and automations parallelise <strong>across sessions</strong>. Confuse them and you will get the granularity of decomposition wrong.</p>

${table(
    ["What runs in parallel", "Surface / how it starts", "Unit of parallelism", "Context isolation", "Billing and state consequences"],
    [
        [
            `<strong>${c("/fleet")} subagents</strong> ${OFFICIAL}`,
            `GitHub Copilot CLI (within one session)`,
            "Subtasks (the main agent is the orchestrator)",
            `<strong>Each subagent has its own context window</strong> (separate from the main agent and from the other subagents)`,
            `<span class="neg">It consumes more AI Credits</span> (§13). State stays within one worktree`,
        ],
        [
            `<strong>Parallel workspaces</strong> ${GA}`,
            `GitHub Copilot app (desktop)`,
            "Sessions (several run at once)",
            `<strong>Each session gets its own git worktree and branch</strong>`,
            `A separate branch per session. Running in a cloud sandbox also consumes Actions ${PP}`,
        ],
        [
            `<strong>Multiple cloud agent tasks</strong> ${OFFICIAL}`,
            `The Agents tab on GitHub.com / ${c("gh agent-task")} / the agent-tasks REST API`,
            "Task = session (across sessions)",
            `Each task gets its own ephemeral environment and a <code>copilot/…</code> branch`,
            `AI Credits + Actions minutes. Persists as pushed commits`,
        ],
        [
            `<strong>automations</strong> ${OFFICIAL}`,
            `A schedule / a repository event (unattended)`,
            "One session per run",
            `Inherits the repository's cloud agent settings (scoped to one repository)`,
            `AI Credits + Actions minutes. <span class="neg">The definition lives outside Git</span> (§09)`,
        ],
    ],
    { widths: ["20%", "22%", "18%", "22%", "18%"] },
)}

${docQuote(
    "the main Copilot agent … will act as orchestrator, managing the workflow and dependencies between the subtasks. Each subagent has its own context window, separate from the main agent and other subagents.",
    "https://docs.github.com/en/copilot/concepts/agents/copilot-cli/fleet",
    "GitHub Docs — Fleet for Copilot CLI",
)}

<h3>The decomposition criteria for tasks you may place in parallel</h3>
<p>Parallelisation only pays off when tasks are <strong>genuinely independent</strong>. Whether a decomposition is sound is judged on the following three points.</p>
${cards(
    [
        {
            title: "① Independence — no sequential dependency",
            badge: OFFICIAL,
            body: `A request whose one output becomes the other's input only produces waiting even when it is parallelised. The documentation itself is explicit: <em>&ldquo;If your request is inherently sequential, using the <code>/fleet</code> slash command mode may not provide any benefit.&rdquo;</em> <strong>Do not force an inherently sequential request into parallel</strong> — that is the first criterion.`,
        },
        {
            title: "② Separate the collision surface by path",
            badge: FRAMEWORK,
            body: `When parallel tasks touch the same file, they collide at branch-integration time. Reuse <code>applyTo</code> (the scope of an instruction) from §02 and <strong>CODEOWNERS</strong> from §03, and <strong>assign each task a non-overlapping set of paths to touch</strong>. Separating the collision surface at design time is the orchestrator's job.`,
        },
        {
            title: "③ The consequence of one task, one branch",
            badge: FRAMEWORK,
            body: `For both parallel workspaces and cloud agent tasks the unit is <strong>one task = one branch = one PR</strong>. The granularity of decomposition therefore has to come down to &ldquo;a unit that can be reviewed and merged independently&rdquo;. Too coarse and it collides; too fine and the review load — the bottleneck — goes up.`,
        },
    ],
    { cols: 3 },
)}

<h3>Work that suits parallelisation and work that does not</h3>
${table(
    ["Suited / not suited", "Examples", "Basis"],
    [
        [
            `<span class="pos">Suited</span>`,
            "Independent refactors across several files, dependency updates, running tests across modules, <strong>building a test suite for a new feature</strong>",
            `The documentation names these explicitly — &ldquo;multiple independent steps, such as refactoring several files, updating dependencies, or running tests across modules&rdquo; — and calls &ldquo;creating a suite of tests for a new feature … well suited to parallelization.&rdquo;`,
        ],
        [
            `<span class="neg">Not suited</span>`,
            "A chain of work like design → implementation → verification, where the conclusion of one stage becomes the premise of the next",
            `When there is a sequential dependency, <code>/fleet</code> provides no benefit (only the AI Credits go up)`,
        ],
    ],
    { widths: ["14%", "50%", "36%"] },
)}

${callout(
    "key",
    "Specialisation — assign a model and a custom agent to each subagent",
    `<p><code>/fleet</code> subagents use a low-cost model by default, but you can specify the model in the prompt (for example, <em>&ldquo;… Use GPT-5.3-Codex, to create …&rdquo;</em>). Name a custom agent explicitly with <code>@CUSTOM-AGENT-NAME</code> and you can assign specialised behaviour per task. Allocating <strong>a high-capability model to the hard parts and a low-cost model to the routine ones</strong> is, in itself, cost design (§13).</p>`,
)}

${callout(
    "note",
    "The difference between a monorepo and a polyrepo is absorbed into the decomposition criteria",
    `<p>In a monorepo, separating the collision surface is complete once paths are assigned (criterion ②), and CODEOWNERS can be managed centrally in one repository. In a polyrepo, one task, one branch aligns naturally with the repository boundary, but a cross-repository change runs into the constraint that <strong>automations can only act on one repository</strong> (§09). Either way, criteria ①–③ do not change.</p>`,
)}

${callout(
    "warn",
    "Raising concurrency does not raise review capacity",
    `<p>Whichever of the four mechanisms you use, the PRs that get generated all pass through <strong>the same gate — human review</strong> in the end. The more you raise concurrency, the more the bottleneck moves to the review side, and the AI Credits (§13) grow linearly. <strong>Decide concurrency by how many PRs you can review at once, not by how many agents you can run at once</strong> — this is how the thesis that runs through this guide shows up in orchestration.</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 07
    {
        id: "modernization",
        num: "07",
        eyebrow: "Modernization",
        title: "The Current State of Modernization-Specific Tooling",
        lead: "Modernization has a dedicated set of tools. Because the names and the make-up of this area have changed, this section sets out the umbrella name, the agent, the availability, and the prerequisites as they currently stand, and shows how they map onto the general Modernization Loop (§05).",
        html: `
${table(
    ["Item", "Current content"],
    [
        ["Umbrella name", `${OFFICIAL} <strong>GitHub Copilot modernization</strong>`],
        ["Agent / CLI", `${OFFICIAL} <strong>GitHub Copilot modernization agent</strong> (delivered as the <strong>Modernize CLI</strong>)`],
        ["Scope", "Upgrades for Java / .NET / <strong>C++</strong>, and the supported Azure migration scenarios. <em>Describing it as &ldquo;a separate Java edition and .NET edition&rdquo; is no longer accurate</em> (the per-language documentation and experiences remain)"],
        ["Availability", `${GA} Runtime / framework / toolset upgrades in the IDE (.NET, Java, C++) and the IDE migration scenarios (.NET, Java)<br>${PP} <strong>Assessment and planning in the Modernize CLI</strong>`],
        ["Prerequisites", "A GitHub Copilot subscription + GitHub CLI 2.45 or later. The quickstart lists Free / Pro / Pro+ / Business / Enterprise"],
        ["cloud agent integration", "The CLI can delegate work to the cloud agent; that work consumes the cloud agent's AI Credits + Actions minutes"],
    ],
    { widths: ["18%", "82%"] },
)}

${docQuote(
    "The modernization agent, delivered via the Modernize CLI, enables architects and application owners to orchestrate assessment, migration planning, and framework upgrade automation across multiple applications simultaneously.",
    "https://learn.microsoft.com/en-us/azure/developer/github-copilot-app-modernization/overview",
    "learn.microsoft.com — GitHub Copilot app modernization overview",
)}

<h3>The three forms of legacy — Code / Knowledge / Process ${FRAMEWORK}</h3>
<p>If you treat modernization as nothing more than &ldquo;turning old code into new code,&rdquo; you miss the hardest part. This guide frames legacy as existing in <strong>three forms</strong> (this is <strong>this guide's own vocabulary, not an official product distinction</strong>, §16). The tools can handle only the first directly; the other two are filled in by the design of the delegation.</p>
${cards(
    [
        {
            title: "Code — legacy in the code",
            badge: FRAMEWORK,
            body: `Old languages, frameworks, dependencies, and runtimes. This is where <strong>the Modernize CLI / upgrade agent can act directly</strong> (Assess → Plan → Execute). It is the most automated of the three layers.`,
        },
        {
            title: "Knowledge — legacy in the knowledge",
            badge: FRAMEWORK,
            body: `The state where &ldquo;why it was written this way&rdquo; has been lost — missing documentation, vanished design intent, implicit business rules. You recover it into an observable form with <strong>characterization tests and Copilot explanations</strong> (code → natural language) (§05, §08).`,
        },
        {
            title: "Process — legacy in the process",
            badge: FRAMEWORK,
            body: `Manual builds, person-dependent releases, an absence of verification. Until this is filled in, there is <strong>no gate that safely accepts</strong> the transformed code. You build the deterministic gates first, with rulesets, CI, and the Evidence Package (§08, §09).`,
        },
    ],
    { cols: 3 },
)}
${callout(
    "note",
    "The order tends to get reversed",
    `<p>Counter-intuitively, it is safer to firm up <strong>the Process before you change the Code, and the Knowledge before the Process</strong>. Without the knowledge (the expected behaviour) you cannot write the net of verification, and without that net (the deterministic gates) you cannot safely accept a code transformation. That is exactly why the modernize-legacy-code tutorial (below) takes the order of &ldquo;write the test plan first&rdquo; — it is Knowledge → Process → Code made practical.</p>`,
)}

<h3>How Assess → Plan → Execute maps onto the stages of the Loop</h3>
${table(
    ["Modernize CLI stage", "What it does", "Matching Loop stage (§05)"],
    [
        ["<strong>Assess</strong>", "Analyses the code, the configuration, the dependencies, cloud fit, risks, and opportunities. <strong>It can aggregate across several repositories.</strong>", "The first half of Doc → Plan (evidence-based opportunity assessment)"],
        ["<strong>Plan</strong>", "Generates editable, reviewable, ordered tasks with success conditions", "The second half of Doc → Plan (defining the goals and the migration strategy)"],
        ["<strong>Execute</strong>", "Applies the transformations and dependency upgrades, verifies with builds and tests, scans and remediates CVEs, produces traceable commits, and delegates to the cloud agent", "Work → PR (delegate the implementation, keep the judgement)"],
    ],
    { widths: ["16%", "54%", "30%"] },
)}

${callout(
    "key",
    "The principle that a person chooses the strategy lines up with how this product is built",
    `<p>An assessment is <em>a grasp of the facts, not a strategy decision</em>. A person chooses the strategy, the order, and the risk acceptance. What the Plan stage of the Modernize CLI generates is an <strong>editable, reviewable plan</strong> — a form a person can change before execution. The principle of the operating model and the design philosophy of the product coincide here, which makes this an especially convincing point to explain.</p>`,
)}

${pre("powershell", "# Windows\nwinget install GitHub.Copilot.modernization.agent\n\n# macOS / Linux\nbrew tap microsoft/modernize https://github.com/microsoft/modernize-cli\nbrew install modernize")}
<p class="muted">Supports both the interactive TUI <code>modernize</code> and the headless <code>modernize &lt;command&gt;</code>.</p>

${callout(
    "warn",
    "The state-file paths are not unified",
    `<p>In the documentation, the Modernize CLI page shows <code>.github/modernize/…</code>, one page about execution refers to <code>.github/modernization/…</code>, and the IDE upgrade agent uses <code>.github/upgrades/{scenarioId}</code>. <strong>Do not normalise these into a single path when you explain them</strong> (you would end up with a path that does not exist in the documentation).</p>`,
)}

<h3>The &ldquo;Modernizing legacy code&rdquo; tutorial on docs.github.com is a different thing</h3>
<p>${a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "docs.github.com/copilot/tutorials/modernize-legacy-code")} is <strong>not a Modernize CLI tutorial</strong>. It teaches a Copilot Chat-driven COBOL → Node.js conversion workflow:</p>
${ul([
    "① Clone, compile, and run it so the current state works",
    "② Have Copilot explain the files and the data flow",
    "③ <strong>Write the test plan for the business logic first</strong>",
    "④ Translate the COBOL files into Node.js iteratively",
    "⑤ Assemble the Node app and debug it",
    "⑥ Generate Jest unit and integration tests from the plan in ③",
    "⑦ Run the tests, fix the failures, and refine",
])}
<p>The point is that ③ comes before ⑥, which corresponds to the practical procedure of &ldquo;building a behavioural safety net&rdquo; (§05). The order is: before you change the implementation, put the expected behaviour into a form a human can review.</p>
`,
    },
];
