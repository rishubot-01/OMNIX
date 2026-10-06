
import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import PostMenu from "./PostMenu";

function PostHeader({
  post,
  currentUser,
  onEdit,
  onDelete,
  onSave,
  onReport,
  onNotInterested,
}) {
  const navigate = useNavigate();

  /*
   * ==========================================
   * AUTHOR
   * ==========================================
   */

  const author =
    post?.user ||
    post?.author ||
    post?.createdBy ||
    {};

  /*
   * ==========================================
   * GET USER ID
   * ==========================================
   *
   * Backend/frontend responses can sometimes
   * return the ID in different formats.
   */

  const getUserId = (user) => {
    if (!user) {
      return "";
    }

    if (
      typeof user === "string" ||
      typeof user === "number"
    ) {
      return String(user);
    }

    return (
      user?._id ||
      user?.id ||
      user?.userId ||
      user?.user_id ||
      ""
    );
  };

  /*
   * Author ID
   */

  const authorId =
    getUserId(author);

  /*
   * Current logged-in user ID
   */

  const currentUserId =
    getUserId(currentUser);

  /*
   * ==========================================
   * OWNER CHECK
   * ==========================================
   */

  const isOwner =
    Boolean(authorId) &&
    Boolean(currentUserId) &&
    String(authorId) ===
      String(currentUserId);

  /*
   * ==========================================
   * USER PROFILE DATA
   * ==========================================
   */

  const username =
    author?.username ||
    "";

  const name =
    author?.name ||
    author?.fullName ||
    author?.username ||
    "OMNIX User";

  const avatar =
    author?.avatar ||
    author?.profileImage ||
    author?.profilePicture ||
    "";

  const createdAt =
    post?.createdAt ||
    post?.created_at;

  /*
   * ==========================================
   * PROFILE ID
   * ==========================================
   */

  const userId =
    authorId ||
    username;

  /*
   * ==========================================
   * PROFILE CLICK
   * ==========================================
   */

  const handleProfileClick = () => {
    if (!userId) {
      return;
    }

    navigate(
      `/user/${username || userId}`
    );
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">

      {/* =====================================
          AUTHOR
          ===================================== */}

      <button
        type="button"
        onClick={handleProfileClick}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <Avatar
          src={avatar}
          name={name}
          alt={name}
          size="sm"
        />

        <div className="min-w-0">

          {/* Name */}

          <div className="flex items-center gap-1.5">

            <span className="truncate text-sm font-bold text-gray-950">
              {name}
            </span>

            {author?.verified && (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-950 text-[9px] text-white"
                title="Verified"
              >
                ✓
              </span>
            )}

          </div>

          {/* Username + Date */}

          <div className="flex items-center gap-1.5">

            {username && (
              <span className="truncate text-xs text-gray-400">
                @{username.replace("@", "")}
              </span>
            )}

            {createdAt && (
              <>
                <span className="text-gray-300">
                  ·
                </span>

                <span className="text-xs text-gray-400">
                  {formatPostDate(createdAt)}
                </span>
              </>
            )}

          </div>

        </div>
      </button>

      {/* =====================================
          POST MENU
          ===================================== */}

      <PostMenu
        post={post}
        isOwner={isOwner}
        onEdit={onEdit}
        onDelete={onDelete}
        onSave={onSave}
        onReport={onReport}
        onNotInterested={onNotInterested}
      />

    </div>
  );
}

/*
 * ==========================================
 * POST DATE
 * ==========================================
 */

function formatPostDate(date) {
  const postDate =
    new Date(date);

  if (
    Number.isNaN(
      postDate.getTime()
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const diff =
    now - postDate;

  const seconds =
    Math.floor(
      diff / 1000
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const hours =
    Math.floor(
      minutes / 60
    );

  const days =
    Math.floor(
      hours / 24
    );

  if (seconds < 60) {
    return "now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (hours < 24) {
    return `${hours}h`;
  }

  if (days < 7) {
    return `${days}d`;
  }

  return postDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}

export default PostHeader;
