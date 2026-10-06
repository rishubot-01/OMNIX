import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

function AdminRoute() {
  const {
    user,
    isAuthenticated,
    loading,
  } = useAuth();

  const location =
    useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-950" />

          <p className="mt-3 text-sm text-gray-500">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // Login nahi hai
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // Admin check
  const isAdmin =
    user?.role === "admin" ||
    user?.isAdmin === true;

  // Admin nahi hai
  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminRoute;