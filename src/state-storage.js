import {
  existsSync,
  mkdirSync,
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
