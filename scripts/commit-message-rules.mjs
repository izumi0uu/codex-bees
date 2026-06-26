const ALLOWED_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert"
];

const HEADER_FORMAT = "type(scope): subject";
const HEADER_MAX_LENGTH = 88;
const SCOPE_PATTERN = "[a-z0-9][a-z0-9._/-]*";
const REQUIRED_TRAILERS = ["Constraint", "Confidence", "Scope-risk", "Tested"];
const OPTIONAL_TRAILERS = ["Rejected", "Directive", "Not-tested"];
const ALL_TRAILERS = [...REQUIRED_TRAILERS, ...OPTIONAL_TRAILERS];
const HEADER_PATTERN = new RegExp(
  `^(?<type>${ALLOWED_TYPES.join("|")})\\((?<scope>${SCOPE_PATTERN})\\)(?<breaking>!)?: (?<subject>.+)$`
);
const AUTO_PASS_PATTERNS = [/^Merge\b/, /^Revert\b/, /^(fixup|squash)! /];

export {
  ALLOWED_TYPES,
  HEADER_FORMAT,
  HEADER_MAX_LENGTH,
  REQUIRED_TRAILERS,
  OPTIONAL_TRAILERS
};

export function validateCommitMessage(message) {
  const normalizedMessage = String(message ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n")
    .trimEnd();
  const lines = normalizedMessage.split("\n");
  const header = lines[0] ?? "";
  const errors = [];

  if (!header) {
    errors.push(`missing commit title; expected ${HEADER_FORMAT}`);
    return result(false, header, errors);
  }

  if (AUTO_PASS_PATTERNS.some((pattern) => pattern.test(header))) {
    return result(true, header, []);
  }

  if (header.length > HEADER_MAX_LENGTH) {
    errors.push(`title is too long (${header.length}/${HEADER_MAX_LENGTH})`);
  }

  const match = HEADER_PATTERN.exec(header);
  if (!match) {
    errors.push(`title must match ${HEADER_FORMAT}`);
  } else {
    const subject = match.groups?.subject ?? "";
    if (subject.endsWith(".")) {
      errors.push("subject must not end with a period");
    }
  }

  if (lines.length > 1 && lines[1] !== "") {
    errors.push("leave a blank line between the title and any body or trailers");
  }

  const trailers = parseTrailers(lines.slice(2));

  if (!trailers.found) {
    errors.push(`missing Lore trailers: ${REQUIRED_TRAILERS.join(", ")}`);
  } else {
    for (const trailer of REQUIRED_TRAILERS) {
      if (!trailers.map.has(trailer)) {
        errors.push(`missing trailer: ${trailer}`);
      }
    }

    const confidence = trailers.map.get("Confidence");
    if (confidence && !/^(low|medium|high)$/.test(confidence)) {
      errors.push("Confidence must be one of: low, medium, high");
    }

    const scopeRisk = trailers.map.get("Scope-risk");
    if (scopeRisk && !/^(narrow|moderate|broad)$/.test(scopeRisk)) {
      errors.push("Scope-risk must be one of: narrow, moderate, broad");
    }

    for (const key of trailers.map.keys()) {
      if (!ALL_TRAILERS.includes(key)) {
        errors.push(`unsupported trailer: ${key}`);
      }
    }
  }

  return result(errors.length === 0, header, errors);
}

export function formatCommitMessageErrors(errors) {
  return [
    "Invalid commit message.",
    ...errors.map((error) => `- ${error}`),
    "",
    `Expected: ${HEADER_FORMAT}`,
    `Allowed types: ${ALLOWED_TYPES.join(", ")}`,
    `Required Lore trailers: ${REQUIRED_TRAILERS.join(", ")}`,
    `Optional Lore trailers: ${OPTIONAL_TRAILERS.join(", ")}`,
    `Examples:`,
    "  feat(planner): add intent scoring",
    "  ",
    "  Constraint: keep planner changes local-first",
    "  Confidence: high",
    "  Scope-risk: narrow",
    "  Tested: npm run probe:commit-msg",
    "",
    "Allowed automatic messages: Merge..., Revert..., fixup! ..., squash! ..."
  ].join("\n");
}

function result(ok, header, errors) {
  return {
    ok,
    header,
    errors
  };
}

function parseTrailers(lines) {
  const relevantLines = [...lines].filter((line) => line.trim() !== "");

  if (relevantLines.length === 0) {
    return { found: false, map: new Map() };
  }

  const trailerLines = [];
  for (let index = relevantLines.length - 1; index >= 0; index -= 1) {
    const line = relevantLines[index];
    if (/^[A-Za-z][A-Za-z-]*: .+$/.test(line)) {
      trailerLines.unshift(line);
      continue;
    }

    break;
  }

  if (trailerLines.length === 0) {
    return { found: false, map: new Map() };
  }

  const map = new Map(
    trailerLines.map((line) => {
      const delimiterIndex = line.indexOf(": ");
      return [line.slice(0, delimiterIndex), line.slice(delimiterIndex + 2)];
    })
  );

  return { found: true, map };
}
