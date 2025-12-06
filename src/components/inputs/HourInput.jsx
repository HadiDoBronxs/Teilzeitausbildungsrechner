import React from "react";

export default function HourInput({ value, onChange }) {
  const handleChange = (e) => {
    let raw = e.target.value;

    // block scientific notation (e.g., "1e-2")
    if (raw.toLowerCase().includes("e")) {
      return;
    }

    // allow empty input
    if (raw.trim() === "") {
      onChange("");
      return;
    }

    // accept intermediate values like "40," or "40."
    if (/^[0-9]+[.,]$/.test(raw)) {
      onChange(raw);
      return;
    }

    // normalize comma to dot
    const normalized = raw.replace(",", ".");
    let number = Number(normalized);

    // reject invalid numbers
    if (isNaN(number)) {
      return;
    }

    // extract decimal part as typed
    const decimalPart = normalized.split(".")[1] || "";

    // round automatically if more than 1 decimal place
    if (decimalPart.length > 1) {
      const rounded = parseFloat(number.toFixed(1)); 
      onChange(rounded);                              
      return;
    }

    // accept valid number (0 or 1 decimals)
    onChange(number);
  };

  // convert internal number/string back into comma format for UI
  let displayValue = value;
  if (typeof value === "number") {
    displayValue = value.toString().replace(".", ",");
  } else if (typeof value === "string") {
    displayValue = value.replace(".", ",");
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      inputMode="decimal"
      className="border p-2 rounded w-full"
    />
  );
}
