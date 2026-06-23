const VALID_RUNTIME_PACK_DETAILS = new Set(["compact", "full"]);

function appendCommandOption(parts, flag, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  parts.push(flag, value);
}

function appendJsonCommandOption(parts, flag, value) {
  if (value === undefined || value === null) {
    return;
  }

  parts.push(flag, `'${JSON.stringify(value)}'`);
}

export function normalizeRuntimePackDetail(detail, fallback = "compact") {
  return VALID_RUNTIME_PACK_DETAILS.has(detail) ? detail : fallback;
}

export function buildRuntimePackCommand(command, input = {}, overrides = {}) {
  const parts = ["node ./src/index.js", command];
  const resolved = {
    ...input,
    ...overrides
  };

  appendCommandOption(parts, "--role", resolved.role);
  appendCommandOption(parts, "--worker", resolved.workerId);
  appendJsonCommandOption(parts, "--workers", resolved.workerIds);
  appendCommandOption(parts, "--mode", resolved.mode);
  appendCommandOption(parts, "--status", resolved.status);
  appendCommandOption(parts, "--topology", resolved.topology);
  appendCommandOption(parts, "--owner", resolved.owner);
  appendCommandOption(parts, "--detail", resolved.detail);

  return parts.join(" ");
}

export function buildRuntimePackExpansionEntry(surface, command) {
  if (!surface || !command) {
    return null;
  }

  return {
    surface,
    command
  };
}

export function buildRuntimePackPresenceMetadata(entries = {}) {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, Boolean(value)])
  );
}

export function countRuntimePackEntries(entries = {}) {
  return Object.values(entries).filter(Boolean).length;
}
