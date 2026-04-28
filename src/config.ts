import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

export interface LangfuseConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

const stripQuotes = (value: string | undefined): string | undefined =>
  value?.replace(/^['"]|['"]$/g, "");

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, "");

const ConfigSchema = z.object({
  LANGFUSE_PUBLIC_KEY: z.string().min(1, "LANGFUSE_PUBLIC_KEY is required"),
  LANGFUSE_SECRET_KEY: z.string().min(1, "LANGFUSE_SECRET_KEY is required"),
  LANGFUSE_BASE_URL: z
    .string()
    .min(1, "LANGFUSE_BASE_URL is required")
    .url("LANGFUSE_BASE_URL must be a valid URL (e.g. https://cloud.langfuse.com)"),
});

function loadEnvFile(): void {
  const explicit = stripQuotes(process.env["LANGFUSE_ENV_FILE"]);
  if (explicit) {
    if (!existsSync(explicit)) {
      throw new Error(`LANGFUSE_ENV_FILE points to a missing file: ${explicit}`);
    }
    loadDotenv({ path: explicit, override: false });
    return;
  }

  const cwdEnv = resolve(process.cwd(), ".env");
  if (existsSync(cwdEnv)) {
    loadDotenv({ path: cwdEnv, override: false });
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): LangfuseConfig {
  loadEnvFile();

  const raw = {
    LANGFUSE_PUBLIC_KEY: stripQuotes(env["LANGFUSE_PUBLIC_KEY"]),
    LANGFUSE_SECRET_KEY: stripQuotes(env["LANGFUSE_SECRET_KEY"]),
    LANGFUSE_BASE_URL: stripQuotes(env["LANGFUSE_BASE_URL"]),
  };

  const parsed = ConfigSchema.safeParse(raw);
  if (!parsed.success) {
    const messages = parsed.error.issues
      .map((issue) => {
        const field = issue.path.join(".") || "(root)";
        return `  - ${field}: ${issue.message}`;
      })
      .join("\n");
    throw new Error(
      `Invalid Langfuse configuration:\n${messages}\n\nSee .env.example for the expected variables.`,
    );
  }

  return {
    publicKey: parsed.data.LANGFUSE_PUBLIC_KEY,
    secretKey: parsed.data.LANGFUSE_SECRET_KEY,
    baseUrl: trimTrailingSlash(parsed.data.LANGFUSE_BASE_URL),
  };
}
