// English translation of PART 4: sections 08 (verification), 09 (pr),
// 10 (security), 11 (recovery).
// Terminology is bound by TERMS in ./i18n.mjs — do not diverge from it.
//
// Translation discipline enforced here (same as ./content-en-c.mjs):
//   * docQuote quotations are English originals and are never altered.
//   * principle() blockquotes are already English; the Japanese gloss (2nd arg)
//     is dropped because it is redundant for an English reader.
//   * Embedded partial quotations from the docs use the real documentation
//     wording, not a back-translation of the Japanese paraphrase.
//   * <code> contents, URLs, file names, and setting values stay untranslated.
//   * Cross-references (§08, §09, …) point at the same section numbers, and the
//     provenance split — GitHub product specification vs. this guide's own
//     framing — is preserved claim for claim.
//   * The PR diagram is the shared one from ./diagrams.mjs, called with "en" so
//     that only its labels, <title>, and <desc> change; the geometry is shared
//     and the Japanese output stays byte-for-byte identical.
import { badge, c, a, table, callout, principle, docQuote, cards, steps, ul, diagram } from "./ui.mjs";
import { prDiagram } from "./diagrams.mjs";

const OFFICIAL = badge("official", "Official");
const FRAMEWORK = badge("framework", "This guide's framing");
const GA = badge("ga", "GA");
const PP = badge("pp", "Public Preview");

export const sectionsEnD = [
    // ────────────────────────────────────────────────────────────── 08
    {
        id: "verification",
        num: "08",
        eyebrow: "Verification",
        title: "Reason probabilistically, verify deterministically",
        lead: `"Reason probabilistically. Verify deterministically." is the most implementation-near claim in this operating model. The probabilistic side is obvious; this section pins down, feature by feature, what the deterministic side is actually made of.`,
        html: `
${principle(
    "Use agent reasoning to interpret, explore, and propose. Accept work through repeatable checks with explicit pass or fail criteria.",
)}

${table(
    ["Layer", "Feature", "What it guarantees", "How it works with the cloud agent"],
    [
        [
            `<span class="prob">Probabilistic</span>`,
            "Reasoning in Copilot Chat / Agent mode / the cloud agent",
            "Interpreting intent, spotting patterns, proposing options",
            "The reasoning and tool-call history is kept in the session log",
        ],
        [
            `<span class="det">Deterministic</span>`,
            `<strong>GitHub Actions</strong> (build and test)`,
            "Compilation, and behaviour that has been specified",
            `<strong>Does not run automatically by default</strong>. It waits until someone with write access clicks "Approve and run workflows"`,
        ],
        [
            `<span class="det">Deterministic</span>`,
            `<strong>CodeQL</strong> (code scanning)`,
            "Evaluation against the queries and rules you have configured",
            `<strong>Built into the cloud agent even without GHAS / Code Security</strong>`,
        ],
        [
            `<span class="det">Deterministic</span>`,
            `<strong>Dependabot / GitHub Advisory Database</strong>`,
            "Detecting dependencies with known vulnerabilities, and drift outside the approved dependency set",
            "Same as above (built in)",
        ],
        [
            `<span class="det">Deterministic</span>`,
            `<strong>secret scanning</strong>`,
            "Detecting committed secrets",
            "Same as above (built in)",
        ],
        [
            `<span class="det">Deterministic</span>`,
            `<strong>required status checks</strong>`,
            "Defining which of the above must pass before a merge is allowed",
            "Applies to the agent's PRs just the same",
        ],
        [
            `<span class="mixed">Mixed</span>`,
            `<strong>Copilot code review</strong>`,
            "Flagging possible problems and suggesting fixes",
            `${GA}. But it <strong>always leaves a "Comment" review</strong> — never Approve or Request changes — so it <strong>is not a merge gate</strong>`,
        ],
    ],
    { widths: ["10%", "24%", "32%", "34%"] },
)}

${callout(
    "key",
    "An easily missed fact: the cloud agent has security verification built in without GHAS",
    `<p>The official risks-and-mitigations page states explicitly that, for the cloud agent's work, <strong>CodeQL, dependency checks against the Advisory Database, secret scanning, and Copilot code review</strong> all apply, and that these <strong>do not require a GHAS / Code Security contract</strong>.<br>
    The way static analysis and CodeQL evaluate configured rules and queries is not something reserved for GHAS customers. That lowers the bar for proposing this work.</p>`,
)}

<h3>Deterministic merge gates — using rulesets to design "cannot merge unless it passes"</h3>
<p>What turns verification from "reference information" into a "gate" is the ruleset. The agent's PRs, like a human's, cannot merge unless they pass these gates. On top of branch protection, required status checks, linear history, and signed commits, there is a full set of rules that <strong>can make the analysis results themselves a merge condition</strong>.</p>
${table(
    ["Ruleset rule", "What blocks the merge", "Status"],
    [
        [
            "<strong>Require code scanning results</strong>",
            "A required tool has found an alert at the specified severity, an analysis is still in progress, or a tool has not been configured — any of these",
            OFFICIAL,
        ],
        [
            "<strong>Require code quality results</strong>",
            `A GitHub Code Quality analysis is in progress, has failed, or has produced a result at or above the specified severity — any of these`,
            `${OFFICIAL} <span class="muted">Code Quality reached GA on 2026-07-20</span>`,
        ],
        [
            "<strong>Restrict code coverage</strong>",
            `Blocks on two thresholds: <strong>Minimum coverage percentage</strong> (the PR branch's aggregate coverage is below the configured value) and <strong>Maximum coverage drop</strong> (a fall of at least the configured number of points relative to the default branch). Requires Code Quality to be enabled and coverage data to be uploaded`,
            `${PP}`,
        ],
        [
            "<strong>Require deployments to succeed before merging</strong>",
            "Requires a successful deployment to a specified environment (for example, requiring a successful deployment to staging before merging to the default branch)",
            OFFICIAL,
        ],
    ],
    { widths: ["26%", "56%", "18%"] },
)}
${docQuote(
    "This feature is in public preview and subject to change.",
    "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets",
    "GitHub Docs — Available rules for rulesets (Restrict code coverage)",
)}
<p>Read this together with "Copilot code review only comments and never blocks" (the table above) — <strong>put the verification you want to block on, on the ruleset side, not in review comments</strong>. That is the design principle of deterministic verification (§09).</p>

