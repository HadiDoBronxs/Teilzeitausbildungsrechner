import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

vi.mock("../../ui/Dialog.jsx", () => ({
  default: ({ isOpen, title, onClose, children, closeLabel = "close" }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
        <button type="button" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    ) : null,
}));

vi.mock("../../legal/LegalContent.jsx", () => ({
  default: () => <div>legal-content</div>,
}));

vi.mock("../../../features/calcDuration/TransparencyPanel.jsx", () => ({
  default: ({ onClose }) => (
    <div role="region" aria-label="transparency-panel">
      <button type="button" onClick={onClose}>
        close transparency
      </button>
    </div>
  ),
}));

import FAQSection from "../FAQSection.jsx";

describe("FAQSection keyboard accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles accordion items with Enter and Space via keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const firstQuestion = screen.getByRole("button", {
      name: /faq.items.calcHow.question/i,
    });

    for (let i = 0; i < 5 && document.activeElement !== firstQuestion; i += 1) {
      await user.tab();
    }
    expect(firstQuestion).toHaveFocus();
    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{Enter}");
    const firstPanel = screen.getByRole("region", {
      name: /faq.items.calcHow.question/i,
    });
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    expect(firstPanel).not.toHaveClass("hidden");

    await user.keyboard("{Space}");
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    expect(firstPanel).not.toHaveClass("hidden");
  });

  it("links panels to triggers via aria-labelledby and role=region", async () => {
    render(<FAQSection />);

    const trigger = screen.getByRole("button", {
      name: /faq.items.rule50.question/i,
    });
    expect(trigger).toHaveAttribute("aria-controls", "faq-panel-rule50");
    expect(trigger).toHaveAttribute("id", "faq-trigger-rule50");

    // Open to reveal region
    await userEvent.click(trigger);

    const panel = screen.getByRole("region", {
      name: /faq.items.rule50.question/i,
    });
    expect(panel).toHaveAttribute("id", "faq-panel-rule50");
    expect(panel).toHaveAttribute("aria-labelledby", "faq-trigger-rule50");
  });

  it("keeps accordion buttons operable when not disabled", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const reductionQuestion = screen.getByRole("button", {
      name: /faq.items.capReduction.question/i,
    });
    reductionQuestion.focus();

    await user.keyboard("{Enter}");
    expect(reductionQuestion).toHaveAttribute("aria-expanded", "true");

    await user.click(reductionQuestion);
    expect(reductionQuestion).toHaveAttribute("aria-expanded", "false");
  });

  it("renders new categories and questions", () => {
    render(<FAQSection />);

    expect(screen.getByText("faq.categories.practice")).toBeInTheDocument();
    expect(screen.getByText("faq.categories.technical")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /faq.items.shiftPlan.question/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /faq.items.saveData.question/i })
    ).toBeInTheDocument();
  });

  it("renders all category headings in order", () => {
    render(<FAQSection />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      "faq.categories.calculation",
      "faq.categories.rules",
      "faq.categories.practice",
      "faq.categories.technical",
      "faq.categories.legal",
    ]);
  });

  it("shows easy-to-read text when a new item is opened", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const shiftPlanTrigger = screen.getByRole("button", {
      name: /faq.items.shiftPlan.question/i,
    });
    await user.click(shiftPlanTrigger);

    expect(
      screen.getByText(/faq.items.shiftPlan.easy/i)
    ).toBeInTheDocument();
  });
});
