import assert from "node:assert/strict";
import { runtimeSessionPackFromSources } from "../src/state/runtime/session-packs/session-source.js";
import { runtimeSessionPackSurface } from "../src/state/runtime/entry/session-packs/session-surface.js";
import { runtimeRolePackFromSources } from "../src/state/runtime/session-packs/role-source.js";
import { runtimeRolePackSurface } from "../src/state/runtime/entry/session-packs/role-surface.js";
import { runtimeExecutionPackFromSources } from "../src/state/runtime/session-packs/execution-source.js";
import { runtimeExecutionPackSurface } from "../src/state/runtime/entry/session-packs/execution-surface.js";
import { runtimePickupPackFromSources } from "../src/state/runtime/session-packs/pickup-source.js";
import { runtimePickupPackSurface } from "../src/state/runtime/entry/session-packs/pickup-surface.js";
import { runtimeAssignmentPackFromSources } from "../src/state/runtime/session-packs/assignment-source.js";
import { runtimeAssignmentPackSurface } from "../src/state/runtime/entry/session-packs/assignment-surface.js";
import { runtimeWorkerPackFromSources } from "../src/state/runtime/session-packs/worker-source.js";
import { runtimeWorkerPackSurface } from "../src/state/runtime/entry/session-packs/worker-surface.js";
import { runtimeOwnerPackFromSources } from "../src/state/runtime/session-packs/owner-source.js";
import { runtimeOwnerPackSurface } from "../src/state/runtime/entry/session-packs/owner-surface.js";
import { runtimeVerifierPackFromSources } from "../src/state/runtime/session-packs/verifier-source.js";
import { runtimeVerifierPackSurface } from "../src/state/runtime/entry/session-packs/verifier-surface.js";
import { runtimeHandoffPackFromSources } from "../src/state/runtime/orchestration-packs/handoff-source.js";
import { runtimeHandoffPackSurface } from "../src/state/runtime/entry/orchestration-pack/handoff-surface.js";
import { runtimeTriagePackFromSources } from "../src/state/runtime/orchestration-packs/triage-source.js";
import { runtimeTriagePackSurface } from "../src/state/runtime/entry/orchestration-pack/triage-surface.js";
import { runtimeSignalPackFromSources } from "../src/state/runtime/orchestration-packs/signal-source.js";
import { runtimeSignalPackSurface } from "../src/state/runtime/entry/orchestration-pack/signal-surface.js";
import { createStateRuntimeSessionPackSessionRoleEntryPoints } from "../src/state/public/runtime-session-pack-session-role-entrypoints.js";
import { createStateRuntimeSessionPackExecutionEntryPoints } from "../src/state/public/runtime-session-pack-execution-entrypoints.js";
import { createStateRuntimeOrchestrationPackOverviewEntryPoints } from "../src/state/public/runtime-orchestration-pack-overview-entrypoints.js";

function runProbe(label, probe) {
  probe();
  console.log(`[runtime-pack-probes] ${label}: ok`);
}

