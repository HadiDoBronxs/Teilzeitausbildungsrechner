import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import ParttimeHoursInput from "../ParttimeHoursInput";
import {
  PARTTIME_INPUT_NAME,
  computeParttimeBounds,
  PARTTIME_ERROR_ID,
} from "../ParttimeHoursInput.helpers";

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
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", PARTTIME_ERROR_ID);
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 20-32");
  });

  it("shows an error when value is out of range (too high)", async () => {
    render(<ParttimeHoursInput />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "35");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", PARTTIME_ERROR_ID);
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

  it("caps the computed max at 35h when fulltime is high (e.g. 45h)", async () => {
    render(<ParttimeHoursInput fulltimeHours={45} />);
    const input = screen.getByTestId(PARTTIME_INPUT_NAME);
    const { min, max } = computeParttimeBounds(45);

    // Expect the capped max to be 35
    expect(max).toBe(35);
    expect(input).toHaveAttribute("min", String(min));
    expect(input).toHaveAttribute("max", String(max));

    await userEvent.clear(input);
    await userEvent.type(input, "35");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();

    await userEvent.clear(input);
    await userEvent.type(input, "36");
    expect(input).toHaveAttribute("aria-invalid", "true");
    
    expect(screen.getByRole("alert")).toHaveTextContent(
      `ERR ${String(min)}-${String(max)}`
    );
  });
});
