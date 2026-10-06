import React from "react";

const TypingIndicator = ({
  userName = "User",
  isTyping = false,
  avatar = "/assets/images/default-avatar.png",
}) => {
  if (!isTyping) {
    return null;
  }

  return (
    <div className="typing-indicator">
      
      {/* User Avatar */}
      <div className="typing-avatar">
        <img
          src={avatar}
          alt={userName}
        />
      </div>

      {/* Typing Bubble */}
      <div className="typing-content">
        <div className="typing-bubble">

          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>

        </div>

        <span className="typing-text">
          {userName} is typing...
        </span>
      </div>

    </div>
  );
};

export default TypingIndicator;