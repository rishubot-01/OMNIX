import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Activity() {
  const [activeTab, setActiveTab] = useState("overview");

  const [activityData, setActivityData] = useState({
    counts: {
      likes: 0,
      comments: 0,
      saved: 0,
      posts: 0,
      reels: 0,
      following: 0,
    },
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivity = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/activity?page=1&limit=20"
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to load activity."
        );
      }

      const data = response?.data || {};

      setActivityData({
        counts: {
          likes:
            Number(data?.counts?.likes) || 0,

          comments:
            Number(data?.counts?.comments) || 0,

          saved:
            Number(data?.counts?.saved) || 0,

          posts:
            Number(data?.counts?.posts) || 0,

          reels:
            Number(data?.counts?.reels) || 0,

          following:
            Number(data?.counts?.following) || 0,
        },

        recentActivity:
          Array.isArray(
            data?.recentActivity
          )
            ? data.recentActivity
            : [],
      });
    } catch (error) {
      console.error(
        "Load activity error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load your activity."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const activityItems = useMemo(
    () => [
      {
        icon: "❤️",
        title: "Likes",
        description:
          "Posts and reels you've liked",
        count: activityData.counts.likes,
      },
      {
        icon: "💬",
        title: "Comments",
        description:
          "Comments you've made",
        count: activityData.counts.comments,
      },
      {
        icon: "🔖",
        title: "Saved",
        description:
          "Posts you've saved",
        count: activityData.counts.saved,
      },
      {
        icon: "📤",
        title: "Posts",
        description:
          "Photos and videos you've shared",
        count: activityData.counts.posts,
      },
      {
        icon: "🎬",
        title: "Reels",
        description:
          "Reels you've created",
        count: activityData.counts.reels,
      },
      {
        icon: "👥",
        title: "Following",
        description:
          "Accounts you're following",
        count: activityData.counts.following,
      },
    ],
    [activityData.counts]
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️";

      case "comment":
        return "💬";

      case "save":
      case "saved":
        return "🔖";

      case "follow":
        return "👤";

      case "post":
        return "📸";

      case "reel":
        return "🎬";

      default:
        return "•";
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity?.type) {
      case "like":
        return `You liked a ${
          activity?.targetType === "Reel"
            ? "reel"
            : "post"
        }`;

      case "comment":
        return `You commented on a ${
          activity?.targetType === "Reel"
            ? "reel"
            : "post"
        }`;

      case "save":
      case "saved":
        return "You saved a post";

      case "follow":
        return "You followed someone";

      case "post":
        return "You published a post";

      case "reel":
        return "You published a reel";

      default:
        return "You performed an activity";
    }
  };

  const getActivityDescription = (
    activity
  ) => {
    switch (activity?.type) {
      case "like":
        return `Liked a ${
          activity?.targetType === "Reel"
            ? "reel"
            : "post"
        }`;

      case "comment":
        return activity?.comment
          ? activity.comment
          : `You left a comment on a ${
              activity?.targetType === "Reel"
                ? "reel"
                : "post"
            }`;

      case "save":
      case "saved":
        return "Post saved to your collection";

      case "follow":
        return activity?.targetUser?.username
          ? `Started following @${activity.targetUser.username}`
          : "Started following a new account";

      case "post":
        return "You shared a new post";

      case "reel":
        return "You shared a new reel";

      default:
        return "Activity on OMNIX";
    }
  };

  const formatActivityTime = (date) => {
    if (!date) {
      return "";
    }

    const activityDate = new Date(date);

    if (
      Number.isNaN(
        activityDate.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const diff =
      now.getTime() -
      activityDate.getTime();

    const seconds = Math.floor(
      diff / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }

    return activityDate.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year:
          activityDate.getFullYear() !==
          now.getFullYear()
            ? "numeric"
            : undefined,
      }
    );
  };

  const recentActivity =
    activityData.recentActivity.map(
      (activity, index) => ({
        ...activity,

        icon:
          activity?.icon ||
          getActivityIcon(
            activity?.type
          ),

        title:
          activity?.title ||
          getActivityTitle(activity),

        description:
          activity?.description ||
          getActivityDescription(
            activity
          ),

        time:
          activity?.time ||
          formatActivityTime(
            activity?.createdAt
          ),

        key:
          activity?._id ||
          activity?.id ||
          `${activity?.type}-${index}`,
      })
    );

  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-5 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              window.history.back()
            }
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-950">
              Your activity
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              See and manage your activity on OMNIX.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
        <button
          onClick={() =>
            setActiveTab("overview")
          }
          className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "overview"
              ? "bg-gray-950 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() =>
            setActiveTab("recent")
          }
          className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "recent"
              ? "bg-gray-950 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Recent activity
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950" />

          <p className="mt-3 text-sm text-gray-500">
            Loading your activity...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-white p-5">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            onClick={loadActivity}
            className="mt-3 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        activeTab === "overview" && (
          <>
            {/* Activity Summary */}
            <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-950">
                  Activity overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your interactions and content in one place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activityItems.map(
                  (item) => (
                    <button
                      key={item.title}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-gray-300 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">
                          {item.icon}
                        </span>

                        <span className="text-sm font-bold text-gray-950">
                          {item.count}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-gray-950">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {item.description}
                      </p>
                    </button>
                  )
                )}
              </div>
            </section>

            {/* Time Spent */}
            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-950">
                    Time spent
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your active time on OMNIX.
                  </p>
                </div>

                <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  This week
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black text-gray-950">
                    --
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    average per day
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-950">
                    --
                  </p>

                  <p className="text-xs text-gray-500">
                    this week
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-950"
                  style={{
                    width: "0%",
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-gray-400">
                <span>Low</span>
                <span>Average</span>
                <span>High</span>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  Time tracking is connected
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your OMNIX sessions are being
                  recorded. Weekly statistics will
                  appear here once session totals
                  are available.
                </p>
              </div>
            </section>

            {/* Manage Content */}
            <section className="mt-4 rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-950">
                  Manage your content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review and manage things you've shared or interacted with.
                </p>
              </div>

              <button className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                    ❤️
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      Likes
                    </p>

                    <p className="text-xs text-gray-500">
                      Review posts you've liked
                    </p>
                  </div>
                </div>

                <span className="text-gray-400">
                  ›
                </span>
              </button>

              <button className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                    💬
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      Comments
                    </p>

                    <p className="text-xs text-gray-500">
                      Review comments you've made
                    </p>
                  </div>
                </div>

                <span className="text-gray-400">
                  ›
                </span>
              </button>

              <button className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                    🔖
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      Saved
                    </p>

                    <p className="text-xs text-gray-500">
                      Manage your saved posts
                    </p>
                  </div>
                </div>

                <span className="text-gray-400">
                  ›
                </span>
              </button>

              <button className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                    📸
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      Your posts
                    </p>

                    <p className="text-xs text-gray-500">
                      Manage photos and videos you've shared
                    </p>
                  </div>
                </div>

                <span className="text-gray-400">
                  ›
                </span>
              </button>
            </section>
          </>
        )}

      {!loading &&
        !error &&
        activeTab === "recent" && (
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-950">
                Recent activity
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest actions on OMNIX.
              </p>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl">
                  🕘
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-950">
                  No recent activity
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your recent actions will appear here.
                </p>
              </div>
            ) : (
              <div>
                {recentActivity.map(
                  (activity, index) => (
                    <div
                      key={activity.key}
                      className={`flex items-center gap-4 px-5 py-4 ${
                        index !==
                        recentActivity.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
                        {activity.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-950">
                          {activity.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {activity.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-gray-400">
                        {activity.time}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        )}

      {/* Privacy / Data */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-11V7a4 4 0 00-8 0v1"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-950">
              Your activity is private
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Only you can see your activity history and manage
              the content connected to your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Activity;