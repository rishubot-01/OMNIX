import React from "react";

/* =========================================================
   OMNIX REEL INFO
   Instagram-style bottom-left Reel information
   ========================================================= */

const ReelInfo = ({
  reel,
  onUserClick,
  onFollow,
}) => {
  if (!reel) {
    return null;
  }

  const user = reel.user || {};

  /* =========================================================
     USER DATA
     ========================================================= */

  const username =
    user.username ||
    user.name ||
    "Unknown User";

  const fullName =
    user.fullName ||
    user.name ||
    "";

  const avatar =
    user.avatar ||
    user.profileImage ||
    "/default-avatar.png";

  const caption =
    reel.caption || "";

  /* =========================================================
     FOLLOW STATE
     ========================================================= */

  const isFollowing = Boolean(
    user.isFollowing ||
    user.following
  );

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
        year: "numeric",
      }
    );
  };

  /* =========================================================
     FORMAT DURATION
     ========================================================= */

  const formatDuration = (
    duration
  ) => {
    if (
      duration === undefined ||
      duration === null ||
      Number.isNaN(
        Number(duration)
      )
    ) {
      return "";
    }

    const totalSeconds =
      Math.max(
        0,
        Math.floor(
          Number(duration)
        )
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${minutes}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  /* =========================================================
     USER CLICK
     ========================================================= */

  const handleUserClick = (
    event
  ) => {
    event.stopPropagation();

    if (onUserClick) {
      onUserClick(user);
    }
  };

  /* =========================================================
     FOLLOW
     ========================================================= */

  const handleFollow = (
    event
  ) => {
    event.stopPropagation();

    if (onFollow) {
      onFollow(user);
    }
  };

  /* =========================================================
     AVATAR ERROR
     ========================================================= */

  const handleAvatarError = (
    event
  ) => {
    event.currentTarget.src =
      "/default-avatar.png";
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="reel-info">

      {/* =================================================
          USER ROW
      ================================================= */}

      <div className="reel-info-user">

        {/* PROFILE */}

        <button
          type="button"
          className="reel-info-user-button"
          onClick={
            handleUserClick
          }
          aria-label={`Open ${username}'s profile`}
        >

          <img
            src={avatar}
            alt={username}
            className="reel-info-avatar"
            onError={
              handleAvatarError
            }
          />

          <div className="reel-info-user-text">

            <div className="reel-info-username-row">

              <span className="reel-info-username">
                @{username}
              </span>

              {user.isVerified && (
                <span
                  className="reel-info-verified"
                  aria-label="Verified account"
                >
                  ✓
                </span>
              )}

            </div>

            {fullName &&
              fullName !==
                username && (
                <span className="reel-info-fullname">
                  {fullName}
                </span>
              )}

          </div>

        </button>

        {/* FOLLOW */}

        {onFollow && (
          <button
            type="button"
            className={`reel-info-follow-button ${
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

      {/* =================================================
          CAPTION
      ================================================= */}

      {caption && (
        <p className="reel-info-caption">
          {caption}
        </p>
      )}

      {/* =================================================
          META
      ================================================= */}

      {(reel.duration !==
        undefined ||
        reel.createdAt) && (
        <div className="reel-info-meta">

          {reel.duration !==
            undefined &&
            reel.duration !==
              null && (
              <span className="reel-info-duration">
                {formatDuration(
                  reel.duration
                )}
              </span>
            )}

          {reel.createdAt && (
            <span className="reel-info-date">
              {formatDate(
                reel.createdAt
              )}
            </span>
          )}

        </div>
      )}

    </div>
  );
};

export default ReelInfo;