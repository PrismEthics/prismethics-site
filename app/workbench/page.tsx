"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";

const STORAGE_KEY = "prismethics.conversations.v2";
const MAX_ATTACHMENTS = 3;
const MAX_FILE_CHARACTERS = 40_000;
const MAX_TOTAL_CHARACTERS = 80_000;
const MAX_FILE_BYTES_BEFORE_READING = MAX_FILE_CHARACTERS * 4;
const ACCEPTED_EXTENSIONS = [".txt", ".md", ".csv", ".json"];
const MAX_CONTEXT_EVENTS = 6;
const MAX_CONTEXT_EVENT_CHARACTERS = 6_000;
const MAX_CONTEXT_TOTAL_CHARACTERS = 24_000;
const MAX_CONTEXT_ARTIFACT_CHARACTERS = 16_000;
const MAX_CONTEXT_CONTINUITY_FIELD_CHARACTERS = 3_000;

type Source = {
  title: string;
  url: string;
};

type Perspective = {
  title: string;
  text: string;
};

type ResearchNote = {
  status: "not_needed" | "provider_assisted" | "held";
  note: string;
  what_changed: string;
  sources: Source[];
};

type Artifact = {
  title: string;
  kind: "note" | "draft" | "research" | "plan" | "design";
  content: string;
  revision_note: string;
};

type Continuity = {
  what_changed: string;
  what_remains_live: string;
  reentry_cue: string;
};

type WorkbenchTurn = {
  work_title: string;
  assistant_text: string;
  perspectives: Perspective[];
  provisional_synthesis: string | null;
  research: ResearchNote | null;
  artifact: Artifact | null;
  continuity: Continuity | null;
};

type Receipt = {
  provider?: string;
  model?: string;
  provider_response_id?: string;
  request_trace_id?: string;
  latency_ms?: number;
  prompt_hash?: string;
  response_hash?: string;
  provider_storage?: false;
  memory_authorized?: false;
  research_execution_claim?: "NONE" | "PROVIDER_ASSISTED_ONLY";
  frame_runtime_status?: "HELD_NOT_CONNECTED";
  research_owner_status?: "HELD_UNATTESTED";
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
};

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  contextText?: string;
  createdAt: string;
  attachmentNames?: string[];
  turn?: WorkbenchTurn;
  receipt?: Receipt;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
  artifact: Artifact | null;
  continuity: Continuity | null;
};

type PendingAttachment = {
  id: string;
  name: string;
  type: string;
  text: string;
  characters: number;
};

type ContextEvent = {
  source_kind: "HUMAN_INPUT" | "MODEL_OUTPUT";
  content: string;
  created_at: string;
};

type DeviceContextPackage = {
  schema: "prismethics.workbench_context.v1";
  source: "DEVICE_LOCAL_CONVENIENCE";
  canonical: false;
  recent_events: ContextEvent[];
  artifact: Artifact | null;
  continuity: Continuity | null;
};

