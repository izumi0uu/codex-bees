import { getRuntimeCatalog } from "./catalog.js";
import { getPackageMetadata } from "./metadata.js";
import { listMcpTools } from "./state/mcp/tool-catalog.js";
import { listMemories, listSwarms, listTasks } from "./state-runtime.js";
import { getCapabilityCatalog } from "./runtime-capability-catalog.js";
import { countBy } from "./runtime-status-helpers.js";

export function getRuntimeStatus({ version, toolCount } = {}) {
  const metadata = getPackageMetadata();
  const catalog = getRuntimeCatalog();
  const tasks = listTasks();
  const swarms = listSwarms();
  const memories = listMemories();
  const capabilities = getCapabilityCatalog();
  const resolvedToolCount = toolCount ?? listMcpTools().length;
  const highlights = capabilities.flatMap((capability) => capability.highlights ?? []).slice(0, 6);
  const recommendedEntryPoints = {
    cli: [...new Set(capabilities.flatMap((capability) => capability.preferredEntryPoints?.cli ?? []))].slice(0, 6),
    mcp: [...new Set(capabilities.flatMap((capability) => capability.preferredEntryPoints?.mcp ?? []))].slice(0, 6)
  };
  const useCases = [...new Set(capabilities.flatMap((capability) => capability.useCases ?? []))].slice(0, 6);

  return {
    product: metadata.product,
    version: version ?? metadata.version,
    mode: metadata.mode,
    counts: {
      tools: resolvedToolCount,
      agents: catalog.agents.length,
      skills: catalog.skills.length,
      capabilities: capabilities.length,
      tasks: tasks.length,
      swarms: swarms.length,
      memories: memories.length
    },
    state: {
      taskQueueStatuses: countBy(tasks, (task) => task.queueStatus),
      swarmStatuses: countBy(swarms, (swarm) => swarm.status),
      memoryNamespaces: countBy(memories, (memory) => memory.namespace)
    },
    highlights,
    recommendedEntryPoints,
    useCases,
    catalog,
    capabilities: capabilities.map((capability) => ({
      id: capability.id,
      category: capability.category,
      cliCommandCount: capability.cliCommands.length,
      mcpToolCount: capability.mcpTools.length,
      highlights: capability.highlights ?? [],
      preferredEntryPoints: capability.preferredEntryPoints ?? { cli: [], mcp: [] },
      useCases: capability.useCases ?? []
    }))
  };
}

export function getRuntimeStatusView({ version, toolCount } = {}) {
  const status = getRuntimeStatus({ version, toolCount });
  const trackedStateEntries =
    status.counts.tasks +
    status.counts.swarms +
    status.counts.memories;

  return {
    kind: "runtime_status_view",
    recommendedReason: trackedStateEntries > 0 ? "runtime_state_visible" : "runtime_state_empty",
    counts: {
      ...status.counts,
      trackedStateEntries
    },
    status
  };
}
