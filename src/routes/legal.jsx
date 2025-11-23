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
        <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6">
          <h2 id={MAIN_HEADING_ID} className="text-3xl font-bold">
            Gesetzesgrundlagen (Inhalte folgen)
          </h2>
        </div>
      </main>
    </>
  );
}
