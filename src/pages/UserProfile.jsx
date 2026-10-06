
import {
  useCallback,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePosts from "../components/profile/ProfilePosts";
import Loader from "../components/common/Loader";
import FollowListModal from "../components/profile/FollowListModal";

import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const { user: currentUser } =
    useAuth();

  const {
    profile,
    posts,
    loading,
    postsLoading,
    isFollowing,
    followUser,
    unfollowUser,
  } = useProfile(username);

  /*
  |--------------------------------------------------------------------------
  | Followers / Following Modal
  |--------------------------------------------------------------------------
  */

  const [listType, setListType] =
    useState(null);

  /*
   * null
   *       -> modal closed
   *
   * followers
   *       -> followers list
   *
   * following
   *       -> following list
   */

  /*
  |--------------------------------------------------------------------------
  | Open Followers
  |--------------------------------------------------------------------------
  */

  const handleFollowersClick =
    useCallback(() => {
      if (!profile) {
        return;
      }

      setListType("followers");
    }, [profile]);

  /*
  |--------------------------------------------------------------------------
  | Open Following
  |--------------------------------------------------------------------------
  */

  const handleFollowingClick =
    useCallback(() => {
      if (!profile) {
        return;
      }

      setListType("following");
    }, [profile]);

  /*
  |--------------------------------------------------------------------------
  | Close Modal
  |--------------------------------------------------------------------------
  */

  const handleCloseList =
    useCallback(() => {
      setListType(null);
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Open User Profile
  |--------------------------------------------------------------------------
  |
  | Followers / Following list me kisi user par
  | click karne par uski profile open hogi.
  |
  */

  const handleUserClick =
    useCallback(
      (user) => {
        if (!user) {
          return;
        }

        const userId =
          user?._id ||
          user?.id;

        const userUsername =
          user?.username;

        /*
         * Modal close karo.
         */

        setListType(null);

        /*
         * Username available hai
         * to username se profile open karo.
         */

        if (userUsername) {
          navigate(
            `/user/${encodeURIComponent(
              userUsername.replace(
                "@",
                ""
              )
            )}`
          );

          return;
        }

        /*
         * Username nahi hai to ID use karo.
         */

        if (userId) {
          navigate(
            `/user/${encodeURIComponent(
              String(userId)
            )}`
          );
        }
      },
      [navigate]
    );

  /*
  |--------------------------------------------------------------------------
  | Open Message
  |--------------------------------------------------------------------------
  |
  | Message button par click karne par
  | Messages page open hoga.
  |
  */

  const handleMessage =
    useCallback(
      (user) => {
        if (!user) {
          return;
        }

        const userId =
          user?._id ||
          user?.id;

        const userUsername =
          user?.username;

        /*
         * Username preferred hai.
         */

        if (userUsername) {
          navigate(
            `/messages?user=${encodeURIComponent(
              userUsername
            )}`
          );

          return;
        }

        /*
         * Fallback ID.
         */

        if (userId) {
          navigate(
            `/messages?userId=${encodeURIComponent(
              String(userId)
            )}`
          );
        }
      },
      [navigate]
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    loading &&
    !profile
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | User Not Found
  |--------------------------------------------------------------------------
  */

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">
          User not found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          This OMNIX profile doesn't exist.
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile ID
  |--------------------------------------------------------------------------
  */

  const profileId =
    profile?._id ||
    profile?.id;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-5">

      {/* ================================================================
          Profile Header
      ================================================================= */}

      <ProfileHeader
        user={profile}
        currentUser={currentUser}
        isOwnProfile={false}
        isFollowing={isFollowing}
        onFollow={followUser}
        onUnfollow={unfollowUser}
        onMessage={handleMessage}
        onFollowersClick={
          handleFollowersClick
        }
        onFollowingClick={
          handleFollowingClick
        }
      />

      {/* ================================================================
          Profile Posts
      ================================================================= */}

      <ProfilePosts
        posts={posts}
        loading={postsLoading}
      />

      {/* ================================================================
          Followers / Following Modal
      ================================================================= */}

      {listType &&
        profileId && (
          <FollowListModal
            userId={profileId}
            type={listType}
            open={true}
            onClose={
              handleCloseList
            }
            currentUser={
              currentUser
            }
            onUserClick={
              handleUserClick
            }
          />
        )}

    </div>
  );
}

export default UserProfile;
