import "@testing-library/jest-dom/vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) =>
      key === "fulltimeHours.error"
        ? `ERR ${opts?.min}-${opts?.max}`
        : key === "parttimeHours.error"
        ? `ERR ${opts?.min}-${opts?.max}`
        : key,
  }),
}));