<h3>When the agent also writes the tests, review the "intent of the tests" first</h3>
<p>If you let the agent write both the implementation and the tests, there is a risk that the <strong>tests are written to suit the implementation</strong> (the tests bend toward simply passing). That is why the modernize-legacy-code procedure in §07 takes the order of "<strong>first build a test plan for the business logic, then generate tests against it</strong>." Here we generalize that.</p>
${steps([
    { title: "1. A person reviews the intent of the tests", body: `A person confirms "what is protected and why" (the test plan and acceptance criteria) before the implementation. This is the design point of the verification net.` },
    { title: "2. Have tests generated in line with that intent", body: "The agent writes tests against the approved intent. Characterization tests pin down observed behaviour (§05, §07)." },
    { title: "3. Have the implementation generated, and verify it with the tests and the ruleset", body: "Because the tests already exist, there is less room for the implementation to bend just to pass them. The deterministic gates (the table above) carry the final decision." },
])}

${callout(
    "warn",
    "Flaky tests make a gate non-deterministic — quarantine them",
    `<p>A <strong>flaky (unstable) test</strong>, whose pass or fail wobbles from run to run, breaks the premise of a deterministic merge gate. A flaky test sitting on a gate destroys the determinism of "decide reproducibly," and leads to a practice of either <strong>failing the agent's PR for no reason or force-passing it by re-running</strong>.<br>
    The remedy is <strong>quarantine</strong> — take a test that has proven flaky off the required gates (quarantine it) and track down the cause separately. To call something deterministic verification, the tests placed on the gate must first be deterministic.</p>`,
)}

<h3>A note so "deterministic" is not misread</h3>
<p>"Deterministic" here means <em>explicit and reproducible within the range of configured inputs</em>, not <strong>infallible</strong>. CodeQL <strong>only sees the queries you configured</strong>. Tests <strong>only protect the behaviour you wrote</strong>.<br>That is why characterization tests (§05) come first — with no verification net in place, deterministic verification merely returns "detects nothing" reproducibly.</p>

