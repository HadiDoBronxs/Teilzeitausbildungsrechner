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
});
