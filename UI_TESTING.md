# UI Testing Guide

This document explains how UI testing works in the TZR Rechner project, why we use React Testing Library instead of Selenium, and how to write and maintain tests.

---

## Overview

TZR Rechner uses **component-based UI testing** with React Testing Library and Vitest. Unlike traditional end-to-end testing tools like Selenium, we test React components directly in a simulated browser environment (jsdom), focusing on user interactions and accessibility rather than browser automation.

### Why React Testing Library Instead of Selenium?

**Selenium** is designed for **end-to-end (E2E) testing** of fully rendered web applications in real browsers. For a React component library like TZR, component testing is more appropriate:

| Aspect | React Testing Library | Selenium |
|--------|----------------------|----------|
| **Scope** | Individual React components | Full application in browser |
| **Speed** | Fast (runs in Node.js/jsdom) | Slower (requires browser) |
| **Setup** | Simple (already configured) | Complex (browser drivers, CI setup) |
| **Maintenance** | Low (tests components, not DOM structure) | High (fragile to CSS/structure changes) |
| **Feedback Loop** | Fast (runs with `npm test`) | Slower (requires full app build) |
| **CI/CD** | Easy (runs in any Node.js environment) | Requires browser infrastructure |

**For TZR Rechner, React Testing Library is the right choice because:**
- Fast feedback during development
- Tests focus on user behavior (what users see/interact with)
- Better accessibility testing (queries by role, label, etc.)
- No need for browser automation infrastructure
- Tests run reliably in CI/CD without browser setup

**Selenium would be appropriate if:**
- We wanted to test full user flows across multiple pages
- We needed to test browser-specific behavior (cookies, localStorage across sessions)
- We needed visual regression testing
- We were testing a non-React application

---

## Testing Stack

### Core Tools

- **Vitest** (`^4.0.3`) – Test runner (Jest-compatible, faster, Vite-native)
- **React Testing Library** (`^16.3.0`) – Component testing utilities
- **@testing-library/jest-dom** (`^6.9.1`) – Custom matchers (`.toBeInTheDocument()`, `.toBeDisabled()`, etc.)
- **@testing-library/user-event** (`^14.6.1`) – User interaction simulation
- **jsdom** (`^27.0.1`) – DOM simulation for Node.js

### Configuration

- **Test Environment**: `jsdom` (simulated browser)
- **Test Files**: `**/__tests__/**/*.{js,jsx}` or `**/*.test.{js,jsx}`
- **Setup File**: `vitest.setup.js` (global mocks, custom matchers)
- **CSS**: Enabled (Tailwind classes work in tests)

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- InputsTab.test.jsx

# Run tests matching a pattern
npm test -- TourTabs

## How to Write Tests

### Basic Test Structure

```jsx
// Tests for ComponentName component - brief description
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external dependencies (i18n, hooks, etc.)
vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

import ComponentName from "../ComponentName.jsx";

describe("ComponentName", () => {
  const defaultProps = {
    prop1: "value1",
    prop2: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

### Testing Patterns

#### 1. Query Elements by User-Centric Methods

**Prefer queries that reflect how users interact:**

```jsx
// Good: Query by role and accessible name
const button = screen.getByRole("button", { name: /submit/i });
const input = screen.getByLabelText(/email address/i);
const tab = screen.getByRole("tab", { name: /inputs/i });

// Avoid: Query by implementation details
const button = container.querySelector(".btn-primary"); // Fragile!
const input = screen.getByTestId("email-input"); // Only if no better option
```

**Common queries (in order of preference):**
- `getByRole()` – Most accessible (button, textbox, tab, etc.)
- `getByLabelText()` – For form inputs
- `getByText()` – For visible text content
- `getByPlaceholderText()` – For inputs without labels
- `getByTestId()` – Last resort (use `data-testid` sparingly)

#### 2. Test User Interactions

```jsx
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Simple interactions (fireEvent)
fireEvent.click(button);
fireEvent.change(input, { target: { value: "new value" } });
fireEvent.keyDown(element, { key: "Enter" });

