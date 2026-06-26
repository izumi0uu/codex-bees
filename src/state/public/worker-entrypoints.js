import { createStateWorkerQueueEntryPoints } from "./worker-queue-entrypoints.js";
import { createStateWorkerSessionEntryPoints } from "./worker-session-entrypoints.js";

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
