import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Canvas-Kontext steht in jsdom nicht zur Verfügung, daher simulieren wir ihn global.
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
    putImageData: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  }));
}

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
    "Wählen Sie Ihren höchsten Schulabschluss. Die passende Verkürzung übernehmen wir automatisch.",
  "reduction.why": () => "Warum kann ich verkürzen?",
  "reduction.whyText": () =>
    "Manche Abschlüsse enthalten Teile der Ausbildung. Deshalb kann die Kammer die Dauer verkürzen.",
  "reduction.applied": (opts) =>
    `Verkürzung: −${opts?.months} Monate (${opts?.label})`,
  "reduction.totalApplied": (opts) =>
    `Verkürzung gesamt: −${opts?.months} Monate`,
  "reduction.manualApplied": (opts) =>
    `Zusätzliche Gründe: −${opts?.months} Monate`,
  "reduction.qualificationApplied": (opts) =>
    `Qualifikationen: −${opts?.months} Monate`,
  "reduction.capWarning": (opts) =>
    `Deine Auswahl ergibt ${opts?.total} Monate. Berücksichtigt werden höchstens ${opts?.max} Monate.`,
  "reduction.breakdown.degree": (opts) =>
    `${opts?.label} (${opts?.months} Monate)`,
  "reduction.breakdown.manual": (opts) =>
    `Weitere Gründe (${opts?.months} Monate)`,
  "legal.title": () => "Gesetzesgrundlagen",
  "legal.openLaw": () => "Gesetzestext öffnen",
  "legal.bbig7a.heading": () => "§7a BBiG – Teilzeitberufsausbildung",
  "legal.bbig7a.text1": () =>
    "Der Betrieb und die Auszubildenden können gemeinsam vereinbaren, dass die Ausbildung in Teilzeit läuft. Die reguläre wöchentliche Ausbildungszeit wird dabei dauerhaft gekürzt, damit Ausbildung und andere Verpflichtungen zusammenpassen.",
  "legal.bbig7a.text2": () =>
    "Trotz kürzerer Wochenstunden bleibt das Ziel gleich: Alle Inhalte der Ausbildung werden vermittelt. Deshalb kann sich die Gesamtdauer verlängern oder der Betrieb gleicht die fehlende Zeit mit einem angepassten Plan aus.",
  "legal.hwo27b.heading": () =>
    "§27b HwO – Handwerkliche Teilzeitberufsausbildung",
  "legal.hwo27b.text1": () =>
    "Auch im Handwerk kann die Ausbildung als Teilzeit vereinbart werden. Betrieb und Auszubildende legen gemeinsam fest, wie viele Stunden pro Woche reduziert werden, damit Familie, Pflege oder andere Gründe berücksichtigt werden.",
  "legal.hwo27b.text2": () =>
    "Wichtig ist, dass alle fachlichen Inhalte vermittelt werden. Der Betrieb plant deshalb die Praxis so, dass trotz weniger Stunden eine vollständige Qualifizierung erreicht wird.",
  "legal.easy.heading": () => "In einfacher Sprache",
  "legal.easy.point1": () =>
    "Teilzeit-Ausbildung heißt: weniger Stunden pro Woche als normal.",
  "legal.easy.point2": () =>
    "Die Gesamtzeit kann länger werden, weil weniger Stunden pro Woche gelernt wird.",
  "legal.easy.point3": () =>
    "Betrieb und Auszubildende entscheiden zusammen, wie viel verkürzt wird.",
  "legal.easy.point4": () =>
    "Die Kammer prüft und stimmt zu, damit alles offiziell passt.",
  "legal.easy.point5": () =>
    "Alle wichtigen Lerninhalte bleiben trotzdem gleich.",
  "legal.notice.heading": () => "Wichtiger Hinweis",
  "legal.notice.text": () =>
    "Diese Informationen ersetzen keine Rechtsberatung. Über Verkürzungen und Abläufe entscheidet immer die zuständige Kammer.",
  "legal.sources.heading": () => "Weitere offizielle Quellen",
  "legal.sources.bbig": () => "BBiG – Gesetzesübersicht",
  "legal.sources.hwo": () => "HwO – Gesetzesübersicht",
  "legal.sources.bmbf": () =>
    "BMBF: Berufsausbildung in Teilzeit (PDF)",
  "qualifications.legalHint": () =>
    "§ 8 Abs. 3 BBiG: Bei einer Unterschreitung um mehr als 6 Monate sind zusätzliche Nachweise notwendig.",
  "reductionOptions.hs": () => "Hauptschulabschluss",
  "reductionOptions.mr": () =>
    "Fachoberschulreife / Mittlere Reife",
  "reductionOptions.fhr": () => "Fachhochschulreife",
  "reductionOptions.abi": () => "Hochschulreife",
  "reductionOptions.other": () => "Sonstiger Abschluss",
  "transparency.title": () => "Wie wird das berechnet?",
  "transparency.close": () => "Schließen",
  "transparency.intro": () =>
    "So erklären wir jeden Schritt in einfacher Sprache.",
  "transparency.ratio": (opts) =>
    `Ihre ${opts?.part} Stunden pro Woche sind ${opts?.pct} % von ${opts?.full} Stunden.`,
  "transparency.step1.title": () => "Schritt 1: Mindestanteil prüfen",
  "transparency.step1.ok": () =>
    "Das erfüllt die 50-%-Regel. Wir dürfen weiterrechnen.",
  "transparency.step1.fail": () =>
    "Das liegt unter 50 %. Bitte passen Sie die Stunden an oder sprechen Sie mit Ihrer Kammer.",
  "transparency.step2.title": () => "Schritt 2: Teilzeit-Faktor",
  "transparency.step2.text": (opts) =>
    `Wir teilen ${opts?.part} Stunden durch ${opts?.full} Stunden. Daraus entsteht der Teilzeit-Faktor ${opts?.factor}.`,
  "transparency.step3.title": () => "Schritt 3: Basisdauer",
  "transparency.step3.text": (opts) =>
    `Regeldauer ${opts?.fullM} Monate minus Schulabschluss ${opts?.degreeM} Monate und weitere Gründe ${opts?.manualM} Monate ergeben ${opts?.rawBase} Monate. Die Kammer verlangt mindestens ${opts?.minM} Monate, deshalb nutzen wir ${opts?.basis} Monate (${opts?.basisYM}).`,
  "transparency.step4.title": () => "Schritt 4: Neue Teilzeitdauer",
  "transparency.step4.text": (opts) =>
    `Wir teilen die Basisdauer ${opts?.basis} Monate durch den Teilzeit-Faktor ${opts?.factor}. Daraus werden ${opts?.dtheo} Monate in Teilzeit.`,
  "transparency.step5.title": () => "Schritt 5: Schutzregeln",
  "transparency.step5.sixApplied": (opts) =>
    `Die Verlängerung wäre ${opts?.extension} Monate. Wir begrenzen sie und bleiben bei ${opts?.limited} Monaten.`,
  "transparency.step5.sixSkipped": (opts) =>
    `Die Verlängerung beträgt ${opts?.extension} Monate. Keine Begrenzung nötig.`,
  "transparency.step5.capApplied": (opts) =>
    `Die Dauer nach Schritt 4 wären ${opts?.afterSix} Monate und damit mehr als 1,5 × der Regeldauer (${opts?.cap} Monate). Wir deckeln auf ${opts?.cap} Monate.`,
  "transparency.step5.capSkipped": (opts) =>
    `Die Dauer bleibt mit ${opts?.afterSix} Monaten unter dem Deckel von ${opts?.cap} Monaten.`,
  "transparency.step6.title": () => "Schritt 6: Runden und Ergebnis",
  "transparency.step6.text": (opts) =>
    `Wir runden ${opts?.value} Monate mit ${opts?.rounding} und erhalten ${opts?.rounded} Monate (${opts?.roundedYM}).`,
  "transparency.result": (opts) =>
    `Finales Ergebnis: ${opts?.months} Monate (${opts?.yearsMonths}).`,
  "transparency.delta.basis": (opts) =>
    `Unterschied zur Basis: ${opts?.delta} Monate.`,
  "transparency.delta.original": (opts) =>
    `Unterschied zur ursprünglichen Vollzeit: ${opts?.delta} Monate.`,
  "transparency.legal.title": () => "Rechtlicher Hinweis",
  "transparency.legal.text": () =>
    "Die Berechnung orientiert sich an § 7a BBiG (Teilzeitberufsausbildung).",
  "transparency.legal.link": () => "Zum Gesetzestext",
  "transparency.legal.url": () =>
    "https://www.gesetze-im-internet.de/bbig_2005/__7a.html",
  "transparency.rounding.round": () => "Mathematisches Runden",
  "transparency.rounding.ceil": () => "Aufrunden",
  "transparency.rounding.floor": () => "Abrunden",
  "transparency.simple.title": () => "Wie wird das berechnet?",
  "transparency.simple.teaser": (opts) =>
    `Ihre ${opts?.desiredHours} Stunden pro Woche sind ${opts?.percentage}% der normalen ${opts?.fullTimeHours} Stunden.`,
  "transparency.simple.actions.close": () => "Schließen",
  "transparency.simple.actions.showExpert": () => "Detaillierte Rechnung anzeigen",
  "transparency.simple.actions.hideExpert": () => "Detaillierte Rechnung ausblenden",
  "transparency.simple.chart.fullLabel": () => "Vollzeit",
  "transparency.simple.step1.title": () => "Schritt 1",
  "transparency.simple.step1.text": () => "Text Schritt 1",
  "transparency.simple.step2.title": () => "Schritt 2",
  "transparency.simple.step2.text": () => "Text Schritt 2",
  "transparency.simple.step3.title": () => "Schritt 3",
  "transparency.simple.step3.text": () => "Text Schritt 3",
  "transparency.simple.step4.title": () => "Schritt 4",
  "transparency.simple.step4.text": () => "Text Schritt 4",
  "transparency.simple.step5.title": () => "Schritt 5",
  "transparency.simple.step5.text": () => "Text Schritt 5",
  "transparency.simple.step6.title": () => "Schritt 6",
  "transparency.simple.step6.text": () => "Text Schritt 6",
  "transparency.simple.result.main": (opts) =>
    `Deine Teilzeitdauer beträgt ${opts?.months} Monate.`,
  "transparency.simple.result.diff": () => "Unterschied zur Vollzeit",
  "transparency.chart.partTime": () => "Teilzeit Chart Label",
  "error.below50": () =>
    "Die gewünschte Wochenarbeitszeit liegt unter 50 % der regulären Arbeitszeit. Bitte Eingaben prüfen.",
  "pdfViewer.loading": () => "Loading PDF...",
  "pdfViewer.close": () => "Close",
  "pdfViewer.closeViewer": () => "Close viewer",
  "pdfViewer.previous": () => "Previous",
  "pdfViewer.previousPage": () => "Previous page",
  "pdfViewer.next": () => "Next",
  "pdfViewer.nextPage": () => "Next page",
  "pdfViewer.zoomIn": () => "Zoom in",
  "pdfViewer.zoomOut": () => "Zoom out",
  "pdfViewer.save": () => "Save",
  "pdfViewer.savePDF": () => "Save PDF",
  "pdfViewer.print": () => "Print",
  "pdfViewer.printPDF": () => "Print PDF",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts = {}) => {
      const translator = translators[key];
      return typeof translator === "function" ? translator(opts) : key;
    },
    i18n: {
      language: "de",
      changeLanguage: vi.fn(),
    },
  }),
}));
