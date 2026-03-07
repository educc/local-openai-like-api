import { describe, expect, it } from "bun:test";
import { createCompletion, extractTextContent, type FetchLike } from "../src/client";
import type { AppConfig } from "../src/config";

const config: AppConfig = {
  baseUrl: "http://localhost:3009/v1",
  apiKey: "test",
  model: "gpt-5-mini",
  os: "darwin",
  timeoutMs: 5000,
};

describe("extractTextContent", () => {
  it("handles string content", () => {
    expect(extractTextContent("hello")).toBe("hello");
  });

  it("handles array content", () => {
    const text = extractTextContent([{ type: "output_text", text: "hi" }]);
    expect(text).toBe("hi");
  });
});

describe("createCompletion", () => {
  it("returns message text from provider response", async () => {
    const fetchMock: FetchLike = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Use this command.\nCommand: ls" } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const output = await createCompletion(config, [{ role: "user", content: "list files" }], fetchMock);
    expect(output).toContain("Command: ls");
  });

  it("throws on non-OK response", async () => {
    const fetchMock: FetchLike = async () => new Response("boom", { status: 500 });

    expect(createCompletion(config, [{ role: "user", content: "x" }], fetchMock)).rejects.toThrow(
      "Provider request failed",
    );
  });
});
