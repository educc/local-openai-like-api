import { parseQuestionArg } from "./args";
import { buildMessages, normalizeAssistantReply } from "./agent";
import { createCompletion } from "./client";
import { loadConfig } from "./config";
import process from "node:process";

export async function run(argv: string[]): Promise<string> {
  const question = parseQuestionArg(argv);
  const config = await loadConfig();
  const messages = buildMessages(question, config.os);
  const raw = await createCompletion(config, messages);
  return normalizeAssistantReply(raw);
}

if (import.meta.main) {
  try {
    const output = await run(process.argv.slice(2));
    console.log(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