runProbe("session-pack-session-role", () => {
  const reviewRoleEntry = {
    role: { id: "executor", label: "Executor" },
    counts: { pendingReview: 1, ownerClaimable: 0 },
    summary: "role summary",
    nextAction: null
  };

  const directSources = {
    runtimeWorkerPack: () => ({
      recommendedSurface: "worker:session",
      recommendedReason: "default_worker_priority",
      overview: { session: { active: 0 } },
      next: null
    }),
    runtimeOwnerPack: () => ({
      recommendedSurface: "worker:session",
      recommendedReason: "default_owner_priority",
      overview: { session: { active: 0 } },
      next: null
    }),
    runtimeVerifierPack: () => ({
      recommendedSurface: "runtime:review",
      recommendedReason: "review_queue_waiting",
      overview: { review: { pending: 1 } },
      next: { review: { taskId: "TASK-9" } },
      summary: "verifier review pending"
    }),
    runtimeRoles: () => ({ roles: [reviewRoleEntry] })
  };

  const directPack = runtimeSessionPackFromSources({ role: "executor", workerId: "bee-1" }, directSources);
  assert.equal(directPack.recommendedSurface, "task:next --role executor --mode verifier");
  assert.equal(directPack.recommendedReason, "review_next_priority");
  assert.equal(directPack.next.verifier.review.taskId, "TASK-9");
  assert.match(directPack.summary, /verifier review pending/);

  const delegatedPack = runtimeSessionPackSurface({ role: "executor", workerId: "bee-1" }, directSources);
  assert.deepEqual(delegatedPack, directPack);

  const api = {
    workerSession: ({ role, workerId, mode = "any" }) => ({
      role: { id: role, label: role[0].toUpperCase() + role.slice(1) },
      workerId,
      mode,
      focus: null,
      counts: { active: 0 },
      inbox: { counts: { assigned: 0 } }
    }),
    workerHandoff: () => ({ currentTask: null }),
    workerCloseout: () => ({ report: { task: null } }),
    taskNext: ({ mode }) => (mode === "owner" ? { candidate: { id: "TASK-12", title: "Owner pickup" } } : { candidate: null }),
    verifierBundle: () => ({ currentTask: null })
  };

  const runtimeOverview = {
    runtimeRoles: () => ({
      roles: [
        {
          role: { id: "executor", label: "Executor" },
          counts: { pendingReview: 0, ownerClaimable: 1 },
          summary: "role can claim owner work",
          nextAction: null
        }
      ]
    }),
    runtimeReview: () => ({ next: null, counts: { pending: 0 }, summary: "review idle" })
  };

  const entrypoints = createStateRuntimeSessionPackSessionRoleEntryPoints(api, runtimeOverview);
  assert.deepEqual(Object.keys(entrypoints).sort(), [
    "runtimeOwnerPack",
    "runtimeReviewPack",
    "runtimeRolePack",
    "runtimeSessionPack",
    "runtimeVerifierPack",
    "runtimeWorkerPack"
  ]);

  const entryPack = entrypoints.runtimeSessionPack({ role: "executor", workerId: "bee-1" });
  assert.equal(entryPack.recommendedSurface, "task:pickup --role executor --worker bee-1 --mode owner");
  assert.equal(entryPack.recommendedReason, "owner_priority");
  assert.equal(entryPack.next.owner.candidate.id, "TASK-12");

  const entryRolePack = entrypoints.runtimeRolePack({ role: "executor", workerId: "bee-1" });
  assert.equal(entryRolePack.recommendedSurface, "task:pickup --role executor --worker bee-1 --mode owner");
  assert.equal(entryRolePack.next.session.owner.candidate.id, "TASK-12");
});

runProbe("session-pack-role", () => {
  const roleEntry = {
    role: { id: "executor", label: "Executor" },
    counts: { pendingReview: 0, ownerClaimable: 0 },
    summary: "role summary",
    nextAction: { command: "task:queue --role executor" }
  };

  const sharedSources = {
    runtimeRoles: () => ({ roles: [roleEntry] }),
    runtimeSessionPack: () => ({
      recommendedSurface: "worker:session",
      recommendedReason: "default_session_priority",
      overview: { session: { active: 0 } },
      next: { worker: null },
      summary: "session summary"
    }),
    runtimeOwnerPack: () => ({
      recommendedSurface: "worker:session",
      recommendedReason: "default_owner_priority",
      overview: { session: { active: 0 } },
      next: { owner: null },
      summary: "owner summary"
    }),
    runtimeVerifierPack: () => ({
      recommendedSurface: "runtime:review",
      recommendedReason: "review_queue_waiting",
      overview: { review: { pending: 0 } },
      next: { verifier: null },
      summary: "verifier summary"
    })
  };

  const directPack = runtimeRolePackFromSources({ role: "executor", workerId: "bee-1" }, sharedSources);
  assert.equal(directPack.recommendedSurface, "task:queue --role executor");
  assert.equal(directPack.recommendedReason, "role_action_priority");
  assert.equal(directPack.next.role.command, "task:queue --role executor");
  assert.match(directPack.summary, /session summary/);

  const delegatedPack = runtimeRolePackSurface({ role: "executor", workerId: "bee-1" }, sharedSources);
  assert.deepEqual(delegatedPack, directPack);

  const api = {
    workerSession: ({ role, workerId, mode = "any" }) => ({
      role: { id: role, label: role[0].toUpperCase() + role.slice(1) },
      workerId,
      mode,
      focus: null,
      counts: { active: 0 },
      inbox: { counts: { assigned: 0 } }
    }),
    workerHandoff: () => ({ currentTask: null }),
    workerCloseout: () => ({ report: { task: null } }),
    taskNext: () => ({ candidate: null }),
    verifierBundle: () => ({ currentTask: null })
  };

  const runtimeOverview = {
    runtimeRoles: () => ({ roles: [roleEntry] }),
    runtimeReview: () => ({ next: null, counts: { pending: 0 }, summary: "review idle" })
  };

  const entrypoints = createStateRuntimeSessionPackSessionRoleEntryPoints(api, runtimeOverview);
  const entryRolePack = entrypoints.runtimeRolePack({ role: "executor", workerId: "bee-1" });
  assert.equal(entryRolePack.recommendedSurface, "task:queue --role executor");
  assert.equal(entryRolePack.recommendedReason, "role_action_priority");
  assert.equal(entryRolePack.next.role.command, "task:queue --role executor");
});

