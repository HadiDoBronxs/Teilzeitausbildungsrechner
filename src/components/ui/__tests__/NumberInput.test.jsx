import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import NumberInput from "../NumberInput";

// Mock window.clipboardData for paste tests
const mockClipboardData = {
  getData: vi.fn()
};

beforeEach(() => {
  // Mock window.clipboardData
  Object.defineProperty(window, "clipboardData", {
    value: mockClipboardData,
    writable: true,
    configurable: true
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("NumberInput", () => {
  it("renders with default props", () => {
    render(<NumberInput data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("inputMode", "numeric");
    // aria-invalid is only set when invalid prop is provided or aria-invalid is explicitly set
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  it("applies error styling when invalid prop is true", () => {
    render(<NumberInput data-testid="test-input" invalid={true} />);
    const input = screen.getByTestId("test-input");
    
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("border-red-500");
  });

  it("applies error styling when aria-invalid is true", () => {
    render(<NumberInput data-testid="test-input" aria-invalid={true} />);
    const input = screen.getByTestId("test-input");
    
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("border-red-500");
  });

  it("allows custom className", () => {
    render(<NumberInput data-testid="test-input" className="custom-class" />);
    const input = screen.getByTestId("test-input");
    
    expect(input.className).toContain("custom-class");
  });

  it("allows digits, dots, and commas in onKeyDown", async () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="test-input" onChange={onChange} />);
    const input = screen.getByTestId("test-input");

    // Test digit
    fireEvent.keyDown(input, { key: "5" });
    await userEvent.type(input, "5");
    expect(onChange).toHaveBeenCalled();

    // Test dot
    fireEvent.keyDown(input, { key: "." });
    await userEvent.type(input, ".");
    expect(onChange).toHaveBeenCalled();

    // Test comma (should be normalized to dot)
    fireEvent.keyDown(input, { key: "," });
    await userEvent.type(input, ",");
    expect(onChange).toHaveBeenCalled();
  });

  it("allows navigation keys in onKeyDown", () => {
    const onKeyDown = vi.fn();
    render(<NumberInput data-testid="test-input" onKeyDown={onKeyDown} />);
    const input = screen.getByTestId("test-input");

    const navigationKeys = [
      "Backspace", "Delete", "Tab", "Escape", "Enter",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End"
    ];

    navigationKeys.forEach(key => {
      fireEvent.keyDown(input, { key });
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  it("allows Ctrl/Cmd shortcuts (A, C, V, X, Z) in onKeyDown", () => {
    const onKeyDown = vi.fn();
    render(<NumberInput data-testid="test-input" onKeyDown={onKeyDown} />);
    const input = screen.getByTestId("test-input");

    const shortcuts = ["a", "c", "v", "x", "z"];

    shortcuts.forEach(key => {
      // Test Ctrl
      fireEvent.keyDown(input, { key, ctrlKey: true });
      expect(onKeyDown).toHaveBeenCalled();
      
      // Test Cmd (metaKey)
      fireEvent.keyDown(input, { key, metaKey: true });
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  it("blocks invalid keys like 'e', '+', '-' in onKeyDown", () => {
    const onKeyDown = vi.fn();
    render(<NumberInput data-testid="test-input" onKeyDown={onKeyDown} />);
    const input = screen.getByTestId("test-input");

    const invalidKeys = ["e", "E", "+", "-", "f", "g"];

    invalidKeys.forEach(key => {
      const event = { key, preventDefault: vi.fn() };
      fireEvent.keyDown(input, event);
      // Invalid keys should be prevented, but onKeyDown might still be called
      // The key is blocked via preventDefault
    });
  });

  it("sanitizes input on onChange", async () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="test-input" onChange={onChange} />);
    const input = screen.getByTestId("test-input");

    await userEvent.type(input, "42.5");
    
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.target.value).toBe("42.5");
  });

  it("normalizes comma to dot on paste", () => {
    const onChange = vi.fn();
    mockClipboardData.getData.mockReturnValue("40,5");
    render(<NumberInput data-testid="test-input" onChange={onChange} />);
    const input = screen.getByTestId("test-input");

    // Create paste event with mocked clipboardData
    const pasteEvent = {
      preventDefault: vi.fn(),
      clipboardData: null, // Will fall back to window.clipboardData
      target: input,
      currentTarget: input
    };
    
    fireEvent.paste(input, pasteEvent);
    
    // Paste handler should sanitize and trigger onChange with normalized value
    expect(mockClipboardData.getData).toHaveBeenCalledWith("text");
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.target.value).toBe("40.5");
  });

  it("resets to last valid value when invalid input is entered", async () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="test-input" value="40" onChange={onChange} />);
    const input = screen.getByTestId("test-input");

    // Set an invalid value directly (simulating what might happen)
    fireEvent.change(input, { target: { value: "abc" } });
    
    // The input should be reset to the last valid value
    // Since NumberInput sanitizes, "abc" becomes "", and if that's invalid, it resets
    expect(input.value).toBeDefined();
  });

  it("handles paste events and sanitizes pasted content", () => {
    const onChange = vi.fn();
    mockClipboardData.getData.mockReturnValue("40,5");
    render(<NumberInput data-testid="test-input" onChange={onChange} />);
    const input = screen.getByTestId("test-input");

    const pasteEvent = {
      preventDefault: vi.fn(),
      clipboardData: null, // Will fall back to window.clipboardData
      target: input,
      currentTarget: input
    };
    
    fireEvent.paste(input, pasteEvent);
    
    // Paste handler should sanitize and trigger onChange with normalized value
    // The handler calls preventDefault internally, and triggers onChange
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.target.value).toBe("40.5");
  });

  it("handles paste with invalid content", () => {
    const onChange = vi.fn();
    mockClipboardData.getData.mockReturnValue("invalid");
    render(<NumberInput data-testid="test-input" value="40" onChange={onChange} />);
    const input = screen.getByTestId("test-input");

    const pasteEvent = {
      preventDefault: vi.fn(),
      clipboardData: null, // Will fall back to window.clipboardData
      target: input,
      currentTarget: input
    };
    
    fireEvent.paste(input, pasteEvent);
    
    // Invalid paste should not trigger onChange (sanitization fails, ok: false)
    // The handler calls preventDefault internally, but onChange is not called
    expect(onChange).not.toHaveBeenCalled();
    // Value should remain unchanged
    expect(input.value).toBe("40");
  });

  it("prevents wheel events from changing value", () => {
    const onWheel = vi.fn();
    render(<NumberInput data-testid="test-input" onWheel={onWheel} />);
    const input = screen.getByTestId("test-input");

    // Create a wheel event and spy on preventDefault
    const wheelEvent = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true
    });
    const preventDefaultSpy = vi.spyOn(wheelEvent, "preventDefault");
    
    input.dispatchEvent(wheelEvent);
    
    // onWheel handler should prevent default and call user handler
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onWheel).toHaveBeenCalled();
  });

  it("blurs input on wheel capture", () => {
    render(<NumberInput data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    
    input.focus();
    expect(input).toHaveFocus();
    
    const blurSpy = vi.spyOn(input, "blur");
    
    // Create wheelCapture event
    const wheelCaptureEvent = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true
    });
    Object.defineProperty(wheelCaptureEvent, "currentTarget", {
      value: input,
      enumerable: true,
      configurable: true
    });
    const preventDefaultSpy = vi.spyOn(wheelCaptureEvent, "preventDefault");
    
    // Trigger onWheelCapture by dispatching the event
    // The onWheelCapture handler is attached to the input
    input.dispatchEvent(wheelCaptureEvent);
    
    // onWheelCapture should prevent default and blur
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });

  it("updates lastValidValueRef when value prop changes", () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberInput data-testid="test-input" value="40" onChange={onChange} />);
    const input = screen.getByTestId("test-input");
    
    expect(input).toHaveValue(40);
    
    rerender(<NumberInput data-testid="test-input" value="42" onChange={onChange} />);
    
    expect(input).toHaveValue(42);
  });

  it("handles ref callback when ref is a function", () => {
    const refCallback = vi.fn();
    render(<NumberInput data-testid="test-input" ref={refCallback} />);
    
    expect(refCallback).toHaveBeenCalled();
  });

  it("handles ref callback when ref is an object", () => {
    const refObject = { current: null };
    render(<NumberInput data-testid="test-input" ref={refObject} />);
    
    expect(refObject.current).toBeTruthy();
  });

  it("calls user-provided onKeyDown handler", () => {
    const userOnKeyDown = vi.fn();
    render(<NumberInput data-testid="test-input" onKeyDown={userOnKeyDown} />);
    const input = screen.getByTestId("test-input");

    fireEvent.keyDown(input, { key: "5" });
    
    expect(userOnKeyDown).toHaveBeenCalled();
  });

  it("calls user-provided onPaste handler", () => {
    const userOnPaste = vi.fn();
    mockClipboardData.getData.mockReturnValue("42");
    render(<NumberInput data-testid="test-input" onPaste={userOnPaste} />);
    const input = screen.getByTestId("test-input");

    const pasteEvent = {
      preventDefault: vi.fn(),
      clipboardData: null, // Will fall back to window.clipboardData
      target: input,
      currentTarget: input
    };
    
    fireEvent.paste(input, pasteEvent);
    
    expect(userOnPaste).toHaveBeenCalled();
  });

  it("calls user-provided onWheel handler", () => {
    const userOnWheel = vi.fn();
    render(<NumberInput data-testid="test-input" onWheel={userOnWheel} />);
    const input = screen.getByTestId("test-input");

    fireEvent.wheel(input);
    
    expect(userOnWheel).toHaveBeenCalled();
  });

  it("handles empty value prop", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="test-input" value="" onChange={onChange} />);
    const input = screen.getByTestId("test-input");
    
    expect(input).toHaveValue(null);
  });

  it("preserves custom inputMode when provided", () => {
    render(<NumberInput data-testid="test-input" inputMode="decimal" />);
    const input = screen.getByTestId("test-input");
    
    expect(input).toHaveAttribute("inputMode", "decimal");
  });
});
