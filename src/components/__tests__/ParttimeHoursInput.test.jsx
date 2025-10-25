import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import ParttimeHoursInput, {
  PARTTIME_INPUT_NAME,
  PARTTIME_MIN,
  PARTTIME_MAX,
} from "../ParttimeHoursInput";

describe("ParttimeHoursInput", () => {
  it("renders with default value and no error", () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);

    expect(input).toHaveValue(30);
    expect(input).toHaveAttribute("min", String(PARTTIME_MIN));
    expect(input).toHaveAttribute("max", String(PARTTIME_MAX));
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error when value is out of range (too low)", async () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "15");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 20-30");
  });

  it("shows an error when value is out of range (too high)", async () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "35");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 20-30");
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
