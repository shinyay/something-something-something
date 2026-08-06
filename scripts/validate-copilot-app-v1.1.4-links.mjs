import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = [
  "copilot-app",
  "copilot-app-v1.1.4",
  "copilot-app-v1.1.4-hands-on",
];

async function htmlFiles(path) {
  const entry = await stat(path);
  if (entry.isFile()) return extname(path).toLowerCase() === ".html" ? [path] : [];
  return (
    await Promise.all(
      (await readdir(path)).map((name) => htmlFiles(join(path, name))),
    )
  ).flat();
}

const files = (await Promise.all(roots.map(htmlFiles))).flat();
const links = new Map();

for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/\b(?:href|src)="(https:\/\/[^"]+)"/g)) {
    const url = match[1].replaceAll("&amp;", "&");
    if (!links.has(url)) links.set(url, []);
    links.get(url).push(file);
  }
}

const queue = [...links.keys()];
const failures = [];
let checked = 0;

async function checkUrl(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
          "User-Agent": "shinyay-copilot-app-docs-link-validator",
        },
      });
      await response.body?.cancel();
      if (response.status >= 200 && response.status < 400) return;
      lastError = new Error(`HTTP ${response.status}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 750));
  }
  failures.push({
    url,
    error: lastError?.message || "Unknown failure",
    files: links.get(url),
  });
}

const workers = Array.from({ length: Math.min(6, queue.length) }, async () => {
  while (queue.length) {
    const url = queue.shift();
    await checkUrl(url);
    checked += 1;
  }
});
await Promise.all(workers);

if (failures.length) {
  console.error(`External link validation failed for ${failures.length} URL(s):`);
  for (const failure of failures) {
    console.error(`- ${failure.error}: ${failure.url}`);
    console.error(`  Referenced by: ${failure.files.join(", ")}`);
  }
  process.exit(1);
}

console.log(`External link validation passed: ${checked} unique HTTPS URLs across ${files.length} pages`);
