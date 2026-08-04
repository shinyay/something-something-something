// English translation of PART 2: sections 01 (continuum), 02 (context),
// 03 (contract), 04 (autonomy).
// Terminology is bound by TERMS in ./i18n.mjs — do not diverge from it.
//
// Translation discipline enforced here (same as ./content-en-a.mjs):
//   * docQuote quotations are English originals and are never altered.
//   * principle() blockquotes are already English; the Japanese gloss (2nd arg)
//     is dropped because it is redundant for an English reader.
//   * <code> contents, URLs, file names, and setting values stay untranslated.
//   * Cross-references (§03, §09, …) point at the same section numbers, and the
//     provenance split — GitHub product specification vs. this guide's own
//     framing — is preserved claim for claim.
//   * Diagrams are the shared ones from ./diagrams.mjs, called with "en" so that
//     only their labels, <title>, and <desc> change; the geometry is shared.
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, pre, diagram } from "./ui.mjs";
import { continuumDiagram, contractDiagram, autonomyDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "Official");
const FRAMEWORK = badge("framework", "This guide's framing");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsEnB = [
    // ────────────────────────────────────────────────────────────── 01
    {
        id: "continuum",
        num: "01",
        eyebrow: "Interaction modes",
        title: "The Five Interaction Modes of GitHub Copilot",
        lead: "Ways of working with GitHub Copilot sort into five modes: Completion → Conversation → Collaboration → Delegation → Orchestration. That is this guide's own classification. This section pins down what each mode means, which real product, where it runs, synchronicity, and billing it corresponds to, and when to pick which.",
        html: `
${principle(
    "The useful progression is measured by how much work a person can define and hand off—not by launch dates.",
)}

${diagram(
    continuumDiagram("en"),
    "The five modes placed on a plane of synchronous ↔ asynchronous/parallel and local ↔ cloud. The further you move from Completion at the lower left towards Orchestration at the upper right, the more work a person can define and hand off. Each mode's definition, matching product, and billing follow in the list and table below.",
)}

<h3>What the five modes are</h3>
${ul([
    "<strong>Completion</strong> — completes the code you are part-way through writing, by token, line, or block, inside the IDE. The person leads the work and the suggestions are local.",
    "<strong>Conversation</strong> — you ask and you get an explanation. Understanding of the code or the repository deepens through dialogue.",
    "<strong>Collaboration</strong> — inside a shared session, the agent runs bounded steps while you watch. Files change immediately and you can stop it at any point.",
    "<strong>Delegation</strong> — an outcome comes back to you with evidence attached. You are not watching the execution; the result returns in a form you can inspect.",
    "<strong>Orchestration</strong> — a repeatable flow runs across several pieces of governed work. Parallel and asynchronous.",
])}

${table(
    ["Mode", "Matching product", "Where it runs", "Synchronicity", "Billing"],
    [
        [
            `<strong>Completion</strong><br><span class="muted">token / line / block</span>`,
            `${OFFICIAL} <strong>GitHub Copilot code suggestions</strong><br><span class="muted">ghost text / next edit suggestions</span>`,
            "IDE only",
            "Synchronous",
            `<span class="pos">No AI Credits consumed</span>`,
        ],
        [
            `<strong>Conversation</strong><br><span class="muted">question / explanation</span>`,
            `${OFFICIAL} <strong>GitHub Copilot Chat</strong>`,
            "GitHub.com / IDE / Mobile / CLI",
            "Synchronous",
            "AI Credits",
        ],
        [
            `<strong>Collaboration</strong><br><span class="muted">bounded steps in a shared session</span>`,
            `${OFFICIAL} <strong>Agent mode</strong> (IDE)<br>${OFFICIAL} <strong>GitHub Copilot CLI</strong> (<code>copilot</code>)`,
            "Your own machine / local working tree",
            "Synchronous",
            "AI Credits",
        ],
        [
            `<strong>Delegation</strong><br><span class="muted">outcome returned with evidence</span>`,
            `${OFFICIAL} <strong>GitHub Copilot cloud agent</strong>`,
            "An ephemeral development environment on GitHub Actions",
            "<strong>Asynchronous</strong>",
            "AI Credits <strong>+ Actions minutes</strong>",
        ],
        [
            `<strong>Orchestration</strong><br><span class="muted">repeatable flow across governed work</span>`,
            `${OFFICIAL} <strong>Agents tab / agents panel</strong> (<code>github.com/copilot/agents</code>)<br>${PP} third-party coding agents (Anthropic Claude / OpenAI Codex)`,
            "GitHub.com (a cross-cutting command surface)",
            "Asynchronous, parallel",
            "Billed per the agent in question",
        ],
    ],
    { widths: ["16%", "30%", "20%", "12%", "22%"] },
)}

${callout(
    "note",
    "When to choose which mode",
    `<p>The deciding axis is <strong>how far you can define the work and hand it off</strong>. <strong>Completion / Conversation</strong> belong to exploration and understanding — the stage where the work cannot yet be put into words. <strong>Collaboration</strong> is for when the boundaries are visible but you want to confirm each step in your own working tree. <strong>Delegation</strong> is for when you can write out the outcome, the boundaries, the acceptance criteria, and the means of verification — only then can the work be handed off asynchronously. <strong>Orchestration</strong> is running several of those at once, and its practical ceiling is <strong>review capacity</strong> (§12, §13). The more reversible the work, the smaller its blast radius, and the better its evidence, the further right you can move.</p>`,
)}

${callout(
    "key",
    "The real line between Collaboration and Delegation is not synchronous vs. asynchronous — it is where the work runs",
    `<p>Agent mode runs on your machine, in front of you. Files change immediately and you can stop it whenever you like. <strong>The cloud agent is different.</strong> It runs in an ephemeral environment on GitHub Actions and you are not watching. That is precisely why the result has to come back in an inspectable form: a <code>copilot/…</code> branch and a draft PR. <strong>Delegation transfers responsibility for executing an outcome; it does not transfer the authority to merge</strong> — that is a direct consequence of this execution model (§09).</p>`,
)}

<h3>Entry points for handing a task to the cloud agent (those the current documentation confirms)</h3>
${ul([
    `The repository's <strong>Agents tab</strong>, the global <strong>agents panel</strong>, or ${a("https://github.com/copilot/agents", "github.com/copilot/agents")}`,
    "The <strong>Task</strong> prompt on the dashboard",
    `${c("/task")} in GitHub Chat`,
    "Assigning an Issue to <strong>Copilot</strong>",
    `${c("@copilot")} in a comment on an existing PR`,
    "Delegation from the IDE / GitHub Mobile / the REST API / the GitHub MCP Server",
    `${PP} ${c("gh agent-task create")} in the GitHub CLI (a different thing from the standalone <code>copilot</code> CLI)`,
])}

