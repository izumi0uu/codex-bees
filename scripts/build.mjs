import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/index.js", "dist/index.js");
copyFileSync("src/mcp.js", "dist/mcp.js");
copyFileSync("src/catalog.js", "dist/catalog.js");
copyFileSync("src/planner.js", "dist/planner.js");
copyFileSync("src/runtime-status.js", "dist/runtime-status.js");
copyFileSync("src/state.js", "dist/state.js");
copyFileSync("scripts/smoke.mjs", "dist/smoke.mjs");
console.log("built");
