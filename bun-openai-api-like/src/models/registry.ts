// ---------------------------------------------------------------------------
// Model registry and family detection helpers
// ---------------------------------------------------------------------------

export interface ModelEntry {
  id: string;
  family: "openai" | "anthropic" | "google";
  /** Which Copilot API endpoint to use */
  apiFormat: "chat" | "responses";
}

/**
 * Known models as of writing. This list is purely informational (used by
 * GET /v1/models). The proxy handler accepts ANY model ID and uses the
 * pattern-matching helpers below to determine behaviour.
 */
export const MODEL_REGISTRY: ModelEntry[] = [
  // OpenAI — Chat Completions
  { id: "gpt-4o", family: "openai", apiFormat: "chat" },
  { id: "gpt-4o-mini", family: "openai", apiFormat: "chat" },
  { id: "gpt-4.1", family: "openai", apiFormat: "chat" },
  { id: "gpt-4.1-mini", family: "openai", apiFormat: "chat" },
  { id: "gpt-4.1-nano", family: "openai", apiFormat: "chat" },
  // OpenAI — Responses API
  { id: "gpt-5", family: "openai", apiFormat: "responses" },
  // OpenAI — Chat Completions (exception: gpt-5-mini uses chat)
  { id: "gpt-5-mini", family: "openai", apiFormat: "chat" },
  // OpenAI reasoning models
  { id: "o1", family: "openai", apiFormat: "chat" },
  { id: "o1-mini", family: "openai", apiFormat: "chat" },
  { id: "o3", family: "openai", apiFormat: "chat" },
  { id: "o3-mini", family: "openai", apiFormat: "chat" },
  { id: "o4-mini", family: "openai", apiFormat: "chat" },
  // Anthropic
  { id: "claude-3.5-sonnet", family: "anthropic", apiFormat: "chat" },
  { id: "claude-3.7-sonnet", family: "anthropic", apiFormat: "chat" },
  { id: "claude-4-sonnet", family: "anthropic", apiFormat: "chat" },
  { id: "claude-sonnet-4", family: "anthropic", apiFormat: "chat" },
  // Google
  { id: "gemini-2.0-flash", family: "google", apiFormat: "chat" },
  { id: "gemini-2.5-pro", family: "google", apiFormat: "chat" },
];

// ---------------------------------------------------------------------------
// Family detection (works for ANY model ID, not just registry entries)
// ---------------------------------------------------------------------------

export function isClaude(modelId: string): boolean {
  return modelId.includes("claude");
}

export function isOpenAI(modelId: string): boolean {
  return (
    modelId.startsWith("gpt-") ||
    modelId.startsWith("o1") ||
    modelId.startsWith("o3") ||
    modelId.startsWith("o4")
  );
}

export function isGemini(modelId: string): boolean {
  return modelId.startsWith("gemini");
}

/**
 * Should this model use the Copilot /responses endpoint instead of
 * /chat/completions?
 *
 * Rule: GPT-5 and above, EXCEPT gpt-5-mini (which uses chat).
 */
export function shouldUseCopilotResponsesApi(modelId: string): boolean {
  const match = modelId.match(/^gpt-(\d+)/);
  if (!match) return false;
  const version = parseInt(match[1], 10);
  if (version < 5) return false;
  if (modelId.startsWith("gpt-5-mini")) return false;
  return true;
}

/**
 * Detect the model family. Returns null for unknown families — the proxy
 * will still forward the request with base headers.
 */
export function detectFamily(
  modelId: string,
): "openai" | "anthropic" | "google" | null {
  if (isClaude(modelId)) return "anthropic";
  if (isOpenAI(modelId)) return "openai";
  if (isGemini(modelId)) return "google";
  return null;
}

// ---------------------------------------------------------------------------
// OpenAI-format /v1/models response
// ---------------------------------------------------------------------------

export function buildModelsResponse(): object {
  return {
    object: "list",
    data: MODEL_REGISTRY.map((m) => ({
      id: m.id,
      object: "model",
      created: 0,
      owned_by: m.family,
    })),
  };
}
