// Tests for TourTabs component - tab navigation for guided tour
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

import TourTabs from "../TourTabs.jsx";

describe("TourTabs", () => {
  const defaultProps = {
    activeTab: "inputs",
    onTabChange: vi.fn(),
    wantsReduction: "yes",
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render tablist with correct ARIA attributes", () => {
    render(<TourTabs {...defaultProps} />);

    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute("aria-label", "tour.tabs.inputs");
  });

  it("should render all tabs when wantsReduction is 'yes'", () => {
    render(<TourTabs {...defaultProps} wantsReduction="yes" />);

    expect(screen.getByRole("tab", { name: /tour.tabs.inputs/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tour.tabs.education/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tour.tabs.reductions/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tour.tabs.results/i })).toBeInTheDocument();
  });

  it("should hide education and reductions tabs when wantsReduction is 'no'", () => {
    render(<TourTabs {...defaultProps} wantsReduction="no" />);

    expect(screen.getByRole("tab", { name: /tour.tabs.inputs/i })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /tour.tabs.education/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /tour.tabs.reductions/i })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tour.tabs.results/i })).toBeInTheDocument();
  });

  it("should mark active tab with aria-selected='true'", () => {
    render(<TourTabs {...defaultProps} activeTab="education" />);

    const activeTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
  });

  it("should mark inactive tabs with aria-selected='false'", () => {
    render(<TourTabs {...defaultProps} activeTab="inputs" />);

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    expect(educationTab).toHaveAttribute("aria-selected", "false");
  });

  it("should call onTabChange when tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} onTabChange={onTabChange} />);

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    fireEvent.click(educationTab);

    expect(onTabChange).toHaveBeenCalledWith("education");
  });

  it("should not call onTabChange when tabs are disabled", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} onTabChange={onTabChange} disabled={true} />);

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    fireEvent.click(educationTab);

    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("should disable tabs when disabled prop is true", () => {
    render(<TourTabs {...defaultProps} disabled={true} />);

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab).toBeDisabled();
    });
  });

  it("should enable tabs when disabled prop is false", () => {
    render(<TourTabs {...defaultProps} disabled={false} />);

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab).not.toBeDisabled();
    });
  });

  it("should navigate to previous tab with ArrowLeft key", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} activeTab="education" onTabChange={onTabChange} />);

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    fireEvent.keyDown(educationTab, { key: "ArrowLeft" });

    expect(onTabChange).toHaveBeenCalledWith("inputs");
  });

  it("should wrap to last tab when ArrowLeft is pressed on first tab", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} activeTab="inputs" onTabChange={onTabChange} />);

    const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/i });
    fireEvent.keyDown(inputsTab, { key: "ArrowLeft" });

    expect(onTabChange).toHaveBeenCalledWith("results");
  });

  it("should navigate to next tab with ArrowRight key", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} activeTab="inputs" onTabChange={onTabChange} />);

    const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/i });
    fireEvent.keyDown(inputsTab, { key: "ArrowRight" });

    expect(onTabChange).toHaveBeenCalledWith("education");
  });

  it("should wrap to first tab when ArrowRight is pressed on last tab", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} activeTab="results" onTabChange={onTabChange} />);

    const resultsTab = screen.getByRole("tab", { name: /tour.tabs.results/i });
    fireEvent.keyDown(resultsTab, { key: "ArrowRight" });

    expect(onTabChange).toHaveBeenCalledWith("inputs");
  });

  it("should activate tab with Enter key", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} activeTab="inputs" onTabChange={onTabChange} />);

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    fireEvent.keyDown(educationTab, { key: "Enter" });

    expect(onTabChange).toHaveBeenCalledWith("education");
  });

  it("should activate tab with Space key", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} activeTab="inputs" onTabChange={onTabChange} />);

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    fireEvent.keyDown(educationTab, { key: " " });

    expect(onTabChange).toHaveBeenCalledWith("education");
  });

  it("should not handle other keys", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} activeTab="inputs" onTabChange={onTabChange} />);

    const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/i });
    fireEvent.keyDown(inputsTab, { key: "a" });

    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("should not handle keyboard navigation when disabled", () => {
    const onTabChange = vi.fn();
    render(<TourTabs {...defaultProps} disabled={true} onTabChange={onTabChange} />);

    const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/i });
    fireEvent.keyDown(inputsTab, { key: "ArrowRight" });

    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("should handle keyboard navigation correctly when wantsReduction is 'no'", () => {
    const onTabChange = vi.fn();
    render(
      <TourTabs
        {...defaultProps}
        wantsReduction="no"
        activeTab="inputs"
        onTabChange={onTabChange}
      />
    );

    const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/i });
    fireEvent.keyDown(inputsTab, { key: "ArrowRight" });

    expect(onTabChange).toHaveBeenCalledWith("results");
  });

  it("should set correct aria-controls for each tab", () => {
    render(<TourTabs {...defaultProps} />);

    const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/i });
    expect(inputsTab).toHaveAttribute("aria-controls", "tabpanel-inputs");

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    expect(educationTab).toHaveAttribute("aria-controls", "tabpanel-education");
  });

  it("should set correct id for each tab", () => {
    render(<TourTabs {...defaultProps} />);

    // In test environments, mobile tabs are rendered (matchMedia not available)
    // Mobile tabs use tab-mobile-{tabId} format
    const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/i });
    expect(inputsTab).toHaveAttribute("id", "tab-mobile-inputs");

    const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/i });
    expect(educationTab).toHaveAttribute("id", "tab-mobile-education");
  });

  it("should handle null wantsReduction", () => {
    render(<TourTabs {...defaultProps} wantsReduction={null} />);

    expect(screen.getByRole("tab", { name: /tour.tabs.inputs/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tour.tabs.education/i })).toBeInTheDocument();
  });
});
