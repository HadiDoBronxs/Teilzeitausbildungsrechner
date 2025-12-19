// TextInput.jsx – Styled single-line input for TZR forms.
const BASE_CLASSES =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-500";
const ERROR_CLASSES = "border-red-600 focus-visible:outline-red-600";

/**
 * Props:
 * - invalid: optional boolean to force error styling/aria-invalid.
 * - className: extra Tailwind classes merged with defaults.
 * - rest: any other input props (value, onChange, etc.) passed to <input>.
 */
function TextInput({ className = "", invalid, ...rest }) {
  const inputProps = { ...rest };
  inputProps.type = inputProps.type || "text";

  const ariaInvalidProp = inputProps["aria-invalid"];
  const isInvalid =
    invalid !== undefined ? Boolean(invalid) : Boolean(ariaInvalidProp);

  if (ariaInvalidProp === undefined && invalid !== undefined) {
    inputProps["aria-invalid"] = invalid;
  }

  inputProps.className = [BASE_CLASSES, isInvalid ? ERROR_CLASSES : "", className]
    .filter(Boolean)
    .join(" ");

  return <input {...inputProps} />;
}

export default TextInput;
