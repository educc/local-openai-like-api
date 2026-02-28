// Constants and ANSI color helpers (zero dependencies)

export const BASE_URL = process.env.API_URL || "http://localhost:3000";
export const DEFAULT_MODEL = process.env.MODEL || "gpt-4o";

// ANSI escape codes for terminal colors
const esc = (code: string) => `\x1b[${code}m`;
const reset = esc("0");

export const c = {
  bold: (s: string) => `${esc("1")}${s}${reset}`,
  dim: (s: string) => `${esc("2")}${s}${reset}`,
  red: (s: string) => `${esc("31")}${s}${reset}`,
  green: (s: string) => `${esc("32")}${s}${reset}`,
  yellow: (s: string) => `${esc("33")}${s}${reset}`,
  blue: (s: string) => `${esc("34")}${s}${reset}`,
  magenta: (s: string) => `${esc("35")}${s}${reset}`,
  cyan: (s: string) => `${esc("36")}${s}${reset}`,
};
