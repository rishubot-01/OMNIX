function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = "",
}) {
  const variants = {
    primary:
      "bg-gray-950 text-white hover:bg-gray-800 disabled:bg-gray-300",

    secondary:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100",

    outline:
      "border border-gray-900 bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white disabled:border-gray-300 disabled:text-gray-400",

    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",

    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-300",

    success:
      "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "h-12 px-5 text-sm rounded-xl",
    xl: "h-14 px-6 text-base rounded-2xl",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold
        transition
        focus:outline-none
        focus:ring-2
        focus:ring-gray-300
        disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}

      {children}
    </button>
  );
}

export default Button;