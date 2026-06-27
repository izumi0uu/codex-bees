export function buildDiscoveryLane(task, discoveryScope) {
  return {
    purpose: "discovery",
    owner: "explore",
    verifier: "reviewer",
    summary: `Map scope and verification for: ${task}`,
    scope: discoveryScope,
    acceptance: [
      "scope paths exist in the repository",
      "the plan maps the task brief to concrete files",
      "follow-up implementation can claim files without overlap"
    ],
    verification: ["inspect scope paths", "confirm role files exist"]
  };
}

export function buildExecutionLane(task, implementationScope) {
  return {
    purpose: "implementation",
    owner: "executor",
    verifier: "tester",
    summary: `Implement the bounded repo change for: ${task}`,
    scope: implementationScope,
    acceptance: [
      "the targeted files can be updated without crossing unrelated surfaces",
      "the change remains bounded to the selected scope",
      "the resulting behavior is verifiable from CLI, MCP, or file output"
    ],
    verification: ["targeted command check", "smoke check when applicable"]
  };
}

export function buildVerificationLane(task, verificationScope, dependsOn = []) {
  return {
    purpose: "verification",
    owner: "tester",
    verifier: "reviewer",
    summary: `Verify the bounded contract for: ${task}`,
    scope: verificationScope,
    ...(dependsOn.length > 0 ? { dependsOn } : {}),
    acceptance: [
      "the planned scope has fresh verification evidence",
      "the bounded change is exercised from shipped command or script surfaces",
      "follow-up reviewers can inspect one verification-focused lane without reopening implementation ownership"
    ],
    verification: ["run targeted command checks", "run build or smoke verification when applicable"]
  };
}

export function buildDocumentationLane(task, documentationScope, dependsOn = []) {
  return {
    purpose: "documentation",
    owner: "reviewer",
    verifier: "tester",
    summary: `Document the operator-facing contract for: ${task}`,
    scope: documentationScope,
    ...(dependsOn.length > 0 ? { dependsOn } : {}),
    acceptance: [
      "public-facing docs or examples match the bounded change",
      "the documented scope stays limited to shipped product surfaces",
      "operators can discover the change without tracker-only residue"
    ],
    verification: ["inspect README or shipped examples", "run documentation-linked example when applicable"]
  };
}

export function assignLaneIds(lanes) {
  return lanes.map((lane, index) => ({
    ...lane,
    lane: `lane-${index + 1}`
  }));
}
