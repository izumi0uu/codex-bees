import { join } from "node:path";
import { cwd } from "node:process";
import {
  defaultState,
  normalizeState
} from "../../../state-normalize.js";
import {
  ensureStateFileAtPath,
  loadStateFromFile,
  recoverCorruptStateFile as recoverCorruptStateFileWithPaths,
  saveStateToFile,
  writeStateFile as writeStateFileWithPaths
} from "../../../state-storage.js";

const STATE_DIR = join(cwd(), ".codex-bees");
const STATE_FILE = join(STATE_DIR, "state.json");

export function createStatePersistence() {
  function ensureStateFile() {
    return ensureStateFileAtPath({
      stateDir: STATE_DIR,
      stateFile: STATE_FILE,
      defaultState,
      writeStateFile: writeStateFileWithPaths
    });
  }

  function loadState() {
    return loadStateFromFile({
      stateDir: STATE_DIR,
      stateFile: STATE_FILE,
      defaultState,
      normalizeState,
      ensureStateFile,
      recoverCorruptStateFile: recoverCorruptStateFileWithPaths
    });
  }

  function saveState(state) {
    return saveStateToFile(state, {
      stateDir: STATE_DIR,
      stateFile: STATE_FILE,
      normalizeState,
      ensureStateFile,
      writeStateFile: writeStateFileWithPaths
    });
  }

  return {
    ensureStateFile,
    loadState,
    saveState
  };
}
