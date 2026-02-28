// CLI Chat - Main entry point

import * as readline from "node:readline/promises";
import { c, DEFAULT_MODEL, BASE_URL } from "./config";
import { History } from "./history";
import { streamChat } from "./api";
import { handleCommand } from "./commands";

// Parse CLI arguments
function parseArgs(): { model: string } {
  const args = process.argv.slice(2);
  let model = DEFAULT_MODEL;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--model" || args[i] === "-m") && args[i + 1]) {
      model = args[i + 1];
      i++;
    }
  }

  return { model };
}

async function main() {
  const { model: initialModel } = parseArgs();
  let currentModel = initialModel;
  const history = new History();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Banner
  console.log();
  console.log(c.bold("  CLI Chat"));
  console.log(c.dim("  --------"));
  console.log(c.dim(`  API:   ${BASE_URL}`));
  console.log(c.dim(`  Model: ${currentModel}`));
  console.log(c.dim(`  Type /help for commands, Ctrl+C to exit`));
  console.log();

  // Graceful shutdown
  const cleanup = () => {
    console.log(`\n${c.dim("Goodbye!")}`);
    rl.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);

  // Command context
  const ctx = {
    history,
    get model() {
      return currentModel;
    },
    setModel(m: string) {
      currentModel = m;
    },
  };

  // Main REPL loop
  while (true) {
    let input: string;
    try {
      input = await rl.question(`${c.green(c.bold("You > "))}`);
    } catch {
      // EOF or readline closed (Ctrl+D)
      cleanup();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) continue;

    // Handle slash commands
    if (trimmed.startsWith("/")) {
      const result = await handleCommand(trimmed, ctx);
      if (result.exit) {
        cleanup();
        return;
      }
      continue;
    }

    // Add user message to history
    history.addMessage("user", trimmed);

    // Stream the response
    process.stdout.write(`${c.cyan(c.bold("AI  > "))}`);

    let fullResponse = "";
    let firstToken = true;

    try {
      // Show thinking indicator
      process.stdout.write(c.dim("thinking..."));

      for await (const delta of streamChat(history.getMessages(), currentModel)) {
        if (firstToken) {
          // Clear the "thinking..." text
          process.stdout.write("\r" + " ".repeat(50) + "\r");
          process.stdout.write(`${c.cyan(c.bold("AI  > "))}`);
          firstToken = false;
        }
        process.stdout.write(delta);
        fullResponse += delta;
      }

      if (firstToken) {
        // No tokens received, clear thinking indicator
        process.stdout.write("\r" + " ".repeat(50) + "\r");
        process.stdout.write(`${c.cyan(c.bold("AI  > "))}${c.dim("(empty response)")}`);
      }

      console.log(); // Newline after response

      // Add assistant response to history
      if (fullResponse) {
        history.addMessage("assistant", fullResponse);
      }
    } catch (err) {
      // Clear thinking indicator if still showing
      if (firstToken) {
        process.stdout.write("\r" + " ".repeat(50) + "\r");
      } else {
        console.log();
      }
      console.log(
        c.red(
          `Error: ${err instanceof Error ? err.message : String(err)}`
        )
      );
      // Remove the user message since the request failed
      const msgs = history.getMessages();
      if (msgs.length > 0 && msgs[msgs.length - 1].role === "user") {
        history.clear();
        // Re-add all messages except the last one
        for (const m of msgs.slice(0, -1)) {
          if (m.role !== "system") {
            history.addMessage(m.role as "user" | "assistant", m.content);
          }
        }
      }
    }
  }
}

main().catch((err) => {
  console.error(c.red(`Fatal error: ${err instanceof Error ? err.message : String(err)}`));
  process.exit(1);
});
