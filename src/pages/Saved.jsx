import {
  useCallback,
  useEffect,
  useState,
} from "react";

import PostCard from "../components/post/PostCard";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

import postService from "../services/post.service";

function Saved() {
  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * ==========================================
   * FETCH SAVED POSTS
   * ==========================================
   */

  const fetchSavedPosts =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await postService.getSavedPosts();

        /*
         * Backend response:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         */

        const savedPosts =
          Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : Array.isArray(
                response?.data?.posts
              )
            ? response.data.posts
            : Array.isArray(
                response?.data?.data
              )
            ? response.data.data
            : Array.isArray(
                response?.posts
              )
            ? response.posts
            : [];

        /*
         * Saved page ke har post ko explicitly
         * saved mark kar dete hain.
         *
         * Isse PostActions bookmark filled
         * state me show karega.
         */

        const normalizedPosts =
          savedPosts.map((post) => ({
            ...post,
            isSaved: true,
            savedByCurrentUser: true,
          }));

        setPosts(normalizedPosts);
      } catch (error) {
        console.error(
          "Saved posts error:",
          error
        );

        setPosts([]);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  /*
   * ==========================================
   * UNSAVE FROM SAVED PAGE
   * ==========================================
   */

  const handleSavePost =
    useCallback(
      async (post, nextSaved) => {
        const postId =
          post?._id ||
          post?.id;

        if (!postId) {
          throw new Error(
            "Post ID is missing."
          );
        }

        /*
         * Saved page par normally
         * nextSaved = false hoga.
         */

        if (!nextSaved) {
          try {
            await postService.unsavePost(
              String(postId)
            );

            /*
             * API successful hone ke baad
             * post ko Saved list se immediately
             * remove kar do.
             */

            setPosts((currentPosts) =>
              currentPosts.filter(
                (item) =>
                  String(
                    item?._id ||
                      item?.id
                  ) !==
                  String(postId)
              )
            );
          } catch (error) {
            console.error(
              "Unsave post error:",
              error
            );

            alert(
              error?.response?.data
                ?.message ||
                error?.message ||
                "Unable to remove saved post."
            );

            throw error;
          }

          return;
        }

        /*
         * Agar kisi reason se Saved page par
         * save action trigger ho jaye.
         */

        try {
          await postService.savePost(
            String(postId)
          );
        } catch (error) {
          console.error(
            "Save post error:",
            error
          );

          throw error;
        }
      },
      []
    );

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Saved
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Posts you've saved on OMNIX.
        </p>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="No saved posts"
          description="Posts you save will appear here."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={
                post?._id ||
                post?.id
              }
              post={post}
              onSave={handleSavePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Saved;