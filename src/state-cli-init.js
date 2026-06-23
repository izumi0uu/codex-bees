import { argv } from "./state-cli-helpers.js";
import { renderInitHelpText } from "./commands.js";
import { initWorkspace, previewWorkspaceInit } from "./init.js";
import { readOption, write } from "./state-cli-helpers.js";
import { writeNamedView } from "./state-cli-view-writers.js";

function handleInit() {
  if (argv.includes("--help") || argv.includes("help")) {
    write(renderInitHelpText());
    return;
  }

  const preview = argv.includes("--preview");
  const force = argv.includes("--force");
  const targetDirectory = readOption("--dir") ?? readOption("--target") ?? undefined;

  if (preview) {
    writeNamedView("init", previewWorkspaceInit({ targetDirectory, force }));
    return;
  }

  writeNamedView("init", initWorkspace({ targetDirectory, force }));
}

export { handleInit };
