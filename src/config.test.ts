import { describe, it, expect, beforeEach } from "vitest";
import { loadConfig } from "./config.js";

const baseEnv = {
  LANGFUSE_PUBLIC_KEY: "pk-test",
  LANGFUSE_SECRET_KEY: "sk-test",
  LANGFUSE_BASE_URL: "https://cloud.langfuse.com",
} as const;

describe("loadConfig", () => {
  beforeEach(() => {
    delete process.env["LANGFUSE_ENV_FILE"];
    delete process.env["LANGFUSE_PUBLIC_KEY"];
    delete process.env["LANGFUSE_SECRET_KEY"];
    delete process.env["LANGFUSE_BASE_URL"];
  });

  it("returns parsed config when all variables are present and valid", () => {
    const config = loadConfig({ ...baseEnv });
    expect(config).toEqual({
      publicKey: "pk-test",
      secretKey: "sk-test",
      baseUrl: "https://cloud.langfuse.com",
    });
  });

  it("throws when LANGFUSE_PUBLIC_KEY is missing and names the missing variable", () => {
    expect(() =>
      loadConfig({
        LANGFUSE_SECRET_KEY: "sk-test",
        LANGFUSE_BASE_URL: "https://cloud.langfuse.com",
      }),
    ).toThrowError(/LANGFUSE_PUBLIC_KEY/);
  });

  it("throws when LANGFUSE_BASE_URL is not a valid URL", () => {
    expect(() =>
      loadConfig({
        ...baseEnv,
        LANGFUSE_BASE_URL: "not-a-url",
      }),
    ).toThrowError(/LANGFUSE_BASE_URL must be a full URL/);
  });

  it("strips surrounding double quotes from values", () => {
    const config = loadConfig({
      LANGFUSE_PUBLIC_KEY: '"pk-quoted"',
      LANGFUSE_SECRET_KEY: '"sk-quoted"',
      LANGFUSE_BASE_URL: '"https://cloud.langfuse.com"',
    });
    expect(config.publicKey).toBe("pk-quoted");
    expect(config.secretKey).toBe("sk-quoted");
    expect(config.baseUrl).toBe("https://cloud.langfuse.com");
  });

  it("strips surrounding single quotes from values", () => {
    const config = loadConfig({
      LANGFUSE_PUBLIC_KEY: "'pk-quoted'",
      LANGFUSE_SECRET_KEY: "'sk-quoted'",
      LANGFUSE_BASE_URL: "'https://cloud.langfuse.com'",
    });
    expect(config.publicKey).toBe("pk-quoted");
    expect(config.baseUrl).toBe("https://cloud.langfuse.com");
  });

  it("trims a trailing slash from LANGFUSE_BASE_URL", () => {
    const config = loadConfig({
      ...baseEnv,
      LANGFUSE_BASE_URL: "https://cloud.langfuse.com/",
    });
    expect(config.baseUrl).toBe("https://cloud.langfuse.com");
  });
});
