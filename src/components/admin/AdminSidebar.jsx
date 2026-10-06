
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Posts",
    path: "/admin/posts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M10.3 3.2 2.7 16.4A2 2 0 0 0 4.4 19h15.2a2 2 0 0 0 1.7-2.6L13.7 3.2a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
];

function AdminSidebar({ isOpen = true, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
          <div className="h-9 w-9 overflow-hidden rounded-xl">
            <img
              src="/omnix-community-mark.svg"
              alt="OMNIX community logo"
              className="h-full w-full"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-950">
              MNIX
            </h2>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Administration
            </p>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Close navigation"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                d="m6 6 12 12M18 6 6 18"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-950 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                  }`
                }
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <span className="h-5 w-5">
                    {item.icon}
                  </span>
                </span>

                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-3">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                d="M3 12 12 3l9 9"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 10v10h14V10"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M9 20v-6h6v6"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            <span>Back to OMNIX</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
