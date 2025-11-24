// Placeholder route to host legal basis content once texts are finalized.
const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

export default function LegalBasisPage() {
  return (
    <>
      <a className="skip-link" href={`#${MAIN_ID}`}>
        Zum Inhalt springen
      </a>
      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12"
      >
        <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 space-y-8">
          <h2 id={MAIN_HEADING_ID} className="text-3xl font-bold">
            Gesetzesgrundlagen
          </h2>

          <section className="space-y-3">
            {/* §7a BBiG: Regelt die Teilzeitberufsausbildung im Berufsbildungsgesetz. */}
            <h3 className="text-2xl font-semibold">
              §7a BBiG – Teilzeitberufsausbildung
            </h3>
            <p className="text-lg leading-relaxed">
              Der Betrieb und die Auszubildenden können gemeinsam vereinbaren, dass die
              Ausbildung in Teilzeit läuft. Die reguläre wöchentliche Ausbildungszeit wird
              dabei dauerhaft gekürzt, damit Ausbildung und andere Verpflichtungen
              zusammenpassen.
            </p>
            <p className="text-lg leading-relaxed">
              Trotz kürzerer Wochenstunden bleibt das Ziel gleich: Alle Inhalte der
              Ausbildung werden vermittelt. Deshalb kann sich die Gesamtdauer verlängern
              oder der Betrieb gleicht die fehlende Zeit mit einem angepassten Plan aus.
            </p>
          </section>

          <section className="space-y-3">
            {/* §27b HwO: Regelt die Teilzeitberufsausbildung im Handwerk nach Handwerksordnung. */}
            <h3 className="text-2xl font-semibold">
              §27b HwO – Handwerkliche Teilzeitberufsausbildung
            </h3>
            <p className="text-lg leading-relaxed">
              Auch im Handwerk kann die Ausbildung als Teilzeit vereinbart werden. Betrieb
              und Auszubildende legen gemeinsam fest, wie viele Stunden pro Woche reduziert
              werden, damit Familie, Pflege oder andere Gründe berücksichtigt werden.
            </p>
            <p className="text-lg leading-relaxed">
              Wichtig ist, dass alle fachlichen Inhalte vermittelt werden. Der Betrieb
              plant deshalb die Praxis so, dass trotz weniger Stunden eine vollständige
              Qualifizierung erreicht wird.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
