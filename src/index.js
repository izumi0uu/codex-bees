#!/usr/bin/env node

import { argv, env, exit } from "node:process";
import { fileURLToPath } from "node:url";
import { isMcpCliUsageError } from "./mcp.js";
import { runCliCommand } from "./state/cli/command-dispatch.js";
import { getSuggestedCliCommands } from "./state/cli/command-suggestions.js";
import { isCliEntrypoint, writeErr } from "./state/cli/helpers.js";

const MODULE_PATH = fileURLToPath(import.meta.url);

async function runCommand(command) {
  const handled = await runCliCommand(command, { mcpArgs: argv.slice(3) });
  if (handled) {
    return;
  }

  writeErr(`Unknown command: ${command}\n\n`);
  const suggestions = getSuggestedCliCommands(command);
  if (suggestions.length > 0) {
    writeErr("Did you mean:\n");
    for (const suggestion of suggestions) {
      writeErr(`  codex-bees ${suggestion}\n`);
    }
    writeErr("\n");
  }
  await runCliCommand("--help");
  exit(1);
}

if (isCliEntrypoint(MODULE_PATH)) {
  if (env.CODEX_BEES_CLI_TRACE === "1") {
    writeErr(`[codex-bees] argv=${JSON.stringify(argv.slice(2))}\n`);
  }

  runCommand(argv[2]).catch((error) => {
    writeErr(`${isMcpCliUsageError(error) ? error.message : error.stack || error.message}\n`);
    exit(1);
  });
}
