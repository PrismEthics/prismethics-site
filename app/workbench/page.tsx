"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

const BRIDGE = "http://127.0.0.1:8765/api";

type Claim = { claim_id?: string; change_id?: string; text: string; epistemic_status?: string; origin: string; endorsement: string };
type Branch = { branch_id: string; interpretation: string; epistemic_status: string; origin: string };
type ThoughtState = {
  object_id: string; title: string; version: number; originating_human_input: string; claims: Claim[];
  evidence: Array<{ evidence_id: string; description: string; kind: string; source_ref: string }>;
  interpretations: Array<{ interpretation_id: string; text: string; status: string; superseded_by: string | null; origin: string }>;
  unresolved_questions: string[]; branches: Record<string, Branch>; authorized_event_count: number;
  event_count: number; event_head: string; state_hash: string; authority_restored_by_reentry: boolean;
};
type ProposedFrame = {
  frame_id: string; internal_name: string; human_facing_purpose: string; selection_rationale: string;
  source_ref: string; contract_hash: string;
};
type FrameSetProposal = {
  selection_question: string; selection_rationale: string; status: string; frames: ProposedFrame[];
};
type PacketOption = {
  option_id: string; label: string; description: string; tradeoffs: string[]; uncertainty: string[];
  proposed_changes: Array<{ change_id: string; kind: string; text: string; reason: string }>;
  selected: false; authoritative: false;
};
type DecisionPacket = {
  judgment_question: string;
  frame_readings: Array<{ frame_id: string; reading: string; reveals: string; may_obscure: string; execution_claim: string }>;
  frame_agreement: string[]; frame_disagreement: string[]; material_disagreement: boolean; options: PacketOption[];
  authoritative_preselection: null; recommendation: { option_id: string; rationale: string; authoritative: false } | null;
  proof_boundary: { procedure_receipts_validated: boolean; semantic_review: string; wisdom_proven: false; mutation_authority: false };
};
type Proposal = {
  result: {
    artifact_text: string; change_set: Array<{ change_id: string; kind: string; reason: string }>;
    claim_labels: Array<{ label: string; text: string; source_ref: string | null }>;
    uncertainty: string[]; hard_gate_findings: Array<{ gate_id: string; status: string; evidence: string }>;
    result_hash: string; contribution_authority: string;
  };
  request: { request_hash: string }; context_package: { package_hash: string };
  provider: { provider: string; model: string; request_count: number; cost_usd: number };
  frame_set_proposal: FrameSetProposal; decision_packet: DecisionPacket | null;
};
type DecisionRecord = {
  stage: string; decision?: { action?: string }; effect: { mutated: boolean; authorized_event_delta: number };
};
type Snapshot = {
  bridge: { binding: string; provider_credential_server_side: boolean; provider_credential_present: boolean; paid_provider_enabled: boolean; product_mvs: string };
  state: ThoughtState | null; proposal: Proposal | null; decisions: DecisionRecord[];
  session: { status: "OPEN" | "CLOSED"; resume_restores_authority: boolean; state_hash: string | null };
};

async function bridgeRequest(path: string, init?: RequestInit): Promise<Snapshot> {
  const response = await fetch(`${BRIDGE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Bridge returned ${response.status}` }));
    throw new Error(error.message ?? `Bridge returned ${response.status}`);
  }
  return response.json();
}

function shortHash(value: string) { return `${value.slice(0, 10)}…${value.slice(-8)}`; }

function plainRecordLabel(value: string) {
  return ({
    HUMAN: "From you",
    HUMAN_ORIGIN: "Your starting point",
    HUMAN_INTUITION: "Starting intuition",
    MODEL_SUGGESTION: "Suggested by the writing helper",
    HUMAN_ENDORSED: "Approved by you",
    NOT_ENDORSED: "Not accepted",
    HUMAN_COMBINATION: "Combined by you",
    HUMAN_EDIT: "Edited by you",
    CANDIDATE_INTERPRETATION: "Still being considered",
    SUPERSEDED: "Earlier view",
    OPEN: "In progress",
    CLOSED: "Closed",
    HUMAN_STATEMENT: "Something you said",
  } as Record<string, string>)[value] ?? value.replaceAll("_", " ").toLowerCase();
}

