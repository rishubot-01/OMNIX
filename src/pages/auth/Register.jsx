import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import authService from "../../services/auth.service";
import { VALIDATION } from "../../utils/constants";
import { validateRegister } from "../../utils/validators";

function Register() {
  const navigate =
    useNavigate();

  const [fullName, setFullName] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setFieldErrors({});

      const validation = validateRegister({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      if (!validation.isValid) {
        setFieldErrors(validation.errors);

        return;
      }

      setLoading(true);

      try {
        await authService.register({
          fullName: fullName.trim(),
          username,
          email,
          password,
        });

        navigate("/login", {
          replace: true,
          state: { registeredEmail: email.trim() },
        });
      } catch (err) {
        setError(
          err?.message ||
            "Unable to create account."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold">
        Create account
      </h2>

      <p className="mt-1 text-center text-sm text-gray-500">
        Join the OMNIX community.
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
          value={fullName}
          onChange={(event) =>
            setFullName(
              event.target.value
            )
          }
          required
          placeholder="Full name"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />
        {fieldErrors.fullName && (
          <p className="-mt-2 text-sm text-red-600">
            {fieldErrors.fullName}
          </p>
        )}

        <input
          value={username}
          onChange={(event) =>
            setUsername(
              event.target.value
            )
          }
          required
          placeholder="Username"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />
        {fieldErrors.username && (
          <p className="-mt-2 text-sm text-red-600">
            {fieldErrors.username}
          </p>
        )}

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          required
          placeholder="Email"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />
        {fieldErrors.email && (
          <p className="-mt-2 text-sm text-red-600">
            {fieldErrors.email}
          </p>
        )}

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          required
          minLength={VALIDATION.MIN_PASSWORD_LENGTH}
          placeholder="Password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />
        {fieldErrors.password && (
          <p className="-mt-2 text-sm text-red-600">
            {fieldErrors.password}
          </p>
        )}

        <input
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }
          required
          placeholder="Confirm password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />
        {fieldErrors.confirmPassword && (
          <p className="-mt-2 text-sm text-red-600">
            {fieldErrors.confirmPassword}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gray-950 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-gray-950"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default Register;