${callout(
    "warn",
    `There is no feature called "characterization test"`,
    `<p>There is <strong>no</strong> GitHub feature named "characterization testing." You implement it in one of these ways:<br>
    ① unit-test generation in Copilot Chat; ② the procedure the ${a("https://docs.github.com/en/copilot/tutorials/modernize-legacy-code", "modernize-legacy-code tutorial")} teaches — "first build a test plan for the business logic, then generate tests against it"; ③ App modernization for Java migrating existing tests and generating new unit tests (including behavioral-integrity verification).<br>
    Characterization tests <strong>preserve observed behaviour, not correctness</strong> — correct as a general principle of legacy remediation, but not something to present as a product feature name.</p>`,
)}
`,
    },

    // ────────────────────────────────────────────────────────────── 09
    {
        id: "pr",
        num: "09",
        eyebrow: "Governance",
        title: "Five structural guarantees that make the PR a governance boundary",
        lead: `"The pull request is the governance boundary" and "Autonomous execution does not require autonomous acceptance" are backed by product specification, not metaphor. This section separates what is guaranteed from what is not.`,
        html: `
${principle(
    "The pull request reconnects intent, delegated execution, verification, and accountable human acceptance.<br>Autonomous execution does not require autonomous acceptance.",
)}

${diagram(
    prDiagram("en"),
    "Four lanes — human, agent, PR, and CI. The agent takes the delegation, implements it on a single copilot/… branch, and opens a draft PR, but it can do none of making the PR Ready, Approve, or Merge on the right of the boundary line (×). Acceptance is done by a human reviewing. The details of each guarantee are in the list immediately below.",
)}

<h3>What the product specification guarantees</h3>
${steps([
    {
        title: "Someone without write access cannot start the agent",
        body: "Only users with write access to the repository can trigger it. Comments from people without write access are not passed to the prompt. On top of that, hidden characters and HTML comments are filtered out before they reach the prompt (a defence against prompt injection).",
    },
    {
        title: "The agent can push to only one branch",
        body: `Normally a new <code>copilot/…</code> branch is created and it can push only there. If you call it on an existing PR with <code>@copilot</code>, it is that PR's branch. <strong>The agent cannot run git commands directly</strong> and is limited to simple push operations. Branch protection and required checks naturally apply.`,
    },
    {
        title: "The agent cannot make its own PR Ready, Approve it, or Merge it",
        body: "In addition, <strong>the approval of the very person who requested the task does not count toward required approvals</strong>. The \"whoever asked approves it\" loophole is structurally closed.",
    },
    {
        title: "Workflows do not run automatically by default",
        body: "They do not run until someone with write access clicks <strong>Approve and run workflows</strong>. You can make them run automatically, but that is an explicit opt-in.",
    },
    {
        title: "The outputs are traceable",
        body: `Commits are <strong>Verified signed commits</strong> with Copilot as author and the requester as co-author, linked to the session log. The Enterprise audit log can be searched with <code>actor:Copilot</code> over the past 180 days, and carries <code>actor_is_agent</code>, <code>agent_session_id</code>, and <code>user</code> fields.`,
    },
])}

