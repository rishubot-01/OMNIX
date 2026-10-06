
import { useNavigate } from "react-router-dom";

import Avatar from "../common/Avatar";
import FollowButton from "./FollowButton";

function UserCard({
  user,
  currentUser,
  isFollowing = false,
  onFollow,
  onUnfollow,
  showFollowButton = true,
  onClick,
}) {
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | User Data
  |--------------------------------------------------------------------------
  */

  const userId =
    user?._id ||
    user?.id;

  const name =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "OMNIX User";

  const username =
    user?.username ||
    "";

  const avatar =
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    "";

  const bio =
    user?.bio ||
    "";

  /*
  |--------------------------------------------------------------------------
  | Current User
  |--------------------------------------------------------------------------
  */

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  const isCurrentUser =
    Boolean(
      currentUserId &&
      userId &&
      String(currentUserId) ===
        String(userId)
    );

  /*
  |--------------------------------------------------------------------------
  | Open Profile
  |--------------------------------------------------------------------------
  */

  const handleProfileClick = () => {
    if (onClick) {
      onClick(user);
      return;
    }

    if (username) {
      navigate(
        `/user/${encodeURIComponent(
          username.replace("@", "")
        )}`
      );

      return;
    }

    if (userId) {
      navigate(
        `/user/${encodeURIComponent(
          String(userId)
        )}`
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-gray-50">
      {/* User Profile */}
      <button
        type="button"
        onClick={handleProfileClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={`Open ${name}'s profile`}
      >
        <Avatar
          src={avatar}
          name={name}
          alt={name}
          size="md"
        />

        <div className="min-w-0">
          {/* Name */}
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-gray-950">
              {name}
            </p>

            {user?.verified && (
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-950 text-[8px] font-bold text-white"
                aria-label="Verified"
                title="Verified"
              >
                ✓
              </span>
            )}
          </div>

          {/* Username */}
          {username && (
            <p className="truncate text-xs text-gray-400">
              @{username.replace("@", "")}
            </p>
          )}

          {/* Bio */}
          {bio && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {bio}
            </p>
          )}
        </div>
      </button>

      {/* Follow Button */}
      {showFollowButton &&
        !isCurrentUser && (
          <FollowButton
            user={user}
            initialFollowing={Boolean(
              isFollowing
            )}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
          />
        )}
    </div>
  );
}

export default UserCard;
