// Tests for WelcomePage component - design selection and navigation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WelcomePage from "../WelcomePage.jsx";

// Mock react-i18next
const mockT = (key) => {
  const translations = {
    skipToMain: "Skip to main content",
    "welcome.title": "Part-time Training Calculator",
    "welcome.intro": "Welcome to the Part-time Training Calculator. Choose the design that best suits you.",
    "welcome.question": "Do you want to use the compact design or the guided design?",
    "welcome.designs.compact": "Compact Design",
    "welcome.designs.tour": "Guided Design",
    "welcome.legalDisclaimer": "Note: This calculator is for informational purposes only.",
    "welcome.faqPlaceholder": "FAQ Area (to be implemented later)",
    "tour.comingSoon": "The guided design will be available soon.",
  };
  return translations[key] || key;
};

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: mockT,
    i18n: {},
  })),
}));

// Mock window.location.hash
const mockLocationHash = { value: "" };
Object.defineProperty(window, "location", {
  value: {
    get hash() {
      return mockLocationHash.value;
    },
    set hash(value) {
      mockLocationHash.value = value;
    },
  },
  writable: true,
});

describe("WelcomePage", () => {
  beforeEach(() => {
    mockLocationHash.value = "";
    vi.clearAllMocks();
  });

  it("renders the welcome page with title and intro text", () => {
    render(<WelcomePage />);

    expect(screen.getByText("Part-time Training Calculator")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Welcome to the Part-time Training Calculator. Choose the design that best suits you."
      )
    ).toBeInTheDocument();
  });

  it("renders the design selection question", () => {
    render(<WelcomePage />);

    expect(
      screen.getByText("Do you want to use the compact design or the guided design?")
    ).toBeInTheDocument();
  });

  it("renders both design selection cards", () => {
    render(<WelcomePage />);

    expect(screen.getByText("Compact Design")).toBeInTheDocument();
    expect(screen.getByText("Guided Design")).toBeInTheDocument();
  });

  it("renders compact design card with menu icon", () => {
    render(<WelcomePage />);

    const compactCard = screen.getByLabelText(/Compact Design/);
    expect(compactCard).toBeInTheDocument();
    expect(compactCard).toHaveTextContent("☰");
  });

  it("renders tour design card with book icon and is disabled", () => {
    render(<WelcomePage />);

    const tourCard = screen.getByLabelText(/Guided Design/);
    expect(tourCard).toBeInTheDocument();
    expect(tourCard).toHaveTextContent("📖");
    expect(tourCard).toBeDisabled();
    expect(tourCard).toHaveAttribute("aria-disabled", "true");
  });

  it("navigates to compact view when compact design is clicked", async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    const compactCard = screen.getByLabelText(/Compact Design/);
    await user.click(compactCard);

    expect(window.location.hash).toBe("#compact");
  });

  it("renders legal disclaimer", () => {
    render(<WelcomePage />);

    expect(
      screen.getByText("Note: This calculator is for informational purposes only.")
    ).toBeInTheDocument();
  });

  it("renders FAQ placeholder area", () => {
    render(<WelcomePage />);

    expect(screen.getByText("FAQ Area (to be implemented later)")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<WelcomePage />);

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main");
    expect(main).toHaveAttribute("aria-labelledby", "main-heading");

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveAttribute("href", "#main");
  });

  it("does not navigate when tour design is clicked (disabled)", async () => {
    const user = userEvent.setup();
    const initialHash = window.location.hash;
    render(<WelcomePage />);

    const tourCard = screen.getByLabelText(/Guided Design/);
    await user.click(tourCard);

    // Hash should not change (tour is not implemented)
    expect(window.location.hash).toBe(initialHash);
  });
});