<h3>Evidence Package — bundling "on what grounds to accept" onto the PR ${FRAMEWORK}</h3>
<p>This guide calls the bundle of outputs the agent should return on the PR the <strong>Evidence Package</strong>. This is not an official product feature name but <strong>this guide's own organizing vocabulary</strong> (§16), and it consists of the following three materials. What a person judges when merging is not the code itself but this bundle.</p>
${cards(
    [
        {
            title: "Code — the change itself",
            badge: OFFICIAL,
            body: `The <strong>Verified signed commits</strong> and diff on the <code>copilot/…</code> branch. The author is Copilot, the co-author is the requester, and it traces back to the session log.`,
        },
        {
            title: "Evidence — the record of verification",
            badge: OFFICIAL,
            body: `The results of build, test, CodeQL, dependency checks, secret scanning, and Copilot code review are attached to the PR. <strong>The fact that it passed the deterministic gates (§08)</strong> shows up here.`,
        },
        {
            title: "Uncertainty — open questions and assumptions",
            badge: FRAMEWORK,
            body: `Open points, the assumptions made, and explicit questions. <strong>The agent can write them, but is not forced to</strong> (the table below). You make an Uncertainty section mandatory in <code>AGENTS.md</code> and fill it in.`,
        },
    ],
    { cols: 3 },
)}
${callout(
    "note",
    `The Evidence Package is "material," not a "decision"`,
    `<p>The three materials assemble automatically, but <strong>the mapping onto the acceptance criteria (the mapping that says this piece of evidence satisfies this criterion) is not generated automatically</strong> (the table below). The Evidence Package does not remove the need for review; it is an arrangement that <strong>raises review from "reading the code" to "matching evidence against criteria."</strong> The deterministic gates of §08 underwrite the quality of the Evidence, and the PR structure of this section underwrites accountability for acceptance.</p>`,
)}

<h3>What is not guaranteed (the parts a person must design)</h3>
${table(
    ["What this operating model requires", "Where it stands today", "How to fill the gap in practice"],
    [
        [
            `"Link the Delegation Contract and the Issue to the agent's session, branch, and resulting changes"`,
            `<span class="mid">Partial</span> The Issue → PR → session log links are automatic. <strong>Versioning of the Delegation Contract itself is not automated</strong>`,
            "Put the contract in the Issue body and keep its edit history. Templatize it to prevent any of the 8 fields from being missing",
        ],
        [
            `"Map evidence to all acceptance criteria"`,
            `<span class="neg">None</span> The pass/fail of checks appears, but <strong>the mapping onto acceptance criteria is not generated automatically</strong>`,
            "Put an acceptance-criteria checklist in the PR body template, and have the reviewer fill it in",
        ],
        [
            `"List open questions and assumptions" and "ask explicit questions" (declaring uncertainty)`,
            `<span class="mid">Prompt-dependent</span> The agent can write them, but <strong>is not forced to</strong>`,
            `Spell out in <code>AGENTS.md</code> that "the PR body must always include an Uncertainty section listing open questions and assumptions"`,
        ],
        [
            `"Review architectural fit, compatibility, and operational impact"`,
            `<span class="neg">Humans only</span> Copilot code review <strong>always leaves a Comment review</strong> and makes no approval decision`,
            "Use CODEOWNERS to assign the architecture / security owners as required reviewers",
        ],
        [
            `"Treat merge, release, and production deployment as explicit and, where appropriate, separate gates"`,
            `<span class="pos">Possible</span>`,
            "Separate the three with environments plus deployment protection rules. Configure required reviewers, a wait timer, no self-review, and no admin bypass",
        ],
        [
            `"Version the agent's automated execution itself alongside the code"`,
            `<span class="neg">None</span> <strong>The automations definition is not committed to Git</strong>. It is stored separately from the repository's contents and can be changed without going through a PR`,
            `An automation is a <strong>loophole</strong> in the "PR is the governance boundary" thesis. Inventory who holds which automation separately, and catch it on the ruleset of the output (the PR) side (§06, §10)`,
        ],
    ],
    { widths: ["30%", "34%", "36%"] },
)}

${callout(
    "warn",
    "A governance hole: automations are outside Git and outside version control",
    `${docQuote(
        "Automations are stored separately from your repository's contents. They are not committed to Git, so they are not versioned alongside your code or managed through pull requests.",
        "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations",
        "GitHub Docs — About Copilot automations",
    )}
    <p>Automations (§06) run the cloud agent unattended on a schedule or an event, but <strong>the definition itself does not go through a PR and leaves no trace in the Git history</strong>. It is a real loophole in this guide's "the PR is the governance boundary" thesis. That said, the PRs an automation <strong>produces</strong> pass through the ruleset and required reviews as usual, so the practical governance is to catch it twice — <strong>the entrance (the automation definition) by inventory, and the exit (the generated PR) by the deterministic gates</strong>.</p>`,
)}

