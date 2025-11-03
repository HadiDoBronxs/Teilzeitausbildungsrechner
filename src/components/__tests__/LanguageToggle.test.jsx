import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../LanguageToggle";

// Mock react-i18next
const mockChangeLanguage = vi.fn();
const mockI18n = {
  language: "de",
  changeLanguage: mockChangeLanguage,
};

const mockT = (key, opts) => {
  // Handle error messages from other components
  if (key === "fulltimeHours.error") {
    return `ERR ${opts?.min}-${opts?.max}`;
  }
  if (key === "parttimeHours.error") {
    return `ERR ${opts?.min}-${opts?.max}`;
  }
  if (key === "regularDuration.error") {
    return `ERR ${opts?.min}-${opts?.max}`;
  }
  
  // Handle language toggle translations
  const translations = {
    "app.languages": "Language",
    "app.languageNames.de": "German",
    "app.languageNames.en": "English",
    "app.languageNames.ar": "Arabic",
  };
  return translations[key] || key;
};

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: mockT,
    i18n: mockI18n,
  })),
}));

// Mock languages.js to include an RTL language for testing
vi.mock("../../i18n/languages.js", () => ({
  LANGUAGES: [
    {
      code: "de",
      nameKey: "app.languageNames.de",
      isRTL: false,
    },
    {
      code: "en",
      nameKey: "app.languageNames.en",
      isRTL: false,
    },
    {
      code: "ar",
      nameKey: "app.languageNames.ar",
      isRTL: true,
    },
  ],
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockI18n.language = "de";
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      i18n: mockI18n,
    });
  });

  it("renders with current language (German)", () => {
    mockI18n.language = "de";
    render(<LanguageToggle />);

    expect(screen.getByText("Language:")).toBeInTheDocument();
    expect(screen.getByText("German")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("German");
  });

  it("renders with current language (English)", () => {
    mockI18n.language = "en";
    render(<LanguageToggle />);

    expect(screen.getByText("Language:")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("English");
  });

  it("changes language from German to English when clicked", async () => {
    mockI18n.language = "de";
    const user = userEvent.setup();
    render(<LanguageToggle />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    expect(mockChangeLanguage).toHaveBeenCalledWith("en");
  });

  it("changes language from English to Arabic when clicked (with mocked array including RTL)", async () => {
    mockI18n.language = "en";
    const user = userEvent.setup();
    render(<LanguageToggle />);

    const button = screen.getByRole("button");
    await user.click(button);

    // With the mocked array [de, en, ar], clicking from "en" goes to "ar"
    expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
  });

  it("includes proper aria-label on button", () => {
    mockI18n.language = "de";
    render(<LanguageToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Switch to next language, currently German"
    );
  });

  it("updates aria-label when language changes", () => {
    mockI18n.language = "en";
    render(<LanguageToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Switch to next language, currently English"
    );
  });

  describe("RTL language support", () => {
    it("renders with RTL language (Arabic)", () => {
      mockI18n.language = "ar";
      render(<LanguageToggle />);

      expect(screen.getByText("Language:")).toBeInTheDocument();
      expect(screen.getByText("Arabic")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveTextContent("Arabic");
    });

    it("changes language from English to RTL language (Arabic) when clicked", async () => {
      mockI18n.language = "en";
      const user = userEvent.setup();
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
    });

    it("cycles from RTL language (Arabic) back to LTR language (German)", async () => {
      mockI18n.language = "ar";
      const user = userEvent.setup();
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      expect(mockChangeLanguage).toHaveBeenCalledWith("de");
    });

    it("includes proper aria-label for RTL language", () => {
      mockI18n.language = "ar";
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "aria-label",
        "Switch to next language, currently Arabic"
      );
    });

    it("cycles through all languages: de -> en -> ar -> de", async () => {
      mockI18n.language = "de";
      const user = userEvent.setup();
      const { rerender } = render(<LanguageToggle />);

      const button = screen.getByRole("button");
      
      // First click: de -> en
      await user.click(button);
      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      
      // Update mock state and rerender to simulate language change
      mockI18n.language = "en";
      mockChangeLanguage.mockClear();
      rerender(<LanguageToggle />);

      // Second click: en -> ar
      await user.click(button);
      expect(mockChangeLanguage).toHaveBeenCalledWith("ar");
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      
      // Update mock state and rerender
      mockI18n.language = "ar";
      mockChangeLanguage.mockClear();
      rerender(<LanguageToggle />);

      // Third click: ar -> de (cycles back)
      await user.click(button);
      expect(mockChangeLanguage).toHaveBeenCalledWith("de");
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    });
  });
});