function makeId(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeConversation(): Conversation {
  const now = new Date().toISOString();
  return {
    id: makeId("conversation"),
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
    artifact: null,
    continuity: null,
  };
}

function deriveTitle(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  if (clean.length <= 64) return clean || "New conversation";
  return `${clean.slice(0, 61).trimEnd()}…`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isConversation(value: unknown): value is Conversation {
  if (!isRecord(value) || !Array.isArray(value.messages)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    value.messages.every((message) => {
      if (!isRecord(message)) return false;
      return (
        typeof message.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.text === "string" &&
        typeof message.createdAt === "string"
      );
    })
  );
}

function readConversations(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isConversation)
      .map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages,
        artifact: conversation.artifact ?? null,
        continuity: conversation.continuity ?? null,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function normalizeTurn(value: unknown): WorkbenchTurn | null {
  if (!isRecord(value) || typeof value.assistant_text !== "string") return null;

  const perspectives = Array.isArray(value.perspectives)
    ? value.perspectives.flatMap((item): Perspective[] => {
        if (!isRecord(item) || typeof item.title !== "string" || typeof item.text !== "string") return [];
        return [{ title: item.title, text: item.text }];
      })
    : [];

  let research: ResearchNote | null = null;
  if (isRecord(value.research)) {
    const sources = Array.isArray(value.research.sources)
      ? value.research.sources.flatMap((item): Source[] => {
          if (!isRecord(item) || typeof item.title !== "string" || typeof item.url !== "string") return [];
          return [{ title: item.title, url: item.url }];
        })
      : [];
    const status = value.research.status;
    if (
      (status === "not_needed" || status === "provider_assisted" || status === "held") &&
      typeof value.research.note === "string" &&
      typeof value.research.what_changed === "string"
    ) {
      research = {
        status,
        note: value.research.note,
        what_changed: value.research.what_changed,
        sources,
      };
    }
  }

  let artifact: Artifact | null = null;
  if (isRecord(value.artifact)) {
    const kind = value.artifact.kind;
    if (
      (kind === "note" || kind === "draft" || kind === "research" || kind === "plan" || kind === "design") &&
      typeof value.artifact.title === "string" &&
      typeof value.artifact.content === "string" &&
      typeof value.artifact.revision_note === "string"
    ) {
      artifact = {
        title: value.artifact.title,
        kind,
        content: value.artifact.content,
        revision_note: value.artifact.revision_note,
      };
    }
  }

  let continuity: Continuity | null = null;
  if (
    isRecord(value.continuity) &&
    typeof value.continuity.what_changed === "string" &&
    typeof value.continuity.what_remains_live === "string" &&
    typeof value.continuity.reentry_cue === "string"
  ) {
    continuity = {
      what_changed: value.continuity.what_changed,
      what_remains_live: value.continuity.what_remains_live,
      reentry_cue: value.continuity.reentry_cue,
    };
  }

  return {
    work_title: typeof value.work_title === "string" ? value.work_title : "",
    assistant_text: value.assistant_text,
    perspectives,
    provisional_synthesis:
      typeof value.provisional_synthesis === "string" ? value.provisional_synthesis : null,
    research,
    artifact,
    continuity,
  };
}

function normalizeReceipt(value: unknown): Receipt {
  if (!isRecord(value)) return {};
  const usage = isRecord(value.usage)
    ? {
        input_tokens: typeof value.usage.input_tokens === "number" ? value.usage.input_tokens : undefined,
        output_tokens: typeof value.usage.output_tokens === "number" ? value.usage.output_tokens : undefined,
        total_tokens: typeof value.usage.total_tokens === "number" ? value.usage.total_tokens : undefined,
      }
    : undefined;
  return {
    provider: typeof value.provider === "string" ? value.provider : undefined,
    model: typeof value.model === "string" ? value.model : undefined,
    provider_response_id:
      typeof value.provider_response_id === "string" ? value.provider_response_id : undefined,
    request_trace_id:
      typeof value.request_trace_id === "string" ? value.request_trace_id : undefined,
    latency_ms: typeof value.latency_ms === "number" ? value.latency_ms : undefined,
    prompt_hash: typeof value.prompt_hash === "string" ? value.prompt_hash : undefined,
    response_hash: typeof value.response_hash === "string" ? value.response_hash : undefined,
    provider_storage: value.provider_storage === false ? false : undefined,
    memory_authorized: value.memory_authorized === false ? false : undefined,
    research_execution_claim:
      value.research_execution_claim === "NONE" ||
      value.research_execution_claim === "PROVIDER_ASSISTED_ONLY"
        ? value.research_execution_claim
        : undefined,
    frame_runtime_status:
      value.frame_runtime_status === "HELD_NOT_CONNECTED"
        ? value.frame_runtime_status
        : undefined,
    research_owner_status:
      value.research_owner_status === "HELD_UNATTESTED"
        ? value.research_owner_status
        : undefined,
    usage,
  };
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(parsed);
}

function PlainText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
      ))}
    </>
  );
}

