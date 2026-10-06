import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PostActions({
  post,
  currentUser,
  onLike,
  onComment,
  onShare,
  onSave,
}) {
  const navigate = useNavigate();

  /*
   * ==========================================
   * INITIAL LIKE STATE
   * ==========================================
   */

  const initialLiked =
    post?.isLiked ??
    post?.likedByCurrentUser ??
    false;

  /*
   * ==========================================
   * INITIAL SAVE STATE
   * ==========================================
   */

  const initialSaved =
    post?.isSaved ??
    post?.savedByCurrentUser ??
    post?.saved ??
    false;

  const [liked, setLiked] =
    useState(Boolean(initialLiked));

  const [saved, setSaved] =
    useState(Boolean(initialSaved));

  /*
   * ==========================================
   * ACTION LOADING STATES
   * ==========================================
   */

  const [saving, setSaving] =
    useState(false);

  const [liking, setLiking] =
    useState(false);

  /*
   * ==========================================
   * LIKE COUNT
   * ==========================================
   */

  const [likeCount, setLikeCount] =
    useState(
      post?.likesCount ??
        post?.likeCount ??
        post?.likes?.length ??
        0
    );

  /*
   * ==========================================
   * COMMENT COUNT
   * ==========================================
   */

  const commentCount =
    post?.commentsCount ??
    post?.commentCount ??
    post?.comments?.length ??
    0;

  /*
   * ==========================================
   * SHARE COUNT
   * ==========================================
   */

  const shareCount =
    post?.sharesCount ??
    post?.shareCount ??
    0;

  /*
   * ==========================================
   * LIKE
   * ==========================================
   */

  const handleLike = async () => {
    /*
     * Prevent duplicate requests while
     * previous like request is running.
     */

    if (liking) {
      return;
    }

    const nextLiked = !liked;

    /*
     * Optimistic UI update.
     */

    setLiked(nextLiked);

    setLikeCount((count) =>
      Math.max(
        0,
        count +
          (nextLiked ? 1 : -1)
      )
    );

    setLiking(true);

    try {
      await onLike?.(
        post,
        nextLiked
      );
    } catch (error) {
      /*
       * Rollback if API fails.
       */

      setLiked(!nextLiked);

      setLikeCount((count) =>
        Math.max(
          0,
          count +
            (nextLiked
              ? -1
              : 1)
        )
      );

      console.error(
        "Like post error:",
        error
      );
    } finally {
      setLiking(false);
    }
  };

  /*
   * ==========================================
   * SAVE / UNSAVE
   * ==========================================
   */

  const handleSave = async () => {
    /*
     * Prevent multiple save/unsave
     * requests at the same time.
     */

    if (saving) {
      return;
    }

    const nextSaved = !saved;

    /*
     * Optimistic UI update.
     *
     * Bookmark immediately changes.
     */

    setSaved(nextSaved);

    setSaving(true);

    try {
      /*
       * IMPORTANT:
       *
       * Parent receives:
       *
       * onSave(post, true)
       *     -> SAVE
       *
       * onSave(post, false)
       *     -> UNSAVE
       */

      await onSave?.(
        post,
        nextSaved
      );
    } catch (error) {
      /*
       * API failed.
       *
       * Rollback bookmark state.
       */

      setSaved(!nextSaved);

      console.error(
        "Save/unsave post error:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ==========================================
   * COMMENT
   * ==========================================
   */

  const handleComment = () => {
    if (onComment) {
      onComment(post);
      return;
    }

    if (
      post?._id ||
      post?.id
    ) {
      navigate(
        `/post/${
          post._id ||
          post.id
        }`
      );
    }
  };

  /*
   * ==========================================
   * SHARE
   * ==========================================
   */

  const handleShare = async () => {
    if (onShare) {
      await onShare(post);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "OMNIX Post",
          text:
            post?.caption ||
            "Check this post on OMNIX",
          url:
            window.location.href,
        });
      } catch {
        /*
         * User cancelled share dialog.
         */
      }
    }
  };

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">

        {/* ======================================
            LEFT ACTIONS
        ====================================== */}

        <div className="flex items-center gap-1">

          {/* ====================================
              LIKE
          ==================================== */}

          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            className={`flex h-9 items-center gap-1.5 rounded-full px-2.5 transition ${
              liked
                ? "text-red-500 hover:bg-red-50"
                : "text-gray-600 hover:bg-gray-100"
            } ${
              liking
                ? "cursor-wait opacity-70"
                : ""
            }`}
            aria-label={
              liked
                ? "Unlike post"
                : "Like post"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                d="M12 21s-7-4.35-9.33-8.28C.8 9.58 2.3 5 6.5 5c2.1 0 3.35 1.24 4.5 2.64C12.65 6.24 13.9 5 16 5c4.2 0 5.7 4.58 3.83 7.72C19 16.65 12 21 12 21Z"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            {likeCount > 0 && (
              <span className="text-xs font-semibold">
                {formatCount(
                  likeCount
                )}
              </span>
            )}
          </button>

          {/* ====================================
              COMMENT
          ==================================== */}

          <button
            type="button"
            onClick={handleComment}
            className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-gray-600 transition hover:bg-gray-100"
            aria-label="Comment on post"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                d="M20 11.5a8.5 8.5 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-4.2A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 8 8.5Z"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            {commentCount > 0 && (
              <span className="text-xs font-semibold">
                {formatCount(
                  commentCount
                )}
              </span>
            )}
          </button>

          {/* ====================================
              SHARE
          ==================================== */}

          <button
            type="button"
            onClick={handleShare}
            className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-gray-600 transition hover:bg-gray-100"
            aria-label="Share post"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                d="m21 3-7.2 18-3.8-7-7-3.8L21 3Z"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              <path
                d="M10 14 21 3"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            {shareCount > 0 && (
              <span className="text-xs font-semibold">
                {formatCount(
                  shareCount
                )}
              </span>
            )}
          </button>
        </div>

        {/* ======================================
            SAVE
        ====================================== */}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
            saved
              ? "text-gray-950"
              : "text-gray-600 hover:bg-gray-100"
          } ${
            saving
              ? "cursor-wait opacity-70"
              : ""
          }`}
          aria-label={
            saved
              ? "Unsave post"
              : "Save post"
          }
          aria-pressed={saved}
        >
          <svg
            viewBox="0 0 24 24"
            fill={
              saved
                ? "currentColor"
                : "none"
            }
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * FORMAT COUNT
 * ==========================================
 */

function formatCount(number) {
  if (number >= 1000000) {
    return `${(
      number / 1000000
    ).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(
      number / 1000
    ).toFixed(1)}K`;
  }

  return number;
}

export default PostActions;