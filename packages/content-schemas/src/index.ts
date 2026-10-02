import { z } from "zod";

export const itemStatusSchema = z.enum([
  "draft",
  "internal-review",
  "content-qa",
  "technical-qa",
  "pilot",
  "active",
  "monitor",
  "retired",
]);

export const itemTypeSchema = z.enum([
  "single-choice",
  "multiple-choice",
  "numeric-entry",
  "text-entry",
  "ordering",
  "matching",
  "matrix",
  "table-analysis",
  "document-comparison",
  "typing",
  "memory-sequence",
  "reaction",
  "inbox",
  "sjt",
  "simulation-step",
  "listening",
  "written-response",
]);

export const itemVersionSchema = z.object({
  id: z.string().min(1),
  templateId: z.string().min(1),
  version: z.number().int().positive(),
  skillId: z.string().min(1),
  subskillId: z.string().optional(),
  microSkillId: z.string().optional(),
  itemType: itemTypeSchema,
  difficultyAuthor: z.number().min(1).max(7),
  difficultyEmpirical: z.number().min(1).max(7).optional(),
  expectedTimeSeconds: z.number().int().positive(),
  language: z.string().min(2),
  locale: z.string().min(2),
  adaptiveAllowed: z.boolean(),
  simulationAllowed: z.boolean(),
  status: itemStatusSchema,
  prompt: z.string().min(1),
  responseSchema: z.record(z.string(), z.unknown()),
  scoringSchema: z.record(z.string(), z.unknown()),
  explanation: z.string().min(1),
  strategy: z.string().optional(),
  commonTrap: z.string().optional(),
  prerequisiteSkillIds: z.array(z.string()).default([]),
  provenance: z.object({
    author: z.string().min(1),
    createdAt: z.string().datetime(),
    generationMethod: z.string().min(1),
    reviewer: z.string().optional(),
    originalityReviewed: z.boolean().default(false),
  }),
});

export type ItemVersionInput = z.input<typeof itemVersionSchema>;
export type ItemVersion = z.output<typeof itemVersionSchema>;