function decisionLabel(value: string) {
  return ({
    CONFIRM_FRAME_SET: "You confirmed these viewpoints",
    HOLD: "You chose to pause",
    REJECT_ALL: "You rejected every option",
    ACCEPT_ONE: "You accepted one option",
    COMBINE: "You combined options in your own words",
    EDIT: "You used your edited wording",
    REQUEST_ANOTHER_FRAME: "You asked for another viewpoint",
    ADD_MISSING_READING: "You added a missing reading",
  } as Record<string, string>)[value] ?? plainRecordLabel(value);
}

function plainError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/corrupt|hash|integrity|reconstruct/i.test(message)) return "The saved thought failed its integrity check. Nothing was changed. Stop here and inspect the technical record.";
  if (/selected option|accept one requires/i.test(message)) return "Choose one of the options shown.";
  if (/combine requires/i.test(message)) return "Choose at least two options to combine.";
  if (/check.?ins|durable mutation/i.test(message)) return "Before saving a change, review where the readings differ and confirm the exact wording.";
  return "That could not be completed. Nothing in the saved thought was changed.";
}

function isProviderFree(proposal: Proposal) {
  return proposal.provider.provider === "deterministic-provider-free"
    && proposal.provider.request_count === 0
    && proposal.provider.cost_usd === 0;
}

function proposalBoundary(proposal: Proposal) {
  if (isProviderFree(proposal)) return "This proposal was made without an outside AI service. You still decide whether to use it.";
  return `This proposal records ${proposal.provider.request_count} outside AI ${proposal.provider.request_count === 1 ? "call" : "calls"} through ${proposal.provider.provider}. Review the provider, model, and cost below.`;
}

