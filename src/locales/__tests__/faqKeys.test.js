import { describe, it, expect } from "vitest";
import de from "../de/translation.json";
import en from "../en/translation.json";

const CATEGORY_KEYS = ["calculation", "rules", "practice", "technical", "legal"];
const ITEM_KEYS = [
  "calcHow",
  "rule50",
  "adjustHours",
  "invalid",
  "below50",
  "capReduction",
  "shiftPlan",
  "hoursChange",
  "saveData",
  "pdfIssue",
  "binding",
  "whoDecides",
];

function expectItemShape(locale, key) {
  const item = locale.faq.items[key];
  expect(item, `Missing item ${key}`).toBeDefined();
  expect(item.question, `Missing question for ${key}`).toBeTruthy();
  expect(item.answer, `Missing answer for ${key}`).toBeTruthy();
  expect(item.easy, `Missing easy text for ${key}`).toBeTruthy();
}

describe("FAQ i18n keys", () => {
  it("de locale has all categories and items with easy text", () => {
    CATEGORY_KEYS.forEach((cat) =>
      expect(de.faq.categories[cat], `Missing category ${cat} in de`).toBeTruthy()
    );
    ITEM_KEYS.forEach((key) => expectItemShape(de, key));
  });

  it("en locale has all categories and items with easy text", () => {
    CATEGORY_KEYS.forEach((cat) =>
      expect(en.faq.categories[cat], `Missing category ${cat} in en`).toBeTruthy()
    );
    ITEM_KEYS.forEach((key) => expectItemShape(en, key));
  });
});