${callout(
    "warn",
    "Mind the changes of name",
    `<p>The name in the current documentation is <strong>GitHub Copilot cloud agent</strong>. At the time of the GA announcement in September 2025 the name was <strong>Copilot coding agent</strong>. No formal rename announcement has been confirmed, so the safe way to describe it is that <em>the term used in the documentation changed</em>.<br>
    In the same way, <strong>Agent HQ</strong> is an umbrella name from the GitHub Blog: the names that actually appear in the UI are <strong>Agents tab / agents panel / agents page</strong>, and <strong>mission control</strong> is a conceptual name for the command centre.</p>`,
)}

<h3>What "the unit of management changes" looks like in practice — from diffs to sessions</h3>
${cards(
    [
        {
            title: "Before: you manage diffs",
            body: "What gets reviewed is the diff. The history of how the work happened stays on your machine.",
        },
        {
            title: "Agentic: you manage sessions",
            badge: OFFICIAL,
            body: "The cloud agent's <strong>session log</strong> retains progress, token usage, elapsed time, and the reasoning and tool-execution log. Commits carry a <strong>Verified signature</strong> and trace back to the session log. The person who asked for the work is added as a co-author.",
        },
        {
            title: "Sharing defaults",
            badge: badge("warn", "Watch out"),
            body: "A cloud agent session is shared by default with everyone who can access the repository. Local sessions are not shared by default.",
        },
    ],
    { cols: 3 },
)}

