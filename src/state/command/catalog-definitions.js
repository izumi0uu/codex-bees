import { getCoordinationCommandCatalogDefinitions } from "./catalog-coordination-definitions.js";
import { getCoreCommandCatalogDefinitions } from "./catalog-core-definitions.js";
import { getRuntimeCommandCatalogDefinitions } from "./catalog-runtime-definitions.js";

export function getBaseCommandCatalogDefinitions({ getInitCommandCatalog, getMcpCommandCatalog }) {
  return [
    ...getCoreCommandCatalogDefinitions({ getInitCommandCatalog, getMcpCommandCatalog }),
    ...getRuntimeCommandCatalogDefinitions(),
    ...getCoordinationCommandCatalogDefinitions()
  ];
}
