export const skillDomains = [
  "numerical",
  "verbal",
  "logical",
  "deductive",
  "inductive",
  "abstract",
  "pattern-recognition",
  "spatial",
  "critical-thinking",
  "attention",
  "attention-to-detail",
  "processing-speed",
  "memory",
  "data-checking",
  "error-spotting",
  "digital-reasoning",
  "ai-fluency",
  "workplace-judgment",
  "prioritisation",
  "inbox",
  "job-simulation",
  "language",
] as const;

export type SkillDomain = (typeof skillDomains)[number];

export const sessionModes = ["learn", "train", "simulation"] as const;
export type SessionMode = (typeof sessionModes)[number];

export const difficultyLabels = [
  "foundation",
  "easy",
  "moderate",
  "challenging",
  "advanced",
  "expert",
  "extreme",
] as const;
export type DifficultyLabel = (typeof difficultyLabels)[number];

export type PerformanceAxes = {
  accuracy: number;
  speed: number;
  challenge: number;
  consistency: number;
  growth: number;
  evidence: number;
};

export type Skill = {
  id: string;
  slug: string;
  name: string;
  domain: SkillDomain;
  description: string;
  status: "draft" | "active" | "retired";
};
