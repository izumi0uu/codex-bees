import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { PUBLIC_TYPE_ENTRYPOINTS } from "../src/typings.js";

function copySourceModules() {
  for (const entry of readdirSync("src")) {
    if (!entry.endsWith(".js")) {
      continue;
    }
    copyFileSync(join("src", entry), join("dist", entry));
  }
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

function verifyDistScript(label, script) {
  const result = spawnSync("node", ["-e", script], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`[build:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
copySourceModules();
copyFileSync("index.d.ts", join("dist", "api.d.ts"));
for (const entrypoint of PUBLIC_TYPE_ENTRYPOINTS) {
  copyFileSync("index.d.ts", join("dist", `${entrypoint}.d.ts`));
}
copyTree(".codex", join("dist", ".codex"));
writeDistPackageMetadata();

verifyDistCommand("dist-help", ["./dist/index.js", "--help"]);
verifyDistCommand("dist-tools", ["./dist/mcp.js", "--tools"]);
verifyDistScript(
  "dist-api",
  'import("./dist/api.js").then((m) => { if (!("getRuntimeCatalogView" in m) || !("getToolCatalogView" in m) || !("planTask" in m)) { throw new Error("dist api surface incomplete"); } })'
);

console.log("built");