<h3>GitHub Copilot app — a dedicated surface for agent-driven development ${GA}</h3>
<p>The <strong>GitHub Copilot app</strong>, GA since 2026-06-17, is a dedicated desktop application for working with several agent sessions at once. It is <strong>built on top of GitHub Copilot CLI</strong> and runs on macOS, Linux, and Windows. It adds one more &ldquo;where it runs&rdquo; to the Collaboration ↔ Delegation classification.</p>
${cards(
    [
        {
            title: "Parallel workspaces",
            badge: GA,
            body: `Run several agent sessions at once, with <strong>a dedicated git worktree and branch per session</strong>. A new session can also run in a <strong>GitHub-hosted cloud sandbox</strong> ${PP}.`,
        },
        {
            title: "Three session modes",
            badge: GA,
            body: `<strong>Interactive</strong> (collaborative) / <strong>Plan</strong> (the agent plans, a human approves) / <strong>Autopilot</strong> (fully autonomous). Model and reasoning effort are selectable per session, and BYOK is supported.`,
        },
        {
            title: "GitHub integration",
            badge: GA,
            body: `Browsing Issues and starting a session from one, creating, closing, and reviewing PRs, <strong>checking CI results</strong>, and merging all happen inside the app. It also has an automations tab, session history via <code>/chronicle</code>, and canvases.`,
        },
    ],
    { cols: 3 },
)}
${callout(
    "note",
    "The GitHub Copilot app policy is a separate policy from the Copilot CLI policy",
    `<p>The GitHub Copilot app is available on every Copilot plan. On Business / Enterprise the <strong>GitHub Copilot app policy</strong> must be enabled, and that is <strong>a different policy from the Copilot CLI policy</strong> (both are enabled by default). When checking what is enabled for an organization, do not conflate the two.</p>`,
)}

