# Accessibility Test Protocol (English)

## Safari keyboard navigation
- macOS System Settings → Keyboard → Keyboard Navigation: set to “All controls”.
- Safari → Settings → Advanced: enable “Press Tab to highlight each item on a webpage”.
- If Tab still skips elements: press Option+Tab once to move focus into the page; then Tab/Shift+Tab should reach buttons/links/inputs (info tooltips, tabs, results).

## Manual checklist
- Browsers: latest desktop Chrome, Firefox, Safari, Edge. Note browser/version and Pass/Fail.
- Keyboard navigation: Tab/Shift+Tab/Enter/Space/Arrow keys through tabs, FAQ, inputs, buttons, dialogs (Legal/Transparency), tooltips.
- Focus visibility: all interactive elements show a clear, high-contrast focus style.
- Screenreader sanity: VoiceOver/NVDA announce tab changes, FAQ expand/collapse, status/alert messages.
- ARIA states: tabs have `aria-selected`/`aria-controls`; panels `role="tabpanel"` + `aria-labelledby`; accordions `aria-expanded`/`aria-controls`; live regions announced.
- Layout stability: no layout shifts when switching tabs, opening FAQ items, or showing error/status texts.
- Safari quirks: after the settings above, Tab reaches info buttons and result areas.

---

# Accessibility-Testprotokoll (Deutsch)

## Safari-spezifische Tastaturnavigation
- macOS Systemeinstellungen → Tastatur → Tastaturnavigation: auf „Alle Steuerungen“ setzen.
- Safari → Einstellungen → Erweitert: „Tabulator hebt jedes Objekt auf einer Webseite hervor“ aktivieren.
- Falls Tab weiterhin Elemente überspringt: einmal Option + Tab drücken; danach sollten Tab / Shift + Tab auch Info-Buttons, Tabs, Ergebnisse erreichen.

## Manuelle Checkliste
- Browser: aktuelle Desktop-Versionen von Chrome, Firefox, Safari, Edge; Browser/Version und Bestanden/Nicht bestanden notieren.
- Tastaturnavigation: Tab / Shift + Tab / Enter / Leertaste / Pfeiltasten durch Tabs, FAQ, Inputs, Buttons, Dialoge (Gesetzesgrundlagen/Transparenz), Tooltips.
- Fokus-Sichtbarkeit & Kontrast: alle interaktiven Elemente zeigen klaren, kontrastreichen Fokuszustand.
- Screenreader-Plausibilität: VoiceOver / NVDA kündigt Tab-Wechsel, FAQ Auf-/Zuklappen sowie Status- und Fehlermeldungen korrekt an.
- ARIA-Zustände:
  - Tabs: `aria-selected`, `aria-controls`.
  - Panels: `role="tabpanel"`, `aria-labelledby`.
  - Akkordeons: `aria-expanded`, `aria-controls`.
  - Live-Regionen: werden angekündigt.
- Layout-Stabilität: keine Verschiebungen beim Tabwechsel, FAQ-Öffnen oder bei Fehler-/Statusmeldungen.
- Safari-Besonderheiten: nach den Einstellungen oben erreicht die Tab-Navigation auch Info-Buttons und Ergebnisbereiche.