runProbe("session-pack-execution", () => {
  const sharedSources = {
    runtimeFocus: () => ({
      focus: { type: "dispatch_lane", priority: "high", purposeGuidance: "focus guidance" },
      summary: "focus summary"
    }),
    runtimeDispatch: () => ({
      counts: { totalAssignments: 2 },
      next: { purposeGuidance: "dispatch guidance" },
      summary: "dispatch summary"
    }),
    leaderAssignmentDispatchBundle: () => ({
      counts: { launches: 2 },
      next: { purposeGuidance: "dispatch bundle guidance" },
      summary: "dispatch bundle summary"
    }),
    leaderAssignmentLaunchPlan: () => ({
      counts: { steps: 3 },
      next: { purposeGuidance: "launch plan guidance" },
      summary: "launch plan summary"
    }),
    runtimeRoles: () => ({
      counts: { withClaimableOwnerWork: 1, withActiveOwnerWork: 0 },
      next: { nextAction: { purposeGuidance: "role guidance" } },
      summary: "roles summary"
    }),
    runtimeQueuePack: ({ detail }) => ({
      detailLevel: detail,
      overview: { queue: { total: 4 } },
      next: { queue: { task: { id: "TASK-4", title: "Queued work" } } },
      summary: "queue summary"
    })
  };

  const directPack = runtimeExecutionPackFromSources({ detail: "compact" }, sharedSources);
  assert.equal(directPack.recommendedSurface, "leader:assignment-launch-plan");
  assert.equal(directPack.recommendedReason, "parallel_launch_plan_ready");
  assert.equal(directPack.purposeGuidance, "launch plan guidance");
  assert.equal(directPack.expansion.assignmentLaunchPlan.surface, "leader:assignment-launch-plan");
  assert.match(directPack.summary, /focus summary/);

  const delegatedPack = runtimeExecutionPackSurface({ detail: "compact" }, sharedSources);
  assert.deepEqual(delegatedPack, directPack);

  const runtimeLeader = {
    leaderAssignments: () => ({ counts: { total: 0 } }),
    leaderAssignmentDispatchBundle: sharedSources.leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan: sharedSources.leaderAssignmentLaunchPlan
  };
  const runtimeOverview = {
    runtimeDispatch: sharedSources.runtimeDispatch,
    runtimeFocus: sharedSources.runtimeFocus,
    runtimeRoles: sharedSources.runtimeRoles
  };
  const runtimeOrchestrationPacks = {
    runtimeQueuePack: sharedSources.runtimeQueuePack
  };
  const runtimeSessionPackSessionRole = {
    runtimeRolePack: () => ({ recommendedSurface: "runtime:roles" })
  };
  const api = {
    workerSession: () => null,
    taskNext: () => ({ candidate: null }),
    previewTaskPickup: () => null,
    previewTaskAssignment: () => null
  };

  const entrypoints = createStateRuntimeSessionPackExecutionEntryPoints(
    api,
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPacks,
    runtimeSessionPackSessionRole
  );
  const entryPack = entrypoints.runtimeExecutionPack({ detail: "compact" });
  assert.deepEqual(entryPack, directPack);
});

