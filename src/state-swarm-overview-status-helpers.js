export function buildSwarmOverviewStatusFields(
  overview,
  {
    includeStatusAligned = false,
    includeReadyToComplete = false,
    includeDispatchableCount = false
  } = {}
) {
  const fields = {
    derivedStatus: overview.derivedStatus
  };

  if (includeStatusAligned) {
    fields.statusAligned = overview.statusAligned;
  }

  if (includeReadyToComplete) {
    fields.readyToComplete = overview.readyToComplete;
  }

  if (includeDispatchableCount) {
    fields.dispatchableCount = overview.dispatchableCount;
  }

  return fields;
}
