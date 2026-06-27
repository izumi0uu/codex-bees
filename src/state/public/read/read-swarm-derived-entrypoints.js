import {
  buildArchivedSwarmDetailViewFromSources,
  buildArchivedSwarmListViewFromSources
} from "../../archive/views.js";
import { listSwarmOverviewsFromSources } from "../../swarm/core.js";
import {
  getSwarmViewFromSources,
  swarmBlockersFromSources,
  swarmBriefFromSources,
  swarmBundleFromSources,
  swarmCloseoutFromSources,
  swarmDispatchBundleFromSources
} from "../../swarm/derived-surfaces.js";
import { buildSwarmListViewFromSources } from "../../swarm/views.js";

export function createStateReadSwarmDerivedEntryPoints(access, validation, task) {
  const {
    listSwarms,
    getSwarm,
    listArchivedSwarms,
    getArchivedSwarm,
    getArchivedTask,
    listArchivedTasks
  } = access;
  const { swarmOverview } = validation;
  const { taskBrief, taskReport } = task;

  function listSwarmOverviews(filters = {}) {
    return listSwarmOverviewsFromSources(filters, listSwarmOverviewsSources);
  }

  function listSwarmsView(filters = {}, options = {}) {
    return buildSwarmListViewFromSources(filters, options, listSwarmsViewSources);
  }

  function listArchivedSwarmsView() {
    return buildArchivedSwarmListViewFromSources(listArchivedSwarmsViewSources);
  }

  function getArchivedSwarmView(id) {
    return buildArchivedSwarmDetailViewFromSources(id, getArchivedSwarmViewSources);
  }

  function getSwarmView(id) {
    return getSwarmViewFromSources(id, getSwarmViewSources);
  }

  function swarmBrief(id) {
    return swarmBriefFromSources(id, swarmBriefSources);
  }

  function swarmBundle(id) {
    return swarmBundleFromSources(id, swarmBundleSources);
  }

  function swarmCloseout(id) {
    return swarmCloseoutFromSources(id, swarmCloseoutSources);
  }

  function swarmBlockers(id) {
    return swarmBlockersFromSources(id, swarmBlockersSources);
  }

  function swarmDispatchBundle(id) {
    return swarmDispatchBundleFromSources(id, swarmDispatchBundleSources);
  }

  const listSwarmOverviewsSources = {
    listSwarms,
    swarmOverview
  };
  const listSwarmsViewSources = {
    listSwarms,
    listSwarmOverviews
  };
  const listArchivedSwarmsViewSources = {
    listArchivedSwarms
  };
  const getArchivedSwarmViewSources = {
    getArchivedSwarm,
    getArchivedTask,
    listArchivedTasks
  };
  const getSwarmViewSources = {
    getSwarm,
    swarmOverview
  };
  const swarmBriefSources = {
    swarmOverview
  };
  const swarmBundleSources = {
    swarmOverview,
    swarmBrief,
    taskReport
  };
  const swarmCloseoutSources = {
    swarmOverview,
    swarmBrief,
    swarmBundle
  };
  const swarmBlockersSources = {
    swarmOverview,
    swarmBrief,
    taskReport
  };
  const swarmDispatchBundleSources = {
    swarmOverview,
    swarmBrief,
    taskBrief
  };

  return {
    listSwarmOverviews,
    listSwarmsView,
    listArchivedSwarmsView,
    getArchivedSwarmView,
    getSwarmView,
    swarmBrief,
    swarmBundle,
    swarmCloseout,
    swarmBlockers,
    swarmDispatchBundle
  };
}
