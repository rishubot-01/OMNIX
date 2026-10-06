import api from "./api";

const reportService = {
  reportPost: async (postId, reason, description = "") => {
    return api.post("/reports", {
      targetType: "post",
      targetId: postId,
      reason,
      description,
    });
  },

  reportUser: async (userId, reason, description = "") => {
    return api.post("/reports", {
      targetType: "user",
      targetId: userId,
      reason,
      description,
    });
  },

  reportComment: async (
    commentId,
    reason,
    description = ""
  ) => {
    return api.post("/reports", {
      targetType: "comment",
      targetId: commentId,
      reason,
      description,
    });
  },

  getMyReports: async () => {
    return api.get("/reports/my");
  },

  getReport: async (reportId) => {
    return api.get(`/reports/${reportId}`);
  },
};

export default reportService;