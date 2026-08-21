# PrismEthics Product Buildout — Current State

Date: 2026-08-20  
Purpose: the smallest accurate path to a pilotable conversational Progressive Workbench  
Status: unpromoted build projection; no deployment or Product MVS closure claim

## Governing position

The master product promise is a durable, human-governed work relationship that begins as ordinary conversation. PrismEthics should quietly organize the work underneath and reveal structure only when it helps the person understand, continue, or exercise authority.

The recognizable product is not yet admitted. This site change creates a candidate vertical slice, not the full governed product. There are still no accounts, tenant isolation, cloud synchronization, canonical Work Object persistence, provider-neutral routing, or outside-pilot evidence in this repository.

The current Product Minimal Viable Step remains:

`MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1`

It is open. A site build, mock provider test, branch, pull request, model response, deployment, or positive pilot experience does not close it.

## The recovered product direction

The first Workbench should not make a person operate the internal architecture. Required titles, mode selectors, frame pickers, checklists, option grids, and fields for “known,” “uncertain,” or “next move” turn facilitation into homework.

The corrected direction is:

> The human carries on a conversation. The AI carries the structure.

Internally, the system may route frames, run adversarial readings, research, synthesize, and maintain typed continuity. Externally, it presents one coherent conversation. When genuinely different readings matter, it may present two or three short prose perspectives and a provisional synthesis or recommendation. The person stays free to continue naturally rather than administering those readings.

The complete visible contract is [Conversational Workbench Pilot Contract v0.1](CONVERSATIONAL_WORKBENCH_PILOT_CONTRACT_v0_1.md).

## GitHub reconciliation

As observed on 2026-08-20:

- site draft PR #3 contains useful landing language, base visual tokens, error/re-entry ideas, and a test harness, but its visible form/card/checklist/frame-administration direction is superseded for the pilot;
- runtime draft PR #13 does not provide the required real provider boundary and contains localhost, hard-coded semantic, and attribution paths that cannot serve as pilot truth;
- neither draft is automatically closed, merged, or rewritten by this projection;
- later salvage must be selective and provenance-preserving.

## Current implementation slice

`CONVERSATIONAL_WORKBENCH_VERTICAL_SLICE_v0_1` is the immediate build slice. Its durable prerequisite is `CONVERSATIONAL_WORKBENCH_PILOT_CONTRACT_v0_1`.

The slice contains:

1. a first page with a thin header, “What are you working through?”, one composer, optional text attachment, send, and quiet recent work;
2. an ongoing transcript that keeps conversation primary;
3. optional prose perspectives and provisional synthesis when plurality is material;
4. sourced research notes that explain what changed, held, or remains uncertain;
5. an artifact surface that appears only after substantive work exists and is revised through conversation;
6. quiet continuity and provenance details;
7. browser-local recent-work re-entry;
8. a same-origin server turn boundary that keeps provider credentials off the client and can use a real model when securely configured;
9. a stateless provider exchange (`store: false`) whose bounded conversational context comes from product-owned state rather than a provider response chain.

The site-side boundary is a candidate seam. It does not silently replace the admitted Integrated Runtime binding or establish provider-neutral canonical architecture.

## Preserved back-end architecture

The pilot must remain compatible with the Buildout Planner's preserved candidate direction without making the person operate it. D-89 (`f950b72e-52a1-4c39-a21a-feb6123d1a7d`) records a candidate decision for one initially deployable modular application with explicit logical boundaries:

```text
API/UI adapters
  → SessionRuntime
      → FrameRuntimePort
      → ModelRuntimePort
      → WorkObjectStore
      → ProjectionEngine
      → Authorization
      → JobRunner only when an asynchronous guarantee is required
```

`SessionRuntime` is the product-facing facade. It exposes conversation and Work Object semantics rather than the historical tool graph. `FrameRuntimePort` is the anti-corruption boundary to the exact governed Frame Library owner. `ModelRuntimePort` contains provider-specific execution and receipts; a session handler must not become a second provider client. `WorkObjectStore`, `ProjectionEngine`, and `Authorization` preserve the distinction between source events, rebuildable derived continuity, and permission to use that continuity.

