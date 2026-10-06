
import {
  useCallback,
  useState,
} from "react";

import postService from "../services/post.service";
import likeService from "../services/like.service";
import commentService from "../services/comment.service";

function usePosts() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Create Post
  |--------------------------------------------------------------------------
  */

  const createPost =
    useCallback(async (postData) => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await postService.createPost(
            postData
          );

        return response;
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to create post."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Get Single Post
  |--------------------------------------------------------------------------
  */

  const getPost =
    useCallback(async (postId) => {
      if (!postId) {
        const error =
          new Error(
            "Post ID is required."
          );

        setError(error.message);

        throw error;
      }

      setLoading(true);
      setError(null);

      try {
        return await postService.getPost(
          String(postId)
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load post."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Update Post
  |--------------------------------------------------------------------------
  */

  const updatePost =
    useCallback(
      async (postId, postData) => {
        if (!postId) {
          const error =
            new Error(
              "Post ID is required."
            );

          setError(error.message);

          throw error;
        }

        setLoading(true);
        setError(null);

        try {
          return await postService.updatePost(
            String(postId),
            postData
          );
        } catch (err) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            "Unable to update post."
          );

          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Delete Post
  |--------------------------------------------------------------------------
  |
  | Backend deletion handles:
  |
  | - Post deletion
  | - Related comments
  | - Related likes
  | - Related notifications
  | - Cloudinary media cleanup
  |
  | This hook only calls the backend API.
  |
  | Local UI state removal is handled by the
  | calling component/hook after successful deletion.
  |
  */

  const deletePost =
    useCallback(async (postId) => {
      if (!postId) {
        const error =
          new Error(
            "Post ID is required."
          );

        setError(error.message);

        throw error;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await postService.deletePost(
            String(postId)
          );

        return response;
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to delete post."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Like Post
  |--------------------------------------------------------------------------
  */

  const likePost =
    useCallback(async (postId) => {
      if (!postId) {
        throw new Error(
          "Post ID is required."
        );
      }

      return likeService.likePost(
        String(postId)
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Unlike Post
  |--------------------------------------------------------------------------
  */

  const unlikePost =
    useCallback(async (postId) => {
      if (!postId) {
        throw new Error(
          "Post ID is required."
        );
      }

      return likeService.unlikePost(
        String(postId)
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Add Comment
  |--------------------------------------------------------------------------
  */

  const addComment =
    useCallback(
      async (postId, comment) => {
        if (!postId) {
          throw new Error(
            "Post ID is required."
          );
        }

        return commentService.createComment(
          String(postId),
          {
            content: comment,
          }
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Delete Comment
  |--------------------------------------------------------------------------
  */

  const deleteComment =
    useCallback(
      async (commentId) => {
        if (!commentId) {
          throw new Error(
            "Comment ID is required."
          );
        }

        return commentService.deleteComment(
          String(commentId)
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Get Comments
  |--------------------------------------------------------------------------
  */

  const getComments =
    useCallback(
      async (
        postId,
        params = {}
      ) => {
        if (!postId) {
          throw new Error(
            "Post ID is required."
          );
        }

        return commentService.getComments(
          String(postId),
          params
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    loading,
    error,

    createPost,
    getPost,
    updatePost,
    deletePost,

    likePost,
    unlikePost,

    addComment,
    deleteComment,
    getComments,
  };
}

export default usePosts;
