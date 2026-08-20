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

export default function Workbench() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [title, setTitle] = useState("Plurality and precision");
  const [question, setQuestion] = useState("Can a thought remain plural while becoming more precise?");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [exactText, setExactText] = useState("");
  const [missingReading, setMissingReading] = useState("");
  const [disagreementReviewed, setDisagreementReviewed] = useState(false);
  const [mutationConfirmed, setMutationConfirmed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeFields, setCloseFields] = useState({ whatShifted: "", whatRemainsLive: "", firstNextMove: "", carryForward: "" });
  const [closeConfirmed, setCloseConfirmed] = useState(false);
  const [notice, setNotice] = useState("Connecting to the local governed runtime…");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await bridgeRequest("/thought-object");
      setSnapshot(next); setOffline(false); setNotice("Local v0.3 runtime connected.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Local runtime unavailable.";
      if (message === "no Thought Object exists") {
        setSnapshot(null); setOffline(false); setNotice("Runtime connected. Begin one Thought Object.");
      } else {
        setOffline(true); setNotice("Start the localhost bridge to use the governed Workbench.");
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
    catch (error) { setNotice(error instanceof Error ? error.message : "The local operation failed."); }
    finally { setBusy(false); }
  }

  function createObject(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !question.trim()) return;
    void act("Opening governed Thought Object…", () => bridgeRequest("/thought-object", {
      method: "POST", body: JSON.stringify({ title: title.trim(), question: question.trim() }),
    }));
  }

  function reviewFrames(action: "CONFIRM_FRAME_SET" | "REQUEST_ANOTHER_FRAME" | "ADD_MISSING_READING" | "HOLD") {
    void act(action === "CONFIRM_FRAME_SET" ? "Confirming the review lenses…" : "Recording the Human frame response…", () => bridgeRequest("/thought-object/frame-set-decisions", {
      method: "POST",
      body: JSON.stringify({ action, humanInput: ["REQUEST_ANOTHER_FRAME", "ADD_MISSING_READING"].includes(action) ? missingReading.trim() : undefined }),
    }));
  }

  function decide(action: "ACCEPT_ONE" | "COMBINE" | "EDIT" | "REJECT_ALL" | "REQUEST_ANOTHER_FRAME" | "ADD_MISSING_READING" | "HOLD") {
    void act("Recording the Human decision…", () => bridgeRequest("/thought-object/decisions", {
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
    void act("Closing with Human-confirmed continuity…", () => bridgeRequest("/thought-object/close", {
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
      URL.revokeObjectURL(url); setNotice("Governed export downloaded.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Export failed."); }
    finally { setBusy(false); }
  }

  async function deleteObject() {
    if (!snapshot?.state || !window.confirm(`Delete “${snapshot.state.title}” and its local event stream?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`${BRIDGE}/thought-object`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
      setSnapshot(null); setNotice("Local Thought Object deleted.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Delete failed."); }
    finally { setBusy(false); }
  }

  const state = snapshot?.state; const proposal = snapshot?.proposal; const packet = proposal?.decision_packet;
  const mutationReady = disagreementReviewed && mutationConfirmed;
  return (
    <main className="workbench-page governed-workbench">
      <nav className="site-nav workbench-nav shell" aria-label="Workbench navigation">
        <Link className="wordmark" href="/"><span className="mark" aria-hidden="true" />PrismEthics</Link>
        <span className={`preview-pill ${offline ? "offline" : ""}`}>{offline ? "Bridge offline" : "Local v0.3 bridge"}</span>
        <Link className="text-link light" href="/">About the method <span aria-hidden="true">↗</span></Link>
      </nav>

      {!state ? (
        <section className="bridge-start shell">
          <div><p className="eyebrow"><span /> Thought Object v0.1</p><h1>Give one thought<br />a durable shape.</h1><p>This local pilot keeps claims, evidence, branches, and Human decisions in a verified event stream. The attention view is derived—not canonical truth.</p><div className="bridge-status" role="status" aria-live="polite">{notice}</div></div>
          <form className="bridge-start-form" onSubmit={createObject}>
            <div className="field-group"><label htmlFor="thought-title">Name this thought</label><input className="text-field" id="thought-title" value={title} onChange={(event) => setTitle(event.target.value)} /></div>
            <div className="field-group"><label htmlFor="thought-question">Originating question or intuition</label><textarea className="text-area compact" id="thought-question" value={question} onChange={(event) => setQuestion(event.target.value)} /></div>
            <button className="button button-primary" type="submit" disabled={busy || offline || !title.trim() || !question.trim()}>Open Thought Object <span aria-hidden="true">→</span></button>
            <p className="form-footnote">One local object only. No provider call, account, federation, or deployment.</p>
          </form>
        </section>
      ) : (
        <div className="thought-shell shell">
          <header className="thought-header">
            <div><p className="eyebrow"><span /> Derived current attention · v{state.version}</p><h1>{state.title}</h1><p className="thought-question">{state.originating_human_input}</p></div>
            <div className="runtime-card"><span className="runtime-state">{snapshot.session.status}</span><b>Event head</b><code title={state.event_head}>{shortHash(state.event_head)}</code><small>{state.event_count} events · {state.authorized_event_count} authorized change</small></div>
          </header>

          <div className="thought-actions" aria-label="Thought Object actions">
            {!proposal && state.authorized_event_count === 0 ? <button className="plain-button primary" disabled={busy} onClick={() => void act("Building provider-free Writer proposal…", () => bridgeRequest("/thought-object/proposals", { method: "POST", body: "{}" }))}>Propose with Writer Core</button> : null}
            {snapshot.session.status === "OPEN" ? <button className="plain-button" disabled={busy} onClick={() => setClosing((value) => !value)}>Close with continuity</button> : <button className="plain-button" disabled={busy} onClick={() => void act("Resuming from verified state…", () => bridgeRequest("/thought-object/resume", { method: "POST", body: "{}" }))}>Resume</button>}
            <button className="plain-button" disabled={busy} onClick={() => void exportObject()}>Export</button>
            <button className="plain-button danger" disabled={busy} onClick={() => void deleteObject()}>Delete</button>
            <span className="bridge-status" role="status" aria-live="polite">{notice}</span>
          </div>

          {closing && snapshot.session.status === "OPEN" ? (
            <form className="continuity-close" onSubmit={submitClose}>
              <div><p className="eyebrow"><span /> Continuity check-in</p><h2>What stays live when attention closes?</h2><p>Closing is a Human-confirmed handoff, not an inferred summary and not restored authority.</p></div>
              <div className="continuity-close-fields">
                {([ ["whatShifted", "What shifted"], ["whatRemainsLive", "What remains live"], ["firstNextMove", "First next move"], ["carryForward", "Carry forward unchanged"] ] as const).map(([key, label]) => <label key={key}>{label}<textarea className="text-area compact" value={closeFields[key]} onChange={(event) => setCloseFields({ ...closeFields, [key]: event.target.value })} /></label>)}
                <label className="check-line"><input type="checkbox" checked={closeConfirmed} onChange={(event) => setCloseConfirmed(event.target.checked)} /> I confirm this continuity handoff.</label>
                <button className="plain-button primary" type="submit" disabled={busy || !closeConfirmed || Object.values(closeFields).some((value) => !value.trim())}>Close this continuity</button>
              </div>
            </form>
          ) : null}

          <section className="attention-grid" aria-label="Thought Object current attention">
            <article className="attention-panel claims-panel"><div className="panel-heading"><span>Claims</span><small>typed + attributable</small></div>{state.claims.map((claim, index) => <div className="claim-row" key={claim.claim_id ?? claim.change_id ?? index}><p>{claim.text}</p><div className="tag-row"><span>{claim.origin}</span><span>{claim.endorsement}</span>{claim.epistemic_status ? <span>{claim.epistemic_status}</span> : null}</div></div>)}</article>
            <article className="attention-panel"><div className="panel-heading"><span>Evidence</span><small>{state.evidence.length} record</small></div>{state.evidence.map((item) => <div className="evidence-row" key={item.evidence_id}><b>{item.kind}</b><p>{item.description}</p><code>{item.source_ref}</code></div>)}</article>
            <article className="attention-panel branches-panel"><div className="panel-heading"><span>Preserved branches</span><small>not silently merged</small></div>{Object.values(state.branches).map((branch) => <div className="branch-row" key={branch.branch_id}><b>{branch.branch_id.replace("branch:", "")}</b><p>{branch.interpretation}</p><span>{branch.epistemic_status}</span></div>)}</article>
            <article className="attention-panel"><div className="panel-heading"><span>Open questions</span><small>remain live</small></div><ol className="question-list">{state.unresolved_questions.map((item) => <li key={item}>{item}</li>)}</ol><div className="superseded-block"><b>Recoverable superseded interpretation</b>{state.interpretations.map((item) => <p key={item.interpretation_id}>{item.text} <span>{item.status} → {item.superseded_by}</span></p>)}</div></article>
          </section>

          {proposal && !packet ? (
            <section className="frame-checkin" aria-label="Frame selection check-in">
              <div><p className="eyebrow light"><span /> Before these lenses shape the review</p><h2>{proposal.frame_set_proposal.selection_question}</h2><p>{proposal.frame_set_proposal.selection_rationale}</p></div>
              <div className="frame-proposals">{proposal.frame_set_proposal.frames.map((frame) => <article key={frame.frame_id}><b>{frame.human_facing_purpose}</b><p>{frame.selection_rationale}</p><details><summary>Evidence identity</summary><code>{frame.frame_id} · {shortHash(frame.contract_hash)}</code></details></article>)}</div>
              <div className="frame-check-actions"><button className="plain-button accept" disabled={busy} onClick={() => reviewFrames("CONFIRM_FRAME_SET")}>These fit—continue</button><button className="plain-button" disabled={busy} onClick={() => reviewFrames("HOLD")}>Hold here</button></div>
              <label htmlFor="missing-frame">A lens or reading is missing</label><textarea id="missing-frame" className="text-area compact dark-field" value={missingReading} onChange={(event) => setMissingReading(event.target.value)} placeholder="Name what the proposed set does not yet see…" />
              <div className="frame-check-actions"><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => reviewFrames("REQUEST_ANOTHER_FRAME")}>Request another lens</button><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => reviewFrames("ADD_MISSING_READING")}>Add this reading</button></div>
            </section>
          ) : null}

          {proposal && packet ? (
            <section className="decision-packet" aria-label="Frame-informed decision packet">
              <header><p className="eyebrow"><span /> Proposal evidence—not object state</p><h2>{packet.judgment_question}</h2><p>These readings disagree in ways that change the available action. None is selected or authoritative.</p></header>
              <div className="reading-grid">{packet.frame_readings.map((reading, index) => <article key={reading.frame_id}><span>Reading {index + 1}</span><h3>{reading.reading}</h3><dl><div><dt>What this reveals</dt><dd>{reading.reveals}</dd></div><div><dt>What it may obscure</dt><dd>{reading.may_obscure}</dd></div></dl><small>Procedure recorded · semantic review still pending</small></article>)}</div>
              <div className="agreement-grid"><article><b>Where the readings agree</b><ul>{packet.frame_agreement.map((item) => <li key={item}>{item}</li>)}</ul></article><article className="disagreement"><b>Where they materially disagree</b><ul>{packet.frame_disagreement.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
              <div className="packet-options"><div className="panel-heading"><span>Genuine options</span><small>No default selection</small></div>{packet.options.map((option) => <label className={`packet-option ${selectedOptions.includes(option.option_id) ? "chosen" : ""}`} key={option.option_id}><input type="checkbox" checked={selectedOptions.includes(option.option_id)} onChange={() => toggleOption(option.option_id)} /><span className="option-check" aria-hidden="true" /><span><b>{option.label}</b><p>{option.description}</p><small>Tradeoffs: {option.tradeoffs.join(" · ")}</small><small>Uncertainty: {option.uncertainty.join(" · ")}</small><details><summary>Exact proposed object change</summary><p>{option.proposed_changes[0].text}</p><code>{option.proposed_changes[0].kind}</code></details></span></label>)}</div>
              {packet.recommendation ? <aside className="non-authoritative"><b>Optional, non-authoritative recommendation</b><p>{packet.recommendation.rationale}</p></aside> : null}
              <div className="human-checks"><label className="check-line"><input type="checkbox" checked={disagreementReviewed} onChange={(event) => setDisagreementReviewed(event.target.checked)} /> I reviewed where the readings materially disagree.</label><label className="check-line"><input type="checkbox" checked={mutationConfirmed} onChange={(event) => setMutationConfirmed(event.target.checked)} /> I understand the exact durable change I am authorizing.</label></div>
              <label htmlFor="exact-human-text">Exact Human wording for combine or edit</label><textarea id="exact-human-text" className="text-area compact" value={exactText} onChange={(event) => setExactText(event.target.value)} placeholder="Required when combining or editing options…" />
              <div className="packet-actions"><button className="plain-button accept" disabled={busy || selectedOptions.length !== 1 || !mutationReady} onClick={() => decide("ACCEPT_ONE")}>Accept one</button><button className="plain-button" disabled={busy || selectedOptions.length < 2 || !exactText.trim() || !mutationReady} onClick={() => decide("COMBINE")}>Combine selected</button><button className="plain-button" disabled={busy || selectedOptions.length < 1 || !exactText.trim() || !mutationReady} onClick={() => decide("EDIT")}>Accept Human edit</button><button className="plain-button" disabled={busy} onClick={() => decide("REJECT_ALL")}>Reject all</button><button className="plain-button" disabled={busy} onClick={() => decide("HOLD")}>Hold</button></div>
              <label htmlFor="additional-reading">Request or add a missing reading</label><textarea id="additional-reading" className="text-area compact" value={missingReading} onChange={(event) => setMissingReading(event.target.value)} placeholder="What is absent from the current readings?" />
              <div className="packet-actions secondary"><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => decide("REQUEST_ANOTHER_FRAME")}>Request another lens</button><button className="plain-button" disabled={busy || !missingReading.trim()} onClick={() => decide("ADD_MISSING_READING")}>Add missing reading</button></div>
              <aside className="proposal-meta packet-provenance"><h3>Provider & provenance</h3><dl><div><dt>Provider</dt><dd>{proposal.provider.provider}</dd></div><div><dt>Model</dt><dd>{proposal.provider.model}</dd></div><div><dt>Requests</dt><dd>{proposal.provider.request_count}</dd></div><div><dt>Cost</dt><dd>${proposal.provider.cost_usd.toFixed(4)}</dd></div><div><dt>Context</dt><dd title={proposal.context_package.package_hash}>{shortHash(proposal.context_package.package_hash)}</dd></div><div><dt>Request</dt><dd title={proposal.request.request_hash}>{shortHash(proposal.request.request_hash)}</dd></div><div><dt>Result</dt><dd title={proposal.result.result_hash}>{shortHash(proposal.result.result_hash)}</dd></div></dl><p>Exact procedures validated. Semantic adequacy and wisdom are not mechanically proven.</p></aside>
            </section>
          ) : null}

          {snapshot.decisions.length ? <section className="decision-ledger" aria-label="Human decision ledger"><div className="panel-heading"><span>Human decision ledger</span><small>unselected paths remain recoverable</small></div>{snapshot.decisions.map((record, index) => <div key={`${record.stage}-${index}`}><b>{record.decision?.action ?? record.stage}</b><span>{record.effect.mutated ? `+${record.effect.authorized_event_delta} authorized event` : "no object mutation"}</span></div>)}</section> : null}
          <footer className="thought-boundary"><p>Local-only bridge · Credential value never crosses into the browser · Paid provider disabled · Product MVS {snapshot.bridge.product_mvs}</p><p>Resume restores relevance and state, never authority: {snapshot.session.resume_restores_authority ? "violated" : "preserved"}</p></footer>
        </div>
      )}
    </main>
  );
}
