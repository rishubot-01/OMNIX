import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import userService from "../services/user.service";
import followService from "../services/follow.service";
import postService from "../services/post.service";
import useAuth from "./useAuth";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getId = (value) =>
  value?._id ||
  value?.id ||
  value;

/*
|--------------------------------------------------------------------------
| Get Numeric Count
|--------------------------------------------------------------------------
*/

const getCount = (
  value,
  ...fields
) => {
  for (const field of fields) {
    const count = Number(
      value?.[field]
    );

    if (Number.isFinite(count)) {
      return count;
    }
  }

  return 0;
};

/*
|--------------------------------------------------------------------------
| useProfile
|--------------------------------------------------------------------------
*/

function useProfile(
  identifier,
  options = {}
) {
  const {
    autoFetch = true,
  } = options;

  const {
    user: currentUser,
    updateUser,
  } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(Boolean(autoFetch));

  const [postsLoading, setPostsLoading] =
    useState(Boolean(autoFetch));

  const [error, setError] =
    useState("");

  const [isFollowing, setIsFollowing] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Request Guards
  |--------------------------------------------------------------------------
  |
  | React StrictMode development mein effects
  | dobara run ho sakte hain.
  |
  | In refs ki help se same request ke multiple
  | simultaneous API calls prevent honge.
  |
  */

  const profileRequestRef =
    useRef(null);

  const postsRequestRef =
    useRef(null);

  const followStatusRequestRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Profile
  |--------------------------------------------------------------------------
  */

  const fetchProfile =
    useCallback(async () => {
      if (!identifier) {
        setProfile(null);
        setLoading(false);
        return null;
      }

      /*
       * Agar same profile request already
       * running hai to wahi Promise return karo.
       */

      if (
        profileRequestRef.current?.identifier ===
        identifier
      ) {
        return profileRequestRef.current.promise;
      }

      setLoading(true);
      setError("");

      const request = (async () => {
        try {
          let response;

          /*
           * MongoDB ObjectId
           */

          if (
            typeof identifier === "string" &&
            /^[a-fA-F0-9]{24}$/.test(
              identifier
            )
          ) {
            response =
              await userService.getUserById(
                identifier
              );
          } else {
            response =
              await userService.getProfile(
                identifier
              );
          }

          /*
           * Backend response unwrap
           */

          const responseData =
            response?.data ??
            response ??
            {};

          const nextProfile =
            responseData?.data ??
            responseData?.user ??
            responseData;

          setProfile(
            nextProfile || null
          );

          return (
            nextProfile || null
          );
        } catch (requestError) {
          console.error(
            "Profile fetch error:",
            requestError
          );

          setProfile(null);

          setError(
            requestError?.response?.data
              ?.message ||
            requestError?.message ||
            "Unable to load profile."
          );

          return null;
        } finally {
          setLoading(false);

          /*
           * Request complete hone ke baad
           * ref clear karo.
           */

          if (
            profileRequestRef.current?.identifier ===
            identifier
          ) {
            profileRequestRef.current =
              null;
          }
        }
      })();

      profileRequestRef.current = {
        identifier,
        promise: request,
      };

      return request;
    }, [identifier]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Posts
  |--------------------------------------------------------------------------
  */

  const fetchPosts =
    useCallback(async () => {
      if (!identifier) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      const profileId =
        getId(profile);

      if (!profileId) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      /*
       * Same profile ke posts request ko
       * simultaneously dobara mat bhejo.
       */

      if (
        postsRequestRef.current?.profileId ===
        String(profileId)
      ) {
        return postsRequestRef.current.promise;
      }

      setPostsLoading(true);

      const request = (async () => {
        try {
          const response =
            await postService.getUserPosts(
              profileId
            );

          const responseData =
            response?.data ??
            response ??
            {};

          const list =
            Array.isArray(
              responseData?.data
            )
              ? responseData.data
              : Array.isArray(
                  responseData?.posts
                )
              ? responseData.posts
              : Array.isArray(
                  responseData
                )
              ? responseData
              : [];

          setPosts(list);
        } catch (requestError) {
          console.error(
            "Profile posts fetch error:",
            requestError
          );

          setPosts([]);
        } finally {
          setPostsLoading(false);

          if (
            postsRequestRef.current?.profileId ===
            String(profileId)
          ) {
            postsRequestRef.current =
              null;
          }
        }
      })();

      postsRequestRef.current = {
        profileId: String(profileId),
        promise: request,
      };

      return request;
    }, [identifier, profile]);

  /*
  |--------------------------------------------------------------------------
  | Remove Post From Local Profile State
  |--------------------------------------------------------------------------
  |
  | Backend se post successfully delete hone ke baad
  | profile ke local posts array se bhi post remove hoga.
  |
  | Important:
  | Yahan API call nahi hai.
  | API deletion usePosts/usePostService handle karega.
  |
  */

  const removePost =
    useCallback(
      (postId) => {
        if (!postId) {
          return;
        }

        setPosts((previous) =>
          previous.filter(
            (post) =>
              String(
                post?._id ||
                post?.id
              ) !== String(postId)
          )
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  |
  | Important:
  |
  | Yahan sirf profile fetch hoga.
  |
  | Profile update hone ke baad fetchPosts()
  | ka useEffect automatically posts fetch karega.
  |
  | Isse same refresh ke andar posts ki
  | duplicate API request nahi hogi.
  |
  */

  const refresh =
    useCallback(async () => {
      const nextProfile =
        await fetchProfile();

      if (!nextProfile) {
        setPosts([]);
      }

      return nextProfile;
    }, [fetchProfile]);

  /*
  |--------------------------------------------------------------------------
  | Check Follow Status
  |--------------------------------------------------------------------------
  */

  const checkStatus =
    useCallback(async () => {
      const profileId =
        getId(profile);

      const currentUserId =
        getId(currentUser);

      /*
       * Apne profile par follow status
       * API call ki zarurat nahi.
       */

      if (
        !profileId ||
        !currentUserId ||
        String(profileId) ===
          String(currentUserId)
      ) {
        setIsFollowing(false);
        return false;
      }

      const requestKey =
        `${currentUserId}:${profileId}`;

      /*
       * Same follow-status request
       * simultaneously dobara mat bhejo.
       */

      if (
        followStatusRequestRef.current
          ?.key === requestKey
      ) {
        return followStatusRequestRef.current
          .promise;
      }

      const request =
        (async () => {
          try {
            const response =
              await followService.checkFollowStatus(
                profileId
              );

            const responseData =
              response?.data ??
              response ??
              {};

            const status =
              responseData?.data ??
              responseData;

            const following =
              typeof status ===
              "boolean"
                ? status
                : Boolean(
                    status?.isFollowing ??
                    status?.following ??
                    false
                  );

            setIsFollowing(
              following
            );

            return following;
          } catch (requestError) {
            console.error(
              "Follow status error:",
              requestError
            );

            setIsFollowing(false);

            return false;
          } finally {
            if (
              followStatusRequestRef.current
                ?.key === requestKey
            ) {
              followStatusRequestRef.current =
                null;
            }
          }
        })();

      followStatusRequestRef.current = {
        key: requestKey,
        promise: request,
      };

      return request;
    }, [
      profile,
      currentUser,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Initial Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    refresh();
  }, [
    autoFetch,
    refresh,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Posts After Profile
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!profile) {
      return;
    }

    fetchPosts();
  }, [
    profile,
    fetchPosts,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Follow Status
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!profile) {
      return;
    }

    checkStatus();
  }, [
    profile,
    checkStatus,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Follow User
  |--------------------------------------------------------------------------
  */

  const followUser =
    useCallback(
      async (targetUser) => {
        const targetId =
          getId(
            targetUser || profile
          );

        const currentUserId =
          getId(currentUser);

        if (!targetId) {
          throw new Error(
            "User ID not found"
          );
        }

        if (!currentUserId) {
          throw new Error(
            "Current user ID not found"
          );
        }

        if (
          String(targetId) ===
          String(currentUserId)
        ) {
          throw new Error(
            "You cannot follow yourself"
          );
        }

        /*
         * Backend call
         */

        await followService.followUser(
          targetId
        );

        /*
         * Update target profile
         */

        setProfile(
          (previousProfile) => {
            if (!previousProfile) {
              return previousProfile;
            }

            const followersCount =
              getCount(
                previousProfile,
                "followersCount"
              );

            const hasFollowersArray =
              Array.isArray(
                previousProfile.followers
              );

            const nextFollowers =
              hasFollowersArray
                ? previousProfile.followers.some(
                    (id) =>
                      String(
                        getId(id)
                      ) ===
                      String(
                        currentUserId
                      )
                  )
                  ? previousProfile.followers
                  : [
                      ...previousProfile.followers,
                      currentUserId,
                    ]
                : previousProfile.followers;

            return {
              ...previousProfile,

              followersCount:
                followersCount + 1,

              ...(hasFollowersArray
                ? {
                    followers:
                      nextFollowers,
                  }
                : {}),
            };
          }
        );

        /*
         * Update logged-in user
         */

        updateUser({
          followingCount:
            getCount(
              currentUser,
              "followingCount"
            ) + 1,
        });

        /*
         * Synchronize following array
         */

        if (
          Array.isArray(
            currentUser?.following
          )
        ) {
          const alreadyFollowing =
            currentUser.following.some(
              (id) =>
                String(
                  getId(id)
                ) ===
                String(targetId)
            );

          if (
            !alreadyFollowing
          ) {
            updateUser({
              following: [
                ...currentUser.following,
                targetId,
              ],
            });
          }
        }

        setIsFollowing(true);

        return true;
      },
      [
        profile,
        currentUser,
        updateUser,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Unfollow User
  |--------------------------------------------------------------------------
  */

  const unfollowUser =
    useCallback(
      async (targetUser) => {
        const targetId =
          getId(
            targetUser || profile
          );

        const currentUserId =
          getId(currentUser);

        if (!targetId) {
          throw new Error(
            "User ID not found"
          );
        }

        if (!currentUserId) {
          throw new Error(
            "Current user ID not found"
          );
        }

        if (
          String(targetId) ===
          String(currentUserId)
        ) {
          throw new Error(
            "You cannot unfollow yourself"
          );
        }

        /*
         * Backend call
         */

        await followService.unfollowUser(
          targetId
        );

        /*
         * Update target profile
         */

        setProfile(
          (previousProfile) => {
            if (!previousProfile) {
              return previousProfile;
            }

            const followersCount =
              getCount(
                previousProfile,
                "followersCount"
              );

            const hasFollowersArray =
              Array.isArray(
                previousProfile.followers
              );

            const nextFollowers =
              hasFollowersArray
                ? previousProfile.followers.filter(
                    (id) =>
                      String(
                        getId(id)
                      ) !==
                      String(
                        currentUserId
                      )
                  )
                : previousProfile.followers;

            return {
              ...previousProfile,

              followersCount:
                Math.max(
                  0,
                  followersCount - 1
                ),

              ...(hasFollowersArray
                ? {
                    followers:
                      nextFollowers,
                  }
                : {}),
            };
          }
        );

        /*
         * Update logged-in user
         */

        updateUser({
          followingCount:
            Math.max(
              0,
              getCount(
                currentUser,
                "followingCount"
              ) - 1
            ),
        });

        /*
         * Synchronize following array
         */

        if (
          Array.isArray(
            currentUser?.following
          )
        ) {
          updateUser({
            following:
              currentUser.following.filter(
                (id) =>
                  String(
                    getId(id)
                  ) !==
                  String(targetId)
              ),
          });
        }

        setIsFollowing(false);

        return true;
      },
      [
        profile,
        currentUser,
        updateUser,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    profile,
    posts,
    loading,
    postsLoading,
    error,

    isFollowing,

    followUser,
    unfollowUser,

    refresh,
    fetchProfile,
    fetchPosts,

    /*
     * Local post deletion helper
     */
    removePost,

    setProfile,
    setPosts,
  };
}

export default useProfile;