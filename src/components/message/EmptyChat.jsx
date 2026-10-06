import React from "react";

const EmptyChat = ({
  title = "Your Messages",
  description = "Select a conversation to start chatting with someone.",
  onNewMessage,
}) => {
  return (
    <div className="empty-chat">

      {/* Icon */}
      <div className="empty-chat-icon">
        💬
      </div>

      {/* Content */}
      <div className="empty-chat-content">
        <h2>{title}</h2>

        <p>{description}</p>

        {/* New Message Button */}
        {onNewMessage && (
          <button
            type="button"
            className="empty-chat-button"
            onClick={onNewMessage}
          >
            ✎ New Message
          </button>
        )}
      </div>

    </div>
  );
};

export default EmptyChat;