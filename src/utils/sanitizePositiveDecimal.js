/**
 * Sanitizes raw input to ensure it represents a valid positive decimal number.
 * Normalizes comma to dot (German decimal separator), removes invalid characters,
 * limits to one decimal place, and validates the format.
 *
 * @param {*} raw - Raw input value (string, number, null, or undefined)
 * @returns {{ ok: boolean, text: string }} `ok` indicates validity, `text` is the sanitized value (empty if invalid)
 */
export function sanitizePositiveDecimal(raw) {
    if (raw == null) return { ok: true, text: "" };
  
    let v = String(raw).trim();
  
    // Allow empty while typing
    if (v === "") return { ok: true, text: "" };
  
    // Normalize comma -> dot
    v = v.replace(/,/g, ".");
  
    // Remove everything except digits and dots
    v = v.replace(/[^\d.]/g, "");
  
    // Keep only the first dot
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
      const before = v.slice(0, firstDot);
      const after = v
        .slice(firstDot + 1)
        .replace(/\./g, "")
        .slice(0, 1); // max 1 decimal digit
      v = after.length ? `${before}.${after}` : `${before}.`;
    }
  
    // Validate format: one or more digits, optionally followed by a dot and zero or one decimal digit
    if (!/^\d+(\.\d?)?$/.test(v)) return { ok: false, text: "" };
  
    return { ok: true, text: v };
  }
  
/**
 * Converts sanitized text to a number, preserving intermediate typing states like "40.".
 *
 * @param {string} text - Sanitized text from sanitizePositiveDecimal
 * @returns {number|string} Numeric value, or original text if it ends with ".", or empty string
 */
export function toNumberOrEmpty(text) {
    if (text === "") return "";
    if (text.endsWith(".")) return text; // keep intermediate "40." state if desired
    const n = Number(text);
    return Number.isNaN(n) ? "" : n;
  }