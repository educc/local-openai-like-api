import { resolve } from "node:path";
import process from "node:process";

export interface AppConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  os: string;
  timeoutMs?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown, key: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid config: '${key}' must be a non-empty string.`);
  }

  return value.trim();
}

export function validateConfig(value: unknown): AppConfig {
  if (!isRecord(value)) {
    throw new Error("Invalid config: expected a JSON object.");
  }

  const baseUrl = asNonEmptyString(value.baseUrl, "baseUrl").replace(/\/$/, "");
  const apiKey = asNonEmptyString(value.apiKey, "apiKey");
  const model = asNonEmptyString(value.model, "model");
  const os = asNonEmptyString(value.os, "os");

  const timeoutRaw = value.timeoutMs;
  let timeoutMs: number | undefined;

  if (timeoutRaw !== undefined) {
    if (typeof timeoutRaw !== "number" || !Number.isFinite(timeoutRaw) || timeoutRaw <= 0) {
      throw new Error("Invalid config: 'timeoutMs' must be a positive number when provided.");
    }
    timeoutMs = timeoutRaw;
  }

  return {
    baseUrl,
    apiKey,
    model,
    os,
    timeoutMs,
  };
}

export async function loadConfig(configPath = resolve(process.cwd(), "config.json")): Promise<AppConfig> {
  const file = Bun.file(configPath);
  if (!(await file.exists())) {
    throw new Error(`Missing config file at '${configPath}'.`);
  }

  let parsed: unknown;
  try {
    parsed = await file.json();
  } catch {
    throw new Error(`Failed to parse JSON from '${configPath}'.`);
  }

  return validateConfig(parsed);
}
