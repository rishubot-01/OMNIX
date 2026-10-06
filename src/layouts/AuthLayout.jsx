import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mb-1 flex flex-col items-center gap-2">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 p-1.5 shadow-sm">
                <img
                  src="/omnix-community-mark.svg"
                  alt="OMNIX community logo"
                  className="h-full w-full"
                />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950">
                OMNIX
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Open Media Network for Interaction & Experience
            </p>
          </div>

          {/* Auth Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <Outlet />
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} OMNIX.
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
