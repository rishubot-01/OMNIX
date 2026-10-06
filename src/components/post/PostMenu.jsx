
import { useEffect, useRef, useState } from "react";

function PostMenu({
  post,
  isOwner = false,
  onEdit,
  onDelete,
  onSave,
  onReport,
  onNotInterested,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const getPostId = () => {
    return post?._id || post?.id || "";
  };

  const handleEdit = () => {
    setOpen(false);
    onEdit?.(post);
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete?.(post);
  };

  const handleSave = () => {
    setOpen(false);
    onSave?.(post);
  };

  const handleReport = () => {
    setOpen(false);
    onReport?.(post);
  };

  const handleCopyLink = async () => {
    setOpen(false);

    const postId = getPostId();

    if (!postId) {
      return;
    }

    const link = `${window.location.origin}/post/${postId}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Post link copied.");
    } catch (error) {
      console.error(
        "Copy post link error:",
        error
      );
    }
  };

  const handleNotInterested = () => {
    setOpen(false);
    onNotInterested?.(post);
  };

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
    >
      {/* Three dot button */}
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        aria-label="Post options"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <circle
            cx="5"
            cy="12"
            r="1.6"
          />
          <circle
            cx="12"
            cy="12"
            r="1.6"
          />
          <circle
            cx="19"
            cy="12"
            r="1.6"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">

          {/* EDIT - OWNER ONLY */}
          {isOwner && onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <span className="w-5 text-center text-base">
                ✎
              </span>

              <span>Edit</span>
            </button>
          )}

          {/* SAVE - EVERYONE */}
          {onSave && (
            <button
              type="button"
              onClick={handleSave}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <span className="w-5 text-center text-base">
                🔖
              </span>

              <span>Save</span>
            </button>
          )}

          {/* DELETE - OWNER ONLY */}
          {isOwner && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <span className="w-5 text-center text-base">
                🗑
              </span>

              <span>Delete</span>
            </button>
          )}

          {/* REPORT - OTHER USERS ONLY */}
          {!isOwner && onReport && (
            <button
              type="button"
              onClick={handleReport}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <span className="w-5 text-center text-base">
                ⚑
              </span>

              <span>Report</span>
            </button>
          )}

          {/* COPY LINK - EVERYONE */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <span className="w-5 text-center text-base">
              🔗
            </span>

            <span>Copy link</span>
          </button>

          {/* NOT INTERESTED - EVERYONE */}
          <button
            type="button"
            onClick={handleNotInterested}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <span className="w-5 text-center text-base">
              🚫
            </span>

            <span>Not interested</span>
          </button>

        </div>
      )}
    </div>
  );
}

export default PostMenu;