export const WORKBENCH_TURN_PATH = "/api/workbench/turn";
export const WORKBENCH_CONTEXT_SCHEMA = "prismethics.workbench_context.v1";
export const SESSION_RUNTIME_CANDIDATE_ID =
  "PRISMETHICS_CONVERSATIONAL_SESSION_RUNTIME_CANDIDATE_v0_1";

export const WORKBENCH_LIMITS = {
  bodyBytes: 180_000,
  messageCharacters: 20_000,
  attachmentCount: 3,
  attachmentCharacters: 40_000,
  attachmentTotalCharacters: 80_000,
  attachmentNameCharacters: 200,
  attachmentTypeCharacters: 120,
  recentEventCount: 6,
  recentEventCharacters: 6_000,
  recentEventTotalCharacters: 24_000,
  eventTimestampCharacters: 40,
  contextArtifactCharacters: 24_000,
  contextContinuityCharacters: 3_000,
} as const;

export interface WorkbenchAttachmentInput {
  name: string;
  type?: string;
  text: string;
}

export interface WorkbenchContextEvent {
  source_kind: "HUMAN_INPUT" | "MODEL_OUTPUT";
  content: string;
  created_at: string;
}

export interface WorkbenchPerspective {
  title: string;
  text: string;
}

export interface WorkbenchSource {
  title: string;
  url: string;
}

export interface WorkbenchResearch {
  status: "not_needed" | "provider_assisted" | "held";
  note: string;
  what_changed: string;
  sources: WorkbenchSource[];
}

export interface WorkbenchArtifact {
  title: string;
  kind: "note" | "draft" | "research" | "plan" | "design";
  content: string;
  revision_note: string;
}

export interface WorkbenchContinuity {
  what_changed: string;
  what_remains_live: string;
  reentry_cue: string;
}

/**
 * Device-local convenience transport only. This is not the authority-bearing
 * ContextPackage defined by the Integrated Runtime candidate.
 */
export interface WorkbenchContextPackage {
  schema: typeof WORKBENCH_CONTEXT_SCHEMA;
  source: "DEVICE_LOCAL_CONVENIENCE";
  canonical: false;
  recent_events: WorkbenchContextEvent[];
  artifact: WorkbenchArtifact | null;
  continuity: WorkbenchContinuity | null;
}

export interface WorkbenchTurnInput {
  message: string;
  attachments?: WorkbenchAttachmentInput[];
  context_package: WorkbenchContextPackage;
}

export interface WorkbenchTurn {
  work_title: string;
  assistant_text: string;
  perspectives: WorkbenchPerspective[];
  provisional_synthesis: string | null;
  research: WorkbenchResearch | null;
  artifact: WorkbenchArtifact | null;
  continuity: WorkbenchContinuity;
}

/** Internal model declaration; every authority-bearing claim is fixed false. */
export interface WorkbenchRuntimeClaims {
  exact_frame_execution: false;
  governed_research_execution: false;
  durable_memory_authorized: false;
  canonical_projection: false;
}

export interface WorkbenchModelTurn extends WorkbenchTurn {
  runtime_claims: WorkbenchRuntimeClaims;
}

export interface WorkbenchReceipt {
  request_trace_id: string;
  provider: "openai";
  model: string;
  provider_response_id: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  } | null;
  latency_ms: number;
  prompt_hash: string;
  response_hash: string;
  provider_storage: false;
  memory_authorized: false;
  context_package_source: "DEVICE_LOCAL_CONVENIENCE";
  context_package_canonical: false;
  session_runtime_candidate_id: typeof SESSION_RUNTIME_CANDIDATE_ID;
  session_runtime_canonical: false;
  frame_runtime_status: "HELD_NOT_CONNECTED";
  frame_execution_claim: "NONE";
  research_owner_status: "HELD_UNATTESTED";
  research_execution_claim: "NONE" | "PROVIDER_ASSISTED_ONLY";
  work_object_store_status: "DEVICE_LOCAL_CONVENIENCE_ONLY";
  projection_engine_status: "HELD_NOT_CONNECTED";
  authorization_status: "HELD_NOT_CONNECTED";
}

export interface WorkbenchTurnSuccess {
  turn: WorkbenchTurn;
  receipt: WorkbenchReceipt;
}

export interface WorkbenchTurnFailure {
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

const SOURCE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    url: { type: "string" },
  },
  required: ["title", "url"],
} as const;

const FALSE_CLAIM_SCHEMA = {
  type: "boolean",
  enum: [false],
} as const;

export const WORKBENCH_TURN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    work_title: { type: "string" },
    assistant_text: { type: "string" },
    perspectives: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          text: { type: "string" },
        },
        required: ["title", "text"],
      },
    },
    provisional_synthesis: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    research: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            status: {
              type: "string",
              enum: ["not_needed", "provider_assisted", "held"],
            },
            note: { type: "string" },
            what_changed: { type: "string" },
            sources: {
              type: "array",
              items: SOURCE_SCHEMA,
            },
          },
          required: ["status", "note", "what_changed", "sources"],
        },
        { type: "null" },
      ],
    },
    artifact: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            kind: {
              type: "string",
              enum: ["note", "draft", "research", "plan", "design"],
            },
            content: { type: "string" },
            revision_note: { type: "string" },
          },
          required: ["title", "kind", "content", "revision_note"],
        },
        { type: "null" },
      ],
    },
    continuity: {
      type: "object",
      additionalProperties: false,
      properties: {
        what_changed: { type: "string" },
        what_remains_live: { type: "string" },
        reentry_cue: { type: "string" },
      },
      required: ["what_changed", "what_remains_live", "reentry_cue"],
    },
    runtime_claims: {
      type: "object",
      additionalProperties: false,
      properties: {
        exact_frame_execution: FALSE_CLAIM_SCHEMA,
        governed_research_execution: FALSE_CLAIM_SCHEMA,
        durable_memory_authorized: FALSE_CLAIM_SCHEMA,
        canonical_projection: FALSE_CLAIM_SCHEMA,
      },
      required: [
        "exact_frame_execution",
        "governed_research_execution",
        "durable_memory_authorized",
        "canonical_projection",
      ],
    },
  },
  required: [
    "work_title",
    "assistant_text",
    "perspectives",
    "provisional_synthesis",
    "research",
    "artifact",
    "continuity",
    "runtime_claims",
  ],
} as const;