${callout(
    "note",
    "Do not misplace Copilot code review",
    `${docQuote(
        "Copilot always leaves a 'Comment' review, not an 'Approve' review or a 'Request changes' review.",
        "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review",
        "docs.github.com — Using Copilot code review",
    )}
  <p>In other words, Copilot code review is a <strong>signal, not a gate</strong>. What is asked of a human is to "review the judgement, not just the diff" — judgement about the layer Copilot does not flag: architectural fit, compatibility, operational impact, and residual uncertainty. The accurate framing is not that an automated review removes the need for human review, but that <strong>human review can concentrate on the higher-order questions</strong>.</p>
  <p class="muted">Note that Copilot code review is manual by default (nominate Copilot from the PR's Reviewers). Automatic review of new PRs can be enabled in settings, and can also cover drafts and new pushes. It respects custom instructions, <code>AGENTS.md</code>, path-specific instructions, agent skills, and MCP (agent skills and MCP support reached GA on 2026-07-29).</p>`,
)}

${callout(
    "update",
    "The agentic capabilities of code review — whole-project analysis and handing fixes to the cloud agent",
    `<p>Copilot code review is not merely a diff commenter; it has agentic capabilities. The earlier property — "Comment only, non-blocking" — still holds for these, though.</p>
  ${ul([
      `<strong>full project context gathering</strong> ${a("https://docs.github.com/en/copilot/concepts/agents/code-review", "(official)")}: it analyses the whole repository, not just the diff, and comments with the ripple effects of the change in mind`,
      `<strong>handing a suggestion to the cloud agent to auto-create a fix PR</strong> ${PP}: you can delegate a review comment straight to the cloud agent and raise a fix PR. The generated PR still passes through the ruleset and required reviews as usual (§08)`,
      `Out-of-scope files: dependency-management files (<code>package.json</code>, <code>Gemfile.lock</code>, etc.), log files, and SVGs are not reviewed`,
  ])}
  <p class="muted">The available surfaces also include <strong>Azure DevOps</strong> ${PP}. It can be made available on GitHub.com even to organization members without a Copilot license (Business / Enterprise, enable two policies, off by default).</p>`,
)}

<h3>merge queue — integrating multiple agent PRs serially</h3>
<p>As you push parallel delegation (§06) further, <strong>several PRs aimed at the same default branch appear at once</strong>. Each PR may be green against the base at the time it was created, yet break through interaction as they are merged in turn — the same problem as with human PRs, but one whose frequency rises as the agent's concurrency grows. <strong>merge queue</strong> serializes this.</p>
${ul([
    `The queue builds each PR on a temporary branch <strong>with the preceding PRs merged in</strong>, evaluates the required status checks, and then merges them in turn — it confirms green on "the combination just before merge"`,
    "Agent PRs and human PRs go through the same queue. There is no special treatment for the agent, and <strong>if you make required checks mandatory in the ruleset (§08), the queue enforces them</strong>",
    `If the ceiling on concurrency is review capacity, then <strong>the serial point of integration is the merge queue</strong>. Build in parallel, accept in series — this asymmetry is the operational face of "autonomous execution ≠ autonomous acceptance"`,
])}`,
    },

    // ────────────────────────────────────────────────────────────── 10
    {
        id: "security",
        num: "10",
        eyebrow: "Security",
        title: "The security settings delegation presupposes, and the holes that remain",
        lead: "Security decides whether work may be delegated, how it may execute, and what must be true before acceptance. This section maps real settings onto the three stages Before execution / During execution / Before acceptance, and then corrects one common misunderstanding into its technically correct form.",
        html: `
${principle(
    "Security determines whether work may be delegated, how it may execute, and what must be true before humans can accept it.<br>Stop and escalate on unexpected dependencies, sensitive data, permission gaps, or policy violations.",
)}

