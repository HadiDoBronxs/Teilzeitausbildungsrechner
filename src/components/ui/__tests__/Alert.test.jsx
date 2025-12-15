import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Alert from "../Alert.jsx";

describe("Alert accessibility", () => {
  it("sets role and aria-live based on props", () => {
    render(
      <Alert role="alert" ariaLive="assertive" title="Title" message="Body">
        <span>extra</span>
      </Alert>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Title");
    expect(alert).toHaveTextContent("Body");
    expect(alert).toHaveTextContent("extra");
  });

  it("defaults to status/polite when no props provided", () => {
    render(<Alert>content</Alert>);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("content");
  });
});
