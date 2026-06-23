function createCollectionView(kind, itemLabel, items, {
  loadedReason,
  emptyReason,
  counts = {},
  extra = {}
} = {}) {
  return {
    kind,
    recommendedReason: items.length > 0 ? loadedReason : emptyReason,
    counts,
    [itemLabel]: items,
    ...extra
  };
}

function createLoadedValueView(kind, valueLabel, value, {
  recommendedReason,
  counts = {},
  extra = {}
} = {}) {
  return {
    kind,
    recommendedReason,
    counts,
    [valueLabel]: value,
    ...extra
  };
}

function createResolvedItemView(kind, {
  requestLabel,
  requestValue,
  matchedLabel,
  matchedValue,
  valueLabel,
  value,
  loadedReason,
  missingReason,
  extra = {}
}) {
  return {
    kind,
    recommendedReason: value ? loadedReason : missingReason,
    [requestLabel]: requestValue ?? null,
    [matchedLabel]: matchedValue ?? null,
    [valueLabel]: value ?? null,
    ...extra
  };
}

export { createCollectionView, createLoadedValueView, createResolvedItemView };
