import PostCard from "../post/PostCard";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

function ProfilePosts({
  posts = [],
  loading = false,
  error = "",
  activeTab = "posts",
  currentUser,
  onLike,
  onComment,
  onSave,
  onDelete,
  onEdit,
  onReport,
  onRetry,
}) {
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader
          size="md"
          text="Loading posts..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage
          message={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        title={
          activeTab === "saved"
            ? "No saved posts"
            : "No posts yet"
        }
        description={
          activeTab === "saved"
            ? "Posts you save will appear here."
            : "This profile hasn't shared anything yet."
        }
      />
    );
  }

  /*
   * Normal posts:
   * Instagram-like single-column cards.
   *
   * Later we can create a media grid
   * specifically for the Media tab.
   */

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post?._id || post?.id}
          post={post}
          currentUser={currentUser}
          onLike={onLike}
          onComment={onComment}
          onSave={onSave}
          onDelete={onDelete}
          onEdit={onEdit}
          onReport={onReport}
        />
      ))}
    </div>
  );
}

export default ProfilePosts;