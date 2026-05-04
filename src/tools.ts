import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LangfuseClient } from "./client.js";
import { paginationShape, timeRangeShape } from "./schemas.js";

const asJson = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

const enc = encodeURIComponent;

export function registerTools(server: McpServer, client: LangfuseClient): void {
  // ---------- Traces ----------
  server.registerTool(
    "listTraces",
    {
      title: "List traces",
      description:
        "List Langfuse traces with filters. Returns summary metadata (use getTrace for the full observation tree).",
      inputSchema: {
        ...paginationShape,
        ...timeRangeShape,
        userId: z.string().optional(),
        sessionId: z.string().optional(),
        name: z.string().optional().describe("Exact trace name match"),
        environment: z.string().optional(),
        tags: z.array(z.string()).optional(),
        orderBy: z.string().optional().describe("e.g. 'timestamp.desc' (default)"),
      },
    },
    async (args) => asJson(await client.get("/api/public/traces", args)),
  );

  server.registerTool(
    "getTrace",
    {
      title: "Get trace with full observation tree",
      description: "Fetch a single trace by id including all nested observations.",
      inputSchema: { traceId: z.string().min(1) },
    },
    async ({ traceId }) => asJson(await client.get(`/api/public/traces/${enc(traceId)}`)),
  );

  // ---------- Observations ----------
  server.registerTool(
    "listObservations",
    {
      title: "List observations",
      description: "List observations (spans, generations, events) with filters.",
      inputSchema: {
        ...paginationShape,
        traceId: z.string().optional(),
        name: z.string().optional(),
        userId: z.string().optional(),
        type: z.enum(["SPAN", "GENERATION", "EVENT"]).optional(),
        level: z.enum(["DEBUG", "DEFAULT", "WARNING", "ERROR"]).optional(),
        parentObservationId: z.string().optional(),
        fromStartTime: z.string().datetime().optional(),
        toStartTime: z.string().datetime().optional(),
        environment: z.string().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/observations", args)),
  );

  server.registerTool(
    "getObservation",
    {
      title: "Get observation by id",
      description: "Fetch a single observation by id.",
      inputSchema: { observationId: z.string().min(1) },
    },
    async ({ observationId }) =>
      asJson(await client.get(`/api/public/observations/${enc(observationId)}`)),
  );

  // ---------- Sessions ----------
  server.registerTool(
    "listSessions",
    {
      title: "List sessions",
      description: "List sessions within a time range.",
      inputSchema: {
        ...paginationShape,
        ...timeRangeShape,
        environment: z.string().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/sessions", args)),
  );

  server.registerTool(
    "getSession",
    {
      title: "Get session with its traces",
      description: "Fetch a session by id, including its traces.",
      inputSchema: { sessionId: z.string().min(1) },
    },
    async ({ sessionId }) => asJson(await client.get(`/api/public/sessions/${enc(sessionId)}`)),
  );

  // ---------- Scores ----------
  server.registerTool(
    "listScores",
    {
      title: "List scores",
      description: "List scores with filters.",
      inputSchema: {
        ...paginationShape,
        userId: z.string().optional(),
        name: z.string().optional(),
        traceId: z.string().optional(),
        fromTimestamp: z.string().datetime().optional(),
        toTimestamp: z.string().datetime().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/scores", args)),
  );

  server.registerTool(
    "getScore",
    {
      title: "Get a single score by id",
      description: "Fetch a single score by id.",
      inputSchema: { scoreId: z.string().min(1) },
    },
    async ({ scoreId }) => asJson(await client.get(`/api/public/scores/${enc(scoreId)}`)),
  );

  // ---------- Score configs ----------
  server.registerTool(
    "listScoreConfigs",
    {
      title: "List score configurations",
      description:
        "List score configurations (definitions for score names, ranges, and categories).",
      inputSchema: { ...paginationShape },
    },
    async (args) => asJson(await client.get("/api/public/score-configs", args)),
  );

  server.registerTool(
    "getScoreConfig",
    {
      title: "Get a score configuration by id",
      description: "Fetch a single score configuration by id.",
      inputSchema: { configId: z.string().min(1) },
    },
    async ({ configId }) => asJson(await client.get(`/api/public/score-configs/${enc(configId)}`)),
  );

  // ---------- Prompts ----------
  server.registerTool(
    "listPrompts",
    {
      title: "List prompts",
      description: "List prompt definitions tracked in Langfuse.",
      inputSchema: {
        ...paginationShape,
        name: z.string().optional().describe("Filter by exact prompt name"),
        label: z.string().optional().describe("Filter by label (e.g. 'production')"),
        tag: z.string().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/v2/prompts", args)),
  );

  server.registerTool(
    "getPrompt",
    {
      title: "Get a prompt (optionally a specific version or label)",
      description:
        "Fetch a prompt by name. Optionally pin to a specific version or label (e.g. 'production').",
      inputSchema: {
        promptName: z.string().min(1),
        version: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Specific version to fetch (defaults to latest production)"),
        label: z.string().optional().describe("Specific label to fetch (e.g. 'production')"),
      },
    },
    async ({ promptName, version, label }) =>
      asJson(
        await client.get(`/api/public/v2/prompts/${enc(promptName)}`, {
          version,
          label,
        }),
      ),
  );

  // ---------- Datasets ----------
  server.registerTool(
    "listDatasets",
    {
      title: "List datasets",
      description: "List datasets configured in Langfuse.",
      inputSchema: { ...paginationShape },
    },
    async (args) => asJson(await client.get("/api/public/v2/datasets", args)),
  );

  server.registerTool(
    "getDataset",
    {
      title: "Get a dataset by name",
      description: "Fetch metadata for a dataset by its name.",
      inputSchema: { datasetName: z.string().min(1) },
    },
    async ({ datasetName }) =>
      asJson(await client.get(`/api/public/v2/datasets/${enc(datasetName)}`)),
  );

  server.registerTool(
    "listDatasetItems",
    {
      title: "List dataset items",
      description: "List items in a dataset (inputs / expected outputs / metadata).",
      inputSchema: {
        ...paginationShape,
        datasetName: z.string().optional().describe("Filter by dataset name"),
        sourceTraceId: z.string().optional(),
        sourceObservationId: z.string().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/dataset-items", args)),
  );

  server.registerTool(
    "getDatasetItem",
    {
      title: "Get a dataset item by id",
      description: "Fetch a single dataset item by id.",
      inputSchema: { itemId: z.string().min(1) },
    },
    async ({ itemId }) => asJson(await client.get(`/api/public/dataset-items/${enc(itemId)}`)),
  );

  server.registerTool(
    "listDatasetRuns",
    {
      title: "List dataset runs",
      description: "List runs (evaluation rounds) for a dataset.",
      inputSchema: {
        ...paginationShape,
        datasetName: z.string().min(1),
      },
    },
    async ({ datasetName, ...rest }) =>
      asJson(await client.get(`/api/public/datasets/${enc(datasetName)}/runs`, rest)),
  );

  server.registerTool(
    "getDatasetRun",
    {
      title: "Get a dataset run",
      description: "Fetch a specific dataset run by name.",
      inputSchema: {
        datasetName: z.string().min(1),
        runName: z.string().min(1),
      },
    },
    async ({ datasetName, runName }) =>
      asJson(await client.get(`/api/public/datasets/${enc(datasetName)}/runs/${enc(runName)}`)),
  );

  // ---------- Metrics ----------
  server.registerTool(
    "getMetrics",
    {
      title: "Query Langfuse metrics",
      description:
        "Run a metrics query (counts, latency, cost, token usage). Pass a JSON query string per the Langfuse metrics API.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe(
            "JSON metrics query (view, dimensions, metrics, filters, fromTimestamp, toTimestamp). See Langfuse docs.",
          ),
      },
    },
    async ({ query }) => asJson(await client.get("/api/public/metrics", { query })),
  );

  server.registerTool(
    "getDailyMetrics",
    {
      title: "Get daily metrics summary",
      description:
        "Fetch daily aggregated usage / cost / count metrics for traces and observations.",
      inputSchema: {
        ...paginationShape,
        traceName: z.string().optional(),
        userId: z.string().optional(),
        tags: z.array(z.string()).optional(),
        environment: z.string().optional(),
        fromTimestamp: z.string().datetime().optional(),
        toTimestamp: z.string().datetime().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/metrics/daily", args)),
  );

  // ---------- Models ----------
  server.registerTool(
    "listModels",
    {
      title: "List models",
      description: "List models known to Langfuse (for cost / token attribution).",
      inputSchema: { ...paginationShape },
    },
    async (args) => asJson(await client.get("/api/public/models", args)),
  );

  server.registerTool(
    "getModel",
    {
      title: "Get a model by id",
      description: "Fetch a single model definition by id.",
      inputSchema: { modelId: z.string().min(1) },
    },
    async ({ modelId }) => asJson(await client.get(`/api/public/models/${enc(modelId)}`)),
  );

  // ---------- Projects ----------
  server.registerTool(
    "listProjects",
    {
      title: "List projects",
      description: "List projects accessible to the current API key (typically a single project).",
      inputSchema: {},
    },
    async () => asJson(await client.get("/api/public/projects")),
  );

  // ---------- Comments ----------
  server.registerTool(
    "listComments",
    {
      title: "List comments",
      description: "List comments attached to traces, observations, sessions, or prompts.",
      inputSchema: {
        ...paginationShape,
        objectType: z
          .enum(["TRACE", "OBSERVATION", "SESSION", "PROMPT"])
          .optional()
          .describe("Filter by attached object type"),
        objectId: z.string().optional(),
        authorUserId: z.string().optional(),
      },
    },
    async (args) => asJson(await client.get("/api/public/comments", args)),
  );

  server.registerTool(
    "getComment",
    {
      title: "Get a comment by id",
      description: "Fetch a single comment by id.",
      inputSchema: { commentId: z.string().min(1) },
    },
    async ({ commentId }) => asJson(await client.get(`/api/public/comments/${enc(commentId)}`)),
  );

  // ---------- Media ----------
  server.registerTool(
    "getMedia",
    {
      title: "Get a media attachment metadata",
      description: "Fetch metadata for a media attachment (image, audio, file) by id.",
      inputSchema: { mediaId: z.string().min(1) },
    },
    async ({ mediaId }) => asJson(await client.get(`/api/public/media/${enc(mediaId)}`)),
  );

  // ---------- Health ----------
  server.registerTool(
    "getHealth",
    {
      title: "Check Langfuse API health",
      description:
        "Pings the Langfuse public health endpoint. Useful to validate credentials and connectivity.",
      inputSchema: {},
    },
    async () => asJson(await client.get("/api/public/health")),
  );
}

export const TOOL_NAMES = [
  "listTraces",
  "getTrace",
  "listObservations",
  "getObservation",
  "listSessions",
  "getSession",
  "listScores",
  "getScore",
  "listScoreConfigs",
  "getScoreConfig",
  "listPrompts",
  "getPrompt",
  "listDatasets",
  "getDataset",
  "listDatasetItems",
  "getDatasetItem",
  "listDatasetRuns",
  "getDatasetRun",
  "getMetrics",
  "getDailyMetrics",
  "listModels",
  "getModel",
  "listProjects",
  "listComments",
  "getComment",
  "getMedia",
  "getHealth",
] as const;
