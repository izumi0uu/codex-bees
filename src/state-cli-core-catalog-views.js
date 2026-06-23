import { requireOption, write } from "./state-cli-helpers.js";
import {
  getAgentCatalogDocumentView,
  getAgentCatalogEntryView,
  getAgentCatalogListView,
  getRuntimeCatalogView,
  getSkillCatalogDocumentView,
  getSkillCatalogEntryView,
  getSkillCatalogListView
} from "./catalog.js";
import {
  getCommandCatalogEntryView,
  getCommandCatalogView,
  getCommandHelpView,
  getInitCommandCatalogEntryView,
  getInitCommandCatalogView,
  getInitHelpView
} from "./commands.js";
import {
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  getMcpToolView,
  getToolCatalogView
} from "./mcp.js";

function printToolsView() {
  write(JSON.stringify({ tools: getToolCatalogView() }, null, 2) + "\n");
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

export {
  printCatalog,
  printCatalogAgentDocumentView,
  printCatalogAgentView,
  printCatalogAgentsView,
  printCatalogSkillDocumentView,
  printCatalogSkillView,
  printCatalogSkillsView,
  printCommandHelpView,
  printCommandsView,
  printCommandView,
  printInitHelpView,
  printInitOptionView,
  printInitOptionsView,
  printMcpHelpView,
  printMcpOptionView,
  printMcpOptionsView,
  printToolView,
  printToolsView
};
