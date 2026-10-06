import { useEffect, useState } from "react";
import { MessageCircle, UserPlus, UserCheck } from "lucide-react";
import Avatar from "../../common/Avatar";
import followService from "../../../services/follow.service";
import messageService from "../../../services/message.service";

const ConnectionCard = ({ connection, currentUserId }) => {
  const [otherUser, setOtherUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!connection?.users || !currentUserId) {
      setOtherUser(null);
      return;
    }

    const users = Array.isArray(connection.users)
      ? connection.users
      : [];

    const user = users.find(
      (item) => String(item?._id || item?.id) !== String(currentUserId)
    );

    setOtherUser(user || null);
  }, [connection, currentUserId]);

  useEffect(() => {
    let cancelled = false;

    const checkFollowStatus = async () => {
      const userId = otherUser?._id || otherUser?.id;

      if (!userId) {
        return;
      }

      try {
        const response = await followService.checkFollowStatus(userId);

        if (cancelled) {
          return;
        }

        setIsFollowing(
          Boolean(
            response?.isFollowing ??
              response?.following ??
              response?.data?.isFollowing ??
              response?.data?.following
          )
        );
      } catch {
        if (!cancelled) {
          setIsFollowing(false);
        }
      }
    };

    checkFollowStatus();

    return () => {
      cancelled = true;
    };
  }, [otherUser]);

  const handleFollow = async () => {
    const userId = otherUser?._id || otherUser?.id;

    if (!userId || loadingFollow) {
      return;
    }

    try {
      setLoadingFollow(true);
      setError("");

      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
      }
    } catch (err) {
      setError(err?.message || "Failed to update follow status");
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleMessage = async () => {
    const userId = otherUser?._id || otherUser?.id;

    if (!userId || loadingMessage) {
      return;
    }

    try {
      setLoadingMessage(true);
      setError("");

      await messageService.createConversation(userId);
    } catch (err) {
      setError(err?.message || "Failed to start conversation");
    } finally {
      setLoadingMessage(false);
    }
  };

  if (!otherUser) {
    return null;
  }

  const userId = otherUser._id || otherUser.id;

  const username =
    otherUser.username ||
    otherUser.fullName ||
    "Unknown User";

  const fullName =
    otherUser.fullName ||
    otherUser.username ||
    "Unknown User";

  const avatar =
    otherUser.avatar ||
    otherUser.profileImage ||
    otherUser.profilePicture ||
    "";

  const connectedAt =
    connection?.connectedAt
      ? new Date(connection.connectedAt).toLocaleString()
      : "";

  return (
    <div className="flex items-center gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-800">
      <Avatar
        src={avatar}
        alt={fullName}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900 dark:text-white">
          {fullName}
        </h3>

        {otherUser.username && (
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            @{username}
          </p>
        )}

        {connectedAt && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Connected {connectedAt}
          </p>
        )}

        {error && (
          <p className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleFollow}
          disabled={loadingFollow}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {isFollowing ? (
            <>
              <UserCheck size={16} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Follow</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleMessage}
          disabled={loadingMessage}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <MessageCircle size={16} />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
};

export default ConnectionCard;