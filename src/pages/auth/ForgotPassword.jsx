import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

function ForgotPassword() {
  const {
    forgotPassword,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setLoading(true);
      setError("");
      setMessage("");

      try {
        await forgotPassword(
          email
        );

        setMessage(
          "If an account exists with this email, password reset instructions have been sent."
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to process request."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <h2 className="text-2xl font-bold">
        Forgot password?
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Enter your email and we'll help you reset your password.
      </p>

      {message && (
        <div className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

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
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gray-950 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : "Send reset link"}
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

export default ForgotPassword;