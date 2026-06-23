import { cwd, version as nodeVersion } from "node:process";
import { createLoadedValueView } from "./state-view-helpers.js";

export function getRuntimeContract(options = {}) {
  const workingDirectory = options.workingDirectory ?? cwd();
  const node = options.node ?? nodeVersion;

  return {
    product: "codex-bees",
    mode: "codex-only",
    deliveryBoundary: "codex-only runtime",
    positioning: {
      productType: "Codex-specific product",
      operatingModel: "local bounded orchestration kernel",
      distributionModel: "repo-shipped CLI, MCP, and workspace assets"
    },
    workingDirectory,
    node,
    architecture: ["cli", "mcp", "skills", "agents", "docs"],
    transport: {
      cli: "stdio",
      mcp: "stdio-jsonrpc"
    },
    responsibilities: [
      "boot the codex-first local CLI and MCP runtime surfaces",
      "expose MCP tool catalog for local coordination",
      "provide a stable diagnostics surface for later orchestration layers",
      "persist local work-item state for bounded multi-agent execution",
      "store and recall local memory across execution lanes",
      "track local swarm contracts with bounded lane-to-task handoff",
      "validate owner and verifier roles against shipped local agent prompts"
    ],
    exclusions: [
      "multi-host runtime support",
      "hosted backend control plane",
      "external plugin marketplace distribution"
    ]
  };
}

export function getRuntimeContractView(options = {}) {
  const contract = getRuntimeContract(options);
  return createLoadedValueView("runtime_contract_view", "contract", contract, {
    recommendedReason: "contract_loaded",
    counts: {
      positioningFacets: Object.keys(contract.positioning).length,
      architectureLayers: contract.architecture.length,
      transports: Object.keys(contract.transport).length,
      responsibilities: contract.responsibilities.length,
      exclusions: contract.exclusions.length
    }
  });
}
