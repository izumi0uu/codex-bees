import { PRODUCT_NAME } from "../metadata.js";
import { listMemories, listSwarms, listTasks } from "../state-runtime.js";

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatCommand(command, productName = PRODUCT_NAME) {
  return `${productName} ${command}`;
}

function buildSuggestion(command, reason, productName = PRODUCT_NAME) {
  return {
    command: formatCommand(command, productName),
    reason
  };
}

function buildOnboardingGuide(productName = PRODUCT_NAME) {
  const suggestions = [
    buildSuggestion("init --preview", "preview the shipped .codex bootstrap assets before writing files", productName),
    buildSuggestion("init", "materialize the shipped .codex project assets", productName),
    buildSuggestion('plan --task "Ship a bounded local feature"', "turn one objective into a bounded plan", productName),
    buildSuggestion('task:add --title "Inspect CLI ergonomics"', "create one explicit local work item", productName),
    buildSuggestion("tools", "inspect the current MCP tool catalog", productName),
    buildSuggestion("mcp --help", "start from the stdio MCP surface", productName)
  ];

  return {
    guideMode: "onboarding",
    summary: "The repo has no tracked tasks, swarms, or memories yet; start by bootstrapping assets or shaping one bounded objective.",
    suggestions,
    next: [
      `use \`${formatCommand("init", productName)}\` to materialize the shipped .codex project assets`,
      `use \`${formatCommand("doctor", productName)}\` to inspect runtime boundaries`,
      `use \`${formatCommand("tools", productName)}\` to inspect current MCP tool catalog`,
      `use \`${formatCommand("task:add --title ...", productName)}\` to create local work items`,
      `use \`${formatCommand("swarm:init --objective ...", productName)}\` to stage a bounded local swarm`,
      `use \`${formatCommand("mcp", productName)}\` to start the stdio MCP surface`
    ]
  };
}

function buildDynamicNext(suggestions = []) {
  return suggestions.map(({ command, reason }) => `use \`${command}\` to ${reason}`);
}

