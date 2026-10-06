
import api from "./api";

const userService = {
  /*
  |--------------------------------------------------------------------------
  | Get User By Username
  |--------------------------------------------------------------------------
  */

  getProfile: async (username) => {
    return api.get(
      `/users/${encodeURIComponent(username)}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Get User By ID
  |--------------------------------------------------------------------------
  */

  getUserById: async (userId) => {
    return api.get(
      `/users/id/${encodeURIComponent(userId)}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Update Profile
  |--------------------------------------------------------------------------
  */

  updateProfile: async (
    userId,
    userData
  ) => {
    return api.put(
      `/users/${encodeURIComponent(userId)}`,
      userData
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Change Password
  |--------------------------------------------------------------------------
  */

  changePassword: async (
    passwordData
  ) => {
    return api.put(
      "/users/change-password",
      passwordData
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Search Users
  |--------------------------------------------------------------------------
  */

  searchUsers: async (query) => {
    return api.get(
      `/users/search?q=${encodeURIComponent(
        query
      )}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Get Followers
  |--------------------------------------------------------------------------
  */

  getFollowers: async (userId) => {
    return api.get(
      `/follow/${encodeURIComponent(
        userId
      )}/followers`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Get Following
  |--------------------------------------------------------------------------
  */

  getFollowing: async (userId) => {
    return api.get(
      `/follow/${encodeURIComponent(
        userId
      )}/following`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Get Suggested Users
  |--------------------------------------------------------------------------
  */

  getSuggestedUsers: async () => {
    return api.get(
      "/users/suggestions"
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Account
  |--------------------------------------------------------------------------
  */

  deleteAccount: async () => {
    return api.delete(
      "/users/account"
    );
  },
};

export default userService;
