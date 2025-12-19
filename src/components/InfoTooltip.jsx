import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
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
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const [arrowStyle, setArrowStyle] = useState(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipId = useId();

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

  const updateTooltipPosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;
    if (!triggerEl || !tooltipEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    const viewportPadding = 12;
    const gap = 8;
    const arrowSize = 8;
    const arrowInset = 12;

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;
    const isMobileViewport = window.innerWidth < 768;

    let left = 0;
    let top = 0;

    switch (position) {
      case "bottom":
        left = (isMobileViewport ? window.innerWidth / 2 : triggerCenterX) - tooltipRect.width / 2;
        top = triggerRect.bottom + gap;
        break;
      case "left":
        left = triggerRect.left - tooltipRect.width - gap;
        top = triggerCenterY - tooltipRect.height / 2;
        break;
      case "right":
        left = triggerRect.right + gap;
        top = triggerCenterY - tooltipRect.height / 2;
        break;
      case "top":
      default:
        left = (isMobileViewport ? window.innerWidth / 2 : triggerCenterX) - tooltipRect.width / 2;
        top = triggerRect.top - tooltipRect.height - gap;
        break;
    }

    left = Math.min(
      window.innerWidth - viewportPadding - tooltipRect.width,
      Math.max(viewportPadding, left),
    );
    top = Math.min(
      window.innerHeight - viewportPadding - tooltipRect.height,
      Math.max(viewportPadding, top),
    );

    setTooltipStyle({ left: `${left}px`, top: `${top}px` });

    if (position === "left" || position === "right") {
      const arrowTop = Math.min(
        tooltipRect.height - arrowInset - arrowSize,
        Math.max(arrowInset, triggerCenterY - top - arrowSize / 2),
      );
      setArrowStyle({ top: `${arrowTop}px` });
      return;
    }

    const arrowLeft = Math.min(
      tooltipRect.width - arrowInset - arrowSize,
      Math.max(arrowInset, triggerCenterX - left - arrowSize / 2),
    );
    setArrowStyle({ left: `${arrowLeft}px` });
  }, [position]);

  useLayoutEffect(() => {
    if (!isVisible) return;
    updateTooltipPosition();
  }, [isVisible, updateTooltipPosition, contentKey]);

  useEffect(() => {
    if (!isVisible) return;

    const handler = () => updateTooltipPosition();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isVisible, updateTooltipPosition]);

  const toggleTooltip = () => {
    setIsVisible((current) => !current);
  };

  const openTooltip = () => {
    setIsVisible(true);
  };

  const closeTooltip = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
    >
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="icon"
        className="w-5 h-5 bg-blue-100 text-blue-600 hover:bg-blue-200"
        aria-describedby={isVisible ? tooltipId : undefined}
        aria-controls={tooltipId}
        onClick={toggleTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        ariaExpanded={isVisible}
      >
        <span aria-hidden="true" className="text-xs font-bold">i</span>
        <span className="sr-only">{t('tooltip.info')}</span>
      </Button>

      {/* Tooltip Content */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={tooltipStyle ?? { left: 0, top: 0, visibility: "hidden" }}
          className={`
            fixed z-50 w-64 max-w-[calc(100vw-2rem)] p-3 text-sm bg-slate-800 text-white rounded-lg shadow-lg break-words
            animate-in fade-in-0 zoom-in-95 duration-200
          `}
        >
          <p>{t(contentKey)}</p>

          {/* Tooltip Pfeil */}
          <div
            aria-hidden="true"
            style={arrowStyle ?? undefined}
            className={`
              pointer-events-none absolute w-2 h-2 bg-slate-800 transform rotate-45
              ${position === 'top' && 'top-full -mt-1'}
              ${position === 'bottom' && 'bottom-full -mb-1'}
              ${position === 'left' && 'left-full -ml-1'}
              ${position === 'right' && 'right-full -mr-1'}
            `}
          />
        </div>
      )}
    </div>
  );
}
