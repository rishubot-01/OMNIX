function Avatar({
  src,
  alt = "User",
  name = "User",
  size = "md",
  online = false,
  className = "",
}) {
  const sizes = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-[68px] w-[68px] text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
    "2xl": "h-24 w-24 text-2xl",
  };

  const avatarSize = sizes[size] || sizes.md;

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${avatarSize} rounded-full object-cover`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling.style.display = "flex";
          }}
        />
      ) : null}

      <div
        className={`${avatarSize} ${
          src ? "hidden" : "flex"
        } items-center justify-center rounded-full bg-gray-900 font-bold text-white`}
      >
        {initial}
      </div>

      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
}

export default Avatar;