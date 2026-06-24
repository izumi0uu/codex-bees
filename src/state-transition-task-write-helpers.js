export function buildUpdatedTaskState(current, input, updatedAt = new Date().toISOString()) {
  return {
    ...current,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.verifier !== undefined ? { verifier: input.verifier } : {}),
    ...(input.objective !== undefined ? { objective: input.objective } : {}),
    ...(input.lane !== undefined ? { lane: input.lane } : {}),
    ...(input.swarmId !== undefined ? { swarmId: input.swarmId } : {}),
    ...(input.scope !== undefined ? { scope: input.scope } : {}),
    ...(input.dependsOn !== undefined ? { dependsOn: input.dependsOn } : {}),
    ...(input.acceptance !== undefined ? { acceptance: input.acceptance } : {}),
    ...(input.verification !== undefined ? { verification: input.verification } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    updatedAt
  };
}

export function updateLoadedTaskState(
  state,
  input,
  {
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  }
) {
  const taskIndex = findTaskIndex(state, input.id);
  if (taskIndex < 0) {
    return null;
  }

  const current = normalizeTask(state.tasks[taskIndex]);
  if (input.queueStatus !== undefined) {
    return { error: "queueStatus must be changed through lifecycle commands" };
  }
  if (input.claimedBy !== undefined) {
    return { error: "claimedBy must be changed through lifecycle commands" };
  }

  const next = buildUpdatedTaskState(current, input);
  state.tasks[taskIndex] = next;
  return next;
}

export function updateTaskFromSources(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  }
) {
  const state = loadState();
  const next = updateLoadedTaskState(state, input, {
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  });
  if (!next) {
    return null;
  }
  if (next.error) {
    return next;
  }

  saveState(state);
  return next;
}

export function addTaskFromSources(
  input,
  {
    loadState,
    saveState,
    buildTask
  }
) {
  const state = loadState();
  const task = buildTask(input, state.nextId);
  state.tasks.push(task);
  state.nextId += 1;
  saveState(state);
  return task;
}

export function addTasksFromSources(
  inputs,
  {
    loadState,
    saveState,
    buildTask
  }
) {
  const state = loadState();
  const created = [];

  for (const input of inputs) {
    const task = buildTask(input, state.nextId);
    state.tasks.push(task);
    state.nextId += 1;
    created.push(task);
  }

  saveState(state);
  return created;
}

export function annotateTaskFromSources(
  input = {},
  {
    loadState,
    saveState,
    normalizeTask,
    appendTaskAnnotation
  }
) {
  if (!input.id) {
    return null;
  }

  const state = loadState();
  const index = state.tasks.findIndex((task) => task.id === input.id);
  if (index < 0) {
    return null;
  }

  const current = normalizeTask(state.tasks[index]);
  if (!input.content?.trim()) {
    return { error: "content is required for task annotation" };
  }

  const next = normalizeTask({
    ...current,
    annotations: appendTaskAnnotation(current, {
      at: new Date().toISOString(),
      actor: input.actor ?? current.claimedBy ?? null,
      kind: input.kind ?? "note",
      content: input.content.trim()
    }),
    updatedAt: new Date().toISOString()
  });

  state.tasks[index] = next;
  saveState(state);
  return next;
}
