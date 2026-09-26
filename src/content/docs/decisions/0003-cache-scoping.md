---
title: "ADR-0003: Explicit server cache scopes"
description: "Design record and verification material for ADR-0003: Explicit server cache scopes."
slug: "decisions/0003-cache-scoping"
editUrl: "https://github.com/El37628/FluxFast/edit/main/docs/decisions/0003-cache-scoping.md"
---
Status: accepted.

The same logical wire key can represent data for different users or tenants.
Server cache keys therefore combine an explicit scope fingerprint with the
logical key. Positive TTL resources without a supplied scope remain
request-scoped rather than defaulting to public.

This adds small declaration overhead but prevents accidental cross-user and
cross-tenant reuse. Distributed caching may later implement the same backend
interface without changing resource APIs.
