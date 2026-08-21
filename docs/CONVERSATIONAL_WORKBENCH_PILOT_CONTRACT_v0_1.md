# Conversational Workbench Pilot Contract v0.1

Date: 2026-08-20  
Status: authoritative product-experience contract for an unpromoted pilot candidate  
Implementation slice: `CONVERSATIONAL_WORKBENCH_VERTICAL_SLICE_v0_1`  
Current Product Minimal Viable Step: `MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1` — open

## 1. Purpose and authority

This contract defines the smallest PrismEthics experience worth piloting. It translates the master product promise into an observable first journey without promoting the candidate, changing the current Product Minimal Viable Step, or claiming a deployment.

For this pilot, this document is authoritative for the visible Workbench experience. The site repository owns the interface and its site-side candidate boundary. It does not own runtime selection, runtime admission, canonical promotion, authentication proof, production persistence, provider billing authority, or Product MVS closure.

As observed on 2026-08-20:

- site draft PR #3 remains an open draft, but its form-, card-, and frame-administration direction is superseded for the pilot;
- runtime draft PR #13 remains an open draft, but its localhost bridge, provider-free behavior, hard-coded semantic claims, and unsafe attribution direction are superseded for the pilot;
- this contract does not close, merge, or otherwise dispose of either pull request.

## 2. Product promise

The person should experience one capable conversation in which the AI does the structural work. PrismEthics may route frames, compare readings, research, preserve continuity, and form or revise an artifact underneath the conversation. The person should not have to operate that machinery.

The experience should be recognizable as a conversation with a strong general AI, but better at sustaining consequential work:

- the exchange remains natural even when the internal process is exact;
- the field of the problem can stay open long enough to become intelligible;
- distinct readings can be explored without turning them into a questionnaire;
- a provisional synthesis or recommendation can emerge without pretending the inquiry is closed;
- research, drafts, notes, plans, designs, and other thought objects can grow from the exchange;
- the person can leave and return to the work without reconstructing it from scratch.

The governing design sentence is:

> Structured inside; conversational outside.

## 3. Non-negotiable experience rules

1. **Conversation is the primary surface.** The normal human action is to write or speak naturally, not fill out a schema.
2. **The AI carries the structure.** Frames, procedures, state fields, and routing are internal unless revealing one materially helps the person understand or exercise authority.
3. **No required setup ceremony.** A title, project name, mode, frame, workflow, category, or pre-flight form is never required to begin.
4. **The person stays in the driver's seat.** The system may recommend, synthesize, or continue reversible work, but it must stop at a consequential change in meaning, scope, permission, disclosure, or commitment.
5. **Plurality is prose, not administration.** When genuinely different readings matter, the system may present two or three short, natural perspectives followed by a provisional synthesis or recommendation. It must not ask the person to manage frame IDs, compare cards, or complete a decision matrix.
6. **Movement toward closure is earned.** The system should not collapse ambiguity into a verdict merely because it can produce one. It should name what remains live and make the next useful move.
7. **Research changes the work.** A research result should say what was checked, what changed, what held, and what remains uncertain, with sources when external search was used.
8. **Artifacts emerge from substance.** A note, draft, research brief, plan, design, or other work product appears only when the conversation has produced one or the person requests it. It is revised through conversation, not through a second form.
9. **Continuity is quiet and correctable.** Re-entry should restore the live question, material changes, and unfinished edges. Technical provenance remains available but does not dominate the exchange.
10. **Attribution remains honest.** The interface must never present a model inference as something the person said or decided. Model contributions, user statements, sources, and system receipts remain distinguishable.

## 4. The first page

The first Workbench viewport contains only what is needed to begin:

- a thin PrismEthics header;
- the invitation **“What are you working through?”**;
- one focused composer;
- an optional attachment control;
- a send action;
- a quiet route to recent work when recent device-local work exists.

There is no required title field, mode selector, frame picker, checklist, option grid, dashboard, or onboarding questionnaire.

After the first message, the page becomes the ongoing work surface:

- the conversation remains central;
- substantively different perspectives appear as readable passages within the response, only when useful;
- research appears as an integrated note with source links, not a research-management panel;
- an artifact appears beside or within the conversation only after it exists;
- recent work, export, deletion, and technical details remain quiet secondary controls.

## 5. Turn behavior

### 5.1 Entry

