import { requireOption } from "./helpers.js";
import {
  getAgentCatalogDocumentView,
  getAgentCatalogEntryView,
  getAgentCatalogListView,
  getRuntimeCatalogView,
  getSkillCatalogDocumentView,
  getSkillCatalogEntryView,
  getSkillCatalogListView
} from "../../catalog.js";
import {
  getCommandCatalogEntryView,
  getCommandCatalogView,
  getCommandHelpView,
  getInitCommandCatalogEntryView,
  getInitCommandCatalogView,
  getInitHelpView
} from "../../commands.js";
import {
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  getMcpToolView,
  getToolCatalogView
} from "../../mcp.js";
import { writeNamedView } from "./view-writers.js";

function printToolsView() {
  writeNamedView("tools", getToolCatalogView());
}

function printCommandView() {
  const name = requireOption("--name");
  writeNamedView("command", getCommandCatalogEntryView(name));
}

function printCommandsView() {
  writeNamedView("commands", getCommandCatalogView());
}

function printCommandHelpView() {
  const name = requireOption("--name");
  writeNamedView("help", getCommandHelpView(name));
}

function printInitOptionView() {
  const option = requireOption("--option");
  writeNamedView("option", getInitCommandCatalogEntryView(option));
}

function printInitOptionsView() {
  writeNamedView("options", getInitCommandCatalogView());
}

function printInitHelpView() {
  const option = requireOption("--option");
  writeNamedView("help", getInitHelpView(option));
}

function printMcpOptionsView() {
  writeNamedView("options", getMcpCommandCatalogView());
}

function printMcpOptionView() {
  const option = requireOption("--option");
  writeNamedView("option", getMcpCommandCatalogEntryView(option));
}

function printMcpHelpView() {
  const option = requireOption("--option");
  writeNamedView("help", getMcpHelpView(option));
}

function printToolView() {
  const name = requireOption("--name");
  writeNamedView("tool", getMcpToolView(name));
}

function printCatalog() {
  writeNamedView("catalog", getRuntimeCatalogView());
}

function printCatalogAgentsView() {
  writeNamedView("agents", getAgentCatalogListView());
}

function printCatalogAgentView() {
  const id = requireOption("--id");
  writeNamedView("agent", getAgentCatalogEntryView(id));
}

function printCatalogAgentDocumentView() {
  const id = requireOption("--id");
  writeNamedView("agent", getAgentCatalogDocumentView(id));
}

function printCatalogSkillsView() {
  writeNamedView("skills", getSkillCatalogListView());
}

function printCatalogSkillView() {
  const id = requireOption("--id");
  writeNamedView("skill", getSkillCatalogEntryView(id));
}

function printCatalogSkillDocumentView() {
  const id = requireOption("--id");
  writeNamedView("skill", getSkillCatalogDocumentView(id));
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
