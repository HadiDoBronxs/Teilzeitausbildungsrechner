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
  "reduction.title": () => "Schulabschluss",
  "reduction.question": () => "Was ist Ihr höchster Bildungsabschluss?",
  "reduction.selectPlaceholder": () => "Schulabschluss auswählen",
  "reduction.dropdownDescription": () =>
    "Wähle deinen höchsten Schulabschluss aus. Die passende Verkürzung wird übernommen.",
  "reduction.why": () => "Warum kann ich verkürzen?",
  "reduction.whyText": () =>
    "Manche Schulabschlüsse enthalten bereits Teile der Ausbildung. Deshalb kann die IHK oder HWK die Ausbildungszeit verkürzen. Kammer und Betrieb entscheiden gemeinsam. In manchen Regionen gelten andere Regeln.",
  "reduction.applied": (opts) =>
    `Verkürzung: −${opts?.months} Monate (${opts?.label})`,
  "reduction.totalApplied": (opts) =>
    `Verkürzung gesamt: −${opts?.months} Monate`,
  "reduction.manualApplied": (opts) =>
    `Zusätzliche Gründe: −${opts?.months} Monate`,
  "reduction.breakdown.degree": (opts) =>
    `${opts?.label} −${opts?.months} Monate`,
  "reduction.breakdown.manual": (opts) =>
    `Weitere Gründe −${opts?.months} Monate`,
  "reductionOptions.hs": () => "Hauptschulabschluss",
  "reductionOptions.mr": () =>
    "Fachoberschulreife / Mittlere Reife",
  "reductionOptions.fhr": () => "Fachhochschulreife",
  "reductionOptions.abi": () => "Hochschulreife",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts = {}) => {
      const translator = translators[key];
      return typeof translator === "function" ? translator(opts) : key;
    },
  }),
}));
