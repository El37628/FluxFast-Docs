---
title: "ADR-0002: Next.js is an adapter and shell"
description: "Design record and verification material for ADR-0002: Next.js is an adapter and shell."
slug: "decisions/0002-nextjs-shell"
editUrl: "https://github.com/El37628/FluxFast/edit/main/docs/decisions/0002-nextjs-shell.md"
---
Status: accepted.

FastAPI owns application URLs and component identifiers. Next.js provides the
initial document, React, compilation, chunk splitting, and an optional catch-all
entry. Subsequent navigation goes directly through the FluxFast transport.

The component generator creates an allowlist of lazy imports. Arbitrary backend
strings are never converted into filesystem imports. `@fluxfast/core` remains
free of React and Next imports so other adapters can reuse it.
