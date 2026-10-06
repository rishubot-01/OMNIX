import { useState } from "react";

function CommentInput({
  onSubmit,
  placeholder = "Write a comment...",
  loading = false,
  currentUser = null,
}) {
  const [comment, setComment] = useState("");

  // --------------------------------------------------
  // SUBMIT COMMENT
  // --------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedComment =
      comment.trim();

    if (
      !trimmedComment ||
      loading ||
      !onSubmit
    ) {
      return;
    }

    try {
      await onSubmit(
        trimmedComment
      );

      // Clear input only after
      // successful API request
      setComment("");
    } catch (error) {
      console.error(
        "Failed to submit comment:",
        error
      );
    }
  };

  // --------------------------------------------------
  // ENTER KEY
  // Enter = submit
  // Shift + Enter = normal behavior
  // --------------------------------------------------
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit(event);
    }
  };

  // --------------------------------------------------
  // CURRENT USER
  // --------------------------------------------------
  const avatarUrl =
    currentUser?.avatar ||
    currentUser?.avatarUrl ||
    currentUser?.profileImage ||
    currentUser?.profilePicture ||
    currentUser?.photoURL ||
    "";

  const userName =
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.name ||
    "OMNIX User";

  const avatarLetter =
    userName
      ?.charAt(0)
      ?.toUpperCase() || "U";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-3"
    >

      {/* ==========================================
          CURRENT USER AVATAR
      ========================================== */}

      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-xs font-bold text-white">

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";

              const fallback =
                event.currentTarget
                  .parentElement
                  ?.querySelector(
                    "[data-avatar-fallback]"
                  );

              if (fallback) {
                fallback.classList.remove(
                  "hidden"
                );
              }
            }}
          />
        ) : null}

        <span
          data-avatar-fallback
          className={
            avatarUrl
              ? "hidden"
              : "flex h-full w-full items-center justify-center"
          }
        >
          {avatarLetter}
        </span>

      </div>

      {/* ==========================================
          INPUT
      ========================================== */}

      <div className="relative flex-1">

        <input
          type="text"
          value={comment}
          onChange={(event) =>
            setComment(
              event.target.value
            )
          }
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={500}
          disabled={loading}
          autoComplete="off"
          className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />

        {/* ========================================
            CHARACTER COUNT
        ======================================== */}

        {comment.length > 400 && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
            {comment.length}/500
          </span>
        )}

      </div>

      {/* ==========================================
          SUBMIT BUTTON
      ========================================== */}

      <button
        type="submit"
        disabled={
          !comment.trim() ||
          loading ||
          !onSubmit
        }
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        aria-label="Post comment"
      >

        {loading ? (

          /* Loading */

          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-white" />

        ) : (

          /* Send Icon */

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              d="m22 2-7 20-4-9-9-4Z"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M22 2 11 13"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

        )}

      </button>

    </form>
  );
}

export default CommentInput;