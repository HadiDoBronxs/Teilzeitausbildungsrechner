// Tests for App component routing logic
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectCurrentRoute } from "../utils/routing.js";

describe("detectCurrentRoute", () => {
  // Store original location
  let originalLocation;

  beforeEach(() => {
    // Ensure window exists (create if it doesn't)
    if (!global.window) {
      global.window = {};
    }

    // Store original location if it exists
    originalLocation = global.window.location;

    // Create a fresh location object for each test
    global.window.location = {
      pathname: "/",
      hash: "",
    };
  });

  afterEach(() => {
    // Restore original location if it existed
    if (originalLocation) {
      global.window.location = originalLocation;
    } else {
      delete global.window.location;
    }
  });

  describe("Server-side rendering (window undefined)", () => {
    it("returns 'welcome' when window is undefined", () => {
      // Temporarily remove window object to simulate SSR
      const windowBackup = global.window;
      delete global.window;

      const result = detectCurrentRoute();

      expect(result).toBe("welcome");

      // Restore window
      global.window = windowBackup;
    });
  });

  describe("Pathname-based routes (legacy support)", () => {
    it("returns 'transparenz' when pathname starts with /transparenz", () => {
      global.window.location.pathname = "/transparenz";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("transparenz");
    });

    it("returns 'transparenz' when pathname is /transparenz with additional path", () => {
      global.window.location.pathname = "/transparenz/some/path";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("transparenz");
    });

    it("returns 'legal' when pathname starts with /legal", () => {
      global.window.location.pathname = "/legal";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("legal");
    });

    it("returns 'legal' when pathname is /legal with additional path", () => {
      global.window.location.pathname = "/legal/some/path";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("legal");
    });

    it("prioritizes pathname over hash when both are present", () => {
      global.window.location.pathname = "/transparenz";
      global.window.location.hash = "#compact";

      const result = detectCurrentRoute();

      // Pathname should take precedence
      expect(result).toBe("transparenz");
    });
  });

  describe("Hash-based routes", () => {
    it("returns 'compact' when hash is #compact", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "#compact";

      const result = detectCurrentRoute();

      expect(result).toBe("compact");
    });

    it("returns 'tour' when hash is #tour", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "#tour";

      const result = detectCurrentRoute();

      expect(result).toBe("tour");
    });

    it("handles hash without # prefix correctly", () => {
      // The function uses slice(1) to remove '#', so we test with '#'
      global.window.location.pathname = "/";
      global.window.location.hash = "#compact";

      const result = detectCurrentRoute();

      expect(result).toBe("compact");
    });

    it("ignores unknown hash values", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "#unknown";

      const result = detectCurrentRoute();

      // Should fall back to default
      expect(result).toBe("welcome");
    });
  });

  describe("Default fallback", () => {
    it("returns 'welcome' when no pathname or hash route matches", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("welcome");
    });

    it("returns 'welcome' when pathname is root and hash is empty", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("welcome");
    });

    it("returns 'welcome' when pathname is unknown and hash is empty", () => {
      global.window.location.pathname = "/some/unknown/path";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("welcome");
    });
  });

  describe("Route priority order", () => {
    it("checks pathname before hash (priority order)", () => {
      // Even with hash present, pathname should win
      global.window.location.pathname = "/legal";
      global.window.location.hash = "#tour";

      const result = detectCurrentRoute();

      expect(result).toBe("legal");
    });

    it("checks hash when pathname doesn't match legacy routes", () => {
      global.window.location.pathname = "/some/other/path";
      global.window.location.hash = "#compact";

      const result = detectCurrentRoute();

      expect(result).toBe("compact");
    });

    it("falls back to welcome when neither pathname nor hash match", () => {
      global.window.location.pathname = "/some/other/path";
      global.window.location.hash = "#unknown";

      const result = detectCurrentRoute();

      expect(result).toBe("welcome");
    });
  });

  describe("Edge cases", () => {
    it("handles empty hash string", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      expect(result).toBe("welcome");
    });

    it("handles hash with only # character", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "#";

      const result = detectCurrentRoute();

      // slice(1) on "#" gives "", which doesn't match any route
      expect(result).toBe("welcome");
    });

    it("handles pathname that partially matches (should not match)", () => {
      global.window.location.pathname = "/transparenz-something";
      global.window.location.hash = "";

      const result = detectCurrentRoute();

      // startsWith should match this
      expect(result).toBe("transparenz");
    });

    it("handles case-sensitive hash matching", () => {
      global.window.location.pathname = "/";
      global.window.location.hash = "#COMPACT"; // uppercase

      const result = detectCurrentRoute();

      // Should be case-sensitive, so doesn't match "compact"
      expect(result).toBe("welcome");
    });
  });
});
