import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getRuntimeCatalogView } from "./catalog.js";
import { getRuntimeContractView } from "./runtime-contract.js";
import { stateFilePath } from "./state-runtime.js";

export function getRuntimeDoctorView(entryUrl = import.meta.url) {
  const selfPath = fileURLToPath(entryUrl);
  const exists = statSync(selfPath).isFile();

  return {
    kind: "runtime_doctor_view",
    recommendedReason: exists ? "doctor_ready" : "doctor_entry_missing",
    status: "ok",
    executable: exists,
    entry: selfPath,
    stateFile: stateFilePath(),
    catalog: getRuntimeCatalogView(),
    contract: getRuntimeContractView()
  };
}
