const COMMAND_GROUPS = [
  {
    id: "bootstrap",
    label: "Core setup & inspection",
    description: "Bootstrap a repo, inspect the shipped contract, and expose the CLI, MCP, catalog, and capability surfaces.",
    boundary: "Use this surface for install, discovery, diagnostics, and machine-facing entrypoints. It does not mutate task, swarm, or memory state beyond setup."
  },
  {
    id: "planning",
    label: "Planning",
    description: "Turn one objective into a bounded plan, queued task set, or swarm contract.",
    boundary: "This surface shapes work before execution. Use it when you need a planner artifact, not a runtime dashboard."
  },
  {
    id: "tasks",
    label: "Task execution",
    description: "Create, inspect, claim, review, and close local tasks.",
    boundary: "This surface manages individual work items and handoffs. Use it for task lifecycle changes, not swarm-wide coordination."
  },
  {
    id: "roles",
    label: "Leader, worker, and verifier workspaces",
    description: "Open role-specific workspaces, handoff bundles, and leader dispatch packages.",
    boundary: "This surface is role-oriented. Use it to prepare the next actor, not to mutate raw task or swarm records directly."
  },
  {
    id: "swarms",
    label: "Swarm coordination",
    description: "Create, inspect, queue, sync, and close bounded swarm contracts.",
    boundary: "This surface manages multi-lane coordination envelopes. Use it for lane topology and swarm lifecycle, not single-task ownership."
  },
  {
    id: "runtime",
    label: "Runtime views & packs",
    description: "Inspect orchestration dashboards, queues, and role-targeted runtime packs.",
    boundary: "This surface is read-oriented packaging for operators and automations. It summarizes current state rather than authoring new work."
  },
  {
    id: "memory",
    label: "Memory",
    description: "Store, list, and search persistent local memories.",
    boundary: "This surface captures durable notes and retrieval context. It is separate from task records and swarm contracts."
  }
];

const COMMON_COMMAND_PATHS = [
  {
    id: "shell",
    label: "Open the runtime shell",
    description: "Run the TUI by default, or render a snapshot from the same shell surface without spelling the alias.",
    commands: ["", "--snapshot --section focus", "ready"]
  },
  {
    id: "bootstrap",
    label: "Bootstrap a repo",
    description: "Preview and install the bundled `.codex` assets, then confirm the runtime surface.",
    commands: ["init --preview", "init", "status"]
  },
  {
    id: "plan",
    label: "Shape work before execution",
    description: "Turn one objective into a plan, queued tasks, or a swarm contract.",
    commands: ["plan --task <objective>", "plan:queue --task <objective>", "plan:swarm --task <objective>"]
  },
  {
    id: "task",
    label: "Pick up the next task",
    description: "Move one role from inbox to execution and then into review.",
    commands: [
      "task:next --role <role> --worker <worker-id>",
      "task:pickup --role <role> --worker <worker-id>",
      "task:review --id <task-id> --by <actor>"
    ]
  },
  {
    id: "leader",
    label: "Coordinate workers",
    description: "See the leader workspace and generate dispatch-ready bundles.",
    commands: ["leader:workspace", "leader:assignment-dispatch-bundle", "leader:assignment-launch-plan"]
  },
  {
    id: "swarm",
    label: "Operate a swarm",
    description: "Inspect, queue, and close a bounded multi-lane coordination envelope.",
    commands: ["swarm:init --objective <objective>", "swarm:overview --id <swarm-id>", "swarm:queue --id <swarm-id>"]
  },
  {
    id: "runtime",
    label: "Inspect runtime state",
    description: "Use dashboards and packs when you need a read-oriented operator view.",
    commands: ["tui", "runtime:dashboard", "runtime:summary-pack", "runtime:leader-pack"]
  },
  {
    id: "mcp",
    label: "Expose the MCP surface",
    description: "Serve the same command surface over stdio for another agent or host process.",
    commands: ["mcp --stdio", "mcp --tools", "mcp --capabilities"]
  }
];

function getCommandGroupId(command) {
  if (!command) {
    return "bootstrap";
  }

  if (
    command === "run" ||
    command === "tui" ||
    command === "ready" ||
    command === "commands" ||
    command === "command:get" ||
    command === "command:help" ||
    command === "init" ||
    command === "init:options" ||
    command === "init:option" ||
    command === "init:help" ||
    command === "mcp" ||
    command === "mcp:options" ||
    command === "mcp:option" ||
    command === "mcp:help" ||
    command === "tools" ||
    command === "tools:get" ||
    command === "catalog" ||
    command === "catalog:agents" ||
    command === "catalog:agent" ||
    command === "catalog:agent-doc" ||
    command === "catalog:skills" ||
    command === "catalog:skill" ||
    command === "catalog:skill-doc" ||
    command === "guidance:overview" ||
    command === "guidance:worker" ||
    command === "contract" ||
    command === "doctor" ||
    command === "metadata" ||
    command === "status" ||
    command === "capabilities" ||
    command === "capabilities:get" ||
    command === "--help" ||
    command === "--version"
  ) {
    return "bootstrap";
  }

  if (command === "plan" || command.startsWith("plan:")) {
    return "planning";
  }

  if (command.startsWith("task:")) {
    return "tasks";
  }

  if (command.startsWith("worker:") || command.startsWith("verifier:") || command.startsWith("leader:")) {
    return "roles";
  }

  if (command.startsWith("swarm:")) {
    return "swarms";
  }

  if (command.startsWith("runtime:")) {
    return "runtime";
  }

  if (command.startsWith("memory:")) {
    return "memory";
  }

  return "bootstrap";
}

function getCommandGroup(command) {
  const groupId = getCommandGroupId(command);
  return COMMAND_GROUPS.find((group) => group.id === groupId) ?? COMMAND_GROUPS[0];
}

function groupCommandCatalog(commands) {
  return COMMAND_GROUPS.map((group) => {
    const entries = commands.filter((entry) => entry.groupId === group.id);
    return entries.length > 0 ? { ...group, count: entries.length, commands: entries } : null;
  }).filter(Boolean);
}

function getCommonCommandPaths() {
  return COMMON_COMMAND_PATHS;
}

function formatCommonCommandPath(path, productName) {
  return {
    ...path,
    commands: path.commands.map((command) => {
      const normalizedCommand = String(command ?? "").trim();
      return normalizedCommand ? `${productName} ${normalizedCommand}` : productName;
    })
  };
}

function formatCommandGroupEntries(group, productName) {
  return {
    ...group,
    commands: group.commands.map((entry) => ({
      command: `${productName} ${entry.command}`,
      description: entry.description
    }))
  };
}

export {
  COMMAND_GROUPS,
  COMMON_COMMAND_PATHS,
  formatCommonCommandPath,
  formatCommandGroupEntries,
  getCommandGroup,
  getCommandGroupId,
  getCommonCommandPaths,
  groupCommandCatalog
};
