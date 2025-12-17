// TourTabs.jsx – Tab navigation component for the guided tour view.
// Provides tab navigation between Inputs, Education, Reductions, and Results tabs.
// Mobile-first design: Vertical tabs on mobile (compact, readable, clearly separated from content),
// horizontal tabs on desktop.
// Note: Uses raw <button> elements with role="tab" rather than Button component because tabs
// require specific ARIA attributes (aria-selected, aria-controls) and tab-specific styling
// that don't fit the Button component's design pattern.
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const TABS = ["inputs", "education", "reductions", "results"];

/**
 * TourTabs component - Tab navigation for guided tour.
 *
 * Displays tabs for navigation between different steps of the tour.
 * Education and Reductions tabs are conditionally hidden when wantsReduction is "no".
 * 
 * Mobile: Vertical tabs stacked compactly with clear separation from content.
 * Desktop: Traditional horizontal tabs.
 *
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab ID ("inputs", "education", "reductions", "results")
 * @param {Function} props.onTabChange - Callback called when tab is clicked, receives tab ID
 * @param {string|null} props.wantsReduction - User's preference for reduction ("no", "yes", "i-dont-know", or null)
 * @param {boolean} [props.disabled=false] - Whether tabs should be disabled (e.g., when inputs are invalid)
 */
export default function TourTabs({ activeTab, onTabChange, wantsReduction, disabled = false }) {
  const { t } = useTranslation();
  const [isDesktop, setIsDesktop] = useState(false);

  // Determine which tabs should be visible
  // If wantsReduction is "no", hide Education and Reductions tabs
  const visibleTabs = wantsReduction === "no"
    ? TABS.filter((tab) => tab !== "education" && tab !== "reductions")
    : TABS;

  // Set aria-hidden based on screen size for accessibility
  // Defaults to mobile (false) in test environments where matchMedia isn't available
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(min-width: 1024px)");
      const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);
      
      updateIsDesktop(); // Set initial value
      
      // Use modern addEventListener API (addListener/removeListener are deprecated)
      mediaQuery.addEventListener("change", updateIsDesktop);
      return () => mediaQuery.removeEventListener("change", updateIsDesktop);
    }
    // In test environments, default to mobile (isDesktop stays false)
  }, []);

  function handleTabClick(tabId) {
    if (disabled) return;
    onTabChange(tabId);
  }

  function handleKeyDown(event, tabId) {
    if (disabled) return;
    // Handle arrow key navigation between tabs
    // On mobile (vertical), use ArrowUp/ArrowDown; on desktop (horizontal), use ArrowLeft/ArrowRight
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const currentIndex = visibleTabs.indexOf(activeTab);
      let nextIndex;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : visibleTabs.length - 1;
      } else {
        nextIndex = currentIndex < visibleTabs.length - 1 ? currentIndex + 1 : 0;
      }
      onTabChange(visibleTabs[nextIndex]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onTabChange(tabId);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={t("tour.tabs.inputs")}
      className="mb-4 lg:mb-0 lg:border-b lg:border-slate-200"
    >
      {/* Mobile: Vertical tabs */}
      <div className="flex flex-col gap-1.5 lg:hidden" aria-hidden={isDesktop}>
        {visibleTabs.map((tabId, index) => {
          const isActive = activeTab === tabId;
          const tabKey = `tour.tabs.${tabId}`;
          
          // Build className based on state for mobile vertical tabs
          const baseClasses = "px-3 py-2.5 text-sm font-semibold transition-colors rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700";
          
          let stateClasses;
          if (disabled) {
            stateClasses = "!bg-slate-100 !text-slate-600 cursor-not-allowed !border !border-slate-200";
          } else if (isActive) {
            // Active tab: dark background, white text, clear contrast
            stateClasses = "!bg-slate-950 !text-white shadow-sm";
          } else {
            // Inactive tab: light background, dark text, good readability
            stateClasses = "!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 hover:!text-slate-900 hover:border-slate-300";
          }
          
          const tabClassName = `${baseClasses} ${stateClasses}`;
          
          return (
            <button
              key={`mobile-${tabId}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tabId}`}
              id={`tab-mobile-${tabId}`}
              onClick={() => handleTabClick(tabId)}
              onKeyDown={(e) => handleKeyDown(e, tabId)}
              disabled={disabled}
              className={tabClassName}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${
                      disabled
                        ? "bg-slate-200 text-slate-700 border border-slate-300"
                        : isActive
                        ? "bg-white text-slate-950"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }
                  `}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>{t(tabKey)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop: Horizontal tabs */}
      <div className="hidden lg:flex gap-1" aria-hidden={!isDesktop}>
        {visibleTabs.map((tabId) => {
          const isActive = activeTab === tabId;
          const tabKey = `tour.tabs.${tabId}`;
          
          // Build className based on state for desktop horizontal tabs
          const baseClasses = "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700";
          
          let stateClasses;
          if (disabled) {
            stateClasses = "!bg-slate-100 !text-slate-600 border border-slate-200 cursor-not-allowed";
          } else if (isActive) {
            // Active tab: dark background, white text, dark border
            stateClasses = "!bg-slate-950 !text-white border-slate-950";
          } else {
            // Inactive tab: white background, dark text, transparent border
            stateClasses = "!bg-white !text-slate-900 border-transparent hover:!text-slate-950 hover:border-slate-300";
          }
          
          const tabClassName = `${baseClasses} ${stateClasses}`;
          
          return (
            <button
              key={`desktop-${tabId}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tabId}`}
              id={`tab-${tabId}`}
              onClick={() => handleTabClick(tabId)}
              onKeyDown={(e) => handleKeyDown(e, tabId)}
              disabled={disabled}
              className={tabClassName}
            >
              {t(tabKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
