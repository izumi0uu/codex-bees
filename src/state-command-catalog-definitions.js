import { getCoordinationCommandCatalogDefinitions } from "./state-command-catalog-coordination-definitions.js";
import { getCoreCommandCatalogDefinitions } from "./state-command-catalog-core-definitions.js";
import { getRuntimeCommandCatalogDefinitions } from "./state-command-catalog-runtime-definitions.js";

export function getBaseCommandCatalogDefinitions({ getInitCommandCatalog, getMcpCommandCatalog }) {
  return [
    ...getCoreCommandCatalogDefinitions({ getInitCommandCatalog, getMcpCommandCatalog }),
    ...getRuntimeCommandCatalogDefinitions(),
    ...getCoordinationCommandCatalogDefinitions()
  ];
}
