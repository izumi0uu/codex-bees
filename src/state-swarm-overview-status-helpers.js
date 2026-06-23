export function buildSwarmOverviewStatusFields(
  overview,
  {
    includeStatusAligned = false,
    includeReadyToComplete = false,
    includeDispatchableCount = false,
    fallbackDerivedStatus = null,
    fallbackStatusAligned = true,
    fallbackReadyToComplete = false,
    fallbackDispatchableCount = 0
  } = {}
) {
  const fields = {
    derivedStatus: overview?.derivedStatus ?? fallbackDerivedStatus
  };

  if (includeStatusAligned) {
    fields.statusAligned = overview?.statusAligned ?? fallbackStatusAligned;
  }

  if (includeReadyToComplete) {
    fields.readyToComplete = overview?.readyToComplete ?? fallbackReadyToComplete;
  }

  if (includeDispatchableCount) {
    fields.dispatchableCount = overview?.dispatchableCount ?? fallbackDispatchableCount;
  }

  return fields;
}
