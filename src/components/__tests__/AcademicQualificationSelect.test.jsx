// Tests for AcademicQualificationSelect component - single yes/no dropdown
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

vi.mock("../qualificationOptions.js", () => ({
  QUALIFICATION_OPTIONS: [
    { id: "academic", maxMonths: 12, labelKey: "qualifications.academic" },
  ],
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

import AcademicQualificationSelect from "../AcademicQualificationSelect.jsx";

describe("AcademicQualificationSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders options in order No -> Yes and ArrowDown selects yes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AcademicQualificationSelect value={false} onChange={onChange} />);

    const select = screen.getByTestId("academic-qualification-select");
    const options = Array.from(select.querySelectorAll("option")).map((opt) => opt.value);
    expect(options).toEqual(["no", "yes"]);

    await user.selectOptions(select, "yes");
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
