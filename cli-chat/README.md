# CLI Chat

A simple interactive CLI chat client for OpenAI-compatible APIs, written in TypeScript for Bun. Zero runtime dependencies.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.1
- An OpenAI-compatible API running on `http://localhost:3000` (e.g. the `bun-openai-api-like` proxy in this repo)

## Setup

```bash
cd cli-chat
bun install
```

## Usage

```bash
# Start with default model (gpt-4o)
bun start

# Start with a specific model
bun start --model claude-sonnet-4
bun start -m gemini-2.5-pro

# Point to a different API URL
API_URL=http://localhost:8080 bun start

# Set a default model via env
MODEL=o3-mini bun start
```

## Commands

Type these during a chat session:

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `/help`            | Show available commands            |
| `/clear`           | Clear conversation history         |
| `/model`           | Show current model                 |
| `/model <name>`    | Switch to a different model        |
| `/models`          | List available models from the API |
| `/system <prompt>` | Set a system prompt                |
| `/history`         | Show conversation message count    |
| `/exit` or `/quit` | Exit the chat                      |

## Environment Variables

| Variable  | Default                  | Description            |
| --------- | ------------------------ | ---------------------- |
| `API_URL` | `http://localhost:3000`  | Base URL of the API    |
| `MODEL`   | `gpt-4o`                | Default model to use   |

## Project Structure

```
cli-chat/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts       # Entry point, REPL loop
    ├── api.ts         # API client, SSE streaming
    ├── config.ts      # Constants, ANSI color helpers
    ├── history.ts     # Conversation history management
    └── commands.ts    # Slash command handler
```
