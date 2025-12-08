# Architecture & Development Guidelines

This document describes the overall structure of the project, the UI component
system, and some expectations for code quality and documentation.  
It is intended for everyone working on the Teilzeitausbildungsrechner (TZR).

---

## Project Structure

Runtime and source code:

- `src/main.jsx`  
  - Bootstraps React and the i18n setup.
- `src/App.jsx`  
  - Main routing component using hash-based routing (no React Router dependency).
- `src/routes/`  
  - Page-level views (routing targets):
    - `WelcomePage.jsx` – Initial landing page with design selection (compact/tour).
    - `CompactView.jsx` – Compact calculator view with all inputs in a single page.
    - `TourView.jsx` – Placeholder for guided tour view (not yet implemented).
    - `transparenz.jsx` – Transparency information page.
    - `legal.jsx` – Legal basis information page.
- `src/features/`  
  - Feature flows (e.g. calculator logic, transparency view).
- `src/components/`  
  - Shared UI components and their tests.
  - `src/components/ui/` contains the **central UI primitives** (see below).
  - `src/components/ResultSidebar.jsx` – Desktop sidebar displaying simplified results.
  - `src/components/ResultBottomBar.jsx` – Mobile bottom bar showing part-time duration.
- `src/domain/`  
  - Pure business logic (e.g. `trainingDuration`).
- `src/utils/`  
  - Utility functions:
    - `routing.js` – Route detection and navigation utilities for hash-based routing.

Other important folders/files:

- `locales/` and `i18n/` – translation resources and i18n configuration.
- `public/` – static assets (including PDF worker script).
- `App.css`, `index.css` – global styling.
- `vite.config.js`, `vitest.config.js`, `eslint.config.js` – tooling configuration.

---

## Build, Test, and Development

- `npm run dev` – start the Vite dev server (hot reload, default port 5173).
- `npm run build` – build an optimized production bundle into `dist/`.
- `npm run preview` – serve the last production build locally.
- `npm run lint` – run ESLint with the shared configuration.
- `npm run test` – run Vitest with jsdom and Testing Library.

Before opening a merge request, `npm run lint` and `npm run test` should pass.

---

## Coding Style

- Language: modern JavaScript (ES modules) with JSX.
- Indentation: 2 spaces.
- React:
  - Components in **PascalCase** (`ResultCard.jsx`).
  - Hooks in **camelCase** prefixed with `use` (`useTrainingDuration`).
- Domain utilities: lower camelCase (`trainingDuration`, `applyReduction`).
- Keep each file focused on a single responsibility.
- Prefer colocating small helper functions next to their feature/component instead
  of creating large “misc” files.

ESLint enforces basic rules (unused variables, React Hooks rules, etc.).  
You can use `npm run lint -- --fix` to automatically fix simple issues.

---

## UI Component System (`src/components/ui/`)

All reusable, shared UI primitives live in `src/components/ui/`.  
They provide a single place to control design, accessibility, and behavior.

At the moment, the core UI set includes:

- `Button.jsx` – Actions and clickable elements.
- `TextInput.jsx` – Styled single-line input element. Labels and helper/error text are provided by the parent component.
- `NumberInput.jsx` – Styled `<input type="number">` for hours/months. Labels, helper text and error messages live in the parent.
- `SelectField.jsx` – Styled `<select>` wrapper. Labels and helper/error text are rendered by the calling component.
- `Card.jsx` – Base container for results, panels, and info boxes.
- `SectionHeader.jsx` – Section headings with optional subtitles, badges, and actions.
- `Alert.jsx` – Error/success/info messages.
- `Badge.jsx` – Small pill-style labels (e.g. result badges).
- `Dialog.jsx` – Accessible modal dialog for panels like the transparency view.
- `StatItem.jsx` – Single metric block for key figures (label/value/description).
- `NoticeBox.jsx` – Info/legal hint boxes with optional links.
- `ReductionInfo.jsx` – Reusable component for displaying reduction information text.

### General Rules for UI Components

- Files use **JavaScript + JSX** (`.jsx`), no TypeScript types.
- Styling uses **Tailwind utility classes**.
- No inline styles (`style={{ ... }}`) for layout or visual appearance.
- Prefer semantic HTML:
  - `<button>` for actions
  - `<input>` / `<select>` for form fields
  - `<section>`, `<article>`, `<header>`, `<footer>` for structure
