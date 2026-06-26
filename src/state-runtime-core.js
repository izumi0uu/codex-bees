import {
  normalizeMemory,
  normalizeSwarm,
  normalizeSwarmLane,
  normalizeTask,
  normalizeTaskAnnotation
} from "./state-normalize.js";
import {
  syncLoadedSwarmLifecycle,
  buildSyncedSwarmState
} from "./state/swarm/core.js";
import {
  findSwarmIndex,
  findTaskIndex
} from "./state-transition-guards.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import { createStatePersistence } from "./state/runtime/core/persistence.js";
import { createStateTransitions } from "./state/runtime/core/transitions.js";
import { createStateAuthoritativeFacade } from "./state-authoritative-facade.js";
import { createStatePublicApi } from "./state/public/entrypoints.js";

const {
  ensureStateFile,
  loadState,
  saveState
} = createStatePersistence();

const {
  syncSwarmInLoadedState,
  transitionTask,
  transitionSwarm
} = createStateTransitions({ loadState, saveState });

const authoritativeShared = {
  ensureStateFile,
  loadState,
  saveState,
  normalizeMemory,
  normalizeSwarm,
  normalizeSwarmLane,
  normalizeTask,
  normalizeTaskAnnotation,
  findSwarmIndex,
  findTaskIndex,
  syncLoadedSwarmLifecycle,
  buildSyncedSwarmState,
  syncSwarmInLoadedState,
  transitionTask,
  transitionSwarm
};

const stateAuthoritativeFacade = createStateAuthoritativeFacade(authoritativeShared);

const statePublicApi = createStatePublicApi({
  ...authoritativeShared,
  stateAuthoritativeFacade
});

export { ensureStateFile, loadState, saveState, runtimeRoleCatalog, stateAuthoritativeFacade, statePublicApi };
