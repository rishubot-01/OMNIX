
import { useEffect, useState } from "react";
import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";

function FollowButton({
  user,
  initialFollowing = false,
  onFollow,
  onUnfollow,
  disabled = false,
}) {
  const { user: currentUser } =
    useAuth();

  const [following, setFollowing] =
    useState(Boolean(initialFollowing));

  const [loading, setLoading] =
    useState(false);

  /*
   * --------------------------------------------------------------------------
   * Get User ID
   * --------------------------------------------------------------------------
   */

  const getUserId = (value) => {
    return (
      value?._id ||
      value?.id ||
      ""
    );
  };

  /*
   * --------------------------------------------------------------------------
   * Target User ID
   * --------------------------------------------------------------------------
   */

  const targetUserId =
    getUserId(user);

  /*
   * --------------------------------------------------------------------------
   * Current Logged-in User ID
   * --------------------------------------------------------------------------
   */

  const currentUserId =
    getUserId(currentUser);

  /*
   * --------------------------------------------------------------------------
   * Self User Check
   * --------------------------------------------------------------------------
   *
   * Agar target user aur logged-in user same hain,
   * Follow button ko API request nahi bhejni chahiye.
   */

  const isCurrentUser =
    Boolean(
      targetUserId &&
        currentUserId &&
        String(targetUserId) ===
          String(currentUserId)
    );

  /*
   * --------------------------------------------------------------------------
   * Sync local state
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    setFollowing(
      Boolean(initialFollowing)
    );
  }, [initialFollowing]);

  /*
   * --------------------------------------------------------------------------
   * Handle Follow / Unfollow
   * --------------------------------------------------------------------------
   */

  const handleClick = async () => {
    if (
      loading ||
      disabled
    ) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Current user ko khud follow karne ki
     * API request bilkul mat bhejo.
     */

    if (isCurrentUser) {
      console.warn(
        "Follow action skipped: cannot follow yourself."
      );

      return;
    }

    /*
     * Target user ID required
     */

    if (!targetUserId) {
      console.warn(
        "Follow action skipped: target user ID is missing."
      );

      return;
    }

    const previousState =
      following;

    const nextState =
      !following;

    /*
     * Optimistic UI update
     */

    setFollowing(
      nextState
    );

    setLoading(true);

    try {
      if (nextState) {
        await onFollow?.(user);
      } else {
        await onUnfollow?.(user);
      }
    } catch (error) {
      /*
       * API fail hone par previous state restore
       */

      setFollowing(
        previousState
      );

      console.error(
        "Follow action failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  /*
   * Current user ke liye button render
   * karne ki zarurat nahi hai.
   *
   * FollowListModal me bhi self-user hide ho raha hai,
   * lekin yahan second safety layer rakhi gayi hai.
   */

  if (isCurrentUser) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={
        following
          ? "outline"
          : "primary"
      }
      loading={loading}
      disabled={
        disabled ||
        isCurrentUser
      }
      onClick={handleClick}
    >
      {following
        ? "Following"
        : "Follow"}
    </Button>
  );
}

export default FollowButton;
