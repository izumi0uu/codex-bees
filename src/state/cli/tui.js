import { argv, exit, readOption, write, writeErr } from "./helpers.js";
import { getRuntimeTuiSnapshot, runInteractiveRuntimeTui } from "../../runtime-tui.js";

function readPositiveInteger(flag) {
  const index = argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  const value = Number(argv[index + 1]);
  if (!Number.isInteger(value) || value <= 0) {
    writeErr(`${flag} must be a positive integer\n`);
    exit(1);
  }
  return value;
}

export async function handleTui() {
  const snapshot = argv.includes("--snapshot");
  const section = readOption("--section");
  const width = readPositiveInteger("--width");
  const height = readPositiveInteger("--height");

  if (snapshot) {
    const view = getRuntimeTuiSnapshot({ section, width, height });
    write(`${view.text}\n`);
    return;
  }

  await runInteractiveRuntimeTui({ section });
}
