
import api from "./api";

const notificationService = {
  /*
  |--------------------------------------------------------------------------
  | Get Notifications
  |--------------------------------------------------------------------------
  |
  | GET /api/notifications?page=1&limit=20
  |
  */

  getNotifications: async (
    page = 1,
    limit = 20
  ) => {
    return api.get(
      "/notifications",
      {
        params: {
          page,
          limit,
        },
      }
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Get Unread Count
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | Is endpoint ka backend route abhi tumne share nahi kiya hai.
  | Isliye ye function tabhi kaam karega jab backend me
  | GET /api/notifications/unread-count exist karta ho.
  |
  */

  getUnreadCount: async () => {
    return api.get(
      "/notifications/unread-count"
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Mark One Notification As Read
  |--------------------------------------------------------------------------
  |
  | PUT /api/notifications/:notificationId/read
  |
  */

  markAsRead: async (
    notificationId
  ) => {
    if (!notificationId) {
      throw new Error(
        "Notification ID is required"
      );
    }

    return api.put(
      `/notifications/${notificationId}/read`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Mark All Notifications As Read
  |--------------------------------------------------------------------------
  |
  | PUT /api/notifications/read-all
  |
  */

  markAllAsRead: async () => {
    return api.put(
      "/notifications/read-all"
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Notification
  |--------------------------------------------------------------------------
  |
  | DELETE /api/notifications/:notificationId
  |
  */

  deleteNotification: async (
    notificationId
  ) => {
    if (!notificationId) {
      throw new Error(
        "Notification ID is required"
      );
    }

    return api.delete(
      `/notifications/${notificationId}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Clear All
  |--------------------------------------------------------------------------
  |
  | Backend route abhi provided notification.routes.ts
  | me DELETE /notifications nahi hai.
  |
  | Isliye is function ko currently use mat karo.
  |
  */

  clearAll: async () => {
    return api.delete(
      "/notifications"
    );
  },
};

export default notificationService;
