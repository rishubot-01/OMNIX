import { useNavigate } from "react-router-dom";

function NotificationItem({
  notification,
  onRead,
  onDelete,
  onNotificationClick,
}) {
  const navigate = useNavigate();

  if (!notification) {
    return null;
  }

  const {
    _id,
    id,
    type,
    message,
    text,
    read,
    isRead,
    createdAt,
    sender,
    user,
    actor,
    post,
    callType,
    call,
  } = notification;

  const notificationId =
    _id || id;

  /*
  |--------------------------------------------------------------------------
  | Notification Type
  |--------------------------------------------------------------------------
  */

  const notificationType =
    String(type || "").toLowerCase();

  /*
  |--------------------------------------------------------------------------
  | Call Type
  |--------------------------------------------------------------------------
  */

  const notificationCallType =
    callType ||
    call?.callType ||
    call?.type ||
    "";

  const normalizedCallType =
    String(
      notificationCallType
    ).toLowerCase();

  const isCallNotification =
    notificationType === "call";

  const isVoiceCall =
    normalizedCallType === "audio" ||
    normalizedCallType === "voice";

  const isVideoCall =
    normalizedCallType === "video";

  /*
  |--------------------------------------------------------------------------
  | Notification User
  |--------------------------------------------------------------------------
  |
  | Backend notification service populates:
  |
  | sender
  |
  | Older frontend formats may use:
  |
  | user / actor
  |
  */

  const notificationUser =
    sender ||
    user ||
    actor ||
    {};

  const userId =
    notificationUser?._id ||
    notificationUser?.id;

  /*
  |--------------------------------------------------------------------------
  | User Name
  |--------------------------------------------------------------------------
  |
  | fullName ko priority diya gaya hai because
  | call notification mein actual naam dikhana hai.
  |
  */

  const userName =
    notificationUser?.fullName ||
    notificationUser?.name ||
    notificationUser?.username ||
    "Someone";

  const username =
    notificationUser?.username ||
    "";

  /*
  |--------------------------------------------------------------------------
  | Avatar
  |--------------------------------------------------------------------------
  */

  const avatar =
    notificationUser?.avatar ||
    notificationUser?.profileImage ||
    notificationUser?.profilePicture ||
    "";

  /*
  |--------------------------------------------------------------------------
  | Notification Text
  |--------------------------------------------------------------------------
  */

  const notificationText =
    isCallNotification
      ? getNotificationText(
          notificationType,
          normalizedCallType,
          userName
        )
      : (
          message ||
          text ||
          getNotificationText(
            notificationType,
            normalizedCallType,
            userName
          )
        );

  /*
  |--------------------------------------------------------------------------
  | Read Status
  |--------------------------------------------------------------------------
  */

  const hasReadStatus =
    typeof isRead === "boolean"
      ? isRead
      : typeof read === "boolean"
        ? read
        : false;

  /*
  |--------------------------------------------------------------------------
  | Handle Notification Click
  |--------------------------------------------------------------------------
  */

  const handleClick = async () => {
    /*
     * Let parent handle notification
     * when callback is available.
     */

    if (onNotificationClick) {
      onNotificationClick(
        notification
      );

      return;
    }

    /*
     * Mark as read.
     */

    if (
      !hasReadStatus &&
      notificationId
    ) {
      try {
        await onRead?.(
          notificationId
        );
      } catch (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );
      }
    }

    /*
     * Call notification:
     *
     * Call notification ko post/profile
     * navigation mein nahi bhejna.
     *
     * Parent callback na hone par yahin stop.
     */

    if (isCallNotification) {
      return;
    }

    /*
     * Open post if notification
     * belongs to a post.
     */

    const postId =
      post?._id ||
      post?.id;

    if (postId) {
      navigate(
        `/post/${postId}`
      );

      return;
    }

    /*
     * Otherwise open sender profile.
     */

    if (userId) {
      const profileIdentifier =
        username ||
        userId;

      navigate(
        `/user/${encodeURIComponent(
          String(
            profileIdentifier
          ).replace("@", "")
        )}`
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Formatted Date
  |--------------------------------------------------------------------------
  */

  const formattedDate =
    formatNotificationDate(
      createdAt
    );

  /*
  |--------------------------------------------------------------------------
  | Display Name
  |--------------------------------------------------------------------------
  |
  | Call notification:
  | Rishu Kumar
  |
  | Other notification:
  | @username when available
  |
  */

  const displayName =
    isCallNotification
      ? userName
      : (
          username
            ? `@${username.replace(
                "@",
                ""
              )}`
            : userName
        );

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`
        group flex items-start gap-3
        border-b border-gray-100
        px-4 py-4
        transition
        ${
          hasReadStatus
            ? "bg-white"
            : "bg-gray-50/80"
        }
      `}
    >

      {/* ================================================================
          Avatar
      ================================================================= */}

      <button
        type="button"
        onClick={handleClick}
        className="relative shrink-0"
        aria-label={
          isCallNotification
            ? `Open ${userName}'s profile`
            : `Open ${userName}'s profile`
        }
      >
        {avatar ? (
          <img
            src={avatar}
            alt={userName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white">
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <NotificationIcon
          type={notificationType}
          callType={normalizedCallType}
        />
      </button>

      {/* ================================================================
          Content
      ================================================================= */}

      <button
        type="button"
        onClick={handleClick}
        className="min-w-0 flex-1 text-left"
      >
        <p className="text-sm leading-5 text-gray-800">

          <span className="font-bold text-gray-950">
            {displayName}
          </span>

          {" "}

          <span>
            {notificationText}
          </span>

        </p>

        {formattedDate && (
          <p className="mt-1 text-xs text-gray-400">
            {formattedDate}
          </p>
        )}
      </button>

      {/* ================================================================
          Unread Indicator
      ================================================================= */}

      {!hasReadStatus && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gray-950"
          title="Unread"
          aria-label="Unread"
        />
      )}

      {/* ================================================================
          Delete
      ================================================================= */}

      {onDelete && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            onDelete(
              notificationId
            );
          }}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-red-600 group-hover:flex"
          aria-label="Delete notification"
        >
          ×
        </button>
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Notification Icon
|--------------------------------------------------------------------------
*/

function NotificationIcon({
  type,
  callType,
}) {
  const commonClass =
    "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-950 text-white";

  /*
   * Call
   */

  if (type === "call") {
    /*
     * Video call
     */

    if (callType === "video") {
      return (
        <span
          className={commonClass}
          aria-label="Video call"
          title="Video call"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-3 w-3"
          >
            <rect
              x="3"
              y="6"
              width="12"
              height="12"
              rx="2"
              strokeWidth="2"
            />

            <path
              d="M15 10l5-3v10l-5-3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    }

    /*
     * Voice call
     */

    return (
      <span
        className={commonClass}
        aria-label="Voice call"
        title="Voice call"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-3 w-3"
        >
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 5.18 2 2 0 0 1 4.11 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 10.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  /*
   * Like
   */

  if (
    type === "like" ||
    type === "post_like"
  ) {
    return (
      <span
        className={commonClass}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3 w-3"
        >
          <path d="M12 21s-7-4.35-9.33-8.28C.8 9.58 2.3 5 6.5 5c2.1 0 3.35 1.24 4.5 2.64C12.65 6.24 13.9 5 16 5c4.2 0 5.7 4.58 3.83 7.72C19 16.65 12 21 12 21Z" />
        </svg>
      </span>
    );
  }

  /*
   * Comment
   */

  if (
    type === "comment" ||
    type === "post_comment"
  ) {
    return (
      <span
        className={commonClass}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-3 w-3"
        >
          <path
            d="M20 11.5a8.5 8.5 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-4.2A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 8 8.5Z"
            strokeWidth="2"
          />
        </svg>
      </span>
    );
  }

  /*
   * Follow
   */

  if (
    type === "follow" ||
    type === "new_follower"
  ) {
    return (
      <span
        className={commonClass}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-3 w-3"
        >
          <path
            d="M15 20a6 6 0 0 0-12 0M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M16 11h6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  /*
   * Mention
   */

  if (
    type === "mention"
  ) {
    return (
      <span
        className={commonClass}
      >
        <span className="text-xs font-bold">
          @
        </span>
      </span>
    );
  }

  /*
   * Default
   */

  return (
    <span
      className={commonClass}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-3 w-3"
      >
        <path
          d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Notification Text
|--------------------------------------------------------------------------
*/

function getNotificationText(
  type,
  callType,
  userName
) {
  switch (type) {
    /*
     * Call
     */

    case "call":

      if (callType === "video") {
        return "🎥 Video call by " + userName;
      }

      return "📞 Call by " + userName;

    /*
     * Like
     */

    case "like":
    case "post_like":
      return "liked your post.";

    /*
     * Comment
     */

    case "comment":
    case "post_comment":
      return "commented on your post.";

    /*
     * Follow
     */

    case "follow":
    case "new_follower":
      return "started following you.";

    /*
     * Mention
     */

    case "mention":
      return "mentioned you in a post.";

    /*
     * Default
     */

    default:
      return "sent you a notification.";
  }
}

/*
|--------------------------------------------------------------------------
| Format Notification Date
|--------------------------------------------------------------------------
*/

function formatNotificationDate(
  date
) {
  if (!date) {
    return "";
  }

  const notificationDate =
    new Date(date);

  if (
    Number.isNaN(
      notificationDate.getTime()
    )
  ) {
    return "";
  }

  const now = new Date();

  const diff =
    now.getTime() -
    notificationDate.getTime();

  const seconds =
    Math.floor(
      diff / 1000
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const hours =
    Math.floor(
      minutes / 60
    );

  const days =
    Math.floor(
      hours / 24
    );

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return notificationDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year:
        notificationDate.getFullYear() !==
        now.getFullYear()
          ? "numeric"
          : undefined,
    }
  );
}

export default NotificationItem;