import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { argv, requireOption, write } from "./state-cli-helpers.js";
import { getRuntimeDoctorView } from "./doctor.js";
import { getPackageMetadataView, PACKAGE_VERSION } from "./metadata.js";
import { getCapabilityCatalogEntryView, getCapabilityCatalogView, getRuntimeStatusView } from "./runtime-status.js";
import { getRuntimeContractView } from "./runtime-contract.js";
import { getCoordinationOverviewView, getWorkerGuidelinesView } from "./runtime-guidance.js";
import { getRuntimeReadyView } from "./runtime-ready.js";
import { renderHelpText } from "./commands.js";
import { toolCatalog } from "./mcp.js";

function printRunSurface() {
  write(JSON.stringify(getRuntimeReadyView(), null, 2) + "\n");
}

function printReadyView() {
  write(JSON.stringify({ ready: getRuntimeReadyView() }, null, 2) + "\n");
}

function printHelp() {
  write(renderHelpText());
}

function printDoctor() {
  const entryUrl = argv[1] ? pathToFileURL(realpathSync(argv[1])).href : import.meta.url;
  write(JSON.stringify(getRuntimeDoctorView(entryUrl), null, 2) + "\n");
}

function printGuidanceOverviewView() {
  write(JSON.stringify({ overview: getCoordinationOverviewView() }, null, 2) + "\n");
}

function printGuidanceWorkerView() {
  write(JSON.stringify({ guidelines: getWorkerGuidelinesView() }, null, 2) + "\n");
}

function printContractView() {
  write(JSON.stringify({ contract: getRuntimeContractView() }, null, 2) + "\n");
}

function printMetadata() {
  write(JSON.stringify({ metadata: getPackageMetadataView() }, null, 2) + "\n");
}

function printStatus() {
  write(JSON.stringify({ status: getRuntimeStatusView({ version: PACKAGE_VERSION, toolCount: toolCatalog.length }) }, null, 2) + "\n");
}

function printCapabilities() {
  write(JSON.stringify({ capabilities: getCapabilityCatalogView() }, null, 2) + "\n");
}

function printCapabilityView() {
  const id = requireOption("--id");
  write(JSON.stringify({ capability: getCapabilityCatalogEntryView(id) }, null, 2) + "\n");
}

export {
  printCapabilities,
  printCapabilityView,
  printContractView,
  printDoctor,
  printGuidanceOverviewView,
  printGuidanceWorkerView,
  printHelp,
  printMetadata,
  printReadyView,
  printRunSurface,
  printStatus
};