export function getRuntimeCliGuide({ productName = PRODUCT_NAME } = {}) {
  const tasks = listTasks();
  const swarms = listSwarms();
  const memories = listMemories();

  const reviewTasks = tasks.filter((task) => task.queueStatus === "ready_for_review");
  const blockedTasks = tasks.filter((task) => task.queueStatus === "blocked");
  const queuedTasks = tasks.filter((task) => ["queued", "released"].includes(task.queueStatus));
  const activeTasks = tasks.filter((task) => task.queueStatus === "claimed");
  const doneStandaloneTasks = tasks.filter((task) => task.queueStatus === "done" && !task.swarmId);

  const plannedSwarms = swarms.filter((swarm) => swarm.status === "planned");
  const activeSwarms = swarms.filter((swarm) => swarm.status === "active");
  const blockedSwarms = swarms.filter((swarm) => swarm.status === "blocked");
  const closedSwarms = swarms.filter((swarm) => ["completed", "cancelled"].includes(swarm.status));

  const stateCounts = {
    tasks: tasks.length,
    swarms: swarms.length,
    memories: memories.length,
    readyForReview: reviewTasks.length,
    blockedTasks: blockedTasks.length,
    queuedTasks: queuedTasks.length,
    activeTasks: activeTasks.length,
    plannedSwarms: plannedSwarms.length,
    activeSwarms: activeSwarms.length,
    blockedSwarms: blockedSwarms.length,
    closedSwarms: closedSwarms.length
  };

  if (tasks.length + swarms.length + memories.length === 0) {
    return {
      ...buildOnboardingGuide(productName),
      stateCounts
    };
  }

  if (reviewTasks.length > 0) {
    const task = reviewTasks[0];
    const verifier = task.verifier ?? "<actor>";
    const suggestions = [
      buildSuggestion(`task:approve --id ${task.id} --by ${verifier}`, "approve the top verifier-ready task", productName),
      buildSuggestion(`task:reject --id ${task.id} --by ${verifier}`, "send that task back with requested changes if it is not ready", productName),
      buildSuggestion("runtime:review", "inspect verifier-grouped review work before deciding", productName),
      buildSuggestion("runtime:focus", "see the single next runtime action across review and dispatch pressure", productName)
    ];
    return {
      guideMode: "review",
      summary: `${pluralize(reviewTasks.length, "task")} ${reviewTasks.length === 1 ? "is" : "are"} waiting on verifier decisions; start with ${task.id}.`,
      suggestions,
      next: buildDynamicNext(suggestions),
      stateCounts
    };
  }

  if (blockedTasks.length > 0 || blockedSwarms.length > 0) {
    const task = blockedTasks[0] ?? null;
    const swarm = blockedSwarms[0] ?? null;
    const suggestions = [
      buildSuggestion("runtime:recovery", "inspect blocked and changes-requested work first", productName),
      ...(task ? [buildSuggestion(`task:get --id ${task.id}`, "inspect the highest-priority blocked task in detail", productName)] : []),
      ...(swarm ? [buildSuggestion(`swarm:overview --id ${swarm.id}`, "inspect the blocked swarm and its lane status", productName)] : []),
      buildSuggestion("runtime:focus", "confirm whether recovery pressure should outrank dispatch work", productName)
    ];
    return {
      guideMode: "recovery",
      summary: `Recovery pressure is active across ${pluralize(blockedTasks.length, "blocked task")} and ${pluralize(blockedSwarms.length, "blocked swarm")}.`,
      suggestions,
      next: buildDynamicNext(suggestions),
      stateCounts
    };
  }

  if (plannedSwarms.length > 0) {
    const swarm = plannedSwarms[0];
    const suggestions = [
      buildSuggestion(`swarm:queue --id ${swarm.id}`, "turn the top planned swarm into queued local tasks", productName),
      buildSuggestion(`swarm:overview --id ${swarm.id}`, "inspect the next planned swarm before queueing it", productName),
      buildSuggestion("leader:workspace", "open the leader workspace for orchestration context", productName)
    ];
    return {
      guideMode: "swarm-queue",
      summary: `${pluralize(plannedSwarms.length, "planned swarm")} ${plannedSwarms.length === 1 ? "is" : "are"} ready to become queued execution work; start with ${swarm.id}.`,
      suggestions,
      next: buildDynamicNext(suggestions),
      stateCounts
    };
  }

  if (queuedTasks.length > 0) {
    const task = queuedTasks[0];
    const suggestions = [
      buildSuggestion("runtime:dispatch-ranking", "rank queue-ready work before assigning or picking it up", productName),
      buildSuggestion("leader:workspace", "see the current leader dispatch context across swarms", productName),
      buildSuggestion(`task:get --id ${task.id}`, "inspect the first queue-ready task directly", productName),
      buildSuggestion("runtime:focus", "confirm whether dispatch is the next dominant action", productName)
    ];
    return {
      guideMode: "dispatch",
      summary: `${pluralize(queuedTasks.length, "task")} ${queuedTasks.length === 1 ? "is" : "are"} queue-ready and waiting for dispatch or pickup; ${task.id} is the first concrete entry.`,
      suggestions,
      next: buildDynamicNext(suggestions),
      stateCounts
    };
  }

  if (activeTasks.length > 0 || activeSwarms.length > 0) {
    const task = activeTasks[0] ?? null;
    const suggestions = [
      buildSuggestion("runtime:focus", "see the single next action across active execution", productName),
      buildSuggestion("runtime:summary-pack", "inspect the compact operator summary with launch context", productName),
      ...(task ? [buildSuggestion(`task:get --id ${task.id}`, "inspect the currently claimed task in detail", productName)] : []),
      buildSuggestion("runtime:activity", "review the most recent execution activity", productName)
    ];
    return {
      guideMode: "active",
      summary: `Execution is already in flight across ${pluralize(activeTasks.length, "claimed task")} and ${pluralize(activeSwarms.length, "active swarm")}.`,
      suggestions,
      next: buildDynamicNext(suggestions),
      stateCounts
    };
  }

  if (doneStandaloneTasks.length > 0 || closedSwarms.length > 0) {
    const task = doneStandaloneTasks[0] ?? null;
    const swarm = closedSwarms[0] ?? null;
    const suggestions = [
      ...(task ? [buildSuggestion(`task:archive --id ${task.id}`, "archive the top standalone completed task", productName)] : []),
      ...(swarm ? [buildSuggestion(`swarm:closeout --id ${swarm.id}`, "inspect the top closed swarm for closeout and archive readiness", productName)] : []),
      buildSuggestion("runtime:closeout", "review everything currently ready for closure", productName)
    ];
    return {
      guideMode: "closeout",
      summary: `Closure work is waiting across ${pluralize(doneStandaloneTasks.length, "done standalone task")} and ${pluralize(closedSwarms.length, "closed swarm")}.`,
      suggestions,
      next: buildDynamicNext(suggestions),
      stateCounts
    };
  }

  const suggestions = [
    buildSuggestion("status", "inspect the current runtime envelope", productName),
    buildSuggestion("commands", "browse the full command catalog", productName),
    buildSuggestion("runtime:summary-pack", "open the compact runtime summary", productName),
    buildSuggestion("task:list", "inspect all local coordination tasks", productName)
  ];
  return {
    guideMode: "steady-state",
    summary: "The runtime is loaded but no single queue or recovery pressure dominates right now; use summary surfaces to choose the next move.",
    suggestions,
    next: buildDynamicNext(suggestions),
    stateCounts
  };
}
