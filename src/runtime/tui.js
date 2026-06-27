import * as readline from "node:readline";
import { spawnSync } from "node:child_process";
import { stdin, stdout, stderr, argv, exit } from "node:process";
import { PACKAGE_VERSION, PRODUCT_NAME, getPackageMetadata } from "../metadata.js";
import { getSuggestedCliCommands } from "../state/cli/command-suggestions.js";
import { getCommandCatalog } from "../state/command/core.js";
import { getRuntimeReadyView } from "./ready-view.js";
import { getRuntimeStatusView } from "./status-view.js";
import {
  runtimeDashboard,
  runtimeFocus,
  runtimeHandoffs,
  runtimeRecovery,
  runtimeSummaryPack
} from "../state-runtime.js";
import { toolCatalog } from "../mcp.js";

const DEFAULT_SECTION_ID = "summary";
const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 30;
const COMMAND_PALETTE_LIMIT = 7;

const TUI_SECTIONS = [
  {
    id: "summary",
    label: "Summary",
    shortcut: "1",
    description: "Compact operator summary, guide mode, and recommended next surface."
  },
  {
    id: "dashboard",
    label: "Dashboard",
    shortcut: "2",
    description: "Top-level queue, assignment, and dashboard state."
  },
  {
    id: "focus",
    label: "Focus",
    shortcut: "3",
    description: "Single next-action focus and ranked runtime candidates."
  },
  {
    id: "handoffs",
    label: "Handoffs",
    shortcut: "4",
    description: "Owner, verifier, and recovery handoff pressure."
  },
  {
    id: "recovery",
    label: "Recovery",
    shortcut: "5",
    description: "Blocked, released, and changes-requested recovery work."
  },
  {
    id: "status",
    label: "Status",
    shortcut: "6",
    description: "Catalog, capability, and smart command overview."
  }
];

const TUI_KEYMAP = [
  { key: "1-6", action: "switch sections" },
  { key: "tab", action: "cycle sections" },
  { key: "o", action: "jump to the recommended section" },
  { key: "r", action: "refresh current data" },
  { key: "?", action: "toggle the key help overlay" },
  { key: ":", action: "open the searchable command palette" },
  { key: "↑/↓", action: "change the selected command palette entry" },
  { key: "enter", action: "run the current or selected command palette entry" },
  { key: "esc", action: "close the command palette without running anything" },
  { key: "q", action: "quit the TUI" }
];

function normalizeSectionId(section) {
  const normalized = String(section ?? DEFAULT_SECTION_ID).trim().toLowerCase();
  return TUI_SECTIONS.some((entry) => entry.id === normalized) ? normalized : DEFAULT_SECTION_ID;
}

function getSectionDescriptor(sectionId) {
  return TUI_SECTIONS.find((entry) => entry.id === sectionId) ?? TUI_SECTIONS[0];
}

function getTerminalWidth() {
  return Number.isInteger(stdout.columns) && stdout.columns > 0 ? stdout.columns : DEFAULT_WIDTH;
}

function getTerminalHeight() {
  return Number.isInteger(stdout.rows) && stdout.rows > 0 ? stdout.rows : DEFAULT_HEIGHT;
}

function repeat(value, count) {
  return new Array(Math.max(0, count)).fill(value).join("");
}

function fitLine(value, width) {
  const text = String(value ?? "");
  if (width <= 0) {
    return "";
  }
  if (text.length <= width) {
    return text;
  }
  if (width === 1) {
    return ".";
  }
  if (width <= 3) {
    return text.slice(0, width);
  }
  return `${text.slice(0, width - 3)}...`;
}

