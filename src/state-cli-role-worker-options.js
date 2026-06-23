import {
  exit,
  readOption,
  readPositiveIntegerOption,
  requireOption,
  writeErr
} from "./state-cli-helpers.js";

function readRequiredRoleOptions({ mode = false, limit = false } = {}) {
  const options = {
    role: requireOption("--role")
  };

  if (mode) {
    options.mode = readOption("--mode");
  }

  if (limit) {
    options.limit = readPositiveIntegerOption("--limit");
  }

  return options;
}

function readRequiredRoleWorkerOptions({ mode = false, limit = false } = {}) {
  return {
    ...readRequiredRoleOptions({ mode, limit }),
    workerId: requireOption("--worker")
  };
}

function readRoleOptionalWorkerOptions({ mode = false, limit = false } = {}) {
  return {
    ...readRequiredRoleOptions({ mode, limit }),
    workerId: readOption("--worker")
  };
}

function requireNamedRoleWorkerOptions(commandName) {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr(`${commandName} requires --role and --worker\n`);
    exit(1);
  }

  return { role, workerId };
}

function requireNamedRoleOption(commandName) {
  const role = readOption("--role");
  if (!role) {
    writeErr(`${commandName} requires --role\n`);
    exit(1);
  }

  return role;
}

export {
  readRequiredRoleOptions,
  readRequiredRoleWorkerOptions,
  readRoleOptionalWorkerOptions,
  requireNamedRoleOption,
  requireNamedRoleWorkerOptions
};
