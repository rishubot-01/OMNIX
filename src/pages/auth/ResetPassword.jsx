import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

function ResetPassword() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const {
    resetPassword,
  } = useAuth();

  const token =
    searchParams.get("token") ||
    "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      if (!token) {
        setError(
          "Invalid or missing reset token."
        );

        return;
      }

      setLoading(true);

      try {
        await resetPassword(
          token,
          password
        );

        setSuccess(true);

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1500);
      } catch (err) {
        setError(
          err?.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(false);
      }
    };

  if (success) {
    return (
      <div className="py-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          ✓
        </div>

        <h2 className="mt-4 text-xl font-bold">
          Password reset successful
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">
        Reset password
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Create a new password for your OMNIX account.
      </p>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          required
          minLength={6}
          placeholder="New password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }
          required
          minLength={6}
          placeholder="Confirm new password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gray-950 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Resetting..."
            : "Reset password"}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-6 block text-center text-sm font-semibold"
      >
        ← Back to login
      </Link>
    </div>
  );
}

export default ResetPassword;