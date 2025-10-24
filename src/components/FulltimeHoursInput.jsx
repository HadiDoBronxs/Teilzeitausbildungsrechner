import React, { useState } from "react";

export default function FulltimeHoursInput() {
  const [hours, setHours] = useState(40); // Standardwert 40 Stunden
  const [error, setError] = useState("");

  const MIN = 35;
  const MAX = 45;

  const handleChange = (e) => {
    const value = e.target.value;

    // Leere Eingabe behandeln (z. B. bei Löschung)
    if (value === "") {
      setHours("");
      setError("Bitte geben Sie eine Zahl zwischen 35 und 45 ein.");
      return;
    }

    const num = Number(value);

    if (isNaN(num) || num < MIN || num > MAX) {
      setError("Ungültige Eingabe: Bitte geben Sie eine Zahl zwischen " + MIN + " und " + MAX + " ein.");
    } else {
      setError("");
    }

    setHours(value);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <label htmlFor="fulltime-hours" className="font-semibold text-gray-800">
        Wie viele Stunden sind im Unternehmen üblich?:
      </label>

      <input
        id="fulltime-hours"
        name="fulltime-hours"
        type="number"
        inputMode="numeric"           // optimierte mobile Tastatur
        min={MIN}
        max={MAX}
        step={0.5}
        value={hours}
        onChange={handleChange}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 
          ${error ? "border-red-500" : "border-gray-300"}`}
      />

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}