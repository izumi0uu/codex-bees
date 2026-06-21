import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { cwd } from "node:process";
import { getBundledRuntimeCatalogPaths } from "./catalog.js";

const STATE_GITIGNORE_ENTRY = ".codex-bees/";

function directoryExists(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function fileExists(path) {
  return existsSync(path) && statSync(path).isFile();
}

function toDisplayPath(path, baseDirectory) {
  const relativePath = relative(baseDirectory, path);
  return relativePath ? relativePath.split("\\").join("/") : ".";
}

function listBundledFiles(root) {
  const files = [];

  function walk(directory) {
    for (const entry of readdirSync(directory)) {
      const entryPath = join(directory, entry);
      const stat = statSync(entryPath);
      if (stat.isDirectory()) {
        walk(entryPath);
      } else {
        files.push(entryPath);
      }
    }
  }

  walk(root);
  return files;
}

function buildCodexEntries(targetDirectory, force) {
  const bundled = getBundledRuntimeCatalogPaths();
  if (bundled.source === "missing" || !directoryExists(bundled.codexDir)) {
    throw new Error("codex-bees bundled .codex assets are unavailable");
  }

  return listBundledFiles(bundled.codexDir).map((sourcePath) => {
    const relativeAssetPath = relative(bundled.codexDir, sourcePath);
    const targetPath = join(targetDirectory, ".codex", relativeAssetPath);
    const action = fileExists(targetPath) ? (force ? "update" : "skip") : "create";

    return {
      type: "file",
      path: toDisplayPath(targetPath, targetDirectory),
      sourcePath,
      targetPath,
      action,
      reason:
        action === "create"
          ? "bundled_asset_missing"
          : action === "update"
            ? "force_requested"
            : "existing_file_preserved"
    };
  });
}

function buildGitignoreEntry(targetDirectory) {
  const gitignorePath = join(targetDirectory, ".gitignore");
  if (!fileExists(gitignorePath)) {
    return {
      type: "file",
      path: ".gitignore",
      targetPath: gitignorePath,
      action: "create",
      reason: "state_directory_should_stay_local"
    };
  }

  const current = readFileSync(gitignorePath, "utf8");
  if (current.split(/\r?\n/).includes(STATE_GITIGNORE_ENTRY)) {
    return {
      type: "file",
      path: ".gitignore",
      targetPath: gitignorePath,
      action: "skip",
      reason: "state_directory_already_ignored"
    };
  }

  return {
    type: "file",
    path: ".gitignore",
    targetPath: gitignorePath,
    action: "update",
    reason: "state_directory_should_stay_local"
  };
}

function summarizeEntries(entries) {
  return entries.reduce(
    (counts, entry) => {
      counts.totalEntries += 1;
      counts[entry.action] += 1;
      return counts;
    },
    {
      totalEntries: 0,
      create: 0,
      update: 0,
      skip: 0
    }
  );
}

function buildPreviewSummary(targetDirectory, force, counts) {
  return {
    hasChanges: counts.create + counts.update > 0,
    targetDirectory,
    force,
    totalEntries: counts.totalEntries,
    create: counts.create,
    update: counts.update,
    skip: counts.skip
  };
}

function buildResultSummary(targetDirectory, force, created, updated, skipped, totalEntries) {
  return {
    hasChanges: created.length + updated.length > 0,
    targetDirectory,
    force,
    totalEntries,
    created: created.length,
    updated: updated.length,
    skipped: skipped.length
  };
}

function materializeEntries(entries) {
  const created = [];
  const updated = [];
  const skipped = [];

  for (const entry of entries) {
    if (entry.action === "skip") {
      skipped.push(entry.path);
      continue;
    }

    mkdirSync(dirname(entry.targetPath), { recursive: true });

    if (entry.path === ".gitignore") {
      if (!fileExists(entry.targetPath)) {
        writeFileSync(entry.targetPath, `${STATE_GITIGNORE_ENTRY}\n`);
      } else {
        const current = readFileSync(entry.targetPath, "utf8");
        const next = current.endsWith("\n")
          ? `${current}${STATE_GITIGNORE_ENTRY}\n`
          : `${current}\n${STATE_GITIGNORE_ENTRY}\n`;
        writeFileSync(entry.targetPath, next);
      }
    } else {
      writeFileSync(entry.targetPath, readFileSync(entry.sourcePath));
    }

    if (entry.action === "create") {
      created.push(entry.path);
    } else {
      updated.push(entry.path);
    }
  }

  return { created, updated, skipped };
}

function buildEntries(targetDirectory, force) {
  return [...buildCodexEntries(targetDirectory, force), buildGitignoreEntry(targetDirectory)];
}

export function previewWorkspaceInit(options = {}) {
  const targetDirectory = resolve(options.targetDirectory ?? cwd());
  const force = options.force === true;
  const entries = buildEntries(targetDirectory, force);
  const counts = summarizeEntries(entries);

  return {
    kind: "workspace_init_preview",
    recommendedReason: counts.create + counts.update > 0 ? "init_changes_required" : "init_already_applied",
    targetDirectory,
    force,
    summary: buildPreviewSummary(targetDirectory, force, counts),
    counts,
    entries: entries.map(({ type, path, action, reason }) => ({ type, path, action, reason })),
    next: [
      "run `codex-bees init` to materialize the shipped .codex assets",
      "review the generated .codex prompts and skills before committing them",
      "run `codex-bees catalog` inside the initialized project to confirm workspace assets are active"
    ]
  };
}

export function initWorkspace(options = {}) {
  const targetDirectory = resolve(options.targetDirectory ?? cwd());
  const force = options.force === true;
  mkdirSync(targetDirectory, { recursive: true });

  const entries = buildEntries(targetDirectory, force);
  const { created, updated, skipped } = materializeEntries(entries);

  return {
    kind: "workspace_init_result",
    recommendedReason: created.length + updated.length > 0 ? "init_applied" : "init_no_changes",
    targetDirectory,
    force,
    summary: buildResultSummary(targetDirectory, force, created, updated, skipped, entries.length),
    counts: {
      created: created.length,
      updated: updated.length,
      skipped: skipped.length,
      totalEntries: entries.length
    },
    created,
    updated,
    skipped,
    next: [
      "run `codex-bees catalog` inside the initialized project to confirm workspace assets are active",
      "run `codex-bees status` to inspect the shipped command and capability surface",
      "commit the generated `.codex` assets after reviewing any local prompt or skill adjustments"
    ]
  };
}
