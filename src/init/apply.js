import { mkdirSync } from "node:fs";
import { cwd } from "node:process";
import { resolve } from "node:path";
import { buildEntries, buildResultSummary, materializeEntries } from "./core.js";

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
