import { createResolvedItemView } from "../state/core/view-helpers.js";
import { parseCatalogDocument } from "./document-parse.js";
import { readText, resolveRuntimeCatalogPath } from "./paths.js";

function resolveCatalogEntryFilePath(entryType, id) {
  if (entryType === "agent") {
    return resolveRuntimeCatalogPath(`agents/${id}.md`);
  }

  return (
    resolveRuntimeCatalogPath(`skills/${id}/SKILL.md`) ??
    resolveRuntimeCatalogPath(`skills/${id}.md`)
  );
}

export function createCatalogDocumentView(entryType, id, entry) {
  let document = null;
  if (entry) {
    const resolvedPath = resolveCatalogEntryFilePath(entryType, entry.id);
    const parsed = parseCatalogDocument(readText(resolvedPath ?? ""));
    document = {
      entry,
      title: parsed.title,
      summary: parsed.summary,
      frontmatter: parsed.frontmatter,
      counts: parsed.counts,
      sections: parsed.sections
    };
  }

  return createResolvedItemView("runtime_catalog_document_view", {
    requestLabel: "id",
    requestValue: id,
    matchedLabel: "matchedId",
    matchedValue: entry?.id,
    valueLabel: "document",
    value: document,
    loadedReason: "catalog_document_loaded",
    missingReason: "catalog_document_missing",
    extra: {
      entryType
    }
  });
}

export function createCatalogEntryView(entryType, id, entry) {
  return createResolvedItemView("runtime_catalog_entry_view", {
    requestLabel: "id",
    requestValue: id,
    matchedLabel: "matchedId",
    matchedValue: entry?.id,
    valueLabel: "entry",
    value: entry,
    loadedReason: "catalog_entry_loaded",
    missingReason: "catalog_entry_missing",
    extra: {
      entryType
    }
  });
}
