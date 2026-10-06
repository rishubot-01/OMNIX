
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import useMessages from "../hooks/useMessages";

const MessageContext =
  createContext(null);

export const MessageProvider = ({
  children,
}) => {
  /*
   * ------------------------------------------------------------
   * Selected Conversation
   * ------------------------------------------------------------
   */

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  /*
   * ------------------------------------------------------------
   * Typing Users
   * ------------------------------------------------------------
   */

  const [
    typingUsers,
    setTypingUsers,
  ] = useState({});

  /*
   * ------------------------------------------------------------
   * Selected Conversation ID
   * ------------------------------------------------------------
   *
   * Conversation me _id ya id dono ho sakte hain.
   * Isliye ek hi place par normalize kar rahe hain.
   */

  const selectedConversationId =
    selectedConversation?._id ||
    selectedConversation?.id ||
    null;

  /*
   * ------------------------------------------------------------
   * Messages Hook
   * ------------------------------------------------------------
   */

  const {
    conversations,
    messages,

    loadingConversations,
    loadingMessages,

    sending,

    error,

    fetchConversations,
    fetchMessages,

    sendMessage,
    addMessage,

    markAsRead,

    deleteMessage,
    updateMessage,
  } = useMessages(
    selectedConversationId
  );

  /*
   * ------------------------------------------------------------
   * Select Conversation
   * ------------------------------------------------------------
   */

  const selectConversation =
    useCallback(
      async (conversation) => {
        if (!conversation) {
          return;
        }

        /*
         * Conversation immediately select karo.
         */

        setSelectedConversation(
          conversation
        );

        /*
         * Mark read ke liye selected conversation
         * ka actual ID directly use karna zaroori hai.
         *
         * Lekin useMessages ka markAsRead current
         * hook conversationId par based hai.
         *
         * Isliye yahan selected conversation set hone
         * ke baad next render me hook updated ID ke
         * saath markAsRead available hoga.
         *
         * Immediate mark-read ko intentionally yahan
         * call nahi kar rahe hain taaki old conversation
         * ID use na ho.
         */
      },
      []
    );

  /*
   * ------------------------------------------------------------
   * Clear Selected Conversation
   * ------------------------------------------------------------
   */

  const clearConversation =
    useCallback(() => {
      setSelectedConversation(
        null
      );
    }, []);

  /*
   * ------------------------------------------------------------
   * Add Typing User
   * ------------------------------------------------------------
   */

  const setUserTyping =
    useCallback(
      (
        conversationId,
        user
      ) => {
        if (
          !conversationId ||
          !user
        ) {
          return;
        }

        const userId =
          user?._id ||
          user?.id ||
          null;

        setTypingUsers(
          (previous) => ({
            ...previous,

            [String(
              conversationId
            )]: {
              id: userId,
              name:
                user?.name ||
                user?.fullName ||
                user?.username ||
                "OMNIX User",
              avatar:
                user?.avatar ||
                user?.profileImage ||
                user?.profilePicture ||
                null,
            },
          })
        );
      },
      []
    );

  /*
   * ------------------------------------------------------------
   * Remove Typing User
   * ------------------------------------------------------------
   */

  const removeUserTyping =
    useCallback(
      (conversationId) => {
        if (!conversationId) {
          return;
        }

        setTypingUsers(
          (previous) => {
            const updated = {
              ...previous,
            };

            delete updated[
              String(
                conversationId
              )
            ];

            return updated;
          }
        );
      },
      []
    );

  /*
   * ------------------------------------------------------------
   * Is Selected User Typing?
   * ------------------------------------------------------------
   */

  const isUserTyping =
    selectedConversationId
      ? typingUsers[
          String(
            selectedConversationId
          )
        ] || null
      : null;

  /*
   * ------------------------------------------------------------
   * Context Value
   * ------------------------------------------------------------
   */

  const value = useMemo(
    () => ({
      /*
       * Conversations
       */

      conversations,

      selectedConversation,

      selectConversation,

      clearConversation,

      /*
       * Messages
       */

      messages,

      sendMessage,

      addMessage,

      deleteMessage,

      updateMessage,

      /*
       * Read Status
       */

      markAsRead,

      /*
       * Fetch
       */

      fetchConversations,

      fetchMessages,

      /*
       * Typing
       */

      typingUsers,

      setUserTyping,

      removeUserTyping,

      isUserTyping,

      /*
       * Loading
       */

      loadingConversations,

      loadingMessages,

      sending,

      /*
       * Error
       */

      error,
    }),
    [
      conversations,

      selectedConversation,

      selectConversation,

      clearConversation,

      messages,

      sendMessage,

      addMessage,

      deleteMessage,

      updateMessage,

      markAsRead,

      fetchConversations,

      fetchMessages,

      typingUsers,

      setUserTyping,

      removeUserTyping,

      isUserTyping,

      loadingConversations,

      loadingMessages,

      sending,

      error,
    ]
  );

  /*
   * ------------------------------------------------------------
   * Provider
   * ------------------------------------------------------------
   */

  return (
    <MessageContext.Provider
      value={value}
    >
      {children}
    </MessageContext.Provider>
  );
};

/*
 * ------------------------------------------------------------
 * Custom Hook
 * ------------------------------------------------------------
 */

export const useMessageContext =
  () => {
    const context =
      useContext(
        MessageContext
      );

    if (!context) {
      throw new Error(
        "useMessageContext must be used inside MessageProvider"
      );
    }

    return context;
  };

export default MessageContext;
