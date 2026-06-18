import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/index.js", "dist/index.js");
copyFileSync("src/mcp.js", "dist/mcp.js");
console.log("built");
