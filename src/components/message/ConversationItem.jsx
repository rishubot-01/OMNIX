
import React from "react";

const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
}) => {
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
  |
  | ConversationList se currentUserId aa raha hai.
  |
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
  |
  | Backend:
  |
  | participants: [
  |   currentUser,
  |   otherUser
  | ]
  |
  | Agar ConversationList ne already user bana diya hai
  | to wahi use hoga.
  |
  */

  const participants =
    Array.isArray(
      conversation?.participants
    )
      ? conversation.participants
      : [];

  const participantUser =
    participants.find(
      (participant) => {
        const participantId =
          participant?._id ||
          participant?.id ||
          participant;

        /*
         * Current user ko skip karo.
         */

        if (
          currentUserId &&
          String(participantId) ===
            String(currentUserId)
        ) {
          return false;
        }

        return true;
      }
    ) || {};

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

  const username =
    user?.username ||
    "";

  const avatar =
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    "/assets/images/default-avatar.png";

  /*
  |--------------------------------------------------------------------------
  | Online Status
  |--------------------------------------------------------------------------
  */

  const isOnline =
    Boolean(
      user?.online ||
      user?.isOnline
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
      typeof conversation?.lastMessage ===
      "string"
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

  const unreadCount =
    Number(
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
    formatConversationTime(
      lastMessageTime
    );

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <button
      type="button"
      className={`conversation-item ${
        isSelected
          ? "conversation-item-active"
          : ""
      }`}
      onClick={onClick}
      data-conversation-id={
        conversationId
      }
    >

      {/* ======================================================
          Avatar
      ======================================================= */}

      <div className="conversation-avatar-wrapper">

        <img
          src={avatar}
          alt={name}
          className="conversation-avatar"
          onError={(event) => {
            event.currentTarget.src =
              "/assets/images/default-avatar.png";
          }}
        />

        {isOnline && (
          <span className="online-status" />
        )}

      </div>

      {/* ======================================================
          Conversation Information
      ======================================================= */}

      <div className="conversation-info">

        {/* ----------------------------------------------------
            Top
        ----------------------------------------------------- */}

        <div className="conversation-top">

          <h4>
            {name}
          </h4>

          {formattedTime && (
            <span className="conversation-time">
              {formattedTime}
            </span>
          )}

        </div>

        {/* ----------------------------------------------------
            Bottom
        ----------------------------------------------------- */}

        <div className="conversation-bottom">

          <p className="conversation-last-message">
            {lastMessage}
          </p>

          {unreadCount > 0 && (
            <span className="unread-count">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}

        </div>

        {/* ----------------------------------------------------
            Username
        ----------------------------------------------------- */}

        {username && (
          <span className="sr-only">
            @{username.replace(
              "@",
              ""
            )}
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

function formatConversationTime(
  date
) {
  if (!date) {
    return "";
  }

  /*
   * Backend agar already formatted
   * time bhej raha hai.
   *
   * Example:
   * "10:30 PM"
   */

  if (
    typeof date === "string" &&
    !date.includes("-") &&
    !date.includes("T") &&
    !date.includes("Z")
  ) {
    return date;
  }

  const conversationDate =
    new Date(date);

  if (
    Number.isNaN(
      conversationDate.getTime()
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const diff =
    now.getTime() -
    conversationDate.getTime();

  /*
   * Future date ko "Now" show karo.
   */

  if (diff < 0) {
    return "Now";
  }

  const minutes =
    Math.floor(
      diff /
        (1000 * 60)
    );

  const hours =
    Math.floor(
      diff /
        (1000 * 60 * 60)
    );

  const days =
    Math.floor(
      diff /
        (1000 * 60 * 60 * 24)
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
