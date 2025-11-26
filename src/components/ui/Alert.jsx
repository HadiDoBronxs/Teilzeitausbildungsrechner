// Alert.jsx – Feedback box for important success/error/info messages in TZR.
import React from "react";

// variant -> color coding: error (red), success (emerald), info (blue).
const VARIANTS = {
  error: {
    container: "border border-red-200 bg-red-50",
    text: "text-red-800",
    iconBg: "bg-red-600",
  },
  success: {
    container: "border border-emerald-200 bg-emerald-50",
    text: "text-emerald-800",
    iconBg: "bg-emerald-600",
  },
  info: {
    container: "border border-blue-200 bg-blue-50",
    text: "text-blue-800",
    iconBg: "bg-blue-600",
  },
};

/**
 * Props:
 * - variant: color tone ("error", "success", "info", "warning") for different message types.
 * - role: ARIA role for assistive tech, defaults to "status"/"alert" semantics.
 * - children: custom message body (rendered below optional title/message props).
 */
function Alert({
  variant = "info",
  title,
  message,
  icon,
  role = "status",
  ariaLive = "polite",
  className = "",
  children,
}) {
  const styles = VARIANTS[variant] || VARIANTS.info;

  return (
    <section
      role={role}
      aria-live={ariaLive}
      className={`flex gap-3 rounded-lg px-4 py-3 shadow-sm ${styles.container} ${className}`}
    >
      <div
        className={`mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-white ${styles.iconBg}`}
        aria-hidden="true"
      >
        {icon || "!"}
      </div>
      <div className={`flex flex-1 flex-col ${styles.text}`}>
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {message ? <p className="text-sm">{message}</p> : null}
        {children}
      </div>
    </section>
  );
}

export default Alert;
