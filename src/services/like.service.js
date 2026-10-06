import api from "./api";

const likeService = {
  // Like Post
  likePost: async (postId) => {
    return api.post("/likes", {
      postId,
    });
  },

  // Unlike Post
  unlikePost: async (postId) => {
    return api.delete("/likes", {
      data: {
        postId,
      },
    });
  },

  // Get Post Likes
  getPostLikes: async (postId) => {
    return api.get(`/likes/post/${postId}`);
  },
};

export default likeService;