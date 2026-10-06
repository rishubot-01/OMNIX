import { useState } from "react";
import { Send } from "lucide-react";

const LiveComments = ({
  comments = [],
  onSendComment,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || disabled) {
      return;
    }

    onSendComment?.(cleanMessage);
    setMessage("");
  };

  return (
    <div className="flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Live Comments
        </h3>
      </div>

      {/* Comments */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No comments yet
            </p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const commentId =
              comment?._id ||
              comment?.id ||
              `${comment?.userId || comment?.username || "user"}-${
                comment?.createdAt || index
              }`;

            const username =
              comment?.username ||
              comment?.user?.username ||
              comment?.fullName ||
              comment?.user?.fullName ||
              "User";

            /*
             * Backend sends `content`.
             *
             * text/message are kept as fallback so existing
             * comment objects also continue to work.
             */
            const text =
              comment?.content ||
              comment?.text ||
              comment?.message ||
              "";

            if (!text) {
              return null;
            }

            return (
              <div
                key={commentId}
                className="break-words text-sm"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {username}
                </span>

                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {text}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Send comment */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-800"
      >
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a comment..."
          disabled={disabled}
          maxLength={500}
          className="min-w-0 flex-1 rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-white"
        />

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          aria-label="Send comment"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
};

export default LiveComments;