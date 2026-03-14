/**
 * Simple utility to strip HTML tags and sanitize user input.
 * Helps prevent Basic XSS and database bloat from unnecessary HTML.
 */

export function stripHtml(html: string): string {
  if (!html) return "";
  // Strip all HTML tags
  const clean = html.replace(/<[^>]*>?/gm, "");
  // Trim whitespace
  return clean.trim();
}

/**
 * Truncate a string to a specific length and add ellipsis if needed.
 */
export function truncate(text: string, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Calculate estimated reading time in minutes.
 * Standard formula: total words / 200 words per minute.
 */
export function calculateReadTime(content: string): number {
  if (!content) return 1;
  // Replace HTML tags with spaces to ensure words in different tags aren't merged
  const text = content.replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  // Average reading speed is 200-250 wpm. We'll use 200 for inclusion.
  return Math.max(1, Math.ceil(wordCount / 200));
}
