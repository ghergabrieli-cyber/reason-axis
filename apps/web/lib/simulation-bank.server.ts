export type SimulationItem = {
  id: string;
  skill: string;
  difficulty: number;
  prompt: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string;
  explanation: string;
};

export const simulationBlueprint = {
  id: "core-reasoning-sim-001",
  title: "Core Reasoning Sprint",
  durationSeconds: 240,
  items: [
    {
      id: "sim-num-001",
      skill: "numerical.percentages",
      difficulty: 3,
      prompt:
        "An operations team completed 315 of 420 scheduled cases. What percentage of the schedule was completed?",
      options: [
        { id: "a", label: "70%" },
        { id: "b", label: "72.5%" },
        { id: "c", label: "75%" },
        { id: "d", label: "78%" },
      ],
      correctOptionId: "c",
      explanation: "315 ÷ 420 = 0.75, so 75% of the schedule was completed.",
    },
    {
      id: "sim-log-001",
      skill: "logical.constraints",
      difficulty: 3.5,
      prompt:
        "Four tasks — K, L, M and N — must be completed once each. K must be before M. N must be after L. Which order is valid?",
      options: [
        { id: "a", label: "M · K · L · N" },
        { id: "b", label: "L · N · K · M" },
        { id: "c", label: "N · L · K · M" },
        { id: "d", label: "K · M · N · L" },
      ],
      correctOptionId: "b",
      explanation: "Only L · N · K · M satisfies both K before M and N after L.",
    },
    {
      id: "sim-detail-001",
      skill: "attention-to-detail.data-checking",
      difficulty: 4,
      prompt:
        "Reference: AX-704193-B. Which entry is an exact match?",
      options: [
        { id: "a", label: "AX-704139-B" },
        { id: "b", label: "AX-704193-8" },
        { id: "c", label: "AX-704193-B" },
        { id: "d", label: "AX-740193-B" },
      ],
      correctOptionId: "c",
      explanation: "The third entry matches every character and position exactly.",
    },
    {
      id: "sim-num-002",
      skill: "numerical.rates",
      difficulty: 4.5,
      prompt:
        "A process handles 144 records in 4 hours. At the same rate, how many records are handled in 6.5 hours?",
      options: [
        { id: "a", label: "216" },
        { id: "b", label: "225" },
        { id: "c", label: "234" },
        { id: "d", label: "252" },
      ],
      correctOptionId: "c",
      explanation: "144 ÷ 4 = 36 records/hour. 36 × 6.5 = 234.",
    },
  ] satisfies SimulationItem[],
};

export function getPublicSimulationItems() {
  return simulationBlueprint.items.map(
    ({ correctOptionId: _correctOptionId, explanation: _explanation, ...item }) =>
      item,
  );
}
