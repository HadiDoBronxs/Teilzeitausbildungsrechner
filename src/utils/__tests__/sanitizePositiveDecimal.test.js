import { describe, it, expect } from "vitest";
import {
  sanitizePositiveDecimal,
  toNumberOrEmpty,
} from "../sanitizePositiveDecimal.js";

describe("sanitizePositiveDecimal", () => {
  describe("invalid single characters", () => {
    it("rejects single letter 'e'", () => {
      const result = sanitizePositiveDecimal("e");
      expect(result.ok).toBe(false);
      expect(result.text).toBe("");
    });

    it("rejects single letter 'a'", () => {
      const result = sanitizePositiveDecimal("a");
      expect(result.ok).toBe(false);
      expect(result.text).toBe("");
    });

    it("rejects single symbol '+'", () => {
      const result = sanitizePositiveDecimal("+");
      expect(result.ok).toBe(false);
      expect(result.text).toBe("");
    });

    it("rejects single symbol '-'", () => {
      const result = sanitizePositiveDecimal("-");
      expect(result.ok).toBe(false);
      expect(result.text).toBe("");
    });

    it("rejects single symbol '*'", () => {
      const result = sanitizePositiveDecimal("*");
      expect(result.ok).toBe(false);
      expect(result.text).toBe("");
    });
  });

  describe("invalid characters appended to valid numbers", () => {
    it("strips 'e' from '20e' and returns valid '20'", () => {
      const result = sanitizePositiveDecimal("20e");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("20");
    });

    it("strips 'a' from '10a' and returns valid '10'", () => {
      const result = sanitizePositiveDecimal("10a");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("10");
    });

    it("strips '+' from '40+' and returns valid '40'", () => {
      const result = sanitizePositiveDecimal("40+");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40");
    });

    it("strips '-' from '30-' and returns valid '30'", () => {
      const result = sanitizePositiveDecimal("30-");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("30");
    });

    it("strips 'abc' from '50abc' and returns valid '50'", () => {
      const result = sanitizePositiveDecimal("50abc");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("50");
    });

    it("strips invalid characters from '40.5e' and returns valid '40.5'", () => {
      const result = sanitizePositiveDecimal("40.5e");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.5");
    });
  });

  describe("valid numeric input", () => {
    it("accepts integer '20'", () => {
      const result = sanitizePositiveDecimal("20");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("20");
    });

    it("accepts decimal '40.5'", () => {
      const result = sanitizePositiveDecimal("40.5");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.5");
    });

    it("accepts decimal with comma '40,5' and normalizes to dot", () => {
      const result = sanitizePositiveDecimal("40,5");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.5");
    });

    it("accepts number with trailing dot '40.'", () => {
      const result = sanitizePositiveDecimal("40.");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.");
    });

    it("accepts single digit '5'", () => {
      const result = sanitizePositiveDecimal("5");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("5");
    });
  });

  describe("empty input handling", () => {
    it("accepts empty string", () => {
      const result = sanitizePositiveDecimal("");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("");
    });

    it("accepts null", () => {
      const result = sanitizePositiveDecimal(null);
      expect(result.ok).toBe(true);
      expect(result.text).toBe("");
    });

    it("accepts undefined", () => {
      const result = sanitizePositiveDecimal(undefined);
      expect(result.ok).toBe(true);
      expect(result.text).toBe("");
    });

    it("accepts whitespace-only string", () => {
      const result = sanitizePositiveDecimal("   ");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("");
    });
  });

  describe("comma normalization", () => {
    it("normalizes '4,3' to '4.3'", () => {
      const result = sanitizePositiveDecimal("4,3");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("4.3");
    });

    it("normalizes '10,5' to '10.5'", () => {
      const result = sanitizePositiveDecimal("10,5");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("10.5");
    });

    it("handles multiple commas by keeping only first dot", () => {
      const result = sanitizePositiveDecimal("10,5,3");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("10.5");
    });
  });

  describe("decimal place limiting", () => {
    it("limits to one decimal place '40.5'", () => {
      const result = sanitizePositiveDecimal("40.5");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.5");
    });

    it("truncates '40.55' to '40.5'", () => {
      const result = sanitizePositiveDecimal("40.55");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.5");
    });

    it("truncates '40.999' to '40.9'", () => {
      const result = sanitizePositiveDecimal("40.999");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.9");
    });
  });

  describe("edge cases", () => {
    it("handles numeric input type", () => {
      const result = sanitizePositiveDecimal(40.5);
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.5");
    });

    it("handles numeric integer input", () => {
      const result = sanitizePositiveDecimal(40);
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40");
    });

    it("removes all non-digit/non-dot characters", () => {
      const result = sanitizePositiveDecimal("40abc5def");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("405");
    });

    it("handles multiple dots by keeping only first", () => {
      const result = sanitizePositiveDecimal("40.5.3");
      expect(result.ok).toBe(true);
      expect(result.text).toBe("40.5");
    });

    it("rejects input starting with dot", () => {
      const result = sanitizePositiveDecimal(".5");
      expect(result.ok).toBe(false);
      expect(result.text).toBe("");
    });

    it("rejects input with only dots", () => {
      const result = sanitizePositiveDecimal("...");
      expect(result.ok).toBe(false);
      expect(result.text).toBe("");
    });
  });
});

describe("toNumberOrEmpty", () => {
  it("returns empty string for empty input", () => {
    expect(toNumberOrEmpty("")).toBe("");
  });

  it("preserves intermediate state '40.'", () => {
    expect(toNumberOrEmpty("40.")).toBe("40.");
  });

  it("converts valid decimal '40.5' to number", () => {
    expect(toNumberOrEmpty("40.5")).toBe(40.5);
  });

  it("converts valid integer '40' to number", () => {
    expect(toNumberOrEmpty("40")).toBe(40);
  });

  it("returns empty string for invalid input", () => {
    expect(toNumberOrEmpty("abc")).toBe("");
  });

  it("handles '0' correctly", () => {
    expect(toNumberOrEmpty("0")).toBe(0);
  });

  it("handles '0.' correctly", () => {
    expect(toNumberOrEmpty("0.")).toBe("0.");
  });
});
