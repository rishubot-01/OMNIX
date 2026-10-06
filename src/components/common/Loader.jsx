function Loader({
  size = "md",
  fullscreen = false,
  text = "",
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-9 w-9 border-[3px]",
    xl: "h-12 w-12 border-4",
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <span
        className={`animate-spin rounded-full border-gray-200 border-t-gray-900 ${
          sizes[size] || sizes.md
        }`}
      />

      {text && (
        <p className="text-sm text-gray-500">
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}

export default Loader;