runProbe("session-pack-pickup-assignment", () => {
  const pickupSources = {
    workerSession: ({ role, workerId, mode }) => ({
      role: { id: role, label: "Executor" },
      workerId,
      mode,
      focus: null,
      counts: { active: 0 },
      inbox: { counts: { assigned: 1 } },
      purposeGuidance: { purpose: "session work" }
    }),
    taskNext: () => ({ candidate: { id: "TASK-11" }, brief: { id: "TASK-11" } }),
    previewTaskPickup: ({ role, workerId, mode }) => ({
      outcome: "claimable",
      command: `node ./src/index.js task:pickup --role ${role} --worker ${workerId} --mode ${mode}`,
      candidate: { id: "TASK-11" },
      brief: { id: "TASK-11" },
      purposeGuidance: { purpose: "claim work" }
    }),
    runtimeRolePack: () => ({
      recommendedSurface: "runtime:roles",
      overview: { role: { ownerClaimable: 1 } },
      purposeGuidance: { purpose: "role fallback" }
    })
  };

  const directPickup = runtimePickupPackFromSources({ role: "executor", workerId: "bee-1", mode: "owner" }, pickupSources);
  assert.equal(directPickup.recommendedSurface, "task:pickup --role executor --worker bee-1 --mode owner");
  assert.equal(directPickup.recommendedReason, "claimable_pickup_ready");
  assert.equal(directPickup.next.pickup.candidate.id, "TASK-11");
  assert.equal(directPickup.purposeGuidance.purpose, "claim work");

  const delegatedPickup = runtimePickupPackSurface({ role: "executor", workerId: "bee-1", mode: "owner" }, pickupSources);
  assert.deepEqual(delegatedPickup, directPickup);

  const assignmentSources = {
    leaderAssignments: () => ({
      counts: { ownerGroups: 1 },
      groups: [
        {
          owner: { id: "executor", label: "Executor" },
          count: 1,
          assignments: [
            {
              taskId: "TASK-21",
              purposeGuidance: { label: "implementation", purpose: "finish task 21" }
            }
          ]
        }
      ],
      next: { assignment: { taskId: "TASK-21" } }
    }),
    workerSession: ({ role, workerId, mode }) => ({
      role: { id: role, label: "Executor" },
      workerId,
      mode,
      focus: null,
      counts: { active: 0 }
    }),
    taskNext: () => ({ candidate: { id: "TASK-22" } }),
    previewTaskAssignment: () => ({
      outcome: "queued_assignment",
      candidate: { id: "TASK-21" },
      purposeGuidance: { purpose: "take leader assignment" }
    }),
    runtimeRoles: () => ({
      roles: [
        {
          role: { id: "executor", label: "Executor" },
          counts: { ownerClaimable: 0 },
          nextAction: { command: "node ./src/index.js runtime:roles --role executor" }
        }
      ]
    })
  };

  const directAssignment = runtimeAssignmentPackFromSources({ role: "executor", workerId: "bee-1", mode: "owner" }, assignmentSources);
  assert.equal(directAssignment.recommendedSurface, "task:assignment-pickup --role executor --worker bee-1 --mode owner");
  assert.equal(directAssignment.recommendedReason, "leader_assignment_ready");
  assert.equal(directAssignment.next.assignment.taskId, "TASK-21");
  assert.match(directAssignment.summary, /TASK-21/);

  const delegatedAssignment = runtimeAssignmentPackSurface({ role: "executor", workerId: "bee-1", mode: "owner" }, assignmentSources);
  assert.deepEqual(delegatedAssignment, directAssignment);

  const runtimeLeader = {
    leaderAssignments: assignmentSources.leaderAssignments,
    leaderAssignmentDispatchBundle: () => ({ counts: { launches: 0 }, next: null }),
    leaderAssignmentLaunchPlan: () => ({ counts: { steps: 0 }, next: null })
  };
  const runtimeOverview = {
    runtimeDispatch: () => ({ counts: { totalAssignments: 0 }, next: null }),
    runtimeFocus: () => ({ focus: null }),
    runtimeRoles: assignmentSources.runtimeRoles
  };
  const runtimeOrchestrationPacks = {
    runtimeQueuePack: () => ({ overview: { queue: { total: 0 } }, next: { queue: null } })
  };
  const runtimeSessionPackSessionRole = {
    runtimeRolePack: pickupSources.runtimeRolePack
  };
  const api = {
    workerSession: pickupSources.workerSession,
    taskNext: ({ role, workerId, mode }) => (mode === "owner" ? { candidate: { id: "TASK-11" } } : { candidate: null }),
    previewTaskPickup: pickupSources.previewTaskPickup,
    previewTaskAssignment: assignmentSources.previewTaskAssignment
  };

  const entrypoints = createStateRuntimeSessionPackExecutionEntryPoints(
    api,
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPacks,
    runtimeSessionPackSessionRole
  );

  const entryPickup = entrypoints.runtimePickupPack({ role: "executor", workerId: "bee-1", mode: "owner" });
  assert.equal(entryPickup.recommendedSurface, "task:pickup --role executor --worker bee-1 --mode owner");
  assert.equal(entryPickup.recommendedReason, "claimable_pickup_ready");

  const entryAssignment = entrypoints.runtimeAssignmentPack({ role: "executor", workerId: "bee-1", mode: "owner" });
  assert.equal(entryAssignment.recommendedSurface, "task:assignment-pickup --role executor --worker bee-1 --mode owner");
  assert.equal(entryAssignment.recommendedReason, "leader_assignment_ready");
  assert.equal(entryAssignment.next.assignment.taskId, "TASK-21");
});

