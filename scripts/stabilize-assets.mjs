import { readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');
const assetsRoot = path.join(outputRoot, '_astro');
const fingerprintedAssets = (await readdir(assetsRoot)).filter(hasContentFingerprint);
const replacements = new Map();

for (const filename of fingerprintedAssets) {
  const stableFilename = removeContentFingerprint(filename);
  await rename(path.join(assetsRoot, filename), path.join(assetsRoot, stableFilename));
  replacements.set(`/_astro/${filename}`, `/_astro/${stableFilename}`);
}

if (replacements.size > 0) {
  for (const outputFile of await walk(outputRoot)) {
    if (!isTextOutput(outputFile)) continue;

    const original = await readFile(outputFile, 'utf8');
    let updated = original;
    for (const [fingerprintedPath, stablePath] of replacements) {
      updated = updated.replaceAll(fingerprintedPath, stablePath);
    }

    if (updated !== original) await writeFile(outputFile, updated);
  }
}

console.log(`Stabilized ${replacements.size} generated asset URL(s)`);

function hasContentFingerprint(filename) {
  const segments = filename.split('.');
  if (segments.length < 3) return false;

  const candidate = segments.at(-2);
  return candidate.length >= 5 && candidate.length <= 12 && !/^[a-z]+$/.test(candidate);
}

function removeContentFingerprint(filename) {
  const segments = filename.split('.');
  segments.splice(-2, 1);
  return segments.join('.');
}

function isTextOutput(filename) {
  return /\.(?:css|html|js|json|map|svg|txt|xml)$/.test(filename);
}

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(entryPath)));
    else output.push(entryPath);
  }
  return output;
}