function compactCommand(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function wrapText(value, width) {
  const text = String(value ?? "").trim();
  if (!text) {
    return [""];
  }

  const normalizedWidth = Math.max(10, width);
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  function pushLongWord(word) {
    for (let index = 0; index < word.length; index += normalizedWidth) {
      lines.push(word.slice(index, index + normalizedWidth));
    }
  }

  for (const word of words) {
    if (!current) {
      if (word.length <= normalizedWidth) {
        current = word;
      } else {
        pushLongWord(word);
      }
      continue;
    }

    const next = `${current} ${word}`;
    if (next.length <= normalizedWidth) {
      current = next;
      continue;
    }

    lines.push(current);
    current = "";

    if (word.length <= normalizedWidth) {
      current = word;
    } else {
      pushLongWord(word);
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function bulletize(items = [], width, prefix = "- ") {
  return items.flatMap((item) => {
    const wrapped = wrapText(item, Math.max(10, width - prefix.length));
    return wrapped.map((line, index) => `${index === 0 ? prefix : repeat(" ", prefix.length)}${line}`);
  });
}

function formatCountRow(counts, keys) {
  return keys
    .filter((key) => typeof counts?.[key] !== "undefined")
    .map((key) => `${key}=${counts[key]}`)
    .join(" | ");
}

function formatSuggestedCommand(entry) {
  if (!entry) {
    return null;
  }
  if (typeof entry === "string") {
    return entry;
  }
  if (!entry.command) {
    return null;
  }
  return `${entry.command} - ${entry.reason}`;
}

function buildSuggestedCommandLines(entries = [], width) {
  return bulletize(entries.map((entry) => formatSuggestedCommand(entry)).filter(Boolean), width);
}

function normalizeSuggestedCommand(value) {
  if (!value) {
    return null;
  }

  const text = String(typeof value === "string" ? value : value.command ?? "").trim();
  if (!text) {
    return null;
  }

  const prefixes = [
    `${PRODUCT_NAME} `,
    `npx ${PRODUCT_NAME} `,
    "node ./src/index.js ",
    "node ./dist/index.js ",
    "./src/index.js ",
    "./dist/index.js "
  ];

  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      return text.slice(prefix.length).trim();
    }
  }

  return text;
}

function splitCommandInput(input = "") {
  const value = String(input);
  const trimmedStart = value.trimStart();
  if (!trimmedStart) {
    return { commandQuery: "", suffix: "" };
  }

  const firstWhitespace = trimmedStart.search(/\s/);
  if (firstWhitespace < 0) {
    return {
      commandQuery: trimmedStart,
      suffix: ""
    };
  }

  return {
    commandQuery: trimmedStart.slice(0, firstWhitespace),
    suffix: trimmedStart.slice(firstWhitespace)
  };
}

function scorePaletteEntry(entry, query, suggestedCommands = new Set()) {
  if (!entry || !query) {
    return entry?.recommended ? 60 : 0;
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return entry.recommended ? 60 : 0;
  }

  const normalizedCompactQuery = compactCommand(normalizedQuery);
  if (!normalizedCompactQuery) {
    return entry.recommended ? 60 : 0;
  }

  const values = [
    entry.command,
    entry.displayCommand,
    entry.description,
    entry.groupLabel,
    entry.usage,
    ...(entry.reasons ?? [])
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  let score = 0;
  for (const value of values) {
    const compactValue = compactCommand(value);
    if (value === normalizedQuery || compactValue === normalizedCompactQuery) {
      score = Math.max(score, 400);
    } else if (value.startsWith(normalizedQuery) || compactValue.startsWith(normalizedCompactQuery)) {
      score = Math.max(score, 260);
    } else if (value.includes(normalizedQuery) || compactValue.includes(normalizedCompactQuery)) {
      score = Math.max(score, 170);
    }
  }

  if (suggestedCommands.has(entry.command)) {
    score += 160;
  }
  if (entry.recommended) {
    score += 40;
  }

  return score;
}

function getRuntimeTuiData() {
  return {
    metadata: getPackageMetadata(),
    readyView: getRuntimeReadyView(),
    statusView: getRuntimeStatusView({ version: PACKAGE_VERSION, toolCount: toolCatalog.length }),
    dashboardView: runtimeDashboard(),
    focusView: runtimeFocus(),
    handoffsView: runtimeHandoffs(),
    recoveryView: runtimeRecovery(),
    summaryPackView: runtimeSummaryPack()
  };
}

function buildCommandPaletteEntries(data, input = "", selectedCommandIndex = 0) {
  const commandCatalog = getCommandCatalog();
  const paletteByCommand = new Map(
    commandCatalog.map((entry) => [
      entry.command,
      {
        command: entry.command,
        displayCommand: `${PRODUCT_NAME} ${entry.command}`,
        description: entry.description ?? "",
        groupLabel: entry.groupLabel ?? "General",
        usage: entry.usage?.[0] ?? null,
        recommended: false,
        reasons: [],
        source: "catalog"
      }
    ])
  );

  const recommendedEntries = [
    ...(data.statusView.status.suggestedCommands ?? []),
    ...(data.focusView.focus?.recommendedCommands ?? []),
    ...(data.focusView.focus?.focus?.recommendedCommands ?? [])
  ];

  for (const entry of recommendedEntries) {
    const command = normalizeSuggestedCommand(entry);
    if (!command) {
      continue;
    }

    const reason = typeof entry === "string" ? null : entry.reason ?? null;
    const existing =
      paletteByCommand.get(command) ??
      {
        command,
        displayCommand: `${PRODUCT_NAME} ${command}`,
        description: reason ?? "Recommended from the current runtime state.",
        groupLabel: "Runtime recommendations",
        usage: null,
        recommended: false,
        reasons: [],
        source: "runtime"
      };

    existing.recommended = true;
    if (reason && !existing.reasons.includes(reason)) {
      existing.reasons.push(reason);
    }
    if (!paletteByCommand.has(command)) {
      paletteByCommand.set(command, existing);
    }
  }

  const { commandQuery } = splitCommandInput(input);
  const rankedSuggestions = new Set(getSuggestedCliCommands(commandQuery, { limit: COMMAND_PALETTE_LIMIT * 2 }));

  const ranked = [...paletteByCommand.values()]
    .map((entry) => ({
      ...entry,
      score: scorePaletteEntry(entry, commandQuery, rankedSuggestions)
    }))
    .filter((entry) => commandQuery.trim().length === 0 || entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (left.recommended !== right.recommended) {
        return left.recommended ? -1 : 1;
      }
      return left.command.localeCompare(right.command);
    });

  const entries = ranked.slice(0, COMMAND_PALETTE_LIMIT);
  const boundedSelectedIndex = entries.length === 0 ? -1 : Math.min(Math.max(0, selectedCommandIndex), entries.length - 1);

  return {
    visible: true,
    input: String(input ?? ""),
    selectedIndex: boundedSelectedIndex,
    entries: entries.map((entry, index) => ({
      command: entry.command,
      displayCommand: entry.displayCommand,
      description: entry.description,
      groupLabel: entry.groupLabel,
      usage: entry.usage,
      recommended: entry.recommended,
      selected: index === boundedSelectedIndex
    }))
  };
}

function mapRecommendedSurfaceToSection(data) {
  const surface = data.summaryPackView?.recommendedSurface ?? null;
  if (surface === "runtime:dashboard") {
    return "dashboard";
  }
  if (surface === "runtime:focus") {
    return "focus";
  }
  if (surface === "runtime:handoffs") {
    return "handoffs";
  }
  if (surface === "runtime:recovery") {
    return "recovery";
  }
  if (surface === "status") {
    return "status";
  }
  return "summary";
}

function buildSummarySectionLines(data, width) {
  const lines = [];
  lines.push(...wrapText(data.statusView.status.summary, width));
  lines.push("");
  lines.push(`Guide mode: ${data.statusView.status.guideMode}`);
  lines.push(`Recommended surface: ${data.summaryPackView.recommendedSurface} (${data.summaryPackView.recommendedReason})`);
  lines.push(`Focus: ${data.focusView.summary}`);
  lines.push(`Ready shell: ${data.readyView.summary}`);
  lines.push("");
  lines.push("Suggested commands:");
  lines.push(...buildSuggestedCommandLines(data.statusView.status.suggestedCommands.slice(0, 5), width));
  return lines;
}

function buildDashboardSectionLines(data, width) {
  const lines = [];
  lines.push(...wrapText(data.dashboardView.summary, width));
  lines.push("");
  lines.push(
    `Counts: ${formatCountRow(data.dashboardView.counts, ["tasks", "swarms", "blockedTasks", "pendingReview", "leaderQueueItems", "leaderAssignments"])}`
  );
  lines.push(`Leader queue: ${data.dashboardView.leader?.queue?.summary ?? "none"}`);
  lines.push(`Assignments: ${data.dashboardView.leader?.assignments?.summary ?? "none"}`);
  if (data.dashboardView.leader?.queue?.next?.swarmId) {
    lines.push(`Next queue item: ${data.dashboardView.leader.queue.next.swarmId}`);
  }
  return lines;
}

function buildFocusSectionLines(data, width) {
  const lines = [];
  lines.push(...wrapText(data.focusView.summary, width));
  lines.push("");
  lines.push(`Reason: ${data.focusView.recommendedReason}`);
  lines.push(`Priority score: ${data.focusView.priorityScore}`);
  lines.push(`Top candidate: ${data.focusView.candidates?.[0]?.key ?? "idle"}`);
  const focusCommands =
    data.focusView.focus?.recommendedCommands ??
    data.focusView.focus?.focus?.recommendedCommands ??
    [];
  if (focusCommands.length > 0) {
    lines.push("");
    lines.push("Recommended commands:");
    lines.push(...buildSuggestedCommandLines(focusCommands, width));
  }
  return lines;
}

function buildHandoffsSectionLines(data, width) {
  const lines = [];
  lines.push(...wrapText(data.handoffsView.summary, width));
  lines.push("");
  lines.push(
    `Counts: ${formatCountRow(data.handoffsView.counts, ["actorGroups", "totalHandoffs", "reviewDecisions", "blockedRecoveries", "ownerClaims"])}`
  );
  if (data.handoffsView.next?.taskId) {
    lines.push(`Next handoff: ${data.handoffsView.next.taskId}`);
  }
  return lines;
}

function buildRecoverySectionLines(data, width) {
  const lines = [];
  lines.push(...wrapText(data.recoveryView.summary, width));
  lines.push("");
  lines.push(
    `Counts: ${formatCountRow(data.recoveryView.counts, ["recoveryGroups", "totalEntries", "blocked", "released", "changesRequested"])}`
  );
  if (data.recoveryView.next?.taskId) {
    lines.push(`Next recovery target: ${data.recoveryView.next.taskId}`);
  }
  return lines;
}

function buildStatusSectionLines(data, width) {
  const lines = [];
  lines.push(...wrapText(data.statusView.status.summary, width));
  lines.push("");
  lines.push(
    `Counts: ${formatCountRow(data.statusView.counts, ["tools", "agents", "skills", "capabilities", "tasks", "swarms", "memories", "trackedStateEntries"])}`
  );
  lines.push("Highlights:");
  lines.push(...bulletize(data.statusView.status.highlights.slice(0, 4), width));
  lines.push("");
  lines.push("Suggested commands:");
  lines.push(...buildSuggestedCommandLines(data.statusView.status.suggestedCommands.slice(0, 4), width));
  return lines;
}

function buildHelpOverlayLines(width) {
  const lines = ["Keybindings:"];
  lines.push(...bulletize(TUI_KEYMAP.map((entry) => `${entry.key} - ${entry.action}`), width));
  lines.push("");
  lines.push(...wrapText("Use ':' to open the command palette, filter commands, inspect output, then return to the current TUI screen.", width));
  return lines;
}

function buildCommandPaletteLines(commandPalette = null, width) {
  if (!commandPalette?.visible) {
    return [];
  }

  const lines = [
    "Command palette:",
    ...wrapText("Filter by command, alias, group, or description. Tab accepts the selected command and Enter runs it.", width)
  ];

  if ((commandPalette.entries?.length ?? 0) === 0) {
    lines.push("");
    lines.push(...wrapText("No matching commands. Keep typing or press Esc to cancel.", width));
    return lines;
  }

  lines.push("");
  for (const entry of commandPalette.entries) {
    const prefix = entry.selected ? ">" : " ";
    const suffix = entry.recommended ? " [recommended]" : "";
    lines.push(fitLine(`${prefix} ${entry.displayCommand}${suffix}`, width));
    lines.push(
      fitLine(
        `  ${entry.groupLabel} - ${entry.description || entry.usage || "Command palette entry"}`,
        width
      )
    );
  }

  return lines;
}

function buildSectionView(sectionId, data, width, showHelp = false) {
  const descriptor = getSectionDescriptor(sectionId);
  const contentWidth = Math.max(20, width - 2);

  if (showHelp) {
    return {
      descriptor,
      summary: "Interactive key help overlay.",
      lines: buildHelpOverlayLines(contentWidth)
    };
  }

  if (sectionId === "dashboard") {
    return {
      descriptor,
      summary: data.dashboardView.summary,
      lines: buildDashboardSectionLines(data, contentWidth)
    };
  }

  if (sectionId === "focus") {
    return {
      descriptor,
      summary: data.focusView.summary,
      lines: buildFocusSectionLines(data, contentWidth)
    };
  }

  if (sectionId === "handoffs") {
    return {
      descriptor,
      summary: data.handoffsView.summary,
      lines: buildHandoffsSectionLines(data, contentWidth)
    };
  }

  if (sectionId === "recovery") {
    return {
      descriptor,
      summary: data.recoveryView.summary,
      lines: buildRecoverySectionLines(data, contentWidth)
    };
  }

  if (sectionId === "status") {
    return {
      descriptor,
      summary: data.statusView.status.summary,
      lines: buildStatusSectionLines(data, contentWidth)
    };
  }

  return {
    descriptor,
    summary: data.statusView.status.summary,
    lines: buildSummarySectionLines(data, contentWidth)
  };
}

function renderTuiText(snapshot, { width, height, commandMode = false, commandInput = "", flashMessage = null } = {}) {
  const normalizedWidth = Math.max(40, width);
  const normalizedHeight = Math.max(16, height);
  const tabs = snapshot.sections
    .map((section) => {
      const label = `${section.shortcut} ${section.label}`;
      return section.id === snapshot.activeSection ? `[${label}]` : ` ${label} `;
    })
    .join("  ");

  const headerLines = [
    fitLine(snapshot.header.title, normalizedWidth),
    fitLine(snapshot.header.subtitle, normalizedWidth),
    fitLine(snapshot.header.stateSummary, normalizedWidth),
    "",
    fitLine(tabs, normalizedWidth),
    repeat("-", normalizedWidth),
    fitLine(`${snapshot.panel.title} - ${snapshot.panel.summary}`, normalizedWidth),
    ""
  ];

  const panelLines = [...snapshot.panel.lines.map((line) => fitLine(line, normalizedWidth)), ""];
  const paletteLines =
    commandMode && snapshot.commandPalette?.visible
      ? [...buildCommandPaletteLines(snapshot.commandPalette, normalizedWidth), ""]
      : [];

  const footerLines = [];
  if (flashMessage) {
    footerLines.push(fitLine(`Notice: ${flashMessage}`, normalizedWidth));
  }
  footerLines.push(
    fitLine(
      commandMode
        ? "Keys: ↑/↓ select | Tab accept | Enter run | Esc cancel | Ctrl+C quit"
        : "Keys: 1-6 switch | Tab cycle | o recommended | r refresh | ? help | : command | q quit",
      normalizedWidth
    )
  );
  footerLines.push(
    fitLine(
      commandMode
        ? `Command > ${commandInput || ""}`
        : "Command > press ':' to open the command palette from inside the TUI",
      normalizedWidth
    )
  );

  const lines = [...headerLines, ...panelLines, ...paletteLines, ...footerLines];
  if (lines.length > normalizedHeight) {
    const reservedPaletteLines = paletteLines.length;
    const availablePanelLines = Math.max(
      1,
      normalizedHeight - headerLines.length - footerLines.length - reservedPaletteLines - 1
    );
    const visiblePanelLines = panelLines.slice(0, availablePanelLines);
    return [
      ...headerLines,
      ...visiblePanelLines,
      fitLine(`... truncated to ${normalizedHeight} rows`, normalizedWidth),
      ...paletteLines,
      ...footerLines
    ]
      .slice(0, normalizedHeight)
      .join("\n");
  }

  return lines.join("\n");
}

export function getRuntimeTuiSnapshot({
  section,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  showHelp = false,
  commandMode = false,
  commandInput = "",
  selectedCommandIndex = 0,
  flashMessage = null
} = {}) {
  const activeSection = normalizeSectionId(section);
  const data = getRuntimeTuiData();
  const sectionView = buildSectionView(activeSection, data, width, showHelp);
  const commandPalette = commandMode ? buildCommandPaletteEntries(data, commandInput, selectedCommandIndex) : null;
  const snapshot = {
    kind: "runtime_tui_snapshot",
    recommendedReason: "tui_snapshot_rendered",
    activeSection,
    recommendedSection: mapRecommendedSurfaceToSection(data),
    sections: TUI_SECTIONS.map((entry) => ({ ...entry })),
    keymap: TUI_KEYMAP.map((entry) => ({ ...entry })),
    header: {
      title: `${PRODUCT_NAME} tui`,
      subtitle: `${data.metadata.product} v${data.metadata.version} | ${sectionView.descriptor.label}`,
      stateSummary: `${data.statusView.status.guideMode} | tasks=${data.statusView.status.counts.tasks} | swarms=${data.statusView.status.counts.swarms} | memories=${data.statusView.status.counts.memories}`
    },
    panel: {
      id: sectionView.descriptor.id,
      title: sectionView.descriptor.label,
      description: sectionView.descriptor.description,
      summary: sectionView.summary,
      lines: sectionView.lines
    },
    commandPalette
  };

  const text = renderTuiText(snapshot, {
    width,
    height,
    commandMode,
    commandInput,
    flashMessage
  });

  return {
    ...snapshot,
    counts: {
      sections: snapshot.sections.length,
      renderedLines: text.split("\n").length,
      suggestedCommands: data.statusView.status.suggestedCommands.length,
      commandPaletteEntries: commandPalette?.entries?.length ?? 0,
      width,
      height
    },
    text
  };
}

function tokenizeCommandInput(input) {
  const tokens = [];
  let current = "";
  let quote = null;
  let escapeNext = false;

  for (const character of input) {
    if (escapeNext) {
      current += character;
      escapeNext = false;
      continue;
    }

    if (character === "\\") {
      escapeNext = true;
      continue;
    }

    if (quote) {
      if (character === quote) {
        quote = null;
      } else {
        current += character;
      }
      continue;
    }

    if (character === "'" || character === "\"") {
      quote = character;
      continue;
    }

    if (/\s/.test(character)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += character;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function normalizeNestedTokens(input) {
  const tokens = tokenizeCommandInput(input);
  if (tokens[0] === PRODUCT_NAME) {
    return tokens.slice(1);
  }
  return tokens;
}

function writeScreen(text) {
  stdout.write("\u001B[2J\u001B[H");
  stdout.write(text);
}

function enterScreen() {
  stdout.write("\u001B[?1049h\u001B[?25l");
}

function leaveScreen() {
  stdout.write("\u001B[?25h\u001B[?1049l");
}

function waitForReturnPrompt() {
  return new Promise((resolve) => {
    stderr.write(`\nPress Enter to return to ${PRODUCT_NAME} tui...`);
    const onData = () => {
      stdin.off("data", onData);
      stderr.write("\n");
      resolve();
    };
    stdin.on("data", onData);
  });
}

async function runNestedCliCommand(input) {
  const tokens = normalizeNestedTokens(input);
  if (tokens.length === 0) {
    return "No command entered.";
  }
  if (tokens[0] === "tui" && !tokens.includes("--snapshot")) {
    return "Already inside the TUI. Use sections, '?' or ':' instead of nesting tui.";
  }

  const result = spawnSync(process.execPath, [argv[1], ...tokens], {
    stdio: "inherit"
  });

  await waitForReturnPrompt();

  if (result.status !== 0) {
    return `${PRODUCT_NAME} ${tokens.join(" ")} exited with status ${result.status ?? 1}.`;
  }

  return `Ran ${PRODUCT_NAME} ${tokens.join(" ")}.`;
}

function resolveCommandModeInput(commandInput, commandPalette = null) {
  const trimmedInput = String(commandInput ?? "").trim();
  const selectedEntry =
    commandPalette?.entries?.[commandPalette?.selectedIndex] ??
    commandPalette?.entries?.[0] ??
    null;

  if (!trimmedInput) {
    return selectedEntry?.command ?? "";
  }

  const { commandQuery, suffix } = splitCommandInput(trimmedInput);
  const normalizedCommandQuery = normalizeSuggestedCommand(commandQuery);
  if (!selectedEntry) {
    return trimmedInput;
  }

  if (normalizedCommandQuery === selectedEntry.command) {
    return `${selectedEntry.command}${suffix}`;
  }

  const exactPaletteMatch = commandPalette.entries.some((entry) => entry.command === normalizedCommandQuery);
  if (exactPaletteMatch) {
    return normalizedCommandQuery ? `${normalizedCommandQuery}${suffix}` : trimmedInput;
  }

  return `${selectedEntry.command}${suffix}`;
}

function applySelectedPaletteCommand(commandInput, commandPalette = null) {
  const selectedEntry =
    commandPalette?.entries?.[commandPalette?.selectedIndex] ??
    commandPalette?.entries?.[0] ??
    null;
  if (!selectedEntry) {
    return commandInput;
  }

  const { suffix } = splitCommandInput(commandInput);
  return `${selectedEntry.command}${suffix}`;
}

export async function runInteractiveRuntimeTui({ section, snapshot = false } = {}) {
  if (snapshot || !stdin.isTTY || !stdout.isTTY) {
    stdout.write(`${getRuntimeTuiSnapshot({ section, width: getTerminalWidth(), height: getTerminalHeight() }).text}\n`);
    return;
  }

  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();

  let activeSection = normalizeSectionId(section);
  let showHelp = false;
  let commandMode = false;
  let commandInput = "";
  let selectedCommandIndex = 0;
  let flashMessage = null;
  let attached = false;
  let busy = false;

  const render = () => {
    const snapshotView = getRuntimeTuiSnapshot({
      section: activeSection,
      width: getTerminalWidth(),
      height: getTerminalHeight(),
      showHelp,
      commandMode,
      commandInput,
      selectedCommandIndex,
      flashMessage
    });
    writeScreen(snapshotView.text);
  };

  const detach = () => {
    if (!attached) {
      return;
    }
    attached = false;
    stdout.off("resize", render);
    stdin.off("keypress", onKeypress);
    try {
      stdin.setRawMode(false);
    } catch {}
    leaveScreen();
  };

  const attach = () => {
    if (attached) {
      return;
    }
    attached = true;
    enterScreen();
    stdout.on("resize", render);
    stdin.on("keypress", onKeypress);
  };

  const close = () => {
    detach();
    exit(0);
  };

  const runCommandMode = async () => {
    const snapshotView = getRuntimeTuiSnapshot({
      section: activeSection,
      width: getTerminalWidth(),
      height: getTerminalHeight(),
      showHelp,
      commandMode,
      commandInput,
      selectedCommandIndex,
      flashMessage
    });
    const input = resolveCommandModeInput(commandInput, snapshotView.commandPalette);
    commandMode = false;
    commandInput = "";
    selectedCommandIndex = 0;
    flashMessage = null;
    busy = true;
    detach();
    try {
      flashMessage = await runNestedCliCommand(input);
    } finally {
      stdin.setRawMode(true);
      stdin.resume();
      attach();
      busy = false;
      render();
    }
  };

  const onKeypress = async (character, key = {}) => {
    if (busy) {
      return;
    }

    if (key.ctrl && key.name === "c") {
      close();
      return;
    }

    if (commandMode) {
      if (key.name === "escape") {
        commandMode = false;
        commandInput = "";
        selectedCommandIndex = 0;
        flashMessage = "Command prompt cancelled.";
        render();
        return;
      }
      if (key.name === "return") {
        await runCommandMode();
        return;
      }
      if (key.name === "up") {
        selectedCommandIndex = Math.max(0, selectedCommandIndex - 1);
        render();
        return;
      }
      if (key.name === "down") {
        selectedCommandIndex += 1;
        render();
        return;
      }
      if (key.name === "tab") {
        const snapshotView = getRuntimeTuiSnapshot({
          section: activeSection,
          width: getTerminalWidth(),
          height: getTerminalHeight(),
          showHelp,
          commandMode,
          commandInput,
          selectedCommandIndex,
          flashMessage
        });
        commandInput = applySelectedPaletteCommand(commandInput, snapshotView.commandPalette);
        render();
        return;
      }
      if (key.name === "backspace") {
        commandInput = commandInput.slice(0, -1);
        selectedCommandIndex = 0;
        render();
        return;
      }
      if (character && !key.meta) {
        commandInput += character;
        selectedCommandIndex = 0;
        render();
      }
      return;
    }

    flashMessage = null;

    if (key.name === "q") {
      close();
      return;
    }
    if (key.name === "tab") {
      const index = TUI_SECTIONS.findIndex((entry) => entry.id === activeSection);
      activeSection = TUI_SECTIONS[(index + 1) % TUI_SECTIONS.length].id;
      render();
      return;
    }
    if (character === ":") {
      commandMode = true;
      commandInput = "";
      selectedCommandIndex = 0;
      render();
      return;
    }
    if (character === "?") {
      showHelp = !showHelp;
      render();
      return;
    }
    if (character === "r") {
      render();
      return;
    }
    if (character === "o") {
      activeSection = getRuntimeTuiSnapshot({ section: activeSection }).recommendedSection;
      render();
      return;
    }

    const matched = TUI_SECTIONS.find((entry) => entry.shortcut === character);
    if (matched) {
      activeSection = matched.id;
      render();
    }
  };

  attach();
  render();
}
