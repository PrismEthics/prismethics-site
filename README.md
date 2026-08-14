# PrismEthics product site

The first honest public product slice for PrismEthics: a public explanation of the method and a device-local Workbench that people can use before the governed model runtime is connected to the web.

## What works now

- create and name a Work Object;
- choose a working mode;
- record the real question, known context, uncertainty, options, and next move;
- preserve a continuity note;
- save, close, reopen, correct, copy, and remove the object;
- keep the object in browser local storage on the current device.

## Current boundary

There are no accounts, cloud sync, or model calls in this browser slice. The interface states that boundary directly. See [the dated buildout map](docs/BUILDOUT_CURRENT_2026-08-14.md) for the governed path to the full web product.

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
- `/workbench` — device-local structured Workbench

The application uses vinext and the Sites hosting scaffold. `.openai/hosting.json` intentionally declares no D1 or R2 resource yet.
