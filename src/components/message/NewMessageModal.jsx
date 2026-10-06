
import React, {
  useEffect,
  useState,
} from "react";

import messageService from "../../services/message.service";

const NewMessageModal = ({
  onClose,
  onConversationCreated,
}) => {
  const [searchText, setSearchText] =
    useState("");

  const [users, setUsers] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Extract Users
  |--------------------------------------------------------------------------
  */

  const extractUsers = (response) => {
    const body =
      response?.data ?? response;

    if (Array.isArray(body)) {
      return body;
    }

    if (Array.isArray(body?.users)) {
      return body.users;
    }

    if (Array.isArray(body?.data)) {
      return body.data;
    }

    return [];
  };

  /*
  |--------------------------------------------------------------------------
  | Search Users
  |--------------------------------------------------------------------------
  |
  | GET /api/messages/users/search?query=rahul
  |
  */

  useEffect(() => {
    const query =
      searchText.trim();

    if (!query) {
      setUsers([]);
      setLoading(false);
      setError("");
      setSelectedUser(null);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);
          setError("");
          setSelectedUser(null);

          const response =
            await messageService.searchUsers(
              query
            );

          if (cancelled) {
            return;
          }

          const result =
            extractUsers(response);

          setUsers(
            Array.isArray(result)
              ? result
              : []
          );
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "Failed to search users:",
            err
          );

          setUsers([]);

          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to search users."
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      },
      300
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchText]);

  /*
  |--------------------------------------------------------------------------
  | Create / Get Conversation
  |--------------------------------------------------------------------------
  */

  const handleCreateConversation =
    async () => {
      if (
        !selectedUser ||
        creating
      ) {
        return;
      }

      const userId =
        selectedUser?._id ||
        selectedUser?.id;

      if (!userId) {
        setError(
          "Selected user ID was not found."
        );
        return;
      }

      try {
        setCreating(true);
        setError("");

        /*
         * Backend:
         *
         * POST /api/messages/conversations
         *
         * {
         *   userId: receiverId
         * }
         */

        const response =
          await messageService.createConversation(
            userId
          );

        const body =
          response?.data ?? response;

        const conversation =
          body?.conversation ||
          body?.data ||
          body;

        if (!conversation) {
          throw new Error(
            "Conversation was not returned by the server."
          );
        }

        /*
         * Backend already returns:
         *
         * conversation.user
         *
         * conversation.currentUserId
         */

        onConversationCreated?.(
          conversation
        );
      } catch (err) {
        console.error(
          "Failed to create conversation:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to start conversation."
        );
      } finally {
        setCreating(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Escape Key
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleEscape = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !creating
      ) {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose, creating]);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="new-message-overlay"
      onClick={() => {
        if (!creating) {
          onClose?.();
        }
      }}
    >
      <div
        className="new-message-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ======================================================
            Header
        ======================================================= */}

        <div className="new-message-header">
          <div>
            <h2>
              New Message
            </h2>

            <p>
              Search someone to start chatting
            </p>
          </div>

          <button
            type="button"
            className="new-message-close"
            onClick={onClose}
            disabled={creating}
            title="Close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ======================================================
            Search
        ======================================================= */}

        <div className="new-message-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search users..."
            value={searchText}
            onChange={(event) => {
              setSearchText(
                event.target.value
              );
            }}
            autoFocus
            disabled={creating}
          />

          {loading && (
            <span className="text-xs text-gray-400">
              Searching...
            </span>
          )}

        </div>

        {/* ======================================================
            Error
        ======================================================= */}

        {error && (
          <div className="px-4 pt-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ======================================================
            User List
        ======================================================= */}

        <div className="new-message-users">

          {/* Loading */}

          {loading ? (
            <div className="new-message-empty">

              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-950" />

              <h3>
                Searching users...
              </h3>

            </div>
          ) : !searchText.trim() ? (

            /* Empty Search */

            <div className="new-message-empty">

              <div className="new-message-empty-icon">
                🔍
              </div>

              <h3>
                Search for a user
              </h3>

              <p>
                Enter a name or username
                to start a conversation.
              </p>

            </div>
          ) : users.length === 0 ? (

            /* No Users */

            <div className="new-message-empty">

              <div className="new-message-empty-icon">
                🔍
              </div>

              <h3>
                No users found
              </h3>

              <p>
                Try searching with a
                different name or username.
              </p>

            </div>
          ) : (

            /* Users */

            users.map((user) => {

              const userId =
                user?._id ||
                user?.id;

              const name =
                user?.name ||
                user?.fullName ||
                user?.username ||
                "OMNIX User";

              const username =
                user?.username ||
                "";

              const avatar =
                user?.avatar ||
                user?.profileImage ||
                user?.profilePicture ||
                "/assets/images/default-avatar.png";

              const isOnline =
                Boolean(
                  user?.online ||
                  user?.isOnline
                );

              const isSelected =
                String(
                  selectedUser?._id ||
                    selectedUser?.id ||
                    ""
                ) ===
                String(userId);

              return (
                <button
                  type="button"
                  key={userId}
                  className={`new-message-user ${
                    isSelected
                      ? "new-message-user-selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedUser(user)
                  }
                  disabled={creating}
                >

                  {/* Avatar */}

                  <div className="new-message-avatar-wrapper">

                    <img
                      src={avatar}
                      alt={name}
                      className="new-message-avatar"
                      onError={(event) => {
                        event.currentTarget.src =
                          "/assets/images/default-avatar.png";
                      }}
                    />

                    {isOnline && (
                      <span className="new-message-online" />
                    )}

                  </div>

                  {/* User Information */}

                  <div className="new-message-user-info">

                    <h4>
                      {name}
                    </h4>

                    {username && (
                      <span>
                        @{username.replace(
                          /^@/,
                          ""
                        )}
                      </span>
                    )}

                  </div>

                  {/* Selected */}

                  {isSelected && (
                    <span className="new-message-check">
                      ✓
                    </span>
                  )}

                </button>
              );
            })
          )}

        </div>

        {/* ======================================================
            Footer
        ======================================================= */}

        <div className="new-message-footer">

          <button
            type="button"
            className="new-message-cancel"
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </button>

          <button
            type="button"
            className="new-message-start"
            disabled={
              !selectedUser ||
              creating
            }
            onClick={
              handleCreateConversation
            }
          >
            {creating
              ? "Opening..."
              : "Start Chat"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default NewMessageModal;
