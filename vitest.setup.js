import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

const translators = {
  "fulltimeHours.error": (opts) => `ERR ${opts?.min}-${opts?.max}`,
  "parttimeHours.error": (opts) => `ERR ${opts?.min}-${opts?.max}`,
  "regularDuration.error": (opts) => `ERR ${opts?.min}-${opts?.max}`,
  "result.headline": (opts) => `Ihre Ausbildung dauert ${opts?.value}`,
  "result.labels.full": () => "Vollzeit",
  "result.labels.part": () => "Ihre Teilzeit",
  "result.labels.change": () => "Änderung",
  "result.months": (opts) => {
    const count = Number(opts?.count);
    const display = opts?.value ?? count;
    return Math.abs(count) === 1 ? `${display} Monat` : `${display} Monate`;
  },
  "result.error.title": () => "Berechnung nicht möglich",
  "result.error.generic": () => "Bitte überprüfe deine Eingaben.",
  "result.howCalculated": () => "Wie wird das berechnet?",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts = {}) => {
      const translator = translators[key];
      return typeof translator === "function" ? translator(opts) : key;
    },
  }),
}));
