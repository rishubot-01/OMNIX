
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "../common/Avatar";
import FollowButton from "./FollowButton";

import followService from "../../services/follow.service";
import useAuth from "../../hooks/useAuth";

function FollowListModal({
  userId,
  type = "followers",
  open = false,
  onClose,
  currentUser: currentUserProp,
  onUserClick,
}) {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Auth user
  |--------------------------------------------------------------------------
  */

const { user: authUser } = useAuth();

const currentUser = authUser;

/*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Lock body scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | Extract Users
  |--------------------------------------------------------------------------
  */

  const extractUsers = (response) => {
    const responseData =
      response?.data ?? response;

    if (
      Array.isArray(
        responseData?.data
      )
    ) {
      return responseData.data;
    }

    if (
      Array.isArray(responseData)
    ) {
      return responseData;
    }

    return [];
  };

  /*
  |--------------------------------------------------------------------------
  | Convert Follow document into actual User
  |--------------------------------------------------------------------------
  */

  const getListUser = (
    item
  ) => {
    if (!item) {
      return null;
    }

    if (type === "followers") {
      return (
        item?.follower ||
        null
      );
    }

    return (
      item?.following ||
      null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Followers / Following
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open || !userId) {
      return;
    }

    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        let response;

        if (
          type === "followers"
        ) {
          response =
            await followService.getFollowers(
              userId
            );
        } else {
          response =
            await followService.getFollowing(
              userId
            );
        }

        if (cancelled) {
          return;
        }

        const followList =
          extractUsers(response);

        const normalizedUsers =
          followList
            .map((item) =>
              getListUser(item)
            )
            .filter(Boolean);

        setUsers(
          normalizedUsers
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Follow list error:",
          err
        );

        setUsers([]);

        setError(
          err?.response?.data?.message ||
          err?.message ||
          `Unable to load ${type}.`
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    userId,
    type,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Close on Escape
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    onClose,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Don't render when closed
  |--------------------------------------------------------------------------
  */

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Modal title
  |--------------------------------------------------------------------------
  */

  const title =
    type === "following"
      ? "Following"
      : "Followers";

  /*
  |--------------------------------------------------------------------------
  | Open User Profile
  |--------------------------------------------------------------------------
  */

  const handleUserClick = (
    user
  ) => {
    if (!user) {
      return;
    }

    if (onUserClick) {
      onUserClick(user);
      return;
    }

    const id =
      user?._id ||
      user?.id;

    const username =
      user?.username;

    onClose?.();

    if (username) {
      navigate(
        `/user/${encodeURIComponent(
          username.replace(
            "@",
            ""
          )
        )}`
      );

      return;
    }

    if (id) {
      navigate(
        `/user/${encodeURIComponent(
          String(id)
        )}`
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Follow
  |--------------------------------------------------------------------------
  */

  const handleFollow = async (
    user
  ) => {
    const id =
      user?._id ||
      user?.id;

    const currentUserId =
      currentUser?._id ||
      currentUser?.id;

    /*
     * User ID missing
     */
    if (!id) {
      throw new Error(
        "User ID not found"
      );
    }

    /*
     * Prevent following yourself
     *
     * Backend bhi ye request reject karta hai,
     * isliye API call se pehle hi stop kar do.
     */
    if (
      currentUserId &&
      String(currentUserId) ===
        String(id)
    ) {
      console.warn(
        "Follow skipped: cannot follow yourself."
      );

      return;
    }

    await followService.followUser(
      id
    );

    /*
     * Update local state
     */
    setUsers(
      (previous) =>
        previous.map(
          (item) => {
            const itemId =
              item?._id ||
              item?.id;

            if (
              String(itemId) !==
              String(id)
            ) {
              return item;
            }

            return {
              ...item,
              isFollowing: true,
            };
          }
        )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Unfollow
  |--------------------------------------------------------------------------
  */

  const handleUnfollow =
    async (user) => {
      const id =
        user?._id ||
        user?.id;

      const currentUserId =
        currentUser?._id ||
        currentUser?.id;

      /*
       * User ID missing
       */
      if (!id) {
        throw new Error(
          "User ID not found"
        );
      }

      /*
       * Self user ke liye unfollow
       * request bhi nahi bhejni.
       */
      if (
        currentUserId &&
        String(currentUserId) ===
          String(id)
      ) {
        console.warn(
          "Unfollow skipped: current user."
        );

        return;
      }

      await followService.unfollowUser(
        id
      );

      /*
       * Update local state
       */
      setUsers(
        (previous) =>
          previous.map(
            (item) => {
              const itemId =
                item?._id ||
                item?.id;

              if (
                String(itemId) !==
                String(id)
              ) {
                return item;
              }

              return {
                ...item,
                isFollowing: false,
              };
            }
          )
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Retry
  |--------------------------------------------------------------------------
  */

  const handleRetry = () => {
    setError("");
    setUsers([]);

    const fetchAgain = async () => {
      setLoading(true);

      try {
        let response;

        if (
          type === "followers"
        ) {
          response =
            await followService.getFollowers(
              userId
            );
        } else {
          response =
            await followService.getFollowing(
              userId
            );
        }

        const followList =
          extractUsers(response);

        const normalizedUsers =
          followList
            .map((item) =>
              getListUser(item)
            )
            .filter(Boolean);

        setUsers(
          normalizedUsers
        );
      } catch (err) {
        console.error(
          "Follow list retry error:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          `Unable to load ${type}.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgain();
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Header */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4">
          <h2 className="text-lg font-bold text-gray-950">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}

        <div className="min-h-0 flex-1 overflow-y-auto">

          {/* Loading */}

          {loading && (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">

                <span className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950" />

                <p className="text-sm text-gray-500">
                  Loading{" "}
                  {title.toLowerCase()}
                  ...
                </p>

              </div>
            </div>
          )}

          {/* Error */}

          {!loading &&
            error && (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  !
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-800">
                  Something went wrong
                </p>

                <p className="mt-1 max-w-xs text-xs text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    handleRetry
                  }
                  className="mt-4 rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                >
                  Try again
                </button>

              </div>
            )}

          {/* Empty */}

          {!loading &&
            !error &&
            users.length ===
              0 && (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-6 w-6 text-gray-400"
                  >
                    <path
                      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                </div>

                <p className="mt-3 text-sm font-semibold text-gray-800">
                  No{" "}
                  {title.toLowerCase()}{" "}
                  yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {type ===
                  "followers"
                    ? "When people follow this account, they'll appear here."
                    : "Accounts this user follows will appear here."}
                </p>

              </div>
            )}

          {/* User List */}

          {!loading &&
            !error &&
            users.length > 0 && (
              <div>

                {users.map(
                  (
                    user,
                    index
                  ) => {
                    const id =
                      user?._id ||
                      user?.id;

                    const username =
                      user?.username ||
                      "";

                    const name =
                      user?.name ||
                      user?.fullName ||
                      username ||
                      "OMNIX User";

                    const avatar =
                      user?.avatar ||
                      user?.profileImage ||
                      user?.profilePicture ||
                      "";

                    const bio =
                      user?.bio ||
                      "";

                    const currentUserId =
                      currentUser?._id ||
                      currentUser?.id;

                    const isCurrentUser =
                      currentUserId &&
                      id &&
                      String(
                        currentUserId
                      ) ===
                        String(id);

                    const isFollowing =
                      Boolean(
                        user?.isFollowing
                      );

                    return (
                      <div
                        key={
                          id ||
                          `${type}-${index}`
                        }
                        className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
                      >

                        {/* User Profile */}

                        <button
                          type="button"
                          onClick={() =>
                            handleUserClick(
                              user
                            )
                          }
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >

                          <Avatar
                            src={avatar}
                            name={name}
                            alt={name}
                            size="md"
                          />

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center gap-1.5">

                              <p className="truncate text-sm font-bold text-gray-950">
                                {name}
                              </p>

                              {user?.verified && (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-950 text-[8px] font-bold text-white">
                                  ✓
                                </span>
                              )}

                            </div>

                            {username && (
                              <p className="truncate text-xs text-gray-400">
                                @
                                {username.replace(
                                  "@",
                                  ""
                                )}
                              </p>
                            )}

                            {bio && (
                              <p className="mt-0.5 truncate text-xs text-gray-500">
                                {bio}
                              </p>
                            )}

                          </div>

                        </button>

                        {/* Follow Button */}

                        {!isCurrentUser && (
                          <FollowButton
                            user={user}
                            initialFollowing={
                              isFollowing
                            }
                            onFollow={
                              handleFollow
                            }
                            onUnfollow={
                              handleUnfollow
                            }
                          />
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </div>
      </div>
    </div>
  );
}

export default FollowListModal;
