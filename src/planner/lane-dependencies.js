export function usesCoordinationDocumentationSidecar(plannerProfile, strategy) {
  return (
    plannerProfile?.planningHints?.documentationMode === "discovery-sidecar" &&
    strategy.taskClass === "coordination-kernel" &&
    strategy.needsDiscovery &&
    strategy.needsDocumentation
  );
}

export function buildPlannerDependencies(lanes, plannerProfile, strategy) {
  const discoveryLaneId = lanes.find((lane) => lane.purpose === "discovery")?.lane ?? null;
  const implementationLaneId = lanes.find((lane) => lane.purpose === "implementation")?.lane ?? null;
  const documentationLaneId = lanes.find((lane) => lane.purpose === "documentation")?.lane ?? null;
  const coordinationDocumentationSidecar = usesCoordinationDocumentationSidecar(plannerProfile, strategy);

  return lanes.map((lane) => {
    if (lane.purpose === "implementation" && discoveryLaneId) {
      return {
        ...lane,
        dependsOn: [discoveryLaneId]
      };
    }

    if (lane.purpose === "documentation") {
      if (coordinationDocumentationSidecar && discoveryLaneId) {
        return {
          ...lane,
          dependsOn: [discoveryLaneId]
        };
      }

      if (implementationLaneId) {
        return {
          ...lane,
          dependsOn: [implementationLaneId]
        };
      }
    }

    if (lane.purpose === "verification") {
      const dependsOn = [];
      if (implementationLaneId) {
        dependsOn.push(implementationLaneId);
      }
      if (coordinationDocumentationSidecar && documentationLaneId) {
        dependsOn.push(documentationLaneId);
      }
      if (dependsOn.length > 0) {
        return {
          ...lane,
          dependsOn
        };
      }
    }

    return lane;
  });
}
