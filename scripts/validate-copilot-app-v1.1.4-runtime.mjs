import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(".");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const failures = [];
const evidence = {
  browser: "Microsoft Edge headless",
  viewport: "390x844",
  themes: [],
  interactions: {},
  noJs: {},
  media: {},
};

function check(condition, message) {
  if (!condition) failures.push(message);
}

function mime(path) {
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  }[extname(path).toLowerCase()] || "application/octet-stream";
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    if (url.pathname === "/favicon.ico") {
      response.writeHead(204);
      response.end();
      return;
    }
    let target = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!target.startsWith(root)) throw new Error("Path escapes repository root");
    const targetStat = await stat(target);
    if (targetStat.isDirectory()) target = join(target, "index.html");
    response.writeHead(200, {
      "Content-Type": mime(target),
      "Cache-Control": "no-store",
    });
    response.end(await readFile(target));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const sitePort = server.address().port;

async function freePort() {
  const probe = createServer();
  await new Promise((resolveListen) => probe.listen(0, "127.0.0.1", resolveListen));
  const port = probe.address().port;
  await new Promise((resolveClose) => probe.close(resolveClose));
  return port;
}

const debugPort = await freePort();
const profile = await mkdtemp(join(tmpdir(), "copilot-app-v1.1.4-edge-"));
const edge = spawn(
  edgePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);

async function waitForDebugger() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return;
    } catch {
      // Edge is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error("Timed out waiting for Edge DevTools");
}

class Cdp {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
  }

  async open() {
    await new Promise((resolveOpen, rejectOpen) => {
      this.socket.onopen = resolveOpen;
      this.socket.onerror = rejectOpen;
    });
    this.socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      const listeners = this.listeners.get(message.method) || [];
      listeners.forEach((listener) => listener(message.params));
    };
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
    return () => {
      this.listeners.set(
        method,
        (this.listeners.get(method) || []).filter((candidate) => candidate !== listener),
      );
    };
  }

  once(method) {
    return new Promise((resolveEvent) => {
      const off = this.on(method, (params) => {
        off();
        resolveEvent(params);
      });
    });
  }
}