// Complex interactions (userEvent - more realistic)
const user = userEvent.setup();
await user.click(button);
await user.type(input, "new value");
await user.keyboard("{Enter}");
```

#### 3. Test Accessibility

```jsx
// Test ARIA attributes
expect(tab).toHaveAttribute("aria-selected", "true");
expect(input).toHaveAttribute("aria-invalid", "true");
expect(button).toHaveAttribute("aria-label", "Close dialog");

// Test roles
expect(screen.getByRole("tablist")).toBeInTheDocument();
expect(screen.getByRole("alert")).toHaveTextContent("Error message");
```

#### 4. Mock External Dependencies

```jsx
// Mock i18n (always needed for components using useTranslation)
vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key, // Return key as-is, or provide translations
    i18n: {},
  })),
}));

// Mock custom hooks
vi.mock("../../features/calcDuration/useCalculator.js", () => ({
  useCalculator: vi.fn(),
}));

// Mock child components (if testing parent behavior)
vi.mock("../../components/FulltimeHoursInput.jsx", () => ({
  default: vi.fn(({ onValueChange }) => (
    <div data-testid="fulltime-input">
      <input onChange={(e) => onValueChange?.(e.target.value)} />
    </div>
  )),
}));
```

#### 5. Test Callbacks and State Changes

```jsx
it("should call onTabChange when tab is clicked", () => {
  const onTabChange = vi.fn();
  render(<TourTabs onTabChange={onTabChange} activeTab="inputs" />);

  const educationTab = screen.getByRole("tab", { name: /education/i });
  fireEvent.click(educationTab);

  expect(onTabChange).toHaveBeenCalledWith("education");
  expect(onTabChange).toHaveBeenCalledTimes(1);
});
```

#### 6. Test Conditional Rendering

```jsx
it("should hide tabs when wantsReduction is 'no'", () => {
  render(<TourTabs wantsReduction="no" />);

  expect(screen.getByRole("tab", { name: /inputs/i })).toBeInTheDocument();
  expect(screen.queryByRole("tab", { name: /education/i })).not.toBeInTheDocument();
});

