const DOC_PATH_PREFIXES = ["docs/"];
const CHECK_ONLY_PATH_PREFIXES = ["scripts/", ".githooks/"];
const RUNTIME_PATH_PREFIXES = ["src/", "dist/"];
const CHECK_ONLY_EXACT_PATHS = ["package.json", "tsconfig.types.json"];
const PROTECTED_BRANCHES = new Set(["main", "master"]);

export function planPreCommit({ currentBranch, stagedPaths }) {
  const paths = normalizePaths(stagedPaths);

  if (PROTECTED_BRANCHES.has(currentBranch)) {
    return {
      ok: false,
      kind: "blocked-branch",
      commands: [],
      reason: `direct commits on protected branch '${currentBranch}' are blocked; create a feature branch`
    };
  }

  if (paths.length === 0) {
    return {
      ok: true,
      kind: "empty",
      commands: [],
      reason: "no staged files"
    };
  }

  const hasRuntimePaths = paths.some(isRuntimePath);
  if (hasRuntimePaths) {
    return {
      ok: true,
      kind: "runtime",
      commands: ["npm run check", "npm run smoke"],
      reason: "runtime-sensitive staged changes"
    };
  }

  const hasCheckOnlyPaths = paths.some(isCheckOnlyPath);
  if (hasCheckOnlyPaths) {
    return {
      ok: true,
      kind: "check-only",
      commands: ["npm run check"],
      reason: "code or hook metadata changed"
    };
  }

  if (paths.every(isDocsOnlyPath)) {
    return {
      ok: true,
      kind: "docs-only",
      commands: [],
      reason: "docs-only staged changes"
    };
  }

  return {
    ok: true,
    kind: "check-only",
    commands: ["npm run check"],
    reason: "unclassified staged changes; fall back to repo checks"
  };
}

function normalizePaths(stagedPaths) {
  return [...new Set(stagedPaths.map((path) => String(path).trim()).filter(Boolean))];
}

function isDocsOnlyPath(path) {
  return path === "README.md" || path.endsWith(".md") || DOC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isCheckOnlyPath(path) {
  return (
    CHECK_ONLY_EXACT_PATHS.includes(path) ||
    CHECK_ONLY_PATH_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    path.endsWith(".d.ts") ||
    path === "AGENTS.md"
  );
}

function isRuntimePath(path) {
  return RUNTIME_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}
