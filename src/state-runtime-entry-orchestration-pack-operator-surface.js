import { runtimeOperatorPackFromSources } from './state-runtime-packs.js';

export function runtimeOperatorPackSurface({
  runtimeDashboard,
  runtimeFocus,
  runtimeAlerts,
  runtimeHandoffs,
  runtimeCloseout
}) {
  return runtimeOperatorPackFromSources({
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  });
}
