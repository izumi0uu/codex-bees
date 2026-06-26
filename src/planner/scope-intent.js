import { touchesPublicRuntime } from "./scope-paths.js";
import { includesAny, isInternalStateRuntimeTask } from "./scope-task-kinds.js";
import { choosePrimaryScope } from "./scope-selection.js";

export function inferPlannerIntent(task, implementationScope = choosePrimaryScope(task)) {
  const lower = task.toLowerCase();
  const docs = includesAny(lower, ["readme", "docs", "documentation", "guide", "notes", "changelog", "example", "help"]);
  const runtime = includesAny(lower, ["runtime", "cli", "command", "mcp", "tool"]);
  const internalRuntime = isInternalStateRuntimeTask(lower);
  const publicRuntime = runtime && !internalRuntime;
  const coordination = includesAny(lower, [
    "task",
    "queue",
    "claim",
    "review",
    "state",
    "swarm",
    "planner",
    "lane",
    "parallel",
    "dispatch",
    "orchestrate"
  ]);
  const build = includesAny(lower, ["build", "smoke", "script", "test", "check", "verify", "verification", "package", "pack"]);
  const catalog = includesAny(lower, ["skill", "agent", "prompt", "catalog"]);
  const docsOnly = docs && implementationScope.length === 1 && implementationScope[0] === "README.md";
  const implementationTouchesPublicRuntime = touchesPublicRuntime(implementationScope);
  const verificationHeavy = !docsOnly && (runtime || coordination || build || implementationTouchesPublicRuntime);

  return {
    docs,
    docsOnly,
    runtime,
    publicRuntime,
    internalRuntime,
    coordination,
    build,
    catalog,
    verificationHeavy,
    additionalDocsLane: docs && !docsOnly
  };
}
