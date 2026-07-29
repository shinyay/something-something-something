import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [matrixPath, translationsDirectory] = process.argv.slice(2);

if (!matrixPath || !translationsDirectory) {
  console.error(
    "Usage: node scripts/merge-release-translations.mjs <release-matrix.json> <translations-directory>",
  );
  process.exit(1);
}

const matrix = JSON.parse(await readFile(matrixPath, "utf8"));
const translationFiles = (await readdir(translationsDirectory))
  .filter((name) => name.endsWith(".json"))
  .sort();
const translations = new Map();

for (const fileName of translationFiles) {
  const batch = JSON.parse(await readFile(join(translationsDirectory, fileName), "utf8"));
  for (const item of batch.items) {
    if (translations.has(item.id)) {
      throw new Error(`Duplicate translation id: ${item.id}`);
    }
    if (!item.ja?.trim()) {
      throw new Error(`Blank Japanese translation: ${item.id}`);
    }
    translations.set(item.id, item);
  }
}

let merged = 0;
for (const release of matrix.releases) {
  for (const item of release.items) {
    const translation = translations.get(item.id);
    if (!translation) {
      throw new Error(`Missing translation for ${item.id}`);
    }
    for (const field of ["id", "version", "category", "en"]) {
      if (translation[field] !== item[field]) {
        throw new Error(`Translation batch changed ${field} for ${item.id}`);
      }
    }
    item.ja = translation.ja;
    merged += 1;
  }
}

if (merged !== matrix.itemCount || translations.size !== matrix.itemCount) {
  throw new Error(
    `Expected ${matrix.itemCount} exact translations; merged ${merged} from ${translations.size}`,
  );
}

await writeFile(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`, "utf8");
console.log(`Merged ${merged} Japanese translations into ${matrixPath}`);
