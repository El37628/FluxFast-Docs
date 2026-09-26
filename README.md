# FluxFast documentation

This repository contains the public documentation website for
[FluxFast](https://github.com/El37628/FluxFast), built with Astro and Starlight.

The published site is available at
[el37628.github.io/FluxFast-Docs](https://el37628.github.io/FluxFast-Docs/).

## Local development

Use Node.js 22 or newer:

```bash
npm ci
npm run dev
```

Astro prints the local URL when the server is ready. The site is configured with
the `/FluxFast-Docs` base path used by GitHub Pages.

## Verification

```bash
npm run check
npm run build
npm run check:links
```

`check:links` validates internal links against the generated static output, so it
must run after `build`.

## Updating product documentation

Most reference pages are synchronized from the canonical Markdown in the
FluxFast repository:

```bash
npm run sync:source
```

By default, the script expects the source repository at `../fluxfast`. Set
`FLUXFAST_SOURCE` when it is elsewhere:

```bash
FLUXFAST_SOURCE=/path/to/FluxFast npm run sync:source
```

The synchronizer adds Starlight metadata, stable URL slugs, upstream edit links,
and deployment-safe internal links. Edit imported product documentation in the
FluxFast repository, then synchronize it here. Site-specific content such as
`index.mdx`, `introduction.mdx`, navigation, styling, and deployment workflows is
owned by this repository.

## Deployment

Pull requests run type/content checks, a production build, and the generated-link
validator. Merges to `main` deploy the static site through GitHub Pages.

## License

[MIT](LICENSE)
