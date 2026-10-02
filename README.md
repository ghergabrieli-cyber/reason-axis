# REASON AXIS

**Train. Measure. Improve.**  
*Cognitive & Career Skills*  
**Build the skills behind performance.**

REASON AXIS is an international cognitive training and hiring-assessment practice platform.

## Product principles
- Original content only; no copying of proprietary assessment items or vendor interfaces.
- Learn → Train → Simulate → Analyse → Improve.
- Scores describe performance inside REASON AXIS and are not clinical IQ or psychological diagnoses.
- Content, measurement, and presentation remain separate.
- Free access remains genuinely useful.

## Architecture
- `apps/web` — Next.js application
- `packages/domain` — core domain types and constants
- `packages/content-schemas` — typed item/content validation
- `packages/item-engine` — item runtime logic
- `packages/session-engine` — session orchestration
- `packages/scoring` — scoring and performance axes
- `packages/adaptive-engine` — adaptive practice
- `packages/readiness` — assessment readiness
- `packages/recommendations` — next-training recommendations

## First build milestone
Onboarding → Baseline → Learn → Adaptive Train → Timed Simulation → Report → Dashboard → Recommended next workout.