${cards(
    [
        {
            title: "① Before execution",
            body: `<p class="muted">Approve the information sources, tools, network, scope, dependencies, and secret handling</p>
      <ul class="plain tight">
        <li><strong>firewall allowlist</strong> (on by default, with a recommended dependency allowlist)</li>
        <li>Repository MCP configuration (tools only; the default GitHub token is read-only)</li>
        <li><strong>Agents secrets / variables</strong> (Actions, Codespaces, and Dependabot secrets are not passed through)</li>
        <li><strong>AI Controls</strong>: allow the cloud agent / third-party agents / custom agents / code review / MCP / models individually</li>
        <li><strong>content exclusion</strong> (Business, Enterprise)</li>
      </ul>`,
        },
        {
            title: "② During execution",
            body: `<p class="muted">Least privilege, isolation, build, test, scan, and attributable logs</p>
      <ul class="plain tight">
        <li>Only those with write access can trigger it; comments from non-write users are not passed through</li>
        <li>Hidden characters and HTML comments are filtered out</li>
        <li>Limited to one <code>copilot/…</code> branch; no direct git execution</li>
        <li>An ephemeral environment (Ubuntu by default; Ubuntu x64 / Windows 64-bit supported, macOS not supported)</li>
        <li>Built-in CodeQL, dependency checks, and secret scanning</li>
        <li>Secret values are masked in the session log</li>
      </ul>`,
        },
        {
            title: "③ Before acceptance",
            body: `<p class="muted">Checks, security review, human approval, and a retained audit trail</p>
      <ul class="plain tight">
        <li>required status checks</li>
        <li>required reviews / CODEOWNERS</li>
        <li>Workflows are held until <strong>Approve and run workflows</strong></li>
        <li>Verified signed commits + the session log</li>
        <li>The audit log <code>actor:Copilot</code> (180 days), and the AI Controls session list</li>
        <li>${PP} agentic audit-log streaming (EMU, specific data-residency environments)</li>
      </ul>`,
        },
    ],
    { cols: 3 },
)}

${callout(
    "update",
    "A common misunderstanding: the belief that content exclusion does not apply to the cloud agent is wrong",
    `<p>It is sometimes explained that "content exclusion does not apply to the Copilot cloud agent," but this <strong>contradicts the current documentation</strong>. In the table on ${a("https://docs.github.com/en/copilot/reference/supported-surfaces-for-policies", "Supported surfaces for GitHub Copilot policies")}, content exclusion is shown as follows:</p>
  ${table(
      ["Surface", "content exclusion"],
      [
          ["IDEs", `<span class="pos">Applies</span>`],
          ["<strong>Copilot cloud agent</strong>", `<span class="pos">Applies</span>`],
          ["Copilot Chat in GitHub", `<span class="pos">Applies</span>`],
          ["Copilot code review", `<span class="pos">Applies</span>`],
          ["Third-party agents", `<span class="neg">Does not apply</span>`],
          ["Copilot CLI", `<span class="neg">Does not apply</span>`],
          ["GitHub Copilot app", `<span class="neg">Does not apply</span>`],
          ["Spark", `<span class="neg">Does not apply</span>`],
      ],
      { widths: ["60%", "40%"] },
  )}
  <p>Correctly stated: "content exclusion applies to the cloud agent, but <strong>does not apply to third-party agents or Copilot CLI</strong>." A decision to widen delegation to third-party agents such as Claude / Codex changes meaning on exactly this point.</p>`,
)}

${callout(
    "warn",
    "Another important limit of content exclusion",
    `${docQuote(
        "Content exclusion is currently not supported in Edit and Agent modes of Copilot Chat in Visual Studio Code and other editors.",
        "https://docs.github.com/en/copilot/concepts/context/content-exclusion",
        "docs.github.com — Content exclusion",
    )}
  <p>In other words, content exclusion does not take effect in the IDE's Agent mode. It is also documented that context can leak indirectly through the semantic and type information the IDE provides, and that symbolic links and repositories on remote file systems are not supported.</p>`,
)}

<h3>The firewall's holes (still in effect)</h3>
${ul([
    "The firewall covers <strong>only the agent process started from Bash inside the Actions appliance</strong>",
    "<strong>It does not cover MCP servers</strong>",
    `<strong>It does not cover the setup steps in <code>copilot-setup-steps.yml</code></strong>`,
    "The official documentation itself says a sophisticated attack may evade it",
])}
<p>The principle "stop and escalate on unexpected dependencies, sensitive data, permission gaps, or policy violations" is most accurately read as a design requirement to close these holes on the human side. <strong>A decision to add an MCP server is a decision to add one more path that does not pass through the firewall</strong>, and it is something to handle explicitly in the Tools + Constraints fields of the Delegation Contract (§03).</p>

