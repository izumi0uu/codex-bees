import { argv, exit, readOption, writeErr } from "./helpers.js";
import { runInteractiveRuntimeTui } from "../../runtime-tui.js";

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
  await runInteractiveRuntimeTui({ section, snapshot, width, height });
}
