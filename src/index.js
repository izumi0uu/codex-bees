#!/usr/bin/env node

import { stdout, stderr, exit, argv, env, cwd } from "node:process";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { startMcpServer, toolCatalog } from "./mcp.js";

const VERSION = "0.1.0";

function write(text) {
  stdout.write(text);
}

function writeErr(text) {
  stderr.write(text);
}

function printHelp() {
  write(`codex-bees\n\n`);
  write(`Usage:\n`);
  write(`  codex-bees run           Start the local Codex runtime shell contract\n`);
  write(`  codex-bees mcp           Start the Codex MCP stdio runtime\n`);
  write(`  codex-bees tools         Print the current MCP tool catalog\n`);
  write(`  codex-bees doctor        Print runtime contract diagnostics\n`);
  write(`  codex-bees --help        Show help\n`);
  write(`  codex-bees --version     Show version\n`);
}

function runtimeContract() {
  return {
    product: "codex-bees",
    mode: "codex-only",
    workingDirectory: cwd(),
    node: process.version,
    transport: {
      cli: "stdio",
      mcp: "stdio-jsonrpc"
    },
    responsibilities: [
      "bootstrap codex-first runtime commands",
      "expose MCP tool catalog for story-driven execution",
      "provide a stable diagnostics surface for later orchestration layers"
    ],
    exclusions: [
      "claude plugin marketplace compatibility",
      "multi-host runtime support",
      "hosted backend control plane"
    ]
  };
}

function printDoctor() {
  const selfPath = fileURLToPath(import.meta.url);
  const exists = statSync(selfPath).isFile();
  write(
    JSON.stringify(
      {
        status: "ok",
        executable: exists,
        entry: selfPath,
        contract: runtimeContract()
      },
      null,
      2
    ) + "\n"
  );
}

async function runCommand(command) {
  switch (command) {
    case undefined:
    case "run":
      write(
        JSON.stringify(
          {
            status: "ready",
            contract: runtimeContract(),
            next: [
              "use `codex-bees doctor` to inspect runtime boundaries",
              "use `codex-bees tools` to inspect current MCP tool catalog",
              "use `codex-bees mcp` to start the stdio MCP surface"
            ]
          },
          null,
          2
        ) + "\n"
      );
      return;
    case "mcp":
      await startMcpServer();
      return;
    case "tools":
      write(JSON.stringify({ tools: toolCatalog }, null, 2) + "\n");
      return;
    case "doctor":
      printDoctor();
      return;
    case "--help":
    case "help":
      printHelp();
      return;
    case "--version":
    case "version":
      write(`${VERSION}\n`);
      return;
    default:
      writeErr(`Unknown command: ${command}\n\n`);
      printHelp();
      exit(1);
  }
}

if (env.CODEX_BEES_CLI_TRACE === "1") {
  writeErr(`[codex-bees] argv=${JSON.stringify(argv.slice(2))}\n`);
}

await runCommand(argv[2]);
