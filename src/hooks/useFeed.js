
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import feedService from "../services/feed.service";
import useAuth from "./useAuth";

function useFeed({
  autoFetch = true,
  pageSize = 10,
} = {}) {
  const { user } = useAuth();

  const userId = user?.id || user?._id;

  const [posts, setPosts] = useState([]);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState(null);

  /*
   * Extract posts from API response
   */
  const extractPosts = (response) => {
    const data = response?.data || response;

    if (Array.isArray(data)) {
      return data;
    }

    return (
      data?.posts ||
      data?.feed ||
      data?.data?.posts ||
      data?.data ||
      []
    );
  };

  /*
   * Extract pagination from API response
   */
  const extractPagination = (response) => {
    return (
      response?.pagination ||
      response?.data?.pagination ||
      null
    );
  };

  /*
   * Fetch first page
   */
  const fetchFeed = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        if (!userId) {
          throw new Error(
            "A signed-in user is required to load the feed."
          );
        }

        /*
         * Always request page 1
         */
        const response = await feedService.getFeed(
          userId,
          1,
          pageSize
        );

        const newPosts = extractPosts(response);

        /*
         * Replace old posts
         */
        setPosts(newPosts);

        /*
         * Reset page
         */
        setPage(1);

        /*
         * Check pagination
         */
        const pagination =
          extractPagination(response);

        if (pagination) {
          setHasMore(
            pagination.hasNextPage ??
              pagination.hasMore ??
              false
          );
        } else {
          setHasMore(false);
        }

        return response;
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load feed."
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pageSize, userId]
  );

  /*
   * Load next page
   */
  const loadMore = useCallback(
    async () => {
      /*
       * Don't make another request
       * while one is already running.
       */
      if (
        loadingMore ||
        loading ||
        !hasMore
      ) {
        return;
      }

      const nextPage = page + 1;

      setLoadingMore(true);
      setError(null);

      try {
        if (!userId) {
          throw new Error(
            "A signed-in user is required to load the feed."
          );
        }

        /*
         * IMPORTANT:
         * Request the actual next page.
         */
        const response =
          await feedService.getFeed(
            userId,
            nextPage,
            pageSize
          );

        const newPosts =
          extractPosts(response);

        /*
         * Add new posts to existing posts
         */
        setPosts((previous) => [
          ...previous,
          ...newPosts,
        ]);

        /*
         * Update current page
         */
        setPage(nextPage);

        /*
         * Check whether another page exists
         */
        const pagination =
          extractPagination(response);

        if (pagination) {
          setHasMore(
            pagination.hasNextPage ??
              pagination.hasMore ??
              false
          );
        } else {
          /*
           * If API doesn't provide pagination,
           * stop loading more.
           */
          setHasMore(false);
        }

        return response;
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load more posts."
        );

        throw err;
      } finally {
        setLoadingMore(false);
      }
    },
    [
      page,
      pageSize,
      loading,
      loadingMore,
      hasMore,
      userId,
    ]
  );

  /*
   * Refresh feed
   */
  const refresh = useCallback(
    async () => {
      return fetchFeed();
    },
    [fetchFeed]
  );

  /*
   * Remove post locally
   */
  const removePost = useCallback(
    (postId) => {
      setPosts((previous) =>
        previous.filter(
          (post) =>
            String(
              post?._id || post?.id
            ) !== String(postId)
        )
      );
    },
    []
  );

  /*
   * Update post locally
   */
  const updatePost = useCallback(
    (updatedPost) => {
      const updatedId =
        updatedPost?._id ||
        updatedPost?.id;

      setPosts((previous) =>
        previous.map((post) => {
          const postId =
            post?._id ||
            post?.id;

          return String(postId) ===
            String(updatedId)
            ? {
                ...post,
                ...updatedPost,
              }
            : post;
        })
      );
    },
    []
  );

  /*
   * Automatically fetch first page
   */
  useEffect(() => {
    if (autoFetch) {
      fetchFeed().catch(() => {});
    }
  }, [autoFetch, fetchFeed]);

  return {
    posts,

    page,
    hasMore,

    loading,
    loadingMore,
    error,

    fetchFeed,
    refresh,
    loadMore,

    removePost,
    updatePost,
  };
}

export default useFeed;
