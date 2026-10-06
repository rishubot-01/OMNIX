import React, {
  useEffect,
  useRef,
  useState,
} from "react";

/* =========================================================
   OMNIX REEL COMMENTS
   Instagram-style comments bottom sheet
   ========================================================= */

const ReelComments = ({
  reelId,
  comments = [],
  currentUser,
  isOpen = false,
  loading = false,
  onLoadComments,
  onAddComment,
  onDeleteComment,
  onClose,
}) => {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const inputRef = useRef(null);
  const sheetRef = useRef(null);

  /* =========================================================
     LOAD COMMENTS
     ========================================================= */

  useEffect(() => {
    if (
      !isOpen ||
      !reelId ||
      !onLoadComments
    ) {
      return;
    }

    onLoadComments(reelId);
  }, [
    isOpen,
    reelId,
    onLoadComments,
  ]);

  /* =========================================================
     BODY SCROLL LOCK
     ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  /* =========================================================
     AUTO FOCUS INPUT
     ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  /* =========================================================
     SUBMIT COMMENT
     ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedComment =
      commentText.trim();

    if (!trimmedComment) {
      return;
    }

    if (
      !reelId ||
      submitting
    ) {
      return;
    }

    if (
      trimmedComment.length > 1000
    ) {
      return;
    }

    setSubmitting(true);

    try {
      if (onAddComment) {
        await onAddComment(
          reelId,
          trimmedComment
        );

        setCommentText("");
      }
    } catch (error) {
      console.error(
        "Add reel comment error:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     DELETE COMMENT
     ========================================================= */

  const handleDelete = async (
    commentId
  ) => {
    if (
      !commentId ||
      deletingId ||
      !onDeleteComment
    ) {
      return;
    }

    setDeletingId(commentId);

    try {
      await onDeleteComment(
        commentId
      );
    } catch (error) {
      console.error(
        "Delete reel comment error:",
        error
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  /* =========================================================
     GET USER NAME
     ========================================================= */

  const getUserName = (
    comment
  ) => {
    return (
      comment?.user?.username ||
      comment?.user?.name ||
      "Unknown User"
    );
  };

  /* =========================================================
     GET USER AVATAR
     ========================================================= */

  const getUserAvatar = (
    comment
  ) => {
    return (
      comment?.user?.avatar ||
      comment?.user?.profileImage ||
      "/default-avatar.png"
    );
  };

  /* =========================================================
     CURRENT USER AVATAR
     ========================================================= */

  const currentUserAvatar =
    currentUser?.avatar ||
    currentUser?.profileImage ||
    "/default-avatar.png";

  const currentUsername =
    currentUser?.username ||
    currentUser?.name ||
    "You";

  /* =========================================================
     CLOSE FROM BACKDROP
     ========================================================= */

  const handleBackdropClick = (
    event
  ) => {
    if (
      event.target ===
      event.currentTarget
    ) {
      if (onClose) {
        onClose();
      }
    }
  };

  /* =========================================================
     CLOSE BUTTON
     ========================================================= */

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  /* =========================================================
     STOP SHEET CLICK
     ========================================================= */

  const handleSheetClick = (
    event
  ) => {
    event.stopPropagation();
  };

  /* =========================================================
     INVALID / CLOSED
     ========================================================= */

  if (!isOpen) {
    return null;
  }

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div
      className="reel-comments-overlay"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <section
        ref={sheetRef}
        className="reel-comments"
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        onClick={handleSheetClick}
      >

        {/* =================================================
            TOP HANDLE
        ================================================= */}

        <div className="reel-comments-handle-area">
          <span className="reel-comments-handle" />
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="reel-comments-header">

          <div className="reel-comments-header-left">

            <h3 className="reel-comments-title">
              Comments
            </h3>

            <span className="reel-comments-count">
              {comments.length}
            </span>

          </div>

          {onClose && (
            <button
              type="button"
              className="reel-comments-close"
              onClick={handleClose}
              aria-label="Close comments"
            >
              <span aria-hidden="true">
                ×
              </span>
            </button>
          )}

        </header>

        {/* =================================================
            COMMENTS LIST
        ================================================= */}

        <div className="reel-comments-list">

          {loading ? (

            <div className="reel-comments-loading">

              <div className="reel-comments-spinner" />

              <span>
                Loading comments...
              </span>

            </div>

          ) : comments.length === 0 ? (

            <div className="reel-comments-empty">

              <div className="reel-comments-empty-icon">
                <span>
                  💬
                </span>
              </div>

              <h4>
                No comments yet
              </h4>

              <p>
                Start the conversation.
              </p>

            </div>

          ) : (

            comments.map((comment) => {

              const username =
                getUserName(
                  comment
                );

              const avatar =
                getUserAvatar(
                  comment
                );

              const commentOwnerId =
                comment?.user?._id ||
                comment?.user?.id;

              const currentUserId =
                currentUser?._id ||
                currentUser?.id;

              const isOwner =
                Boolean(
                  currentUserId &&
                  commentOwnerId &&
                  String(
                    commentOwnerId
                  ) ===
                    String(
                      currentUserId
                    )
                );

              return (
                <article
                  key={
                    comment._id
                  }
                  className="reel-comment-item"
                >

                  {/* Avatar */}

                  <img
                    src={avatar}
                    alt={username}
                    className="reel-comment-avatar"
                    onError={(
                      event
                    ) => {
                      event.currentTarget.src =
                        "/default-avatar.png";
                    }}
                  />

                  {/* Content */}

                  <div className="reel-comment-content">

                    <div className="reel-comment-top">

                      <span className="reel-comment-username">
                        @{username}
                      </span>

                      {comment.createdAt && (
                        <span className="reel-comment-date">
                          {formatDate(
                            comment.createdAt
                          )}
                        </span>
                      )}

                    </div>

                    <p className="reel-comment-text">
                      {comment.comment ||
                        comment.content ||
                        ""}
                    </p>

                    {/* Delete */}

                    {isOwner && (
                      <button
                        type="button"
                        className="reel-comment-delete"
                        disabled={
                          deletingId ===
                          comment._id
                        }
                        onClick={() =>
                          handleDelete(
                            comment._id
                          )
                        }
                      >
                        {deletingId ===
                        comment._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}

                  </div>

                </article>
              );
            })
          )}

        </div>

        {/* =================================================
            COMMENT INPUT
        ================================================= */}

        {currentUser ? (

          <form
            className="reel-comment-form"
            onSubmit={
              handleSubmit
            }
          >

            <img
              src={
                currentUserAvatar
              }
              alt={
                currentUsername
              }
              className="reel-comment-input-avatar"
              onError={(
                event
              ) => {
                event.currentTarget.src =
                  "/default-avatar.png";
              }}
            />

            <div className="reel-comment-input-wrapper">

              <input
                ref={inputRef}
                type="text"
                value={
                  commentText
                }
                onChange={(
                  event
                ) =>
                  setCommentText(
                    event.target
                      .value
                  )
                }
                placeholder="Add a comment..."
                maxLength={1000}
                disabled={
                  submitting
                }
                className="reel-comment-input"
                aria-label="Add a comment"
              />

              <button
                type="submit"
                disabled={
                  submitting ||
                  !commentText.trim()
                }
                className="reel-comment-submit"
              >
                {submitting
                  ? "..."
                  : "Post"}
              </button>

            </div>

          </form>

        ) : (

          <div className="reel-comments-login">

            <span>
              Login to comment on this reel.
            </span>

          </div>

        )}

      </section>
    </div>
  );
};

export default ReelComments;