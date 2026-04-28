import type { LangfuseConfig } from "./config.js";

export type QueryValue = string | number | boolean | null | undefined | readonly string[];
export type QueryParams = Record<string, QueryValue>;

export class LangfuseError extends Error {
  override readonly name = "LangfuseError";
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export class LangfuseClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: LangfuseConfig) {
    this.baseUrl = config.baseUrl;
    this.authHeader = `Basic ${Buffer.from(`${config.publicKey}:${config.secretKey}`).toString("base64")}`;
  }

  async get(path: string, params: QueryParams = {}): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`);

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        Accept: "application/json",
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new LangfuseError(
        `Langfuse API ${response.status} ${response.statusText}: ${text.slice(0, 500)}`,
        response.status,
        text,
      );
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new LangfuseError(
        `Langfuse API returned non-JSON response from ${url.pathname}: ${text.slice(0, 200)}`,
        response.status,
        text,
      );
    }
  }
}
