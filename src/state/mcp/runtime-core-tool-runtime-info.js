import { getRuntimeDoctorView } from "../../doctor.js";
import { getPackageMetadataView } from "../../metadata.js";
import { getRuntimeContractView } from "../../runtime-contract.js";
import { getCoordinationOverviewView, getWorkerGuidelinesView } from "../../runtime-guidance.js";
import { getRuntimeReadyView } from "../../runtime-ready.js";
import { createNamedTextPayload, createSuccess } from "./runtime-response.js";

const MCP_ENTRY_URL = new URL("../../mcp.js", import.meta.url).href;

export const RUNTIME_INFO_CORE_MCP_TOOL_HANDLERS = {
  coordination_overview({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("overview", getCoordinationOverviewView()));
  },

  package_metadata({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("metadata", getPackageMetadataView()));
  },

  runtime_doctor({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("doctor", getRuntimeDoctorView(MCP_ENTRY_URL)));
  },

  worker_guidelines({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("guidelines", getWorkerGuidelinesView()));
  },

  runtime_contract({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("contract", getRuntimeContractView()));
  },

  runtime_ready({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("ready", getRuntimeReadyView()));
  }
};
