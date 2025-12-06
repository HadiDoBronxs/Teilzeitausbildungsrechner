import { Suspense, lazy, useState, useEffect } from "react";
import "./App.css";

// Lazy load route components to reduce initial bundle size
const LegalBasisPage = lazy(() => import("./routes/legal.jsx"));
const Transparenz = lazy(() => import("./routes/transparenz.jsx"));
const WelcomePage = lazy(() => import("./routes/WelcomePage.jsx"));
const CompactView = lazy(() => import("./routes/CompactView.jsx"));
const TourView = lazy(() => import("./routes/TourView.jsx"));

// Minimal loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-slate-500 font-medium animate-pulse">Loading...</div>
  </div>
);

/**
 * App component - Main routing logic using hash-based routing.
 * Supports:
 * - Pathname-based routes: /transparenz, /legal (for direct access)
 * - Hash-based routes: #compact, #tour (for design mode selection)
 * - Default: Welcome page (when no hash is present)
 * Hash-based routing works well in iframe environments and doesn't require React Router.
 */
export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    // Check pathname first for legacy routes
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/transparenz")) {
        return "transparenz";
      }
      if (window.location.pathname.startsWith("/legal")) {
        return "legal";
      }
      // Check hash for new routing
      const hash = window.location.hash.slice(1); // Remove #
      if (hash === "compact") return "compact";
      if (hash === "tour") return "tour";
    }
    return "welcome";
  });

  // Listen for hash changes
  useEffect(() => {
    function handleHashChange() {
      if (typeof window !== "undefined") {
        // Check pathname first (legacy routes take precedence)
        if (window.location.pathname.startsWith("/transparenz")) {
          setCurrentRoute("transparenz");
          return;
        }
        if (window.location.pathname.startsWith("/legal")) {
          setCurrentRoute("legal");
          return;
        }
        // Check hash
        const hash = window.location.hash.slice(1);
        if (hash === "compact") {
          setCurrentRoute("compact");
        } else if (hash === "tour") {
          setCurrentRoute("tour");
        } else {
          setCurrentRoute("welcome");
        }
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Render based on current route
  if (currentRoute === "transparenz") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Transparenz />
      </Suspense>
    );
  }

  if (currentRoute === "legal") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LegalBasisPage />
      </Suspense>
    );
  }

  if (currentRoute === "compact") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <CompactView />
      </Suspense>
    );
  }

  if (currentRoute === "tour") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <TourView />
      </Suspense>
    );
  }

  // Default: welcome page
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WelcomePage />
    </Suspense>
  );
}
