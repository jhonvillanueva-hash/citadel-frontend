import { z } from 'zod';

const ChartTypeSchema = z.enum(['line','bar','area','pie','donut','scatter','radar','heatmap','bubble','radialBar']);

const ApexChartConfigSchema = z.object({
  type: ChartTypeSchema,
  toolbar: z.object({ show: z.boolean().default(true) }).optional(),
  zoom: z.object({ enabled: z.boolean().default(false) }).optional(),
  redrawOnParentResize: z.boolean().default(true),
}).passthrough(); // permite que el LLM añada height, width, etc.

const ApexSeriesSchema = z.object({
  name: z.string().optional(),
  data: z.union([
    z.array(z.number()),
    z.array(z.object({ x: z.union([z.string(), z.number()]), y: z.number() }))
  ])
}).passthrough();

const ApexChartPayloadSchema = z.object({
  chart: ApexChartConfigSchema,
  series: z.union([
    z.array(ApexSeriesSchema),
    z.array(z.number())
  ]),
  xaxis: z.object({ categories: z.array(z.string()).optional() }).passthrough().optional(),
  labels: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
}).passthrough();

export const AiTextResponseSchema = z.object({
  format: z.literal('text'),
  text: z.string().min(1),
});

export const AiChartResponseSchema = z.object({
  format: z.literal('chart'),
  text: z.string().min(10),
  title: z.string().min(3),
  apexchart: ApexChartPayloadSchema,
});

export const AiResponseSchema = z.discriminatedUnion('format', [
  AiTextResponseSchema,
  AiChartResponseSchema,
]);

export type AiResponse = z.infer<typeof AiResponseSchema>;