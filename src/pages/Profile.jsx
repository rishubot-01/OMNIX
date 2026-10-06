import { useState } from "react";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePosts from "../components/profile/ProfilePosts";
import Loader from "../components/common/Loader";

import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import usePosts from "../hooks/usePosts";

import uploadService from "../services/upload.service";
import userService from "../services/user.service";

function Profile() {
  const { user, updateUser } = useAuth();

  const [avatarUploading, setAvatarUploading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Logged-in User ID
  |--------------------------------------------------------------------------
  */

  const userId =
    user?._id || user?.id;

  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  const {
    profile,
    posts,
    loading,
    postsLoading,
    setProfile,
    removePost,
  } = useProfile(
    userId,
    {
      autoFetch: Boolean(userId),
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Post Actions
  |--------------------------------------------------------------------------
  |
  | usePosts backend API operations handle karega.
  |
  */

  const {
    deletePost,
  } = usePosts();

  const displayedProfile =
    profile || user;

  /*
  |--------------------------------------------------------------------------
  | Check Own Profile
  |--------------------------------------------------------------------------
  */

  const profileUserId =
    displayedProfile?._id ||
    displayedProfile?.id;

  const isOwnProfile =
    Boolean(userId) &&
    Boolean(profileUserId) &&
    String(userId) ===
      String(profileUserId);

  /*
  |--------------------------------------------------------------------------
  | Delete Post
  |--------------------------------------------------------------------------
  |
  | Flow:
  |
  | 1. Post ID nikalo
  | 2. Backend delete API call
  | 3. API successful hone ke baad
  |    local profile posts se remove karo
  |
  | Agar backend deletion fail hota hai,
  | UI se post remove nahi hogi.
  |
  */

  const handleDeletePost = async (post) => {
    const postId =
      post?._id ||
      post?.id;

    if (!postId) {
      window.alert(
        "Post ID not found."
      );

      return;
    }

    try {
      await deletePost(
        String(postId)
      );

      /*
       * Backend deletion successful.
       * Ab local profile state update karo.
       */

      removePost(
        String(postId)
      );
    } catch (error) {
      console.error(
        "Post deletion error:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to delete post."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Change Avatar
  |--------------------------------------------------------------------------
  */

  const handleAvatarChange = async (file) => {
    if (!file) {
      return;
    }

    /*
     * Check image
     */

    if (!file.type.startsWith("image/")) {
      window.alert(
        "Please choose an image file."
      );

      return;
    }

    /*
     * File size check
     * 5 MB
     */

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      window.alert(
        "Image size must be less than 5 MB."
      );

      return;
    }

    if (!userId) {
      window.alert(
        "User ID not found."
      );

      return;
    }

    /*
     * Only allow logged-in user
     * to update their own avatar.
     */

    if (!isOwnProfile) {
      window.alert(
        "You can only update your own profile."
      );

      return;
    }

    setAvatarUploading(true);

    try {
      /*
       * ------------------------------------------------
       * STEP 1: Upload image
       * ------------------------------------------------
       */

      const uploadResponse =
        await uploadService.uploadAvatar(
          file
        );

      const uploadData =
        uploadResponse?.data ||
        uploadResponse;

      const avatarUrl =
        uploadData?.url ||
        uploadData?.avatar ||
        uploadData?.imageUrl ||
        uploadData?.data?.url ||
        uploadData?.data?.avatar;

      if (!avatarUrl) {
        throw new Error(
          "The image upload did not return a URL."
        );
      }

      /*
       * ------------------------------------------------
       * STEP 2: Update logged-in user's profile
       * ------------------------------------------------
       */

      const updateResponse =
        await userService.updateProfile(
          String(userId),
          {
            avatar: avatarUrl,
          }
        );

      const updateData =
        updateResponse?.data ||
        updateResponse;

      const updatedProfile =
        updateData?.data ||
        updateData?.user ||
        updateData?.data?.user ||
        updateData ||
        {};

      /*
       * ------------------------------------------------
       * STEP 3: Update frontend state
       * ------------------------------------------------
       */

      const nextProfile = {
        ...(displayedProfile || {}),
        ...(updatedProfile || {}),
        avatar:
          updatedProfile?.avatar ||
          updatedProfile?.profileImage ||
          updatedProfile?.profilePicture ||
          avatarUrl,
      };

      setProfile(
        nextProfile
      );

      updateUser(
        nextProfile
      );
    } catch (error) {
      console.error(
        "Avatar update error:",
        error
      );

      window.alert(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update profile photo."
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    loading &&
    !displayedProfile
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-5">
      {displayedProfile && (
        <ProfileHeader
          user={displayedProfile}
          
          posts={posts}

          isOwnProfile={isOwnProfile}
          onAvatarChange={
            isOwnProfile
              ? handleAvatarChange
              : undefined
          }
          avatarUploading={
            avatarUploading
          }
        />
      )}

      <ProfilePosts
        posts={posts}
        loading={postsLoading}
        currentUser={user}
        onDelete={
          isOwnProfile
            ? handleDeletePost
            : undefined
        }
      />
    </div>
  );
}

export default Profile;