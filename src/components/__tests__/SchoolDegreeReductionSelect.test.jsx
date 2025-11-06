import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SchoolDegreeReductionSelect from "../SchoolDegreeReductionSelect.jsx";

describe("SchoolDegreeReductionSelect", () => {
  it("calls onChange with mapped months when a degree is chosen", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SchoolDegreeReductionSelect value="" onChange={handleChange} />);

    const select = screen.getByTestId("school-degree-select");
    await user.selectOptions(select, "mr");

    expect(handleChange).toHaveBeenCalledWith("mr", 6);
  });

  it("shows the applied reduction text for abi selection", () => {
    render(<SchoolDegreeReductionSelect value="abi" onChange={vi.fn()} />);

    expect(
      screen.getByText("Verkürzung: −12 Monate (Hochschulreife)")
    ).toBeInTheDocument();
  });

  it("opens and closes the tooltip with keyboard support", async () => {
    const user = userEvent.setup();
    render(<SchoolDegreeReductionSelect value="" onChange={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Warum kann ich verkürzen?" });
    await user.click(button);
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Deshalb kann die IHK oder HWK die Ausbildungszeit verkürzen."
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
