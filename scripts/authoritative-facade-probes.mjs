import assert from "node:assert/strict";
import { stateAuthoritativeFacade, statePublicApi } from "../src/state-runtime-core.js";
import * as lifecycle from "../src/state/runtime/public-api/lifecycle.js";
import * as mutations from "../src/state/runtime/public-api/mutations.js";

function sortedKeys(value) {
  return Object.keys(value).sort();
}

function assertMatchingKeys(label, actual, expected) {
  const actualKeys = sortedKeys(actual);
  const expectedKeys = sortedKeys(expected);
  assert.deepEqual(actualKeys, expectedKeys, `${label} keys should match`);
}

function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}

function runProbe(label, probe) {
  probe();
  console.log(`[authoritative-facade-probes] ${label}: ok`);
}

runProbe("mutation-and-lifecycle-surface-partition", () => {
  const authoritativeKeys = sortedKeys(stateAuthoritativeFacade);
  const mutationKeys = sortedKeys(mutations);
  const lifecycleKeys = sortedKeys(lifecycle);
  const combinedKeys = [...mutationKeys, ...lifecycleKeys].sort();

  assert.equal(new Set(combinedKeys).size, combinedKeys.length, "public mutation/lifecycle keys should not overlap");
  assert.deepEqual(combinedKeys, authoritativeKeys, "authoritative facade should equal mutation+lifecycle public surface");
});

runProbe("mutation-surface-parity", () => {
  assertMatchingKeys(
    "mutation surface",
    mutations,
    pick(stateAuthoritativeFacade, Object.keys(mutations))
  );

  for (const key of Object.keys(mutations)) {
    assert.equal(
      mutations[key],
      stateAuthoritativeFacade[key],
      `mutation export ${key} should be sourced from the authoritative facade`
    );
    assert.equal(
      statePublicApi[key],
      stateAuthoritativeFacade[key],
      `public api ${key} should preserve authoritative facade identity`
    );
  }
});

runProbe("lifecycle-surface-parity", () => {
  assertMatchingKeys(
    "lifecycle surface",
    lifecycle,
    pick(stateAuthoritativeFacade, Object.keys(lifecycle))
  );

  for (const key of Object.keys(lifecycle)) {
    assert.equal(
      lifecycle[key],
      stateAuthoritativeFacade[key],
      `lifecycle export ${key} should be sourced from the authoritative facade`
    );
    assert.equal(
      statePublicApi[key],
      stateAuthoritativeFacade[key],
      `public api ${key} should preserve authoritative facade identity`
    );
  }
});
