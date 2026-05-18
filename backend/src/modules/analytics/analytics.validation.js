const { z } = require("zod");

const timezoneSchema = z.enum(["UTC"]).default("UTC");

const dateRangeQuerySchema = z.object({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  timezone: timezoneSchema.optional(),
});

const weeklyProgressQuerySchema = z.object({
  weeks: z.coerce.number().int().min(1).max(24).default(8),
  timezone: timezoneSchema.optional(),
});

const heatmapQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(90),
  timezone: timezoneSchema.optional(),
});

module.exports = {
  dateRangeQuerySchema,
  weeklyProgressQuerySchema,
  heatmapQuerySchema,
};
