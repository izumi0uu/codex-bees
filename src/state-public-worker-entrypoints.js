import { createStateWorkerQueueEntryPoints } from "./state-public-worker-queue-entrypoints.js";
import { createStateWorkerSessionEntryPoints } from "./state-public-worker-session-entrypoints.js";

export function createStateWorkerEntryPoints(shared, api) {
  const workerQueue = createStateWorkerQueueEntryPoints(shared, api);
  const workerSession = createStateWorkerSessionEntryPoints(shared, api, workerQueue);

  return {
    ...workerQueue,
    workerSession: workerSession.workerSession,
    workerHandoff: workerSession.workerHandoff,
    workerCloseout: workerSession.workerCloseout,
    verifierBundle: workerSession.verifierBundle
  };
}
