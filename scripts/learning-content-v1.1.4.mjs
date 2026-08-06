// Content model for the GitHub Copilot App v1.1.4 two-dimensional hands-on learning system.
//
// This module loads the 21 archived guides from scripts/guide-content/path-*.json (read-only —
// those archive files are never mutated) and layers deterministic, per-domain enrichment on top
// of every lab (the 21 archived guides plus four new v1.1.4 labs numbered 22-25 defined below).
// It also defines the six horizontal journeys and ten vertical tracks that make up the
// two-dimensional taxonomy, and verifies that every lab maps to at least one journey and one
// track (no orphans) before returning content to the renderer.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

function bi(ja, en) {
  if (!ja || !en) throw new Error("Bilingual value requires both ja and en");
  return { ja, en };
}

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Journeys (horizontal, outcome-spanning) and tracks (vertical, domain-deep)
// ---------------------------------------------------------------------------

export const journeys = [
  {
    id: "j1",
    number: 1,
    slug: "install-to-first-pr",
    title: bi("導入から最初の検証済みPRまで", "Install to first verified PR"),
    summary: bi(
      "アプリを導入し、最初のセッションを実行してから必要に応じてモデルを調整し、My WorkのIssueをレビュー済みPRとして着地させます。完了時には検証済みPRと片付いたsessionが残ります。",
      "Install the app, run a first session, optionally tune models, and land a My Work issue as a reviewed pull request. You finish with a verified PR and a cleaned-up session.",
    ),
    labs: ["01", "03", "02", "11", "12", "13", "25"],
    optionalLabs: ["02"],
  },
  {
    id: "j2",
    number: 2,
    slug: "parallel-delivery-worktrees",
    title: bi("worktreeとSession Gridによる並列マルチセッション配信", "Parallel multi-session delivery with worktrees"),
    summary: bi(
      "worktreeで分離した複数sessionをSession Gridで監督し、Files、nested sessions、`/side`、handoffを段階的に加えます。完了時には衝突しない並列streamと復旧可能な引き継ぎが残ります。",
      "Supervise worktree-isolated sessions in Session Grid, then add Files, nested sessions, `/side`, and handoffs progressively. You finish with non-conflicting delivery streams and a recoverable handoff.",
    ),
    labs: ["04", "06", "09", "05", "07", "08", "24"],
  },
  {
    id: "j3",
    number: 3,
    slug: "issue-to-stacked-pr",
    title: bi("Issueからstacked PR配信まで", "Issue-to-stacked-PR delivery"),
    summary: bi(
      "target repositoryとmilestoneを確認したIssueから着手し、review、stack、merge queue、Agent Mergeを区別して着地します。完了時には関連Issueとstacked PRの状態遷移を説明できます。",
      "Start from an issue with an explicit target repository and milestone, then land it while distinguishing review, stacks, merge queue, and Agent Merge. You finish able to explain the issue and stacked-PR state transitions.",
    ),
    labs: ["11", "23", "12", "13", "22", "14", "25"],
  },
  {
    id: "j4",
    number: 4,
    slug: "automated-repository-operations",
    title: bi("自動化されたリポジトリ運用", "Automated repository operations"),
    summary: bi(
      "local automationから始め、cloud automation、security review、run observability、diagnosticsへ広げます。完了時には最小権限の自動運用と復旧runbookが残ります。",
      "Start with local automation, then expand to cloud automation, security review, run observability, and diagnostics. You finish with a least-privilege automated workflow and recovery runbook.",
    ),
    labs: ["16", "17", "15", "20", "24"],
  },
  {
    id: "j5",
    number: 5,
    slug: "extending-the-app",
    title: bi("custom agents、instructions、MCP、skills/plugins、Canvasで拡張する", "Extending with custom agents, instructions, MCP, skills, and Canvas"),
    summary: bi(
      "custom agentから始め、instructions、MCP、skills/plugins、Canvas extensionへ信頼境界を保って広げます。完了時にはscopeとsourceを説明できる共有extensionが残ります。",
      "Start with a custom agent, then extend through instructions, MCP, skills/plugins, and a Canvas extension while preserving trust boundaries. You finish with a shareable extension whose scope and source you can explain.",
    ),
    labs: ["18", "19", "10"],
  },
  {
    id: "j6",
    number: 6,
    slug: "production-operations",
    title: bi("プロダクション運用: モデル、コスト、アクセシビリティ、復旧", "Production operations"),
    summary: bi(
      "モデル・コスト・contextからアクセシビリティ、platform、storage、diagnostics、securityまでを運用runbookへ統合します。完了時には日常点検とincident recoveryの判断基準が残ります。",
      "Integrate models, cost, context, accessibility, platforms, storage, diagnostics, and security into an operations runbook. You finish with decision criteria for routine checks and incident recovery.",
    ),
    labs: ["02", "20", "21", "08", "24", "15", "25"],
  },
];

export const tracks = [
  {
    id: "t1",
    number: 1,
    slug: "sessions-worktrees",
    title: bi("セッション/worktreeアーキテクチャと保存場所の構成", "Session/worktree architecture and configurable location"),
    summary: bi(
      "セッションの実行場所（working tree、ローカルリポジトリ、cloud sandbox）と、v1.1.4のWorktree locationパステンプレートを扱います。",
      "Covers where sessions run (working tree, local repository, or cloud sandbox) and the v1.1.4 Worktree location path template.",
    ),
    labs: ["01", "04", "24"],
  },
  {
    id: "t2",
    number: 2,
    slug: "models-cost",
    title: bi("モデル、Auto、推論量、BYOK、キャッシュ、クレジット", "Models, Auto, reasoning, BYOK, cache, and credits"),
    summary: bi(
      "モデル選択とAuto、reasoning effortの永続化、ローカルBYOK、キャッシュとAI Creditsの消費を扱います。",
      "Covers model selection and Auto, persisted reasoning effort, local BYOK, and cache/AI Credits consumption.",
    ),
    labs: ["02", "20"],
  },
  {
    id: "t3",
    number: 3,
    slug: "planning-orchestration",
    title: bi("計画/オーケストレーション、Grid、nested、side、fork", "Planning, orchestration, Grid, nested sessions, side chats, and forks"),
    summary: bi(
      "実行モードの選択、nested sessionsの計画承認、Session Grid、`/side`、chatの巻き戻しとforkを扱います。",
      "Covers choosing execution modes, nested-session plan approval, the Session Grid, `/side`, chat rewind, and forks.",
    ),
    labs: ["03", "06", "05", "07"],
  },
  {
    id: "t4",
    number: 4,
    slug: "files-canvas",
    title: bi("ファイル/編集/差分/ブラウザー/Present/Canvas", "Files, editing, diffs, browser, Present, and Canvas"),
    summary: bi(
      "Filesでの直接編集、進行中・コミット済み・アーカイブ済み差分、ブラウザープレビュー、Present mode、Canvasを扱います。",
      "Covers direct editing in Files, live/committed/archived diffs, browser previews, Present mode, and canvases.",
    ),
    labs: ["09", "10"],
  },
  {
    id: "t5",
    number: 5,
    slug: "my-work-issues",
    title: bi("My Work、別リポジトリのIssue、マイルストーン、ディープリンク", "My Work, cross-repository issues, milestones, and deep links"),
    summary: bi(
      "My Workでの優先順位付け、現在のセッションとは異なるリポジトリへのIssue作成、マイルストーン、安全なdeep linkを扱います。",
      "Covers prioritizing in My Work, creating issues in a repository other than the current session, milestones, and safe deep links.",
    ),
    labs: ["11", "12", "23"],
  },
  {
    id: "t6",
    number: 6,
    slug: "pr-review-merge",
    title: bi("PR、Copilotレビュー、stacked PR、merge queue、Agent Merge、CI", "PR review, stacked PRs, merge queue, Agent Merge, and CI"),
    summary: bi(
      "Copilot code reviewの要求・再要求、stack status/navigation、merge drawerのサマリー、merge queue、Agent Mergeを扱います。",
      "Covers requesting/re-requesting Copilot code review, stack status/navigation, the merge-drawer summary, the merge queue, and Agent Merge.",
    ),
    labs: ["13", "14", "22", "25"],
    integrativeLabs: ["25"],
  },
  {
    id: "t7",
    number: 7,
    slug: "automations",
    title: bi("automations、filter、スケジュール、権限、リトライ", "Automations, filters, schedules, permissions, and retries"),
    summary: bi(
      "ローカルおよびcloud automationsのトリガー、smart query、最小権限ツール、実行状態、一時的なネットワーク障害からのリトライを扱います。",
      "Covers local and cloud automation triggers, smart queries, least-privilege tools, run status, and retry after transient network failures.",
    ),
    labs: ["16", "17"],
  },
  {
    id: "t8",
    number: 8,
    slug: "extensibility",
    title: bi("拡張性: instructions、custom agents、MCP、skills、plugins、.github/skills、Canvas", "Extensibility: instructions, custom agents, MCP, skills, plugins, .github/skills, and Canvas"),
    summary: bi(
      "ファイルに保存されたinstructions、custom agents、MCPサーバー、user/repositoryスキル（`.github/skills/`を含む）、pluginとCanvas拡張を扱います。",
      "Covers file-backed instructions, custom agents, MCP servers, user/repository skills (including `.github/skills/`), plugins, and Canvas extensions.",
    ),
    labs: ["18", "19", "10"],
  },
  {
    id: "t9",
    number: 9,
    slug: "memory-chronicle",
    title: bi("Memory、Chronicle、Insights、コンテキスト、コスト", "Memory, Chronicle, Insights, context, and cost"),
    summary: bi(
      "`/chronicle`、Insights、`/context`、`/compact`と、CLI/cloud agent/code reviewのMemory境界を扱います。",
      "Covers `/chronicle`, Insights, `/context`, `/compact`, and the documented CLI/cloud-agent/code-review Memory boundary.",
    ),
    labs: ["07", "20", "21"],
  },
  {
    id: "t10",
    number: 10,
    slug: "security-operations",
    title: bi("セキュリティガバナンスとplatform運用・復旧", "Security governance and cross-platform operations/recovery"),
    summary: bi(
      "platform境界を把握し、security reviewと権限、accessibility/storage、Commit attribution、diagnosticsを一つの運用・復旧モデルとして段階化します。",
      "Build one operational recovery model across platform boundaries, security review and permissions, accessibility/storage, Commit attribution, and diagnostics.",
    ),
    labs: ["08", "15", "21", "24"],
  },
];

// ---------------------------------------------------------------------------
// Per-lab domain bucket used to select deterministic enrichment templates.
// ---------------------------------------------------------------------------

const domainByLab = {
  "01": "foundations",
  "02": "models",
  "03": "planning",
  "04": "worktrees",
  "05": "orchestration",
  "06": "orchestration",
  "07": "chat-lifecycle",
  "08": "platforms",
  "09": "files-diffs",
  "10": "canvas",
  "11": "my-work",
  "12": "issues-links",
  "13": "pr-review",
  "14": "merge-stacks",
  "15": "security-review",
  "16": "automations",
  "17": "automations",
  "18": "extensibility",
  "19": "extensibility",
  "20": "memory-chronicle",
  "21": "accessibility-recovery",
  "22": "merge-stacks",
  "23": "issues-links",
  "24": "ops-recovery",
  "25": "capstone",
};

// Extra related-lab cross-links added only in the rendered (in-memory) copy — the archive JSON
// files under scripts/guide-content are never modified.
const extraRelated = {
  "04": ["24"],
  "08": ["24"],
  "11": ["23"],
  "12": ["23"],
  "13": ["22"],
  "14": ["22"],
  "20": ["24"],
  "21": ["24"],
};

function updateVerificationBoundary(guide) {
  const detailJa = guide.status.detail.ja.replace(/^v1\.1\.2 時点。?\s*/, "");
  const detailEn = guide.status.detail.en.replace(/^Current in v1\.1\.2\.?\s*/, "");
  guide.version = bi(
    "v1.1.4 向け再公開（中核フローは v1.1.2 で検証、現在差分を source-check）",
    "Republished for v1.1.4 (core flow verified at v1.1.2; current deltas source-checked)",
  );
  guide.status = {
    ...guide.status,
    detail: bi(
      `v1.1.4 版として再公開。中核フローは v1.1.2 で検証され、v1.1.3 / v1.1.4 差分と情報源を source-check しています。${detailJa}`,
      `Republished for v1.1.4. The core flow was verified for v1.1.2; v1.1.3/v1.1.4 deltas and source provenance were checked. ${detailEn}`,
    ),
  };
  return guide;
}

// ---------------------------------------------------------------------------
// Modernize stale operational-boundary wording left over from the v1.1.2-era
// archived guides (e.g. "the official v1.1.2 build", "update to v1.1.2",
// "signed in to ... v1.1.2 with", "GitHub Copilot App v1.1.2—"). This is a
// narrow, mechanical set of substitutions that only targets self-referential
// "current version" framing; it deliberately does NOT touch genuine historical
// attributions such as "fixed in v1.1.2", "added in v1.1.1", "v1.1.2 or
// later", or citations of a specific historical changelog/release URL — those
// remain accurate and are left verbatim. Applied only to the in-memory clone;
// the archived JSON files are never written to.
const STALE_WORDING_RULES = [
  [/ガイド(?=\s?\d{2})/g, "ラボ"],
  [/\bGuides (?=\d{2})/g, "Labs "],
  [/\bguides (?=\d{2})/g, "labs "],
  [/\bGuide (?=\d{2})/g, "Lab "],
  [/\bguide (?=\d{2})/g, "lab "],
  // "The official v1.1.2 build starts..." -> current build is v1.1.4.
  [/公式\s*v1\.1\.2\s*ビルド/g, "公式 v1.1.4 ビルド"],
  [/The official v1\.1\.2 build/g, "The official v1.1.4 build"],
  // "(アプリを) v1.1.2 に更新して/し/してください/されており" -> update to the
  // current latest version instead of a version that is no longer current.
  [/v1\.1\.2(?=\s*[にへ]更新)/g, "v1.1.4（最新版）"],
  [/\b(Update|update)( the app)? to v1\.1\.2\b/g, (_match, verb, appWord) => `${verb}${appWord || ""} to the latest version (v1.1.4)`],
  [/\bis updated to v1\.1\.2\b/g, "is updated to the latest version (v1.1.4)"],
  // "GitHub Copilot App v1.1.2 でサインイン済み/にサインイン済み" -> v1.1.4.
  [/(GitHub Copilot App )v1\.1\.2(?=\s*(で|に)\s*サインイン)/g, "$1v1.1.4"],
  [/(GitHub Copilot App )v1\.1\.2(?=\s*で[、,])/g, "$1v1.1.4"],
  [/(GitHub Copilot [Aa]pp )v1\.1\.2(?=\s*with)/g, "$1v1.1.4"],
  // "GitHub Copilot App v1.1.2 における..." / "GitHub Copilot App v1.1.2—..."
  // (framing v1.1.2 as the guide's present-tense subject) -> v1.1.4.
  [/(GitHub Copilot App )v1\.1\.2(?=\s*における)/g, "$1v1.1.4"],
  [/(GitHub Copilot App )v1\.1\.2(?=—)/g, "$1v1.1.4"],
  // "Use v1.1.2, which includes this fix" / JA equivalent -> v1.1.4 or later.
  [/この修正を含む\s*v1\.1\.2\s*を使って/g, "この修正を含む v1.1.4 以降を使って"],
  [/\bUse v1\.1\.2\b(?=,\s*which includes)/g, "Use v1.1.4 or later"],
  // One-off exact sentences that frame v1.1.2 as "now" without matching a
  // safe mechanical pattern above (guide 08's VS Code window-reuse note).
  [/v1\.1\.2ではセッションをVS Codeで開くと常に新しいウィンドウが開きます。/g, "v1.1.4 現在、セッションを VS Code で開くと常に新しいウィンドウが開きます。"],
  [/In v1\.1\.2, opening a session in VS Code always opens a new window\./g, "As of v1.1.4, opening a session in VS Code always opens a new window."],
];

