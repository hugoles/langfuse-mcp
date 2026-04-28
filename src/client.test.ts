import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LangfuseClient, LangfuseError } from "./client.js";

const config = {
  publicKey: "pk-test",
  secretKey: "sk-test",
  baseUrl: "https://cloud.langfuse.com",
};

const expectedAuthHeader = `Basic ${Buffer.from("pk-test:sk-test").toString("base64")}`;

interface CapturedRequest {
  url: string;
  headers: Record<string, string>;
}

function mockFetch(response: { ok: boolean; status: number; statusText?: string; body: string }): {
  fetch: ReturnType<typeof vi.fn>;
  captured: CapturedRequest[];
} {
  const captured: CapturedRequest[] = [];
  const fakeFetch = vi.fn(async (input: URL | string, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const headers = (init?.headers ?? {}) as Record<string, string>;
    captured.push({ url, headers });
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText ?? "",
      text: async () => response.body,
    } as Response;
  });
  vi.stubGlobal("fetch", fakeFetch);
  return { fetch: fakeFetch, captured };
}

describe("LangfuseClient", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the URL by concatenating baseUrl and path and sends Basic Auth + Accept JSON", async () => {
    const { captured } = mockFetch({ ok: true, status: 200, body: '{"data":[]}' });
    const client = new LangfuseClient(config);

    await client.get("/api/public/traces");

    expect(captured).toHaveLength(1);
    expect(captured[0]?.url).toBe("https://cloud.langfuse.com/api/public/traces");
    expect(captured[0]?.headers["Authorization"]).toBe(expectedAuthHeader);
    expect(captured[0]?.headers["Accept"]).toBe("application/json");
  });

  it("skips undefined, null, and empty-string query params", async () => {
    const { captured } = mockFetch({ ok: true, status: 200, body: "{}" });
    const client = new LangfuseClient(config);

    await client.get("/api/public/traces", {
      userId: "u1",
      name: undefined,
      sessionId: null,
      environment: "",
    });

    const url = new URL(captured[0]?.url ?? "");
    expect(url.searchParams.get("userId")).toBe("u1");
    expect(url.searchParams.has("name")).toBe(false);
    expect(url.searchParams.has("sessionId")).toBe(false);
    expect(url.searchParams.has("environment")).toBe(false);
  });

  it("appends array query params as repeated keys", async () => {
    const { captured } = mockFetch({ ok: true, status: 200, body: "{}" });
    const client = new LangfuseClient(config);

    await client.get("/api/public/traces", { tags: ["a", "b", "c"] });

    const url = new URL(captured[0]?.url ?? "");
    expect(url.searchParams.getAll("tags")).toEqual(["a", "b", "c"]);
  });

  it("returns parsed JSON when the response is ok", async () => {
    mockFetch({ ok: true, status: 200, body: '{"hello":"world"}' });
    const client = new LangfuseClient(config);

    const result = await client.get("/api/public/traces");

    expect(result).toEqual({ hello: "world" });
  });

  it("throws LangfuseError with status and body when the response is not ok", async () => {
    mockFetch({ ok: false, status: 401, statusText: "Unauthorized", body: "invalid key" });
    const client = new LangfuseClient(config);

    await expect(client.get("/api/public/traces")).rejects.toMatchObject({
      name: "LangfuseError",
      status: 401,
      body: "invalid key",
    });
  });

  it("throws LangfuseError when the response body is not valid JSON", async () => {
    mockFetch({ ok: true, status: 200, body: "<html>not json</html>" });
    const client = new LangfuseClient(config);

    const promise = client.get("/api/public/traces");

    await expect(promise).rejects.toBeInstanceOf(LangfuseError);
    await expect(promise).rejects.toThrowError(/non-JSON response/);
  });
});