<h3>The automations prompt-injection default — ignoring external triggers by default</h3>
<p>Automations (§06) can <strong>fire the cloud agent unattended on repository events</strong> such as issue creation or PR open. This creates an attack surface — "an external contributor opens an issue and drives Copilot on their own" — but it is closed by default.</p>
${docQuote(
    "By default, automations ignore events triggered by users who do not have write access to the repository.",
    "https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations",
    "GitHub Docs — About Copilot automations",
)}
${ul([
    "By default, <strong>events triggered by users without write access are ignored</strong> (you can allow them by opt-in)",
    "Automations are <strong>only on private / internal repositories</strong>, are <strong>scoped to a single repository</strong>, and can act only within that repository",
    `The main means of scope control is <strong>the selection of tools</strong> — "Grant only the tools that the task needs"`,
])}
<p>This default is the automation version of §09's "someone without write access cannot start the agent." But as noted, <strong>the automation definition itself is outside Git management</strong> (§09), so who holds which automation, with which trigger and tools, must be <strong>inventoried outside of code review</strong>.</p>
`,
    },

    // ────────────────────────────────────────────────────────────── 11
    {
        id: "recovery",
        num: "11",
        eyebrow: "Deviation & Recovery",
        title: "Drift and recovery — what to do when an agent goes off course",
        lead: "§15 covers \"work you must not delegate\" and operational failure patterns, but the recovery procedure for when an agent goes off course mid-execution has been missing from this guide until now. This section pins down the decision to steer, stop, abandon, or retry during execution, and what state is left behind in each case. Every fact stated here is one confirmed against a primary source, and only those.",
        html: `
${principle(
    "When an agent goes off course, recovery is a decision—steer, stop, abandon, or retry—and every choice leaves state behind.",
)}

<h3>Four interventions — when to choose which</h3>
${table(
    ["Intervention", "What the action does", "When to choose it", "State left / caveats"],
    [
        [
            `<strong>Steering</strong>`,
            "Send an extra prompt during the session to change direction",
            "The direction is right but you want to fix details / add to the premises",
            `<strong>Takes effect after the current tool call completes</strong>. <span class="neg">Consumes AI Credits</span>. <strong>Cannot be sent to third-party-integrated agents</strong>`,
        ],
        [
            `<strong>Stop (stop session)</strong>`,
            "Stop the running session",
            "It is clearly heading the wrong way and continuing is pointless",
            `<strong>The Actions run ends, but <span class="neg">commits already pushed remain on the branch</span></strong>. Stopping is not the same as rolling back`,
        ],
        [
            `<strong>Abandon</strong>`,
            "Discard the session's output without adopting it",
            "Starting over is faster / the premise itself was wrong",
            `A cloud session can be <strong>archived but not deleted</strong> (only local sessions can be deleted). The history remains`,
        ],
        [
            `<strong>Retry</strong>`,
            "Have the agent run the same request again",
            "A transient failure or timeout, where the request itself is sound",
            `There is no general "re-run" button. <strong>For an Issue, unassign → reassign; for a PR comment, repost the same comment</strong>`,
        ],
    ],
    { widths: ["16%", "26%", "28%", "30%"] },
)}

${callout(
    "warn",
    "Stopping does not erase state — handling pushed commits",
    `<p>A stop ends the Actions run, but <strong>the commits the agent has already pushed to the <code>copilot/…</code> branch remain as they are</strong>. So "I stopped it = nothing happened" does not hold. You must decide, including what to do with the branch and draft PR left behind (abandon them, or have a person take over). §09's "the PR is the governance boundary" thesis holds here too — even if unreviewed commits remain, they do not enter the default branch unless they clear the merge gate.</p>`,
)}

