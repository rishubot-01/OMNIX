function ErrorMessage({
  message = "Something went wrong.",
  title = "Error",
  onRetry,
  className = "",
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-100 bg-red-50 p-4 ${className}`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4 text-red-600"
          >
            <path
              d="M12 9v4"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M12 17h.01"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <path
              d="M10.3 3.2 2.7 16.4A2 2 0 0 0 4.4 19h15.2a2 2 0 0 0 1.7-2.6L13.7 3.2a2 2 0 0 0-3.4 0Z"
              strokeWidth="1.6"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-red-800">
            {title}
          </h4>

          <p className="mt-1 text-sm leading-5 text-red-700">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-xs font-bold text-red-700 underline underline-offset-2 hover:text-red-900"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;