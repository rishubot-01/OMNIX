
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ConversationItem from "./ConversationItem";
import UserSearch from "./UserSearch";
import NewMessageModal from "./NewMessageModal";

import messageService from "../../services/message.service";
import useAuth from "../../hooks/useAuth";

const ConversationList = ({
  selectedConversation,
  onSelectConversation,
}) => {
  /*
   * ------------------------------------------------------------
   * Current logged-in user
   * ------------------------------------------------------------
   *
   * useAuth.js me:
   *
   * export default useAuth;
   *
   * Isliye yahan default import useAuth use karna hai.
   */
  const { user: currentUser } = useAuth();

  const [searchText, setSearchText] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * ------------------------------------------------------------
   * Current User ID
   * ------------------------------------------------------------
   */

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    null;

  /*
   * ------------------------------------------------------------
   * Extract Conversations
   * ------------------------------------------------------------
   */

  const extractConversations = useCallback(
    (response) => {
      const body =
        response?.data ?? response;

      if (Array.isArray(body)) {
        return body;
      }

      if (
        Array.isArray(
          body?.conversations
        )
      ) {
        return body.conversations;
      }

      if (
        Array.isArray(body?.data)
      ) {
        return body.data;
      }

      return [];
    },
    []
  );

  /*
   * ------------------------------------------------------------
   * Extract Users
   * ------------------------------------------------------------
   */

  const extractUsers = useCallback(
    (response) => {
      const body =
        response?.data ?? response;

      if (Array.isArray(body)) {
        return body;
      }

      if (
        Array.isArray(body?.users)
      ) {
        return body.users;
      }

      if (
        Array.isArray(body?.data)
      ) {
        return body.data;
      }

      return [];
    },
    []
  );

  /*
   * ------------------------------------------------------------
   * Normalize Conversation
   * ------------------------------------------------------------
   *
   * Backend conversation:
   *
   * {
   *   _id,
   *   participants: [
   *     currentUser,
   *     otherUser
   *   ]
   * }
   *
   * Frontend:
   *
   * {
   *   user: otherUser
   * }
   */

  const normalizeConversation = useCallback(
    (conversation) => {
      if (!conversation) {
        return null;
      }

      const participants =
        Array.isArray(
          conversation?.participants
        )
          ? conversation.participants
          : [];

      const otherUser =
        participants.find(
          (participant) => {
            const participantId =
              participant?._id ||
              participant?.id ||
              participant;

            return (
              String(participantId) !==
              String(currentUserId)
            );
          }
        ) || null;

      /*
       * Backend service already sends user.
       * Agar user available hai to usko priority denge.
       */

      const user =
        conversation?.user ||
        conversation?.participant ||
        conversation?.otherUser ||
        otherUser;

      return {
        ...conversation,

        user,

        currentUserId,

        me: currentUser,

        id: String(
          conversation?._id ||
          conversation?.id ||
          ""
        ),
      };
    },
    [currentUser, currentUserId]
  );

  /*
   * ------------------------------------------------------------
   * Load Conversations
   * ------------------------------------------------------------
   */

  const loadConversations = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await messageService.getConversations();

        const items =
          extractConversations(
            response
          );

        const normalized =
          items
            .map(
              normalizeConversation
            )
            .filter(Boolean);

        setConversations(normalized);
      } catch (err) {
        console.error(
          "Failed to load conversations:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load conversations."
        );

        setConversations([]);
      } finally {
        setLoading(false);
      }
    },
    [
      extractConversations,
      normalizeConversation,
    ]
  );

  /*
   * ------------------------------------------------------------
   * Initial Load
   * ------------------------------------------------------------
   */

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /*
   * ------------------------------------------------------------
   * Search Users
   * ------------------------------------------------------------
   *
   * Search API:
   *
   * GET /api/messages/users/search?query=rahul
   */

  useEffect(() => {
    const query =
      searchText.trim();

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(
      async () => {
        try {
          setSearchLoading(true);

          const response =
            await messageService.searchUsers(
              query
            );

          if (cancelled) {
            return;
          }

          const users =
            extractUsers(response);

          setSearchResults(
            Array.isArray(users)
              ? users
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

          setSearchResults([]);
        } finally {
          if (!cancelled) {
            setSearchLoading(false);
          }
        }
      },
      300
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    searchText,
    extractUsers,
  ]);

  /*
   * ------------------------------------------------------------
   * Filter Existing Conversations
   * ------------------------------------------------------------
   */

  const filteredConversations =
    useMemo(() => {
      const search =
        searchText
          .toLowerCase()
          .trim();

      if (!search) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const user =
            conversation?.user ||
            conversation?.participant ||
            conversation?.otherUser ||
            {};

          const name =
            user?.name ||
            user?.fullName ||
            user?.username ||
            "";

          const username =
            user?.username ||
            "";

          return (
            String(name)
              .toLowerCase()
              .includes(search) ||
            String(username)
              .toLowerCase()
              .includes(search)
          );
        }
      );
    }, [
      conversations,
      searchText,
    ]);

  /*
   * ------------------------------------------------------------
   * Open User Conversation
   * ------------------------------------------------------------
   */

  const handleUserClick =
    useCallback(
      async (user) => {
        if (!user) {
          return;
        }

        const userId =
          user?._id ||
          user?.id;

        if (!userId) {
          setError(
            "Selected user ID was not found."
          );
          return;
        }

        try {
          setSearchLoading(true);
          setError("");

          /*
           * POST
           * /api/messages/conversations
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
            response?.data ??
            response;

          /*
           * Backend:
           *
           * {
           *   success: true,
           *   data: conversation
           * }
           */

          const rawConversation =
            body?.conversation ||
            body?.data ||
            body;

          if (!rawConversation) {
            throw new Error(
              "Conversation was not returned by the server."
            );
          }

          const conversation =
            normalizeConversation(
              rawConversation
            );

          if (!conversation) {
            throw new Error(
              "Invalid conversation received from server."
            );
          }

          /*
           * Sidebar update
           */

          setConversations(
            (previous) => {
              const conversationId =
                conversation?._id ||
                conversation?.id;

              const filtered =
                previous.filter(
                  (item) => {
                    const itemId =
                      item?._id ||
                      item?.id;

                    return (
                      String(itemId) !==
                      String(
                        conversationId
                      )
                    );
                  }
                );

              return [
                conversation,
                ...filtered,
              ];
            }
          );

          /*
           * Search clear
           */

          setSearchText("");
          setSearchResults([]);

          /*
           * Open chat
           */

          onSelectConversation?.(
            conversation
          );
        } catch (err) {
          console.error(
            "Failed to create/open conversation:",
            err
          );

          setError(
            err?.response?.data?.message ||
            err?.message ||
            "Unable to start conversation."
          );
        } finally {
          setSearchLoading(false);
        }
      },
      [
        normalizeConversation,
        onSelectConversation,
      ]
    );

  /*
   * ------------------------------------------------------------
   * New Message Modal
   * ------------------------------------------------------------
   */

  const handleConversationCreated =
    useCallback(
      (conversation) => {
        if (!conversation) {
          return;
        }

        const normalized =
          normalizeConversation(
            conversation
          );

        if (!normalized) {
          return;
        }

        setConversations(
          (previous) => {
            const conversationId =
              normalized?._id ||
              normalized?.id;

            const filtered =
              previous.filter(
                (item) => {
                  const itemId =
                    item?._id ||
                    item?.id;

                  return (
                    String(itemId) !==
                    String(
                      conversationId
                    )
                  );
                }
              );

            return [
              normalized,
              ...filtered,
            ];
          }
        );

        setShowNewMessage(false);
        setSearchText("");
        setSearchResults([]);

        onSelectConversation?.(
          normalized
        );
      },
      [
        normalizeConversation,
        onSelectConversation,
      ]
    );

  /*
   * ------------------------------------------------------------
   * Existing Conversation Click
   * ------------------------------------------------------------
   */

  const handleConversationClick =
    useCallback(
      (conversation) => {
        if (!conversation) {
          return;
        }

        onSelectConversation?.(
          conversation
        );
      },
      [onSelectConversation]
    );

  /*
   * ------------------------------------------------------------
   * Selected Conversation ID
   * ------------------------------------------------------------
   */

  const selectedConversationId =
    selectedConversation?._id ||
    selectedConversation?.id ||
    null;

  /*
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <div className="conversation-list">

      {/* ======================================================
          Header
      ======================================================= */}

      <div className="conversation-header">
        <div>
          <h2>
            Messages
          </h2>

          <span className="conversation-count">
            {conversations.length} Chats
          </span>
        </div>

        <button
          type="button"
          className="new-message-button"
          onClick={() =>
            setShowNewMessage(true)
          }
          title="New Message"
          aria-label="New Message"
        >
          ✎
        </button>
      </div>

      {/* ======================================================
          Search
      ======================================================= */}

      <div className="conversation-search">
        <UserSearch
          value={searchText}
          onChange={setSearchText}
          placeholder="Search users..."
        />
      </div>

      {/* ======================================================
          Error
      ======================================================= */}

      {error && (
        <div className="px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ======================================================
          Conversation Items
      ======================================================= */}

      <div className="conversation-items">

        {/* ----------------------------------------------------
            Searching Users
        ----------------------------------------------------- */}

        {searchText.trim() ? (

          searchLoading ? (

            <div className="no-conversations">
              <p>
                Searching users...
              </p>
            </div>

          ) : searchResults.length > 0 ? (

            <>
              {/* User Search Results */}

              <div className="search-results-title">
                Users
              </div>

              {searchResults.map(
                (user) => {
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

                  const online =
                    Boolean(
                      user?.online ||
                      user?.isOnline
                    );

                  return (
                    <button
                      type="button"
                      key={userId}
                      className="conversation-item"
                      onClick={() =>
                        handleUserClick(
                          user
                        )
                      }
                    >

                      {/* Avatar */}

                      <div className="conversation-avatar-wrapper">
                        <img
                          src={avatar}
                          alt={name}
                          className="conversation-avatar"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              "/assets/images/default-avatar.png";
                          }}
                        />

                        {online && (
                          <span className="online-status" />
                        )}
                      </div>

                      {/* User Info */}

                      <div className="conversation-info">

                        <div className="conversation-top">
                          <h4>
                            {name}
                          </h4>
                        </div>

                        <div className="conversation-bottom">
                          <p className="conversation-last-message">
                            {username
                              ? `@${username.replace(
                                  "@",
                                  ""
                                )}`
                              : "Start a conversation"}
                          </p>
                        </div>

                      </div>

                    </button>
                  );
                }
              )}

              {/* Existing Chats */}

              {filteredConversations.length >
                0 && (
                <>
                  <div className="search-results-title">
                    Existing Chats
                  </div>

                  {filteredConversations.map(
                    (conversation) => {
                      const conversationId =
                        conversation?._id ||
                        conversation?.id;

                      return (
                        <ConversationItem
                          key={
                            conversationId
                          }
                          conversation={
                            conversation
                          }
                          isSelected={
                            String(
                              selectedConversationId
                            ) ===
                            String(
                              conversationId
                            )
                          }
                          onClick={() =>
                            handleConversationClick(
                              conversation
                            )
                          }
                        />
                      );
                    }
                  )}
                </>
              )}
            </>

          ) : filteredConversations.length >
            0 ? (

            <>
              <div className="search-results-title">
                Existing Chats
              </div>

              {filteredConversations.map(
                (conversation) => {
                  const conversationId =
                    conversation?._id ||
                    conversation?.id;

                  return (
                    <ConversationItem
                      key={
                        conversationId
                      }
                      conversation={
                        conversation
                      }
                      isSelected={
                        String(
                          selectedConversationId
                        ) ===
                        String(
                          conversationId
                        )
                      }
                      onClick={() =>
                        handleConversationClick(
                          conversation
                        )
                      }
                    />
                  );
                }
              )}
            </>

          ) : (

            <div className="no-conversations">
              <div className="no-conversations-icon">
                🔍
              </div>

              <h3>
                No users found
              </h3>

              <p>
                Try another name or username.
              </p>
            </div>

          )

        ) : loading ? (

          /* ----------------------------------------------------
             Loading Conversations
          ----------------------------------------------------- */

          <div className="no-conversations">
            <p>
              Loading conversations...
            </p>
          </div>

        ) : filteredConversations.length >
          0 ? (

          /* ----------------------------------------------------
             Conversations
          ----------------------------------------------------- */

          filteredConversations.map(
            (conversation) => {
              const conversationId =
                conversation?._id ||
                conversation?.id;

              return (
                <ConversationItem
                  key={
                    conversationId
                  }
                  conversation={
                    conversation
                  }
                  isSelected={
                    String(
                      selectedConversationId
                    ) ===
                    String(
                      conversationId
                    )
                  }
                  onClick={() =>
                    handleConversationClick(
                      conversation
                    )
                  }
                />
              );
            }
          )

        ) : (

          /* ----------------------------------------------------
             Empty
          ----------------------------------------------------- */

          <div className="no-conversations">

            <div className="no-conversations-icon">
              💬
            </div>

            <h3>
              No conversations yet
            </h3>

            <p>
              Search for a user above to
              start chatting.
            </p>

          </div>
        )}

      </div>

      {/* ======================================================
          New Message Modal
      ======================================================= */}

      {showNewMessage && (
        <NewMessageModal
          onClose={() =>
            setShowNewMessage(false)
          }
          onConversationCreated={
            handleConversationCreated
          }
        />
      )}

    </div>
  );
};

export default ConversationList;
