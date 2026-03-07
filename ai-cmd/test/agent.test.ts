import { describe, expect, it } from "bun:test";
import { buildMessages, buildSystemPrompt, normalizeAssistantReply } from "../src/agent";

describe("agent prompts", () => {
  it("includes OS in system prompt", () => {
    const prompt = buildSystemPrompt("linux");
    expect(prompt).toContain("Target operating system: linux");
  });

  it("builds user/system messages", () => {
    const messages = buildMessages("show disk usage", "darwin");
    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe("system");
    expect(messages[1]?.content).toBe("show disk usage");
  });
});

describe("normalizeAssistantReply", () => {
  it("preserves explicit command line", () => {
    const normalized = normalizeAssistantReply("Use this.\nCommand: ls -la");
    expect(normalized.endsWith("Command: ls -la")).toBeTrue();
  });

  it("adds fallback command when missing", () => {
    const normalized = normalizeAssistantReply("List files in current directory.");
    expect(normalized).toContain("Command:");
  });
});
