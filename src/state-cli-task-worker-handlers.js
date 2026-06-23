import { requireOption, readOption, readPositiveIntegerOption } from "./state-cli-helpers.js";
import { workerCloseout, workerHandoff, workerSession } from "./state-runtime.js";
import { writeNamedView } from "./state-cli-view-writers.js";

export function handleWorkerSession() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const session = workerSession({
    role,
    workerId,
    mode: readOption("--mode"),
    limit: readPositiveIntegerOption("--limit")
  });
  writeNamedView("session", session);
}

export function handleWorkerHandoff() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const handoff = workerHandoff({
    role,
    workerId,
    mode: readOption("--mode"),
    limit: readPositiveIntegerOption("--limit")
  });
  writeNamedView("handoff", handoff);
}

export function handleWorkerCloseout() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const closeout = workerCloseout({
    role,
    workerId,
    mode: readOption("--mode"),
    limit: readPositiveIntegerOption("--limit")
  });
  writeNamedView("closeout", closeout);
}