function modernizeStaleWording(value) {
  let result = value;
  for (const [pattern, replacement] of STALE_WORDING_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function deepModernize(node) {
  if (typeof node === "string") return modernizeStaleWording(node);
  if (Array.isArray(node)) return node.map((item) => deepModernize(item));
  if (node && typeof node === "object") {
    const out = {};
    for (const [key, value] of Object.entries(node)) out[key] = deepModernize(value);
    return out;
  }
  return node;
}

function applyExtraRelated(guide) {
  const extra = extraRelated[guide.id];
  if (!extra) return guide;
  guide.related = [...new Set([...(guide.related || []), ...extra])];
  return guide;
}

function applyV114Delta(guide) {
  if (guide.id !== "06") return guide;
  guide.steps.push({
    title: bi(
      "quick chatとGrid bulk actionsを観察する",
      "Observe quick chats and Grid bulk actions",
    ),
    body: [
      bi(
        "v1.1.4の変更履歴に従い、使い捨てのquick chatをサイドバーでCmd/Ctrl+clickしてSession Gridへ追加できるか観察します。次に複数の使い捨てセッションを選択して右クリックし、send、mark read/unread、archive、deleteのbulk actionsが表示されるか確認します。この段階では破壊的なarchive/deleteを実行しません。正確な画面配置は変更履歴以外で網羅的に文書化されていないため、現在のビルド表示を優先してください。",
        "Following the v1.1.4 changelog, Cmd/Ctrl-click a disposable quick chat in the sidebar and observe whether it joins sessions in the Session Grid. Then select multiple disposable sessions, right-click, and observe whether bulk actions for send, mark read/unread, archive, and delete appear. Do not activate destructive archive/delete actions in this phase. Exact placement is not comprehensively documented outside the changelog, so follow the current build.",
      ),
    ],
    expected: bi(
      "quick chatをGrid内で観察し、選択した使い捨てセッションに対するbulk actionsの一覧を、破壊的操作なしで確認できる。",
      "You observed the quick chat in the Grid and inspected the bulk-action list for selected disposable sessions without performing a destructive action.",
    ),
  });
  guide.sources = [
    ...(guide.sources || []),
    {
      title: "GitHub Copilot app v1.1.4 changelog",
      url: "https://github.com/github/app/blob/main/changelog.md#v114",
    },
    {
      title: "GitHub Copilot app slash commands",
      url: "https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands",
    },
  ];
  return guide;
}

function applyCurrentCorrections(guide) {
  if (guide.id === "14") {
    guide.sources = [
      ...(guide.sources || []),
      {
        title: "Managing a merge queue",
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue",
      },
    ];
  }

  if (guide.id === "15") {
    guide.sources = [
      ...(guide.sources || []),
      {
        title: "GitHub Copilot app slash commands",
        url: "https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands",
      },
    ];
  }

  if (guide.id === "03") {
    guide.steps.push({
      title: bi(
        "Plan tabを閉じてAdd tabから復元する（誘導観察）",
        "Close the Plan tab and restore it from Add tab (guided observation)",
      ),
      body: [
        bi(
          "full-height right panel layoutでPlan tabのclose controlが表示される場合は閉じ、Add tab menuからPlanを復元します。v1.1.3の変更履歴で確認されたUIですが、長文の公式walkthroughはないため、現在のビルドに表示されるラベルを優先してください。",
          "In the full-height right-panel layout, if the Plan tab exposes a close control, close it and restore Plan from the Add tab menu. This UI is confirmed by the v1.1.3 changelog but lacks a long-form official walkthrough, so follow the labels shown by the current build.",
        ),
      ],
      expected: bi(
        "Plan内容を失わずにtabを閉じ、Add tab menuから同じPlanを再表示できる。",
        "You close the tab without losing the plan and reopen the same plan from the Add tab menu.",
      ),
    });
    guide.sources = [
      ...(guide.sources || []),
      {
        title: "GitHub Copilot app v1.1.3 changelog",
        url: "https://github.com/github/app/blob/main/changelog.md#v113",
      },
    ];
  }

  if (guide.id === "08") {
    const cloudCommand = guide.commands.find((command) => command.id === "cloud-sandbox-command");
    const sandboxCommand = guide.commands.find((command) => command.id === "sandbox-enable-command");
    if (!cloudCommand || !sandboxCommand) {
      throw new Error("Lab 08 cloud/local sandbox correction targets are missing");
    }
    cloudCommand.code = "copilot --cloud --experimental";
    sandboxCommand.code = "/experimental on\n/sandbox enable";
    const cloudStep = guide.steps.find((step) =>
      step.commandIds?.includes("cloud-sandbox-command"),
    );
    const sandboxStep = guide.steps.find((step) =>
      step.commandIds?.includes("sandbox-enable-command"),
    );
    if (!cloudStep || !sandboxStep) throw new Error("Lab 08 sandbox steps are missing");
    cloudStep.body = [
      bi(
        "同じリポジトリでAppのCloud sandbox（Public preview）を選んだ新しいsessionを開始して、WSL/local machineとは別のGitHub-hosted environmentであることを確認します。組織管理アカウントではCloud Sandbox access policyが必要です。",
        "Start a new app session for the same repository using Cloud sandbox (public preview) and confirm it is a GitHub-hosted environment distinct from WSL or the local machine. Organization-managed accounts require the Cloud Sandbox access policy.",
      ),
      bi(
        "隣接するCopilot CLIで同等のcloud-backed sessionを開始する場合はexperimental featuresを有効にした `copilot --cloud --experimental` が必要です。これはAppの実行先selectorとは別のCLI操作です。",
        "For the adjacent Copilot CLI, starting an equivalent cloud-backed session requires experimental features via `copilot --cloud --experimental`. This is a CLI operation, separate from the app's run-location selector.",
      ),
    ];
    sandboxStep.body = [
      bi(
        "Copilot CLIのlocal sandboxingはexperimental featureです。CLI sessionで`/experimental on`を実行してから`/sandbox enable`を使います。macOS、Linux、Windows Insiders buildsで利用でき、Appの実行先selectorとは別物です。",
        "Copilot CLI local sandboxing is experimental. Run `/experimental on` in the CLI session before `/sandbox enable`. It is available on macOS, Linux, and Windows Insiders builds and is distinct from the app's run-location selector.",
      ),
    ];
    const finalStep = guide.steps.at(-1);
    finalStep.title = bi(
      "WSL接続とWindows terminal環境を別々に確認する",
      "Verify WSL connectivity and Windows terminal environment separately",
    );
    finalStep.body.push(
      bi(
        "Windowsを使っている場合は、WSL sessionとは別に新しいWindows integrated terminalを開き、既存のPowerShell profileで設定済みのPATHや環境変更（例えばfnm管理のNode）が反映されるか確認します。profile自体をこの演習のために変更する必要はありません。これはv1.1.4のWindows terminal改善で、WSL接続とは別の実行境界です。",
        "On Windows, separately from the WSL session, open a new Windows integrated terminal and check whether PATH or environment changes already configured by your PowerShell profile (for example an fnm-managed Node version) are present. Do not edit the profile just for this exercise. This v1.1.4 Windows-terminal improvement is a separate execution boundary from WSL connectivity.",
      ),
    );
    finalStep.expected = bi(
      "WSL remote sessionの再接続を確認し、Windowsでは別途、integrated terminalが既存のPowerShell profile環境を読み込むことを観察できる。",
      "You confirm the WSL remote session reconnects and, separately on Windows, observe the integrated terminal loading the existing PowerShell-profile environment.",
    );
    guide.sources = [
      ...(guide.sources || []),
      {
        title: "GitHub Copilot app v1.1.4 changelog",
        url: "https://github.com/github/app/blob/main/changelog.md#v114",
      },
    ];
  }

  if (guide.id === "17") {
    guide.safety = bi(
      `${guide.safety.ja} automation definition は作成者だけに見えますが、それが開始した session、log、pull request は repository access を持つ人に見えます。automation PR は作成者に帰属するため、その作成者自身は承認できません。`,
      `${guide.safety.en} The automation definition is visible only to its creator, while the sessions, logs, and pull requests it starts are visible to people with repository access. Automation pull requests are attributed to the creator, who therefore cannot approve them.`,
    );
  }

  if (guide.id === "19") {
    guide.steps.push({
      title: bi(
        "file-backed instructions と `.github/skills/` を別々の設定面で確認する",
        "Inspect file-backed instructions and `.github/skills/` on their distinct settings surfaces",
      ),
      body: [
        bi(
          "Settings > Sessions で、システムから発見された file-backed instructions が app-managed instructions と並んで表示されるか確認します。各 instruction について source path と、その path をコピー／file manager で表示する操作を観察します。",
          "In Settings > Sessions, check whether file-backed instructions discovered from your system appear alongside app-managed instructions. For each instruction, observe its source path and the actions to copy that path or reveal it in the file manager.",
        ),
        bi(
          "次に Settings > Skills を開き、信頼済みリポジトリの `.github/skills/` にある skill が「not found」ではなく一覧に表示されるか確認します。これは instructions discovery とは別の機能で、v1.1.4 の Fixed 項目です。",
          "Then open Settings > Skills and confirm that a skill from the trusted repository's `.github/skills/` directory is listed rather than shown as not found. This is separate from instructions discovery and is a v1.1.4 Fixed item.",
        ),
      ],
      expected: bi(
        "Settings > Sessions では instruction の source path と copy/reveal 操作を、Settings > Skills では `.github/skills/` の skill を確認でき、2つを混同していない。",
        "Settings > Sessions shows instruction source paths with copy/reveal actions, while Settings > Skills lists the `.github/skills/` skill; you keep the two mechanisms distinct.",
      ),
    });
    guide.sources = [
      ...(guide.sources || []),
      {
        title: "GitHub Copilot app v1.1.4 changelog",
        url: "https://github.com/github/app/blob/main/changelog.md#v114",
      },
    ];
  }

  if (guide.id === "21") {
    guide.commands = guide.commands.filter((command) => command.id !== "enable-voice");
    guide.prerequisites = guide.prerequisites.map((item) =>
      /English or Spanish|英語またはスペイン語/.test(`${item.ja} ${item.en}`)
        ? bi(
            "音声入力を試す場合は動作するマイクが接続され、OS でアプリへのマイクアクセスを許可できること。ローカル transcription model は App の Voice dictation 設定から取得します。",
            "If you plan to test voice input, connect a working microphone and be able to grant the app microphone access in the OS. Obtain the local transcription model from the app's Voice dictation settings.",
          )
        : item,
    );
    const voiceStep = guide.steps.find((step) => step.title.en.includes("voice dictation"));
    if (voiceStep) {
      voiceStep.body = [
        bi(
          "App settings の Voice dictation タブを開き、keyboard shortcut を選びます。OS settings でアプリへのマイクアクセスを許可し、App の設定面から local transcription model をダウンロードします。",
          "Open the Voice dictation tab in the app settings and choose a keyboard shortcut. Allow microphone access for the app in your OS settings, then download the local transcription model from the app settings.",
        ),
        bi(
          "設定したshortcutで短いテスト文を入力し、カーソル位置に文字起こしされることを確認します。Appの公式手順にないCLI commandや固定key bindingは使いません。",
          "Use the shortcut you configured to dictate a short test sentence and confirm it is inserted at the cursor. Do not use CLI commands or fixed key bindings that are absent from the documented App flow.",
        ),
      ];
      delete voiceStep.commandIds;
      voiceStep.expected = bi(
        "設定した shortcut で音声入力を開始・停止でき、local transcription model による文字起こしがプロンプト欄へ挿入される。",
        "The configured shortcut starts and stops voice input, and the local transcription model inserts text into the prompt field.",
      );
    }
    if (!voiceStep) throw new Error("Lab 21 voice-dictation correction target is missing");
    const voiceTroubleshooting = guide.troubleshooting.find((item) =>
      item.problem.en.includes("Voice input"),
    );
    if (!voiceTroubleshooting) throw new Error("Lab 21 voice troubleshooting correction target is missing");
    voiceTroubleshooting.fix = bi(
      "OS settingsでアプリへのマイクアクセスが許可されているか確認し、App settings > Voice dictationでshortcutとlocal transcription modelの状態を確認します。CLI専用commandは使いません。",
      "Confirm in OS settings that the app has microphone access, then inspect the shortcut and local transcription model in App settings > Voice dictation. Do not use CLI-only commands.",
    );
    guide.platforms.macos = bi(
      "VoiceOver 向けの読み上げ修正（オンボーディングの「setting up」画面など、v1.1.0 で修正）が該当します。Voice dictation は App settings で構成した shortcut を使います。",
      "VoiceOver announcement fixes apply here, including the onboarding setting-up screen fixed in v1.1.0. Voice dictation uses the shortcut configured in the app settings.",
    );
    const displayStep = guide.steps.find((step) =>
      step.title.en.includes("reduced motion"),
    );
    if (!displayStep) throw new Error("Lab 21 accessibility correction target is missing");
    displayStep.body.push(
      bi(
        "使い捨てprofileのonboarding accessibility preferences dialogを安全に開ける場合は、v1.1.4で追加された「Enable sound」toggleを観察します。既存profileをresetする必要がある場合は無理に再現せず、変更履歴をreference-onlyで確認してください。",
        "If you can safely open the onboarding accessibility preferences dialog in a disposable profile, observe the Enable sound toggle added in v1.1.4. If doing so would require resetting your existing profile, do not force the flow; treat the changelog entry as reference-only.",
      ),
    );
    displayStep.expected = bi(
      "reduced motion / contrastを確認し、利用可能な場合はonboardingのEnable sound toggleも観察できる。既存profileを破壊していない。",
      "You verify reduced-motion/contrast behavior and, when safely available, observe the onboarding Enable sound toggle without disrupting an existing profile.",
    );
    guide.sources = [
      ...guide.sources.filter(
        (source) => !source.url.includes("/copilot-cli/use-copilot-cli/voice-input"),
      ),
      {
        title: "Working with agent sessions: voice dictation",
        url: "https://docs.github.com/en/copilot/how-tos/github-copilot-app/agent-sessions#using-voice-dictation",
      },
      {
        title: "GitHub Copilot app v1.1.4 changelog",
        url: "https://github.com/github/app/blob/main/changelog.md#v114",
      },
    ];
  }

  return guide;
}

// ---------------------------------------------------------------------------
// Estimated time — deterministic from difficulty and step count, not stored.
// ---------------------------------------------------------------------------

function estimatedMinutes(guide) {
  const base = { beginner: 12, intermediate: 18, advanced: 24 }[guide.difficulty.key] || 18;
  const perStep = { beginner: 3, intermediate: 4, advanced: 5 }[guide.difficulty.key] || 4;
  const raw = base + guide.steps.length * perStep;
  return Math.round(raw / 5) * 5;
}

function estimatedTimeNote(guide) {
  if (["14", "22", "25"].includes(guide.id)) {
    return bi(
      `hands-on操作の目安は約${guide.estimatedMinutes}分です。CI、Copilot review、merge queue、Agent Mergeの待ち時間は含まず、実経過時間はrepository状態により大きく延びます。`,
      `Hands-on work is estimated at about ${guide.estimatedMinutes} minutes. This excludes waits for CI, Copilot review, merge queue, and Agent Merge, so elapsed time can be substantially longer.`,
    );
  }
  if (["16", "17"].includes(guide.id)) {
    return bi(
      `hands-on操作の目安は約${guide.estimatedMinutes}分です。schedule到来、cloud session start、service latencyは含まず、検証を複数回に分ける場合があります。`,
      `Hands-on work is estimated at about ${guide.estimatedMinutes} minutes. This excludes schedule windows, cloud-session startup, and service latency, so verification may span multiple sittings.`,
    );
  }
  return bi(
    `hands-on操作の目安は約${guide.estimatedMinutes}分です。download、network、service latencyは含みません。`,
    `Hands-on work is estimated at about ${guide.estimatedMinutes} minutes, excluding downloads, network delay, and service latency.`,
  );
}

// ---------------------------------------------------------------------------
// Deterministic, per-domain pedagogical enrichment. Every lab (archived or new)
// gets: persona/why-it-matters, learning objectives, decision points, mid/end
// checkpoints, an "Under the hood" mental model, an explicit recovery path,
// a success rubric, and a stretch exercise. Content is selected by the lab's
// domain bucket and interpolated with the lab's own title/keywords so that two
// labs sharing a domain (e.g. 05/06, 16/17, 18/19) are not literally duplicated.
// ---------------------------------------------------------------------------

function baseDomainEnrichment(guide) {
  const domain = domainByLab[guide.id] || "general";
  const t = guide.title;
  const kw = guide.keywords?.[0] || t.en;
  const isSecond = (candidateIds) => candidateIds.indexOf(guide.id) === 1;

  switch (domain) {
    case "foundations":
      return {
        persona: bi(
          "初めてアプリを開く担当者として、公開サンプルで安全に導入手順を確認します。",
          "As someone opening the app for the first time, verify the install flow safely against a public sample.",
        ),
        whyItMatters: bi(
          "導入とプロジェクト境界の理解を誤ると、後続のすべてのラボで意図しないリポジトリに変更を加えるリスクが生まれます。",
          "Getting install and project boundaries wrong creates a risk of unintended changes to the wrong repository in every later lab.",
        ),
        objectives: [
          bi("公式ビルドを導入し GitHub アカウントで認証する", "Install the official build and authenticate with a GitHub account"),
          bi("最初のプロジェクトをサイドバーに接続する", "Connect a first project to the sidebar"),
          bi("ファイル変更なしの探索セッションでリポジトリ境界を確認する", "Confirm repository boundaries with a no-file-change exploration session"),
        ],
        decisionPoints: [
          bi("GitHub.com か GHES か: サインイン方法を選ぶ判断点です。", "GitHub.com vs. GHES: a decision point for how you sign in."),
          bi("Copilot プランか BYOK か: モデルアクセス方法を選ぶ判断点です。", "Copilot plan vs. BYOK: a decision point for how you access models."),
        ],
        checkpoints: [
          bi("チェックポイント1: サインイン後にアカウント名が表示される。", "Checkpoint 1: your account name appears after sign-in."),
          bi("チェックポイント2: 探索セッション完了後も Changes が空のままである。", "Checkpoint 2: Changes remains empty after the exploration session completes."),
        ],
        underTheHood: bi(
          "アプリはデスクトップのGitクライアントとして動作し、選んだプロジェクトだけをセッションの作業対象に限定します。認証はブラウザー経由のOAuthフローで行われ、資格情報はOSの資格情報ストアに保存されます。",
          "The app behaves as a desktop Git client and scopes each session to only the project you connected. Authentication uses a browser-based OAuth flow, and credentials are stored in the OS credential store.",
        ),
        recoveryPath: bi(
          "起動しない、または接続できない場合は、まずアプリを最新版に更新して再起動し、それでも解決しない場合はプロジェクト接続を削除してから再接続します。",
          "If the app fails to start or connect, first update to the latest version and restart; if that does not help, remove the project connection and reconnect it.",
        ),
        successRubric: [
          bi("公式ビルドが起動し認証済みである。", "The official build starts and is authenticated."),
          bi("意図した1つのプロジェクトだけが接続されている。", "Only the one intended project is connected."),
          bi("探索セッションがファイル変更なしで完了している。", "The exploration session completed with no file changes."),
        ],
        stretchExercise: bi(
          "2つ目のプロジェクト（例えばこのリポジトリ自身のフォーク）を追加し、サイドバーで切り替えて境界が独立していることを確認してください。",
          "Add a second project (for example a fork of this repository) and switch between them in the sidebar to confirm the boundaries stay independent.",
        ),
      };
    case "models":
      return {
        persona: bi(
          "コストと応答品質のバランスを取りたいセッション責任者として、モデルと推論量を切り替えます。",
          "As the person responsible for a session's cost/quality balance, switch models and reasoning effort.",
        ),
        whyItMatters: bi(
          "モデルと reasoning effort の選択はレイテンシ、費用、出力品質すべてに影響し、モデル変更時のコンテキスト再利用を理解しないと再説明のコストが発生します。",
          "Model and reasoning-effort choices affect latency, cost, and output quality, and not understanding context reuse across a model switch causes wasted re-explanation.",
        ),
        objectives: [
          bi("Auto が実際に選んだモデルを確認する", "Confirm which model Auto actually selected"),
          bi("reasoning effort をタスクに合わせて設定し永続化を確認する", "Set reasoning effort to match the task and confirm it persists"),
          bi("ローカル BYOK でモデルプロバイダーを追加する（パブリックプレビュー）", "Add a local BYOK model provider (public preview)"),
        ],
        decisionPoints: [
          bi("Auto に任せるか、明示的にモデルを固定するか。", "Let Auto decide, or pin a model explicitly."),
          bi("BYOK を追加するか、Copilot プランのホスト型モデルのみを使うか。", "Add BYOK, or stay with Copilot-plan hosted models only."),
        ],
        checkpoints: [
          bi("チェックポイント1: Auto の実モデル表示が確認できる。", "Checkpoint 1: Auto's actual-model display is visible."),
          bi("チェックポイント2: セッション再開後も reasoning effort が保持されている。", "Checkpoint 2: reasoning effort is retained after resuming the session."),
        ],
        underTheHood: bi(
          "Autoは公式文書上、タスクの複雑さに基づいて利用可能なモデルから選び、自然なcache boundaryでrouteします。完了応答には実際のモデル、AI Credits、cache detailsが利用可能な場合に表示されます。途中でモデルやreasoning effortなどを変更するとcacheが無効化され得ますが、v1.1.4のmodel-change noticeは以前のモデルと再利用されたコンテキスト量を利用可能な場合に示します。再利用量の計算方法はこのガイドでは断定しません。",
          "Official docs say Auto chooses among available models based on task complexity and routes at natural cache boundaries. Completed responses can show the actual model, AI Credits, and cache details when available. Mid-session changes to model or reasoning effort can invalidate cache, while the v1.1.4 model-change notice can show the prior model and reused-context amount when available. This guide does not claim how that amount is calculated.",
        ),
        recoveryPath: bi(
          "予期しないモデルや異常な消費が続く場合は、モデルを明示的に固定し、セッションを再開してから reasoning effort を手動で再設定してください。",
          "If an unexpected model or abnormal consumption persists, pin a model explicitly, resume the session, and manually reset reasoning effort.",
        ),
        successRubric: [
          bi("Auto の実モデルまたは固定モデルが確認できる。", "Auto's actual model, or a pinned model, is confirmed."),
          bi("reasoning effort の永続化を実際に確認した。", "Reasoning-effort persistence was actually verified."),
          bi("BYOK がパブリックプレビューであることを認識している。", "You recognize that BYOK is public preview."),
        ],
        stretchExercise: bi(
          "同じプロンプトを2つの異なる reasoning effort で実行し、応答時間と結果の質を比較してください。",
          "Run the same prompt at two different reasoning-effort levels and compare response time and result quality.",
        ),
      };
    case "planning":
      return {
        persona: bi(
          "リスクの異なる2つのタスクを担当するレビュー担当者として、実行モードを使い分けます。",
          "As a reviewer handling two tasks of different risk, choose between execution modes.",
        ),
        whyItMatters: bi(
          "Interactive、Plan、Autopilotを誤って選ぶと、低リスクな探索が承認待ちで止まったり、高リスクな変更が無審査で実行されたりします。",
          "Choosing the wrong mode among Interactive, Plan, and Autopilot either stalls a low-risk exploration on approval or lets a high-risk change run unreviewed.",
        ),
        objectives: [
          bi("Interactive、Plan、Autopilotそれぞれの承認境界を説明できる", "Explain the approval boundary of Interactive, Plan, and Autopilot"),
          bi("Shift+Tabでモードを切り替える", "Cycle modes with Shift+Tab"),
          bi("Plan reviewでチェックリストを承認またはMarkdownで編集する", "Approve or edit-in-Markdown a Plan review checklist"),
        ],
        decisionPoints: [
          bi("このタスクは無審査で進めてよいか、それとも計画承認が必要か。", "Can this task proceed unreviewed, or does it need plan approval?"),
          bi("Plan reviewを承認するか、フィードバック付きで差し戻すか。", "Approve the plan review, or reject it with feedback?"),
        ],
        checkpoints: [
          bi("チェックポイント1: Shift+Tabでモード表示が切り替わる。", "Checkpoint 1: the mode indicator changes with Shift+Tab."),
          bi("チェックポイント2: Plan reviewのチェックリストが描画され検索できる。", "Checkpoint 2: the Plan review checklist renders and is searchable."),
        ],
        underTheHood: bi(
          "Plan reviewは提案された変更を実行前の宣言として描画し、承認するまでファイルシステムへの書き込みをブロックします。Autopilotはこのゲートを自動承認に置き換えます。",
          "Plan review renders the proposed change as a declaration before execution and blocks filesystem writes until you approve. Autopilot replaces that gate with automatic approval.",
        ),
        recoveryPath: bi(
          "誤ってAutopilotで低リスクでないタスクを開始した場合は、直ちにセッションを停止し、Plan reviewからやり直してください。",
          "If you accidentally start a non-low-risk task in Autopilot, stop the session immediately and restart from a Plan review.",
        ),
        successRubric: [
          bi("3つのモードの承認境界を正しく説明できる。", "You can correctly explain the approval boundary of all three modes."),
          bi("Plan reviewを少なくとも1回承認またはフィードバック付きで差し戻した。", "You approved, or rejected with feedback, at least one Plan review."),
          bi("タスクのリスクに応じたモード選択を行った。", "You chose a mode matching the task's risk."),
        ],
        stretchExercise: bi(
          "同じタスクをPlanとAutopilotの両方で試し、承認ゲートがない場合に何が変わるかを比較してください。",
          "Try the same task under both Plan and Autopilot and compare what changes when the approval gate is absent.",
        ),
      };
    case "worktrees":
      return {
        persona: bi(
          "複数の変更を同時並行で進めるエンジニアとして、セッションの実行場所を分離します。",
          "As an engineer running several changes concurrently, isolate where each session executes.",
        ),
        whyItMatters: bi(
          "working tree/ローカルリポジトリ/cloud sandboxの違いを理解しないと、並列セッションが互いのuncommitted changesを壊す可能性があります。",
          "Without understanding the difference between a working tree, the local repository, and a cloud sandbox, parallel sessions can clobber each other's uncommitted changes.",
        ),
        objectives: [
          bi("新しいworking treeでセッションを実行する", "Run a session in a new working tree"),
          bi("ローカルリポジトリ実行との違いを説明する", "Explain the difference from running against the local repository"),
          bi("cloud sandboxがパブリックプレビューであることを認識する", "Recognize that cloud sandbox sessions are public preview"),
        ],
        decisionPoints: [
          bi("新しいworktreeで分離するか、ローカルリポジトリで直接進めるか。", "Isolate in a new worktree, or proceed directly against the local repository?"),
          bi("クラウドサンドボックスを使うか、ローカル実行に留めるか。", "Use a cloud sandbox, or stay with local execution?"),
        ],
        checkpoints: [
          bi("チェックポイント1: 新しいブランチとworktreeが作成されている。", "Checkpoint 1: a new branch and worktree were created."),
          bi("チェックポイント2: 他のセッションのuncommitted changesに影響がない。", "Checkpoint 2: other sessions' uncommitted changes are unaffected."),
        ],
        underTheHood: bi(
          "worktreeは同じGitリポジトリを共有しつつ独立した作業ディレクトリとブランチを持つ仕組みで、アプリはセッションごとに専用のworktreeとブランチを自動管理します。",
          "A worktree is an independent working directory and branch that shares the same Git repository, and the app automatically manages a dedicated worktree and branch per session.",
        ),
        recoveryPath: bi(
          "worktreeが壊れた、または削除に失敗した場合は、セッションを閉じてからGitのworktreeコマンドで手動整理し、必要ならブランチだけを復元してください。",
          "If a worktree becomes corrupted or fails to delete, close the session and manually clean it up with Git worktree commands, restoring only the branch if needed.",
        ),
        successRubric: [
          bi("working tree、ローカルリポジトリ、cloud sandboxの違いを説明できる。", "You can explain the difference between a working tree, local repository, and cloud sandbox."),
          bi("並列セッションが互いのuncommitted changesに影響していない。", "Parallel sessions do not affect each other's uncommitted changes."),
          bi("使用後にworktreeとブランチを片付けた。", "You cleaned up the worktree and branch after use."),
        ],
        stretchExercise: bi(
          "同じリポジトリに対して2つのworktreeセッションを同時に開き、片方をコミットしてからもう片方のdiffが独立していることを確認してください。",
          "Open two worktree sessions on the same repository simultaneously, commit in one, and confirm the other session's diff stays independent.",
        ),
      };
    case "orchestration": {
      const flavor = isSecond(["05", "06"])
        ? bi("Session GridとSide chatを扱う", "working with the Session Grid and side chats")
        : bi("nested sessionsの計画承認を扱う", "working with nested-session plan approval");
      return {
        persona: bi(
          `複数セッションを監督するオーケストレーターとして、${flavor.ja}回を担当します。`,
          `As an orchestrator supervising multiple sessions, this round focuses on ${flavor.en}.`,
        ),
        whyItMatters: bi(
          "セッションが増えるほど、どれが承認待ちでどれが完了したかを一目で把握できないと、並列作業の利点が失われます。",
          "As the number of sessions grows, losing at-a-glance visibility into what is waiting for approval versus complete erases the benefit of parallel work.",
        ),
        objectives: [
          bi(`${t.ja}の主要な操作を実行する`, `Perform the primary actions covered by ${t.en}`),
          bi("親子関係にあるセッションの状態遷移を追跡する", "Track state transitions across parent/child sessions"),
          bi("forkがトップレベル項目として扱われることを確認する", "Confirm forks are treated as top-level entries"),
        ],
        decisionPoints: [
          bi("nested sessionを起動するか、`/side`で軽量に確認するか。", "Launch a nested session, or check lightly with `/side`?"),
          bi("親セッションの計画を承認するか、差し戻すか。", "Approve the parent session's plan, or send it back?"),
        ],
        checkpoints: [
          bi("チェックポイント1: Session Gridに複数セッションの状態が表示される。", "Checkpoint 1: the Session Grid shows the state of multiple sessions."),
          bi("チェックポイント2: 子セッションの計画承認が親セッションから行える。", "Checkpoint 2: a child session's plan can be approved from the parent."),
        ],
        underTheHood: bi(
          "各セッションは独立した会話状態と進捗を持ちながら、Session Gridは共通のイベントストリームを購読して状態変化を集約表示します。nested sessionは親のコンテキストを継承しつつ別スレッドとして実行されます。",
          "Each session keeps independent conversation state and progress, while the Session Grid subscribes to a shared event stream to aggregate state changes. A nested session inherits the parent's context but runs as a separate thread.",
        ),
        recoveryPath: bi(
          "セッションがGridから消えた、または応答しない場合は、そのセッションを個別に開いて再開し、それでも復旧しなければアーカイブして子セッションだけ引き継いでください。",
          "If a session disappears from the Grid or stops responding, open it individually and resume; if that fails, archive it and carry over only its child sessions.",
        ),
        successRubric: [
          bi("Session Gridで複数セッションの状態を把握できる。", "You can track multiple sessions' state from the Session Grid."),
          bi("nested sessionの計画を少なくとも1回承認した。", "You approved at least one nested-session plan."),
          bi("forkがトップレベルで独立して表示されることを確認した。", "You confirmed forks display independently as top-level entries."),
        ],
        stretchExercise: bi(
          "3つ以上のセッションを同時に起動し、Gridの一括操作（bulk actions）で一部だけをアーカイブしてください。",
          "Launch three or more sessions at once and use the Grid's bulk actions to archive only a subset.",
        ),
      };
    }
    case "chat-lifecycle":
      return {
        persona: bi(
          "長い会話履歴を整理したい担当者として、アーカイブ・巻き戻し・圧縮を扱います。",
          "As someone tidying up long conversation history, handle archive, rewind, and compaction.",
        ),
        whyItMatters: bi(
          "会話が長くなるとコンテキストウィンドウを消費し続け、巻き戻しと圧縮を使わないと不要なやり取りがコストと混乱を増やします。",
          "As conversations grow, they keep consuming the context window, and skipping rewind and compaction lets unneeded exchanges add cost and confusion.",
        ),
        objectives: [
          bi("チャットをアーカイブし復元する", "Archive and restore a chat"),
          bi("Edit and rewindで特定のターンまで巻き戻す", "Rewind to a specific turn with Edit and rewind"),
          bi("`/compact`で会話を要約しコンテキストを節約する", "Summarize a conversation and save context with `/compact`"),
        ],
        decisionPoints: [
          bi("巻き戻すか、新しいセッションを開始するか。", "Rewind, or start a fresh session?"),
          bi("`/compact`するか、そのまま会話を続けるか。", "Run `/compact`, or keep the conversation as-is?"),
        ],
        checkpoints: [
          bi("チェックポイント1: 巻き戻し後に以降のターンが取り消されている。", "Checkpoint 1: turns after the rewind point are removed."),
          bi("チェックポイント2: `/compact`後も直近の重要な決定事項が要約に残っている。", "Checkpoint 2: recent important decisions survive in the summary after `/compact`."),
        ],
        underTheHood: bi(
          "巻き戻しは選択したターン以降の履歴を切り捨てて新しい分岐を作り、`/compact`は履歴全体を要約に置き換えてコンテキストトークンを解放します。どちらも元の履歴自体を破壊はしません。",
          "Rewind truncates history after the selected turn and starts a new branch, while `/compact` replaces the full history with a summary to free context tokens. Neither destroys the original history record itself.",
        ),
        recoveryPath: bi(
          "巻き戻しすぎた場合はアーカイブから会話を再度開き、必要なターンを確認してからやり直してください。",
          "If you rewind too far, reopen the conversation from the archive, confirm which turns you need, and redo the rewind.",
        ),
        successRubric: [
          bi("巻き戻しの効果を実際に確認した。", "You verified the effect of a rewind in practice."),
          bi("`/compact`実行後も重要な文脈が残っていることを確認した。", "You confirmed important context survives after `/compact`."),
          bi("不要になったチャットをアーカイブした。", "You archived a chat you no longer need active."),
        ],
        stretchExercise: bi(
          "意図的に長い会話を作ってから`/compact`を実行し、要約前後でコンテキスト使用量がどう変わるかを`/context`で比較してください。",
          "Deliberately build a long conversation, run `/compact`, and compare context usage before and after with `/context`.",
        ),
      };
    case "platforms":
      return {
        persona: bi(
          "複数OSとWSLをまたいで作業するエンジニアとして、プラットフォーム差を確認します。",
          "As an engineer working across multiple OSes and WSL, confirm platform-specific differences.",
        ),
        whyItMatters: bi(
          "プラットフォームごとの差異を知らないと、WSLやVS Code handoffで想定と異なる挙動に遭遇し、原因調査に時間がかかります。",
          "Not knowing platform-specific differences leads to unexpected behavior in WSL or VS Code handoff, wasting time on root-cause investigation.",
        ),
        objectives: [
          bi("WSLリモート環境でセッションを実行する", "Run a session in a WSL remote environment"),
          bi("VS Codeへのhandoffを行う", "Perform a handoff to VS Code"),
          bi("Copilot CLIとの境界（隣接製品）を区別する", "Distinguish the boundary from Copilot CLI as an adjacent product"),
        ],
        decisionPoints: [
          bi("WSLリモートで進めるか、Windowsネイティブで進めるか。", "Proceed in WSL remote, or Windows-native?"),
          bi("アプリ内で完結させるか、VS Codeへhandoffするか。", "Stay inside the app, or hand off to VS Code?"),
        ],
        checkpoints: [
          bi("チェックポイント1: WSLリモートセッションがPR/Issueワークフロースキルを認識している。", "Checkpoint 1: the WSL remote session recognizes PR/issue workflow skills."),
          bi("チェックポイント2: VS Codeへのhandoff後も同じブランチ/worktreeが開かれる。", "Checkpoint 2: the same branch/worktree opens after handoff to VS Code."),
        ],
        underTheHood: bi(
          "WSLリモートセッションはWindows側のアプリ本体からLinuxサブシステム内のリポジトリへ接続を張り、VS Code handoffはセッションのworktreeパスをそのままエディターに渡します。",
          "A WSL remote session connects from the Windows-hosted app into a repository inside the Linux subsystem, and VS Code handoff passes the session's worktree path directly to the editor.",
        ),
        recoveryPath: bi(
          "WSL接続が不安定な場合は、v1.1.2 以降へ更新してアプリを再起動し、WSL distribution の状態を確認してから再接続します。Windows integrated terminal の PowerShell profile 反映は別の実行境界であり、WSL接続の診断には使いません。",
          "If the WSL connection is unstable, update to v1.1.2 or later, restart the app, verify the WSL distribution is running, and reconnect. PowerShell-profile pickup in the Windows integrated terminal is a separate execution boundary and is not a WSL connectivity diagnostic.",
        ),
        successRubric: [
          bi("WSLリモートセッションを少なくとも1回実行した。", "You ran at least one WSL remote session."),
          bi("VS Codeへのhandoffを確認した。", "You confirmed a handoff to VS Code."),
          bi("Copilot CLIとの境界を正しく説明できる。", "You can correctly explain the boundary from Copilot CLI."),
        ],
        stretchExercise: bi(
          "同じタスクをWindowsネイティブとWSLリモートの両方で実行し、ターミナル体験の違いを比較してください。",
          "Run the same task under both Windows-native and WSL remote, and compare the terminal experience.",
        ),
      };
    case "files-diffs":
      return {
        persona: bi(
          "コードレビュー前に差分を精査する担当者として、Filesとdiffを扱います。",
          "As someone auditing a diff before review, work through Files and diffs.",
        ),
        whyItMatters: bi(
          "進行中・コミット済み・アーカイブ済み差分の区別を誤ると、まだレビューされていない変更を確定済みと誤解する危険があります。",
          "Confusing live, committed, and archived diffs risks mistaking unreviewed changes for finalized ones.",
        ),
        objectives: [
          bi("Filesで直接編集し自動保存を確認する", "Edit directly in Files and confirm autosave"),
          bi("コミット済みとアーカイブ済みの差分を区別する", "Distinguish committed diffs from archived diffs"),
          bi("復元不能な差分の明示的な説明を読む", "Read the explicit explanation for an unrecoverable archived diff"),
        ],
        decisionPoints: [
          bi("Filesで直接編集するか、エージェントに依頼するか。", "Edit directly in Files, or ask the agent to make the change?"),
          bi("差分をこのまま確定するか、追加のレビューを待つか。", "Finalize this diff now, or wait for additional review?"),
        ],
        checkpoints: [
          bi("チェックポイント1: Filesでの編集が自動保存されている。", "Checkpoint 1: an edit in Files was autosaved."),
          bi("チェックポイント2: コミット済み差分とアーカイブ済み差分を見分けられる。", "Checkpoint 2: you can tell committed diffs apart from archived diffs."),
        ],
        underTheHood: bi(
          "Filesはワークスペースのファイルシステムを直接反映し、diffビューはGitのステージング状態を読み取って表示します。アーカイブ済みワークスペースでは元のファイルシステムが破棄されるため、再構築できない差分は最後に保存されたスナップショットにフォールバックします。",
          "Files reflects the workspace filesystem directly, and the diff view reads Git staging state to render it. In an archived workspace the original filesystem is discarded, so a diff that cannot be reconstructed falls back to its last saved snapshot.",
        ),
        recoveryPath: bi(
          "差分が読み込まれない、または欠けている場合は、対象のセッションがアーカイブ済みかを確認し、アーカイブ済みなら最後に保存されたスナップショットの説明を確認したうえで、必要ならローカルのgit履歴から復元してください。",
          "If a diff fails to load or looks incomplete, check whether the session is archived; if it is, read the last-saved-snapshot explanation and, if needed, recover from local Git history instead.",
        ),
        successRubric: [
          bi("Filesでの直接編集と自動保存を確認した。", "You confirmed a direct edit in Files and its autosave."),
          bi("3種類の差分状態（進行中/コミット済み/アーカイブ済み）を区別できる。", "You can distinguish all three diff states (live/committed/archived)."),
          bi("復元不能な差分に遭遇した場合の説明を理解している。", "You understand the explanation shown for an unrecoverable diff."),
        ],
        stretchExercise: bi(
          "1つのセッションをアーカイブしたうえで差分を再度開き、表示される説明文を確認してください。",
          "Archive a session and reopen its diff to see the explanation text that is shown.",
        ),
      };
    case "canvas":
      return {
        persona: bi(
          "共有可能な成果物を作りたい担当者として、CanvasとPresentを扱います。",
          "As someone producing a shareable artifact, work through Canvas and Present.",
        ),
        whyItMatters: bi(
          "Canvasの信頼境界を理解しないと、拡張依存のサーフェスを無条件に信頼してしまうリスクがあります。",
          "Not understanding Canvas's trust boundary risks trusting an extension-dependent surface unconditionally.",
        ),
        objectives: [
          bi("`/create-canvas`スキルでCanvasを作成する", "Create a canvas with the `/create-canvas` skill"),
          bi("Present modeで全画面共有する", "Share full-screen with Present mode"),
          bi("Canvasが一般提供でありプレビュー扱いでないことを確認する", "Confirm canvas extensions are generally available, not preview"),
        ],
        decisionPoints: [
          bi("Canvasで検証可能な形にするか、通常のファイル差分のままにするか。", "Turn it into an inspectable canvas, or keep it as a plain file diff?"),
          bi("Present modeで共有するか、画面をそのまま見せるか。", "Share via Present mode, or just show the screen as-is?"),
        ],
        checkpoints: [
          bi("チェックポイント1: Canvasがブラウザーで検証可能な状態で開かれている。", "Checkpoint 1: the canvas opens in a browser-inspectable state."),
          bi("チェックポイント2: Present modeで全画面表示に切り替わる。", "Checkpoint 2: Present mode switches to full-screen."),
        ],
        underTheHood: bi(
          "Canvasはアプリ内に描画されるサンドボックス化されたWebサーフェスで、拡張機能が定義したUIをホストします。Present modeはウィンドウ全体をその共有サーフェスに切り替えるだけで、基盤のファイルやterminalの状態は変更しません。",
          "A canvas is a sandboxed web surface rendered inside the app that hosts UI defined by an extension. Present mode simply switches the whole window to that shared surface without changing the underlying file or terminal state.",
        ),
        recoveryPath: bi(
          "Canvasが描画されない場合は、対象の拡張機能が有効かをSettingsで確認し、無効化されていれば再度有効にしてセッションを再開してください。",
          "If a canvas fails to render, check in Settings whether the backing extension is enabled; if it is disabled, re-enable it and resume the session.",
        ),
        successRubric: [
          bi("少なくとも1つのCanvasを作成し検証した。", "You created and inspected at least one canvas."),
          bi("Present modeでの共有を確認した。", "You confirmed sharing via Present mode."),
          bi("Canvasの信頼境界（拡張機能依存）を説明できる。", "You can explain the canvas trust boundary (extension-dependent)."),
        ],
        stretchExercise: bi(
          "スプレッドシートまたはterminal用のCanvasを作成し、ファイル用Canvasとの違いを比較してください。",
          "Create a canvas for a spreadsheet or terminal and compare it with a file-based canvas.",
        ),
      };
    case "my-work":
      return {
        persona: bi(
          "毎朝の優先順位付けを担当する開発者として、My Workを整理します。",
          "As a developer prioritizing work every morning, organize My Work.",
        ),
        whyItMatters: bi(
          "My Workのセクションと`has:`/`no:`修飾子を使いこなさないと、完了済みや重複したUp next項目に埋もれて本当に次にやるべき作業を見失います。",
          "Without mastering My Work sections and the `has:`/`no:` qualifiers, stale completed or duplicate Up next entries bury the work you should actually do next.",
        ),
        objectives: [
          bi("セクションと検索でIssue/PRを整理する", "Organize issues/PRs with sections and search"),
          bi("`has:`/`no:`修飾子で絞り込む", "Filter with the `has:`/`no:` qualifiers"),
          bi("Up nextから完了済み・重複項目を除外する", "Exclude stale completed or duplicate entries from Up next"),
        ],
        decisionPoints: [
          bi("この項目をUp nextに残すか、除外するか。", "Keep this item in Up next, or exclude it?"),
          bi("`has:milestone`のような修飾子を組み合わせるか、単純な検索に留めるか。", "Combine qualifiers like `has:milestone`, or keep the search simple?"),
        ],
        checkpoints: [
          bi("チェックポイント1: `has:`/`no:`修飾子で件数が変化する。", "Checkpoint 1: the result count changes with `has:`/`no:` qualifiers."),
          bi("チェックポイント2: Up nextに完了済み項目が残っていない。", "Checkpoint 2: no completed items remain in Up next."),
        ],
        underTheHood: bi(
          "My WorkはGitHubの検索クエリ構文をアプリ内のセクションとして表現し、`has:`/`no:`はラベル・担当者・マイルストーン・プロジェクト・タイプ・サブIssue・親Issueの有無を条件にします。",
          "My Work expresses GitHub's search query syntax as in-app sections, and `has:`/`no:` condition on the presence of a label, assignee, milestone, project, type, sub-issue, or parent issue.",
        ),
        recoveryPath: bi(
          "Up nextが古い情報のままに見える場合は、フィルタをクリアしてから再適用し、それでも解決しなければセクションを一度削除して再作成してください。",
          "If Up next looks stale, clear filters and reapply them; if that does not resolve it, delete the section and recreate it.",
        ),
        successRubric: [
          bi("`has:`/`no:`修飾子を少なくとも2種類試した。", "You tried at least two different `has:`/`no:` qualifiers."),
          bi("Up nextから完了済み・重複項目を除外した。", "You excluded stale completed or duplicate items from Up next."),
          bi("次に着手すべき項目を1つ明確に選べた。", "You clearly picked one item to work on next."),
        ],
        stretchExercise: bi(
          "`has:parent-issue`と`no:milestone`を組み合わせたカスタムセクションを作成してください。",
          "Create a custom section that combines `has:parent-issue` and `no:milestone`.",
        ),
      };
    case "issues-links": {
      const flavor = guide.id === "23"
        ? bi("現在のセッションとは異なるリポジトリへのIssue作成とマイルストーン", "creating an issue in a different repository from the current session, plus milestones")
        : bi("Issueのdeep linkとセッションコンテキストの受け渡し", "issue deep links and carrying session context");
      return {
        persona: bi(
          `複数リポジトリを横断して働くメンテナーとして、${flavor.ja}を扱います。`,
          `As a maintainer working across multiple repositories, this lab focuses on ${flavor.en}.`,
        ),
        whyItMatters: bi(
          "Issueの作成先リポジトリを誤ると、無関係な購読者に通知が飛び、後から修正するのが難しくなります。",
          "Creating an issue in the wrong repository notifies unrelated watchers and is hard to correct after the fact.",
        ),
        objectives: [
          bi("Issue作成前に対象リポジトリを確認する", "Confirm the target repository before creating an issue"),
          bi("ホスト型ランチャー経由でdeep linkを安全に開く", "Open a deep link safely through the hosted launcher"),
          bi("マイルストーンをIssue/PRに表示・編集する", "View and edit milestones on issues/PRs"),
        ],
        decisionPoints: [
          bi("プロンプトでエージェントに対象リポジトリ名を復唱・一時停止させてから続行を許可するか。", "Have the prompt make the agent echo the target repository name and pause before granting permission to continue?"),
          bi("生の`ghapp://`を直接開くか、ホスト型ランチャーだけを使うか。", "Open a raw `ghapp://` directly, or use only the hosted launcher?"),
        ],
        checkpoints: [
          bi("チェックポイント1: エージェントが復唱したowner/repoが意図した値と一致している。", "Checkpoint 1: the owner/repo the agent echoed back matches the intended value."),
          bi("チェックポイント2: deep linkが意図した画面をそのまま開く。", "Checkpoint 2: the deep link opens exactly the intended screen."),
        ],
        underTheHood: bi(
          "アプリはIssue作成リクエストをセッションのリポジトリとは独立したAPI呼び出しとして送信できます。アプリ自体に専用の確認UIがあるかどうかはこのガイドでは断定しないため、対象の復唱と一時停止をプロンプトの指示として人間が求め、最終承認します。deep linkはホスト型ランチャーURLを経由することで、任意の`ghapp://`をそのまま実行しないようにしています。",
          "The app can send an issue-creation request as an API call independent of the session's own repository. This guide does not assert whether the app itself has a dedicated confirmation UI, so a human instead requests — via the prompt — that the target be echoed back and paused on, then gives final approval. Deep links route through a hosted launcher URL so an arbitrary `ghapp://` is never executed directly.",
        ),
        recoveryPath: bi(
          "誤ったリポジトリにIssueを作成してしまった場合、リポジトリ間移動はできないため、正しいリポジトリに新規作成し直し、誤って作成したIssueをクローズしてください。",
          "If an issue lands in the wrong repository, it cannot be moved between repositories — create a new one in the correct repository and close the mistaken one.",
        ),
        successRubric: [
          bi("Issue作成先が意図したリポジトリと一致することを確認した。", "You confirmed the issue landed in the intended repository."),
          bi("マイルストーンの表示・編集を少なくとも1回行った。", "You viewed or edited a milestone at least once."),
          bi("deep linkをホスト型ランチャー経由でのみ開いた。", "You opened deep links only through the hosted launcher."),
        ],
        stretchExercise: bi(
          "同じ変更に対して、Issueのリポジトリとは異なるリポジトリのマイルストーンにPRを紐づけてみてください。",
          "For the same change, try associating the pull request's milestone with a repository different from the issue's.",
        ),
      };
    }
    case "pr-review":
      return {
        persona: bi(
          "人の判断でレビューを送信するレビュアーとして、Copilot code reviewを併用します。",
          "As a reviewer who submits review with human judgment, combine it with Copilot code review.",
        ),
        whyItMatters: bi(
          "Copilot code reviewの要求・再要求を理解しないと、フィードバック後の再レビューで古いコメントが重複したり、レビューが人の確認なしに送信されたと誤解したりします.",
          "Without understanding how to request and re-request Copilot code review, re-review after feedback can duplicate stale comments or be mistaken as submitted without human confirmation.",
        ),
        objectives: [
          bi("Files changedとpending reviewを確認する", "Inspect Files changed and the pending review"),
          bi("Copilot code reviewを要求し再要求する", "Request and re-request a Copilot code review"),
          bi("人の判断でレビューを送信する", "Submit the review with human judgment"),
        ],
        decisionPoints: [
          bi("Copilotのコメントをそのまま受け入れるか、人が追加コメントするか。", "Accept Copilot's comment as-is, or add a human comment?"),
          bi("修正後すぐに再要求するか、他のコメントも待つか。", "Re-request immediately after a fix, or wait for other comments too?"),
        ],
        checkpoints: [
          bi("チェックポイント1: Copilot code reviewのコメントがinlineに表示される。", "Checkpoint 1: Copilot code review comments appear inline."),
          bi("チェックポイント2: 修正後の再要求で古いコメントが重複しない。", "Checkpoint 2: re-requesting after a fix does not duplicate stale comments."),
        ],
        underTheHood: bi(
          "Copilot code reviewはPRの差分をレビューエージェントとして解析し、pending reviewとしてコメントをステージングします。人が送信するまでコメントは公開されず、エージェントは既存の保留コメントを編集できるため重複作成を避けられます。",
          "Copilot code review analyzes a PR's diff as a review agent and stages comments as a pending review. Comments are not published until a human submits, and the agent can edit an existing pending comment instead of duplicating it.",
        ),
        recoveryPath: bi(
          "レビューコメントに対するFixアクションが止まって見える場合は、PRを再読み込みしてから再度Fixを要求し、それでも解決しなければコメントに直接返信して人手で対応してください。",
          "If a Fix action on a review comment appears stuck, reload the PR and re-request the fix; if it still fails, reply to the comment directly and resolve it by hand.",
        ),
        successRubric: [
          bi("Copilot code reviewを少なくとも1回要求した。", "You requested a Copilot code review at least once."),
          bi("修正後の再要求で重複コメントが発生しないことを確認した。", "You confirmed re-requesting after a fix produced no duplicate comments."),
          bi("最終的なレビュー送信を人の判断で行った。", "You submitted the final review with human judgment."),
        ],
        stretchExercise: bi(
          "同じPRに2回連続でCopilot code reviewを要求し、2回目の要求で扱いがどう変わるかを観察してください。",
          "Request Copilot code review twice in a row on the same PR and observe how the second request is handled.",
        ),
      };
    case "merge-stacks": {
      const flavor = guide.id === "22"
        ? bi("stack menuとマージドロワーのstack summaryを併用する", "combining the stack menu with the merge drawer's stack summary")
        : bi("Agent MergeとCIブロッカーへの対応を中心に扱う", "focusing on Agent Merge and responding to CI blockers");
      return {
        persona: bi(
          `関連するプルリクエストを束ねて着地させる担当者として、${flavor.ja}回です。`,
          `As the person landing a set of related pull requests together, this round ${flavor.en}.`,
        ),
        whyItMatters: bi(
          "stack、merge queue、Agent Mergeの状態を見誤ると、意図せず途中のPRだけをマージしたり、待機理由が分からないまま長時間ブロックされたりします。",
          "Misreading stack, merge-queue, or Agent Merge state risks merging only a partial PR unintentionally, or being blocked for a long time with no visible reason.",
        ),
        objectives: [
          bi("stack内のPRをstack menuで移動する", "Navigate PRs in a stack using the stack menu"),
          bi("マージドロワーのstack summaryとqueue positionを確認する", "Inspect the merge drawer's stack summary and queue position"),
          bi("Agent Mergeの一時停止理由を読み取る", "Read Agent Merge's pause status message"),
        ],
        decisionPoints: [
          bi("stackごとまとめてマージするか、1つのPRだけをマージするか。", "Merge the whole stack together, or only a single PR?"),
          bi("Agent Mergeを有効にするか、必須チェック完了後に人手でマージするか。", "Enable Agent Merge, or merge by hand once required checks pass?"),
        ],
        checkpoints: [
          bi("チェックポイント1: stack menuで別のPRへ移動できる。", "Checkpoint 1: the stack menu navigates to another PR."),
          bi("チェックポイント2: マージドロワーに含まれるPR一覧とqueue positionが表示される。", "Checkpoint 2: the merge drawer shows the included PR list and queue position."),
        ],
        underTheHood: bi(
          "direct mergeは現在のbaseへ1件のPRを直ちに着地させます。GitHub merge queueはPRと最新baseを一時的なmerge groupで組み合わせてrequired checksを再実行し、順番に安全に着地させます。check failureやconflictではqueueから外れる場合があります。merge-as-stackはbase branchが連鎖する関連PR群をまとめて扱う別操作です。Agent Mergeはさらに別で、workspaceのCopilot sessionにPRを読ませ、blocking conditionを修正し、GitHubが許可した時点でマージします。v1.1.4ではcommit status check待ちで一時停止している理由を表示します。",
          "A direct merge lands one PR against the current base immediately. GitHub merge queue combines a PR with the latest base in a temporary merge group, reruns required checks, and lands queued changes safely in order; a check failure or conflict can remove an entry. Merge-as-stack is a separate operation for related PRs whose base branches form a chain. Agent Merge is separate again: it asks the workspace's Copilot session to read the PR, fix blocking conditions, and merge when GitHub allows. In v1.1.4 it explains a pause while waiting on a commit status check.",
        ),
        recoveryPath: bi(
          "マージドロワーが確認中のまま止まって見える場合は、ドロワーを閉じて再度開き、それでも変わらなければPRを再読み込みし、Agent Mergeが一時停止中なら表示された理由に沿って対応してください。",
          "If the merge drawer appears stuck in a checking state, close and reopen it; if that does not change, reload the PR, and if Agent Merge is paused, act on the reason shown rather than re-toggling blindly.",
        ),
        successRubric: [
          bi("stack内のPRをstack menuで少なくとも1回移動した。", "You navigated between stacked PRs at least once via the stack menu."),
          bi("マージドロワーのstack summaryとqueue positionを確認した。", "You inspected the merge drawer's stack summary and queue position."),
          bi("Agent Mergeの一時停止理由を実際に読んだ。", "You actually read an Agent Merge pause reason."),
        ],
        stretchExercise: bi(
          "3つ以上のPRからなるより深いstackを作り、merge queueの位置がstack内でどう表示されるかを観察してください。",
          "Build a deeper stack of three or more PRs and observe how merge-queue position is shown within the stack.",
        ),
      };
    }
    case "security-review":
      return {
        persona: bi(
          "セキュリティレビューを最終判断する担当者として、`/security-review`とラバーダックエージェントを扱います。",
          "As the person making the final security-review call, work with `/security-review` and the rubber-duck agent.",
        ),
        whyItMatters: bi(
          "`/security-review`がパブリックプレビューであることと、ラバーダックエージェントの前提モデルを知らないと、結果を過信したり利用できるはずの場面で使えないと誤解したりします。",
          "Not knowing that `/security-review` is public preview, and the rubber-duck agent's model prerequisite, leads to over-trusting results or wrongly assuming it is unavailable when it should work.",
        ),
        objectives: [
          bi("`/security-review`を実行し結果を確認する", "Run `/security-review` and review its results"),
          bi("ラバーダックエージェントの利用条件（Claude/GPTモデル）を確認する", "Confirm the rubber-duck agent's model prerequisite (Claude/GPT)"),
          bi("最小権限の原則をセッションに適用する", "Apply least privilege to a session"),
        ],
        decisionPoints: [
          bi("検出結果をそのまま修正するか、誤検知として却下するか。", "Fix a finding as-is, or dismiss it as a false positive?"),
          bi("このセッションのツール権限をこのまま許可するか、絞り込むか。", "Keep this session's tool permissions as-is, or narrow them?"),
        ],
        checkpoints: [
          bi("チェックポイント1: `/security-review`がseverity、confidence、suggested fixesを含む優先順位付きの結果を返す。", "Checkpoint 1: `/security-review` returns prioritized findings with severity, confidence, and suggested fixes."),
          bi("チェックポイント2: ラバーダックエージェントがサポート対象モデルでのみ利用可能である。", "Checkpoint 2: the rubber-duck agent is available only on a supported model."),
        ],
        underTheHood: bi(
          "`/security-review`はセッションの差分に対して専用のレビューエージェントを起動し、ラバーダックはメインエージェントの前提や実装を問い直す専門エージェントとして動作します。いずれも権限プロンプトの対象操作や既存のsecurity controlsを代替しません。",
          "`/security-review` launches a dedicated review agent against the session's diff, while rubber duck acts as a specialist that challenges the main agent's assumptions and implementation. Neither replaces permission prompts or existing security controls.",
        ),
        recoveryPath: bi(
          "`/security-review`が仕様変更で動作しない場合は、パブリックプレビューである前提を確認したうえで、通常のPRレビュー（lab 13）に切り替えてください。",
          "If `/security-review` stops working due to a spec change, remember it is public preview and fall back to a normal PR review (lab 13).",
        ),
        successRubric: [
          bi("`/security-review`を少なくとも1回実行した。", "You ran `/security-review` at least once."),
          bi("ラバーダックエージェントの前提モデルを確認した。", "You confirmed the rubber-duck agent's model prerequisite."),
          bi("プレビュー機能であることを踏まえて結果を人が判断した。", "A human judged the result knowing it is a preview feature."),
        ],
        stretchExercise: bi(
          "意図的に軽微な脆弱性を含むサンプル変更を用意し、`/security-review`がそれを検出するかを確認してください。",
          "Prepare a sample change with a deliberately minor vulnerability and confirm whether `/security-review` catches it.",
        ),
      };
    case "automations": {
      const flavor = guide.id === "17"
        ? bi("cloud automationsとポリシー依存の可用性", "cloud automations and their policy-dependent availability")
        : bi("ローカルautomationsとトリガー設定", "local automations and trigger configuration");
      return {
        persona: bi(
          `繰り返し作業を自動化する担当者として、${flavor.ja}を扱います。`,
          `As someone automating repetitive work, this lab covers ${flavor.en}.`,
        ),
        whyItMatters: bi(
          "トリガー条件と最小権限を誤ると、意図しない大量実行や過剰な権限を持つ自動化が生まれます。",
          "Misconfigured trigger conditions and privileges create either unintended mass runs or an over-privileged automation.",
        ),
        objectives: [
          bi("手動・定期・イベントトリガーを構成する", "Configure manual, scheduled, and event triggers"),
          bi("smart queryや変更ファイル条件で対象を絞る", "Narrow scope with a smart query or changed-file condition"),
          guide.id === "17"
            ? bi("実行状態を確認し、schedule-triggered startup retryの公式範囲を説明する", "Inspect run status and explain the documented scope of schedule-triggered startup retry")
            : bi("実行状態と履歴を確認する", "Inspect run status and history"),
        ],
        decisionPoints: [
          bi("このトリガーは手動に留めるか、定期実行にするか。", "Keep this trigger manual, or make it scheduled?"),
          bi("最小権限のツールセットで十分か、追加権限が必要か。", "Is the least-privilege toolset enough, or is more access needed?"),
        ],
        checkpoints: [
          bi("チェックポイント1: トリガー条件どおりに自動化が起動する。", "Checkpoint 1: the automation fires according to its trigger condition."),
          guide.id === "17"
            ? bi("チェックポイント2: 最終実行状態を確認し、一時的ネットワーク障害のretryはscheduled workflowのsession start時に内部で短時間行われ、run historyに表示されるとは限らないと説明できる。", "Checkpoint 2: you inspect the latest run status and can explain that brief retry after a transient network error is internal to scheduled-workflow session startup and may not be visible in run history.")
            : bi("チェックポイント2: Recent runsで最終実行状態を確認できる。", "Checkpoint 2: the latest run status is visible in Recent runs."),
        ],
        underTheHood: bi(
          "automationは保存したprompt、trigger、filter、tool permissionsからsessionを開始します。cloud automationはcloud agentを使い、plan、policy、private/internal repository、write accessなどの条件に依存します。v1.1.4ではscheduled workflowのsession start時に一時的なnetwork errorが起きると短時間retryしますが、retryの内部詳細やrun history上の表示は公式ソースで説明されていません。",
          "An automation starts a session from its saved prompt, trigger, filters, and tool permissions. Cloud automation uses the cloud agent and depends on plan, policy, a private/internal repository, write access, and related conditions. In v1.1.4, a scheduled workflow briefly retries a transient network error while starting its session, but official sources do not describe internal retry details or a run-history indicator.",
        ),
        recoveryPath: bi(
          "自動化が実行されない場合は、まずトリガー条件とリポジトリ権限を確認し、cloud automationの場合はポリシーで無効化されていないかを管理者に確認してください。",
          "If an automation does not run, first check its trigger condition and repository permissions; for a cloud automation, confirm with an administrator that policy has not disabled it.",
        ),
        successRubric: [
          bi("少なくとも1種類のトリガーを実際に発火させた。", "You actually fired at least one kind of trigger."),
          bi("Recent runsで成功または失敗の状態を確認し、内部retryが表示されるとは断定していない。", "You inspected success or failure in Recent runs without claiming internal retries are displayed."),
          bi("最小権限のツールセットを意図的に選んだ。", "You deliberately chose a least-privilege toolset."),
        ],
        stretchExercise: bi(
          "変更ファイルパスの条件を追加し、条件に一致しない変更では自動化が起動しないことを確認してください。",
          "Add a changed-file-path condition and confirm the automation does not fire for a change that does not match it.",
        ),
      };
    }
    case "extensibility": {
      const flavor = guide.id === "19"
        ? bi("MCP、skills、plugins、Canvas拡張を信頼境界内で追加する", "adding MCP, skills, plugins, and Canvas extensions within a trust boundary")
        : bi("custom agentsをブランチ/worktree単位で定義する", "defining custom agents scoped to a branch or worktree");
      return {
        persona: bi(
          `アプリの能力を広げたいメンテナーとして、${flavor.ja}回です。`,
          `As a maintainer extending the app's capabilities, this round covers ${flavor.en}.`,
        ),
        whyItMatters: bi(
          "信頼境界を意識しないままリポジトリ定義の拡張を追加すると、信頼できないコードや指示を無警戒に実行するリスクがあります。",
          "Adding a repository-defined extension without minding trust boundaries risks executing untrusted code or instructions unguarded.",
        ),
        objectives: [
          bi("アプリ管理の指示と file-backed instructions の出典を区別する", "Distinguish app-managed guidance from discovered file-backed instructions"),
          bi("custom agent、MCP、pluginの少なくとも1つを追加する", "Add at least one custom agent, MCP server, or plugin"),
          bi("信頼済みリポジトリの前提を確認する", "Confirm the trusted-repository prerequisite"),
        ],
        decisionPoints: [
          bi("この拡張をuserスコープにするか、repositoryスコープにするか。", "Scope this extension to the user, or to the repository?"),
          bi("このリポジトリを信頼済みとして扱ってよいか。", "Is it acceptable to treat this repository as trusted?"),
        ],
        checkpoints: [
          bi("チェックポイント1: エージェントピッカー/`/agent`オートコンプリートに新しいcustom agentが表示される。", "Checkpoint 1: the new custom agent appears in the agent picker/`/agent` autocomplete."),
          bi("チェックポイント2: `.github/skills/`のskillがSettings > Skillsに「not found」ではなく表示される。", "Checkpoint 2: a `.github/skills/` skill appears in Settings > Skills instead of being shown as not found."),
        ],
        underTheHood: bi(
          "custom agent、MCPサーバー、skill、pluginはいずれもリポジトリまたはユーザー設定に保存された宣言的な定義で、アプリはそれらを読み込む前に定義元の信頼状態を確認します。ブランチ/worktree限定のcustom agentはそのブランチのファイルが存在する場合にのみピッカーに現れます。",
          "Custom agents, MCP servers, skills, and plugins are all declarative definitions stored in the repository or user settings, and the app checks the trust state of their source before loading them. A branch/worktree-scoped custom agent appears in the picker only while that branch's file is present.",
        ),
        recoveryPath: bi(
          "追加した拡張が反映されない場合は、セッションを再開するかアプリを再起動し、それでも表示されない場合は定義ファイルの構文とスコープ（user/repository）を確認してください。",
          "If a newly added extension does not take effect, resume the session or restart the app; if it still does not appear, check the definition file's syntax and scope (user/repository).",
        ),
        successRubric: [
          bi("少なくとも1つの拡張を追加し動作を確認した。", "You added and verified at least one extension."),
          bi("app-managedとfile-backedの指示の出典を区別できる。", "You can distinguish app-managed guidance from file-backed instructions."),
          bi("信頼境界を意識してリポジトリ定義の拡張を扱った。", "You handled a repository-defined extension with the trust boundary in mind."),
        ],
        stretchExercise: bi(
          "同じ機能を提供するuserスコープとrepositoryスコープの拡張を両方定義し、どちらが優先されるかを確認してください。",
          "Define both a user-scoped and a repository-scoped extension offering the same capability, and confirm which one takes precedence.",
        ),
      };
    }
    case "memory-chronicle":
      return {
        persona: bi(
          "コストと履歴を監視する担当者として、Chronicle、Insights、contextを扱います。",
          "As someone monitoring cost and history, work with Chronicle, Insights, and context.",
        ),
        whyItMatters: bi(
          "アプリの履歴表示とCopilot Memoryの公式境界を混同すると、ドキュメント化された挙動と異なる範囲を期待してしまいます。",
          "Confusing the app's history surfaces with the documented Copilot Memory boundary leads to expecting behavior outside what is documented.",
        ),
        objectives: [
          bi("`/chronicle`で作業履歴を振り返る", "Review work history with `/chronicle`"),
          bi("Insightsでコストと使用状況を確認する", "Review cost and usage in Insights"),
          bi("`/context`と`/compact`でコンテキスト消費を管理する", "Manage context consumption with `/context` and `/compact`"),
        ],
        decisionPoints: [
          bi("このタイミングで`/compact`するか、履歴をそのまま残すか。", "Run `/compact` now, or keep the history as-is?"),
          bi("Insightsのコスト傾向から、モデルや頻度を見直すか。", "Adjust model choice or frequency based on Insights cost trends?"),
        ],
        checkpoints: [
          bi("チェックポイント1: `/chronicle`が過去のセッション横断の要約を表示する。", "Checkpoint 1: `/chronicle` shows a summary spanning past sessions."),
          bi("チェックポイント2: Insightsにコストと使用量の推移が表示される。", "Checkpoint 2: Insights shows cost and usage trends."),
        ],
        underTheHood: bi(
          "ChronicleはCopilot CLI由来のsession-history queryで、AppがCLI上に構築されているためApp sessionからも使えます。InsightsはAppのsession単位のtimeline/context表示です。`/context`と`/compact`もApp slash-command referenceで文書化されています。これらはCopilot Memory（CLI/cloud agent/code reviewが公式対象）とは異なる仕組みです。",
          "Chronicle is a Copilot CLI session-history query available from app sessions because the app is built on CLI. Insights is the app's per-session timeline/context surface, while `/context` and `/compact` are documented in the App slash-command reference. These differ from Copilot Memory, whose documented product scope is CLI, cloud agent, and code review.",
        ),
        recoveryPath: bi(
          "コンテキストが逼迫してエージェントの応答品質が落ちた場合は、`/compact`で要約してから続行し、それでも改善しなければ新しいセッションに要点を引き継いでください。",
          "If context pressure degrades agent response quality, summarize with `/compact` and continue; if that does not help, carry the key points over to a new session.",
        ),
        successRubric: [
          bi("`/chronicle`でセッション横断の履歴を確認した。", "You reviewed cross-session history with `/chronicle`."),
          bi("Insightsでコスト傾向を確認した。", "You reviewed cost trends in Insights."),
          bi("Copilot Memoryとアプリ履歴表示の境界を説明できる。", "You can explain the boundary between Copilot Memory and the app's history surfaces."),
        ],
        stretchExercise: bi(
          "`/context`の出力を`/compact`の前後で比較し、解放されたトークン量を見積もってください。",
          "Compare `/context` output before and after `/compact` and estimate the tokens freed.",
        ),
      };
    case "accessibility-recovery":
      return {
        persona: bi(
          "アクセシビリティと復旧手順を検証する担当者として、focus/screen readerとstorageを扱います。",
          "As someone verifying accessibility and recovery procedures, work with focus/screen-reader support and storage.",
        ),
        whyItMatters: bi(
          "キーボード操作とscreen readerの検証を怠ると、一部の利用者がアプリの重要な操作にアクセスできなくなります。",
          "Skipping keyboard and screen-reader verification leaves some users unable to reach important app operations.",
        ),
        objectives: [
          bi("Shift+Tabとfocus移動を検証する", "Verify Shift+Tab and focus movement"),
          bi("screen readerでの読み上げを確認する", "Confirm screen-reader announcements"),
          bi("storageとバージョンごとのアクセシビリティ改善範囲を理解する", "Understand storage and the per-version scope of accessibility fixes"),
        ],
        decisionPoints: [
          bi("この操作はキーボードのみで完結できるか。", "Can this action be completed with the keyboard alone?"),
          bi("このアクセシビリティ挙動は記載バージョン以降にのみ有効か確認するか。", "Confirm whether this accessibility behavior applies only from the documented version onward?"),
        ],
        checkpoints: [
          bi("チェックポイント1: Tab/Shift+Tabだけで主要な操作に到達できる。", "Checkpoint 1: Tab/Shift+Tab alone reaches the primary controls."),
          bi("チェックポイント2: screen readerが主要なコントロールのラベルを読み上げる。", "Checkpoint 2: the screen reader announces labels for primary controls."),
        ],
        underTheHood: bi(
          "アクセシビリティ改善は複数のリリースにまたがって段階的に提供されるため、特定の修正はそのリリース以降のビルドでのみ有効です。storageはOSの標準的な設定/キャッシュディレクトリを使い、破損時はリセットで再構築されます。",
          "Accessibility improvements ship incrementally across releases, so a specific fix is active only from the build in which it shipped. Storage uses the OS's standard settings/cache directories and rebuilds itself on reset if corrupted.",
        ),
        recoveryPath: bi(
          "設定がリセットされる、または起動できない場合は、まずアプリを最新版に更新し、それでも解決しなければ設定ディレクトリをバックアップしてから初期化してください。",
          "If settings keep resetting or the app fails to launch, first update to the latest build; if that does not resolve it, back up the settings directory and then reset it.",
        ),
        successRubric: [
          bi("キーボードのみで主要な操作を完了できることを確認した。", "You confirmed the primary actions complete with keyboard alone."),
          bi("screen readerでの読み上げを実際に確認した。", "You actually confirmed screen-reader announcements."),
          bi("挙動の前提バージョンを明記して検証した。", "You verified behavior while noting its prerequisite version."),
        ],
        stretchExercise: bi(
          "画像プレビューを開いた状態でTab/Shift+Tabを操作し、フォーカスが正しく移動することを確認してください。",
          "With an image preview open, operate Tab/Shift+Tab and confirm focus moves correctly.",
        ),
      };
    case "ops-recovery":
      return {
        persona: bi(
          "共有マシンや高度な構成を運用する担当者として、worktreeの保存場所、コミット帰属、診断ダイアログの入り口を安全に観察します。",
          "As someone operating a shared machine or advanced configuration, safely observe worktree location, commit attribution, and the diagnostics dialog's entry point.",
        ),
        whyItMatters: bi(
          "worktreeの保存場所やコミット帰属の設定を理解しないまま変更すると予期しない挙動に驚くことがあり、診断ダイアログの場所を事前に知っておくと、実際に障害が起きたときに落ち着いて対応できます。",
          "Changing the worktree location or commit-attribution setting without understanding it can produce a surprising result, and knowing where the diagnostics dialog lives ahead of time lets you respond calmly if a failure ever occurs naturally.",
        ),
        objectives: [
          bi("Settings UIが示すプレースホルダーでWorktree locationを構成し、実際のパスを観察する", "Configure Worktree location using the placeholders the Settings UI itself shows, and observe the resulting path"),
          bi("Commit attribution設定の効果を1件の使い捨てコミットで観察する（設定範囲は断定しない）", "Observe the effect of the Commit attribution setting on one disposable commit, without asserting its scope"),
          bi("診断ダイアログの入り口を、障害を発生させずに確認する", "Locate the diagnostics dialog's entry point without inducing a failure"),
        ],
        decisionPoints: [
          bi("worktreeの保存場所をデフォルトのままにするか、使い捨てプロジェクトでカスタム値を試すか。", "Keep the default worktree location, or try a custom value in a disposable project?"),
          bi("Commit attributionの現在の状態をそのまま観察するか、使い捨てコミットで変更後の効果も確認するか。", "Just observe the current Commit attribution state, or also verify its effect after a change using a disposable commit?"),
        ],
        checkpoints: [
          bi("チェックポイント1: 新しいセッションのworktreeの実際のパスを`git worktree list`で確認できた。", "Checkpoint 1: you confirmed the new session's actual worktree path with `git worktree list`."),
          bi("チェックポイント2: 使い捨てコミットのトレーラーの有無を観察できた。", "Checkpoint 2: you observed the presence or absence of the trailer on a disposable commit."),
        ],
        underTheHood: bi(
          "Worktree locationはリポジトリ・ブランチ・名前のプレースホルダーを解決してGitのworktreeパスを決定します（正確な構文はSettings画面自体で確認してください）。Commit attributionはコミット作成時にCo-authored-byトレーラーを付与するかどうかだけを制御します。startup diagnosticsは起動時の例外の詳細をコピーまたはログファイルを開く手段として提示し、ワークスペースのセットアップ失敗は「invalid argument」ではなく専用のメッセージとして区別されます。",
          "Worktree location resolves repository, branch, and name placeholders into a Git worktree path (confirm the exact syntax in the Settings screen itself). Commit attribution only controls whether a Co-authored-by trailer is added when a commit is created. Startup diagnostics offers a way to copy details or open the log file for a startup exception, and a workspace setup failure is distinguished with its own message instead of being mislabeled as an \"invalid argument\" error.",
        ),
        recoveryPath: bi(
          "もし実際に起動できなくなった場合は、意図的に再現しようとせず、startup diagnosticsダイアログでログを取得し、公式リポジトリのIssueに報告してください。worktreeのセットアップが自然に失敗した場合は、通常のクリーンアップ手順でworktreeを削除し、必要なら作り直してください。ピン留めされたセッションは一括削除の対象から外れることを確認してから、通常のクリーンアップを進めてください。",
          "If the app ever genuinely fails to launch, do not try to reproduce it deliberately — capture the log from the startup diagnostics dialog and report it in the official repository's issue tracker. If worktree setup fails on its own, delete the worktree using your normal cleanup steps and recreate it if needed. Confirm pinned sessions are excluded from a bulk delete before proceeding with normal cleanup.",
        ),
        successRubric: [
          bi("Settings UIが示すプレースホルダーでWorktree locationを構成し、実際のパスを観察した。", "You configured Worktree location using the placeholders the Settings UI itself shows, and observed the actual path."),
          bi("Commit attributionの設定変更を1件の使い捨てコミットのログで観察した。", "You observed a Commit attribution setting's effect in the log of one disposable commit."),
          bi("診断ダイアログの入り口を、障害を発生させずに確認した。", "You located the diagnostics dialog's entry point without inducing a failure."),
        ],
        stretchExercise: bi(
          "2つの使い捨てプロジェクトで異なるWorktree location値を試し、Settings画面自体が示すプレースホルダーの表記に違いがないかを比較してください。障害を発生させる必要はありません。",
          "Try two different Worktree location values across two disposable projects, and compare whether the Settings screen's own placeholder hint text differs between them. There is no need to induce any failure.",
        ),
      };
    case "capstone":
      return {
        persona: bi(
          "Issueの発見から本番相当のPRの着地と後片付けまでを一人称で担当するデリバリー担当者です。",
          "As the delivery owner carrying an issue end to end through a production-like landed PR and cleanup.",
        ),
        whyItMatters: bi(
          "個々の機能を単独で知っていても、Issueから着地、そして運用クリーンアップまでを一つの連続した流れとして実行できなければ、実際の開発サイクルでは価値が発揮されません。",
          "Knowing each capability in isolation does not translate into real value unless you can execute the whole continuous flow from issue to landing to operational cleanup.",
        ),
        objectives: [
          bi("Issueから計画、実装、レビュー、マージまでを一つの流れで実行する", "Execute issue through plan, implementation, review, and merge as one continuous flow"),
          bi("stack/merge queue/Agent Mergeの状態を人の判断で最終確認する", "Give final human judgment on stack/merge-queue/Agent Merge state"),
          bi("着地後の運用クリーンアップ（セッション、worktree、設定）を完了する", "Complete post-landing operational cleanup (sessions, worktrees, settings)"),
        ],
        decisionPoints: [
          bi("Plan reviewを承認して進めるか、スコープを絞って差し戻すか。", "Approve the plan review and proceed, or reject it to narrow scope?"),
          bi("Agent Mergeに任せるか、人手で最終マージするか。", "Rely on Agent Merge, or merge by hand as the final step?"),
        ],
        checkpoints: [
          bi("チェックポイント1: 実装がIssueの受け入れ条件を満たしている。", "Checkpoint 1: the implementation satisfies the issue's acceptance criteria."),
          bi("チェックポイント2: 必須チェックが成功し、Copilot reviewが利用可能なら対応済み、利用不可なら制約と人のreview結果を記録している。", "Checkpoint 2: required checks pass; if Copilot review is available its feedback is addressed, otherwise the limitation and human-review result are recorded."),
          bi("チェックポイント3: セッション・worktree・設定のクリーンアップが完了している。", "Checkpoint 3: session, worktree, and settings cleanup is complete."),
        ],
        underTheHood: bi(
          "このラボはlab 01, 04, 05, 11-14, 20-24で個別に扱った各サーフェスを、単一のGitHubイベントストリーム（Issue作成、PRオープン、レビュー、CI、マージ、クローズ）に沿って直列に接続します。各サーフェスの内部動作はそれぞれの専用labを参照してください。",
          "This lab chains the surfaces covered individually in labs 01, 04, 05, 11-14, and 20-24 along a single GitHub event stream (issue creation, PR open, review, CI, merge, close). Refer to each surface's dedicated lab for its own internal mechanics.",
        ),
        recoveryPath: bi(
          "途中のどの段階で失敗しても、直前のチェックポイントまで巻き戻して再開できます。実装が破綻した場合はセッションをアーカイブし、新しいworktreeで同じIssueから再開してください。",
          "If any stage fails, you can rewind to the previous checkpoint and resume. If the implementation itself goes wrong, archive the session and resume from the same issue in a fresh worktree.",
        ),
        successRubric: [
          bi("Issueから着地までを中断なく一つの流れとして完了した。", "You completed issue-to-landing as one uninterrupted flow."),
          bi("マージ前にレビューとCIの両方を人が確認した。", "A human confirmed both review and CI before merge."),
          bi("着地後の運用クリーンアップをすべて実施した。", "You completed all post-landing operational cleanup."),
          bi("設定を変更した場合は元の状態に戻すか、意図的な変更として記録した。", "Any changed settings were reverted or recorded as an intentional change."),
        ],
        stretchExercise: bi(
          "同じ流れを2つ目のIssueに対して繰り返し、2回目の所要時間と手順の再現性を比較してください。",
          "Repeat the same flow for a second issue and compare the time taken and reproducibility of the steps.",
        ),
      };
    default:
      throw new Error(`Unknown enrichment domain for lab ${guide.id}`);
  }
}

// ---------------------------------------------------------------------------
// Provenance: every lab must visibly distinguish docs-grounded behavior
// (covered by long-form docs.github.com / README pages, largely version-
// independent) from release-note-grounded behavior (confirmed only by the
// github/app changelog for a specific v1.1.x delta, with no long-form doc
// walkthrough). "mixed" labs combine both. The note also carries any
// lab-specific source-inconsistency caveats required by the audit (e.g.
// `/side`, `pr-stack`, merge-queue write-access, WSL parity).
// ---------------------------------------------------------------------------

const CLICK_PATH_CAVEAT = bi(
  "手順内の正確なメニュー名・ボタン名・クリック順は変更履歴（changelog）に基づく記述であり、スクリーンショット付きの公式ウォークスルーで検証されたものではありません。実際の画面がここと異なる場合は、画面に表示されている表記を優先してください。",
  "Exact menu names, button labels, and click order in the steps are grounded in changelog entries, not an illustrated official walkthrough. If your running build's UI differs from this text, follow what the screen actually shows instead.",
);

function withClickPathCaveat(note) {
  return bi(`${note.ja} ${CLICK_PATH_CAVEAT.ja}`, `${note.en} ${CLICK_PATH_CAVEAT.en}`);
}

function domainProvenance(guide) {
  const domain = domainByLab[guide.id] || "general";
  switch (domain) {
    case "foundations":
      return {
        primary: "docs",
        note: bi(
          "導入手順、サインイン、プロジェクト接続は GitHub の公式スタートガイドと `github/app` README に基づく docs-grounded な内容です。Business / Enterprise の App access は GitHub Copilot App ポリシーで制御され、このポリシーは Copilot CLI ポリシーとは別に評価されます。",
          "The install flow, sign-in, and project connection are docs-grounded, following GitHub's official getting-started guide and the `github/app` README. For Business and Enterprise, app access is controlled by the GitHub Copilot app policy, which is evaluated separately from the Copilot CLI policy.",
        ),
      };
    case "models":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "GitHub ホスト型モデルと BYOK の一般的な概念は docs-grounded です。Auto の実モデル表示、reasoning effort の永続化、AI Credits とキャッシュの詳細な見え方は、公式の長文ドキュメントではなく変更履歴（changelog）に基づく release-note-grounded な情報です。",
            "GitHub-hosted models and BYOK concepts in general are docs-grounded. Auto's actual-model display, reasoning-effort persistence, and the exact appearance of AI Credits/cache detail are release-note-grounded, sourced from the changelog rather than a long-form doc.",
          ),
        ),
      };
    case "planning":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "Interactive、Plan、Autopilot という3つのモードの概念自体は docs-grounded です。Shift+Tab によるモード切り替えと、描画される Plan review の具体的な見た目（チェックリスト、検索、Markdown 編集）は release-note-grounded です。",
            "The Interactive, Plan, and Autopilot mode concepts themselves are docs-grounded. Shift+Tab mode cycling and the specific rendered appearance of the Plan review (checklist, search, Markdown editing) are release-note-grounded.",
          ),
        ),
      };
    case "worktrees":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "セッションの実行場所（working tree／ローカルリポジトリ／cloud sandbox）という選択肢の概念は docs-grounded です。具体的な信頼性改善やcloud sandboxの提供状況は release-note-grounded です。",
            "The concept of choosing where a session runs (working tree, local repository, or cloud sandbox) is docs-grounded. Specific reliability improvements and cloud-sandbox availability are release-note-grounded.",
          ),
        ),
      };
    case "orchestration": {
      const sideNote =
        guide.id === "06"
          ? bi(
              " 注記: `/side` コマンドは changelog（v1.1.3 で追加）でのみ確認でき、監査時点の最新スラッシュコマンド一覧には記載がありませんでした。正確なキー操作や UI は発明せず、利用前に現行ビルドで実際に使えるか確認してください。",
              " Note: the `/side` command is confirmed only by the changelog (added in v1.1.3) and was absent from the audited current slash-command reference. Do not assume specific keys or UI beyond the command itself — confirm it is still available in your current build before relying on it.",
            )
          : { ja: "", en: "" };
      return {
        primary: "release-notes",
        note: withClickPathCaveat(
          bi(
            `ネストされたセッション、Session Grid、side chat はいずれも変更履歴（changelog）に基づく release-note-grounded な機能で、公式の長文ドキュメントによる網羅的な説明はありません。${sideNote.ja}`,
            `Nested sessions, the Session Grid, and side chats are all release-note-grounded features sourced from the changelog, with no comprehensive long-form documentation.${sideNote.en}`,
          ),
        ),
      };
    }
    case "chat-lifecycle":
      return {
        primary: "release-notes",
        note: bi(
          "チャットのアーカイブ、Edit and rewind、`/compact` はいずれも変更履歴（changelog）とスキル参照に基づく release-note-grounded な機能です。",
          "Archiving chats, Edit and rewind, and `/compact` are all release-note-grounded, sourced from the changelog and skill references.",
        ),
      };
    case "platforms":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "WSL リモート環境、VS Code handoff、cloud sandbox という機能の一般的な存在は docs-grounded です。具体的な接続信頼性の改善や「VS Code は常に新しいウィンドウを開く」といった挙動の詳細は release-note-grounded です。",
            "The general existence of WSL remote environments, VS Code handoff, and cloud sandbox is docs-grounded. Specific connection-reliability improvements and behavioral details such as \"VS Code always opens a new window\" are release-note-grounded.",
          ),
        ),
      };
    case "files-diffs":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "Files でのファイル閲覧・編集という概念自体は docs-grounded です。自動保存の具体的な挙動や、進行中／コミット済み／アーカイブ済みという3種類の差分状態の区別は release-note-grounded です。",
            "Viewing and editing files in Files is docs-grounded as a concept. The specific autosave behavior and the distinction between live, committed, and archived diff states are release-note-grounded.",
          ),
        ),
      };
    case "canvas":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "Canvas 拡張という仕組みの一般的な概念は docs-grounded です。`/create-canvas` スキルの具体的な挙動と一般提供状況は release-note-grounded です。",
            "The general concept of canvas extensions is docs-grounded. The specific behavior and general-availability status of the `/create-canvas` skill are release-note-grounded.",
          ),
        ),
      };
    case "my-work":
      return {
        primary: "docs",
        note: bi(
          "My Work のセクションと検索構文は GitHub の公式 Issue/PR 検索ドキュメントに基づく docs-grounded な内容です。`has:`/`no:` 修飾子がこのアプリに追加された事実自体は release-note-grounded（v1.1.0）です。",
          "My Work's sections and search syntax are docs-grounded, following GitHub's official issue/PR search documentation. The fact that the `has:`/`no:` qualifiers were added to this app is itself release-note-grounded (v1.1.0).",
        ),
      };
    case "issues-links": {
      if (guide.id === "23") {
        return {
          primary: "release-notes",
          note: withClickPathCaveat(
            bi(
              "別リポジトリへの Issue 作成、および Issue/PR のマイルストーン表示・編集 UI は v1.1.4 の変更履歴（changelog）でのみ確認できる release-note-grounded な機能です。マイルストーンという概念自体は docs.github.com で docs-grounded に説明されています。アプリ固有の編集手順は公式ウォークスルーがないため、本ラボでは誘導観察（guided observation）として扱い、画面の表示に従ってください。",
              "Creating an issue in a different repository, and the app's issue/PR milestone view/edit UI, are release-note-grounded, confirmed only by the v1.1.4 changelog. The concept of a milestone itself is docs-grounded on docs.github.com. Because there is no official walkthrough of the app-specific editing flow, this lab treats it as guided observation — follow what your screen actually shows.",
            ),
          ),
        };
      }
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "Issue のディープリンクという概念は GitHub の URL・検索ドキュメントに一部 docs-grounded な裏付けがありますが、安全なホスト型 `ghapp://` ランチャーという具体的な仕組みはこのアプリ固有であり release-note-grounded です。",
            "The concept of deep-linking to an issue has partial docs-grounded support in GitHub's URL/search documentation, but the specific safe hosted `ghapp://` launcher mechanism is app-specific and release-note-grounded.",
          ),
        ),
      };
    }
    case "pr-review":
      return {
        primary: "docs",
        note: bi(
          "プルリクエストレビューの一般的な流れ（Files changed、レビューの送信、CI の確認）は GitHub の公式ドキュメントに基づく docs-grounded な内容です。Copilot code review の要求・再要求という機能そのものは release-note-grounded です。",
          "The general pull request review flow (Files changed, submitting a review, checking CI) is docs-grounded, following GitHub's official documentation. Requesting and re-requesting a Copilot code review as a feature is itself release-note-grounded.",
        ),
      };
    case "merge-stacks": {
      if (guide.id === "22") {
        return {
          primary: "release-notes",
          note: withClickPathCaveat(
            bi(
              "merge queue と branch protection の一般的な仕組み（トポロジー）は GitHub の公式ドキュメントに基づく docs-grounded な内容です。stack menu、stack status、マージドロワーの stack summary はアプリ固有の UI であり、v1.1.3／v1.1.4 の変更履歴（changelog）でのみ確認できる release-note-grounded な機能です。Agent Merge、GitHub の merge queue、merge-as-stack（関連 PR をまとめてマージする操作）は別々の仕組みであり、公式ソースが明示していない限り Agent Merge がスタック全体に適用されるとは主張しません。queue からの削除は書き込み権限を持つユーザーのみ確認されています。注記: `pr-stack` は組み込みスキルとしてドキュメント化されている一方、`/pr-stack` は監査対象の現行スラッシュコマンド一覧には見当たりませんでした。特定のスラッシュコマンドが常に利用可能であるとは主張しません。",
              "The general topology of the merge queue and branch protection is docs-grounded, following GitHub's official documentation. The stack menu, stack status, and the merge drawer's stack summary are app-specific UI, release-note-grounded and confirmed only by the v1.1.3/v1.1.4 changelog. Agent Merge, GitHub's merge queue, and merge-as-stack (merging a set of related PRs together) are three separate mechanisms; this lab does not claim Agent Merge applies to an entire stack unless an official source explicitly says so. Removal from the queue is confirmed only for users with write access. Source-inconsistency note: `pr-stack` is documented as a built-in skill, while `/pr-stack` did not appear in the audited current slash-command reference — this lab does not assert universal availability of any specific slash command.",
            ),
          ),
        };
      }
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "merge queue と branch protection の一般的な仕組みは docs-grounded です。Agent Merge の具体的な挙動（一時停止時のステータスメッセージなど）は release-note-grounded です。",
            "The general mechanics of the merge queue and branch protection are docs-grounded. Agent Merge's specific behavior, such as its pause status message, is release-note-grounded.",
          ),
        ),
      };
    }
    case "security-review":
      return {
        primary: "docs",
        note: bi(
          "`/security-review` とラバーダックエージェントはいずれも専用の GitHub Docs と App slash-command reference に基づく docs-grounded な機能です。`/security-review` は Public preview です。ラバーダック自体は preview ではなく、メインエージェントが Claude または GPT の大規模言語モデルを使っている場合に利用できます。",
          "`/security-review` and the rubber duck agent are docs-grounded through dedicated GitHub Docs and the App slash-command reference. `/security-review` is public preview. Rubber duck itself is not labeled preview; it is available when the main agent uses a Claude or GPT large language model.",
        ),
      };
    case "automations":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "自動化・ワークフローという一般的な概念は docs-grounded な裏付けがあります。smart query、トリガーの具体的な UI とふるまいは release-note-grounded です。",
            "Automation and workflow concepts in general have docs-grounded support. The specific UI and behavior of smart queries and triggers are release-note-grounded.",
          ),
        ),
      };
    case "extensibility":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "custom agent、MCP、skill、plugin という仕組みの概念自体は docs.github.com に docs-grounded な説明があります。file-backed instructions の発見と、リポジトリの `.github/skills/` によるスキル発見は別々の仕組みであり、混同しません。信頼境界の具体的な扱いは release-note-grounded です。",
            "The concepts of custom agents, MCP, skills, and plugins are docs-grounded on docs.github.com. Discovering file-backed instructions is a separate mechanism from discovering repository skills under `.github/skills/` — the two are not conflated. The specific handling of the trust boundary is release-note-grounded.",
          ),
        ),
      };
    case "memory-chronicle":
      return {
        primary: "mixed",
        note: bi(
          "Copilot MemoryのPublic previewとCLI／cloud agent／code reviewという対象範囲、App sessionから使う`/chronicle`、`/context`、`/compact`はいずれもGitHub Docsに基づくdocs-groundedな内容です。Insightsタブとcontext-window graphのApp固有UIはv1.0.17 / v1.0.18の変更履歴に基づくrelease-note-groundedな内容です。",
          "Copilot Memory's public-preview status and CLI/cloud-agent/code-review scope, plus `/chronicle`, `/context`, and `/compact` as used from app sessions, are docs-grounded. The app-specific Insights tab and context-window graph are release-note-grounded through the v1.0.17/v1.0.18 changelog.",
        ),
      };
    case "accessibility-recovery":
      return {
        primary: "mixed",
        note: withClickPathCaveat(
          bi(
            "キーボード操作や screen reader サポートという一般的なアクセシビリティ原則は docs-grounded です。ピン留めセッションの保護や個々の修正内容は release-note-grounded です。",
            "General accessibility principles such as keyboard operation and screen-reader support are docs-grounded. Pinned-session protection and individual fixes are release-note-grounded.",
          ),
        ),
      };
    case "ops-recovery":
      return {
        primary: "release-notes",
        note: withClickPathCaveat(
          bi(
            "Worktree location、Commit attribution、startup diagnostics ダイアログ、ピン留めセッションの保護は、いずれも v1.1.3／v1.1.4 の変更履歴（changelog）でのみ確認できる release-note-grounded な機能です。長文の公式ドキュメントによる網羅的な説明はないため、本ラボの具体的な UI 操作はすべて誘導観察（guided observation）として扱います。",
            "Worktree location, Commit attribution, the startup diagnostics dialog, and pinned-session protection are all release-note-grounded, confirmed only by the v1.1.3/v1.1.4 changelog. There is no comprehensive long-form documentation for them, so every concrete UI action in this lab is treated as guided observation.",
          ),
        ),
      };
    case "capstone":
      return {
        primary: "mixed",
        note: bi(
          "このラボはlab 01-24のdocs-groundedな内容とrelease-note-groundedな内容の両方を連続した流れとして組み合わせます。各段階の裏付けは、参照元のlab（例: lab 13のレビュー、lab 22のstack/Agent Merge、lab 24のworktree/attribution）に従います。",
          "This lab chains both docs-grounded and release-note-grounded content from labs 01-24 into one continuous flow. Each stage's grounding follows its source lab (for example, review in lab 13, stack/Agent Merge in lab 22, worktree/attribution in lab 24).",
        ),
      };
    default:
      throw new Error(`Unknown provenance domain for lab ${guide.id}`);
  }
}

