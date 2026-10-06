
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AdminRoute from "./AdminRoute";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Main Pages
import Home from "../pages/Home";
import Explore from "../pages/Explore";
import CreatePost from "../pages/CreatePost";
import Notifications from "../pages/Notifications";
import Profile from "../pages/Profile";
import UserProfile from "../pages/UserProfile";
import Saved from "../pages/Saved";
import Settings from "../pages/Settings";
import Report from "../pages/Report";
import Messages from "../pages/Messages";
import Activity from "../pages/Activity";

// Reels
import Reels from "../pages/Reels";

// OMEE Pages
import RandomConnect from "../pages/omee/RandomConnect";
import MyConnections from "../pages/omee/MyConnections";
import GoLive from "../pages/omee/GoLive";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminPosts from "../pages/admin/AdminPosts";
import AdminReports from "../pages/admin/AdminReports";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================================
            PUBLIC / AUTH ROUTES
        ========================================================== */}

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />

          </Route>
        </Route>


        {/* =========================================================
            PROTECTED USER ROUTES
        ========================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Home */}
            <Route
              path="/"
              element={<Home />}
            />

            {/* Explore */}
            <Route
              path="/explore"
              element={<Explore />}
            />

            {/* Create Post */}
            <Route
              path="/create"
              element={<CreatePost />}
            />

            {/* Reels */}
            <Route
              path="/reels"
              element={<Reels />}
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* Messages */}
            <Route
              path="/messages"
              element={<Messages />}
            />

            {/* Own Profile */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Other User Profile */}
            <Route
              path="/user/:username"
              element={<UserProfile />}
            />

            {/* Saved */}
            <Route
              path="/saved"
              element={<Saved />}
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* Report */}
            <Route
              path="/report"
              element={<Report />}
            />

            {/* Activity */}
            <Route
              path="/activity"
              element={<Activity />}
            />


            {/* =====================================================
                OMEE
            ====================================================== */}

            {/* Random Connect */}
            <Route
              path="/omee/random"
              element={<RandomConnect />}
            />

            {/* My Connections */}
            <Route
              path="/omee/connections"
              element={<MyConnections />}
            />

            {/* Go Live */}
            <Route
              path="/omee/live"
              element={<GoLive />}
            />

          </Route>
        </Route>


        {/* =========================================================
            ADMIN ROUTES
        ========================================================== */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin/posts"
              element={<AdminPosts />}
            />

            <Route
              path="/admin/reports"
              element={<AdminReports />}
            />

          </Route>
        </Route>


        {/* =========================================================
            404
        ========================================================== */}

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
              <div className="text-center">

                <h1 className="text-6xl font-black">
                  404
                </h1>

                <p className="mt-3 text-gray-500">
                  Page not found
                </p>

              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;