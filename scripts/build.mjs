import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { PUBLIC_TYPE_ENTRYPOINTS } from "../src/typings.js";

function copySourceModules() {
  for (const entry of readdirSync("src")) {
    if (
      !entry.endsWith(".js") ||
      entry === "state-public.js" ||
      entry === "catalog-public.js" ||
      entry === "runtime-contract-public.js"
    ) {
      continue;
    }
    copyFileSync(join("src", entry), join("dist", entry));
  }

  copyFileSync(join("src", "state-public.js"), join("dist", "state-public.js"));
  copyFileSync(join("src", "catalog-public.js"), join("dist", "catalog-public.js"));
  copyFileSync(join("src", "runtime-contract-public.js"), join("dist", "runtime-contract-public.js"));
}

function copyTree(source, target) {
  const stat = statSync(source);
  if (stat.isDirectory()) {
    mkdirSync(target, { recursive: true });
    for (const entry of readdirSync(source)) {
      copyTree(join(source, entry), join(target, entry));
    }
    return;
  }

  copyFileSync(source, target);
}

function writeDistPackageMetadata() {
  const packageManifest = JSON.parse(readFileSync("package.json", "utf8"));
  writeFileSync(
    join("dist", "package-metadata.json"),
    JSON.stringify({
      name: packageManifest.name,
      version: packageManifest.version,
      description: packageManifest.description,
      license: packageManifest.license,
      homepage: packageManifest.homepage ?? null,
      bugs: packageManifest.bugs ?? null,
      repository: packageManifest.repository ?? null,
      keywords: Array.isArray(packageManifest.keywords) ? packageManifest.keywords : []
    }, null, 2) + "\n"
  );
}

function verifyDistCommand(label, args) {
  const result = spawnSync("node", args, { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`[build:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

function assertMatchingExportSurface(label, sourceModule, distModule) {
  const sourceKeys = Object.keys(sourceModule).sort();
  const distKeys = Object.keys(distModule).sort();
  if (JSON.stringify(sourceKeys) !== JSON.stringify(distKeys)) {
    console.error(`[build:${label}] failed`);
    console.error(
      JSON.stringify(
        {
          sourceKeys,
          distKeys
        },
        null,
        2
      )
    );
    process.exit(1);
  }
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
copySourceModules();
copyFileSync("index.d.ts", join("dist", "api.d.ts"));
for (const entrypoint of PUBLIC_TYPE_ENTRYPOINTS) {
  const sourceDtsPath =
    entrypoint === "state"
      ? "state.d.ts"
      : entrypoint === "catalog"
        ? "catalog.d.ts"
        : entrypoint === "runtime-contract"
          ? "runtime-contract.d.ts"
          : "index.d.ts";
  copyFileSync(sourceDtsPath, join("dist", `${entrypoint}.d.ts`));
}
copyTree(".codex", join("dist", ".codex"));
writeDistPackageMetadata();

verifyDistCommand("dist-help", ["./dist/index.js", "--help"]);
verifyDistCommand("dist-tools", ["./dist/mcp.js", "--tools"]);
const sourceApiModule = await import(new URL("../src/api.js", import.meta.url));
const distApiModule = await import(new URL("../dist/api.js", import.meta.url));
assertMatchingExportSurface("dist-api", sourceApiModule, distApiModule);

console.log("built");
