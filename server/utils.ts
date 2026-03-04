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
