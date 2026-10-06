import { useState } from "react";

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);

  if (!comment) {
    return null;
  }

  // --------------------------------------------------
  // Comment ID
  // --------------------------------------------------
  const commentId =
    comment?._id ||
    comment?.id;

  // --------------------------------------------------
  // User information
  //
  // Backend populate:
  // user -> username, fullName, avatar
  // --------------------------------------------------
  const user =
    comment?.user ||
    comment?.author ||
    {};

  const userName =
    user?.fullName ||
    user?.username ||
    user?.name ||
    "OMNIX User";

  const username = user?.username
    ? `@${String(
        user.username
      ).replace(/^@/, "")}`
    : "";

  // --------------------------------------------------
  // Avatar
  // Backend:
  // user.avatar
  // --------------------------------------------------
  const avatarUrl =
    user?.avatar ||
    user?.avatarUrl ||
    user?.profileImage ||
    user?.profilePicture ||
    user?.photoURL ||
    "";

  const avatarLetter =
    userName
      ?.charAt(0)
      ?.toUpperCase() || "U";

  // --------------------------------------------------
  // Comment content
  //
  // Backend stores:
  // comment: String
  // --------------------------------------------------
  const commentText =
    comment?.comment ||
    comment?.content ||
    comment?.text ||
    comment?.message ||
    "";

  // --------------------------------------------------
  // Owner check
  // --------------------------------------------------
  const commentUserId =
    user?._id ||
    user?.id ||
    user?.userId ||
    comment?.userId;

  const isOwner =
    currentUserId &&
    commentUserId &&
    String(commentUserId) ===
      String(currentUserId);

  // --------------------------------------------------
  // Created date
  // --------------------------------------------------
  const createdAt =
    comment?.createdAt ||
    comment?.created_at;

  let formattedDate = "";

  if (createdAt) {
    const date = new Date(createdAt);

    if (!Number.isNaN(date.getTime())) {
      formattedDate =
        date.toLocaleString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        );
    }
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  const handleDelete = async () => {
    setShowMenu(false);

    if (!commentId) {
      return;
    }

    if (onDelete) {
      await onDelete(comment);
    }
  };

  return (
    <article className="flex gap-3 px-4 py-3">

      {/* ==========================================
          AVATAR
      ========================================== */}

      {avatarUrl ? (
        <div className="h-9 w-9 shrink-0">
          <img
            src={avatarUrl}
            alt={userName}
            className="h-9 w-9 rounded-full object-cover"
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

          <div
            data-avatar-fallback
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white"
          >
            {avatarLetter}
          </div>
        </div>
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
          {avatarLetter}
        </div>
      )}

      {/* ==========================================
          CONTENT
      ========================================== */}

      <div className="min-w-0 flex-1">

        {/* Comment Bubble */}

        <div className="relative inline-block max-w-full rounded-2xl bg-gray-100 px-3.5 py-2.5">

          {/* User Name */}

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-sm font-semibold text-gray-900">
              {userName}
            </p>

            {username && (
              <span className="text-xs text-gray-400">
                {username}
              </span>
            )}

          </div>

          {/* Comment Text */}

          {commentText && (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-gray-700">
              {commentText}
            </p>
          )}

        </div>

        {/* ==========================================
            ACTIONS
        ========================================== */}

        <div className="mt-1.5 flex flex-wrap items-center gap-4 px-1">

          {/* Like */}

          <span className="cursor-default text-xs font-semibold text-gray-400">
            Like
          </span>

          {/* Reply */}

          <span className="cursor-default text-xs font-semibold text-gray-400">
            Reply
          </span>

          {/* Date */}

          {formattedDate && (
            <span className="text-xs text-gray-400">
              {formattedDate}
            </span>
          )}

          {/* ========================================
              OWNER MENU
          ======================================== */}

          {isOwner && (
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowMenu(
                    (value) => !value
                  )
                }
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Comment options"
                aria-expanded={
                  showMenu
                }
              >
                <span className="text-lg leading-none">
                  •••
                </span>
              </button>

              {showMenu && (
                <div className="absolute bottom-7 left-0 z-20 w-32 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">

                  <button
                    type="button"
                    onClick={
                      handleDelete
                    }
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </article>
  );
}

export default CommentItem;