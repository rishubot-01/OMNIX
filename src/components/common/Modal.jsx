import { useEffect } from "react";

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
  closeOnOverlay = true,
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  const handleOverlayClick = (event) => {
    if (
      closeOnOverlay &&
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onMouseDown={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="omnix-modal-title"
    >
      <div
        className={`w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${sizes[size] || sizes.md}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        {(title || description || showClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2
                  id="omnix-modal-title"
                  className="text-lg font-bold text-gray-950"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;