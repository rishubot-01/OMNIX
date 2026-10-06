import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }));
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setLoading(true);

      try {
        await login({
          email: formData.email,
          password: formData.password,
        });

        const redirectTo =
          location.state?.from ||
          "/";

        navigate(
          typeof redirectTo ===
            "string"
            ? redirectTo
            : "/",
          {
            replace: true,
          }
        );
      } catch (err) {
        setError(
          err?.message ||
            "Invalid email or password."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold">
        Welcome back
      </h2>

      <p className="mt-1 text-center text-sm text-gray-500">
        Login to your OMNIX account.
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
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-gray-700 hover:underline"
            >
              Forgot?
            </Link>
          </div>

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gray-950 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-gray-950"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default Login;
