import api from "./api";

const activitySessionService = {
  startSession: async () => {
    return api.post("/activity-session");
  },

  updateSession: async (
    sessionId,
    activeSeconds
  ) => {
    if (!sessionId) {
      throw new Error(
        "Activity session ID is required."
      );
    }

    return api.patch(
      `/activity-session/${sessionId}`,
      {
        activeSeconds,
      }
    );
  },

  endSession: async (
    sessionId,
    activeSeconds = 0
  ) => {
    if (!sessionId) {
      throw new Error(
        "Activity session ID is required."
      );
    }

    return api.post(
      `/activity-session/${sessionId}/end`,
      {
        activeSeconds,
      }
    );
  },
};

export default activitySessionService;