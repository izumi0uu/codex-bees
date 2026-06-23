import { PRODUCT_NAME } from "./metadata.js";

export function formatCommandUsage(command, suffix = "") {
  return `${PRODUCT_NAME} ${command}${suffix ? ` ${suffix}` : ""}`;
}
