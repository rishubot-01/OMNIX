import React, { useEffect, useState } from "react";

/* =========================================================
   OMNIX REEL ICON
   Instagram-style clean outline icons
   ========================================================= */

const ReelIcon = ({
  type,
  filled = false,
  size = 28,
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
  };

  switch (type) {
    /* -----------------------------------------------------
       LIKE
    ----------------------------------------------------- */
    case "like":
      return (
        <svg
          {...commonProps}
          fill={
            filled
              ? "currentColor"
              : "none"
          }
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            fill={
              filled
                ? "currentColor"
                : "none"
            }
          />
        </svg>
      );

    /* -----------------------------------------------------
       COMMENT
    ----------------------------------------------------- */
    case "comment":
      return (
        <svg {...commonProps}>
          <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.9 9.9 0 0 1-4.2-.9L3 21l1.9-4.5A8.5 8.5 0 1 1 21 11.5Z" />
        </svg>
      );

    /* -----------------------------------------------------
       SEND / SHARE
    ----------------------------------------------------- */
    case "send":
      return (
        <svg {...commonProps}>
          <path d="M22 2 11 13" />
          <path d="m22 2-7 20-4-9-9-4Z" />
        </svg>
      );

    /* -----------------------------------------------------
       SAVE
    ----------------------------------------------------- */
    case "save":
      return (
        <svg
          {...commonProps}
          fill={
            filled
              ? "currentColor"
              : "none"
          }
        >
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
        </svg>
      );

    /* -----------------------------------------------------
       VIEWS
    ----------------------------------------------------- */
    case "views":
      return (
        <svg {...commonProps}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle
            cx="12"
            cy="12"
            r="3"
          />
        </svg>
      );

    /* -----------------------------------------------------
       MORE
    ----------------------------------------------------- */
    case "more":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <rect
            x="4"
            y="5"
            width="16"
            height="2.2"
            rx="1.1"
          />
          <rect
            x="4"
            y="10.9"
            width="16"
            height="2.2"
            rx="1.1"
          />
          <rect
            x="4"
            y="16.8"
            width="16"
            height="2.2"
            rx="1.1"
          />
        </svg>
      );

    /* -----------------------------------------------------
       CLOSE
    ----------------------------------------------------- */
    case "close":
      return (
        <svg {...commonProps}>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );

    /* -----------------------------------------------------
       REPORT
    ----------------------------------------------------- */
    case "report":
      return (
        <svg {...commonProps}>
          <path d="M5 21V4" />
          <path d="M5 4h11l-2 4 2 4H5" />
        </svg>
      );

    /* -----------------------------------------------------
       ACCOUNT
    ----------------------------------------------------- */
    case "account":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="8"
            r="3.5"
          />
          <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
        </svg>
      );

    /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */
    case "delete":
      return (
        <svg {...commonProps}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    default:
      return null;
  }
};

/* =========================================================
   REEL ACTIONS

   IMPORTANT:
   This component DOES NOT call the view API.

   View tracking is handled by:
   - Reels.jsx
   - ReelPlayer.jsx

   This prevents duplicate /reels/:id/view requests.
   ========================================================= */

