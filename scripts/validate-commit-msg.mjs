#!/usr/bin/env node
import { readFileSync } from "node:fs";

import {
  formatCommitMessageErrors,
  validateCommitMessage
} from "./commit-message-rules.mjs";

const commitMessagePath = process.argv[2];

if (!commitMessagePath) {
  console.error("Usage: node ./scripts/validate-commit-msg.mjs <commit-message-file>");
  process.exit(1);
}

const commitMessage = readFileSync(commitMessagePath, "utf8");
const validation = validateCommitMessage(commitMessage);

if (!validation.ok) {
  console.error(formatCommitMessageErrors(validation.errors));
  process.exit(1);
}
