import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.resolve(projectRoot, process.env.FLUXFAST_SOURCE ?? '../fluxfast');
const sourceDocs = path.join(sourceRoot, 'docs');
const outputDocs = path.join(projectRoot, 'src/content/docs');

const descriptions = {
  'advanced-stable-apis.md': 'Build supported cache, live, transport, protocol, handler, and tooling integrations with lower-level FluxFast APIs.',
  'architecture.md': 'Understand how FastAPI, the resource graph, browser stores, and the Next.js shell divide responsibility.',
  'benchmarking.md': 'Reproduce FluxFast performance measurements and interpret their correctness gates.',
  'caching.md': 'Configure server and browser caching without leaking data across users or tenants.',
  'codegen-api.md': 'Compile backend-owned schemas, inspect validator diagnostics, and generate or check artifacts with the unreleased framework-neutral Codegen package.',
  'containers.md': 'Package and run FluxFast with Docker or rootless Podman.',
  'contracts.md': 'Declare reusable application types and generate TypeScript from Python.',
  'core-api.md': 'Public API and stability classification for @fluxfast/core.',
  'deferred-resources.md': 'Stream non-blocking data after the first render with explicit loading and error states.',
  'developer-schema.md': 'Reference for the deterministic schema consumed by FluxFast code generation.',
  'devtools.md': 'Install and use the development-only FluxFast Debugbar to inspect resources, cache behavior, mutations, live updates, and protocol traces safely.',
  'distributed-cache.md': 'Coordinate cached resources and invalidations across multiple FastAPI workers with Redis.',
  'generated-artifacts.md': 'Learn which generated files are stable, how names are derived, and how drift is detected.',
  'getting-started.md': 'Build a small typed FluxFast application from installation through production start.',
  'live-deployment.md': 'Proxy, secure, and operate live resource streams in production.',
  'live-resources.md': 'Synchronize scoped resources across connected clients with reconnect-safe delivery.',
  'migration.md': 'Move an existing FluxFast application between supported release lines.',
  'mutations.md': 'Submit typed mutations, handle validation errors, and refresh affected resources.',
  'next-api.md': 'Public API and entry-point reference for @fluxfast/next.',
  'nextjs-adapter.md': 'Set up and configure the managed Next.js App Router shell.',
  'nextjs-manual-setup.md': 'Wire the Next.js adapter by hand when automatic initialization is not suitable.',
  'production.md': 'Build, validate, start, observe, and stop the single-origin production runtime.',
  'protocol.md': 'Normative wire contract shared by the Python backend and TypeScript clients.',
  'python-api.md': 'Stable Python API reference for pages, resources, mutations, contracts, and runtime helpers.',
  'releasing.md': 'Maintainer workflow for validating and publishing synchronized FluxFast packages.',
  'releases/v1.0.0.md': 'Release notes for the first stable FluxFast release and its frozen compatibility contracts.',
  'releases/v1.0.1.md': 'Release notes for the routable Next.js handlers and generated agent knowledge shipped in FluxFast 1.0.1.',
  'releases/v1.1.0.md': 'Release notes for the optional development DevTools package introduced in FluxFast 1.1.0.',
  'stable-apis.md': 'Choose and use the supported FluxFast APIs intended for ordinary application development.',
  'stability.md': 'The compatibility promises and public surfaces covered by FluxFast 1.x.',
  'type-safety.md': 'Generate typed resources, routes, mutations, and validators from backend declarations.',
  'upgrade-v1.md': 'A focused checklist for upgrading from v0.9.x to v1.0.0.',
  'validation.md': 'Run generated validation plans in the browser and map issues into forms.',
  'versioning.md': 'How package, protocol, and developer-schema versions evolve.',
};

const sourceFiles = (await readdir(sourceDocs, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name);

for (const directory of ['decisions', 'releases']) {
  const entries = await readdir(path.join(sourceDocs, directory), { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      sourceFiles.push(path.join(directory, entry.name));
    }
  }
}

const importedDocs = new Set(sourceFiles.map((relativePath) => path.resolve(sourceDocs, relativePath)));

for (const relativePath of sourceFiles.sort()) {
  const sourcePath = path.join(sourceDocs, relativePath);
  const outputPath = path.join(outputDocs, relativePath);
  let body = await readFile(sourcePath, 'utf8');
  const heading = body.match(/^#\s+(.+)$/m);

  if (!heading) {
    throw new Error(`Missing level-one heading in ${sourcePath}`);
  }

  const title = heading[1].replaceAll('`', '');
  const routeSlug = toRouteSlug(relativePath);
  body = body.replace(/^#\s+.+\r?\n+/, '');
  body = rewriteRepositoryLinks(body, sourcePath);

  const description = descriptions[relativePath] ?? `Design record and verification material for ${title}.`;
  const upstreamPath = path.relative(sourceRoot, sourcePath).split(path.sep).join('/');
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `slug: ${JSON.stringify(routeSlug)}`,
    `editUrl: ${JSON.stringify(`https://github.com/El37628/FluxFast/edit/main/${upstreamPath}`)}`,
    '---',
    '',
  ].join('\n');

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, frontmatter + body, 'utf8');
}

const assetCount = await syncAssets(
  path.join(sourceDocs, 'assets'),
  path.join(outputDocs, 'assets'),
);

console.log(
  `Synchronized ${sourceFiles.length} documents and ${assetCount} assets from ${sourceDocs}`,
);

async function syncAssets(sourceDirectory, outputDirectory) {
  await rm(outputDirectory, { recursive: true, force: true });

  let entries;
  try {
    entries = await readdir(sourceDirectory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return 0;
    throw error;
  }

  let copied = 0;
  for (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const outputPath = path.join(outputDirectory, entry.name);

    if (entry.isDirectory()) {
      copied += await syncAssets(sourcePath, outputPath);
      continue;
    }

    if (!entry.isFile()) continue;
    await mkdir(outputDirectory, { recursive: true });
    await copyFile(sourcePath, outputPath);
    copied += 1;
  }

  return copied;
}

function rewriteRepositoryLinks(markdown, sourcePath) {
  const withDocLinks = markdown.replace(/\]\(([^)\s#]+\.md)(#[^)\s]+)?\)/g, (_match, target, hash = '') => {
    const absoluteTarget = path.resolve(path.dirname(sourcePath), target);
    const relativeToDocs = path.relative(sourceDocs, absoluteTarget);

    if (
      !relativeToDocs.startsWith('..') &&
      !path.isAbsolute(relativeToDocs) &&
      importedDocs.has(absoluteTarget)
    ) {
      return `](/FluxFast-Docs/${toRouteSlug(relativeToDocs)}/${hash})`;
    }

    const repositoryPath = path.relative(sourceRoot, absoluteTarget).split(path.sep).join('/');
    return `](https://github.com/El37628/FluxFast/blob/main/${repositoryPath}${hash})`;
  });

  return withDocLinks.replace(/\]\(((?:\.\.\/|evidence\/)[^)\s#]+)(#[^)\s]+)?\)/g, (_match, target, hash = '') => {
    const absoluteTarget = path.resolve(path.dirname(sourcePath), target);
    const repositoryPath = path.relative(sourceRoot, absoluteTarget).split(path.sep).join('/');
    return `](https://github.com/El37628/FluxFast/blob/main/${repositoryPath}${hash})`;
  });
}

function toRouteSlug(relativePath) {
  return relativePath
    .split(path.sep)
    .join('/')
    .replace(/\.md$/, '')
    .replaceAll('.', '-');
}
