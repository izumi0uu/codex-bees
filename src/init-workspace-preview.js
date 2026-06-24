import { cwd } from "node:process";
import { resolve } from "node:path";
import { buildEntries, buildPreviewSummary, summarizeEntries } from "./init-workspace-core.js";

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