The admitted Integrated Runtime binding `IR-REBIND-SRF984-SKILL23-V051` is the preserved coordination direction behind that facade. It contributes event-derived run state, permission-filtered ContextPackages, two-phase `CONVERSATIONAL_TURN_CHECKPOINTED` / `CONVERSATIONAL_TURN_CLOSED` accounting, exact-owner dispatch, provenance-bearing transitions, Quiet Intelligence (`NONE → CONTINUE → E0`), and hard Human Authority stops. It does not replace Buildout authority, Frame Library ownership, Session Logger ordering, or the public `SessionRuntime` boundary.

That exact Integrated Runtime binding remains locked to Buildout Planner v1.52. Standalone Buildout Planner v1.53 supplies the current master-vision and build-planning orientation, but it must not be injected into the admitted binding without a separately reviewed rebind. Preserving both authorities is not permission to silently substitute one for the other.

The eventual mapping between `ModelRuntimePort` and the Integrated Runtime's `HostRuntimePort` requires an explicit adapter and receipt contract. Likewise, an actual frame claim requires exact owner dispatch and a valid frame receipt. A structured model answer is not evidence that SRF or the Frame Library executed.

### What this site slice actually implements

This repository currently implements only:

- the conversational interface and presentation contract;
- a candidate site-side `SessionRuntime`-shaped turn boundary;
- a stateless server-side provider adapter;
- product-owned bounded context supplied for each turn;
- browser-local re-entry convenience.

Prose perspectives and adversarial readings in this slice are model synthesis, not Frame Library receipts. Web search is provider-assisted research with source links, not the admitted Integrated Runtime's governed research-owner route.

### Explicit architectural holds

- no exact Frame Library execution or frame receipt;
- no attested governed research owner;
- no canonical Work Object store, event substrate, projection engine, or authorization transition;
- no full Integrated Runtime conformance;
- no authenticated ownership, tenant isolation, or cloud continuity;
- no paid or governed live-provider proof;
- no deployment or production-readiness claim.

## Exact status matrix

| Object | Recorded status | What may be claimed here |
|---|---|---|
| D-89 modular-monolith direction | Candidate architectural decision; architecture convergence passed unpromoted | Preserve the logical ports and initial one-deployable shape; do not call it canonical promotion or production proof |
| `FRAME_RUNTIME_PORT_AND_CANONICAL_APPLICATION_CONVERGENCE_v0_1` | `PASS_TO_PROTECTED_SUBSTRATE_PROOF_UNPROMOTED` | The boundary contracts and historical application disposition exist |
| Stage 1 protected substrate | `PASS_TO_STAGE2_UNPROMOTED` | Bounded source/projection, correction, revocation, isolation, and RLS semantics were proved; not the site's current persistence |
| Stage 2 local continuity wire | `PASS_LOCAL_WIRE_HOLD_LIVE_MODEL`; 39/39 native tests | A reference two-session loop and provider adapters exist; no live-provider or product-runtime-ready claim |
| `IR-REBIND-SRF984-SKILL23-V051` | Admitted installed cross-repository binding; separate proof boundary; locked to Buildout Planner v1.52 | It is the preserved coordination architecture; standalone Buildout Planner v1.53 is not silently injected, and this site does not claim full conformance, experience quality, production readiness, or canonical product promotion |
| `CONVERSATIONAL_WORKBENCH_VERTICAL_SLICE_v0_1` | Immediate site implementation candidate | Interface, candidate turn boundary, stateless provider adapter, and device-local convenience only |
| `MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1` | Current Product MVS; open | No site build, test, model response, branch, deployment, or pilot reaction closes it |

## Current authority drift

Buildout structured authority still records `HOLD_EXTERNAL_CREDENTIAL`. During this governed build session, secure local server-side key setup was observed. That changes the terrain that must be re-attested; it does not amend Buildout authority, authorize a paid call, prove the two-session continuity loop, or close `MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1`.

## Immediate objectives

### 1. Make the first conversation real

- Begin from a single human sentence.
- Require no title, mode, frame, or workflow choice.
- Return useful model work, not a restatement of fields.
- Keep model errors recoverable without losing the human's message.

### 2. Prove hidden structure can improve the experience

- Use multiple readings only when their differences matter.
- Present them as two or three concise prose passages.
- Offer a provisional synthesis or recommendation without false closure.
- Ask no more than one organic question when a missing fact truly blocks the next move.

