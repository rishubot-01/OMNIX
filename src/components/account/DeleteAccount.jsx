import { useState } from "react";

import Modal from "../common/Modal";
import Button from "../common/Button";

import accountService from "../../services/account.service";
import { useAuth } from "../../context/AuthContext";

function DeleteAccount() {
  const { logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setError("");
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    setIsOpen(false);
    setError("");
  };

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await accountService.delete();

      /*
       * Backend ne account successfully delete kar diya.
       * Ab local authentication state bhi clear karni hai.
       */
      logout();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="danger"
        onClick={handleOpen}
      >
        Delete account
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Delete account permanently?"
        description="This action cannot be undone."
        size="sm"
        showClose={!loading}
        closeOnOverlay={!loading}
      >
        <div className="p-5">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              Are you sure you want to delete your account?
            </p>

            <p className="mt-2 text-sm leading-6 text-red-700">
              Your OMNIX account will be permanently deleted.
              You will be signed out immediately and this action
              cannot be undone.
            </p>
          </div>

          {error && (
            <div
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
              role="alert"
            >
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              loading={loading}
              onClick={handleDelete}
            >
              {loading
                ? "Deleting..."
                : "Delete permanently"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteAccount;