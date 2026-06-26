const PROTECTED_BRANCHES = new Set(["refs/heads/main", "refs/heads/master"]);

export function parsePrePushRefs(stdinText) {
  return String(stdinText ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [localRef, localSha, remoteRef, remoteSha] = line.split(/\s+/);
      return { localRef, localSha, remoteRef, remoteSha };
    });
}

export function planPrePush({ currentBranch, refs }) {
  if (isProtectedLocalBranch(currentBranch)) {
    return {
      ok: false,
      kind: "blocked-branch",
      commands: [],
      reason: `direct pushes from protected branch '${currentBranch}' are blocked; use a feature branch`
    };
  }

  const pushesToProtectedBranch = refs.some((ref) => PROTECTED_BRANCHES.has(ref.remoteRef));
  if (pushesToProtectedBranch) {
    return {
      ok: true,
      kind: "protected-target",
      commands: ["npm run check", "npm run build", "npm run smoke"],
      reason: "push targets a protected branch; run the full verification gate"
    };
  }

  return {
    ok: true,
    kind: "standard",
    commands: ["npm run check"],
    reason: "non-protected push; run the standard verification gate"
  };
}

function isProtectedLocalBranch(branchName) {
  return branchName === "main" || branchName === "master";
}
