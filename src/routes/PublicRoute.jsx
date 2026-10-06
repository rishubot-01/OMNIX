import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function PublicRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-950" />

          <p className="mt-3 text-sm text-gray-500">
            Loading OMNIX...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default PublicRoute;