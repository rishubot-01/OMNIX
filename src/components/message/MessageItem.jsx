import React, { useState } from "react";

const DEFAULT_AVATAR =
  "/assets/images/default-avatar.png";

const MessageItem = ({
  message,
  isOwn,
  user,
  onDelete = null,
  onEdit = null,
  onReply = null,
  onEmoji = null,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  if (!message) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Message Type
  |--------------------------------------------------------------------------
  */

  const rawMessageType =
    message?.messageType ||
    message?.type ||
    "TEXT";

  const messageType =
    String(rawMessageType).toLowerCase();

  /*
  |--------------------------------------------------------------------------
  | Message Content
  |--------------------------------------------------------------------------
  */

  const content =
    message?.content ??
    message?.text ??
    message?.mediaUrl ??
    "";

  /*
  |--------------------------------------------------------------------------
  | Sender Information
  |--------------------------------------------------------------------------
  */

  const sender =
    message?.senderId ||
    message?.sender ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Sender Name
  |--------------------------------------------------------------------------
  */

  const senderName =
    typeof sender === "object"
      ? (
          sender?.fullName ||
          sender?.name ||
          sender?.username
        )
      : null;

  const displayName =
    senderName ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "User";

  /*
  |--------------------------------------------------------------------------
  | Sender Avatar
  |--------------------------------------------------------------------------
  */

  const senderAvatar =
    (
      typeof sender === "object"
        ? (
            sender?.avatar ||
            sender?.profileImage ||
            sender?.profilePicture
          )
        : ""
    ) ||
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    DEFAULT_AVATAR;

  /*
  |--------------------------------------------------------------------------
  | Message Time
  |--------------------------------------------------------------------------
  */

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const date = new Date(time);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(time);
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Message Type Helpers
  |--------------------------------------------------------------------------
  */

  const isText =
    messageType === "text";

  const isImage =
    messageType === "image";

  const isFile =
    messageType === "file";

  const isCall =
    messageType === "call";

  /*
  |--------------------------------------------------------------------------
  | Call Information
  |--------------------------------------------------------------------------
  */

  const rawCallType =
    message?.callType ||
    message?.call?.callType ||
    message?.call?.type ||
    "";

  const callType =
    String(rawCallType).toLowerCase();

  const isVoiceCall =
    callType === "audio" ||
    callType === "voice";

  const isVideoCall =
    callType === "video";

  /*
  |--------------------------------------------------------------------------
  | Call Status
  |--------------------------------------------------------------------------
  */

  const callStatus =
    String(
      message?.callStatus ||
      message?.call?.callStatus ||
      message?.call?.status ||
      ""
    ).toLowerCase();

  const isMissedCall =
    isCall &&
    (
      callStatus === "missed" ||
      !callStatus
    );

  /*
  |--------------------------------------------------------------------------
  | Call Display Text
  |--------------------------------------------------------------------------
  |
  | Backend content ko priority di gayi hai.
  | Agar content available nahi hai to frontend khud
  | proper missed-call text create karega.
  |
  */

  const getCallText = () => {
    if (content) {
      return content;
    }

    if (isVideoCall) {
      return `🎥 Missed video call${displayName ? ` from ${displayName}` : ""}`;
    }

    return `📞 Missed voice call${displayName ? ` from ${displayName}` : ""}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Message
  |--------------------------------------------------------------------------
  */

  const startEditing = () => {
    setEditContent(
      message?.content ??
      message?.text ??
      ""
    );

    setIsEditing(true);
    setShowOptions(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);

    setEditContent(
      message?.content ??
      message?.text ??
      ""
    );
  };

  const saveEdit = () => {
    const updatedContent =
      editContent.trim();

    if (!updatedContent) {
      return;
    }

    if (onEdit) {
      onEdit(
        message?._id ||
        message?.id,
        updatedContent
      );
    }

    setIsEditing(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Message
  |--------------------------------------------------------------------------
  */

  const handleDelete = () => {
    setShowOptions(false);

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this message?"
      );

    if (!confirmed) {
      return;
    }

    if (onDelete) {
      onDelete(
        message?._id ||
        message?.id
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reply
  |--------------------------------------------------------------------------
  */

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Emoji
  |--------------------------------------------------------------------------
  */

  const handleEmoji = () => {
    if (onEmoji) {
      onEmoji(message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`message-item ${
        isOwn
          ? "message-item-own"
          : "message-item-other"
      }`}
    >

      {/* ================================================================
          Received Message Avatar
      ================================================================= */}

      {!isOwn && (
        <div className="message-item-avatar">
          <img
            src={senderAvatar}
            alt={displayName}
            onError={(event) => {
              event.currentTarget.src =
                DEFAULT_AVATAR;
            }}
          />
        </div>
      )}

      {/* ================================================================
          Message Content
      ================================================================= */}

      <div className="message-content-wrapper">

        {/* ================================================================
            Hover Actions
            Order: 3 Dot -> Reply -> Emoji
        ================================================================= */}

        <div className="message-hover-actions">

          {/* 3 Dot - Existing Edit/Delete */}

          {isOwn &&
            (onEdit || onDelete) && (
              <div className="message-options-wrapper">

                <button
                  type="button"
                  className="message-hover-action-button"
                  onClick={() =>
                    setShowOptions(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label="Message options"
                  title="More"
                >
                  ⋮
                </button>

                {showOptions && (
                  <div className="message-options-menu">

                    {/* Edit */}

                    {isText && onEdit && (
                      <button
                        type="button"
                        onClick={startEditing}
                      >
                        Edit
                      </button>
                    )}

                    {/* Delete */}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    )}

                  </div>
                )}

              </div>
            )}

          {/* Reply */}

          <button
            type="button"
            className="message-hover-action-button"
            onClick={handleReply}
            aria-label="Reply"
            title="Reply"
          >
            ↩
          </button>

          {/* Emoji */}

          <button
            type="button"
            className="message-hover-action-button"
            onClick={handleEmoji}
            aria-label="Add reaction"
            title="Emoji"
          >
            😊
          </button>

        </div>

        {/* ================================================================
            Message Bubble
        ================================================================= */}

        <div
          className={`message-bubble ${
            isOwn
              ? "message-bubble-own"
              : "message-bubble-other"
          }`}
        >

          {/* ------------------------------------------------------------
              Text Message
          ------------------------------------------------------------- */}

          {isText && !isEditing && (
            <p className="message-text">
              {content}
            </p>
          )}

          {/* ------------------------------------------------------------
              Edit Message
          ------------------------------------------------------------- */}

          {isText && isEditing && (
            <div className="message-edit-box">

              <textarea
                value={editContent}
                onChange={(event) =>
                  setEditContent(
                    event.target.value
                  )
                }
                className="message-edit-input"
                rows={3}
                autoFocus
              />

              <div className="message-edit-actions">

                <button
                  type="button"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                >
                  Save
                </button>

              </div>

            </div>
          )}

          {/* ------------------------------------------------------------
              Image Message
          ------------------------------------------------------------- */}

          {isImage && (
            <img
              src={content}
              alt="Shared"
              className="message-image"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          )}

          {/* ------------------------------------------------------------
              File Message
          ------------------------------------------------------------- */}

          {isFile && (
            <a
              href={content}
              target="_blank"
              rel="noopener noreferrer"
              className="message-file"
            >
              📎 View File
            </a>
          )}

          {/* ------------------------------------------------------------
              CALL Message
          ------------------------------------------------------------- */}

          {isCall && (
            <div
              className={`message-call ${
                isVideoCall
                  ? "message-call-video"
                  : "message-call-audio"
              }`}
            >

              <div className="message-call-icon">
                {isVideoCall
                  ? "🎥"
                  : "📞"}
              </div>

              <div className="message-call-info">

                <p className="message-call-title">
                  {isVideoCall
                    ? "Video call"
                    : "Voice call"}
                </p>

                <p className="message-call-text">
                  {getCallText()}
                </p>

                {isMissedCall && (
                  <span className="message-call-status">
                    Missed
                  </span>
                )}

              </div>

            </div>
          )}

          {/* ------------------------------------------------------------
              Unknown Message Type
          ------------------------------------------------------------- */}

          {!isText &&
            !isImage &&
            !isFile &&
            !isCall && (
              <p className="message-text">
                {content}
              </p>
            )}

        </div>

        {/* ================================================================
            Message Meta
        ================================================================= */}

        <div className="message-meta">

          <span className="message-time">
            {formatTime(
              message?.createdAt ||
              message?.timestamp
            )}
          </span>

          {/* Sent Message Status */}

          {isOwn && (
            <span
              className={`message-status ${
                message?.isRead
                  ? "message-seen"
                  : "message-delivered"
              }`}
              title={
                message?.isRead
                  ? "Seen"
                  : "Delivered"
              }
            >
              {message?.isRead
                ? "✓✓"
                : "✓"}
            </span>
          )}

        </div>

      </div>
    </div>
  );
};

export default MessageItem;