function assistantMarkdown(message: ConversationMessage) {
  const turn = message.turn;
  const lines = [message.text];
  if (turn?.perspectives.length) {
    lines.push(
      ...turn.perspectives.map((perspective) => `### ${perspective.title}\n\n${perspective.text}`),
    );
  }
  if (turn?.provisional_synthesis) {
    lines.push(`### Provisional synthesis\n\n${turn.provisional_synthesis}`);
  }
  if (turn?.research) {
    const sources = turn.research.sources.map((source) => `- [${source.title}](${source.url})`).join("\n");
    lines.push(
      `### Research note\n\n${turn.research.note}${turn.research.what_changed ? `\n\nWhat changed: ${turn.research.what_changed}` : ""}${sources ? `\n\n${sources}` : ""}`,
    );
  }
  return lines.filter(Boolean).join("\n\n");
}

function boundedHumanContext(message: string, attachments: PendingAttachment[]) {
  const material = [
    message,
    ...attachments.map((attachment) => `Attached text — ${attachment.name}:\n${attachment.text}`),
  ].join("\n\n");
  return material.slice(0, MAX_CONTEXT_EVENT_CHARACTERS);
}

function boundedContextPackage(conversation: Conversation): DeviceContextPackage {
  const reverseEvents: ContextEvent[] = [];
  let remainingCharacters = MAX_CONTEXT_TOTAL_CHARACTERS;

  for (let index = conversation.messages.length - 1; index >= 0; index -= 1) {
    if (reverseEvents.length >= MAX_CONTEXT_EVENTS || remainingCharacters <= 0) break;
    const message = conversation.messages[index];
    const sourceText =
      message.role === "user"
        ? message.contextText ?? message.text
        : assistantMarkdown(message);
    const content = sourceText.slice(
      0,
      Math.min(MAX_CONTEXT_EVENT_CHARACTERS, remainingCharacters),
    );
    if (!content) continue;
    reverseEvents.push({
      source_kind: message.role === "user" ? "HUMAN_INPUT" : "MODEL_OUTPUT",
      content,
      created_at: message.createdAt,
    });
    remainingCharacters -= content.length;
  }

  const artifact = conversation.artifact
    ? {
        ...conversation.artifact,
        title: conversation.artifact.title.slice(0, 300),
        revision_note: conversation.artifact.revision_note.slice(0, 1_000),
        content: conversation.artifact.content.slice(0, MAX_CONTEXT_ARTIFACT_CHARACTERS),
      }
    : null;
  const continuity = conversation.continuity
    ? {
        what_changed: conversation.continuity.what_changed.slice(
          0,
          MAX_CONTEXT_CONTINUITY_FIELD_CHARACTERS,
        ),
        what_remains_live: conversation.continuity.what_remains_live.slice(
          0,
          MAX_CONTEXT_CONTINUITY_FIELD_CHARACTERS,
        ),
        reentry_cue: conversation.continuity.reentry_cue.slice(
          0,
          MAX_CONTEXT_CONTINUITY_FIELD_CHARACTERS,
        ),
      }
    : null;

  return {
    schema: "prismethics.workbench_context.v1",
    source: "DEVICE_LOCAL_CONVENIENCE",
    canonical: false,
    recent_events: reverseEvents.reverse(),
    artifact,
    continuity,
  };
}

