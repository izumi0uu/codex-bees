# Boundary review checklist

Use this checklist when reviewing future hybrid-runtime changes against the strategy in [Hybrid runtime strategy](./hybrid-runtime-strategy.md).

## Product alignment

- Does the change preserve `local bounded orchestration` as the product truth?
- Does it preserve the `codex-only` runtime boundary?
- Does it keep multi-host and hosted control planes out of first-pass scope?
- Does it avoid turning the repo into a generic meta-harness?

## Source-of-truth discipline

- Is there still exactly one authoritative source of persisted runtime truth?
- Does the change keep Python away from direct state mutation?
- Does the JS shell avoid becoming a hidden second kernel?
- Do authoritative writes still flow through one kernel contract?

## Ownership fit

- Does Rust own invariants and legal transitions?
- Does Python own optional intelligence rather than truth?
- Does TS/JS own CLI, MCP, npm packaging, imports, and bootstrap surfaces?
- Is each changed capability owned by one layer rather than shared vaguely?

## Migration discipline

- Does migration still start with JS boundary extraction?
- Are contracts frozen before any cross-language rewrite?
- Is Python introduced only after the kernel contract exists?
- Is there a compatibility plan before any public-surface churn?

## Compatibility

- Are CLI entrypoints preserved or compatibility-shimmed?
- Is MCP stdio behavior preserved or compatibility-shimmed?
- Are npm exports/subpath exports preserved or compatibility-shimmed?
- Are JS import expectations addressed explicitly?

## Review failure conditions

Reject the change if any of these are true:

- more than one layer can authoritatively mutate runtime truth
- Python is described as optional but becomes required in practice
- Rust porting starts before current JS responsibilities are disentangled
- compatibility is hand-waved instead of specified
- the proposal argues from language preference instead of product constraints
- the change expands toward multi-host or hosted-control-plane scope without an explicit product decision

## Reviewer prompts

Use these prompts during design or PR review:

1. What exact capability owns truth here?
2. Could this same write happen through a second path today?
3. Is this change policy, presentation, or authoritative transition logic?
4. What user-facing contract would break if this changed silently?
5. What evidence proves this migration step is reversible?

## Done condition

A hybrid-runtime change is review-ready only when:

- ownership is explicit
- source-of-truth rules remain intact
- compatibility impact is documented
- migration ordering is respected
- the change makes the strategy more enforceable, not more ambiguous
