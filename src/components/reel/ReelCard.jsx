
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

/* =========================================================
   OMNIX REEL ICON
   ========================================================= */

const ReelIcon = ({
  name,
  filled = false,
}) => {
  const paths = {
    play: (
      <path
        d="M8 5.5v13l10-6.5L8 5.5Z"
        fill="currentColor"
      />
    ),

    heart: (
      <path
        d="M12 20.5S3.5 15.2 3.5 8.9C3.5 6.1 5.6 4 8.3 4c1.6 0 3 .8 3.7 2.1C12.7 4.8 14.1 4 15.7 4c2.7 0 4.8 2.1 4.8 4.9 0 6.3-8.5 11.6-8.5 11.6Z"
      />
    ),

    comment: (
      <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
    ),

    share: (
      <path d="m13 5 7 7-7 7m6.2-7H4.5" />
    ),

    save: (
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    ),

    views: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </>
    ),

    more: (
      <>
        <circle
          cx="5"
          cy="12"
          r="1.4"
          fill="currentColor"
        />
        <circle
          cx="12"
          cy="12"
          r="1.4"
          fill="currentColor"
        />
        <circle
          cx="19"
          cy="12"
          r="1.4"
          fill="currentColor"
        />
      </>
    ),

    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),

    report: (
      <>
        <path d="M5 21V4" />
        <path d="M5 4h11l-2 4 2 4H5" />
      </>
    ),

    account: (
      <>
        <circle
          cx="12"
          cy="8"
          r="3.5"
        />
        <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
      </>
    ),

    delete: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
      </>
    ),

    music: (
      <>
        <path d="M9 18.5a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 9 18.5ZM9 18.5V6l10-2v11.5a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 19 15.5" />
      </>
    ),

    follow: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21c.7-4.1 3.3-6 8-6s7.3 1.9 8 6" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </>
    ),
  };

  return (
    <svg
      className="reel-svg-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={
        filled
          ? "currentColor"
          : "none"
      }
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
};

/* =========================================================
   REEL CARD

   IMPORTANT:

   This component does NOT track reel views.

   View tracking must be handled only by:
   - Reels.jsx
   - ReelPlayer.jsx

   This prevents duplicate:
   POST /reels/:id/view
   requests and avoids 429 errors.
   ========================================================= */

