import { describe, expect, it } from "bun:test";
import { parseQuestionArg } from "../src/args";

describe("parseQuestionArg", () => {
  it("accepts exactly one non-empty argument", () => {
    expect(parseQuestionArg(["how do I list files?"])).toBe("how do I list files?");
  });

  it("rejects missing argument", () => {
    expect(() => parseQuestionArg([])).toThrow("Usage");
  });

  it("rejects multiple arguments", () => {
    expect(() => parseQuestionArg(["a", "b"])).toThrow("Usage");
  });
});
