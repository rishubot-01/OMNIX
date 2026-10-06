import api from "./api";

const adminService = {
  getDashboardStats: async () => {
    return api.get("/admin/dashboard");
  },

  getUsers: async (page = 1, limit = 20, search = "") => {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      params.append("search", search);
    }

    return api.get(`/admin/users?${params.toString()}`);
  },

  getUser: async (userId) => {
    return api.get(`/admin/users/${userId}`);
  },

  updateUserStatus: async (userId, status) => {
    return api.patch(`/admin/users/${userId}/status`, {
      status,
    });
  },

  deleteUser: async (userId) => {
    return api.delete(`/admin/users/${userId}`);
  },

  getPosts: async (page = 1, limit = 20) => {
    return api.get(
      `/admin/posts?page=${page}&limit=${limit}`
    );
  },

  deletePost: async (postId) => {
    return api.delete(`/admin/posts/${postId}`);
  },

  getReports: async (page = 1, limit = 20, status = "") => {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (status) {
      params.append("status", status);
    }

    return api.get(`/admin/reports?${params.toString()}`);
  },

  getReport: async (reportId) => {
    return api.get(`/admin/reports/${reportId}`);
  },

  updateReport: async (reportId, status, adminNote = "") => {
    return api.patch(`/admin/reports/${reportId}`, {
      status,
      adminNote,
    });
  },

  suspendUser: async (userId, duration, reason) => {
    return api.patch(`/admin/users/${userId}/suspend`, {
      duration,
      reason,
    });
  },

  banUser: async (userId, reason) => {
    return api.patch(`/admin/users/${userId}/ban`, {
      reason,
    });
  },
};

export default adminService;