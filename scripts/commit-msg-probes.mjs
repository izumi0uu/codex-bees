import assert from "node:assert/strict";

import { validateCommitMessage } from "./commit-message-rules.mjs";

const validMessages = [
  [
    "feat(planner): add runtime intent scoring",
    "",
    "Constraint: keep planner behavior explainable",
    "Confidence: high",
    "Scope-risk: narrow",
    "Tested: npm run probe:commit-msg"
  ].join("\n"),
  [
    "fix(dispatch)!: prevent duplicate claims",
    "",
    "Constraint: preserve existing queue semantics",
    "Rejected: silent dedupe in storage layer | it hides the dispatch invariant",
    "Confidence: medium",
    "Scope-risk: moderate",
    "Directive: keep dispatch idempotence explicit at the claim boundary",
    "Tested: npm run check",
    "Not-tested: no live multi-process race harness"
  ].join("\n"),
  [
    "docs(readme): tighten product overview",
    "",
    "Constraint: keep the README product-facing",
    "Confidence: high",
    "Scope-risk: narrow",
    "Tested: reviewed final markdown render locally"
  ].join("\n"),
  "Merge branch 'main' of github.com:izumi0uu/codex-bees",
  "fixup! feat(planner): add runtime intent scoring"
];

const invalidMessages = [
  {
    message: "feat: missing scope",
    error: "title must match type(scope): subject"
  },
  {
    message: "feature(planner): unsupported type",
    error: "title must match type(scope): subject"
  },
  {
    message: "feat(Planner): uppercase scope",
    error: "title must match type(scope): subject"
  },
  {
    message: [
      "feat(planner): ends with a period.",
      "",
      "Constraint: keep planner behavior explainable",
      "Confidence: high",
      "Scope-risk: narrow",
      "Tested: npm run probe:commit-msg"
    ].join("\n"),
    error: "subject must not end with a period"
  },
  {
    message: [
      "feat(planner): body starts too early",
      "Constraint: keep planner behavior explainable",
      "Confidence: high",
      "Scope-risk: narrow",
      "Tested: npm run probe:commit-msg"
    ].join("\n"),
    error: "leave a blank line between the title and any body or trailers"
  },
  {
    message: [
      "feat(planner): missing lore trailers",
      "",
      "Constraint: keep planner behavior explainable"
    ].join("\n"),
    error: "missing trailer: Confidence"
  },
  {
    message: [
      "feat(planner): invalid lore enums",
      "",
      "Constraint: keep planner behavior explainable",
      "Confidence: certain",
      "Scope-risk: tiny",
      "Tested: npm run probe:commit-msg"
    ].join("\n"),
    error: "Confidence must be one of: low, medium, high"
  }
];

for (const message of validMessages) {
  const validation = validateCommitMessage(message);
  assert.equal(validation.ok, true, `expected valid message: ${message}`);
}

for (const { message, error } of invalidMessages) {
  const validation = validateCommitMessage(message);
  assert.equal(validation.ok, false, `expected invalid message: ${message}`);
  assert.match(validation.errors.join("\n"), new RegExp(escapeForRegExp(error)));
}

const longHeaderValidation = validateCommitMessage(
  "feat(runtime-intelligence): add a very long summary that intentionally crosses the configured title limit for validation coverage"
);
assert.equal(longHeaderValidation.ok, false);
assert.match(longHeaderValidation.errors.join("\n"), /title is too long/);

console.log("commit message probes: ok");

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