function domainEnrichment(guide) {
  return { ...baseDomainEnrichment(guide), provenance: domainProvenance(guide) };
}

export { estimatedMinutes, domainEnrichment };

function applyPedagogyOverrides(lab) {
  if (lab.id === "06") {
    Object.assign(lab, {
      objectives: [
        bi("Session Gridで複数の独立セッション状態を比較する", "Compare multiple independent session states in Session Grid"),
        bi("main conversationを中断せずside chatで差分を確認する", "Inspect a diff in a side chat without interrupting the main conversation"),
        bi("quick chatのGrid追加と非破壊的なbulk actionsを観察する", "Observe a quick chat joining the Grid and inspect non-destructive bulk actions"),
      ],
      decisionPoints: [
        bi("短い並列質問をside chatで扱うか、独立したsessionを作るか。", "Use a side chat for a short parallel question, or create an independent session?"),
        bi("選択sessionへsend / mark readを行うか、archive / deleteの破壊的操作を避けるか。", "Send or mark selected sessions, or avoid destructive archive/delete actions?"),
      ],
      checkpoints: [
        bi("チェックポイント1: Gridに複数sessionが同時表示され、それぞれの状態を区別できる。", "Checkpoint 1: multiple sessions appear together in the Grid with distinguishable states."),
        bi("チェックポイント2: quick chatをGridで確認し、選択sessionのbulk action一覧を実行せずに読める。", "Checkpoint 2: the quick chat appears in the Grid and you inspect the selected-session bulk-action list without activating it."),
      ],
      underTheHood: bi(
        "各sessionは独立したconversation stateと、local sessionなら独立したworktreeを持ちます。Session Gridはそれらを同時表示する監督面です。side chatはreview contextの短い並列会話、quick chatは専用worktreeを作らない相談面であり、Gridへ追加されても通常のcoding sessionと同じ実行境界にはなりません。",
        "Each session has independent conversation state and, for local sessions, an isolated worktree. Session Grid is the supervision surface that displays them together. A side chat is a short parallel conversation in review context, while a quick chat does not create a dedicated worktree; adding it to the Grid does not turn it into a normal coding session.",
      ),
      recoveryPath: bi(
        "Grid表示やside chatが不整合に見える場合は対象sessionを個別に開いて状態を確認し、破壊的bulk actionを避けてから再読み込みします。",
        "If Grid or side-chat state looks inconsistent, open the affected session individually, avoid destructive bulk actions, and reload after confirming its state.",
      ),
      successRubric: [
        bi("2つ以上のsession状態をGridで比較した。", "You compared at least two session states in the Grid."),
        bi("side chatの回答がmain conversationと分離されていることを確認した。", "You confirmed the side-chat response remained separate from the main conversation."),
        bi("quick chatとbulk actionsを安全に観察し、archive/deleteを誤実行しなかった。", "You safely observed quick chat and bulk actions without accidentally archiving or deleting anything."),
      ],
    });
  }

  if (lab.id === "16") {
    Object.assign(lab, {
      objectives: [
        bi("繰り返しpromptをlocal automationとして保存する", "Save a repeatable prompt as a local automation"),
        bi("on-demand runとschedule runの境界を比較する", "Compare on-demand and scheduled local runs"),
        bi("Recent runsで結果を確認し、machine-on依存を説明する", "Inspect Recent runs and explain the dependency on the machine being on"),
      ],
      decisionPoints: [
        bi("今すぐon demandで実行するか、daily / weekly scheduleにするか。", "Run on demand now, or use a daily/weekly schedule?"),
        bi("local machineに置けるdataだけを扱っているか、cloud automationへ移す必要があるか。", "Is all data safe for local execution, or should the workflow move to cloud automation?"),
      ],
      checkpoints: [
        bi("チェックポイント1: on-demand runが新しいsessionを開始し、期待したoutputを残す。", "Checkpoint 1: the on-demand run starts a session and produces the expected output."),
        bi("チェックポイント2: scheduleとlast-run statusを確認し、computer / App停止中の制約を説明できる。", "Checkpoint 2: you inspect the schedule and last-run status and can explain the computer/App availability constraint."),
      ],
      underTheHood: bi(
        "local automationはこのmachineに保存されたpromptとscheduleからlocal sessionを開始します。repository eventを受けるcloud automationとは違い、local environmentとAppの稼働状態に依存します。",
        "A local automation starts a local session from a prompt and schedule stored on this machine. Unlike a cloud automation that reacts to repository events, it depends on the local environment and app availability.",
      ),
      recoveryPath: bi(
        "runが始まらない場合はautomationがenabledか、scheduleとtimezoneが正しいか、Appとmachineが稼働していたかを確認し、まずon-demand runでprompt自体を切り分けます。",
        "If a run does not start, check whether the automation is enabled, verify schedule and time zone, confirm the app and machine were running, and use an on-demand run to isolate whether the prompt itself works.",
      ),
      successRubric: [
        bi("local automationをon demandで1回成功させた。", "You completed one successful on-demand local automation run."),
        bi("scheduleとmachine-on依存を確認した。", "You verified the schedule and machine-on dependency."),
        bi("Recent runsで期待したsession/resultを特定した。", "You identified the expected session/result in Recent runs."),
      ],
    });
  }

  if (lab.id === "18") {
    Object.assign(lab, {
      objectives: [
        bi("repositoryまたはuser scopeのcustom agent profileを作成する", "Create a repository- or user-scoped custom-agent profile"),
        bi("agent pickerまたは`/agent`から専門agentを選択する", "Select the specialist through the agent picker or `/agent`"),
        bi("branch / worktreeに応じたprofile visibilityとtrust boundaryを確認する", "Verify profile visibility and trust boundaries across branches/worktrees"),
      ],
      decisionPoints: [
        bi("agent profileをrepository共有にするかuser専用にするか。", "Share the agent profile with the repository, or keep it user-only?"),
        bi("専門agentに許可するtools / instructionsを最小化できているか。", "Have you minimized the tools and instructions available to the specialist?"),
      ],
      checkpoints: [
        bi("チェックポイント1: custom agentがpickerまたは`/agent`に表示される。", "Checkpoint 1: the custom agent appears in the picker or `/agent`."),
        bi("チェックポイント2: 専門agentがprofileに定義した役割と境界に沿って応答する。", "Checkpoint 2: the specialist responds within the role and boundaries defined by its profile."),
      ],
      underTheHood: bi(
        "custom agentはMarkdown profileとして役割、instructions、利用toolsを宣言します。repository profileはbranch / worktreeのfile stateに従い、user profileは個人scopeで読み込まれます。選択したagentもsessionのpermission boundaryを越えません。",
        "A custom agent is a Markdown profile declaring role, instructions, and tools. Repository profiles follow the branch/worktree file state, while user profiles load from personal scope. Selecting a specialist does not bypass the session's permission boundary.",
      ),
      successRubric: [
        bi("custom agent profileを作成しpickerから選択した。", "You created a custom-agent profile and selected it from the picker."),
        bi("profileの専門instructionsが応答に反映された。", "The profile's specialist instructions affected the response."),
        bi("scopeとtool permissionsを意図どおりに限定した。", "You limited scope and tool permissions intentionally."),
      ],
    });
  }

  if (lab.id === "19") {
    Object.assign(lab, {
      objectives: [
        bi("MCP serverを追加し、credentialをchatへ貼らずに接続する", "Connect an MCP server without placing credentials in chat"),
        bi("file-backed instructionsと`.github/skills/` discoveryを別々のSettings面で確認する", "Verify file-backed instructions and `.github/skills/` discovery on separate settings surfaces"),
        bi("trusted pluginまたはCanvas extensionを追加しscopeを確認する", "Add a trusted plugin or Canvas extension and verify its scope"),
      ],
      decisionPoints: [
        bi("MCP / plugin / Canvas extensionをuser scopeに置くかrepository scopeに置くか。", "Place the MCP/plugin/Canvas extension in user scope or repository scope?"),
        bi("server / marketplace / repositoryを信頼し、要求toolsを許可してよいか。", "Do you trust the server, marketplace, or repository and its requested tools?"),
      ],
      checkpoints: [
        bi("チェックポイント1: MCP serverがConnectedとなり、公開されたtoolsを確認できる。", "Checkpoint 1: the MCP server is Connected and its exposed tools are visible."),
        bi("チェックポイント2: Settings > Sessionsでinstruction source path、Settings > Skillsで`.github/skills/` skillを別々に確認できる。", "Checkpoint 2: Settings > Sessions shows instruction source paths, while Settings > Skills separately lists the `.github/skills/` skill."),
        bi("チェックポイント3: pluginまたはCanvas extensionが選択したscopeから利用できる。", "Checkpoint 3: the plugin or Canvas extension is usable from the scope you selected."),
      ],
      underTheHood: bi(
        "MCPは外部tool protocol、skillは関連時にloadされるinstructions/resources、pluginはagents/skills/hooks/MCPなどのbundle、Canvas extensionはApp内のshared UI surfaceです。file-backed instructions discoveryとrepository skill discoveryは別々で、いずれもsource trustとpermission boundaryを確認してからloadします。",
        "MCP is an external tool protocol; a skill is instructions/resources loaded when relevant; a plugin bundles agents, skills, hooks, MCP, and related configuration; a Canvas extension is a shared UI surface inside the app. File-backed instruction discovery and repository-skill discovery are separate, and each must respect source trust and permission boundaries.",
      ),
      successRubric: [
        bi("credentialをchatへ貼らずにMCP接続を確認した。", "You connected MCP without pasting credentials into chat."),
        bi("instructionsと`.github/skills/`を異なるdiscovery surfaceで検証した。", "You verified instructions and `.github/skills/` on different discovery surfaces."),
        bi("trusted pluginまたはCanvas extensionを意図したscopeで動かした。", "You ran a trusted plugin or Canvas extension in the intended scope."),
      ],
    });
  }
  return lab;
}

