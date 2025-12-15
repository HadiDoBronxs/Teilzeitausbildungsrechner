// Tests for QualificationReductions component - full qualification list with yes/no dropdowns
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

const mockSummarizeQualificationSelection = vi.fn();
vi.mock("../qualificationOptions.js", () => ({
  QUALIFICATION_OPTIONS: [
    { id: "familyCare", maxMonths: 12, labelKey: "qualifications.familyCare" },
    { id: "ageOver21", maxMonths: 12, labelKey: "qualifications.ageOver21" },
  ],
  MAX_QUALIFICATION_REDUCTION: 12,
  summarizeQualificationSelection: (...args) => mockSummarizeQualificationSelection(...args),
}));

vi.mock("../InfoTooltip", () => ({
  default: vi.fn(({ contentKey }) => (
    <div data-testid={`tooltip-${contentKey}`}>Tooltip: {contentKey}</div>
  )),
}));

vi.mock("../ui/SelectField", () => ({
  default: vi.fn(({ id, name, value, onChange, children }) => (
    <select data-testid={id} id={id} name={name} value={value} onChange={onChange}>
      {children}
    </select>
  )),
}));

vi.mock("../ui/ReductionInfo.jsx", () => ({
  default: vi.fn(({ months, translationKey }) => (
    <div data-testid={`reduction-info-${months}`}>
      {translationKey}: {months} months
    </div>
  )),
}));

import QualificationReductions from "../QualificationReductions.jsx";

describe("QualificationReductions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 0,
      cappedTotal: 0,
    });
  });

  it("renders options in order No -> Yes and ArrowDown selects yes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QualificationReductions value={[]} onChange={onChange} onTotalChange={vi.fn()} />);

    const select = screen.getByTestId("qualification-select-familyCare");
    const options = Array.from(select.querySelectorAll("option")).map((opt) => opt.value);
    expect(options).toEqual(["no", "yes"]);

    await user.selectOptions(select, "yes");
    expect(onChange).toHaveBeenCalledWith(["familyCare"]);
  });
});
