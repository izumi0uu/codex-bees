import {
  verifierBundleFromSources,
  workerCloseoutFromSources,
  workerHandoffFromSources,
  workerSessionFromSources
} from "../worker/surfaces.js";

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
    return workerSessionFromSources(input, workerSessionSources);
  }

  function workerHandoff(input = {}) {
    return workerHandoffFromSources(input, workerHandoffSources);
  }

  function workerCloseout(input = {}) {
    return workerCloseoutFromSources(input, workerCloseoutSources);
  }

  function verifierBundle(input = {}) {
    return verifierBundleFromSources(input, verifierBundleSources);
  }

  const workerSessionSources = {
    loadState,
    normalizeTask,
    taskInbox,
    taskNext,
    taskBrief: api.taskBrief
  };
  const workerHandoffSources = {
    workerSession
  };
  const workerCloseoutSources = {
    workerHandoff,
    taskReport: api.taskReport
  };
  const verifierBundleSources = {
    workerSession,
    workerHandoff,
    taskReport: api.taskReport
  };

  return {
    workerSession,
    workerHandoff,
    workerCloseout,
    verifierBundle
  };
}
