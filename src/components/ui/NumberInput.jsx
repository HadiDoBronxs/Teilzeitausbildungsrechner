// NumberInput.jsx – Shared <input type="number"> for hour/month fields in TZR.
// Automatically sanitizes input using sanitizePositiveDecimal, blocks invalid characters
// at keyboard level, and normalizes comma/dot decimal separators.
import { useRef, useEffect } from "react";
import { sanitizePositiveDecimal } from "../../utils/sanitizePositiveDecimal.js";

const BASE_CLASSES =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-base text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700";
const ERROR_CLASSES = "border-red-600 focus-visible:outline-red-600";

/**
 * Props:
 * - invalid: optional boolean to trigger error styling alongside aria-invalid.
 * - className: extra Tailwind classes to merge with base styles.
 * - inputMode: defaults to "numeric" when omitted for better mobile keyboards.
 * - rest: all other props forwarded to the underlying <input>.
 */
function NumberInput({ className = "", invalid, ...rest }) {
  const inputRef = useRef(null);
  const lastValidValueRef = useRef(rest.value ?? "");

  // Update ref when value prop changes (from parent state updates)
  useEffect(() => {
    if (rest.value !== undefined) {
      lastValidValueRef.current = rest.value;
    }
  }, [rest.value]);

  const inputProps = { ...rest };
  if (inputProps.inputMode === undefined) {
  inputProps.inputMode = "numeric";
  }

  // Block invalid keys before they're entered (prevents "e", "+", "-", etc.)
  const userOnKeyDown = inputProps.onKeyDown;
  inputProps.onKeyDown = (e) => {
    // Allow: digits, dot, comma, backspace, delete, tab, escape, enter, arrow keys
    const allowedKeys = [
      "Backspace", "Delete", "Tab", "Escape", "Enter",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End"
    ];
    
    // Allow Ctrl/Cmd + A, C, V, X, Z (copy, paste, cut, undo)
    if (e.ctrlKey || e.metaKey) {
      if (["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())) {
        if (typeof userOnKeyDown === "function") {
          userOnKeyDown(e);
        }
        return;
      }
    }
    
    // Check if key is allowed
    if (allowedKeys.includes(e.key)) {
      if (typeof userOnKeyDown === "function") {
        userOnKeyDown(e);
      }
      return;
    }
    
    // Check if it's a digit, dot, or comma
    if (/^[0-9.,]$/.test(e.key)) {
      if (typeof userOnKeyDown === "function") {
        userOnKeyDown(e);
      }
      return;
    }
    
    // Block all other keys (including "e", "+", "-", etc.)
    e.preventDefault();
  };

  // Handle paste events to sanitize pasted content
  const userOnPaste = inputProps.onPaste;
  inputProps.onPaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    const sanitized = sanitizePositiveDecimal(pastedText);
    if (sanitized.ok && sanitized.text) {
      // Set the sanitized value directly
      e.target.value = sanitized.text;
      lastValidValueRef.current = sanitized.text;
      // Trigger onChange manually with sanitized value
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: sanitized.text },
      };
      if (inputProps.onChange) {
        inputProps.onChange(syntheticEvent);
      }
    }
    if (typeof userOnPaste === "function") {
      userOnPaste(e);
    }
  };

  // Sanitize input before calling onChange (handles paste and other edge cases)
  const userOnChange = inputProps.onChange;
  if (typeof userOnChange === "function") {
    inputProps.onChange = (e) => {
      const sanitized = sanitizePositiveDecimal(e.target.value);
      if (sanitized.ok) {
        // Replace the value with sanitized text before passing to parent handler
        e.target.value = sanitized.text;
        lastValidValueRef.current = sanitized.text;
        userOnChange(e);
      } else {
        // If sanitization fails, reset to last valid value
        e.target.value = String(lastValidValueRef.current);
        // Don't call userOnChange with invalid input
      }
    };
  }

  // Combine ref callback with any existing ref
  const existingRef = inputProps.ref;
  inputProps.ref = (node) => {
    inputRef.current = node;
    if (typeof existingRef === "function") {
      existingRef(node);
    } else if (existingRef) {
      existingRef.current = node;
    }
  };

  // Prevent wheel/trackpad scroll from changing the value while focused
  const userWheelHandler = inputProps.onWheel;
  inputProps.onWheel = (event) => {
    event.preventDefault(); // stop default number increment on scroll
    if (typeof userWheelHandler === "function") {
      userWheelHandler(event);
    }
  };
  inputProps.onWheelCapture = (event) => {
    // Drop focus early so trackpad/mouse-wheel gestures cannot alter the value
    event.preventDefault();
    event.currentTarget.blur();
  };

  const ariaInvalidProp = inputProps["aria-invalid"];
  const isInvalid =
    invalid !== undefined ? Boolean(invalid) : Boolean(ariaInvalidProp);

  if (ariaInvalidProp === undefined && invalid !== undefined) {
    inputProps["aria-invalid"] = invalid;
  }

  inputProps.type = "number";
  inputProps.className = [BASE_CLASSES, isInvalid ? ERROR_CLASSES : "", className]
    .filter(Boolean)
    .join(" ");

  return <input {...inputProps} />;
}

export default NumberInput;
