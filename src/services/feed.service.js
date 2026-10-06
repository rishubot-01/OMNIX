import api from "./api";

const feedService = {
  getFeed: async (
    userId,
    page = 1,
    limit = 10
  ) => {
    return api.get(
      `/feed/${userId}?page=${page}&limit=${limit}`
    );
  },

  getExploreFeed: async (
    page = 1,
    limit = 12
  ) => {
    return api.get(
      `/feed/explore?page=${page}&limit=${limit}`
    );
  },

  getTrendingPosts: async () => {
    return api.get("/feed/trending");
  },

  getFollowingFeed: async (
    page = 1,
    limit = 10
  ) => {
    return api.get(
      `/feed/following?page=${page}&limit=${limit}`
    );
  },
};

export default feedService;