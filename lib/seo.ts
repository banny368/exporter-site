/**
 * Helpers for keeping metadata inside what a results page will actually show.
 *
 * A search result shows roughly 160 characters of description. Anything past that is
 * cut by the engine, mid-word, and a sentence that ends in the middle of a thought
 * reads as neglect. Trimming deliberately is the difference between a description that
 * closes and one that trails off.
 */

/**
 * Shorten to at most `limit` characters, breaking on a word rather than through one.
 *
 * Returns the text untouched when it already fits, so short descriptions never gain a
 * stray ellipsis.
 */
export function truncateAtWord(text: string, limit: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= limit) return clean;

  // Leave room for the ellipsis so the result is genuinely within the limit.
  const room = limit - 1;
  const cut = clean.slice(0, room);
  const lastSpace = cut.lastIndexOf(" ");

  // A single word longer than the limit has no boundary to break on; hard-cut it.
  const body = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  return `${body.replace(/[,;:.\u2014-]+$/, "")}…`;
}
