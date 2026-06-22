import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { argv, requireOption, write } from "./state-cli-helpers.js";
import {
  getAgentCatalogDocumentView,
  getAgentCatalogEntryView,
  getAgentCatalogListView,
  getRuntimeCatalogView,
  getSkillCatalogDocumentView,
  getSkillCatalogEntryView,
  getSkillCatalogListView
} from "./catalog.js";
import { getCommandCatalogEntryView, getCommandCatalogView, getCommandHelpView, getInitCommandCatalogEntryView, getInitCommandCatalogView, getInitHelpView, renderHelpText } from "./commands.js";
import { getRuntimeDoctorView } from "./doctor.js";
import { getPackageMetadataView, PACKAGE_VERSION } from "./metadata.js";
import { getMcpCommandCatalogEntryView, getMcpCommandCatalogView, getMcpHelpView, getMcpToolView, getToolCatalogView, toolCatalog } from "./mcp.js";
import { getCapabilityCatalogEntryView, getCapabilityCatalogView, getRuntimeStatusView } from "./runtime-status.js";
import { getRuntimeContractView } from "./runtime-contract.js";
import { getCoordinationOverviewView, getWorkerGuidelinesView } from "./runtime-guidance.js";
import { getRuntimeReadyView } from "./runtime-ready.js";

function printRunSurface() {
  write(JSON.stringify(getRuntimeReadyView(), null, 2) + "\n");
}

function printReadyView() {
  write(JSON.stringify({ ready: getRuntimeReadyView() }, null, 2) + "\n");
}

function printToolsView() {
  write(JSON.stringify({ tools: getToolCatalogView() }, null, 2) + "\n");
}

function printHelp() {
  write(renderHelpText());
}

function printCommandView() {
  const name = requireOption("--name");
  write(JSON.stringify({ command: getCommandCatalogEntryView(name) }, null, 2) + "\n");
}

function printCommandsView() {
  write(JSON.stringify({ commands: getCommandCatalogView() }, null, 2) + "\n");
}

function printCommandHelpView() {
  const name = requireOption("--name");
  write(JSON.stringify({ help: getCommandHelpView(name) }, null, 2) + "\n");
}

function printInitOptionView() {
  const option = requireOption("--option");
  write(JSON.stringify({ option: getInitCommandCatalogEntryView(option) }, null, 2) + "\n");
}

function printInitOptionsView() {
  write(JSON.stringify({ options: getInitCommandCatalogView() }, null, 2) + "\n");
}

function printInitHelpView() {
  const option = requireOption("--option");
  write(JSON.stringify({ help: getInitHelpView(option) }, null, 2) + "\n");
}

function printMcpOptionsView() {
  write(JSON.stringify({ options: getMcpCommandCatalogView() }, null, 2) + "\n");
}

function printMcpOptionView() {
  const option = requireOption("--option");
  write(JSON.stringify({ option: getMcpCommandCatalogEntryView(option) }, null, 2) + "\n");
}

function printMcpHelpView() {
  const option = requireOption("--option");
  write(JSON.stringify({ help: getMcpHelpView(option) }, null, 2) + "\n");
}

function printDoctor() {
  const entryUrl = argv[1] ? pathToFileURL(realpathSync(argv[1])).href : import.meta.url;
  write(JSON.stringify(getRuntimeDoctorView(entryUrl), null, 2) + "\n");
}

function printToolView() {
  const name = requireOption("--name");
  write(JSON.stringify({ tool: getMcpToolView(name) }, null, 2) + "\n");
}

function printCatalog() {
  write(JSON.stringify({ catalog: getRuntimeCatalogView() }, null, 2) + "\n");
}

function printCatalogAgentsView() {
  write(JSON.stringify({ agents: getAgentCatalogListView() }, null, 2) + "\n");
}

function printCatalogAgentView() {
  const id = requireOption("--id");
  write(JSON.stringify({ agent: getAgentCatalogEntryView(id) }, null, 2) + "\n");
}

function printCatalogAgentDocumentView() {
  const id = requireOption("--id");
  write(JSON.stringify({ agent: getAgentCatalogDocumentView(id) }, null, 2) + "\n");
}

function printCatalogSkillsView() {
  write(JSON.stringify({ skills: getSkillCatalogListView() }, null, 2) + "\n");
}

function printCatalogSkillView() {
  const id = requireOption("--id");
  write(JSON.stringify({ skill: getSkillCatalogEntryView(id) }, null, 2) + "\n");
}

function printCatalogSkillDocumentView() {
  const id = requireOption("--id");
  write(JSON.stringify({ skill: getSkillCatalogDocumentView(id) }, null, 2) + "\n");
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
  printCatalog,
  printCatalogAgentView,
  printCatalogAgentDocumentView,
  printCatalogAgentsView,
  printCatalogSkillView,
  printCatalogSkillDocumentView,
  printCatalogSkillsView,
  printCommandHelpView,
  printCommandsView,
  printCommandView,
  printContractView,
  printDoctor,
  printGuidanceOverviewView,
  printGuidanceWorkerView,
  printHelp,
  printInitHelpView,
  printInitOptionView,
  printInitOptionsView,
  printMcpHelpView,
  printMcpOptionView,
  printMcpOptionsView,
  printMetadata,
  printReadyView,
  printRunSurface,
  printStatus,
  printToolView,
  printToolsView
};
