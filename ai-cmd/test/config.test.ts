import { describe, expect, it } from "bun:test";
import { validateConfig } from "../src/config";

describe("validateConfig", () => {
  it("validates required config keys", () => {
    const config = validateConfig({
      baseUrl: "http://localhost:3009/v1/",
      apiKey: "test-key",
      model: "gpt-5-mini",
      os: "darwin",
    });

    expect(config.baseUrl).toBe("http://localhost:3009/v1");
    expect(config.model).toBe("gpt-5-mini");
  });

  it("throws when required fields are missing", () => {
    expect(() =>
      validateConfig({
        apiKey: "x",
        model: "gpt-5-mini",
        os: "darwin",
      }),
    ).toThrow("baseUrl");
  });
});
