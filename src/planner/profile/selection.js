import {
  COORDINATION_PLANNER_PROFILE_ID,
  COORDINATION_SIGNAL_TERMS
} from "./specs.js";
import { buildWeightedScore } from "../../state/core/priority-score.js";
import { derivePlannerStrategy, derivePlannerTaskClass } from "../lane/strategy.js";
import { choosePrimaryScope, inferPlannerIntent } from "../scope/index.js";

function uniqueStrings(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildPlannerSelectionContext(task) {
  const taskText = typeof task === "string" ? task : "";
  const taskLower = taskText.toLowerCase();
  const implementationScope = choosePrimaryScope(taskText);
  const intent = inferPlannerIntent(taskText, implementationScope);
  const strategy = derivePlannerStrategy(taskText, implementationScope, intent);
  const taskClass = derivePlannerTaskClass(intent);
  const strongCoordinationSignal = COORDINATION_SIGNAL_TERMS.some((term) => taskLower.includes(term));
  const touchesPublicStateBridge = implementationScope.some((path) =>
    ["src/state.js", "src/state-public.js", "src/api.js"].includes(path)
  );
  const intentTags = uniqueStrings([
    intent.docs ? "docs" : null,
    intent.docsOnly ? "docs-only" : null,
    intent.runtime ? "runtime" : null,
    intent.publicRuntime || strategy.publicSurface ? "public-runtime" : null,
    intent.internalRuntime ? "internal-runtime" : null,
    intent.coordination ? "coordination" : null,
    intent.build ? "build" : null,
    intent.catalog ? "catalog" : null,
    intent.verificationHeavy ? "verification-heavy" : null,
    touchesPublicStateBridge ? "public-state-bridge" : null,
    strategy.needsDiscovery ? "needs-discovery" : null,
    strategy.needsVerification ? "needs-verification" : null,
    strategy.needsDocumentation ? "needs-documentation" : null,
    strongCoordinationSignal ? "swarm-flow" : null,
    taskLower.includes("dispatch") || taskLower.includes("assignment") || taskLower.includes("handoff") || taskLower.includes("worker") || taskLower.includes("leader")
      ? "dispatch-flow"
      : null,
    taskLower.includes("review") || taskLower.includes("verifier") || taskLower.includes("verification") || taskLower.includes("transition")
      ? "review-flow"
      : null
  ]);

  return {
    task: taskText,
    taskLower,
    implementationScope,
    intent,
    strategy,
    taskClass,
    intentTags
  };
}

function buildPlannerProfileMatch(profile, selectionContext) {
  const { taskLower, taskClass, intent, intentTags, implementationScope } = selectionContext;
  const matchedKeywords = profile.selectionHints.keywords.filter((keyword) => taskLower.includes(keyword));
  const matchedTaskClasses = profile.selectionHints.taskClasses.filter((candidate) => candidate === taskClass);
  const matchedIntentTags = profile.selectionHints.intentTags.filter((tag) => intentTags.includes(tag));
  const excludedIntentTags = profile.selectionHints.excludeIntentTags.filter((tag) => intentTags.includes(tag));
  const matchedScopePrefixes = profile.selectionHints.scopePrefixes.filter((prefix) =>
    implementationScope.some((path) => path.startsWith(prefix))
  );
  const matchedCoordinationBias =
    profile.planningHints.coordinationBias &&
    COORDINATION_SIGNAL_TERMS.some((term) => taskLower.includes(term));
  const keywordCoverage =
    profile.selectionHints.keywords.length > 0
      ? matchedKeywords.length / profile.selectionHints.keywords.length
      : 0;
  const taskClassCoverage =
    profile.selectionHints.taskClasses.length > 0
      ? matchedTaskClasses.length / profile.selectionHints.taskClasses.length
      : 0;
  const intentTagCoverage =
    profile.selectionHints.intentTags.length > 0
      ? matchedIntentTags.length / profile.selectionHints.intentTags.length
      : 0;
  const scopePrefixCoverage =
    profile.selectionHints.scopePrefixes.length > 0
      ? matchedScopePrefixes.length / profile.selectionHints.scopePrefixes.length
      : 0;
  const selectionScore = buildWeightedScore([
    {
      key: "keyword_matches",
      label: "Keyword matches",
      value: matchedKeywords.length,
      weight: 10,
      active: matchedKeywords.length > 0,
      detail: matchedKeywords
    },
    {
      key: "keyword_coverage",
      label: "Keyword coverage",
      value: keywordCoverage,
      weight: 25,
      active: matchedKeywords.length > 0,
      detail: {
        matched: matchedKeywords.length,
        total: profile.selectionHints.keywords.length
      }
    },
    {
      key: "task_class_match",
      label: "Task class match",
      value: matchedTaskClasses.length,
      weight: 35,
      active: matchedTaskClasses.length > 0,
      detail: matchedTaskClasses
    },
    {
      key: "task_class_coverage",
      label: "Task class coverage",
      value: taskClassCoverage,
      weight: 15,
      active: matchedTaskClasses.length > 0,
      detail: {
        matched: matchedTaskClasses.length,
        total: profile.selectionHints.taskClasses.length
      }
    },
    {
      key: "intent_tag_matches",
      label: "Intent tag matches",
      value: matchedIntentTags.length,
      weight: 10,
      active: matchedIntentTags.length > 0,
      detail: matchedIntentTags
    },
    {
      key: "intent_tag_coverage",
      label: "Intent tag coverage",
      value: intentTagCoverage,
      weight: 20,
      active: matchedIntentTags.length > 0,
      detail: {
        matched: matchedIntentTags.length,
        total: profile.selectionHints.intentTags.length
      }
    },
    {
      key: "scope_prefix_matches",
      label: "Scope prefix matches",
      value: matchedScopePrefixes.length,
      weight: 6,
      active: matchedScopePrefixes.length > 0,
      detail: matchedScopePrefixes
    },
    {
      key: "scope_prefix_coverage",
      label: "Scope prefix coverage",
      value: scopePrefixCoverage,
      weight: 10,
      active: matchedScopePrefixes.length > 0,
      detail: {
        matched: matchedScopePrefixes.length,
        total: profile.selectionHints.scopePrefixes.length
      }
    },
    {
      key: "coordination_bias",
      label: "Coordination bias",
      value: 1,
      weight: 30,
      active: matchedCoordinationBias
    },
    {
      key: "profile_priority",
      label: "Profile priority",
      value: profile.selectionHints.priority,
      weight: 1,
      active: true
    }
  ]);
  return {
    profileId: profile.id,
    sourceKind: profile.sourceKind ?? "shipped",
    priority: profile.selectionHints.priority,
    matchedKeywords,
    matchedTaskClasses,
    matchedIntentTags,
    excludedIntentTags,
    matchedScopePrefixes,
    eligible: excludedIntentTags.length === 0,
    matchedCoordinationBias,
    matchCount:
      matchedKeywords.length +
      matchedTaskClasses.length +
      matchedIntentTags.length +
      matchedScopePrefixes.length +
      (matchedCoordinationBias ? 1 : 0),
    selectionScore: selectionScore.score,
    score: selectionScore.score,
    scoreBreakdown: selectionScore.scoreBreakdown,
    scoreEntries: selectionScore.scoreEntries,
    matchedSignalCount: selectionScore.matchedSignalCount
  };
}

function rankPlannerProfileMatches(task, context) {
  const selectionContext = buildPlannerSelectionContext(task);
  return Array.from(context.registry.values())
    .filter((profile) => profile.id !== context.defaultProfileId)
    .map((profile) => buildPlannerProfileMatch(profile, selectionContext))
    .filter((entry) => entry.eligible !== false && entry.matchCount > 0)
    .sort((left, right) => {
      const scoreDelta = right.selectionScore - left.selectionScore;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      const priorityDelta = right.priority - left.priority;
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      const matchDelta = right.matchCount - left.matchCount;
      if (matchDelta !== 0) {
        return matchDelta;
      }
      return left.profileId.localeCompare(right.profileId);
    });
}

function toPlannerSelectionPayload({
  inputProfile,
  requestedProfile,
  resolvedProfile,
  usedDefaultProfile,
  selectionMode,
  reason,
  context,
  heuristicMatches,
  selectionContext
}) {
  const resolvedProfileRecord = context.registry.get(resolvedProfile) ?? null;
  const resolvedMatch =
    heuristicMatches.find((entry) => entry.profileId === resolvedProfile) ??
    buildPlannerProfileMatch(
      resolvedProfileRecord ??
        context.registry.get(context.defaultProfileId) ?? {
          id: resolvedProfile,
          selectionHints: {
            keywords: [],
            taskClasses: [],
            intentTags: [],
            excludeIntentTags: [],
            scopePrefixes: [],
            priority: 0
          },
          planningHints: { coordinationBias: false }
        },
      selectionContext
    );

  return {
    inputProfile,
    requestedProfile,
    resolvedProfile,
    resolvedSourceKind: resolvedProfileRecord?.sourceKind ?? null,
    defaultProfile: context.defaultProfileId,
    availableProfiles: Array.from(context.registry.keys()),
    profileFiles: [...context.profileFiles],
    usedDefaultProfile,
    selectionMode,
    reason,
    selectionContext: {
      taskClass: selectionContext.taskClass,
      laneStrategy: selectionContext.strategy.laneStrategy,
      implementationScope: [...selectionContext.implementationScope],
      intentTags: [...selectionContext.intentTags]
    },
    matchedSignals: {
      keywords: [...resolvedMatch.matchedKeywords],
      taskClasses: [...resolvedMatch.matchedTaskClasses],
      intentTags: [...resolvedMatch.matchedIntentTags],
      scopePrefixes: [...resolvedMatch.matchedScopePrefixes],
      coordinationBias: resolvedMatch.matchedCoordinationBias
    },
    selectionScore: resolvedMatch.selectionScore ?? 0,
    selectionScoreBreakdown: resolvedMatch.scoreBreakdown ?? {},
    matchedSignalCount: resolvedMatch.matchedSignalCount ?? 0,
    selectionCandidates: heuristicMatches.map((entry, index) => ({
      rank: index + 1,
      profileId: entry.profileId,
      sourceKind: entry.sourceKind,
      selectionScore: entry.selectionScore,
      scoreBreakdown: entry.scoreBreakdown,
      matchedSignalCount: entry.matchedSignalCount,
      matchedKeywords: [...entry.matchedKeywords],
      matchedTaskClasses: [...entry.matchedTaskClasses],
      matchedIntentTags: [...entry.matchedIntentTags],
      matchedScopePrefixes: [...entry.matchedScopePrefixes],
      matchedCoordinationBias: entry.matchedCoordinationBias
    })),
    heuristicMatches
  };
}

export function selectPlannerProfile(task, profileId, context) {
  const trimmedProfileId =
    typeof profileId === "string" && profileId.trim().length > 0
      ? profileId.trim()
      : null;
  const selectionContext = buildPlannerSelectionContext(task);
  const heuristicMatches = rankPlannerProfileMatches(task, context);

  if (trimmedProfileId) {
    const resolvedProfile = context.registry.has(trimmedProfileId)
      ? trimmedProfileId
      : context.defaultProfileId;
    return toPlannerSelectionPayload({
      inputProfile: trimmedProfileId,
      requestedProfile: trimmedProfileId,
      resolvedProfile,
      usedDefaultProfile: resolvedProfile !== trimmedProfileId,
      selectionMode: resolvedProfile === trimmedProfileId ? "explicit" : "fallback",
      reason:
        resolvedProfile === trimmedProfileId
          ? "explicit_profile_requested"
          : "missing_profile_fallback",
      context,
      heuristicMatches,
      selectionContext
    });
  }

  const inferredProfile = heuristicMatches[0]?.profileId ?? context.defaultProfileId;

  return toPlannerSelectionPayload({
    inputProfile: null,
    requestedProfile: inferredProfile,
    resolvedProfile: inferredProfile,
    usedDefaultProfile: false,
    selectionMode: "heuristic",
      reason:
        inferredProfile === COORDINATION_PLANNER_PROFILE_ID
        ? "coordination_profile_inferred"
        : inferredProfile === context.defaultProfileId
          ? "default_profile_inferred"
          : "profile_hint_inferred",
      context,
      heuristicMatches,
      selectionContext
    });
}