- Components should be:
  - **reusable** (no hard-coded text or feature-specific logic),
  - **predictable** (clear props, no hidden side effects),
  - **easy to understand** for someone new to the project.

Primitive inputs (TextInput, NumberInput, SelectField) never render labels or helper/error text themselves. Those are always handled by the feature-level form components (e.g. FulltimeHoursInput, ReductionMonthsInput, SchoolDegreeReductionSelect).

Whenever a new view needs a Button/Input/Card/etc., it should use these
primitives instead of re-defining Tailwind classes inline.

---

## Accessibility & UX

The target audience of TZR includes people with limited time, potentially limited
language skills, and different devices. The UI must therefore be:

- keyboard-accessible,
- screen-reader-friendly,
- and responsive.

### Buttons

- Always use `<button>` (or a semantic alternative like `<a>` for links).
- Provide `type="button"` or `type="submit"` when relevant.
- Use visible focus styles (`focus-visible:outline`, `focus-visible:ring`, etc.).
- Set ARIA attributes (`aria-haspopup`, `aria-expanded`) where needed.

### Inputs

- Every input has a `<label>` with `htmlFor` pointing to the input `id`.
- Use stable, unique IDs:
  - Prefer explicit `id` props when composing inputs in higher-level components.
  - Use `React.useId()` as a fallback inside UI primitives.
- Helper and error text should be referenced via `aria-describedby` when present.
- Use `aria-invalid` when validation fails.

### Alerts & Status Messages

- Use `role="alert"` for errors that should be announced immediately.
- Use `role="status"` for non-critical updates (e.g. “factor ok/not ok”).
- Prefer text that is concise but clear.

### Dialogs

- Dialogs should:
  - trap focus while open,
  - close on Escape,
  - label their content using `aria-labelledby` and, if needed, `aria-describedby`.

`Dialog.jsx` implements these patterns and should be used for modal flows such as
the transparency panel.

---

## Routing

TZR uses **hash-based routing**. This approach:

- Works well in iframe environments (common for embedded calculators)
- Reduces bundle size (no React Router dependency)
- Is simple to implement and maintain
- Supports browser back/forward navigation

### Route Detection

Route detection is handled by `src/utils/routing.js` via the `detectCurrentRoute()` function.
Routes are determined in the following priority order:

1. **Pathname-based routes** (legacy support):
   - `/transparenz` → `transparenz` route
   - `/legal` → `legal` route

2. **Hash-based routes** (primary routing method):
   - `#compact` → `compact` route (CompactView)
   - `#tour` → `tour` route (TourView - placeholder)

3. **Default route**:
   - No hash or pathname match → `welcome` route (WelcomePage)

### Navigation

Navigation is performed by setting `window.location.hash`:

```jsx
// Navigate to compact view
window.location.hash = "#compact";

// Navigate back to welcome page
window.location.hash = "";
```

The `App.jsx` component listens for hash changes and updates the rendered route accordingly.
All route components are lazy-loaded to reduce initial bundle size.

---

## Documentation & Comments

New code should be readable for someone who joins the project later (e.g. a new
student or reviewer).

### File-Level Comments

For each new UI component in `src/components/ui/`:

- Add a short comment at the top of the file explaining:
  - what the component does,
  - and where it is typically used in TZR.

Example (simplified):

```jsx
// Card.jsx – Base container for calculator results and info panels in TZR.
```

### Props & Behavior

When a component has non-trivial props (for example `variant`, `role`, or `aria*`):

- Add a short comment or JSDoc-style block outlining:
  - allowed values (e.g. `variant` supports `"primary" | "text" | "pill" | "ghost"`),
  - and the intended meaning (e.g. when to use each variant).

This helps others understand quickly how to use the component in new contexts.

### Inline Comments

Inline comments should be used sparingly and only where the code is not
self-explanatory, for example:

- special focus or ARIA handling,
- edge cases in numeric input behavior,
- variant-specific styling that encodes domain meaning (e.g. error vs. info cards).

Avoid comments that only repeat what the code already says. Focus on explaining
the **why**, not the **what**.

---

By following these guidelines, the project stays consistent, accessible, and
easier to maintain over time, regardless of who is currently working on it.
