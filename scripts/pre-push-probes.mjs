import assert from "node:assert/strict";

import { parsePrePushRefs, planPrePush } from "./pre-push-rules.mjs";

const refs = parsePrePushRefs(
  [
    "refs/heads/codex/readme abc123 refs/heads/codex/readme def456",
    "refs/heads/codex/readme abc123 refs/heads/main def456"
  ].join("\n")
);

assert.deepEqual(refs, [
  {
    localRef: "refs/heads/codex/readme",
    localSha: "abc123",
    remoteRef: "refs/heads/codex/readme",
    remoteSha: "def456"
  },
  {
    localRef: "refs/heads/codex/readme",
    localSha: "abc123",
    remoteRef: "refs/heads/main",
    remoteSha: "def456"
  }
]);

assert.deepEqual(
  planPrePush({
    currentBranch: "main",
    refs: []
  }),
  {
    ok: false,
    kind: "blocked-branch",
    commands: [],
    reason: "direct pushes from protected branch 'main' are blocked; use a feature branch"
  }
);

assert.deepEqual(
  planPrePush({
    currentBranch: "codex/readme",
    refs
  }),
  {
    ok: true,
    kind: "protected-target",
    commands: ["npm run check", "npm run build", "npm run smoke"],
    reason: "push targets a protected branch; run the full verification gate"
  }
);

assert.deepEqual(
  planPrePush({
    currentBranch: "codex/hooks",
    refs: [
      {
        localRef: "refs/heads/codex/hooks",
        localSha: "abc123",
        remoteRef: "refs/heads/codex/hooks",
        remoteSha: "0000000"
      }
    ]
  }),
  {
    ok: true,
    kind: "standard",
    commands: ["npm run check"],
    reason: "non-protected push; run the standard verification gate"
  }
);

console.log("pre-push probes: ok");
