import { readRequiredRoleWorkerOptions } from "./role-worker-options.js";
import { workerCloseout, workerHandoff, workerSession } from "../../state-runtime.js";
import { writeNamedView } from "./view-writers.js";

export function handleWorkerSession() {
  const session = workerSession(readRequiredRoleWorkerOptions({ mode: true, limit: true }));
  writeNamedView("session", session);
}

export function handleWorkerHandoff() {
  const handoff = workerHandoff(readRequiredRoleWorkerOptions({ mode: true, limit: true }));
  writeNamedView("handoff", handoff);
}

export function handleWorkerCloseout() {
  const closeout = workerCloseout(readRequiredRoleWorkerOptions({ mode: true, limit: true }));
  writeNamedView("closeout", closeout);
}
