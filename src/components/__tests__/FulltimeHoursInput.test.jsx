import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FulltimeHoursInput, { FULLTIME_INPUT_NAME } from "../FulltimeHoursInput.jsx";

describe("FulltimeHoursInput", () => {
  it("zeigt den Standardwert 40 Stunden an", () => {
    render(<FulltimeHoursInput />);
    const input = screen.getByRole("spinbutton", { name: FULLTIME_INPUT_NAME });
    expect(input.value).toBe("40");
  });

  it("zeigt eine Fehlermeldung bei zu hoher Eingabe", () => {
    render(<FulltimeHoursInput />);
    const input = screen.getByRole("spinbutton", { name: FULLTIME_INPUT_NAME });
    fireEvent.change(input, { target: { value: "50" } });
    expect(screen.getByText(/zahl zwischen 35 und 45/i)).toBeInTheDocument();
  });

  it("entfernt die Fehlermeldung, wenn Eingabe wieder gültig ist", () => {
    render(<FulltimeHoursInput />);
    const input = screen.getByRole("spinbutton", { name: FULLTIME_INPUT_NAME });

    fireEvent.change(input, { target: { value: "50" } });
    expect(screen.getByText(/zahl zwischen 35 und 45/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "40" } });
    expect(screen.queryByText(/zahl zwischen 35 und 45/i)).not.toBeInTheDocument();
  });
});