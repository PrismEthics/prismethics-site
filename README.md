# PrismEthics product site

This repository contains the public PrismEthics site and the first conversational Workbench pilot candidate. The candidate is designed to feel like one capable conversation while PrismEthics quietly carries structure, multiple readings, research, artifacts, and continuity underneath.

The authoritative experience contract is [Conversational Workbench Pilot Contract v0.1](docs/CONVERSATIONAL_WORKBENCH_PILOT_CONTRACT_v0_1.md). The current build position is recorded in [the 2026-08-20 buildout map](docs/BUILDOUT_CURRENT_2026-08-20.md).

## Pilot candidate

- begin with one sentence, fragment, pasted text, or supported text attachment;
- continue in ordinary conversation without choosing a title, mode, frame, or workflow;
- receive two or three prose perspectives only when their differences materially help;
- receive a provisional synthesis or recommendation without forced closure;
- integrate sourced research into what changed, held, or remains uncertain;
- form and revise a note, draft, research brief, plan, or design through conversation;
- close and reopen recent work from browser-local state on the same device;
- keep technical provenance available but quiet.

## Current boundary

This is an unpromoted candidate, not proof of a deployed or admitted product. When a server-only provider key is configured, the candidate can send turns through the site-side server boundary to a real model. Submitted content then leaves the browser and is subject to the configured provider's policies.

The provider exchange is stateless by contract (`store: false`). Conversational context is reconstructed from a bounded, product-owned package supplied by the Workbench rather than from a provider response chain. Browser-local recent work is convenience state, not authorized continuity or secure storage.

There are no accounts, tenant boundaries, cloud synchronization, or canonical Work Object persistence in this slice. No live paid proof, deployment, authentication, Product MVS closure, or canonical promotion is established by this repository change. The current Product Minimal Viable Step remains `MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1` and is open.

## Preserved back-end direction

D-89 records a candidate modular-monolith direction: one initially deployable application with explicit `SessionRuntime`, `FrameRuntimePort`, `ModelRuntimePort`, `WorkObjectStore`, `ProjectionEngine`, and `Authorization` boundaries. The admitted Integrated Runtime binding preserves event-derived state, permission-filtered ContextPackages, exact-owner dispatch, two-phase turn checkpoint/close, provenance, Quiet Intelligence, and hard Human Authority stops behind the conversational surface.

This repository does not claim to implement that full architecture. It currently owns the interface, a candidate site-side runtime boundary, a stateless provider adapter, and device-local convenience state. Prose perspectives are model synthesis, not Frame Library receipts. Provider-assisted web search is not the governed research-owner path. Exact frame execution, canonical Work Object persistence and authorization, full Integrated Runtime conformance, authentication, deployment, and the governed live-provider proof remain held behind separate evidence gates.

## Run locally

Requires Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local address shown in the terminal.

## Verify

```bash
pnpm lint
pnpm test
```

`pnpm test` performs a production build and checks the server-rendered public contract.

## Routes

- `/` — public landing page and trust boundary
- `/workbench` — conversational Workbench pilot candidate

The application uses vinext and the Sites hosting scaffold. `.openai/hosting.json` intentionally declares no D1 or R2 resource yet.
