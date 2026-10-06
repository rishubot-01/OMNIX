
import {
  useState,
  useEffect,
  useCallback,
} from "react";

import SearchBar from "../components/search/SearchBar";
import SearchResult from "../components/search/SearchResult";
import Loader from "../components/common/Loader";

import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";

import userService from "../services/user.service";
import followService from "../services/follow.service";

function Explore() {
  const { user: currentUser } = useAuth();

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  /*
   * Store follow status for searched users.
   *
   * Example:
   * {
   *   "userId1": true,
   *   "userId2": false
   * }
   */
  const [followingStatus, setFollowingStatus] =
    useState({});

  const debouncedQuery =
    useDebounce(query, 500);

  /*
   |--------------------------------------------------------------------------
   | Search Users
   |--------------------------------------------------------------------------
   */

  const searchUsers = useCallback(
    async (search) => {
      if (!search.trim()) {
        setResults([]);
        setFollowingStatus({});
        return;
      }

      setLoading(true);

      try {
        const response =
          await userService.searchUsers(
            search
          );

        /*
         * Backend response:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         */
        const data =
          response?.data || [];

        setResults(data);

        /*
         * Check follow status for every
         * searched user.
         */
        if (currentUser && data.length > 0) {
          const statusEntries =
            await Promise.all(
              data.map(async (result) => {
                const user =
                  result?.user ||
                  result;

                const userId =
                  user?._id ||
                  user?.id;

                /*
                 * Current user doesn't need
                 * follow status.
                 */
                if (
                  !userId ||
                  String(userId) ===
                    String(
                      currentUser?._id ||
                      currentUser?.id
                    )
                ) {
                  return [
                    String(userId),
                    false,
                  ];
                }

                try {
                  const statusResponse =
                    await followService.checkFollowStatus(
                      userId
                    );

                  /*
                   * Accept common response
                   * formats.
                   */
                  const status =
                    statusResponse?.data;

                  const isFollowing =
                    typeof status === "boolean"
                      ? status
                      : status?.isFollowing ??
                        status?.following ??
                        false;

                  return [
                    String(userId),
                    Boolean(isFollowing),
                  ];
                } catch {
                  return [
                    String(userId),
                    false,
                  ];
                }
              })
            );

          setFollowingStatus(
            Object.fromEntries(
              statusEntries
            )
          );
        } else {
          setFollowingStatus({});
        }
      } catch (error) {
        console.error(
          "Search error:",
          error
        );

        setResults([]);
        setFollowingStatus({});
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  useDebouncedSearch(
    debouncedQuery,
    searchUsers
  );

  /*
   |--------------------------------------------------------------------------
   | Follow User
   |--------------------------------------------------------------------------
   */

  const handleFollow = useCallback(
    async (user) => {
      const userId =
        user?._id ||
        user?.id;

      if (!userId) {
        throw new Error(
          "User ID not found"
        );
      }

      await followService.followUser(
        userId
      );

      setFollowingStatus(
        (previous) => ({
          ...previous,
          [String(userId)]: true,
        })
      );
    },
    []
  );

  /*
   |--------------------------------------------------------------------------
   | Unfollow User
   |--------------------------------------------------------------------------
   */

  const handleUnfollow = useCallback(
    async (user) => {
      const userId =
        user?._id ||
        user?.id;

      if (!userId) {
        throw new Error(
          "User ID not found"
        );
      }

      await followService.unfollowUser(
        userId
      );

      setFollowingStatus(
        (previous) => ({
          ...previous,
          [String(userId)]: false,
        })
      );
    },
    []
  );

  /*
   |--------------------------------------------------------------------------
   | Render
   |--------------------------------------------------------------------------
   */

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Explore
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Discover people and content on OMNIX.
        </p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        loading={loading}
        placeholder="Search people..."
      />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              {query
                ? "No results found."
                : "Search for people on OMNIX."}
            </div>
          ) : (
            results.map((result) => {
              const user =
                result?.user ||
                result;

              const userId =
                user?._id ||
                user?.id;

              const isCurrentUser =
                currentUser &&
                userId &&
                String(userId) ===
                  String(
                    currentUser?._id ||
                      currentUser?.id
                  );

              return (
                <SearchResult
                  key={
                    userId ||
                    Math.random()
                  }
                  result={result}
                  currentUser={
                    currentUser
                  }
                  isFollowing={
                    followingStatus[
                      String(userId)
                    ] || false
                  }
                  onFollow={
                    handleFollow
                  }
                  onUnfollow={
                    handleUnfollow
                  }
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Debounced Search Helper
|--------------------------------------------------------------------------
*/

function useDebouncedSearch(
  value,
  callback
) {
  useEffect(() => {
    callback(value);
  }, [value, callback]);
}

export default Explore;
