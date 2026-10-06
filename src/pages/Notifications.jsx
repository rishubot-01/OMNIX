
import { useNavigate } from "react-router-dom";

import NotificationList from "../components/notification/NotificationList";
import Loader from "../components/common/Loader";

import useNotifications from "../hooks/useNotifications";

function Notifications() {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  /*
  |--------------------------------------------------------------------------
  | Open Notification
  |--------------------------------------------------------------------------
  */

  const handleNotificationClick = (
    notification
  ) => {
    if (!notification) {
      return;
    }

    /*
     * Mark notification as read first.
     */
    const notificationId =
      notification?._id ||
      notification?.id;

    if (notificationId) {
      markAsRead(
        notificationId
      ).catch((error) => {
        console.error(
          "Failed to mark notification as read:",
          error
        );
      });
    }

    /*
     * Sender = user who performed
     * the action.
     */
    const sender =
      notification?.sender ||
      notification?.user ||
      {};

    const senderId =
      sender?._id ||
      sender?.id;

    const username =
      sender?.username;

    /*
     * Follow notification:
     *
     * Rahul followed you
     *       ↓
     * Open Rahul profile
     */
    if (
      notification?.type ===
      "follow"
    ) {
      if (username) {
        navigate(
          `/user/${encodeURIComponent(
            username.replace("@", "")
          )}`
        );

        return;
      }

      if (senderId) {
        navigate(
          `/user/${encodeURIComponent(
            String(senderId)
          )}`
        );
      }

      return;
    }

    /*
     * For other notification types,
     * we currently only mark them as read.
     *
     * Post/comment/like navigation can
     * be connected later using their
     * existing post IDs.
     */
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "You're all caught up."}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => {
              markAllAsRead().catch(
                (error) => {
                  console.error(
                    "Failed to mark all notifications as read:",
                    error
                  );
                }
              );
            }}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : (
        <>
          <NotificationList
            notifications={
              notifications
            }
            onRead={markAsRead}
            onNotificationClick={
              handleNotificationClick
            }
          />

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  loadMore().catch(
                    (error) => {
                      console.error(
                        "Failed to load more notifications:",
                        error
                      );
                    }
                  );
                }}
                disabled={
                  loadingMore
                }
                className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore
                  ? "Loading..."
                  : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Notifications;
