/**
 * Keeping an index-based selection honest while the list under it moves.
 *
 * The admin editors track which row is expanded by its position in the array. That is
 * fine until the array is reordered or shortened, at which point the index still points
 * at a slot but no longer at the row the client opened — so they carry on typing into
 * whichever row slid underneath. Nothing warns them; the wrong record just changes.
 *
 * These keep the selection pointing at the row it was pointing at. Pure, so the awkward
 * cases are settled in tests rather than discovered in the panel.
 */

/** Exchange two entries. Returns the list untouched if either index is out of range. */
export function swap<T>(list: T[], a: number, b: number): T[] {
  if (a < 0 || b < 0 || a >= list.length || b >= list.length) return list;

  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Where the expanded row ends up once `from` and `to` have traded places. */
export function openAfterMove(open: number | null, from: number, to: number): number | null {
  if (open === null) return null;
  if (open === from) return to;
  if (open === to) return from;
  return open;
}

/** Where the expanded row ends up once `removed` is gone — or closed, if it was the one removed. */
export function openAfterDelete(open: number | null, removed: number): number | null {
  if (open === null) return null;
  if (open === removed) return null;
  return open > removed ? open - 1 : open;
}
