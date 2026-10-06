
import { useMemo, useState } from "react";

const initialUsers = [
  {
    id: 1,
    name: "Rishu Kumar",
    username: "@rishu",
    email: "rishu@example.com",
    status: "Active",
    role: "User",
    joined: "24 Aug 2026",
    avatar: null,
  },
  {
    id: 2,
    name: "Aman Singh",
    username: "@aman",
    email: "aman@example.com",
    status: "Active",
    role: "User",
    joined: "23 Aug 2026",
    avatar: null,
  },
  {
    id: 3,
    name: "Rahul Kumar",
    username: "@rahul",
    email: "rahul@example.com",
    status: "Suspended",
    role: "User",
    joined: "22 Aug 2026",
    avatar: null,
  },
  {
    id: 4,
    name: "Admin User",
    username: "@admin",
    email: "admin@omnix.com",
    status: "Active",
    role: "Admin",
    joined: "20 Aug 2026",
    avatar: null,
  },
];

function UserTable() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        user.name.toLowerCase().includes(searchValue) ||
        user.username.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const toggleUserStatus = (userId) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              status:
                user.status === "Active" ? "Suspended" : "Active",
            }
          : user
      )
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">
            Users
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage OMNIX users and account status.
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
              placeholder="Search users..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:bg-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Role
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Joined
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
              >
                {/* User */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {user.username}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-4 text-sm text-gray-600">
                  {user.email}
                </td>

                {/* Role */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      user.role === "Admin"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      user.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        user.status === "Active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    {user.status}
                  </span>
                </td>

                {/* Joined */}
                <td className="px-5 py-4 text-sm text-gray-500">
                  {user.joined}
                </td>

                {/* Action */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        user.status === "Active"
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {user.status === "Active"
                        ? "Suspend"
                        : "Activate"}
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
        {filteredUsers.map((user) => (
          <div key={user.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {user.username}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                  user.status === "Active"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-700">
                  {user.role}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Joined</p>
                <p className="text-sm font-medium text-gray-700">
                  {user.joined}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleUserStatus(user.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  user.status === "Active"
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {user.status === "Active" ? "Suspend" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-semibold text-gray-700">
            No users found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filter.
          </p>
        </div>
      )}

      {/* Simple User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  User Details
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  OMNIX account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Name
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedUser.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Username
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {selectedUser.username}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {selectedUser.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {selectedUser.role}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {selectedUser.status}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default UserTable;
