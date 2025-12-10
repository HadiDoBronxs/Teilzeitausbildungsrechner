// NumberInput.jsx – Shared <input type=\"number\"> for hour/month fields in TZR.
const BASE_CLASSES =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-base text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";
const ERROR_CLASSES = "border-red-500 focus-visible:outline-red-500";

/**
 * Props:
 * - invalid: optional boolean to trigger error styling alongside aria-invalid.
 * - className: extra Tailwind classes to merge with base styles.
 * - inputMode: defaults to "numeric" when omitted for better mobile keyboards.
 * - rest: all other props forwarded to the underlying <input>.
 */
function NumberInput({ className = "", invalid, ...rest }) {
  const inputProps = { ...rest };
  if (inputProps.inputMode === undefined) {
  inputProps.inputMode = "numeric";
  }

  // Prevent wheel/trackpad scroll from changing the value while focused
  const userWheelHandler = inputProps.onWheel;
  inputProps.onWheel = (event) => {
    event.preventDefault(); // stop default number increment on scroll
    if (typeof userWheelHandler === "function") {
      userWheelHandler(event);
    }
  };
  inputProps.onWheelCapture = (event) => {
    // Drop focus early so trackpad/mouse-wheel gestures cannot alter the value
    event.preventDefault();
    event.currentTarget.blur();
  };

  const ariaInvalidProp = inputProps["aria-invalid"];
  const isInvalid =
    invalid !== undefined ? Boolean(invalid) : Boolean(ariaInvalidProp);

  if (ariaInvalidProp === undefined && invalid !== undefined) {
    inputProps["aria-invalid"] = invalid;
  }

  inputProps.type = "number";
  inputProps.className = [BASE_CLASSES, isInvalid ? ERROR_CLASSES : "", className]
    .filter(Boolean)
    .join(" ");

  return <input {...inputProps} />;
}

export default NumberInput;
