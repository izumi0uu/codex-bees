import {
  verifierBundleFromSources,
  workerCloseoutFromSources,
  workerHandoffFromSources,
  workerSessionFromSources
} from "./state-worker-surfaces.js";

export function createStateWorkerSessionEntryPoints(shared, api, workerQueue) {
  const {
    loadState,
    normalizeTask
  } = shared;
  const {
    taskInbox,
    taskNext
  } = workerQueue;

  function workerSession(input = {}) {
    return workerSessionFromSources(
      input,
      {
        loadState,
        normalizeTask,
        taskInbox,
        taskNext,
        taskBrief: api.taskBrief
      }
    );
  }

  function workerHandoff(input = {}) {
    return workerHandoffFromSources(
      input,
      {
        workerSession
      }
    );
  }

  function workerCloseout(input = {}) {
    return workerCloseoutFromSources(
      input,
      {
        workerHandoff,
        taskReport: api.taskReport
      }
    );
  }

  function verifierBundle(input = {}) {
    return verifierBundleFromSources(
      input,
      {
        workerSession,
        workerHandoff,
        taskReport: api.taskReport
      }
    );
  }

  return {
    workerSession,
    workerHandoff,
    workerCloseout,
    verifierBundle
  };
}
