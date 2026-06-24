import { createCollectionView, createResolvedItemView } from "./state-view-helpers.js";
import { getCapabilityCatalog, getCapabilityCatalogEntry } from "./runtime-capability-catalog.js";
import { countBy } from "./runtime-status-helpers.js";

export function getCapabilityCatalogEntryView(id) {
  const capability = getCapabilityCatalogEntry(id);
  return createResolvedItemView("runtime_capability_view", {
    requestLabel: "id",
    requestValue: id,
    matchedLabel: "matchedCapability",
    matchedValue: capability?.id,
    valueLabel: "capability",
    value: capability,
    loadedReason: "runtime_capability_loaded",
    missingReason: "runtime_capability_missing"
  });
}

export function getCapabilityCatalogView() {
  const capabilities = getCapabilityCatalog();
  const categoryCounts = countBy(capabilities, (capability) => capability.category);
  return createCollectionView("runtime_capabilities_view", "capabilities", capabilities, {
    loadedReason: "capabilities_loaded",
    emptyReason: "capabilities_empty",
    counts: {
      totalCapabilities: capabilities.length,
      categories: categoryCounts
    }
  });
}
