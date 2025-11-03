import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import FulltimeHoursInput from "../FulltimeHoursInput";
import {
  FULLTIME_INPUT_NAME,
  FULLTIME_MIN,
  FULLTIME_MAX,
} from "../FulltimeHoursInput.constants";

describe("FulltimeHoursInput", () => {
  it("renders with default value and no error", () => {
    render(<FulltimeHoursInput />);
    const input = screen.getByTestId(FULLTIME_INPUT_NAME);

    expect(input).toHaveValue(40);
    expect(input).toHaveAttribute("min", String(FULLTIME_MIN));
    expect(input).toHaveAttribute("max", String(FULLTIME_MAX));
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error when value is out of range", async () => {
    render(<FulltimeHoursInput />);
    const input = screen.getByTestId(FULLTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "50");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 35-48");
  });

  it("accepts a value within the range", async () => {
    render(<FulltimeHoursInput />);
    const input = screen.getByTestId(FULLTIME_INPUT_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "42");

    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
