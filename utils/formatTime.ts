/**
 * Formats seconds into a MM:SS display string.
 *
 * @example
 * formatTime(65) // "1:05"
 * formatTime(9)  // "0:09"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
