import api from "./api";

const commentService = {
  /*
   * ==========================================
   * GET POST COMMENTS
   * Backend:
   * GET /api/comments/post/:postId
   * ==========================================
   */
  getComments: async (postId) => {
    return api.get(
      `/comments/post/${postId}`
    );
  },

  /*
   * ==========================================
   * ADD POST COMMENT
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
  addComment: async (
    postId,
    content
  ) => {
    return api.post(
      "/comments",
      {
        postId,
        content,
      }
    );
  },

  /*
   * ==========================================
   * DELETE COMMENT
   * Backend:
   * DELETE /api/comments/:commentId
   * ==========================================
   */
  deleteComment: async (
    commentId
  ) => {
    return api.delete(
      `/comments/${commentId}`
    );
  },

  /*
   * ==========================================
   * GET REEL COMMENTS
   * Backend:
   * GET /api/comments/reel/:reelId
   * ==========================================
   */
  getReelComments: async (
    reelId
  ) => {
    return api.get(
      `/comments/reel/${reelId}`
    );
  },

  /*
   * ==========================================
   * ADD REEL COMMENT
   * Backend:
   * POST /api/comments/reel
   * ==========================================
   */
  addReelComment: async (
    reelId,
    content
  ) => {
    return api.post(
      "/comments/reel",
      {
        reelId,
        content,
      }
    );
  },
};

export default commentService;