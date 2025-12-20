// Tests for InputsTab component - first tab of guided tour
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

// Mock input components
vi.mock("../../components/FulltimeHoursInput.jsx", () => ({
  default: vi.fn(({ onValueChange }) => (
    <div data-testid="fulltime-input">
      <input
        type="number"
        data-testid="fulltime-hours-input"
        onChange={(e) => onValueChange?.(e.target.value)}
      />
    </div>
  )),
}));

vi.mock("../../components/ParttimeHoursInput.jsx", () => ({
  default: vi.fn(({ onValueChange }) => (
    <div data-testid="parttime-input">
      <input
        type="number"
        data-testid="parttime-hours-input"
        onChange={(e) => onValueChange?.(e.target.value)}
      />
    </div>
  )),
}));

vi.mock("../../components/RegularDurationInput.jsx", () => ({
  default: vi.fn(({ onValueChange }) => (
    <div data-testid="duration-input">
      <input
        type="number"
        data-testid="duration-months-input"
        onChange={(e) => onValueChange?.(e.target.value)}
      />
    </div>
  )),
}));

import InputsTab from "../tour/InputsTab.jsx";

describe("InputsTab - Next Button Disabled State", () => {
  const defaultProps = {
    fulltimeHours: 40,
    parttimeHours: 30,
    onFulltimeChange: vi.fn(),
    onParttimeChange: vi.fn(),
    onDurationChange: vi.fn(),
    wantsReduction: "no",
    onWantsReductionChange: vi.fn(),
    onNext: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should disable Next button when isDisabled is true", () => {
    render(<InputsTab {...defaultProps} isDisabled={true} />);

    const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).toBeDisabled();
  });

  it("should enable Next button when isDisabled is false", () => {
    render(<InputsTab {...defaultProps} isDisabled={false} />);

    const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).not.toBeDisabled();
  });

  it("should not call onNext when Next button is disabled and clicked", () => {
    const onNext = vi.fn();
    render(<InputsTab {...defaultProps} isDisabled={true} onNext={onNext} />);

    const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).toBeDisabled();

    // Disabled buttons shouldn't fire click events, but test the behavior
    fireEvent.click(nextButton);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("should call onNext when Next button is enabled and clicked", () => {
    const onNext = vi.fn();
    render(<InputsTab {...defaultProps} isDisabled={false} onNext={onNext} />);

    const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("should default isDisabled to false when not provided", () => {
    render(<InputsTab {...defaultProps} />);

    const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).not.toBeDisabled();
  });

  it("should reflect isDisabled prop changes", () => {
    const { rerender } = render(<InputsTab {...defaultProps} isDisabled={false} />);

    let nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).not.toBeDisabled();

    // Update to disabled
    rerender(<InputsTab {...defaultProps} isDisabled={true} />);
    nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).toBeDisabled();

    // Update back to enabled
    rerender(<InputsTab {...defaultProps} isDisabled={false} />);
    nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
    expect(nextButton).not.toBeDisabled();
  });
});

describe("InputsTab - Reduce Training Select", () => {
  const defaultProps = {
    fulltimeHours: 40,
    parttimeHours: 30,
    onFulltimeChange: vi.fn(),
    onParttimeChange: vi.fn(),
    onDurationChange: vi.fn(),
    wantsReduction: "no",
    onWantsReductionChange: vi.fn(),
    onNext: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call onWantsReductionChange when select value changes to 'yes'", () => {
    const onWantsReductionChange = vi.fn();
    render(<InputsTab {...defaultProps} onWantsReductionChange={onWantsReductionChange} />);

    const select = screen.getByLabelText(/tour.reduceTraining.question/i);
    fireEvent.change(select, { target: { value: "yes" } });

    expect(onWantsReductionChange).toHaveBeenCalledWith("yes");
    expect(onWantsReductionChange).toHaveBeenCalledTimes(1);
  });

  it("should call onWantsReductionChange when select value changes to 'i-dont-know'", () => {
    const onWantsReductionChange = vi.fn();
    render(<InputsTab {...defaultProps} onWantsReductionChange={onWantsReductionChange} />);

    const select = screen.getByLabelText(/tour.reduceTraining.question/i);
    fireEvent.change(select, { target: { value: "i-dont-know" } });

    expect(onWantsReductionChange).toHaveBeenCalledWith("i-dont-know");
    expect(onWantsReductionChange).toHaveBeenCalledTimes(1);
  });

  it("should call onWantsReductionChange when select value changes back to 'no'", () => {
    const onWantsReductionChange = vi.fn();
    render(
      <InputsTab
        {...defaultProps}
        wantsReduction="yes"
        onWantsReductionChange={onWantsReductionChange}
      />
    );

    const select = screen.getByLabelText(/tour.reduceTraining.question/i);
    fireEvent.change(select, { target: { value: "no" } });

    expect(onWantsReductionChange).toHaveBeenCalledWith("no");
    expect(onWantsReductionChange).toHaveBeenCalledTimes(1);
  });

  it("should not throw error when onWantsReductionChange is undefined", () => {
    // Test optional chaining on line 69 - should not throw when handler is undefined
    const propsWithoutHandler = {
      ...defaultProps,
      onWantsReductionChange: undefined,
    };

    expect(() => {
      render(<InputsTab {...propsWithoutHandler} />);
    }).not.toThrow();

    const select = screen.getByLabelText(/tour.reduceTraining.question/i);
    
    // Changing the select should not throw even without handler (tests optional chaining)
    expect(() => {
      fireEvent.change(select, { target: { value: "yes" } });
    }).not.toThrow();
  });

  it("should display the current wantsReduction value", () => {
    render(<InputsTab {...defaultProps} wantsReduction="yes" />);

    const select = screen.getByLabelText(/tour.reduceTraining.question/i);
    expect(select).toHaveValue("yes");
  });

  it("should render all three option values", () => {
    render(<InputsTab {...defaultProps} />);

    const select = screen.getByLabelText(/tour.reduceTraining.question/i);
    const options = Array.from(select.querySelectorAll("option"));

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue("no");
    expect(options[1]).toHaveValue("yes");
    expect(options[2]).toHaveValue("i-dont-know");
  });
});
