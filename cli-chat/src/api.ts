// API client with SSE streaming support

import { BASE_URL } from "./config";
import type { Message } from "./history";

interface ModelEntry {
  id: string;
  owned_by: string;
}

interface ModelsResponse {
  data: ModelEntry[];
}

interface ChatCompletionChunk {
  id: string;
  object: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

/** Fetch available models from the API */
export async function fetchModels(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/v1/models`);
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as ModelsResponse;
  return data.data.map((m) => m.id).sort();
}

/** Stream a chat completion, yielding content deltas as they arrive */
export async function* streamChat(
  messages: Message[],
  model: string
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    let errorMsg = `API error: ${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) {
        errorMsg = body.error.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  if (!res.body) {
    throw new Error("Response body is null");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines
    const lines = buffer.split("\n");
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith(":")) {
        // Empty line or SSE comment, skip
        continue;
      }

      if (!trimmed.startsWith("data: ")) {
        continue;
      }

      const data = trimmed.slice(6); // Remove "data: " prefix

      if (data === "[DONE]") {
        return;
      }

      try {
        const chunk = JSON.parse(data) as ChatCompletionChunk;
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          yield content;
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }
}
