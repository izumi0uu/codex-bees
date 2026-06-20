export const PRODUCT_NAME = "codex-bees";
export const PACKAGE_VERSION = "0.1.0";

export function getPackageMetadata() {
  return {
    product: PRODUCT_NAME,
    version: PACKAGE_VERSION,
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
