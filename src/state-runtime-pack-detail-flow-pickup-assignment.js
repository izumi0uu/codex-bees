import {
  buildRuntimePackPickupOverview,
  buildRuntimePackPresenceMetadata,
  buildRuntimePackSessionOverview
} from "./state-runtime-pack-detail-core.js";

export function buildRuntimePackPickupFlowEntries(session, next, pickup) {
  return {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    brief: pickup?.brief ?? next?.brief ?? null,
    pickup
  };
}

export function buildRuntimePackPickupFlowMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: nextEntries.focus,
    hasCandidate: nextEntries.candidate,
    hasBrief: nextEntries.brief,
    hasPickup: nextEntries.pickup
  });
}

export function buildRuntimePackPickupPackOverview(session, pickup, rolePack) {
  return {
    ...buildRuntimePackSessionOverview(session),
    pickup: buildRuntimePackPickupOverview(pickup),
    role: rolePack?.overview?.role ?? null
  };
}

export function buildRuntimePackPickupSurfaces(session, next, pickup, rolePack) {
  return {
    session,
    next,
    pickup,
    rolePack
  };
}

export function buildRuntimePackAssignmentFlowEntries(assignment, pickup, next, session) {
  return {
    assignment,
    pickup,
    candidate: next?.candidate ?? null,
    focus: session?.focus ?? null
  };
}

export function buildRuntimePackAssignmentFlowMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasAssignment: nextEntries.assignment,
    hasPickup: nextEntries.pickup,
    hasCandidate: nextEntries.candidate,
    hasFocus: nextEntries.focus
  });
}

export function buildRuntimePackAssignmentOverview(roleAssignments, assignments, pickup, roleEntry, session) {
  return {
    assignments: {
      count: roleAssignments?.count ?? 0,
      ownerGroups: assignments?.counts?.ownerGroups ?? 0
    },
    pickup: buildRuntimePackPickupOverview(pickup),
    role: roleEntry?.counts ?? null,
    session: session?.counts ?? null
  };
}

export function buildRuntimePackAssignmentSurfaces(roleAssignments, session, next, pickup, roleEntry, assignments) {
  return {
    roleAssignments,
    session,
    next,
    pickup,
    role: roleEntry,
    assignments: {
      counts: assignments?.counts ?? null,
      next: assignments?.next ?? null
    }
  };
}
