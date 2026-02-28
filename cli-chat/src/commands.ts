// Slash command handler

import { c } from "./config";
import { fetchModels } from "./api";
import type { History } from "./history";

export interface CommandContext {
  history: History;
  model: string;
  setModel: (model: string) => void;
}

interface CommandResult {
  handled: boolean;
  exit?: boolean;
}

const COMMANDS: Record<string, string> = {
  "/help": "Show this help message",
  "/clear": "Clear conversation history",
  "/model": "Show current model",
  "/model <name>": "Switch to a different model",
  "/models": "List available models from the API",
  "/system <prompt>": "Set a system prompt",
  "/history": "Show conversation history length",
  "/exit": "Exit the chat",
  "/quit": "Exit the chat",
};

export async function handleCommand(
  input: string,
  ctx: CommandContext
): Promise<CommandResult> {
  const trimmed = input.trim();
  const [cmd, ...args] = trimmed.split(/\s+/);
  const arg = args.join(" ").trim();

  switch (cmd) {
    case "/help":
      console.log(`\n${c.bold("Available commands:")}`);
      for (const [command, desc] of Object.entries(COMMANDS)) {
        console.log(`  ${c.cyan(command.padEnd(20))} ${c.dim(desc)}`);
      }
      console.log();
      return { handled: true };

    case "/clear":
      ctx.history.clear();
      console.log(c.yellow("Conversation history cleared."));
      return { handled: true };

    case "/model":
      if (arg) {
        ctx.setModel(arg);
        console.log(c.yellow(`Model switched to ${c.bold(arg)}`));
      } else {
        console.log(`Current model: ${c.bold(c.cyan(ctx.model))}`);
      }
      return { handled: true };

    case "/models":
      try {
        console.log(c.dim("Fetching models..."));
        const models = await fetchModels();
        console.log(`\n${c.bold("Available models:")}`);
        for (const m of models) {
          const marker = m === ctx.model ? c.green(" (active)") : "";
          console.log(`  ${c.cyan(m)}${marker}`);
        }
        console.log();
      } catch (err) {
        console.log(
          c.red(
            `Failed to fetch models: ${err instanceof Error ? err.message : String(err)}`
          )
        );
      }
      return { handled: true };

    case "/system":
      if (!arg) {
        console.log(c.red("Usage: /system <prompt>"));
        return { handled: true };
      }
      ctx.history.setSystemPrompt(arg);
      console.log(c.yellow("System prompt set."));
      return { handled: true };

    case "/history":
      console.log(
        c.dim(`Conversation has ${ctx.history.length} message(s) (excluding system prompt).`)
      );
      return { handled: true };

    case "/exit":
    case "/quit":
      return { handled: true, exit: true };

    default:
      console.log(
        c.red(`Unknown command: ${cmd}. Type ${c.bold("/help")} for available commands.`)
      );
      return { handled: true };
  }
}
