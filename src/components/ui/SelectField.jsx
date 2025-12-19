// SelectField.jsx – Styled <select> used in TZR dropdowns (e.g. school degree).
const BASE_CLASSES =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-500";
const ERROR_CLASSES = "border-red-600 focus-visible:outline-red-600";

/**
 * Props:
 * - invalid: optional boolean to toggle error styling alongside aria-invalid.
 * - className: extra Tailwind classes merged with the base styles.
 * - children: option nodes rendered inside the select.
 * - rest: any other props forwarded to the underlying <select>.
 */
function SelectField({ className = "", invalid, children, ...rest }) {
  const selectProps = { ...rest };

  const ariaInvalidProp = selectProps["aria-invalid"];
  const isInvalid =
    invalid !== undefined ? Boolean(invalid) : Boolean(ariaInvalidProp);

  if (ariaInvalidProp === undefined && invalid !== undefined) {
    selectProps["aria-invalid"] = invalid;
  }

  selectProps.className = [BASE_CLASSES, isInvalid ? ERROR_CLASSES : "", className]
    .filter(Boolean)
    .join(" ")
    .trim();

  return <select {...selectProps}>{children}</select>;
}

export default SelectField;
