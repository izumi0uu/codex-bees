import * as readline from "node:readline";
import { spawnSync } from "node:child_process";
import { stdin, stdout, stderr, argv, exit } from "node:process";
import { PACKAGE_VERSION, PRODUCT_NAME, getPackageMetadata } from "../metadata.js";
import { getSuggestedCliCommands } from "../state/cli/command-suggestions.js";
import { getCommandCatalog } from "../state/command/core.js";
import { getRuntimeReadyView } from "./ready-view.js";
import { getRuntimeStatusView } from "./status-view.js";
import {
  runtimeActivity,
  runtimeAlerts,
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
const EVENT_STREAM_LIMIT = 6;
const LIVE_REFRESH_INTERVAL_MS = 3000;
const SPLIT_PANE_MIN_WIDTH = 108;
const SPLIT_PANE_GUTTER = " │ ";
const SPLIT_PANE_SIDEBAR_WIDTH = 32;
const RECENT_ACTION_LIMIT = 5;

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
  { key: "a", action: "toggle live refresh" },
  { key: "r", action: "refresh current data" },
  { key: "?", action: "toggle the key help overlay" },
  { key: ": /", action: "open the launcher" },
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

function padLine(value, width) {
  return fitLine(value, width).padEnd(Math.max(0, width), " ");
}

function compactCommand(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatTimeLabel(value = null) {
  if (!value) {
    return "now";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "now";
  }

  return date.toISOString().slice(11, 19);
}

function createTuiEvent({
  id,
  at = new Date().toISOString(),
  level = "info",
  source = "session",
  message
} = {}) {
  const resolvedAt = at ?? null;
  return {
    id: id ?? `${source}:${resolvedAt ?? "now"}:${message ?? "event"}`,
    at: resolvedAt,
    timeLabel: formatTimeLabel(resolvedAt),
    level,
    source,
    message: String(message ?? "").trim()
  };
}

function createRecentAction({
  id,
  label,
  kind = "command",
  command = null,
  at = new Date().toISOString()
} = {}) {
  const resolvedAt = at ?? null;
  const resolvedLabel = String(label ?? command ?? "").trim();
  return {
    id: id ?? `${kind}:${command ?? resolvedLabel}:${resolvedAt ?? "now"}`,
    label: resolvedLabel,
    kind,
    command: command ?? null,
    at: resolvedAt,
    timeLabel: formatTimeLabel(resolvedAt)
  };
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

function appendRecentAction(entries = [], action, limit = RECENT_ACTION_LIMIT) {
  const next = createRecentAction(action);
  if (!next.label) {
    return entries.slice(0, limit);
  }

  const merged = [next];
  for (const existing of entries) {
    const normalized = createRecentAction(existing);
    if (normalized.label === next.label && normalized.kind === next.kind) {
      continue;
    }
    merged.push(normalized);
    if (merged.length >= limit) {
      break;
    }
  }
  return merged;
}

function inferActivityEventLevel(entry) {
  if (!entry) {
    return "info";
  }
  if (["blocked", "changes_requested"].includes(entry.type)) {
    return "warn";
  }
  if (["approved", "completed"].includes(entry.type)) {
    return "success";
  }
  return "info";
}

function buildRuntimeDerivedEvents(data) {
  const events = [];

  for (const alert of data.alertsView.alerts?.slice(0, 2) ?? []) {
    events.push(
      createTuiEvent({
        id: `runtime-alert:${alert.kind}:${alert.taskId ?? alert.swarmId ?? alert.summary}`,
        at: null,
        level: alert.severity === "high" ? "warn" : "info",
        source: "runtime_alert",
        message: alert.summary
      })
    );
  }

  for (const entry of data.activityView.entries?.slice(0, 3) ?? []) {
    events.push(
      createTuiEvent({
        id: `runtime-activity:${entry.entityType}:${entry.taskId ?? entry.swarmId ?? entry.at ?? entry.summary}`,
        at: entry.at ?? null,
        level: inferActivityEventLevel(entry),
        source: "runtime_activity",
        message: entry.summary
      })
    );
  }

  if (events.length === 0) {
    events.push(
      createTuiEvent({
        id: "runtime-idle",
        at: null,
        level: "info",
        source: "runtime_activity",
        message: "Runtime has no active alerts or recorded activity yet."
      })
    );
  }

  return events;
}

function mergeTuiEvents(sessionEvents = [], runtimeEvents = [], limit = EVENT_STREAM_LIMIT) {
  const merged = [];
  const seen = new Set();

  for (const event of [...sessionEvents, ...runtimeEvents]) {
    const normalized = createTuiEvent(event);
    if (!normalized.message) {
      continue;
    }

    const dedupeKey = `${normalized.source}:${normalized.message}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    merged.push(normalized);
    if (merged.length >= limit) {
      break;
    }
  }

  return merged;
}

function buildTuiSignals(data, recommendedSection) {
  return {
    guideMode: data.statusView.status.guideMode,
    tasks: data.statusView.status.counts.tasks,
    swarms: data.statusView.status.counts.swarms,
    memories: data.statusView.status.counts.memories,
    recommendedSurface: data.summaryPackView?.recommendedSurface ?? null,
    recommendedSection,
    alerts: {
      total: data.alertsView.counts?.total ?? 0,
      high: data.alertsView.counts?.high ?? 0,
      medium: data.alertsView.counts?.medium ?? 0,
      topSummary: data.alertsView.alerts?.[0]?.summary ?? null
    },
    activity: {
      totalEntries: data.activityView.counts?.totalEntries ?? 0,
      nextSummary: data.activityView.next?.summary ?? null
    }
  };
}

function buildTuiLayout(width) {
  const normalizedWidth = Math.max(40, Number(width) || DEFAULT_WIDTH);
  if (normalizedWidth < SPLIT_PANE_MIN_WIDTH) {
    return {
      mode: "stacked",
      sidebarWidth: 0,
      contentWidth: normalizedWidth
    };
  }

  const sidebarWidth = Math.min(
    SPLIT_PANE_SIDEBAR_WIDTH,
    Math.max(28, Math.floor(normalizedWidth * 0.3))
  );

  return {
    mode: "split-pane",
    sidebarWidth,
    contentWidth: normalizedWidth - sidebarWidth - SPLIT_PANE_GUTTER.length
  };
}

function buildLiveRefreshView(liveRefresh = {}) {
  const intervalMs = Number.isInteger(Number(liveRefresh.intervalMs)) && Number(liveRefresh.intervalMs) > 0
    ? Number(liveRefresh.intervalMs)
    : LIVE_REFRESH_INTERVAL_MS;

  return {
    enabled: liveRefresh.enabled === true,
    intervalMs,
    tick: Number.isInteger(Number(liveRefresh.tick)) ? Number(liveRefresh.tick) : 0,
    lastRefreshedAt: liveRefresh.lastRefreshedAt ?? null,
    lastRefreshedAtLabel: liveRefresh.lastRefreshedAt ? formatTimeLabel(liveRefresh.lastRefreshedAt) : "pending"
  };
}

function buildQuickActions({ liveRefreshEnabled = false, showHelp = false } = {}) {
  return [
    {
      id: "jump-recommended",
      label: "Open recommended",
      hint: "o",
      description: "Jump to the runtime-recommended section."
    },
    {
      id: "refresh",
      label: "Refresh runtime",
      hint: "r",
      description: "Reload the active runtime surface and compare signals."
    },
    {
      id: "toggle-auto",
      label: liveRefreshEnabled ? "Pause live refresh" : "Resume live refresh",
      hint: "a",
      description: "Toggle the background 3s refresh loop."
    },
    {
      id: "toggle-help",
      label: showHelp ? "Hide key help" : "Show key help",
      hint: "?",
      description: "Toggle the keybinding reference overlay."
    },
    {
      id: "open-launcher",
      label: "Open launcher",
      hint: ": /",
      description: "Search commands, screens, and runtime actions."
    }
  ];
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
    alertsView: runtimeAlerts(),
    activityView: runtimeActivity({ limit: EVENT_STREAM_LIMIT }),
    dashboardView: runtimeDashboard(),
    focusView: runtimeFocus(),
    handoffsView: runtimeHandoffs(),
    recoveryView: runtimeRecovery(),
    summaryPackView: runtimeSummaryPack()
  };
}

function buildCommandPaletteEntries(
  data,
  input = "",
  selectedCommandIndex = 0,
  { activeSection = DEFAULT_SECTION_ID, liveRefreshEnabled = false, showHelp = false } = {}
) {
  const commandCatalog = getCommandCatalog();
  const paletteByCommand = new Map(
    commandCatalog.map((entry) => [
      entry.command,
      {
        kind: "command",
        command: entry.command,
        displayCommand: `${PRODUCT_NAME} ${entry.command}`,
        description: entry.description ?? "",
        groupLabel: entry.groupLabel ?? "General",
        usage: entry.usage?.[0] ?? null,
        recommended: false,
        reasons: [],
        source: "catalog",
        preview: [
          entry.description ?? "CLI command",
          entry.usage?.[0] ? `Usage: ${entry.usage[0]}` : null,
          entry.notes?.[0] ?? null
        ].filter(Boolean)
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
        kind: "command",
        command,
        displayCommand: `${PRODUCT_NAME} ${command}`,
        description: reason ?? "Recommended from the current runtime state.",
        groupLabel: "Runtime recommendations",
        usage: null,
        recommended: false,
        reasons: [],
        source: "runtime",
        preview: [
          reason ?? "Recommended from the current runtime state.",
          "Runs the existing shipped CLI surface."
        ]
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
  const recommendedSection = mapRecommendedSurfaceToSection(data);
  const launcherExtras = [
    ...buildQuickActions({ liveRefreshEnabled, showHelp }).map((entry) => ({
      kind: "action",
      actionId: entry.id,
      command: entry.label.toLowerCase(),
      displayCommand: entry.label,
      description: entry.description,
      groupLabel: "Quick actions",
      usage: entry.hint ? `Shortcut: ${entry.hint}` : null,
      recommended: entry.id === "jump-recommended",
      reasons: [],
      source: "runtime",
      preview: [entry.description, entry.hint ? `Hotkey: ${entry.hint}` : null].filter(Boolean)
    })),
    ...TUI_SECTIONS.map((section) => ({
      kind: "section",
      actionId: `section:${section.id}`,
      targetSection: section.id,
      command: `open ${section.id}`,
      displayCommand: `Open ${section.label}`,
      description: section.description,
      groupLabel: "Screens",
      usage: `Shortcut: ${section.shortcut}`,
      recommended: section.id === recommendedSection,
      reasons: section.id === activeSection ? ["Currently active screen."] : [],
      source: "runtime",
      preview: [
        section.description,
        `Switch the main pane to ${section.label}.`,
        section.id === activeSection ? "This screen is active right now." : null
      ].filter(Boolean)
    }))
  ];

  const ranked = [...paletteByCommand.values(), ...launcherExtras]
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
      kind: entry.kind ?? "command",
      actionId: entry.actionId ?? null,
      targetSection: entry.targetSection ?? null,
      command: entry.command,
      displayCommand: entry.displayCommand,
      description: entry.description,
      groupLabel: entry.groupLabel,
      usage: entry.usage,
      recommended: entry.recommended,
      selected: index === boundedSelectedIndex,
      preview: Array.isArray(entry.preview) ? entry.preview.filter(Boolean) : []
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
  lines.push(...wrapText("Use ':' or '/' to open the launcher, filter commands or runtime actions, inspect the preview, then return to the current TUI screen.", width));
  return lines;
}

function getPaletteEntryBadge(entry) {
  if (!entry) {
    return "item";
  }
  if (entry.kind === "action") {
    return "action";
  }
  if (entry.kind === "section") {
    return "screen";
  }
  return "cmd";
}

function buildCommandPalettePreviewLines(commandPalette = null, width) {
  const selectedEntry =
    commandPalette?.entries?.[commandPalette?.selectedIndex] ??
    commandPalette?.entries?.[0] ??
    null;

  if (!selectedEntry) {
    return [];
  }

  const lines = ["Preview:"];
  lines.push(
    fitLine(
      `${selectedEntry.displayCommand} · ${getPaletteEntryBadge(selectedEntry)}`,
      width
    )
  );

  for (const line of selectedEntry.preview ?? []) {
    lines.push(...wrapText(line, width));
  }

  if (selectedEntry.kind === "command" && selectedEntry.usage) {
    lines.push(...wrapText(`Usage: ${selectedEntry.usage}`, width));
  }

  return lines;
}

function buildCommandPaletteLines(commandPalette = null, width) {
  if (!commandPalette?.visible) {
    return [];
  }

  const lines = [
    "Launcher:",
    ...wrapText("Search commands, screens, and runtime actions. Tab accepts the selected entry and Enter runs it.", width)
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
    lines.push(fitLine(`${prefix} ${entry.displayCommand} · ${getPaletteEntryBadge(entry)}${suffix}`, width));
    lines.push(
      fitLine(
        `  ${entry.groupLabel} - ${entry.description || entry.usage || "Command palette entry"}`,
        width
      )
    );
  }

  const previewLines = buildCommandPalettePreviewLines(commandPalette, width);
  if (previewLines.length > 0) {
    lines.push("");
    lines.push(...previewLines);
  }

  return lines;
}

function buildCommandPaletteBodyLines(commandPalette = null, width) {
  if (!commandPalette?.visible) {
    return [];
  }

  const introLines = [
    "Launcher:",
    ...wrapText("Search commands, screens, and runtime actions. Tab accepts the selected entry and Enter runs it.", width),
    ""
  ];

  if ((commandPalette.entries?.length ?? 0) === 0) {
    return [...introLines, ...wrapText("No matching commands. Keep typing or press Esc to cancel.", width)];
  }

  const selectedIndex = Math.max(0, commandPalette.selectedIndex ?? 0);
  const selectedEntry = commandPalette.entries[selectedIndex] ?? commandPalette.entries[0];
  const siblingEntries = commandPalette.entries
    .filter((_, index) => index !== selectedIndex)
    .slice(0, 3);

  const selectionLines = [
    `> ${selectedEntry.displayCommand} · ${getPaletteEntryBadge(selectedEntry)}${selectedEntry.recommended ? " [recommended]" : ""}`,
    `  ${selectedEntry.groupLabel} - ${selectedEntry.description || selectedEntry.usage || "Launcher entry"}`,
    ""
  ];

  const previewLines = buildCommandPalettePreviewLines(
    {
      ...commandPalette,
      entries: [selectedEntry],
      selectedIndex: 0
    },
    width
  );

  const siblingLines = siblingEntries.length === 0
    ? []
    : [
        "",
        "More matches:",
        ...siblingEntries.flatMap((entry) => [
          fitLine(`  ${entry.displayCommand} · ${getPaletteEntryBadge(entry)}${entry.recommended ? " [recommended]" : ""}`, width),
          fitLine(`    ${entry.groupLabel} - ${entry.description || entry.usage || "Launcher entry"}`, width)
        ])
      ];

  return [...introLines, ...selectionLines, ...previewLines, ...siblingLines];
}

function buildSidebarLines(snapshot, width) {
  const lines = ["Navigator:"];
  for (const section of snapshot.sections) {
    const activeMarker = section.id === snapshot.activeSection ? ">" : " ";
    const recommendedMarker = section.id === snapshot.recommendedSection ? " *" : "";
    lines.push(`${activeMarker} ${section.shortcut} ${section.label}${recommendedMarker}`);
  }

  lines.push("");
  lines.push("Live runtime:");
  lines.push(
    `- ${snapshot.liveRefresh.enabled ? `auto ${Math.round(snapshot.liveRefresh.intervalMs / 1000)}s` : "manual"} · last ${snapshot.liveRefresh.lastRefreshedAtLabel}`
  );
  lines.push(`- guide ${snapshot.signals.guideMode} · alerts h=${snapshot.signals.alerts.high} m=${snapshot.signals.alerts.medium}`);
  lines.push(`- activity ${snapshot.signals.activity.totalEntries} · layout ${snapshot.layout.mode}`);

  lines.push("");
  lines.push("Recent:");
  if ((snapshot.recentActions?.length ?? 0) === 0) {
    lines.push("- No recent actions yet.");
  } else {
    lines.push(
      ...bulletize(
        snapshot.recentActions.slice(0, 2).map((entry) => `${entry.timeLabel} ${entry.label}`),
        width,
        "· "
      )
    );
  }

  lines.push("");
  lines.push("Quick actions:");
  lines.push(
    ...bulletize(
      snapshot.quickActions.slice(0, 2).map((entry) => `${entry.hint} ${entry.label}`),
      width,
      "· "
    )
  );

  if (snapshot.signals.alerts.topSummary) {
    lines.push("");
    lines.push("Top alert:");
    lines.push(...wrapText(snapshot.signals.alerts.topSummary, width));
  }

  lines.push("");
  lines.push("Event stream:");
  lines.push(
    ...bulletize(
      snapshot.eventStream.entries.slice(0, 2).map((entry) => `${entry.timeLabel} ${entry.message}`),
      width,
      "· "
    )
  );

  return lines.map((line) => fitLine(line, width));
}

function combineSplitPaneLines(leftLines = [], rightLines = [], leftWidth, rightWidth) {
  const rowCount = Math.max(leftLines.length, rightLines.length);
  const rows = [];

  for (let index = 0; index < rowCount; index += 1) {
    rows.push(
      `${padLine(leftLines[index] ?? "", leftWidth)}${SPLIT_PANE_GUTTER}${padLine(rightLines[index] ?? "", rightWidth)}`
    );
  }

  return rows;
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

  const paletteLines =
    commandMode && snapshot.commandPalette?.visible
      ? [...buildCommandPaletteBodyLines(snapshot.commandPalette, normalizedWidth), ""]
      : [];
  const panelLines = [...snapshot.panel.lines.map((line) => fitLine(line, normalizedWidth)), ""];
  const bodyLines =
    snapshot.layout.mode === "split-pane"
      ? combineSplitPaneLines(
          buildSidebarLines(snapshot, snapshot.layout.sidebarWidth),
          commandMode
            ? [...buildCommandPaletteBodyLines(snapshot.commandPalette, snapshot.layout.contentWidth), "", ...snapshot.panel.lines.map((line) => fitLine(line, snapshot.layout.contentWidth))]
            : snapshot.panel.lines.map((line) => fitLine(line, snapshot.layout.contentWidth)),
          snapshot.layout.sidebarWidth,
          snapshot.layout.contentWidth
        )
      : commandMode
        ? [...paletteLines, ...panelLines]
        : [...panelLines];

  const footerLines = [];
  if (flashMessage) {
    footerLines.push(fitLine(`Notice: ${flashMessage}`, normalizedWidth));
  }
  footerLines.push(
    fitLine(
      `Live: ${snapshot.liveRefresh.enabled ? `auto ${Math.round(snapshot.liveRefresh.intervalMs / 1000)}s` : "manual"} | Layout: ${snapshot.layout.mode} | Events: ${snapshot.eventStream.total}`,
      normalizedWidth
    )
  );
  footerLines.push(
    fitLine(
      commandMode
        ? "Keys: ↑/↓ select | Tab accept | Enter run | Esc cancel | Ctrl+C quit"
        : "Keys: 1-6 switch | Tab cycle | o recommended | a auto | r refresh | ? help | :/ launcher | q quit",
      normalizedWidth
    )
  );
  footerLines.push(
    fitLine(
      commandMode
        ? `Command > ${commandInput || ""}`
        : "Command > press ':' or '/' to open the launcher from inside the TUI",
      normalizedWidth
    )
  );

  const lines = [...headerLines, ...bodyLines, ...footerLines];
  if (lines.length > normalizedHeight) {
    const availablePanelLines = Math.max(
      1,
      normalizedHeight - headerLines.length - footerLines.length - 1
    );
    const visiblePanelLines = bodyLines.slice(0, availablePanelLines);
    return [
      ...headerLines,
      ...visiblePanelLines,
      fitLine(`... truncated to ${normalizedHeight} rows`, normalizedWidth),
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
  eventStream = [],
  recentActions = [],
  liveRefresh = {},
  flashMessage = null
} = {}) {
  const activeSection = normalizeSectionId(section);
  const data = getRuntimeTuiData();
  const layout = buildTuiLayout(width);
  const recommendedSection = mapRecommendedSurfaceToSection(data);
  const mergedEventStream = mergeTuiEvents(eventStream, buildRuntimeDerivedEvents(data), EVENT_STREAM_LIMIT);
  const liveRefreshView = buildLiveRefreshView(liveRefresh);
  const signals = buildTuiSignals(data, recommendedSection);
  const sectionView = buildSectionView(
    activeSection,
    data,
    layout.mode === "split-pane" ? layout.contentWidth : width,
    showHelp
  );
  const quickActions = buildQuickActions({
    liveRefreshEnabled: liveRefresh.enabled === true,
    showHelp
  });
  const normalizedRecentActions = recentActions
    .map((entry) => createRecentAction(entry))
    .filter((entry) => entry.label);
  const commandPalette = commandMode
    ? buildCommandPaletteEntries(data, commandInput, selectedCommandIndex, {
        activeSection,
        liveRefreshEnabled: liveRefresh.enabled === true,
        showHelp
      })
    : null;
  const snapshot = {
    kind: "runtime_tui_snapshot",
    recommendedReason: "tui_snapshot_rendered",
    activeSection,
    recommendedSection,
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
    commandPalette,
    layout,
    liveRefresh: liveRefreshView,
    signals,
    quickActions,
    recentActions: normalizedRecentActions,
    eventStream: {
      total: mergedEventStream.length,
      entries: mergedEventStream
    }
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
      eventStreamEntries: mergedEventStream.length,
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
    if (!selectedEntry) {
      return { kind: "command", input: "" };
    }
    if (selectedEntry.kind === "command") {
      return { kind: "command", input: selectedEntry.command, entry: selectedEntry };
    }
    return { kind: selectedEntry.kind, entry: selectedEntry, input: selectedEntry.command ?? "" };
  }

  const { commandQuery, suffix } = splitCommandInput(trimmedInput);
  const normalizedCommandQuery = normalizeSuggestedCommand(commandQuery);
  if (!selectedEntry) {
    return { kind: "command", input: trimmedInput };
  }

  if (selectedEntry.kind === "command" && normalizedCommandQuery === selectedEntry.command) {
    return { kind: "command", input: `${selectedEntry.command}${suffix}`, entry: selectedEntry };
  }

  const exactPaletteMatch = commandPalette.entries.find(
    (entry) => entry.kind === "command" && entry.command === normalizedCommandQuery
  );
  if (exactPaletteMatch) {
    return {
      kind: "command",
      input: normalizedCommandQuery ? `${normalizedCommandQuery}${suffix}` : trimmedInput,
      entry: exactPaletteMatch
    };
  }

  if (selectedEntry.kind === "command") {
    return { kind: "command", input: `${selectedEntry.command}${suffix}`, entry: selectedEntry };
  }

  return { kind: selectedEntry.kind, entry: selectedEntry, input: trimmedInput };
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

function appendTuiEvent(entries = [], event) {
  return mergeTuiEvents([event, ...entries], [], EVENT_STREAM_LIMIT);
}

function buildSignalChangeEvents(previousSignals, nextSignals, { source = "manual", openedSection = null, intervalMs = LIVE_REFRESH_INTERVAL_MS } = {}) {
  if (!previousSignals) {
    return [
      createTuiEvent({
        level: "info",
        source: "session",
        message: `TUI session opened on ${openedSection ?? nextSignals?.recommendedSection ?? DEFAULT_SECTION_ID}.`
      }),
      createTuiEvent({
        level: "info",
        source: "session",
        message: `Live refresh is running every ${Math.round(intervalMs / 1000)}s.`
      })
    ];
  }

  const events = [];
  if (previousSignals.guideMode !== nextSignals.guideMode) {
    events.push(
      createTuiEvent({
        level: "info",
        source: "session",
        message: `Guide mode changed ${previousSignals.guideMode} → ${nextSignals.guideMode}.`
      })
    );
  }

  if (previousSignals.tasks !== nextSignals.tasks) {
    events.push(
      createTuiEvent({
        level: nextSignals.tasks > previousSignals.tasks ? "success" : "warn",
        source: "session",
        message: `Tracked tasks changed ${previousSignals.tasks} → ${nextSignals.tasks}.`
      })
    );
  }

  if (previousSignals.swarms !== nextSignals.swarms) {
    events.push(
      createTuiEvent({
        level: nextSignals.swarms > previousSignals.swarms ? "success" : "warn",
        source: "session",
        message: `Tracked swarms changed ${previousSignals.swarms} → ${nextSignals.swarms}.`
      })
    );
  }

  if (previousSignals.alerts.high !== nextSignals.alerts.high || previousSignals.alerts.medium !== nextSignals.alerts.medium) {
    events.push(
      createTuiEvent({
        level: nextSignals.alerts.high > previousSignals.alerts.high ? "warn" : "info",
        source: "session",
        message: `Alert pressure changed to high=${nextSignals.alerts.high}, medium=${nextSignals.alerts.medium}.`
      })
    );
  }

  if (previousSignals.recommendedSection !== nextSignals.recommendedSection) {
    events.push(
      createTuiEvent({
        level: "info",
        source: "session",
        message: `Recommended section changed ${previousSignals.recommendedSection} → ${nextSignals.recommendedSection}.`
      })
    );
  }

  if (events.length === 0 && source === "manual") {
    events.push(
      createTuiEvent({
        level: "info",
        source: "session",
        message: "Manual refresh completed with no runtime-level changes."
      })
    );
  }

  return events;
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
  let liveRefreshEnabled = true;
  let lastRefreshedAt = new Date().toISOString();
  let refreshTick = 0;
  let sessionEventStream = [];
  let recentActions = [];
  let latestSignals = null;
  let attached = false;
  let busy = false;
  let refreshTimer = null;

  const captureSnapshot = () =>
    getRuntimeTuiSnapshot({
      section: activeSection,
      width: getTerminalWidth(),
      height: getTerminalHeight(),
      showHelp,
      commandMode,
      commandInput,
      selectedCommandIndex,
      eventStream: sessionEventStream,
      recentActions,
      liveRefresh: {
        enabled: liveRefreshEnabled,
        intervalMs: LIVE_REFRESH_INTERVAL_MS,
        lastRefreshedAt,
        tick: refreshTick
      },
      flashMessage
    });

  const render = () => {
    const snapshotView = captureSnapshot();
    writeScreen(snapshotView.text);
    return snapshotView;
  };

  const clearRefreshTimer = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  const recordSessionEvents = (events = []) => {
    for (const event of events) {
      sessionEventStream = appendTuiEvent(sessionEventStream, event);
    }
  };

  const scheduleRefreshTimer = () => {
    clearRefreshTimer();
    if (!attached || !liveRefreshEnabled) {
      return;
    }

    refreshTimer = setInterval(() => {
      if (!busy) {
        refreshRuntimeView({ source: "auto" });
      }
    }, LIVE_REFRESH_INTERVAL_MS);
    refreshTimer.unref?.();
  };

  const refreshRuntimeView = ({ source = "manual", commandMessage = null } = {}) => {
    lastRefreshedAt = new Date().toISOString();
    refreshTick += 1;

    const baselineSnapshot = captureSnapshot();
    const nextSignals = baselineSnapshot.signals;
    const events = commandMessage
      ? [
          createTuiEvent({
            level: "info",
            source: "session",
            message: commandMessage
          })
        ]
      : buildSignalChangeEvents(latestSignals, nextSignals, {
          source,
          openedSection: activeSection,
          intervalMs: LIVE_REFRESH_INTERVAL_MS
        });

    if (events.length > 0) {
      recordSessionEvents(events);
    }

    const finalSnapshot = captureSnapshot();
    latestSignals = finalSnapshot.signals;
    writeScreen(finalSnapshot.text);
    return finalSnapshot;
  };

  const recordRecentAction = (action) => {
    recentActions = appendRecentAction(recentActions, action);
  };

  const runLauncherAction = async (entry) => {
    if (!entry) {
      return;
    }

    if (entry.kind === "section") {
      activeSection = entry.targetSection ?? activeSection;
      showHelp = false;
      flashMessage = `Opened ${entry.displayCommand}.`;
      recordRecentAction({ label: entry.displayCommand, kind: "section" });
      recordSessionEvents([
        createTuiEvent({
          level: "info",
          source: "session",
          message: flashMessage
        })
      ]);
      render();
      return;
    }

    if (entry.actionId === "jump-recommended") {
      activeSection = captureSnapshot().recommendedSection;
      flashMessage = `Opened recommended section: ${activeSection}.`;
      recordRecentAction({ label: entry.displayCommand, kind: "action" });
      recordSessionEvents([
        createTuiEvent({
          level: "info",
          source: "session",
          message: flashMessage
        })
      ]);
      render();
      return;
    }

    if (entry.actionId === "refresh") {
      flashMessage = "Manual refresh completed.";
      recordRecentAction({ label: entry.displayCommand, kind: "action" });
      refreshRuntimeView({ source: "manual", commandMessage: flashMessage });
      return;
    }

    if (entry.actionId === "toggle-auto") {
      liveRefreshEnabled = !liveRefreshEnabled;
      flashMessage = liveRefreshEnabled ? "Auto refresh resumed." : "Auto refresh paused.";
      recordRecentAction({ label: entry.displayCommand, kind: "action" });
      recordSessionEvents([
        createTuiEvent({
          level: "info",
          source: "session",
          message: flashMessage
        })
      ]);
      scheduleRefreshTimer();
      render();
      return;
    }

    if (entry.actionId === "toggle-help") {
      showHelp = !showHelp;
      flashMessage = showHelp ? "Key help opened." : "Key help hidden.";
      recordRecentAction({ label: entry.displayCommand, kind: "action" });
      render();
      return;
    }

    if (entry.actionId === "open-launcher") {
      commandMode = true;
      commandInput = "";
      selectedCommandIndex = 0;
      render();
    }
  };

  const detach = () => {
    if (!attached) {
      return;
    }
    attached = false;
    clearRefreshTimer();
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
    scheduleRefreshTimer();
  };

  const close = () => {
    detach();
    exit(0);
  };

  const runCommandMode = async () => {
    const snapshotView = captureSnapshot();
    const input = resolveCommandModeInput(commandInput, snapshotView.commandPalette);
    commandMode = false;
    commandInput = "";
    selectedCommandIndex = 0;
    flashMessage = null;

    if (input.kind !== "command") {
      await runLauncherAction(input.entry);
      return;
    }

    recordRecentAction({
      label: `${PRODUCT_NAME} ${input.input}`,
      kind: "command",
      command: input.input
    });
    busy = true;
    detach();
    try {
      flashMessage = await runNestedCliCommand(input.input);
    } finally {
      stdin.setRawMode(true);
      stdin.resume();
      attach();
      busy = false;
      refreshRuntimeView({ source: "manual", commandMessage: flashMessage });
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
        const snapshotView = captureSnapshot();
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
    if (character === "a") {
      liveRefreshEnabled = !liveRefreshEnabled;
      flashMessage = liveRefreshEnabled ? "Auto refresh resumed." : "Auto refresh paused.";
      recordSessionEvents([
        createTuiEvent({
          level: "info",
          source: "session",
          message: flashMessage
        })
      ]);
      scheduleRefreshTimer();
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
    if (character === "/") {
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
      refreshRuntimeView({ source: "manual" });
      return;
    }
    if (character === "o") {
      activeSection = captureSnapshot().recommendedSection;
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
  const initialSnapshot = captureSnapshot();
  latestSignals = initialSnapshot.signals;
  recordSessionEvents(
    buildSignalChangeEvents(null, initialSnapshot.signals, {
      source: "initial",
      openedSection: activeSection,
      intervalMs: LIVE_REFRESH_INTERVAL_MS
    })
  );
  render();
}
