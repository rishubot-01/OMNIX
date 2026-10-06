
import { useState } from "react";

function AdminHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 overflow-hidden rounded-xl">
          <img
            src="/omnix-community-mark.svg"
            alt="OMNIX community logo"
            className="h-full w-full"
          />
        </div>

        <div>
          <h1 className="text-lg font-bold leading-tight text-gray-900">
            MNIX
          </h1>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="Notifications"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              strokeLinecap="round"
            />
          </svg>

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Admin Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-900">
                Admin
              </p>
              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

            <svg
              className="hidden h-4 w-4 text-gray-500 sm:block"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Profile
              </button>

              <button
                type="button"
                className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Settings
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
