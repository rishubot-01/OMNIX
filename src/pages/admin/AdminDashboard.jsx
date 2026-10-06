import {
  useEffect,
  useState,
} from "react";

import adminService from "../../services/admin.service";

function AdminDashboard() {
  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadStats =
      async () => {
        try {
          const response =
            await adminService.getDashboard();

          const data =
            response?.data ||
            response;

          setStats(
            data?.stats ||
              data?.data ||
              data
          );
        } catch (error) {
          console.error(
            "Dashboard error:",
            error
          );
        } finally {
          setLoading(false);
        }
      };

    loadStats();
  }, []);

  const cards = [
    {
      title: "Users",
      value:
        stats?.users ??
        stats?.totalUsers ??
        0,
    },
    {
      title: "Posts",
      value:
        stats?.posts ??
        stats?.totalPosts ??
        0,
    },
    {
      title: "Reports",
      value:
        stats?.reports ??
        stats?.totalReports ??
        0,
    },
    {
      title: "Active Users",
      value:
        stats?.activeUsers ?? 0,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor OMNIX.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <p className="text-sm text-gray-500">
              {card.title}
            </p>

            <p className="mt-2 text-3xl font-black">
              {loading
                ? "..."
                : card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;