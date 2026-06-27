import { buildPurposeGuidanceForTaskLike } from "../../task/lane-purpose.js";

export const RUNTIME_PACK_DETAILS = Object.freeze(["compact", "full"]);

const VALID_RUNTIME_PACK_DETAILS = new Set(RUNTIME_PACK_DETAILS);

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
export function buildRuntimePackCliExpansionEntry(command) {
  return buildRuntimePackExpansionEntry(command, `node ./src/index.js ${command}`);
}
export function buildRuntimePackCommandExpansionEntry(command, input = {}, overrides = {}) {
  return buildRuntimePackExpansionEntry(command, buildRuntimePackCommand(command, input, overrides));
}
export function buildRuntimePackExpansion(detailLevel, expansion) {
  return detailLevel === "compact" ? expansion : null;
}
export function attachRuntimePackSurfaces(pack, detailLevel, surfaces) {
  if (detailLevel === "full") {
    pack.surfaces = surfaces;
  }

  return pack;
}
export function buildRuntimePackPresenceMetadata(entries = {}) {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, Boolean(value)])
  );
}
export function countRuntimePackEntries(entries = {}) {
  return Object.values(entries).filter(Boolean).length;
}
export function buildRuntimePackCounts(entries = {}) {
  return {
    surfacedNextEntries: countRuntimePackEntries(entries)
  };
}
export function buildRuntimePackFocusOverview(focusView) {
  return focusView?.focus
    ? {
        type: focusView.focus.type,
        priority: focusView.focus.priority
      }
    : null;
}
export function buildRuntimePackPickupOverview(pickup) {
  return pickup
    ? {
        outcome: pickup.outcome,
        command: pickup.command,
        candidateId: pickup.candidate?.id ?? null,
        purpose: pickup.purposeGuidance?.purpose ?? null
      }
    : null;
}
export function resolveRuntimePackPurposeGuidance(...sources) {
  for (const source of sources) {
    if (source?.purposeGuidance) {
      return source.purposeGuidance;
    }
  }

  return null;
}
export function buildRuntimePackFallbackPurposeGuidance(taskLike, ...sources) {
  return resolveRuntimePackPurposeGuidance(...sources) ?? buildPurposeGuidanceForTaskLike(taskLike ?? null);
}
export function buildRuntimePackSessionOverview(session) {
  return {
    session: session?.counts ?? null,
    inbox: session?.inbox?.counts ?? null
  };
}
export function requireRuntimePackRoleWorkerSelection(input) {
  if (!input?.role || !input?.workerId) {
    return null;
  }

  return {
    role: input.role,
    workerId: input.workerId
  };
}
