import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import Avatar from "../common/Avatar";
import Button from "../common/Button";
import FollowButton from "./FollowButton";
import ProfileStats from "./ProfileStats";
import FollowListModal from "./FollowListModal";

function ProfileHeader({
  user,
  posts = [],
  currentUser,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onEditProfile,
  onMessage,
  onAvatarChange,
  avatarUploading = false,
}) {
  const avatarInputRef =
    useRef(null);

  const navigate = useNavigate();

  const [
    followListType,
    setFollowListType,
  ] = useState(null);

  if (!user) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | User Information
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
    "Welcome to my OMNIX profile.";

  const website =
    user?.website ||
    user?.websiteUrl ||
    "";

  /*
  |--------------------------------------------------------------------------
  | Current User
  |--------------------------------------------------------------------------
  */

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  const ownsProfile =
    isOwnProfile ||
    (
      currentUserId &&
      userId &&
      String(currentUserId) ===
        String(userId)
    );

  /*
  |--------------------------------------------------------------------------
  | Followers / Following Count
  |--------------------------------------------------------------------------
  */

  const followersCount =
    user?.followersCount ??
    user?.followers?.length ??
    0;

  const followingCount =
    user?.followingCount ??
    user?.following?.length ??
    0;

  /*
  |--------------------------------------------------------------------------
  | Open Followers
  |--------------------------------------------------------------------------
  */

  const handleFollowersClick =
    () => {
      if (!userId) {
        return;
      }

      setFollowListType(
        "followers"
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Open Following
  |--------------------------------------------------------------------------
  */

  const handleFollowingClick =
    () => {
      if (!userId) {
        return;
      }

      setFollowListType(
        "following"
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Close Follow List
  |--------------------------------------------------------------------------
  */

  const handleCloseFollowList =
    () => {
      setFollowListType(null);
    };

  /*
  |--------------------------------------------------------------------------
  | Open User Profile
  |--------------------------------------------------------------------------
  */

  const handleUserClick =
    (selectedUser) => {
      if (!selectedUser) {
        return;
      }

      const selectedUserId =
        selectedUser?._id ||
        selectedUser?.id;

      const selectedUsername =
        selectedUser?.username;

      /*
       * Close modal first.
       */

      setFollowListType(null);

      /*
       * Prefer username.
       */

      if (selectedUsername) {
        navigate(
          `/user/${encodeURIComponent(
            selectedUsername.replace(
              "@",
              ""
            )
          )}`
        );

        return;
      }

      /*
       * Fallback to ID.
       */

      if (selectedUserId) {
        navigate(
          `/user/${encodeURIComponent(
            String(selectedUserId)
          )}`
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Avatar Upload
  |--------------------------------------------------------------------------
  */

  const handleAvatarInput =
    (event) => {
      const [file] =
        event.target.files || [];

      if (file) {
        onAvatarChange?.(file);
      }

      /*
       * Allows selecting the same
       * image again.
       */

      event.target.value = "";
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <section className="bg-white px-4 py-6 sm:rounded-2xl sm:border sm:border-gray-100">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

          {/* ================================================================
              Avatar
          ================================================================= */}

          <div className="relative shrink-0">

            <Avatar
              src={avatar}
              name={name}
              alt={name}
              size="xl"
            />

            {/* Change Avatar */}

            {ownsProfile &&
              onAvatarChange && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={
                      handleAvatarInput
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      avatarInputRef.current?.click()
                    }
                    disabled={
                      avatarUploading
                    }
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-950 text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
                    aria-label="Change profile photo"
                    title="Change profile photo"
                  >
                    {avatarUploading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />

                        <circle
                          cx="12"
                          cy="14"
                          r="3"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </button>
                </>
              )}
          </div>

          {/* ================================================================
              Profile Information
          ================================================================= */}

          <div className="min-w-0 flex-1">

            {/* Name + Actions */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              {/* Name */}

              <div>
                <div className="flex items-center gap-2">

                  <h1 className="text-xl font-bold text-gray-950">
                    {name}
                  </h1>

                  {user?.verified && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-950 text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}

                </div>

                {username && (
                  <p className="mt-0.5 text-sm text-gray-400">
                    @{username.replace(
                      "@",
                      ""
                    )}
                  </p>
                )}
              </div>

              {/* Actions */}

              <div className="flex items-center gap-2">

                {ownsProfile ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={
                      onEditProfile
                    }
                  >
                    Edit profile
                  </Button>
                ) : (
                  <>
                    {/* Follow / Unfollow */}

                    <FollowButton
                      user={user}
                      initialFollowing={
                        isFollowing
                      }
                      onFollow={
                        onFollow
                      }
                      onUnfollow={
                        onUnfollow
                      }
                    />

                    {/* Message */}

                    {onMessage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onMessage(user)
                        }
                      >
                        Message
                      </Button>
                    )}
                  </>
                )}

              </div>
            </div>

            {/* Bio */}

            {bio && (
              <p className="mt-4 max-w-xl whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {bio}
              </p>
            )}

            {/* Website */}

            {website && (
              <a
                href={normalizeUrl(
                  website
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block max-w-full truncate text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-gray-950"
              >
                {website}
              </a>
            )}

            {/* ==============================================================
                Profile Stats
            =============================================================== */}

            <div className="mt-5">

              <ProfileStats
                user={user}
                postsCount={posts.length}
                followersCount={
                  followersCount
                }
                followingCount={
                  followingCount
                }
                onFollowersClick={
                  handleFollowersClick
                }
                onFollowingClick={
                  handleFollowingClick
                }
              />

            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          Followers / Following Modal
      ===================================================================== */}

      {followListType &&
        userId && (
          <FollowListModal
            userId={userId}
            type={followListType}
            open={true}
            onClose={
              handleCloseFollowList
            }
            currentUser={
              currentUser
            }
            onUserClick={
              handleUserClick
            }
          />
        )}
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Normalize Website URL
|--------------------------------------------------------------------------
*/

function normalizeUrl(url) {
  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `https://${url}`;
}

export default ProfileHeader;