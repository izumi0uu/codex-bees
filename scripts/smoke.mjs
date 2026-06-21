import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_TYPE_ENTRYPOINTS } from "../src/typings.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const DIST_INDEX = join(REPO_ROOT, "dist", "index.js");
const DIST_DIR = join(REPO_ROOT, "dist");
const README_PATH = join(REPO_ROOT, "README.md");
const PACKAGE_JSON_PATH = join(REPO_ROOT, "package.json");
const README_TEXT = readFileSync(README_PATH, "utf8");
const CLI_SOURCE_TEXT = readFileSync(join(REPO_ROOT, "src", "index.js"), "utf8");
const NPM_CACHE_DIR = join(tmpdir(), "codex-bees-smoke-npm-cache");
let packedTarballPath = null;

function sortedKeys(value) {
  return Object.keys(value).sort();
}

function assertMatchingKeys(label, actual, expected) {
  const actualKeys = sortedKeys(actual);
  const expectedKeys = sortedKeys(expected);
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    console.error(`[smoke:${label}] expected matching export keys`);
    console.error(JSON.stringify({ actualKeys, expectedKeys }, null, 2));
    process.exit(1);
  }
}

function getCliSwitchCommands() {
  const switchMatch = CLI_SOURCE_TEXT.match(/async function runCommand\(command\) \{([\s\S]*?)\n\}/);
  if (!switchMatch) {
    console.error("[smoke:commands-parity-source] expected runCommand switch in src/index.js");
    process.exit(1);
  }

  const aliasMap = new Map([
    ["help", "--help"],
    ["version", "--version"]
  ]);

  return [...switchMatch[1].matchAll(/case\s+"([^"]+)":/g)]
    .map((match) => aliasMap.get(match[1]) ?? match[1])
    .filter((command, index, commands) => commands.indexOf(command) === index);
}

function cleanupPackedTarball() {
  if (packedTarballPath) {
    rmSync(packedTarballPath, { force: true });
  }
}

process.on("exit", cleanupPackedTarball);

function run(label, args, expectedStatus = 0) {
  const result = spawnSync("node", args, { encoding: "utf8" });
  if (result.status !== expectedStatus) {
    console.error(`[smoke:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result;
}

function runInCwd(label, args, cwd, expectedStatus = 0) {
  const result = spawnSync("node", args, { cwd, encoding: "utf8" });
  if (result.status !== expectedStatus) {
    console.error(`[smoke:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result;
}

function runNpm(args, options = {}) {
  mkdirSync(NPM_CACHE_DIR, { recursive: true });
  return spawnSync("npm", args, {
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: NPM_CACHE_DIR
    },
    ...options
  });
}

function runInstalledTypecheck(label, files) {
  const command = [
    "exec",
    "--yes",
    "--package",
    "typescript",
    "tsc",
    "--",
    "--noEmit",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    ...files
  ];
  return runNpm(command, { cwd: packedInstallAppDir });
}

run("build-dist", ["./scripts/build.mjs"]);
rmSync(".codex-bees", { recursive: true, force: true });

const checks = [
  ["help", ["./src/index.js", "--help"]],
  ["version", ["./src/index.js", "--version"]],
  ["ready", ["./src/index.js", "ready"]],
  ["commands", ["./src/index.js", "commands"]],
  ["command-get", ["./src/index.js", "command:get", "--name", "init"]],
  ["command-help", ["./src/index.js", "command:help", "--name", "init"]],
  ["init-options", ["./src/index.js", "init:options"]],
  ["init-option", ["./src/index.js", "init:option", "--option", "--preview"]],
  ["init-option-help", ["./src/index.js", "init:help", "--option", "--preview"]],
  ["init-preview", ["./src/index.js", "init", "--preview"]],
["init-help", ["./src/index.js", "init", "--help"]],
  ["mcp-options", ["./src/index.js", "mcp:options"]],
  ["mcp-option", ["./src/index.js", "mcp:option", "--option", "--tools"]],
  ["mcp-option-help", ["./src/index.js", "mcp:help", "--option", "--tools"]],
  ["mcp-help", ["./src/index.js", "mcp", "--help"]],
  ["mcp-version", ["./src/index.js", "mcp", "--version"]],
  ["catalog", ["./src/index.js", "catalog"]],
  ["catalog-agents", ["./src/index.js", "catalog:agents"]],
  ["catalog-agent", ["./src/index.js", "catalog:agent", "--id", "executor"]],
  ["catalog-skills", ["./src/index.js", "catalog:skills"]],
  ["catalog-skill", ["./src/index.js", "catalog:skill", "--id", "project-development"]],
  ["guidance-overview", ["./src/index.js", "guidance:overview"]],
  ["guidance-worker", ["./src/index.js", "guidance:worker"]],
  ["contract", ["./src/index.js", "contract"]],
  ["metadata", ["./src/index.js", "metadata"]],
  ["status", ["./src/index.js", "status"]],
  ["capabilities", ["./src/index.js", "capabilities"]],
  ["capability-get", ["./src/index.js", "capabilities:get", "--id", "memory"]],
  ["cli-tools", ["./src/index.js", "tools"]],
  ["cli-tool-get", ["./src/index.js", "tools:get", "--name", "runtime_contract"]],
  ["tools", ["./src/mcp.js", "--tools"]],
  ["dist-help", ["./dist/index.js", "--help"]],
  ["dist-tools", ["./dist/mcp.js", "--tools"]],
  [
    "memory-store",
    [
      "./src/index.js",
      "memory:store",
      "--content",
      "Remember that smoke tests validate lane metadata",
      "--namespace",
      "smoke",
      "--kind",
      "note",
      "--agent",
      "tester",
      "--tags",
      "smoke,metadata"
    ]
  ],
  ["memory-get", ["./src/index.js", "memory:get", "--id", "memory-1"]],
  ["memory-list", ["./src/index.js", "memory:list", "--namespace", "smoke"]],
  [
    "memory-search",
    ["./src/index.js", "memory:search", "--query", "lane metadata", "--namespace", "smoke"]
  ],
  ["plan", ["./src/index.js", "plan", "--task", "Add a doctor smoke check to the CLI"]],
  ["plan-queue", ["./src/index.js", "plan:queue", "--task", "Queue a runtime task"]],
  ["plan-swarm", ["./src/index.js", "plan:swarm", "--task", "Coordinate a runtime task"]],
  [
    "task-add",
    [
      "./src/index.js",
      "task:add",
      "--title",
      "smoke task",
      "--status",
      "todo",
      "--owner",
      "executor",
      "--verifier",
      "tester",
      "--objective",
      "prove metadata persistence",
      "--lane",
      "lane-smoke",
      "--scope",
      "src/index.js,src/mcp.js",
      "--acceptance",
      "metadata stored|manual task remains bounded",
      "--verification",
      "task:list shows metadata|task:update preserves metadata"
    ]
  ],
  ["task-claim", ["./src/index.js", "task:claim", "--id", "task-3", "--by", "smoke-worker"]],
  ["task-block", ["./src/index.js", "task:block", "--id", "task-3", "--by", "smoke-worker", "--notes", "waiting on verifier"]],
  ["task-claim-from-blocked", ["./src/index.js", "task:claim", "--id", "task-3", "--by", "smoke-worker"]],
  ["task-review", ["./src/index.js", "task:review", "--id", "task-3", "--by", "smoke-worker"]],
  ["task-done-unauthorized", ["./src/index.js", "task:done", "--id", "task-3", "--by", "smoke-worker"], 1],
  [
    "task-approve",
    [
      "./src/index.js",
      "task:approve",
      "--id",
      "task-3",
      "--by",
      "tester",
      "--notes",
      "smoke verifier approved",
      "--evidence",
      "npm run smoke|task metadata reviewed"
    ]
  ],
  ["task-list", ["./src/index.js", "task:list"]],
  [
    "task-update",
    [
      "./src/index.js",
      "task:update",
      "--id",
      "task-3",
      "--status",
      "done",
      "--notes",
      "verified by smoke",
      "--acceptance",
      "metadata stored|manual task remains bounded|update path works",
      "--verification",
      "task:list shows metadata|task:update preserves metadata|smoke command passes"
    ]
  ],
  ["task-release-invalid", ["./src/index.js", "task:release", "--id", "task-3", "--by", "smoke-worker"], 1]
];

for (const [label, args, expectedStatus = 0] of checks) {
  run(label, args, expectedStatus);
}

const importedSourceCli = run("import-src-index", [
  "-e",
  'import("./src/index.js").then(() => console.log("IMPORT_OK"))'
]).stdout.trim();
if (importedSourceCli !== "IMPORT_OK") {
  console.error("[smoke:import-src-index] expected source index import to stay silent and resolve");
  process.exit(1);
}

const importedDistCli = run("import-dist-index", [
  "-e",
  'import("./dist/index.js").then(() => console.log("DIST_IMPORT_OK"))'
]).stdout.trim();
if (importedDistCli !== "DIST_IMPORT_OK") {
  console.error("[smoke:import-dist-index] expected dist index import to stay silent and resolve");
  process.exit(1);
}
const initHelpSideEffectDir = mkdtempSync(join(tmpdir(), "codex-bees-init-help-"));
const initHelpResult = runInCwd("init-help-side-effect-check", [join(REPO_ROOT, "src", "index.js"), "init", "--help"], initHelpSideEffectDir);
if (
  initHelpResult.status !== 0 ||
  !initHelpResult.stdout.includes("codex-bees init") ||
  existsSync(join(initHelpSideEffectDir, ".codex")) ||
  existsSync(join(initHelpSideEffectDir, ".gitignore"))
) {
  console.error("[smoke:init-help] expected init help to stay side-effect free");
  process.exit(1);
}
rmSync(initHelpSideEffectDir, { recursive: true, force: true });

const importedSourceApi = JSON.parse(
  run("import-src-api", [
    "-e",
    'import("./src/api.js").then((m) => console.log(JSON.stringify(Object.keys(m).sort())))'
  ]).stdout
);
if (!importedSourceApi.includes("getRuntimeCatalogView")) {
  console.error("[smoke:import-src-api] expected source api module to expose root runtime catalog");
  process.exit(1);
}

const importedDistApi = JSON.parse(
  run("import-dist-api", [
    "-e",
    'import("./dist/api.js").then((m) => console.log(JSON.stringify(Object.keys(m).sort())))'
  ]).stdout
);
assertMatchingKeys(
  "import-dist-api",
  Object.fromEntries(importedDistApi.map((key) => [key, true])),
  Object.fromEntries(importedSourceApi.map((key) => [key, true]))
);

const metadataCli = JSON.parse(run("metadata-cli", ["./src/index.js", "metadata"]).stdout).metadata;
if (
  metadataCli.kind !== "package_metadata_view" ||
  metadataCli.metadata?.product !== "codex-bees" ||
  metadataCli.metadata?.homepage !== "https://github.com/izumi0uu/codex-bees#readme"
) {
  console.error("[smoke:metadata-cli] expected metadata command to expose the package metadata view");
  process.exit(1);
}

const mcpVersionCli = run("mcp-version-cli", ["./src/index.js", "mcp", "--version"]).stdout.trim();
if (mcpVersionCli !== "0.1.0") {
  console.error("[smoke:mcp-version-cli] expected mcp subcommand version output");
  process.exit(1);
}

const storedMemoryCli = JSON.parse(
  run("memory-store-cli", [
    "./src/index.js",
    "memory:store",
    "--content",
    "Remember that smoke tests validate lane metadata",
    "--namespace",
    "smoke",
    "--kind",
    "note",
    "--agent",
    "tester",
    "--tags",
    "smoke,metadata"
  ]).stdout
).stored;
if (
  storedMemoryCli.kind !== "memory_mutation" ||
  storedMemoryCli.recommendedReason !== "memory_stored" ||
  storedMemoryCli.memory?.id !== "memory-2" ||
  storedMemoryCli.memory?.namespace !== "smoke" ||
  storedMemoryCli.memory?.content !== "Remember that smoke tests validate lane metadata"
) {
  console.error("[smoke:memory-store] expected CLI memory store mutation payload");
  process.exit(1);
}

const updatedLifecycleCli = JSON.parse(
  run("task-update-lifecycle-cli", [
    "./src/index.js",
    "task:update",
    "--id",
    "task-3",
    "--status",
    "done",
    "--notes",
    "verified by smoke",
    "--acceptance",
    "metadata stored|manual task remains bounded|update path works",
    "--verification",
    "task:list shows metadata|task:update preserves metadata|smoke command passes"
  ]).stdout
).updated;
if (
  updatedLifecycleCli.kind !== "task_mutation" ||
  updatedLifecycleCli.recommendedReason !== "task_updated" ||
  updatedLifecycleCli.task?.id !== "task-3" ||
  updatedLifecycleCli.task?.status !== "done" ||
  updatedLifecycleCli.task?.notes !== "verified by smoke"
) {
  console.error("[smoke:task-update] expected CLI task update mutation payload");
  process.exit(1);
}

const runtimeCatalog = JSON.parse(run("catalog-verify", ["./src/index.js", "catalog"]).stdout).catalog;
if (
  runtimeCatalog.kind !== "runtime_catalog_view" ||
  runtimeCatalog.recommendedReason !== "catalog_entries_loaded" ||
  runtimeCatalog.counts?.agents !== 4 ||
  runtimeCatalog.counts?.skills !== 2 ||
  runtimeCatalog.counts?.totalEntries !== 6 ||
  !Array.isArray(runtimeCatalog.catalog?.agents) ||
  !runtimeCatalog.catalog.agents.some((agent) => agent.id === "executor") ||
  !Array.isArray(runtimeCatalog.catalog?.skills) ||
  !runtimeCatalog.catalog.skills.some((skill) => skill.id === "project-development")
) {
  console.error("[smoke:catalog] expected shipped agent and skill catalog");
  process.exit(1);
}
const runtimeCatalogAgentView = JSON.parse(
  run("catalog-agent-verify", ["./src/index.js", "catalog:agent", "--id", "executor"]).stdout
).agent;
if (
  runtimeCatalogAgentView.kind !== "runtime_catalog_entry_view" ||
  runtimeCatalogAgentView.recommendedReason !== "catalog_entry_loaded" ||
  runtimeCatalogAgentView.entryType !== "agent" ||
  runtimeCatalogAgentView.matchedId !== "executor" ||
  runtimeCatalogAgentView.entry?.id !== "executor"
) {
  console.error("[smoke:catalog-agent] expected shipped agent detail view");
  process.exit(1);
}
const runtimeCatalogSkillView = JSON.parse(
  run("catalog-skill-verify", ["./src/index.js", "catalog:skill", "--id", "project-development"]).stdout
).skill;
if (
  runtimeCatalogSkillView.kind !== "runtime_catalog_entry_view" ||
  runtimeCatalogSkillView.recommendedReason !== "catalog_entry_loaded" ||
  runtimeCatalogSkillView.entryType !== "skill" ||
  runtimeCatalogSkillView.matchedId !== "project-development" ||
  runtimeCatalogSkillView.entry?.id !== "project-development"
) {
  console.error("[smoke:catalog-skill] expected shipped skill detail view");
  process.exit(1);
}
const bundledRuntimeDir = mkdtempSync(join(tmpdir(), "codex-bees-bundled-"));
const bundledRuntimeCatalog = JSON.parse(
  runInCwd("catalog-bundled-dist", [DIST_INDEX, "catalog"], bundledRuntimeDir).stdout
).catalog;
if (
  bundledRuntimeCatalog.kind !== "runtime_catalog_view" ||
  bundledRuntimeCatalog.recommendedReason !== "catalog_entries_loaded" ||
  bundledRuntimeCatalog.counts?.agents !== 4 ||
  bundledRuntimeCatalog.counts?.skills !== 2 ||
  bundledRuntimeCatalog.catalog?.source !== "bundled" ||
  !bundledRuntimeCatalog.catalog?.agents?.every((agent) => agent.source === "bundled") ||
  !bundledRuntimeCatalog.catalog?.paths?.codexDir?.startsWith("@bundled/dist/.codex")
) {
  console.error("[smoke:catalog] expected packaged dist catalog to fall back to bundled .codex assets");
  process.exit(1);
}
const standaloneDistDir = mkdtempSync(join(tmpdir(), "codex-bees-standalone-dist-"));
cpSync(DIST_DIR, join(standaloneDistDir, "dist"), { recursive: true });
const standaloneDistCatalog = JSON.parse(
  runInCwd("catalog-standalone-dist", [join(standaloneDistDir, "dist", "index.js"), "catalog"], bundledRuntimeDir).stdout
).catalog;
if (
  standaloneDistCatalog.kind !== "runtime_catalog_view" ||
  standaloneDistCatalog.recommendedReason !== "catalog_entries_loaded" ||
  standaloneDistCatalog.catalog?.source !== "bundled" ||
  standaloneDistCatalog.counts?.agents !== 4 ||
  standaloneDistCatalog.counts?.skills !== 2 ||
  !standaloneDistCatalog.catalog?.paths?.codexDir?.startsWith("@bundled/dist/.codex")
) {
  console.error("[smoke:catalog] expected standalone dist runtime to self-contain bundled .codex assets");
  process.exit(1);
}
const bundledRuntimeStatus = JSON.parse(
  runInCwd("status-bundled-dist", [DIST_INDEX, "status"], bundledRuntimeDir).stdout
).status;
if (
  bundledRuntimeStatus.kind !== "runtime_status_view" ||
  bundledRuntimeStatus.status?.catalog?.source !== "bundled" ||
  bundledRuntimeStatus.counts?.agents !== 4 ||
  bundledRuntimeStatus.counts?.skills !== 2
) {
  console.error("[smoke:status] expected packaged dist status to expose bundled runtime catalog");
  process.exit(1);
}
const bundledPlan = JSON.parse(
  runInCwd(
    "plan-bundled-dist",
    [DIST_INDEX, "plan", "--task", "agent skill runtime"],
    bundledRuntimeDir
  ).stdout
);
if (
  bundledPlan.kind !== "task_plan" ||
  bundledPlan.evidence?.repoSignals?.hasAgents !== true ||
  bundledPlan.evidence?.repoSignals?.hasSkills !== true ||
  bundledPlan.evidence?.roleFiles?.length !== 4
) {
  console.error("[smoke:plan] expected packaged dist planner to discover bundled role assets");
  process.exit(1);
}
const packDryRun = JSON.parse(
  runNpm(["pack", "--dry-run", "--json"]).stdout
)[0];
const packPaths = new Set((packDryRun.files ?? []).map((entry) => entry.path));
if (
  !packPaths.has("dist/index.js") ||
  !packPaths.has("dist/mcp.js") ||
  !packPaths.has("dist/.codex/agents/executor.md") ||
  !packPaths.has("README.md") ||
  !packPaths.has("LICENSE") ||
  Array.from(packPaths).some((path) => path.startsWith("src/")) ||
  Array.from(packPaths).some((path) => path.startsWith("scripts/")) ||
  packPaths.has("AGENTS.md") ||
  Array.from(packPaths).some((path) => path.startsWith(".codex/"))
) {
  console.error("[smoke:pack] expected npm package to ship only distributable runtime assets");
  process.exit(1);
}
const packedInstallDir = mkdtempSync(join(tmpdir(), "codex-bees-packed-install-"));
const packedInstallAppDir = join(packedInstallDir, "app");
const packResult = JSON.parse(
  runNpm(["pack", "--json"]).stdout
)[0];
packedTarballPath = join(REPO_ROOT, packResult.filename);
mkdirSync(packedInstallAppDir, { recursive: true });
const installInit = runNpm(["init", "-y"], { cwd: packedInstallAppDir });
if (installInit.status !== 0) {
  console.error("[smoke:install-init] failed");
  console.error(installInit.stderr || installInit.stdout);
  process.exit(installInit.status ?? 1);
}
const installPackage = runNpm(["install", packedTarballPath], {
  cwd: packedInstallAppDir
});
if (installPackage.status !== 0) {
  console.error("[smoke:install-package] failed");
  console.error(installPackage.stderr || installPackage.stdout);
  process.exit(installPackage.status ?? 1);
}
const installedManifestMain = JSON.parse(
  readFileSync(join(packedInstallAppDir, "node_modules", "codex-bees", "package.json"), "utf8")
).main;
if (installedManifestMain !== "dist/api.js") {
  console.error("[smoke:installed-manifest] expected installed package main entry to target dist/api.js");
  process.exit(1);
}
const installedManifest = JSON.parse(
  readFileSync(join(packedInstallAppDir, "node_modules", "codex-bees", "package.json"), "utf8")
);
const installedManifestTypes = installedManifest.types;
if (installedManifestTypes !== "./dist/api.d.ts") {
  console.error("[smoke:installed-manifest-types] expected installed package types entry to target dist/api.d.ts");
  process.exit(1);
}
if (
  installedManifest.homepage !== "https://github.com/izumi0uu/codex-bees#readme" ||
  installedManifest.bugs?.url !== "https://github.com/izumi0uu/codex-bees/issues" ||
  installedManifest.repository?.url !== "https://github.com/izumi0uu/codex-bees.git" ||
  !Array.isArray(installedManifest.keywords) ||
  !installedManifest.keywords.includes("codex") ||
  !installedManifest.keywords.includes("mcp") ||
  !installedManifest.keywords.includes("orchestration")
) {
  console.error("[smoke:installed-manifest-metadata] expected installed package manifest to ship public npm metadata");
  process.exit(1);
}
const packageManifest = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8"));
if (
  packageManifest.homepage !== "https://github.com/izumi0uu/codex-bees#readme" ||
  packageManifest.bugs?.url !== "https://github.com/izumi0uu/codex-bees/issues" ||
  packageManifest.repository?.url !== "https://github.com/izumi0uu/codex-bees.git" ||
  !Array.isArray(packageManifest.keywords) ||
  !packageManifest.keywords.includes("codex") ||
  !packageManifest.keywords.includes("mcp") ||
  !packageManifest.keywords.includes("orchestration")
) {
  console.error("[smoke:package-manifest-metadata] expected local package manifest to ship public npm metadata");
  process.exit(1);
}
const documentedSubpaths = Array.from(
  README_TEXT.matchAll(/- `codex-bees\/([^`]+)`/g),
  (match) => `./${match[1]}`
).sort();
const documentedRootExampleBlockMatch = README_TEXT.match(/The root package export now exposes a small official programmatic API as well:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedRootExampleBlockMatch) {
  console.error("[smoke:readme-root-example] expected README to document the root package example block");
  process.exit(1);
}
const documentedRootExampleScript = documentedRootExampleBlockMatch[1];
const documentedRootImportClauseMatch = documentedRootExampleScript.match(/import\s*{\n([\s\S]*?)\n}\sfrom\s"codex-bees";/);
if (!documentedRootImportClauseMatch) {
  console.error("[smoke:readme-root-import] expected README root example to import from codex-bees");
  process.exit(1);
}
const documentedRootImportExports = documentedRootImportClauseMatch[1]
  .split("\n")
  .map((line) => line.trim().replace(/,$/, ""))
  .filter(Boolean)
  .sort();
const documentedMcpImportExampleMatch = README_TEXT.match(/The `codex-bees\/mcp` subpath[\s\S]*?Example:\n\n```js\nimport\s*{\s*([^}]+?)\s*}\sfrom\s"codex-bees\/mcp";/);
if (!documentedMcpImportExampleMatch) {
  console.error("[smoke:readme-mcp-import] expected README to document the mcp subpath import example");
  process.exit(1);
}
const documentedMcpImportExports = documentedMcpImportExampleMatch[1]
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean)
  .sort();
const documentedApiExampleBlockMatch = README_TEXT.match(/The `codex-bees\/api` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedApiExampleBlockMatch) {
  console.error("[smoke:readme-api-example] expected README to document a runnable api example block");
  process.exit(1);
}
const documentedApiExampleScript = documentedApiExampleBlockMatch[1];
const documentedApiAdvancedExampleBlockMatch = README_TEXT.match(
  /Advanced root \/ api helper example:\n\n```js\n([\s\S]*?)\n```/
);
if (!documentedApiAdvancedExampleBlockMatch) {
  console.error("[smoke:readme-api-advanced-example] expected README to document a runnable advanced api example block");
  process.exit(1);
}
const documentedApiAdvancedExampleScript = documentedApiAdvancedExampleBlockMatch[1];
const documentedInitExampleBlockMatch = README_TEXT.match(/The `codex-bees\/init` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedInitExampleBlockMatch) {
  console.error("[smoke:readme-init-example] expected README to document a runnable init example block");
  process.exit(1);
}
const documentedInitExampleScript = documentedInitExampleBlockMatch[1];
const documentedStateExampleBlockMatch = README_TEXT.match(/The `codex-bees\/state` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedStateExampleBlockMatch) {
  console.error("[smoke:readme-state-example] expected README to document a runnable state subpath example block");
  process.exit(1);
}
const documentedStateExampleScript = documentedStateExampleBlockMatch[1];
const documentedRuntimeGuidanceExampleBlockMatch = README_TEXT.match(/The `codex-bees\/runtime-guidance` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedRuntimeGuidanceExampleBlockMatch) {
  console.error("[smoke:readme-runtime-guidance-example] expected README to document a runnable runtime-guidance example block");
  process.exit(1);
}
const documentedRuntimeGuidanceExampleScript = documentedRuntimeGuidanceExampleBlockMatch[1];
const documentedDoctorExampleBlockMatch = README_TEXT.match(/The `codex-bees\/doctor` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedDoctorExampleBlockMatch) {
  console.error("[smoke:readme-doctor-example] expected README to document a runnable doctor example block");
  process.exit(1);
}
const documentedDoctorExampleScript = documentedDoctorExampleBlockMatch[1];
const documentedRuntimeReadyExampleBlockMatch = README_TEXT.match(/The `codex-bees\/runtime-ready` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedRuntimeReadyExampleBlockMatch) {
  console.error("[smoke:readme-runtime-ready-example] expected README to document a runnable runtime-ready example block");
  process.exit(1);
}
const documentedRuntimeReadyExampleScript = documentedRuntimeReadyExampleBlockMatch[1];
const documentedRuntimeStatusExampleBlockMatch = README_TEXT.match(/The `codex-bees\/runtime-status` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedRuntimeStatusExampleBlockMatch) {
  console.error("[smoke:readme-runtime-status-example] expected README to document a runnable runtime-status example block");
  process.exit(1);
}
const documentedRuntimeStatusExampleScript = documentedRuntimeStatusExampleBlockMatch[1];
const documentedRuntimeContractExampleBlockMatch = README_TEXT.match(/The `codex-bees\/runtime-contract` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedRuntimeContractExampleBlockMatch) {
  console.error("[smoke:readme-runtime-contract-example] expected README to document a runnable runtime-contract example block");
  process.exit(1);
}
const documentedRuntimeContractExampleScript = documentedRuntimeContractExampleBlockMatch[1];
const documentedMetadataExampleBlockMatch = README_TEXT.match(/The `codex-bees\/metadata` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedMetadataExampleBlockMatch) {
  console.error("[smoke:readme-metadata-example] expected README to document a runnable metadata example block");
  process.exit(1);
}
const documentedMetadataExampleScript = documentedMetadataExampleBlockMatch[1];
const documentedPlannerExampleBlockMatch = README_TEXT.match(/The `codex-bees\/planner` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedPlannerExampleBlockMatch) {
  console.error("[smoke:readme-planner-example] expected README to document a runnable planner example block");
  process.exit(1);
}
const documentedPlannerExampleScript = documentedPlannerExampleBlockMatch[1];
const documentedCommandsExampleBlockMatch = README_TEXT.match(/The `codex-bees\/commands` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedCommandsExampleBlockMatch) {
  console.error("[smoke:readme-commands-example] expected README to document a runnable commands example block");
  process.exit(1);
}
const documentedCommandsExampleScript = documentedCommandsExampleBlockMatch[1];
const documentedMcpExampleBlockMatch = README_TEXT.match(/The `codex-bees\/mcp` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedMcpExampleBlockMatch) {
  console.error("[smoke:readme-mcp-example] expected README to document a runnable mcp example block");
  process.exit(1);
}
const documentedMcpExampleScript = documentedMcpExampleBlockMatch[1];
const documentedCatalogExampleBlockMatch = README_TEXT.match(/The `codex-bees\/catalog` subpath[\s\S]*?Example:\n\n```js\n([\s\S]*?)\n```/);
if (!documentedCatalogExampleBlockMatch) {
  console.error("[smoke:readme-catalog-example] expected README to document a runnable catalog example block");
  process.exit(1);
}
const documentedCatalogExampleScript = documentedCatalogExampleBlockMatch[1];
const exportedSubpaths = Object.keys(packageManifest.exports)
  .filter((key) => key !== ".")
  .sort();
if (JSON.stringify(documentedSubpaths) !== JSON.stringify(exportedSubpaths)) {
  console.error("[smoke:documented-exports] expected README subpath export list to match package.json exports");
  console.error(JSON.stringify({ documentedSubpaths, exportedSubpaths }, null, 2));
  process.exit(1);
}
const installedExportSmoke = spawnSync(
  "node",
  [
    "-e",
    `const subpaths = ${JSON.stringify(exportedSubpaths.map((item) => item.slice(2)))};\nPromise.all(subpaths.map((subpath) => import(\`codex-bees/\${subpath}\`).then(() => subpath))).then((loaded) => console.log(JSON.stringify({ ok: loaded.length === subpaths.length, loaded: loaded.sort() })));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedExportSmoke.status !== 0 ||
  JSON.parse(installedExportSmoke.stdout).ok !== true
) {
  console.error("[smoke:installed-export-surface] expected every documented public subpath export to import after install");
  console.error(installedExportSmoke.stderr || installedExportSmoke.stdout);
  process.exit(installedExportSmoke.status ?? 1);
}
const installedTypesFile = existsSync(join(packedInstallAppDir, "node_modules", "codex-bees", "dist", "api.d.ts"));
if (!installedTypesFile) {
  console.error("[smoke:installed-types-file] expected installed package to ship dist/api.d.ts");
  process.exit(1);
}
for (const entrypoint of PUBLIC_TYPE_ENTRYPOINTS) {
  const typePath = join(packedInstallAppDir, "node_modules", "codex-bees", "dist", `${entrypoint}.d.ts`);
  if (!existsSync(typePath)) {
    console.error(`[smoke:installed-types-subpath] expected installed package to ship ${entrypoint}.d.ts`);
    process.exit(1);
  }
}
const installedTypesPositiveFile = join(packedInstallAppDir, "subpath-types-positive.ts");
const installedTypesNegativeCatalogFile = join(packedInstallAppDir, "subpath-types-negative-catalog.ts");
const installedTypesNegativeContractFile = join(packedInstallAppDir, "subpath-types-negative-runtime-contract.ts");
const installedTypesNegativeStateFile = join(packedInstallAppDir, "subpath-types-negative-state.ts");
const installedTypesNegativeMcpFile = join(packedInstallAppDir, "subpath-types-negative-mcp.ts");
writeFileSync(
  installedTypesPositiveFile,
  [
    'import { getCommandCatalogView, getMcpCommandCatalogView, getMcpHelpView } from "codex-bees/commands";',
    'import { getRuntimeCatalogView, listAgentRoleIds } from "codex-bees/catalog";',
    'import { getRuntimeDoctorView } from "codex-bees/doctor";',
    'import { initWorkspace, previewWorkspaceInit } from "codex-bees/init";',
    'import { getPackageMetadataView } from "codex-bees/metadata";',
    'import { getMcpToolView, serializeMcpMessage } from "codex-bees/mcp";',
    'import { planSwarm, queueTasksFromPlan } from "codex-bees/planner";',
    'import { getCoordinationOverviewView } from "codex-bees/runtime-guidance";',
    'import { getRuntimeContractView } from "codex-bees/runtime-contract";',
    'import { getRuntimeReadyView } from "codex-bees/runtime-ready";',
    'import { getRuntimeStatusView } from "codex-bees/runtime-status";',
    'import { addTask, getTaskView, stateFilePath } from "codex-bees/state";',
    'getCommandCatalogView().kind;',
    'getMcpCommandCatalogView().kind;',
    'getMcpHelpView("--tools").kind;',
    'getRuntimeCatalogView().kind;',
    'listAgentRoleIds()[0];',
    'getRuntimeDoctorView().kind;',
    'previewWorkspaceInit({ targetDirectory: "typed-installed-preview" }).kind;',
    'initWorkspace({ targetDirectory: "typed-installed-apply" }).kind;',
    'getPackageMetadataView().kind;',
    'getMcpToolView("package_metadata")?.kind;',
    'serializeMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize" });',
    'planSwarm("typed installed swarm").kind;',
    'queueTasksFromPlan("typed installed queue").kind;',
    'getCoordinationOverviewView().kind;',
    'getRuntimeContractView().kind;',
    'getRuntimeReadyView().kind;',
    'getRuntimeStatusView().kind;',
    'const typedInstalledTask = addTask({ title: "typed installed task", owner: "executor", verifier: "tester", scope: ["src/index.js"], acceptance: ["ok"], verification: ["ok"] });',
    'typedInstalledTask.id;',
    'getTaskView(typedInstalledTask.id)?.kind;',
    'stateFilePath();'
  ].join("\n") + "\n"
);
writeFileSync(
  installedTypesNegativeCatalogFile,
  'import { addTask } from "codex-bees/catalog";\naddTask;\n'
);
writeFileSync(
  installedTypesNegativeContractFile,
  'import { getRuntimeContract } from "codex-bees/runtime-contract";\ngetRuntimeContract;\n'
);
writeFileSync(
  installedTypesNegativeStateFile,
  'import { updateTask } from "codex-bees/state";\nupdateTask;\n'
);
writeFileSync(
  installedTypesNegativeMcpFile,
  'import { runMcpCli } from "codex-bees/mcp";\nrunMcpCli;\n'
);
const installedTypesPositive = runInstalledTypecheck("installed-types-positive", [
  installedTypesPositiveFile
]);
if (installedTypesPositive.status !== 0) {
  console.error("[smoke:installed-types-positive] expected installed subpath type facades to compile");
  console.error(installedTypesPositive.stderr || installedTypesPositive.stdout);
  process.exit(installedTypesPositive.status ?? 1);
}
const installedTypesNegativeCatalog = runInstalledTypecheck("installed-types-negative-catalog", [
  installedTypesNegativeCatalogFile
]);
if (installedTypesNegativeCatalog.status === 0) {
  console.error("[smoke:installed-types-negative-catalog] expected codex-bees/catalog to reject root-only type imports");
  process.exit(1);
}
const installedTypesNegativeContract = runInstalledTypecheck("installed-types-negative-runtime-contract", [
  installedTypesNegativeContractFile
]);
if (installedTypesNegativeContract.status === 0) {
  console.error("[smoke:installed-types-negative-runtime-contract] expected codex-bees/runtime-contract to reject internal-only type imports");
  process.exit(1);
}
const installedTypesNegativeState = runInstalledTypecheck("installed-types-negative-state", [
  installedTypesNegativeStateFile
]);
if (installedTypesNegativeState.status === 0) {
  console.error("[smoke:installed-types-negative-state] expected codex-bees/state to reject internal-only type imports");
  process.exit(1);
}
const installedTypesNegativeMcp = runInstalledTypecheck("installed-types-negative-mcp", [
  installedTypesNegativeMcpFile
]);
if (installedTypesNegativeMcp.status === 0) {
  console.error("[smoke:installed-types-negative-mcp] expected codex-bees/mcp to reject CLI-only type imports");
  process.exit(1);
}
const installedImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => console.log(JSON.stringify({ok:Array.isArray(m.getMcpCommandCatalog()) && m.getMcpCommandCatalog().some((option) => option.option === "--capabilities") && m.getMcpCommandCatalogView().counts.totalOptions >= 5 && m.renderMcpHelpText().includes("codex-bees mcp --capabilities"), keys:Object.keys(m).sort()})))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
const installedImportPayload = JSON.parse(installedImport.stdout);
if (
  installedImport.status !== 0 ||
  installedImportPayload.ok !== true
) {
  console.error("[smoke:installed-import] expected installed codex-bees root import to expose the public api surface");
  console.error(installedImport.stderr || installedImport.stdout);
  process.exit(installedImport.status ?? 1);
}
assertMatchingKeys(
  "installed-import",
  Object.fromEntries(installedImportPayload.keys.map((key) => [key, true])),
  Object.fromEntries(importedSourceApi.map((key) => [key, true]))
);
const installedApiImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/api").then((m) => console.log(JSON.stringify({ok:Array.isArray(m.toolCatalog) && typeof m.runMcpCli === "function" && typeof m.startMcpServer === "function", keys:Object.keys(m).sort()})))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
const installedApiImportPayload = JSON.parse(installedApiImport.stdout);
if (
  installedApiImport.status !== 0 ||
  installedApiImportPayload.ok !== true
) {
  console.error("[smoke:installed-api-import] expected installed codex-bees/api subpath to mirror the working root library surface");
  console.error(installedApiImport.stderr || installedApiImport.stdout);
  process.exit(installedApiImport.status ?? 1);
}
assertMatchingKeys(
  "installed-api-import",
  Object.fromEntries(installedApiImportPayload.keys.map((key) => [key, true])),
  Object.fromEntries(installedImportPayload.keys.map((key) => [key, true]))
);
const missingDocumentedRootImports = documentedRootImportExports.filter(
  (name) => !installedImportPayload.keys.includes(name)
);
if (missingDocumentedRootImports.length > 0) {
  console.error("[smoke:readme-root-import-contract] expected README root import example to match installed root exports");
  console.error(JSON.stringify({ missingDocumentedRootImports, documentedRootImportExports, installedRootExports: installedImportPayload.keys }, null, 2));
  process.exit(1);
}
const installedRootExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedRootExampleScript}\nconsole.log(JSON.stringify({ ok: metadata.product === "codex-bees" && typeof stateFilePath() === "string" && getCommandCatalogView().kind === "command_catalog_view" && Array.isArray(getMcpCommandCatalog()) && getMcpCommandCatalogView().kind === "mcp_command_catalog_view" && getRuntimeCatalogView().kind === "runtime_catalog_view" && getRuntimeDoctorView().kind === "runtime_doctor_view" && getRuntimeReadyView().kind === "runtime_ready_view" && status.kind === "runtime_status_view" && getRuntimeContractView().kind === "runtime_contract_view" && brief?.kind === "task_execution_brief" && brief?.task?.id === releaseTask.id && history?.kind === "task_history" && history?.taskId === releaseTask.id && report?.kind === "task_report" && report?.task?.id === releaseTask.id && planTask("readme root example").kind === "task_plan" && planSwarm("readme root swarm").kind === "planned_swarm" && renderMcpHelpText().includes("codex-bees mcp --help") }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRootExample.status !== 0 ||
  JSON.parse(installedRootExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-root-example-contract] expected README root example to execute successfully against the installed package");
  console.error(installedRootExample.stderr || installedRootExample.stdout);
  process.exit(installedRootExample.status ?? 1);
}
const installedApiExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedApiExampleScript}\nconsole.log(JSON.stringify({ ok: metadata.product === "codex-bees" && ready.kind === "runtime_ready_view" && tools.kind === "tool_catalog_view" && Array.isArray(tools.tools) && tools.tools.length > 0 }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedApiExample.status !== 0 ||
  JSON.parse(installedApiExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-api-example-contract] expected README api example to execute successfully against the installed package");
  console.error(installedApiExample.stderr || installedApiExample.stdout);
  process.exit(installedApiExample.status ?? 1);
}
const installedApiAdvancedExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedApiAdvancedExampleScript}\nconsole.log(JSON.stringify({ ok: typeof cli === "function" && typeof server === "function" && hasRuntimeContractTool === true }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedApiAdvancedExample.status !== 0 ||
  JSON.parse(installedApiAdvancedExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-api-advanced-example-contract] expected README advanced api example to execute successfully against the installed package");
  console.error(installedApiAdvancedExample.stderr || installedApiAdvancedExample.stdout);
  process.exit(installedApiAdvancedExample.status ?? 1);
}
const installedInitExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedInitExampleScript}\nconsole.log(JSON.stringify({ ok: preview.kind === "workspace_init_preview" && preview.entries?.some((entry) => entry.path === ".codex/agents/executor.md") && applied.kind === "workspace_init_result" && applied.created?.includes(".codex/agents/executor.md") }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedInitExample.status !== 0 ||
  JSON.parse(installedInitExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-init-example-contract] expected README init example to execute successfully against the installed package");
  console.error(installedInitExample.stderr || installedInitExample.stdout);
  process.exit(installedInitExample.status ?? 1);
}
const installedStateExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedStateExampleScript}\nconsole.log(JSON.stringify({ ok: typeof task.id === "string" && task.id.length > 0 && typeof memory.id === "string" && memory.id.length > 0 && memoryRecord?.id === memory.id && memoryDetail?.kind === "memory_detail" && memoryDetail?.memory?.id === memory.id && queue.counts.totalTasks >= 1 && queue.tasks.some((entry) => entry.id === task.id) && typeof storage === "string" && storage.length > 0 }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedStateExample.status !== 0 ||
  JSON.parse(installedStateExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-state-example-contract] expected README state example to execute successfully against the installed package");
  console.error(installedStateExample.stderr || installedStateExample.stdout);
  process.exit(installedStateExample.status ?? 1);
}
const installedRuntimeGuidanceExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedRuntimeGuidanceExampleScript}\nconsole.log(JSON.stringify({ ok: overview.kind === "coordination_overview_view" && overview.overview.deliveryBoundary === "codex-only runtime" && guidelines.kind === "worker_guidelines_view" && guidelines.guidelines.fileOwnership === "one active writer per file" }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRuntimeGuidanceExample.status !== 0 ||
  JSON.parse(installedRuntimeGuidanceExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-runtime-guidance-example-contract] expected README runtime-guidance example to execute successfully against the installed package");
  console.error(installedRuntimeGuidanceExample.stderr || installedRuntimeGuidanceExample.stdout);
  process.exit(installedRuntimeGuidanceExample.status ?? 1);
}
const installedDoctorExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedDoctorExampleScript}\nconsole.log(JSON.stringify({ ok: doctor.kind === "runtime_doctor_view" && doctor.status === "ok" && doctor.executable === true && doctor.catalog?.kind === "runtime_catalog_view" && doctor.contract?.kind === "runtime_contract_view" && typeof doctor.stateFile === "string" && doctor.stateFile.length > 0 }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDoctorExample.status !== 0 ||
  JSON.parse(installedDoctorExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-doctor-example-contract] expected README doctor example to execute successfully against the installed package");
  console.error(installedDoctorExample.stderr || installedDoctorExample.stdout);
  process.exit(installedDoctorExample.status ?? 1);
}
const installedRuntimeReadyExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedRuntimeReadyExampleScript}\nconsole.log(JSON.stringify({ ok: ready.kind === "runtime_ready_view" && ready.status === "ready" && ready.contract?.kind === "runtime_contract_view" && ready.next?.[0] === "use \`codex-bees init\` to materialize the shipped .codex project assets" }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRuntimeReadyExample.status !== 0 ||
  JSON.parse(installedRuntimeReadyExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-runtime-ready-example-contract] expected README runtime-ready example to execute successfully against the installed package");
  console.error(installedRuntimeReadyExample.stderr || installedRuntimeReadyExample.stdout);
  process.exit(installedRuntimeReadyExample.status ?? 1);
}
const installedRuntimeStatusExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedRuntimeStatusExampleScript}\nconsole.log(JSON.stringify({ ok: status.kind === "runtime_status_view" && status.status.product === "codex-bees" && status.status.mode === "codex-only" && typeof status.counts.tools === "number" && Array.isArray(status.status.capabilities) && status.status.capabilities.length > 0 && Array.isArray(capabilities) && capabilities.some((capability) => capability.id === "runtime_catalog") && capabilitiesView?.kind === "runtime_capabilities_view" && capabilitiesView?.capabilities?.some((capability) => capability.id === "runtime_catalog") && runtimeCatalogCapability?.id === "runtime_catalog" && runtimeCatalogCapabilityView?.kind === "runtime_capability_view" && runtimeCatalogCapabilityView?.matchedCapability === "runtime_catalog" && Array.isArray(status.status.recommendedEntryPoints.cli) && status.status.recommendedEntryPoints.cli.includes("status") }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRuntimeStatusExample.status !== 0 ||
  JSON.parse(installedRuntimeStatusExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-runtime-status-example-contract] expected README runtime-status example to execute successfully against the installed package");
  console.error(installedRuntimeStatusExample.stderr || installedRuntimeStatusExample.stdout);
  process.exit(installedRuntimeStatusExample.status ?? 1);
}
const installedRuntimeContractExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedRuntimeContractExampleScript}\nconsole.log(JSON.stringify({ ok: contract.kind === "runtime_contract_view" && contract.contract.product === "codex-bees" && contract.contract.mode === "codex-only" && contract.contract.deliveryBoundary === "codex-only runtime" && contract.contract.transport?.mcp === "stdio-jsonrpc" && Array.isArray(contract.contract.responsibilities) && contract.contract.responsibilities.length > 0 && Array.isArray(contract.contract.exclusions) && contract.contract.exclusions.includes("hosted backend control plane") }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRuntimeContractExample.status !== 0 ||
  JSON.parse(installedRuntimeContractExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-runtime-contract-example-contract] expected README runtime-contract example to execute successfully against the installed package");
  console.error(installedRuntimeContractExample.stderr || installedRuntimeContractExample.stdout);
  process.exit(installedRuntimeContractExample.status ?? 1);
}
const installedMetadataExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedMetadataExampleScript}\nconsole.log(JSON.stringify({ ok: metadata.product === "codex-bees" && metadata.mode === "codex-only" && Array.isArray(metadata.keywords) && metadata.keywords.includes("codex") && view.kind === "package_metadata_view" && view.metadata.product === metadata.product }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedMetadataExample.status !== 0 ||
  JSON.parse(installedMetadataExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-metadata-example-contract] expected README metadata example to execute successfully against the installed package");
  console.error(installedMetadataExample.stderr || installedMetadataExample.stdout);
  process.exit(installedMetadataExample.status ?? 1);
}
const installedPlannerExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedPlannerExampleScript}\nconsole.log(JSON.stringify({ ok: taskPlan.kind === "task_plan" && taskPlan.objective === "document a planner example" && Array.isArray(taskPlan.lanes) && taskPlan.lanes.length >= 1 && swarmPlan.kind === "planned_swarm" && swarmPlan.objective === "stage a planner example" && swarmPlan.swarm?.topology === "bounded-local" && Array.isArray(swarmPlan.swarm?.lanes) && swarmPlan.swarm.lanes.length >= 1 }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedPlannerExample.status !== 0 ||
  JSON.parse(installedPlannerExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-planner-example-contract] expected README planner example to execute successfully against the installed package");
  console.error(installedPlannerExample.stderr || installedPlannerExample.stdout);
  process.exit(installedPlannerExample.status ?? 1);
}
const installedCommandsExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedCommandsExampleScript}\nconsole.log(JSON.stringify({ ok: catalog.kind === "command_catalog_view" && catalog.commands.some((entry) => entry.command === "mcp") && initEntry?.command === "init" && initEntryView?.kind === "command_catalog_entry_view" && initEntryView?.matchedCommand === "init" && statusHelpView?.kind === "command_help_view" && statusHelpView?.matchedCommand === "status" && statusHelpView?.text.includes("codex-bees status") && statusHelpView?.text.includes("Print runtime state and surface summary") && Array.isArray(initEntry?.options) && Array.isArray(initOptions) && initOptions.some((option) => option.option === "--preview") && initOptionsView?.kind === "init_command_catalog_view" && initOptionsView?.counts?.totalOptions >= 5 && initOptionsView?.options?.some((option) => option.option === "--preview") && previewOption?.option === "--preview" && previewOptionView?.kind === "init_command_option_view" && previewOptionView?.matchedOption === "--preview" && initOptionHelpView?.kind === "init_help_view" && initOptionHelpView?.matchedOption === "--preview" && initOptionHelpView?.text.includes("codex-bees init") && statusHelp.includes("codex-bees status") && statusHelp.includes("Description:") && initHelp.includes("codex-bees init") && help.includes("codex-bees run") && help.includes("codex-bees mcp") }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCommandsExample.status !== 0 ||
  JSON.parse(installedCommandsExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-commands-example-contract] expected README commands example to execute successfully against the installed package");
  console.error(installedCommandsExample.stderr || installedCommandsExample.stdout);
  process.exit(installedCommandsExample.status ?? 1);
}
const installedMcpImport = spawnSync(
    "node",
  [
    "-e",
    'import("codex-bees/mcp").then((m) => { const listed = m.handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" }); const metadata = m.callMcpTool("package_metadata"); const doctor = m.callMcpTool("runtime_doctor"); const commands = m.callMcpTool("command_catalog"); const command = m.callMcpTool("command_catalog_entry", { command: "init" }); const commandHelp = m.callMcpTool("command_help", { command: "init" }); const initOptions = m.callMcpTool("init_command_catalog"); const initOption = m.callMcpTool("init_command_option", { option: "--preview" }); const initHelp = m.callMcpTool("init_help", { option: "--preview" }); const mcpOptionsView = m.callMcpTool("mcp_command_catalog"); const mcpOption = m.callMcpTool("mcp_command_option", { option: "--tools" }); const mcpOptionHelp = m.callMcpTool("mcp_help", { option: "--tools" }); const toolCatalog = m.callMcpTool("tool_catalog"); const toolCatalogEntry = m.callMcpTool("tool_catalog_entry", { name: "runtime_contract" }); const ready = m.callMcpTool("runtime_ready"); const capability = m.callMcpTool("runtime_capability", { id: "memory" }); const contract = m.callMcpTool("runtime_contract"); const serialized = m.serializeMcpMessage({ jsonrpc: "2.0", id: 2, method: "initialize" }); const packageMetadataTool = m.getMcpToolEntry("package_metadata"); const packageMetadataToolView = m.getMcpToolView("package_metadata"); const runtimeDoctorTool = m.getMcpToolEntry("runtime_doctor"); const runtimeDoctorToolView = m.getMcpToolView("runtime_doctor"); const commandCatalogTool = m.getMcpToolEntry("command_catalog"); const commandCatalogToolView = m.getMcpToolView("command_catalog"); const commandCatalogEntryTool = m.getMcpToolEntry("command_catalog_entry"); const commandCatalogEntryToolView = m.getMcpToolView("command_catalog_entry"); const commandHelpTool = m.getMcpToolEntry("command_help"); const commandHelpToolView = m.getMcpToolView("command_help"); const initCommandCatalogTool = m.getMcpToolEntry("init_command_catalog"); const initCommandCatalogToolView = m.getMcpToolView("init_command_catalog"); const initCommandOptionTool = m.getMcpToolEntry("init_command_option"); const initCommandOptionToolView = m.getMcpToolView("init_command_option"); const initHelpTool = m.getMcpToolEntry("init_help"); const initHelpToolView = m.getMcpToolView("init_help"); const mcpCommandCatalogTool = m.getMcpToolEntry("mcp_command_catalog"); const mcpCommandCatalogToolView = m.getMcpToolView("mcp_command_catalog"); const mcpCommandOptionTool = m.getMcpToolEntry("mcp_command_option"); const mcpCommandOptionToolView = m.getMcpToolView("mcp_command_option"); const mcpHelpTool = m.getMcpToolEntry("mcp_help"); const mcpHelpToolView = m.getMcpToolView("mcp_help"); const toolCatalogTool = m.getMcpToolEntry("tool_catalog"); const toolCatalogToolView = m.getMcpToolView("tool_catalog"); const toolCatalogEntryTool = m.getMcpToolEntry("tool_catalog_entry"); const toolCatalogEntryToolView = m.getMcpToolView("tool_catalog_entry"); const runtimeReadyTool = m.getMcpToolEntry("runtime_ready"); const runtimeReadyToolView = m.getMcpToolView("runtime_ready"); const runtimeCapabilityTool = m.getMcpToolEntry("runtime_capability"); const runtimeCapabilityToolView = m.getMcpToolView("runtime_capability"); const runtimeContractTool = m.getMcpToolEntry("runtime_contract"); const runtimeContractToolView = m.getMcpToolView("runtime_contract"); const missingToolView = m.getMcpToolView("missing_tool"); const mcpOptions = m.getMcpCommandCatalog(); const mcpCatalog = m.getMcpCommandCatalogView(); const mcpHelp = m.renderMcpHelpText(); const toolsOption = m.getMcpCommandCatalogEntry("--tools"); const toolsOptionView = m.getMcpCommandCatalogEntryView("--tools"); const missingToolsOptionView = m.getMcpCommandCatalogEntryView("--missing"); const helpView = m.getMcpHelpView("--tools"); const fallbackHelpView = m.getMcpHelpView("--missing"); console.log(JSON.stringify({ ok: Array.isArray(m.listMcpTools()) && m.listMcpTools().some((tool) => tool.name === "package_metadata") && m.listMcpTools().some((tool) => tool.name === "runtime_doctor") && m.listMcpTools().some((tool) => tool.name === "command_catalog") && m.listMcpTools().some((tool) => tool.name === "command_catalog_entry") && m.listMcpTools().some((tool) => tool.name === "command_help") && m.listMcpTools().some((tool) => tool.name === "init_command_catalog") && m.listMcpTools().some((tool) => tool.name === "init_command_option") && m.listMcpTools().some((tool) => tool.name === "init_help") && m.listMcpTools().some((tool) => tool.name === "mcp_command_catalog") && m.listMcpTools().some((tool) => tool.name === "mcp_command_option") && m.listMcpTools().some((tool) => tool.name === "mcp_help") && m.listMcpTools().some((tool) => tool.name === "tool_catalog") && m.listMcpTools().some((tool) => tool.name === "tool_catalog_entry") && m.listMcpTools().some((tool) => tool.name === "runtime_ready") && m.listMcpTools().some((tool) => tool.name === "runtime_capability") && m.listMcpTools().some((tool) => tool.name === "runtime_contract") && packageMetadataTool?.name === "package_metadata" && packageMetadataToolView?.kind === "mcp_tool_view" && packageMetadataToolView?.matchedTool === "package_metadata" && packageMetadataToolView?.tool?.name === "package_metadata" && runtimeDoctorTool?.name === "runtime_doctor" && runtimeDoctorToolView?.kind === "mcp_tool_view" && runtimeDoctorToolView?.matchedTool === "runtime_doctor" && runtimeDoctorToolView?.tool?.name === "runtime_doctor" && commandCatalogTool?.name === "command_catalog" && commandCatalogToolView?.kind === "mcp_tool_view" && commandCatalogToolView?.matchedTool === "command_catalog" && commandCatalogToolView?.tool?.name === "command_catalog" && commandCatalogEntryTool?.name === "command_catalog_entry" && commandCatalogEntryToolView?.kind === "mcp_tool_view" && commandCatalogEntryToolView?.matchedTool === "command_catalog_entry" && commandCatalogEntryToolView?.tool?.name === "command_catalog_entry" && commandHelpTool?.name === "command_help" && commandHelpToolView?.kind === "mcp_tool_view" && commandHelpToolView?.matchedTool === "command_help" && commandHelpToolView?.tool?.name === "command_help" && initCommandCatalogTool?.name === "init_command_catalog" && initCommandCatalogToolView?.kind === "mcp_tool_view" && initCommandCatalogToolView?.matchedTool === "init_command_catalog" && initCommandCatalogToolView?.tool?.name === "init_command_catalog" && initCommandOptionTool?.name === "init_command_option" && initCommandOptionToolView?.kind === "mcp_tool_view" && initCommandOptionToolView?.matchedTool === "init_command_option" && initCommandOptionToolView?.tool?.name === "init_command_option" && initHelpTool?.name === "init_help" && initHelpToolView?.kind === "mcp_tool_view" && initHelpToolView?.matchedTool === "init_help" && initHelpToolView?.tool?.name === "init_help" && mcpCommandCatalogTool?.name === "mcp_command_catalog" && mcpCommandCatalogToolView?.kind === "mcp_tool_view" && mcpCommandCatalogToolView?.matchedTool === "mcp_command_catalog" && mcpCommandCatalogToolView?.tool?.name === "mcp_command_catalog" && mcpCommandOptionTool?.name === "mcp_command_option" && mcpCommandOptionToolView?.kind === "mcp_tool_view" && mcpCommandOptionToolView?.matchedTool === "mcp_command_option" && mcpCommandOptionToolView?.tool?.name === "mcp_command_option" && mcpHelpTool?.name === "mcp_help" && mcpHelpToolView?.kind === "mcp_tool_view" && mcpHelpToolView?.matchedTool === "mcp_help" && mcpHelpToolView?.tool?.name === "mcp_help" && toolCatalogTool?.name === "tool_catalog" && toolCatalogToolView?.kind === "mcp_tool_view" && toolCatalogToolView?.matchedTool === "tool_catalog" && toolCatalogToolView?.tool?.name === "tool_catalog" && toolCatalogEntryTool?.name === "tool_catalog_entry" && toolCatalogEntryToolView?.kind === "mcp_tool_view" && toolCatalogEntryToolView?.matchedTool === "tool_catalog_entry" && toolCatalogEntryToolView?.tool?.name === "tool_catalog_entry" && runtimeReadyTool?.name === "runtime_ready" && runtimeReadyToolView?.kind === "mcp_tool_view" && runtimeReadyToolView?.matchedTool === "runtime_ready" && runtimeCapabilityTool?.name === "runtime_capability" && runtimeCapabilityToolView?.kind === "mcp_tool_view" && runtimeCapabilityToolView?.matchedTool === "runtime_capability" && runtimeCapabilityToolView?.tool?.name === "runtime_capability" && runtimeContractTool?.name === "runtime_contract" && runtimeContractToolView?.kind === "mcp_tool_view" && runtimeContractToolView?.matchedTool === "runtime_contract" && runtimeContractToolView?.tool?.name === "runtime_contract" && missingToolView?.recommendedReason === "mcp_tool_missing" && listed.result?.tools?.some((tool) => tool.name === "package_metadata") && listed.result?.tools?.some((tool) => tool.name === "runtime_doctor") && listed.result?.tools?.some((tool) => tool.name === "command_catalog") && listed.result?.tools?.some((tool) => tool.name === "command_catalog_entry") && listed.result?.tools?.some((tool) => tool.name === "command_help") && listed.result?.tools?.some((tool) => tool.name === "init_command_catalog") && listed.result?.tools?.some((tool) => tool.name === "init_command_option") && listed.result?.tools?.some((tool) => tool.name === "init_help") && listed.result?.tools?.some((tool) => tool.name === "mcp_command_catalog") && listed.result?.tools?.some((tool) => tool.name === "mcp_command_option") && listed.result?.tools?.some((tool) => tool.name === "mcp_help") && listed.result?.tools?.some((tool) => tool.name === "tool_catalog") && listed.result?.tools?.some((tool) => tool.name === "tool_catalog_entry") && listed.result?.tools?.some((tool) => tool.name === "runtime_ready") && listed.result?.tools?.some((tool) => tool.name === "runtime_capability") && listed.result?.tools?.some((tool) => tool.name === "runtime_contract") && Array.isArray(metadata.content) && metadata.content[0]?.type === "text" && Array.isArray(doctor.content) && doctor.content[0]?.type === "text" && Array.isArray(commands.content) && commands.content[0]?.type === "text" && Array.isArray(command.content) && command.content[0]?.type === "text" && Array.isArray(commandHelp.content) && commandHelp.content[0]?.type === "text" && Array.isArray(initOptions.content) && initOptions.content[0]?.type === "text" && Array.isArray(initOption.content) && initOption.content[0]?.type === "text" && Array.isArray(initHelp.content) && initHelp.content[0]?.type === "text" && Array.isArray(mcpOptionsView.content) && mcpOptionsView.content[0]?.type === "text" && Array.isArray(mcpOption.content) && mcpOption.content[0]?.type === "text" && Array.isArray(mcpOptionHelp.content) && mcpOptionHelp.content[0]?.type === "text" && Array.isArray(toolCatalog.content) && toolCatalog.content[0]?.type === "text" && Array.isArray(toolCatalogEntry.content) && toolCatalogEntry.content[0]?.type === "text" && Array.isArray(ready.content) && ready.content[0]?.type === "text" && Array.isArray(capability.content) && capability.content[0]?.type === "text" && Array.isArray(contract.content) && contract.content[0]?.type === "text" && serialized.endsWith(\"\\n\") && Array.isArray(mcpOptions) && mcpOptions.some((option) => option.option === \"--capabilities\") && toolsOption?.option === \"--tools\" && toolsOptionView?.kind === \"mcp_command_option_view\" && toolsOptionView?.matchedOption === \"--tools\" && missingToolsOptionView?.recommendedReason === \"mcp_command_option_missing\" && helpView.kind === \"mcp_help_view\" && helpView.matchedOption === \"--tools\" && helpView.text.includes(\"codex-bees mcp --tools\") && fallbackHelpView.recommendedReason === \"mcp_help_fallback_loaded\" && mcpCatalog.kind === \"mcp_command_catalog_view\" && mcpCatalog.counts.totalOptions >= 5 && mcpCatalog.options.some((option) => option.option === \"--capabilities\") && mcpHelp.includes(\"codex-bees mcp --tools\") && mcpHelp.includes(\"codex-bees mcp --capabilities\") && !(\"runMcpCli\" in m) && !(\"startMcpServer\" in m) && !(\"toolCatalog\" in m), keys: Object.keys(m).sort() })); })'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
const installedMcpImportPayload = JSON.parse(installedMcpImport.stdout);
if (
  installedMcpImport.status !== 0 ||
  installedMcpImportPayload.ok !== true
) {
  console.error("[smoke:installed-mcp-import] expected installed codex-bees/mcp subpath to expose working programmatic helpers");
  console.error(installedMcpImport.stderr || installedMcpImport.stdout);
  process.exit(installedMcpImport.status ?? 1);
}
const missingDocumentedMcpImports = documentedMcpImportExports.filter(
  (name) => !installedMcpImportPayload.keys.includes(name)
);
if (missingDocumentedMcpImports.length > 0) {
  console.error("[smoke:readme-mcp-import-contract] expected README mcp import example to match documented installed mcp exports");
  console.error(JSON.stringify({ missingDocumentedMcpImports, documentedMcpImportExports, installedMcpExports: installedMcpImportPayload.keys }, null, 2));
  process.exit(1);
}
const installedMcpExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedMcpExampleScript}\nconsole.log(JSON.stringify({ ok: Array.isArray(tools) && tools.some((tool) => tool.name === "package_metadata") && tools.some((tool) => tool.name === "runtime_doctor") && tools.some((tool) => tool.name === "command_catalog") && tools.some((tool) => tool.name === "command_catalog_entry") && tools.some((tool) => tool.name === "command_help") && tools.some((tool) => tool.name === "init_command_catalog") && tools.some((tool) => tool.name === "init_command_option") && tools.some((tool) => tool.name === "init_help") && tools.some((tool) => tool.name === "mcp_command_catalog") && tools.some((tool) => tool.name === "mcp_command_option") && tools.some((tool) => tool.name === "mcp_help") && tools.some((tool) => tool.name === "tool_catalog") && tools.some((tool) => tool.name === "tool_catalog_entry") && tools.some((tool) => tool.name === "runtime_ready") && tools.some((tool) => tool.name === "runtime_capability") && tools.some((tool) => tool.name === "runtime_contract") && packageMetadataTool?.name === "package_metadata" && packageMetadataToolView?.kind === "mcp_tool_view" && packageMetadataToolView?.matchedTool === "package_metadata" && runtimeDoctorTool?.name === "runtime_doctor" && runtimeDoctorToolView?.kind === "mcp_tool_view" && runtimeDoctorToolView?.matchedTool === "runtime_doctor" && commandCatalogTool?.name === "command_catalog" && commandCatalogToolView?.kind === "mcp_tool_view" && commandCatalogToolView?.matchedTool === "command_catalog" && commandCatalogEntryTool?.name === "command_catalog_entry" && commandCatalogEntryToolView?.kind === "mcp_tool_view" && commandCatalogEntryToolView?.matchedTool === "command_catalog_entry" && commandHelpTool?.name === "command_help" && commandHelpToolView?.kind === "mcp_tool_view" && commandHelpToolView?.matchedTool === "command_help" && initCommandCatalogTool?.name === "init_command_catalog" && initCommandCatalogToolView?.kind === "mcp_tool_view" && initCommandCatalogToolView?.matchedTool === "init_command_catalog" && initCommandOptionTool?.name === "init_command_option" && initCommandOptionToolView?.kind === "mcp_tool_view" && initCommandOptionToolView?.matchedTool === "init_command_option" && initHelpTool?.name === "init_help" && initHelpToolView?.kind === "mcp_tool_view" && initHelpToolView?.matchedTool === "init_help" && mcpCommandCatalogTool?.name === "mcp_command_catalog" && mcpCommandCatalogToolView?.kind === "mcp_tool_view" && mcpCommandCatalogToolView?.matchedTool === "mcp_command_catalog" && mcpCommandOptionTool?.name === "mcp_command_option" && mcpCommandOptionToolView?.kind === "mcp_tool_view" && mcpCommandOptionToolView?.matchedTool === "mcp_command_option" && mcpHelpTool?.name === "mcp_help" && mcpHelpToolView?.kind === "mcp_tool_view" && mcpHelpToolView?.matchedTool === "mcp_help" && toolCatalogView?.kind === "tool_catalog_view" && toolCatalogView?.tools?.some((tool) => tool.name === "runtime_contract") && toolCatalogTool?.name === "tool_catalog" && toolCatalogToolView?.kind === "mcp_tool_view" && toolCatalogToolView?.matchedTool === "tool_catalog" && toolCatalogEntryTool?.name === "tool_catalog_entry" && toolCatalogEntryToolView?.kind === "mcp_tool_view" && toolCatalogEntryToolView?.matchedTool === "tool_catalog_entry" && toolsView?.content?.[0]?.type === "text" && toolView?.content?.[0]?.type === "text" && runtimeReadyTool?.name === "runtime_ready" && runtimeReadyToolView?.kind === "mcp_tool_view" && runtimeReadyToolView?.matchedTool === "runtime_ready" && runtimeCapabilityTool?.name === "runtime_capability" && runtimeCapabilityToolView?.kind === "mcp_tool_view" && runtimeCapabilityToolView?.matchedTool === "runtime_capability" && runtimeContractTool?.name === "runtime_contract" && runtimeContractToolView?.kind === "mcp_tool_view" && runtimeContractToolView?.matchedTool === "runtime_contract" && Array.isArray(options) && options.some((option) => option.option === "--capabilities") && toolsOption?.option === "--tools" && toolsOptionView?.kind === "mcp_command_option_view" && toolsOptionView?.matchedOption === "--tools" && helpView?.kind === "mcp_help_view" && helpView?.matchedOption === "--tools" && listed.result?.tools?.some((tool) => tool.name === "package_metadata") && listed.result?.tools?.some((tool) => tool.name === "runtime_doctor") && listed.result?.tools?.some((tool) => tool.name === "command_catalog") && listed.result?.tools?.some((tool) => tool.name === "command_catalog_entry") && listed.result?.tools?.some((tool) => tool.name === "command_help") && listed.result?.tools?.some((tool) => tool.name === "init_command_catalog") && listed.result?.tools?.some((tool) => tool.name === "init_command_option") && listed.result?.tools?.some((tool) => tool.name === "init_help") && listed.result?.tools?.some((tool) => tool.name === "mcp_command_catalog") && listed.result?.tools?.some((tool) => tool.name === "mcp_command_option") && listed.result?.tools?.some((tool) => tool.name === "mcp_help") && listed.result?.tools?.some((tool) => tool.name === "tool_catalog") && listed.result?.tools?.some((tool) => tool.name === "tool_catalog_entry") && listed.result?.tools?.some((tool) => tool.name === "runtime_ready") && listed.result?.tools?.some((tool) => tool.name === "runtime_capability") && listed.result?.tools?.some((tool) => tool.name === "runtime_contract") && Array.isArray(metadata.content) && metadata.content[0]?.type === "text" && Array.isArray(doctor.content) && doctor.content[0]?.type === "text" && Array.isArray(commands.content) && commands.content[0]?.type === "text" && Array.isArray(command.content) && command.content[0]?.type === "text" && Array.isArray(commandHelp.content) && commandHelp.content[0]?.type === "text" && Array.isArray(initOptions.content) && initOptions.content[0]?.type === "text" && Array.isArray(initOption.content) && initOption.content[0]?.type === "text" && Array.isArray(initOptionHelp.content) && initOptionHelp.content[0]?.type === "text" && Array.isArray(mcpOptionsView.content) && mcpOptionsView.content[0]?.type === "text" && Array.isArray(mcpOption.content) && mcpOption.content[0]?.type === "text" && Array.isArray(mcpOptionHelp.content) && mcpOptionHelp.content[0]?.type === "text" && Array.isArray(toolsView.content) && toolsView.content[0]?.type === "text" && Array.isArray(toolView.content) && toolView.content[0]?.type === "text" && Array.isArray(ready.content) && ready.content[0]?.type === "text" && Array.isArray(capability.content) && capability.content[0]?.type === "text" && Array.isArray(contract.content) && contract.content[0]?.type === "text" }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedMcpExample.status !== 0 ||
  JSON.parse(installedMcpExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-mcp-example-contract] expected README mcp example to execute successfully against the installed package");
  console.error(installedMcpExample.stderr || installedMcpExample.stdout);
  process.exit(installedMcpExample.status ?? 1);
}
const installedCatalogExample = spawnSync(
  "node",
  [
    "--input-type=module",
    "-e",
    `${documentedCatalogExampleScript}\nconsole.log(JSON.stringify({ ok: catalog.kind === "runtime_catalog_view" && typeof catalog.counts?.agents === "number" && catalog.counts.agents > 0 && typeof catalog.counts?.skills === "number" && catalog.counts.skills > 0 && typeof catalog.catalog?.paths?.codexDir === "string" && catalog.catalog.paths.codexDir.length > 0 && ["workspace", "bundled"].includes(catalog.catalog?.source) && executorAgent?.id === "executor" && executorAgentView?.kind === "runtime_catalog_entry_view" && executorAgentView?.matchedId === "executor" && projectDevelopmentSkill?.id === "project-development" && projectDevelopmentSkillView?.kind === "runtime_catalog_entry_view" && projectDevelopmentSkillView?.matchedId === "project-development" }));`
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCatalogExample.status !== 0 ||
  JSON.parse(installedCatalogExample.stdout.split("\n").filter(Boolean).at(-1)).ok !== true
) {
  console.error("[smoke:readme-catalog-example-contract] expected README catalog example to execute successfully against the installed package");
  console.error(installedCatalogExample.stderr || installedCatalogExample.stdout);
  process.exit(installedCatalogExample.status ?? 1);
}
const installedCatalogImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/catalog").then((m) => console.log(JSON.stringify({ok:Object.keys(m).includes("getRuntimeCatalogView") && typeof m.getAgentCatalogEntry === "function" && m.getAgentCatalogEntry("executor")?.id === "executor" && typeof m.getAgentCatalogEntryView === "function" && m.getAgentCatalogEntryView("executor")?.matchedId === "executor" && typeof m.getSkillCatalogEntry === "function" && m.getSkillCatalogEntry("project-development")?.id === "project-development" && typeof m.getSkillCatalogEntryView === "function" && m.getSkillCatalogEntryView("project-development")?.matchedId === "project-development" && !("getBundledRuntimeCatalogPaths" in m)})))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCatalogImport.status !== 0 ||
  JSON.parse(installedCatalogImport.stdout).ok !== true
) {
  console.error("[smoke:installed-catalog-import] expected installed codex-bees/catalog subpath export");
  console.error(installedCatalogImport.stderr || installedCatalogImport.stdout);
  process.exit(installedCatalogImport.status ?? 1);
}
const installedCommandsImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/commands").then((m) => { const mcp = m.getCommandCatalogEntry("mcp"); const init = m.getCommandCatalogEntry("init"); const initEntryView = m.getCommandCatalogEntryView("init"); const missingEntryView = m.getCommandCatalogEntryView("missing"); const statusHelpView = m.getCommandHelpView("status"); const missingHelpView = m.getCommandHelpView("missing"); const initOptionsView = m.getInitCommandCatalogView(); const previewOption = m.getInitCommandCatalogEntry("--preview"); const previewOptionView = m.getInitCommandCatalogEntryView("--preview"); const missingPreviewOptionView = m.getInitCommandCatalogEntryView("--missing"); const initOptionHelpView = m.getInitHelpView("--preview"); const fallbackInitOptionHelpView = m.getInitHelpView("--missing"); const mcpOptions = m.getMcpCommandCatalog(); const mcpOptionsView = m.getMcpCommandCatalogView(); const toolsOption = m.getMcpCommandCatalogEntry("--tools"); const toolsOptionView = m.getMcpCommandCatalogEntryView("--tools"); const missingToolsOptionView = m.getMcpCommandCatalogEntryView("--missing"); const mcpHelpView = m.getMcpHelpView("--tools"); const fallbackMcpHelpView = m.getMcpHelpView("--missing"); console.log(JSON.stringify({ ok: m.getCommandCatalogView().kind === "command_catalog_view" && m.getCommandCatalogView().counts.totalCommands > 10 && m.renderHelpText().includes("codex-bees run") && m.renderHelpText().includes("codex-bees metadata") && typeof m.getCommandCatalogEntry === "function" && m.getCommandCatalogEntry("init")?.command === "init" && typeof m.getCommandCatalogEntryView === "function" && initEntryView.kind === "command_catalog_entry_view" && initEntryView.matchedCommand === "init" && missingEntryView.recommendedReason === "command_catalog_entry_missing" && typeof m.getCommandHelpView === "function" && statusHelpView.kind === "command_help_view" && statusHelpView.matchedCommand === "status" && statusHelpView.text.includes("codex-bees status") && statusHelpView.text.includes("Description:") && statusHelpView.text.includes("Print runtime state and surface summary") && missingHelpView.recommendedReason === "command_help_fallback_loaded" && missingHelpView.text.includes("codex-bees run") && typeof m.getInitCommandCatalogView === "function" && initOptionsView.kind === "init_command_catalog_view" && initOptionsView.counts.totalOptions >= 5 && initOptionsView.options.some((option) => option.option === "--preview") && typeof m.getInitCommandCatalogEntry === "function" && previewOption?.option === "--preview" && typeof m.getInitCommandCatalogEntryView === "function" && previewOptionView.kind === "init_command_option_view" && previewOptionView.matchedOption === "--preview" && missingPreviewOptionView.recommendedReason === "init_command_option_missing" && typeof m.getInitHelpView === "function" && initOptionHelpView.kind === "init_help_view" && initOptionHelpView.matchedOption === "--preview" && initOptionHelpView.text.includes("codex-bees init") && fallbackInitOptionHelpView.recommendedReason === "init_help_fallback_loaded" && Array.isArray(mcp?.options) && mcp.options.some((option) => option.option === "--capabilities") && mcp.options.some((option) => option.option === "--tools") && typeof m.getInitCommandCatalog === "function" && Array.isArray(m.getInitCommandCatalog()) && m.getInitCommandCatalog().some((option) => option.option === "--preview") && Array.isArray(init?.options) && init.options.some((option) => option.option === "--dir <path>") && Array.isArray(m.getCommandCatalogEntry("task:add")?.options) && m.getCommandCatalogEntry("task:add")?.options?.some((option) => option.option === "--acceptance <item|item>") && Array.isArray(m.getCommandCatalogEntry("swarm:init")?.options) && m.getCommandCatalogEntry("swarm:init")?.options?.some((option) => option.option === "--lanes <json>") && Array.isArray(m.getCommandCatalogEntry("leader:assignment-launch-plan")?.options) && m.getCommandCatalogEntry("leader:assignment-launch-plan")?.options?.some((option) => option.option === "--workers <json>") && Array.isArray(m.getCommandCatalogEntry("memory:search")?.options) && m.getCommandCatalogEntry("memory:search")?.options?.some((option) => option.option === "--query <text>") && Array.isArray(m.getCommandCatalogEntry("runtime:assignment-pack")?.options) && m.getCommandCatalogEntry("runtime:assignment-pack")?.options?.some((option) => option.option === "--role <role>") && Array.isArray(mcpOptions) && mcpOptions.some((option) => option.option === "--capabilities") && mcpOptions.some((option) => option.option === "--tools") && mcpOptionsView.kind === "mcp_command_catalog_view" && mcpOptionsView.counts.totalOptions >= 5 && mcpOptionsView.options.some((option) => option.option === "--tools") && toolsOption?.option === "--tools" && toolsOptionView.kind === "mcp_command_option_view" && toolsOptionView.matchedOption === "--tools" && missingToolsOptionView.recommendedReason === "mcp_command_option_missing" && mcpHelpView.kind === "mcp_help_view" && mcpHelpView.matchedOption === "--tools" && mcpHelpView.text.includes("codex-bees mcp --tools") && fallbackMcpHelpView.recommendedReason === "mcp_help_fallback_loaded" && typeof m.renderCommandHelpText === "function" && m.renderCommandHelpText("status").includes("codex-bees status") && m.renderCommandHelpText("status").includes("Description:") && m.renderCommandHelpText("task:add").includes("--acceptance <item|item>") && m.renderCommandHelpText("task:add").includes("Pipe-delimited") && m.renderCommandHelpText("swarm:init").includes("--lanes <json>") && m.renderCommandHelpText("leader:assignment-launch-plan").includes("--workers <json>") && m.renderCommandHelpText("memory:search").includes("--query <text>") && m.renderCommandHelpText("runtime:assignment-pack").includes("--role <role>") && m.renderCommandHelpText("mcp:option").includes("--option <option>") && m.renderCommandHelpText("init").includes("codex-bees init") && m.renderCommandHelpText("help").includes("codex-bees --help") && m.renderCommandHelpText("missing").includes("codex-bees run") && typeof m.renderMcpHelpText === "function" && m.renderMcpHelpText().includes("codex-bees mcp --capabilities") })); })'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCommandsImport.status !== 0 ||
  JSON.parse(installedCommandsImport.stdout).ok !== true
) {
  console.error("[smoke:installed-commands-import] expected installed codex-bees/commands subpath export");
  console.error(installedCommandsImport.stderr || installedCommandsImport.stdout);
  process.exit(installedCommandsImport.status ?? 1);
}
const installedInitImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/init").then(async (m) => { const { mkdtempSync, rmSync } = await import("node:fs"); const { tmpdir } = await import("node:os"); const { join } = await import("node:path"); const targetDirectory = mkdtempSync(join(tmpdir(), "codex-bees-installed-init-import-")); const preview = m.previewWorkspaceInit({ targetDirectory }); const applied = m.initWorkspace({ targetDirectory }); rmSync(targetDirectory, { recursive: true, force: true }); console.log(JSON.stringify({ ok: preview.kind === "workspace_init_preview" && preview.summary?.hasChanges === true && preview.summary?.create >= 1 && preview.entries?.some((entry) => entry.path === ".codex/agents/executor.md") && applied.kind === "workspace_init_result" && applied.summary?.hasChanges === true && applied.summary?.created >= 1 && applied.created?.includes(".codex/agents/executor.md") })); })'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedInitImport.status !== 0 ||
  JSON.parse(installedInitImport.stdout).ok !== true
) {
  console.error("[smoke:installed-init-import] expected installed codex-bees/init subpath export");
  console.error(installedInitImport.stderr || installedInitImport.stdout);
  process.exit(installedInitImport.status ?? 1);
}
const installedDoctorImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/doctor").then((m) => console.log(JSON.stringify({ ok: m.getRuntimeDoctorView().kind === "runtime_doctor_view" && m.getRuntimeDoctorView().contract?.kind === "runtime_contract_view" })))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDoctorImport.status !== 0 ||
  JSON.parse(installedDoctorImport.stdout).ok !== true
) {
  console.error("[smoke:installed-doctor-import] expected installed codex-bees/doctor subpath export");
  console.error(installedDoctorImport.stderr || installedDoctorImport.stdout);
  process.exit(installedDoctorImport.status ?? 1);
}
const installedMetadataImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/metadata").then((m) => { const metadata = m.getPackageMetadata(); console.log(JSON.stringify({ ok: metadata.product === "codex-bees" && metadata.version === "0.1.0" && metadata.description === "Codex-native multi-agent runtime for explicit local orchestration." && metadata.license === "MIT" && metadata.homepage === "https://github.com/izumi0uu/codex-bees#readme" && metadata.bugsUrl === "https://github.com/izumi0uu/codex-bees/issues" && metadata.repositoryUrl === "https://github.com/izumi0uu/codex-bees.git" && Array.isArray(metadata.keywords) && metadata.keywords.includes("codex") && metadata.keywords.includes("orchestration") && m.getPackageMetadataView().kind === "package_metadata_view" })); })'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedMetadataImport.status !== 0 ||
  JSON.parse(installedMetadataImport.stdout).ok !== true
) {
  console.error("[smoke:installed-metadata-import] expected installed codex-bees/metadata subpath export");
  console.error(installedMetadataImport.stderr || installedMetadataImport.stdout);
  process.exit(installedMetadataImport.status ?? 1);
}
const installedRuntimeReadyImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-ready").then((m) => console.log(JSON.stringify({ ok: m.getRuntimeReadyView().kind === "runtime_ready_view" && m.getRuntimeReadyView().next?.[0] === "use `codex-bees init` to materialize the shipped .codex project assets" })))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRuntimeReadyImport.status !== 0 ||
  JSON.parse(installedRuntimeReadyImport.stdout).ok !== true
) {
  console.error("[smoke:installed-runtime-ready-import] expected installed codex-bees/runtime-ready subpath export");
  console.error(installedRuntimeReadyImport.stderr || installedRuntimeReadyImport.stdout);
  process.exit(installedRuntimeReadyImport.status ?? 1);
}
const installedRuntimeGuidanceImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-guidance").then((m) => console.log(JSON.stringify({ ok: m.getCoordinationOverviewView().overview.deliveryBoundary === "codex-only runtime" && m.getWorkerGuidelinesView().guidelines.fileOwnership === "one active writer per file" })))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRuntimeGuidanceImport.status !== 0 ||
  JSON.parse(installedRuntimeGuidanceImport.stdout).ok !== true
) {
  console.error("[smoke:installed-runtime-guidance-import] expected installed codex-bees/runtime-guidance subpath export");
  console.error(installedRuntimeGuidanceImport.stderr || installedRuntimeGuidanceImport.stdout);
  process.exit(installedRuntimeGuidanceImport.status ?? 1);
}
const installedPlannerImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/planner").then((m) => console.log(JSON.stringify({ok:Object.keys(m).includes("planTask")})))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedPlannerImport.status !== 0 ||
  JSON.parse(installedPlannerImport.stdout).ok !== true
) {
  console.error("[smoke:installed-planner-import] expected installed codex-bees/planner subpath export");
  console.error(installedPlannerImport.stderr || installedPlannerImport.stdout);
  process.exit(installedPlannerImport.status ?? 1);
}
const installedRuntimeContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-contract").then((m) => console.log(JSON.stringify({ ok: typeof m.getRuntimeContractView === "function" && m.getRuntimeContractView().kind === "runtime_contract_view" && m.getRuntimeContractView().contract.product === "codex-bees" && !("getRuntimeContract" in m) })))'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRuntimeContractImport.status !== 0 ||
  JSON.parse(installedRuntimeContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-runtime-contract-import] expected installed codex-bees/runtime-contract subpath export");
  console.error(installedRuntimeContractImport.stderr || installedRuntimeContractImport.stdout);
  process.exit(installedRuntimeContractImport.status ?? 1);
}
const installedStateImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/state").then(async (m) => { const { rmSync } = await import("node:fs"); rmSync(".codex-bees", { recursive: true, force: true }); const task = m.addTask({ title: "state api task", owner: "executor", verifier: "tester", scope: ["src/index.js"], acceptance: ["ok"], verification: ["smoke"] }); const swarm = m.initSwarm({ objective: "state api swarm", owner: "leader", lanes: [{ lane: "lane-1", summary: "sum", owner: "explore", verifier: "reviewer", scope: ["src/index.js"], acceptance: ["ok"], verification: ["smoke"] }] }); const memory = m.storeMemory({ content: "state api memory", namespace: "state-api", kind: "note" }); const memoryRecord = m.getMemory(memory.id); const memoryDetail = m.getMemoryView(memory.id); console.log(JSON.stringify({ ok: task.id === "task-1" && m.listTasksView().counts.totalTasks === 1 && m.validateTask(task.id).recommendedReason === "task_ready_to_claim" && swarm.id === "swarm-1" && m.listSwarmsView({}, { detailed: true }).counts.totalSwarms === 1 && memory.id === "memory-1" && memoryRecord?.id === "memory-1" && memoryDetail?.kind === "memory_detail" && memoryDetail?.memory?.id === "memory-1" && m.listMemoriesView({ namespace: "state-api" }).counts.totalMemories === 1 && typeof m.stateFilePath() === "string" && !("leaderQueue" in m) && !("runtimeDispatch" in m) && !("updateTask" in m) })); })'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedStateImport.status !== 0 ||
  JSON.parse(installedStateImport.stdout).ok !== true
) {
  console.error("[smoke:installed-state-import] expected installed codex-bees/state subpath to expose working state helpers");
  console.error(installedStateImport.stderr || installedStateImport.stdout);
  process.exit(installedStateImport.status ?? 1);
}
const installedRootTaskViewsImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then(async (m) => { const { rmSync } = await import("node:fs"); rmSync(".codex-bees", { recursive: true, force: true }); const task = m.addTask({ title: "root task view api task", owner: "executor", verifier: "tester", scope: ["src/api.js"], acceptance: ["ok"], verification: ["smoke"] }); const brief = m.taskBrief(task.id); const history = m.taskHistory(task.id); const report = m.taskReport(task.id); console.log(JSON.stringify({ ok: task.id === "task-1" && brief?.kind === "task_execution_brief" && brief?.task?.id === "task-1" && history?.kind === "task_history" && history?.taskId === "task-1" && history?.counts?.totalHistoryEntries >= 1 && report?.kind === "task_report" && report?.task?.id === "task-1" && report?.brief?.task?.id === "task-1" })); })'
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRootTaskViewsImport.status !== 0 ||
  JSON.parse(installedRootTaskViewsImport.stdout).ok !== true
) {
  console.error("[smoke:installed-root-task-views-import] expected installed codex-bees root import to expose task delivery helpers");
  console.error(installedRootTaskViewsImport.stderr || installedRootTaskViewsImport.stdout);
  process.exit(installedRootTaskViewsImport.status ?? 1);
}
function runInstalled(label, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? packedInstallAppDir,
    encoding: "utf8",
    env: {
      ...process.env,
      ...(options.env ?? {})
    }
  });
  if (result.status !== 0) {
    console.error(`[smoke:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result;
}

const installedHelp = runInstalled("installed-help", "npx", ["codex-bees", "--help"]);
if (
  !installedHelp.stdout.includes("codex-bees") ||
  !installedHelp.stdout.includes("codex-bees init") ||
  !installedHelp.stdout.includes("codex-bees catalog") ||
  !installedHelp.stdout.includes("codex-bees mcp")
) {
  console.error("[smoke:installed-help] expected installed npx codex-bees help surface");
  process.exit(1);
}
const installedHelpImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/commands").then((m) => console.log(JSON.stringify({ ok: m.renderHelpText() === process.argv[1] })))',
    installedHelp.stdout
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedHelpImport.status !== 0 ||
  JSON.parse(installedHelpImport.stdout).ok !== true
) {
  console.error("[smoke:installed-help-contract] expected installed help output to match commands surface");
  console.error(installedHelpImport.stderr || installedHelpImport.stdout);
  process.exit(installedHelpImport.status ?? 1);
}
const installedDirectCliHelp = runInstalled("installed-direct-cli-help", "node", ["./node_modules/codex-bees/dist/index.js", "--help"]);
if (
  !installedDirectCliHelp.stdout.includes("codex-bees") ||
  !installedDirectCliHelp.stdout.includes("codex-bees init") ||
  !installedDirectCliHelp.stdout.includes("codex-bees catalog") ||
  !installedDirectCliHelp.stdout.includes("codex-bees mcp")
) {
  console.error("[smoke:installed-direct-cli-help] expected direct packaged CLI help surface");
  process.exit(1);
}
const installedInitHelpWorkspaceDir = mkdtempSync(join(tmpdir(), "codex-bees-installed-init-help-"));
const installedInitHelp = runInstalled("installed-init-help", "npx", ["codex-bees", "init", "--help"]);
if (
  !installedInitHelp.stdout.includes("codex-bees init") ||
  !installedInitHelp.stdout.includes("--preview") ||
  !installedInitHelp.stdout.includes("--force") ||
  !installedInitHelp.stdout.includes("--dir <path>")
) {
  console.error("[smoke:installed-init-help] expected installed init help surface");
  process.exit(1);
}
const installedInitHelpSideEffect = runInstalled(
  "installed-init-help-side-effect",
  "node",
  [join(packedInstallAppDir, "node_modules", "codex-bees", "dist", "index.js"), "init", "--help"],
  { cwd: installedInitHelpWorkspaceDir }
);
if (
  !installedInitHelpSideEffect.stdout.includes("codex-bees init") ||
  existsSync(join(installedInitHelpWorkspaceDir, ".codex")) ||
  existsSync(join(installedInitHelpWorkspaceDir, ".gitignore"))
) {
  console.error("[smoke:installed-init-help-side-effect] expected installed init help to stay side-effect free");
  process.exit(1);
}
rmSync(installedInitHelpWorkspaceDir, { recursive: true, force: true });

const installedDirectCliHelpImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/commands").then((m) => console.log(JSON.stringify({ ok: m.renderHelpText() === process.argv[1] })))',
    installedDirectCliHelp.stdout
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliHelpImport.status !== 0 ||
  JSON.parse(installedDirectCliHelpImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-help-contract] expected direct packaged CLI help output to match commands surface");
  console.error(installedDirectCliHelpImport.stderr || installedDirectCliHelpImport.stdout);
  process.exit(installedDirectCliHelpImport.status ?? 1);
}

const installedInitWorkspaceDir = mkdtempSync(join(tmpdir(), "codex-bees-installed-init-"));
const installedInitPreview = JSON.parse(
  runInstalled("installed-init-preview", "npx", ["codex-bees", "init", "--preview", "--dir", installedInitWorkspaceDir]).stdout
).init;
if (
  installedInitPreview.kind !== "workspace_init_preview" ||
  installedInitPreview.recommendedReason !== "init_changes_required" ||
  installedInitPreview.summary?.hasChanges !== true ||
  installedInitPreview.summary?.create < 1 ||
  !installedInitPreview.entries?.some((entry) => entry.path === ".codex/agents/executor.md")
) {
  console.error("[smoke:installed-init-preview] expected installed init preview to expose bundled workspace assets");
  process.exit(1);
}
const installedInitApplied = JSON.parse(
  runInstalled("installed-init-apply", "npx", ["codex-bees", "init", "--dir", installedInitWorkspaceDir]).stdout
).init;
if (
  installedInitApplied.kind !== "workspace_init_result" ||
  installedInitApplied.recommendedReason !== "init_applied" ||
  installedInitApplied.summary?.hasChanges !== true ||
  installedInitApplied.summary?.created < 1 ||
  !existsSync(join(installedInitWorkspaceDir, ".codex", "agents", "executor.md")) ||
  !existsSync(join(installedInitWorkspaceDir, ".codex", "skills", "project-development", "SKILL.md"))
) {
  console.error("[smoke:installed-init-apply] expected installed init to materialize workspace assets");
  process.exit(1);
}
const installedInitCatalog = JSON.parse(
  runInCwd(
    "installed-init-catalog",
    [join(packedInstallAppDir, "node_modules", "codex-bees", "dist", "index.js"), "catalog"],
    installedInitWorkspaceDir
  ).stdout
).catalog;
if (installedInitCatalog.catalog?.source !== "workspace") {
  console.error("[smoke:installed-init-catalog] expected installed init workspace to prefer workspace catalog assets");
  process.exit(1);
}
rmSync(installedInitWorkspaceDir, { recursive: true, force: true });
const installedDirectCliBad = spawnSync("node", ["./node_modules/codex-bees/dist/index.js", "nope"], {
  cwd: packedInstallAppDir,
  encoding: "utf8"
});
if (
  installedDirectCliBad.status === 0 ||
  !installedDirectCliBad.stderr.includes("Unknown command: nope")
) {
  console.error("[smoke:installed-direct-cli-bad] expected direct packaged CLI to reject unknown commands");
  console.error(installedDirectCliBad.stderr || installedDirectCliBad.stdout);
  process.exit(1);
}
const installedVersion = runInstalled("installed-version", "npx", ["codex-bees", "--version"]);
if (installedVersion.stdout.trim() !== "0.1.0") {
  console.error("[smoke:installed-version] expected installed npx codex-bees --version output");
  process.exit(1);
}
const installedDirectCliVersion = runInstalled("installed-direct-cli-version", "node", ["./node_modules/codex-bees/dist/index.js", "--version"]);
if (installedDirectCliVersion.stdout.trim() !== "0.1.0") {
  console.error("[smoke:installed-direct-cli-version] expected direct packaged CLI version output");
  process.exit(1);
}
const installedRun = JSON.parse(
  runInstalled("installed-run", "npx", ["codex-bees", "run"]).stdout
);
if (
  installedRun.kind !== "runtime_ready_view" ||
  installedRun.recommendedReason !== "runtime_entry_ready" ||
  installedRun.status !== "ready" ||
  installedRun.counts?.nextSteps < 1 ||
  installedRun.contract?.kind !== "runtime_contract_view" ||
  !Array.isArray(installedRun.next) ||
  installedRun.next[0] !== "use `codex-bees init` to materialize the shipped .codex project assets"
) {
  console.error("[smoke:installed-run] expected installed npx codex-bees run readiness surface");
  process.exit(1);
}
const installedRunImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-ready").then((m) => console.log(JSON.stringify({ ok: JSON.stringify(m.getRuntimeReadyView()) === process.argv[1] })))',
    JSON.stringify(installedRun)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedRunImport.status !== 0 ||
  JSON.parse(installedRunImport.stdout).ok !== true
) {
  console.error("[smoke:installed-run-contract] expected installed npx codex-bees run output to match runtime-ready api surface");
  console.error(installedRunImport.stderr || installedRunImport.stdout);
  process.exit(installedRunImport.status ?? 1);
}
const installedReady = JSON.parse(
  runInstalled("installed-ready", "npx", ["codex-bees", "ready"]).stdout
).ready;
if (
  installedReady.kind !== "runtime_ready_view" ||
  installedReady.recommendedReason !== "runtime_entry_ready" ||
  installedReady.status !== "ready" ||
  installedReady.contract?.kind !== "runtime_contract_view"
) {
  console.error("[smoke:installed-ready] expected installed npx codex-bees ready surface");
  process.exit(1);
}
const installedReadyImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-ready").then((m) => console.log(JSON.stringify({ ok: JSON.stringify(m.getRuntimeReadyView()) === process.argv[1] })))',
    JSON.stringify(installedReady)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedReadyImport.status !== 0 ||
  JSON.parse(installedReadyImport.stdout).ok !== true
) {
  console.error("[smoke:installed-ready-contract] expected installed ready output to match runtime-ready api surface");
  console.error(installedReadyImport.stderr || installedReadyImport.stdout);
  process.exit(installedReadyImport.status ?? 1);
}
const installedDirectCliRun = JSON.parse(
  runInstalled("installed-direct-cli-run", "node", ["./node_modules/codex-bees/dist/index.js", "run"]).stdout
);
if (
  installedDirectCliRun.kind !== "runtime_ready_view" ||
  installedDirectCliRun.recommendedReason !== "runtime_entry_ready" ||
  installedDirectCliRun.status !== "ready" ||
  installedDirectCliRun.counts?.nextSteps < 1 ||
  installedDirectCliRun.contract?.kind !== "runtime_contract_view" ||
  !Array.isArray(installedDirectCliRun.next) ||
  installedDirectCliRun.next[0] !== "use `codex-bees init` to materialize the shipped .codex project assets"
) {
  console.error("[smoke:installed-direct-cli-run] expected direct packaged CLI run readiness surface");
  process.exit(1);
}
const installedDirectCliRunImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-ready").then((m) => console.log(JSON.stringify({ ok: JSON.stringify(m.getRuntimeReadyView()) === process.argv[1] })))',
    JSON.stringify(installedDirectCliRun)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliRunImport.status !== 0 ||
  JSON.parse(installedDirectCliRunImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-run-contract] expected direct packaged CLI run output to match runtime-ready api surface");
  console.error(installedDirectCliRunImport.stderr || installedDirectCliRunImport.stdout);
  process.exit(installedDirectCliRunImport.status ?? 1);
}
const installedDirectCliReady = JSON.parse(
  runInstalled("installed-direct-cli-ready", "node", ["./node_modules/codex-bees/dist/index.js", "ready"]).stdout
).ready;
if (
  installedDirectCliReady.kind !== "runtime_ready_view" ||
  installedDirectCliReady.recommendedReason !== "runtime_entry_ready" ||
  installedDirectCliReady.status !== "ready" ||
  installedDirectCliReady.contract?.kind !== "runtime_contract_view"
) {
  console.error("[smoke:installed-direct-cli-ready] expected direct packaged CLI ready surface");
  process.exit(1);
}
const installedDirectCliReadyImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-ready").then((m) => console.log(JSON.stringify({ ok: JSON.stringify(m.getRuntimeReadyView()) === process.argv[1] })))',
    JSON.stringify(installedDirectCliReady)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliReadyImport.status !== 0 ||
  JSON.parse(installedDirectCliReadyImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-ready-contract] expected direct packaged CLI ready output to match runtime-ready api surface");
  console.error(installedDirectCliReadyImport.stderr || installedDirectCliReadyImport.stdout);
  process.exit(installedDirectCliReadyImport.status ?? 1);
}
const downstreamTypesSmokePath = join(packedInstallAppDir, "types-smoke.ts");
writeFileSync(
  downstreamTypesSmokePath,
  readFileSync(join(REPO_ROOT, "types-smoke.ts"), "utf8"),
  "utf8"
);
const installedTypecheck = spawnSync("npx", ["-y", "-p", "typescript", "tsc", "--noEmit", "./types-smoke.ts"], {
  cwd: packedInstallAppDir,
  encoding: "utf8",
  env: {
    ...process.env,
    npm_config_cache: NPM_CACHE_DIR
  }
});
if (installedTypecheck.status !== 0) {
  console.error("[smoke:installed-typecheck] expected installed codex-bees typings to compile in a downstream project");
  console.error(installedTypecheck.stderr || installedTypecheck.stdout);
  process.exit(installedTypecheck.status ?? 1);
}
const installedMcpHelp = runInstalled("installed-mcp-help", "npx", ["codex-bees", "mcp", "--help"]);
if (
  !installedMcpHelp.stdout.includes("codex-bees mcp") ||
  !installedMcpHelp.stdout.includes("codex-bees mcp --stdio") ||
  !installedMcpHelp.stdout.includes("codex-bees mcp --tools") ||
  !installedMcpHelp.stdout.includes("codex-bees mcp --capabilities") ||
  !installedMcpHelp.stdout.includes("codex-bees mcp --version")
) {
  console.error("[smoke:installed-mcp-help] expected installed codex-bees mcp help surface");
  process.exit(1);
}
const installedMcpHelpImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/mcp").then((m) => console.log(JSON.stringify({ ok: m.renderMcpHelpText() === process.argv[1] && m.getMcpCommandCatalogView().options.some((option) => option.option === "--capabilities") && m.getMcpCommandCatalogView().counts.totalOptions >= 5 })))',
    installedMcpHelp.stdout
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedMcpHelpImport.status !== 0 ||
  JSON.parse(installedMcpHelpImport.stdout).ok !== true
) {
  console.error("[smoke:installed-mcp-help-contract] expected installed mcp help output to match structured mcp command surface");
  console.error(installedMcpHelpImport.stderr || installedMcpHelpImport.stdout);
  process.exit(installedMcpHelpImport.status ?? 1);
}
const installedMcpVersion = runInstalled("installed-mcp-version", "npx", ["codex-bees", "mcp", "--version"]);
if (installedMcpVersion.stdout.trim() !== "0.1.0") {
  console.error("[smoke:installed-mcp-version] expected installed codex-bees mcp --version output");
  process.exit(1);
}
const installedMcpBad = spawnSync("npx", ["codex-bees", "mcp", "nope"], {
  cwd: packedInstallAppDir,
  encoding: "utf8"
});
if (
  installedMcpBad.status === 0 ||
  !installedMcpBad.stderr.includes("Unknown mcp option: nope") ||
  installedMcpBad.stderr.includes("at runMcpCli")
) {
  console.error("[smoke:installed-mcp-bad] expected installed codex-bees mcp to reject unknown options");
  console.error(installedMcpBad.stderr || installedMcpBad.stdout);
  process.exit(1);
}
const installedMetadata = JSON.parse(
  runInstalled("installed-metadata", "npx", ["codex-bees", "metadata"]).stdout
).metadata;
if (
  installedMetadata.kind !== "package_metadata_view" ||
  installedMetadata.metadata?.product !== "codex-bees" ||
  installedMetadata.metadata?.version !== "0.1.0" ||
  installedMetadata.metadata?.homepage !== "https://github.com/izumi0uu/codex-bees#readme"
) {
  console.error("[smoke:installed-metadata] expected installed npx codex-bees metadata to expose the package metadata view");
  process.exit(1);
}
const installedMetadataContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getPackageMetadataView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedMetadata)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedMetadataContractImport.status !== 0 ||
  JSON.parse(installedMetadataContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-metadata-contract] expected installed metadata output to match the package metadata api surface");
  console.error(installedMetadataContractImport.stderr || installedMetadataContractImport.stdout);
  process.exit(installedMetadataContractImport.status ?? 1);
}
const installedDirectCliMetadata = JSON.parse(
  runInstalled("installed-direct-cli-metadata", "node", ["./node_modules/codex-bees/dist/index.js", "metadata"]).stdout
).metadata;
if (
  installedDirectCliMetadata.kind !== "package_metadata_view" ||
  installedDirectCliMetadata.metadata?.product !== "codex-bees" ||
  installedDirectCliMetadata.metadata?.version !== "0.1.0" ||
  installedDirectCliMetadata.metadata?.homepage !== "https://github.com/izumi0uu/codex-bees#readme"
) {
  console.error("[smoke:installed-direct-cli-metadata] expected direct packaged CLI metadata output");
  process.exit(1);
}
const installedDirectCliMetadataContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getPackageMetadataView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliMetadata)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliMetadataContractImport.status !== 0 ||
  JSON.parse(installedDirectCliMetadataContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-metadata-contract] expected direct packaged CLI metadata output to match the package metadata api surface");
  console.error(installedDirectCliMetadataContractImport.stderr || installedDirectCliMetadataContractImport.stdout);
  process.exit(installedDirectCliMetadataContractImport.status ?? 1);
}
const installedCatalog = JSON.parse(
  runInstalled("installed-catalog", "npx", ["codex-bees", "catalog"]).stdout
).catalog;
if (
  installedCatalog.kind !== "runtime_catalog_view" ||
  installedCatalog.catalog?.source !== "bundled" ||
  installedCatalog.counts?.agents !== 4 ||
  installedCatalog.counts?.skills !== 2 ||
  !installedCatalog.catalog?.paths?.codexDir?.startsWith("@bundled/dist/.codex")
) {
  console.error("[smoke:installed-catalog] expected installed npx codex-bees to use bundled catalog assets");
  process.exit(1);
}
const installedCatalogContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedCatalog)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCatalogContractImport.status !== 0 ||
  JSON.parse(installedCatalogContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-catalog-contract] expected installed catalog output to match the runtime catalog api surface");
  console.error(installedCatalogContractImport.stderr || installedCatalogContractImport.stdout);
  process.exit(installedCatalogContractImport.status ?? 1);
}
const installedDirectCliCatalog = JSON.parse(
  runInstalled("installed-direct-cli-catalog", "node", ["./node_modules/codex-bees/dist/index.js", "catalog"]).stdout
).catalog;
if (
  installedDirectCliCatalog.kind !== "runtime_catalog_view" ||
  installedDirectCliCatalog.catalog?.source !== "bundled" ||
  installedDirectCliCatalog.counts?.agents !== 4 ||
  installedDirectCliCatalog.counts?.skills !== 2 ||
  !installedDirectCliCatalog.catalog?.paths?.codexDir?.startsWith("@bundled/dist/.codex")
) {
  console.error("[smoke:installed-direct-cli-catalog] expected direct packaged CLI catalog to use bundled assets");
  process.exit(1);
}
const installedDirectCliCatalogContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliCatalog)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliCatalogContractImport.status !== 0 ||
  JSON.parse(installedDirectCliCatalogContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-catalog-contract] expected direct packaged CLI catalog output to match the runtime catalog api surface");
  console.error(installedDirectCliCatalogContractImport.stderr || installedDirectCliCatalogContractImport.stdout);
  process.exit(installedDirectCliCatalogContractImport.status ?? 1);
}
const installedStatus = JSON.parse(
  runInstalled("installed-status", "npx", ["codex-bees", "status"]).stdout
).status;
if (
  installedStatus.kind !== "runtime_status_view" ||
  installedStatus.status?.catalog?.source !== "bundled" ||
  installedStatus.status?.version !== "0.1.0" ||
  installedStatus.status?.product !== "codex-bees" ||
  installedStatus.counts?.agents !== 4 ||
  installedStatus.counts?.skills !== 2
) {
  console.error("[smoke:installed-status] expected installed npx codex-bees status to expose bundled runtime catalog");
  process.exit(1);
}
const installedStatusContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const metadata = m.getPackageMetadata(); const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeStatusView({ version: metadata.version, toolCount: m.listMcpTools().length }); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedStatus)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedStatusContractImport.status !== 0 ||
  JSON.parse(installedStatusContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-status-contract] expected installed status output to match the runtime-status api surface");
  console.error(installedStatusContractImport.stderr || installedStatusContractImport.stdout);
  process.exit(installedStatusContractImport.status ?? 1);
}
const installedDirectCliStatus = JSON.parse(
  runInstalled("installed-direct-cli-status", "node", ["./node_modules/codex-bees/dist/index.js", "status"]).stdout
).status;
if (
  installedDirectCliStatus.kind !== "runtime_status_view" ||
  installedDirectCliStatus.status?.catalog?.source !== "bundled" ||
  installedDirectCliStatus.status?.version !== "0.1.0" ||
  installedDirectCliStatus.status?.product !== "codex-bees" ||
  installedDirectCliStatus.counts?.agents !== 4 ||
  installedDirectCliStatus.counts?.skills !== 2
) {
  console.error("[smoke:installed-direct-cli-status] expected direct packaged CLI status to expose bundled runtime catalog");
  process.exit(1);
}
const installedDirectCliStatusContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const metadata = m.getPackageMetadata(); const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeStatusView({ version: metadata.version, toolCount: m.listMcpTools().length }); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliStatus)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliStatusContractImport.status !== 0 ||
  JSON.parse(installedDirectCliStatusContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-status-contract] expected direct packaged CLI status output to match the runtime-status api surface");
  console.error(installedDirectCliStatusContractImport.stderr || installedDirectCliStatusContractImport.stdout);
  process.exit(installedDirectCliStatusContractImport.status ?? 1);
}
const installedDoctor = JSON.parse(
  runInstalled("installed-doctor", "npx", ["codex-bees", "doctor"]).stdout
);
if (
  installedDoctor.kind !== "runtime_doctor_view" ||
  installedDoctor.recommendedReason !== "doctor_ready" ||
  installedDoctor.catalog?.catalog?.source !== "bundled" ||
  installedDoctor.contract?.kind !== "runtime_contract_view" ||
  !installedDoctor.catalog?.catalog?.paths?.codexDir?.startsWith("@bundled/dist/.codex")
) {
  console.error("[smoke:installed-doctor] expected installed npx codex-bees doctor view to expose bundled diagnostics");
  process.exit(1);
}
const installedDoctorContractImport = spawnSync(
  "node",
  [
    "-e",
    'const { createRequire } = require("node:module"); const { dirname, join } = require("node:path"); const { pathToFileURL } = require("node:url"); const pkgRequire = createRequire(process.cwd() + "/__codex_bees_smoke__.cjs"); import("codex-bees/doctor").then((m) => { const apiPath = pkgRequire.resolve("codex-bees"); const entryUrl = pathToFileURL(join(dirname(apiPath), "index.js")).href; const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeDoctorView(entryUrl); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDoctor)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDoctorContractImport.status !== 0 ||
  JSON.parse(installedDoctorContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-doctor-contract] expected installed doctor output to match the runtime-doctor api surface");
  console.error(installedDoctorContractImport.stderr || installedDoctorContractImport.stdout);
  process.exit(installedDoctorContractImport.status ?? 1);
}
const installedDirectCliDoctor = JSON.parse(
  runInstalled("installed-direct-cli-doctor", "node", ["./node_modules/codex-bees/dist/index.js", "doctor"]).stdout
);
if (
  installedDirectCliDoctor.kind !== "runtime_doctor_view" ||
  installedDirectCliDoctor.recommendedReason !== "doctor_ready" ||
  installedDirectCliDoctor.catalog?.catalog?.source !== "bundled" ||
  installedDirectCliDoctor.contract?.kind !== "runtime_contract_view" ||
  !installedDirectCliDoctor.catalog?.catalog?.paths?.codexDir?.startsWith("@bundled/dist/.codex")
) {
  console.error("[smoke:installed-direct-cli-doctor] expected direct packaged CLI doctor to expose bundled diagnostics");
  process.exit(1);
}
const installedDirectCliDoctorContractImport = spawnSync(
  "node",
  [
    "-e",
    'const { createRequire } = require("node:module"); const { dirname, join } = require("node:path"); const { pathToFileURL } = require("node:url"); const pkgRequire = createRequire(process.cwd() + "/__codex_bees_smoke__.cjs"); import("codex-bees/doctor").then((m) => { const apiPath = pkgRequire.resolve("codex-bees"); const entryUrl = pathToFileURL(join(dirname(apiPath), "index.js")).href; const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeDoctorView(entryUrl); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliDoctor)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliDoctorContractImport.status !== 0 ||
  JSON.parse(installedDirectCliDoctorContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-doctor-contract] expected direct packaged CLI doctor output to match the runtime-doctor api surface");
  console.error(installedDirectCliDoctorContractImport.stderr || installedDirectCliDoctorContractImport.stdout);
  process.exit(installedDirectCliDoctorContractImport.status ?? 1);
}
const installedContract = JSON.parse(
  runInstalled("installed-contract", "npx", ["codex-bees", "contract"]).stdout
).contract;
if (
  installedContract.kind !== "runtime_contract_view" ||
  installedContract.contract?.product !== "codex-bees" ||
  installedContract.contract?.mode !== "codex-only" ||
  installedContract.contract?.transport?.mcp !== "stdio-jsonrpc"
) {
  console.error("[smoke:installed-contract] expected installed npx codex-bees contract view");
  process.exit(1);
}
const installedContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-contract").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeContractView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedContract)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedContractImport.status !== 0 ||
  JSON.parse(installedContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-contract-contract] expected installed contract output to match the runtime-contract api surface");
  console.error(installedContractImport.stderr || installedContractImport.stdout);
  process.exit(installedContractImport.status ?? 1);
}
const installedDirectCliContract = JSON.parse(
  runInstalled("installed-direct-cli-contract", "node", ["./node_modules/codex-bees/dist/index.js", "contract"]).stdout
).contract;
if (
  installedDirectCliContract.kind !== "runtime_contract_view" ||
  installedDirectCliContract.contract?.product !== "codex-bees" ||
  installedDirectCliContract.contract?.mode !== "codex-only" ||
  installedDirectCliContract.contract?.transport?.mcp !== "stdio-jsonrpc"
) {
  console.error("[smoke:installed-direct-cli-contract] expected direct packaged CLI contract output");
  process.exit(1);
}
const installedDirectCliContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-contract").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getRuntimeContractView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliContract)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliContractImport.status !== 0 ||
  JSON.parse(installedDirectCliContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-contract-contract] expected direct packaged CLI contract output to match the runtime-contract api surface");
  console.error(installedDirectCliContractImport.stderr || installedDirectCliContractImport.stdout);
  process.exit(installedDirectCliContractImport.status ?? 1);
}
const installedCliTools = JSON.parse(
  runInstalled("installed-tools", "npx", ["codex-bees", "tools"]).stdout
).tools;
if (
  installedCliTools.kind !== "tool_catalog_view" ||
  installedCliTools.recommendedReason !== "tool_catalog_loaded" ||
  installedCliTools.counts?.totalTools < 10 ||
  !installedCliTools.tools?.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:installed-tools] expected installed npx codex-bees tools catalog");
  process.exit(1);
}
const installedCliToolsContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getToolCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedCliTools)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCliToolsContractImport.status !== 0 ||
  JSON.parse(installedCliToolsContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-tools-contract] expected installed tools output to match the tool catalog api surface");
  console.error(installedCliToolsContractImport.stderr || installedCliToolsContractImport.stdout);
  process.exit(installedCliToolsContractImport.status ?? 1);
}
const installedCliCapabilities = JSON.parse(
  runInstalled("installed-capabilities", "npx", ["codex-bees", "capabilities"]).stdout
).capabilities;
if (
  installedCliCapabilities.kind !== "runtime_capabilities_view" ||
  installedCliCapabilities.recommendedReason !== "capabilities_loaded" ||
  installedCliCapabilities.counts?.totalCapabilities < 6 ||
  installedCliCapabilities.counts?.categories?.coordination < 1 ||
  !Array.isArray(installedCliCapabilities.capabilities) ||
  !installedCliCapabilities.capabilities.some((capability) => capability.id === "swarm_coordination")
) {
  console.error("[smoke:installed-capabilities] expected installed npx codex-bees capabilities surface");
  process.exit(1);
}
const installedCliCapabilitiesContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-status").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getCapabilityCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedCliCapabilities)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCliCapabilitiesContractImport.status !== 0 ||
  JSON.parse(installedCliCapabilitiesContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-capabilities-contract] expected installed capabilities output to match the runtime-status api surface");
  console.error(installedCliCapabilitiesContractImport.stderr || installedCliCapabilitiesContractImport.stdout);
  process.exit(installedCliCapabilitiesContractImport.status ?? 1);
}
const installedDirectCliTools = JSON.parse(
  runInstalled("installed-direct-cli-tools", "node", ["./node_modules/codex-bees/dist/index.js", "tools"]).stdout
).tools;
if (
  installedDirectCliTools.kind !== "tool_catalog_view" ||
  installedDirectCliTools.recommendedReason !== "tool_catalog_loaded" ||
  installedDirectCliTools.counts?.totalTools < 10 ||
  !installedDirectCliTools.tools?.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:installed-direct-cli-tools] expected direct packaged CLI tools catalog");
  process.exit(1);
}
const installedDirectCliToolsContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getToolCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliTools)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliToolsContractImport.status !== 0 ||
  JSON.parse(installedDirectCliToolsContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-tools-contract] expected direct packaged CLI tools output to match the tool catalog api surface");
  console.error(installedDirectCliToolsContractImport.stderr || installedDirectCliToolsContractImport.stdout);
  process.exit(installedDirectCliToolsContractImport.status ?? 1);
}
const installedDirectCliCapabilities = JSON.parse(
  runInstalled("installed-direct-cli-capabilities", "node", ["./node_modules/codex-bees/dist/index.js", "capabilities"]).stdout
).capabilities;
if (
  installedDirectCliCapabilities.kind !== "runtime_capabilities_view" ||
  installedDirectCliCapabilities.recommendedReason !== "capabilities_loaded" ||
  installedDirectCliCapabilities.counts?.totalCapabilities < 6 ||
  installedDirectCliCapabilities.counts?.categories?.coordination < 1 ||
  !Array.isArray(installedDirectCliCapabilities.capabilities) ||
  !installedDirectCliCapabilities.capabilities.some((capability) => capability.id === "swarm_coordination")
) {
  console.error("[smoke:installed-direct-cli-capabilities] expected direct packaged CLI capabilities surface");
  process.exit(1);
}
const installedDirectCliCapabilitiesContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-status").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getCapabilityCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliCapabilities)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliCapabilitiesContractImport.status !== 0 ||
  JSON.parse(installedDirectCliCapabilitiesContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-capabilities-contract] expected direct packaged CLI capabilities output to match the runtime-status api surface");
  console.error(installedDirectCliCapabilitiesContractImport.stderr || installedDirectCliCapabilitiesContractImport.stdout);
  process.exit(installedDirectCliCapabilitiesContractImport.status ?? 1);
}
const installedCliMcpTools = JSON.parse(
  runInstalled("installed-cli-mcp-tools", "npx", ["codex-bees", "mcp", "--tools"]).stdout
).tools;
if (
  installedCliMcpTools.kind !== "tool_catalog_view" ||
  installedCliMcpTools.recommendedReason !== "tool_catalog_loaded" ||
  installedCliMcpTools.counts?.totalTools < 10 ||
  !installedCliMcpTools.tools?.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:installed-cli-mcp-tools] expected installed codex-bees mcp --tools surface");
  process.exit(1);
}
const installedCliMcpToolsContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getToolCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedCliMcpTools)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCliMcpToolsContractImport.status !== 0 ||
  JSON.parse(installedCliMcpToolsContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-cli-mcp-tools-contract] expected installed mcp tools output to match the tool catalog api surface");
  console.error(installedCliMcpToolsContractImport.stderr || installedCliMcpToolsContractImport.stdout);
  process.exit(installedCliMcpToolsContractImport.status ?? 1);
}
const installedCliMcpCapabilities = JSON.parse(
  runInstalled("installed-cli-mcp-capabilities", "npx", ["codex-bees", "mcp", "--capabilities"]).stdout
).capabilities;
if (
  installedCliMcpCapabilities.kind !== "runtime_capabilities_view" ||
  installedCliMcpCapabilities.recommendedReason !== "capabilities_loaded" ||
  installedCliMcpCapabilities.counts?.totalCapabilities < 6 ||
  installedCliMcpCapabilities.counts?.categories?.coordination < 1 ||
  !Array.isArray(installedCliMcpCapabilities.capabilities) ||
  !installedCliMcpCapabilities.capabilities.some((capability) => capability.id === "swarm_coordination")
) {
  console.error("[smoke:installed-cli-mcp-capabilities] expected installed codex-bees mcp --capabilities surface");
  process.exit(1);
}
const installedCliMcpCapabilitiesContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-status").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getCapabilityCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedCliMcpCapabilities)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedCliMcpCapabilitiesContractImport.status !== 0 ||
  JSON.parse(installedCliMcpCapabilitiesContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-cli-mcp-capabilities-contract] expected installed mcp capabilities output to match the runtime-status api surface");
  console.error(installedCliMcpCapabilitiesContractImport.stderr || installedCliMcpCapabilitiesContractImport.stdout);
  process.exit(installedCliMcpCapabilitiesContractImport.status ?? 1);
}
const installedCliMcpStdioInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
].join("\n") + "\n";
const installedCliMcpStdio = spawnSync("npx", ["codex-bees", "mcp", "--stdio"], {
  cwd: packedInstallAppDir,
  input: installedCliMcpStdioInput,
  encoding: "utf8"
});
const installedCliMcpStdioLines = installedCliMcpStdio.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const installedCliMcpInitializePayload = JSON.parse(installedCliMcpStdioLines[0]).result;
const installedCliMcpToolsPayload = JSON.parse(installedCliMcpStdioLines[1]).result;
if (
  installedCliMcpStdio.status !== 0 ||
  installedCliMcpInitializePayload?.serverInfo?.name !== "codex-bees" ||
  installedCliMcpInitializePayload?.serverInfo?.version !== "0.1.0" ||
  !Array.isArray(installedCliMcpToolsPayload?.tools) ||
  !installedCliMcpToolsPayload.tools.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:installed-cli-mcp-stdio] expected installed codex-bees mcp --stdio to answer tools/list");
  console.error(installedCliMcpStdio.stderr || installedCliMcpStdio.stdout);
  process.exit(1);
}
const installedDirectMcpHelp = runInstalled("installed-direct-mcp-help", "node", ["./node_modules/codex-bees/dist/mcp.js", "--help"]);
if (
  !installedDirectMcpHelp.stdout.includes("codex-bees mcp") ||
  !installedDirectMcpHelp.stdout.includes("codex-bees mcp --stdio") ||
  !installedDirectMcpHelp.stdout.includes("codex-bees mcp --tools") ||
  !installedDirectMcpHelp.stdout.includes("codex-bees mcp --capabilities") ||
  !installedDirectMcpHelp.stdout.includes("codex-bees mcp --version")
) {
  console.error("[smoke:installed-direct-mcp-help] expected installed packaged MCP entrypoint help surface");
  process.exit(1);
}
const installedDirectMcpHelpImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/mcp").then((m) => console.log(JSON.stringify({ ok: m.renderMcpHelpText() === process.argv[1] && m.getMcpCommandCatalogView().options.some((option) => option.option === "--capabilities") && m.getMcpCommandCatalogView().counts.totalOptions >= 5 })))',
    installedDirectMcpHelp.stdout
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectMcpHelpImport.status !== 0 ||
  JSON.parse(installedDirectMcpHelpImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-mcp-help-contract] expected installed packaged MCP help output to match structured mcp command surface");
  console.error(installedDirectMcpHelpImport.stderr || installedDirectMcpHelpImport.stdout);
  process.exit(installedDirectMcpHelpImport.status ?? 1);
}
const installedDirectMcpVersion = runInstalled("installed-direct-mcp-version", "node", ["./node_modules/codex-bees/dist/mcp.js", "--version"]);
if (installedDirectMcpVersion.stdout.trim() !== "0.1.0") {
  console.error("[smoke:installed-direct-mcp-version] expected installed packaged MCP entrypoint version output");
  process.exit(1);
}
const installedDirectMcpCapabilities = JSON.parse(
  runInstalled("installed-direct-mcp-capabilities", "node", ["./node_modules/codex-bees/dist/mcp.js", "--capabilities"]).stdout
).capabilities;
if (
  installedDirectMcpCapabilities.kind !== "runtime_capabilities_view" ||
  installedDirectMcpCapabilities.recommendedReason !== "capabilities_loaded" ||
  installedDirectMcpCapabilities.counts?.totalCapabilities < 6 ||
  installedDirectMcpCapabilities.counts?.categories?.coordination < 1 ||
  !Array.isArray(installedDirectMcpCapabilities.capabilities) ||
  !installedDirectMcpCapabilities.capabilities.some((capability) => capability.id === "swarm_coordination")
) {
  console.error("[smoke:installed-direct-mcp-capabilities] expected installed packaged MCP entrypoint capabilities surface");
  process.exit(1);
}
const installedDirectMcpCapabilitiesContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-status").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getCapabilityCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectMcpCapabilities)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectMcpCapabilitiesContractImport.status !== 0 ||
  JSON.parse(installedDirectMcpCapabilitiesContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-mcp-capabilities-contract] expected direct packaged MCP capabilities output to match the runtime-status api surface");
  console.error(installedDirectMcpCapabilitiesContractImport.stderr || installedDirectMcpCapabilitiesContractImport.stdout);
  process.exit(installedDirectMcpCapabilitiesContractImport.status ?? 1);
}
const installedDirectMcpStdioInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
].join("\n") + "\n";
const installedDirectMcpStdio = spawnSync("node", ["./node_modules/codex-bees/dist/mcp.js", "--stdio"], {
  cwd: packedInstallAppDir,
  input: installedDirectMcpStdioInput,
  encoding: "utf8"
});
const installedDirectMcpStdioLines = installedDirectMcpStdio.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const installedDirectMcpInitializePayload = JSON.parse(installedDirectMcpStdioLines[0]).result;
const installedDirectMcpToolsPayload = JSON.parse(installedDirectMcpStdioLines[1]).result;
if (
  installedDirectMcpStdio.status !== 0 ||
  installedDirectMcpInitializePayload?.serverInfo?.name !== "codex-bees" ||
  installedDirectMcpInitializePayload?.serverInfo?.version !== "0.1.0" ||
  !Array.isArray(installedDirectMcpToolsPayload?.tools) ||
  !installedDirectMcpToolsPayload.tools.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:installed-direct-mcp-stdio] expected installed packaged MCP entrypoint --stdio to answer tools/list");
  console.error(installedDirectMcpStdio.stderr || installedDirectMcpStdio.stdout);
  process.exit(1);
}
const installedDirectMcpBad = spawnSync("node", ["./node_modules/codex-bees/dist/mcp.js", "nope"], {
  cwd: packedInstallAppDir,
  encoding: "utf8"
});
if (
  installedDirectMcpBad.status === 0 ||
  !installedDirectMcpBad.stderr.includes("Unknown mcp option: nope") ||
  installedDirectMcpBad.stderr.includes("at runMcpCli") ||
  installedDirectMcpBad.stderr.includes("Node.js v")
) {
  console.error("[smoke:installed-direct-mcp-bad] expected installed packaged MCP entrypoint to reject unknown options");
  console.error(installedDirectMcpBad.stderr || installedDirectMcpBad.stdout);
  process.exit(1);
}
const installedDirectCliMcpBad = spawnSync("node", ["./node_modules/codex-bees/dist/index.js", "mcp", "nope"], {
  cwd: packedInstallAppDir,
  encoding: "utf8"
});
if (
  installedDirectCliMcpBad.status === 0 ||
  !installedDirectCliMcpBad.stderr.includes("Unknown mcp option: nope") ||
  installedDirectCliMcpBad.stderr.includes("at runMcpCli")
) {
  console.error("[smoke:installed-direct-cli-mcp-bad] expected direct packaged CLI mcp route to reject unknown options without stack traces");
  console.error(installedDirectCliMcpBad.stderr || installedDirectCliMcpBad.stdout);
  process.exit(1);
}
const installedDirectCliMcpHelp = runInstalled("installed-direct-cli-mcp-help", "node", ["./node_modules/codex-bees/dist/index.js", "mcp", "--help"]);
if (
  !installedDirectCliMcpHelp.stdout.includes("codex-bees mcp") ||
  !installedDirectCliMcpHelp.stdout.includes("codex-bees mcp --stdio") ||
  !installedDirectCliMcpHelp.stdout.includes("codex-bees mcp --tools") ||
  !installedDirectCliMcpHelp.stdout.includes("codex-bees mcp --capabilities") ||
  !installedDirectCliMcpHelp.stdout.includes("codex-bees mcp --version")
) {
  console.error("[smoke:installed-direct-cli-mcp-help] expected direct packaged CLI mcp help surface");
  process.exit(1);
}
const installedDirectCliMcpHelpImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/mcp").then((m) => console.log(JSON.stringify({ ok: m.renderMcpHelpText() === process.argv[1] && m.getMcpCommandCatalogView().options.some((option) => option.option === "--capabilities") && m.getMcpCommandCatalogView().counts.totalOptions >= 5 })))',
    installedDirectCliMcpHelp.stdout
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliMcpHelpImport.status !== 0 ||
  JSON.parse(installedDirectCliMcpHelpImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-mcp-help-contract] expected direct packaged CLI mcp help output to match structured mcp command surface");
  console.error(installedDirectCliMcpHelpImport.stderr || installedDirectCliMcpHelpImport.stdout);
  process.exit(installedDirectCliMcpHelpImport.status ?? 1);
}
const installedDirectCliMcpVersion = runInstalled("installed-direct-cli-mcp-version", "node", ["./node_modules/codex-bees/dist/index.js", "mcp", "--version"]);
if (installedDirectCliMcpVersion.stdout.trim() !== "0.1.0") {
  console.error("[smoke:installed-direct-cli-mcp-version] expected direct packaged CLI mcp version output");
  process.exit(1);
}
const installedDirectCliMcpTools = JSON.parse(
  runInstalled("installed-direct-cli-mcp-tools", "node", ["./node_modules/codex-bees/dist/index.js", "mcp", "--tools"]).stdout
).tools;
if (
  installedDirectCliMcpTools.kind !== "tool_catalog_view" ||
  installedDirectCliMcpTools.recommendedReason !== "tool_catalog_loaded" ||
  installedDirectCliMcpTools.counts?.totalTools < 10 ||
  !installedDirectCliMcpTools.tools?.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:installed-direct-cli-mcp-tools] expected direct packaged CLI mcp tools surface");
  process.exit(1);
}
const installedDirectCliMcpToolsContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getToolCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliMcpTools)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliMcpToolsContractImport.status !== 0 ||
  JSON.parse(installedDirectCliMcpToolsContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-mcp-tools-contract] expected direct packaged CLI mcp tools output to match the tool catalog api surface");
  console.error(installedDirectCliMcpToolsContractImport.stderr || installedDirectCliMcpToolsContractImport.stdout);
  process.exit(installedDirectCliMcpToolsContractImport.status ?? 1);
}
const installedDirectCliMcpCapabilities = JSON.parse(
  runInstalled("installed-direct-cli-mcp-capabilities", "node", ["./node_modules/codex-bees/dist/index.js", "mcp", "--capabilities"]).stdout
).capabilities;
if (
  installedDirectCliMcpCapabilities.kind !== "runtime_capabilities_view" ||
  installedDirectCliMcpCapabilities.recommendedReason !== "capabilities_loaded" ||
  installedDirectCliMcpCapabilities.counts?.totalCapabilities < 6 ||
  installedDirectCliMcpCapabilities.counts?.categories?.coordination < 1 ||
  !Array.isArray(installedDirectCliMcpCapabilities.capabilities) ||
  !installedDirectCliMcpCapabilities.capabilities.some((capability) => capability.id === "swarm_coordination")
) {
  console.error("[smoke:installed-direct-cli-mcp-capabilities] expected direct packaged CLI mcp capabilities surface");
  process.exit(1);
}
const installedDirectCliMcpCapabilitiesContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees/runtime-status").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getCapabilityCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedDirectCliMcpCapabilities)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedDirectCliMcpCapabilitiesContractImport.status !== 0 ||
  JSON.parse(installedDirectCliMcpCapabilitiesContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-cli-mcp-capabilities-contract] expected direct packaged CLI mcp capabilities output to match the runtime-status api surface");
  console.error(installedDirectCliMcpCapabilitiesContractImport.stderr || installedDirectCliMcpCapabilitiesContractImport.stdout);
  process.exit(installedDirectCliMcpCapabilitiesContractImport.status ?? 1);
}
const installedDirectCliMcpStdioInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
].join("\n") + "\n";
const installedDirectCliMcpStdio = spawnSync("node", ["./node_modules/codex-bees/dist/index.js", "mcp", "--stdio"], {
  cwd: packedInstallAppDir,
  input: installedDirectCliMcpStdioInput,
  encoding: "utf8"
});
const installedDirectCliMcpStdioLines = installedDirectCliMcpStdio.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const installedDirectCliMcpInitializePayload = JSON.parse(installedDirectCliMcpStdioLines[0]).result;
const installedDirectCliMcpToolsPayload = JSON.parse(installedDirectCliMcpStdioLines[1]).result;
if (
  installedDirectCliMcpStdio.status !== 0 ||
  installedDirectCliMcpInitializePayload?.serverInfo?.name !== "codex-bees" ||
  installedDirectCliMcpInitializePayload?.serverInfo?.version !== "0.1.0" ||
  !Array.isArray(installedDirectCliMcpToolsPayload?.tools) ||
  !installedDirectCliMcpToolsPayload.tools.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:installed-direct-cli-mcp-stdio] expected direct packaged CLI mcp --stdio to answer tools/list");
  console.error(installedDirectCliMcpStdio.stderr || installedDirectCliMcpStdio.stdout);
  process.exit(1);
}
const installedMcpTools = JSON.parse(
  runInstalled("installed-mcp-tools", "node", ["./node_modules/codex-bees/dist/mcp.js", "--tools"]).stdout
).tools;
if (
  installedMcpTools.kind !== "tool_catalog_view" ||
  installedMcpTools.recommendedReason !== "tool_catalog_loaded" ||
  installedMcpTools.counts?.totalTools < 10 ||
  !installedMcpTools.tools?.some((tool) => tool.name === "task_add")
) {
  console.error("[smoke:installed-mcp-tools] expected installed packaged MCP tool catalog");
  process.exit(1);
}
const installedMcpToolsContractImport = spawnSync(
  "node",
  [
    "-e",
    'import("codex-bees").then((m) => { const actual = JSON.parse(process.argv[1]); const expected = m.getToolCatalogView(); console.log(JSON.stringify({ ok: JSON.stringify(actual) === JSON.stringify(expected) })); })',
    JSON.stringify(installedMcpTools)
  ],
  {
    cwd: packedInstallAppDir,
    encoding: "utf8"
  }
);
if (
  installedMcpToolsContractImport.status !== 0 ||
  JSON.parse(installedMcpToolsContractImport.stdout).ok !== true
) {
  console.error("[smoke:installed-direct-mcp-tools-contract] expected direct packaged mcp tools output to match the tool catalog api surface");
  console.error(installedMcpToolsContractImport.stderr || installedMcpToolsContractImport.stdout);
  process.exit(installedMcpToolsContractImport.status ?? 1);
}
rmSync(packedTarballPath, { force: true });
const doctorView = JSON.parse(run("doctor-verify", ["./src/index.js", "doctor"]).stdout);
if (
  doctorView.kind !== "runtime_doctor_view" ||
  doctorView.recommendedReason !== "doctor_ready" ||
  doctorView.status !== "ok" ||
  doctorView.executable !== true ||
  doctorView.catalog?.kind !== "runtime_catalog_view" ||
  doctorView.contract?.kind !== "runtime_contract_view" ||
  doctorView.contract?.recommendedReason !== "contract_loaded" ||
  doctorView.contract?.counts?.architectureLayers !== 5 ||
  doctorView.contract?.contract?.deliveryBoundary !== "codex-only runtime" ||
  doctorView.contract?.contract?.transport?.mcp !== "stdio-jsonrpc"
) {
  console.error("[smoke:doctor] expected runtime doctor and contract views");
  process.exit(1);
}
const runtimeReadyView = JSON.parse(run("run-verify", ["./src/index.js", "run"]).stdout);
if (
  runtimeReadyView.kind !== "runtime_ready_view" ||
  runtimeReadyView.recommendedReason !== "runtime_entry_ready" ||
  runtimeReadyView.status !== "ready" ||
  runtimeReadyView.counts?.nextSteps !== 6 ||
  runtimeReadyView.contract?.kind !== "runtime_contract_view" ||
  runtimeReadyView.next?.[0] !== "use `codex-bees init` to materialize the shipped .codex project assets"
) {
  console.error("[smoke:run] expected runtime readiness view");
  process.exit(1);
}
const cliReadyView = JSON.parse(run("ready-verify", ["./src/index.js", "ready"]).stdout).ready;
if (
  cliReadyView.kind !== "runtime_ready_view" ||
  cliReadyView.recommendedReason !== "runtime_entry_ready" ||
  cliReadyView.status !== "ready" ||
  cliReadyView.contract?.kind !== "runtime_contract_view"
) {
  console.error("[smoke:ready] expected explicit runtime readiness view");
  process.exit(1);
}
const cliCommandsView = JSON.parse(run("commands-verify", ["./src/index.js", "commands"]).stdout).commands;
if (
  cliCommandsView.kind !== "command_catalog_view" ||
  cliCommandsView.recommendedReason !== "command_catalog_loaded" ||
  cliCommandsView.counts?.totalCommands < 10 ||
  !cliCommandsView.commands?.some((entry) => entry.command === "mcp")
) {
  console.error("[smoke:commands] expected command catalog view");
  process.exit(1);
}
const requiredCliCatalogCommands = ["plan:swarm:queue", "swarm:overview", "swarm:dispatch", "swarm:sync"];
if (!requiredCliCatalogCommands.every((command) => cliCommandsView.commands?.some((entry) => entry.command === command))) {
  console.error("[smoke:commands-parity] expected command catalog to include shipped swarm and planner commands");
  process.exit(1);
}
const cliDispatchCommands = getCliSwitchCommands();
const commandCatalogCommands = cliCommandsView.commands.map((entry) => entry.command);
const missingCatalogCommands = cliDispatchCommands.filter((command) => !commandCatalogCommands.includes(command));
const undocumentedDispatchCommands = commandCatalogCommands.filter((command) => !cliDispatchCommands.includes(command));
if (missingCatalogCommands.length > 0 || undocumentedDispatchCommands.length > 0) {
  console.error("[smoke:commands-parity-source] expected command catalog to match the CLI dispatch switch");
  console.error(JSON.stringify({ missingCatalogCommands, undocumentedDispatchCommands }, null, 2));
  process.exit(1);
}
const cliCommandView = JSON.parse(
  run("command-get-verify", ["./src/index.js", "command:get", "--name", "init"]).stdout
).command;
if (
  cliCommandView.kind !== "command_catalog_entry_view" ||
  cliCommandView.recommendedReason !== "command_catalog_entry_loaded" ||
  cliCommandView.matchedCommand !== "init" ||
  cliCommandView.entry?.command !== "init"
) {
  console.error("[smoke:command-get] expected single CLI command view");
  process.exit(1);
}
const cliCommandHelpView = JSON.parse(
  run("command-help-verify", ["./src/index.js", "command:help", "--name", "status"]).stdout
).help;
if (
  cliCommandHelpView.kind !== "command_help_view" ||
  cliCommandHelpView.recommendedReason !== "command_help_loaded" ||
  cliCommandHelpView.matchedCommand !== "status" ||
  !cliCommandHelpView.text?.includes("codex-bees status") ||
  !cliCommandHelpView.text?.includes("Description:")
) {
  console.error("[smoke:command-help] expected single CLI command help view");
  process.exit(1);
}
const cliTaskAddHelpView = JSON.parse(
  run("command-help-task-add", ["./src/index.js", "command:help", "--name", "task:add"]).stdout
).help;
if (
  cliTaskAddHelpView.matchedCommand !== "task:add" ||
  !cliTaskAddHelpView.text?.includes("--title <title>") ||
  !cliTaskAddHelpView.text?.includes("--acceptance <item|item>") ||
  !cliTaskAddHelpView.text?.includes("Pipe-delimited")
) {
  console.error("[smoke:command-help-task-add] expected detailed task:add help view");
  process.exit(1);
}
const cliInitOptionView = JSON.parse(
  run("init-option-verify", ["./src/index.js", "init:option", "--option", "--preview"]).stdout
).option;
const cliInitOptionsView = JSON.parse(
  run("init-options-verify", ["./src/index.js", "init:options"]).stdout
).options;
if (
  cliInitOptionsView.kind !== "init_command_catalog_view" ||
  cliInitOptionsView.recommendedReason !== "init_command_catalog_loaded" ||
  cliInitOptionsView.counts?.totalOptions < 3 ||
  !cliInitOptionsView.options?.some((option) => option.option === "--preview")
) {
  console.error("[smoke:init-options] expected init option catalog view");
  process.exit(1);
}
if (
  cliInitOptionView.kind !== "init_command_option_view" ||
  cliInitOptionView.recommendedReason !== "init_command_option_loaded" ||
  cliInitOptionView.matchedOption !== "--preview" ||
  cliInitOptionView.entry?.option !== "--preview"
) {
  console.error("[smoke:init-option] expected single init option view");
  process.exit(1);
}
const cliInitHelpView = JSON.parse(
  run("init-help-view-verify", ["./src/index.js", "init:help", "--option", "--preview"]).stdout
).help;
if (
  cliInitHelpView.kind !== "init_help_view" ||
  cliInitHelpView.recommendedReason !== "init_help_loaded" ||
  cliInitHelpView.matchedOption !== "--preview" ||
  !cliInitHelpView.text?.includes("codex-bees init")
) {
  console.error("[smoke:init-help-view] expected single init help view");
  process.exit(1);
}
const cliMcpOptionView = JSON.parse(
  run("mcp-option-verify", ["./src/index.js", "mcp:option", "--option", "--tools"]).stdout
).option;
const cliMcpOptionsView = JSON.parse(
  run("mcp-options-verify", ["./src/index.js", "mcp:options"]).stdout
).options;
if (
  cliMcpOptionsView.kind !== "mcp_command_catalog_view" ||
  cliMcpOptionsView.recommendedReason !== "mcp_command_catalog_loaded" ||
  cliMcpOptionsView.counts?.totalOptions < 5 ||
  !cliMcpOptionsView.options?.some((option) => option.option === "--tools")
) {
  console.error("[smoke:mcp-options] expected mcp option catalog view");
  process.exit(1);
}
if (
  cliMcpOptionView.kind !== "mcp_command_option_view" ||
  cliMcpOptionView.recommendedReason !== "mcp_command_option_loaded" ||
  cliMcpOptionView.matchedOption !== "--tools" ||
  cliMcpOptionView.entry?.option !== "--tools"
) {
  console.error("[smoke:mcp-option] expected single mcp option view");
  process.exit(1);
}
const cliMcpHelpView = JSON.parse(
  run("mcp-help-view-verify", ["./src/index.js", "mcp:help", "--option", "--tools"]).stdout
).help;
if (
  cliMcpHelpView.kind !== "mcp_help_view" ||
  cliMcpHelpView.recommendedReason !== "mcp_help_loaded" ||
  cliMcpHelpView.matchedOption !== "--tools" ||
  !cliMcpHelpView.text?.includes("codex-bees mcp --tools")
) {
  console.error("[smoke:mcp-help-view] expected single mcp help view");
  process.exit(1);
}
const cliToolsView = JSON.parse(run("tools-cli-verify", ["./src/index.js", "tools"]).stdout).tools;
if (
  cliToolsView.kind !== "tool_catalog_view" ||
  cliToolsView.recommendedReason !== "tool_catalog_loaded" ||
  cliToolsView.counts?.totalTools < 10 ||
  cliToolsView.counts?.groups?.runtime < 1 ||
  !Array.isArray(cliToolsView.tools) ||
  !cliToolsView.tools.some((tool) => tool.name === "runtime_contract")
) {
  console.error("[smoke:tools-cli] expected tool catalog view");
  process.exit(1);
}
const cliCatalogAgents = JSON.parse(run("catalog-agents-verify", ["./src/index.js", "catalog:agents"]).stdout).agents;
if (
  cliCatalogAgents.kind !== "runtime_catalog_lane_view" ||
  cliCatalogAgents.recommendedReason !== "catalog_lane_loaded" ||
  cliCatalogAgents.entryType !== "agent" ||
  cliCatalogAgents.counts?.totalEntries < 1 ||
  !cliCatalogAgents.entries?.some((entry) => entry.id === "executor")
) {
  console.error("[smoke:catalog-agents] expected agent catalog listing");
  process.exit(1);
}
const cliCatalogSkills = JSON.parse(run("catalog-skills-verify", ["./src/index.js", "catalog:skills"]).stdout).skills;
if (
  cliCatalogSkills.kind !== "runtime_catalog_lane_view" ||
  cliCatalogSkills.recommendedReason !== "catalog_lane_loaded" ||
  cliCatalogSkills.entryType !== "skill" ||
  cliCatalogSkills.counts?.totalEntries < 1 ||
  !cliCatalogSkills.entries?.some((entry) => entry.id === "project-development")
) {
  console.error("[smoke:catalog-skills] expected skill catalog listing");
  process.exit(1);
}
const cliGuidanceOverview = JSON.parse(run("guidance-overview-verify", ["./src/index.js", "guidance:overview"]).stdout).overview;
if (
  cliGuidanceOverview.kind !== "coordination_overview_view" ||
  cliGuidanceOverview.recommendedReason !== "coordination_model_loaded" ||
  cliGuidanceOverview.overview?.deliveryBoundary !== "codex-only runtime"
) {
  console.error("[smoke:guidance-overview] expected coordination overview view");
  process.exit(1);
}
const cliGuidanceWorker = JSON.parse(run("guidance-worker-verify", ["./src/index.js", "guidance:worker"]).stdout).guidelines;
if (
  cliGuidanceWorker.kind !== "worker_guidelines_view" ||
  cliGuidanceWorker.recommendedReason !== "worker_guidelines_loaded" ||
  cliGuidanceWorker.guidelines?.fileOwnership !== "one active writer per file"
) {
  console.error("[smoke:guidance-worker] expected worker guidance view");
  process.exit(1);
}
const cliContractView = JSON.parse(run("contract-verify", ["./src/index.js", "contract"]).stdout).contract;
if (
  cliContractView.kind !== "runtime_contract_view" ||
  cliContractView.recommendedReason !== "contract_loaded" ||
  cliContractView.contract?.mode !== "codex-only" ||
  cliContractView.contract?.transport?.mcp !== "stdio-jsonrpc"
) {
  console.error("[smoke:contract] expected runtime contract view");
  process.exit(1);
}
const cliToolView = JSON.parse(
  run("tools-cli-get-verify", ["./src/index.js", "tools:get", "--name", "runtime_contract"]).stdout
).tool;
if (
  cliToolView.kind !== "mcp_tool_view" ||
  cliToolView.recommendedReason !== "mcp_tool_loaded" ||
  cliToolView.matchedTool !== "runtime_contract" ||
  cliToolView.tool?.name !== "runtime_contract"
) {
  console.error("[smoke:tools-cli-get] expected single MCP tool view");
  process.exit(1);
}
const cliStatusWithToolsFlag = JSON.parse(
  run("status-tools-flag", ["./src/index.js", "status", "--tools"]).stdout
).status;
if (
  cliStatusWithToolsFlag.kind !== "runtime_status_view" ||
  cliStatusWithToolsFlag.recommendedReason !== "runtime_state_visible" ||
  cliStatusWithToolsFlag.status?.product !== "codex-bees"
) {
  console.error("[smoke:cli-flag-isolation] expected non-mcp commands to ignore the MCP --tools flag path");
  process.exit(1);
}
const mcpToolsView = JSON.parse(run("tools-mcp-verify", ["./src/mcp.js", "--tools"]).stdout).tools;
if (
  mcpToolsView.kind !== "tool_catalog_view" ||
  mcpToolsView.recommendedReason !== "tool_catalog_loaded" ||
  mcpToolsView.counts?.totalTools < 10 ||
  mcpToolsView.counts?.groups?.task < 1 ||
  !Array.isArray(mcpToolsView.tools) ||
  !mcpToolsView.tools.some((tool) => tool.name === "task_add")
) {
  console.error("[smoke:tools-mcp] expected MCP tool catalog view");
  process.exit(1);
}
const runtimeStatus = JSON.parse(run("status-verify", ["./src/index.js", "status"]).stdout).status;
if (
  runtimeStatus.kind !== "runtime_status_view" ||
  runtimeStatus.recommendedReason !== "runtime_state_visible" ||
  runtimeStatus.counts?.agents !== 4 ||
  runtimeStatus.counts?.skills !== 2 ||
  runtimeStatus.counts?.capabilities < 6 ||
  runtimeStatus.counts?.trackedStateEntries !==
    (runtimeStatus.status?.counts?.tasks ?? 0) +
    (runtimeStatus.status?.counts?.swarms ?? 0) +
    (runtimeStatus.status?.counts?.memories ?? 0) ||
  runtimeStatus.status?.product !== "codex-bees" ||
  !Array.isArray(runtimeStatus.status?.highlights) ||
  !runtimeStatus.status.highlights.includes("runtime:queue-pack recommends launch context before raw leader queue review") ||
  runtimeStatus.status?.recommendedEntryPoints?.cli?.[0] !== "leader:assignment-launch-plan" ||
  runtimeStatus.status?.recommendedEntryPoints?.mcp?.[0] !== "leader_assignment_launch_plan" ||
  !Array.isArray(runtimeStatus.status?.useCases) ||
  !runtimeStatus.status.useCases.includes("bring multiple workers online in leader-defined order")
) {
  console.error("[smoke:status] expected runtime summary counts, highlights, recommended entrypoints, and use cases");
  process.exit(1);
}
const runtimeCapabilities = JSON.parse(run("capabilities-verify", ["./src/index.js", "capabilities"]).stdout).capabilities;
if (
  runtimeCapabilities.kind !== "runtime_capabilities_view" ||
  runtimeCapabilities.recommendedReason !== "capabilities_loaded" ||
  runtimeCapabilities.counts?.totalCapabilities < 6 ||
  runtimeCapabilities.counts?.categories?.coordination < 1 ||
  !Array.isArray(runtimeCapabilities.capabilities) ||
  !runtimeCapabilities.capabilities.some((capability) => capability.id === "swarm_coordination") ||
  !runtimeCapabilities.capabilities.some((capability) => capability.id === "runtime_catalog") ||
  !runtimeCapabilities.capabilities.find((capability) => capability.id === "memory")?.mcpTools?.includes("memory_get") ||
  !runtimeCapabilities.capabilities.find((capability) => capability.id === "runtime_catalog")?.highlights?.includes("runtime:queue-pack recommends launch context before raw leader queue review") ||
  !runtimeCapabilities.capabilities.find((capability) => capability.id === "leader_orchestration")?.highlights?.includes("assignment-launch-plan provides ordered worker startup steps") ||
  runtimeCapabilities.capabilities.find((capability) => capability.id === "runtime_catalog")?.preferredEntryPoints?.cli?.[0] !== "status" ||
  runtimeCapabilities.capabilities.find((capability) => capability.id === "leader_orchestration")?.preferredEntryPoints?.mcp?.[0] !== "leader_assignment_launch_plan" ||
  !runtimeCapabilities.capabilities.find((capability) => capability.id === "runtime_catalog")?.useCases?.includes("probe the runtime surface before choosing deeper orchestration tools") ||
  !runtimeCapabilities.capabilities.find((capability) => capability.id === "leader_orchestration")?.useCases?.includes("bring multiple workers online in leader-defined order")
) {
  console.error("[smoke:capabilities] expected runtime capability inventory");
  process.exit(1);
}
const runtimeCapabilityView = JSON.parse(
  run("capabilities-get-verify", ["./src/index.js", "capabilities:get", "--id", "memory"]).stdout
).capability;
if (
  runtimeCapabilityView.kind !== "runtime_capability_view" ||
  runtimeCapabilityView.recommendedReason !== "runtime_capability_loaded" ||
  runtimeCapabilityView.matchedCapability !== "memory" ||
  runtimeCapabilityView.capability?.id !== "memory" ||
  !runtimeCapabilityView.capability?.cliCommands?.includes("memory:get") ||
  !runtimeCapabilityView.capability?.mcpTools?.includes("memory_get")
) {
  console.error("[smoke:capabilities-get] expected runtime capability detail view");
  process.exit(1);
}
const runtimeActivityInitial = JSON.parse(
  run("runtime-activity-initial", ["./src/index.js", "runtime:activity"]).stdout
).activity;
if (
  runtimeActivityInitial.recommendedReason !== "review_event_latest" ||
  runtimeActivityInitial.kind !== "runtime_activity" ||
  runtimeActivityInitial.next?.type !== "approved" ||
  runtimeActivityInitial.next?.taskId !== "task-3" ||
  !Array.isArray(runtimeActivityInitial.entries)
) {
  console.error("[smoke:runtime-activity] expected top-level runtime activity");
  process.exit(1);
}
const runtimeAlertsInitial = JSON.parse(
  run("runtime-alerts-initial", ["./src/index.js", "runtime:alerts"]).stdout
).alerts;
if (
  runtimeAlertsInitial.recommendedReason !== "no_alerts_active" ||
  runtimeAlertsInitial.kind !== "runtime_alerts" ||
  runtimeAlertsInitial.counts?.total !== 0 ||
  runtimeAlertsInitial.alerts?.length !== 0
) {
  console.error("[smoke:runtime-alerts] expected top-level runtime alerts");
  process.exit(1);
}
const runtimeCloseoutInitial = JSON.parse(
  run("runtime-closeout-initial", ["./src/index.js", "runtime:closeout"]).stdout
).closeout;
if (
  runtimeCloseoutInitial.kind !== "runtime_closeout" ||
  runtimeCloseoutInitial.recommendedReason !== "approved_task_ready" ||
  !Array.isArray(runtimeCloseoutInitial.tasks) ||
  !Array.isArray(runtimeCloseoutInitial.swarms) ||
  runtimeCloseoutInitial.counts?.tasksReady < 1 ||
  runtimeCloseoutInitial.tasks?.some((entry) => entry.taskId === "task-3" && entry.reviewOutcome === "approved") !== true
) {
  console.error("[smoke:runtime-closeout] expected top-level runtime closeout");
  process.exit(1);
}
const runtimeCloseoutPackInitial = JSON.parse(
  run("runtime-closeout-pack-initial", ["./src/index.js", "runtime:closeout-pack"]).stdout
).closeoutPack;
if (
  runtimeCloseoutPackInitial.kind !== "runtime_closeout_pack" ||
  !runtimeCloseoutPackInitial.recommendedSurface ||
  typeof runtimeCloseoutPackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeCloseoutPackInitial.overview ||
  !runtimeCloseoutPackInitial.surfaces
) {
  console.error("[smoke:runtime-closeout-pack] expected top-level runtime closeout pack");
  process.exit(1);
}
const runtimeDashboardInitial = JSON.parse(
  run("runtime-dashboard-initial", ["./src/index.js", "runtime:dashboard"]).stdout
).dashboard;
if (
  runtimeDashboardInitial.kind !== "runtime_dashboard" ||
  runtimeDashboardInitial.recommendedReason !== "empty_dashboard" ||
  runtimeDashboardInitial.counts?.tasks < 3 ||
  runtimeDashboardInitial.leader?.queue?.kind !== "leader_queue"
) {
  console.error("[smoke:runtime-dashboard] expected top-level runtime dashboard");
  process.exit(1);
}
const runtimeDispatchInitial = JSON.parse(
  run("runtime-dispatch-initial", ["./src/index.js", "runtime:dispatch"]).stdout
).dispatch;
if (
  runtimeDispatchInitial.recommendedReason !== "no_dispatch_ready" ||
  runtimeDispatchInitial.kind !== "runtime_dispatch" ||
  !Array.isArray(runtimeDispatchInitial.groups)
) {
  console.error("[smoke:runtime-dispatch] expected top-level runtime dispatch");
  process.exit(1);
}
const runtimeDispatchPackInitial = JSON.parse(
  run("runtime-dispatch-pack-initial", ["./src/index.js", "runtime:dispatch-pack"]).stdout
).dispatchPack;
if (
  runtimeDispatchPackInitial.kind !== "runtime_dispatch_pack" ||
  !runtimeDispatchPackInitial.recommendedSurface ||
  typeof runtimeDispatchPackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeDispatchPackInitial.overview ||
  !runtimeDispatchPackInitial.surfaces
) {
  console.error("[smoke:runtime-dispatch-pack] expected top-level runtime dispatch pack");
  process.exit(1);
}
const runtimeFocusInitial = JSON.parse(
  run("runtime-focus-initial", ["./src/index.js", "runtime:focus"]).stdout
).focus;
if (
  runtimeFocusInitial.kind !== "runtime_focus" ||
  runtimeFocusInitial.recommendedReason !== "role_focus_priority" ||
  !runtimeFocusInitial.focus
) {
  console.error("[smoke:runtime-focus] expected top-level runtime focus");
  process.exit(1);
}
const runtimeQueuePackInitial = JSON.parse(
  run("runtime-queue-pack-initial", ["./src/index.js", "runtime:queue-pack"]).stdout
).queuePack;
if (
  runtimeQueuePackInitial.kind !== "runtime_queue_pack" ||
  !runtimeQueuePackInitial.recommendedSurface ||
  typeof runtimeQueuePackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeQueuePackInitial.overview ||
  !runtimeQueuePackInitial.surfaces
) {
  console.error("[smoke:runtime-queue-pack] expected top-level runtime queue pack");
  process.exit(1);
}
const runtimeHandoffsInitial = JSON.parse(
  run("runtime-handoffs-initial", ["./src/index.js", "runtime:handoffs"]).stdout
).handoffs;
if (
  runtimeHandoffsInitial.recommendedReason !== "owner_claim_ready" ||
  runtimeHandoffsInitial.kind !== "runtime_handoffs" ||
  runtimeHandoffsInitial.counts?.actorGroups !== 2 ||
  runtimeHandoffsInitial.counts?.totalHandoffs !== 2 ||
  runtimeHandoffsInitial.next?.taskId !== "task-2" ||
  runtimeHandoffsInitial.next?.actor?.id !== "executor" ||
  !Array.isArray(runtimeHandoffsInitial.groups)
) {
  console.error("[smoke:runtime-handoffs] expected top-level runtime handoffs");
  process.exit(1);
}
const runtimeRecoveryInitial = JSON.parse(
  run("runtime-recovery-initial", ["./src/index.js", "runtime:recovery"]).stdout
).recovery;
if (
  runtimeRecoveryInitial.kind !== "runtime_recovery" ||
  runtimeRecoveryInitial.recommendedReason !== "no_recovery_needed" ||
  !Array.isArray(runtimeRecoveryInitial.groups) ||
  runtimeRecoveryInitial.counts?.totalEntries !== 0 ||
  runtimeRecoveryInitial.next !== null
) {
  console.error("[smoke:runtime-recovery] expected top-level runtime recovery");
  process.exit(1);
}
const runtimeRecoveryPackInitial = JSON.parse(
  run("runtime-recovery-pack-initial", ["./src/index.js", "runtime:recovery-pack"]).stdout
).recoveryPack;
if (
  runtimeRecoveryPackInitial.kind !== "runtime_recovery_pack" ||
  !runtimeRecoveryPackInitial.recommendedSurface ||
  typeof runtimeRecoveryPackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeRecoveryPackInitial.overview ||
  !runtimeRecoveryPackInitial.surfaces
) {
  console.error("[smoke:runtime-recovery-pack] expected top-level runtime recovery pack");
  process.exit(1);
}
const runtimeSummaryPackInitial = JSON.parse(
  run("runtime-summary-pack-initial", ["./src/index.js", "runtime:summary-pack"]).stdout
).summaryPack;
if (
  runtimeSummaryPackInitial.kind !== "runtime_summary_pack" ||
  !runtimeSummaryPackInitial.recommendedSurface ||
  typeof runtimeSummaryPackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeSummaryPackInitial.focus ||
  !runtimeSummaryPackInitial.overview
) {
  console.error("[smoke:runtime-summary-pack] expected top-level runtime summary pack");
  process.exit(1);
}
const runtimeLeaderPackInitial = JSON.parse(
  run("runtime-leader-pack-initial", ["./src/index.js", "runtime:leader-pack"]).stdout
).leaderPack;
if (
  runtimeLeaderPackInitial.kind !== "runtime_leader_pack" ||
  !runtimeLeaderPackInitial.recommendedSurface ||
  typeof runtimeLeaderPackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeLeaderPackInitial.overview ||
  !runtimeLeaderPackInitial.surfaces
) {
  console.error("[smoke:runtime-leader-pack] expected top-level runtime leader pack");
  process.exit(1);
}
const runtimeOperatorPackInitial = JSON.parse(
  run("runtime-operator-pack-initial", ["./src/index.js", "runtime:operator-pack"]).stdout
).operatorPack;
if (
  runtimeOperatorPackInitial.kind !== "runtime_operator_pack" ||
  !runtimeOperatorPackInitial.recommendedSurface ||
  typeof runtimeOperatorPackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeOperatorPackInitial.overview ||
  !runtimeOperatorPackInitial.surfaces
) {
  console.error("[smoke:runtime-operator-pack] expected top-level runtime operator pack");
  process.exit(1);
}
const runtimeControlPackInitial = JSON.parse(
  run("runtime-control-pack-initial", ["./src/index.js", "runtime:control-pack"]).stdout
).controlPack;
if (
  runtimeControlPackInitial.kind !== "runtime_control_pack" ||
  !runtimeControlPackInitial.recommendedSurface ||
  !runtimeControlPackInitial.overview ||
  !runtimeControlPackInitial.surfaces
) {
  console.error("[smoke:runtime-control-pack] expected top-level runtime control pack");
  process.exit(1);
}
const runtimeSignalPackInitial = JSON.parse(
  run("runtime-signal-pack-initial", ["./src/index.js", "runtime:signal-pack"]).stdout
).signalPack;
if (
  runtimeSignalPackInitial.kind !== "runtime_signal_pack" ||
  !runtimeSignalPackInitial.recommendedSurface ||
  !runtimeSignalPackInitial.overview ||
  !runtimeSignalPackInitial.surfaces
) {
  console.error("[smoke:runtime-signal-pack] expected top-level runtime signal pack");
  process.exit(1);
}
const runtimeHandoffPackInitial = JSON.parse(
  run("runtime-handoff-pack-initial", ["./src/index.js", "runtime:handoff-pack"]).stdout
).handoffPack;
if (
  runtimeHandoffPackInitial.kind !== "runtime_handoff_pack" ||
  !runtimeHandoffPackInitial.recommendedSurface ||
  !runtimeHandoffPackInitial.overview ||
  !runtimeHandoffPackInitial.surfaces
) {
  console.error("[smoke:runtime-handoff-pack] expected top-level runtime handoff pack");
  process.exit(1);
}
const runtimeTriagePackInitial = JSON.parse(
  run("runtime-triage-pack-initial", ["./src/index.js", "runtime:triage-pack"]).stdout
).triagePack;
if (
  runtimeTriagePackInitial.kind !== "runtime_triage_pack" ||
  !runtimeTriagePackInitial.recommendedSurface ||
  !runtimeTriagePackInitial.overview ||
  !runtimeTriagePackInitial.surfaces
) {
  console.error("[smoke:runtime-triage-pack] expected top-level runtime triage pack");
  process.exit(1);
}
const runtimeSessionPackInitial = JSON.parse(
  run("runtime-session-pack-initial", ["./src/index.js", "runtime:session-pack", "--role", "executor", "--worker", "review-worker"]).stdout
).sessionPack;
if (
  runtimeSessionPackInitial.kind !== "runtime_session_pack" ||
  !runtimeSessionPackInitial.recommendedSurface ||
  !runtimeSessionPackInitial.overview ||
  !runtimeSessionPackInitial.surfaces
) {
  console.error("[smoke:runtime-session-pack] expected top-level runtime session pack");
  process.exit(1);
}
const runtimeRolePackInitial = JSON.parse(
  run("runtime-role-pack-initial", ["./src/index.js", "runtime:role-pack", "--role", "executor", "--worker", "review-worker"]).stdout
).rolePack;
if (
  runtimeRolePackInitial.kind !== "runtime_role_pack" ||
  !runtimeRolePackInitial.recommendedSurface ||
  !runtimeRolePackInitial.overview ||
  !runtimeRolePackInitial.surfaces
) {
  console.error("[smoke:runtime-role-pack] expected top-level runtime role pack");
  process.exit(1);
}
const runtimeExecutionPackInitial = JSON.parse(
  run("runtime-execution-pack-initial", ["./src/index.js", "runtime:execution-pack"]).stdout
).executionPack;
if (
  runtimeExecutionPackInitial.kind !== "runtime_execution_pack" ||
  !runtimeExecutionPackInitial.recommendedSurface ||
  !runtimeExecutionPackInitial.overview ||
  !runtimeExecutionPackInitial.surfaces
) {
  console.error("[smoke:runtime-execution-pack] expected top-level runtime execution pack");
  process.exit(1);
}
const runtimePickupPackInitial = JSON.parse(
  run("runtime-pickup-pack-initial", ["./src/index.js", "runtime:pickup-pack", "--role", "executor", "--worker", "review-worker"]).stdout
).pickupPack;
if (
  runtimePickupPackInitial.kind !== "runtime_pickup_pack" ||
  !runtimePickupPackInitial.recommendedSurface ||
  !runtimePickupPackInitial.overview ||
  !runtimePickupPackInitial.surfaces
) {
  console.error("[smoke:runtime-pickup-pack] expected top-level runtime pickup pack");
  process.exit(1);
}
const runtimeAssignmentPackInitial = JSON.parse(
  run("runtime-assignment-pack-initial", ["./src/index.js", "runtime:assignment-pack", "--role", "executor", "--worker", "review-worker"]).stdout
).assignmentPack;
if (
  runtimeAssignmentPackInitial.kind !== "runtime_assignment_pack" ||
  !runtimeAssignmentPackInitial.recommendedSurface ||
  !runtimeAssignmentPackInitial.overview ||
  !runtimeAssignmentPackInitial.surfaces
) {
  console.error("[smoke:runtime-assignment-pack] expected top-level runtime assignment pack");
  process.exit(1);
}
const runtimeReviewInitial = JSON.parse(
  run("runtime-review-initial", ["./src/index.js", "runtime:review"]).stdout
).review;
if (
  runtimeReviewInitial.kind !== "runtime_review" ||
  runtimeReviewInitial.recommendedReason !== "no_review_pending" ||
  !Array.isArray(runtimeReviewInitial.groups)
) {
  console.error("[smoke:runtime-review] expected top-level runtime review");
  process.exit(1);
}
const runtimeReviewPackInitial = JSON.parse(
  run("runtime-review-pack-initial", ["./src/index.js", "runtime:review-pack"]).stdout
).reviewPack;
if (
  runtimeReviewPackInitial.kind !== "runtime_review_pack" ||
  !runtimeReviewPackInitial.recommendedSurface ||
  typeof runtimeReviewPackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeReviewPackInitial.overview ||
  !runtimeReviewPackInitial.surfaces
) {
  console.error("[smoke:runtime-review-pack] expected top-level runtime review pack");
  process.exit(1);
}
const runtimeWorkspacePackInitial = JSON.parse(
  run("runtime-workspace-pack-initial", ["./src/index.js", "runtime:workspace-pack"]).stdout
).workspacePack;
if (
  runtimeWorkspacePackInitial.kind !== "runtime_workspace_pack" ||
  !runtimeWorkspacePackInitial.recommendedSurface ||
  typeof runtimeWorkspacePackInitial.counts?.surfacedNextEntries !== "number" ||
  !runtimeWorkspacePackInitial.overview ||
  !runtimeWorkspacePackInitial.surfaces
) {
  console.error("[smoke:runtime-workspace-pack] expected top-level runtime workspace pack");
  process.exit(1);
}
const runtimeRolesInitial = JSON.parse(
  run("runtime-roles-initial", ["./src/index.js", "runtime:roles"]).stdout
).roles;
if (
  runtimeRolesInitial.kind !== "runtime_roles" ||
  runtimeRolesInitial.recommendedReason !== "claimable_role_pressure" ||
  !Array.isArray(runtimeRolesInitial.roles) ||
  runtimeRolesInitial.counts?.totalRoles < 4
) {
  console.error("[smoke:runtime-roles] expected top-level runtime roles");
  process.exit(1);
}

const listedMemories = JSON.parse(
  run("memory-list-verify", ["./src/index.js", "memory:list", "--namespace", "smoke"]).stdout
).memories;
if (
  listedMemories.kind !== "memory_view" ||
  listedMemories.recommendedReason !== "memory_list_has_results" ||
  listedMemories.counts?.totalMemories !== listedMemories.memories.length ||
  !Array.isArray(listedMemories.memories)
) {
  console.error("[smoke:memory-list] expected CLI memory list view payload");
  process.exit(1);
}
const smokeMemory = listedMemories.memories.find((memory) => memory.namespace === "smoke");
if (!smokeMemory || smokeMemory.agent !== "tester") {
  console.error("[smoke:memory-list] expected persisted memory with agent");
  process.exit(1);
}

const memoryDetail = JSON.parse(
  run("memory-get-verify", ["./src/index.js", "memory:get", "--id", smokeMemory.id]).stdout
).memory;
if (
  memoryDetail.kind !== "memory_detail" ||
  memoryDetail.recommendedReason !== "memory_detail_loaded" ||
  memoryDetail.memory?.id !== smokeMemory.id ||
  memoryDetail.metadata?.tagCount !== (smokeMemory.tags?.length ?? 0)
) {
  console.error("[smoke:memory-get] expected CLI memory detail payload");
  process.exit(1);
}

const searchedMemories = JSON.parse(
  run("memory-search-verify", [
    "./src/index.js",
    "memory:search",
    "--query",
    "metadata",
    "--namespace",
    "smoke"
  ]).stdout
);
if (
  searchedMemories.kind !== "memory_search_view" ||
  searchedMemories.recommendedReason !== "memory_search_has_results" ||
  searchedMemories.counts?.totalResults !== searchedMemories.results.length ||
  searchedMemories.query !== "metadata" ||
  !Array.isArray(searchedMemories.results) ||
  searchedMemories.results.length === 0
) {
  console.error("[smoke:memory-search] expected CLI memory search view payload");
  process.exit(1);
}

const fetchedTask = JSON.parse(run("task-get-verify", ["./src/index.js", "task:get", "--id", "task-3"]).stdout).task;
if (
  fetchedTask.kind !== "task_detail" ||
  fetchedTask.recommendedReason !== "task_detail_loaded" ||
  fetchedTask.metadata?.hasHistory !== true ||
  fetchedTask.metadata?.hasAnnotations !== false ||
  fetchedTask.metadata?.reviewState !== "approved" ||
  fetchedTask.task?.id !== "task-3" ||
  fetchedTask.task?.owner !== "executor" ||
  fetchedTask.task?.verifier !== "tester"
) {
  console.error("[smoke:task-get] expected persisted task detail");
  process.exit(1);
}
const taskExecutionBrief = JSON.parse(run("task-brief-verify", ["./src/index.js", "task:brief", "--id", "task-3"]).stdout).brief;
if (
  taskExecutionBrief.kind !== "task_execution_brief" ||
  taskExecutionBrief.recommendedReason !== "completed_task_brief" ||
  taskExecutionBrief.counts?.scopeEntries !== taskExecutionBrief.execution?.scope.length ||
  taskExecutionBrief.counts?.acceptanceItems !== taskExecutionBrief.execution?.acceptance.length ||
  taskExecutionBrief.counts?.verificationSteps !== taskExecutionBrief.execution?.verification.length ||
  taskExecutionBrief.counts?.reviewEvidenceEntries !== taskExecutionBrief.review?.evidence.length ||
  taskExecutionBrief.counts?.historyEntries !== taskExecutionBrief.history?.entries.length ||
  taskExecutionBrief.counts?.annotationEntries !== taskExecutionBrief.annotations?.count ||
  taskExecutionBrief.roles?.owner?.promptPath !== ".codex/agents/executor.md" ||
  taskExecutionBrief.roles?.verifier?.promptPath !== ".codex/agents/tester.md" ||
  taskExecutionBrief.recommendedNextAction !== "complete"
) {
  console.error("[smoke:task-brief] expected execution brief with owner/verifier prompt paths");
  process.exit(1);
}
const taskHistoryComplete = JSON.parse(
  run("task-history-complete", ["./src/index.js", "task:history", "--id", "task-3"]).stdout
).history;
if (
  taskHistoryComplete.recommendedReason !== "approved_event_latest" ||
  taskHistoryComplete.counts?.totalHistoryEntries !== taskHistoryComplete.history.length ||
  !Array.isArray(taskHistoryComplete.history) ||
  taskHistoryComplete.history.length < 5 ||
  taskHistoryComplete.history.at(-1)?.type !== "approved"
) {
  console.error("[smoke:task-history] expected completed task history with approval tail");
  process.exit(1);
}
const annotatedLifecycleCli = JSON.parse(
  run("task-annotate-complete", [
    "./src/index.js",
    "task:annotate",
    "--id",
    "task-3",
    "--by",
    "tester",
    "--kind",
    "handoff",
    "--content",
    "verified with smoke coverage"
  ]).stdout
).annotated;
if (
  annotatedLifecycleCli.kind !== "task_mutation" ||
  annotatedLifecycleCli.recommendedReason !== "task_annotated" ||
  annotatedLifecycleCli.task?.id !== "task-3" ||
  annotatedLifecycleCli.task?.annotations?.at(-1)?.content !== "verified with smoke coverage"
) {
  console.error("[smoke:task-annotate] expected CLI task annotate mutation payload");
  process.exit(1);
}
const taskBriefAnnotated = JSON.parse(
  run("task-brief-annotated", ["./src/index.js", "task:brief", "--id", "task-3"]).stdout
).brief;
if (
  taskBriefAnnotated.recommendedReason !== "completed_task_brief" ||
  taskBriefAnnotated.annotations?.entries?.at(-1)?.content !== "verified with smoke coverage"
) {
  console.error("[smoke:task-annotate] expected annotation to appear in task brief");
  process.exit(1);
}
const taskReportDone = JSON.parse(
  run("task-report-done", ["./src/index.js", "task:report", "--id", "task-3"]).stdout
).report;
if (
  taskReportDone.recommendedReason !== "approved_closure_ready" ||
  taskReportDone.counts?.acceptanceItems !== taskReportDone.acceptance.length ||
  taskReportDone.counts?.verificationSteps !== taskReportDone.verification.length ||
  taskReportDone.counts?.reviewEvidenceEntries !== taskReportDone.evidence?.reviewEvidence.length ||
  taskReportDone.counts?.annotationEntries !== taskReportDone.evidence?.annotations.length ||
  taskReportDone.counts?.recentHistoryEntries !== taskReportDone.evidence?.recentHistory.length ||
  taskReportDone.closure?.reviewOutcome !== "approved" ||
  taskReportDone.acceptance?.[0]?.status !== "verified" ||
  taskReportDone.evidence?.annotations?.at(-1)?.content !== "verified with smoke coverage"
) {
  console.error("[smoke:task-report] expected approved task report with carried evidence");
  process.exit(1);
}
const testerInbox = JSON.parse(
  run("task-inbox-tester", ["./src/index.js", "task:inbox", "--role", "tester", "--worker", "tester-worker"]).stdout
).inbox;
if (testerInbox.recommendedReason !== "observe_only_inbox" || testerInbox.counts.pendingReview !== 0 || testerInbox.tasks?.[0]?.relation !== "verifier_observe") {
  console.error("[smoke:task-inbox] expected tester inbox summary for completed task");
  process.exit(1);
}
const testerNext = JSON.parse(
  run("task-next-tester", ["./src/index.js", "task:next", "--role", "tester", "--worker", "tester-worker"]).stdout
).next;
if (testerNext.recommendedReason !== "no_next_candidate" || testerNext.candidate !== null || testerNext.brief !== null) {
  console.error("[smoke:task-next] expected no next tester candidate after completion");
  process.exit(1);
}

const listedTasks = JSON.parse(run("task-list-verify", ["./src/index.js", "task:list"]).stdout).tasks;
if (
  listedTasks.kind !== "task_view" ||
  listedTasks.recommendedReason !== "task_list_has_results" ||
  listedTasks.counts?.totalTasks !== listedTasks.tasks.length ||
  !Array.isArray(listedTasks.tasks)
) {
  console.error("[smoke:task-list] expected CLI task list view payload");
  process.exit(1);
}
const smokeTask = listedTasks.tasks.find((task) => task.id === "task-3");
if (!smokeTask || smokeTask.verifier !== "tester" || smokeTask.lane !== "lane-smoke") {
  console.error("[smoke:task-metadata] expected verifier and lane metadata");
  process.exit(1);
}
if (!Array.isArray(smokeTask.scope) || smokeTask.scope.length !== 2) {
  console.error("[smoke:task-metadata] expected scope metadata");
  process.exit(1);
}
if (!Array.isArray(smokeTask.acceptance) || smokeTask.acceptance.length !== 3) {
  console.error("[smoke:task-metadata] expected updated acceptance metadata");
  process.exit(1);
}
if (
  smokeTask.reviewedBy !== "tester" ||
  smokeTask.reviewOutcome !== "approved" ||
  !Array.isArray(smokeTask.reviewEvidence) ||
  smokeTask.reviewEvidence.length !== 2
) {
  console.error("[smoke:task-review] expected verifier approval metadata");
  process.exit(1);
}

const checkedTask = JSON.parse(run("task-check-verify", ["./src/index.js", "task:check", "--id", "task-3"]).stdout).validation;
if (
  checkedTask.kind !== "task_validation" ||
  checkedTask.recommendedReason !== "task_ready_to_claim" ||
  !checkedTask.ready
) {
  console.error("[smoke:task-check] expected bounded smoke task to validate cleanly");
  process.exit(1);
}

run("task-claim-lifecycle-add", [
  "./src/index.js",
  "task:add",
  "--title",
  "claim lifecycle task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "claim emits lifecycle envelope",
  "--verification",
  "task:claim returns machine-readable reason"
]);
const claimedLifecycleCli = JSON.parse(
  run("task-claim-lifecycle-cli", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "claim-worker"]).stdout
).claimed;
if (
  claimedLifecycleCli.kind !== "task_lifecycle" ||
  claimedLifecycleCli.recommendedReason !== "task_claimed" ||
  claimedLifecycleCli.task?.id !== "task-1" ||
  claimedLifecycleCli.task?.queueStatus !== "claimed" ||
  claimedLifecycleCli.task?.claimedBy !== "claim-worker"
) {
  console.error("[smoke:task-claim] expected CLI task claim lifecycle payload");
  process.exit(1);
}
const releasedLifecycleCli = JSON.parse(
  run("task-release-lifecycle-cli", ["./src/index.js", "task:release", "--id", "task-1", "--by", "claim-worker"]).stdout
).released;
if (
  releasedLifecycleCli.kind !== "task_lifecycle" ||
  releasedLifecycleCli.recommendedReason !== "task_released" ||
  releasedLifecycleCli.task?.id !== "task-1" ||
  releasedLifecycleCli.task?.queueStatus !== "released" ||
  releasedLifecycleCli.task?.claimedBy !== null
) {
  console.error("[smoke:task-release] expected CLI task release lifecycle payload");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });

run("task-block-lifecycle-add", [
  "./src/index.js",
  "task:add",
  "--title",
  "block lifecycle task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/mcp.js",
  "--acceptance",
  "block emits lifecycle envelope",
  "--verification",
  "task:block returns machine-readable reason"
]);
run("task-block-lifecycle-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "block-worker"]);
const blockedLifecycleCli = JSON.parse(
  run("task-block-lifecycle-cli", ["./src/index.js", "task:block", "--id", "task-1", "--by", "block-worker", "--notes", "waiting on dependency"]).stdout
).blocked;
if (
  blockedLifecycleCli.kind !== "task_lifecycle" ||
  blockedLifecycleCli.recommendedReason !== "task_blocked" ||
  blockedLifecycleCli.task?.id !== "task-1" ||
  blockedLifecycleCli.task?.queueStatus !== "blocked" ||
  blockedLifecycleCli.task?.claimedBy !== "block-worker"
) {
  console.error("[smoke:task-block] expected CLI task block lifecycle payload");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });

run("task-review-lifecycle-add", [
  "./src/index.js",
  "task:add",
  "--title",
  "review lifecycle task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/state.js",
  "--acceptance",
  "review emits lifecycle envelope",
  "--verification",
  "task:review returns machine-readable reason"
]);
run("task-review-lifecycle-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "review-worker"]);
const reviewLifecycleCli = JSON.parse(
  run("task-review-lifecycle-cli", ["./src/index.js", "task:review", "--id", "task-1", "--by", "review-worker"]).stdout
).readyForReview;
if (
  reviewLifecycleCli.kind !== "task_lifecycle" ||
  reviewLifecycleCli.recommendedReason !== "task_ready_for_review" ||
  reviewLifecycleCli.task?.id !== "task-1" ||
  reviewLifecycleCli.task?.queueStatus !== "ready_for_review" ||
  reviewLifecycleCli.task?.claimedBy !== "review-worker"
) {
  console.error("[smoke:task-review] expected CLI task review lifecycle payload");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });

run("task-approve-lifecycle-add", [
  "./src/index.js",
  "task:add",
  "--title",
  "approve lifecycle task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "approve emits lifecycle envelope",
  "--verification",
  "task:approve returns machine-readable reason"
]);
run("task-approve-lifecycle-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "approve-worker"]);
run("task-approve-lifecycle-review", ["./src/index.js", "task:review", "--id", "task-1", "--by", "approve-worker"]);
const approveLifecycleCli = JSON.parse(
  run("task-approve-lifecycle-cli", ["./src/index.js", "task:approve", "--id", "task-1", "--by", "tester", "--evidence", "approve smoke"]).stdout
).approved;
if (
  approveLifecycleCli.kind !== "task_lifecycle" ||
  approveLifecycleCli.recommendedReason !== "task_approved" ||
  approveLifecycleCli.task?.id !== "task-1" ||
  approveLifecycleCli.task?.queueStatus !== "done" ||
  approveLifecycleCli.task?.reviewOutcome !== "approved" ||
  approveLifecycleCli.task?.reviewedBy !== "tester"
) {
  console.error("[smoke:task-approve] expected CLI task approve lifecycle payload");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });

run("task-done-lifecycle-add", [
  "./src/index.js",
  "task:add",
  "--title",
  "done lifecycle task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/mcp.js",
  "--acceptance",
  "done emits lifecycle envelope",
  "--verification",
  "task:done returns machine-readable reason"
]);
run("task-done-lifecycle-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "done-worker"]);
run("task-done-lifecycle-review", ["./src/index.js", "task:review", "--id", "task-1", "--by", "done-worker"]);
const doneLifecycleCli = JSON.parse(
  run("task-done-lifecycle-cli", ["./src/index.js", "task:done", "--id", "task-1", "--by", "tester", "--evidence", "done smoke"]).stdout
).completed;
if (
  doneLifecycleCli.kind !== "task_lifecycle" ||
  doneLifecycleCli.recommendedReason !== "task_completed" ||
  doneLifecycleCli.task?.id !== "task-1" ||
  doneLifecycleCli.task?.queueStatus !== "done" ||
  doneLifecycleCli.task?.reviewOutcome !== "approved" ||
  doneLifecycleCli.task?.reviewedBy !== "tester"
) {
  console.error("[smoke:task-done] expected CLI task done lifecycle payload");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });

const firstAdd = run("durability-add-1", [
  "./src/index.js",
  "task:add",
  "--title",
  "durability one"
]);
const createdOne = JSON.parse(firstAdd.stdout).created;
if (createdOne.task?.id !== "task-1") {
  console.error("[smoke:durability-add-1] expected task-1");
  process.exit(1);
}

const statePath = ".codex-bees/state.json";
writeFileSync(statePath, "{not valid json\n", "utf8");
const recoveredList = run("durability-recover", ["./src/index.js", "task:list"]);
const recovered = JSON.parse(recoveredList.stdout);
if (
  recovered.tasks?.kind !== "task_view" ||
  recovered.tasks?.recommendedReason !== "task_list_empty" ||
  !Array.isArray(recovered.tasks?.tasks) ||
  recovered.tasks.tasks.length !== 0
) {
  console.error("[smoke:durability-recover] expected recovered empty task list");
  process.exit(1);
}

const corruptExists = existsSync(".codex-bees") &&
  readFileSync(statePath, "utf8").includes("\"version\": 3");
if (!corruptExists) {
  console.error("[smoke:durability-recover] expected rebuilt state file with version");
  process.exit(1);
}

const secondAdd = run("durability-add-2", [
  "./src/index.js",
  "task:add",
  "--title",
  "durability two"
]);
const createdTwo = JSON.parse(secondAdd.stdout).created;
if (createdTwo.task?.id !== "task-1") {
  console.error("[smoke:durability-add-2] expected clean recovery to restart at task-1");
  process.exit(1);
}
const incompleteTaskValidation = JSON.parse(
  run("task-check-incomplete", ["./src/index.js", "task:check", "--id", "task-1"]).stdout
).validation;
if (
  incompleteTaskValidation.recommendedReason !== "task_validation_issues_present" ||
  incompleteTaskValidation.ready ||
  incompleteTaskValidation.issues.length === 0
) {
  console.error("[smoke:task-check] expected incomplete task validation issues");
  process.exit(1);
}
run("task-claim-incomplete", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "blocked-worker"], 1);

rmSync(".codex-bees", { recursive: true, force: true });

const addedLifecycleCli = JSON.parse(
  run("task-add-lifecycle-cli", [
    "./src/index.js",
    "task:add",
    "--title",
    "task lifecycle add",
    "--owner",
    "executor",
    "--verifier",
    "tester",
    "--scope",
    "src/index.js",
    "--acceptance",
    "add emits lifecycle envelope",
    "--verification",
    "task:add returns machine-readable reason"
  ]).stdout
).created;
if (
  addedLifecycleCli.kind !== "task_mutation" ||
  addedLifecycleCli.recommendedReason !== "task_created" ||
  addedLifecycleCli.task?.title !== "task lifecycle add" ||
  addedLifecycleCli.task?.queueStatus !== "queued"
) {
  console.error("[smoke:task-add] expected CLI task add lifecycle payload");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("task-add-invalid-role", [
  "./src/index.js",
  "task:add",
  "--title",
  "invalid role task",
  "--owner",
  "leader",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "invalid owner caught",
  "--verification",
  "task check reports role error"
]);
const invalidRoleTaskValidation = JSON.parse(
  run("task-check-invalid-role", ["./src/index.js", "task:check", "--id", "task-1"]).stdout
).validation;
if (
  invalidRoleTaskValidation.recommendedReason !== "task_role_validation_issues_present" ||
  invalidRoleTaskValidation.ready ||
  !invalidRoleTaskValidation.issues.some((issue) => issue.code === "unknown_owner")
) {
  console.error("[smoke:task-check] expected unknown owner role validation issue");
  process.exit(1);
}
run("task-claim-invalid-role", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "blocked-worker"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
run("review-task-add", [
  "./src/index.js",
  "task:add",
  "--title",
  "review loop task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/state.js",
  "--acceptance",
  "review loop enforced",
  "--verification",
  "task transitions honor verifier"
]);
run("review-task-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "review-worker"]);
run("review-task-ready", ["./src/index.js", "task:review", "--id", "task-1", "--by", "review-worker"]);
const rejectedLifecycleCli = JSON.parse(run("review-task-reject", [
  "./src/index.js",
  "task:reject",
  "--id",
  "task-1",
  "--by",
  "tester",
  "--status",
  "claimed",
  "--notes",
  "needs another pass",
  "--evidence",
  "reviewed smoke rejection"
]).stdout).rejected;
if (
  rejectedLifecycleCli.kind !== "task_lifecycle" ||
  rejectedLifecycleCli.recommendedReason !== "task_changes_requested" ||
  rejectedLifecycleCli.task?.queueStatus !== "claimed" ||
  rejectedLifecycleCli.task?.reviewOutcome !== "changes_requested" ||
  rejectedLifecycleCli.task?.reviewedBy !== "tester"
) {
  console.error("[smoke:task-reject] expected CLI task reject lifecycle payload");
  process.exit(1);
}
const rejectedTask = JSON.parse(run("review-task-list", ["./src/index.js", "task:list"]).stdout).tasks.tasks[0];
if (
  rejectedTask.queueStatus !== "claimed" ||
  rejectedTask.claimedBy !== "review-worker" ||
  rejectedTask.reviewOutcome !== "changes_requested" ||
  rejectedTask.reviewedBy !== "tester"
) {
  console.error("[smoke:task-reject] expected claimed return-to-worker review outcome");
  process.exit(1);
}
const reviewInbox = JSON.parse(
  run("task-inbox-reviewer", ["./src/index.js", "task:inbox", "--role", "tester", "--worker", "tester-worker"]).stdout
).inbox;
if (reviewInbox.recommendedReason !== "observe_only_inbox" || reviewInbox.counts.pendingReview !== 0 || reviewInbox.tasks?.[0]?.relation !== "verifier_observe") {
  console.error("[smoke:task-inbox] expected verifier inbox to reflect post-rejection observe state");
  process.exit(1);
}
const ownerNext = JSON.parse(
  run("task-next-owner", ["./src/index.js", "task:next", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).next;
if (ownerNext.recommendedReason !== "continue_claimed_candidate" || ownerNext.candidate?.id !== "task-1" || ownerNext.candidate?.relation !== "owner_claimed_by_worker") {
  console.error("[smoke:task-next] expected owner next candidate to continue claimed task");
  process.exit(1);
}
const ownerPickup = JSON.parse(
  run("task-pickup-owner", ["./src/index.js", "task:pickup", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).pickup;
if (ownerPickup.outcome !== "continue" || ownerPickup.task?.id !== "task-1" || ownerPickup.command !== "node ./src/index.js task:review --id task-1 --by review-worker") {
  console.error("[smoke:task-pickup] expected claimed task to resume with review follow-up");
  process.exit(1);
}
if (ownerPickup.recommendedReason !== "continue_claimed_work") {
  console.error("[smoke:task-pickup] expected claimed owner pickup reason");
  process.exit(1);
}
const ownerSession = JSON.parse(
  run("worker-session-owner", ["./src/index.js", "worker:session", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).session;
if (
  ownerSession.counts.activeOwned !== 1 ||
  ownerSession.recommendedReason !== "active_task_focus" ||
  ownerSession.focus?.kind !== "active_task" ||
  ownerSession.activeOwned?.[0]?.summary?.id !== "task-1"
) {
  console.error("[smoke:worker-session] expected active owner session focus");
  process.exit(1);
}
run("task-annotate-owner", [
  "./src/index.js",
  "task:annotate",
  "--id",
  "task-1",
  "--by",
  "review-worker",
  "--kind",
  "context",
  "--content",
  "worker needs another pass before review"
]);
const ownerSessionAnnotated = JSON.parse(
  run("worker-session-owner-annotated", ["./src/index.js", "worker:session", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).session;
if (
  ownerSessionAnnotated.activeOwned?.[0]?.recentAnnotations?.at(-1)?.content !==
  "worker needs another pass before review"
) {
  console.error("[smoke:worker-session] expected owner annotation in worker session");
  process.exit(1);
}
const ownerHandoff = JSON.parse(
  run("worker-handoff-owner", ["./src/index.js", "worker:handoff", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).handoff;
if (
  ownerHandoff.recommendedReason !== "active_task_handoff" ||
  ownerHandoff.focus?.kind !== "active_task" ||
  ownerHandoff.currentTask?.id !== "task-1" ||
  ownerHandoff.recentAnnotations?.at(-1)?.content !== "worker needs another pass before review"
) {
  console.error("[smoke:worker-handoff] expected owner handoff package with current task context");
  process.exit(1);
}
const ownerCloseout = JSON.parse(
  run("worker-closeout-owner", ["./src/index.js", "worker:closeout", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).closeout;
if (
  ownerCloseout.recommendedReason !== "active_task_ready_for_review" ||
  ownerCloseout.focus?.kind !== "active_task" ||
  ownerCloseout.command !== "node ./src/index.js task:review --id task-1 --by review-worker" ||
  ownerCloseout.report?.task?.id !== "task-1"
) {
  console.error("[smoke:worker-closeout] expected owner closeout bundle");
  process.exit(1);
}
const ownerWorkerPack = JSON.parse(
  run("runtime-worker-pack-owner", ["./src/index.js", "runtime:worker-pack", "--role", "executor", "--worker", "review-worker", "--mode", "owner"]).stdout
).workerPack;
if (
  ownerWorkerPack.kind !== "runtime_worker_pack" ||
  ownerWorkerPack.recommendedSurface !== "worker:session" ||
  ownerWorkerPack.recommendedReason !== "active_task_priority" ||
  ownerWorkerPack.metadata?.hasFocus !== true ||
  ownerWorkerPack.metadata?.hasHandoff !== true ||
  ownerWorkerPack.metadata?.hasCloseout !== true ||
  ownerWorkerPack.counts?.surfacedNextEntries !== Object.values(ownerWorkerPack.next ?? {}).filter(Boolean).length ||
  ownerWorkerPack.next?.focus?.kind !== "active_task" ||
  ownerWorkerPack.surfaces?.handoff?.currentTask?.id !== "task-1"
) {
  console.error("[smoke:runtime-worker-pack] expected owner worker pack");
  process.exit(1);
}
const ownerPackCli = JSON.parse(
  run("runtime-owner-pack-cli", ["./src/index.js", "runtime:owner-pack", "--role", "executor", "--worker", "review-worker"]).stdout
).ownerPack;
if (
  ownerPackCli.kind !== "runtime_owner_pack" ||
  ownerPackCli.recommendedSurface !== "worker:session" ||
  ownerPackCli.recommendedReason !== "active_task_priority" ||
  ownerPackCli.metadata?.hasFocus !== true ||
  ownerPackCli.metadata?.hasCandidate !== true ||
  ownerPackCli.metadata?.hasHandoff !== true ||
  ownerPackCli.metadata?.hasCloseout !== true ||
  ownerPackCli.counts?.surfacedNextEntries !== Object.values(ownerPackCli.next ?? {}).filter(Boolean).length ||
  ownerPackCli.next?.focus?.kind !== "active_task" ||
  ownerPackCli.surfaces?.handoff?.currentTask?.id !== "task-1" ||
  ownerPackCli.mode !== "owner"
) {
  console.error("[smoke:runtime-owner-pack] expected CLI owner pack");
  process.exit(1);
}
const ownerPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_owner_pack",
      arguments: {
        role: "executor",
        workerId: "review-worker"
      }
    }
  })
].join("\n") + "\n";
const ownerPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: ownerPackMcpInput,
  encoding: "utf8"
});
const ownerPackMcpLines = ownerPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const ownerPackMcpPayload = JSON.parse(JSON.parse(ownerPackMcpLines[1]).result.content[0].text);
if (
  ownerPackMcp.status !== 0 ||
  ownerPackMcpPayload.ownerPack?.recommendedSurface !== "worker:session" ||
  ownerPackMcpPayload.ownerPack?.recommendedReason !== "active_task_priority" ||
  ownerPackMcpPayload.ownerPack?.metadata?.hasFocus !== true ||
  ownerPackMcpPayload.ownerPack?.metadata?.hasCandidate !== true ||
  ownerPackMcpPayload.ownerPack?.metadata?.hasHandoff !== true ||
  ownerPackMcpPayload.ownerPack?.metadata?.hasCloseout !== true ||
  ownerPackMcpPayload.ownerPack?.counts?.surfacedNextEntries !==
    Object.values(ownerPackMcpPayload.ownerPack?.next ?? {}).filter(Boolean).length ||
  ownerPackMcpPayload.ownerPack?.next?.focus?.taskId !== "task-1" ||
  ownerPackMcpPayload.ownerPack?.surfaces?.handoff?.currentTask?.id !== "task-1"
) {
  console.error("[smoke:runtime-owner-pack-mcp] expected MCP owner pack");
  console.error(ownerPackMcp.stderr || ownerPackMcp.stdout);
  process.exit(1);
}
const reviewTaskHistory = JSON.parse(
  run("task-history-review-loop", ["./src/index.js", "task:history", "--id", "task-1"]).stdout
).history;
if (
  reviewTaskHistory.recommendedReason !== "changes_requested_event_latest" ||
  reviewTaskHistory.history?.map((entry) => entry.type).join(",") !== "created,claimed,ready_for_review,changes_requested"
) {
  console.error("[smoke:task-history] expected review loop handoff history");
  process.exit(1);
}
const reviewTaskBrief = JSON.parse(
  run("task-brief-review-loop", ["./src/index.js", "task:brief", "--id", "task-1"]).stdout
).brief;
if (
  reviewTaskBrief.recommendedReason !== "claimed_execution_brief" ||
  reviewTaskBrief.counts?.historyEntries !== reviewTaskBrief.history?.entries.length ||
  reviewTaskBrief.recommendedNextAction !== "continue_execution_and_handoff" ||
  reviewTaskBrief.coordination?.queueStatus !== "claimed" ||
  reviewTaskBrief.review?.state !== "changes_requested"
) {
  console.error("[smoke:task-brief] expected claimed rework brief after changes requested");
  process.exit(1);
}
const reviewTaskReport = JSON.parse(
  run("task-report-review-loop", ["./src/index.js", "task:report", "--id", "task-1"]).stdout
).report;
if (
  reviewTaskReport.recommendedReason !== "changes_requested_rework" ||
  reviewTaskReport.counts?.annotationEntries !== reviewTaskReport.evidence?.annotations.length ||
  reviewTaskReport.counts?.recentHistoryEntries !== reviewTaskReport.evidence?.recentHistory.length ||
  reviewTaskReport.closure?.reviewOutcome !== "changes_requested" ||
  reviewTaskReport.closure?.closureReady !== false ||
  reviewTaskReport.evidence?.annotations?.at(-1)?.content !== "worker needs another pass before review"
) {
  console.error("[smoke:task-report] expected changes-requested task report");
  process.exit(1);
}
const reviewRuntimeRecovery = JSON.parse(
  run("runtime-recovery-review-loop", ["./src/index.js", "runtime:recovery"]).stdout
).recovery;
if (
  reviewRuntimeRecovery.recommendedReason !== "changes_requested_priority" ||
  reviewRuntimeRecovery.counts?.changesRequested !== 1 ||
  reviewRuntimeRecovery.next?.taskId !== "task-1" ||
  reviewRuntimeRecovery.next?.recoveryType !== "changes_requested" ||
  reviewRuntimeRecovery.groups?.some((group) => group.recoveryType === "changes_requested" && group.entries?.[0]?.taskId === "task-1") !== true
) {
  console.error("[smoke:runtime-recovery] expected changes-requested recovery workspace");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const plannedTaskCli = JSON.parse(
  run("plan-cli", ["./src/index.js", "plan", "--task", "Plan a runtime change"]).stdout
);
if (
  plannedTaskCli.kind !== "task_plan" ||
  plannedTaskCli.recommendedReason !== "multi_lane_plan_ready" ||
  !Array.isArray(plannedTaskCli.lanes) ||
  plannedTaskCli.lanes.length !== 2
) {
  console.error("[smoke:plan-cli] expected planner task payload with machine-readable reason");
  process.exit(1);
}
const planMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "plan_task",
      arguments: { task: "Plan an MCP runtime change" }
    }
  })
].join("\n") + "\n";
const planMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: planMcpInput,
  encoding: "utf8"
});
const planMcpLines = planMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const planMcpResult = planMcpLines.length >= 2 ? JSON.parse(planMcpLines[1]) : null;
const planMcpText = planMcpResult?.result?.content?.[0]?.text;
const planMcpPayload = planMcpText ? JSON.parse(planMcpText) : null;
if (
  planMcp.status !== 0 ||
  planMcpPayload?.kind !== "task_plan" ||
  planMcpPayload?.recommendedReason !== "multi_lane_plan_ready" ||
  !Array.isArray(planMcpPayload?.lanes) ||
  planMcpPayload.lanes.length !== 2
) {
  console.error("[smoke:plan-mcp] expected planner task payload with machine-readable reason");
  console.error(planMcp.stderr || planMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const queuedPlan = run("queue-plan-cli", [
  "./src/index.js",
  "plan:queue",
  "--task",
  "Queue a planner change"
]);
const queuedPlanPayload = JSON.parse(queuedPlan.stdout);
if (
  queuedPlanPayload.kind !== "queued_plan" ||
  queuedPlanPayload.recommendedReason !== "multiple_plan_tasks_queued" ||
  !Array.isArray(queuedPlanPayload.created) ||
  queuedPlanPayload.created.length !== 2
) {
  console.error("[smoke:queue-plan-cli] expected two queued tasks");
  process.exit(1);
}
if (!queuedPlanPayload.created[0].lane || !Array.isArray(queuedPlanPayload.created[0].scope)) {
  console.error("[smoke:queue-plan-cli] expected lane metadata on queued tasks");
  process.exit(1);
}

const queuePlanMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "queue_plan",
      arguments: { task: "Queue an MCP planner change" }
    }
  })
].join("\n") + "\n";

const queuePlanMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: queuePlanMcpInput,
  encoding: "utf8"
});
const queuePlanLines = queuePlanMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const queuePlanResult = queuePlanLines.length >= 2 ? JSON.parse(queuePlanLines[1]) : null;
const queuePlanText = queuePlanResult?.result?.content?.[0]?.text;
const queuePlanPayloadMcp = queuePlanText ? JSON.parse(queuePlanText) : null;
if (
  queuePlanMcp.status !== 0 ||
  queuePlanPayloadMcp?.kind !== "queued_plan" ||
  queuePlanPayloadMcp?.recommendedReason !== "multiple_plan_tasks_queued"
) {
  console.error("[smoke:queue-plan-mcp] expected queued_plan response");
  console.error(queuePlanMcp.stderr || queuePlanMcp.stdout);
  process.exit(1);
}



rmSync(".codex-bees", { recursive: true, force: true });
const plannedSwarm = JSON.parse(
  run("plan-swarm-verify", [
    "./src/index.js",
    "plan:swarm",
    "--task",
    "Coordinate a planner-driven swarm"
  ]).stdout
);
if (
  plannedSwarm.kind !== "planned_swarm" ||
  plannedSwarm.recommendedReason !== "multi_lane_swarm_ready" ||
  plannedSwarm.swarm?.laneSource !== "planner"
) {
  console.error("[smoke:plan-swarm] expected planner swarm payload");
  process.exit(1);
}
const planSwarmMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "plan_swarm",
      arguments: { task: "Plan an MCP swarm change" }
    }
  })
].join("\n") + "\n";
const planSwarmMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: planSwarmMcpInput,
  encoding: "utf8"
});
const planSwarmLines = planSwarmMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const planSwarmResult = planSwarmLines.length >= 2 ? JSON.parse(planSwarmLines[1]) : null;
const planSwarmText = planSwarmResult?.result?.content?.[0]?.text;
const planSwarmPayload = planSwarmText ? JSON.parse(planSwarmText) : null;
if (
  planSwarmMcp.status !== 0 ||
  planSwarmPayload?.kind !== "planned_swarm" ||
  planSwarmPayload?.recommendedReason !== "multi_lane_swarm_ready" ||
  planSwarmPayload?.swarm?.laneSource !== "planner"
) {
  console.error("[smoke:plan-swarm-mcp] expected planner swarm payload with machine-readable reason");
  console.error(planSwarmMcp.stderr || planSwarmMcp.stdout);
  process.exit(1);
}
const queuedPlanSwarm = JSON.parse(
  run("plan-swarm-queue", [
    "./src/index.js",
    "plan:swarm:queue",
    "--task",
    "Queue a planner-driven swarm"
  ]).stdout
);
if (
  queuedPlanSwarm.kind !== "queued_plan_swarm" ||
  queuedPlanSwarm.recommendedReason !== "multiple_swarm_lane_tasks_queued" ||
  queuedPlanSwarm.created.length !== 2 ||
  queuedPlanSwarm.swarm?.status !== "active" ||
  queuedPlanSwarm.swarm?.laneSource !== "planner"
) {
  console.error("[smoke:plan-swarm-queue] expected queued planner swarm tasks");
  process.exit(1);
}
const queuedPlanSwarmTasks = JSON.parse(
  run("plan-swarm-queue-task-list", ["./src/index.js", "task:list"]).stdout
).tasks.tasks;
if (!queuedPlanSwarmTasks.every((task) => task.swarmId === "swarm-1")) {
  console.error("[smoke:plan-swarm-queue] expected swarm-linked tasks from planner");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const swarmLaneJson = JSON.stringify([
  {
    lane: "lane-alpha",
    summary: "Map runtime boundary",
    owner: "explore",
    verifier: "reviewer",
    scope: ["src/index.js"],
    acceptance: ["scope captured"],
    verification: ["swarm:get returns lane"]
  },
  {
    lane: "lane-beta",
    summary: "Implement bounded change",
    owner: "executor",
    verifier: "tester",
    scope: ["src/state.js", "src/mcp.js"],
    acceptance: ["tasks queued from swarm"],
    verification: ["task:list includes swarmId"]
  }
]);
const swarmCreatedCli = JSON.parse(
  run("swarm-init", [
    "./src/index.js",
    "swarm:init",
    "--objective",
    "Coordinate swarm smoke coverage",
    "--owner",
    "leader",
    "--topology",
    "bounded-local",
    "--max-workers",
    "2",
    "--lane-source",
    "smoke",
    "--lanes",
    swarmLaneJson
  ]).stdout
).created;
if (
  swarmCreatedCli.kind !== "swarm_mutation" ||
  swarmCreatedCli.recommendedReason !== "swarm_created" ||
  swarmCreatedCli.swarm?.id !== "swarm-1" ||
  swarmCreatedCli.swarm?.maxWorkers !== 2 ||
  swarmCreatedCli.swarm?.lanes?.length !== 2
) {
  console.error("[smoke:swarm-init] expected CLI swarm init mutation payload");
  process.exit(1);
}
run("swarm-list", ["./src/index.js", "swarm:list"]);
const swarmValidation = JSON.parse(
  run("swarm-check", ["./src/index.js", "swarm:check", "--id", "swarm-1"]).stdout
).validation;
if (
  swarmValidation.kind !== "swarm_validation" ||
  swarmValidation.recommendedReason !== "swarm_ready_to_queue" ||
  !swarmValidation.ready
) {
  console.error("[smoke:swarm-check] expected bounded swarm to validate cleanly");
  process.exit(1);
}
const swarmGet = JSON.parse(
  run("swarm-get", ["./src/index.js", "swarm:get", "--id", "swarm-1"]).stdout
).swarm;
if (
  swarmGet.kind !== "swarm_detail" ||
  swarmGet.recommendedReason !== "swarm_detail_loaded" ||
  swarmGet.metadata?.derivedStatus !== "planned" ||
  swarmGet.metadata?.statusAligned !== true ||
  swarmGet.metadata?.readyToComplete !== false ||
  swarmGet.metadata?.dispatchableCount !== 0 ||
  !swarmGet.swarm
) {
  console.error("[smoke:swarm-get] expected CLI swarm detail payload");
  process.exit(1);
}
const swarmBriefPlanned = JSON.parse(
  run("swarm-brief-planned", ["./src/index.js", "swarm:brief", "--id", "swarm-1"]).stdout
).brief;
if (
  swarmBriefPlanned.kind !== "swarm_execution_brief" ||
  swarmBriefPlanned.recommendedReason !== "queue_swarm_lanes" ||
  swarmBriefPlanned.recommendedNextAction !== "queue_swarm_lanes" ||
  swarmBriefPlanned.owner?.id !== "leader"
) {
  console.error("[smoke:swarm-brief] expected pre-queue swarm brief");
  process.exit(1);
}
if (!Array.isArray(swarmGet.swarm.lanes) || swarmGet.swarm.lanes.length !== 2 || swarmGet.swarm.maxWorkers !== 2) {
  console.error("[smoke:swarm-get] expected persisted lanes and maxWorkers");
  process.exit(1);
}
const startedSwarm = JSON.parse(
  run("swarm-start", ["./src/index.js", "swarm:start", "--id", "swarm-1", "--owner", "leader"]).stdout
).activated;
if (
  startedSwarm.kind !== "swarm_lifecycle" ||
  startedSwarm.recommendedReason !== "swarm_activated" ||
  startedSwarm.swarm?.status !== "active"
) {
  console.error("[smoke:swarm-start] expected activated swarm lifecycle payload");
  process.exit(1);
}
const swarmQueue = JSON.parse(
  run("swarm-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]).stdout
);
if (
  swarmQueue.kind !== "swarm_queue" ||
  swarmQueue.recommendedReason !== "multiple_lane_tasks_queued" ||
  !Array.isArray(swarmQueue.created) ||
  swarmQueue.created.length !== 2
) {
  console.error("[smoke:swarm-queue] expected two queued swarm tasks");
  process.exit(1);
}
const swarmOverviewBeforeDispatch = JSON.parse(
  run("swarm-overview-before-dispatch", ["./src/index.js", "swarm:overview", "--id", "swarm-1"]).stdout
).overview;
if (
  swarmOverviewBeforeDispatch.kind !== "swarm_overview" ||
  swarmOverviewBeforeDispatch.recommendedReason !== "dispatch_lane_ready" ||
  swarmOverviewBeforeDispatch.counts.queued !== 2 ||
  swarmOverviewBeforeDispatch.nextLane?.lane !== "lane-alpha"
) {
  console.error("[smoke:swarm-overview] expected queued lanes and next lane before dispatch");
  process.exit(1);
}
const swarmDispatchBundleCli = JSON.parse(
  run("swarm-dispatch-bundle-cli", ["./src/index.js", "swarm:dispatch-bundle", "--id", "swarm-1"]).stdout
).dispatchBundle;
if (
  swarmDispatchBundleCli.kind !== "swarm_dispatch_bundle" ||
  swarmDispatchBundleCli.recommendedReason !== "dispatch_lane_ready" ||
  swarmDispatchBundleCli.metadata?.hasNextLane !== true ||
  swarmDispatchBundleCli.metadata?.hasTaskBrief !== true ||
  swarmDispatchBundleCli.metadata?.nextLaneId !== "lane-alpha" ||
  swarmDispatchBundleCli.counts?.dispatchableLanes !== swarmDispatchBundleCli.dispatchableCount ||
  swarmDispatchBundleCli.counts?.nextLaneCommands !== swarmDispatchBundleCli.nextLane?.recommendedCommands?.filter(Boolean).length ||
  swarmDispatchBundleCli.dispatchableCount !== 2 ||
  swarmDispatchBundleCli.nextLane?.lane !== "lane-alpha" ||
  swarmDispatchBundleCli.taskBrief?.task?.id !== "task-1"
) {
  console.error("[smoke:swarm-dispatch-bundle] expected CLI dispatch bundle with next lane task brief");
  process.exit(1);
}
const leaderAssignmentsCli = JSON.parse(
  run("leader-assignments-cli", ["./src/index.js", "leader:assignments"]).stdout
).assignments;
if (
  leaderAssignmentsCli.kind !== "leader_assignments" ||
  leaderAssignmentsCli.recommendedReason !== "parallel_owner_groups_visible" ||
  leaderAssignmentsCli.counts?.totalAssignments !== 2 ||
  leaderAssignmentsCli.counts?.ownerGroups !== 2 ||
  !leaderAssignmentsCli.groups?.some((group) => group.owner?.id === "explore") ||
  !leaderAssignmentsCli.groups?.some((group) => group.owner?.id === "executor") ||
  !leaderAssignmentsCli.groups?.flatMap((group) => group.assignments ?? []).some((assignment) => assignment.taskBrief?.task?.id === "task-1")
) {
  console.error("[smoke:leader-assignments] expected CLI leader assignments grouped by owner");
  process.exit(1);
}
const leaderAssignmentDispatchCli = JSON.parse(
  run("leader-assignment-dispatch-cli", ["./src/index.js", "leader:assignment-dispatch", "--role", "executor", "--worker", "worker-executor"]).stdout
).assignmentDispatch;
if (
  leaderAssignmentDispatchCli.recommendedReason !== "assignment_dispatch_ready" ||
  leaderAssignmentDispatchCli.assignment?.taskId !== "task-2" ||
  leaderAssignmentDispatchCli.previewCommand !== "node ./src/index.js task:assignment-preview --role executor --worker worker-executor --task task-2" ||
  leaderAssignmentDispatchCli.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2"
) {
  console.error("[smoke:leader-assignment-dispatch] expected CLI leader dispatch package");
  process.exit(1);
}
const leaderAssignmentDispatchPackCli = JSON.parse(
  run("leader-assignment-dispatch-pack-cli", ["./src/index.js", "leader:assignment-dispatch-pack"]).stdout
).assignmentDispatchPack;
const leaderAssignmentDispatchPackCliByOwner = new Map(
  (leaderAssignmentDispatchPackCli.groups ?? []).map((group) => [group.owner?.id, group])
);
if (
  leaderAssignmentDispatchPackCli.counts?.ownerGroups !== 2 ||
  leaderAssignmentDispatchPackCli.counts?.totalAssignments !== 2 ||
  leaderAssignmentDispatchPackCli.recommendedReason !== "parallel_owner_groups_ready" ||
  leaderAssignmentDispatchPackCli.next?.owner?.id !== "executor" ||
  leaderAssignmentDispatchPackCliByOwner.get("executor")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker <executor-worker> --task task-2" ||
  leaderAssignmentDispatchPackCliByOwner.get("explore")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role explore --worker <explore-worker> --task task-1"
) {
  console.error("[smoke:leader-assignment-dispatch-pack] expected CLI batch leader dispatch package");
  process.exit(1);
}
const leaderAssignmentDispatchPackMappedCli = JSON.parse(
  run("leader-assignment-dispatch-pack-mapped-cli", [
    "./src/index.js",
    "leader:assignment-dispatch-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).assignmentDispatchPack;
const leaderAssignmentDispatchPackMappedCliByOwner = new Map(
  (leaderAssignmentDispatchPackMappedCli.groups ?? []).map((group) => [group.owner?.id, group])
);
if (
  leaderAssignmentDispatchPackMappedCliByOwner.get("executor")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2" ||
  leaderAssignmentDispatchPackMappedCliByOwner.get("explore")?.previewCommand !== "node ./src/index.js task:assignment-preview --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:leader-assignment-dispatch-pack] expected CLI batch dispatch pack to honor per-role worker mapping");
  process.exit(1);
}
const leaderAssignmentDispatchBundleCli = JSON.parse(
  run("leader-assignment-dispatch-bundle-cli", [
    "./src/index.js",
    "leader:assignment-dispatch-bundle",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).assignmentDispatchBundle;
if (
  leaderAssignmentDispatchBundleCli.counts?.launches !== 2 ||
  leaderAssignmentDispatchBundleCli.recommendedReason !== "parallel_worker_launches_ready" ||
  leaderAssignmentDispatchBundleCli.next?.role?.id !== "executor" ||
  leaderAssignmentDispatchBundleCli.launches?.[0]?.assignmentPackCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner" ||
  leaderAssignmentDispatchBundleCli.launches?.[0]?.sessionCommand !== "node ./src/index.js worker:session --role executor --worker worker-executor --mode owner" ||
  leaderAssignmentDispatchBundleCli.launches?.[0]?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2" ||
  leaderAssignmentDispatchBundleCli.launches?.[1]?.previewCommand !== "node ./src/index.js task:assignment-preview --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:leader-assignment-dispatch-bundle] expected CLI multi-worker launch bundle");
  process.exit(1);
}
const leaderAssignmentLaunchPlanCli = JSON.parse(
  run("leader-assignment-launch-plan-cli", [
    "./src/index.js",
    "leader:assignment-launch-plan",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).assignmentLaunchPlan;
if (
  leaderAssignmentLaunchPlanCli.counts?.steps !== 2 ||
  leaderAssignmentLaunchPlanCli.recommendedReason !== "parallel_startup_steps_ready" ||
  leaderAssignmentLaunchPlanCli.next?.workerId !== "worker-executor" ||
  leaderAssignmentLaunchPlanCli.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner" ||
  leaderAssignmentLaunchPlanCli.steps?.[1]?.previewCommand !== "node ./src/index.js task:assignment-preview --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:leader-assignment-launch-plan] expected CLI launch plan");
  process.exit(1);
}
const runtimeDispatchPackMultiOwnerCli = JSON.parse(
  run("runtime-dispatch-pack-multi-owner-cli", ["./src/index.js", "runtime:dispatch-pack"]).stdout
).dispatchPack;
if (
  runtimeDispatchPackMultiOwnerCli.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeDispatchPackMultiOwnerCli.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeDispatchPackMultiOwnerCli.overview?.assignmentDispatchPack?.ownerGroups !== 2 ||
  runtimeDispatchPackMultiOwnerCli.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeDispatchPackMultiOwnerCli.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeDispatchPackMultiOwnerCli.next?.assignmentLaunchStep?.workerId !== "<executor-worker>" ||
  runtimeDispatchPackMultiOwnerCli.surfaces?.assignmentLaunchPlan?.steps?.length !== 2
) {
  console.error("[smoke:runtime-dispatch-pack] expected CLI dispatch pack to expose launch plan when multiple owner groups are ready");
  process.exit(1);
}
const runtimeLeaderPackMultiOwnerCli = JSON.parse(
  run("runtime-leader-pack-multi-owner-cli", ["./src/index.js", "runtime:leader-pack"]).stdout
).leaderPack;
if (
  runtimeLeaderPackMultiOwnerCli.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeLeaderPackMultiOwnerCli.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeLeaderPackMultiOwnerCli.overview?.assignmentDispatchPack?.ownerGroups !== 2 ||
  runtimeLeaderPackMultiOwnerCli.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeLeaderPackMultiOwnerCli.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeLeaderPackMultiOwnerCli.next?.assignmentLaunchStep?.workerId !== "<executor-worker>" ||
  runtimeLeaderPackMultiOwnerCli.surfaces?.assignmentLaunchPlan?.steps?.length !== 2
) {
  console.error("[smoke:runtime-leader-pack] expected CLI leader pack to prioritize launch plan when multiple owner groups are ready");
  process.exit(1);
}
const runtimeWorkspacePackMultiOwnerCli = JSON.parse(
  run("runtime-workspace-pack-multi-owner-cli", ["./src/index.js", "runtime:workspace-pack"]).stdout
).workspacePack;
if (
  runtimeWorkspacePackMultiOwnerCli.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeWorkspacePackMultiOwnerCli.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeWorkspacePackMultiOwnerCli.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeWorkspacePackMultiOwnerCli.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeWorkspacePackMultiOwnerCli.next?.assignmentLaunchStep?.workerId !== "<executor-worker>"
) {
  console.error("[smoke:runtime-workspace-pack] expected CLI workspace pack to prioritize launch plan when multiple owner groups are ready");
  process.exit(1);
}
const runtimeExecutionPackMultiOwnerCli = JSON.parse(
  run("runtime-execution-pack-multi-owner-cli", ["./src/index.js", "runtime:execution-pack"]).stdout
).executionPack;
if (
  runtimeExecutionPackMultiOwnerCli.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeExecutionPackMultiOwnerCli.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeExecutionPackMultiOwnerCli.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeExecutionPackMultiOwnerCli.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeExecutionPackMultiOwnerCli.next?.assignmentLaunchStep?.workerId !== "<executor-worker>"
) {
  console.error("[smoke:runtime-execution-pack] expected CLI execution pack to prioritize launch plan when multiple owner groups are ready");
  process.exit(1);
}
const runtimeDispatchPackMappedCli = JSON.parse(
  run("runtime-dispatch-pack-mapped-cli", [
    "./src/index.js",
    "runtime:dispatch-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).dispatchPack;
if (
  runtimeDispatchPackMappedCli.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "executor")?.workerId !== "worker-executor" ||
  runtimeDispatchPackMappedCli.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "explore")?.workerId !== "worker-explore"
) {
  console.error("[smoke:runtime-dispatch-pack] expected CLI dispatch pack to carry mapped worker ids into batch dispatch surface");
  process.exit(1);
}
const runtimeLeaderPackMappedCli = JSON.parse(
  run("runtime-leader-pack-mapped-cli", [
    "./src/index.js",
    "runtime:leader-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).leaderPack;
if (
  runtimeLeaderPackMappedCli.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "executor")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2" ||
  runtimeLeaderPackMappedCli.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "explore")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:runtime-leader-pack] expected CLI leader pack to propagate mapped worker commands into batch dispatch surface");
  process.exit(1);
}
const runtimeQueuePackMappedCli = JSON.parse(
  run("runtime-queue-pack-mapped-cli", [
    "./src/index.js",
    "runtime:queue-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).queuePack;
if (
  runtimeQueuePackMappedCli.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeQueuePackMappedCli.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeQueuePackMappedCli.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeQueuePackMappedCli.next?.assignmentLaunchStep?.workerId !== "worker-executor" ||
  runtimeQueuePackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[1]?.workerId !== "worker-explore"
) {
  console.error("[smoke:runtime-queue-pack] expected CLI queue pack to surface mapped launch plan when multiple owner groups are ready");
  process.exit(1);
}
const runtimeWorkspacePackMappedCli = JSON.parse(
  run("runtime-workspace-pack-mapped-cli", [
    "./src/index.js",
    "runtime:workspace-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).workspacePack;
if (
  runtimeWorkspacePackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeWorkspacePackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[1]?.workerId !== "worker-explore" ||
  runtimeWorkspacePackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[0]?.previewCommand !== "node ./src/index.js task:assignment-preview --role executor --worker worker-executor --task task-2" ||
  runtimeWorkspacePackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[1]?.previewCommand !== "node ./src/index.js task:assignment-preview --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:runtime-workspace-pack] expected CLI workspace pack to propagate mapped worker ids into launch plan");
  process.exit(1);
}
const runtimeExecutionPackMappedCli = JSON.parse(
  run("runtime-execution-pack-mapped-cli", [
    "./src/index.js",
    "runtime:execution-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).executionPack;
if (
  runtimeExecutionPackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner" ||
  runtimeExecutionPackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[1]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role explore --worker worker-explore --mode owner" ||
  runtimeExecutionPackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[0]?.previewCommand !== "node ./src/index.js task:assignment-preview --role executor --worker worker-executor --task task-2" ||
  runtimeExecutionPackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[1]?.previewCommand !== "node ./src/index.js task:assignment-preview --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:runtime-execution-pack] expected CLI execution pack to propagate mapped worker commands into launch plan");
  process.exit(1);
}
const assignmentPackExecutorCli = JSON.parse(
  run("runtime-assignment-pack-executor-cli", ["./src/index.js", "runtime:assignment-pack", "--role", "executor", "--worker", "worker-executor", "--mode", "owner"]).stdout
).assignmentPack;
if (
  assignmentPackExecutorCli.recommendedSurface !== "task:assignment-pickup --role executor --worker worker-executor --mode owner" ||
  assignmentPackExecutorCli.recommendedReason !== "leader_assignment_ready" ||
  assignmentPackExecutorCli.next?.assignment?.taskId !== "task-2" ||
  assignmentPackExecutorCli.next?.pickup?.kind !== "task_assignment_preview" ||
  assignmentPackExecutorCli.next?.pickup?.outcome !== "claimable"
) {
  console.error("[smoke:runtime-assignment-pack] expected explicit assignment pickup surface for executor");
  process.exit(1);
}
const assignmentPreviewExecutorCli = JSON.parse(
  run("task-assignment-preview-cli", ["./src/index.js", "task:assignment-preview", "--role", "executor", "--worker", "worker-executor", "--mode", "owner"]).stdout
).assignmentPreview;
if (
  assignmentPreviewExecutorCli.outcome !== "claimable" ||
  assignmentPreviewExecutorCli.recommendedReason !== "claimable_assignment_preview" ||
  assignmentPreviewExecutorCli.metadata?.hasAssignment !== true ||
  assignmentPreviewExecutorCli.metadata?.hasTask !== true ||
  assignmentPreviewExecutorCli.metadata?.hasBrief !== true ||
  assignmentPreviewExecutorCli.metadata?.taskId !== "task-2" ||
  assignmentPreviewExecutorCli.assignment?.taskId !== "task-2" ||
  assignmentPreviewExecutorCli.task?.id !== "task-2" ||
  assignmentPreviewExecutorCli.command !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2"
) {
  console.error("[smoke:task-assignment-preview] expected executor assignment preview");
  process.exit(1);
}
const assignmentPreviewExecutorState = JSON.parse(
  run("task-assignment-preview-state", ["./src/index.js", "task:get", "--id", "task-2"]).stdout
).task;
if (
  assignmentPreviewExecutorState.kind !== "task_detail" ||
  assignmentPreviewExecutorState.recommendedReason !== "task_detail_loaded" ||
  assignmentPreviewExecutorState.metadata?.reviewState !== "not_started" ||
  assignmentPreviewExecutorState.task?.queueStatus !== "queued"
) {
  console.error("[smoke:task-assignment-preview] expected preview to preserve assigned task state");
  process.exit(1);
}
const assignmentPickupExecutorCli = JSON.parse(
  run("task-assignment-pickup-cli", ["./src/index.js", "task:assignment-pickup", "--role", "executor", "--worker", "worker-executor", "--mode", "owner"]).stdout
).assignmentPickup;
if (
  assignmentPickupExecutorCli.outcome !== "claimed" ||
  assignmentPickupExecutorCli.recommendedReason !== "claimable_assignment_work" ||
  assignmentPickupExecutorCli.assignment?.taskId !== "task-2" ||
  assignmentPickupExecutorCli.task?.id !== "task-2" ||
  assignmentPickupExecutorCli.task?.claimedBy !== "worker-executor"
) {
  console.error("[smoke:task-assignment-pickup] expected executor assignment pickup to claim assigned task");
  process.exit(1);
}
const dispatchedLane = JSON.parse(
  run("swarm-dispatch", [
    "./src/index.js",
    "swarm:dispatch",
    "--id",
    "swarm-1",
    "--by",
    "worker-alpha",
    "--owner",
    "explore"
  ]).stdout
).dispatched;
if (
  dispatchedLane.kind !== "swarm_dispatch" ||
  dispatchedLane.recommendedReason !== "dispatch_lane_claimed" ||
  dispatchedLane.task.claimedBy !== "worker-alpha" ||
  dispatchedLane.lane.lane !== "lane-alpha"
) {
  console.error("[smoke:swarm-dispatch] expected first lane claimed by worker-alpha");
  process.exit(1);
}
const swarmOverviewAfterDispatch = JSON.parse(
  run("swarm-overview-after-dispatch", ["./src/index.js", "swarm:overview", "--id", "swarm-1"]).stdout
).overview;
if (
  swarmOverviewAfterDispatch.recommendedReason !== "claimed_lane_active" ||
  swarmOverviewAfterDispatch.counts.claimed !== 2 ||
  swarmOverviewAfterDispatch.counts.queued !== 0
) {
  console.error("[smoke:swarm-overview] expected assignment pickup and dispatch to claim both lanes");
  process.exit(1);
}
const swarmTasks = JSON.parse(run("swarm-queue-task-list", ["./src/index.js", "task:list"]).stdout).tasks.tasks;
if (
  !swarmTasks.every((task) => task.swarmId === "swarm-1") ||
  !swarmTasks.some((task) => task.id === "task-2" && task.claimedBy === "worker-executor")
) {
  console.error("[smoke:swarm-queue] expected swarm task linkage");
  process.exit(1);
}
run("swarm-task-1-review", ["./src/index.js", "task:review", "--id", "task-1", "--by", "worker-alpha"]);
run("swarm-task-1-approve", [
  "./src/index.js",
  "task:approve",
  "--id",
  "task-1",
  "--by",
  "reviewer",
  "--notes",
  "lane alpha approved"
]);
run("swarm-dispatch-second", [
  "./src/index.js",
  "swarm:dispatch",
  "--id",
  "swarm-1",
  "--by",
  "worker-beta",
  "--owner",
  "executor"
], 1);
run("swarm-task-2-review", ["./src/index.js", "task:review", "--id", "task-2", "--by", "worker-executor"]);
run("swarm-task-2-approve", [
  "./src/index.js",
  "task:approve",
  "--id",
  "task-2",
  "--by",
  "tester",
  "--notes",
  "lane beta approved"
]);
const swarmOverviewReadyToComplete = JSON.parse(
  run("swarm-overview-ready-to-complete", ["./src/index.js", "swarm:overview", "--id", "swarm-1"]).stdout
).overview;
const swarmExecutionBrief = JSON.parse(
  run("swarm-brief-ready", ["./src/index.js", "swarm:brief", "--id", "swarm-1"]).stdout
).brief;
if (
  swarmOverviewReadyToComplete.kind !== "swarm_overview" ||
  swarmOverviewReadyToComplete.recommendedReason !== "swarm_ready_to_complete" ||
  swarmExecutionBrief.kind !== "swarm_execution_brief" ||
  swarmExecutionBrief.recommendedReason !== "swarm_complete" ||
  swarmExecutionBrief.recommendedNextAction !== "complete" ||
  swarmExecutionBrief.nextLane !== null ||
  swarmExecutionBrief.lanes?.[0]?.owner?.promptPath !== ".codex/agents/explore.md"
) {
  console.error("[smoke:swarm-brief] expected completion-ready swarm brief");
  process.exit(1);
}
const swarmBundleCli = JSON.parse(
  run("swarm-bundle-cli", ["./src/index.js", "swarm:bundle", "--id", "swarm-1"]).stdout
).bundle;
if (
  swarmBundleCli.kind !== "swarm_bundle" ||
  swarmBundleCli.recommendedReason !== "swarm_ready_to_complete" ||
  swarmBundleCli.lanes?.length !== 2 ||
  swarmBundleCli.lanes?.[0]?.report?.task?.id !== "task-1" ||
  swarmBundleCli.summary?.includes("ready to complete") !== true
) {
  console.error("[smoke:swarm-bundle] expected CLI swarm bundle with lane reports");
  process.exit(1);
}
const swarmCloseoutCli = JSON.parse(
  run("swarm-closeout-cli", ["./src/index.js", "swarm:closeout", "--id", "swarm-1"]).stdout
).closeout;
if (
  swarmCloseoutCli.kind !== "swarm_closeout" ||
  swarmCloseoutCli.recommendedReason !== "swarm_closeout_ready" ||
  swarmCloseoutCli.readyToComplete !== true ||
  swarmCloseoutCli.command !== "node ./src/index.js swarm:done --id swarm-1" ||
  swarmCloseoutCli.bundle?.swarm?.id !== "swarm-1"
) {
  console.error("[smoke:swarm-closeout] expected CLI swarm closeout bundle with explicit close command");
  process.exit(1);
}
run("leader-workspace-swarm-init", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader workspace smoke",
  "--owner",
  "leader",
  "--max-workers",
  "1",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-leader",
      summary: "Queue this swarm next",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/state.js"],
      acceptance: ["leader workspace identifies queue-ready swarm"],
      verification: ["leader workspace summary names swarm-2"]
    }
  ])
]);
const leaderWorkspaceCli = JSON.parse(
  run("leader-workspace-cli", ["./src/index.js", "leader:workspace"]).stdout
).workspace;
if (
  leaderWorkspaceCli.kind !== "leader_workspace" ||
  leaderWorkspaceCli.recommendedReason !== "queue_focus_priority" ||
  leaderWorkspaceCli.counts?.totalSwarms !== 2 ||
  leaderWorkspaceCli.counts?.readyToComplete !== 1 ||
  leaderWorkspaceCli.focus?.swarmId !== "swarm-2" ||
  leaderWorkspaceCli.focus?.recommendedNextAction !== "queue_swarm_lanes" ||
  leaderWorkspaceCli.focus?.bundle?.swarm?.id !== "swarm-2"
) {
  console.error("[smoke:leader-workspace] expected CLI leader workspace with prioritized swarm focus");
  process.exit(1);
}
const leaderQueueCli = JSON.parse(
  run("leader-queue-cli", ["./src/index.js", "leader:queue"]).stdout
).queue;
if (
  leaderQueueCli.kind !== "leader_queue" ||
  leaderQueueCli.recommendedReason !== "next_queue_item_ready" ||
  leaderQueueCli.counts?.total !== 2 ||
  leaderQueueCli.next?.swarmId !== "swarm-2" ||
  leaderQueueCli.next?.recommendedNextAction !== "queue_swarm_lanes"
) {
  console.error("[smoke:leader-queue] expected CLI leader queue prioritized to the queued-next swarm");
  process.exit(1);
}
if (!swarmOverviewReadyToComplete.readyToComplete || swarmOverviewReadyToComplete.derivedStatus !== "completed" || swarmOverviewReadyToComplete.statusAligned !== true) {
  console.error("[smoke:swarm-overview] expected completion readiness and aligned completed status");
  process.exit(1);
}
const syncedSwarm = JSON.parse(
  run("swarm-sync", ["./src/index.js", "swarm:sync", "--id", "swarm-1"]).stdout
).synced;
if (
  syncedSwarm.kind !== "swarm_sync" ||
  syncedSwarm.recommendedReason !== "completed_swarm_unchanged" ||
  syncedSwarm.swarm.status !== "completed" ||
  syncedSwarm.changed !== false
) {
  console.error("[smoke:swarm-sync] expected idempotent completed swarm sync");
  process.exit(1);
}
const syncedSwarmGet = JSON.parse(
  run("swarm-get-after-sync", ["./src/index.js", "swarm:get", "--id", "swarm-1"]).stdout
).swarm;
if (
  syncedSwarmGet.kind !== "swarm_detail" ||
  syncedSwarmGet.recommendedReason !== "swarm_detail_loaded" ||
  syncedSwarmGet.metadata?.derivedStatus !== "completed" ||
  syncedSwarmGet.metadata?.statusAligned !== true ||
  syncedSwarmGet.metadata?.readyToComplete !== true ||
  syncedSwarmGet.metadata?.dispatchableCount !== 0 ||
  syncedSwarmGet.swarm?.status !== "completed"
) {
  console.error("[smoke:swarm-sync] expected stored completed swarm status");
  process.exit(1);
}
const completedSwarmCli = JSON.parse(
  run("swarm-done-cli", ["./src/index.js", "swarm:done", "--id", "swarm-1"]).stdout
).completed;
if (
  completedSwarmCli.kind !== "swarm_lifecycle" ||
  completedSwarmCli.recommendedReason !== "swarm_completed" ||
  completedSwarmCli.swarm?.id !== "swarm-1" ||
  completedSwarmCli.swarm?.status !== "completed"
) {
  console.error("[smoke:swarm-done] expected CLI completion lifecycle payload");
  process.exit(1);
}
const detailedSwarmList = JSON.parse(
  run("swarm-list-detailed", ["./src/index.js", "swarm:list", "--detailed"]).stdout
).swarms;
if (
  detailedSwarmList.kind !== "swarm_view" ||
  detailedSwarmList.recommendedReason !== "swarm_list_has_results" ||
  detailedSwarmList.detailed !== true ||
  detailedSwarmList.counts?.totalSwarms !== detailedSwarmList.swarms.length ||
  !Array.isArray(detailedSwarmList.swarms) ||
  detailedSwarmList.swarms[0]?.derivedStatus !== "completed"
) {
  console.error("[smoke:swarm-list] expected detailed swarm list with derived status");
  process.exit(1);
}
run("swarm-dispatch-none", ["./src/index.js", "swarm:dispatch", "--id", "swarm-1", "--by", "worker-gamma"], 1);
run("swarm-queue-invalid", ["./src/index.js", "swarm:queue", "--id", "swarm-1"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
const invalidSwarmJson = JSON.stringify([
  { lane: "lane-bad-1", summary: "Bad lane one", owner: "explore", scope: ["src/index.js"], acceptance: ["a"], verification: ["v"] },
  { lane: "lane-bad-2", summary: "Bad lane two", owner: "executor", verifier: "tester", scope: ["src/index.js"], acceptance: ["b"], verification: ["v"] }
]);
run("swarm-init-invalid", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Invalid swarm smoke",
  "--lanes",
  invalidSwarmJson
]);
const invalidSwarmValidation = JSON.parse(
  run("swarm-check-invalid", ["./src/index.js", "swarm:check", "--id", "swarm-1"]).stdout
).validation;
if (
  invalidSwarmValidation.recommendedReason !== "swarm_scope_overlap_detected" ||
  invalidSwarmValidation.ready ||
  invalidSwarmValidation.overlaps.length === 0
) {
  console.error("[smoke:swarm-check] expected invalid swarm overlap or metadata issues");
  process.exit(1);
}
run("swarm-queue-invalid-validation", ["./src/index.js", "swarm:queue", "--id", "swarm-1"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
const invalidSwarmRoleJson = JSON.stringify([
  {
    lane: "lane-role-bad-1",
    summary: "Unknown owner lane",
    owner: "leader",
    verifier: "tester",
    scope: ["src/index.js"],
    acceptance: ["role validation enforced"],
    verification: ["swarm check reports owner issue"]
  }
]);
run("swarm-init-invalid-role", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Invalid swarm role smoke",
  "--lanes",
  invalidSwarmRoleJson
]);
const invalidSwarmRoleValidation = JSON.parse(
  run("swarm-check-invalid-role", ["./src/index.js", "swarm:check", "--id", "swarm-1"]).stdout
).validation;
if (
  invalidSwarmRoleValidation.recommendedReason !== "lane_validation_issues_present" ||
  invalidSwarmRoleValidation.ready ||
  !invalidSwarmRoleValidation.lanes?.[0]?.issues?.some((issue) => issue.code === "unknown_owner")
) {
  console.error("[smoke:swarm-check] expected unknown lane owner validation issue");
  process.exit(1);
}
run("swarm-queue-invalid-role", ["./src/index.js", "swarm:queue", "--id", "swarm-1"], 1);

rmSync(".codex-bees", { recursive: true, force: true });
run("swarm-update-init", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Update swarm smoke",
  "--owner",
  "leader",
  "--max-workers",
  "1",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-update",
      summary: "Update lane",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["swarm update mutation is emitted"],
      verification: ["swarm:get reflects updated metadata"]
    }
  ])
]);
const updatedSwarmCli = JSON.parse(
  run("swarm-update-cli", [
    "./src/index.js",
    "swarm:update",
    "--id",
    "swarm-1",
    "--objective",
    "Updated swarm smoke",
    "--max-workers",
    "3",
    "--lane-source",
    "smoke-refresh",
    "--notes",
    "update path verified"
  ]).stdout
).updated;
if (
  updatedSwarmCli.kind !== "swarm_mutation" ||
  updatedSwarmCli.recommendedReason !== "swarm_updated" ||
  updatedSwarmCli.swarm?.id !== "swarm-1" ||
  updatedSwarmCli.swarm?.objective !== "Updated swarm smoke" ||
  updatedSwarmCli.swarm?.maxWorkers !== 3 ||
  updatedSwarmCli.swarm?.laneSource !== "smoke-refresh" ||
  updatedSwarmCli.swarm?.notes !== "update path verified" ||
  updatedSwarmCli.swarm?.lanes?.length !== 1
) {
  console.error("[smoke:swarm-update] expected CLI swarm update mutation payload");
  process.exit(1);
}
const updatedSwarmGet = JSON.parse(
  run("swarm-update-get", ["./src/index.js", "swarm:get", "--id", "swarm-1"]).stdout
).swarm;
if (
  updatedSwarmGet.kind !== "swarm_detail" ||
  updatedSwarmGet.recommendedReason !== "swarm_detail_loaded" ||
  updatedSwarmGet.swarm?.objective !== "Updated swarm smoke" ||
  updatedSwarmGet.swarm?.maxWorkers !== 3 ||
  updatedSwarmGet.swarm?.laneSource !== "smoke-refresh" ||
  updatedSwarmGet.swarm?.notes !== "update path verified"
) {
  console.error("[smoke:swarm-update] expected persisted updated swarm metadata");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("swarm-init-blocked", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Blocked swarm smoke",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-blocked",
      summary: "Blocked lane",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["blocked bundle reports this lane"],
      verification: ["swarm blockers surface returns task report"]
    }
  ])
]);
run("swarm-queue-blocked", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
run("swarm-dispatch-blocked", [
  "./src/index.js",
  "swarm:dispatch",
  "--id",
  "swarm-1",
  "--by",
  "blocked-worker",
  "--owner",
  "executor"
]);
const blockedSwarm = JSON.parse(
  run("swarm-block-lifecycle", ["./src/index.js", "swarm:block", "--id", "swarm-1", "--owner", "leader"]).stdout
).blocked;
if (
  blockedSwarm.kind !== "swarm_lifecycle" ||
  blockedSwarm.recommendedReason !== "swarm_blocked" ||
  blockedSwarm.swarm?.status !== "blocked"
) {
  console.error("[smoke:swarm-block] expected blocked swarm lifecycle payload");
  process.exit(1);
}
run("swarm-task-block", [
  "./src/index.js",
  "task:block",
  "--id",
  "task-1",
  "--by",
  "blocked-worker",
  "--notes",
  "waiting on unblock context"
]);
const swarmBlockersCli = JSON.parse(
  run("swarm-blockers-cli", ["./src/index.js", "swarm:blockers", "--id", "swarm-1"]).stdout
).blockers;
if (
  swarmBlockersCli.kind !== "swarm_blockers" ||
  swarmBlockersCli.recommendedReason !== "blocked_lane_ready" ||
  swarmBlockersCli.blockedCount !== 1 ||
  swarmBlockersCli.blockers?.[0]?.taskId !== "task-1" ||
  swarmBlockersCli.blockers?.[0]?.report?.task?.id !== "task-1"
) {
  console.error("[smoke:swarm-blockers] expected CLI blocker bundle with blocked lane report");
  process.exit(1);
}
const cancelledSwarmCli = JSON.parse(
  run("swarm-cancel-lifecycle", ["./src/index.js", "swarm:cancel", "--id", "swarm-1", "--owner", "leader"]).stdout
).cancelled;
if (
  cancelledSwarmCli.kind !== "swarm_lifecycle" ||
  cancelledSwarmCli.recommendedReason !== "swarm_cancelled" ||
  cancelledSwarmCli.swarm?.status !== "cancelled"
) {
  console.error("[smoke:swarm-cancel] expected cancelled swarm lifecycle payload");
  process.exit(1);
}
const swarmBlockersMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "swarm_blockers",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "swarm_cancel",
      arguments: { id: "swarm-1", owner: "leader" }
    }
  })
].join("\n") + "\n";
const swarmBlockersMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: swarmBlockersMcpInput,
  encoding: "utf8"
});
const swarmBlockersMcpLines = swarmBlockersMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const swarmBlockersMcpById = new Map(
  swarmBlockersMcpLines.map((line) => {
    const parsed = JSON.parse(line);
    return [parsed.id, parsed];
  })
);
const swarmBlockersMcpText = swarmBlockersMcpById.get(2)?.result?.content?.[0]?.text;
const swarmBlockersMcpPayload = swarmBlockersMcpText ? JSON.parse(swarmBlockersMcpText) : null;
const swarmCancelMcpText = swarmBlockersMcpById.get(3)?.result?.content?.[0]?.text;
const swarmCancelMcpPayload = swarmCancelMcpText ? JSON.parse(swarmCancelMcpText) : null;
if (
  swarmBlockersMcp.status !== 0 ||
  swarmBlockersMcpPayload.blockers?.recommendedReason !== "blocked_lane_ready" ||
  swarmBlockersMcpPayload.blockers?.blockedCount !== 1 ||
  swarmBlockersMcpPayload.blockers?.blockers?.[0]?.recommendedNextAction !== "resolve_blocker_and_requeue" ||
  swarmCancelMcpPayload?.cancelled?.kind !== "swarm_lifecycle" ||
  swarmCancelMcpPayload?.cancelled?.recommendedReason !== "swarm_cancelled" ||
  swarmCancelMcpPayload?.cancelled?.swarm?.status !== "cancelled"
) {
  console.error("[smoke:swarm-blockers-mcp] expected MCP cancel lifecycle and blocker bundle");
  console.error(swarmBlockersMcp.stderr || swarmBlockersMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("swarm-init-dispatchable", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Dispatch bundle smoke",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-dispatch",
      summary: "Dispatch lane",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["dispatch bundle surfaces next lane"],
      verification: ["dispatch bundle includes task brief"]
    }
  ])
]);
run("swarm-queue-dispatchable", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
const swarmDispatchBundleMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "swarm_dispatch_bundle",
      arguments: { id: "swarm-1" }
    }
  })
].join("\n") + "\n";
const swarmDispatchBundleMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: swarmDispatchBundleMcpInput,
  encoding: "utf8"
});
const swarmDispatchBundleMcpLines = swarmDispatchBundleMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const swarmDispatchBundleMcpPayload = JSON.parse(JSON.parse(swarmDispatchBundleMcpLines[1]).result.content[0].text);
if (
  swarmDispatchBundleMcp.status !== 0 ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.recommendedReason !== "dispatch_lane_ready" ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.metadata?.hasTaskBrief !== true ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.metadata?.nextLaneId !== "lane-dispatch" ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.counts?.dispatchableLanes !== swarmDispatchBundleMcpPayload.dispatchBundle?.dispatchableCount ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.counts?.nextLaneCommands !== swarmDispatchBundleMcpPayload.dispatchBundle?.nextLane?.recommendedCommands?.filter(Boolean).length ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.nextLane?.lane !== "lane-dispatch" ||
  swarmDispatchBundleMcpPayload.dispatchBundle?.taskBrief?.task?.id !== "task-1"
) {
  console.error("[smoke:swarm-dispatch-bundle-mcp] expected MCP dispatch bundle");
  console.error(swarmDispatchBundleMcp.stderr || swarmDispatchBundleMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const swarmUpdateMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "swarm_init",
      arguments: {
        objective: "MCP swarm update smoke",
        owner: "leader",
        maxWorkers: 1,
        lanes: [
          {
            lane: "lane-mcp-update",
            summary: "MCP update lane",
            owner: "executor",
            verifier: "tester",
            scope: ["src/mcp.js"],
            acceptance: ["update mutation is returned"],
            verification: ["swarm_get reflects mcp update"]
          }
        ]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "swarm_update",
      arguments: {
        id: "swarm-1",
        objective: "MCP swarm update refreshed",
        maxWorkers: 4,
        laneSource: "mcp-refresh",
        notes: "mcp update verified"
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "swarm_get",
      arguments: { id: "swarm-1" }
    }
  })
].join("\n") + "\n";
const swarmUpdateMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: swarmUpdateMcpInput,
  encoding: "utf8"
});
const swarmUpdateMcpResponses = swarmUpdateMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const swarmUpdateMcpById = new Map(
  swarmUpdateMcpResponses.map((line) => {
    const parsed = JSON.parse(line);
    return [parsed.id, parsed];
  })
);
const swarmUpdateResult = swarmUpdateMcpById.get(3) ?? null;
const swarmUpdateText = swarmUpdateResult?.result?.content?.[0]?.text;
const swarmUpdatePayload = swarmUpdateText ? JSON.parse(swarmUpdateText) : null;
const swarmUpdateGetResult = swarmUpdateMcpById.get(4) ?? null;
const swarmUpdateGetText = swarmUpdateGetResult?.result?.content?.[0]?.text;
const swarmUpdateGetPayload = swarmUpdateGetText ? JSON.parse(swarmUpdateGetText) : null;
if (
  swarmUpdateMcp.status !== 0 ||
  swarmUpdatePayload?.updated?.kind !== "swarm_mutation" ||
  swarmUpdatePayload?.updated?.recommendedReason !== "swarm_updated" ||
  swarmUpdatePayload?.updated?.swarm?.objective !== "MCP swarm update refreshed" ||
  swarmUpdatePayload?.updated?.swarm?.maxWorkers !== 4 ||
  swarmUpdatePayload?.updated?.swarm?.laneSource !== "mcp-refresh" ||
  swarmUpdatePayload?.updated?.swarm?.notes !== "mcp update verified" ||
  swarmUpdateGetPayload?.swarm?.kind !== "swarm_detail" ||
  swarmUpdateGetPayload?.swarm?.recommendedReason !== "swarm_detail_loaded" ||
  swarmUpdateGetPayload?.swarm?.metadata?.derivedStatus !== "planned" ||
  swarmUpdateGetPayload?.swarm?.metadata?.statusAligned !== true ||
  swarmUpdateGetPayload?.swarm?.metadata?.readyToComplete !== false ||
  swarmUpdateGetPayload?.swarm?.swarm?.objective !== "MCP swarm update refreshed" ||
  swarmUpdateGetPayload?.swarm?.swarm?.maxWorkers !== 4 ||
  swarmUpdateGetPayload?.swarm?.swarm?.laneSource !== "mcp-refresh" ||
  swarmUpdateGetPayload?.swarm?.swarm?.notes !== "mcp update verified"
) {
  console.error("[smoke:swarm-update-mcp] expected MCP swarm update mutation payload");
  console.error(swarmUpdateMcp.stderr || swarmUpdateMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("leader-queue-swarm-done", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader queue done swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-done",
      summary: "Done lane",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["done swarm exists"],
      verification: ["leader queue ranks pending swarm first"]
    }
  ])
]);
run("leader-queue-swarm-done-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
run("leader-queue-swarm-done-dispatch", ["./src/index.js", "swarm:dispatch", "--id", "swarm-1", "--by", "worker-done", "--owner", "explore"]);
run("leader-queue-swarm-done-review", ["./src/index.js", "task:review", "--id", "task-1", "--by", "worker-done"]);
run("leader-queue-swarm-done-approve", ["./src/index.js", "task:approve", "--id", "task-1", "--by", "reviewer"]);
run("leader-queue-swarm-pending", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader queue pending swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-pending",
      summary: "Pending lane",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["pending swarm exists"],
      verification: ["leader queue returns it first"]
    }
  ])
]);
const leaderQueueMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_queue",
      arguments: {}
    }
  })
].join("\n") + "\n";
const leaderQueueMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderQueueMcpInput,
  encoding: "utf8"
});
const leaderQueueMcpLines = leaderQueueMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderQueueMcpPayload = JSON.parse(JSON.parse(leaderQueueMcpLines[1]).result.content[0].text);
if (
  leaderQueueMcp.status !== 0 ||
  leaderQueueMcpPayload.queue?.recommendedReason !== "next_queue_item_ready" ||
  leaderQueueMcpPayload.queue?.next?.swarmId !== "swarm-2" ||
  leaderQueueMcpPayload.queue?.next?.recommendedNextAction !== "queue_swarm_lanes"
) {
  console.error("[smoke:leader-queue-mcp] expected MCP leader queue");
  console.error(leaderQueueMcp.stderr || leaderQueueMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("leader-assignments-swarm", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Leader assignments swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-assign-a",
      summary: "Dispatch to explore",
      owner: "explore",
      verifier: "reviewer",
      scope: ["src/index.js"],
      acceptance: ["assignment grouped under explore"],
      verification: ["leader assignments returns owner groups"]
    },
    {
      lane: "lane-assign-b",
      summary: "Dispatch to executor",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["assignment grouped under executor"],
      verification: ["leader assignments returns second owner group"]
    }
  ])
]);
run("leader-assignments-swarm-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
const leaderAssignmentsMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_assignments",
      arguments: {}
    }
  })
].join("\n") + "\n";
const leaderAssignmentsMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderAssignmentsMcpInput,
  encoding: "utf8"
});
const leaderAssignmentsMcpLines = leaderAssignmentsMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderAssignmentsMcpPayload = JSON.parse(JSON.parse(leaderAssignmentsMcpLines[1]).result.content[0].text);
if (
  leaderAssignmentsMcp.status !== 0 ||
  leaderAssignmentsMcpPayload.assignments?.recommendedReason !== "parallel_owner_groups_visible" ||
  leaderAssignmentsMcpPayload.assignments?.counts?.totalAssignments !== 2 ||
  leaderAssignmentsMcpPayload.assignments?.counts?.ownerGroups !== 2 ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.some((group) => group.owner?.id === "explore") ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.some((group) => group.owner?.id === "executor") ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.flatMap((group) => group.assignments ?? []).some((assignment) => assignment.taskBrief?.task?.id === "task-1") ||
  !leaderAssignmentsMcpPayload.assignments?.groups?.flatMap((group) => group.assignments ?? []).some((assignment) => assignment.taskBrief?.task?.id === "task-2")
) {
  console.error("[smoke:leader-assignments-mcp] expected MCP leader assignments");
  console.error(leaderAssignmentsMcp.stderr || leaderAssignmentsMcp.stdout);
  process.exit(1);
}
const leaderAssignmentDispatchMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_assignment_dispatch",
      arguments: { role: "executor", workerId: "worker-executor" }
    }
  })
].join("\n") + "\n";
const leaderAssignmentDispatchMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderAssignmentDispatchMcpInput,
  encoding: "utf8"
});
const leaderAssignmentDispatchMcpLines = leaderAssignmentDispatchMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderAssignmentDispatchMcpPayload = JSON.parse(JSON.parse(leaderAssignmentDispatchMcpLines[1]).result.content[0].text);
if (
  leaderAssignmentDispatchMcp.status !== 0 ||
  leaderAssignmentDispatchMcpPayload.assignmentDispatch?.recommendedReason !== "assignment_dispatch_ready" ||
  leaderAssignmentDispatchMcpPayload.assignmentDispatch?.assignment?.taskId !== "task-2" ||
  leaderAssignmentDispatchMcpPayload.assignmentDispatch?.previewCommand !== "node ./src/index.js task:assignment-preview --role executor --worker worker-executor --task task-2" ||
  leaderAssignmentDispatchMcpPayload.assignmentDispatch?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2"
) {
  console.error("[smoke:leader-assignment-dispatch-mcp] expected MCP leader dispatch package");
  console.error(leaderAssignmentDispatchMcp.stderr || leaderAssignmentDispatchMcp.stdout);
  process.exit(1);
}
const leaderAssignmentDispatchPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_assignment_dispatch_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const leaderAssignmentDispatchPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderAssignmentDispatchPackMcpInput,
  encoding: "utf8"
});
const leaderAssignmentDispatchPackMcpLines = leaderAssignmentDispatchPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderAssignmentDispatchPackMcpPayload = JSON.parse(JSON.parse(leaderAssignmentDispatchPackMcpLines[1]).result.content[0].text);
const leaderAssignmentDispatchPackMcpByOwner = new Map(
  (leaderAssignmentDispatchPackMcpPayload.assignmentDispatchPack?.groups ?? []).map((group) => [group.owner?.id, group])
);
if (
  leaderAssignmentDispatchPackMcp.status !== 0 ||
  leaderAssignmentDispatchPackMcpPayload.assignmentDispatchPack?.counts?.ownerGroups !== 2 ||
  leaderAssignmentDispatchPackMcpPayload.assignmentDispatchPack?.counts?.totalAssignments !== 2 ||
  leaderAssignmentDispatchPackMcpPayload.assignmentDispatchPack?.recommendedReason !== "parallel_owner_groups_ready" ||
  leaderAssignmentDispatchPackMcpPayload.assignmentDispatchPack?.next?.owner?.id !== "executor" ||
  leaderAssignmentDispatchPackMcpByOwner.get("executor")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker <executor-worker> --task task-2" ||
  leaderAssignmentDispatchPackMcpByOwner.get("explore")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role explore --worker <explore-worker> --task task-1"
) {
  console.error("[smoke:leader-assignment-dispatch-pack-mcp] expected MCP batch leader dispatch package");
  console.error(leaderAssignmentDispatchPackMcp.stderr || leaderAssignmentDispatchPackMcp.stdout);
  process.exit(1);
}
const leaderAssignmentDispatchPackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_assignment_dispatch_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const leaderAssignmentDispatchPackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderAssignmentDispatchPackMappedMcpInput,
  encoding: "utf8"
});
const leaderAssignmentDispatchPackMappedMcpLines = leaderAssignmentDispatchPackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderAssignmentDispatchPackMappedMcpPayload = JSON.parse(JSON.parse(leaderAssignmentDispatchPackMappedMcpLines[1]).result.content[0].text);
const leaderAssignmentDispatchPackMappedMcpByOwner = new Map(
  (leaderAssignmentDispatchPackMappedMcpPayload.assignmentDispatchPack?.groups ?? []).map((group) => [group.owner?.id, group])
);
if (
  leaderAssignmentDispatchPackMappedMcp.status !== 0 ||
  leaderAssignmentDispatchPackMappedMcpByOwner.get("executor")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2" ||
  leaderAssignmentDispatchPackMappedMcpByOwner.get("explore")?.previewCommand !== "node ./src/index.js task:assignment-preview --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:leader-assignment-dispatch-pack-mcp] expected MCP batch dispatch pack to honor per-role worker mapping");
  console.error(leaderAssignmentDispatchPackMappedMcp.stderr || leaderAssignmentDispatchPackMappedMcp.stdout);
  process.exit(1);
}
const leaderAssignmentDispatchBundleMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_assignment_dispatch_bundle",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const leaderAssignmentDispatchBundleMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderAssignmentDispatchBundleMcpInput,
  encoding: "utf8"
});
const leaderAssignmentDispatchBundleMcpLines = leaderAssignmentDispatchBundleMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderAssignmentDispatchBundleMcpPayload = JSON.parse(JSON.parse(leaderAssignmentDispatchBundleMcpLines[1]).result.content[0].text);
if (
  leaderAssignmentDispatchBundleMcp.status !== 0 ||
  leaderAssignmentDispatchBundleMcpPayload.assignmentDispatchBundle?.counts?.launches !== 2 ||
  leaderAssignmentDispatchBundleMcpPayload.assignmentDispatchBundle?.recommendedReason !== "parallel_worker_launches_ready" ||
  leaderAssignmentDispatchBundleMcpPayload.assignmentDispatchBundle?.next?.role?.id !== "executor" ||
  leaderAssignmentDispatchBundleMcpPayload.assignmentDispatchBundle?.launches?.[0]?.assignmentPackCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner" ||
  leaderAssignmentDispatchBundleMcpPayload.assignmentDispatchBundle?.launches?.[0]?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2"
) {
  console.error("[smoke:leader-assignment-dispatch-bundle-mcp] expected MCP multi-worker launch bundle");
  console.error(leaderAssignmentDispatchBundleMcp.stderr || leaderAssignmentDispatchBundleMcp.stdout);
  process.exit(1);
}
const leaderAssignmentLaunchPlanMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "leader_assignment_launch_plan",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const leaderAssignmentLaunchPlanMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: leaderAssignmentLaunchPlanMcpInput,
  encoding: "utf8"
});
const leaderAssignmentLaunchPlanMcpLines = leaderAssignmentLaunchPlanMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const leaderAssignmentLaunchPlanMcpPayload = JSON.parse(JSON.parse(leaderAssignmentLaunchPlanMcpLines[1]).result.content[0].text);
if (
  leaderAssignmentLaunchPlanMcp.status !== 0 ||
  leaderAssignmentLaunchPlanMcpPayload.assignmentLaunchPlan?.counts?.steps !== 2 ||
  leaderAssignmentLaunchPlanMcpPayload.assignmentLaunchPlan?.recommendedReason !== "parallel_startup_steps_ready" ||
  leaderAssignmentLaunchPlanMcpPayload.assignmentLaunchPlan?.next?.workerId !== "worker-executor" ||
  leaderAssignmentLaunchPlanMcpPayload.assignmentLaunchPlan?.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner"
) {
  console.error("[smoke:leader-assignment-launch-plan-mcp] expected MCP launch plan");
  console.error(leaderAssignmentLaunchPlanMcp.stderr || leaderAssignmentLaunchPlanMcp.stdout);
  process.exit(1);
}
const runtimeWorkspacePackMultiOwnerMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_workspace_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeWorkspacePackMultiOwnerMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeWorkspacePackMultiOwnerMcpInput,
  encoding: "utf8"
});
const runtimeWorkspacePackMultiOwnerMcpLines = runtimeWorkspacePackMultiOwnerMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeWorkspacePackMultiOwnerMcpPayload = JSON.parse(JSON.parse(runtimeWorkspacePackMultiOwnerMcpLines[1]).result.content[0].text);
if (
  runtimeWorkspacePackMultiOwnerMcp.status !== 0 ||
  runtimeWorkspacePackMultiOwnerMcpPayload.workspacePack?.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeWorkspacePackMultiOwnerMcpPayload.workspacePack?.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeWorkspacePackMultiOwnerMcpPayload.workspacePack?.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeWorkspacePackMultiOwnerMcpPayload.workspacePack?.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeWorkspacePackMultiOwnerMcpPayload.workspacePack?.next?.assignmentLaunchStep?.workerId !== "<executor-worker>"
) {
  console.error("[smoke:runtime-workspace-pack-mcp] expected MCP workspace pack to prioritize launch plan when multiple owner groups are ready");
  console.error(runtimeWorkspacePackMultiOwnerMcp.stderr || runtimeWorkspacePackMultiOwnerMcp.stdout);
  process.exit(1);
}
const runtimeExecutionPackMultiOwnerMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_execution_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeExecutionPackMultiOwnerMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeExecutionPackMultiOwnerMcpInput,
  encoding: "utf8"
});
const runtimeExecutionPackMultiOwnerMcpLines = runtimeExecutionPackMultiOwnerMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeExecutionPackMultiOwnerMcpPayload = JSON.parse(JSON.parse(runtimeExecutionPackMultiOwnerMcpLines[1]).result.content[0].text);
if (
  runtimeExecutionPackMultiOwnerMcp.status !== 0 ||
  runtimeExecutionPackMultiOwnerMcpPayload.executionPack?.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeExecutionPackMultiOwnerMcpPayload.executionPack?.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeExecutionPackMultiOwnerMcpPayload.executionPack?.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeExecutionPackMultiOwnerMcpPayload.executionPack?.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeExecutionPackMultiOwnerMcpPayload.executionPack?.next?.assignmentLaunchStep?.workerId !== "<executor-worker>"
) {
  console.error("[smoke:runtime-execution-pack-mcp] expected MCP execution pack to prioritize launch plan when multiple owner groups are ready");
  console.error(runtimeExecutionPackMultiOwnerMcp.stderr || runtimeExecutionPackMultiOwnerMcp.stdout);
  process.exit(1);
}
const runtimeDispatchPackMultiOwnerMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dispatch_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeDispatchPackMultiOwnerMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDispatchPackMultiOwnerMcpInput,
  encoding: "utf8"
});
const runtimeDispatchPackMultiOwnerMcpLines = runtimeDispatchPackMultiOwnerMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDispatchPackMultiOwnerMcpPayload = JSON.parse(JSON.parse(runtimeDispatchPackMultiOwnerMcpLines[1]).result.content[0].text);
if (
  runtimeDispatchPackMultiOwnerMcp.status !== 0 ||
  runtimeDispatchPackMultiOwnerMcpPayload.dispatchPack?.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeDispatchPackMultiOwnerMcpPayload.dispatchPack?.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeDispatchPackMultiOwnerMcpPayload.dispatchPack?.overview?.assignmentDispatchPack?.ownerGroups !== 2 ||
  runtimeDispatchPackMultiOwnerMcpPayload.dispatchPack?.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeDispatchPackMultiOwnerMcpPayload.dispatchPack?.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeDispatchPackMultiOwnerMcpPayload.dispatchPack?.next?.assignmentLaunchStep?.workerId !== "<executor-worker>"
) {
  console.error("[smoke:runtime-dispatch-pack-mcp] expected MCP dispatch pack to expose launch plan when multiple owner groups are ready");
  console.error(runtimeDispatchPackMultiOwnerMcp.stderr || runtimeDispatchPackMultiOwnerMcp.stdout);
  process.exit(1);
}
const runtimeLeaderPackMultiOwnerMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_leader_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeLeaderPackMultiOwnerMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeLeaderPackMultiOwnerMcpInput,
  encoding: "utf8"
});
const runtimeLeaderPackMultiOwnerMcpLines = runtimeLeaderPackMultiOwnerMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeLeaderPackMultiOwnerMcpPayload = JSON.parse(JSON.parse(runtimeLeaderPackMultiOwnerMcpLines[1]).result.content[0].text);
if (
  runtimeLeaderPackMultiOwnerMcp.status !== 0 ||
  runtimeLeaderPackMultiOwnerMcpPayload.leaderPack?.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeLeaderPackMultiOwnerMcpPayload.leaderPack?.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeLeaderPackMultiOwnerMcpPayload.leaderPack?.overview?.assignmentDispatchPack?.ownerGroups !== 2 ||
  runtimeLeaderPackMultiOwnerMcpPayload.leaderPack?.overview?.assignmentDispatchBundle?.launches !== 2 ||
  runtimeLeaderPackMultiOwnerMcpPayload.leaderPack?.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeLeaderPackMultiOwnerMcpPayload.leaderPack?.next?.assignmentLaunchStep?.workerId !== "<executor-worker>"
) {
  console.error("[smoke:runtime-leader-pack-mcp] expected MCP leader pack to prioritize launch plan when multiple owner groups are ready");
  console.error(runtimeLeaderPackMultiOwnerMcp.stderr || runtimeLeaderPackMultiOwnerMcp.stdout);
  process.exit(1);
}
const runtimeDispatchPackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dispatch_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeDispatchPackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDispatchPackMappedMcpInput,
  encoding: "utf8"
});
const runtimeDispatchPackMappedMcpLines = runtimeDispatchPackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDispatchPackMappedMcpPayload = JSON.parse(JSON.parse(runtimeDispatchPackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeDispatchPackMappedMcp.status !== 0 ||
  runtimeDispatchPackMappedMcpPayload.dispatchPack?.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "executor")?.workerId !== "worker-executor" ||
  runtimeDispatchPackMappedMcpPayload.dispatchPack?.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "explore")?.workerId !== "worker-explore"
) {
  console.error("[smoke:runtime-dispatch-pack-mcp] expected MCP dispatch pack to carry mapped worker ids into batch dispatch surface");
  console.error(runtimeDispatchPackMappedMcp.stderr || runtimeDispatchPackMappedMcp.stdout);
  process.exit(1);
}
const runtimeWorkspacePackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_workspace_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeWorkspacePackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeWorkspacePackMappedMcpInput,
  encoding: "utf8"
});
const runtimeWorkspacePackMappedMcpLines = runtimeWorkspacePackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeWorkspacePackMappedMcpPayload = JSON.parse(JSON.parse(runtimeWorkspacePackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeWorkspacePackMappedMcp.status !== 0 ||
  runtimeWorkspacePackMappedMcpPayload.workspacePack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeWorkspacePackMappedMcpPayload.workspacePack?.surfaces?.assignmentLaunchPlan?.steps?.[1]?.workerId !== "worker-explore" ||
  runtimeWorkspacePackMappedMcpPayload.workspacePack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.previewCommand !== "node ./src/index.js task:assignment-preview --role executor --worker worker-executor --task task-2" ||
  runtimeWorkspacePackMappedMcpPayload.workspacePack?.surfaces?.assignmentLaunchPlan?.steps?.[1]?.previewCommand !== "node ./src/index.js task:assignment-preview --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:runtime-workspace-pack-mcp] expected MCP workspace pack to propagate mapped worker ids into launch plan");
  console.error(runtimeWorkspacePackMappedMcp.stderr || runtimeWorkspacePackMappedMcp.stdout);
  process.exit(1);
}
const runtimeExecutionPackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_execution_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeExecutionPackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeExecutionPackMappedMcpInput,
  encoding: "utf8"
});
const runtimeExecutionPackMappedMcpLines = runtimeExecutionPackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeExecutionPackMappedMcpPayload = JSON.parse(JSON.parse(runtimeExecutionPackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeExecutionPackMappedMcp.status !== 0 ||
  runtimeExecutionPackMappedMcpPayload.executionPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeExecutionPackMappedMcpPayload.executionPack?.surfaces?.assignmentLaunchPlan?.steps?.[1]?.workerId !== "worker-explore" ||
  runtimeExecutionPackMappedMcpPayload.executionPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner" ||
  runtimeExecutionPackMappedMcpPayload.executionPack?.surfaces?.assignmentLaunchPlan?.steps?.[1]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role explore --worker worker-explore --mode owner"
) {
  console.error("[smoke:runtime-execution-pack-mcp] expected MCP execution pack to propagate mapped worker ids into launch plan");
  console.error(runtimeExecutionPackMappedMcp.stderr || runtimeExecutionPackMappedMcp.stdout);
  process.exit(1);
}
const runtimeCloseoutPackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_closeout_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeCloseoutPackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeCloseoutPackMappedMcpInput,
  encoding: "utf8"
});
const runtimeCloseoutPackMappedMcpLines = runtimeCloseoutPackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeCloseoutPackMappedMcpPayload = JSON.parse(JSON.parse(runtimeCloseoutPackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeCloseoutPackMappedMcp.status !== 0 ||
  runtimeCloseoutPackMappedMcpPayload.closeoutPack?.surfaces?.leaderPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeCloseoutPackMappedMcpPayload.closeoutPack?.surfaces?.leaderPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner"
) {
  console.error("[smoke:runtime-closeout-pack-mcp] expected MCP closeout pack to pass worker mappings into nested leader pack");
  console.error(runtimeCloseoutPackMappedMcp.stderr || runtimeCloseoutPackMappedMcp.stdout);
  process.exit(1);
}
const runtimeControlPackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_control_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeControlPackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeControlPackMappedMcpInput,
  encoding: "utf8"
});
const runtimeControlPackMappedMcpLines = runtimeControlPackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeControlPackMappedMcpPayload = JSON.parse(JSON.parse(runtimeControlPackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeControlPackMappedMcp.status !== 0 ||
  runtimeControlPackMappedMcpPayload.controlPack?.surfaces?.workspacePack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeControlPackMappedMcpPayload.controlPack?.surfaces?.leaderPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor"
) {
  console.error("[smoke:runtime-control-pack-mcp] expected MCP control pack to pass worker mappings into nested workspace and leader packs");
  console.error(runtimeControlPackMappedMcp.stderr || runtimeControlPackMappedMcp.stdout);
  process.exit(1);
}
const runtimeLeaderPackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_leader_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeLeaderPackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeLeaderPackMappedMcpInput,
  encoding: "utf8"
});
const runtimeLeaderPackMappedMcpLines = runtimeLeaderPackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeLeaderPackMappedMcpPayload = JSON.parse(JSON.parse(runtimeLeaderPackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeLeaderPackMappedMcp.status !== 0 ||
  runtimeLeaderPackMappedMcpPayload.leaderPack?.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "executor")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role executor --worker worker-executor --task task-2" ||
  runtimeLeaderPackMappedMcpPayload.leaderPack?.surfaces?.assignmentDispatchPack?.groups?.find((group) => group.owner?.id === "explore")?.pickupCommand !== "node ./src/index.js task:assignment-pickup --role explore --worker worker-explore --task task-1"
) {
  console.error("[smoke:runtime-leader-pack-mcp] expected MCP leader pack to propagate mapped worker commands into batch dispatch surface");
  console.error(runtimeLeaderPackMappedMcp.stderr || runtimeLeaderPackMappedMcp.stdout);
  process.exit(1);
}
const runtimeQueuePackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_queue_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeQueuePackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeQueuePackMappedMcpInput,
  encoding: "utf8"
});
const runtimeQueuePackMappedMcpLines = runtimeQueuePackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeQueuePackMappedMcpPayload = JSON.parse(JSON.parse(runtimeQueuePackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeQueuePackMappedMcp.status !== 0 ||
  runtimeQueuePackMappedMcpPayload.queuePack?.recommendedSurface !== "leader:assignment-launch-plan" ||
  runtimeQueuePackMappedMcpPayload.queuePack?.recommendedReason !== "parallel_launch_plan_ready" ||
  runtimeQueuePackMappedMcpPayload.queuePack?.overview?.assignmentLaunchPlan?.steps !== 2 ||
  runtimeQueuePackMappedMcpPayload.queuePack?.next?.assignmentLaunchStep?.workerId !== "worker-executor" ||
  runtimeQueuePackMappedMcpPayload.queuePack?.surfaces?.assignmentLaunchPlan?.steps?.[1]?.workerId !== "worker-explore"
) {
  console.error("[smoke:runtime-queue-pack-mcp] expected MCP queue pack to surface mapped launch plan when multiple owner groups are ready");
  console.error(runtimeQueuePackMappedMcp.stderr || runtimeQueuePackMappedMcp.stdout);
  process.exit(1);
}
const assignmentPackExecutorMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_assignment_pack",
      arguments: { role: "executor", workerId: "worker-executor", mode: "owner" }
    }
  })
].join("\n") + "\n";
const assignmentPackExecutorMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: assignmentPackExecutorMcpInput,
  encoding: "utf8"
});
const assignmentPackExecutorMcpLines = assignmentPackExecutorMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const assignmentPackExecutorMcpPayload = JSON.parse(JSON.parse(assignmentPackExecutorMcpLines[1]).result.content[0].text);
if (
  assignmentPackExecutorMcp.status !== 0 ||
  assignmentPackExecutorMcpPayload.assignmentPack?.recommendedSurface !== "task:assignment-pickup --role executor --worker worker-executor --mode owner" ||
  assignmentPackExecutorMcpPayload.assignmentPack?.recommendedReason !== "leader_assignment_ready" ||
  assignmentPackExecutorMcpPayload.assignmentPack?.next?.assignment?.taskId !== "task-2" ||
  assignmentPackExecutorMcpPayload.assignmentPack?.next?.pickup?.kind !== "task_assignment_preview" ||
  assignmentPackExecutorMcpPayload.assignmentPack?.next?.pickup?.outcome !== "claimable"
) {
  console.error("[smoke:runtime-assignment-pack-mcp] expected explicit executor assignment surface");
  console.error(assignmentPackExecutorMcp.stderr || assignmentPackExecutorMcp.stdout);
  process.exit(1);
}
const taskAssignmentPreviewExecutorMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_assignment_preview",
      arguments: { role: "executor", workerId: "worker-executor", mode: "owner" }
    }
  })
].join("\n") + "\n";
const taskAssignmentPreviewExecutorMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskAssignmentPreviewExecutorMcpInput,
  encoding: "utf8"
});
const taskAssignmentPreviewExecutorMcpLines = taskAssignmentPreviewExecutorMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskAssignmentPreviewExecutorMcpPayload = JSON.parse(JSON.parse(taskAssignmentPreviewExecutorMcpLines[1]).result.content[0].text);
if (
  taskAssignmentPreviewExecutorMcp.status !== 0 ||
  taskAssignmentPreviewExecutorMcpPayload.assignmentPreview?.outcome !== "claimable" ||
  taskAssignmentPreviewExecutorMcpPayload.assignmentPreview?.recommendedReason !== "claimable_assignment_preview" ||
  taskAssignmentPreviewExecutorMcpPayload.assignmentPreview?.metadata?.hasBrief !== true ||
  taskAssignmentPreviewExecutorMcpPayload.assignmentPreview?.metadata?.taskId !== "task-2" ||
  taskAssignmentPreviewExecutorMcpPayload.assignmentPreview?.task?.id !== "task-2"
) {
  console.error("[smoke:task-assignment-preview-mcp] expected explicit executor assignment preview payload");
  console.error(taskAssignmentPreviewExecutorMcp.stderr || taskAssignmentPreviewExecutorMcp.stdout);
  process.exit(1);
}
const taskAssignmentPickupExecutorMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_assignment_pickup",
      arguments: { role: "executor", workerId: "worker-executor", mode: "owner" }
    }
  })
].join("\n") + "\n";
const taskAssignmentPickupExecutorMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskAssignmentPickupExecutorMcpInput,
  encoding: "utf8"
});
const taskAssignmentPickupExecutorMcpLines = taskAssignmentPickupExecutorMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskAssignmentPickupExecutorMcpPayload = JSON.parse(JSON.parse(taskAssignmentPickupExecutorMcpLines[1]).result.content[0].text);
if (
  taskAssignmentPickupExecutorMcp.status !== 0 ||
  taskAssignmentPickupExecutorMcpPayload.assignmentPickup?.outcome !== "claimed" ||
  taskAssignmentPickupExecutorMcpPayload.assignmentPickup?.recommendedReason !== "claimable_assignment_work" ||
  taskAssignmentPickupExecutorMcpPayload.assignmentPickup?.task?.id !== "task-2" ||
  taskAssignmentPickupExecutorMcpPayload.assignmentPickup?.task?.claimedBy !== "worker-executor"
) {
  console.error("[smoke:task-assignment-pickup-mcp] expected explicit executor assignment pickup payload");
  console.error(taskAssignmentPickupExecutorMcp.stderr || taskAssignmentPickupExecutorMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("dashboard-task-blocked", [
  "./src/index.js",
  "task:add",
  "--title",
  "dashboard blocked task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "blocked visible",
  "--verification",
  "dashboard shows blocked"
]);
run("dashboard-task-blocked-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "worker-blocked"]);
run("dashboard-task-blocked-mark", ["./src/index.js", "task:block", "--id", "task-1", "--by", "worker-blocked"]);
run("dashboard-task-review", [
  "./src/index.js",
  "task:add",
  "--title",
  "dashboard review task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/mcp.js",
  "--acceptance",
  "review visible",
  "--verification",
  "dashboard shows review"
]);
run("dashboard-task-review-claim", ["./src/index.js", "task:claim", "--id", "task-2", "--by", "worker-review"]);
run("dashboard-task-review-ready", ["./src/index.js", "task:review", "--id", "task-2", "--by", "worker-review"]);
run("dashboard-task-active", [
  "./src/index.js",
  "task:add",
  "--title",
  "dashboard active task",
  "--owner",
  "explore",
  "--verifier",
  "reviewer",
  "--scope",
  "src/state.js",
  "--acceptance",
  "active visible",
  "--verification",
  "dashboard shows active"
]);
run("dashboard-task-active-claim", ["./src/index.js", "task:claim", "--id", "task-3", "--by", "worker-active"]);
run("dashboard-swarm", [
  "./src/index.js",
  "swarm:init",
  "--objective",
  "Dashboard swarm",
  "--owner",
  "leader",
  "--lanes",
  JSON.stringify([
    {
      lane: "lane-dashboard",
      summary: "Queue visible in dashboard",
      owner: "executor",
      verifier: "tester",
      scope: ["src/mcp.js"],
      acceptance: ["dashboard queue visible"],
      verification: ["dashboard leader queue available"]
    }
  ])
]);
run("dashboard-swarm-queue", ["./src/index.js", "swarm:queue", "--id", "swarm-1"]);
const runtimeActivityCli = JSON.parse(
  run("runtime-activity-cli", ["./src/index.js", "runtime:activity"]).stdout
).activity;
if (
  runtimeActivityCli.recommendedReason !== "created_event_latest" ||
  runtimeActivityCli.counts?.totalEntries < 6 ||
  runtimeActivityCli.next?.type !== "created" ||
  runtimeActivityCli.next?.taskId !== "task-4" ||
  runtimeActivityCli.entries?.some((entry) => entry.type === "blocked" && entry.taskId === "task-1") !== true ||
  runtimeActivityCli.entries?.some((entry) => entry.type === "ready_for_review" && entry.taskId === "task-2") !== true ||
  runtimeActivityCli.entries?.some((entry) => entry.type === "claimed" && entry.taskId === "task-1") !== true
) {
  console.error("[smoke:runtime-activity] expected CLI runtime activity stream");
  process.exit(1);
}
const runtimeCloseoutCli = JSON.parse(
  run("runtime-closeout-cli", ["./src/index.js", "runtime:closeout"]).stdout
).closeout;
if (
  runtimeCloseoutCli.recommendedReason !== "no_closeout_ready" ||
  runtimeCloseoutCli.counts?.tasksReady !== 0 ||
  runtimeCloseoutCli.counts?.swarmsReady !== 0 ||
  runtimeCloseoutCli.counts?.totalReady !== 0 ||
  runtimeCloseoutCli.next !== null ||
  runtimeCloseoutCli.tasks?.length !== 0
) {
  console.error("[smoke:runtime-closeout] expected CLI runtime closeout workspace");
  process.exit(1);
}
const runtimeCloseoutPackCli = JSON.parse(
  run("runtime-closeout-pack-cli", ["./src/index.js", "runtime:closeout-pack"]).stdout
).closeoutPack;
if (
  runtimeCloseoutPackCli.recommendedSurface !== "runtime:closeout" ||
  runtimeCloseoutPackCli.recommendedReason !== "no_closeout_ready" ||
  runtimeCloseoutPackCli.metadata?.hasCloseout !== false ||
  runtimeCloseoutPackCli.metadata?.hasSummaryCloseout !== false ||
  runtimeCloseoutPackCli.metadata?.hasLeaderCloseout !== false ||
  runtimeCloseoutPackCli.counts?.surfacedNextEntries !== Object.values(runtimeCloseoutPackCli.next ?? {}).filter(Boolean).length ||
  runtimeCloseoutPackCli.next?.closeout !== null ||
  runtimeCloseoutPackCli.overview?.closeout?.totalReady !== 0 ||
  runtimeCloseoutPackCli.surfaces?.summaryPack?.overview?.closeout?.totalReady !== 0
) {
  console.error("[smoke:runtime-closeout-pack] expected CLI closeout pack to reflect empty closeout state");
  process.exit(1);
}
const runtimeDashboardCli = JSON.parse(
  run("runtime-dashboard-cli", ["./src/index.js", "runtime:dashboard"]).stdout
).dashboard;
if (
  runtimeDashboardCli.recommendedReason !== "blocked_tasks_visible" ||
  runtimeDashboardCli.counts?.blockedTasks !== 1 ||
  runtimeDashboardCli.counts?.pendingReview !== 1 ||
  runtimeDashboardCli.counts?.activeClaimed !== 1 ||
  runtimeDashboardCli.leader?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-dashboard] expected CLI dashboard counts and leader queue");
  process.exit(1);
}
const runtimeDispatchCli = JSON.parse(
  run("runtime-dispatch-cli", ["./src/index.js", "runtime:dispatch"]).stdout
).dispatch;
if (
  runtimeDispatchCli.recommendedReason !== "next_dispatch_ready" ||
  runtimeDispatchCli.counts?.ownerGroups !== 1 ||
  runtimeDispatchCli.counts?.totalAssignments !== 1 ||
  runtimeDispatchCli.next?.lane !== "lane-dashboard" ||
  runtimeDispatchCli.groups?.[0]?.owner?.id !== "executor" ||
  runtimeDispatchCli.groups?.[0]?.assignments?.[0]?.taskBrief?.task?.id !== "task-4"
) {
  console.error("[smoke:runtime-dispatch] expected CLI owner-grouped dispatch workspace");
  process.exit(1);
}
const runtimeDispatchPackCli = JSON.parse(
  run("runtime-dispatch-pack-cli", ["./src/index.js", "runtime:dispatch-pack"]).stdout
).dispatchPack;
if (
  runtimeDispatchPackCli.recommendedSurface !== "runtime:dispatch" ||
  runtimeDispatchPackCli.recommendedReason !== "dispatch_priority" ||
  runtimeDispatchPackCli.metadata?.hasDispatch !== true ||
  runtimeDispatchPackCli.metadata?.hasRole !== true ||
  runtimeDispatchPackCli.metadata?.hasHandoff !== true ||
  runtimeDispatchPackCli.counts?.surfacedNextEntries !== Object.values(runtimeDispatchPackCli.next ?? {}).filter(Boolean).length ||
  runtimeDispatchPackCli.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeDispatchPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeDispatchPackCli.overview?.dispatch?.totalAssignments !== 1 ||
  runtimeDispatchPackCli.surfaces?.roles?.next?.role?.id !== "tester"
) {
  console.error("[smoke:runtime-dispatch-pack] expected CLI dispatch pack to recommend dispatch");
  process.exit(1);
}
const runtimeFocusCli = JSON.parse(
  run("runtime-focus-cli", ["./src/index.js", "runtime:focus"]).stdout
).focus;
if (
  runtimeFocusCli.recommendedReason !== "blocked_focus_priority" ||
  runtimeFocusCli.focus?.type !== "blocked_task" ||
  runtimeFocusCli.focus?.taskId !== "task-1" ||
  runtimeFocusCli.focus?.recommendedNextAction !== "resolve_blocker_and_requeue" ||
  runtimeFocusCli.sources?.review?.totalPendingReview !== 1 ||
  runtimeFocusCli.sources?.dispatch?.totalAssignments !== 1
) {
  console.error("[smoke:runtime-focus] expected CLI runtime focus to prioritize blocked work");
  process.exit(1);
}
const runtimeQueuePackCli = JSON.parse(
  run("runtime-queue-pack-cli", ["./src/index.js", "runtime:queue-pack"]).stdout
).queuePack;
if (
  runtimeQueuePackCli.recommendedSurface !== "leader:assignment-dispatch-bundle" ||
  runtimeQueuePackCli.recommendedReason !== "assignment_launch_ready" ||
  runtimeQueuePackCli.metadata?.hasQueue !== true ||
  runtimeQueuePackCli.metadata?.hasFocus !== true ||
  runtimeQueuePackCli.metadata?.hasAssignmentLaunch !== true ||
  runtimeQueuePackCli.counts?.surfacedNextEntries !== Object.values(runtimeQueuePackCli.next ?? {}).filter(Boolean).length ||
  runtimeQueuePackCli.next?.queue?.swarmId !== "swarm-1" ||
  runtimeQueuePackCli.next?.focus?.taskId !== "task-1" ||
  runtimeQueuePackCli.next?.assignmentLaunch?.workerId !== "<executor-worker>" ||
  runtimeQueuePackCli.overview?.assignmentDispatchBundle?.launches !== 1 ||
  runtimeQueuePackCli.surfaces?.dashboard?.leader?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-queue-pack] expected CLI queue pack to surface assignment launch context before raw leader queue");
  process.exit(1);
}
const runtimeHandoffsCli = JSON.parse(
  run("runtime-handoffs-cli", ["./src/index.js", "runtime:handoffs"]).stdout
).handoffs;
if (
  runtimeHandoffsCli.recommendedReason !== "review_decision_ready" ||
  runtimeHandoffsCli.counts?.actorGroups !== 3 ||
  runtimeHandoffsCli.counts?.totalHandoffs !== 3 ||
  runtimeHandoffsCli.counts?.reviewDecisions !== 1 ||
  runtimeHandoffsCli.counts?.blockedRecoveries !== 1 ||
  runtimeHandoffsCli.counts?.ownerClaims !== 1 ||
  runtimeHandoffsCli.next?.taskId !== "task-2" ||
  runtimeHandoffsCli.next?.actor?.id !== "tester" ||
  runtimeHandoffsCli.groups?.some((group) => group.actor?.id === "tester" && group.handoffs?.[0]?.taskId === "task-2") !== true ||
  runtimeHandoffsCli.groups?.some((group) => group.actor?.id === "executor" && group.handoffs?.some((handoff) => handoff.taskId === "task-1" && handoff.handoffType === "blocked_recovery")) !== true ||
  runtimeHandoffsCli.groups?.some((group) => group.actor?.id === "executor" && group.handoffs?.some((handoff) => handoff.taskId === "task-4" && handoff.handoffType === "owner_claim")) !== true
) {
  console.error("[smoke:runtime-handoffs-cli] expected CLI next-actor handoff workspace");
  process.exit(1);
}
const runtimeRecoveryCli = JSON.parse(
  run("runtime-recovery-cli", ["./src/index.js", "runtime:recovery"]).stdout
).recovery;
if (
  runtimeRecoveryCli.recommendedReason !== "blocked_recovery_priority" ||
  runtimeRecoveryCli.counts?.recoveryGroups < 1 ||
  runtimeRecoveryCli.counts?.blocked !== 1 ||
  runtimeRecoveryCli.next?.taskId !== "task-1" ||
  runtimeRecoveryCli.next?.recoveryType !== "blocked_recovery" ||
  runtimeRecoveryCli.groups?.some((group) => group.recoveryType === "blocked_recovery" && group.entries?.[0]?.taskId === "task-1") !== true
) {
  console.error("[smoke:runtime-recovery] expected CLI recovery workspace");
  process.exit(1);
}
const runtimeRecoveryPackCli = JSON.parse(
  run("runtime-recovery-pack-cli", ["./src/index.js", "runtime:recovery-pack"]).stdout
).recoveryPack;
if (
  runtimeRecoveryPackCli.recommendedSurface !== "runtime:recovery" ||
  runtimeRecoveryPackCli.recommendedReason !== "blocked_recovery_priority" ||
  runtimeRecoveryPackCli.metadata?.hasRecovery !== true ||
  runtimeRecoveryPackCli.metadata?.hasHandoff !== true ||
  runtimeRecoveryPackCli.metadata?.hasFocus !== true ||
  runtimeRecoveryPackCli.counts?.surfacedNextEntries !== Object.values(runtimeRecoveryPackCli.next ?? {}).filter(Boolean).length ||
  runtimeRecoveryPackCli.next?.recovery?.taskId !== "task-1" ||
  runtimeRecoveryPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeRecoveryPackCli.overview?.recovery?.blocked !== 1 ||
  runtimeRecoveryPackCli.surfaces?.focus?.focus?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-recovery-pack] expected CLI recovery pack to recommend recovery");
  process.exit(1);
}
const runtimeSummaryPackCli = JSON.parse(
  run("runtime-summary-pack-cli", ["./src/index.js", "runtime:summary-pack"]).stdout
).summaryPack;
if (
  runtimeSummaryPackCli.recommendedSurface !== "runtime:focus" ||
  runtimeSummaryPackCli.recommendedReason !== "blocked_focus_priority" ||
  runtimeSummaryPackCli.metadata?.hasFocus !== true ||
  runtimeSummaryPackCli.metadata?.hasRecovery !== true ||
  runtimeSummaryPackCli.counts?.surfacedNextEntries !== Object.values(runtimeSummaryPackCli.next ?? {}).filter(Boolean).length ||
  runtimeSummaryPackCli.focus?.focus?.taskId !== "task-1" ||
  runtimeSummaryPackCli.next?.recovery?.taskId !== "task-1" ||
  runtimeSummaryPackCli.overview?.dashboard?.blockedTasks !== 1
) {
  console.error("[smoke:runtime-summary-pack] expected CLI summary pack to recommend focus");
  process.exit(1);
}
const runtimeLeaderPackCli = JSON.parse(
  run("runtime-leader-pack-cli", ["./src/index.js", "runtime:leader-pack"]).stdout
).leaderPack;
if (
  runtimeLeaderPackCli.recommendedSurface !== "runtime:dispatch" ||
  runtimeLeaderPackCli.recommendedReason !== "dispatch_priority" ||
  runtimeLeaderPackCli.metadata?.hasWorkspace !== true ||
  runtimeLeaderPackCli.metadata?.hasQueue !== true ||
  runtimeLeaderPackCli.metadata?.hasDispatch !== true ||
  runtimeLeaderPackCli.counts?.surfacedNextEntries !== Object.values(runtimeLeaderPackCli.next ?? {}).filter(Boolean).length ||
  runtimeLeaderPackCli.next?.workspace?.swarmId !== "swarm-1" ||
  runtimeLeaderPackCli.overview?.dispatch?.totalAssignments !== 1 ||
  runtimeLeaderPackCli.surfaces?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-leader-pack] expected CLI leader pack to recommend dispatch");
  process.exit(1);
}
const runtimeOperatorPackCli = JSON.parse(
  run("runtime-operator-pack-cli", ["./src/index.js", "runtime:operator-pack"]).stdout
).operatorPack;
if (
  runtimeOperatorPackCli.recommendedSurface !== "runtime:focus" ||
  runtimeOperatorPackCli.recommendedReason !== "blocked_focus_priority" ||
  runtimeOperatorPackCli.metadata?.hasFocus !== true ||
  runtimeOperatorPackCli.metadata?.hasHandoff !== true ||
  runtimeOperatorPackCli.metadata?.hasAlert !== true ||
  runtimeOperatorPackCli.counts?.surfacedNextEntries !== Object.values(runtimeOperatorPackCli.next ?? {}).filter(Boolean).length ||
  runtimeOperatorPackCli.focus?.focus?.taskId !== "task-1" ||
  runtimeOperatorPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeOperatorPackCli.overview?.alerts?.high !== 1 ||
  runtimeOperatorPackCli.surfaces?.closeout?.counts?.tasksReady !== 0
) {
  console.error("[smoke:runtime-operator-pack] expected CLI operator pack to recommend focus");
  process.exit(1);
}
const runtimeControlPackCli = JSON.parse(
  run("runtime-control-pack-cli", ["./src/index.js", "runtime:control-pack"]).stdout
).controlPack;
if (
  runtimeControlPackCli.recommendedSurface !== "runtime:summary-pack" ||
  runtimeControlPackCli.recommendedReason !== "summary_priority" ||
  runtimeControlPackCli.metadata?.hasSummary !== true ||
  runtimeControlPackCli.metadata?.hasWorkspace !== true ||
  runtimeControlPackCli.metadata?.hasOperator !== true ||
  runtimeControlPackCli.metadata?.hasLeader !== true ||
  runtimeControlPackCli.counts?.surfacedNextEntries !== Object.values(runtimeControlPackCli.next ?? {}).filter(Boolean).length ||
  runtimeControlPackCli.next?.summary?.taskId !== "task-1" ||
  runtimeControlPackCli.next?.workspace?.recovery?.taskId !== "task-1" ||
  runtimeControlPackCli.next?.operator?.handoff?.taskId !== "task-2" ||
  runtimeControlPackCli.next?.leader?.dispatch?.lane !== "lane-dashboard"
) {
  console.error("[smoke:runtime-control-pack] expected CLI control pack to recommend summary pack");
  process.exit(1);
}
const runtimeSummaryPackMappedCli = JSON.parse(
  run("runtime-summary-pack-mapped-cli", [
    "./src/index.js",
    "runtime:summary-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).summaryPack;
if (
  runtimeSummaryPackMappedCli.surfaces?.closeout?.counts?.totalReady !== 0 ||
  runtimeSummaryPackMappedCli.recommendedSurface !== "runtime:focus" ||
  runtimeSummaryPackMappedCli.recommendedReason !== "blocked_focus_priority" ||
  runtimeSummaryPackMappedCli.overview?.assignmentLaunchPlan?.steps !== 1 ||
  runtimeSummaryPackMappedCli.overview?.assignmentDispatchBundle?.launches !== 1 ||
  runtimeSummaryPackMappedCli.next?.assignmentLaunchStep?.workerId !== "worker-executor" ||
  runtimeSummaryPackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeSummaryPackMappedCli.surfaces?.assignmentLaunchPlan?.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner"
) {
  console.error("[smoke:runtime-summary-pack] expected CLI summary pack to preserve focus while exposing compact mapped launch context");
  process.exit(1);
}
const runtimeCloseoutPackMappedCli = JSON.parse(
  run("runtime-closeout-pack-mapped-cli", [
    "./src/index.js",
    "runtime:closeout-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).closeoutPack;
if (
  runtimeCloseoutPackMappedCli.surfaces?.leaderPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeCloseoutPackMappedCli.surfaces?.leaderPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner"
) {
  console.error("[smoke:runtime-closeout-pack] expected CLI closeout pack to pass worker mappings into nested leader pack");
  process.exit(1);
}
const runtimeControlPackMappedCli = JSON.parse(
  run("runtime-control-pack-mapped-cli", [
    "./src/index.js",
    "runtime:control-pack",
    "--workers",
    JSON.stringify({ executor: "worker-executor", explore: "worker-explore" })
  ]).stdout
).controlPack;
if (
  runtimeControlPackMappedCli.surfaces?.workspacePack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeControlPackMappedCli.surfaces?.leaderPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor"
) {
  console.error("[smoke:runtime-control-pack] expected CLI control pack to pass worker mappings into nested workspace and leader packs");
  process.exit(1);
}
const runtimeSignalPackCli = JSON.parse(
  run("runtime-signal-pack-cli", ["./src/index.js", "runtime:signal-pack"]).stdout
).signalPack;
if (
  runtimeSignalPackCli.recommendedSurface !== "runtime:focus" ||
  runtimeSignalPackCli.recommendedReason !== "blocked_focus_priority" ||
  runtimeSignalPackCli.metadata?.hasFocus !== true ||
  runtimeSignalPackCli.metadata?.hasAlert !== true ||
  runtimeSignalPackCli.metadata?.hasActivity !== true ||
  runtimeSignalPackCli.metadata?.hasRole !== true ||
  runtimeSignalPackCli.counts?.surfacedNextEntries !== Object.values(runtimeSignalPackCli.next ?? {}).filter(Boolean).length ||
  runtimeSignalPackCli.next?.focus?.taskId !== "task-1" ||
  runtimeSignalPackCli.next?.alert?.taskId !== "task-1" ||
  runtimeSignalPackCli.next?.activity?.taskId !== "task-4" ||
  runtimeSignalPackCli.next?.role?.role?.id !== "tester"
) {
  console.error("[smoke:runtime-signal-pack] expected CLI signal pack to recommend focus");
  process.exit(1);
}
const runtimeHandoffPackCli = JSON.parse(
  run("runtime-handoff-pack-cli", ["./src/index.js", "runtime:handoff-pack"]).stdout
).handoffPack;
if (
  runtimeHandoffPackCli.recommendedSurface !== "runtime:handoffs" ||
  runtimeHandoffPackCli.recommendedReason !== "review_handoffs_waiting" ||
  runtimeHandoffPackCli.metadata?.hasHandoff !== true ||
  runtimeHandoffPackCli.metadata?.hasDispatch !== true ||
  runtimeHandoffPackCli.metadata?.hasReview !== true ||
  runtimeHandoffPackCli.metadata?.hasRecovery !== true ||
  runtimeHandoffPackCli.counts?.surfacedNextEntries !== Object.values(runtimeHandoffPackCli.next ?? {}).filter(Boolean).length ||
  runtimeHandoffPackCli.next?.handoff?.taskId !== "task-2" ||
  runtimeHandoffPackCli.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeHandoffPackCli.next?.review?.taskId !== "task-2" ||
  runtimeHandoffPackCli.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-handoff-pack] expected CLI handoff pack to recommend handoffs");
  process.exit(1);
}
const runtimeTriagePackCli = JSON.parse(
  run("runtime-triage-pack-cli", ["./src/index.js", "runtime:triage-pack"]).stdout
).triagePack;
if (
  runtimeTriagePackCli.recommendedSurface !== "runtime:focus" ||
  runtimeTriagePackCli.recommendedReason !== "blocked_focus_priority" ||
  runtimeTriagePackCli.metadata?.hasFocus !== true ||
  runtimeTriagePackCli.metadata?.hasAlert !== true ||
  runtimeTriagePackCli.metadata?.hasReview !== true ||
  runtimeTriagePackCli.metadata?.hasRecovery !== true ||
  runtimeTriagePackCli.counts?.surfacedNextEntries !== Object.values(runtimeTriagePackCli.next ?? {}).filter(Boolean).length ||
  runtimeTriagePackCli.next?.focus?.taskId !== "task-1" ||
  runtimeTriagePackCli.next?.alert?.taskId !== "task-1" ||
  runtimeTriagePackCli.next?.review?.taskId !== "task-2" ||
  runtimeTriagePackCli.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-triage-pack] expected CLI triage pack to recommend focus");
  process.exit(1);
}
const runtimeSessionPackCli = JSON.parse(
  run("runtime-session-pack-cli", ["./src/index.js", "runtime:session-pack", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).sessionPack;
if (
  runtimeSessionPackCli.recommendedSurface !== "worker:closeout" ||
  runtimeSessionPackCli.recommendedReason !== "worker_priority" ||
  runtimeSessionPackCli.metadata?.hasWorker !== true ||
  runtimeSessionPackCli.metadata?.hasOwner !== true ||
  runtimeSessionPackCli.metadata?.hasVerifier !== true ||
  runtimeSessionPackCli.metadata?.hasRole !== true ||
  runtimeSessionPackCli.counts?.surfacedNextEntries !== Object.values(runtimeSessionPackCli.next ?? {}).filter(Boolean).length ||
  runtimeSessionPackCli.next?.verifier?.review?.taskId !== "task-2" ||
  runtimeSessionPackCli.next?.role?.lane !== "verifier" ||
  runtimeSessionPackCli.surfaces?.verifierPack?.recommendedSurface !== "worker:closeout"
) {
  console.error("[smoke:runtime-session-pack] expected CLI session pack to recommend verifier next");
  process.exit(1);
}
const runtimeRolePackCli = JSON.parse(
  run("runtime-role-pack-cli", ["./src/index.js", "runtime:role-pack", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).rolePack;
if (
  runtimeRolePackCli.recommendedSurface !== "worker:closeout" ||
  runtimeRolePackCli.recommendedReason !== "session_priority" ||
  runtimeRolePackCli.metadata?.hasRole !== true ||
  runtimeRolePackCli.metadata?.hasSession !== true ||
  runtimeRolePackCli.metadata?.hasOwner !== true ||
  runtimeRolePackCli.metadata?.hasVerifier !== true ||
  runtimeRolePackCli.counts?.surfacedNextEntries !== Object.values(runtimeRolePackCli.next ?? {}).filter(Boolean).length ||
  runtimeRolePackCli.next?.role?.lane !== "verifier" ||
  runtimeRolePackCli.next?.session?.verifier?.review?.taskId !== "task-2" ||
  runtimeRolePackCli.surfaces?.sessionPack?.recommendedSurface !== "worker:closeout"
) {
  console.error("[smoke:runtime-role-pack] expected CLI role pack to recommend worker closeout");
  process.exit(1);
}
const runtimeExecutionPackCli = JSON.parse(
  run("runtime-execution-pack-cli", ["./src/index.js", "runtime:execution-pack"]).stdout
).executionPack;
if (
  runtimeExecutionPackCli.recommendedSurface !== "runtime:focus" ||
  runtimeExecutionPackCli.recommendedReason !== "blocked_focus_priority" ||
  runtimeExecutionPackCli.metadata?.hasFocus !== true ||
  runtimeExecutionPackCli.metadata?.hasDispatch !== true ||
  runtimeExecutionPackCli.metadata?.hasAssignmentLaunch !== true ||
  runtimeExecutionPackCli.metadata?.hasAssignmentLaunchStep !== true ||
  runtimeExecutionPackCli.metadata?.hasRole !== true ||
  runtimeExecutionPackCli.metadata?.hasQueue !== true ||
  runtimeExecutionPackCli.counts?.surfacedNextEntries !== Object.values(runtimeExecutionPackCli.next ?? {}).filter(Boolean).length ||
  runtimeExecutionPackCli.next?.focus?.taskId !== "task-1" ||
  runtimeExecutionPackCli.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeExecutionPackCli.next?.role?.role?.id !== "tester" ||
  runtimeExecutionPackCli.next?.queue?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-execution-pack] expected CLI execution pack to recommend focus");
  process.exit(1);
}
const runtimeReviewCli = JSON.parse(
  run("runtime-review-cli", ["./src/index.js", "runtime:review"]).stdout
).review;
if (
  runtimeReviewCli.recommendedReason !== "review_decision_ready" ||
  runtimeReviewCli.counts?.verifierGroups !== 1 ||
  runtimeReviewCli.counts?.totalPendingReview !== 1 ||
  runtimeReviewCli.next?.taskId !== "task-2" ||
  runtimeReviewCli.groups?.[0]?.verifier?.id !== "tester" ||
  runtimeReviewCli.groups?.[0]?.tasks?.[0]?.taskBrief?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-review] expected CLI verifier-grouped review workspace");
  process.exit(1);
}
const runtimeReviewPackCli = JSON.parse(
  run("runtime-review-pack-cli", ["./src/index.js", "runtime:review-pack", "--role", "tester", "--worker", "tester-worker"]).stdout
).reviewPack;
if (
  runtimeReviewPackCli.recommendedSurface !== "runtime:verifier-pack" ||
  runtimeReviewPackCli.recommendedReason !== "verifier_bundle_available" ||
  runtimeReviewPackCli.metadata?.hasReview !== true ||
  runtimeReviewPackCli.metadata?.hasRole !== true ||
  runtimeReviewPackCli.metadata?.hasVerifier !== true ||
  runtimeReviewPackCli.counts?.surfacedNextEntries !== Object.values(runtimeReviewPackCli.next ?? {}).filter(Boolean).length ||
  runtimeReviewPackCli.next?.review?.taskId !== "task-2" ||
  runtimeReviewPackCli.next?.verifier?.decision?.id !== "task-2" ||
  runtimeReviewPackCli.overview?.review?.totalPendingReview !== 1 ||
  runtimeReviewPackCli.surfaces?.verifierPack?.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-review-pack] expected CLI review pack to recommend verifier pack");
  process.exit(1);
}
const runtimeAlertsCli = JSON.parse(
  run("runtime-alerts-cli", ["./src/index.js", "runtime:alerts"]).stdout
).alerts;
if (
  runtimeAlertsCli.recommendedReason !== "blocked_tasks_priority" ||
  runtimeAlertsCli.counts?.high !== 1 ||
  runtimeAlertsCli.counts?.medium < 1 ||
  runtimeAlertsCli.alerts?.[0]?.kind !== "blocked_task"
) {
  console.error("[smoke:runtime-alerts] expected CLI alert stream with blocked task first");
  process.exit(1);
}
const runtimeRolesCli = JSON.parse(
  run("runtime-roles-cli", ["./src/index.js", "runtime:roles"]).stdout
).roles;
if (
  runtimeRolesCli.recommendedReason !== "review_role_pressure" ||
  runtimeRolesCli.counts?.withPendingReview !== 1 ||
  runtimeRolesCli.counts?.withBlockedOwnerWork !== 1 ||
  runtimeRolesCli.counts?.withClaimableOwnerWork !== 1 ||
  runtimeRolesCli.next?.role?.id !== "tester" ||
  runtimeRolesCli.roles?.find((entry) => entry.role?.id === "tester")?.nextAction?.lane !== "verifier" ||
  runtimeRolesCli.roles?.find((entry) => entry.role?.id === "executor")?.counts?.ownerBlocked !== 1 ||
  runtimeRolesCli.roles?.find((entry) => entry.role?.id === "explore")?.counts?.ownerClaimed !== 1
) {
  console.error("[smoke:runtime-roles] expected CLI runtime role pressure ordering");
  process.exit(1);
}
const runtimeWorkspacePackCli = JSON.parse(
  run("runtime-workspace-pack-cli", ["./src/index.js", "runtime:workspace-pack"]).stdout
).workspacePack;
if (
  runtimeWorkspacePackCli.recommendedSurface !== "runtime:recovery" ||
  runtimeWorkspacePackCli.recommendedReason !== "blocked_tasks_priority" ||
  runtimeWorkspacePackCli.metadata?.hasDashboard !== true ||
  runtimeWorkspacePackCli.metadata?.hasDispatch !== true ||
  runtimeWorkspacePackCli.metadata?.hasReview !== true ||
  runtimeWorkspacePackCli.metadata?.hasRecovery !== true ||
  runtimeWorkspacePackCli.counts?.surfacedNextEntries !== Object.values(runtimeWorkspacePackCli.next ?? {}).filter(Boolean).length ||
  runtimeWorkspacePackCli.next?.dashboard?.swarmId !== "swarm-1" ||
  runtimeWorkspacePackCli.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeWorkspacePackCli.next?.review?.taskId !== "task-2" ||
  runtimeWorkspacePackCli.next?.recovery?.taskId !== "task-1" ||
  runtimeWorkspacePackCli.overview?.dashboard?.blockedTasks !== 1
) {
  console.error("[smoke:runtime-workspace-pack] expected CLI workspace pack to recommend recovery");
  process.exit(1);
}
const runtimeActivityMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_activity",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeActivityMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeActivityMcpInput,
  encoding: "utf8"
});
const runtimeActivityMcpLines = runtimeActivityMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeActivityMcpPayload = JSON.parse(JSON.parse(runtimeActivityMcpLines[1]).result.content[0].text);
if (
  runtimeActivityMcp.status !== 0 ||
  runtimeActivityMcpPayload.activity?.recommendedReason !== "created_event_latest" ||
  runtimeActivityMcpPayload.activity?.counts?.totalEntries < 6 ||
  runtimeActivityMcpPayload.activity?.next?.type !== "created" ||
  runtimeActivityMcpPayload.activity?.next?.taskId !== "task-4" ||
  runtimeActivityMcpPayload.activity?.entries?.some((entry) => entry.type === "blocked" && entry.taskId === "task-1") !== true
) {
  console.error("[smoke:runtime-activity-mcp] expected MCP runtime activity");
  console.error(runtimeActivityMcp.stderr || runtimeActivityMcp.stdout);
  process.exit(1);
}
const runtimeAlertsMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_alerts",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeAlertsMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeAlertsMcpInput,
  encoding: "utf8"
});
const runtimeAlertsMcpLines = runtimeAlertsMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeAlertsMcpPayload = JSON.parse(JSON.parse(runtimeAlertsMcpLines[1]).result.content[0].text);
if (
  runtimeAlertsMcp.status !== 0 ||
  runtimeAlertsMcpPayload.alerts?.recommendedReason !== "blocked_tasks_priority" ||
  runtimeAlertsMcpPayload.alerts?.counts?.high !== 1 ||
  runtimeAlertsMcpPayload.alerts?.alerts?.[0]?.kind !== "blocked_task"
) {
  console.error("[smoke:runtime-alerts-mcp] expected MCP runtime alerts");
  console.error(runtimeAlertsMcp.stderr || runtimeAlertsMcp.stdout);
  process.exit(1);
}
const runtimeCloseoutMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_closeout",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeCloseoutMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeCloseoutMcpInput,
  encoding: "utf8"
});
const runtimeCloseoutMcpLines = runtimeCloseoutMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeCloseoutMcpPayload = JSON.parse(JSON.parse(runtimeCloseoutMcpLines[1]).result.content[0].text);
if (
  runtimeCloseoutMcp.status !== 0 ||
  runtimeCloseoutMcpPayload.closeout?.recommendedReason !== "no_closeout_ready" ||
  runtimeCloseoutMcpPayload.closeout?.counts?.tasksReady !== 0 ||
  runtimeCloseoutMcpPayload.closeout?.next !== null
) {
  console.error("[smoke:runtime-closeout-mcp] expected MCP runtime closeout");
  console.error(runtimeCloseoutMcp.stderr || runtimeCloseoutMcp.stdout);
  process.exit(1);
}
const runtimeCloseoutPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_closeout_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeCloseoutPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeCloseoutPackMcpInput,
  encoding: "utf8"
});
const runtimeCloseoutPackMcpLines = runtimeCloseoutPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeCloseoutPackMcpPayload = JSON.parse(JSON.parse(runtimeCloseoutPackMcpLines[1]).result.content[0].text);
if (
  runtimeCloseoutPackMcp.status !== 0 ||
  runtimeCloseoutPackMcpPayload.closeoutPack?.recommendedSurface !== "runtime:closeout" ||
  runtimeCloseoutPackMcpPayload.closeoutPack?.recommendedReason !== "no_closeout_ready" ||
  runtimeCloseoutPackMcpPayload.closeoutPack?.overview?.closeout?.totalReady !== 0 ||
  runtimeCloseoutPackMcpPayload.closeoutPack?.next?.closeout !== null
) {
  console.error("[smoke:runtime-closeout-pack-mcp] expected MCP runtime closeout pack");
  console.error(runtimeCloseoutPackMcp.stderr || runtimeCloseoutPackMcp.stdout);
  process.exit(1);
}
const runtimeDashboardMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dashboard",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeDashboardMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDashboardMcpInput,
  encoding: "utf8"
});
const runtimeDashboardMcpLines = runtimeDashboardMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDashboardMcpPayload = JSON.parse(JSON.parse(runtimeDashboardMcpLines[1]).result.content[0].text);
if (
  runtimeDashboardMcp.status !== 0 ||
  runtimeDashboardMcpPayload.dashboard?.recommendedReason !== "blocked_tasks_visible" ||
  runtimeDashboardMcpPayload.dashboard?.counts?.blockedTasks !== 1 ||
  runtimeDashboardMcpPayload.dashboard?.counts?.pendingReview !== 1 ||
  runtimeDashboardMcpPayload.dashboard?.counts?.activeClaimed !== 1 ||
  runtimeDashboardMcpPayload.dashboard?.leader?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-dashboard-mcp] expected MCP runtime dashboard");
  console.error(runtimeDashboardMcp.stderr || runtimeDashboardMcp.stdout);
  process.exit(1);
}
const runtimeDispatchMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dispatch",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeDispatchMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDispatchMcpInput,
  encoding: "utf8"
});
const runtimeDispatchMcpLines = runtimeDispatchMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDispatchMcpPayload = JSON.parse(JSON.parse(runtimeDispatchMcpLines[1]).result.content[0].text);
if (
  runtimeDispatchMcp.status !== 0 ||
  runtimeDispatchMcpPayload.dispatch?.recommendedReason !== "next_dispatch_ready" ||
  runtimeDispatchMcpPayload.dispatch?.counts?.ownerGroups !== 1 ||
  runtimeDispatchMcpPayload.dispatch?.counts?.totalAssignments !== 1 ||
  runtimeDispatchMcpPayload.dispatch?.next?.lane !== "lane-dashboard" ||
  runtimeDispatchMcpPayload.dispatch?.groups?.[0]?.owner?.id !== "executor"
) {
  console.error("[smoke:runtime-dispatch-mcp] expected MCP runtime dispatch");
  console.error(runtimeDispatchMcp.stderr || runtimeDispatchMcp.stdout);
  process.exit(1);
}
const runtimeDispatchPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_dispatch_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeDispatchPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeDispatchPackMcpInput,
  encoding: "utf8"
});
const runtimeDispatchPackMcpLines = runtimeDispatchPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeDispatchPackMcpPayload = JSON.parse(JSON.parse(runtimeDispatchPackMcpLines[1]).result.content[0].text);
if (
  runtimeDispatchPackMcp.status !== 0 ||
  runtimeDispatchPackMcpPayload.dispatchPack?.recommendedSurface !== "runtime:dispatch" ||
  runtimeDispatchPackMcpPayload.dispatchPack?.recommendedReason !== "dispatch_priority" ||
  runtimeDispatchPackMcpPayload.dispatchPack?.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeDispatchPackMcpPayload.dispatchPack?.next?.handoff?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-dispatch-pack-mcp] expected MCP runtime dispatch pack");
  console.error(runtimeDispatchPackMcp.stderr || runtimeDispatchPackMcp.stdout);
  process.exit(1);
}
const runtimeFocusMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_focus",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeFocusMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeFocusMcpInput,
  encoding: "utf8"
});
const runtimeFocusMcpLines = runtimeFocusMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeFocusMcpPayload = JSON.parse(JSON.parse(runtimeFocusMcpLines[1]).result.content[0].text);
if (
  runtimeFocusMcp.status !== 0 ||
  runtimeFocusMcpPayload.focus?.recommendedReason !== "blocked_focus_priority" ||
  runtimeFocusMcpPayload.focus?.focus?.type !== "blocked_task" ||
  runtimeFocusMcpPayload.focus?.focus?.taskId !== "task-1" ||
  runtimeFocusMcpPayload.focus?.sources?.dispatch?.totalAssignments !== 1
) {
  console.error("[smoke:runtime-focus-mcp] expected MCP runtime focus");
  console.error(runtimeFocusMcp.stderr || runtimeFocusMcp.stdout);
  process.exit(1);
}
const runtimeQueuePackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_queue_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeQueuePackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeQueuePackMcpInput,
  encoding: "utf8"
});
const runtimeQueuePackMcpLines = runtimeQueuePackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeQueuePackMcpPayload = JSON.parse(JSON.parse(runtimeQueuePackMcpLines[1]).result.content[0].text);
if (
  runtimeQueuePackMcp.status !== 0 ||
  runtimeQueuePackMcpPayload.queuePack?.recommendedSurface !== "leader:assignment-dispatch-bundle" ||
  runtimeQueuePackMcpPayload.queuePack?.recommendedReason !== "assignment_launch_ready" ||
  runtimeQueuePackMcpPayload.queuePack?.next?.queue?.swarmId !== "swarm-1" ||
  runtimeQueuePackMcpPayload.queuePack?.next?.assignmentLaunch?.workerId !== "<executor-worker>" ||
  runtimeQueuePackMcpPayload.queuePack?.overview?.assignmentDispatchBundle?.launches !== 1
) {
  console.error("[smoke:runtime-queue-pack-mcp] expected MCP runtime queue pack to surface assignment launch context before raw leader queue");
  console.error(runtimeQueuePackMcp.stderr || runtimeQueuePackMcp.stdout);
  process.exit(1);
}
const runtimeHandoffsMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_handoffs",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeHandoffsMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeHandoffsMcpInput,
  encoding: "utf8"
});
const runtimeHandoffsMcpLines = runtimeHandoffsMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeHandoffsMcpPayload = JSON.parse(JSON.parse(runtimeHandoffsMcpLines[1]).result.content[0].text);
if (
  runtimeHandoffsMcp.status !== 0 ||
  runtimeHandoffsMcpPayload.handoffs?.recommendedReason !== "review_decision_ready" ||
  runtimeHandoffsMcpPayload.handoffs?.counts?.actorGroups !== 3 ||
  runtimeHandoffsMcpPayload.handoffs?.counts?.totalHandoffs !== 3 ||
  runtimeHandoffsMcpPayload.handoffs?.counts?.reviewDecisions !== 1 ||
  runtimeHandoffsMcpPayload.handoffs?.counts?.blockedRecoveries !== 1 ||
  runtimeHandoffsMcpPayload.handoffs?.counts?.ownerClaims !== 1 ||
  runtimeHandoffsMcpPayload.handoffs?.next?.taskId !== "task-2" ||
  runtimeHandoffsMcpPayload.handoffs?.next?.actor?.id !== "tester" ||
  runtimeHandoffsMcpPayload.handoffs?.groups?.some((group) => group.actor?.id === "tester" && group.handoffs?.[0]?.taskId === "task-2") !== true ||
  runtimeHandoffsMcpPayload.handoffs?.groups?.some((group) => group.actor?.id === "executor" && group.handoffs?.some((handoff) => handoff.taskId === "task-1" && handoff.handoffType === "blocked_recovery")) !== true ||
  runtimeHandoffsMcpPayload.handoffs?.groups?.some((group) => group.actor?.id === "executor" && group.handoffs?.some((handoff) => handoff.taskId === "task-4" && handoff.handoffType === "owner_claim")) !== true
) {
  console.error("[smoke:runtime-handoffs-mcp] expected MCP next-actor handoff workspace");
  console.error(runtimeHandoffsMcp.stderr || runtimeHandoffsMcp.stdout);
  process.exit(1);
}
const runtimeRecoveryMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_recovery",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeRecoveryMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeRecoveryMcpInput,
  encoding: "utf8"
});
const runtimeRecoveryMcpLines = runtimeRecoveryMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeRecoveryMcpPayload = JSON.parse(JSON.parse(runtimeRecoveryMcpLines[1]).result.content[0].text);
if (
  runtimeRecoveryMcp.status !== 0 ||
  runtimeRecoveryMcpPayload.recovery?.recommendedReason !== "blocked_recovery_priority" ||
  runtimeRecoveryMcpPayload.recovery?.counts?.blocked !== 1 ||
  runtimeRecoveryMcpPayload.recovery?.next?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-recovery-mcp] expected MCP runtime recovery");
  console.error(runtimeRecoveryMcp.stderr || runtimeRecoveryMcp.stdout);
  process.exit(1);
}
const runtimeRecoveryPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_recovery_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeRecoveryPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeRecoveryPackMcpInput,
  encoding: "utf8"
});
const runtimeRecoveryPackMcpLines = runtimeRecoveryPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeRecoveryPackMcpPayload = JSON.parse(JSON.parse(runtimeRecoveryPackMcpLines[1]).result.content[0].text);
if (
  runtimeRecoveryPackMcp.status !== 0 ||
  runtimeRecoveryPackMcpPayload.recoveryPack?.recommendedSurface !== "runtime:recovery" ||
  runtimeRecoveryPackMcpPayload.recoveryPack?.recommendedReason !== "blocked_recovery_priority" ||
  runtimeRecoveryPackMcpPayload.recoveryPack?.next?.recovery?.taskId !== "task-1" ||
  runtimeRecoveryPackMcpPayload.recoveryPack?.next?.handoff?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-recovery-pack-mcp] expected MCP runtime recovery pack");
  console.error(runtimeRecoveryPackMcp.stderr || runtimeRecoveryPackMcp.stdout);
  process.exit(1);
}
const runtimeSummaryPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_summary_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeSummaryPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeSummaryPackMcpInput,
  encoding: "utf8"
});
const runtimeSummaryPackMcpLines = runtimeSummaryPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeSummaryPackMcpPayload = JSON.parse(JSON.parse(runtimeSummaryPackMcpLines[1]).result.content[0].text);
if (
  runtimeSummaryPackMcp.status !== 0 ||
  runtimeSummaryPackMcpPayload.summaryPack?.recommendedSurface !== "runtime:focus" ||
  runtimeSummaryPackMcpPayload.summaryPack?.recommendedReason !== "blocked_focus_priority" ||
  runtimeSummaryPackMcpPayload.summaryPack?.focus?.focus?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-summary-pack-mcp] expected MCP runtime summary pack");
  console.error(runtimeSummaryPackMcp.stderr || runtimeSummaryPackMcp.stdout);
  process.exit(1);
}
const runtimeSummaryPackMappedMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_summary_pack",
      arguments: { workerIds: { executor: "worker-executor", explore: "worker-explore" } }
    }
  })
].join("\n") + "\n";
const runtimeSummaryPackMappedMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeSummaryPackMappedMcpInput,
  encoding: "utf8"
});
const runtimeSummaryPackMappedMcpLines = runtimeSummaryPackMappedMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeSummaryPackMappedMcpPayload = JSON.parse(JSON.parse(runtimeSummaryPackMappedMcpLines[1]).result.content[0].text);
if (
  runtimeSummaryPackMappedMcp.status !== 0 ||
  runtimeSummaryPackMappedMcpPayload.summaryPack?.recommendedReason !== "blocked_focus_priority" ||
  runtimeSummaryPackMappedMcpPayload.summaryPack?.overview?.assignmentLaunchPlan?.steps !== 1 ||
  runtimeSummaryPackMappedMcpPayload.summaryPack?.overview?.assignmentDispatchBundle?.launches !== 1 ||
  runtimeSummaryPackMappedMcpPayload.summaryPack?.next?.assignmentLaunchStep?.workerId !== "worker-executor" ||
  runtimeSummaryPackMappedMcpPayload.summaryPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.workerId !== "worker-executor" ||
  runtimeSummaryPackMappedMcpPayload.summaryPack?.surfaces?.assignmentLaunchPlan?.steps?.[0]?.launchCommand !== "node ./src/index.js runtime:assignment-pack --role executor --worker worker-executor --mode owner"
) {
  console.error("[smoke:runtime-summary-pack-mcp] expected MCP summary pack to preserve compact mapped launch context");
  console.error(runtimeSummaryPackMappedMcp.stderr || runtimeSummaryPackMappedMcp.stdout);
  process.exit(1);
}
const runtimeLeaderPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_leader_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeLeaderPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeLeaderPackMcpInput,
  encoding: "utf8"
});
const runtimeLeaderPackMcpLines = runtimeLeaderPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeLeaderPackMcpPayload = JSON.parse(JSON.parse(runtimeLeaderPackMcpLines[1]).result.content[0].text);
if (
  runtimeLeaderPackMcp.status !== 0 ||
  runtimeLeaderPackMcpPayload.leaderPack?.recommendedSurface !== "runtime:dispatch" ||
  runtimeLeaderPackMcpPayload.leaderPack?.recommendedReason !== "dispatch_priority" ||
  runtimeLeaderPackMcpPayload.leaderPack?.surfaces?.queue?.next?.swarmId !== "swarm-1"
) {
  console.error("[smoke:runtime-leader-pack-mcp] expected MCP runtime leader pack");
  console.error(runtimeLeaderPackMcp.stderr || runtimeLeaderPackMcp.stdout);
  process.exit(1);
}
const runtimeOperatorPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_operator_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeOperatorPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeOperatorPackMcpInput,
  encoding: "utf8"
});
const runtimeOperatorPackMcpLines = runtimeOperatorPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeOperatorPackMcpPayload = JSON.parse(JSON.parse(runtimeOperatorPackMcpLines[1]).result.content[0].text);
if (
  runtimeOperatorPackMcp.status !== 0 ||
  runtimeOperatorPackMcpPayload.operatorPack?.recommendedSurface !== "runtime:focus" ||
  runtimeOperatorPackMcpPayload.operatorPack?.recommendedReason !== "blocked_focus_priority" ||
  runtimeOperatorPackMcpPayload.operatorPack?.focus?.focus?.taskId !== "task-1" ||
  runtimeOperatorPackMcpPayload.operatorPack?.next?.handoff?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-operator-pack-mcp] expected MCP runtime operator pack");
  console.error(runtimeOperatorPackMcp.stderr || runtimeOperatorPackMcp.stdout);
  process.exit(1);
}
const runtimeControlPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_control_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeControlPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeControlPackMcpInput,
  encoding: "utf8"
});
const runtimeControlPackMcpLines = runtimeControlPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeControlPackMcpPayload = JSON.parse(JSON.parse(runtimeControlPackMcpLines[1]).result.content[0].text);
if (
  runtimeControlPackMcp.status !== 0 ||
  runtimeControlPackMcpPayload.controlPack?.recommendedSurface !== "runtime:summary-pack" ||
  runtimeControlPackMcpPayload.controlPack?.recommendedReason !== "summary_priority" ||
  runtimeControlPackMcpPayload.controlPack?.metadata?.hasSummary !== true ||
  runtimeControlPackMcpPayload.controlPack?.metadata?.hasWorkspace !== true ||
  runtimeControlPackMcpPayload.controlPack?.metadata?.hasOperator !== true ||
  runtimeControlPackMcpPayload.controlPack?.metadata?.hasLeader !== true ||
  runtimeControlPackMcpPayload.controlPack?.counts?.surfacedNextEntries !==
    Object.values(runtimeControlPackMcpPayload.controlPack?.next ?? {}).filter(Boolean).length ||
  runtimeControlPackMcpPayload.controlPack?.next?.summary?.taskId !== "task-1" ||
  runtimeControlPackMcpPayload.controlPack?.next?.leader?.dispatch?.lane !== "lane-dashboard"
) {
  console.error("[smoke:runtime-control-pack-mcp] expected MCP runtime control pack");
  console.error(runtimeControlPackMcp.stderr || runtimeControlPackMcp.stdout);
  process.exit(1);
}
const runtimeSignalPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_signal_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeSignalPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeSignalPackMcpInput,
  encoding: "utf8"
});
const runtimeSignalPackMcpLines = runtimeSignalPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeSignalPackMcpPayload = JSON.parse(JSON.parse(runtimeSignalPackMcpLines[1]).result.content[0].text);
if (
  runtimeSignalPackMcp.status !== 0 ||
  runtimeSignalPackMcpPayload.signalPack?.recommendedSurface !== "runtime:focus" ||
  runtimeSignalPackMcpPayload.signalPack?.recommendedReason !== "blocked_focus_priority" ||
  runtimeSignalPackMcpPayload.signalPack?.metadata?.hasFocus !== true ||
  runtimeSignalPackMcpPayload.signalPack?.metadata?.hasAlert !== true ||
  runtimeSignalPackMcpPayload.signalPack?.metadata?.hasActivity !== true ||
  runtimeSignalPackMcpPayload.signalPack?.metadata?.hasRole !== true ||
  runtimeSignalPackMcpPayload.signalPack?.counts?.surfacedNextEntries !==
    Object.values(runtimeSignalPackMcpPayload.signalPack?.next ?? {}).filter(Boolean).length ||
  runtimeSignalPackMcpPayload.signalPack?.next?.focus?.taskId !== "task-1" ||
  runtimeSignalPackMcpPayload.signalPack?.next?.role?.role?.id !== "tester"
) {
  console.error("[smoke:runtime-signal-pack-mcp] expected MCP runtime signal pack");
  console.error(runtimeSignalPackMcp.stderr || runtimeSignalPackMcp.stdout);
  process.exit(1);
}
const runtimeHandoffPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_handoff_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeHandoffPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeHandoffPackMcpInput,
  encoding: "utf8"
});
const runtimeHandoffPackMcpLines = runtimeHandoffPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeHandoffPackMcpPayload = JSON.parse(JSON.parse(runtimeHandoffPackMcpLines[1]).result.content[0].text);
if (
  runtimeHandoffPackMcp.status !== 0 ||
  runtimeHandoffPackMcpPayload.handoffPack?.recommendedSurface !== "runtime:handoffs" ||
  runtimeHandoffPackMcpPayload.handoffPack?.recommendedReason !== "review_handoffs_waiting" ||
  runtimeHandoffPackMcpPayload.handoffPack?.metadata?.hasHandoff !== true ||
  runtimeHandoffPackMcpPayload.handoffPack?.metadata?.hasDispatch !== true ||
  runtimeHandoffPackMcpPayload.handoffPack?.metadata?.hasReview !== true ||
  runtimeHandoffPackMcpPayload.handoffPack?.metadata?.hasRecovery !== true ||
  runtimeHandoffPackMcpPayload.handoffPack?.counts?.surfacedNextEntries !==
    Object.values(runtimeHandoffPackMcpPayload.handoffPack?.next ?? {}).filter(Boolean).length ||
  runtimeHandoffPackMcpPayload.handoffPack?.next?.handoff?.taskId !== "task-2" ||
  runtimeHandoffPackMcpPayload.handoffPack?.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-handoff-pack-mcp] expected MCP runtime handoff pack");
  console.error(runtimeHandoffPackMcp.stderr || runtimeHandoffPackMcp.stdout);
  process.exit(1);
}
const runtimeTriagePackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_triage_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeTriagePackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeTriagePackMcpInput,
  encoding: "utf8"
});
const runtimeTriagePackMcpLines = runtimeTriagePackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeTriagePackMcpPayload = JSON.parse(JSON.parse(runtimeTriagePackMcpLines[1]).result.content[0].text);
if (
  runtimeTriagePackMcp.status !== 0 ||
  runtimeTriagePackMcpPayload.triagePack?.recommendedSurface !== "runtime:focus" ||
  runtimeTriagePackMcpPayload.triagePack?.recommendedReason !== "blocked_focus_priority" ||
  runtimeTriagePackMcpPayload.triagePack?.metadata?.hasFocus !== true ||
  runtimeTriagePackMcpPayload.triagePack?.metadata?.hasAlert !== true ||
  runtimeTriagePackMcpPayload.triagePack?.metadata?.hasReview !== true ||
  runtimeTriagePackMcpPayload.triagePack?.metadata?.hasRecovery !== true ||
  runtimeTriagePackMcpPayload.triagePack?.counts?.surfacedNextEntries !==
    Object.values(runtimeTriagePackMcpPayload.triagePack?.next ?? {}).filter(Boolean).length ||
  runtimeTriagePackMcpPayload.triagePack?.next?.focus?.taskId !== "task-1" ||
  runtimeTriagePackMcpPayload.triagePack?.next?.review?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-triage-pack-mcp] expected MCP runtime triage pack");
  console.error(runtimeTriagePackMcp.stderr || runtimeTriagePackMcp.stdout);
  process.exit(1);
}
const runtimeSessionPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_session_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker",
        mode: "verifier"
      }
    }
  })
].join("\n") + "\n";
const runtimeSessionPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeSessionPackMcpInput,
  encoding: "utf8"
});
const runtimeSessionPackMcpLines = runtimeSessionPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeSessionPackMcpPayload = JSON.parse(JSON.parse(runtimeSessionPackMcpLines[1]).result.content[0].text);
if (
  runtimeSessionPackMcp.status !== 0 ||
  runtimeSessionPackMcpPayload.sessionPack?.recommendedSurface !== "worker:closeout" ||
  runtimeSessionPackMcpPayload.sessionPack?.recommendedReason !== "worker_priority" ||
  runtimeSessionPackMcpPayload.sessionPack?.metadata?.hasWorker !== true ||
  runtimeSessionPackMcpPayload.sessionPack?.metadata?.hasOwner !== true ||
  runtimeSessionPackMcpPayload.sessionPack?.metadata?.hasVerifier !== true ||
  runtimeSessionPackMcpPayload.sessionPack?.metadata?.hasRole !== true ||
  runtimeSessionPackMcpPayload.sessionPack?.counts?.surfacedNextEntries !==
    Object.values(runtimeSessionPackMcpPayload.sessionPack?.next ?? {}).filter(Boolean).length ||
  runtimeSessionPackMcpPayload.sessionPack?.next?.verifier?.review?.taskId !== "task-2" ||
  runtimeSessionPackMcpPayload.sessionPack?.next?.role?.lane !== "verifier"
) {
  console.error("[smoke:runtime-session-pack-mcp] expected MCP runtime session pack");
  console.error(runtimeSessionPackMcp.stderr || runtimeSessionPackMcp.stdout);
  process.exit(1);
}
const runtimeRolePackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_role_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker",
        mode: "verifier"
      }
    }
  })
].join("\n") + "\n";
const runtimeRolePackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeRolePackMcpInput,
  encoding: "utf8"
});
const runtimeRolePackMcpLines = runtimeRolePackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeRolePackMcpPayload = JSON.parse(JSON.parse(runtimeRolePackMcpLines[1]).result.content[0].text);
if (
  runtimeRolePackMcp.status !== 0 ||
  runtimeRolePackMcpPayload.rolePack?.recommendedSurface !== "worker:closeout" ||
  runtimeRolePackMcpPayload.rolePack?.recommendedReason !== "session_priority" ||
  runtimeRolePackMcpPayload.rolePack?.metadata?.hasRole !== true ||
  runtimeRolePackMcpPayload.rolePack?.metadata?.hasSession !== true ||
  runtimeRolePackMcpPayload.rolePack?.metadata?.hasOwner !== true ||
  runtimeRolePackMcpPayload.rolePack?.metadata?.hasVerifier !== true ||
  runtimeRolePackMcpPayload.rolePack?.counts?.surfacedNextEntries !==
    Object.values(runtimeRolePackMcpPayload.rolePack?.next ?? {}).filter(Boolean).length ||
  runtimeRolePackMcpPayload.rolePack?.next?.role?.lane !== "verifier" ||
  runtimeRolePackMcpPayload.rolePack?.next?.session?.verifier?.review?.taskId !== "task-2"
) {
  console.error("[smoke:runtime-role-pack-mcp] expected MCP runtime role pack");
  console.error(runtimeRolePackMcp.stderr || runtimeRolePackMcp.stdout);
  process.exit(1);
}
const runtimeExecutionPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_execution_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeExecutionPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeExecutionPackMcpInput,
  encoding: "utf8"
});
const runtimeExecutionPackMcpLines = runtimeExecutionPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeExecutionPackMcpPayload = JSON.parse(JSON.parse(runtimeExecutionPackMcpLines[1]).result.content[0].text);
if (
  runtimeExecutionPackMcp.status !== 0 ||
  runtimeExecutionPackMcpPayload.executionPack?.recommendedSurface !== "runtime:focus" ||
  runtimeExecutionPackMcpPayload.executionPack?.recommendedReason !== "blocked_focus_priority" ||
  runtimeExecutionPackMcpPayload.executionPack?.metadata?.hasFocus !== true ||
  runtimeExecutionPackMcpPayload.executionPack?.metadata?.hasDispatch !== true ||
  runtimeExecutionPackMcpPayload.executionPack?.metadata?.hasAssignmentLaunch !== true ||
  runtimeExecutionPackMcpPayload.executionPack?.metadata?.hasAssignmentLaunchStep !== true ||
  runtimeExecutionPackMcpPayload.executionPack?.metadata?.hasRole !== true ||
  runtimeExecutionPackMcpPayload.executionPack?.metadata?.hasQueue !== true ||
  runtimeExecutionPackMcpPayload.executionPack?.counts?.surfacedNextEntries !==
    Object.values(runtimeExecutionPackMcpPayload.executionPack?.next ?? {}).filter(Boolean).length ||
  runtimeExecutionPackMcpPayload.executionPack?.next?.focus?.taskId !== "task-1" ||
  runtimeExecutionPackMcpPayload.executionPack?.next?.dispatch?.lane !== "lane-dashboard"
) {
  console.error("[smoke:runtime-execution-pack-mcp] expected MCP runtime execution pack");
  console.error(runtimeExecutionPackMcp.stderr || runtimeExecutionPackMcp.stdout);
  process.exit(1);
}
const runtimePickupPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_pickup_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker",
        mode: "verifier"
      }
    }
  })
].join("\n") + "\n";
const runtimePickupPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimePickupPackMcpInput,
  encoding: "utf8"
});
const runtimePickupPackMcpLines = runtimePickupPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimePickupPackMcpPayload = JSON.parse(JSON.parse(runtimePickupPackMcpLines[1]).result.content[0].text);
if (
  runtimePickupPackMcp.status !== 0 ||
  runtimePickupPackMcpPayload.pickupPack?.recommendedSurface !== "worker:closeout" ||
  runtimePickupPackMcpPayload.pickupPack?.recommendedReason !== "review_task_priority" ||
  runtimePickupPackMcpPayload.pickupPack?.metadata?.hasFocus !== true ||
  runtimePickupPackMcpPayload.pickupPack?.metadata?.hasCandidate !== true ||
  runtimePickupPackMcpPayload.pickupPack?.metadata?.hasBrief !== true ||
  runtimePickupPackMcpPayload.pickupPack?.metadata?.hasPickup !== true ||
  runtimePickupPackMcpPayload.pickupPack?.counts?.surfacedNextEntries !==
    Object.values(runtimePickupPackMcpPayload.pickupPack?.next ?? {}).filter(Boolean).length ||
  runtimePickupPackMcpPayload.pickupPack?.next?.pickup?.candidate?.id !== "task-2" ||
  runtimePickupPackMcpPayload.pickupPack?.next?.pickup?.command !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:runtime-pickup-pack-mcp] expected MCP runtime pickup pack");
  console.error(runtimePickupPackMcp.stderr || runtimePickupPackMcp.stdout);
  process.exit(1);
}
const runtimeAssignmentPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_assignment_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker",
        mode: "verifier"
      }
    }
  })
].join("\n") + "\n";
const runtimeAssignmentPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeAssignmentPackMcpInput,
  encoding: "utf8"
});
const runtimeAssignmentPackMcpLines = runtimeAssignmentPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeAssignmentPackMcpPayload = JSON.parse(JSON.parse(runtimeAssignmentPackMcpLines[1]).result.content[0].text);
if (
  runtimeAssignmentPackMcp.status !== 0 ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.recommendedSurface !== "worker:closeout" ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.recommendedReason !== "review_task_priority" ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.metadata?.hasAssignment !== false ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.metadata?.hasPickup !== true ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.metadata?.hasCandidate !== true ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.metadata?.hasFocus !== true ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.counts?.surfacedNextEntries !==
    Object.values(runtimeAssignmentPackMcpPayload.assignmentPack?.next ?? {}).filter(Boolean).length ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.next?.pickup?.kind !== "task_assignment_preview" ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.next?.pickup?.outcome !== "none" ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.next?.pickup?.candidate !== null ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.next?.focus?.kind !== "review_task" ||
  runtimeAssignmentPackMcpPayload.assignmentPack?.surfaces?.assignments?.next?.taskId !== "task-4"
) {
  console.error("[smoke:runtime-assignment-pack-mcp] expected MCP runtime assignment pack");
  console.error(runtimeAssignmentPackMcp.stderr || runtimeAssignmentPackMcp.stdout);
  process.exit(1);
}
const runtimeReviewMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_review",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeReviewMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeReviewMcpInput,
  encoding: "utf8"
});
const runtimeReviewMcpLines = runtimeReviewMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeReviewMcpPayload = JSON.parse(JSON.parse(runtimeReviewMcpLines[1]).result.content[0].text);
if (
  runtimeReviewMcp.status !== 0 ||
  runtimeReviewMcpPayload.review?.recommendedReason !== "review_decision_ready" ||
  runtimeReviewMcpPayload.review?.counts?.verifierGroups !== 1 ||
  runtimeReviewMcpPayload.review?.counts?.totalPendingReview !== 1 ||
  runtimeReviewMcpPayload.review?.next?.taskId !== "task-2" ||
  runtimeReviewMcpPayload.review?.groups?.[0]?.verifier?.id !== "tester"
) {
  console.error("[smoke:runtime-review-mcp] expected MCP runtime review");
  console.error(runtimeReviewMcp.stderr || runtimeReviewMcp.stdout);
  process.exit(1);
}
const runtimeReviewPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_review_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker"
      }
    }
  })
].join("\n") + "\n";
const runtimeReviewPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeReviewPackMcpInput,
  encoding: "utf8"
});
const runtimeReviewPackMcpLines = runtimeReviewPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeReviewPackMcpPayload = JSON.parse(JSON.parse(runtimeReviewPackMcpLines[1]).result.content[0].text);
if (
  runtimeReviewPackMcp.status !== 0 ||
  runtimeReviewPackMcpPayload.reviewPack?.recommendedSurface !== "runtime:verifier-pack" ||
  runtimeReviewPackMcpPayload.reviewPack?.recommendedReason !== "verifier_bundle_available" ||
  runtimeReviewPackMcpPayload.reviewPack?.next?.review?.taskId !== "task-2" ||
  runtimeReviewPackMcpPayload.reviewPack?.next?.verifier?.decision?.id !== "task-2"
) {
  console.error("[smoke:runtime-review-pack-mcp] expected MCP runtime review pack");
  console.error(runtimeReviewPackMcp.stderr || runtimeReviewPackMcp.stdout);
  process.exit(1);
}
const runtimeRolesMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_roles",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeRolesMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeRolesMcpInput,
  encoding: "utf8"
});
const runtimeRolesMcpLines = runtimeRolesMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeRolesMcpPayload = JSON.parse(JSON.parse(runtimeRolesMcpLines[1]).result.content[0].text);
if (
  runtimeRolesMcp.status !== 0 ||
  runtimeRolesMcpPayload.roles?.recommendedReason !== "review_role_pressure" ||
  runtimeRolesMcpPayload.roles?.counts?.withPendingReview !== 1 ||
  runtimeRolesMcpPayload.roles?.next?.role?.id !== "tester" ||
  runtimeRolesMcpPayload.roles?.roles?.find((entry) => entry.role?.id === "executor")?.counts?.ownerBlocked !== 1
) {
  console.error("[smoke:runtime-roles-mcp] expected MCP runtime role queue");
  console.error(runtimeRolesMcp.stderr || runtimeRolesMcp.stdout);
  process.exit(1);
}
const runtimeWorkspacePackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_workspace_pack",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeWorkspacePackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeWorkspacePackMcpInput,
  encoding: "utf8"
});
const runtimeWorkspacePackMcpLines = runtimeWorkspacePackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const runtimeWorkspacePackMcpPayload = JSON.parse(JSON.parse(runtimeWorkspacePackMcpLines[1]).result.content[0].text);
if (
  runtimeWorkspacePackMcp.status !== 0 ||
  runtimeWorkspacePackMcpPayload.workspacePack?.recommendedSurface !== "runtime:recovery" ||
  runtimeWorkspacePackMcpPayload.workspacePack?.recommendedReason !== "blocked_tasks_priority" ||
  runtimeWorkspacePackMcpPayload.workspacePack?.next?.dispatch?.lane !== "lane-dashboard" ||
  runtimeWorkspacePackMcpPayload.workspacePack?.next?.review?.taskId !== "task-2" ||
  runtimeWorkspacePackMcpPayload.workspacePack?.next?.recovery?.taskId !== "task-1"
) {
  console.error("[smoke:runtime-workspace-pack-mcp] expected MCP runtime workspace pack");
  console.error(runtimeWorkspacePackMcp.stderr || runtimeWorkspacePackMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const swarmMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "swarm_init",
      arguments: {
        objective: "MCP swarm smoke",
        owner: "leader",
        maxWorkers: 2,
        lanes: [
          {
            lane: "lane-mcp",
            summary: "MCP lane",
            owner: "executor",
            verifier: "tester",
            scope: ["src/mcp.js"],
            acceptance: ["lane persisted"],
            verification: ["swarm_get returns lane"]
          }
        ]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "swarm_brief",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "swarm_check",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "swarm_queue_tasks",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "swarm_dispatch",
      arguments: { id: "swarm-1", claimedBy: "mcp-worker", owner: "executor" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "task_ready_for_review",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "task_done",
      arguments: { id: "task-1", reviewedBy: "tester", reviewEvidence: ["mcp verifier approved"] }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "swarm_sync",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "swarm_overview",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "swarm_bundle",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: {
      name: "swarm_closeout",
      arguments: { id: "swarm-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 13,
    method: "tools/call",
    params: {
      name: "task_list",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 14,
    method: "tools/call",
    params: {
      name: "swarm_list",
      arguments: { detailed: true }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 15,
    method: "tools/call",
    params: {
      name: "leader_workspace",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 16,
    method: "tools/call",
    params: {
      name: "swarm_done",
      arguments: { id: "swarm-1" }
    }
  })
].join("\n") + "\n";

const swarmMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: swarmMcpInput,
  encoding: "utf8"
});
const swarmMcpResponses = swarmMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const swarmMcpById = new Map(
  swarmMcpResponses.map((line) => {
    const parsed = JSON.parse(line);
    return [parsed.id, parsed];
  })
);
const swarmInitResult = swarmMcpById.get(2) ?? null;
const swarmInitText = swarmInitResult?.result?.content?.[0]?.text;
const swarmInitPayload = swarmInitText ? JSON.parse(swarmInitText) : null;
const swarmBriefResult = swarmMcpById.get(3) ?? null;
const swarmBriefText = swarmBriefResult?.result?.content?.[0]?.text;
const swarmBriefPayload = swarmBriefText ? JSON.parse(swarmBriefText) : null;
const swarmCheckResult = swarmMcpById.get(4) ?? null;
const swarmCheckText = swarmCheckResult?.result?.content?.[0]?.text;
const swarmCheckPayload = swarmCheckText ? JSON.parse(swarmCheckText) : null;
const swarmSyncResult = swarmMcpById.get(9) ?? null;
const swarmSyncText = swarmSyncResult?.result?.content?.[0]?.text;
const swarmSyncPayload = swarmSyncText ? JSON.parse(swarmSyncText) : null;
const swarmOverviewResult = swarmMcpById.get(10) ?? null;
const swarmOverviewText = swarmOverviewResult?.result?.content?.[0]?.text;
const swarmOverviewPayload = swarmOverviewText ? JSON.parse(swarmOverviewText) : null;
const swarmBundleResult = swarmMcpById.get(11) ?? null;
const swarmBundleText = swarmBundleResult?.result?.content?.[0]?.text;
const swarmBundlePayload = swarmBundleText ? JSON.parse(swarmBundleText) : null;
const swarmCloseoutResult = swarmMcpById.get(12) ?? null;
const swarmCloseoutText = swarmCloseoutResult?.result?.content?.[0]?.text;
const swarmCloseoutPayload = swarmCloseoutText ? JSON.parse(swarmCloseoutText) : null;
const swarmTaskListResult = swarmMcpById.get(13) ?? null;
const swarmTaskListText = swarmTaskListResult?.result?.content?.[0]?.text;
const swarmTaskListPayload = swarmTaskListText ? JSON.parse(swarmTaskListText) : null;
const swarmListDetailedResult = swarmMcpById.get(14) ?? null;
const swarmListDetailedText = swarmListDetailedResult?.result?.content?.[0]?.text;
const swarmListDetailedPayload = swarmListDetailedText ? JSON.parse(swarmListDetailedText) : null;
const leaderWorkspaceResult = swarmMcpById.get(15) ?? null;
const leaderWorkspaceText = leaderWorkspaceResult?.result?.content?.[0]?.text;
const leaderWorkspacePayload = leaderWorkspaceText ? JSON.parse(leaderWorkspaceText) : null;
const swarmDoneResult = swarmMcpById.get(16) ?? null;
const swarmDoneText = swarmDoneResult?.result?.content?.[0]?.text;
const swarmDonePayload = swarmDoneText ? JSON.parse(swarmDoneText) : null;
const mcpSwarmTask = swarmTaskListPayload?.tasks?.tasks?.find((task) => task.swarmId === "swarm-1" && task.claimedBy === "mcp-worker");
if (
  swarmMcp.status !== 0 ||
  swarmInitPayload?.created?.kind !== "swarm_mutation" ||
  swarmInitPayload?.created?.recommendedReason !== "swarm_created" ||
  swarmInitPayload?.created?.swarm?.id !== "swarm-1" ||
  swarmInitPayload?.created?.swarm?.lanes?.length !== 1 ||
  swarmBriefPayload?.brief?.recommendedReason !== "queue_swarm_lanes" ||
  swarmBriefPayload?.brief?.recommendedNextAction !== "queue_swarm_lanes" ||
  swarmCheckPayload?.validation?.ready !== true ||
  swarmTaskListPayload?.tasks?.kind !== "task_view" ||
  swarmTaskListPayload?.tasks?.recommendedReason !== "task_list_has_results" ||
  !mcpSwarmTask ||
  mcpSwarmTask.reviewedBy !== "tester" ||
  mcpSwarmTask.reviewOutcome !== "approved" ||
  swarmSyncPayload?.synced?.kind !== "swarm_sync" ||
  swarmSyncPayload?.synced?.recommendedReason !== "completed_swarm_unchanged" ||
  swarmBundlePayload?.bundle?.recommendedReason !== "swarm_ready_to_complete" ||
  swarmBundlePayload?.bundle?.lanes?.[0]?.report?.task?.id !== "task-1" ||
  swarmCloseoutPayload?.closeout?.recommendedReason !== "swarm_closeout_ready" ||
  swarmCloseoutPayload?.closeout?.command !== "node ./src/index.js swarm:done --id swarm-1" ||
  leaderWorkspacePayload?.workspace?.recommendedReason !== "closeout_focus_priority" ||
  leaderWorkspacePayload?.workspace?.focus?.swarmId !== "swarm-1" ||
  leaderWorkspacePayload?.workspace?.focus?.bundle?.swarm?.id !== "swarm-1" ||
  swarmDonePayload?.completed?.kind !== "swarm_lifecycle" ||
  swarmDonePayload?.completed?.recommendedReason !== "swarm_completed" ||
  swarmDonePayload?.completed?.swarm?.status !== "completed" ||
  swarmOverviewPayload?.overview?.kind !== "swarm_overview" ||
  swarmOverviewPayload?.overview?.recommendedReason !== "swarm_ready_to_complete" ||
  swarmOverviewPayload?.overview?.derivedStatus !== "completed" ||
  swarmOverviewPayload?.overview?.readyToComplete !== true ||
  swarmListDetailedPayload?.swarms?.kind !== "swarm_view" ||
  swarmListDetailedPayload?.swarms?.recommendedReason !== "swarm_list_has_results" ||
  swarmListDetailedPayload?.swarms?.detailed !== true ||
  swarmListDetailedPayload?.swarms?.counts?.totalSwarms !== swarmListDetailedPayload?.swarms?.swarms?.length ||
  swarmListDetailedPayload?.swarms?.swarms?.[0]?.derivedStatus !== "completed"
) {
  console.error("[smoke:swarm-mcp] expected completion-aware MCP lifecycle payloads and overview");
  console.error(swarmMcp.stderr || swarmMcp.stdout);
  process.exit(1);
}


rmSync(".codex-bees", { recursive: true, force: true });
const queuePlanSwarmMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "queue_plan_swarm",
      arguments: { task: "Queue a planner MCP swarm" }
    }
  })
].join("\n") + "\n";

const queuePlanSwarmMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: queuePlanSwarmMcpInput,
  encoding: "utf8"
});
const queuePlanSwarmLines = queuePlanSwarmMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const queuePlanSwarmResult = queuePlanSwarmLines.length >= 2 ? JSON.parse(queuePlanSwarmLines[1]) : null;
const queuePlanSwarmText = queuePlanSwarmResult?.result?.content?.[0]?.text;
const queuePlanSwarmPayload = queuePlanSwarmText ? JSON.parse(queuePlanSwarmText) : null;
if (
  queuePlanSwarmMcp.status !== 0 ||
  queuePlanSwarmPayload?.kind !== "queued_plan_swarm" ||
  queuePlanSwarmPayload?.recommendedReason !== "multiple_swarm_lane_tasks_queued"
) {
  console.error("[smoke:queue-plan-swarm-mcp] expected queued_plan_swarm response");
  console.error(queuePlanSwarmMcp.stderr || queuePlanSwarmMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const taskAddMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_catalog",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "runtime_status",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "task_add",
      arguments: {
        title: "mcp metadata task",
        owner: "executor",
        verifier: "tester",
        objective: "verify MCP metadata persistence",
        lane: "lane-mcp",
        scope: ["src/mcp.js"],
        acceptance: ["metadata stored"],
        verification: ["task_list returns metadata"]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "task_get",
      arguments: { id: "task-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "task_brief",
      arguments: { id: "task-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "task_check",
      arguments: { id: "task-1" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "task_claim",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "task_ready_for_review",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "task_reject",
      arguments: {
        id: "task-1",
        reviewedBy: "tester",
        nextQueueStatus: "released",
        notes: "needs another MCP pass"
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "task_claim",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: {
      name: "task_ready_for_review",
      arguments: { id: "task-1", claimedBy: "mcp-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 13,
    method: "tools/call",
    params: {
      name: "task_approve",
      arguments: {
        id: "task-1",
        reviewedBy: "tester",
        reviewEvidence: ["mcp reviewer approval"]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 14,
    method: "tools/call",
    params: {
      name: "task_list",
      arguments: {}
    }
  })
].join("\n") + "\n";

const taskAddMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskAddMcpInput,
  encoding: "utf8"
});
const taskAddMcpLines = taskAddMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskCatalogResult = taskAddMcpLines.length >= 2 ? JSON.parse(taskAddMcpLines[1]) : null;
const taskCatalogText = taskCatalogResult?.result?.content?.[0]?.text;
const taskCatalogPayload = taskCatalogText ? JSON.parse(taskCatalogText) : null;
const taskStatusResult = taskAddMcpLines.length >= 3 ? JSON.parse(taskAddMcpLines[2]) : null;
const taskStatusText = taskStatusResult?.result?.content?.[0]?.text;
const taskStatusPayload = taskStatusText ? JSON.parse(taskStatusText) : null;
const taskAddResult = taskAddMcpLines.length >= 4 ? JSON.parse(taskAddMcpLines[3]) : null;
const taskAddText = taskAddResult?.result?.content?.[0]?.text;
const taskAddPayload = taskAddText ? JSON.parse(taskAddText) : null;
const taskGetResult = taskAddMcpLines.length >= 5 ? JSON.parse(taskAddMcpLines[4]) : null;
const taskGetText = taskGetResult?.result?.content?.[0]?.text;
const taskGetPayload = taskGetText ? JSON.parse(taskGetText) : null;
const taskBriefResult = taskAddMcpLines.length >= 6 ? JSON.parse(taskAddMcpLines[5]) : null;
const taskBriefText = taskBriefResult?.result?.content?.[0]?.text;
const taskBriefPayload = taskBriefText ? JSON.parse(taskBriefText) : null;
const taskHistoryMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_history",
      arguments: { id: "task-1" }
    }
  })
].join("\n") + "\n";
const taskCheckResult = taskAddMcpLines.length >= 7 ? JSON.parse(taskAddMcpLines[6]) : null;
const taskCheckText = taskCheckResult?.result?.content?.[0]?.text;
const taskCheckPayload = taskCheckText ? JSON.parse(taskCheckText) : null;
const taskClaimResult = taskAddMcpLines.length >= 8 ? JSON.parse(taskAddMcpLines[7]) : null;
const taskClaimText = taskClaimResult?.result?.content?.[0]?.text;
const taskClaimPayload = taskClaimText ? JSON.parse(taskClaimText) : null;
const taskReadyForReviewResult = taskAddMcpLines.length >= 9 ? JSON.parse(taskAddMcpLines[8]) : null;
const taskReadyForReviewText = taskReadyForReviewResult?.result?.content?.[0]?.text;
const taskReadyForReviewPayload = taskReadyForReviewText ? JSON.parse(taskReadyForReviewText) : null;
const taskRejectResult = taskAddMcpLines.length >= 10 ? JSON.parse(taskAddMcpLines[9]) : null;
const taskRejectText = taskRejectResult?.result?.content?.[0]?.text;
const taskRejectPayload = taskRejectText ? JSON.parse(taskRejectText) : null;
const taskReclaimResult = taskAddMcpLines.length >= 11 ? JSON.parse(taskAddMcpLines[10]) : null;
const taskReclaimText = taskReclaimResult?.result?.content?.[0]?.text;
const taskReclaimPayload = taskReclaimText ? JSON.parse(taskReclaimText) : null;
const taskReadyForReviewAgainResult = taskAddMcpLines.length >= 12 ? JSON.parse(taskAddMcpLines[11]) : null;
const taskReadyForReviewAgainText = taskReadyForReviewAgainResult?.result?.content?.[0]?.text;
const taskReadyForReviewAgainPayload = taskReadyForReviewAgainText ? JSON.parse(taskReadyForReviewAgainText) : null;
const taskApproveResult = taskAddMcpLines.length >= 13 ? JSON.parse(taskAddMcpLines[12]) : null;
const taskApproveText = taskApproveResult?.result?.content?.[0]?.text;
const taskApprovePayload = taskApproveText ? JSON.parse(taskApproveText) : null;
const taskListResult = taskAddMcpLines.length >= 14 ? JSON.parse(taskAddMcpLines[13]) : null;
const taskListText = taskListResult?.result?.content?.[0]?.text;
const taskListPayload = taskListText ? JSON.parse(taskListText) : null;
const mcpTask = taskListPayload?.tasks?.tasks?.find((task) => task.title === "mcp metadata task");
const taskHistoryMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskHistoryMcpInput,
  encoding: "utf8"
});
const taskHistoryMcpLines = taskHistoryMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskHistoryMcpPayload = JSON.parse(JSON.parse(taskHistoryMcpLines[1]).result.content[0].text);
const taskAnnotateMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_annotate",
      arguments: {
        id: "task-1",
        actor: "tester",
        kind: "review-note",
        content: "reviewed through MCP flow"
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "task_brief",
      arguments: { id: "task-1" }
    }
  })
].join("\n") + "\n";
const taskAnnotateMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskAnnotateMcpInput,
  encoding: "utf8"
});
const taskAnnotateMcpLines = taskAnnotateMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskAnnotateMcpPayload = JSON.parse(JSON.parse(taskAnnotateMcpLines[1]).result.content[0].text);
const taskAnnotateMcpBrief = JSON.parse(JSON.parse(taskAnnotateMcpLines[2]).result.content[0].text);
const taskReportMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_report",
      arguments: { id: "task-1" }
    }
  })
].join("\n") + "\n";
const taskReportMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: taskReportMcpInput,
  encoding: "utf8"
});
const taskReportMcpLines = taskReportMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const taskReportMcpPayload = JSON.parse(JSON.parse(taskReportMcpLines[1]).result.content[0].text);
if (
  taskAddMcp.status !== 0 ||
  taskCatalogPayload?.catalog?.kind !== "runtime_catalog_view" ||
  taskCatalogPayload?.catalog?.recommendedReason !== "catalog_entries_loaded" ||
  taskCatalogPayload?.catalog?.counts?.agents !== 4 ||
  !taskCatalogPayload?.catalog?.catalog?.agents?.some((agent) => agent.id === "tester") ||
  taskStatusPayload?.status?.kind !== "runtime_status_view" ||
  taskStatusPayload?.status?.recommendedReason !== "runtime_state_empty" ||
  taskStatusPayload?.status?.counts?.agents !== 4 ||
  taskStatusPayload?.status?.counts?.trackedStateEntries !== 0 ||
  taskStatusPayload?.status?.status?.product !== "codex-bees" ||
  taskAddPayload?.created?.kind !== "task_mutation" ||
  taskAddPayload?.created?.recommendedReason !== "task_created" ||
  taskAddPayload?.created?.task?.id !== "task-1" ||
  taskGetPayload?.task?.kind !== "task_detail" ||
  taskGetPayload?.task?.recommendedReason !== "task_detail_loaded" ||
  taskGetPayload?.task?.metadata?.hasHistory !== true ||
  taskGetPayload?.task?.metadata?.hasAnnotations !== false ||
  taskGetPayload?.task?.metadata?.reviewState !== "not_started" ||
  taskGetPayload?.task?.task?.id !== "task-1" ||
  taskBriefPayload?.brief?.recommendedReason !== "claimable_execution_brief" ||
  taskBriefPayload?.brief?.roles?.owner?.promptPath !== ".codex/agents/executor.md" ||
  taskHistoryMcp.status !== 0 ||
  taskHistoryMcpPayload.history?.recommendedReason !== "approved_event_latest" ||
  taskHistoryMcpPayload.history?.history?.at(-1)?.type !== "approved" ||
  taskAnnotateMcp.status !== 0 ||
  taskAnnotateMcpPayload?.annotated?.kind !== "task_mutation" ||
  taskAnnotateMcpPayload?.annotated?.recommendedReason !== "task_annotated" ||
  taskAnnotateMcpPayload?.annotated?.task?.annotations?.at(-1)?.content !== "reviewed through MCP flow" ||
  taskAnnotateMcpBrief.brief?.annotations?.entries?.at(-1)?.content !== "reviewed through MCP flow" ||
  taskReportMcp.status !== 0 ||
  taskReportMcpPayload.report?.recommendedReason !== "approved_closure_ready" ||
  taskReportMcpPayload.report?.closure?.reviewOutcome !== "approved" ||
  taskClaimPayload?.claimed?.kind !== "task_lifecycle" ||
  taskClaimPayload?.claimed?.recommendedReason !== "task_claimed" ||
  taskClaimPayload?.claimed?.task?.claimedBy !== "mcp-worker" ||
  taskReadyForReviewPayload?.readyForReview?.kind !== "task_lifecycle" ||
  taskReadyForReviewPayload?.readyForReview?.recommendedReason !== "task_ready_for_review" ||
  taskReadyForReviewPayload?.readyForReview?.task?.queueStatus !== "ready_for_review" ||
  taskRejectPayload?.rejected?.kind !== "task_lifecycle" ||
  taskRejectPayload?.rejected?.recommendedReason !== "task_released_for_rework" ||
  taskRejectPayload?.rejected?.task?.queueStatus !== "released" ||
  taskReclaimPayload?.claimed?.kind !== "task_lifecycle" ||
  taskReclaimPayload?.claimed?.recommendedReason !== "task_claimed" ||
  taskReclaimPayload?.claimed?.task?.claimedBy !== "mcp-worker" ||
  taskReadyForReviewAgainPayload?.readyForReview?.kind !== "task_lifecycle" ||
  taskReadyForReviewAgainPayload?.readyForReview?.recommendedReason !== "task_ready_for_review" ||
  taskApprovePayload?.approved?.kind !== "task_lifecycle" ||
  taskApprovePayload?.approved?.recommendedReason !== "task_approved" ||
  taskApprovePayload?.approved?.task?.queueStatus !== "done" ||
  taskApprovePayload?.approved?.task?.reviewedBy !== "tester" ||
  taskListPayload?.tasks?.kind !== "task_view" ||
  taskListPayload?.tasks?.recommendedReason !== "task_list_has_results" ||
  taskListPayload?.tasks?.counts?.totalTasks !== taskListPayload?.tasks?.tasks?.length ||
  !mcpTask ||
  mcpTask.verifier !== "tester" ||
  taskCheckPayload?.validation?.ready !== true ||
  mcpTask.reviewedBy !== "tester" ||
  mcpTask.reviewOutcome !== "approved"
) {
  console.error("[smoke:task-add-mcp] expected persisted MCP metadata");
  console.error(taskAddMcp.stderr || taskAddMcp.stdout);
  process.exit(1);
}

const runtimeContractMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "package_metadata",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "runtime_doctor",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "command_catalog",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "command_catalog_entry",
      arguments: { command: "init" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "command_help",
      arguments: { command: "init" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "init_command_catalog",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "init_command_option",
      arguments: { option: "--preview" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "init_help",
      arguments: { option: "--preview" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "mcp_command_catalog",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "mcp_command_option",
      arguments: { option: "--tools" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: {
      name: "mcp_help",
      arguments: { option: "--tools" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 13,
    method: "tools/call",
    params: {
      name: "tool_catalog",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 14,
    method: "tools/call",
    params: {
      name: "tool_catalog_entry",
      arguments: { name: "runtime_contract" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 15,
    method: "tools/call",
    params: {
      name: "runtime_ready",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 16,
    method: "tools/call",
    params: {
      name: "runtime_contract",
      arguments: {}
    }
  })
].join("\n") + "\n";
const runtimeContractMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeContractMcpInput,
  encoding: "utf8"
});
const runtimeContractMcpLines = runtimeContractMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const packageMetadataMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[1]).result.content[0].text);
const runtimeDoctorMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[2]).result.content[0].text);
const commandCatalogMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[3]).result.content[0].text);
const commandCatalogEntryMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[4]).result.content[0].text);
const commandHelpMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[5]).result.content[0].text);
const initCommandCatalogMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[6]).result.content[0].text);
const initCommandOptionMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[7]).result.content[0].text);
const initHelpMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[8]).result.content[0].text);
const mcpCommandCatalogMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[9]).result.content[0].text);
const mcpCommandOptionMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[10]).result.content[0].text);
const mcpHelpMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[11]).result.content[0].text);
const toolCatalogMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[12]).result.content[0].text);
const toolCatalogEntryMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[13]).result.content[0].text);
const runtimeReadyMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[14]).result.content[0].text);
const runtimeContractMcpPayload = JSON.parse(JSON.parse(runtimeContractMcpLines[15]).result.content[0].text);
if (
  runtimeContractMcp.status !== 0 ||
  packageMetadataMcpPayload.metadata?.kind !== "package_metadata_view" ||
  packageMetadataMcpPayload.metadata?.recommendedReason !== "package_metadata_loaded" ||
  packageMetadataMcpPayload.metadata?.metadata?.product !== "codex-bees" ||
  packageMetadataMcpPayload.metadata?.metadata?.mode !== "codex-only" ||
  runtimeDoctorMcpPayload.doctor?.kind !== "runtime_doctor_view" ||
  runtimeDoctorMcpPayload.doctor?.recommendedReason !== "doctor_ready" ||
  runtimeDoctorMcpPayload.doctor?.catalog?.kind !== "runtime_catalog_view" ||
  runtimeDoctorMcpPayload.doctor?.contract?.kind !== "runtime_contract_view" ||
  commandCatalogMcpPayload.commands?.kind !== "command_catalog_view" ||
  commandCatalogMcpPayload.commands?.recommendedReason !== "command_catalog_loaded" ||
  !commandCatalogMcpPayload.commands?.commands?.some((entry) => entry.command === "mcp") ||
  commandCatalogEntryMcpPayload.command?.kind !== "command_catalog_entry_view" ||
  commandCatalogEntryMcpPayload.command?.matchedCommand !== "init" ||
  commandCatalogEntryMcpPayload.command?.entry?.command !== "init" ||
  commandHelpMcpPayload.help?.kind !== "command_help_view" ||
  commandHelpMcpPayload.help?.matchedCommand !== "init" ||
  !commandHelpMcpPayload.help?.text?.includes("codex-bees init") ||
  initCommandCatalogMcpPayload.options?.kind !== "init_command_catalog_view" ||
  initCommandCatalogMcpPayload.options?.recommendedReason !== "init_command_catalog_loaded" ||
  !initCommandCatalogMcpPayload.options?.options?.some((option) => option.option === "--preview") ||
  initCommandOptionMcpPayload.option?.kind !== "init_command_option_view" ||
  initCommandOptionMcpPayload.option?.matchedOption !== "--preview" ||
  initCommandOptionMcpPayload.option?.entry?.option !== "--preview" ||
  initHelpMcpPayload.help?.kind !== "init_help_view" ||
  initHelpMcpPayload.help?.matchedOption !== "--preview" ||
  !initHelpMcpPayload.help?.text?.includes("codex-bees init") ||
  mcpCommandCatalogMcpPayload.options?.kind !== "mcp_command_catalog_view" ||
  mcpCommandCatalogMcpPayload.options?.recommendedReason !== "mcp_command_catalog_loaded" ||
  !mcpCommandCatalogMcpPayload.options?.options?.some((option) => option.option === "--capabilities") ||
  mcpCommandOptionMcpPayload.option?.kind !== "mcp_command_option_view" ||
  mcpCommandOptionMcpPayload.option?.matchedOption !== "--tools" ||
  mcpCommandOptionMcpPayload.option?.entry?.option !== "--tools" ||
  mcpHelpMcpPayload.help?.kind !== "mcp_help_view" ||
  mcpHelpMcpPayload.help?.matchedOption !== "--tools" ||
  !mcpHelpMcpPayload.help?.text?.includes("codex-bees mcp --tools") ||
  toolCatalogMcpPayload.tools?.kind !== "tool_catalog_view" ||
  toolCatalogMcpPayload.tools?.recommendedReason !== "tool_catalog_loaded" ||
  !toolCatalogMcpPayload.tools?.tools?.some((tool) => tool.name === "runtime_contract") ||
  toolCatalogEntryMcpPayload.tool?.kind !== "mcp_tool_view" ||
  toolCatalogEntryMcpPayload.tool?.matchedTool !== "runtime_contract" ||
  toolCatalogEntryMcpPayload.tool?.tool?.name !== "runtime_contract" ||
  runtimeReadyMcpPayload.ready?.kind !== "runtime_ready_view" ||
  runtimeReadyMcpPayload.ready?.recommendedReason !== "runtime_entry_ready" ||
  runtimeReadyMcpPayload.ready?.counts?.nextSteps !== 6 ||
  runtimeReadyMcpPayload.ready?.contract?.kind !== "runtime_contract_view" ||
  runtimeReadyMcpPayload.ready?.contract?.contract?.transport?.mcp !== "stdio-jsonrpc" ||
  runtimeContractMcpPayload.contract?.kind !== "runtime_contract_view" ||
  runtimeContractMcpPayload.contract?.recommendedReason !== "contract_loaded" ||
  runtimeContractMcpPayload.contract?.counts?.responsibilities !== 7 ||
  runtimeContractMcpPayload.contract?.contract?.product !== "codex-bees" ||
  runtimeContractMcpPayload.contract?.contract?.transport?.cli !== "stdio"
) {
  console.error("[smoke:metadata-doctor-commands-entry-help-init-option-help-mcp-options-option-help-ready-contract-mcp] expected MCP metadata, doctor, command catalog, command entry, command help, init options, init option, init help, MCP options, MCP option, MCP help, tool catalog, tool entry, readiness, and contract views");
  console.error(runtimeContractMcp.stderr || runtimeContractMcp.stdout);
  process.exit(1);
}
const runtimeGuidanceMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "coordination_overview",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "worker_guidelines",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "runtime_catalog_agents",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "runtime_catalog_skills",
      arguments: {}
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "runtime_catalog_agent",
      arguments: { id: "executor" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "runtime_capability",
      arguments: { id: "memory" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "runtime_catalog_skill",
      arguments: { id: "project-development" }
    }
  })
].join("\n") + "\n";
const runtimeGuidanceMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: runtimeGuidanceMcpInput,
  encoding: "utf8"
});
const runtimeGuidanceMcpLines = runtimeGuidanceMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const coordinationOverviewMcpPayload = JSON.parse(JSON.parse(runtimeGuidanceMcpLines[1]).result.content[0].text);
const workerGuidelinesMcpPayload = JSON.parse(JSON.parse(runtimeGuidanceMcpLines[2]).result.content[0].text);
const runtimeCatalogAgentsMcpPayload = JSON.parse(JSON.parse(runtimeGuidanceMcpLines[3]).result.content[0].text);
const runtimeCatalogSkillsMcpPayload = JSON.parse(JSON.parse(runtimeGuidanceMcpLines[4]).result.content[0].text);
const runtimeCatalogAgentMcpPayload = JSON.parse(JSON.parse(runtimeGuidanceMcpLines[5]).result.content[0].text);
const runtimeCapabilityMcpPayload = JSON.parse(JSON.parse(runtimeGuidanceMcpLines[6]).result.content[0].text);
const runtimeCatalogSkillMcpPayload = JSON.parse(JSON.parse(runtimeGuidanceMcpLines[7]).result.content[0].text);
if (
  runtimeGuidanceMcp.status !== 0 ||
  coordinationOverviewMcpPayload.overview?.kind !== "coordination_overview_view" ||
  coordinationOverviewMcpPayload.overview?.recommendedReason !== "coordination_model_loaded" ||
  coordinationOverviewMcpPayload.overview?.counts?.facets !== 3 ||
  coordinationOverviewMcpPayload.overview?.overview?.deliveryBoundary !== "codex-only runtime" ||
  workerGuidelinesMcpPayload.guidelines?.kind !== "worker_guidelines_view" ||
  workerGuidelinesMcpPayload.guidelines?.recommendedReason !== "worker_guidelines_loaded" ||
  workerGuidelinesMcpPayload.guidelines?.counts?.validationSteps !== 3 ||
  workerGuidelinesMcpPayload.guidelines?.guidelines?.fileOwnership !== "one active writer per file" ||
  runtimeCatalogAgentsMcpPayload.agents?.kind !== "runtime_catalog_lane_view" ||
  runtimeCatalogAgentsMcpPayload.agents?.entryType !== "agent" ||
  !runtimeCatalogAgentsMcpPayload.agents?.entries?.some((entry) => entry.id === "executor") ||
  runtimeCatalogSkillsMcpPayload.skills?.kind !== "runtime_catalog_lane_view" ||
  runtimeCatalogSkillsMcpPayload.skills?.entryType !== "skill" ||
  !runtimeCatalogSkillsMcpPayload.skills?.entries?.some((entry) => entry.id === "project-development") ||
  runtimeCatalogAgentMcpPayload.agent?.kind !== "runtime_catalog_entry_view" ||
  runtimeCatalogAgentMcpPayload.agent?.matchedId !== "executor" ||
  runtimeCapabilityMcpPayload.capability?.kind !== "runtime_capability_view" ||
  runtimeCapabilityMcpPayload.capability?.matchedCapability !== "memory" ||
  !runtimeCapabilityMcpPayload.capability?.capability?.mcpTools?.includes("memory_get") ||
  runtimeCatalogSkillMcpPayload.skill?.kind !== "runtime_catalog_entry_view" ||
  runtimeCatalogSkillMcpPayload.skill?.matchedId !== "project-development"
) {
  console.error("[smoke:runtime-guidance-capability-mcp] expected MCP guidance, capability, and runtime catalog lane/entry views");
  console.error(runtimeGuidanceMcp.stderr || runtimeGuidanceMcp.stdout);
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
run("inbox-task-add-1", [
  "./src/index.js",
  "task:add",
  "--title",
  "claimable task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/index.js",
  "--acceptance",
  "claim later",
  "--verification",
  "inbox ranks claimable"
]);
run("inbox-task-add-2", [
  "./src/index.js",
  "task:add",
  "--title",
  "review task",
  "--owner",
  "executor",
  "--verifier",
  "tester",
  "--scope",
  "src/mcp.js",
  "--acceptance",
  "review later",
  "--verification",
  "inbox ranks review"
]);
run("inbox-task-claim-2", ["./src/index.js", "task:claim", "--id", "task-2", "--by", "worker-review"]);
run("inbox-task-ready-2", ["./src/index.js", "task:review", "--id", "task-2", "--by", "worker-review"]);
const cliInbox = JSON.parse(
  run("task-inbox-cli", ["./src/index.js", "task:inbox", "--role", "tester", "--worker", "tester-worker"]).stdout
).inbox;
if (cliInbox.recommendedReason !== "review_queue_visible" || cliInbox.tasks?.[0]?.id !== "task-2" || cliInbox.tasks?.[0]?.relation !== "verifier_review") {
  console.error("[smoke:task-inbox] expected verifier review task to rank first");
  process.exit(1);
}
const cliNext = JSON.parse(
  run("task-next-cli", ["./src/index.js", "task:next", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).next;
if (cliNext.recommendedReason !== "review_ready_candidate" || cliNext.candidate?.id !== "task-2" || cliNext.brief?.recommendedNextAction !== "review_and_decide") {
  console.error("[smoke:task-next] expected verifier next task to include execution brief");
  process.exit(1);
}
const verifierSession = JSON.parse(
  run("worker-session-verifier", ["./src/index.js", "worker:session", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).session;
if (
  verifierSession.counts.reviewQueue !== 1 ||
  verifierSession.recommendedReason !== "review_task_focus" ||
  verifierSession.focus?.kind !== "review_task" ||
  verifierSession.reviewQueue?.[0]?.summary?.id !== "task-2"
) {
  console.error("[smoke:worker-session] expected verifier session review focus");
  process.exit(1);
}
const verifierHandoff = JSON.parse(
  run("worker-handoff-verifier", ["./src/index.js", "worker:handoff", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).handoff;
if (
  verifierHandoff.recommendedReason !== "review_task_handoff" ||
  verifierHandoff.focus?.kind !== "review_task" ||
  verifierHandoff.currentTask?.id !== "task-2" ||
  verifierHandoff.summary?.includes("verifier") !== true
) {
  console.error("[smoke:worker-handoff] expected verifier handoff package");
  process.exit(1);
}
const verifierCloseout = JSON.parse(
  run("worker-closeout-verifier", ["./src/index.js", "worker:closeout", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).closeout;
if (
  verifierCloseout.recommendedReason !== "review_task_ready_for_decision" ||
  verifierCloseout.focus?.kind !== "review_task" ||
  verifierCloseout.command !== "node ./src/index.js task:approve --id task-2 --by tester" ||
  verifierCloseout.report?.task?.id !== "task-2"
) {
  console.error("[smoke:worker-closeout] expected verifier closeout bundle");
  process.exit(1);
}
const verifierWorkerPack = JSON.parse(
  run("runtime-worker-pack-verifier", ["./src/index.js", "runtime:worker-pack", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).workerPack;
if (
  verifierWorkerPack.recommendedSurface !== "worker:closeout" ||
  verifierWorkerPack.recommendedReason !== "review_task_priority" ||
  verifierWorkerPack.metadata?.hasFocus !== true ||
  verifierWorkerPack.metadata?.hasCloseout !== true ||
  verifierWorkerPack.counts?.surfacedNextEntries !== Object.values(verifierWorkerPack.next ?? {}).filter(Boolean).length ||
  verifierWorkerPack.next?.focus?.kind !== "review_task" ||
  verifierWorkerPack.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-worker-pack] expected verifier worker pack");
  process.exit(1);
}
const verifierPackCli = JSON.parse(
  run("runtime-verifier-pack-cli", ["./src/index.js", "runtime:verifier-pack", "--role", "tester", "--worker", "tester-worker"]).stdout
).verifierPack;
if (
  verifierPackCli.kind !== "runtime_verifier_pack" ||
  verifierPackCli.recommendedSurface !== "worker:closeout" ||
  verifierPackCli.recommendedReason !== "decision_bundle_ready" ||
  verifierPackCli.metadata?.hasReview !== true ||
  verifierPackCli.metadata?.hasCandidate !== true ||
  verifierPackCli.metadata?.hasDecision !== true ||
  verifierPackCli.metadata?.hasCloseout !== true ||
  verifierPackCli.counts?.surfacedNextEntries !== Object.values(verifierPackCli.next ?? {}).filter(Boolean).length ||
  verifierPackCli.next?.decision?.id !== "task-2" ||
  verifierPackCli.surfaces?.review?.counts?.totalPendingReview !== 1 ||
  verifierPackCli.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-verifier-pack] expected CLI verifier pack");
  process.exit(1);
}
const verifierBundleCli = JSON.parse(
  run("verifier-bundle-cli", ["./src/index.js", "verifier:bundle", "--role", "tester", "--worker", "tester-worker"]).stdout
).bundle;
const verifierTaskBriefCli = JSON.parse(
  run("task-brief-verifier-loop", ["./src/index.js", "task:brief", "--id", "task-2"]).stdout
).brief;
if (
  verifierTaskBriefCli.recommendedReason !== "verifier_decision_brief" ||
  verifierTaskBriefCli.counts?.reviewEvidenceEntries !== verifierTaskBriefCli.review?.evidence.length ||
  verifierTaskBriefCli.recommendedNextAction !== "review_and_decide" ||
  verifierTaskBriefCli.review?.state !== "pending_verifier"
) {
  console.error("[smoke:task-brief] expected verifier decision brief");
  process.exit(1);
}

if (
  verifierBundleCli.recommendedReason !== "decision_target_ready" ||
  verifierBundleCli.metadata?.hasCurrentTask !== true ||
  verifierBundleCli.metadata?.hasReport !== true ||
  verifierBundleCli.metadata?.reviewTaskId !== "task-2" ||
  verifierBundleCli.counts?.recentHistoryEntries !== verifierBundleCli.recentHistory.length ||
  verifierBundleCli.counts?.recentAnnotationEntries !== verifierBundleCli.recentAnnotations.length ||
  verifierBundleCli.counts?.decisionCommands !== Object.values(verifierBundleCli.commands ?? {}).filter(Boolean).length ||
  verifierBundleCli.currentTask?.id !== "task-2" ||
  verifierBundleCli.report?.task?.id !== "task-2" ||
  verifierBundleCli.commands?.approve !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:verifier-bundle] expected CLI verifier decision bundle");
  process.exit(1);
}
const verifierReportCli = JSON.parse(
  run("task-report-verifier-loop", ["./src/index.js", "task:report", "--id", "task-2"]).stdout
).report;
if (
  verifierReportCli.recommendedReason !== "review_decision_pending" ||
  verifierReportCli.counts?.acceptanceItems !== verifierReportCli.acceptance.length ||
  verifierReportCli.counts?.verificationSteps !== verifierReportCli.verification.length ||
  verifierReportCli.closure?.nextGate?.action !== "verifier_decision" ||
  verifierReportCli.task?.id !== "task-2"
) {
  console.error("[smoke:task-report] expected verifier-pending task report");
  process.exit(1);
}
const pickupPreviewVerifier = JSON.parse(
  run("task-pickup-preview-verifier", ["./src/index.js", "task:pickup-preview", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).pickupPreview;
if (
  pickupPreviewVerifier.outcome !== "review" ||
  pickupPreviewVerifier.recommendedReason !== "review_pickup_preview" ||
  pickupPreviewVerifier.metadata?.hasCandidate !== true ||
  pickupPreviewVerifier.metadata?.hasTask !== true ||
  pickupPreviewVerifier.metadata?.hasBrief !== true ||
  pickupPreviewVerifier.metadata?.taskId !== "task-2" ||
  pickupPreviewVerifier.candidate?.id !== "task-2" ||
  pickupPreviewVerifier.command !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:task-pickup-preview] expected verifier pickup preview");
  process.exit(1);
}
const pickupPreviewVerifierState = JSON.parse(
  run("task-get-preview-state", ["./src/index.js", "task:get", "--id", "task-2"]).stdout
).task;
if (
  pickupPreviewVerifierState.kind !== "task_detail" ||
  pickupPreviewVerifierState.recommendedReason !== "task_detail_loaded" ||
  pickupPreviewVerifierState.task?.queueStatus !== "ready_for_review"
) {
  console.error("[smoke:task-pickup-preview] expected preview to preserve task state");
  process.exit(1);
}
const runtimePickupPackVerifier = JSON.parse(
  run("runtime-pickup-pack-verifier", ["./src/index.js", "runtime:pickup-pack", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).pickupPack;
if (
  runtimePickupPackVerifier.recommendedSurface !== "worker:closeout" ||
  runtimePickupPackVerifier.recommendedReason !== "review_task_priority" ||
  runtimePickupPackVerifier.metadata?.hasFocus !== true ||
  runtimePickupPackVerifier.metadata?.hasCandidate !== true ||
  runtimePickupPackVerifier.metadata?.hasBrief !== true ||
  runtimePickupPackVerifier.metadata?.hasPickup !== true ||
  runtimePickupPackVerifier.counts?.surfacedNextEntries !== Object.values(runtimePickupPackVerifier.next ?? {}).filter(Boolean).length ||
  runtimePickupPackVerifier.next?.pickup?.candidate?.id !== "task-2" ||
  runtimePickupPackVerifier.next?.pickup?.command !== "node ./src/index.js task:approve --id task-2 --by tester" ||
  runtimePickupPackVerifier.surfaces?.rolePack?.recommendedSurface !== "worker:closeout"
) {
  console.error("[smoke:runtime-pickup-pack] expected verifier pickup pack");
  process.exit(1);
}
const runtimeAssignmentPackVerifier = JSON.parse(
  run("runtime-assignment-pack-verifier", ["./src/index.js", "runtime:assignment-pack", "--role", "tester", "--worker", "tester-worker", "--mode", "verifier"]).stdout
).assignmentPack;
if (
  runtimeAssignmentPackVerifier.recommendedSurface !== "worker:closeout" ||
  runtimeAssignmentPackVerifier.recommendedReason !== "review_task_priority" ||
  runtimeAssignmentPackVerifier.metadata?.hasAssignment !== false ||
  runtimeAssignmentPackVerifier.metadata?.hasPickup !== true ||
  runtimeAssignmentPackVerifier.metadata?.hasCandidate !== true ||
  runtimeAssignmentPackVerifier.metadata?.hasFocus !== true ||
  runtimeAssignmentPackVerifier.counts?.surfacedNextEntries !== Object.values(runtimeAssignmentPackVerifier.next ?? {}).filter(Boolean).length ||
  runtimeAssignmentPackVerifier.next?.pickup?.kind !== "task_assignment_preview" ||
  runtimeAssignmentPackVerifier.next?.pickup?.outcome !== "none" ||
  runtimeAssignmentPackVerifier.next?.pickup?.candidate !== null ||
  runtimeAssignmentPackVerifier.next?.focus?.kind !== "review_task"
) {
  console.error("[smoke:runtime-assignment-pack] expected verifier assignment pack");
  process.exit(1);
}
const pickupPreviewOwner = JSON.parse(
  run("task-pickup-preview-owner", ["./src/index.js", "task:pickup-preview", "--role", "executor", "--worker", "worker-owner", "--mode", "owner"]).stdout
).pickupPreview;
if (
  pickupPreviewOwner.outcome !== "claimable" ||
  pickupPreviewOwner.recommendedReason !== "claimable_pickup_preview" ||
  pickupPreviewOwner.metadata?.hasCandidate !== true ||
  pickupPreviewOwner.metadata?.taskId !== "task-1" ||
  pickupPreviewOwner.candidate?.id !== "task-1" ||
  pickupPreviewOwner.command !== "node ./src/index.js task:pickup --role executor --worker worker-owner --mode owner"
) {
  console.error("[smoke:task-pickup-preview] expected owner claimable preview");
  process.exit(1);
}
const runtimePickupPackOwner = JSON.parse(
  run("runtime-pickup-pack-owner", ["./src/index.js", "runtime:pickup-pack", "--role", "executor", "--worker", "worker-owner", "--mode", "owner"]).stdout
).pickupPack;
if (
  runtimePickupPackOwner.recommendedSurface !== "task:pickup --role executor --worker worker-owner --mode owner" ||
  runtimePickupPackOwner.recommendedReason !== "claimable_pickup_ready" ||
  runtimePickupPackOwner.metadata?.hasFocus !== true ||
  runtimePickupPackOwner.metadata?.hasCandidate !== true ||
  runtimePickupPackOwner.metadata?.hasBrief !== true ||
  runtimePickupPackOwner.metadata?.hasPickup !== true ||
  runtimePickupPackOwner.counts?.surfacedNextEntries !== Object.values(runtimePickupPackOwner.next ?? {}).filter(Boolean).length ||
  runtimePickupPackOwner.next?.focus?.taskId !== "task-1" ||
  runtimePickupPackOwner.next?.pickup?.outcome !== "claimable" ||
  runtimePickupPackOwner.next?.pickup?.candidate?.id !== "task-1"
) {
  console.error("[smoke:runtime-pickup-pack] expected owner pickup pack to recommend task pickup");
  process.exit(1);
}
const runtimeAssignmentPackOwner = JSON.parse(
  run("runtime-assignment-pack-owner", ["./src/index.js", "runtime:assignment-pack", "--role", "executor", "--worker", "worker-owner", "--mode", "owner"]).stdout
).assignmentPack;
if (
  runtimeAssignmentPackOwner.recommendedSurface !== "task:next" ||
  runtimeAssignmentPackOwner.recommendedReason !== "next_candidate_visible" ||
  runtimeAssignmentPackOwner.metadata?.hasAssignment !== false ||
  runtimeAssignmentPackOwner.metadata?.hasPickup !== true ||
  runtimeAssignmentPackOwner.metadata?.hasCandidate !== true ||
  runtimeAssignmentPackOwner.metadata?.hasFocus !== true ||
  runtimeAssignmentPackOwner.counts?.surfacedNextEntries !== Object.values(runtimeAssignmentPackOwner.next ?? {}).filter(Boolean).length ||
  runtimeAssignmentPackOwner.next?.pickup?.kind !== "task_assignment_preview" ||
  runtimeAssignmentPackOwner.next?.pickup?.outcome !== "none" ||
  runtimeAssignmentPackOwner.next?.pickup?.candidate !== null ||
  runtimeAssignmentPackOwner.next?.candidate?.id !== "task-1"
) {
  console.error("[smoke:runtime-assignment-pack] expected owner assignment pack");
  process.exit(1);
}
const ownerPickupClaim = JSON.parse(
  run("task-pickup-claim", ["./src/index.js", "task:pickup", "--role", "executor", "--worker", "worker-owner", "--mode", "owner"]).stdout
).pickup;
if (
  ownerPickupClaim.outcome !== "claimed" ||
  ownerPickupClaim.recommendedReason !== "claimable_owner_work" ||
  ownerPickupClaim.task?.id !== "task-1" ||
  ownerPickupClaim.task?.claimedBy !== "worker-owner" ||
  ownerPickupClaim.brief?.task?.queueStatus !== "claimed"
) {
  console.error("[smoke:task-pickup] expected claimable task to auto-claim for owner");
  process.exit(1);
}
const inboxMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_inbox",
      arguments: { role: "tester", workerId: "tester-worker" }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "task_next",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const inboxMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: inboxMcpInput,
  encoding: "utf8"
});
const inboxMcpLines = inboxMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const inboxMcpPayload = JSON.parse(JSON.parse(inboxMcpLines[1]).result.content[0].text);
const nextMcpPayload = JSON.parse(JSON.parse(inboxMcpLines[2]).result.content[0].text);
if (
  inboxMcp.status !== 0 ||
  inboxMcpPayload.inbox?.recommendedReason !== "review_queue_visible" ||
  inboxMcpPayload.inbox?.tasks?.[0]?.id !== "task-2" ||
  nextMcpPayload.next?.recommendedReason !== "review_ready_candidate" ||
  nextMcpPayload.next?.candidate?.id !== "task-2" ||
  nextMcpPayload.next?.brief?.roles?.verifier?.promptPath !== ".codex/agents/tester.md"
) {
  console.error("[smoke:task-inbox-mcp] expected inbox and next-task MCP surfaces");
  console.error(inboxMcp.stderr || inboxMcp.stdout);
  process.exit(1);
}
const pickupMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_pickup",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const pickupMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: pickupMcpInput,
  encoding: "utf8"
});
const pickupMcpLines = pickupMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const pickupMcpPayload = JSON.parse(JSON.parse(pickupMcpLines[1]).result.content[0].text);
if (
  pickupMcp.status !== 0 ||
  pickupMcpPayload.pickup?.outcome !== "review" ||
  pickupMcpPayload.pickup?.recommendedReason !== "review_ready_work" ||
  pickupMcpPayload.pickup?.candidate?.id !== "task-2" ||
  pickupMcpPayload.pickup?.command !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:task-pickup-mcp] expected review pickup payload");
  console.error(pickupMcp.stderr || pickupMcp.stdout);
  process.exit(1);
}
const pickupPreviewMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "task_pickup_preview",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const pickupPreviewMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: pickupPreviewMcpInput,
  encoding: "utf8"
});
const pickupPreviewMcpLines = pickupPreviewMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const pickupPreviewMcpPayload = JSON.parse(JSON.parse(pickupPreviewMcpLines[1]).result.content[0].text);
if (
  pickupPreviewMcp.status !== 0 ||
  pickupPreviewMcpPayload.pickupPreview?.outcome !== "review" ||
  pickupPreviewMcpPayload.pickupPreview?.recommendedReason !== "review_pickup_preview" ||
  pickupPreviewMcpPayload.pickupPreview?.metadata?.hasBrief !== true ||
  pickupPreviewMcpPayload.pickupPreview?.metadata?.taskId !== "task-2" ||
  pickupPreviewMcpPayload.pickupPreview?.candidate?.id !== "task-2" ||
  pickupPreviewMcpPayload.pickupPreview?.command !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:task-pickup-preview-mcp] expected review pickup preview payload");
  console.error(pickupPreviewMcp.stderr || pickupPreviewMcp.stdout);
  process.exit(1);
}
const workerSessionMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "worker_session",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const workerSessionMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerSessionMcpInput,
  encoding: "utf8"
});
const workerSessionMcpLines = workerSessionMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerSessionMcpPayload = JSON.parse(JSON.parse(workerSessionMcpLines[1]).result.content[0].text);
if (
  workerSessionMcp.status !== 0 ||
  workerSessionMcpPayload.session?.recommendedReason !== "review_task_focus" ||
  workerSessionMcpPayload.session?.focus?.kind !== "review_task" ||
  workerSessionMcpPayload.session?.reviewQueue?.[0]?.summary?.id !== "task-2"
) {
  console.error("[smoke:worker-session-mcp] expected review-focused worker session");
  console.error(workerSessionMcp.stderr || workerSessionMcp.stdout);
  process.exit(1);
}
const workerHandoffMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "worker_handoff",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const workerHandoffMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerHandoffMcpInput,
  encoding: "utf8"
});
const workerHandoffMcpLines = workerHandoffMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerHandoffMcpPayload = JSON.parse(JSON.parse(workerHandoffMcpLines[1]).result.content[0].text);
if (
  workerHandoffMcp.status !== 0 ||
  workerHandoffMcpPayload.handoff?.recommendedReason !== "review_task_handoff" ||
  workerHandoffMcpPayload.handoff?.focus?.kind !== "review_task" ||
  workerHandoffMcpPayload.handoff?.currentTask?.id !== "task-2"
) {
  console.error("[smoke:worker-handoff-mcp] expected verifier handoff payload");
  console.error(workerHandoffMcp.stderr || workerHandoffMcp.stdout);
  process.exit(1);
}
const workerCloseoutMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "worker_closeout",
      arguments: { role: "tester", workerId: "tester-worker", mode: "verifier" }
    }
  })
].join("\n") + "\n";
const workerCloseoutMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerCloseoutMcpInput,
  encoding: "utf8"
});
const workerCloseoutMcpLines = workerCloseoutMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerCloseoutMcpPayload = JSON.parse(JSON.parse(workerCloseoutMcpLines[1]).result.content[0].text);
if (
  workerCloseoutMcp.status !== 0 ||
  workerCloseoutMcpPayload.closeout?.recommendedReason !== "review_task_ready_for_decision" ||
  workerCloseoutMcpPayload.closeout?.focus?.kind !== "review_task" ||
  workerCloseoutMcpPayload.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:worker-closeout-mcp] expected verifier closeout bundle");
  console.error(workerCloseoutMcp.stderr || workerCloseoutMcp.stdout);
  process.exit(1);
}
const verifierBundleMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "verifier_bundle",
      arguments: { role: "tester", workerId: "tester-worker" }
    }
  })
].join("\n") + "\n";
const verifierBundleMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: verifierBundleMcpInput,
  encoding: "utf8"
});
const verifierBundleMcpLines = verifierBundleMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const verifierBundleMcpPayload = JSON.parse(JSON.parse(verifierBundleMcpLines[1]).result.content[0].text);
if (
  verifierBundleMcp.status !== 0 ||
  verifierBundleMcpPayload.bundle?.recommendedReason !== "decision_target_ready" ||
  verifierBundleMcpPayload.bundle?.currentTask?.id !== "task-2" ||
  verifierBundleMcpPayload.bundle?.commands?.approve !== "node ./src/index.js task:approve --id task-2 --by tester"
) {
  console.error("[smoke:verifier-bundle-mcp] expected MCP verifier decision bundle");
  console.error(verifierBundleMcp.stderr || verifierBundleMcp.stdout);
  process.exit(1);
}
const workerPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_worker_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker",
        mode: "verifier"
      }
    }
  })
].join("\n") + "\n";
const workerPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: workerPackMcpInput,
  encoding: "utf8"
});
const workerPackMcpLines = workerPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const workerPackMcpPayload = JSON.parse(JSON.parse(workerPackMcpLines[1]).result.content[0].text);
if (
  workerPackMcp.status !== 0 ||
  workerPackMcpPayload.workerPack?.recommendedSurface !== "worker:closeout" ||
  workerPackMcpPayload.workerPack?.recommendedReason !== "review_task_priority" ||
  workerPackMcpPayload.workerPack?.metadata?.hasCloseout !== true ||
  workerPackMcpPayload.workerPack?.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-worker-pack-mcp] expected MCP worker pack");
  console.error(workerPackMcp.stderr || workerPackMcp.stdout);
  process.exit(1);
}
const verifierPackMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "runtime_verifier_pack",
      arguments: {
        role: "tester",
        workerId: "tester-worker"
      }
    }
  })
].join("\n") + "\n";
const verifierPackMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: verifierPackMcpInput,
  encoding: "utf8"
});
const verifierPackMcpLines = verifierPackMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const verifierPackMcpPayload = JSON.parse(JSON.parse(verifierPackMcpLines[1]).result.content[0].text);
if (
  verifierPackMcp.status !== 0 ||
  verifierPackMcpPayload.verifierPack?.recommendedSurface !== "worker:closeout" ||
  verifierPackMcpPayload.verifierPack?.recommendedReason !== "decision_bundle_ready" ||
  verifierPackMcpPayload.verifierPack?.metadata?.hasReview !== true ||
  verifierPackMcpPayload.verifierPack?.metadata?.hasCandidate !== true ||
  verifierPackMcpPayload.verifierPack?.metadata?.hasDecision !== true ||
  verifierPackMcpPayload.verifierPack?.metadata?.hasCloseout !== true ||
  verifierPackMcpPayload.verifierPack?.counts?.surfacedNextEntries !==
    Object.values(verifierPackMcpPayload.verifierPack?.next ?? {}).filter(Boolean).length ||
  verifierPackMcpPayload.verifierPack?.next?.decision?.id !== "task-2" ||
  verifierPackMcpPayload.verifierPack?.surfaces?.closeout?.report?.task?.id !== "task-2"
) {
  console.error("[smoke:runtime-verifier-pack-mcp] expected MCP verifier pack");
  console.error(verifierPackMcp.stderr || verifierPackMcp.stdout);
  process.exit(1);
}
const inboxHistory = JSON.parse(
  run("task-history-inbox", ["./src/index.js", "task:history", "--id", "task-2"]).stdout
).history;
if (
  inboxHistory.recommendedReason !== "review_event_latest" ||
  inboxHistory.counts?.totalHistoryEntries !== inboxHistory.history.length ||
  inboxHistory.history?.map((entry) => entry.type).join(",") !== "created,claimed,ready_for_review"
) {
  console.error("[smoke:task-history] expected inbox review task history");
  process.exit(1);
}

rmSync(".codex-bees", { recursive: true, force: true });
const memoryMcpInput = [
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "memory_store",
      arguments: {
        content: "Remember MCP memory smoke coverage",
        namespace: "mcp-smoke",
        kind: "note",
        tags: ["smoke", "memory"]
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "memory_get",
      arguments: {
        id: "memory-1"
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "memory_list",
      arguments: {
        namespace: "mcp-smoke"
      }
    }
  }),
  JSON.stringify({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "memory_search",
      arguments: {
        query: "smoke coverage",
        namespace: "mcp-smoke",
        limit: 5
      }
    }
  })
].join("\n") + "\n";

const memoryMcp = spawnSync("node", ["./src/mcp.js", "--stdio"], {
  input: memoryMcpInput,
  encoding: "utf8"
});
const memoryMcpLines = memoryMcp.stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const memoryStoreResult = memoryMcpLines.length >= 2 ? JSON.parse(memoryMcpLines[1]) : null;
const memoryStoreText = memoryStoreResult?.result?.content?.[0]?.text;
const memoryStorePayload = memoryStoreText ? JSON.parse(memoryStoreText) : null;
const memoryGetResult = memoryMcpLines.length >= 3 ? JSON.parse(memoryMcpLines[2]) : null;
const memoryGetText = memoryGetResult?.result?.content?.[0]?.text;
const memoryGetPayload = memoryGetText ? JSON.parse(memoryGetText) : null;
const memoryListResult = memoryMcpLines.length >= 4 ? JSON.parse(memoryMcpLines[3]) : null;
const memoryListText = memoryListResult?.result?.content?.[0]?.text;
const memoryListPayload = memoryListText ? JSON.parse(memoryListText) : null;
const memorySearchResult = memoryMcpLines.length >= 5 ? JSON.parse(memoryMcpLines[4]) : null;
const memorySearchText = memorySearchResult?.result?.content?.[0]?.text;
const memorySearchPayload = memorySearchText ? JSON.parse(memorySearchText) : null;
if (
  memoryMcp.status !== 0 ||
  memoryStorePayload?.stored?.kind !== "memory_mutation" ||
  memoryStorePayload?.stored?.recommendedReason !== "memory_stored" ||
  memoryStorePayload?.stored?.memory?.namespace !== "mcp-smoke" ||
  memoryStorePayload?.stored?.memory?.content !== "Remember MCP memory smoke coverage" ||
  memoryGetPayload?.memory?.kind !== "memory_detail" ||
  memoryGetPayload?.memory?.recommendedReason !== "memory_detail_loaded" ||
  memoryGetPayload?.memory?.memory?.id !== memoryStorePayload?.stored?.memory?.id ||
  memoryListPayload?.memories?.kind !== "memory_view" ||
  memoryListPayload?.memories?.recommendedReason !== "memory_list_has_results" ||
  memoryListPayload?.memories?.counts?.totalMemories !== memoryListPayload.memories.memories.length ||
  !memoryListPayload?.memories?.memories?.some((memory) => memory.namespace === "mcp-smoke") ||
  memorySearchPayload?.kind !== "memory_search_view" ||
  memorySearchPayload?.recommendedReason !== "memory_search_has_results" ||
  memorySearchPayload?.counts?.totalResults !== memorySearchPayload.results.length ||
  memorySearchPayload?.query !== "smoke coverage" ||
  !Array.isArray(memorySearchPayload?.results) ||
  memorySearchPayload.results.length === 0
) {
  console.error("[smoke:memory-mcp] expected searchable MCP memory");
  console.error(memoryMcp.stderr || memoryMcp.stdout);
  process.exit(1);
}

console.log("smoke: ok");
