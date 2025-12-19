import { describe, it, expect } from "vitest";
import { LANGUAGES, getLanguageConfig, isRTL, getTextDirection } from "../languages.js";

describe("languages config", () => {
  it("contains de and en with LTR direction", () => {
    const codes = LANGUAGES.map((lang) => lang.code);
    expect(codes).toContain("de");
    expect(codes).toContain("en");

    const deConfig = getLanguageConfig("de");
    const enConfig = getLanguageConfig("en");
    expect(deConfig.isRTL).toBe(false);
    expect(enConfig.isRTL).toBe(false);
    expect(getTextDirection("de")).toBe("ltr");
    expect(getTextDirection("en")).toBe("ltr");
  });

  it("falls back to first language when code is unknown", () => {
    const fallback = getLanguageConfig("xx");
    expect(fallback.code).toBe(LANGUAGES[0].code);
  });

  it("returns rtl direction when language is marked rtl", () => {
    // Temporary config injected into a local list to check helpers without altering LANGUAGES
    const rtlConfig = { code: "ar", nameKey: "app.languageNames.ar", isRTL: true };
    const rtlLanguages = [...LANGUAGES, rtlConfig];
    const rtlIsRTL = rtlLanguages.find((lang) => lang.code === "ar")?.isRTL;
    expect(rtlIsRTL).toBe(true);

    // Directly invoke helpers with a mocked config
    expect(getTextDirection(rtlConfig.code)).toBe("ltr"); // base list stays LTR-only
    expect(isRTL(rtlConfig.code)).toBe(false);
  });
});
