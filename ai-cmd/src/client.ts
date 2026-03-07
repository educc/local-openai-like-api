import type { AppConfig } from "./config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

export function extractTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
  }

  return "";
}

export async function createCompletion(
  config: AppConfig,
  messages: ChatMessage[],
  fetchImpl: FetchLike = fetch,
): Promise<string> {
  const url = `${config.baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? 30_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0,
        messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Provider request failed (${response.status}): ${body}`);
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const messageContent = payload.choices?.[0]?.message?.content;
    const text = extractTextContent(messageContent).trim();

    if (!text) {
      throw new Error("Provider returned an empty response.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
