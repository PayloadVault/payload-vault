/**
 * Escapes a user-supplied string so it can be embedded in a RegExp literally.
 *
 * Search terms come straight from an input field. Interpolating them raw both
 * throws on unbalanced metacharacters (e.g. "(") and allows a crafted term to
 * trigger catastrophic backtracking.
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