// Note: Use queryBy* for elements that might not exist
// Use getBy* for elements that must exist (throws if not found)
```

#### 7. Test Disabled States

```jsx
it("should disable button when isDisabled is true", () => {
  render(<InputsTab isDisabled={true} />);
  
  const button = screen.getByRole("button", { name: /next/i });
  expect(button).toBeDisabled();
  
  fireEvent.click(button);
  expect(onNext).not.toHaveBeenCalled();
});
```

---

## Internal Standards

### File Organization

- **Test files**: Co-located with components in `__tests__/` folders
  - `src/components/__tests__/TourTabs.test.jsx`
  - `src/routes/__tests__/InputsTab.test.jsx`
- **Naming**: `ComponentName.test.jsx`

### Test Structure

1. **File header comment**: Brief description of what's tested
2. **Imports**: React, Testing Library, Vitest, component under test
3. **Mocks**: Set up before imports (Vitest hoisting)
4. **describe blocks**: Group related tests
5. **defaultProps**: Reusable props object
6. **beforeEach**: Reset mocks between tests

### Naming Conventions

- **describe blocks**: Component name or feature name
- **test names**: `"should [expected behavior]"` (e.g., `"should call onTabChange when tab is clicked"`)
- **Variables**: Descriptive names (`nextButton`, `educationTab`, `onTabChange`)

### Query Priority

1. **`getByRole()`** – Preferred for interactive elements
2. **`getByLabelText()`** – For form inputs
3. **`getByText()`** – For visible text
4. **`getByTestId()`** – Only when no better option exists

### Mocking Standards

- **Always mock `react-i18next`** – Components use translations
- **Mock child components** – If testing parent behavior, not child implementation
- **Mock hooks** – If testing component that uses custom hooks
- **Use `vi.fn()`** – For callback props to verify calls

### Accessibility Testing

- **Test ARIA attributes** – `aria-selected`, `aria-controls`, `aria-label`
- **Test roles** – Ensure correct `role` attributes
- **Test keyboard navigation** – Arrow keys, Enter, Space
- **Test disabled states** – Ensure disabled elements are not interactive

---

## Common Scenarios

### Testing Form Inputs

```jsx
it("should call onChange when input value changes", () => {
  const onChange = vi.fn();
  render(<TextInput onChange={onChange} label="Email" />);

  const input = screen.getByLabelText(/email/i);
  fireEvent.change(input, { target: { value: "test@example.com" } });

  expect(onChange).toHaveBeenCalledWith("test@example.com");
});
```

### Testing Select/Dropdown

```jsx
it("should call onWantsReductionChange when select value changes", () => {
  const onChange = vi.fn();
  render(<InputsTab onWantsReductionChange={onChange} />);

  const select = screen.getByLabelText(/reduce training/i);
  fireEvent.change(select, { target: { value: "yes" } });

  expect(onChange).toHaveBeenCalledWith("yes");
});
```

### Testing Keyboard Navigation

```jsx
it("should navigate to next tab with ArrowRight key", () => {
  const onTabChange = vi.fn();
  render(<TourTabs activeTab="inputs" onTabChange={onTabChange} />);

  const inputsTab = screen.getByRole("tab", { name: /inputs/i });
  fireEvent.keyDown(inputsTab, { key: "ArrowRight" });

  expect(onTabChange).toHaveBeenCalledWith("education");
});
```

### Testing Optional Chaining

```jsx
it("should not throw error when handler is undefined", () => {
  const propsWithoutHandler = {
    ...defaultProps,
    onWantsReductionChange: undefined,
  };

  expect(() => {
    render(<InputsTab {...propsWithoutHandler} />);
  }).not.toThrow();

  const select = screen.getByLabelText(/reduce training/i);
  expect(() => {
    fireEvent.change(select, { target: { value: "yes" } });
  }).not.toThrow();
});
```

### Testing Responsive Behavior

```jsx
// Note: In test environments, matchMedia is not available
// Components default to mobile view (isDesktop = false)
// Test both mobile and desktop if needed by checking aria-hidden

it("should render mobile tabs in test environment", () => {
  render(<TourTabs />);
  
  // Mobile tabs have tab-mobile-{id} format
  const tab = screen.getByRole("tab", { name: /inputs/i });
  expect(tab).toHaveAttribute("id", "tab-mobile-inputs");
});
```

---

## Documentation Links

### Official Documentation

- **React Testing Library**: https://testing-library.com/react
- **Vitest**: https://vitest.dev
- **Testing Library Queries**: https://testing-library.com/docs/queries/about
- **Testing Library User Events**: https://testing-library.com/docs/user-event/intro
- **Testing Library Best Practices**: https://testing-library.com/docs/guiding-principles

---

## Troubleshooting

### Common Issues

**Problem**: `getByRole` finds multiple elements
- **Solution**: Use `getAllByRole` and filter, or add `aria-hidden` to hidden elements

**Problem**: `window.matchMedia is not a function`
- **Solution**: This is expected in jsdom. Components should handle missing `matchMedia` gracefully (default to mobile view)

**Problem**: Tests fail after changing CSS classes
- **Solution**: Tests should query by role/label, not CSS classes. Update queries to use accessible methods.

**Problem**: Mock not working
- **Solution**: Ensure mocks are defined before imports. Use `vi.hoisted()` for complex mocks.

**Problem**: Async operations not completing
- **Solution**: Use `waitFor()` or `findBy*` queries for async content:
  ```jsx
  await waitFor(() => {
    expect(screen.getByText("Loaded content")).toBeInTheDocument();
  });
  ```
