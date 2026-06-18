import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/index.js", "dist/index.js");
copyFileSync("src/mcp.js", "dist/mcp.js");
copyFileSync("scripts/smoke.mjs", "dist/smoke.mjs");
console.log("built");
