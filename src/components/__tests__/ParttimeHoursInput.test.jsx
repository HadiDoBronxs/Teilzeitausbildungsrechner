import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import ParttimeHoursInput, {
  PARTTIME_INPUT_NAME,
  computeParttimeBounds
} from "../ParttimeHoursInput";

describe("ParttimeHoursInput", () => {
  it("renders with default value and no error", () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);
    const { min, max } = computeParttimeBounds(40); // default fulltime is 40

    expect(input).toHaveValue(30);
    expect(input).toHaveAttribute("min", String(min));
    expect(input).toHaveAttribute("max", String(max));
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error when value is out of range (too low)", async () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "15");
    const { min: lowBound, max: highBound } = computeParttimeBounds(40);

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 20-32");
  });

  it("shows an error when value is out of range (too high)", async () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "35");
    const { min: low, max: high } = computeParttimeBounds(40);

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 20-32");
  });

  it("accepts a value within the range", async () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "25");

    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
