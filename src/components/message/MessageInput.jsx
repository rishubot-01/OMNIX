import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import uploadService from "../../services/upload.service";

const MessageInput = ({
  conversation,
  onSendMessage,
  sending = false,

  /*
  |--------------------------------------------------------------------------
  | Controlled Message
  |--------------------------------------------------------------------------
  |
  | Parent (Messages.jsx) agar message text control karna chahe
  | to ye props use karega.
  |
  */
  value = undefined,
  onChange = null,

  /*
  |--------------------------------------------------------------------------
  | Reply Selection
  |--------------------------------------------------------------------------
  |
  | Parent reply click ke baad input ko focus/select karne ke
  | liye ye signal change kar sakta hai.
  |
  */
  selectInput = false,
}) => {
  const [internalMessage, setInternalMessage] =
    useState("");

  const [showEmoji, setShowEmoji] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const fileInputRef =
    useRef(null);

  const messageInputRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Controlled / Uncontrolled Message
  |--------------------------------------------------------------------------
  */

  const isControlled =
    value !== undefined;

  const message =
    isControlled
      ? String(value ?? "")
      : internalMessage;

  /*
  |--------------------------------------------------------------------------
  | Set Message
  |--------------------------------------------------------------------------
  */

  const setMessage = (nextValue) => {
    /*
     * Agar nextValue function hai to pehle usko
     * current message ke against resolve karo.
     *
     * Isse controlled input mein function parent ke
     * onChange ko directly pass nahi hoga.
     */
    const resolvedValue =
      typeof nextValue === "function"
        ? nextValue(message)
        : nextValue;

    if (isControlled) {
      onChange?.(resolvedValue);
      return;
    }

    setInternalMessage(resolvedValue);
  };

  /*
  |--------------------------------------------------------------------------
  | Emojis
  |--------------------------------------------------------------------------
  */

  const emojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "🔥",
    "😢",
    "😎",
    "🎉",
  ];

  /*
  |--------------------------------------------------------------------------
  | Select Input
  |--------------------------------------------------------------------------
  |
  | Reply button click hone ke baad:
  |
  | 1. Input focus hoga
  | 2. Existing reply text select hoga
  |
  | Example:
  |
  | "Hello Rishu"
  |
  | poora text highlight hoga.
  |
  */

  useEffect(() => {
    if (!selectInput) {
      return;
    }

    /*
     * requestAnimationFrame use kar rahe hain taaki
     * parent se new value render hone ke baad selection ho.
     */
    const frameId =
      requestAnimationFrame(() => {
        const input =
          messageInputRef.current;

        if (!input) {
          return;
        }

        input.focus();

        input.setSelectionRange(
          0,
          input.value.length
        );
      });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    selectInput,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Conversation Check
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | Ye check hooks ke baad hai.
  | Isse Rules of Hooks violate nahi honge.
  |
  */

  if (!conversation) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Send Text Message
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (
      sending ||
      uploading
    ) {
      return;
    }

    try {
      const result =
        await onSendMessage?.(
          trimmedMessage,
          "TEXT"
        );

      /*
       * Parent successfully send karne ke baad
       * input clear kar sakta hai.
       *
       * Agar parent false return kare to message
       * preserve rahega.
       */
      if (result !== false) {
        setMessage("");
        setShowEmoji(false);
      }
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Emoji
  |--------------------------------------------------------------------------
  */

  const handleEmojiClick = (
    emoji
  ) => {
    setMessage(
      (previous) =>
        previous + emoji
    );
  };

  /*
  |--------------------------------------------------------------------------
  | File Button
  |--------------------------------------------------------------------------
  */

  const handleFileClick = () => {
    if (
      sending ||
      uploading
    ) {
      return;
    }

    fileInputRef.current?.click();
  };

  /*
  |--------------------------------------------------------------------------
  | File Change
  |--------------------------------------------------------------------------
  */

  const handleFileChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Reset input so same file
     * can be selected again.
     */
    event.target.value = "";

    console.log(
      "Selected file:",
      file
    );

    /*
    |--------------------------------------------------------------------------
    | Allowed file types
    |--------------------------------------------------------------------------
    */

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedFileTypes = [
      "application/pdf",
    ];

    const isImage =
      allowedImageTypes.includes(
        file.type
      );

    const isPdf =
      allowedFileTypes.includes(
        file.type
      );

    if (
      !isImage &&
      !isPdf
    ) {
      console.error(
        "Unsupported file type:",
        file.type
      );

      return;
    }

    if (
      sending ||
      uploading
    ) {
      return;
    }

    try {
      setUploading(true);
      setShowEmoji(false);

      /*
      |--------------------------------------------------------------------------
      | Upload
      |--------------------------------------------------------------------------
      */

      const response =
        await uploadService.uploadMedia(
          file
        );

      const body =
        response?.data ??
        response;

      const mediaUrl =
        body?.url ||
        body?.data?.url;

      if (!mediaUrl) {
        throw new Error(
          "Media upload succeeded but no media URL was returned."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Message Type
      |--------------------------------------------------------------------------
      */

      const messageType =
        isImage
          ? "IMAGE"
          : "FILE";

      /*
      |--------------------------------------------------------------------------
      | Send Uploaded Media
      |--------------------------------------------------------------------------
      |
      | onSendMessage signature:
      |
      | content,
      | messageType,
      | mediaUrl
      |
      */

      const result =
        await onSendMessage?.(
          "",
          messageType,
          mediaUrl
        );

      if (result === false) {
        throw new Error(
          "Uploaded file could not be sent as a message."
        );
      }
    } catch (error) {
      console.error(
        "Failed to upload/send file:",
        error
      );
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Keyboard
  |--------------------------------------------------------------------------
  |
  | Enter       -> Send
  | Shift+Enter -> New line
  |
  */

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit(event);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="message-input-container">

      {/* ================================================================
          Emoji Picker
      ================================================================= */}

      {showEmoji && (
        <div className="emoji-picker">

          {emojis.map(
            (emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-button"
                onClick={() =>
                  handleEmojiClick(
                    emoji
                  )
                }
                disabled={
                  sending ||
                  uploading
                }
              >
                {emoji}
              </button>
            )
          )}

        </div>
      )}

      {/* ================================================================
          Message Form
      ================================================================= */}

      <form
        className="message-input-form"
        onSubmit={
          handleSubmit
        }
      >

        {/* --------------------------------------------------------------
            Emoji Button
        --------------------------------------------------------------- */}

        <button
          type="button"
          className="input-action-button"
          title="Emoji"
          aria-label="Open emoji picker"
          onClick={() =>
            setShowEmoji(
              (previous) =>
                !previous
            )
          }
          disabled={
            sending ||
            uploading
          }
        >
          😊
        </button>

        {/* --------------------------------------------------------------
            Attachment Button
        --------------------------------------------------------------- */}

        <button
          type="button"
          className="input-action-button"
          title={
            uploading
              ? "Uploading..."
              : "Attach Image or PDF"
          }
          aria-label="Attach image or PDF"
          onClick={
            handleFileClick
          }
          disabled={
            sending ||
            uploading
          }
        >
          {uploading
            ? "⏳"
            : "📎"}
        </button>

        {/* --------------------------------------------------------------
            Hidden File Input
        --------------------------------------------------------------- */}

        <input
          ref={
            fileInputRef
          }
          type="file"
          hidden
          accept="
            image/jpeg,
            image/png,
            image/webp,
            application/pdf
          "
          onChange={
            handleFileChange
          }
        />

        {/* --------------------------------------------------------------
            Message Textarea
        --------------------------------------------------------------- */}

        <textarea
          ref={
            messageInputRef
          }
          className="message-textarea"
          placeholder={
            uploading
              ? "Uploading..."
              : sending
              ? "Sending..."
              : "Message..."
          }
          value={
            message
          }
          onChange={(
            event
          ) =>
            setMessage(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          rows={1}
          disabled={
            sending ||
            uploading
          }
        />

        {/* --------------------------------------------------------------
            Send Button
        --------------------------------------------------------------- */}

        <button
          type="submit"
          className="send-message-button"
          disabled={
            !message.trim() ||
            sending ||
            uploading
          }
          title="Send Message"
          aria-label="Send message"
        >
          {sending ||
          uploading ? (
            <span className="message-send-spinner">
              ⏳
            </span>
          ) : (
            "➤"
          )}
        </button>

      </form>
    </div>
  );
};

export default MessageInput;