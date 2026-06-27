import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";

export function writeStateFile(stateDir, stateFile, state) {
  mkdirSync(stateDir, { recursive: true });
  const tmpPath = `${stateFile}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(state, null, 2) + "\n", "utf8");
  renameSync(tmpPath, stateFile);
}

export function recoverCorruptStateFile({ stateDir, stateFile, error, defaultState }) {
  try {
    if (existsSync(stateFile)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const corruptPath = join(stateDir, `state.corrupt.${timestamp}.json`);
      renameSync(stateFile, corruptPath);
    }
  } catch {
    try {
      unlinkSync(stateFile);
    } catch {
      // ignore cleanup failures; caller will rewrite a clean file on next save
    }
  }

  writeStateFile(stateDir, stateFile, defaultState);
  console.warn(`[codex-bees] recovered corrupt state file: ${error.message}`);
}

export function ensureStateFileAtPath({ stateDir, stateFile, defaultState, writeStateFile }) {
  mkdirSync(stateDir, { recursive: true });
  if (!existsSync(stateFile)) {
    writeStateFile(stateDir, stateFile, defaultState());
  }
  return stateFile;
}

export function loadStateFromFile({
  stateDir,
  stateFile,
  defaultState,
  normalizeState,
  ensureStateFile,
  recoverCorruptStateFile
}) {
  ensureStateFile();
  try {
    const raw = readFileSync(stateFile, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (error) {
    recoverCorruptStateFile({
      stateDir,
      stateFile,
      error,
      defaultState: defaultState()
    });
    return defaultState();
  }
}

export function saveStateToFile(
  state,
  {
    stateDir,
    stateFile,
    normalizeState,
    ensureStateFile,
    writeStateFile
  }
) {
  ensureStateFile();
  const next = normalizeState({
    ...state,
    updatedAt: new Date().toISOString()
  });
  writeStateFile(stateDir, stateFile, next);
  return next;
}
