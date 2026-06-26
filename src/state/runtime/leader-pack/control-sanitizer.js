export function stripRoleContractsDeep(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => stripRoleContractsDeep(entry));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const result = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, stripRoleContractsDeep(entry)])
  );

  if (
    'contract' in result &&
    'id' in result &&
    'promptPath' in result &&
    'source' in result
  ) {
    delete result.contract;
  }

  return result;
}
