import React, {
  useEffect,
  useRef,
  useState,
} from "react";

const MessageHeader = ({
  conversation,
  onBack,
  onVoiceCall,
  onVideoCall,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreMenuRef = useRef(null);

  if (!conversation) {
    return null;
  }

  /* ----------------------------------------------------------
     Other User
  ---------------------------------------------------------- */

  const user =
    conversation?.user ||
    conversation?.participant ||
    conversation?.otherUser ||
    {};

  /* ----------------------------------------------------------
     User ID
  ---------------------------------------------------------- */

  const userId =
    user?._id ||
    user?.id ||
    "";

  /* ----------------------------------------------------------
     User Name
  ---------------------------------------------------------- */

  const name =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "OMNIX User";

  /* ----------------------------------------------------------
     Username
  ---------------------------------------------------------- */

  const username =
    user?.username ||
    "";

  /* ----------------------------------------------------------
     Avatar
  ---------------------------------------------------------- */

  const avatar =
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    "/assets/images/default-avatar.png";

  /* ----------------------------------------------------------
     Online Status
  ---------------------------------------------------------- */

  const isOnline = Boolean(
    user?.online ||
    user?.isOnline
  );

  /* ----------------------------------------------------------
     Close More Menu On Outside Click
  ---------------------------------------------------------- */

  useEffect(() => {
    if (!showMoreMenu) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(
          event.target
        )
      ) {
        setShowMoreMenu(false);
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
  }, [showMoreMenu]);

  /* ----------------------------------------------------------
     Open Profile
  ---------------------------------------------------------- */

  const handleProfileClick = () => {
    // Future profile navigation
  };

  /* ----------------------------------------------------------
     Back
  ---------------------------------------------------------- */

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    window.history.back();
  };

  /* ----------------------------------------------------------
     Voice Call
  ---------------------------------------------------------- */

  const handleVoiceCall = () => {
    if (!userId) {
      console.error(
        "Voice call failed: user ID not found."
      );
      return;
    }

    if (onVoiceCall) {
      onVoiceCall({
        userId: String(userId),
        user,
        conversation,
      });

      return;
    }

    console.warn(
      "onVoiceCall handler is not connected."
    );
  };

  /* ----------------------------------------------------------
     Video Call
  ---------------------------------------------------------- */

  const handleVideoCall = () => {
    if (!userId) {
      console.error(
        "Video call failed: user ID not found."
      );
      return;
    }

    if (onVideoCall) {
      onVideoCall({
        userId: String(userId),
        user,
        conversation,
      });

      return;
    }

    console.warn(
      "onVideoCall handler is not connected."
    );
  };

  /* ----------------------------------------------------------
     More Options
  ---------------------------------------------------------- */

  const handleMoreOptions = () => {
    setShowMoreMenu(
      (previous) => !previous
    );
  };

  /* ----------------------------------------------------------
     Restrict
  ---------------------------------------------------------- */

  const handleRestrict = () => {
    console.log(
      "Restrict user:",
      userId
    );

    setShowMoreMenu(false);
  };

  /* ----------------------------------------------------------
     Block
  ---------------------------------------------------------- */

  const handleBlock = () => {
    console.log(
      "Block user:",
      userId
    );

    setShowMoreMenu(false);
  };

  /* ----------------------------------------------------------
     Report
  ---------------------------------------------------------- */

  const handleReport = () => {
    console.log(
      "Report user:",
      userId
    );

    setShowMoreMenu(false);
  };

  /* ----------------------------------------------------------
     Render
  ---------------------------------------------------------- */

  return (
    <div className="message-header">

      {/* ======================================================
          User Information
      ======================================================= */}

      <div className="message-user-info">

        {/* Back Button */}

        <button
          type="button"
          className="message-back-button"
          title="Back to conversations"
          aria-label="Back to conversations"
          onClick={handleBack}
        >
          ←
        </button>

        {/* Avatar */}

        <button
          type="button"
          onClick={handleProfileClick}
          className="message-header-avatar-button"
          aria-label={`Open ${name}'s profile`}
        >
          <div className="message-header-avatar-wrapper">

            <img
              src={avatar}
              alt={name}
              className="message-header-avatar"
              onError={(event) => {
                event.currentTarget.src =
                  "/assets/images/default-avatar.png";
              }}
            />

            {/* Green dot ONLY when online */}

            {isOnline && (
              <span className="message-header-online" />
            )}

          </div>
        </button>

        {/* Name + Username */}

        <button
          type="button"
          onClick={handleProfileClick}
          className="message-user-details"
          aria-label={`Open ${name}'s profile`}
        >

          <h3>
            {name}
          </h3>

          {username && (
            <span className="text-xs text-gray-400">
              @{String(username).replace(/^@/, "")}
            </span>
          )}

        </button>

      </div>


      {/* ======================================================
          Header Actions
      ======================================================= */}

      <div className="message-header-actions">

        {/* ==================================================
            Voice Call
        =================================================== */}

        <button
          type="button"
          className="message-header-button"
          title="Voice Call"
          aria-label={`Voice call ${name}`}
          onClick={handleVoiceCall}
        >
          📞
        </button>


        {/* ==================================================
            Video Call
        =================================================== */}

        <button
          type="button"
          className="message-header-button"
          title="Video Call"
          aria-label={`Video call ${name}`}
          onClick={handleVideoCall}
        >
          🎥
        </button>


        {/* ==================================================
            More Options
        =================================================== */}

        <div
          className="message-header-more-wrapper"
          ref={moreMenuRef}
        >

          <button
            type="button"
            className={`message-header-button ${
              showMoreMenu
                ? "active"
                : ""
            }`}
            title="More Options"
            aria-label="More options"
            aria-expanded={showMoreMenu}
            onClick={handleMoreOptions}
          >
            ⋮
          </button>


          {/* ==================================================
              MORE OPTIONS MENU
          =================================================== */}

          {showMoreMenu && (
            <div
              className="message-header-more-menu"
              role="menu"
            >

              {/* Restrict */}

              <button
                type="button"
                className="message-header-more-item"
                onClick={handleRestrict}
                role="menuitem"
              >
                <span
                  className="message-header-more-icon"
                  aria-hidden="true"
                >
                  🚫
                </span>

                <span>
                  Restrict
                </span>
              </button>


              {/* Block */}

              <button
                type="button"
                className="message-header-more-item"
                onClick={handleBlock}
                role="menuitem"
              >
                <span
                  className="message-header-more-icon"
                  aria-hidden="true"
                >
                  ⛔
                </span>

                <span>
                  Block
                </span>
              </button>


              {/* Report */}

              <button
                type="button"
                className="message-header-more-item report"
                onClick={handleReport}
                role="menuitem"
              >
                <span
                  className="message-header-more-icon"
                  aria-hidden="true"
                >
                  ⚠️
                </span>

                <span>
                  Report
                </span>
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MessageHeader;