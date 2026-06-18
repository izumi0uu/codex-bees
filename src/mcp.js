const tools = [
  {
    name: "memory_search",
    description: "Search stored patterns by query."
  },
  {
    name: "memory_store",
    description: "Store a reusable pattern or handoff."
  },
  {
    name: "task_enqueue",
    description: "Queue a bounded task for a worker role."
  }
];

if (process.argv.includes("--tools")) {
  console.log(JSON.stringify({ tools }, null, 2));
} else {
  console.log("codex-bees mcp stub");
}
