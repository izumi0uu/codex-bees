export const DEFAULT_PLANNER_PROFILE_ID = "bounded-local";
export const COORDINATION_PLANNER_PROFILE_ID = "coordination-local";

export const COORDINATION_SIGNAL_TERMS = [
  "swarm",
  "parallel",
  "dispatch",
  "orchestrate",
  "orchestration",
  "leader",
  "assignment",
  "handoff",
  "worker",
  "multi-agent",
  "multi agent"
];

export const SHIPPED_PLANNER_PROFILE_SPECS = [
  {
    id: DEFAULT_PLANNER_PROFILE_ID,
    description: "Adaptive local bounded planner for Codex-only execution.",
    topology: "bounded-local",
    laneSource: "planner",
    adaptive: true,
    laneModel: "adaptive-bounded-lanes",
    executionModel: "dependency-wave-local",
    roles: ["explore", "reviewer", "executor", "tester"],
    constraints: [
      "codex-only runtime boundary",
      "disjoint lane ownership",
      "local state-backed task queue"
    ],
    selectionHints: {
      keywords: [],
      taskClasses: [],
      intentTags: [],
      excludeIntentTags: [],
      scopePrefixes: [],
      priority: 0
    },
    planningHints: {
      documentationMode: "serial",
      coordinationBias: false
    }
  },
  {
    id: COORDINATION_PLANNER_PROFILE_ID,
    description: "Parallel-biased bounded planner for swarm-heavy Codex coordination.",
    topology: "bounded-local",
    laneSource: "planner",
    adaptive: true,
    laneModel: "coordination-bounded-lanes",
    executionModel: "coordination-wave-local",
    roles: ["explore", "executor", "reviewer", "tester"],
    constraints: [
      "codex-only runtime boundary",
      "disjoint lane ownership",
      "wave-aware swarm launch sequencing",
      "local state-backed task queue"
    ],
    selectionHints: {
      keywords: [...COORDINATION_SIGNAL_TERMS],
      taskClasses: [],
      intentTags: ["dispatch-flow", "review-flow", "swarm-flow"],
      excludeIntentTags: ["public-state-bridge"],
      scopePrefixes: [],
      priority: 100
    },
    planningHints: {
      documentationMode: "discovery-sidecar",
      coordinationBias: true
    }
  }
];

export function getShippedPlannerProfileIds() {
  return SHIPPED_PLANNER_PROFILE_SPECS.map((profile) => profile.id);
}