### 3. Let work products grow from the conversation

- Integrate research with sources and an account of what changed.
- Create an artifact only when requested or substantively earned.
- Revise the artifact through later conversational turns.
- Preserve a faithful re-entry cue and latest artifact on the same device.

### 4. Preserve authority and proof boundaries

- Never attribute a model inference to the person.
- Keep user statements, sources, model contributions, and technical receipts distinguishable.
- Treat browser storage as device-local convenience, not secure or canonical persistence.
- Treat model perspectives as model synthesis unless an exact frame owner and receipt are present.
- Reconstruct bounded conversational context from product-owned state; do not make provider response state the continuity authority.
- Keep deployment, authentication, live paid proof, Product MVS closure, and canonical promotion as separate events.

## Build and evidence sequence

### A. Contract and candidate implementation

- Commit this experience contract and buildout projection.
- Replace the form-heavy Workbench with the conversational surface.
- Add the server-only model turn boundary.
- Preserve honest landing and trust-boundary language.

Exit proof: source review shows no required setup fields or exposed frame administration, and the candidate matches the contract.

### B. Mechanical verification

- Pass lint and the production build.
- Test the server boundary with a mock provider.
- Verify that credentials cannot enter client output or browser persistence.
- Verify `store: false` and the absence of provider-response-chain continuity.
- Verify that no model perspective or provider-assisted search result is mislabeled as an exact governed owner receipt.
- Verify malformed input, provider failure, re-entry, research sources, artifact revision, and attribution behavior.

Exit proof: passing repository tests and preserved negative-path evidence. Mechanical passage is not semantic or product admission.

### C. Human ten-turn journey

- Complete the ten-turn acceptance journey in the contract.
- Record where the exchange felt like a conversation and where it felt like homework.
- Preserve failures involving overload, premature closure, false certainty, research decoration, artifact incoherence, or unfaithful re-entry.

Exit proof: a human-reviewed journey record and a bounded correction queue.

### D. Product MVS and governed runtime reconciliation

- Any paid live-provider proof requires separate explicit authorization and its own cost/provenance record.
- Reconcile observed conversation behavior with the admitted Integrated Runtime binding and ContextPackage boundaries.
- Map the site-side candidate boundary explicitly to `SessionRuntime`, `FrameRuntimePort`, `ModelRuntimePort`/`HostRuntimePort`, Work Object persistence, projections, and authorization before claiming runtime conformance.
- Close `MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1` only through its own governed evidence and Human Authority review.

Exit proof: the Product MVS authority record changes through its owner, not by implication from this site.

### E. Later product gates

- ordinary sign-in and authenticated ownership;
- canonical persistence with inspect, correct, revoke, export, and retire;
- exact Frame Library and governed research-owner integration;
- full Integrated Runtime checkpoint/close, receipt, and hard-stop conformance;
- manual model choice and one cross-model continuation proof;
- deployment and production-security evidence;
- one outside pilot only after the core journey and promises are supportable.

## Pilot learning questions

1. Does the person feel accompanied in the work rather than assigned a form?
2. Do multiple prose readings enlarge understanding without becoming cognitive clutter?
3. Does the synthesis remain useful while keeping uncertainty and human direction alive?
4. Does research materially change the work?
5. Does an artifact emerge and improve naturally?
6. Can the person return and continue without reconstructing the project?
7. Where does the system still drift toward judgment, fragmentation, or closure?

## Explicit nonclaims

This projection does not establish:

- a live deployment;
- authentication, tenant isolation, or cloud synchronization;
- canonical Work Object persistence;
- production privacy, retention, deletion, or security;
- provider neutrality, routing adequacy, or cross-model continuity;
- exact Frame Library execution or governed research-owner execution;
- full Integrated Runtime conformance;
- a completed paid-provider proof;
- outside-pilot readiness;
- Product MVS closure;
- canonical promotion.

## Next proof-bearing action

Complete and mechanically verify `CONVERSATIONAL_WORKBENCH_VERTICAL_SLICE_v0_1` against the ten-turn contract, including the stateless provider and no-false-receipt gates. Then have Eamon run the journey and preserve what fails. Keep the deeper architecture explicit in contracts and seams, but do not add it as visible ceremony unless human evidence shows the conversation needs it.
