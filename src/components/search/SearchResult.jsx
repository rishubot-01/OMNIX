import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import FollowButton from "../profile/FollowButton";

function SearchResult({
  result,
  currentUser,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onClick,
}) {
  const navigate = useNavigate();

  if (!result) {
    return null;
  }

  const resultType =
    result.type ||
    result.resultType ||
    (result.username ||
    result.name ||
    result.avatar
      ? "user"
      : "post");

  if (resultType === "post") {
    return (
      <PostSearchResult
        post={result}
        onClick={onClick}
      />
    );
  }

  const user =
    result.user ||
    result;

  const userId =
    user?._id ||
    user?.id;

  const name =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "OMNIX User";

  const username =
    user?.username ||
    "";

  const avatar =
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    "";

  const bio =
    user?.bio ||
    "";

  const isCurrentUser =
    currentUser &&
    userId &&
    currentUser?._id &&
    String(currentUser._id) ===
      String(userId);

  const handleClick = () => {
    if (onClick) {
      onClick(user);
      return;
    }

    navigate(
      `/user/${username || userId}`
    );
  };

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-gray-50">
      {/* Profile */}
      <button
        type="button"
        onClick={handleClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Avatar
          src={avatar}
          name={name}
          alt={name}
          size="md"
        />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-gray-950">
              {name}
            </span>

            {user?.verified && (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-950 text-[8px] font-bold text-white">
                ✓
              </span>
            )}
          </div>

          {username && (
            <p className="truncate text-xs text-gray-400">
              @{username.replace("@", "")}
            </p>
          )}

          {bio && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {bio}
            </p>
          )}
        </div>
      </button>

      {/* Follow */}
      {!isCurrentUser && (
        <FollowButton
          user={user}
          initialFollowing={isFollowing}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
        />
      )}
    </div>
  );
}

function PostSearchResult({
  post,
  onClick,
}) {
  const navigate = useNavigate();

  const postId =
    post?._id ||
    post?.id;

  const author =
    post?.user ||
    post?.author ||
    {};

  const authorName =
    author?.name ||
    author?.username ||
    "OMNIX User";

  const username =
    author?.username ||
    "";

  const avatar =
    author?.avatar ||
    author?.profileImage ||
    author?.profilePicture ||
    "";

  const caption =
    post?.caption ||
    post?.content ||
    post?.text ||
    "";

  const image =
    post?.imageUrl ||
    post?.image ||
    post?.mediaUrl ||
    post?.media?.url ||
    (typeof post?.media === "string"
      ? post.media
      : "");

  const handleClick = () => {
    if (onClick) {
      onClick(post);
      return;
    }

    if (postId) {
      navigate(`/post/${postId}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
    >
      {/* Media */}
      {image ? (
        <img
          src={image}
          alt="Post"
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              strokeWidth="1.7"
            />

            <circle
              cx="8.5"
              cy="9"
              r="1.3"
              strokeWidth="1.7"
            />
          </svg>
        </div>
      )}

      {/* Post info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Avatar
            src={avatar}
            name={authorName}
            alt={authorName}
            size="xs"
          />

          <span className="truncate text-xs font-semibold text-gray-700">
            {username
              ? `@${username.replace("@", "")}`
              : authorName}
          </span>
        </div>

        {caption && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {caption}
          </p>
        )}
      </div>
    </button>
  );
}

export default SearchResult;