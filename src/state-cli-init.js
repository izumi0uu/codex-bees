import { argv } from "./state-cli-helpers.js";
import { renderInitHelpText } from "./commands.js";
import { initWorkspace, previewWorkspaceInit } from "./init.js";
import { readOption, write } from "./state-cli-helpers.js";

function handleInit() {
  if (argv.includes("--help") || argv.includes("help")) {
    write(renderInitHelpText());
    return;
  }

  const preview = argv.includes("--preview");
  const force = argv.includes("--force");
  const targetDirectory = readOption("--dir") ?? readOption("--target") ?? undefined;

  if (preview) {
    write(JSON.stringify({ init: previewWorkspaceInit({ targetDirectory, force }) }, null, 2) + "\n");
    return;
  }

  write(JSON.stringify({ init: initWorkspace({ targetDirectory, force }) }, null, 2) + "\n");
}

export { handleInit };
