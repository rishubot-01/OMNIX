import React, { useRef } from "react";

const MessageActions = ({
  onEmojiClick,
  onFileSelect,
  onImageSelect,
  onGifClick,
  onMoreClick,
}) => {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (onFileSelect) {
      onFileSelect(file);
    }

    event.target.value = "";
  };

  const handleImageChange = (event) => {
    const image = event.target.files?.[0];

    if (!image) {
      return;
    }

    if (onImageSelect) {
      onImageSelect(image);
    }

    event.target.value = "";
  };

  return (
    <div className="message-actions">

      {/* Emoji */}
      <button
        type="button"
        className="message-action-button"
        title="Emoji"
        onClick={onEmojiClick}
      >
        😊
      </button>

      {/* File */}
      <button
        type="button"
        className="message-action-button"
        title="Attach File"
        onClick={() => fileInputRef.current?.click()}
      >
        📎
      </button>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
      />

      {/* Image */}
      <button
        type="button"
        className="message-action-button"
        title="Send Image"
        onClick={() => imageInputRef.current?.click()}
      >
        🖼️
      </button>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />

      {/* GIF */}
      <button
        type="button"
        className="message-action-button"
        title="GIF"
        onClick={onGifClick}
      >
        GIF
      </button>

      {/* More */}
      <button
        type="button"
        className="message-action-button"
        title="More"
        onClick={onMoreClick}
      >
        ⋮
      </button>

    </div>
  );
};

export default MessageActions;