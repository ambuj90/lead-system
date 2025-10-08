import { InfoTooltip, HelpText } from "./Tooltip";
import { ScreenReaderOnly } from "./Accessibility";

// =============================================
// Text Input Component with Enhancements
// =============================================
export function TextInput({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  type = "text",
  maxLength,
  disabled = false,
  icon,
  tooltip,
  helpText,
  showCharCount = false,
  success = false,
  autoComplete,
}) {
  const charCount = value?.length || 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.8;
  const inputId = `input-${name}`;
  const errorId = `error-${name}`;
  const helpId = `help-${name}`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={inputId}
          className="flex items-center text-sm font-semibold text-gray-700"
        >
          {label}
          {required && (
            <>
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
              <ScreenReaderOnly>(required)</ScreenReaderOnly>
            </>
          )}
          {tooltip && (
            <span className="ml-2">
              <InfoTooltip content={tooltip} />
            </span>
          )}
        </label>
        {showCharCount && maxLength && (
          <span
            className={`text-xs ${
              isNearLimit ? "text-orange-600 font-medium" : "text-gray-500"
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            `${error ? errorId : ""} ${helpText ? helpId : ""}`.trim() ||
            undefined
          }
          aria-required={required}
          className={`w-full ${
            icon ? "pl-12" : "pl-4"
          } pr-12 py-3.5 text-base border-2 rounded-xl transition-all duration-200 font-medium
          ${
            error
              ? "border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100 focus:border-red-500"
              : success
              ? "border-green-400 bg-green-50 focus:ring-4 focus:ring-green-100 focus:border-green-500"
              : "border-gray-300 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
          } 
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}
          placeholder:text-gray-400 placeholder:font-normal`}
        />

        {/* Success/Error Icons */}
        {(success || error) && (
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            {success && (
              <svg
                className="w-6 h-6 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {error && (
              <svg
                className="w-6 h-6 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {helpText && !error && <HelpText id={helpId}>{helpText}</HelpText>}

      {error && (
        <p
          id={errorId}
          className="mt-2 text-sm text-red-600 flex items-center animate-shake font-medium"
          role="alert"
        >
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// =============================================
// Select Dropdown Component with Enhancements
// =============================================
export function SelectInput({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required = false,
  disabled = false,
  tooltip,
  helpText,
  success = false,
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="flex items-center text-sm font-semibold text-gray-700 mb-2"
      >
        {label} {required && <span className="text-red-500 ml-1">*</span>}
        {tooltip && (
          <span className="ml-2">
            <InfoTooltip content={tooltip} />
          </span>
        )}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-3.5 pr-12 text-base border-2 rounded-xl transition-all duration-200 appearance-none font-medium
          ${
            error
              ? "border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100 focus:border-red-500"
              : success
              ? "border-green-400 bg-green-50 focus:ring-4 focus:ring-green-100 focus:border-green-500"
              : "border-gray-300 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
          } 
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-60"
              : "cursor-pointer"
          }
          ${!value ? "text-gray-400" : "text-gray-900"}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 transition-colors ${
              error
                ? "text-red-400"
                : success && value
                ? "text-green-500"
                : "text-gray-400"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Success Icon */}
        {success && value && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {helpText && !error && <HelpText>{helpText}</HelpText>}

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-shake font-medium">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// =============================================
// Radio Button Group Component with Enhancements
// =============================================
export function RadioGroup({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required = false,
  tooltip,
  helpText,
}) {
  return (
    <div className="w-full">
      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
        {tooltip && (
          <span className="ml-2">
            <InfoTooltip content={tooltip} />
          </span>
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`relative flex items-center justify-center px-5 py-4 border-2 rounded-xl cursor-pointer transition-all duration-200 
            ${
              value === option.value
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md ring-2 ring-blue-200"
                : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="sr-only"
            />
            <span
              className={`text-base font-semibold transition-colors ${
                value === option.value ? "text-blue-700" : "text-gray-700"
              }`}
            >
              {option.label}
            </span>
            {value === option.value && (
              <svg
                className="absolute top-3 right-3 w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </label>
        ))}
      </div>

      {helpText && !error && <HelpText className="mt-2">{helpText}</HelpText>}

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-shake font-medium">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
