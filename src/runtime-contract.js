import { cwd, version as nodeVersion } from "node:process";

export function getRuntimeContract(options = {}) {
  const workingDirectory = options.workingDirectory ?? cwd();
  const node = options.node ?? nodeVersion;

  return {
    product: "codex-bees",
    mode: "codex-only",
    deliveryBoundary: "codex-only runtime",
    workingDirectory,
    node,
    architecture: ["cli", "mcp", "skills", "agents", "docs"],
    transport: {
      cli: "stdio",
      mcp: "stdio-jsonrpc"
    },
    responsibilities: [
      "bootstrap codex-first runtime commands",
      "expose MCP tool catalog for local coordination",
      "provide a stable diagnostics surface for later orchestration layers",
      "persist local work-item state for bounded multi-agent execution",
      "store and recall local memory across execution lanes",
      "track local swarm contracts with bounded lane-to-task handoff",
      "validate owner and verifier roles against shipped local agent prompts"
    ],
    exclusions: [
      "third-party marketplace distribution",
      "multi-host runtime support",
      "hosted backend control plane"
    ]
  };
}

export function getRuntimeContractView(options = {}) {
  const contract = getRuntimeContract(options);
  return {
    kind: "runtime_contract_view",
    recommendedReason: "contract_loaded",
    counts: {
      architectureLayers: contract.architecture.length,
      transports: Object.keys(contract.transport).length,
      responsibilities: contract.responsibilities.length,
      exclusions: contract.exclusions.length
    },
    contract
  };
}
