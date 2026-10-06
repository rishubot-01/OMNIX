
import api from "./api";

const followService = {
  /*
  |--------------------------------------------------------------------------
  | Follow User
  |--------------------------------------------------------------------------
  */

  followUser: async (userId) => {
    return api.post("/follow", {
      followingId: userId,
    });
  },

  /*
  |--------------------------------------------------------------------------
  | Unfollow User
  |--------------------------------------------------------------------------
  */

  unfollowUser: async (userId) => {
    return api.delete(
      `/follow?followingId=${encodeURIComponent(userId)}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Get Followers
  |--------------------------------------------------------------------------
  */

  getFollowers: async (userId, page = 1, limit = 20) => {
    return api.get(
      `/follow/${userId}/followers?page=${page}&limit=${limit}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Get Following
  |--------------------------------------------------------------------------
  */

  getFollowing: async (userId, page = 1, limit = 20) => {
    return api.get(
      `/follow/${userId}/following?page=${page}&limit=${limit}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Check Follow Status
  |--------------------------------------------------------------------------
  */

  checkFollowStatus: async (userId) => {
    return api.get(`/follow/${userId}/follow/status`);
  },
};

export default followService;
