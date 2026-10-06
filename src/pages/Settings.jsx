import {
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import Button from "../components/common/Button";

import DeactivateAccount from "../components/account/DeactivateAccount";
import DeleteAccount from "../components/account/DeleteAccount";

function Settings() {
  const {
    user,
    updateUser,
    logout,
  } = useAuth();

  const [name, setName] =
    useState(user?.name || "");

  const [bio, setBio] =
    useState(user?.bio || "");

  const [saving, setSaving] =
    useState(false);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setSaving(true);

      try {
        updateUser({
          name,
          bio,
        });
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your OMNIX account.
        </p>
      </div>

      {/* Profile */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6"
      >
        <h2 className="text-lg font-bold">
          Profile
        </h2>

        <div className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(event) =>
                setBio(
                  event.target.value
                )
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save changes"}
        </button>
      </form>

      {/* Account */}
      <div className="rounded-2xl border border-red-100 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-red-600">
          Account
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your OMNIX account.
        </p>

        <div className="mt-5 space-y-5">
          {/* Logout */}
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Logout
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Sign out from this OMNIX account.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={logout}
            >
              Logout
            </Button>
          </div>

          {/* Deactivate Account */}
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Deactivate account
              </h3>

              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Temporarily deactivate your OMNIX account.
                You can reactivate it later.
              </p>
            </div>

            <DeactivateAccount />
          </div>

          {/* Delete Account */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Delete account
              </h3>

              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Permanently delete your OMNIX account.
                This action cannot be undone.
              </p>
            </div>

            <DeleteAccount />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;