A single sentence, fragment, pasted text, or supported text attachment is sufficient to begin. The system infers a temporary working title after substance exists; the person is not required to name the work.

The first response should do useful work immediately. It may ask at most one organic question when missing information materially blocks the next move. It must not respond with a battery of fields disguised as questions.

### 5.2 Hidden structured facilitation

The candidate may internally use SRF facilitation, the Frame Library, adversarial readings, object-contact checks, typed missingness, research, or synthesis. Those operations are not automatically visible UI elements and are not claims of truth merely because they ran.

The visible response is a coherent Working Understanding: what seems to be happening, what remains uncertain, what can help now, and where the person owns a meaningful direction.

The current site slice does not yet execute the exact SRF or Frame Library owner path. Its prose perspectives, adversarial readings, and provisional synthesis are model contributions. They must not be labeled as frame runs, governed procedures, or frame receipts. A future exact integration must pass through `FrameRuntimePort`, dispatch the attested owner, and preserve the returned receipt before making any such claim.

### 5.3 Multiple readings

When one reading is adequate, the system should answer coherently without manufacturing alternatives.

When two or three materially different readings would change the work, the response may use short prose sections such as “One way to see this…” and “Another possibility…”. Each reading must illuminate a real difference. A provisional synthesis or recommendation may follow, explicitly framed as provisional and open to correction.

The person may continue in ordinary language. They are never required to select a perspective, score it, or convert it into a mode.

### 5.4 Research

The system distinguishes among:

- research was not needed for this turn;
- research was performed and sources are available;
- research would help but is held because evidence, permission, or access is missing.

When research is performed, the response includes a concise sourced note and states what the evidence changed, displaced, confirmed, or left unresolved. Research is allowed to weaken or reject the frame that nominated it.

In the current site slice, external search is provider-assisted web search. It may be presented as sourced model research, but it is not evidence that the Integrated Runtime's governed research owner executed. That owner remains held until an exact provider-neutral binding and receipt are available.

### 5.5 Artifact formation and revision

An artifact is a work product earned by the conversation, not a mandatory container. It can be created when requested or when enough substance has accumulated to make it useful. The system should explain the artifact's current purpose in ordinary language and preserve uncertainty inside it where appropriate.

Later user turns revise the artifact conversationally. The interface shows the latest coherent version and a short account of what changed; it does not require the person to copy content among fields.

### 5.6 Continuity and re-entry

For this candidate slice, the visible transcript, latest artifact, and re-entry cue may be stored in the current browser for recent-work re-entry. Browser storage is device-local convenience, not authentication, secure storage, authorized continuity, or cloud synchronization.

Provider state is not the work's memory. Each provider exchange must use `store: false`. The Workbench reconstructs a bounded, explicitly typed conversation package from product-owned browser state and sends only that package with the current turn. It must not use a provider response identifier or other provider-managed conversation chain as continuity authority.

On return, the interface restores relevance rather than inventing renewed authority. It should quietly surface:

- what changed;
- what remains live;
- a natural sentence for resuming.

The person can correct, export, or remove the local record. A deletion of browser data is not a claim that every upstream provider record has been deleted.

## 6. Candidate technical boundary

### 6.1 Preserved back-end architecture

The pilot is a thin experience slice compatible with the Buildout Planner's preserved candidate modular-monolith direction, not an ad hoc chat endpoint. D-89 (`f950b72e-52a1-4c39-a21a-feb6123d1a7d`) records a candidate decision for one initially deployable application with explicit logical boundaries:

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

`SessionRuntime` exposes product semantics rather than the internal tool graph. `FrameRuntimePort` insulates the product from historical frame APIs and binds exact governed frame execution. `ModelRuntimePort` contains provider-specific invocation and provenance. `WorkObjectStore`, `ProjectionEngine`, and `Authorization` keep source events, derived continuity, and permission to use that continuity distinct.

The admitted Integrated Runtime binding `IR-REBIND-SRF984-SKILL23-V051` is the preserved coordination direction behind the application facade. It contributes event-derived run state, permission-filtered ContextPackages, exact-owner dispatch, provenance-bearing transitions, two-phase `CONVERSATIONAL_TURN_CHECKPOINTED` / `CONVERSATIONAL_TURN_CLOSED` accounting, Quiet Intelligence (`NONE → CONTINUE → E0`), and hard Human Authority stops. It does not own Buildout MVS, semantic truth, Frame Library content, Session Logger ordering, or canonical promotion.

