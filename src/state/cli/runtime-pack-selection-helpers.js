import { readJsonOption, readOption } from "./helpers.js";

export function readWorkerSelectionOptions() {
  return {
    workerId: readOption("--worker"),
    workerIds: readJsonOption("--workers")
  };
}

export function readWorkerSelectionDetailOptions() {
  return {
    ...readWorkerSelectionOptions(),
    detail: readOption("--detail")
  };
}
