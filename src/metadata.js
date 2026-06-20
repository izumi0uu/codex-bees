import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PACKAGE_MANIFEST_LOCATIONS = [
  new URL("../package.json", import.meta.url),
  new URL("./package-metadata.json", import.meta.url)
];

function loadPackageManifest() {
  for (const location of PACKAGE_MANIFEST_LOCATIONS) {
    const path = fileURLToPath(location);
    if (!existsSync(path)) {
      continue;
    }
    return JSON.parse(readFileSync(path, "utf8"));
  }

  throw new Error("codex-bees package metadata is unavailable");
}

const packageManifest = loadPackageManifest();

export const PRODUCT_NAME = packageManifest.name;
export const PACKAGE_VERSION = packageManifest.version;

export function getPackageMetadata() {
  return {
    product: PRODUCT_NAME,
    version: PACKAGE_VERSION,
    description: packageManifest.description,
    license: packageManifest.license,
    homepage: packageManifest.homepage ?? null,
    bugsUrl: packageManifest.bugs?.url ?? null,
    repositoryUrl: packageManifest.repository?.url ?? null,
    keywords: Array.isArray(packageManifest.keywords) ? [...packageManifest.keywords] : [],
    mode: "codex-only"
  };
}

export function getPackageMetadataView() {
  return {
    kind: "package_metadata_view",
    recommendedReason: "package_metadata_loaded",
    metadata: getPackageMetadata()
  };
}
