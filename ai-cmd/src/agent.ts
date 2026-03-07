import type { ChatMessage } from "./client";

const FALLBACK_COMMAND = "echo \"No safe command suggested\"";

export function buildSystemPrompt(os: string): string {
  return [
    "You are a terminal command assistant.",
    `Target operating system: ${os}.`,
    "User asks terminal-related questions.",
    "Respond simply in 1-2 short lines.",
    "Always end your response with exactly one line in this format:",
    "Command: <single terminal command>",
    "Do not include markdown code blocks.",
  ].join(" ");
}

export function buildMessages(question: string, os: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: buildSystemPrompt(os),
    },
    {
      role: "user",
      content: question,
    },
  ];
}

function inferCommand(raw: string): string {
  const commandMatch = raw.match(/(?:^|\n)\s*Command\s*:\s*(.+)\s*$/i);
  if (commandMatch?.[1]) {
    return commandMatch[1].trim();
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const likelyCommand = lines.find((line) => /[\w-]+\s+[-\w]/.test(line) || /^[\w-]+$/.test(line));
  return likelyCommand ?? FALLBACK_COMMAND;
}

export function normalizeAssistantReply(raw: string): string {
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, "")
    .trim();

  const command = inferCommand(cleaned);
  const withoutCommandLine = cleaned
    .split("\n")
    .filter((line) => !/^\s*Command\s*:/i.test(line))
    .join("\n")
    .trim();

  const concise = withoutCommandLine.length > 0 ? withoutCommandLine : "Use this command:";
  return `${concise}\nCommand: ${command}`;
}
