import { z } from "zod";

export const paginationShape = {
  page: z.number().int().positive().optional().describe("Page number (default 1)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Items per page (default 50, max 100)"),
};

export const timeRangeShape = {
  fromTimestamp: z.string().datetime().optional().describe("ISO 8601 lower bound (inclusive)"),
  toTimestamp: z.string().datetime().optional().describe("ISO 8601 upper bound (exclusive)"),
};
