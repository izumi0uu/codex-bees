import { requireOption, readOption, readPositiveIntegerOption, write } from "./state-cli-helpers.js";
import { workerCloseout, workerHandoff, workerSession } from "./state-runtime.js";

export function handleWorkerSession() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const session = workerSession({
    role,
    workerId,
    mode: readOption("--mode"),
    limit: readPositiveIntegerOption("--limit")
  });
  write(JSON.stringify({ session }, null, 2) + "\n");
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
  write(JSON.stringify({ handoff }, null, 2) + "\n");
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
  write(JSON.stringify({ closeout }, null, 2) + "\n");
}
