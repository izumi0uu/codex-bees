import { createError } from "./state-mcp-runtime-response.js";

const MCP_INVALID_PARAMS_CODE = -32602;

function createMessageError(id, message) {
  return createError(id, MCP_INVALID_PARAMS_CODE, message);
}

function requireArgument(id, toolName, args, argumentName) {
  if (args?.[argumentName]) {
    return null;
  }

  return createMessageError(id, `${toolName} requires arguments.${argumentName}`);
}

function requireArguments(id, toolName, args, argumentNames) {
  for (const argumentName of argumentNames) {
    const error = requireArgument(id, toolName, args, argumentName);
    if (error) {
      return error;
    }
  }

  return null;
}

function requireRoleAndWorker(id, toolName, args) {
  return requireArguments(id, toolName, args, ["role", "workerId"]);
}

function createUnknownEntityError(id, entityName, entityId, options = {}) {
  const prefix = options.archived === true ? "archived " : "";
  return createMessageError(id, `Unknown ${prefix}${entityName} id: ${entityId}`);
}

function createMcpResultError(id, result) {
  return createMessageError(id, result.error);
}

export {
  createMcpResultError,
  createMessageError,
  createUnknownEntityError,
  requireArgument,
  requireArguments,
  requireRoleAndWorker
};
