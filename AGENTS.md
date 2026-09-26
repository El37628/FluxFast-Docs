# Agent rules

## Content ownership

The FluxFast application repository is authoritative for the Markdown imported by
`scripts/sync-source-docs.mjs`. Do not hand-edit generated `.md` files under
`src/content/docs`; update the matching source document and run
`npm run sync:source`. This repository owns the landing and introduction MDX,
site navigation, design, CI, and deployment.

Keep explanations task-oriented and define a concept before exposing its full
contract. Prefer complete, runnable examples over isolated fragments. Preserve
the FastAPI ownership boundary and never suggest that frontend visibility is an
authorization control.

## Verification

Run `npm run check`, `npm run build`, and `npm run check:links` for changes that
affect content, routing, configuration, or styling. Review the site at desktop
and 375px width for interface changes. Keep visible keyboard focus, accessible
contrast, and reduced-motion behavior.

## Git workflow

Create a focused task branch from `main`; stage only task-owned files; commit
with a concise Conventional Commit message; push and open a pull request. Wait
for all required checks, merge with the repository's normal strategy, then
switch to `main` and synchronize it with `git pull --ff-only`. Never force-push,
rewrite history, bypass checks, or push feature work directly to `main`.