${callout(
    "key",
    "research / plan / iterate does not create a PR for you — an important asymmetry with assigning an Issue",
    `${docQuote(
        "Sessions do not create pull requests automatically. To create one immediately, include that in your prompt.",
        "https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/research-plan-iterate",
        "GitHub Docs — Research, plan, and iterate",
    )}
    <p>A session started from the Agents UI (the cloud agent on GitHub.com) through <strong>research → plan → iterate</strong> <strong>does not create a PR on its own</strong>. A person reviews the diff and presses <strong>Create pull request</strong> once satisfied.<br>
    This is <strong>the opposite of the Issue-assignment entry point, which always creates a PR</strong>. If you want an operating model where a human confirms the scope and the approach before anything becomes a PR, you have to understand this asymmetry and <strong>pick the entry point accordingly</strong>. Note also that research, planning, and iteration are available <strong>only on the GitHub.com cloud agent</strong>: integrations such as Azure Boards, JIRA, Linear, Slack, and Teams support direct PR creation only.</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 02
    {
        id: "context",
        num: "02",
        eyebrow: "Context Engineering",
        title: "Context Engineering — Designing Information an Agent Will Reliably Find",
        lead: "Context is not a big prompt. It is designing relevant, current, and authorized information as a managed system. This guide divides context into three kinds — Persistent, Task, and Dynamic — and holds it to five quality requirements: discoverable, permission-aware, owned, reviewed, and maintained. That translates directly into how files are laid out in the repository.",
        html: `
${principle(
    "Context is a managed system of relevant, current, and authorized information—not a one-time prompt enlarged until it works.<br>More tokens do not repair stale, hidden, or unauthorized context.",
)}

${table(
    ["Kind", "Implementation", "Where it lives", "Notes"],
    [
        [
            `<strong>Persistent context</strong><br><span class="muted">architecture, conventions, policy, repository knowledge</span>`,
            `${OFFICIAL} custom instructions`,
            `${c(".github/copilot-instructions.md")}<br>${c("AGENTS.md")}<br>${c(".github/instructions/**/*.instructions.md")}`,
            `<code>AGENTS.md</code> <strong>can be nested</strong>, and <strong>the nearest file in the directory tree wins</strong>. <code>*.instructions.md</code> is scoped to paths by the <code>applyTo</code> glob in its YAML frontmatter.`,
        ],
        [
            "",
            `${OFFICIAL} <strong>agent skills</strong>`,
            `${c(".github/skills")}`,
            `A reusable bundle of instructions, scripts, and resources. Where instructions and <code>AGENTS.md</code> are the written statement of conventions and assumptions, an agent skill is <strong>a packaged procedure that can carry scripts and resources with it</strong>. Automations inherit these too (§06).`,
        ],
        [
            "",
            `${OFFICIAL} organization-level instructions`,
            "The organization's Copilot settings",
            "Business / Enterprise only. Applies to GitHub.com Chat, code review, and the cloud agent.",
        ],
        [
            "",
            `${OFFICIAL} <strong>GitHub Copilot Spaces</strong>`,
            "GitHub.com",
            "Persistent context bundling repositories, files, PRs, Issues, free-form text, and images. Sources that come from GitHub stay in sync automatically. Reachable from the IDE through the GitHub MCP Server.",
        ],
        [
            "",
            `${PP} <strong>GitHub Copilot Memory</strong>`,
            "Repository / user",
            "Persists repository facts and user preferences. Facts keep their citation and are verified against the current branch. <strong>They expire after 28 days without use.</strong> Used by the cloud agent, code review, and the CLI.",
        ],
        [
            `<strong>Task context</strong><br><span class="muted">outcome, scope, acceptance criteria, the references you were given</span>`,
            "The Issue body (i.e. where the Delegation Contract lives)",
            "GitHub Issues",
            "§03 gives the mapping table for all eight fields.",
        ],
        [
            "",
            `${PP} ${OFFICIAL} <strong>Copilot prompt files</strong>`,
            `${c(".github/prompts/*.prompt.md")}`,
            `Reusable prompt templates. <code>agent</code> and <code>description</code> in YAML; inputs take the form <code>` + "${input:code:...}" + `</code>. <strong>IDE Chat only</strong> (undocumented for GitHub.com Chat and the CLI).`,
        ],
        [
            `<strong>Dynamic context</strong><br><span class="muted">the current code, tool results, failures, assumptions that have changed</span>`,
            `${OFFICIAL} <strong>MCP (Model Context Protocol)</strong>`,
            "The repository's MCP JSON configuration / IDE / CLI",
            "Supplies external tools and context. The cloud agent and code review share the same repository MCP configuration.",
        ],
        [
            "",
            "Build, test, and scan results",
            "GitHub Actions / CodeQL / Dependabot",
            "Covered in §08. The agent reads failures and iterates on them.",
        ],
    ],
    { widths: ["18%", "22%", "26%", "34%"] },
)}

<h3>Precedence of custom instructions (GitHub.com)</h3>
${steps([
    { title: "1. Personal instructions", body: "Personal settings. GitHub.com Chat only." },
    { title: "2. Path-specific instructions", body: `Whichever of ${c(".github/instructions/**/*.instructions.md")} matched on <code>applyTo</code>.` },
    { title: "3. Repository-wide instructions", body: c(".github/copilot-instructions.md") },
    { title: "4. Agent instructions", body: `${c("AGENTS.md")} (and, on the environments that support them, <code>CLAUDE.md</code> / <code>GEMINI.md</code>)` },
    { title: "5. Organization instructions", body: "Organization settings." },
])}

${callout(
    "warn",
    "This is precedence guidance, not a deterministic parser rule",
    `<p>The official documentation states plainly that <em>all relevant instruction sets are passed to Copilot</em>. In other words there is <strong>no guarantee that a higher entry overrides a lower one</strong>. Put contradictory instructions at several levels and which one the model follows is non-deterministic.<br>The requirement that context be <em>owned, reviewed, maintained</em> should be read as the practical answer to that non-determinism — leaving no contradictions in place is what ownership actually consists of.</p>`,
)}

<h3>The format of path-specific instructions</h3>
${pre("md", "---\napplyTo: \"**/*.java,**/auth/**\"\nexcludeAgent: \"code-review\"\n---\n\nWhen changing the authentication module, read the existing characterization tests first.\nDo not change the signatures of public APIs.")}
<p class="muted"><code>excludeAgent</code> accepts <code>code-review</code> or <code>cloud-agent</code>, so instructions can be aimed at one agent and withheld from another.</p>

<h3>Support by client</h3>
${table(
    ["Surface", "Instruction kinds supported"],
    [
        ["GitHub.com Chat", "Personal / repo-wide / organization"],
        ["GitHub.com cloud agent", `repo-wide / path-specific / ${c("AGENTS.md")}, <code>CLAUDE.md</code>, <code>GEMINI.md</code> / organization`],
        ["GitHub.com code review", `repo-wide / path-specific / ${c("AGENTS.md")} / organization`],
        ["VS Code Chat", `repo-wide / path-specific / ${c("AGENTS.md")}`],
        ["Visual Studio Chat", "repo-wide / path-specific"],
        ["JetBrains Chat", "Personal / repo-wide / path-specific"],
        ["Eclipse Chat", "repo-wide only"],
        ["Xcode Chat", "repo-wide / path-specific"],
        ["Copilot CLI", `repo-wide / path-specific / agent files / <code>~/.copilot/copilot-instructions.md</code>`],
    ],
    { widths: ["30%", "70%"] },
)}
<p class="muted">The current table: ${a("https://docs.github.com/en/copilot/reference/custom-instructions-support", "docs.github.com — Custom instructions support")}</p>

<h3>Implementation facts to know before using MCP</h3>
${ul([
    "<strong>The cloud agent and code review support only MCP tools.</strong> Resources and prompts are not supported, and neither are remote servers that authenticate with OAuth.",
    "The GitHub MCP and Playwright MCP servers are enabled by default. GitHub's default token is <strong>read-only against the current repository</strong>.",
    `<strong>Once configured, the cloud agent and code review can use MCP tools without human approval.</strong> This sits at the core of the Capability budget in §04.`,
    `Agents secrets passed to MCP must carry the ${c("COPILOT_MCP_")} prefix. Ordinary Agents secrets need no prefix.`,
    `${PP} The GitHub MCP Registry (${a("https://github.com/mcp", "github.com/mcp")}). Business and Enterprise can restrict it with the &ldquo;Restrict MCP access to registry servers&rdquo; policy, but <strong>that policy applies to the IDE and CLI and does not apply to the cloud agent</strong> (the cloud agent follows the repository's or the custom agent's MCP configuration).`,
])}

<h3>custom agents — a reusable profile for what you delegate to</h3>
<p>${PP}${badge("na", "Depends on the surface")} You can define named specialist agent profiles in ${c(".github/agents/<NAME>.md")}. The frontmatter takes <code>description</code> (required) plus <code>name</code>, <code>tools</code>, <code>model</code>, <code>target</code>, and <code>mcp-servers</code> (all optional). At organization and Enterprise level they live under <code>/agents/</code> in the <code>.github</code> or <code>.github-private</code> repository.</p>
${callout(
    "key",
    "This is what the Standardize rung of the adoption ladder looks like in practice (§12)",
    `<p>The Standardize rung of the adoption ladder is where a team reuses instructions, skills, workflows, evidence formats, and gates. custom agents are the mechanism that bundles instructions, tools, model, and MCP into a single reusable file — exactly the concrete artefact of that rung.</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 03
    {
        id: "contract",
        num: "03",
        eyebrow: "Delegation Contract",
        title: "Delegation Contract — The Eight Fields That Specify a Delegation",
        lead: "The Delegation Contract is the central concept of this guide. It consists of eight fields that make success, boundaries, proof, and decision gates inspectable before work begins. This section settles where in GitHub each of those fields has to be written for an agent to actually act on it — which makes it the most directly useful section here.",
        html: `
${principle(
    "A Delegation Contract makes success, boundaries, proof, and decision gates inspectable before work begins.<br>The contract grants bounded authority—not a blank cheque.",
)}

${diagram(
    contractDiagram("en"),
    "The eight fields that make up the Delegation Contract. The five green ones — Scope + Out, Tools + Constraints, Acceptance, Verification + Evidence, and Human gates — can be pushed down into deterministic mechanisms such as rulesets and required checks. The table that follows maps each field to where it is implemented.",
)}

${table(
    ["Field", "What the field says", "Where it is implemented on GitHub", "Enforcement"],
    [
        [
            `<strong>Outcome + Why</strong>`,
            "The observable result, and the business or technical purpose behind it",
            "<strong>The Issue title and body</strong> (the very Issue you assign to Copilot)",
            `<span class="soft">Prompt only</span>`,
        ],
        [
            `<strong>Scope + Out</strong>`,
            "What may be worked on, and what must explicitly not be changed",
            `Explicit exclusions in the Issue body + <code>applyTo</code> in ${c(".github/instructions/*.instructions.md")}<br>+ path restrictions in a <strong>ruleset / branch protection</strong><br>+ <strong>CODEOWNERS</strong>`,
            `<span class="hard">Structurally enforceable</span>`,
        ],
        [
            `<strong>Context</strong>`,
            "Repository knowledge, current behaviour, decisions already taken, assumptions",
            `${c("AGENTS.md")} / ${c(".github/copilot-instructions.md")} / <strong>Copilot Spaces</strong> / linked Issues and PRs / MCP`,
            `<span class="soft">Prompt only</span>`,
        ],
        [
            `<strong>Tools + Constraints</strong>`,
            "Permitted capabilities, limits, policies, budgets",
            `${c(".github/workflows/copilot-setup-steps.yml")} (<code>permissions:</code>, <code>timeout-minutes</code>)<br>+ the <strong>firewall allowlist</strong><br>+ the repository MCP configuration / <strong>Agents secrets</strong><br>+ the <code>tools:</code> frontmatter of a custom agent<br>+ <strong>AI Controls</strong> (organization / Enterprise policy)`,
            `<span class="hard">Structurally enforceable</span>`,
        ],
        [
            `<strong>Acceptance</strong>`,
            "The observable conditions that define &ldquo;done&rdquo;",
            "Acceptance criteria in the Issue + <strong>required status checks</strong>",
            `<span class="hard">Structurally enforceable</span>`,
        ],
        [
            `<strong>Verification + Evidence</strong>`,
            "Repeatable checks, and the evidence handed back for review",
            `<strong>GitHub Actions</strong> workflows / <strong>CodeQL</strong> / <strong>Dependabot</strong> / <strong>secret scanning</strong><br>+ the <strong>session log</strong> and <strong>Verified signed commits</strong>`,
            `<span class="hard">Structurally enforceable</span>`,
        ],
        [
            `<strong>Escalate</strong>`,
            "The ambiguities, risks, and failure conditions that should stop the work",
            `Hand it back to ${c("@copilot")} in an Issue or PR comment<br>+ the structure that <strong>stops by default at &ldquo;Approve and run workflows&rdquo;</strong>`,
            `<span class="mid">Semi-structural</span>`,
        ],
        [
            `<strong>Human gates</strong>`,
            "Named decisions that stay with an accountable person",
            `<strong>required reviews</strong> / <strong>mandatory CODEOWNERS approval</strong> / <strong>required reviewers on environments</strong> / <strong>merge queue</strong> / <strong>deployment protection rules</strong>`,
            `<span class="hard">Structurally enforceable</span>`,
        ],
    ],
    { widths: ["14%", "22%", "44%", "20%"] },
)}

${callout(
    "key",
    "Five of the eight fields can be structure rather than a request",
    `<p>This is the single most important point in this guide. Write the Delegation Contract only in the Issue body and every field stays a <strong>probabilistic instruction</strong>. But five of them — Scope, Tools, Acceptance, Verification, Human gates — can be pushed down into <strong>deterministic mechanisms</strong>: rulesets, required checks, the firewall, environments.<br>That is what &ldquo;<em>Reason probabilistically. Verify deterministically.</em>&rdquo; means at the implementation level, and it is the machinery that makes &ldquo;<em>Autonomous execution does not require autonomous acceptance.</em>&rdquo; hold (§08, §09).</p>`,
)}

<h3>The core structural guarantee: an agent cannot approve its own PR</h3>
${docQuote(
    "Copilot cloud agent cannot mark its pull requests as \"Ready for review\" and cannot approve or merge a pull request.",
    "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations",
    "docs.github.com — Risks and mitigations for Copilot cloud agent",
)}
<p>On top of that, <strong>an approval from the person who requested the task does not count towards required approvals either</strong>. The &ldquo;assign it yourself, approve it yourself&rdquo; path is structurally closed. &ldquo;Delegation transfers responsibility for executing an outcome, not the authority to merge&rdquo; is not a metaphor here; it is a description of the product specification.</p>

<h3>Turning the authentication-module example into real repository assets</h3>
${table(
    ["Contract field value (authentication module, abridged)", "What it becomes"],
    [
        [
            "&ldquo;You may change authentication code, configuration, tests, and any dependencies required. Roles, UI, schema, and rollout are out of scope.&rdquo;",
            `<code>applyTo: "**/auth/**"</code> in <code>.github/instructions/auth.instructions.md</code>. The role, UI, and schema paths get security and architecture owners as required reviewers through <strong>CODEOWNERS</strong>. Rollout is separated out into the required reviewers of an <strong>environment</strong>.`,
        ],
        [
            "&ldquo;Use approved dependencies and the tooling in the repository and CI. Never expose a production secret.&rdquo;",
            `Limit the <strong>firewall allowlist</strong> to approved dependency registries. Production secrets <strong>do not go into Agents secrets</strong> (by design, Actions, Codespaces, and Dependabot secrets are not passed through to the cloud agent).`,
        ],
        [
            "&ldquo;Get the build, the authentication tests, the compatibility tests, and the scans to pass. Return the commands run, the results, and how they map to the acceptance criteria.&rdquo;",
            `Register build, authentication tests, compatibility tests, and CodeQL as required status checks. The <strong>session log</strong> and the Actions logs carry the commands and results. Mapping back to the acceptance criteria is written into the PR body by a person — it is not automated.`,
        ],
        [
            "&ldquo;Hand control back on any ambiguity about roles, schema, security standards, or behaviour.&rdquo;",
            `Protect those paths with <strong>CODEOWNERS</strong> and a ruleset, and a required review fires the moment the agent touches them. <em>Rather than asking for an escalation, make touching it stop the work.</em>`,
        ],
        [
            "&ldquo;Approve the plan, the PR, the release, and the production rollout separately.&rdquo;",
            `Plan → review at the research/plan stage in the Agents UI. PR → required reviews. Release and production → <strong>deployment protection rules</strong> on <strong>environments</strong> (reviewers, wait timer, branch restrictions, no admin bypass).`,
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
        title: "Autonomy Budget — Allocating Autonomy Across Four Dimensions",
        lead: "Autonomy is not an on/off switch but a budget you allocate per task. This guide breaks it into four dimensions: Scope, Capability, Compute, and Decision. Every budget is tuned to reversibility, blast radius, and the quality of the evidence, and it is widened one dimension at a time. Each dimension is listed here together with the settings that actually allocate it.",
        html: `
${principle(
    "Autonomy has multiple dimensions that teams allocate per task. Expand it only when work is reversible, contained, and strongly evidenced.<br>Increase autonomy one bounded dimension at a time.",
)}

${diagram(
    autonomyDiagram("en"),
    "Autonomy broken into the four dimensions Scope, Capability, Compute, and Decision, each drawn as a band running from low to high. Autonomy is not an on/off switch but a budget allocated per dimension, and it is widened one dimension at a time. The cards that follow give the settings behind each dimension.",
)}

${cards(
    [
        {
            title: "Scope budget",
            badge: FRAMEWORK,
            body: `<p class="muted">Boundaries of files, components, repositories, and Issues</p>
      <ul class="plain tight">
        <li><strong>The default is already tight</strong>: the agent can push to exactly one <code>copilot/…</code> branch (or, when called into an existing PR with <code>@copilot</code>, that PR's branch)</li>
        <li>One task = one branch = one PR</li>
        <li>The agent's credentials allow only a simple push. <strong>It cannot run git commands directly</strong></li>
        <li>Path restrictions in a ruleset / branch protection</li>
        <li>Areas that CODEOWNERS makes subject to required review</li>
      </ul>`,
        },
        {
            title: "Capability budget",
            badge: FRAMEWORK,
            body: `<p class="muted">Tools, network, PR and workflow permissions</p>
      <ul class="plain tight">
        <li><strong>The firewall is on by default</strong>, with a recommended dependency allowlist. Organizations and repositories can define custom allowlists, and there is also a policy that forbids repository-level rules</li>
        <li>The repository MCP configuration (tools only, read-only by default)</li>
        <li><code>permissions:</code> in <code>copilot-setup-steps.yml</code></li>
        <li>Dedicated <strong>Agents secrets / variables</strong> (Actions, Codespaces, and Dependabot secrets are not passed through; values are masked in logs)</li>
        <li><code>tools:</code> and <code>mcp-servers:</code> on a custom agent</li>
        <li><strong>AI Controls</strong>: individual control over where the cloud agent is enabled, third-party agents, custom agents, code review, MCP, and model availability</li>
      </ul>`,
        },
        {
            title: "Compute budget",
            badge: FRAMEWORK,
            body: `<p class="muted">Execution time and concurrency</p>
      <ul class="plain tight">
        <li><code>timeout-minutes</code> in <code>copilot-setup-steps.yml</code> (<strong>59 minutes maximum</strong>)</li>
        <li>Spending limits on GitHub Actions minutes</li>
        <li>AI Credits and the <strong>budgets</strong> settings</li>
        <li>Concurrency equals the number of tasks a person submits from the Agents panel — so <strong>review capacity is the real ceiling</strong></li>
      </ul>`,
        },
        {
            title: "Decision budget",
            badge: FRAMEWORK,
            body: `<p class="muted">Required approvals and stop conditions</p>
      <ul class="plain tight">
        <li>required approvals / mandatory CODEOWNERS approval</li>
        <li><strong>&ldquo;Approve and run workflows&rdquo;</strong>: by default no workflow runs until someone with write access clicks it</li>
        <li>Required reviewers, wait timers, and the ban on self-review on environments</li>
        <li>merge queue / linear history / signed commits</li>
        <li>The bypass actor configuration on a ruleset (whether Copilot is a bypass actor is an explicit governance decision)</li>
      </ul>`,
        },
    ],
    { cols: 2 },
)}

${callout(
    "note",
    "How to use the fact that the defaults are already conservative",
    `<p>When someone asks &ldquo;won't the agent just do whatever it likes?&rdquo;, the effective answer is four defaults — <strong>(1)</strong> it can push to one dedicated branch and nothing else, <strong>(2)</strong> it can neither mark its own PR Ready nor approve nor merge it, <strong>(3)</strong> no workflow runs until a person clicks, <strong>(4)</strong> the network sits behind a firewall by default.<br>Talking about autonomy as a budget is useful precisely because <em>all of these can be loosened</em>. Deciding to loosen them is exactly what governance is.</p>`,
)}

<h3>Moving the Capability budget from declaration to enforcement — hooks ${OFFICIAL}</h3>
<p>Everything covered so far in the Capability budget — allowlists, permissions, tools — is <strong>declarative</strong>. You write &ldquo;this tool is allowed, that one is not&rdquo; as configuration, but nothing inspects an individual call at run time and stops it. <strong>hooks</strong> fill that gap: they run custom shell commands at key points in the agent's workflow and can <strong>approve or deny a tool execution as it happens</strong>.</p>
${docQuote(
    "preToolUse … This is the most powerful hook as it can approve or deny tool executions.",
    "https://docs.github.com/en/copilot/concepts/agents/hooks",
    "GitHub Docs — About hooks for GitHub Copilot",
)}
<p>hooks are available on the <strong>Copilot cloud agent and GitHub Copilot CLI</strong>. Put them in <code>.github/hooks/*.json</code> in a repository and they always apply when a Copilot agent is used there (the CLI additionally supports personal hooks in <code>~/.copilot/hooks/*.json</code>). There are eight execution points.</p>
${table(
    ["Hook kind", "When it runs", "Typical use"],
    [
        [`<code>sessionStart</code> / <code>sessionEnd</code>`, "Session start / end or interruption", "Initialising the environment, audit logging, cleaning up temporary resources"],
        [`<code>userPromptSubmitted</code>`, "When the user submits a prompt", "Audit logging of requests, usage analysis"],
        [`<strong><code>preToolUse</code></strong>`, "<strong>Before</strong> the agent uses a tool", `<strong>Approving or denying the tool execution</strong>, blocking dangerous commands, enforcing policy, requiring approval for sensitive operations, usage logging`],
        [`<code>postToolUse</code>`, "After a tool completes, whether it succeeded or not", "Logging results, statistics, audit trails, performance monitoring"],
        [`<code>agentStop</code> / <code>subagentStop</code>`, "When the main agent or a subagent finishes responding", "Inspecting subagent results (§06), completion notifications"],
        [`<code>errorOccurred</code>`, "When an error occurs during execution", "Error logging, notifications, pattern tracking"],
    ],
    { widths: ["26%", "34%", "40%"] },
)}
<p>The configuration consists of <code>version: 1</code> and a <code>hooks</code> object. Each hook takes <code>type:"command"</code> (required) with <code>bash</code> or <code>powershell</code>, and optionally <code>cwd</code>, <code>env</code>, and <code>timeoutSec</code> (30 seconds by default).</p>
${callout(
    "key",
    "hooks promote Capability, one of the four dimensions, into a dimension that bites at run time",
    `<p>If an allowlist or <code>tools:</code> is a <strong>declaration</strong> of what is allowed, <code>preToolUse</code> is the <strong>enforcement</strong> of whether the operation about to run can be stopped. It is where the failure patterns of §12 and the drift of §11 can be turned into something that cannot happen twice — a denied tool execution, a usage log for compliance. Note, though, that a hook blocks the agent synchronously, so <strong>it has to stay fast</strong> (the documentation recommends staying under 5 seconds).</p>`,
)}
`,
    },
];
