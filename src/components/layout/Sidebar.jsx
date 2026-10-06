import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { useApp } from "../../context/AppContext";

import Avatar from "../common/Avatar";

function SidebarTooltip({ label }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-md bg-gray-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );
}

function Sidebar() {
  const navigate = useNavigate();

  const { logout, user } = useAuth();

  const {
    sidebarOpen,
    openSidebar,
    closeSidebar,
    appearance,
    changeAppearance,
  } = useApp();

  const [moreOpen, setMoreOpen] = useState(false);
  const [omeeOpen, setOmeeOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const profileName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Your Profile";

  const profileAvatar =
    user?.avatar ||
    user?.profileImage ||
    user?.profilePicture ||
    "";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // All sidebar icons use the same size.
  const iconClass =
    "h-[28px] w-[28px] shrink-0 transition-colors";

  const menuItems = [
    {
      label: "Home",
      path: "/",
      icon: (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    {
      label: "Reels",
      path: "/reels",
      icon: (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2.5"
            strokeWidth="2.2"
          />

          <path
            d="m10 9 5 3-5 3V9Z"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    {
      label: "Explore",
      path: "/explore",
      icon: (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            strokeWidth="2.2"
          />

          <path
            d="m20 20-3.5-3.5"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    // =====================================================
    // Messages
    // Search / Explore ke turant niche
    // =====================================================
    {
      label: "Messages",
      path: "/messages",
      icon: (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M21.5 3.5 13.7 20l-3.8-7-7-3.8L21.5 3.5Z"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="m9.9 13 4-3.7"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    {
      label: "Create",
      path: "/create",
      icon: (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            strokeWidth="2.2"
          />

          <path
            d="M12 8v8M8 12h8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    {
      label: "Notifications",
      path: "/notifications",
      icon: (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <aside
        className="hidden h-screen w-full shrink-0 bg-white lg:flex lg:flex-col"
        onMouseEnter={openSidebar}
        onMouseLeave={closeSidebar}
      >
        {/* =====================================================
            Logo
        ====================================================== */}
        <div className="flex h-[85px] items-center px-7 pt-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            title="OMNIX"
            aria-label="OMNIX home"
            className={`group relative flex items-center text-xl font-black tracking-tight text-gray-950 ${
              sidebarOpen ? "gap-2.5" : "justify-center"
            }`}
            style={{ transform: "translateX(-10px)" }}
          >
            <span className="flex h-12 w-10 shrink-0 items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/omnix-community-mark.svg"
                alt="OMNIX community logo"
                className="h-8 w-8 brightness-0"
              />
            </span>

            {sidebarOpen && <span>OMNIX</span>}

            {!sidebarOpen && (
              <SidebarTooltip label="OMNIX" />
            )}
          </button>
        </div>

        {/* =====================================================
            Navigation
        ====================================================== */}
        <nav className="flex flex-1 flex-col px-4">

          {/* ===================================================
              Main Menu

              Order:
              Home
              Reels
              Explore
              Messages
              Create
              Notifications
          ==================================================== */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                aria-label={item.label}
                className={({ isActive }) =>
                  `
                    sidebar-nav-link group relative flex h-12 items-center
                    gap-4 rounded-xl px-3 text-sm font-semibold transition
                    ${
                      isActive
                        ? "bg-gray-100 text-gray-950"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    }
                  `
                }
              >
                {item.icon}

                {sidebarOpen && (
                  <span>{item.label}</span>
                )}

                {!sidebarOpen && (
                  <SidebarTooltip label={item.label} />
                )}
              </NavLink>
            ))}
          </div>

          {/* =====================================================
              Omeet
          ====================================================== */}
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => {
                setOmeeOpen((prev) => !prev);
                setMoreOpen(false);
              }}
              title="Omeet"
              aria-label="Omeet"
              className="
                sidebar-nav-link group relative flex h-12 w-full
                items-center gap-4 rounded-xl px-3 text-sm
                font-semibold text-gray-950 transition
                hover:bg-gray-50 hover:text-gray-950
              "
            >
              {/* =================================================
                  GLOBAL / OMEET ICON
                  Black Globe - same 28x28 size as other icons
              ================================================== */}
              <svg
                className={iconClass}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  strokeWidth="2.2"
                />

                <path
                  d="M3 12h18"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                <path
                  d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                <path
                  d="M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              {sidebarOpen && (
                <span>Omeet</span>
              )}

              {!sidebarOpen && (
                <SidebarTooltip label="Omeet" />
              )}
            </button>

            {/* ===================================================
                Omeet Menu
            ==================================================== */}
            {omeeOpen && (
              <div
                className={`
                  absolute z-50 rounded-2xl border border-gray-100
                  bg-white p-2 shadow-xl
                  ${
                    sidebarOpen
                      ? "left-0 top-12 w-64"
                      : "left-full top-0 ml-3 w-64"
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOmeeOpen(false);
                    navigate("/omee/random");
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <span>Random Connect</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOmeeOpen(false);
                    navigate("/omee/connections");
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <span>My Connections</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOmeeOpen(false);
                    navigate("/omee/live");
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <span>Go Live</span>
                </button>
              </div>
            )}
          </div>

          {/* =====================================================
              Profile
          ====================================================== */}
          <div className="mt-2">
            <NavLink
              to="/profile"
              title="Profile"
              aria-label="Profile"
              className={({ isActive }) =>
                `
                  group relative flex h-12 items-center gap-4 rounded-xl
                  px-3 transition
                  ${
                    isActive
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }
                `
              }
            >
              <Avatar
                src={profileAvatar}
                name={profileName}
                alt={profileName}
                size="sm"
                className="-ml-0.5"
              />

              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {profileName}
                  </p>

                  <p className="truncate text-xs text-gray-400">
                    @{(user?.username || "username").replace(
                      "@",
                      ""
                    )}
                  </p>
                </div>
              )}

              {!sidebarOpen && (
                <SidebarTooltip label="Profile" />
              )}
            </NavLink>
          </div>

          {/* =====================================================
              More
          ====================================================== */}
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() =>
                setMoreOpen((prev) => !prev)
              }
              title="More"
              aria-label="More"
              className={`
                group relative flex h-12 w-full items-center
                gap-4 rounded-xl px-3 text-sm font-semibold transition
                ${
                  moreOpen
                    ? "bg-gray-100 text-gray-950"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                }
              `}
            >
              {/* More Icon */}
              <svg
                className={iconClass}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              {sidebarOpen && <span>More</span>}

              {!sidebarOpen && (
                <SidebarTooltip label="More" />
              )}
            </button>

            {/* ===================================================
                More Menu
            ==================================================== */}
            {moreOpen && (
              <div
                className={`
                  absolute z-50 rounded-2xl border border-gray-100
                  bg-white p-2 shadow-xl
                  ${
                    sidebarOpen
                      ? "bottom-12 left-0 w-64"
                      : "bottom-0 left-full ml-3 w-64"
                  }
                `}
              >
                {/* =================================================
                    Your Activity
                ================================================== */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate("/activity");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  {/* Activity Icon */}
                  <svg
                    className="h-6 w-6 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 19V5M4 19h16"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="m7 15 3-4 3 2 5-6"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>Your activity</span>
                </button>

                {/* =================================================
                    Saved
                ================================================== */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate("/saved");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  {/* Bookmark Icon */}
                  <svg
                    className="h-6 w-6 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>Saved</span>
                </button>

                {/* =================================================
                    Switch Appearance
                ================================================== */}
                <button
                  type="button"
                  onClick={() => {
                    setAppearanceOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <div className="flex items-center gap-3">
                    {/* Appearance Icon */}
                    <svg
                      className="h-6 w-6 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="4"
                        strokeWidth="2.2"
                      />

                      <path
                        d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>

                    <span>Switch appearance</span>
                  </div>

                  <span className="ml-3 text-xs text-gray-400">
                    {appearance === "light"
                      ? "Light"
                      : appearance === "dark"
                      ? "Dark"
                      : "System"}
                  </span>
                </button>

                {/* =================================================
                    Report a Problem
                ================================================== */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate("/report");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  {/* Warning Icon */}
                  <svg
                    className="h-6 w-6 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3 2.8 19a1.5 1.5 0 0 0 1.3 2.25h15.8A1.5 1.5 0 0 0 21.2 19L12 3Z"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M12 9v4"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    <circle
                      cx="12"
                      cy="17"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>

                  <span>Report a problem</span>
                </button>

                {/* =================================================
                    Settings
                ================================================== */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  {/* Gear Icon */}
                  <svg
                    className="h-7 w-7 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
                      strokeWidth="2.2"
                    />

                    <path
                      d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.55v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.56-1.03H6.4v-2.55h.14A1.7 1.7 0 0 0 8.1 10a1.7 1.7 0 0 0-.34-1.88L7.7 8.06l1.8-1.8.06.06A1.7 1.7 0 0 0 11.44 6a1.7 1.7 0 0 0 1.03-1.56V4.3h2.55v.14A1.7 1.7 0 0 0 16.05 6a1.7 1.7 0 0 0 1.88.34l.06-.06 1.8 1.8-.06.06A1.7 1.7 0 0 0 19.4 10c.2.62.77 1.03 1.42 1.03h.14v2.55h-.14A1.7 1.7 0 0 0 19.4 15Z"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>Settings</span>
                </button>

                <div className="my-1 border-t border-gray-100" />

                {/* =================================================
                    Logout
                ================================================== */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  {/* Logout Icon */}
                  <svg
                    className="h-6 w-6 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M14 8l4 4-4 4M18 12H9"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* =========================================================
          Switch Appearance Modal
      ========================================================== */}
      {appearanceOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setAppearanceOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Switch appearance
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Choose how OMNIX looks for you.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAppearanceOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Options */}
            <div className="p-3">

              {/* Light */}
              <button
                type="button"
                onClick={() => {
                  changeAppearance("light");
                  setAppearanceOpen(false);
                  setMoreOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-4 transition ${
                  appearance === "light"
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl">
                    ☀️
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-950">
                      Light
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Use the light appearance
                    </p>
                  </div>
                </div>

                {appearance === "light" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                    ✓
                  </div>
                )}
              </button>

              {/* Dark */}
              <button
                type="button"
                onClick={() => {
                  changeAppearance("dark");
                  setAppearanceOpen(false);
                  setMoreOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-4 transition ${
                  appearance === "dark"
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xl">
                    🌙
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-950">
                      Dark
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Use the dark appearance
                    </p>
                  </div>
                </div>

                {appearance === "dark" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                    ✓
                  </div>
                )}
              </button>

              {/* System */}
              <button
                type="button"
                onClick={() => {
                  changeAppearance("system");
                  setAppearanceOpen(false);
                  setMoreOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-4 transition ${
                  appearance === "system"
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl">
                    🌓
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-950">
                      System
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Follow your device settings
                    </p>
                  </div>
                </div>

                {appearance === "system" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-950 text-xs font-bold text-white">
                    ✓
                  </div>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-3">
              <p className="text-center text-xs text-gray-400">
                Your preference is saved automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;