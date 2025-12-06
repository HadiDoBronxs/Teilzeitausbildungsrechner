import { Suspense, lazy, useState, useEffect } from "react";
import "./App.css";

// Lazy load route components to reduce initial bundle size and improve performance.
// Components are only loaded when their route is accessed, not on initial page load.
const LegalBasisPage = lazy(() => import("./routes/legal.jsx"));
const Transparenz = lazy(() => import("./routes/transparenz.jsx"));
const WelcomePage = lazy(() => import("./routes/WelcomePage.jsx"));
const CompactView = lazy(() => import("./routes/CompactView.jsx"));
const TourView = lazy(() => import("./routes/TourView.jsx"));

/**
 * Loading fallback component displayed while lazy-loaded route components are being fetched.
 * Shows a centered loading message with a pulse animation to provide visual feedback.
 * This is a simple fallback - more sophisticated loading states can be added per route if needed.
 *
 * @returns {JSX.Element} Loading indicator component
 */
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-slate-500 font-medium animate-pulse">Loading...</div>
  </div>
);

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
function detectCurrentRoute() {
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

/**
 * Handles hash change events and updates the current route accordingly.
 * Listens for browser navigation events (back/forward buttons, hash changes)
 * and synchronizes the application state with the URL.
 *
 * @param {Function} setCurrentRoute - State setter function to update the current route
 */
function setupHashChangeListener(setCurrentRoute) {
  function handleHashChange() {
    // Re-detect route when hash changes (e.g., user clicks back/forward or changes hash)
    const newRoute = detectCurrentRoute();
    setCurrentRoute(newRoute);
  }

  // Listen for hash changes (browser navigation, programmatic hash changes)
  window.addEventListener("hashchange", handleHashChange);

  // Return cleanup function to remove event listener when component unmounts
  return () => {
    window.removeEventListener("hashchange", handleHashChange);
  };
}

/**
 * Route configuration mapping route names to their corresponding components.
 * This centralizes route-to-component mapping for easier maintenance.
 */
const ROUTE_COMPONENTS = {
  transparenz: Transparenz,
  legal: LegalBasisPage,
  compact: CompactView,
  tour: TourView,
  welcome: WelcomePage,
};

/**
 * App component - Main routing logic using hash-based routing.
 *
 * Routing Strategy:
 * - Pathname-based routes: /transparenz, /legal (for direct access and legacy support)
 * - Hash-based routes: #compact, #tour (for design mode selection)
 * - Default: Welcome page (when no hash or pathname route is present)
 *
 * Why hash-based routing?
 * - Works well in iframe environments (common for embedded calculators)
 * - Doesn't require React Router dependency (reduces bundle size)
 * - Simple to implement and maintain
 * - Supports browser back/forward navigation
 *
 * Props: None (uses URL-based routing)
 */
export default function App() {
  // Initialize route state by detecting the current route from URL
  // Uses function form of useState to avoid recalculating on every render
  const [currentRoute, setCurrentRoute] = useState(detectCurrentRoute);

  // Set up hash change listener to update route when URL hash changes
  // This enables browser back/forward buttons and programmatic navigation
  useEffect(() => {
    return setupHashChangeListener(setCurrentRoute);
  }, []);

  // Render the appropriate route component based on current route
  // Check if route has a specific component mapping, otherwise default to welcome
  // Wrap in Suspense for lazy loading with consistent loading fallback
  const RouteComponent = ROUTE_COMPONENTS[currentRoute] || ROUTE_COMPONENTS.welcome;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouteComponent />
    </Suspense>
  );
}