const ReelCard = ({
  reel,

  onLike,
  onComment,
  onShare,
  onSave,
  onReport,
  onAboutAccount,

  /* Optional follow support */
  onFollow,
  isFollowing = false,
}) => {
  const videoRef = useRef(null);

  /* =====================================================
     VIDEO STATE
     ===================================================== */

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [videoRatio, setVideoRatio] =
    useState(9 / 16);

  /* =====================================================
     REEL STATE
     ===================================================== */

  const [isLiked, setIsLiked] =
    useState(
      Boolean(reel?.isLiked)
    );

  const [isSaved, setIsSaved] =
    useState(
      Boolean(reel?.isSaved)
    );

  const [likesCount, setLikesCount] =
    useState(
      Math.max(
        0,
        Number(reel?.likesCount) || 0
      )
    );

  const [views, setViews] =
    useState(
      Math.max(
        0,
        Number(reel?.views) || 0
      )
    );

  const [showMenu, setShowMenu] =
    useState(false);

  /* =====================================================
     USER DATA
     ===================================================== */

  const videoUrl =
    reel?.videoUrl;

  const caption =
    reel?.caption || "";

  const username =
    reel?.user?.username ||
    reel?.user?.name ||
    "Unknown User";

  const fullName =
    reel?.user?.fullName ||
    "";

  const avatar =
    reel?.user?.avatar ||
    reel?.user?.profileImage ||
    "/default-avatar.png";

  /* =====================================================
     MUSIC DATA
     ===================================================== */

  const musicName =
    reel?.musicName ||
    reel?.audioName ||
    reel?.music?.name ||
    reel?.audio?.name ||
    "Original audio";

  /* =====================================================
     SYNC REEL DATA FROM PARENT
     ===================================================== */

  useEffect(() => {
    setIsLiked(
      Boolean(reel?.isLiked)
    );
  }, [
    reel?.isLiked,
  ]);

  useEffect(() => {
    setIsSaved(
      Boolean(reel?.isSaved)
    );
  }, [
    reel?.isSaved,
  ]);

  useEffect(() => {
    setLikesCount(
      Math.max(
        0,
        Number(reel?.likesCount) || 0
      )
    );
  }, [
    reel?.likesCount,
  ]);

  /* =====================================================
     VIEW COUNT

     DISPLAY ONLY.

     IMPORTANT:
     No API request is made here.
     ===================================================== */

  useEffect(() => {
    setViews(
      Math.max(
        0,
        Number(reel?.views) || 0
      )
    );
  }, [
    reel?.views,
  ]);

  /* =====================================================
     VIDEO METADATA

     Actual uploaded video's dimensions determine
     the Reel card ratio.
     ===================================================== */

  const handleVideoMetadata = (
    event
  ) => {
    const video =
      event.currentTarget;

    const width =
      video.videoWidth;

    const height =
      video.videoHeight;

    if (
      !width ||
      !height
    ) {
      return;
    }

    const ratio =
      width / height;

    setVideoRatio(ratio);
  };

  /* =====================================================
     VIDEO PLAY / PAUSE
     ===================================================== */

  const handleVideoClick = () => {
    if (!videoRef.current) {
      return;
    }

    if (
      videoRef.current.paused
    ) {
      const playPromise =
        videoRef.current.play();

      if (
        playPromise &&
        typeof playPromise.then ===
          "function"
      ) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(true);
      }
    } else {
      videoRef.current.pause();

      setIsPlaying(false);
    }
  };

  /* =====================================================
     VIDEO PLAY / PAUSE EVENTS

     Keeps React state synchronized with the
     actual video element.
     ===================================================== */

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  /* =====================================================
     LIKE
     ===================================================== */

  const handleLike = async () => {
    if (!reel?._id) {
      return;
    }

    const previousLiked =
      isLiked;

    const previousCount =
      likesCount;

    const newLiked =
      !previousLiked;

    /* Optimistic UI */

    setIsLiked(newLiked);

    setLikesCount(
      newLiked
        ? previousCount + 1
        : Math.max(
            0,
            previousCount - 1
          )
    );

    try {
      if (
        typeof onLike ===
        "function"
      ) {
        await onLike(
          reel._id,
          newLiked
        );
      }
    } catch (error) {
      console.error(
        "OMNIX reel like error:",
        error
      );

      /* Rollback */

      setIsLiked(
        previousLiked
      );

      setLikesCount(
        previousCount
      );
    }
  };

  /* =====================================================
     COMMENT
     ===================================================== */

  const handleComment = () => {
    if (
      typeof onComment ===
      "function"
    ) {
      onComment(reel);
    }
  };

  /* =====================================================
     SEND / SHARE
     ===================================================== */

  const handleSend = async () => {
    if (!reel?._id) {
      return;
    }

    try {
      const shareUrl =
        `${window.location.origin}/reels/${reel._id}`;

      let shareCompleted =
        false;

      if (
        typeof navigator !==
          "undefined" &&
        typeof navigator.share ===
          "function"
      ) {
        await navigator.share({
          title: "OMNIX Reel",
          text:
            caption ||
            "Check out this reel on OMNIX",
          url: shareUrl,
        });

        shareCompleted = true;
      } else if (
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

        shareCompleted = true;
      }

      if (
        shareCompleted &&
        typeof onShare ===
          "function"
      ) {
        await onShare(reel);
      }
    } catch (error) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.error(
          "OMNIX send reel error:",
          error
        );
      }
    }
  };

  /* =====================================================
     SAVE
     ===================================================== */

  const handleSave = async () => {
    if (!reel?._id) {
      return;
    }

    const previousSaved =
      isSaved;

    const newSaved =
      !previousSaved;

    setIsSaved(newSaved);

    try {
      if (
        typeof onSave ===
        "function"
      ) {
        await onSave(
          reel._id,
          newSaved
        );
      }
    } catch (error) {
      console.error(
        "OMNIX save reel error:",
        error
      );

      setIsSaved(
        previousSaved
      );
    }
  };

  /* =====================================================
     FOLLOW
     ===================================================== */

  const handleFollow = async (
    event
  ) => {
    event.stopPropagation();

    if (
      typeof onFollow !==
        "function" ||
      !reel?.user
    ) {
      return;
    }

    try {
      await onFollow(
        reel.user,
        !isFollowing
      );
    } catch (error) {
      console.error(
        "OMNIX reel follow error:",
        error
      );
    }
  };

  /* =====================================================
     THREE DOT MENU
     ===================================================== */

  const handleMenuToggle = (
    event
  ) => {
    event.stopPropagation();

    setShowMenu(
      (previous) =>
        !previous
    );
  };

  /* =====================================================
     REPORT
     ===================================================== */

  const handleReport = () => {
    setShowMenu(false);

    if (
      typeof onReport ===
      "function"
    ) {
      onReport(reel);
      return;
    }

    const confirmed =
      window.confirm(
        "Do you want to report this reel?"
      );

    if (confirmed) {
      window.alert(
        "Thanks. This reel has been reported."
      );
    }
  };

  /* =====================================================
     ABOUT ACCOUNT
     ===================================================== */

  const handleAboutAccount = () => {
    setShowMenu(false);

    if (
      typeof onAboutAccount ===
      "function"
    ) {
      onAboutAccount(
        reel?.user
      );

      return;
    }

    window.alert(
      `About @${username}`
    );
  };

  /* =====================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
     ===================================================== */

  useEffect(() => {
    if (!showMenu) {
      return undefined;
    }

    const handleOutsideClick = () => {
      setShowMenu(false);
    };

    document.addEventListener(
      "click",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, [
    showMenu,
  ]);

  /* =====================================================
     RESET WHEN REEL CHANGES
     ===================================================== */

  useEffect(() => {
    setVideoRatio(9 / 16);

    setIsLiked(
      Boolean(reel?.isLiked)
    );

    setIsSaved(
      Boolean(reel?.isSaved)
    );

    setLikesCount(
      Math.max(
        0,
        Number(reel?.likesCount) || 0
      )
    );

    setViews(
      Math.max(
        0,
        Number(reel?.views) || 0
      )
    );

    setIsPlaying(false);
    setShowMenu(false);

    if (
      videoRef.current
    ) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [
    reel?._id,
  ]);

  /* =====================================================
     INVALID REEL
     ===================================================== */

  if (
    !reel ||
    !videoUrl
  ) {
    return (
      <article className="reel-card reel-card-error">
        <p>
          Unable to load reel.
        </p>
      </article>
    );
  }

  /* =====================================================
     CSS VARIABLE
     ===================================================== */

  const reelStyle = {
    "--reel-ratio":
      videoRatio,
  };

  /* =====================================================
     UI
     ===================================================== */

  return (
    <article
      className="reel-card"
      style={reelStyle}
    >
      {/* =================================================
          ACTUAL VIDEO SURFACE
      ================================================= */}

      <div
        className="reel-video-wrapper"
        onClick={
          handleVideoClick
        }
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="reel-video"
          playsInline
          loop
          preload="metadata"
          onLoadedMetadata={
            handleVideoMetadata
          }
          onPlay={
            handleVideoPlay
          }
          onPause={
            handleVideoPause
          }
          onEnded={
            handleVideoEnded
          }
        />

        {/* ===============================================
            PLAY BUTTON
        =============================================== */}

        {!isPlaying && (
          <div
            className="reel-play-overlay"
            aria-hidden="true"
          >
            <span className="reel-play-icon">
              <ReelIcon
                name="play"
                filled
              />
            </span>
          </div>
        )}
      </div>

      {/* =================================================
          BOTTOM VIDEO OVERLAY
      ================================================= */}

      <div
        className="reel-bottom-overlay"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ===============================================
            USER ROW
        =============================================== */}

        <div className="reel-user-info">
          <img
            src={avatar}
            alt={username}
            className="reel-avatar"
            loading="lazy"
          />

          <div className="reel-user-details">
            <div className="reel-user-name-row">
              <strong>
                {username}
              </strong>

              {onFollow && (
                <button
                  type="button"
                  className={`reel-follow-button ${
                    isFollowing
                      ? "following"
                      : ""
                  }`}
                  onClick={
                    handleFollow
                  }
                >
                  {isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
              )}
            </div>

            {fullName && (
              <span className="reel-full-name">
                {fullName}
              </span>
            )}
          </div>
        </div>

        {/* ===============================================
            CAPTION
        =============================================== */}

        {caption && (
          <div className="reel-caption">
            {caption}
          </div>
        )}

        {/* ===============================================
            MUSIC
        =============================================== */}

        <div
          className="reel-music"
          title={musicName}
        >
          <div className="reel-music-disc">
            <ReelIcon
              name="music"
            />
          </div>

          <span>
            {musicName}
          </span>
        </div>
      </div>

      {/* =================================================
          RIGHT ACTION RAIL
      ================================================= */}

      <div
        className="reel-actions"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ===============================================
            LIKE
        =============================================== */}

        <button
          type="button"
          className={`reel-action ${
            isLiked
              ? "liked"
              : ""
          }`}
          onClick={
            handleLike
          }
          aria-label={
            isLiked
              ? "Unlike reel"
              : "Like reel"
          }
        >
          <span className="reel-action-icon">
            <ReelIcon
              name="heart"
              filled={isLiked}
            />
          </span>

          <span>
            {likesCount}
          </span>
        </button>

        {/* ===============================================
            COMMENT
        =============================================== */}

        <button
          type="button"
          className="reel-action"
          onClick={
            handleComment
          }
          aria-label="Comment on reel"
        >
          <span className="reel-action-icon">
            <ReelIcon
              name="comment"
            />
          </span>

          <span>
            {reel?.commentsCount || 0}
          </span>
        </button>

        {/* ===============================================
            SHARE
        =============================================== */}

        <button
          type="button"
          className="reel-action"
          onClick={
            handleSend
          }
          aria-label="Send reel"
        >
          <span className="reel-action-icon reel-send-icon">
            <ReelIcon
              name="share"
            />
          </span>

          <span>
            {reel?.sharesCount || 0}
          </span>
        </button>

        {/* ===============================================
            SAVE
        =============================================== */}

        <button
          type="button"
          className={`reel-action ${
            isSaved
              ? "saved"
              : ""
          }`}
          onClick={
            handleSave
          }
          aria-label={
            isSaved
              ? "Unsave reel"
              : "Save reel"
          }
        >
          <span className="reel-action-icon">
            <ReelIcon
              name="save"
              filled={isSaved}
            />
          </span>

          <span>
            {isSaved
              ? "Saved"
              : "Save"}
          </span>
        </button>

        {/* ===============================================
            VIEWS

            DISPLAY ONLY.

            NO VIEW API REQUEST HERE.
        =============================================== */}

        <div
          className="reel-action reel-views"
          aria-label={`${views} views`}
        >
          <span className="reel-action-icon">
            <ReelIcon
              name="views"
            />
          </span>

          <span>
            {views}
          </span>
        </div>

        {/* ===============================================
            MORE
        =============================================== */}

        <div
          className="reel-more-wrapper"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            className={`reel-action reel-more-button ${
              showMenu
                ? "active"
                : ""
            }`}
            onClick={
              handleMenuToggle
            }
            aria-label="More options"
            aria-expanded={
              showMenu
            }
            aria-haspopup="dialog"
          >
            <span className="reel-action-icon">
              <ReelIcon
                name="more"
              />
            </span>
          </button>
        </div>
      </div>

      {/* =================================================
          INSTAGRAM-STYLE BOTTOM SHEET
      ================================================= */}

      {showMenu && (
        <div
          className="reel-more-menu"
          role="dialog"
          aria-label="More options"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {/* =============================================
              HANDLE
          ============================================= */}

          <div className="reel-more-menu-handle" />

          {/* =============================================
              HEADER
          ============================================= */}

          <div className="reel-more-menu-header">
            <strong>
              More options
            </strong>

            <button
              type="button"
              className="reel-more-menu-close"
              onClick={() =>
                setShowMenu(false)
              }
              aria-label="Close menu"
            >
              <ReelIcon
                name="close"
              />
            </button>
          </div>

          {/* =============================================
              DIVIDER
          ============================================= */}

          <div className="reel-more-menu-divider" />

          {/* =============================================
              REPORT
          ============================================= */}

          <button
            type="button"
            className="reel-more-menu-item reel-report-item"
            onClick={
              handleReport
            }
          >
            <span className="reel-more-menu-item-icon">
              <ReelIcon
                name="report"
              />
            </span>

            <span>
              Report
            </span>
          </button>

          {/* =============================================
              ABOUT ACCOUNT
          ============================================= */}

          <button
            type="button"
            className="reel-more-menu-item"
            onClick={
              handleAboutAccount
            }
          >
            <span className="reel-more-menu-item-icon">
              <ReelIcon
                name="account"
              />
            </span>

            <span>
              About this account
            </span>
          </button>

          {/* =============================================
              CANCEL
          ============================================= */}

          <button
            type="button"
            className="reel-more-menu-cancel"
            onClick={() =>
              setShowMenu(false)
            }
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  );
};

export default ReelCard;
