import { getAgentCatalogDocumentView, getRuntimeCatalog } from "./catalog.js";

const ROLE_CONTRACT_CACHE = new Map();

function normalizeSectionTitle(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findDocumentSection(document, title) {
  const wanted = normalizeSectionTitle(title);
  return document?.sections?.find((section) => normalizeSectionTitle(section.title) === wanted) ?? null;
}

function extractSectionItemsByLabel(content) {
  const groups = new Map();
  let currentLabel = null;

  for (const rawLine of String(content ?? "").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const labelMatch = /^([^:]+):\s*$/.exec(line);
    if (labelMatch) {
      currentLabel = normalizeSectionTitle(labelMatch[1]);
      if (!groups.has(currentLabel)) {
        groups.set(currentLabel, []);
      }
      continue;
    }

    const itemMatch = /^\s*[-*]\s+(.+?)\s*$/.exec(rawLine);
    if (!itemMatch || !currentLabel) {
      continue;
    }

    const items = groups.get(currentLabel) ?? [];
    items.push(itemMatch[1].trim());
    groups.set(currentLabel, items);
  }

  return Object.fromEntries(groups.entries());
}

function compactItems(items, limit) {
  return (Array.isArray(items) ? items : []).filter(Boolean).slice(0, limit);
}

function summarizeRoleContract(roleId, catalog = getRuntimeCatalog()) {
  if (!roleId) {
    return null;
  }

  const cacheKey = `${catalog?.source ?? "missing"}:${catalog?.paths?.agentDir ?? ""}:${roleId}`;
  if (ROLE_CONTRACT_CACHE.has(cacheKey)) {
    return ROLE_CONTRACT_CACHE.get(cacheKey);
  }

  const agent = catalog?.agents?.find((item) => item.id === roleId) ?? null;
  const documentView = getAgentCatalogDocumentView(roleId);
  const document = documentView.document;
  const ownershipSection = findDocumentSection(document, "Ownership");
  const ownershipGroups = extractSectionItemsByLabel(ownershipSection?.content ?? "");
  const contract = document
    ? {
        title: document.title ?? agent?.name ?? roleId,
        summary: document.summary ?? agent?.description ?? null,
        boundaries: compactItems(
          ownershipGroups["you do not own"] ?? ownershipGroups["do not own"] ?? [],
          2
        ),
        workingRules: compactItems(findDocumentSection(document, "Working rules")?.items, 3),
        handoffExpectations: compactItems(findDocumentSection(document, "Handoff expectations")?.items, 2),
        verificationFocus: compactItems(findDocumentSection(document, "Verification posture")?.items, 2),
        stopAndEscalate: compactItems(findDocumentSection(document, "Stop and escalate")?.items, 2)
      }
    : null;

  ROLE_CONTRACT_CACHE.set(cacheKey, contract);
  return contract;
}

export function annotateTaskDependencyState(task, tasks = []) {
  const dependencySummary = summarizeTaskDependencies(task, tasks);
  return {
    ...task,
    dependencyReady: dependencySummary.ready,
    dependencySummary
  };
}

export function annotateTasksWithDependencyState(tasks = []) {
  return tasks.map((task) => annotateTaskDependencyState(task, tasks));
}

export function listTasksFromSources({ loadState, normalizeTask }) {
  const tasks = loadState().tasks;
  if (typeof normalizeTask !== "function") {
    return tasks;
  }
  return annotateTasksWithDependencyState(tasks.map(normalizeTask));
}

export function getTaskFromSources(id, { loadState, normalizeTask }) {
  const tasks = annotateTasksWithDependencyState(loadState().tasks.map(normalizeTask));
  return tasks.find((item) => item.id === id) ?? null;
}

export function validateTaskFromSources(
  id,
  {
    loadState,
    normalizeTask,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog
  }
) {
  const tasks = annotateTasksWithDependencyState(loadState().tasks.map(normalizeTask));
  const task = tasks.find((item) => item.id === id) ?? null;
  if (!task) {
    return null;
  }
  return buildTaskValidationViewFromSources(
    task,
    {
      runtimeRoleCatalog,
      tasks
    }
  );
}

export function appendTaskHistoryEntry(task, entry) {
  const existing = Array.isArray(task.history) ? task.history : [];
  return [
    ...existing,
    {
      id: `event-${existing.length + 1}`,
      ...entry
    }
  ];
}

export function appendTaskAnnotation(task, annotation) {
  const existing = Array.isArray(task.annotations) ? task.annotations : [];
  return [
    ...existing,
    {
      id: `annotation-${existing.length + 1}`,
      ...annotation
    }
  ];
}

export function describeRole(roleId, catalog = getRuntimeCatalog()) {
  if (!roleId) {
    return {
      id: null,
      exists: false,
      name: null,
      description: null,
      promptPath: null,
      source: "missing"
    };
  }

  const agent = catalog.agents.find((item) => item.id === roleId) ?? null;
  return {
    id: roleId,
    exists: Boolean(agent),
    name: agent?.name ?? roleId,
    description: agent?.description ?? null,
    promptPath: agent?.path ?? null,
    source: agent?.source ?? catalog.source ?? "missing"
  };
}

export function describeRoleWithContract(roleId, catalog = getRuntimeCatalog()) {
  const role = describeRole(roleId, catalog);
  return {
    ...role,
    contract: role.exists ? summarizeRoleContract(roleId, catalog) : null
  };
}

export function deriveReviewState(task) {
  if (task.queueStatus === "ready_for_review") {
    return "pending_verifier";
  }
  if (task.reviewOutcome === "approved") {
    return "approved";
  }
  if (task.reviewOutcome === "changes_requested") {
    return "changes_requested";
  }
  return "not_started";
}

export function dependencyRefs(task) {
  return Array.isArray(task?.dependsOn) ? Array.from(new Set(task.dependsOn.filter(Boolean))) : [];
}

export function resolveTaskDependencyTask(task, ref, tasks = []) {
  if (!ref) {
    return null;
  }

  const direct = tasks.find((candidate) => candidate.id === ref && candidate.id !== task.id) ?? null;
  if (direct) {
    return direct;
  }

  if (task.swarmId) {
    const byLaneInSwarm = tasks.find(
      (candidate) =>
        candidate.id !== task.id &&
        candidate.swarmId === task.swarmId &&
        candidate.lane === ref
    ) ?? null;
    if (byLaneInSwarm) {
      return byLaneInSwarm;
    }
  }

  if (task.objective) {
    return tasks.find(
      (candidate) =>
        candidate.id !== task.id &&
        candidate.objective === task.objective &&
        candidate.lane === ref
    ) ?? null;
  }

  return null;
}

export function summarizeTaskDependencies(task, tasks = []) {
  const refs = dependencyRefs(task);
  const resolved = refs.map((ref) => ({
    ref,
    task: resolveTaskDependencyTask(task, ref, tasks)
  }));
  const unresolvedRefs = resolved.filter((entry) => !entry.task).map((entry) => entry.ref);
  const blocking = resolved
    .filter((entry) => entry.task && entry.task.queueStatus !== "done")
    .map((entry) => entry.task);

  return {
    refs,
    ready: refs.length === 0 || (unresolvedRefs.length === 0 && blocking.length === 0),
    unresolvedRefs,
    blockingTaskIds: blocking.map((entry) => entry.id),
    blockingLanes: blocking.map((entry) => entry.lane).filter(Boolean),
    blockingOwners: blocking.map((entry) => entry.owner).filter(Boolean),
    blockingStatuses: blocking.map((entry) => entry.queueStatus),
    blocking
  };
}

export function taskDependenciesReady(task, tasks = []) {
  if (typeof task?.dependencyReady === "boolean") {
    return task.dependencyReady;
  }
  return summarizeTaskDependencies(task, tasks).ready;
}
