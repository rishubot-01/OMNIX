import React, {
  useEffect,
  useRef,
} from "react";

import MessageItem from "./MessageItem";

const MessageList = ({
  conversation,
  messages = [],
  loading = false,
  currentUserId = null,
  onDeleteMessage = null,
  onUpdateMessage = null,
  onReplyMessage = null,
}) => {
  const messagesEndRef = useRef(null);

  /* 
  |--------------------------------------------------------------------------
  | Other User
  |--------------------------------------------------------------------------
  */

  const user =
    conversation?.user ||
    conversation?.participant ||
    conversation?.otherUser ||
    {};

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "OMNIX User";

  /*
  |--------------------------------------------------------------------------
  | Resolve Current User ID
  |--------------------------------------------------------------------------
  |
  | Priority:
  |
  | 1. currentUserId prop
  | 2. conversation.currentUserId
  | 3. conversation.me._id
  | 4. conversation.me.id
  |
  */

  const resolvedCurrentUserId =
    currentUserId ||
    conversation?.currentUserId ||
    conversation?.me?._id ||
    conversation?.me?.id ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Scroll To Latest Message
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
  |--------------------------------------------------------------------------
  | No Conversation
  |--------------------------------------------------------------------------
  */

  if (!conversation) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="message-list">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-gray-950" />

            <p className="mt-3 text-sm text-gray-500">
              Loading messages...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty Conversation
  |--------------------------------------------------------------------------
  */

  if (!messages.length) {
    return (
      <div className="message-list">
        <div className="no-messages">
          <div className="no-messages-icon">
            💬
          </div>

          <h3>
            No messages yet
          </h3>

          <p>
            Start a conversation with{" "}
            {userName}.
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize ID
  |--------------------------------------------------------------------------
  |
  | Handles:
  |
  | String
  | MongoDB ObjectId
  | Populated User object
  |
  */

  const normalizeId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      if (value._id) {
        return String(value._id);
      }

      if (value.id) {
        return String(value.id);
      }

      return null;
    }

    return String(value);
  };

  /*
  |--------------------------------------------------------------------------
  | Current User ID
  |--------------------------------------------------------------------------
  */

  const normalizedCurrentUserId =
    normalizeId(resolvedCurrentUserId);

  /*
  |--------------------------------------------------------------------------
  | Render Messages
  |--------------------------------------------------------------------------
  */

  return (
    <div className="message-list">

      {/* ================================================================
          Date Separator
      ================================================================= */}

      <div className="message-date">
        <span>
          Today
        </span>
      </div>

      {/* ================================================================
          Messages Container
      ================================================================= */}

      <div className="messages-container">

        {messages.map(
          (message, index) => {

            /*
            |--------------------------------------------------------------------------
            | Message ID
            |--------------------------------------------------------------------------
            */

            const messageId =
              message?._id ||
              message?.id ||
              `message-${index}`;

            /*
            |--------------------------------------------------------------------------
            | Sender
            |--------------------------------------------------------------------------
            |
            | Backend:
            |
            | senderId
            |
            | senderId can be:
            | String/ObjectId
            | OR
            | Populated User object
            |
            */

            const sender =
              message?.senderId ??
              message?.sender ??
              null;

            /*
            |--------------------------------------------------------------------------
            | Sender ID
            |--------------------------------------------------------------------------
            */

            const senderId =
              normalizeId(sender);

            /*
            |--------------------------------------------------------------------------
            | Own Message
            |--------------------------------------------------------------------------
            |
            | senderId === currentUserId
            |
            | true  = current user's message
            | false = other user's message
            |
            */

            const isOwn =
              Boolean(
                senderId &&
                normalizedCurrentUserId &&
                senderId ===
                  normalizedCurrentUserId
              );

            /*
            |--------------------------------------------------------------------------
            | Message Type
            |--------------------------------------------------------------------------
            */

            const rawType =
              message?.messageType ||
              message?.type ||
              "TEXT";

            let normalizedType =
              String(
                rawType
              ).toLowerCase();

            /*
            |--------------------------------------------------------------------------
            | Media Compatibility
            |--------------------------------------------------------------------------
            */

            if (
              normalizedType === "text" &&
              message?.mediaUrl
            ) {
              const mediaUrl =
                String(
                  message.mediaUrl
                ).toLowerCase();

              if (
                mediaUrl.endsWith(".jpg") ||
                mediaUrl.endsWith(".jpeg") ||
                mediaUrl.endsWith(".png") ||
                mediaUrl.endsWith(".gif") ||
                mediaUrl.endsWith(".webp")
              ) {
                normalizedType =
                  "image";
              }
            }

            /*
            |--------------------------------------------------------------------------
            | Content
            |--------------------------------------------------------------------------
            */

            const content =
              message?.content ??
              message?.mediaUrl ??
              "";

            /*
            |--------------------------------------------------------------------------
            | Created At
            |--------------------------------------------------------------------------
            */

            const createdAt =
              message?.createdAt ||
              message?.created_at ||
              null;

            /*
            |--------------------------------------------------------------------------
            | Read Status
            |--------------------------------------------------------------------------
            */

            const isRead =
              Boolean(
                message?.isRead
              );

            /*
            |--------------------------------------------------------------------------
            | Normalized Message
            |--------------------------------------------------------------------------
            */

            const normalizedMessage = {
              ...message,

              id: messageId,

              content,

              type:
                normalizedType,

              messageType:
                message?.messageType ||
                String(
                  normalizedType
                ).toUpperCase(),

              createdAt,

              isRead,
            };

            /*
            |--------------------------------------------------------------------------
            | Message Item
            |--------------------------------------------------------------------------
            */

            return (
              <MessageItem
                key={messageId}
                message={
                  normalizedMessage
                }
                isOwn={isOwn}
                user={user}
                onDelete={
                  onDeleteMessage
                }
                onEdit={
                  onUpdateMessage
                }

                /*
                |--------------------------------------------------------------------------
                | Reply
                |--------------------------------------------------------------------------
                |
                | MessageItem already calls:
                |
                | onReply(message)
                |
                | So we simply forward the handler
                | from Messages.jsx.
                |
                */

                onReply={
                  onReplyMessage
                }
              />
            );
          }
        )}

        {/* ==============================================================
            Scroll Target
        ============================================================== */}

        <div
          ref={messagesEndRef}
        />

      </div>
    </div>
  );
};

export default MessageList;