// ---------------------------------------------------------------------------
// New v1.1.4 labs 22-25, in the same schema as the archived guides so the
// renderer can treat all 25 labs uniformly.
// ---------------------------------------------------------------------------

export const newLabs = [
  {
    id: "22",
    title: bi(
      "スタックPR、Copilotレビュー、マージキュー、Agent Merge",
      "Stacked PRs, Copilot review, merge queue, and Agent Merge",
    ),
    summary: bi(
      "関連するプルリクエストをスタックとして移動し、Copilot code reviewを要求・再要求し、GitHubのmerge queue、merge-as-stack（スタックまとめてマージ）、Agent Mergeという3つの別々の仕組みを区別しながら観察します。",
      "Navigate related pull requests as a stack, request and re-request a Copilot code review, and observe three distinct mechanisms — GitHub's merge queue, merge-as-stack, and Agent Merge — kept explicitly separate.",
    ),
    keywords: ["stack", "Copilot code review", "merge queue", "Agent Merge", "merge-as-stack", "merge drawer", "required checks", "stack menu", "pr-stack"],
    difficulty: { key: "advanced", label: bi("上級", "Advanced") },
    status: {
      key: "current",
      label: bi("提供中", "Available"),
      detail: bi(
        "v1.1.4 時点。stack status とマージキュー表示は v1.1.3 で追加され、スタックのまとめてマージ（merge-as-stack）も v1.1.3 で追加されました。stack menu とマージドロワーの stack summary は v1.1.4 で追加されました。Agent Merge の可用性はリポジトリの権限と branch protection 設定に依存し、公式ソースはAgent Mergeがスタック全体に適用されるとは述べていません。",
        "Current in v1.1.4. Stack status and the merge-queue display were added in v1.1.3, and merging a stack together (merge-as-stack) was also added in v1.1.3. The stack menu and merge-drawer stack summary were added in v1.1.4. Agent Merge's availability depends on repository permissions and branch-protection settings, and no official source states that Agent Merge applies to an entire stack.",
      ),
    },
    version: bi(
      "v1.1.4 で確認（stack menu と stack summary は v1.1.4 で追加、stack status と merge-as-stack は v1.1.3 で追加）",
      "Verified for v1.1.4 (the stack menu and stack summary were added in v1.1.4; stack status and merge-as-stack were added in v1.1.3)",
    ),
    scenario: bi(
      "使い捨てのサンプルリポジトリで、2つ目のブランチが1つ目のブランチを土台にする小さなスタックを作り、Copilotレビューを受けながら、merge queue、merge-as-stack、Agent Mergeという3つの仕組みをそれぞれ別のものとして観察します。",
      "In a disposable sample repository, build a small stack where the second branch is based on the first, get Copilot review, and observe the merge queue, merge-as-stack, and Agent Merge as three separate mechanisms.",
    ),
    scope: bi(
      "このガイドはアプリのstack menu、マージドロワーのstack summary、GitHubのmerge queueの位置表示・削除、GitHubのmerge-as-stack操作、Agent Mergeの一時停止表示を扱い、3つを混同しません。git上でスタックを作る操作自体やGitHub.com上のbranch protectionルールの設定は前提として扱い、ここでは変更しません。レビューコメントの作成そのものはguide 13の範囲です。注記: 公式ドキュメントは `pr-stack` を組み込みスキルとして記載していますが、監査時点の現行スラッシュコマンド一覧には `/pr-stack` が見当たりませんでした。特定のスラッシュコマンドが常に使えるとは想定せず、アプリのUI（stack menuなど）を優先してください。",
      "This guide covers the app's stack menu, the merge drawer's stack summary, GitHub's merge-queue position display and removal, GitHub's merge-as-stack action, and Agent Merge's pause status — and keeps the three distinct. Creating the underlying git stack and configuring branch-protection rules on GitHub.com are treated as prerequisites and are not changed here. Creating review comments themselves is covered in guide 13. Source note: official docs list `pr-stack` as a built-in skill, but `/pr-stack` did not appear in the audited current slash-command reference. Do not assume any specific slash command is always available — prefer the app's own UI (such as the stack menu) instead.",
    ),
    safety: bi(
      "本番リポジトリではなく使い捨てのフォークまたはサンドボックスリポジトリで試してください。Agent Mergeを保護されたデフォルトブランチで有効にする前に、チームに周知してください。マージは実際のリポジトリ履歴を変更します。queueからの削除は書き込み権限を持つユーザーのみ確認されています。",
      "Practice in a disposable fork or sandbox repository, not a production one. Tell your team before enabling Agent Merge on a protected default branch. Merging changes real repository history. Queue removal is confirmed only for users with write access.",
    ),
    prerequisites: [
      bi(
        "作成・プッシュ権限のある使い捨てリポジトリ（フォークで可）。",
        "A disposable repository (a fork is fine) where you can create branches and push.",
      ),
      bi(
        "guide 04（worktree）と guide 13（プルリクエストレビュー）を完了していること。",
        "Guides 04 (worktrees) and 13 (pull request review) completed.",
      ),
      bi(
        "リポジトリでmerge queueを利用する場合はbranch protectionが設定されていること。設定されていない場合はqueue position表示は省略できます。",
        "Branch protection configured if you want to see the merge queue; if it is not configured, you can skip the queue-position display.",
      ),
    ],
    launchers: [
      {
        label: bi("マージキューの公式ドキュメントを開く", "Open the official merge queue documentation"),
        description: bi(
          "GitHubの公式ドキュメントでmerge queueの一般的な仕組み（トポロジー）を確認します。アプリのstack menuやマージドロワーのUI自体はこのドキュメントには含まれません。",
          "Review the general topology of the merge queue in GitHub's official documentation. The app's own stack menu and merge-drawer UI are not covered by this documentation.",
        ),
        url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue",
      },
    ],
    commands: [
      {
        id: "stack-branches",
        label: bi("2段のスタックブランチを作成する", "Create a two-level stacked branch pair"),
        language: "shell",
        code: "git checkout -b stack/step-1 && git commit --allow-empty -m \"stack: step 1\" && git push -u origin stack/step-1\ngit checkout -b stack/step-2 && git commit --allow-empty -m \"stack: step 2\" && git push -u origin stack/step-2",
      },
      {
        id: "review-prompt",
        label: bi("Copilotレビュー操作を安全に確認するプロンプト", "Prompt to inspect Copilot review controls safely"),
        language: "text",
        code: "Open the two pull requests without merging anything. In each pull request, identify whether the current app exposes an action to request or re-request a Copilot code review. Do not activate either action yet; report if the control is unavailable because of account, policy, repository, or build differences.",
      },
    ],
    steps: [
      {
        title: bi("スタックとなる2つのPRを作成する", "Create the two pull requests that form the stack"),
        body: [
          bi(
            "コマンドで2つのブランチを作成し、1つ目を既定のブランチへ、2つ目を1つ目のブランチへ向けたプルリクエストとして開きます。",
            "Create the two branches with the command, then open one pull request targeting the default branch and a second targeting the first branch.",
          ),
        ],
        commandIds: ["stack-branches"],
        expected: bi(
          "2つのプルリクエストが作成され、2つ目のPRの基準ブランチが1つ目のPRのブランチになっている。",
          "Two pull requests exist, and the second PR's base branch is the first PR's branch.",
        ),
      },
      {
        title: bi("Copilot code reviewの操作を確認して条件付きで要求する", "Inspect and conditionally request a Copilot code review"),
        body: [
          bi(
            "観察プロンプトで現在のビルドに要求操作があるか確認します。操作が表示され、アカウント・ポリシー・リポジトリ条件が許す場合だけ、使い捨てPRの1つでCopilot code reviewを要求します。正確な配置やレビュー結果の形式は断定しません。",
            "Use the observation prompt to determine whether the current build exposes a request action. Only if the control is present and account, policy, and repository conditions allow it, request a Copilot code review on one disposable PR. Do not assert its exact placement or the format of any review result.",
          ),
        ],
        commandIds: ["review-prompt"],
        expected: bi(
          "要求操作の有無と、利用できない場合の条件を記録できる。利用できる場合は要求が受け付けられたことだけを確認し、コメント形式は前提にしない。",
          "You recorded whether the request action is available and any condition that blocks it. If available, you confirmed only that the request was accepted, without assuming a comment format.",
        ),
      },
      {
        title: bi("利用できる場合だけ再要求を観察する", "Observe re-request only when it is available"),
        body: [
          bi(
            "最初のレビューが完了し、現在の画面に再要求操作が表示される場合だけ、軽微な修正をプッシュして再要求します。再要求操作がない場合はスキップし、アカウント・ポリシー・ビルド差として記録します。コメントの更新方法は公式ソースで確認できていないため断定しません。",
            "Only if the first review completes and the current screen exposes a re-request action, push a small fix and re-request. If no such action appears, skip this phase and record the account, policy, or build difference. Official sources do not confirm how comments are updated, so do not assume a behavior.",
          ),
        ],
        expected: bi(
          "再要求が利用可能なら受け付けられたことを観察し、利用不可なら理由を記録して安全にスキップできる。",
          "If re-request is available, you observed that it was accepted; otherwise you recorded the limitation and skipped safely.",
        ),
      },
      {
        title: bi("stack menuでPR間を移動する", "Navigate between PRs with the stack menu"),
        body: [
          bi(
            "2つ目のPRを開き、変更履歴で確認されたステータス横のstack menuが現在のビルドに表示される場合は、そこから1つ目のPRへ移動します。両方のPRでstack statusが表示されるか観察します。",
            "Open the second PR and, if the changelog-confirmed stack menu appears next to status in your current build, use it to move to the first PR. Observe whether stack status is shown on both PRs.",
          ),
        ],
        expected: bi(
          "stack menuとstack statusの実際の表示を観察できる。表示されない場合は条件を記録し、手順を無理に続けない。",
          "You observed the actual stack menu and stack-status presentation. If absent, you recorded the condition instead of forcing the workflow.",
        ),
      },
      {
        title: bi("merge-as-stack: マージドロワーのstack summaryを確認する", "Merge-as-stack: inspect the merge drawer's stack summary"),
        body: [
          bi(
            "1つ目のPRのマージドロワーを開き、含まれるプルリクエストの一覧（stack summary）と必須チェックの状態を確認します。これはGitHubの「スタックをまとめてマージする」操作（merge-as-stack）専用のUIで、Agent Mergeとは別の仕組みです。",
            "Open the merge drawer on the first PR and review the stack summary listing included pull requests plus required-check status. This is UI specific to GitHub's \"merge the stack together\" action (merge-as-stack) and is a separate mechanism from Agent Merge.",
          ),
        ],
        expected: bi(
          "マージドロワーに2つのPRを含むstack summaryが表示され、必須チェックの状態が確認できる。",
          "The merge drawer shows a stack summary including both PRs, and required-check status is visible.",
        ),
      },
      {
        title: bi("GitHubのmerge queue: 位置を確認し、必要なら削除する", "GitHub's merge queue: check position and remove if needed"),
        body: [
          bi(
            "branch protectionでmerge queueが有効な場合、PRビューでqueue positionを確認します。書き込み権限がある場合は、必要に応じてqueueから削除できます（これは公式に確認されている範囲です）。",
            "If the merge queue is enabled via branch protection, check the queue position in the PR view. If you have write access, you can remove it from the queue if needed — this is the officially confirmed scope.",
          ),
        ],
        expected: bi(
          "queue positionが表示され（該当する場合）、書き込み権限があれば削除操作が行える。",
          "The queue position is shown (if applicable), and removal is available if you have write access.",
        ),
      },
      {
        title: bi("Agent Merge: 1つのPR単位で有効にする（スタック全体には適用しない）", "Agent Merge: enable it per pull request (not applied to the whole stack)"),
        body: [
          bi(
            "1つ目のPRでAgent Mergeを有効にします。公式ソースはAgent Mergeがスタック全体に適用されるとは述べていないため、このガイドではそう主張しません。必須チェックが保留中の場合は、静止するのではなく一時停止の理由を示すステータスメッセージが表示されることを確認します。",
            "Enable Agent Merge on the first PR. No official source states that Agent Merge applies to an entire stack, so this guide does not claim that either. If a required check is pending, confirm a status message explains the pause instead of Agent Merge parking silently.",
          ),
        ],
        expected: bi(
          "保留中のコミットステータスチェックがある場合、Agent Mergeのステータスに待機理由が明示される。Agent Mergeをstack全体の操作とは扱わない。",
          "When a commit status check is pending, Agent Merge explicitly shows the wait reason. You do not treat Agent Merge as a stack-wide operation.",
        ),
      },
      {
        title: bi("後片付けを行う", "Clean up"),
        body: [
          bi(
            "着地を確認したら、ローカルとリモートのスタックブランチを削除し、テスト用のAgent Merge設定を元に戻します。",
            "After confirming the landing, delete the local and remote stack branches and revert any test-only Agent Merge configuration.",
          ),
        ],
        expected: bi(
          "スタックブランチが両方削除され、リポジトリに開いたままのテストPRが残っていない。",
          "Both stack branches are deleted and no open test PR remains in the repository.",
        ),
      },
    ],
    expected: [
      bi("stack menuで関連PR間を移動できた。", "You navigated between related PRs using the stack menu."),
      bi("merge-as-stack（マージドロワーのstack summary）、GitHubのmerge queue、Agent Mergeを別々の仕組みとして観察できた。", "You observed merge-as-stack (the merge drawer's stack summary), GitHub's merge queue, and Agent Merge as three separate mechanisms."),
      bi("Agent Mergeの一時停止理由を実際に読み、スタック全体には適用されると主張していないことを確認した。", "You actually read an Agent Merge pause reason and confirmed this lab does not claim it applies to the whole stack."),
    ],
    troubleshooting: [
      {
        problem: bi("stack menuやstack statusが表示されない", "The stack menu or stack status does not appear"),
        fix: bi(
          "2つ目のPRの基準ブランチが本当に1つ目のPRのブランチを指しているか確認します。stack機能はv1.1.3以降が必要なので、アプリを更新してPRビューを再読み込みしてください。",
          "Confirm the second PR's base branch truly points at the first PR's branch. Stack features require v1.1.3 or later, so update the app and reload the PR view.",
        ),
      },
      {
        problem: bi("マージドロワーが「確認中」のまま止まる", "The merge drawer stays stuck in a checking state"),
        fix: bi(
          "これはv1.1.3で修正された既知の不具合に似ています。アプリを最新版に更新し、ドロワーを閉じて再度開いてください。",
          "This resembles a known issue fixed in v1.1.3. Update the app to the latest version and close/reopen the drawer.",
        ),
      },
      {
        problem: bi("Agent Mergeが理由も示さず何もしていないように見える", "Agent Merge seems to do nothing with no explanation"),
        fix: bi(
          "v1.1.4以降はコミットステータスチェック待ちの場合にステータスメッセージが表示されます。表示が古い場合はアプリを更新し、必須チェックとレビュー承認数を確認してください。2つ目のPRで別途有効にしていないためAgent Mergeが動いていないだけの可能性もあります。",
          "From v1.1.4, a status message explains a wait on a pending commit status check. If the display looks stale, update the app and check required checks and required review approvals. It is also possible Agent Merge simply is not enabled on the second PR separately.",
        ),
      },
      {
        problem: bi(
          "「Create PR + agent merge」でPRは作成されたがAgent Mergeが有効になっていない",
          "\u201cCreate PR + agent merge\u201d created the PR but did not actually enable Agent Merge",
        ),
        fix: bi(
          "PR作成中に画面を離れると発生していた既知の不具合で、v1.1.3で修正されています。作成後にAgent Mergeのトグル状態を必ず確認し、無効なら明示的に再度有効にしてください。",
          "This was a known issue when navigating away during PR creation, fixed in v1.1.3. Always confirm the Agent Merge toggle state after creation and re-enable it explicitly if it is off.",
        ),
      },
      {
        problem: bi("`/pr-stack` というスラッシュコマンドが使えるか分からない", "You're unsure whether a `/pr-stack` slash command is available"),
        fix: bi(
          "`pr-stack` は組み込みスキルとして公式にドキュメント化されていますが、監査時点の現行スラッシュコマンド一覧には `/pr-stack` が見当たりませんでした。特定のスラッシュコマンドが常に利用可能だとは想定せず、アプリのstack menuなどのUIを直接使ってください。",
          "`pr-stack` is officially documented as a built-in skill, but `/pr-stack` did not appear in the audited current slash-command reference. Do not assume any specific slash command is always available — use the app's own UI, such as the stack menu, directly instead.",
        ),
      },
    ],
    cleanup: [
      bi("テストで作成したプルリクエストをマージまたはクローズする。", "Merge or close the pull requests created for this test."),
      bi("ローカルとリモートのスタックブランチ（stack/step-1, stack/step-2）を削除する。", "Delete the local and remote stack branches (stack/step-1, stack/step-2)."),
      bi("観察のために使い捨てPRで有効にしたAgent Mergeを、PRが未マージなら無効にする。", "If the disposable PR remains unmerged, turn off Agent Merge that you enabled only for observation."),
    ],
    platforms: {
      windows: bi(
        "stackとmerge queueのGitHub側の要件は共通ですが、アプリUIの完全なOS間同一性は断定しません。現在のWindowsビルドで表示を確認してください。",
        "GitHub-side stack and merge-queue requirements are shared, but this guide does not claim pixel-identical app UI across operating systems. Verify the current Windows build.",
      ),
      macos: bi(
        "現在のmacOSビルドでstack、queue、Agent Mergeの表示を確認してください。未文書化のショートカットは前提にしません。",
        "Verify stack, queue, and Agent Merge presentation in the current macOS build. Do not assume undocumented shortcuts.",
      ),
      linux: bi(
        "現在のLinux AppImageビルドで表示を確認し、OS固有の差があれば記録してください。",
        "Verify the current Linux AppImage build and record any platform-specific difference.",
      ),
      wsl: bi(
        "WSLリモートセッションでstack操作がローカルセッションと同一に動くとは断定しません。現在の環境で確認してください。",
        "This guide does not claim stack operations behave identically in WSL remote sessions. Verify your current environment.",
      ),
    },
    related: ["13", "14", "24", "25"],
    sources: [
      { title: "GitHub Copilot app v1.1.4 changelog", url: "https://github.com/github/app/blob/main/changelog.md#v114" },
      { title: "GitHub Copilot app v1.1.3 changelog", url: "https://github.com/github/app/blob/main/changelog.md#v113" },
      { title: "Managing a merge queue", url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue" },
      { title: "Reviewing proposed changes in a pull request", url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request" },
      { title: "GitHub Copilot app slash commands", url: "https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands" },
    ],
  },
  {
    id: "23",
    title: bi(
      "別リポジトリへのIssue作成とマイルストーン、ディープリンク",
      "Cross-repository issues, milestones, and deep links",
    ),
    summary: bi(
      "現在のセッションとは異なるリポジトリにIssueを作成し、Issue/PRのマイルストーンを表示・編集し、安全なホスト型ランチャー経由のディープリンクで目的の画面を開きます。",
      "Create an issue in a repository other than the current session's, view or edit milestones on issues and PRs, and open exact app screens through safe hosted-launcher deep links.",
    ),
    keywords: ["issue", "cross-repository", "milestone", "deep link", "ghapp://", "target confirmation prompt"],
    difficulty: { key: "intermediate", label: bi("中級", "Intermediate") },
    status: {
      key: "current",
      label: bi("提供中", "Available"),
      detail: bi(
        "v1.1.4 時点。別リポジトリへのIssue作成と、Issue/PRのマイルストーン表示・編集はv1.1.4で追加されました。これらはいずれも変更履歴（changelog）でのみ確認できる release-note-grounded な機能で、正確な画面遷移や確認手段は公式ソースで網羅的に説明されていません。",
        "Current in v1.1.4. Creating an issue in a different repository and viewing/editing issue and PR milestones were added in v1.1.4. Both are release-note-grounded, confirmed only by the changelog, and no official source comprehensively documents the exact screen flow or confirmation mechanism.",
      ),
    },
    version: bi("v1.1.4 で確認", "Verified for v1.1.4"),
    scenario: bi(
      "作業中のセッションのリポジトリとは別の、共有ドキュメントリポジトリで見つけた問題をIssueとして報告し、マイルストーンで追跡し、同僚にディープリンクで共有します。",
      "While working in one session's repository, you notice an issue that belongs in a separate shared documentation repository — file it there, track it with a milestone, and share it with a teammate through a deep link.",
    ),
    scope: bi(
      "このガイドはアプリ内での別リポジトリへのIssue作成、Issue/PRのマイルストーン表示・編集、ホスト型ランチャー経由のディープリンクを扱います。マイルストーン自体の新規作成はGitHub.com上の操作として前提とし、ここでは行いません。アプリ固有の確認UI（例えば専用の確認ダイアログ）が存在するかどうかは公式ソースで確認できていないため断定せず、プロンプトの指示とGitHub上での外部検証を安全策として使います。",
      "This guide covers creating an issue in a different repository from within the app, viewing/editing issue and PR milestones, and opening deep links through the hosted launcher. Creating a milestone itself on GitHub.com is treated as a prerequisite and is not performed here. Whether the app has a dedicated confirmation UI (such as a specific confirmation dialog) is not confirmed by an official source, so this guide does not assert one exists — it instead relies on prompt instructions plus external verification on GitHub as the safeguard.",
    ),
    safety: bi(
      "見慣れない本番リポジトリにいきなりIssueを作成すると無関係な購読者に通知が届きます。まずは自分が管理する2つのサンドボックスリポジトリで練習してください。対象リポジトリを明示し、作成前に一度立ち止まって対象を復唱するようエージェントへの指示（プロンプト）で求め、公式URLまたは`gh`コマンドで作成結果を外部から検証してください。ディープリンクはホスト型ランチャー経由でのみ開き、出所不明の生の`ghapp://` URLは開かないでください。",
      "Filing an issue in an unfamiliar production repository notifies unrelated watchers. Practice first with two sandbox repositories you control. Name the target repository explicitly, instruct the agent (via the prompt) to pause and echo the target back before creating anything, and independently verify the result through the official URL or the `gh` command. Open deep links only through the hosted launcher, never a raw `ghapp://` URL from an unknown source.",
    ),
    prerequisites: [
      bi(
        "書き込みまたはtriage権限のある2つのリポジトリ（自分のサンドボックスで可）。少なくとも1つにマイルストーンが作成済みであること。",
        "Write or triage access to two repositories (sandboxes you control are fine), with at least one having a milestone already created.",
      ),
      bi("guide 12（Issue、ディープリンク）を完了していること。", "Guide 12 (issues, deep links) completed."),
      bi(
        "現在のセッションが1つ目のリポジトリに接続済みであること。",
        "A session already connected to the first repository.",
      ),
    ],
    launchers: [
      {
        label: bi("マイルストーンの公式ドキュメントを開く", "Open the official milestones documentation"),
        description: bi(
          "GitHubの公式ドキュメントでマイルストーンの概念を確認します。",
          "Review the concept of milestones in GitHub's official documentation.",
        ),
        url: "https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones",
      },
    ],
    commands: [
      {
        id: "cross-repo-prompt",
        label: bi("別リポジトリへのIssue作成を依頼し、対象を復唱・一時停止させるプロンプト", "Prompt that requests an issue in a different repository and asks the agent to echo the target and pause"),
        language: "text",
        code: "Create a GitHub issue in <owner>/<other-repo> (explicitly NOT this session's repository) titled \"Docs: clarify the v1.1.4 milestone workflow\" with a short description of what is unclear. Before creating anything, state back to me the exact target owner/repo you are about to use, and wait for my explicit go-ahead.",
      },
      {
        id: "verify-issue-cli",
        label: bi("gh CLIで作成先を確認する（任意）", "Verify the destination with the gh CLI (optional)"),
        language: "shell",
        code: "gh issue view <issue-number> --repo <owner>/<other-repo> --json title,milestone,url",
      },
    ],
    steps: [
      {
        title: bi("別リポジトリを明示し、対象の復唱と一時停止を求める", "Name a different repository explicitly and ask the agent to echo it back and pause"),
        body: [
          bi(
            "現在のセッションのリポジトリではなく、`owner/repo`を明示した別リポジトリへのIssue作成をエージェントに依頼し、作成前に対象を復唱して一時停止するよう指示します。",
            "Ask the agent to create an issue in an explicitly named `owner/repo` other than the current session's repository, instructing it to echo the target back and pause before creating anything.",
          ),
        ],
        commandIds: ["cross-repo-prompt"],
        expected: bi(
          "エージェントが作成前に対象owner/repoを復唱し、明示的な許可を待つ状態で止まる。",
          "The agent echoes back the target owner/repo before creating anything and pauses for explicit permission.",
        ),
      },
      {
        title: bi("復唱された対象を検証してから許可する", "Verify the echoed target before giving permission"),
        body: [
          bi(
            "エージェントが復唱した owner/repo が意図した別リポジトリと完全に一致することを確認してから、続行の許可を出します。一致しない場合は許可せず、プロンプトをやり直します。",
            "Confirm the owner/repo the agent echoed back exactly matches the intended other repository before granting permission to continue. If it does not match, do not grant permission — revise the prompt instead.",
          ),
        ],
        expected: bi(
          "許可後にIssueが意図したリポジトリに作成される。",
          "After permission is granted, the issue is created in the intended repository.",
        ),
      },
      {
        title: bi("gh CLIで作成先を確認する（任意）", "Optionally verify the destination with the gh CLI"),
        body: [
          bi(
            "任意の検証として、gh CLIでIssue番号を指定し、意図したリポジトリに存在することを確認します。",
            "As an optional check, use the gh CLI with the issue number to confirm it exists in the intended repository.",
          ),
        ],
        commandIds: ["verify-issue-cli"],
        expected: bi(
          "コマンドの出力が意図したリポジトリのURLとタイトルを返す。",
          "The command output returns the intended repository's URL and title.",
        ),
      },
      {
        title: bi("Issueにマイルストーンを設定する（誘導観察）", "Set a milestone on the issue (guided observation)"),
        body: [
          bi(
            "作成したIssueを開き、既存のマイルストーンを選んで設定します。マイルストーンが選択肢にない場合は、そのリポジトリにまだマイルストーンが作成されていません。正確な画面上の操作手順は公式ソースで網羅的に確認できていないため、実際の画面表示に従ってください。",
            "Open the created issue and assign an existing milestone. If none appears in the picker, that repository has no milestone created yet. The exact on-screen steps are not comprehensively documented in an official source, so follow whatever your screen actually shows.",
          ),
        ],
        expected: bi(
          "Issueに選択したマイルストーンの値が表示される。追加の表示項目は前提にしない。",
          "The issue shows the selected milestone value. You do not assume any additional fields.",
        ),
      },
      {
        title: bi("関連PRのマイルストーンも確認する（誘導観察）", "Also check the milestone on a related pull request (guided observation)"),
        body: [
          bi(
            "同じマイルストーンに関連するプルリクエストを開き、そのマイルストーン表示・編集UIを観察します。Issueと同一のUIかどうかは断定せず、実際の画面を確認してください。",
            "Open a pull request related to the same milestone and observe its milestone view/edit UI. Do not assume it is identical to the issue's UI — check what your own screen actually shows.",
          ),
        ],
        expected: bi(
          "PRのマイルストーン表示または編集操作を実際に観察できる。",
          "You actually observe the PR's milestone display or edit interaction.",
        ),
      },
      {
        title: bi("ホスト型ランチャーでディープリンクを開く", "Open a deep link through the hosted launcher"),
        body: [
          bi(
            "作成したIssueのディープリンクをホスト型ランチャー経由でコピーし、別のウィンドウまたはブラウザーで開いて意図した画面にそのまま到達することを確認します。",
            "Copy the created issue's deep link through the hosted launcher, open it in a fresh window or browser, and confirm it lands exactly on the intended screen.",
          ),
        ],
        expected: bi(
          "ディープリンクがホスト型ランチャーを経由し、意図したIssue画面を直接開く。",
          "The deep link is routed through the hosted launcher and opens the intended issue screen directly.",
        ),
      },
      {
        title: bi("マイルストーンの状態変化を確認する", "Confirm the milestone state transition"),
        body: [
          bi(
            "Issueのマイルストーンを別の値に変更し、GitHub.com側でも同じ変更が反映されていることを確認します。",
            "Change the issue's milestone to a different value and confirm the same change is reflected on GitHub.com.",
          ),
        ],
        expected: bi(
          "アプリとGitHub.comの両方で新しいマイルストーンが一致して表示される。",
          "Both the app and GitHub.com show the new milestone consistently.",
        ),
      },
      {
        title: bi("テスト用のIssueを片付ける", "Clean up the test issue"),
        body: [
          bi(
            "検証が終わったら、テスト用のマイルストーン割り当てを外すか、Issue自体をクローズします。",
            "Once verification is done, remove the test milestone assignment or close the issue itself.",
          ),
        ],
        expected: bi(
          "テスト用のIssueがクローズされているか、明確に「テスト」と分かる状態になっている。",
          "The test issue is closed or clearly marked as a test.",
        ),
      },
    ],
    expected: [
      bi("意図した別リポジトリにIssueが作成された。", "The issue was created in the intended, different repository."),
      bi("Issue/PRのマイルストーンを表示・編集できた。", "You viewed and edited the milestone on both an issue and a PR."),
      bi("ディープリンクをホスト型ランチャー経由で安全に開けた。", "You safely opened a deep link through the hosted launcher."),
    ],
    troubleshooting: [
      {
        problem: bi("誤ったリポジトリにIssueを作成してしまった", "The issue was created in the wrong repository"),
        fix: bi(
          "GitHub.comでIssueのTransfer issue操作が利用でき、必要な権限と移動先条件を満たす場合は公式の転送手順に従います。利用できない場合は正しいリポジトリに作成し直し、誤ったIssueをクローズして置き換え先へリンクします。",
          "If GitHub.com's Transfer issue action is available and you meet its permission and destination requirements, follow the official transfer flow. Otherwise create the issue in the correct repository, close the mistaken one, and link to its replacement.",
        ),
      },
      {
        problem: bi("マイルストーンの選択肢が表示されない", "No milestone option appears"),
        fix: bi(
          "対象リポジトリにまだマイルストーンが作成されていません。GitHub.com上でマイルストーンを先に作成してからアプリに戻ってください。",
          "The target repository has no milestone created yet. Create one on GitHub.com first, then return to the app.",
        ),
      },
      {
        problem: bi("ディープリンクが別のプロジェクトやセッションを開いてしまう", "The deep link opens a different project or session"),
        fix: bi(
          "生成されたホスト型ランチャーのURLを使っているか確認し、手入力した`ghapp://`は使わないでください。正しいプロジェクトが有効になっているかも確認します。",
          "Confirm you are using the generated hosted-launcher URL, not a hand-typed `ghapp://`. Also confirm the correct project is active.",
        ),
      },
      {
        problem: bi("作成したIssueがMy Workにすぐ表示されない", "The created issue does not immediately appear in My Work"),
        fix: bi(
          "フィルタを確認し、`has:milestone`などの修飾子（guide 11）が意図せず絞り込んでいないか確認したうえで再読み込みしてください。",
          "Check your filters — confirm a qualifier such as `has:milestone` (guide 11) is not unintentionally narrowing the list — then reload.",
        ),
      },
    ],
    cleanup: [
      bi("テスト用に作成したIssueをクローズするか、明確にテストと分かるようにする。", "Close the test issue or clearly mark it as a test."),
      bi("テストのためだけに追加したマイルストーン割り当てを外す。", "Remove any milestone assignment added only for this test."),
      bi("共有用にコピーしたテストIssueのURLやランチャーを作業メモから削除する。", "Remove copied test-issue URLs or launchers from your working notes."),
    ],
    platforms: {
      windows: bi(
        "gh CLIによる任意の検証はWindows Terminal/PowerShellから実行できます。",
        "The optional gh CLI verification can be run from Windows Terminal/PowerShell.",
      ),
      macos: bi("同上。標準のターミナルから同じコマンドが使えます。", "Same as above; the standard terminal supports the same command."),
      linux: bi("同上。distroのパッケージマネージャーでgh CLIを導入してください。", "Same as above; install the gh CLI via your distribution's package manager."),
      wsl: bi(
        "別リポジトリへのIssue作成とマイルストーン編集がWSLリモートセッションでも同一に動作するかは、このガイドでは確認できていません。guide 08のWSL一般情報を参照しつつ、実際の環境で確認してください。",
        "Whether cross-repository issue creation and milestone editing behave identically in a WSL remote session is not confirmed by this guide. Refer to guide 08's general WSL notes and verify directly in your own environment.",
      ),
    },
    related: ["11", "12", "08", "25"],
    sources: [
      { title: "GitHub Copilot app v1.1.4 changelog", url: "https://github.com/github/app/blob/main/changelog.md#v114" },
      { title: "About milestones", url: "https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones" },
      { title: "Creating an issue", url: "https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue" },
      { title: "Transferring an issue to another repository", url: "https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository" },
    ],
  },
  {
    id: "24",
    title: bi(
      "Worktreeの保存場所、コミット帰属、診断の安全な観察",
      "Worktree location, commit attribution, and diagnostics: a safe guided observation",
    ),
    summary: bi(
      "新規セッションのworktree保存場所をSettingsのUIが提示するプレースホルダーで構成し、Commit attribution設定の効果を使い捨てのコミットで観察し、起動失敗時の診断対応を安全にリハーサルします。障害を意図的に発生させることはありません。",
      "Configure where new session worktrees are created using whatever placeholders the Settings UI itself exposes, observe the Commit attribution setting on one disposable commit, and safely rehearse the documented response to a startup failure without manufacturing one.",
    ),
    keywords: ["worktree location", "commit attribution", "Co-authored-by", "diagnostics dialog", "pinned session", "Manage sessions", "guided observation"],
    difficulty: { key: "advanced", label: bi("上級", "Advanced") },
    status: {
      key: "current",
      label: bi("提供中", "Available"),
      detail: bi(
        "v1.1.4 時点。Worktree locationとCommit attributionの設定はv1.1.4で追加されました。startup diagnosticsダイアログはv1.1.3で追加され、ピン留めセッションの保護はv1.1.4で修正されました。これらはいずれも変更履歴（changelog）でのみ確認できる release-note-grounded な機能で、公式の長文ドキュメントによる網羅的な説明はありません。",
        "Current in v1.1.4. The Worktree location and Commit attribution settings were added in v1.1.4. The startup diagnostics dialog was added in v1.1.3, and pinned-session protection was fixed in v1.1.4. All of these are release-note-grounded, confirmed only by the changelog, with no comprehensive long-form documentation.",
      ),
    },
    version: bi("v1.1.4 で確認", "Verified for v1.1.4"),
    scenario: bi(
      "複数プロジェクトを1台のマシンで運用するメンテナーとして、使い捨てのテストプロジェクトでworktreeの保存場所とコミット帰属の設定を安全に観察し、自然な起動失敗時に診断情報を扱う手順を準備します。障害を意図的に発生させることはしません。",
      "As a maintainer running multiple projects on one machine, safely observe Worktree location and Commit attribution in a disposable project and prepare a response checklist for diagnostics if startup fails naturally. You never induce a failure.",
    ),
    scope: bi(
      "このガイドはSettings > SessionsのWorktree locationとCommit attribution、起動失敗時にdiagnosticsダイアログで詳細をコピー／ログを開く対応、Manage sessionsのピン留め保護を、安全な観察演習として扱います。診断ダイアログの常設入口は公式ソースで確認できないため断定しません。正確なパステンプレート構文やCommit attributionの設定スコープも断定しません。git worktreeコマンド自体の一般的な使い方やCopilot CLIの`/sandbox`は隣接する話題です。",
      "This guide safely observes Worktree location and Commit attribution in Settings > Sessions, rehearses the documented copy-details/open-log response if a startup diagnostics dialog appears, and checks pinned-session protection in Manage sessions. Official sources do not confirm a persistent diagnostics entry point, so none is asserted. The exact path-template syntax and Commit attribution scope are also left unstated. General git worktree usage and Copilot CLI's `/sandbox` are adjacent topics.",
    ),
    safety: bi(
      "この演習は使い捨てのテストプロジェクトでのみ行い、本番リポジトリでは行わないでください。Worktree locationを変更する前に現在の値を控え、観察後は元に戻すか、意図した値として明示的に記録してください。Commit attributionの観察には使い捨てのブランチと1つの破棄可能なコミットを使い、完了後にそのブランチを削除してください。設定のスコープや既定値、有効になるタイミングについて、このガイドは断定しません。診断ダイアログを試すために設定プロファイルを壊したり、リポジトリを壊したり、worktreeのセットアップを意図的に失敗させたりしないでください。診断は自然に起きた障害についてのみ、コピーまたはログを開く操作を行います。",
      "Do this exercise only in a disposable test project, never against a production repository. Note the current Worktree location value before changing it, and either restore it afterward or record the new value as an intentional choice. Observe Commit attribution using a disposable branch and one throwaway commit, then delete that branch when you are done. This guide does not assert the setting's scope, default, or exact timing boundary. Never corrupt a settings profile, break a repository, or deliberately induce a workspace-setup failure just to see the diagnostics dialog — only use its copy/open-log actions if a failure occurs naturally.",
    ),
    prerequisites: [
      bi("アプリのSettingsを変更できる権限（管理者ポリシーで制限されていないこと）。", "Permission to change app Settings (not restricted by an administrator policy)."),
      bi("自由に使い捨てできるテストプロジェクトと、比較用の既存セッション/worktreeが1つあること。", "A disposable test project you can freely experiment in, plus one existing session/worktree to compare against."),
      bi("ターミナルで `git worktree list` などの読み取り専用コマンドを実行できること。", "Comfort running read-only commands such as `git worktree list` from a terminal."),
      bi("guide 04（worktreeと並列セッション）を完了していること。", "Guide 04 (worktrees and parallel sessions) completed."),
    ],
    commands: [
      {
        id: "list-worktrees",
        label: bi("現在登録されているworktreeを一覧表示する（読み取り専用）", "List currently registered worktrees (read-only)"),
        language: "shell",
        code: "git worktree list",
      },
      {
        id: "verify-commit-trailer",
        label: bi("使い捨てコミットのトレーラーを観察する", "Observe a disposable commit's trailer"),
        language: "shell",
        code: "git log -1 --format=%B",
      },
    ],
    steps: [
      {
        title: bi("現在のWorktree locationを記録する", "Record the current Worktree location"),
        body: [
          bi(
            "Settings > Sessionsを開き、Worktree locationの現在値をメモしてから先に進みます。変更前の状態を必ず控えてください。",
            "Open Settings > Sessions and note the current Worktree location value before changing anything. Always record the prior state.",
          ),
        ],
        expected: bi("現在の保存場所の値が記録できる。", "You have recorded the current location value."),
      },
      {
        title: bi("使い捨てプロジェクトでSettings UIが示すプレースホルダーを観察する", "Observe the placeholders the Settings UI itself offers, in a disposable project"),
        body: [
          bi(
            "リポジトリ、ブランチ、名前に対応するプレースホルダーが用意されていることは公式の変更履歴で確認できますが、正確な綴りはこのガイドでは断定しません。Settings画面に表示されているヒントやプレースホルダーの実際の表記に従って、使い捨てのテストプロジェクト用に1つだけ値を設定します。",
            "The changelog confirms that placeholders for repository, branch, and name are supported, but this guide does not assert their exact spelling. Follow whatever hint text or placeholder the Settings screen itself currently shows while using your disposable test project. This exercise does not infer the setting's scope.",
          ),
        ],
        expected: bi("Settings画面に表示されている構文で値を保存できる。", "You saved a value using the syntax the Settings screen itself displays."),
      },
      {
        title: bi("新規セッションでworktreeの作成場所を観察する", "Observe where the new session's worktree is created"),
        body: [
          bi(
            "使い捨てプロジェクトで新しいセッションを開始し、`git worktree list` で新しいworktreeがどこに作成されたかを確認します。以前のデフォルトの場所と比較します。",
            "Start a new session in the disposable project and use `git worktree list` to see where the new worktree was created. Compare it with the previous default location.",
          ),
        ],
        commandIds: ["list-worktrees"],
        expected: bi("新しいworktreeの実際のパスが一覧で確認できる。", "You can see the new worktree's actual path in the listing."),
      },
      {
        title: bi("Worktree locationを元に戻す", "Restore the Worktree location"),
        body: [
          bi(
            "観察が終わったら、最初にメモした値に戻すか、今後も使いたい値として明示的に決めます。",
            "Once you are done observing, restore the value you noted at the start, or explicitly decide to keep the new one going forward.",
          ),
        ],
        expected: bi("Worktree locationが意図した値になっている。", "Worktree location is set to the value you intend."),
      },
      {
        title: bi("Commit attributionの現在の状態を確認する", "Check the current Commit attribution state"),
        body: [
          bi(
            "同じSettings > Sessionsで、Commit attributionの現在のトグル状態を確認します。この設定がグローバル、セッション単位、リポジトリ単位のいずれであるかはこのガイドでは断定しません。",
            "In the same Settings > Sessions, check the current Commit attribution toggle state. This guide does not assert whether the setting is global, per-session, or per-repository.",
          ),
        ],
        expected: bi("現在のトグル状態が確認できる。", "You can see the current toggle state."),
      },
      {
        title: bi("使い捨てコミットでトレーラーを観察する", "Observe the trailer on a disposable commit"),
        body: [
          bi(
            "使い捨てのテストブランチでエージェントに1つだけコミットを作らせ、`git log` でCo-authored-byトレーラーの有無を観察します。断定はせず、現在のトグル表示と比較するだけにとどめます。",
            "On a disposable test branch, have the agent make exactly one commit, then use `git log` to observe whether a Co-authored-by trailer is present. Only compare it against the current toggle display — do not assert scope or defaults from this single observation.",
          ),
        ],
        commandIds: ["verify-commit-trailer"],
        expected: bi("1件のコミットのトレーラーの有無を観察できる。", "You observed the presence or absence of the trailer on one commit."),
      },
      {
        title: bi("起動失敗時の診断対応をリハーサルする（障害は発生させない）", "Rehearse the startup-diagnostics response without inducing a failure"),
        body: [
          bi(
            "v1.1.3の変更履歴を読み、起動失敗時にdiagnosticsダイアログが表示されたら「詳細をコピー」または「ログを開く」を使う、共有前に機密情報を伏せる、という対応チェックリストを作ります。常設の入口やログの場所・形式は断定しません。設定プロファイル、リポジトリ、worktreeを壊して再現してはいけません。",
            "Read the v1.1.3 changelog and write a response checklist: if the diagnostics dialog appears after a startup failure, use Copy details or Open log, then redact sensitive information before sharing. Do not assert a permanent entry point or log location/format, and never damage settings, a repository, or a worktree to reproduce the failure.",
          ),
        ],
        expected: bi("障害を発生させずに、公式に確認された2つの診断操作と共有前の確認事項を説明できる。", "Without inducing a failure, you can explain the two confirmed diagnostics actions and the checks required before sharing."),
      },
      {
        title: bi("ピン留めセッションの保護を観察する", "Observe pinned-session protection"),
        body: [
          bi(
            "Manage sessionsを開き、使い捨てのテストセッションを1つピン留めしたうえで「select all」を試し、ピン留めされたセッションのチェックボックスが選択対象から外れることを観察します。",
            "Open Manage sessions, pin one disposable test session, try \"select all,\" and observe whether the pinned session's checkbox is excluded from the selection.",
          ),
        ],
        expected: bi("ピン留めされたセッションのチェックボックスが無効で、「select all」の対象から除外される。", "The pinned session's checkbox is disabled and select all excludes it."),
      },
    ],
    expected: [
      bi("Settings UI自体が示すプレースホルダーでWorktree locationを構成し、新しいworktreeの実際のパスを観察できた。正確な構文を断定していない。", "You configured Worktree location using the placeholders the Settings UI itself shows, and observed the new worktree's actual path, without asserting an exact syntax."),
      bi("1件の使い捨てコミットでCommit attributionトグルの効果を観察できた。設定のスコープは断定していない。", "You observed the Commit attribution toggle's effect on one disposable commit, without asserting the setting's scope."),
      bi("障害を発生させずに、起動失敗時の診断対応チェックリストを作成できた。", "You prepared a startup-diagnostics response checklist without inducing a failure."),
    ],
    troubleshooting: [
      {
        problem: bi("新しいWorktree locationの値が適用されないように見える", "The new Worktree location value doesn't seem to apply"),
        fix: bi(
          "Settings画面に表示されている構文をそのまま使っているか確認し、綴りの誤りがないか再確認します。反映されない場合はアプリを再起動してください。正確な構文をこのガイドは断定していないため、まず現在の画面表示を信頼してください。",
          "Confirm you used exactly the syntax the Settings screen itself displayed, and re-check for typos. Restart the app if it still does not apply. Since this guide does not assert the exact syntax, trust what the current screen shows first.",
        ),
      },
      {
        problem: bi(
          "「worktrees」という名前のカスタムディレクトリについて過去に読んだ注意書きが気になる",
          "You recall a past warning about a custom directory literally named \"worktrees\"",
        ),
        fix: bi(
          "これは歴史的な既知の不具合で、v1.1.4で修正済みです。現在のビルドではこの名前を避ける必要はなく、参考情報として記載しているに過ぎません。",
          "This was a historical, now-fixed bug (fixed in v1.1.4). There is no need to avoid that name on a current build — it is noted here only as historical context, not as an active precaution.",
        ),
      },
      {
        problem: bi("Commit attributionの効果が観察したコミットに見られない", "Commit attribution's effect isn't visible on the commit you observed"),
        fix: bi(
          "トグルが保存されているか再確認し、新しいコミットで再度観察してください。設定がどの範囲（グローバル／セッション／リポジトリ）にいつから効くかは公式ソースで確認できていないため、このガイドでは断定せず、現在のSettings画面と公式リリースノートを確認してください。",
          "Re-check that the toggle was saved, and observe again with a new commit. This guide does not assert the scope (global/session/repository) or exact timing boundary of the setting, since neither is confirmed by an official source — check the current Settings screen and official release notes instead.",
        ),
      },
      {
        problem: bi("startup diagnosticsやworkspace initialization failureが自然に発生した", "A startup diagnostics dialog or workspace initialization failure occurs naturally"),
        fix: bi(
          "詳細をコピーするか、ログファイルを開いて内容を確認します。共有する前にファイルパスやアカウント情報などの機密情報を伏せ、必要であれば公式リポジトリのIssueに再現手順とともに報告してください。意図的に再現させようとはしないでください。",
          "Copy the details or open the log file to review its contents. Redact sensitive information such as file paths or account details before sharing, and if needed, report it in the official repository's issue tracker with reproduction steps. Do not try to deliberately reproduce it.",
        ),
      },
      {
        problem: bi("ピン留めセッションの保護が期待通りに見えない", "Pinned-session protection does not look the way you expected"),
        fix: bi(
          "セッションが実際にピン留めされているか、現行の「select all」コントロールを使っているかを確認します。この挙動は変更履歴でのみ確認できる release-note-grounded な内容のため、手元のビルドで実際に表示される内容を優先してください。",
          "Confirm the session is actually pinned and that you are using the current \"select all\" control. This behavior is release-note-grounded and confirmed only by the changelog, so trust what your own build actually shows.",
        ),
      },
    ],
    cleanup: [
      bi("Worktree locationを、観察前に控えた値か、意図した値に戻す。", "Restore Worktree location to the value you recorded beforehand, or to the value you intend to keep."),
      bi("Commit attributionの観察に使った使い捨てのテストブランチを、必要な確認後に削除する。", "After completing the required checks, delete the disposable test branch used to observe Commit attribution."),
      bi("Manage sessionsでテストセッションのピン留めを外し削除する。", "Unpin and delete the test session in Manage sessions."),
    ],
    platforms: {
      windows: bi(
        "診断ダイアログはコピー／ログを開く操作のみ確認されています。正確なログファイルの場所や形式はこのガイドでは断定しません。",
        "The diagnostics dialog is confirmed only for its copy/open-log actions. This guide does not assert an exact log file location or format.",
      ),
      macos: bi(
        "同上。診断ダイアログの正確な内部仕様は断定しません。",
        "Same as above; this guide does not assert the diagnostics dialog's exact internal format.",
      ),
      linux: bi(
        "特定のカラー絵文字やモノスペースフォントによる空白ウィンドウのクラッシュがv1.1.4で修正されたことが変更履歴で確認できますが、これは過去の既知の不具合として記載するのみで、再現を試みる必要はありません。",
        "The changelog confirms a blank-window crash from certain color emoji or monospace fonts was fixed in v1.1.4; this is noted only as historical context, and there is no need to try to reproduce it.",
      ),
      wsl: bi(
        "WSLでは、worktreeのパスがWindows側とLinuxサブシステム側のどちらを指すかを、このガイドでは断定しません。手元の環境で実際に確認してください。",
        "This guide does not assert whether a worktree path resolves into the Windows side or the Linux subsystem under WSL specifically — verify it directly in your own environment.",
      ),
    },
    related: ["04", "08", "21", "25"],
    sources: [
      { title: "GitHub Copilot app v1.1.4 changelog", url: "https://github.com/github/app/blob/main/changelog.md#v114" },
      { title: "GitHub Copilot app v1.1.3 changelog", url: "https://github.com/github/app/blob/main/changelog.md#v113" },
      { title: "Creating a commit with multiple authors", url: "https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors" },
    ],
  },
  {
    id: "25",
    title: bi(
      "キャップストーン: Issueから検証済みPRの着地と運用クリーンアップまで",
      "Capstone: from issue to a verified, landed PR with operational cleanup",
    ),
    summary: bi(
      "Issueの選定から計画、実装、Copilotレビュー、CI、stack/merge queue/Agent Mergeの確認、着地、そして運用クリーンアップまでを一つの連続した流れとして実行します。",
      "Run the full flow — from picking an issue through plan, implementation, Copilot review, CI, stack/merge-queue/Agent Merge verification, landing, and operational cleanup — as one continuous exercise.",
    ),
    keywords: ["capstone", "end-to-end", "issue", "pull request", "Agent Merge", "operational cleanup", "verification"],
    difficulty: { key: "advanced", label: bi("上級", "Advanced") },
    status: {
      key: "current",
      label: bi("提供中", "Available"),
      detail: bi(
        "v1.1.4 時点。個々の機能はguide 01-24で提供中として確認済みのものを組み合わせています。リポジトリ設定（branch protection、merge queueなど）によって一部の手順は省略できます。",
        "Current in v1.1.4. It combines capabilities already confirmed as available in guides 01-24. Some steps can be skipped depending on repository settings such as branch protection and the merge queue.",
      ),
    },
    version: bi("v1.1.4 で確認", "Verified for v1.1.4"),
    scenario: bi(
      "使い捨てのサンプルリポジトリで、小さく範囲の定まったIssueを選び、計画レビューから実装、レビュー、CI、マージ、そして後片付けまでを、本番相当の緊張感で一人称のデリバリー担当者として通しで実行します。",
      "In a disposable sample repository, pick a small, well-scoped issue and carry it through plan review, implementation, review, CI, merge, and cleanup end to end, as the delivery owner, with production-like rigor.",
    ),
    scope: bi(
      "このガイドはguide 01, 03-05, 11-14, 20-24で個別に扱った機能を1つの流れに接続する統合演習です。各機能自体の詳細な操作説明は重複させず、それぞれの専用ガイドを参照します。新しいUI要素はここでは導入しません。",
      "This guide is an integration exercise chaining capabilities individually covered in guides 01, 03-05, 11-14, and 20-24 into one flow. It does not duplicate each capability's detailed operation and instead references its dedicated guide. No new UI surface is introduced here.",
    ),
    safety: bi(
      "本番リポジトリではなく使い捨てのサンプルリポジトリで通しの練習をしてください。Issue作成、PR作成、Agent Mergeの有効化のいずれについても、対象リポジトリを毎回確認してください。",
      "Rehearse the full flow in a disposable sample repository, not production. Verify the target repository every time before creating an issue, opening a PR, or enabling Agent Merge.",
    ),
    prerequisites: [
      bi("guide 01（導入）、04（worktree）、11（My Work）、13（PRレビュー）を完了していること。", "Guides 01 (install), 04 (worktrees), 11 (My Work), and 13 (PR review) completed."),
      bi("ブランチとコミットの基本的なgit操作に慣れていること。", "Comfort with basic Git branch and commit operations."),
      bi(
        "CIが構成されたサンプルリポジトリ（構成がない場合はCI確認手順を任意として進めてよい）。",
        "A sample repository with CI configured (if none is available, the CI-check step can be treated as optional).",
      ),
    ],
    commands: [
      {
        id: "capstone-prompt",
        label: bi("低リスクな実装プロンプトの例", "Example low-risk implementation prompt"),
        language: "text",
        code: "Read issue #<number> in this repository. Propose a plan that satisfies its acceptance criteria with the smallest possible diff, and wait for my approval before editing any files.",
      },
      {
        id: "capstone-verify",
        label: bi("着地したコミットを確認する", "Verify the landed commit"),
        language: "shell",
        code: "git fetch origin && git log --oneline -5 origin/main",
      },
    ],
    steps: [
      {
        title: bi("Issueを選びマイルストーンを確認する", "Pick an issue and confirm its milestone"),
        body: [
          bi(
            "My Workまたは新規作成で、小さく範囲の定まったIssueを1つ選び、マイルストーンが設定されていることを確認します（未設定なら設定します）。",
            "From My Work, or by creating one, pick a small, well-scoped issue and confirm it has a milestone (set one if it does not).",
          ),
        ],
        expected: bi("受け入れ条件が明確な1つのIssueが選ばれ、マイルストーンが設定されている。", "One issue with clear acceptance criteria is selected and has a milestone."),
      },
      {
        title: bi("worktreeでセッションを開始しPlanで合意する", "Start a session in a worktree and agree on a Plan"),
        body: [
          bi(
            "新しいworktreeでセッションを開始し、Plan modeで受け入れ条件に沿った実装方針を提示させ、承認前にファイルを変更させません。",
            "Start a session in a new worktree, use Plan mode to have the agent propose an approach matching the acceptance criteria, and do not allow file changes before approval.",
          ),
        ],
        commandIds: ["capstone-prompt"],
        expected: bi("承認可能なPlanが提示され、ファイル変更が行われていない。", "An approvable plan is presented and no files have changed yet."),
      },
      {
        title: bi("実装し差分をレビューする", "Implement and review the diff"),
        body: [
          bi(
            "Planを承認し、Interactiveまたは適切なモードで実装させ、Files/Changesで差分を確認します。",
            "Approve the plan, implement in Interactive or another appropriate mode, and review the diff in Files/Changes.",
          ),
        ],
        expected: bi("差分がIssueの受け入れ条件に対応し、範囲外の変更が含まれていない。", "The diff addresses the issue's acceptance criteria with no out-of-scope changes."),
      },
      {
        title: bi("PRを開きCopilotレビューを要求する", "Open a PR and request Copilot review"),
        body: [
          bi(
            "セッションからプルリクエストを作成します。現在のアプリ、アカウント、ポリシー、リポジトリでCopilot code reviewの要求操作が利用できる場合だけ要求し、再要求操作も表示される場合だけ使います。利用できない場合は理由を記録し、人のレビューへ進みます。",
            "Open a pull request from the session. Request a Copilot code review only if the action is available for the current app, account, policy, and repository; re-request only if that action is also shown. Otherwise record the limitation and continue with human review.",
          ),
        ],
        expected: bi("利用可能なレビュー結果には対応し、Copilot reviewが利用できない場合も人のレビュー結果と制約を記録できる。", "You addressed any available review result, or recorded the limitation and human-review outcome when Copilot review was unavailable."),
      },
      {
        title: bi("CIとstack/queueの状態を確認する", "Check CI and stack/queue state"),
        body: [
          bi(
            "必須チェックの状態を確認し、PRがstackの一部であればstack summaryを、merge queueが有効であればqueue positionを確認します。",
            "Check required-check status, and if the PR is part of a stack review the stack summary, or if the merge queue is enabled check the queue position.",
          ),
        ],
        expected: bi("必須チェックが成功し、stack/queueの状態が着地の妨げになっていない。", "Required checks pass and stack/queue state does not block landing."),
      },
      {
        title: bi("Agent Mergeを有効にするか人手でマージする", "Enable Agent Merge or merge by hand"),
        body: [
          bi(
            "Agent Mergeを有効にして着地を任せるか、必須チェック完了を確認したうえで人手でマージします。Agent Mergeが一時停止した場合は理由を読んで対応します。",
            "Enable Agent Merge to land it automatically, or merge by hand once required checks pass. If Agent Merge pauses, read and act on the reason.",
          ),
        ],
        expected: bi("PRがマージされ、対応するIssueがクローズまたは正しく更新される。", "The PR is merged and the corresponding issue closes or updates correctly."),
      },
      {
        title: bi("着地とコミット帰属を検証する", "Verify the landing and commit attribution"),
        body: [
          bi(
            "着地後のコミットをgitで確認し、Commit attribution設定（guide 24）と一致するトレーラーになっていることを確認します。",
            "Verify the landed commit with git and confirm its trailer matches your Commit attribution setting (guide 24).",
          ),
        ],
        commandIds: ["capstone-verify"],
        expected: bi("既定ブランチに着地したコミットが確認でき、トレーラーが設定と一致する。", "The landed commit is visible on the default branch and its trailer matches the setting."),
      },
      {
        title: bi("運用クリーンアップを完了する", "Complete operational cleanup"),
        body: [
          bi(
            "セッションをアーカイブし、worktreeとブランチを削除し、テストのためだけにピン留めしたセッションがあれば解除して、Manage sessionsに不要なテスト項目が残っていないことを確認します。",
            "Archive the session, delete the worktree and branch, unpin any session pinned only for this test, and confirm Manage sessions contains no unnecessary test entries.",
          ),
        ],
        expected: bi("開いたままのテストセッション、worktree、ピン留めが残っていない。", "No open test session, worktree, or pin remains."),
      },
    ],
    expected: [
      bi("Issueから着地までを中断なく実行できた。", "You executed issue-to-landing without interruption."),
      bi("マージ前にレビューとCIの両方を人が確認した。", "A human confirmed both review and CI before merging."),
      bi("着地後の運用クリーンアップをすべて完了した。", "You completed all post-landing operational cleanup."),
    ],
    troubleshooting: [
      {
        problem: bi("Planが受け入れ条件から外れた変更を提案する", "The plan proposes changes outside the acceptance criteria"),
        fix: bi(
          "Plan reviewをフィードバック付きで差し戻し、範囲を狭めた具体的な指示を与えます（guide 05を参照）。",
          "Reject the plan review with feedback narrowing the scope with specific instructions (see guide 05).",
        ),
      },
      {
        problem: bi("PRがマージされてもIssueが自動クローズしない", "The issue does not auto-close when the PR merges"),
        fix: bi(
          "クロージングキーワードでIssueがリンクされているか確認し、リンクされていなければ手動でクローズ・関連付けします（guide 23を参照）。",
          "Confirm the issue is linked via a closing keyword; if it is not, close and associate it manually (see guide 23).",
        ),
      },
      {
        problem: bi("Agent Mergeが理由付きで一時停止している", "Agent Merge is paused with a stated reason"),
        fix: bi(
          "表示された理由（保留中のチェックなど）に対応し、理由を確認せずにトグルを繰り返し切り替えないでください（guide 22を参照）。",
          "Address the stated reason (such as a pending check) instead of repeatedly toggling Agent Merge without reading it (see guide 22).",
        ),
      },
      {
        problem: bi("複数回の演習後にセッションやworktreeが溜まっている", "Sessions or worktrees accumulate after several runs"),
        fix: bi(
          "Manage sessionsの一括操作で片付けますが、ピン留めされたセッションが意図通り除外されることを確認してください（guide 24を参照）。",
          "Clean up with Manage sessions' bulk actions, and confirm pinned sessions are excluded as expected (see guide 24).",
        ),
      },
    ],
    cleanup: [
      bi("セッションをアーカイブまたは削除する。", "Archive or delete the session."),
      bi("ローカルとリモートのブランチ・worktreeを削除する。", "Delete the local and remote branch and worktree."),
      bi("演習のためだけに残った未クローズのIssue/PRを閉じる。", "Close any issue/PR left open only for this exercise."),
      bi("演習のためだけに変更したWorktree location/Commit attribution設定を元に戻す。", "Revert any Worktree location/Commit attribution setting changed only for this exercise."),
    ],
    platforms: {
      windows: bi("ここまでの全ラボと同様、OS間の手順差はありません。", "As with every earlier lab, there is no OS-specific difference in this flow."),
      macos: bi("同上。", "Same as above."),
      linux: bi("同上。", "Same as above."),
      wsl: bi(
        "WSLリモートで通しの演習を行う場合はguide 08のWSL接続とhandoffの注意点を確認してください。Windows integrated terminalのPowerShell profile反映は別の実行境界です。",
        "If you run the full exercise over WSL remote, first review guide 08's WSL connection and handoff notes. PowerShell-profile pickup in the Windows integrated terminal is a separate execution boundary.",
      ),
    },
    related: ["01", "13", "14", "22", "23", "24"],
    sources: [
      { title: "GitHub Copilot app v1.1.4 changelog", url: "https://github.com/github/app/blob/main/changelog.md#v114" },
      { title: "Reviewing proposed changes in a pull request", url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request" },
      { title: "Creating an issue", url: "https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Loader: read the 21 archived guides (read-only), merge with the four new
// labs, apply the v1.1.4 verification-boundary update, extra related links,
// and per-domain enrichment, then verify the 6 journeys / 10 tracks cover all
// 25 labs with no orphans.
// ---------------------------------------------------------------------------

async function loadArchivedGuides() {
  const manifest = JSON.parse(await readFile("scripts/guide-content/manifest.json", "utf8"));
  const files = (await readdir("scripts/guide-content"))
    .filter((name) => /^path-\d+\.json$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const content = await Promise.all(
    files.map(async (name) => JSON.parse(await readFile(join("scripts/guide-content", name), "utf8"))),
  );
  const guides = content.flatMap((path) => path.guides);
  if (guides.length !== manifest.guideCount) {
    throw new Error(`Expected ${manifest.guideCount} archived guides; found ${guides.length}`);
  }
  return { manifest, guides };
}

export async function loadLabs() {
  const { manifest, guides } = await loadArchivedGuides();
  const archived = guides.map((guide) =>
    applyCurrentCorrections(
      applyV114Delta(
        applyExtraRelated(updateVerificationBoundary(deepModernize(cloneDeep(guide)))),
      ),
    ),
  );
  const all = [...archived, ...cloneDeep(newLabs).map((lab) => deepModernize(lab))];

  if (all.length !== 25) {
    throw new Error(`Expected exactly 25 labs (21 archived + 4 new); found ${all.length}`);
  }
  const seenIds = new Set();
  for (const lab of all) {
    if (seenIds.has(lab.id)) throw new Error(`Duplicate lab id ${lab.id}`);
    seenIds.add(lab.id);
  }

  for (const lab of all) {
    lab.journeyIds = journeys.filter((journey) => journey.labs.includes(lab.id)).map((journey) => journey.id);
    lab.trackIds = tracks.filter((track) => track.labs.includes(lab.id)).map((track) => track.id);
    if (lab.journeyIds.length === 0) throw new Error(`Orphan lab (no journey maps to it): ${lab.id}`);
    if (lab.trackIds.length === 0) throw new Error(`Orphan lab (no track maps to it): ${lab.id}`);
    lab.estimatedMinutes = estimatedMinutes(lab);
    lab.timeNote = estimatedTimeNote(lab);
    Object.assign(lab, domainEnrichment(lab));
    applyPedagogyOverrides(lab);
  }

  for (const journey of journeys) {
    for (const labId of journey.labs) {
      if (!seenIds.has(labId)) throw new Error(`Journey ${journey.id} references unknown lab ${labId}`);
    }
  }
  for (const track of tracks) {
    for (const labId of track.labs) {
      if (!seenIds.has(labId)) throw new Error(`Track ${track.id} references unknown lab ${labId}`);
    }
  }

  const ordered = [...all].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  const byId = new Map(ordered.map((lab) => [lab.id, lab]));
  return { manifest, labs: ordered, byId, journeys, tracks };
}