runProbe("worker-owner-verifier", () => {
  const workerSources = {
    workerSession: ({ role, workerId, mode = "any" }) => ({
      role: { id: role, label: "Executor" },
      workerId,
      mode,
      focus: { kind: "active_task", reason: "Active task in progress" },
      counts: { active: 1 },
      inbox: { counts: { assigned: 1 } },
      purposeGuidance: { purpose: "continue active task" }
    }),
    workerHandoff: () => ({ currentTask: null }),
    workerCloseout: () => ({ report: { task: null } }),
    taskNext: () => ({ candidate: { id: "TASK-31" } })
  };

  const directWorker = runtimeWorkerPackFromSources({ role: "executor", workerId: "bee-1" }, workerSources);
  assert.equal(directWorker.recommendedSurface, "worker:session");
  assert.equal(directWorker.recommendedReason, "active_task_priority");
  assert.equal(directWorker.next.focus.kind, "active_task");
  assert.equal(directWorker.purposeGuidance.purpose, "continue active task");

  const delegatedWorker = runtimeWorkerPackSurface({ role: "executor", workerId: "bee-1" }, workerSources);
  assert.deepEqual(delegatedWorker, directWorker);

  const ownerSources = {
    workerSession: ({ role, workerId, mode }) => ({
      role: { id: role, label: "Executor" },
      workerId,
      mode,
      focus: null,
      counts: { active: 0 },
      inbox: { counts: { assigned: 0 } }
    }),
    workerHandoff: () => ({ currentTask: null }),
    workerCloseout: () => ({ report: { task: null } }),
    taskNext: ({ mode }) => (mode === "owner" ? { candidate: { id: "TASK-32" } } : { candidate: null })
  };

  const directOwner = runtimeOwnerPackFromSources({ role: "executor", workerId: "bee-1" }, ownerSources);
  assert.equal(directOwner.recommendedSurface, "task:pickup --role executor --worker bee-1 --mode owner");
  assert.equal(directOwner.recommendedReason, "pickup_next_priority");
  assert.equal(directOwner.next.candidate.id, "TASK-32");

  const delegatedOwner = runtimeOwnerPackSurface({ role: "executor", workerId: "bee-1" }, ownerSources);
  assert.deepEqual(delegatedOwner, directOwner);

  const verifierSources = {
    runtimeReview: () => ({ next: { taskId: "TASK-33" }, counts: { pending: 1 }, summary: "review queue waiting" }),
    verifierBundle: () => ({ currentTask: null }),
    workerCloseout: () => ({ report: { task: null } }),
    taskNext: ({ mode }) => (mode === "verifier" ? { candidate: { id: "TASK-34" } } : { candidate: null })
  };

  const directVerifier = runtimeVerifierPackFromSources({ role: "executor", workerId: "bee-1" }, verifierSources);
  assert.equal(directVerifier.recommendedSurface, "runtime:review");
  assert.equal(directVerifier.recommendedReason, "review_queue_waiting");
  assert.equal(directVerifier.next.review.taskId, "TASK-33");
  assert.match(directVerifier.summary, /review queue waiting/);

  const delegatedVerifier = runtimeVerifierPackSurface({ role: "executor", workerId: "bee-1" }, verifierSources);
  assert.deepEqual(delegatedVerifier, directVerifier);

  const api = {
    workerSession: ({ role, workerId, mode = "any" }) => {
      if (mode === "owner") {
        return { role: { id: role, label: "Executor" }, workerId, mode, focus: null, counts: { active: 0 }, inbox: { counts: { assigned: 0 } } };
      }
      return { role: { id: role, label: "Executor" }, workerId, mode, focus: { kind: "active_task", reason: "Active task in progress" }, counts: { active: 1 }, inbox: { counts: { assigned: 1 } }, purposeGuidance: { purpose: "continue active task" } };
    },
    workerHandoff: () => ({ currentTask: null }),
    workerCloseout: () => ({ report: { task: null } }),
    taskNext: ({ mode }) => {
      if (mode === "owner") return { candidate: { id: "TASK-32" } };
      if (mode === "verifier") return { candidate: { id: "TASK-34" } };
      return { candidate: { id: "TASK-31" } };
    },
    verifierBundle: () => ({ currentTask: null })
  };

  const runtimeOverview = {
    runtimeRoles: () => ({
      roles: [{ role: { id: "executor", label: "Executor" }, counts: { pendingReview: 1, ownerClaimable: 1 }, nextAction: null }]
    }),
    runtimeReview: verifierSources.runtimeReview
  };

  const entrypoints = createStateRuntimeSessionPackSessionRoleEntryPoints(api, runtimeOverview);
  const entryWorker = entrypoints.runtimeWorkerPack({ role: "executor", workerId: "bee-1" });
  assert.equal(entryWorker.recommendedSurface, "worker:session");
  assert.equal(entryWorker.recommendedReason, "active_task_priority");

  const entryOwner = entrypoints.runtimeOwnerPack({ role: "executor", workerId: "bee-1" });
  assert.equal(entryOwner.recommendedSurface, "task:pickup --role executor --worker bee-1 --mode owner");
  assert.equal(entryOwner.recommendedReason, "pickup_next_priority");

  const entryVerifier = entrypoints.runtimeVerifierPack({ role: "executor", workerId: "bee-1" });
  assert.equal(entryVerifier.recommendedSurface, "runtime:review");
  assert.equal(entryVerifier.recommendedReason, "review_queue_waiting");
  assert.equal(entryVerifier.next.review.taskId, "TASK-33");
});

