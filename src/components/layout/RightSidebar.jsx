
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { STORAGE_KEYS } from "../../utils/constants";

const suggestedUsers = [
  {
    id: 1,
    name: "Aman Singh",
    username: "@aman",
  },
  {
    id: 2,
    name: "Neha Sharma",
    username: "@neha",
  },
  {
    id: 3,
    name: "Rahul Kumar",
    username: "@rahul",
  },
  {
    id: 4,
    name: "Priya Verma",
    username: "@priya",
  },
  {
    id: 5,
    name: "Arjun Mehta",
    username: "@arjun",
  },
  {
    id: 6,
    name: "Sneha Gupta",
    username: "@sneha",
  },
];

const trends = [
  {
    id: 1,
    category: "Trending",
    title: "#OMNIX",
    posts: "12.4K posts",
  },
  {
    id: 2,
    category: "Technology",
    title: "#AI",
    posts: "8.7K posts",
  },
  {
    id: 3,
    category: "India",
    title: "#India",
    posts: "6.2K posts",
  },
];

function RightSidebar() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [showAllSuggestions, setShowAllSuggestions] =
    useState(false);

  /*
   * Get current user
   *
   * First try AuthContext.
   * If AuthContext has not loaded yet, use the
   * same localStorage value used by AuthProvider.
   */
  let currentUser = user;

  if (!currentUser) {
    try {
      const savedUser = localStorage.getItem(
        STORAGE_KEYS.USER
      );

      if (savedUser) {
        currentUser = JSON.parse(savedUser);
      }
    } catch {
      currentUser = null;
    }
  }

  /*
   * Current user fields
   *
   * Supports different possible names used by backend.
   */
  const currentUserName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.displayName ||
    currentUser?.username ||
    "User";

  const currentUsername =
    currentUser?.username ||
    currentUser?.userName ||
    currentUser?.handle ||
    "";

  const currentUserId =
    currentUser?.id ||
    currentUser?._id ||
    currentUser?.userId ||
    currentUser?.uid ||
    "";

  /*
   * Profile image
   */
  const profileImage =
    currentUser?.profileImage ||
    currentUser?.profilePicture ||
    currentUser?.avatar ||
    currentUser?.avatarUrl ||
    currentUser?.image ||
    null;

  const visibleSuggestions = showAllSuggestions
    ? suggestedUsers
    : suggestedUsers.slice(0, 3);

  return (
    <aside className="hidden w-[380px] shrink-0 xl:block -ml-10">
      <div className="sticky top-20 space-y-1">

        {/* Profile + Suggested Users */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">

          {/* Current Logged-in Profile */}
          <div className="flex items-center gap-3">

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => {
                if (currentUserId) {
                  navigate(`/user/${currentUserId}`);
                }
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-sm font-bold text-white"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={currentUserName}
                  className="h-full w-full object-cover"
                />
              ) : (
                currentUserName
                  .charAt(0)
                  .toUpperCase()
              )}
            </button>

            {/* Current User Name + Username */}
            <button
              type="button"
              onClick={() => {
                if (currentUserId) {
                  navigate(`/user/${currentUserId}`);
                }
              }}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-bold text-gray-900">
                {currentUserName}
              </p>

              <p className="truncate text-xs text-gray-400">
                {currentUsername
                  ? currentUsername.startsWith("@")
                    ? currentUsername
                    : `@${currentUsername}`
                  : currentUserId
                    ? `ID: ${currentUserId}`
                    : ""}
              </p>
            </button>

            {/* Switch */}
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-blue-600 transition hover:text-blue-800"
            >
              Switch
            </button>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-100" />

          {/* Suggested Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Suggested for you
            </h2>

            <button
              type="button"
              onClick={() =>
                setShowAllSuggestions(
                  (previous) => !previous
                )
              }
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              {showAllSuggestions
                ? "Show less"
                : "See all"}
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-4 space-y-4">
            {visibleSuggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3"
              >
                {/* Avatar */}
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/user/${user.username.replace(
                        "@",
                        ""
                      )}`
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white"
                >
                  {user.name.charAt(0)}
                </button>

                {/* User Info */}
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/user/${user.username.replace(
                        "@",
                        ""
                      )}`
                    )
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-gray-400">
                    {user.username}
                  </p>
                </button>

                {/* Follow */}
                <button
                  type="button"
                  className="rounded-lg bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Trending
            </h2>

            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              More
            </button>
          </div>

          <div className="mt-3">
            {trends.map((trend) => (
              <button
                key={trend.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/explore?q=${encodeURIComponent(
                      trend.title
                    )}`
                  )
                }
                className="block w-full rounded-xl px-2 py-3 text-left transition hover:bg-gray-50"
              >
                <p className="text-[11px] text-gray-400">
                  {trend.category}
                </p>

                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {trend.title}
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  {trend.posts}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="px-2 text-[11px] leading-5 text-gray-400">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <button
              type="button"
              className="hover:text-gray-700"
            >
              About
            </button>

            <button
              type="button"
              className="hover:text-gray-700"
            >
              Privacy
            </button>

            <button
              type="button"
              className="hover:text-gray-700"
            >
              Terms
            </button>

            <button
              type="button"
              className="hover:text-gray-700"
            >
              Help
            </button>
          </div>

          <p className="mt-2">
            © {new Date().getFullYear()} OMNIX
          </p>
        </div>

      </div>
    </aside>
  );
}

export default RightSidebar;