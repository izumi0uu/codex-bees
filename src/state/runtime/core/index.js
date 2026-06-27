import {
  normalizeMemory,
  normalizeSwarm,
  normalizeSwarmLane,
  normalizeTask,
  normalizeTaskAnnotation
} from "../../core/normalize.js";
import {
  syncLoadedSwarmLifecycle,
  buildSyncedSwarmState
} from "../../swarm/core.js";
import {
  findSwarmIndex,
  findTaskIndex
} from "../../core/transition-guards.js";
import { runtimeRoleCatalog } from "../../role/catalog.js";
import { createStatePersistence } from "./persistence.js";
import { createStateTransitions } from "./transitions.js";
import { createStateAuthoritativeFacade } from "../../public/authoritative-facade.js";
import { createStatePublicApi } from "../../public/entrypoints.js";

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
