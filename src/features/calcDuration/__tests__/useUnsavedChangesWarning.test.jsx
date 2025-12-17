// Tests for useUnsavedChangesWarning hook - browser warning for unsaved form changes
import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useUnsavedChangesWarning } from "../useUnsavedChangesWarning.js";

// Test component that uses the hook
function TestComponent({ formState }) {
  useUnsavedChangesWarning(formState);
  return <div data-testid="test-component">Test</div>;
}

describe("useUnsavedChangesWarning", () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let preventDefaultSpy;

  beforeEach(() => {
    // Spy on window.addEventListener and removeEventListener
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    preventDefaultSpy = vi.fn();

    // Mock beforeunload event
    global.beforeunloadEvent = {
      preventDefault: preventDefaultSpy,
      returnValue: "",
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when form is at default values", () => {
    it("should not add beforeunload listener for compact mode defaults", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            qualificationSelection: [],
          }}
        />
      );

      // Should not add listener when all values are defaults
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      unmount();
    });

    it("should not add beforeunload listener for tour mode defaults", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            wantsReduction: "no",
            manualReductionMonths: 0,
            academicQualification: false,
            otherQualificationSelection: [],
            attendedUniversity: null,
            hasEcts: null,
          }}
        />
      );

      expect(addEventListenerSpy).not.toHaveBeenCalled();
      unmount();
    });

    it("should not add listener when formState is empty", () => {
      const { unmount } = render(<TestComponent formState={{}} />);

      expect(addEventListenerSpy).not.toHaveBeenCalled();
      unmount();
    });
  });

  describe("when form has unsaved changes (compact mode)", () => {
    it("should add beforeunload listener when fulltimeHours changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 42, // Changed from default 40
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            qualificationSelection: [],
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when parttimeHours changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 25, // Changed from default 30
            fullDurationMonths: 36,
            schoolDegreeId: null,
            qualificationSelection: [],
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when parttimeHours is undefined (cleared)", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: undefined, // Cleared (different from default 30)
            fullDurationMonths: 36,
            schoolDegreeId: null,
            qualificationSelection: [],
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when fullDurationMonths changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 48, // Changed from default 36
            schoolDegreeId: null,
            qualificationSelection: [],
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when schoolDegreeId changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: "hs", // Changed from default null
            qualificationSelection: [],
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when qualificationSelection changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            qualificationSelection: ["academic"], // Changed from default []
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });
  });

  describe("when form has unsaved changes (tour mode)", () => {
    it("should add beforeunload listener when wantsReduction changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            wantsReduction: "yes", // Changed from default "no"
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when manualReductionMonths changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            wantsReduction: "no",
            manualReductionMonths: 6, // Changed from default 0
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when academicQualification changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            wantsReduction: "no",
            academicQualification: true, // Changed from default false
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when otherQualificationSelection changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            wantsReduction: "no",
            otherQualificationSelection: ["master"], // Changed from default []
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when attendedUniversity changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            wantsReduction: "no",
            attendedUniversity: "yes", // Changed from default null
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should add beforeunload listener when hasEcts changes", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            wantsReduction: "no",
            hasEcts: "yes", // Changed from default null
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });
  });

  describe("beforeunload event handler behavior", () => {
    it("should call preventDefault and set returnValue when event fires", () => {
      render(
        <TestComponent
          formState={{
            fulltimeHours: 42, // Changed value
          }}
        />
      );

      // Get the handler that was registered
      const handlerCall = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "beforeunload"
      );
      expect(handlerCall).toBeDefined();

      const handler = handlerCall[1];
      const mockEvent = {
        preventDefault: preventDefaultSpy,
        returnValue: "",
      };

      const returnValue = handler(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockEvent.returnValue).toBe("");
      expect(returnValue).toBe("");
    });
  });

  describe("event listener cleanup", () => {
    it("should remove beforeunload listener when component unmounts", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 42, // Changed value
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });

    it("should remove listener when form returns to defaults", () => {
      const { rerender } = render(
        <TestComponent
          formState={{
            fulltimeHours: 42, // Changed value
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );

      // Reset to defaults
      rerender(
        <TestComponent
          formState={{
            fulltimeHours: 40, // Back to default
          }}
        />
      );

      // Listener should be removed when no unsaved changes
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });
  });

  describe("edge cases", () => {
    it("should handle partial formState (only some fields provided)", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 42, // Only this field provided
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });

    it("should not trigger warning for fields not provided in formState", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            // parttimeHours not provided, so undefined from destructuring
            // Should not trigger warning because field wasn't provided
            fulltimeHours: 40,
            fullDurationMonths: 36,
          }}
        />
      );

      // Should not add listener since only provided fields are checked
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      unmount();
    });

    it("should handle empty qualificationSelection array correctly", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 40,
            parttimeHours: 30,
            fullDurationMonths: 36,
            schoolDegreeId: null,
            qualificationSelection: [], // Empty array (default)
          }}
        />
      );

      expect(addEventListenerSpy).not.toHaveBeenCalled();
      unmount();
    });

    it("should handle multiple changed fields", () => {
      const { unmount } = render(
        <TestComponent
          formState={{
            fulltimeHours: 42,
            parttimeHours: 25,
            fullDurationMonths: 48,
            schoolDegreeId: "hs",
            qualificationSelection: ["academic"],
          }}
        />
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      unmount();
    });
  });
});