function exportConversation(conversation: Conversation) {
  const transcript = conversation.messages
    .map((message) =>
      message.role === "user"
        ? `## You\n\n${message.text}`
        : `## PrismEthics\n\n${assistantMarkdown(message)}`,
    )
    .join("\n\n");
  const artifact = conversation.artifact
    ? `\n\n# ${conversation.artifact.title}\n\n${conversation.artifact.content}`
    : "";
  const markdown = `# ${conversation.title}\n\n${transcript}${artifact}\n`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${conversation.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "prismethics-work"}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Workbench() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [resumedId, setResumedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setConversations(readConversations());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [activeId, conversations],
  );

  function commitConversation(conversation: Conversation) {
    setConversations((current) => {
      const next = [conversation, ...current.filter((item) => item.id !== conversation.id)].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function startNewConversation() {
    setActiveId(null);
    setMessage("");
    setAttachments([]);
    setNotice("");
    setResumedId(null);
    setRecentOpen(false);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }

  function openConversation(conversation: Conversation) {
    setActiveId(conversation.id);
    setRecentOpen(false);
    setResumedId(conversation.id);
    setMessage("");
    setAttachments([]);
    setNotice("");
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  async function addAttachments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const accepted: PendingAttachment[] = [];
    let totalCharacters = attachments.reduce((sum, attachment) => sum + attachment.characters, 0);

    for (const file of files) {
      if (attachments.length + accepted.length >= MAX_ATTACHMENTS) {
        setNotice(`Attach up to ${MAX_ATTACHMENTS} text files at a time.`);
        break;
      }
      const lowerName = file.name.toLowerCase();
      const supported =
        file.type.startsWith("text/") ||
        file.type === "application/json" ||
        ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
      if (!supported) {
        setNotice(`${file.name} is not a supported text file.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES_BEFORE_READING) {
        setNotice("Each attachment needs to stay under 40,000 characters.");
        continue;
      }
      try {
        const text = await file.text();
        if (text.length > MAX_FILE_CHARACTERS || totalCharacters + text.length > MAX_TOTAL_CHARACTERS) {
          setNotice("Attachments need to stay under 40,000 characters each and 80,000 characters in total.");
          continue;
        }
        accepted.push({
          id: makeId("attachment"),
          name: file.name,
          type: file.type,
          text,
          characters: text.length,
        });
        totalCharacters += text.length;
      } catch {
        setNotice(`${file.name} could not be read.`);
      }
    }

    if (accepted.length) {
      setAttachments((current) => [...current, ...accepted]);
      setNotice("");
    }
  }

  async function sendTurn(event?: FormEvent) {
    event?.preventDefault();
    const text = message.trim();
    if ((!text && attachments.length === 0) || sending) return;

    const base = active ?? makeConversation();
    const now = new Date().toISOString();
    const userText = text || "Please work with the attached material.";
    const userMessage: ConversationMessage = {
      id: makeId("message"),
      role: "user",
      text: userText,
      contextText: boundedHumanContext(userText, attachments),
      createdAt: now,
      attachmentNames: attachments.map((attachment) => attachment.name),
    };
    const optimistic: Conversation = {
      ...base,
      title: base.messages.length === 0 ? deriveTitle(userText) : base.title,
      updatedAt: now,
      messages: [...base.messages, userMessage],
    };

    setActiveId(optimistic.id);
    setResumedId(null);
    commitConversation(optimistic);
    setMessage("");
    setAttachments([]);
    setNotice("");
    setSending(true);

    try {
      const response = await fetch("/api/workbench/turn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: userText,
          attachments: attachments.map(({ name, type, text: attachmentText }) => ({
            name,
            type: type || "text/plain",
            text: attachmentText,
          })),
          context_package: boundedContextPackage(base),
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const reason =
          isRecord(body) && typeof body.error === "string"
            ? body.error
            : isRecord(body) && isRecord(body.error) && typeof body.error.message === "string"
              ? body.error.message
              : "The turn could not be completed.";
        throw new Error(reason);
      }
      if (!isRecord(body)) throw new Error("The response was not usable.");
      const turn = normalizeTurn(body.turn);
      if (!turn) throw new Error("The response was missing the conversation turn.");
      const receipt = normalizeReceipt(body.receipt);
      const assistantMessage: ConversationMessage = {
        id: makeId("message"),
        role: "assistant",
        text: turn.assistant_text,
        createdAt: new Date().toISOString(),
        turn,
        receipt,
      };
      const updated: Conversation = {
        ...optimistic,
        title: turn.work_title.trim() || optimistic.title,
        updatedAt: assistantMessage.createdAt,
        messages: [...optimistic.messages, assistantMessage],
        artifact: turn.artifact ?? optimistic.artifact,
        continuity: turn.continuity ?? optimistic.continuity,
      };
      commitConversation(updated);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The turn could not be completed.");
    } finally {
      setSending(false);
      window.requestAnimationFrame(() => composerRef.current?.focus());
    }
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void sendTurn();
    }
  }

  function deleteActive() {
    if (!active || !window.confirm("Remove this conversation from this device?")) return;
    setConversations((current) => {
      const next = current.filter((conversation) => conversation.id !== active.id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    startNewConversation();
  }

  const hasConversation = Boolean(active?.messages.length);
  const canSend = Boolean(message.trim() || attachments.length) && !sending;

  const composer = (
    <form className="conversation-composer" onSubmit={sendTurn}>
      {attachments.length > 0 && (
        <div className="attachment-list" aria-label="Attached files">
          {attachments.map((attachment) => (
            <span className="attachment-chip" key={attachment.id}>
              <span>{attachment.name}</span>
              <button type="button" onClick={() => removeAttachment(attachment.id)} aria-label={`Remove ${attachment.name}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <label className="sr-only" htmlFor="workbench-message">
        What are you working through?
      </label>
      <textarea
        ref={composerRef}
        id="workbench-message"
        rows={1}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={onComposerKeyDown}
        placeholder="Describe what you’re trying to understand, decide, make, or change…"
        disabled={sending}
      />
      <div className="composer-actions">
        <input
          ref={attachmentInputRef}
          className="sr-only"
          type="file"
          accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
          multiple
          onChange={addAttachments}
          tabIndex={-1}
        />
        <button
          className="attach-button"
          type="button"
          onClick={() => attachmentInputRef.current?.click()}
          disabled={sending || attachments.length >= MAX_ATTACHMENTS}
        >
          <span aria-hidden="true">＋</span> Attach
        </button>
        <span className="composer-hint">Enter to send · Shift + Enter for a new line</span>
        <button className="send-button" type="submit" disabled={!canSend} aria-label="Send message">
          {sending ? <span className="sending-dot" aria-hidden="true" /> : <span aria-hidden="true">↑</span>}
        </button>
      </div>
    </form>
  );

  return (
    <main className="workbench-page">
      <header className="conversation-nav">
        <Link className="wordmark" href="/" aria-label="PrismEthics home">
          <span className="mark" aria-hidden="true" />
          PrismEthics
        </Link>
        <div className="conversation-nav-actions">
          {hasConversation && (
            <button className="quiet-nav-button" type="button" onClick={startNewConversation}>
              New conversation
            </button>
          )}
          {conversations.length > 0 && (
            <button
              className="quiet-nav-button"
              type="button"
              onClick={() => setRecentOpen(true)}
              aria-expanded={recentOpen}
            >
              Recent work ({conversations.length})
            </button>
          )}
          {active && (
            <details className="conversation-menu">
              <summary aria-label="Conversation options">•••</summary>
              <div>
                <button type="button" onClick={() => exportConversation(active)}>Export as Markdown</button>
                <button className="danger" type="button" onClick={deleteActive}>Delete from this device</button>
              </div>
            </details>
          )}
        </div>
      </header>

      {recentOpen && (
        <div className="recent-layer">
          <button className="recent-backdrop" type="button" onClick={() => setRecentOpen(false)} aria-label="Close recent work" />
          <aside className="recent-panel" role="dialog" aria-modal="true" aria-labelledby="recent-heading">
            <div className="recent-heading">
              <div>
                <p>Continue</p>
                <h2 id="recent-heading">Recent work</h2>
              </div>
              <button type="button" onClick={() => setRecentOpen(false)} aria-label="Close recent work">×</button>
            </div>
            {conversations.length === 0 ? (
              <p className="recent-empty">Your conversations will wait here on this device.</p>
            ) : (
              <div className="recent-list">
                {conversations.map((conversation) => (
                  <button type="button" key={conversation.id} onClick={() => openConversation(conversation)}>
                    <span>{conversation.title}</span>
                    <small>{formatDate(conversation.updatedAt)} · {conversation.messages.length} messages</small>
                  </button>
                ))}
              </div>
            )}
            <button className="recent-new" type="button" onClick={startNewConversation}>Start a new conversation</button>
          </aside>
        </div>
      )}

      {!hasConversation ? (
        <section className="conversation-start">
          <div className="start-copy">
            <p className="conversation-kicker"><span /> A thinking partner for consequential work</p>
            <h1>What are you<br />working through?</h1>
            <p>
              Bring the question, the material, or the half-formed thought. The structure stays underneath
              the conversation while the work takes shape with you.
            </p>
          </div>
          {composer}
          <p className="conversation-boundary">
            Pilot boundary: model assistance and bounded recent context go through the configured server. This browser keeps a device-convenience copy for re-entry—not canonical continuity or account sync.
          </p>
        </section>
      ) : (
        <div className={`conversation-layout ${active?.artifact ? "with-artifact" : ""}`}>
          <section className="transcript-region" aria-label="Conversation">
            <div className="transcript">
              {resumedId === active?.id && active.continuity?.reentry_cue && (
                <div className="reentry-note">
                  <span>Picking up the thread</span>
                  <p>{active.continuity.reentry_cue}</p>
                </div>
              )}

              {active?.messages.map((item) => (
                <article className={`conversation-message ${item.role}`} key={item.id}>
                  <p className="message-speaker">{item.role === "user" ? "You" : "PrismEthics"}</p>
                  <div className="message-content">
                    <PlainText text={item.text} />
                    {item.attachmentNames?.length ? (
                      <p className="message-attachments">Attached: {item.attachmentNames.join(", ")}</p>
                    ) : null}

                    {item.turn?.perspectives.length ? (
                      <section className="perspective-passages" aria-label="Ways of seeing this">
                        {item.turn.perspectives.map((perspective) => (
                          <div className="perspective-passage" key={`${item.id}-${perspective.title}`}>
                            <h3>{perspective.title}</h3>
                            <PlainText text={perspective.text} />
                          </div>
                        ))}
                      </section>
                    ) : null}

                    {item.turn?.provisional_synthesis ? (
                      <div className="synthesis-passage">
                        <h3>Where this leaves us, provisionally</h3>
                        <PlainText text={item.turn.provisional_synthesis} />
                      </div>
                    ) : null}

                    {item.turn?.research && (item.turn.research.note || item.turn.research.sources.length > 0) ? (
                      <aside className="research-passage" aria-label="Research note">
                        <p className="research-label">Research note</p>
                        <PlainText text={item.turn.research.note} />
                        {item.turn.research.what_changed ? (
                          <p className="research-shift"><strong>What it changed:</strong> {item.turn.research.what_changed}</p>
                        ) : null}
                        {item.turn.research.sources.length > 0 ? (
                          <p className="source-line">
                            Sources:{" "}
                            {item.turn.research.sources.map((source, index) => (
                              <span key={`${source.url}-${index}`}>
                                {index > 0 ? ", " : ""}
                                <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                              </span>
                            ))}
                          </p>
                        ) : null}
                      </aside>
                    ) : null}
                  </div>
                  {item.role === "assistant" && (item.receipt?.model || item.receipt?.provider) ? (
                    <details className="turn-details">
                      <summary>Turn details</summary>
                      <p>
                        {[item.receipt.provider, item.receipt.model].filter(Boolean).join(" · ")}
                        {item.receipt.research_execution_claim === "PROVIDER_ASSISTED_ONLY"
                          ? " · Provider-assisted research"
                          : ""}
                        {typeof item.receipt.usage?.total_tokens === "number"
                          ? ` · ${item.receipt.usage.total_tokens.toLocaleString()} tokens`
                          : ""}
                        {typeof item.receipt.latency_ms === "number"
                          ? ` · ${item.receipt.latency_ms.toLocaleString()} ms`
                          : ""}
                      </p>
                    </details>
                  ) : null}
                </article>
              ))}
              {sending && (
                <div className="thinking-line" role="status">
                  <span aria-hidden="true" /> Working with that…
                </div>
              )}
              {notice && <p className="conversation-error" role="alert">{notice}</p>}
            </div>
            <div className="conversation-compose-dock">{composer}</div>
          </section>

          {active?.artifact && (
            <aside className="artifact-pane" aria-labelledby="artifact-title">
              <div className="artifact-heading">
                <p>{active.artifact.kind}</p>
                <h2 id="artifact-title">{active.artifact.title}</h2>
                {active.artifact.revision_note && <span>{active.artifact.revision_note}</span>}
              </div>
              <div className="artifact-content">
                <PlainText text={active.artifact.content} />
              </div>
              <p className="artifact-footnote">Keep talking to revise this. Nothing here is final unless you decide it is.</p>
            </aside>
          )}
        </div>
      )}
    </main>
  );
}
