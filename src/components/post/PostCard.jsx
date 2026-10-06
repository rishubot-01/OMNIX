import { useState } from "react";

import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";
import PostActions from "./PostActions";
import SharePost from "./SharePost";

import CommentSection from "../comment/CommentSection";
import commentService from "../../services/comment.service";

function PostCard({
  post,
  currentUser,
  onLike,
  onComment,
  onSave,
  onDelete,
  onEdit,
  onReport,
  onNotInterested,
  className = "",
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  if (!post) {
    return null;
  }

  // --------------------------------------------------
  // Post ID
  // --------------------------------------------------

  const postId = post?._id || post?.id;

  // --------------------------------------------------
  // Caption
  // --------------------------------------------------

  const caption =
    post.caption ||
    post.content ||
    post.text ||
    "";

  // --------------------------------------------------
  // Media
  // --------------------------------------------------

  const mediaUrl =
    post.mediaUrl ||
    post.imageUrl ||
    post.image ||
    post.media?.url ||
    (typeof post.media === "string"
      ? post.media
      : "");

  const mediaType =
    post.mediaType ||
    post.type ||
    post.media?.type;

  const audio =
    post.audio || null;

  // --------------------------------------------------
  // Current User ID
  // --------------------------------------------------

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    currentUser?.userId ||
    "";

  // --------------------------------------------------
  // Comment Handler
  // --------------------------------------------------

  const handleComment = () => {
    setCommentsOpen((value) => !value);
  };

  return (
    <>
      <article
        className={`
          overflow-hidden
          border-b border-gray-100
          bg-white
          sm:rounded-2xl sm:border
          ${className}
        `}
      >
        {/* Header */}

        <PostHeader
          post={post}
          currentUser={currentUser}
          onEdit={onEdit}
          onDelete={onDelete}
          onSave={onSave}
          onReport={onReport}
          onNotInterested={onNotInterested}
        />

        {/* Caption */}

        {caption && (
          <div className="px-4 pb-3">
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
              {caption}
            </p>
          </div>
        )}

        {/* Media */}

        {mediaUrl && (
          <PostMedia
            mediaUrl={mediaUrl}
            type={mediaType}
            audio={audio}
            alt={
              caption
                ? caption.slice(0, 100)
                : "OMNIX post"
            }
          />
        )}

        {/* Actions */}

        <PostActions
          post={post}
          currentUser={currentUser}
          onLike={onLike}
          onComment={handleComment}
          onShare={() => setShareOpen(true)}
          onSave={onSave}
        />

        {/* Comments */}

        {commentsOpen && postId && (
          <CommentSection
            postId={postId}
            currentUserId={currentUserId}
            currentUser={currentUser}
            commentService={commentService}
          />
        )}
      </article>

      {/* Share modal */}

      <SharePost
        post={post}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}

export default PostCard;