export default function Workbench() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [exactText, setExactText] = useState("");
  const [missingReading, setMissingReading] = useState("");
  const [disagreementReviewed, setDisagreementReviewed] = useState(false);
  const [mutationConfirmed, setMutationConfirmed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeFields, setCloseFields] = useState({ whatShifted: "", whatRemainsLive: "", firstNextMove: "", carryForward: "" });
  const [closeConfirmed, setCloseConfirmed] = useState(false);
  const [notice, setNotice] = useState("Opening the Workbench…");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await bridgeRequest("/thought-object");
      setSnapshot(next); setOffline(false); setNotice("Ready.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Workbench unavailable.";
      if (message === "no Thought Object exists") {
        setSnapshot(null); setOffline(false); setNotice("Ready. Begin with one thought.");
      } else {
        setOffline(true); setNotice("The Workbench is not connected. Please ask the pilot facilitator to reconnect it.");
      }
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  async function act(label: string, action: () => Promise<Snapshot>) {
    setBusy(true); setNotice(label);
    try { const next = await action(); setSnapshot(next); setOffline(false); setNotice(label.replace("…", ".")); }
    catch (error) { setNotice(plainError(error)); }
    finally { setBusy(false); }
  }

  function createObject(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !question.trim()) return;
    void act("Opening this thought…", () => bridgeRequest("/thought-object", {
      method: "POST", body: JSON.stringify({ title: title.trim(), question: question.trim() }),
    }));
  }

  function reviewFrames(action: "CONFIRM_FRAME_SET" | "REQUEST_ANOTHER_FRAME" | "ADD_MISSING_READING" | "HOLD") {
    void act(action === "CONFIRM_FRAME_SET" ? "Using these viewpoints…" : "Saving your response…", () => bridgeRequest("/thought-object/frame-set-decisions", {
      method: "POST",
      body: JSON.stringify({ action, humanInput: ["REQUEST_ANOTHER_FRAME", "ADD_MISSING_READING"].includes(action) ? missingReading.trim() : undefined }),
    }));
  }

  function decide(action: "ACCEPT_ONE" | "COMBINE" | "EDIT" | "REJECT_ALL" | "REQUEST_ANOTHER_FRAME" | "ADD_MISSING_READING" | "HOLD") {
    void act("Saving your decision…", () => bridgeRequest("/thought-object/decisions", {
      method: "POST",
      body: JSON.stringify({
        action,
        selectedOptionIds: ["ACCEPT_ONE", "COMBINE", "EDIT"].includes(action) ? selectedOptions : undefined,
        authorizedText: ["COMBINE", "EDIT"].includes(action) ? exactText.trim() : undefined,
        humanAddedReading: ["REQUEST_ANOTHER_FRAME", "ADD_MISSING_READING"].includes(action) ? missingReading.trim() : undefined,
        checkIns: ["ACCEPT_ONE", "COMBINE", "EDIT"].includes(action) ? {
          frame_selection_confirmed: true,
          disagreement_reviewed: disagreementReviewed,
          durable_mutation_confirmed: mutationConfirmed,
        } : undefined,
      }),
    }));
  }

  function submitClose(event: FormEvent) {
    event.preventDefault();
    void act("Saving your closing note…", () => bridgeRequest("/thought-object/close", {
      method: "POST", body: JSON.stringify({ ...closeFields, humanConfirmed: closeConfirmed }),
    }));
  }

  function toggleOption(optionId: string) {
    setSelectedOptions((current) => current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]);
  }

  async function exportObject() {
    setBusy(true);
    try {
      const response = await fetch(`${BRIDGE}/thought-object/export`, { cache: "no-store" });
      if (!response.ok) throw new Error("Export failed.");
      const blob = await response.blob(); const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "thought-object-export.json"; anchor.click();
      URL.revokeObjectURL(url); setNotice("A copy was downloaded.");
    } catch (error) { setNotice(plainError(error)); }
    finally { setBusy(false); }
  }

  async function deleteObject() {
    if (!snapshot?.state || !window.confirm(`Delete “${snapshot.state.title}” and its saved history?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`${BRIDGE}/thought-object`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
      setSnapshot(null); setNotice("The saved copy was deleted.");
    } catch (error) { setNotice(plainError(error)); }
    finally { setBusy(false); }
  }

  const state = snapshot?.state; const proposal = snapshot?.proposal; const packet = proposal?.decision_packet;
  const mutationReady = disagreementReviewed && mutationConfirmed;
  return (
    <main className="workbench-page governed-workbench">
      <nav className="site-nav workbench-nav shell" aria-label="Workbench navigation">
        <Link className="wordmark" href="/"><span className="mark" aria-hidden="true" />PrismEthics</Link>
        <span className={`preview-pill ${offline ? "offline" : ""}`}>{offline ? "Not connected" : state ? "Thought saved" : "Workbench ready"}</span>
        {/* A full navigation keeps the cross-page method anchor reliable in the local preview. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="text-link light" href="/#method">About the method <span aria-hidden="true">↗</span></a>
      </nav>

      {!state ? (
        <section className="bridge-start shell">
          <div><p className="eyebrow"><span /> One thought at a time</p><h1>Give one thought<br />a durable shape.</h1><p>This pilot keeps the parts of a developing thought—what you believe, what supports it, the questions still open, and the paths you have not chosen. The main view shows where the thought stands now; it is not a final verdict.</p><div className="bridge-status" role="status" aria-live="polite">{notice}</div></div>
          <form className="bridge-start-form" onSubmit={createObject}>
            <div className="field-group"><label htmlFor="thought-title">Name this thought</label><input className="text-field" id="thought-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this thought a short name" /></div>
            <div className="field-group"><label htmlFor="thought-question">What do you want to think through?</label><p className="field-help" id="thought-question-help">Write a question, tension, or half-formed thought. It does not need to be polished.</p><textarea aria-describedby="thought-question-help" className="text-area compact writing-field" id="thought-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Start with what is on your mind…" /></div>
            <button className="button button-primary" type="submit" disabled={busy || offline || !title.trim() || !question.trim()}>Open this thought <span aria-hidden="true">→</span></button>
            <p className="form-footnote">Before you begin, the pilot should tell you where your writing is stored and whether an outside AI service is used.</p>
          </form>
        </section>
      ) : (
        <div className="thought-shell shell">
          <header className="thought-header">
            <div><p className="eyebrow"><span /> Where this thought stands now · version {state.version}</p><h1>{state.title}</h1><p className="thought-question">{state.originating_human_input}</p></div>
            <div className="runtime-card"><span className="runtime-state" title={snapshot.session.status}>{plainRecordLabel(snapshot.session.status)}</span><b>Saved</b><strong>{state.event_count} saved steps</strong><small>{state.authorized_event_count} {state.authorized_event_count === 1 ? "change" : "changes"} approved by you</small><details><summary>Technical record</summary><code title={state.event_head}>{shortHash(state.event_head)}</code></details></div>
          </header>

          <div className="thought-actions" aria-label="Thought Object actions">
            {!proposal && state.authorized_event_count === 0 ? <button className="plain-button primary" disabled={busy} onClick={() => void act("Preparing a writing proposal…", () => bridgeRequest("/thought-object/proposals", { method: "POST", body: "{}" }))}>Ask for a writing proposal</button> : null}
            {snapshot.session.status === "OPEN" ? <button className="plain-button" disabled={busy} onClick={() => setClosing((value) => !value)}>Prepare to close</button> : <button className="plain-button" disabled={busy} onClick={() => void act("Reopening the saved thought…", () => bridgeRequest("/thought-object/resume", { method: "POST", body: "{}" }))}>Reopen</button>}
            <button className="plain-button" disabled={busy} onClick={() => void exportObject()}>Export</button>
            <button className="plain-button danger" disabled={busy} onClick={() => void deleteObject()}>Delete</button>
            <span className="bridge-status" role="status" aria-live="polite">{notice}</span>
          </div>

          {closing && snapshot.session.status === "OPEN" ? (
            <form className="continuity-close" onSubmit={submitClose}>
              <div><p className="eyebrow"><span /> A clear place to return</p><h2>What should be waiting when you come back?</h2><p>Write, in your own words, where the thought now stands. Nothing is inferred for you, and reopening it later does not give the system permission to change it.</p></div>
              <div className="continuity-close-fields">
                {([ ["whatShifted", "What changed"], ["whatRemainsLive", "What is still open"], ["firstNextMove", "First next step"], ["carryForward", "Keep unchanged"] ] as const).map(([key, label]) => <label key={key}>{label}<textarea className="text-area compact" value={closeFields[key]} onChange={(event) => setCloseFields({ ...closeFields, [key]: event.target.value })} /></label>)}
                <label className="check-line"><input type="checkbox" checked={closeConfirmed} onChange={(event) => setCloseConfirmed(event.target.checked)} /> This is the account I want to carry forward.</label>
                <button className="plain-button primary" type="submit" disabled={busy || !closeConfirmed || Object.values(closeFields).some((value) => !value.trim())}>Save and close</button>
              </div>
            </form>
          ) : null}

          <section className="attention-grid" aria-label="Thought Object current attention">
            <article className="attention-panel claims-panel"><div className="panel-heading"><span>What the thought says</span><small>source and status kept clear</small></div>{state.claims.map((claim, index) => <div className="claim-row" key={claim.claim_id ?? claim.change_id ?? index}><p>{claim.text}</p><div className="tag-row"><span title={claim.origin}>{plainRecordLabel(claim.origin)}</span><span title={claim.endorsement}>{plainRecordLabel(claim.endorsement)}</span>{claim.epistemic_status ? <span title={claim.epistemic_status}>{plainRecordLabel(claim.epistemic_status)}</span> : null}</div></div>)}</article>
            <article className="attention-panel"><div className="panel-heading"><span>What supports it</span><small>{state.evidence.length} {state.evidence.length === 1 ? "record" : "records"}</small></div>{state.evidence.map((item) => <div className="evidence-row" key={item.evidence_id}><b>{plainRecordLabel(item.kind)}</b><p>{item.description}</p><details><summary>Source record</summary><code>{item.source_ref}</code></details></div>)}</article>
            <article className="attention-panel branches-panel"><div className="panel-heading"><span>Different readings still in view</span><small>kept separate</small></div>{Object.values(state.branches).map((branch) => <div className="branch-row" key={branch.branch_id}><b>{branch.branch_id.replace("branch:", "")}</b><p>{branch.interpretation}</p><span title={branch.epistemic_status}>{plainRecordLabel(branch.epistemic_status)}</span></div>)}</article>
            <article className="attention-panel"><div className="panel-heading"><span>Questions still open</span><small>kept in view</small></div><ol className="question-list">{state.unresolved_questions.map((item) => <li key={item}>{item}</li>)}</ol><div className="superseded-block"><b>Earlier reading, kept for context</b>{state.interpretations.map((item) => <p key={item.interpretation_id}>{item.text} <span title={`${item.status} → ${item.superseded_by}`}>{plainRecordLabel(item.status)}</span></p>)}</div></article>
          </section>

          {proposal && !packet && state.authorized_event_count === 0 ? (
            <section className="frame-checkin" aria-label="Frame selection check-in">
              <div><p className="eyebrow light"><span /> Before these viewpoints guide the review</p><h2>{proposal.frame_set_proposal.selection_question}</h2><p>{proposal.frame_set_proposal.selection_rationale}</p></div>
              <div className="frame-proposals">{proposal.frame_set_proposal.frames.map((frame) => <article key={frame.frame_id}><b>{frame.human_facing_purpose}</b><p>{frame.selection_rationale}</p><details><summary>Technical record</summary><code>{frame.frame_id} · {shortHash(frame.contract_hash)}</code></details></article>)}</div>
              <div className="frame-check-actions"><button className="plain-button accept" disabled={busy} onClick={() => reviewFrames("CONFIRM_FRAME_SET")}>These fit—continue</button><button className="plain-button" disabled={busy} onClick={() => reviewFrames("HOLD")}>Hold here</button></div>
              <label htmlFor="missing-frame">A viewpoint or reading is missing</label><textarea id="missing-frame" className="text-area compact dark-field" value={missingReading} onChange={(event) => setMissingReading(event.target.value)} placeholder="Name what the proposed set does not yet see…" />
              <div className="frame-check-actions"><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => reviewFrames("REQUEST_ANOTHER_FRAME")}>Ask for another viewpoint</button><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => reviewFrames("ADD_MISSING_READING")}>Add this reading</button></div>
            </section>
          ) : null}

          {proposal && packet && state.authorized_event_count === 0 ? (
            <section className="decision-packet" aria-label="Frame-informed decision packet">
              <header><p className="eyebrow"><span /> For your review—not yet part of the thought</p><h2>{packet.judgment_question}</h2><p>These readings lead in different directions. Nothing has been chosen for you.</p></header>
              <div className="reading-grid">{packet.frame_readings.map((reading, index) => <article key={reading.frame_id}><span>Reading {index + 1}</span><h3>{reading.reading}</h3><dl><div><dt>What this reveals</dt><dd>{reading.reveals}</dd></div><div><dt>What it may obscure</dt><dd>{reading.may_obscure}</dd></div></dl><small>The steps behind this reading are recorded. You still decide whether it makes sense.</small></article>)}</div>
              <div className="agreement-grid"><article><b>Where the readings agree</b><ul>{packet.frame_agreement.map((item) => <li key={item}>{item}</li>)}</ul></article><article className="disagreement"><b>Where they lead in different directions</b><ul>{packet.frame_disagreement.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
              <div className="packet-options"><div className="panel-heading"><span>Ways forward</span><small>Nothing chosen for you</small></div>{packet.options.map((option) => <label className={`packet-option ${selectedOptions.includes(option.option_id) ? "chosen" : ""}`} key={option.option_id}><input aria-label={option.label} type="checkbox" checked={selectedOptions.includes(option.option_id)} onChange={() => toggleOption(option.option_id)} /><span className="option-check" aria-hidden="true" /><span><b>{option.label}</b><p>{option.description}</p><small>Tradeoffs: {option.tradeoffs.join(" · ")}</small><small>Uncertainty: {option.uncertainty.join(" · ")}</small><details><summary>What would be added to the thought</summary><p>{option.proposed_changes[0].text}</p><code>{plainRecordLabel(option.proposed_changes[0].kind)}</code></details></span></label>)}</div>
              {packet.recommendation ? <aside className="non-authoritative"><b>A suggestion, not a decision</b><p>{packet.recommendation.rationale}</p></aside> : null}
              <div className="human-checks"><label className="check-line"><input type="checkbox" checked={disagreementReviewed} onChange={(event) => setDisagreementReviewed(event.target.checked)} /> I have looked at where these readings lead differently.</label><label className="check-line"><input type="checkbox" checked={mutationConfirmed} onChange={(event) => setMutationConfirmed(event.target.checked)} /> I understand the exact wording that will be saved.</label></div>
              <label htmlFor="exact-human-text">Your exact wording for a combination or edit</label><textarea id="exact-human-text" className="text-area compact writing-field" value={exactText} onChange={(event) => setExactText(event.target.value)} placeholder="Write the exact words you want saved…" />
              <div className="packet-actions"><button className="plain-button accept" disabled={busy || selectedOptions.length !== 1 || !mutationReady} onClick={() => decide("ACCEPT_ONE")}>Accept one</button><button className="plain-button" disabled={busy || selectedOptions.length < 2 || !exactText.trim() || !mutationReady} onClick={() => decide("COMBINE")}>Combine selected</button><button className="plain-button" disabled={busy || selectedOptions.length < 1 || !exactText.trim() || !mutationReady} onClick={() => decide("EDIT")}>Use my edited wording</button><button className="plain-button" disabled={busy} onClick={() => decide("REJECT_ALL")}>Reject all</button><button className="plain-button" disabled={busy} onClick={() => decide("HOLD")}>Hold</button></div>
              <label htmlFor="additional-reading">Request or add a missing reading</label><textarea id="additional-reading" className="text-area compact" value={missingReading} onChange={(event) => setMissingReading(event.target.value)} placeholder="What is absent from the current readings?" />
              <div className="packet-actions secondary"><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => decide("REQUEST_ANOTHER_FRAME")}>Ask for another viewpoint</button><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => decide("ADD_MISSING_READING")}>Add missing reading</button></div>
              <aside className="proposal-meta packet-provenance"><h3>How this proposal was made</h3><p>{proposalBoundary(proposal)}</p><dl><div><dt>Outside service</dt><dd>{isProviderFree(proposal) ? "None" : proposal.provider.provider}</dd></div><div><dt>Model</dt><dd>{proposal.provider.model === "none" ? "None" : proposal.provider.model}</dd></div><div><dt>AI calls</dt><dd>{proposal.provider.request_count}</dd></div><div><dt>Cost</dt><dd>${proposal.provider.cost_usd.toFixed(4)}</dd></div></dl><details><summary>Technical record</summary><dl><div><dt>Input record</dt><dd title={proposal.context_package.package_hash}>{shortHash(proposal.context_package.package_hash)}</dd></div><div><dt>Proposal request</dt><dd title={proposal.request.request_hash}>{shortHash(proposal.request.request_hash)}</dd></div><div><dt>Proposal record</dt><dd title={proposal.result.result_hash}>{shortHash(proposal.result.result_hash)}</dd></div></dl></details><p>The steps are recorded. You still decide whether the proposal makes sense.</p></aside>
            </section>
          ) : null}

          {snapshot.decisions.length ? <section className="decision-ledger" aria-label="Your decisions"><div className="panel-heading"><span>Your decisions</span><small>Other paths stay available in the history</small></div>{snapshot.decisions.map((record, index) => <div key={`${record.stage}-${index}`}><b>{decisionLabel(record.decision?.action ?? record.stage)}</b><span>{record.effect.mutated ? `${record.effect.authorized_event_delta} approved ${record.effect.authorized_event_delta === 1 ? "change" : "changes"} saved` : "Nothing changed in the thought"}</span></div>)}</section> : null}

          <footer className="thought-boundary"><p>{snapshot.bridge.paid_provider_enabled ? "Provider details are shown with each proposal" : "This test setup does not use an outside AI service"}</p><p>Reopening brings back the saved thought, not permission to change it.</p><details><summary>Technical status</summary><p>Current owner-pilot setup: localhost bridge · Provider credential remains server-side · Paid provider {snapshot.bridge.paid_provider_enabled ? "enabled" : "disabled"} · Product MVS {snapshot.bridge.product_mvs} · Authority restored by re-entry: {snapshot.session.resume_restores_authority ? "yes" : "no"}</p></details></footer>
        </div>
      )}
    </main>
  );
}
