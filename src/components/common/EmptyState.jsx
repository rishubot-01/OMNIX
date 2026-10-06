function EmptyState({
  title = "Nothing here yet",
  description = "",
  icon,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        {icon || (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-6 w-6 text-gray-400"
          >
            <path
              d="M12 3v18M3 12h18"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <h3 className="mt-4 text-sm font-bold text-gray-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm leading-5 text-gray-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;