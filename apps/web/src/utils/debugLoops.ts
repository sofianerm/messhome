/**
 * Utilitaire pour détecter les boucles infinies dans les hooks
 */

const callCounts = new Map<string, number>();
const resetTimers = new Map<string, NodeJS.Timeout>();

export function detectInfiniteLoop(hookName: string, maxCalls = 50, windowMs = 5000) {
  const count = (callCounts.get(hookName) || 0) + 1;
  callCounts.set(hookName, count);

  // Clear le timer précédent
  const existingTimer = resetTimers.get(hookName);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Créer nouveau timer pour reset
  const newTimer = setTimeout(() => {
    callCounts.set(hookName, 0);
  }, windowMs);
  resetTimers.set(hookName, newTimer);

  if (count > maxCalls) {
    console.error(`🚨 INFINITE LOOP DETECTED in ${hookName}!`);
    console.error(`Called ${count} times in ${windowMs}ms`);
    console.trace();
    return true;
  }

  if (count > maxCalls / 2) {
    console.warn(`⚠️ ${hookName} called ${count} times - potential loop`);
  }

  return false;
}
