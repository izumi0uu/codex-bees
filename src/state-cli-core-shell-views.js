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
import { writeNamedView, writeView } from "./state-cli-view-writers.js";

function printRunSurface() {
  writeView(getRuntimeReadyView());
}

function printReadyView() {
  writeNamedView("ready", getRuntimeReadyView());
}

function printHelp() {
  write(renderHelpText());
}

function printDoctor() {
  const entryUrl = argv[1] ? pathToFileURL(realpathSync(argv[1])).href : import.meta.url;
  writeView(getRuntimeDoctorView(entryUrl));
}

function printGuidanceOverviewView() {
  writeNamedView("overview", getCoordinationOverviewView());
}

function printGuidanceWorkerView() {
  writeNamedView("guidelines", getWorkerGuidelinesView());
}

function printContractView() {
  writeNamedView("contract", getRuntimeContractView());
}

function printMetadata() {
  writeNamedView("metadata", getPackageMetadataView());
}

function printStatus() {
  writeNamedView("status", getRuntimeStatusView({ version: PACKAGE_VERSION, toolCount: toolCatalog.length }));
}

function printCapabilities() {
  writeNamedView("capabilities", getCapabilityCatalogView());
}

function printCapabilityView() {
  const id = requireOption("--id");
  writeNamedView("capability", getCapabilityCatalogEntryView(id));
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
