"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "prismethics.work-objects.v1";
const MODES = ["Clarify", "Research", "Decide", "Write", "Code", "Other"] as const;

type WorkMode = (typeof MODES)[number];
type WorkStatus = "open" | "closed";

type WorkObject = {
  id: string;
  title: string;
  mode: WorkMode;
  question: string;
  known: string;
  tension: string;
  options: string;
  nextMove: string;
  continuity: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
};

function readObjects(): WorkObject[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isWorkObject);
  } catch {
    return [];
  }
}

function isWorkObject(value: unknown): value is WorkObject {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WorkObject>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.mode === "string" &&
    MODES.includes(item.mode as WorkMode) &&
    typeof item.question === "string" &&
    typeof item.known === "string" &&
    typeof item.tension === "string" &&
    typeof item.options === "string" &&
    typeof item.nextMove === "string" &&
    typeof item.continuity === "string" &&
    (item.status === "open" || item.status === "closed") &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function makeObject(title: string): WorkObject {
  const now = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `work-${Date.now()}`,
    title: title.trim(),
    mode: "Clarify",
    question: "",
    known: "",
    tension: "",
    options: "",
    nextMove: "",
    continuity: "",
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
}

function handoffText(item: WorkObject) {
  return [
    `# ${item.title}`,
    `Mode: ${item.mode}`,
    `Status: ${item.status}`,
    "",
    "## The real question",
    item.question || "—",
    "",
    "## What is known",
    item.known || "—",
    "",
    "## Tension / uncertainty",
    item.tension || "—",
    "",
    "## Options in view",
    item.options || "—",
    "",
    "## Next responsible move",
    item.nextMove || "—",
    "",
    "## Carry forward",
    item.continuity || "—",
  ].join("\n");
}

export default function Workbench() {
  const [objects, setObjects] = useState<WorkObject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readObjects();
      setObjects(stored);
      setActiveId(stored[0]?.id ?? null);
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const active = useMemo(
    () => objects.find((item) => item.id === activeId) ?? null,
    [objects, activeId],
  );

  function persist(next: WorkObject[], message: string) {
    setObjects(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function createObject(event: FormEvent) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    const item = makeObject(newTitle);
    persist([item, ...objects], "Work Object created on this device.");
    setActiveId(item.id);
    setNewTitle("");
  }

  function updateActive(patch: Partial<WorkObject>) {
    if (!active) return;
    const updated = { ...active, ...patch, updatedAt: new Date().toISOString() };
    setObjects((current) => current.map((item) => (item.id === active.id ? updated : item)));
  }

  function saveActive(message = "Saved on this device.") {
    if (!active) return;
    const updated = objects.map((item) =>
      item.id === active.id ? { ...item, updatedAt: new Date().toISOString() } : item,
    );
    persist(updated, message);
  }

  function closeOrReopen() {
    if (!active) return;
    const nextStatus: WorkStatus = active.status === "open" ? "closed" : "open";
    const updated = objects.map((item) =>
      item.id === active.id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item,
    );
    persist(updated, nextStatus === "closed" ? "Session closed. Continuity preserved." : "Work Object reopened.");
  }

  async function copyHandoff() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(handoffText(active));
      setNotice("Handoff copied.");
    } catch {
      setNotice("Copy was blocked by the browser.");
    }
  }

  function deleteActive() {
    if (!active || !window.confirm(`Remove “${active.title}” from this device?`)) return;
    const next = objects.filter((item) => item.id !== active.id);
    persist(next, "Work Object removed from this device.");
    setActiveId(next[0]?.id ?? null);
  }

  if (!ready) return <main className="workbench-page" aria-busy="true" />;

  return (
    <main className="workbench-page">
      <nav className="site-nav workbench-nav shell" aria-label="Workbench navigation">
        <Link className="wordmark" href="/"><span className="mark" aria-hidden="true" />PrismEthics</Link>
        <span className="preview-pill">Device-local preview</span>
        <Link className="text-link light" href="/">About the method <span aria-hidden="true">↗</span></Link>
      </nav>

      <div className="workbench-shell">
        <aside className="object-shelf" aria-label="Your Work Objects">
          <div className="shelf-heading">
            <h2>Continue</h2>
            <button className="icon-button" onClick={() => setActiveId(null)} aria-label="Create a new Work Object">+</button>
          </div>
          {objects.length === 0 ? (
            <p className="empty-shelf">Your Work Objects will appear here after you create one.</p>
          ) : (
            <div className="object-list">
              {objects.map((item) => (
                <button
                  className={`object-card ${item.id === activeId ? "active" : ""}`}
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                >
                  <span>{item.title}</span>
                  <small>{item.status} · {formatDate(item.updatedAt)}</small>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="work-area">
          {!active ? (
            <div className="new-object-screen">
              <p className="eyebrow"><span /> New Work Object</p>
              <h1>What needs<br />real attention?</h1>
              <p>
                Name the piece of work—not the answer you expect. You can change every field later;
                nothing here becomes immutable.
              </p>
              <form className="new-object-form" onSubmit={createObject}>
                <div className="field-group">
                  <label htmlFor="new-title">Name this work</label>
                  <input
                    className="text-field"
                    id="new-title"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="e.g. Choose a launch path"
                  />
                </div>
                <button className="button button-primary" type="submit" disabled={!newTitle.trim()}>
                  Create <span aria-hidden="true">→</span>
                </button>
              </form>
              <p className="privacy-note">
                Current boundary: saved only in this browser on this device. No model receives this content.
              </p>
            </div>
          ) : (
            <div className="work-area-inner">
              <header className="work-header">
                <div>
                  <p className="eyebrow"><span /> {active.status === "closed" ? "Continuity preserved" : "Work in progress"}</p>
                  <h1>{active.title || "Untitled work"}</h1>
                </div>
                <div>
                  <div className="work-actions">
                    <button className="plain-button" onClick={copyHandoff}>Copy handoff</button>
                    <button className="plain-button" onClick={() => saveActive()}>Save</button>
                    <button className="plain-button primary" onClick={closeOrReopen}>
                      {active.status === "open" ? "Close session" : "Reopen"}
                    </button>
                  </div>
                  <div className="status-line" aria-live="polite">{notice}</div>
                </div>
              </header>

              <form className="work-form" onSubmit={(event) => { event.preventDefault(); saveActive(); }}>
                <div className="field-group">
                  <label htmlFor="title">Work Object name</label>
                  <input className="text-field" id="title" value={active.title} onChange={(event) => updateActive({ title: event.target.value })} />
                </div>

                <fieldset className="field-group" style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="field-label">Mode</legend>
                  <p className="field-help">Choose the kind of movement this work needs right now.</p>
                  <div className="mode-grid">
                    {MODES.map((mode) => (
                      <label className="mode-choice" key={mode}>
                        <input type="radio" name="mode" value={mode} checked={active.mode === mode} onChange={() => updateActive({ mode })} />
                        <span>{mode}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="field-group">
                  <label htmlFor="question">The real question</label>
                  <p className="field-help">What are you genuinely trying to understand, choose, make, or change?</p>
                  <textarea className="text-area compact" id="question" value={active.question} onChange={(event) => updateActive({ question: event.target.value })} placeholder="The question underneath the first question…" />
                </div>

                <div className="split-fields">
                  <div className="field-group">
                    <label htmlFor="known">What is known</label>
                    <p className="field-help">Facts, constraints, commitments, and verified context.</p>
                    <textarea className="text-area" id="known" value={active.known} onChange={(event) => updateActive({ known: event.target.value })} placeholder="What you can safely build from…" />
                  </div>
                  <div className="field-group">
                    <label htmlFor="tension">Tension / uncertainty</label>
                    <p className="field-help">Unknowns, conflicts, risks, or important disagreement.</p>
                    <textarea className="text-area" id="tension" value={active.tension} onChange={(event) => updateActive({ tension: event.target.value })} placeholder="What should not be smoothed over…" />
                  </div>
                </div>

                <div className="split-fields">
                  <div className="field-group">
                    <label htmlFor="options">Options in view</label>
                    <p className="field-help">Keep meaningful alternatives alive long enough to compare them.</p>
                    <textarea className="text-area" id="options" value={active.options} onChange={(event) => updateActive({ options: event.target.value })} placeholder="Option A…\nOption B…" />
                  </div>
                  <div className="field-group">
                    <label htmlFor="next-move">Next responsible move</label>
                    <p className="field-help">The smallest action that advances the work without overstating certainty.</p>
                    <textarea className="text-area" id="next-move" value={active.nextMove} onChange={(event) => updateActive({ nextMove: event.target.value })} placeholder="The next move is…" />
                  </div>
                </div>

                <div className="field-group continuity-field">
                  <label htmlFor="continuity">Carry forward</label>
                  <p className="field-help">What changed, what remains open, and exactly where should the next session resume?</p>
                  <textarea className="text-area" id="continuity" value={active.continuity} onChange={(event) => updateActive({ continuity: event.target.value })} placeholder="Begin next time from…" />
                </div>

                <div className="work-actions">
                  <button className="plain-button primary" type="submit">Save Work Object</button>
                  <button className="plain-button danger" type="button" onClick={deleteActive}>Remove from device</button>
                </div>
                <p className="form-footnote">
                  Your authority remains visible: every field can be corrected, reopened, copied, or removed.
                  Model assistance and cloud persistence are not connected in this preview.
                </p>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