The admitted binding remains locked to Buildout Planner v1.52. The standalone Buildout Planner v1.53 master-vision orientation informs this contract, but it is not substituted into the Integrated Runtime without a separately reviewed rebind.

The Integrated Runtime's `HostRuntimePort` and the Buildout architecture's `ModelRuntimePort` require an explicit adapter relationship before conformance can be claimed. Likewise, a model-generated structured answer is not an exact frame procedure or receipt.

### 6.2 What this slice implements

The smallest current site candidate has four separable parts:

1. **Conversation surface:** one composer, transcript, optional prose perspectives, provider-assisted research notes, and an emergent artifact.
2. **Candidate `SessionRuntime`-shaped boundary:** validates the turn, keeps provider credentials off the client, and returns a structured presentation payload plus a quiet receipt.
3. **Stateless model contribution:** a server-side provider adapter uses `store: false` and product-owned bounded context. Provider output remains an attributable candidate contribution, not automatically authorized durable memory.
4. **Device-local re-entry:** recent work can be reopened from the same browser. There is no account, tenant boundary, cloud sync, canonical Work Object persistence, projection engine, or authorization ledger in this slice.

The provider may process or retain submitted content according to the configured provider account and product policy even when API-side response storage is disabled. The pilot must not imply that a locally stored transcript means the submitted content stayed only on the device.

### 6.3 Exact status matrix

| Object | Recorded status | Contract effect |
|---|---|---|
| D-89 modular-monolith direction | Candidate decision; architecture convergence passed unpromoted | Preserve its logical boundaries; do not claim production or canonical promotion |
| `FRAME_RUNTIME_PORT_AND_CANONICAL_APPLICATION_CONVERGENCE_v0_1` | `PASS_TO_PROTECTED_SUBSTRATE_PROOF_UNPROMOTED` | Port contracts and application-lineage disposition exist |
| Stage 1 protected substrate | `PASS_TO_STAGE2_UNPROMOTED` | Bounded source/projection, correction, revocation, isolation, and RLS semantics were proved elsewhere; this site does not implement that substrate |
| Stage 2 local continuity wire | `PASS_LOCAL_WIRE_HOLD_LIVE_MODEL`; 39/39 native tests | Reference runtime and provider adapters exist; no live-provider or product-runtime-ready claim |
| `IR-REBIND-SRF984-SKILL23-V051` | Admitted installed cross-repository binding; locked to Buildout Planner v1.52 | Preserve its coordination contracts; do not silently inject standalone Buildout Planner v1.53; no site conformance, experience-quality, production-readiness, or product-promotion claim |
| `CONVERSATIONAL_WORKBENCH_VERTICAL_SLICE_v0_1` | Immediate site implementation candidate | Interface, candidate turn boundary, stateless provider adapter, and device-local convenience only |
| `MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1` | Current Product MVS; open | This contract and slice do not replace or close it |

### 6.4 Explicit holds

This slice holds rather than promotes:

- exact Frame Library execution and frame receipts;
- the provider-neutral governed research-owner route; web search is provider-assisted only;
- canonical Work Object persistence, event admission, projection rebuilding, and authorization;
- full Integrated Runtime checkpoint/close, exact-owner, ContextPackage, receipt, and hard-stop conformance;
- authenticated ownership, tenant isolation, and cloud continuity;
- paid or governed live-provider proof;
- deployment and production readiness.

### 6.5 Current authority drift

Buildout structured authority still records `HOLD_EXTERNAL_CREDENTIAL`. Secure local server-side key setup was observed during this governed build session, so that prerequisite requires re-attestation. Key availability does not authorize a paid call, amend Buildout authority, prove the required two-session continuity loop, or close the current Product MVS.

## 7. Ten-turn pilot journey

The ten turns are an acceptance journey, not a script the UI forces on every person.

