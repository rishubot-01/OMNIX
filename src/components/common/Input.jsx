function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  autoComplete,
  icon,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-sm font-semibold text-gray-800"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`
            h-11 w-full rounded-xl border
            bg-white
            px-3
            text-sm text-gray-900
            outline-none
            transition
            placeholder:text-gray-400
            disabled:cursor-not-allowed
            disabled:bg-gray-100
            ${
              icon
                ? "pl-10"
                : ""
            }
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
            }
          `}
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Input;