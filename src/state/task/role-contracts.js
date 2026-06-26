import { getAgentCatalogDocumentView, getRuntimeCatalog } from "../../catalog.js";

const ROLE_CONTRACT_CACHE = new Map();

function normalizeSectionTitle(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findDocumentSection(document, title) {
  const wanted = normalizeSectionTitle(title);
  return document?.sections?.find((section) => normalizeSectionTitle(section.title) === wanted) ?? null;
}

function extractSectionItemsByLabel(content) {
  const groups = new Map();
  let currentLabel = null;

  for (const rawLine of String(content ?? "").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const labelMatch = /^([^:]+):\s*$/.exec(line);
    if (labelMatch) {
      currentLabel = normalizeSectionTitle(labelMatch[1]);
      if (!groups.has(currentLabel)) {
        groups.set(currentLabel, []);
      }
      continue;
    }

    const itemMatch = /^\s*[-*]\s+(.+?)\s*$/.exec(rawLine);
    if (!itemMatch || !currentLabel) {
      continue;
    }

    const items = groups.get(currentLabel) ?? [];
    items.push(itemMatch[1].trim());
    groups.set(currentLabel, items);
  }

  return Object.fromEntries(groups.entries());
}

function compactItems(items, limit) {
  return (Array.isArray(items) ? items : []).filter(Boolean).slice(0, limit);
}

function summarizeRoleContract(roleId, catalog = getRuntimeCatalog()) {
  if (!roleId) {
    return null;
  }

  const cacheKey = `${catalog?.source ?? "missing"}:${catalog?.paths?.agentDir ?? ""}:${roleId}`;
  if (ROLE_CONTRACT_CACHE.has(cacheKey)) {
    return ROLE_CONTRACT_CACHE.get(cacheKey);
  }

  const agent = catalog?.agents?.find((item) => item.id === roleId) ?? null;
  const documentView = getAgentCatalogDocumentView(roleId);
  const document = documentView.document;
  const ownershipSection = findDocumentSection(document, "Ownership");
  const ownershipGroups = extractSectionItemsByLabel(ownershipSection?.content ?? "");
  const contract = document
    ? {
        title: document.title ?? agent?.name ?? roleId,
        summary: document.summary ?? agent?.description ?? null,
        boundaries: compactItems(
          ownershipGroups["you do not own"] ?? ownershipGroups["do not own"] ?? [],
          2
        ),
        workingRules: compactItems(findDocumentSection(document, "Working rules")?.items, 3),
        handoffExpectations: compactItems(findDocumentSection(document, "Handoff expectations")?.items, 2),
        verificationFocus: compactItems(findDocumentSection(document, "Verification posture")?.items, 2),
        stopAndEscalate: compactItems(findDocumentSection(document, "Stop and escalate")?.items, 2)
      }
    : null;

  ROLE_CONTRACT_CACHE.set(cacheKey, contract);
  return contract;
}

export function describeRole(roleId, catalog = getRuntimeCatalog()) {
  if (!roleId) {
    return {
      id: null,
      exists: false,
      name: null,
      description: null,
      promptPath: null,
      source: "missing"
    };
  }

  const agent = catalog.agents.find((item) => item.id === roleId) ?? null;
  return {
    id: roleId,
    exists: Boolean(agent),
    name: agent?.name ?? roleId,
    description: agent?.description ?? null,
    promptPath: agent?.path ?? null,
    source: agent?.source ?? catalog.source ?? "missing"
  };
}

export function describeRoleWithContract(roleId, catalog = getRuntimeCatalog()) {
  const role = describeRole(roleId, catalog);
  return {
    ...role,
    contract: role.exists ? summarizeRoleContract(roleId, catalog) : null
  };
}
