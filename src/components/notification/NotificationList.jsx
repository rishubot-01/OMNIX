
import NotificationItem from "./NotificationItem";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

function NotificationList({
  notifications = [],
  loading = false,
  error = "",
  onRead,
  onDelete,
  onMarkAllRead,
  onRetry,
  onNotificationClick,
}) {
  const unreadCount =
    notifications.filter(
      (notification) =>
        notification?.read === false ||
        notification?.isRead === false
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader
          size="md"
          text="Loading notifications..."
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage
          message={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty
  |--------------------------------------------------------------------------
  */

  if (!notifications.length) {
    return (
      <EmptyState
        title="No notifications yet"
        description="When someone likes, comments, follows, or interacts with you, you'll see it here."
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-6 w-6 text-gray-400"
          >
            <path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Notification List
  |--------------------------------------------------------------------------
  */

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div>
          <h2 className="text-base font-bold text-gray-950">
            Notifications
          </h2>

          {unreadCount > 0 && (
            <p className="mt-0.5 text-xs text-gray-400">
              {unreadCount} unread
            </p>
          )}
        </div>

        {unreadCount > 0 &&
          onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-gray-600 transition hover:text-gray-950"
            >
              Mark all as read
            </button>
          )}
      </div>

      {/* Notification Items */}
      <div>
        {notifications.map(
          (notification) => (
            <NotificationItem
              key={
                notification?._id ||
                notification?.id
              }
              notification={
                notification
              }
              onRead={onRead}
              onDelete={onDelete}
              onNotificationClick={
                onNotificationClick
              }
            />
          )
        )}
      </div>
    </div>
  );
}

export default NotificationList;
