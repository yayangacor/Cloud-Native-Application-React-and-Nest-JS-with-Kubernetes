/**
 * Deterministic-but-varied placeholder box art. Same gameId always resolves
 * to the same image, and different games get visibly different art.
 */
export function coverUrl(seed: string, width = 400, height = 260) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
