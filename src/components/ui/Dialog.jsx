// Dialog.jsx – Accessible modal shell for overlays like TransparencyPanel, handles focus trap + Escape + focus restore.
import React, { useEffect, useId, useRef } from "react";
import Button from "./Button";

// Focus trap selector mimics the one we already use in TransparencyPanel.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Props:
 * - title: heading text rendered in the dialog header (also labelled by default).
 * - isOpen: controls whether the modal is mounted and focus-trapped.
 * - onClose: callback for overlay clicks, Escape, and the close button.
 * - ariaLabelledby: optional custom label id (otherwise generated from title).
 * - initialFocusRef: ref to focus when opening; dialog traps focus while open, closes on Escape, and restores previous focus on close.
 * - maxWidth/bodyClassName/className: layout hooks for container width + body padding.
 */
function Dialog({
  title,
  isOpen,
  onClose,
  children,
  ariaLabelledby,
  initialFocusRef,
  maxWidth = "max-w-3xl",
  bodyClassName = "",
  className = "",
  closeLabel = "Close dialog",
  ...rest
}) {
  const dialogRef = useRef(null);
  const generatedId = useId();
  const labelledBy = ariaLabelledby || (title ? `${generatedId}-title` : undefined);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const dialog = dialogRef.current;
    const previousActive = document.activeElement;

    function focusInitial() {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const focusable = dialog?.querySelectorAll(FOCUSABLE_SELECTOR) || [];
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialog?.focus();
      }
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusable = dialog?.querySelectorAll(FOCUSABLE_SELECTOR) || [];
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    focusInitial();
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [isOpen, initialFocusRef, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`w-full ${maxWidth} rounded-2xl bg-white shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${className}`}
        {...rest}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          {title ? (
            <h2 id={labelledBy} className="text-xl font-semibold text-slate-900">
              {title}
            </h2>
          ) : null}
          <Button
            variant="ghost"
            onClick={onClose}
            ariaLabel={closeLabel}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-transparent"
          >
            {closeLabel}
          </Button>
        </header>
        <div className={`max-h-[70vh] overflow-y-auto px-6 py-5 ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dialog;
