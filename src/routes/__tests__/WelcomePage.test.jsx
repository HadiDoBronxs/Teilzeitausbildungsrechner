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
    "app.title": "Part-time Training Calculator",
    "app.titleMobile": "Part-time Training Calculator",
    "welcome.title": "Part-time Training Calculator",
    "welcome.intro": "Welcome to the Part-time Training Calculator. Choose the design that best suits you.",
    "welcome.question": "Do you want to use the compact design or the guided design?",
    "welcome.designs.compact": "Compact Design",
    "welcome.designs.tour": "Guided Design",
    "welcome.legalDisclaimer": "Note: This calculator is for informational purposes only.",
    "welcome.faqTitle": "FAQ",
    "welcome.faqIntro": "Quick answers about the calculator.",
    "welcome.faqLinkLegal": "Legal basis",
    "welcome.faqLinkTransparency": "Result explanation",
    "tour.comingSoon": "The guided design will be available soon.",
    "faq.categories.calculation": "Calculation & Inputs",
    "faq.categories.rules": "Rules & Limits",
    "faq.categories.legal": "Legal",
    "faq.items.calcHow.question": "How is the part-time duration calculated?",
    "faq.items.calcHow.answer": "We divide and apply the factor.",
    "faq.items.calcHow.easy": "In short: divide by full-time.",
    "faq.items.rule50.question": "What does the 50% rule mean?",
    "faq.items.rule50.answer": "At least half of full-time.",
    "faq.items.rule50.easy": "In short: minimum half.",
    "faq.items.adjustHours.question": "How do I change the full-time hours?",
    "faq.items.adjustHours.answer": "Enter your real full-time hours.",
    "faq.items.adjustHours.easy": "In short: enter the real number.",
    "faq.items.invalid.question": "What happens if my inputs are invalid?",
    "faq.items.invalid.answer": "We show an error.",
    "faq.items.invalid.easy": "In short: error message.",
    "faq.items.below50.question": "Can I work below 50%?",
    "faq.items.below50.answer": "The calculator does not support it.",
    "faq.items.below50.easy": "In short: not supported.",
    "faq.items.capReduction.question": "Why is my reduction capped?",
    "faq.items.capReduction.answer": "We apply limits.",
    "faq.items.capReduction.easy": "In short: there are caps.",
    "faq.items.binding.question": "Is the result binding?",
    "faq.items.binding.answer": "No, it is guidance.",
    "faq.items.binding.easy": "In short: guidance only.",
    "faq.items.whoDecides.question": "Who decides about reduction and duration?",
    "faq.items.whoDecides.answer": "Chamber and company together.",
    "faq.items.whoDecides.easy": "In short: chamber and company.",
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

    const heading = screen.getByRole("heading", { name: "Part-time Training Calculator" });
    expect(heading).toBeInTheDocument();
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
    const tourCard = screen.getByRole("button", { name: /Part-time Training Calculator.*Welcome/ });
    expect(tourCard).toBeInTheDocument();
    expect(tourCard).toHaveTextContent("Part-time Training Calculator");
  });

  it("renders compact design card with menu icon", () => {
    render(<WelcomePage />);

    const compactCard = screen.getByRole("button", { name: /Compact Design/ });
    expect(compactCard).toBeInTheDocument();
    expect(compactCard).toHaveTextContent("☰");
  });

  it("renders tour design card with book icon and is enabled", () => {
    render(<WelcomePage />);

    const tourCard = screen.getByRole("button", { name: /Part-time Training Calculator.*Welcome/ });
    expect(tourCard).toBeInTheDocument();
    expect(tourCard).toHaveTextContent("📖");
    expect(tourCard).not.toBeDisabled();
  });

  it("navigates to compact view when compact design is clicked", async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    const compactCard = screen.getByRole("button", { name: /Compact Design/ });
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

    expect(screen.getByText("How is the part-time duration calculated?")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<WelcomePage />);

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main");
    expect(main).toHaveAttribute("aria-labelledby", "main-heading");

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveAttribute("href", "#main");
  });

  it("navigates to tour view when tour design is clicked", async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    const tourCard = screen.getByRole("button", { name: /Part-time Training Calculator.*Welcome/ });
    await user.click(tourCard);

    // Hash should change to tour
    expect(window.location.hash).toBe("#tour");
  });

  it("supports keyboard focus order for skip link and design cards", async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    await user.tab();
    expect(screen.getByText("Skip to main content")).toHaveFocus();

    await user.tab();
    expect(
      screen.getByLabelText(/Switch to next language/i)
    ).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/Compact Design/)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/Guided Design/)).toHaveFocus();
  });
});
