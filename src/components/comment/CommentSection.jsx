import { useEffect, useState } from "react";

import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

function CommentSection({
  postId,
  currentUserId,
  currentUser = null,
  commentService,
  initialComments = [],
}) {
  const [comments, setComments] =
    useState(initialComments);

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ==========================================
   * LOAD COMMENTS
   *
   * Backend:
   * GET /api/comments/post/:postId
   *
   * Response:
   * {
   *   success: true,
   *   data: [...]
   * }
   * ==========================================
   */

  useEffect(() => {
    let mounted = true;

    const loadComments = async () => {
      if (
        !postId ||
        !commentService?.getComments
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await commentService.getComments(
            postId
          );

        if (!mounted) {
          return;
        }

        /*
         * Backend controller returns:
         *
         * {
         *   success: true,
         *   data: result
         * }
         *
         * result is an array of comments.
         *
         * api.js normally returns response.data,
         * therefore support both possible structures.
         */

        const data =
          response?.data?.data ??
          response?.data ??
          response ??
          [];

        setComments(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load comments:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load comments."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      mounted = false;
    };
  }, [postId, commentService]);

  /*
   * ==========================================
   * ADD COMMENT
   *
   * Backend:
   * POST /api/comments
   *
   * Body:
   * {
   *   postId,
   *   content
   * }
   * ==========================================
   */

  const handleAddComment = async (
    content
  ) => {
    if (
      !postId ||
      !content?.trim() ||
      !commentService?.addComment
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response =
        await commentService.addComment(
          postId,
          content.trim()
        );

      /*
       * Backend returns:
       *
       * {
       *   success: true,
       *   message: "Comment created successfully",
       *   data: result
       * }
       */

      const newComment =
        response?.data?.data ??
        response?.data ??
        response?.comment ??
        response;

      if (newComment) {
        setComments(
          (currentComments) => [
            ...currentComments,
            newComment,
          ]
        );
      }
    } catch (err) {
      console.error(
        "Failed to create comment:",
        err
      );

      setError(
        "Unable to post your comment."
      );

      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ==========================================
   * DELETE COMMENT
   *
   * Backend:
   * DELETE /api/comments/:commentId
   * ==========================================
   */

  const handleDeleteComment =
    async (comment) => {
      if (
        !commentService?.deleteComment
      ) {
        return;
      }

      const commentId =
        comment?._id ||
        comment?.id;

      if (!commentId) {
        return;
      }

      try {
        setError("");

        await commentService.deleteComment(
          commentId
        );

        setComments(
          (currentComments) =>
            currentComments.filter(
              (item) =>
                String(
                  item?._id ||
                    item?.id
                ) !==
                String(commentId)
            )
        );
      } catch (err) {
        console.error(
          "Failed to delete comment:",
          err
        );

        setError(
          "Unable to delete comment."
        );
      }
    };

  /*
   * ==========================================
   * LIKE COMMENT
   *
   * No backend route currently exists
   * for comment likes.
   *
   * So we intentionally do not call an API.
   * ==========================================
   */

  const handleLikeComment = () => {
    /*
     * Comment like API is not available
     * in current backend routes.
     *
     * Do nothing for now.
     */
  };

  /*
   * ==========================================
   * REPLY
   *
   * Reply API is not currently available
   * in the provided comment routes.
   * ==========================================
   */

  const handleReply = () => {
    /*
     * Reply functionality can be connected
     * after backend reply route is added.
     */
  };

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">

        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Comments
          </h3>

          <p className="text-xs text-gray-400">
            {comments.length}{" "}
            {comments.length === 1
              ? "comment"
              : "comments"}
          </p>
        </div>

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="mx-4 mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="flex items-center justify-center py-10">

          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

        </div>

      ) : comments.length === 0 ? (

        /* ====================================
           EMPTY STATE
        ==================================== */

        <div className="px-4 py-10 text-center">

          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5 text-gray-400"
            >
              <path
                d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-4.2A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"
                strokeWidth="1.7"
              />
            </svg>

          </div>

          <p className="mt-3 text-sm font-semibold text-gray-700">
            No comments yet
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Be the first to comment on this post.
          </p>

        </div>

      ) : (

        /* ====================================
           COMMENTS
        ==================================== */

        <div className="divide-y divide-gray-50">

          {comments.map(
            (comment) => (
              <CommentItem
                key={
                  comment?._id ||
                  comment?.id
                }

                comment={comment}

                currentUserId={
                  currentUserId
                }

                currentUser={
                  currentUser
                }

                onDelete={
                  handleDeleteComment
                }

                onLike={
                  handleLikeComment
                }

                onReply={
                  handleReply
                }
              />
            )
          )}

        </div>
      )}

      {/* ======================================
          COMMENT INPUT
      ====================================== */}

      <CommentInput
        onSubmit={
          handleAddComment
        }

        loading={
          submitting
        }

        currentUser={
          currentUser
        }
      />

    </section>
  );
}

export default CommentSection;