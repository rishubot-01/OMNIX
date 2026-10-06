import { useState } from "react";

function SharePost({
  post,
  isOpen,
  onClose,
  onShare,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) {
    return null;
  }

  const postId =
    post?._id ||
    post?.id;

  const shareUrl = postId
    ? `${window.location.origin}/post/${postId}`
    : window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: "OMNIX",
        text:
          post?.caption ||
          "Check out this post on OMNIX.",
        url: shareUrl,
      });

      onShare?.(post);
    } catch {
      // User cancelled native share.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">
            Share post
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* Link */}
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="truncate text-xs text-gray-500">
            {shareUrl}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-11 items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="flex h-11 items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default SharePost;