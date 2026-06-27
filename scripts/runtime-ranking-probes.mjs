import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const CLI_PATH = join(REPO_ROOT, "src/index.js");
const MCP_MODULE_URL = pathToFileURL(join(REPO_ROOT, "src/mcp-public.js")).href;

function runProbe(label, probe) {
  probe();
  console.log(`[runtime-ranking-probes] ${label}: ok`);
}

function createProbeState() {
  return {
    version: 1,
    nextId: 3,
    nextMemoryId: 1,
    nextSwarmId: 2,
    updatedAt: "2026-06-27T00:00:00.000Z",
    tasks: [
      {
        id: "task-1",
        title: "Implement alpha lane",
        objective: "Ship alpha implementation",
        owner: "executor",
        verifier: "reviewer",
        queueStatus: "queued",
        lane: "lane-alpha",
        lanePurpose: "implementation",
        swarmId: "swarm-1",
        scope: ["src/planner"],
        acceptance: ["alpha lane completes implementation handoff"],
        verification: ["npm run probe:runtime-rankings"],
        updatedAt: "2026-06-27T00:00:00.000Z",
        history: []
      },
      {
        id: "task-2",
        title: "Recover blocked beta task",
        objective: "Recover blocked beta task",
        owner: "executor",
        verifier: "reviewer",
        queueStatus: "blocked",
        lane: "lane-beta",
        lanePurpose: "verification",
        swarmId: "swarm-1",
        scope: ["src/state/runtime"],
        acceptance: ["blocked beta task is surfaced as top recovery priority"],
        verification: ["npm run probe:runtime-rankings"],
        updatedAt: "2026-06-27T00:00:00.000Z",
        history: [
          {
            id: "event-1",
            at: "2026-06-27T00:00:00.000Z",
            type: "blocked",
            outcome: "blocked"
          }
        ]
      }
    ],
    memories: [],
    swarms: [
      {
        id: "swarm-1",
        objective: "Ship smarter runtime ranking",
        status: "active",
        topology: "bounded-local",
        maxWorkers: 2,
        executionShape: "parallel",
        waveCount: 1,
        owner: "executor",
        lanes: [
          {
            lane: "lane-alpha",
            purpose: "implementation",
            summary: "Implement alpha lane",
            owner: "executor",
            verifier: "reviewer",
            taskId: "task-1"
          },
          {
            lane: "lane-beta",
            purpose: "verification",
            summary: "Recover blocked beta task",
            owner: "executor",
            verifier: "reviewer",
            taskId: "task-2"
          }
        ],
        history: []
      }
    ],
    archivedTasks: [],
    archivedSwarms: []
  };
}

function withTempState(run) {
  const tempRoot = mkdtempSync(join(tmpdir(), "codex-bees-ranking-"));
  const stateDir = join(tempRoot, ".codex-bees");
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(join(stateDir, "state.json"), JSON.stringify(createProbeState(), null, 2));

  try {
    return run(tempRoot);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runCliJson(cwd, args) {
  const stdout = execFileSync(process.execPath, [CLI_PATH, ...args], {
    cwd,
    encoding: "utf8"
  });
  return JSON.parse(stdout);
}

function runMcpPayload(cwd, name, args = {}) {
  const script = `
    const m = await import(${JSON.stringify(MCP_MODULE_URL)});
    const result = m.callMcpTool(${JSON.stringify(name)}, ${JSON.stringify(args)});
    console.log(JSON.stringify(result));
  `;
  const stdout = execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd,
    encoding: "utf8"
  });
  const response = JSON.parse(stdout);
  const textPayload = response?.content?.find((entry) => entry?.type === "text")?.text;
  const parsed = textPayload ? JSON.parse(textPayload) : null;
  return {
    response,
    parsed,
    value: parsed ? Object.values(parsed)[0] : null
  };
}

runProbe("planner-profile-ranking-cli", () =>
  withTempState((cwd) => {
    const view = runCliJson(cwd, ["plan:profile-ranking", "--task", "Orchestrate a parallel swarm dispatch across workers"]);
    assert.equal(view.kind, "planner_profile_ranking_view");
    assert.ok(Array.isArray(view.profiles));
    assert.ok(view.profiles.length > 0);
    assert.equal(view.profiles[0].rank, 1);
    assert.equal(view.profiles[0].profileId, "coordination-local");
    assert.ok((view.selectionScore ?? 0) > 0);
    assert.ok((view.counts?.matchedSignalCount ?? 0) > 0);
  })
);

runProbe("planner-profile-ranking-intent-cli", () =>
  withTempState((cwd) => {
    const view = runCliJson(cwd, ["plan:profile-ranking", "--task", "Improve task queue review transitions"]);
    assert.equal(view.kind, "planner_profile_ranking_view");
    assert.equal(view.selectionContext?.taskClass, "coordination-kernel");
    assert.equal(view.profiles[0]?.profileId, "coordination-local");
    assert.ok(view.matchedSignals?.intentTags?.includes("review-flow"));
    assert.ok(view.profiles[0]?.matchedIntentTags?.includes("review-flow"));
  })
);