runProbe("orchestration-overview", () => {
  const handoffSources = {
    runtimeHandoffs: () => ({ counts: { reviewDecisions: 1 }, next: { taskId: "TASK-41" }, summary: "handoff review decision waiting" }),
    runtimeDispatch: () => ({ counts: { totalAssignments: 1 }, next: { assignment: { id: "TASK-42" } }, summary: "dispatch summary" }),
    runtimeReview: () => ({ counts: { totalPendingReview: 1 }, next: { taskId: "TASK-43" }, summary: "review summary" }),
    runtimeRecovery: () => ({ counts: { totalEntries: 1 }, next: { entryId: "REC-1" }, summary: "recovery summary" })
  };
  const directHandoff = runtimeHandoffPackFromSources(handoffSources);
  assert.equal(directHandoff.recommendedSurface, "runtime:handoffs");
  assert.equal(directHandoff.recommendedReason, "review_handoffs_waiting");
  assert.equal(directHandoff.next.handoff.taskId, "TASK-41");
  const delegatedHandoff = runtimeHandoffPackSurface(handoffSources);
  assert.deepEqual(delegatedHandoff, directHandoff);

  const triageSources = {
    runtimeFocus: () => ({ focus: { type: "blocked_task", priority: "high" }, summary: "blocked focus summary" }),
    runtimeAlerts: () => ({ counts: { high: 1, medium: 0 }, alerts: [{ id: "ALT-1" }], summary: "alerts summary" }),
    runtimeReview: () => ({ counts: { totalPendingReview: 1 }, next: { taskId: "TASK-43" }, summary: "review summary" }),
    runtimeRecovery: () => ({ counts: { totalEntries: 1 }, next: { entryId: "REC-1" }, summary: "recovery summary" })
  };
  const directTriage = runtimeTriagePackFromSources(triageSources);
  assert.equal(directTriage.recommendedSurface, "runtime:focus");
  assert.equal(directTriage.recommendedReason, "blocked_focus_priority");
  assert.equal(directTriage.next.focus.type, "blocked_task");
  const delegatedTriage = runtimeTriagePackSurface(triageSources);
  assert.deepEqual(delegatedTriage, directTriage);

  const signalSources = {
    runtimeFocus: triageSources.runtimeFocus,
    runtimeAlerts: triageSources.runtimeAlerts,
    runtimeActivity: () => ({ counts: { totalEntries: 2 }, next: { entryId: "ACT-1" }, summary: "activity summary" }),
    runtimeRoles: () => ({ counts: { withPendingReview: 1, withBlockedOwnerWork: 0 }, next: { role: { id: "executor" } }, summary: "roles summary" })
  };
  const directSignal = runtimeSignalPackFromSources({}, signalSources);
  assert.equal(directSignal.recommendedSurface, "runtime:focus");
  assert.equal(directSignal.recommendedReason, "blocked_focus_priority");
  assert.equal(directSignal.next.focus.type, "blocked_task");
  const delegatedSignal = runtimeSignalPackSurface({}, signalSources);
  assert.deepEqual(delegatedSignal, directSignal);

  const runtimeLeader = {
    leaderAssignmentDispatchBundle: () => ({ counts: { launches: 0 }, next: null }),
    leaderAssignmentLaunchPlan: () => ({ counts: { steps: 0 }, next: null })
  };
  const runtimeOverview = {
    runtimeDashboard: () => ({ summary: "dashboard summary" }),
    runtimeAlerts: triageSources.runtimeAlerts,
    runtimeRoles: signalSources.runtimeRoles,
    runtimeDispatch: handoffSources.runtimeDispatch,
    runtimeReview: handoffSources.runtimeReview,
    runtimeFocus: triageSources.runtimeFocus,
    runtimeActivity: signalSources.runtimeActivity,
    runtimeHandoffs: handoffSources.runtimeHandoffs,
    runtimeCloseout: () => ({ counts: { totalReady: 0 }, next: null }),
    runtimeRecovery: handoffSources.runtimeRecovery
  };
  const entrypoints = createStateRuntimeOrchestrationPackOverviewEntryPoints(runtimeLeader, runtimeOverview);
  const entryHandoff = entrypoints.runtimeHandoffPack();
  assert.equal(entryHandoff.recommendedSurface, "runtime:handoffs");
  assert.equal(entryHandoff.recommendedReason, "review_handoffs_waiting");
  const entryTriage = entrypoints.runtimeTriagePack();
  assert.equal(entryTriage.recommendedSurface, "runtime:focus");
  assert.equal(entryTriage.recommendedReason, "blocked_focus_priority");
  const entrySignal = entrypoints.runtimeSignalPack();
  assert.equal(entrySignal.recommendedSurface, "runtime:focus");
  assert.equal(entrySignal.recommendedReason, "blocked_focus_priority");
});

console.log("runtime pack probes: ok");
