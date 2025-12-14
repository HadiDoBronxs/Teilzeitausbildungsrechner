import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import RegularDurationInput from "../RegularDurationInput";
import {
  REGULAR_DURATION_NAME,
  DURATION_MIN,
  DURATION_MAX,
  REGULAR_DURATION_ERROR_ID,
} from "../RegularDurationInput.constants";

describe("RegularDurationInput", () => {
  it("renders with default value and no error", () => {
    render(<RegularDurationInput />);
    const input = screen.getByTestId(REGULAR_DURATION_NAME);

    expect(input).toHaveValue(36);
    expect(input).toHaveAttribute("min", String(DURATION_MIN));
    expect(input).toHaveAttribute("max", String(DURATION_MAX));
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error when value is out of range (too low)", async () => {
    render(<RegularDurationInput />);
    const input = screen.getByTestId(REGULAR_DURATION_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "6");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", REGULAR_DURATION_ERROR_ID);
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 12-48");
  });

  it("shows an error when value is out of range (too high)", async () => {
    render(<RegularDurationInput />);
    const input = screen.getByTestId(REGULAR_DURATION_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "60");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", REGULAR_DURATION_ERROR_ID);
    expect(screen.getByRole("alert")).toHaveTextContent("ERR 12-48");
  });

  it("accepts a value within the range", async () => {
    render(<RegularDurationInput />);
    const input = screen.getByTestId(REGULAR_DURATION_NAME);

    await userEvent.clear(input);
    await userEvent.type(input, "24");

    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
