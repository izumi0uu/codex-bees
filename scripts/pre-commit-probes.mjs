import assert from "node:assert/strict";

import { planPreCommit } from "./pre-commit-rules.mjs";

assert.deepEqual(
  planPreCommit({
    currentBranch: "main",
    stagedPaths: ["README.md"]
  }),
  {
    ok: false,
    kind: "blocked-branch",
    commands: [],
    reason: "direct commits on protected branch 'main' are blocked; create a feature branch"
  }
);

assert.deepEqual(
  planPreCommit({
    currentBranch: "codex/docs",
    stagedPaths: []
  }),
  {
    ok: true,
    kind: "empty",
    commands: [],
    reason: "no staged files"
  }
);

assert.deepEqual(
  planPreCommit({
    currentBranch: "codex/docs",
    stagedPaths: ["README.md", "docs/runtime.md"]
  }),
  {
    ok: true,
    kind: "docs-only",
    commands: [],
    reason: "docs-only staged changes"
  }
);

assert.deepEqual(
  planPreCommit({
    currentBranch: "codex/hooks",
    stagedPaths: ["scripts/build.mjs"]
  }),
  {
    ok: true,
    kind: "check-only",
    commands: ["npm run check"],
    reason: "code or hook metadata changed"
  }
);

assert.deepEqual(
  planPreCommit({
    currentBranch: "codex/runtime",
    stagedPaths: ["src/index.js"]
  }),
  {
    ok: true,
    kind: "runtime",
    commands: ["npm run check", "npm run smoke"],
    reason: "runtime-sensitive staged changes"
  }
);

assert.deepEqual(
  planPreCommit({
    currentBranch: "codex/runtime",
    stagedPaths: ["README.md", "src/index.js"]
  }),
  {
    ok: true,
    kind: "runtime",
    commands: ["npm run check", "npm run smoke"],
    reason: "runtime-sensitive staged changes"
  }
);

assert.deepEqual(
  planPreCommit({
    currentBranch: "codex/misc",
    stagedPaths: ["notes.txt"]
  }),
  {
    ok: true,
    kind: "check-only",
    commands: ["npm run check"],
    reason: "unclassified staged changes; fall back to repo checks"
  }
);

console.log("pre-commit probes: ok");
