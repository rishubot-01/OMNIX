import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useStories from "../hooks/useStories";
import usePosts from "../hooks/usePosts";

import PostCard from "../components/post/PostCard";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Stories from "../components/story/Stories";

import useFeed from "../hooks/useFeed";
import postService from "../services/post.service";
import likeService from "../services/like.service";

function Home() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const stories = useStories(user);

  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    removePost,
    error,
  } = useFeed();

  const {
    deletePost,
  } = usePosts();

  /*
  |--------------------------------------------------------------------------
  | EDIT POST
  |--------------------------------------------------------------------------
  */

  const handleEditPost = useCallback(
    (post) => {
      if (!post) {
        return;
      }

      console.log("Edit post:", post);

      /*
       * Edit modal/form ko next step mein
       * yahan connect karenge.
       */
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | DELETE POST
  |--------------------------------------------------------------------------
  */

  const handleDeletePost = useCallback(
    async (post) => {
      const postId =
        post?._id ||
        post?.id;

      if (!postId) {
        alert("Post ID is missing.");
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this post?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deletePost(
          String(postId)
        );

        removePost(
          String(postId)
        );
      } catch (err) {
        console.error(
          "Delete post error:",
          err
        );

        alert(
          err?.response?.data
            ?.message ||
          err?.message ||
          "Unable to delete post."
        );
      }
    },
    [
      deletePost,
      removePost,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | SAVE / UNSAVE POST
  |--------------------------------------------------------------------------
  */

  const handleSavePost =
    useCallback(
      async (post, nextSaved) => {
        const postId =
          post?._id ||
          post?.id;

        if (!postId) {
          const error =
            new Error(
              "Post ID is missing."
            );

          alert(
            "Post ID is missing."
          );

          throw error;
        }

        /*
         * PostActions se actual saved state
         * yahan nextSaved ke through aa rahi hai.
         *
         * nextSaved === true
         *   -> Save
         *
         * nextSaved === false
         *   -> Unsave
         */

        try {
          if (nextSaved) {
            await postService.savePost(
              String(postId)
            );
          } else {
            await postService.unsavePost(
              String(postId)
            );
          }

          /*
           * API successful hone ke baad
           * PostActions apni local UI state
           * already update karta hai.
           */

          console.log(
            nextSaved
              ? "Post saved successfully:"
              : "Post unsaved successfully:",
            postId
          );
        } catch (err) {
          console.error(
            "Save/unsave post error:",
            err
          );

          alert(
            err?.response?.data
              ?.message ||
            err?.message ||
            (
              nextSaved
                ? "Unable to save post."
                : "Unable to remove saved post."
            )
          );

          /*
           * Error ko re-throw karna hai.
           * Isse PostActions optimistic
           * UI state ko rollback karega.
           */

          throw err;
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | LIKE / UNLIKE POST
  |--------------------------------------------------------------------------
  */

  const handleLikePost =
    useCallback(
      async (post, nextLiked) => {
        const postId =
          post?._id ||
          post?.id;

        if (!postId) {
          throw new Error(
            "Post ID is missing."
          );
        }

        try {
          /*
           * nextLiked === true
           *   -> Like
           *
           * nextLiked === false
           *   -> Unlike
           */

          if (nextLiked) {
            await likeService.likePost(
              String(postId)
            );
          } else {
            await likeService.unlikePost(
              String(postId)
            );
          }

          console.log(
            nextLiked
              ? "Post liked successfully:"
              : "Post unliked successfully:",
            postId
          );
        } catch (err) {
          console.error(
            "Like/unlike post error:",
            err
          );

          /*
           * Error ko re-throw karna important hai.
           *
           * PostActions is error ko catch karke
           * optimistic like/count state rollback karega.
           */

          throw err;
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | COMMENT POST
  |--------------------------------------------------------------------------
  */

  const handleCommentPost =
    useCallback(
      (post) => {
        if (!post) {
          return;
        }

        const postId =
          post?._id ||
          post?.id;

        if (!postId) {
          console.error(
            "Comment post error: Post ID is missing."
          );

          return;
        }

        /*
         * NOTE:
         * PostCard currently handles comments
         * inline, so this handler is kept for
         * compatibility with the existing flow.
         */

        navigate(
          `/post/${String(postId)}`
        );
      },
      [navigate]
    );

  /*
  |--------------------------------------------------------------------------
  | REPORT POST
  |--------------------------------------------------------------------------
  */

  const handleReportPost =
    useCallback(
      (post) => {
        if (!post) {
          return;
        }

        console.log(
          "Report post:",
          post
        );

        /*
         * Report modal/API ko next step mein
         * yahan connect karenge.
         */
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | NOT INTERESTED
  |--------------------------------------------------------------------------
  */

  const handleNotInterested =
    useCallback(
      (post) => {
        const postId =
          post?._id ||
          post?.id;

        if (!postId) {
          return;
        }

        removePost(
          String(postId)
        );
      },
      [removePost]
    );

  /*
  |--------------------------------------------------------------------------
  | INFINITE SCROLL
  |--------------------------------------------------------------------------
  */

  const loadMoreRef =
    useRef(null);

  useEffect(() => {
    const target =
      loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            entry.isIntersecting &&
            hasMore &&
            !loadingMore &&
            !loading
          ) {
            loadMore();
          }
        },
        {
          rootMargin:
            "300px 0px",
          threshold: 0,
        }
      );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    loadingMore,
    loading,
    loadMore,
  ]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | HOME PAGE
  |--------------------------------------------------------------------------
  */

  return (
    
<div className="-mx-4 min-w-0 space-y-1 sm:mx-0">

      {/* ========================================
          STORIES
      ======================================== */}

      <div className="border-b border-gray-100 bg-white">
        <Stories
          compact
          currentUser={user}
          groups={stories.groups}
          loading={stories.loading}
          error={stories.error}
          uploading={stories.uploading}
          onCreate={stories.createStory}
          onViewed={stories.markViewed}
        />
      </div>

      {/* ========================================
          HEADER
      ======================================== */}

      <div>
        <h1 className="text-xl font-bold">
          {/* Home */}
        </h1>

        <p className="text-sm text-gray-500">
          {/* See what's happening on OMNIX. */}
        </p>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ========================================
          POSTS
      ======================================== */}

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Follow people and create posts to build your OMNIX feed."
        />
      ) : (
        <div className="space-y-1">

          {posts.map((post) => (
            <PostCard
              key={
                post?._id ||
                post?.id
              }

              post={post}

              currentUser={user}

              onLike={
                handleLikePost
              }

              onEdit={
                handleEditPost
              }

              onDelete={
                handleDeletePost
              }

              onSave={
                handleSavePost
              }

              onComment={
                handleCommentPost
              }

              onReport={
                handleReportPost
              }

              onNotInterested={
                handleNotInterested
              }
            />
          ))}

        </div>
      )}

      {/* ========================================
          INFINITE SCROLL TRIGGER
      ======================================== */}

      {posts.length > 0 && (
        <div
          ref={loadMoreRef}
          className="flex min-h-16 items-center justify-center py-5"
        >
          {loadingMore && (
            <div className="text-sm text-gray-500">
              Loading more posts...
            </div>
          )}

          {!loadingMore &&
            !hasMore && (
              <div className="text-sm text-gray-400">
                You're all caught up.
              </div>
            )}
        </div>
      )}

    </div>
  );
}

export default Home;