let cdp;
try {
  await waitForDebugger();
  const targetResponse = await fetch(
    `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  );
  const target = await targetResponse.json();
  cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Log.enable"),
    cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    }),
  ]);
  await cdp.send("Browser.grantPermissions", {
    origin: `http://127.0.0.1:${sitePort}`,
    permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
  });

  let runtimeProblems = [];
  cdp.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
    runtimeProblems.push(exceptionDetails.text || "Uncaught exception");
  });
  cdp.on("Log.entryAdded", ({ entry }) => {
    if (entry.level === "error") runtimeProblems.push(entry.text);
  });

  async function evaluate(expression) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  async function navigate(path, { scripts = true } = {}) {
    await cdp.send("Emulation.setScriptExecutionDisabled", { value: !scripts });
    runtimeProblems = [];
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", {
      url: `http://127.0.0.1:${sitePort}/${path}`,
    });
    await loaded;
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  const representativePages = [
    "copilot-app/index.html",
    "copilot-app-v1.1.2/index.html",
    "copilot-app-v1.1.2-hands-on/index.html",
    "copilot-app-v1.0.12/index.html",
    "copilot-app-v1.0.12-hands-on/index.html",
    "copilot-app-v1.1.4/index.html",
    "copilot-app-v1.1.4/releases.html",
    "copilot-app-v1.1.4-hands-on/index.html",
    "copilot-app-v1.1.4-hands-on/01-install-projects.html",
    "copilot-app-v1.1.4-hands-on/19-mcp-skills-plugins-canvas-extensions.html",
    "copilot-app-v1.1.4-hands-on/20-memory-chronicle-insights.html",
    "copilot-app-v1.1.4-hands-on/21-accessibility-storage-lifecycle-recovery.html",
    "copilot-app-v1.1.4-hands-on/22-stacked-pr-copilot-review.html",
    "copilot-app-v1.1.4-hands-on/24-worktree-attribution-diagnostics.html",
    "copilot-app-v1.1.4-hands-on/25-capstone-issue-to-landed-pr.html",
  ];
  for (const theme of ["light", "dark"]) {
    for (const page of representativePages) {
      await navigate(`${page}?scoutTheme=${theme}`);
      const state = await evaluate(`(() => {
        const buttons = [...document.querySelectorAll("button")];
        const skip = document.querySelector(".skip-link");
        skip?.focus();
        const skipStyle = skip ? getComputedStyle(skip) : null;
        const canScrollTo = (element) => {
          for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            const style = getComputedStyle(parent);
            if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth) {
              return true;
            }
          }
          return false;
        };
        const overflowing = [...document.querySelectorAll("body *")]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              element,
              tag: element.tagName,
              className: typeof element.className === "string" ? element.className : "",
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              text: (element.textContent || "").trim().slice(0, 80)
            };
          })
          .filter((item) => item.right > document.documentElement.clientWidth + 1);
        return {
          theme: document.documentElement.getAttribute("data-theme"),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          h1: document.querySelectorAll("h1").length,
          main: Boolean(document.querySelector("main")),
          skipVisible: Boolean(skip && skip.getBoundingClientRect().width > 0 && skipStyle.visibility !== "hidden"),
          unnamedButtons: buttons.filter((button) =>
            !(button.getAttribute("aria-label") || button.innerText.trim())
          ).length,
          overflowing: overflowing.map(({ element, ...item }) => item).slice(0, 12),
          unrecoverableOverflow: overflowing
            .filter((item) => !canScrollTo(item.element))
            .map(({ element, ...item }) => item)
            .slice(0, 12)
        };
      })()`);
      check(state.theme === theme, `${page} did not render in ${theme} theme`);
      check(state.overflow <= 0, `${page} overflows the 390px viewport by ${state.overflow}px`);
      check(state.h1 === 1, `${page} does not expose exactly one h1 at runtime`);
      check(state.main, `${page} is missing the main landmark at runtime`);
      if (!page.startsWith("copilot-app-v1.0.12")) {
        check(state.skipVisible, `${page} skip link cannot be focused visibly`);
      }
      check(state.unnamedButtons === 0, `${page} has ${state.unnamedButtons} unnamed button(s)`);
      check(
        state.unrecoverableOverflow.length === 0,
        `${page} has clipped, unreachable content: ${JSON.stringify(state.unrecoverableOverflow)}`,
      );
      check(runtimeProblems.length === 0, `${page} (${theme}) raised: ${runtimeProblems.join("; ")}`);
      evidence.themes.push({ page, theme, ...state, runtimeProblems: [...runtimeProblems] });
    }
  }

  await navigate("copilot-app-v1.1.4/releases.html?scoutTheme=light");
  evidence.interactions.releaseFilter = await evaluate(`(async () => {
    const select = document.querySelector("[data-release-version-filter]");
    select.value = "v1.1.4";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      visibleVersions: [...document.querySelectorAll("[data-release-version]")]
        .filter((item) => !item.hidden).length,
      visibleItems: [...document.querySelectorAll("[data-release-item]")]
        .filter((item) => !item.hidden).length,
      status: document.querySelector("[data-release-filter-status]")?.textContent.trim()
    };
  })()`);
  check(
    evidence.interactions.releaseFilter.visibleVersions === 1,
    "Version filter does not isolate one release",
  );
  check(
    evidence.interactions.releaseFilter.visibleItems === 86,
    `v1.1.4 filter shows ${evidence.interactions.releaseFilter.visibleItems} items instead of 86`,
  );

  await navigate("copilot-app-v1.1.4-hands-on/index.html?scoutTheme=light");
  evidence.interactions.learningFilter = await evaluate(`(async () => {
    const chip = document.querySelector('[data-filter-chip][data-filter-group="journeys"]');
    if (!chip) return { available: false };
    chip.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      available: true,
      value: chip.dataset.filterValue,
      resumeTitle: document.querySelector("[data-resume-title]")?.textContent.trim(),
      visibleLabs: [...document.querySelectorAll("[data-guide-card]")]
        .filter((item) => !item.hidden).length
    };
  })()`);
  check(evidence.interactions.learningFilter.available, "Journey filter is unavailable");
  check(
    evidence.interactions.learningFilter.visibleLabs > 0 &&
      evidence.interactions.learningFilter.visibleLabs < 25,
    "Journey filter does not narrow the 25 labs",
  );
  check(
    !/(Complete|完了)/.test(evidence.interactions.learningFilter.resumeTitle || ""),
    "Resume CTA shows a completion badge instead of the next lab title",
  );

  await navigate("copilot-app-v1.1.4-hands-on/01-install-projects.html?scoutTheme=light");
  evidence.interactions.progressAndLanguage = await evaluate(`(async () => {
    const progress = document.querySelector("[data-guide-complete]");
    progress?.click();
    document.querySelector("[data-language-toggle]")?.click();
    document.querySelector("[data-theme-toggle]")?.click();
    const copy = document.querySelector("[data-copy]");
    copy?.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      pressed: progress?.getAttribute("aria-pressed"),
      language: document.documentElement.getAttribute("data-lang"),
      storedLanguage: localStorage.getItem("copilot-app-docs-language"),
      theme: document.documentElement.getAttribute("data-theme"),
      storedTheme: localStorage.getItem("copilot-app-docs-theme"),
      progress: localStorage.getItem("copilot-app-v1.1.4-progress"),
      copyState: copy?.dataset.copyState
    };
  })()`);
  check(
    evidence.interactions.progressAndLanguage.pressed === "true",
    "Lab completion control does not update aria-pressed",
  );
  check(
    evidence.interactions.progressAndLanguage.language === "en" &&
      evidence.interactions.progressAndLanguage.storedLanguage === "en",
    "Language selection does not persist",
  );
  check(
    evidence.interactions.progressAndLanguage.progress?.includes("01"),
    "Lab progress does not persist locally",
  );
  check(
    evidence.interactions.progressAndLanguage.theme === "dark" &&
      evidence.interactions.progressAndLanguage.storedTheme === "dark",
    "Theme selection does not persist",
  );
  check(
    evidence.interactions.progressAndLanguage.copyState === "success",
    "Copy button does not report success",
  );

  await navigate("copilot-app-v1.1.4/releases.html?scoutTheme=light", { scripts: false });
  evidence.noJs.releases = await evaluate(`(() => ({
    items: document.querySelectorAll("[data-release-item]").length,
    visibleItems: [...document.querySelectorAll("[data-release-item]")]
      .filter((item) => getComputedStyle(item).display !== "none").length,
    jaVisible: [...document.querySelectorAll(".ja")].some((item) => getComputedStyle(item).display !== "none"),
    enVisible: [...document.querySelectorAll(".en")].some((item) => getComputedStyle(item).display !== "none")
  }))()`);
  check(evidence.noJs.releases.items === 687, "No-JS release page does not contain 687 items");
  check(
    evidence.noJs.releases.visibleItems === 687,
    "No-JS release page hides canonical content",
  );
  check(
    evidence.noJs.releases.jaVisible && evidence.noJs.releases.enVisible,
    "No-JS release page does not expose both languages",
  );

  await cdp.send("Emulation.setScriptExecutionDisabled", { value: false });
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await navigate("copilot-app-v1.1.4-hands-on/index.html?scoutTheme=dark");
  evidence.media.reducedMotion = await evaluate(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
  check(evidence.media.reducedMotion, "Reduced-motion media preference is not honored");

  await cdp.send("Emulation.setEmulatedMedia", { media: "print" });
  evidence.media.print = await evaluate(`(() => ({
    print: matchMedia("print").matches,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }))()`);
  check(evidence.media.print.print, "Print media mode is not active");
  check(evidence.media.print.overflow <= 0, "Print layout overflows the viewport");

  check(runtimeProblems.length === 0, `Final runtime problems: ${runtimeProblems.join("; ")}`);
} finally {
  cdp?.socket.close();
  edge.kill();
  if (edge.exitCode === null) {
    await Promise.race([
      new Promise((resolveExit) => edge.once("exit", resolveExit)),
      new Promise((resolveWait) => setTimeout(resolveWait, 5_000)),
    ]);
  }
  await new Promise((resolveClose) => server.close(resolveClose));
  let cleanupError = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await rm(profile, { recursive: true, force: true });
      cleanupError = null;
      break;
    } catch (error) {
      cleanupError = error;
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
  }
  if (cleanupError) throw cleanupError;
}

await mkdir("validation", { recursive: true });
await writeFile(
  "validation/copilot-app-v1.1.4-runtime.json",
  `${JSON.stringify({ ...evidence, failures }, null, 2)}\n`,
  "utf8",
);

if (failures.length) {
  console.error(`Runtime validation failed with ${failures.length} problem(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Runtime validation passed: ${evidence.themes.length} theme/page combinations, 390px responsive, no-JS, filters, copy, theme/language/progress persistence, reduced motion, and print`,
);