runProbe("planner-task-assessment-cli", () =>
  withTempState((cwd) => {
    const plan = runCliJson(cwd, ["plan", "--task", "Queue a planner-driven swarm"]);
    assert.equal(plan.kind, "task_plan");
    assert.equal(plan.assessment?.coordinationIntensity, "high");
    assert.equal(plan.assessment?.executionPressure, "parallel");
    assert.equal(plan.assessment?.dispatchBias, "parallelize-by-owner");
  })
);

runProbe("leader-assignment-ranking-cli", () =>
  withTempState((cwd) => {
    const view = runCliJson(cwd, ["leader:assignment-ranking"]);
    assert.equal(view.kind, "leader_assignment_ranking_view");
    assert.equal(view.assignments[0]?.rank, 1);
    assert.equal(view.assignments[0]?.lane, "lane-alpha");
    assert.equal(view.assignments[0]?.taskId, "task-1");
    assert.ok((view.assignments[0]?.dispatchScore ?? 0) > 0);
  })
);

runProbe("runtime-dispatch-ranking-cli", () =>
  withTempState((cwd) => {
    const view = runCliJson(cwd, ["runtime:dispatch-ranking"]);
    assert.equal(view.kind, "runtime_dispatch_ranking_view");
    assert.equal(view.assignments[0]?.rank, 1);
    assert.equal(view.assignments[0]?.lane, "lane-alpha");
    assert.equal(view.assignments[0]?.taskId, "task-1");
    assert.ok((view.assignments[0]?.dispatchScore ?? 0) > 0);
  })
);

runProbe("runtime-focus-candidates-cli", () =>
  withTempState((cwd) => {
    const view = runCliJson(cwd, ["runtime:focus-candidates"]);
    assert.equal(view.kind, "runtime_focus_candidates_view");
    assert.equal(view.candidates[0]?.key, "blocked_task");
    assert.equal(view.candidates[0]?.focus?.taskId, "task-2");
    assert.equal(view.candidates[0]?.priorityScore, 200);
  })
);

runProbe("planner-profile-ranking-mcp", () =>
  withTempState((cwd) => {
    const { response, parsed, value } = runMcpPayload(cwd, "planner_profile_ranking", {
      task: "Orchestrate a parallel swarm dispatch across workers"
    });
    assert.ok(Array.isArray(response?.content));
    assert.equal(typeof parsed?.profileRanking, "object");
    assert.equal(value?.kind, "planner_profile_ranking_view");
    assert.equal(value?.profiles?.[0]?.profileId, "coordination-local");
  })
);

runProbe("planner-profile-ranking-intent-mcp", () =>
  withTempState((cwd) => {
    const { parsed, value } = runMcpPayload(cwd, "planner_profile_ranking", {
      task: "Improve task queue review transitions"
    });
    assert.equal(typeof parsed?.profileRanking, "object");
    assert.equal(value?.selectionContext?.taskClass, "coordination-kernel");
    assert.equal(value?.profiles?.[0]?.profileId, "coordination-local");
    assert.ok(value?.matchedSignals?.intentTags?.includes("review-flow"));
  })
);

runProbe("planner-task-assessment-mcp", () =>
  withTempState((cwd) => {
    const { parsed } = runMcpPayload(cwd, "plan_task", {
      task: "Queue a planner-driven swarm"
    });
    assert.equal(parsed?.kind, "task_plan");
    assert.equal(parsed?.assessment?.coordinationIntensity, "high");
    assert.equal(parsed?.assessment?.executionPressure, "parallel");
  })
);

runProbe("leader-assignment-ranking-mcp", () =>
  withTempState((cwd) => {
    const { parsed, value } = runMcpPayload(cwd, "leader_assignment_ranking");
    assert.equal(typeof parsed?.assignmentRanking, "object");
    assert.equal(value?.kind, "leader_assignment_ranking_view");
    assert.equal(value?.assignments?.[0]?.lane, "lane-alpha");
    assert.ok((value?.assignments?.[0]?.dispatchScore ?? 0) > 0);
  })
);

runProbe("runtime-dispatch-ranking-mcp", () =>
  withTempState((cwd) => {
    const { parsed, value } = runMcpPayload(cwd, "runtime_dispatch_ranking");
    assert.equal(typeof parsed?.dispatchRanking, "object");
    assert.equal(value?.kind, "runtime_dispatch_ranking_view");
    assert.equal(value?.assignments?.[0]?.lane, "lane-alpha");
    assert.ok((value?.assignments?.[0]?.dispatchScore ?? 0) > 0);
  })
);

runProbe("runtime-focus-candidates-mcp", () =>
  withTempState((cwd) => {
    const { parsed, value } = runMcpPayload(cwd, "runtime_focus_candidates");
    assert.equal(typeof parsed?.focusCandidates, "object");
    assert.equal(value?.kind, "runtime_focus_candidates_view");
    assert.equal(value?.candidates?.[0]?.key, "blocked_task");
    assert.equal(value?.candidates?.[0]?.focus?.taskId, "task-2");
  })
);

console.log("runtime ranking probes: ok");
