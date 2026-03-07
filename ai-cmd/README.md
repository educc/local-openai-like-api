# Terminal Command Agent (Bun + TypeScript)

A tiny CLI agent that takes **one terminal question** and returns a short answer ending with a command line.

The app reads runtime settings from `config.json` and calls an OpenAI-compatible Chat Completions API.

## Requirements

- [Bun](https://bun.sh/) installed
- An OpenAI-compatible provider endpoint (example used here: `http://localhost:3009`)

## Project Structure

- `src/index.ts` - CLI entrypoint
- `src/args.ts` - validates one single question argument
- `src/config.ts` - loads and validates `config.json`
- `src/client.ts` - calls `POST /chat/completions`
- `src/agent.ts` - system prompt + output normalization
- `test/*.test.ts` - minimal unit tests

## Configuration

Create or edit `config.json` in the project root:

```json
{
  "baseUrl": "http://localhost:3009/v1",
  "apiKey": "local-dev-key",
  "model": "gpt-5-mini",
  "os": "darwin",
  "timeoutMs": 30000
}
```

### Config fields

- `baseUrl` (string, required): Base API URL ending in `/v1`
- `apiKey` (string, required): Bearer token used in `Authorization` header
- `model` (string, required): Model name exposed by your provider
- `os` (string, required): Target OS context for command generation (`darwin`, `linux`, `windows`)
- `timeoutMs` (number, optional): Request timeout in milliseconds (default `30000`)

## Install

```bash
bun install
```

## Usage

Pass exactly one argument (your terminal-related question):

```bash
bun run src/index.ts "how do i list files in the current directory with details?"
```

Example output:

```text
Use ls -l to show permissions, owner, size and modification time; add -a to include hidden files.
Command: ls -la
```

Notes:

- The tool rejects missing or multiple arguments.
- Output is normalized to always end with: `Command: <...>`

## Scripts

- `bun run start -- "<question>"` - run the CLI
- `bun test` - run unit tests
- `bun run typecheck` - TypeScript type check

## Run Tests

```bash
bun test
bun run typecheck
```

## Smoke Test Against Local Provider

If your provider is running at `http://localhost:3009`:

```bash
curl -sS http://localhost:3009/v1/models
bun run src/index.ts "how do i show current directory?"
```

## Error Behavior

The app exits with code `1` and prints an error message when:

- `config.json` is missing or invalid
- argument count is not exactly one
- provider request fails or times out
- provider returns an empty response
