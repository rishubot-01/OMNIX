import { useState } from "react";

import Modal from "../common/Modal";
import Button from "../common/Button";

import accountService from "../../services/account.service";
import { useAuth } from "../../context/AuthContext";

function DeactivateAccount() {
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

  const handleDeactivate = async () => {
    setLoading(true);
    setError("");

    try {
      await accountService.deactivate();

      // Account deactivate hone ke baad
      // current session logout kar denge.
      logout();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to deactivate account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleOpen}
        className="border-orange-200 text-orange-600 hover:bg-orange-50"
      >
        Deactivate account
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Deactivate account?"
        description="Your account will be temporarily deactivated."
        size="sm"
        closeOnOverlay={!loading}
      >
        <div className="p-5">
          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-sm leading-6 text-orange-800">
              Your profile and account will be unavailable while
              your account is deactivated. You can reactivate it
              later.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4">
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
              onClick={handleDeactivate}
            >
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeactivateAccount;