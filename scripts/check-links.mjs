import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');
const siteBase = '/FluxFast-Docs/';
const htmlFiles = await walk(outputRoot, '.html');
const failures = [];

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  const documentPath = toDocumentPath(htmlFile);
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));

  for (const href of links) {
    if (href.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/.test(href)) {
      continue;
    }

    const target = new URL(href, `https://docs.example${documentPath}`);
    if (!target.pathname.startsWith(siteBase)) {
      continue;
    }

    const relativeTarget = target.pathname.slice(siteBase.length);
    const diskTarget = target.pathname.endsWith('/')
      ? path.join(outputRoot, relativeTarget, 'index.html')
      : path.join(outputRoot, relativeTarget);

    try {
      await access(diskTarget);
    } catch {
      failures.push(`${path.relative(outputRoot, htmlFile)} -> ${href}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Found ${failures.length} broken internal link(s):\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Checked internal links across ${htmlFiles.length} generated pages`);
}

function toDocumentPath(htmlFile) {
  const relative = path.relative(outputRoot, htmlFile).split(path.sep).join('/');
  if (relative === 'index.html') return siteBase;
  if (relative.endsWith('/index.html')) return `${siteBase}${relative.slice(0, -'index.html'.length)}`;
  return `${siteBase}${relative}`;
}

async function walk(directory, extension) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(entryPath, extension)));
    else if (entry.name.endsWith(extension)) output.push(entryPath);
  }
  return output;
}
