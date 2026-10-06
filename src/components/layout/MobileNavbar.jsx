import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useState } from "react";

import useAuth from "../../hooks/useAuth";
import { useApp } from "../../context/AppContext";

import Avatar from "../common/Avatar";

function MobileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, user } = useAuth();

  const {
    appearance,
    changeAppearance,
  } = useApp();

  const [omeeOpen, setOmeeOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  // ================= PROFILE PAGE CHECK =================
  const isProfilePage = location.pathname === "/profile";

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

  // ================= LOGOUT =================
  const handleLogout = async () => {
    setMoreOpen(false);

    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  // ================= BOTTOM NAV ITEMS =================
  const items = [
    {
      label: "Home",
      path: "/",
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill={isActive ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isActive ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />
        </svg>
      ),
    },

    {
      label: "Reels",
      path: "/reels",
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2.5"
          />

          <path
            d="m10 9 5 3-5 3V9Z"
            fill={isActive ? "currentColor" : "none"}
          />
        </svg>
      ),
    },

    {
      label: "Explore",
      path: "/explore",
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          />

          <path d="m20 20-3.5-3.5" />

          {isActive && (
            <circle
              cx="11"
              cy="11"
              r="3"
              fill="currentColor"
              stroke="none"
            />
          )}
        </svg>
      ),
    },

    {
      label: "Messages",
      path: "/messages",
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M21.5 3.5 13.7 20l-3.8-7-7-3.8L21.5 3.5Z"
            fill={isActive ? "currentColor" : "none"}
          />

          <path
            d="m9.9 13 4-3.7"
            stroke={isActive ? "white" : "currentColor"}
            strokeWidth={isActive ? "1.4" : "1.8"}
          />
        </svg>
      ),
    },

    {
      label: "Profile",
      path: "/profile",
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill={isActive ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isActive ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
          />

          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      ),
    },
  ];

  // ================= HAMBURGER ICON =================
  const menuIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M4 6h16M4 12h16M4 18h16"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  // ================= NOTIFICATION ICON =================
  const notificationIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // =====================================================
  // INSTAGRAM STYLE GEAR ICON
  // Center circle removed
  // =====================================================
  const settingsIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15Z"
      />
    </svg>
  );

  return (
    <>
      {/* =====================================================
          TOP BAR
      ====================================================== */}
      <div className="w-full bg-white lg:hidden">
        <div className="relative mx-auto h-14 w-full max-w-lg">

          {/* =================================================
              LEFT - OMEE / HAMBURGER
          ================================================== */}
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2">

            <button
              type="button"
              onClick={() => {
                setOmeeOpen((prev) => !prev);
                setMoreOpen(false);
              }}
              title="Omee"
              aria-label="Omee menu"
              aria-expanded={omeeOpen}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                omeeOpen
                  ? "bg-gray-100 text-gray-950"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="h-8 w-8">
                {menuIcon}
              </span>
            </button>
          </div>

          {/* =================================================
              OMEE MENU
              
              IMPORTANT:
              fixed + high z-index
              so card always appears ABOVE profile/content
          ================================================== */}
          {omeeOpen && (
            <>
              {/* Dark/transparent click-away layer */}
              <button
                type="button"
                aria-label="Close Omee menu"
                className="fixed inset-0 z-[90] cursor-default"
                onClick={() => setOmeeOpen(false)}
              />

              {/* =================================================
                  OMEE CARD
                  
                  Fixed position means:
                  - It does not get hidden behind feed/profile
                  - It stays above content
                  - It starts directly below navbar
                  - It will cover the profile content if necessary
              ================================================== */}
              <div
                className="
                  fixed
                  left-2
                  top-[60px]
                  z-[100]
                  w-72
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-2
                  shadow-2xl
                "
              >
                {[
                  ["Random Connect", "/omee/random"],
                  ["My Connections", "/omee/connections"],
                  ["Go Live", "/omee/live"],
                  ["Create", "/create"],
                ].map(([label, path]) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => {
                      setOmeeOpen(false);
                      navigate(path);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      rounded-xl
                      px-4
                      py-3.5
                      text-left
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:bg-gray-50
                      hover:text-gray-950
                    "
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* =================================================
              CENTER - OMNIX
          ================================================== */}
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="OMNIX home"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center text-gray-950"
          >
            <span
              className="ml-0.1 inline-block text-3xl font-normal leading-none"
              style={{
                fontFamily: "serif",
              }}
            >
              <b>𝕆𝕄ℕ𝕀</b>
            </span>

            <span
              className="ml-0.1 inline-block text-3xl font-normal leading-none"
              style={{
                fontFamily: "serif",
              }}
            >
              𝕏
            </span>
          </button>

          {/* =================================================
              RIGHT - NOTIFICATION / MORE GEAR
          ================================================== */}
          <button
            type="button"
            onClick={() => {
              if (isProfilePage) {
                setMoreOpen((prev) => !prev);
                setOmeeOpen(false);
              } else {
                navigate("/notifications");
              }
            }}
            title={isProfilePage ? "More" : "Notifications"}
            aria-label={isProfilePage ? "More" : "Notifications"}
            aria-expanded={
              isProfilePage ? moreOpen : undefined
            }
            className={`absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-gray-700 transition ${
              isProfilePage && moreOpen
                ? "bg-gray-100 text-gray-950"
                : "hover:bg-gray-50 hover:text-gray-950"
            }`}
          >
            <span
              className={
                isProfilePage
                  ? "h-10 w-10"
                  : "h-8 w-8"
              }
            >
              {isProfilePage
                ? settingsIcon
                : notificationIcon}
            </span>
          </button>

          {/* =================================================
              MOBILE MORE MENU
          ================================================== */}
          {isProfilePage && moreOpen && (
            <>
              <button
                type="button"
                aria-label="Close More menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => {
                  setMoreOpen(false);
                  setAppearanceOpen(false);
                }}
              />

              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">

                {/* Your Activity */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate("/activity");
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <span>Your activity</span>
                </button>

                {/* Switch Appearance */}
                <button
                  type="button"
                  onClick={() => {
                    setAppearanceOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <span>Switch appearance</span>

                  <span className="text-xs text-gray-400">
                    {appearance === "light"
                      ? "Light"
                      : appearance === "dark"
                      ? "Dark"
                      : "System"}
                  </span>
                </button>

                {/* Report a Problem */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate("/report");
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <span>Report a problem</span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <span>Settings</span>
                </button>

                {/* Divider */}
                <div className="my-1 border-t border-gray-100" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <span>Logout</span>
                </button>

              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          SWITCH APPEARANCE MODAL
      ====================================================== */}
      {isProfilePage && appearanceOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            setAppearanceOpen(false);
            setMoreOpen(false);
          }}
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
                onClick={() => {
                  setAppearanceOpen(false);
                  setMoreOpen(true);
                }}
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

      {/* =====================================================
          BOTTOM NAVBAR
      ====================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">

        <div className="mx-auto grid h-16 w-full max-w-lg grid-cols-5 items-center">

          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              title={item.label}
              aria-label={item.label}
              className="flex w-full flex-col items-center justify-center gap-1 text-[10px] font-semibold transition"
            >
              {({ isActive }) => (
                <>
                  {/* ================================
                      PROFILE
                  ================================= */}
                  {item.path === "/profile" ? (
                    <Avatar
                      src={profileAvatar}
                      name={profileName}
                      alt={profileName}
                      size="xs"
                      className={`rounded-full transition-all ${
                        isActive
                          ? "scale-105 ring-2 ring-gray-950 ring-offset-1"
                          : ""
                      }`}
                    />
                  ) : (
                    /* ================================
                       ACTIVE / INACTIVE ICON
                       ================================ */
                    <span
                      className={`h-5 w-5 transition-transform ${
                        isActive
                          ? "scale-110 text-gray-950"
                          : ""
                      }`}
                    >
                      {item.icon(isActive)}
                    </span>
                  )}

                  {/* ================================
                      LABEL
                  ================================= */}
                  <span>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

        </div>
      </nav>
    </>
  );
}

export default MobileNavbar;