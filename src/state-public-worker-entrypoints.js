import { createStateWorkerQueueEntryPoints } from "./state-public-worker-queue-entrypoints.js";
import { createStateWorkerSessionEntryPoints } from "./state-public-worker-session-entrypoints.js";

export function createStateWorkerEntryPoints(shared, api) {
  const workerQueue = createStateWorkerQueueEntryPoints(shared, api);
  const workerSession = createStateWorkerSessionEntryPoints(shared, api, workerQueue);
  const {
    taskInbox,
    taskNext,
    taskPickup,
    taskAssignmentPickup,
    previewTaskAssignment,
    previewTaskPickup
  } = workerQueue;
  const {
    workerSession: workerSessionEntry,
    workerHandoff,
    workerCloseout,
    verifierBundle
  } = workerSession;

  return {
    taskInbox,
    taskNext,
    taskPickup,
    taskAssignmentPickup,
    previewTaskAssignment,
    previewTaskPickup,
    workerSession: workerSessionEntry,
    workerHandoff,
    workerCloseout,
    verifierBundle
  };
}