const ReelActions = ({
  reelId,

  /* Like */
  liked = false,
  likesCount = 0,
  onLike,

  /* Comment */
  commentsCount = 0,
  onComment,

  /* Share */
  sharesCount = 0,
  onShare,

  /* Save */
  saved = false,
  savesCount = 0,
  onSave,

  /* Views */
  views = 0,

  /* Owner / Menu */
  isOwner = false,
  onDelete,
  onReport,
  onAboutAccount,
}) => {
  /* =====================================================
     STATE
     ===================================================== */

  const [isLiked, setIsLiked] =
    useState(Boolean(liked));

  const [likeCount, setLikeCount] =
    useState(
      Math.max(
        0,
        Number(likesCount) || 0
      )
    );

  const [isSaved, setIsSaved] =
    useState(Boolean(saved));

  const [saveCount, setSaveCount] =
    useState(
      Math.max(
        0,
        Number(savesCount) || 0
      )
    );

  const [isLiking, setIsLiking] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isSharing, setIsSharing] =
    useState(false);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  /* =====================================================
     SYNC LIKE STATE FROM PARENT
     ===================================================== */

  useEffect(() => {
    setIsLiked(Boolean(liked));
  }, [liked]);

  useEffect(() => {
    setLikeCount(
      Math.max(
        0,
        Number(likesCount) || 0
      )
    );
  }, [likesCount]);

  /* =====================================================
     SYNC SAVE STATE FROM PARENT
     ===================================================== */

  useEffect(() => {
    setIsSaved(Boolean(saved));
  }, [saved]);

  useEffect(() => {
    setSaveCount(
      Math.max(
        0,
        Number(savesCount) || 0
      )
    );
  }, [savesCount]);

  /* =====================================================
     LIKE
     ===================================================== */

  const handleLike = async () => {
    if (
      !reelId ||
      isLiking ||
      isDeleting
    ) {
      return;
    }

    const previousLiked =
      isLiked;

    const previousCount =
      likeCount;

    const newLiked =
      !previousLiked;

    /* -----------------------------------------------------
       Optimistic UI
    ----------------------------------------------------- */

    setIsLiked(newLiked);

    setLikeCount(
      newLiked
        ? previousCount + 1
        : Math.max(
            0,
            previousCount - 1
          )
    );

    setIsLiking(true);

    try {
      if (
        typeof onLike ===
        "function"
      ) {
        await onLike(
          reelId,
          newLiked
        );
      }
    } catch (error) {
      console.error(
        "OMNIX reel like error:",
        error
      );

      /* ---------------------------------------------------
         Rollback
      --------------------------------------------------- */

      setIsLiked(
        previousLiked
      );

      setLikeCount(
        previousCount
      );
    } finally {
      setIsLiking(false);
    }
  };

  /* =====================================================
     COMMENT
     ===================================================== */

  const handleComment = () => {
    if (
      !reelId ||
      isDeleting
    ) {
      return;
    }

    if (
      typeof onComment ===
      "function"
    ) {
      onComment(reelId);
    }
  };

  /* =====================================================
     SHARE
     ===================================================== */

  const handleShare = async () => {
    if (
      !reelId ||
      isSharing ||
      isDeleting
    ) {
      return;
    }

    setIsSharing(true);

    try {
      const shareUrl =
        `${window.location.origin}/reels/${reelId}`;

      let shareCompleted =
        false;

      /* ---------------------------------------------------
         Native share
      --------------------------------------------------- */

      if (
        typeof navigator !==
          "undefined" &&
        typeof navigator.share ===
          "function"
      ) {
        await navigator.share({
          title: "OMNIX Reel",
          text: "Check out this reel on OMNIX",
          url: shareUrl,
        });

        shareCompleted =
          true;
      }

      /* ---------------------------------------------------
         Clipboard fallback
      --------------------------------------------------- */

      else if (
        typeof navigator !==
          "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard
          .writeText ===
          "function"
      ) {
        await navigator.clipboard.writeText(
          shareUrl
        );

        window.alert(
          "Reel link copied!"
        );

        shareCompleted =
          true;
      }

      /* ---------------------------------------------------
         Notify parent only after share action completed.
      --------------------------------------------------- */

      if (
        shareCompleted &&
        typeof onShare ===
          "function"
      ) {
        await onShare(reelId);
      }
    } catch (error) {
      /* ---------------------------------------------------
         User closing native share sheet is not an error.
      --------------------------------------------------- */

      if (
        error?.name !==
        "AbortError"
      ) {
        console.error(
          "OMNIX reel share error:",
          error
        );
      }
    } finally {
      setIsSharing(false);
    }
  };

  /* =====================================================
     SAVE
     ===================================================== */

  const handleSave = async () => {
    if (
      !reelId ||
      isSaving ||
      isDeleting
    ) {
      return;
    }

    const previousSaved =
      isSaved;

    const previousCount =
      saveCount;

    const newSaved =
      !previousSaved;

    /* -----------------------------------------------------
       Optimistic UI
    ----------------------------------------------------- */

    setIsSaved(newSaved);

    setSaveCount(
      newSaved
        ? previousCount + 1
        : Math.max(
            0,
            previousCount - 1
          )
    );

    setIsSaving(true);

    try {
      if (
        typeof onSave ===
        "function"
      ) {
        await onSave(
          reelId,
          newSaved
        );
      }
    } catch (error) {
      console.error(
        "OMNIX reel save error:",
        error
      );

      /* ---------------------------------------------------
         Rollback
      --------------------------------------------------- */

      setIsSaved(
        previousSaved
      );

      setSaveCount(
        previousCount
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =====================================================
     MORE MENU
     ===================================================== */

  const handleMenuToggle = () => {
    if (isDeleting) {
      return;
    }

    setIsMenuOpen(
      (previous) =>
        !previous
    );
  };

  const closeMenu = () => {
    if (!isDeleting) {
      setIsMenuOpen(false);
    }
  };

  /* =====================================================
     REPORT
     ===================================================== */

  const handleReport = async () => {
    setIsMenuOpen(false);

    if (
      !reelId ||
      isDeleting
    ) {
      return;
    }

    try {
      if (
        typeof onReport ===
        "function"
      ) {
        await onReport(reelId);
      } else {
        window.alert(
          "Report feature coming soon."
        );
      }
    } catch (error) {
      console.error(
        "OMNIX report reel error:",
        error
      );
    }
  };

  /* =====================================================
     ABOUT ACCOUNT
     ===================================================== */

  const handleAboutAccount = () => {
    setIsMenuOpen(false);

    if (
      !reelId ||
      isDeleting
    ) {
      return;
    }

    if (
      typeof onAboutAccount ===
      "function"
    ) {
      onAboutAccount(reelId);
    }
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const handleDelete = async () => {
    if (
      !reelId ||
      !isOwner ||
      isDeleting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this reel?"
      );

    if (!confirmed) {
      return;
    }

    setIsMenuOpen(false);
    setIsDeleting(true);

    try {
      if (
        typeof onDelete ===
        "function"
      ) {
        await onDelete(reelId);
      }
    } catch (error) {
      console.error(
        "OMNIX delete reel error:",
        error
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div
      className={`reel-actions-wrapper ${
        isMenuOpen
          ? "reel-actions-menu-open"
          : ""
      }`}
    >
      {/* =================================================
          RIGHT-SIDE ACTION RAIL
      ================================================= */}

      <div
        className="reel-actions"
        aria-label="Reel actions"
      >
        {/* -------------------------------------------------
            LIKE
        ------------------------------------------------- */}

        <button
          type="button"
          className={`reel-action-button ${
            isLiked
              ? "reel-action-liked"
              : ""
          }`}
          onClick={handleLike}
          disabled={
            isLiking ||
            isDeleting
          }
          aria-label={
            isLiked
              ? `Unlike reel, ${likeCount} likes`
              : `Like reel, ${likeCount} likes`
          }
        >
          <span
            className="reel-action-icon"
            aria-hidden="true"
          >
            <ReelIcon
              type="like"
              filled={isLiked}
              size={28}
            />
          </span>

          <span className="reel-action-count">
            {likeCount}
          </span>
        </button>

        {/* -------------------------------------------------
            COMMENT
        ------------------------------------------------- */}

        <button
          type="button"
          className="reel-action-button"
          onClick={handleComment}
          disabled={isDeleting}
          aria-label={`Comment on reel, ${commentsCount} comments`}
        >
          <span
            className="reel-action-icon"
            aria-hidden="true"
          >
            <ReelIcon
              type="comment"
              size={27}
            />
          </span>

          <span className="reel-action-count">
            {commentsCount}
          </span>
        </button>

        {/* -------------------------------------------------
            VIEWS
        ------------------------------------------------- */}

        <div
          className="reel-action-stat"
          aria-label={`${views} views`}
        >
          <span
            className="reel-action-icon"
            aria-hidden="true"
          >
            <ReelIcon
              type="views"
              size={27}
            />
          </span>

          <span className="reel-action-count">
            {Math.max(
              0,
              Number(views) || 0
            )}
          </span>
        </div>

        {/* -------------------------------------------------
            SHARE / SEND
        ------------------------------------------------- */}

        <button
          type="button"
          className="reel-action-button"
          onClick={handleShare}
          disabled={
            isSharing ||
            isDeleting
          }
          aria-label={`Share reel, ${sharesCount} shares`}
        >
          <span
            className="reel-action-icon reel-send-icon"
            aria-hidden="true"
          >
            <ReelIcon
              type="send"
              size={28}
            />
          </span>

          <span className="reel-action-count">
            {sharesCount}
          </span>
        </button>

        {/* -------------------------------------------------
            SAVE
        ------------------------------------------------- */}

        <button
          type="button"
          className={`reel-action-button ${
            isSaved
              ? "reel-action-saved"
              : ""
          }`}
          onClick={handleSave}
          disabled={
            isSaving ||
            isDeleting
          }
          aria-label={
            isSaved
              ? `Unsave reel, ${saveCount} saves`
              : `Save reel, ${saveCount} saves`
          }
        >
          <span
            className="reel-action-icon"
            aria-hidden="true"
          >
            <ReelIcon
              type="save"
              filled={isSaved}
              size={27}
            />
          </span>

          <span className="reel-action-count">
            {saveCount}
          </span>
        </button>

        {/* -------------------------------------------------
            MORE
        ------------------------------------------------- */}

        <button
          type="button"
          className={`reel-action-button reel-menu-button ${
            isMenuOpen
              ? "reel-menu-button-active"
              : ""
          }`}
          onClick={handleMenuToggle}
          disabled={isDeleting}
          aria-label="More options"
          aria-expanded={isMenuOpen}
          aria-haspopup="dialog"
        >
          <span
            className="reel-action-icon"
            aria-hidden="true"
          >
            <ReelIcon
              type="more"
              size={27}
            />
          </span>
        </button>
      </div>

      {/* =================================================
          INSTAGRAM-STYLE BOTTOM SHEET
      ================================================= */}

      {isMenuOpen && (
        <div
          className="reel-more-panel"
          role="dialog"
          aria-modal="false"
          aria-label="More options"
        >
          {/* -------------------------------------------------
              HANDLE
          ------------------------------------------------- */}

          <div className="reel-more-panel-handle" />

          {/* -------------------------------------------------
              HEADER
          ------------------------------------------------- */}

          <div className="reel-more-panel-header">
            <span className="reel-more-panel-title">
              More options
            </span>

            <button
              type="button"
              className="reel-more-panel-close"
              onClick={closeMenu}
              disabled={isDeleting}
              aria-label="Close menu"
            >
              <ReelIcon
                type="close"
                size={21}
              />
            </button>
          </div>

          {/* -------------------------------------------------
              DIVIDER
          ------------------------------------------------- */}

          <div className="reel-more-panel-divider" />

          {/* -------------------------------------------------
              REPORT
          ------------------------------------------------- */}

          <button
            type="button"
            className="reel-more-panel-item"
            onClick={handleReport}
            disabled={isDeleting}
          >
            <span
              className="reel-more-panel-icon"
              aria-hidden="true"
            >
              <ReelIcon
                type="report"
                size={22}
              />
            </span>

            <span>
              Report
            </span>
          </button>

          {/* -------------------------------------------------
              ABOUT ACCOUNT
          ------------------------------------------------- */}

          <button
            type="button"
            className="reel-more-panel-item"
            onClick={
              handleAboutAccount
            }
            disabled={isDeleting}
          >
            <span
              className="reel-more-panel-icon"
              aria-hidden="true"
            >
              <ReelIcon
                type="account"
                size={22}
              />
            </span>

            <span>
              About this account
            </span>
          </button>

          {/* -------------------------------------------------
              DELETE - OWNER ONLY
          ------------------------------------------------- */}

          {isOwner && (
            <button
              type="button"
              className="reel-more-panel-item reel-more-panel-delete"
              onClick={
                handleDelete
              }
              disabled={isDeleting}
            >
              <span
                className="reel-more-panel-icon"
                aria-hidden="true"
              >
                <ReelIcon
                  type="delete"
                  size={22}
                />
              </span>

              <span>
                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </span>
            </button>
          )}

          {/* -------------------------------------------------
              CANCEL
          ------------------------------------------------- */}

          <button
            type="button"
            className="reel-more-panel-cancel"
            onClick={closeMenu}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ReelActions;