| Turn | Human move | Observable acceptance |
|---|---|---|
| 1 | Begins with one sentence or fragment | Work starts without a title, mode, frame, or form. The AI does useful work immediately. |
| 2 | Adds context in ordinary language | The response incorporates it without re-presenting internal schema. |
| 3 | Introduces a real ambiguity or tension | If materially useful, two or three distinct readings appear as prose rather than selectable cards. |
| 4 | Asks what the system recommends | A provisional synthesis or recommendation is offered with uncertainty and the live field preserved. |
| 5 | Requests evidence or reaches a factual seam | Research is sourced, or the system honestly holds and names what is missing; it says what changed. |
| 6 | Asks for a paper, note, plan, design, or draft | A substantive artifact appears without leaving the conversation for a form workflow. |
| 7 | Revises the artifact conversationally | The artifact changes coherently and the revision is briefly accounted for. |
| 8 | Challenges an assumption or asks for an adversarial reading | The response preserves a meaningful disagreement instead of forcing consensus or exposing frame administration. |
| 9 | Closes and reopens the work in the same browser | The transcript and artifact return with a faithful, natural re-entry cue. |
| 10 | Corrects something the system carried forward | The correction is honored; no model inference is mislabeled as a human statement, and the remaining work stays open where appropriate. |

## 8. Acceptance gates

### 8.1 Source and interaction gate

- zero required setup fields before the first message;
- no visible frame picker, mode selector, checklist, or option-administration flow;
- one primary composer remains usable by keyboard and touch;
- one assistant turn contains no more than three named perspectives;
- perspectives appear only when their differences could change understanding or action;
- research links identify their external sources;
- provider-assisted research is not labeled as a governed research-owner receipt;
- an artifact is absent until requested or substantively earned;
- provider failure leaves the human's message recoverable and retryable;
- recent work can be reopened, exported, and removed on the same device;
- credentials and provider authorization never enter client source or browser storage;
- provider calls use `store: false`, and no provider response chain is treated as continuity;
- no model perspective is labeled as an exact frame run or receipt.

### 8.2 Semantic gate

- the response does not convert frame execution into truth;
- the response does not force premature closure;
- the recommendation is distinguishable from fact and human decision;
- uncertainty and held research remain visible where material;
- user and model attribution remain accurate;
- continuity reflects recorded product-owned conversation state rather than fabricated or provider-owned memory.

### 8.3 Proof gate

- production build and repository tests pass;
- the server boundary is tested with a mock provider without exposing a key;
- one human completes the ten-turn journey and records where the experience felt like conversation versus homework;
- any live paid provider proof occurs only under its own explicit authorization and evidence record;
- deployment, authentication, cloud persistence, security, Product MVS closure, and canonical promotion each require separate evidence and authority.

## 9. Pilot objectives

The pilot is designed to learn:

1. whether hidden structured facilitation helps a person move without making them administer the structure;
2. whether prose perspectives and a provisional synthesis enlarge the field without overloading it;
3. whether research visibly changes the work rather than decorating an answer;
4. whether an artifact can emerge and improve through conversation;
5. whether re-entry feels faithful enough that a person can continue without reconstructing the project;
6. where the system moves too quickly toward judgment, closure, or false certainty;
7. where the interface still feels like homework, a dashboard, or a collection of boxes.

Success is not “the user completed every control.” Success is that the person can carry meaningful work through a structured conversation and wants to continue it.

## 10. Explicit non-goals

This slice does not claim:

- an authenticated or multi-user product;
- cloud synchronization or canonical Work Object persistence;
- a canonical event substrate, projection engine, or authorization ledger;
- production security, privacy, deletion, or tenant isolation;
- provider neutrality or cross-model continuation;
- automatic model routing;
- exact Frame Library execution or frame receipts;
- the Integrated Runtime's governed research-owner route;
- full Integrated Runtime conformance;
- production billing, pricing, or cost controls;
- outside-pilot readiness;
- Product MVS closure;
- canonical promotion.

## 11. Relationship to the Product MVS

`CONVERSATIONAL_WORKBENCH_PILOT_CONTRACT_v0_1` is a durable experience prerequisite. `CONVERSATIONAL_WORKBENCH_VERTICAL_SLICE_v0_1` is the immediate implementation slice governed by it. Neither replaces or closes `MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1`.

The next proof-bearing actions are:

1. implement and mechanically verify the conversational vertical slice;
2. run the ten-turn human journey and preserve failures;
3. reconcile what the pilot teaches with the explicit `SessionRuntime`, `FrameRuntimePort`, `ModelRuntimePort`/`HostRuntimePort`, Work Object, projection, authorization, and Integrated Runtime boundaries;
4. complete the current Product MVS only through its own live-provider evidence and Human Authority review;
5. add authentication, canonical persistence, correction/revocation, and cross-model continuity through later separately evidenced gates.

Tests, a branch, a pull request, a deployment, a successful conversation, Product MVS closure, and canonical promotion remain separate events.