<h3>The timeout for a stuck session</h3>
<p>${OFFICIAL} What the primary source defines is <strong>the handling of a stuck session</strong>. A session can appear stuck for a while and then start moving again, and if it stays stuck it <strong>times out after one hour</strong>. The recovery means are fixed too: for an issue assignment, <strong>unassign → reassign</strong>; if it stalled while responding to a PR comment, <strong>post the same comment again</strong> (matching "Retry" in the table above).</p>
${docQuote(
    "If the session remains stuck, it will time out after an hour. You can retry by unassigning the issue and then reassigning it to Copilot.",
    "https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent",
    "docs.github.com — Troubleshooting GitHub Copilot cloud agent",
)}
<p>${FRAMEWORK} On the other hand, <strong>the public documentation does not say there is any cap on the running time of a session that is progressing normally</strong>. So it is wrong to rely on "one hour" as a design ceiling for how much work you can pack into a single session. Even so, §06's decomposition criteria (bring work down to a unit that can be reviewed and merged independently) still hold, and the grounds are not the timeout but <strong>the size of what you lose when a stall or drift occurs</strong> — the longer a single session is, the wider the range you have to roll back and the higher the cost of re-running.</p>

<h3>The criteria for iterate versus abandon</h3>
${cards(
    [
        {
            title: "Choose iterate (keep going and fix)",
            badge: FRAMEWORK,
            body: `The direction is right and most of the diff is usable. The remaining errors look likely to converge through an extra prompt (steering) or PR comments. <strong>The premises are still alive</strong>.`,
        },
        {
            title: "Choose abandon (discard and start over)",
            badge: FRAMEWORK,
            body: `The premise itself was wrong, or the diff is broadly wrong and re-delegating is faster than patching. The right move is to <strong>rewrite the Scope or Acceptance of the Delegation Contract (§03) before starting over</strong>. Retrying with the same contract will go off course at the same place.`,
        },
    ],
    { cols: 2 },
)}

${callout(
    "warn",
    "The CLI's local rollback (/undo, /rewind) can overwrite manual work",
    `<p>The GitHub Copilot CLI's <code>/undo</code> (also <code>/rewind</code>, also triggered by a double Esc) restores a snapshot, but it <strong>reverts every change made since the snapshot and deletes the new files created in between</strong>. Because it <strong>does not distinguish the agent's changes from changes a person made by hand</strong>, a rollback can take manual work down with it. And this action cannot be undone. Before you roll back, stash your local uncommitted changes.</p>`,
)}

<h3>Returning failure to structure — the practical version of PR → Learning</h3>
<p>The last move in recovery is to <strong>reduce the same failure to a mechanism that never lets it happen again</strong>. This is nothing but §05's transform loop "PR → Learning" run against the concrete input of drift. For each type of drift, the destination is fixed.</p>
${table(
    ["Type of drift", "Where it lands", "Section it connects to"],
    [
        [
            "The agent repeats the same misunderstanding (conventions, premises)",
            `Write it out explicitly in <code>*.instructions.md</code> / <code>AGENTS.md</code> / <strong>agent skills</strong> (<code>.github/skills</code>)`,
            "§02 Context Engineering",
        ],
        [
            "Regression (something once-fixed breaks again)",
            "Add <strong>characterization tests</strong> that pin that behaviour down, and run them on every PR thereafter",
            "§07 modernization / §08 verification",
        ],
        [
            "It stepped into a dangerous operation or policy violation",
            `Deny that tool call with <strong>the <code>preToolUse</code> hook</strong> / add a gate with ${c("ruleset")}`,
            "§04 autonomy / §08 verification",
        ],
        [
            "Unreviewed changes nearly crossed the merge gate",
            `Tighten required checks, required reviews, and CODEOWNERS (${c("ruleset")})`,
            "§08 verification / §09 pr",
        ],
    ],
    { widths: ["34%", "44%", "22%"] },
)}
${callout(
    "key",
    `Measure recovery by "whether the next delegation goes off course at the same place"`,
    `<p>Stopping and rolling back are symptomatic treatment. <strong>Recovery is complete only once you have fully reduced the drift into one of instructions / agent skills / characterization tests / ruleset</strong>. Whether you have done so can be observed through the measurement covered from the next section on (§14), as "whether drift of the same kind is decreasing." Leaving recovery in an individual's memory is a governance failure.</p>`,
)}
`,
    },
];
