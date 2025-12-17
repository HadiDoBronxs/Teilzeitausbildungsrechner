import { describe, it, expect } from "vitest";

// WCAG contrast helper
function relativeLuminance(hex) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const toLinear = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(fg, bg) {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

// Representative color pairs used in our core UI states (buttons, tabs, links, focus).
// Chosen to guard against regressions on common backgrounds/states.
const COLOR_PAIRS = [
  { name: "Primary dark: white on slate-950", fg: "#ffffff", bg: "#0f172a" },
  { name: "Secondary dark: white on slate-700", fg: "#ffffff", bg: "#334155" },
  { name: "Brand: white on blue-600", fg: "#ffffff", bg: "#2563eb" },
  { name: "Destructive: white on red-600", fg: "#ffffff", bg: "#dc2626" },
  { name: "Tabs default: slate-700 on slate-100", fg: "#334155", bg: "#f1f5f9" },
  { name: "Disabled text: slate-700 on slate-300", fg: "#334155", bg: "#cbd5e1" },
  { name: "Pill text: slate-800 on slate-50", fg: "#1f2937", bg: "#f8fafc" },
  { name: "Link text: blue-700 on white", fg: "#1d4ed8", bg: "#ffffff" },
  { name: "Focus ring: teal-700 on white", fg: "#0f766e", bg: "#ffffff" },
];

describe("Contrast tokens", () => {
  it("maintain at least 4.5:1 contrast", () => {
    COLOR_PAIRS.forEach(({ name, fg, bg }) => {
      const ratio = contrastRatio(fg, bg);
      expect(ratio, `${name} contrast ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    });
  });
});
