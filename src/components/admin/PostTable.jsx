
import { useMemo, useState } from "react";

const initialPosts = [
  {
    id: 1,
    author: "Rishu Kumar",
    username: "@rishu",
    caption: "Welcome to OMNIX 🚀",
    media: null,
    type: "Image",
    likes: 128,
    comments: 24,
    status: "Published",
    createdAt: "24 Aug 2026",
  },
  {
    id: 2,
    author: "Aman Singh",
    username: "@aman",
    caption: "Building something amazing with OMNIX.",
    media: null,
    type: "Image",
    likes: 84,
    comments: 12,
    status: "Published",
    createdAt: "23 Aug 2026",
  },
  {
    id: 3,
    author: "Rahul Kumar",
    username: "@rahul",
    caption: "My first post on OMNIX.",
    media: null,
    type: "Text",
    likes: 36,
    comments: 7,
    status: "Reported",
    createdAt: "22 Aug 2026",
  },
  {
    id: 4,
    author: "Neha Singh",
    username: "@neha",
    caption: "Exploring the new social experience.",
    media: null,
    type: "Video",
    likes: 211,
    comments: 31,
    status: "Published",
    createdAt: "21 Aug 2026",
  },
];

function PostTable() {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);

  const filteredPosts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return posts.filter((post) => {
      const matchesSearch =
        !searchValue ||
        post.author.toLowerCase().includes(searchValue) ||
        post.username.toLowerCase().includes(searchValue) ||
        post.caption.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const deletePost = (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId)
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">
            Posts
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage content published on OMNIX.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:bg-white"
          >
            <option value="All">All Posts</option>
            <option value="Published">Published</option>
            <option value="Reported">Reported</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Post
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Author
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Engagement
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Created
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredPosts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
              >
                {/* Post */}
                <td className="max-w-[300px] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                      {post.media ? (
                        <img
                          src={post.media}
                          alt="Post"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="h-5 w-5 text-gray-400"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {post.caption}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {post.type} post
                      </p>
                    </div>
                  </div>
                </td>

                {/* Author */}
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {post.author}
                  </p>

                  <p className="text-xs text-gray-500">
                    {post.username}
                  </p>
                </td>

                {/* Engagement */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"
                          strokeWidth="1.7"
                        />
                      </svg>
                      {post.likes}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-4.2A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"
                          strokeWidth="1.7"
                        />
                      </svg>
                      {post.comments}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      post.status === "Published"
                        ? "bg-green-50 text-green-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        post.status === "Published"
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    />

                    {post.status}
                  </span>
                </td>

                {/* Created */}
                <td className="px-5 py-4 text-sm text-gray-500">
                  {post.createdAt}
                </td>

                {/* Action */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-gray-100 md:hidden">
        {filteredPosts.map((post) => (
          <div key={post.id} className="p-4">
            <div className="flex gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                {post.media ? (
                  <img
                    src={post.media}
                    alt="Post"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-400"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {post.caption}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {post.author} · {post.username}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                      post.status === "Published"
                        ? "bg-green-50 text-green-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-semibold text-gray-700">
            No posts found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filter.
          </p>
        </div>
      )}

      {/* Post Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  Post Preview
                </h3>

                <p className="text-xs text-gray-500">
                  Content moderation view
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            {/* Preview */}
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                  {selectedPost.author.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPost.author}
                  </p>

                  <p className="text-xs text-gray-500">
                    {selectedPost.username}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-700">
                {selectedPost.caption}
              </p>

              {selectedPost.media ? (
                <img
                  src={selectedPost.media}
                  alt="Post preview"
                  className="mt-5 max-h-[420px] w-full rounded-xl object-cover"
                />
              ) : (
                <div className="mt-5 flex h-48 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
                  No media preview available
                </div>
              )}

              <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
                <span>{selectedPost.likes} likes</span>
                <span>{selectedPost.comments} comments</span>
                <span>{selectedPost.createdAt}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-gray-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  deletePost(selectedPost.id);
                  setSelectedPost(null);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PostTable;
