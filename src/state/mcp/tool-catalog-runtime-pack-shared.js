export const WORKER_IDS_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: {
    oneOf: [
      { type: "string" },
      {
        type: "array",
        items: { type: "string" }
      }
    ]
  }
};
