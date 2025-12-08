/**
 * Route name type definition for type safety and clarity.
 * @typedef {"welcome" | "transparenz" | "legal" | "compact" | "tour"} RouteName
 */

/**
 * Determines the current route based on URL pathname and hash.
 * Priority order:
 * 1. Pathname-based routes (legacy support, replaced by hash-based routes and iframe support)
 * 2. Hash-based routes (for design mode selection)
 * 3. Default to welcome page
 *
 * This function handles both server-side rendering (where window is undefined)
 * and client-side routing scenarios.
 *
 * @returns {RouteName} The current route name
 */
export function detectCurrentRoute() {
  // Guard against server-side rendering where window is not available
  if (typeof window === "undefined") {
    return "welcome";
  }

  // Check pathname first for legacy routes (takes precedence over hash)
  // These routes support direct access via URL pathname (e.g., /transparenz, /legal)
  if (window.location.pathname.startsWith("/transparenz")) {
    return "transparenz";
  }
  if (window.location.pathname.startsWith("/legal")) {
    return "legal";
  }

  // Check hash for new routing system (e.g., #compact, #tour)
  // Hash-based routing works well in iframe environments and doesn't require React Router
  const hash = window.location.hash.slice(1); // Remove '#' prefix
  if (hash === "compact") {
    return "compact";
  }
  if (hash === "tour") {
    return "tour";
  }

  // Default route when no specific route is detected
  return "welcome";
}
