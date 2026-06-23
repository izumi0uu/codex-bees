import { readOption } from "./state-cli-helpers.js";

export function readPlannerProfileOption() {
  return readOption("--profile");
}

export function readPlannerProfileFileOption() {
  return readOption("--profile-file");
}

export function readPlannerOptions() {
  return {
    profileId: readPlannerProfileOption(),
    profileFile: readPlannerProfileFileOption()
  };
}
