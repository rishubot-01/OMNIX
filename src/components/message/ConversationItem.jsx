
import React, { useState } from "react";

const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!conversation) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Conversation ID
  |--------------------------------------------------------------------------
  */

  const conversationId =
    conversation?._id ||
    conversation?.id;

  /*
  |--------------------------------------------------------------------------
  | Current User ID
  |--------------------------------------------------------------------------
  */

  const currentUserId =
    conversation?.currentUserId ||
    conversation?.me?._id ||
    conversation?.me?.id ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Find Other User
  |--------------------------------------------------------------------------
  */

  const participants = Array.isArray(
    conversation?.participants
  )
    ? conversation.participants
    : [];

  const participantUser =
    participants.find((participant) => {
      const participantId =
        participant?._id ||
        participant?.id ||
        participant;

      if (
        currentUserId &&
        String(participantId) === String(currentUserId)
      ) {
        return false;
      }

      return true;
    }) || {};

  const user =
    conversation?.user ||
    conversation?.participant ||
    conversation?.otherUser ||
    participantUser;

  /*
  |--------------------------------------------------------------------------
  | User Information
  |--------------------------------------------------------------------------
  */

  const name =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "OMNIX User";

  const username = user?.username || "";

  const avatar =
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    "";

  /*
  |--------------------------------------------------------------------------
  | Dynamic Avatar Initial
  |--------------------------------------------------------------------------
  */

  const initial =
    String(name).trim().charAt(0).toUpperCase() || "U";

  /*
  |--------------------------------------------------------------------------
  | Online Status
  |--------------------------------------------------------------------------
  */

  const isOnline = Boolean(
    user?.online || user?.isOnline
  );

  /*
  |--------------------------------------------------------------------------
  | Last Message
  |--------------------------------------------------------------------------
  */

  const lastMessage =
    conversation?.lastMessage?.content ||
    conversation?.lastMessage?.text ||
    (
      typeof conversation?.lastMessage === "string"
        ? conversation.lastMessage
        : ""
    ) ||
    "Start a conversation";

  /*
  |--------------------------------------------------------------------------
  | Last Message Time
  |--------------------------------------------------------------------------
  */

  const lastMessageTime =
    conversation?.lastMessageTime ||
    conversation?.lastMessage?.createdAt ||
    conversation?.updatedAt ||
    "";

  /*
  |--------------------------------------------------------------------------
  | Unread Count
  |--------------------------------------------------------------------------
  */

  const unreadCount = Number(
    conversation?.unreadCount ||
    conversation?.unreadMessages ||
    0
  );

  /*
  |--------------------------------------------------------------------------
  | Format Time
  |--------------------------------------------------------------------------
  */

  const formattedTime =
    formatConversationTime(lastMessageTime);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <button
      type="button"
      className={`conversation-item ${
        isSelected ? "conversation-item-active" : ""
      }`}
      onClick={onClick}
      data-conversation-id={conversationId}
    >
      {/* Avatar */}

      <div className="conversation-avatar-wrapper">
        {avatar && !imageFailed ? (
          <img
            src={avatar}
            alt={`${name} profile`}
            className="conversation-avatar"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="conversation-avatar conversation-avatar-fallback"
            role="img"
            aria-label={`${name} profile`}
          >
            {initial}
          </div>
        )}

        {isOnline && (
          <span className="online-status" />
        )}
      </div>

      {/* Conversation Information */}

      <div className="conversation-info">
        <div className="conversation-top">
          <h4>{name}</h4>

          {formattedTime && (
            <span className="conversation-time">
              {formattedTime}
            </span>
          )}
        </div>

        <div className="conversation-bottom">
          <p className="conversation-last-message">
            {lastMessage}
          </p>

          {unreadCount > 0 && (
            <span className="unread-count">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {username && (
          <span className="sr-only">
            @{username.replace("@", "")}
          </span>
        )}
      </div>
    </button>
  );
};

/*
|--------------------------------------------------------------------------
| Format Conversation Time
|--------------------------------------------------------------------------
*/

function formatConversationTime(date) {
  if (!date) {
    return "";
  }

  // Already formatted time, e.g. "10:30 PM"
  if (
    typeof date === "string" &&
    !date.includes("-") &&
    !date.includes("T") &&
    !date.includes("Z")
  ) {
    return date;
  }

  const conversationDate = new Date(date);

  if (Number.isNaN(conversationDate.getTime())) {
    return "";
  }

  const now = new Date();

  const diff =
    now.getTime() - conversationDate.getTime();

  if (diff < 0) {
    return "Now";
  }

  const minutes = Math.floor(
    diff / (1000 * 60)
  );

  const hours = Math.floor(
    diff / (1000 * 60 * 60)
  );

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "Now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (hours < 24) {
    return `${hours}h`;
  }

  if (days < 7) {
    return `${days}d`;
  }

  return conversationDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}

export default ConversationItem;
