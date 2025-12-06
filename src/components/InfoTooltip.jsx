import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from "./ui/Button";

/**
 * Barrierefreier Tooltip für Erklärungen und Hilfetexte
 */
export default function Tooltip({
  contentKey,
  position = "top",
  className = ""
}) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // Schließen bei Escape oder Klick außerhalb
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  const openTooltip = () => {
    setIsVisible(true);
  };

  const closeTooltip = () => {
    setIsVisible(false);
  };

  // Positionierungsklassen
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="icon"
        className="w-5 h-5 bg-blue-100 text-blue-600 hover:bg-blue-200"
        aria-describedby={isVisible ? `tooltip-${contentKey}` : undefined}
        onClick={toggleTooltip}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        ariaExpanded={isVisible}
      >
        <span className="text-xs font-bold">i</span>
        <span className="sr-only">{t('tooltip.info')}</span>
      </Button>

      {/* Tooltip Content */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id={`tooltip-${contentKey}`}
          role="tooltip"
          className={`
            absolute z-50 w-64 p-3 text-sm bg-slate-800 text-white rounded-lg shadow-lg
            ${positionClasses[position]}
            animate-in fade-in-0 zoom-in-95 duration-200
          `}
        >
          <p>{t(contentKey)}</p>

          {/* Tooltip Pfeil */}
          <div className={`
            absolute w-2 h-2 bg-slate-800 transform rotate-45
            ${position === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1'}
            ${position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1'}
            ${position === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1'}
            ${position === 'right' && 'right-full top-1/2 -translate-y-1/2 -mr-1'}
          `} />
        </div>
      )}
    </div>
  );
}