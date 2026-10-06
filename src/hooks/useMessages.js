import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import messageService from "../services/message.service";
import useAuth from "./useAuth";

import { sendSocketMessage } from "../socket/socket";

import {
  useGlobalMessages,
} from "../components/message/GlobalMessageManager";

/*
|--------------------------------------------------------------------------
| useMessages
|--------------------------------------------------------------------------
|
| OMNIX messaging ka main state-management hook.
|
| Architecture:
|
| REALTIME:
|   Socket.IO
|   ├── message:send
|   ├── message:new
|   ├── message:sent
|   ├── conversation:join
|   └── conversation:leave
|
| REST:
|   ├── Conversations
|   ├── Conversation history
|   ├── Pagination
|   ├── Search
|   └── Fallback / sync operations
|
*/

const useMessages = (
  conversationId = null
) => {
  /*
  |--------------------------------------------------------------------------
  | Auth
  |--------------------------------------------------------------------------
  */

  const {
    user: currentUser,
  } = useAuth();

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Global Messages
  |--------------------------------------------------------------------------
  */

  const {
    messagesByConversation,
    messageVersion,
  } = useGlobalMessages();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(false);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    creatingConversation,
    setCreatingConversation,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Message Request Version
  |--------------------------------------------------------------------------
  */

  const messagesRequestRef =
    useRef(0);

  /*
  |--------------------------------------------------------------------------
  | Current Conversation Ref
  |--------------------------------------------------------------------------
  */

  const conversationIdRef =
    useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current =
      conversationId;
  }, [conversationId]);

  /*
  |--------------------------------------------------------------------------
  | Global Messages Ref
  |--------------------------------------------------------------------------
  */

  const globalMessagesRef =
    useRef(messagesByConversation);

  useEffect(() => {
    globalMessagesRef.current =
      messagesByConversation;
  }, [messagesByConversation]);

  /*
  |--------------------------------------------------------------------------
  | Extract Conversations
  |--------------------------------------------------------------------------
  */

  const extractConversations =
    useCallback((response) => {
      const body =
        response?.data ??
        response;

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
        Array.isArray(
          body?.data
        )
      ) {
        return body.data;
      }

      if (
        Array.isArray(
          body?.data?.conversations
        )
      ) {
        return body.data.conversations;
      }

      return [];
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Extract Conversation
  |--------------------------------------------------------------------------
  */

  const extractConversation =
    useCallback((response) => {
      const body =
        response?.data ??
        response;

      if (!body) {
        return null;
      }

      if (body?.conversation) {
        return body.conversation;
      }

      if (
        body?.data &&
        !Array.isArray(body.data)
      ) {
        return body.data;
      }

      return body;
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Extract Messages
  |--------------------------------------------------------------------------
  */

  const extractMessages =
    useCallback((response) => {
      const body =
        response?.data ??
        response;

      if (
        Array.isArray(
          body?.messages
        )
      ) {
        return body.messages;
      }

      if (Array.isArray(body)) {
        return body;
      }

      if (
        Array.isArray(
          body?.data?.messages
        )
      ) {
        return body.data.messages;
      }

      return [];
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Extract Pagination
  |--------------------------------------------------------------------------
  */

  const extractPagination =
    useCallback((response) => {
      const body =
        response?.data ??
        response;

      return (
        body?.pagination ||
        body?.data?.pagination ||
        null
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Fetch Conversations
  |--------------------------------------------------------------------------
  */

  const fetchConversations =
    useCallback(async () => {
      try {
        setLoadingConversations(
          true
        );

        setError(null);

        const response =
          await messageService.getConversations();

        const items =
          extractConversations(
            response
          );

        setConversations(
          Array.isArray(items)
            ? items
            : []
        );

        return items;
      } catch (err) {
        console.error(
          "Failed to fetch conversations:",
          err
        );

        const message =
          err?.response?.data
            ?.message ||
          err?.message ||
          "Failed to load conversations.";

        setError(message);

        return [];
      } finally {
        setLoadingConversations(
          false
        );
      }
    }, [
      extractConversations,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Single Conversation
  |--------------------------------------------------------------------------
  */

  const fetchConversation =
    useCallback(
      async (id) => {
        if (!id) {
          return null;
        }

        try {
          setError(null);

          const response =
            await messageService.getConversation(
              id
            );

          return extractConversation(
            response
          );
        } catch (err) {
          console.error(
            "Failed to fetch conversation:",
            err
          );

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to load conversation.";

          setError(message);

          return null;
        }
      },
      [extractConversation]
    );

  /*
  |--------------------------------------------------------------------------
  | Create / Get Conversation
  |--------------------------------------------------------------------------
  */

  const createConversation =
    useCallback(
      async (userId) => {
        const targetUserId =
          userId?._id ||
          userId?.id ||
          userId;

        if (!targetUserId) {
          const message =
            "Target user ID is required.";

          setError(message);

          return null;
        }

        if (
          currentUserId &&
          String(targetUserId) ===
            String(currentUserId)
        ) {
          const message =
            "You cannot create a conversation with yourself.";

          console.error(
            "Conversation target is current user:",
            {
              currentUserId,
              targetUserId,
            }
          );

          setError(message);

          return null;
        }

        try {
          setCreatingConversation(
            true
          );

          setError(null);

          const response =
            await messageService.createConversation(
              String(targetUserId)
            );

          const conversation =
            extractConversation(
              response
            );

          if (conversation) {
            setConversations(
              (previous) => {
                const newConversationId =
                  conversation?._id ||
                  conversation?.id;

                const filtered =
                  previous.filter(
                    (item) => {
                      const itemId =
                        item?._id ||
                        item?.id;

                      if (
                        !newConversationId ||
                        !itemId
                      ) {
                        return true;
                      }

                      return (
                        String(itemId) !==
                        String(
                          newConversationId
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
          }

          return conversation;
        } catch (err) {
          console.error(
            "Failed to create conversation:",
            err
          );

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to create conversation.";

          setError(message);

          return null;
        } finally {
          setCreatingConversation(
            false
          );
        }
      },
      [
        currentUserId,
        extractConversation,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Fetch Messages
  |--------------------------------------------------------------------------
  |
  | REST is still used for:
  |
  | - Initial history
  | - Pagination
  | - Re-sync
  |
  */

  const fetchMessages =
    useCallback(
      async (
        id = conversationId,
        page = 1,
        size = 30
      ) => {
        if (!id) {
          setMessages([]);

          return {
            messages: [],
            pagination: null,
          };
        }

        const requestId =
          ++messagesRequestRef.current;

        try {
          setLoadingMessages(
            true
          );

          setError(null);

          const response =
            await messageService.getMessages(
              id,
              page,
              size
            );

          const items =
            extractMessages(
              response
            );

          const pagination =
            extractPagination(
              response
            );

          /*
          |--------------------------------------------------------------------------
          | Ignore stale request
          |--------------------------------------------------------------------------
          */

          if (
            requestId !==
            messagesRequestRef.current
          ) {
            return {
              messages: items,
              pagination,
            };
          }

          /*
          |--------------------------------------------------------------------------
          | FIRST PAGE
          |--------------------------------------------------------------------------
          |
          | Database messages +
          | globally received realtime messages
          | merge honge.
          |
          */

          if (page === 1) {
            const apiMessages =
              Array.isArray(items)
                ? items
                : [];

            const globalKey =
              String(id);

            const cachedGlobalMessages =
              globalMessagesRef.current?.[
                globalKey
              ] || [];

            const mergedMessages = [
              ...apiMessages,
              ...(
                Array.isArray(
                  cachedGlobalMessages
                )
                  ? cachedGlobalMessages
                  : []
              ),
            ];

            /*
            |--------------------------------------------------------------------------
            | Remove duplicates + reconcile optimistic messages
            |--------------------------------------------------------------------------
            */

            const uniqueMessages = [];

            mergedMessages.forEach(
              (message) => {
                const messageId =
                  message?._id ||
                  message?.id;

                const clientMessageId =
                  message?.clientMessageId;

                /*
                |--------------------------------------------------------------------------
                | Existing DB message
                |--------------------------------------------------------------------------
                */

                if (messageId) {
                  const existingIndex =
                    uniqueMessages.findIndex(
                      (existing) => {
                        const existingId =
                          existing?._id ||
                          existing?.id;

                        return (
                          existingId &&
                          String(
                            existingId
                          ) ===
                            String(
                              messageId
                            )
                        );
                      }
                    );

                  if (
                    existingIndex !== -1
                  ) {
                    uniqueMessages[
                      existingIndex
                    ] = {
                      ...uniqueMessages[
                        existingIndex
                      ],
                      ...message,
                    };

                    return;
                  }
                }

                /*
                |--------------------------------------------------------------------------
                | Optimistic ↔ Server reconciliation
                |--------------------------------------------------------------------------
                */

                if (
                  clientMessageId
                ) {
                  const existingIndex =
                    uniqueMessages.findIndex(
                      (existing) =>
                        existing?.clientMessageId &&
                        String(
                          existing.clientMessageId
                        ) ===
                          String(
                            clientMessageId
                          )
                    );

                  if (
                    existingIndex !== -1
                  ) {
                    uniqueMessages[
                      existingIndex
                    ] = {
                      ...uniqueMessages[
                        existingIndex
                      ],
                      ...message,
                      status:
                        message?.status ||
                        "sent",
                    };

                    return;
                  }
                }

                uniqueMessages.push(
                  message
                );
              }
            );

            /*
            |--------------------------------------------------------------------------
            | Oldest → newest
            |--------------------------------------------------------------------------
            */

            uniqueMessages.sort(
              (a, b) => {
                const timeA =
                  a?.createdAt
                    ? new Date(
                        a.createdAt
                      ).getTime()
                    : 0;

                const timeB =
                  b?.createdAt
                    ? new Date(
                        b.createdAt
                      ).getTime()
                    : 0;

                return (
                  timeA - timeB
                );
              }
            );

            setMessages(
              uniqueMessages
            );
          } else {
            /*
            |--------------------------------------------------------------------------
            | PAGINATION
            |--------------------------------------------------------------------------
            */

            setMessages(
              (previous) => {
                const existingIds =
                  new Set(
                    previous
                      .map(
                        (message) =>
                          message?._id ||
                          message?.id
                      )
                      .filter(Boolean)
                      .map(String)
                  );

                const existingClientIds =
                  new Set(
                    previous
                      .map(
                        (message) =>
                          message?.clientMessageId
                      )
                      .filter(Boolean)
                      .map(String)
                  );

                const newItems = (
                  Array.isArray(
                    items
                  )
                    ? items
                    : []
                ).filter(
                  (message) => {
                    const messageId =
                      message?._id ||
                      message?.id;

                    const clientMessageId =
                      message?.clientMessageId;

                    if (
                      messageId &&
                      existingIds.has(
                        String(
                          messageId
                        )
                      )
                    ) {
                      return false;
                    }

                    if (
                      clientMessageId &&
                      existingClientIds.has(
                        String(
                          clientMessageId
                        )
                      )
                    ) {
                      return false;
                    }

                    return true;
                  }
                );

                return [
                  ...previous,
                  ...newItems,
                ];
              }
            );
          }

          return {
            messages: items,
            pagination,
          };
        } catch (err) {
          if (
            requestId !==
            messagesRequestRef.current
          ) {
            return {
              messages: [],
              pagination: null,
            };
          }

          console.error(
            "Failed to fetch messages:",
            err
          );

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to load messages.";

          setError(message);

          return {
            messages: [],
            pagination: null,
          };
        } finally {
          if (
            requestId ===
            messagesRequestRef.current
          ) {
            setLoadingMessages(
              false
            );
          }
        }
      },
      [
        conversationId,
        extractMessages,
        extractPagination,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Send Message - SOCKET.IO
  |--------------------------------------------------------------------------
  |
  | Normal message sending REST API se nahi hoga.
  |
  | Flow:
  |
  | 1. Generate clientMessageId
  | 2. Create optimistic message
  | 3. Add optimistic message to UI
  | 4. Emit Socket.IO event
  | 5. Backend saves MongoDB message
  | 6. message:sent comes back
  | 7. Global store reconciles using clientMessageId
  |
  */

  const sendMessage =
    useCallback(
      async (
        content,
        messageType = "TEXT",
        mediaUrl = null,
        replyToMessageId = null
      ) => {
        if (!conversationId) {
          setError(
            "Conversation ID is required."
          );

          return null;
        }

        const cleanContent =
          typeof content === "string"
            ? content.trim()
            : "";

        /*
        |--------------------------------------------------------------------------
        | Validate content/media
        |--------------------------------------------------------------------------
        */

        if (
          !cleanContent &&
          !mediaUrl
        ) {
          return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Client Message ID
        |--------------------------------------------------------------------------
        */

        const clientMessageId =
          `temp-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;

        /*
        |--------------------------------------------------------------------------
        | Optimistic Message
        |--------------------------------------------------------------------------
        */

        const optimisticMessage = {
          _id: clientMessageId,

          id: clientMessageId,

          clientMessageId,

          conversationId:
            String(
              conversationId
            ),

          senderId:
            currentUserId,

          sender:
            currentUser,

          content:
            cleanContent || null,

          messageType,

          mediaUrl:
            mediaUrl || null,

          replyToMessageId:
            replyToMessageId ||
            null,

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),

          status: "sending",

          isRead: false,
        };

        try {
          setSending(true);
          setError(null);

          /*
          |--------------------------------------------------------------------------
          | Invalidate pending REST request
          |--------------------------------------------------------------------------
          */

          messagesRequestRef.current +=
            1;

          /*
          |--------------------------------------------------------------------------
          | Add Optimistic Message FIRST
          |--------------------------------------------------------------------------
          */

          setMessages(
            (previous) => [
              ...previous,
              optimisticMessage,
            ]
          );

          /*
          |--------------------------------------------------------------------------
          | Socket Payload
          |--------------------------------------------------------------------------
          */

          const payload = {
            conversationId:
              String(
                conversationId
              ),

            clientMessageId,

            content:
              cleanContent || null,

            messageType,

            mediaUrl:
              mediaUrl || null,

            replyToMessageId:
              replyToMessageId ||
              null,
          };

          /*
          |--------------------------------------------------------------------------
          | Send through Socket.IO
          |--------------------------------------------------------------------------
          */

          const sent =
            sendSocketMessage(
              "message:send",
              payload
            );

          /*
          |--------------------------------------------------------------------------
          | Socket Send Failed
          |--------------------------------------------------------------------------
          */

          if (!sent) {
            const message =
              "Message server se connect nahi ho saka. Please check your internet connection.";

            setMessages(
              (previous) =>
                previous.filter(
                  (item) =>
                    String(
                      item?.clientMessageId
                    ) !==
                    String(
                      clientMessageId
                    )
                )
            );

            setError(message);

            return null;
          }

          /*
          |--------------------------------------------------------------------------
          | Update Conversations
          |--------------------------------------------------------------------------
          */

          fetchConversations();

          /*
          |--------------------------------------------------------------------------
          | Return Optimistic Message
          |--------------------------------------------------------------------------
          */

          return optimisticMessage;
        } catch (err) {
          console.error(
            "Failed to send message through Socket.IO:",
            err
          );

          /*
          |--------------------------------------------------------------------------
          | Rollback Optimistic Message
          |--------------------------------------------------------------------------
          */

          setMessages(
            (previous) =>
              previous.filter(
                (item) =>
                  String(
                    item?.clientMessageId
                  ) !==
                  String(
                    clientMessageId
                  )
              )
          );

          const message =
            err?.message ||
            "Failed to send message.";

          setError(message);

          return null;
        } finally {
          setSending(false);
        }
      },
      [
        conversationId,
        currentUserId,
        currentUser,
        fetchConversations,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Add Real-Time Message
  |--------------------------------------------------------------------------
  */

  const addMessage =
    useCallback(
      (incomingData) => {
        if (!incomingData) {
          return;
        }

        const newMessage =
          incomingData?.message ||
          incomingData?.data ||
          incomingData;

        if (!newMessage) {
          return;
        }

        const messageConversationId =
          newMessage?.conversationId ||
          newMessage?.conversation?._id ||
          newMessage?.conversation?.id;

        /*
        |--------------------------------------------------------------------------
        | Conversation Filter
        |--------------------------------------------------------------------------
        */

        if (
          conversationIdRef.current &&
          messageConversationId &&
          String(
            messageConversationId
          ) !==
            String(
              conversationIdRef.current
            )
        ) {
          return;
        }

        const newId =
          newMessage?._id ||
          newMessage?.id;

        const newClientMessageId =
          newMessage?.clientMessageId;

        /*
        |--------------------------------------------------------------------------
        | Add Message
        |--------------------------------------------------------------------------
        */

        setMessages(
          (previous) => {
            /*
            |----------------------------------------------------------------------
            | DB ID duplicate check
            |----------------------------------------------------------------------
            */

            if (newId) {
              const exists =
                previous.some(
                  (message) =>
                    String(
                      message?._id ||
                        message?.id
                    ) ===
                    String(newId)
                );

              if (exists) {
                return previous;
              }
            }

            /*
            |----------------------------------------------------------------------
            | clientMessageId duplicate check
            |----------------------------------------------------------------------
            */

            if (
              newClientMessageId
            ) {
              const existingIndex =
                previous.findIndex(
                  (message) =>
                    message?.clientMessageId &&
                    String(
                      message.clientMessageId
                    ) ===
                      String(
                        newClientMessageId
                      )
                );

              if (
                existingIndex !== -1
              ) {
                const updated =
                  [...previous];

                updated[
                  existingIndex
                ] = {
                  ...updated[
                    existingIndex
                  ],
                  ...newMessage,
                  status:
                    newMessage?.status ||
                    "sent",
                };

                return updated;
              }
            }

            return [
              ...previous,
              newMessage,
            ];
          }
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | GLOBAL MESSAGE → CURRENT CONVERSATION SYNC
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | GlobalMessageManager me server message aa sakta hai
  | jab local optimistic message already messages state me ho.
  |
  | Isliye sirf _id/id se duplicate check karna enough nahi hai.
  |
  | clientMessageId same hota hai:
  |
  | optimistic:
  |   temp-123
  |
  | server:
  |   MongoDB _id + temp-123
  |
  | Yahan optimistic message ko server message se REPLACE
  | karna hai, append nahi.
  |
  */

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const key =
      String(conversationId);

    const globalMessages =
      messagesByConversation?.[
        key
      ] || [];

    if (
      !Array.isArray(
        globalMessages
      )
    ) {
      return;
    }

    if (
      !globalMessages.length
    ) {
      return;
    }

    setMessages(
      (previous) => {
        /*
        |--------------------------------------------------------------------------
        | Existing local messages clone
        |--------------------------------------------------------------------------
        */

        const merged = [
          ...previous,
        ];

        let changed = false;

        /*
        |--------------------------------------------------------------------------
        | Merge every global message
        |--------------------------------------------------------------------------
        */

        globalMessages.forEach(
          (globalMessage) => {
            if (!globalMessage) {
              return;
            }

            const globalId =
              globalMessage?._id ||
              globalMessage?.id;

            const globalClientMessageId =
              globalMessage?.clientMessageId;

            let existingIndex =
              -1;

            /*
            |--------------------------------------------------------------------------
            | 1. First check MongoDB ID
            |--------------------------------------------------------------------------
            */

            if (globalId) {
              existingIndex =
                merged.findIndex(
                  (message) => {
                    const messageId =
                      message?._id ||
                      message?.id;

                    return (
                      messageId &&
                      String(
                        messageId
                      ) ===
                        String(
                          globalId
                        )
                    );
                  }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 2. If DB ID not found,
            |    check clientMessageId
            |--------------------------------------------------------------------------
            */

            if (
              existingIndex === -1 &&
              globalClientMessageId
            ) {
              existingIndex =
                merged.findIndex(
                  (message) =>
                    message?.clientMessageId &&
                    String(
                      message.clientMessageId
                    ) ===
                      String(
                        globalClientMessageId
                      )
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 3. Existing optimistic/server message found
            |--------------------------------------------------------------------------
            |
            | Replace it instead of appending.
            |
            */

            if (
              existingIndex !== -1
            ) {
              merged[
                existingIndex
              ] = {
                ...merged[
                  existingIndex
                ],

                ...globalMessage,

                status:
                  globalMessage?.status ||
                  "sent",
              };

              changed = true;

              return;
            }

            /*
            |--------------------------------------------------------------------------
            | 4. Completely new message
            |--------------------------------------------------------------------------
            */

            merged.push(
              globalMessage
            );

            changed = true;
          }
        );

        if (!changed) {
          return previous;
        }

        /*
        |--------------------------------------------------------------------------
        | Oldest → newest
        |--------------------------------------------------------------------------
        */

        merged.sort(
          (a, b) => {
            const timeA =
              a?.createdAt
                ? new Date(
                    a.createdAt
                  ).getTime()
                : 0;

            const timeB =
              b?.createdAt
                ? new Date(
                    b.createdAt
                  ).getTime()
                : 0;

            return (
              timeA - timeB
            );
          }
        );

        return merged;
      }
    );
  }, [
    conversationId,
    messagesByConversation,
    messageVersion,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Socket.IO: Join Conversation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const joined =
      sendSocketMessage(
        "conversation:join",
        {
          conversationId:
            String(
              conversationId
            ),
        }
      );

    if (!joined) {
      console.warn(
        "Could not join conversation socket room:",
        conversationId
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Leave conversation
    |--------------------------------------------------------------------------
    */

    return () => {
      sendSocketMessage(
        "conversation:leave",
        {
          conversationId:
            String(
              conversationId
            ),
        }
      );
    };
  }, [conversationId]);

  /*
  |--------------------------------------------------------------------------
  | Mark Messages As Read
  |--------------------------------------------------------------------------
  */

  const markAsRead =
    useCallback(async () => {
      if (!conversationId) {
        return false;
      }

      try {
        await messageService.markMessagesAsRead(
          conversationId
        );

        setMessages(
          (previous) =>
            previous.map(
              (message) => ({
                ...message,
                isRead: true,
              })
            )
        );

        setConversations(
          (previous) =>
            previous.map(
              (conversation) => {
                const id =
                  conversation?._id ||
                  conversation?.id;

                if (
                  String(id) !==
                  String(
                    conversationId
                  )
                ) {
                  return conversation;
                }

                return {
                  ...conversation,
                  unreadCount: 0,
                };
              }
            )
        );

        return true;
      } catch (err) {
        console.error(
          "Failed to mark messages as read:",
          err
        );

        return false;
      }
    }, [conversationId]);

  /*
  |--------------------------------------------------------------------------
  | Delete Message
  |--------------------------------------------------------------------------
  |
  | Abhi REST.
  |
  | Realtime delete synchronization backend socket
  | event se separately handle hoga.
  |
  */

  const deleteMessage =
    useCallback(
      async (messageId) => {
        if (!messageId) {
          return false;
        }

        try {
          setError(null);

          await messageService.deleteMessage(
            messageId
          );

          setMessages(
            (previous) =>
              previous.filter(
                (message) =>
                  String(
                    message?._id ||
                      message?.id
                  ) !==
                  String(messageId)
              )
          );

          return true;
        } catch (err) {
          console.error(
            "Failed to delete message:",
            err
          );

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to delete message.";

          setError(message);

          return false;
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Update Message
  |--------------------------------------------------------------------------
  |
  | Abhi REST.
  |
  | Realtime update synchronization backend socket
  | event se separately handle hoga.
  |
  */

  const updateMessage =
    useCallback(
      async (
        messageId,
        content
      ) => {
        if (
          !messageId ||
          !content?.trim()
        ) {
          return null;
        }

        try {
          setError(null);

          const response =
            await messageService.updateMessage(
              messageId,
              content.trim()
            );

          const body =
            response?.data ??
            response;

          const updatedMessage =
            body?.message ||
            body?.data ||
            body;

          if (updatedMessage) {
            setMessages(
              (previous) =>
                previous.map(
                  (message) => {
                    const currentId =
                      message?._id ||
                      message?.id;

                    return String(
                      currentId
                    ) ===
                      String(
                        messageId
                      )
                      ? updatedMessage
                      : message;
                  }
                )
            );
          }

          return updatedMessage;
        } catch (err) {
          console.error(
            "Failed to update message:",
            err
          );

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to update message.";

          setError(message);

          return null;
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Load Conversations On Mount
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchConversations();
  }, [
    fetchConversations,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load Messages When Conversation Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);

      return;
    }

    fetchMessages(
      conversationId,
      1,
      30
    );
  }, [
    conversationId,
    fetchMessages,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    /*
    |--------------------------------------------------------------------------
    | Data
    |--------------------------------------------------------------------------
    */

    conversations,
    messages,

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    loadingConversations,
    loadingMessages,
    sending,
    creatingConversation,

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    error,

    /*
    |--------------------------------------------------------------------------
    | Conversations
    |--------------------------------------------------------------------------
    */

    fetchConversations,
    fetchConversation,
    createConversation,

    /*
    |--------------------------------------------------------------------------
    | Messages
    |--------------------------------------------------------------------------
    */

    fetchMessages,
    sendMessage,
    addMessage,
    markAsRead,
    deleteMessage,
    updateMessage,

    /*
    |--------------------------------------------------------------------------
    | Setters
    |--------------------------------------------------------------------------
    */

    setConversations,
    setMessages,
  };
};

export default useMessages;