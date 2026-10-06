
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import useAuth from "../../hooks/useAuth";

import {
  getSocketClient,
} from "../../socket/socket";

import {
  useSocket,
} from "../../context/SocketContext";


/*
|--------------------------------------------------------------------------
| GLOBAL MESSAGE CONTEXT
|--------------------------------------------------------------------------
*/

const GlobalMessageContext = createContext(null);


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const extractMessage = (data) => {
  if (!data) {
    return null;
  }

  const message =
    data?.message ||
    data?.data ||
    data;

  if (!message) {
    return null;
  }

  return message;
};


const getConversationId = (
  data,
  message
) => {
  return (
    message?.conversationId ||
    message?.conversation?._id ||
    message?.conversation?.id ||
    data?.conversationId ||
    data?.conversation?._id ||
    data?.conversation?.id ||
    null
  );
};


const getMessageId = (message) => {
  return (
    message?._id ||
    message?.id ||
    null
  );
};


const getClientMessageId = (message) => {
  return (
    message?.clientMessageId ||
    null
  );
};


const getSenderId = (message) => {
  return (
    message?.senderId ||
    message?.sender?._id ||
    message?.sender?.id ||
    null
  );
};


const normalizeId = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return String(value);
};


/*
|--------------------------------------------------------------------------
| GLOBAL MESSAGE PROVIDER
|--------------------------------------------------------------------------
*/

export function GlobalMessageProvider({
  children,
}) {

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  const {
    user: currentUser,
    token,
  } = useAuth();


  /*
  |--------------------------------------------------------------------------
  | SOCKET CONTEXT
  |--------------------------------------------------------------------------
  */

  const {
    connected,
  } = useSocket();


  /*
  |--------------------------------------------------------------------------
  | CURRENT USER ID
  |--------------------------------------------------------------------------
  */

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    null;


  /*
  |--------------------------------------------------------------------------
  | LATEST MESSAGE
  |--------------------------------------------------------------------------
  */

  const [
    lastMessage,
    setLastMessage,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | MESSAGE VERSION
  |--------------------------------------------------------------------------
  */

  const [
    messageVersion,
    setMessageVersion,
  ] = useState(0);


  /*
  |--------------------------------------------------------------------------
  | MESSAGES BY CONVERSATION
  |--------------------------------------------------------------------------
  */

  const [
    messagesByConversation,
    setMessagesByConversation,
  ] = useState({});


  /*
  |--------------------------------------------------------------------------
  | UNREAD BY CONVERSATION
  |--------------------------------------------------------------------------
  */

  const [
    unreadByConversation,
    setUnreadByConversation,
  ] = useState({});


  /*
  |--------------------------------------------------------------------------
  | ATTACHED SOCKET
  |--------------------------------------------------------------------------
  */

  const attachedSocketRef =
    useRef(null);


  /*
  |--------------------------------------------------------------------------
  | BUMP MESSAGE VERSION
  |--------------------------------------------------------------------------
  */

  const bumpMessageVersion =
    useCallback(() => {
      setMessageVersion(
        (previous) =>
          previous + 1
      );
    }, []);


  /*
  |--------------------------------------------------------------------------
  | ADD MESSAGE TO CONVERSATION
  |--------------------------------------------------------------------------
  */

  const addMessageToConversation =
    useCallback(
      (
        conversationId,
        message
      ) => {

        if (
          !conversationId ||
          !message
        ) {
          return false;
        }

        const conversationKey =
          String(conversationId);

        const messageId =
          normalizeId(
            getMessageId(message)
          );

        const clientMessageId =
          getClientMessageId(
            message
          );

        let added = false;

        setMessagesByConversation(
          (previous) => {

            const existing =
              previous[
                conversationKey
              ] || [];


            /*
            |--------------------------------------------------------------------------
            | DATABASE MESSAGE ID DUPLICATE
            |--------------------------------------------------------------------------
            */

            if (messageId) {

              const alreadyExists =
                existing.some(
                  (item) =>
                    normalizeId(
                      getMessageId(item)
                    ) === messageId
                );

              if (alreadyExists) {
                return previous;
              }
            }


            /*
            |--------------------------------------------------------------------------
            | CLIENT MESSAGE ID DUPLICATE
            |--------------------------------------------------------------------------
            */

            if (clientMessageId) {

              const alreadyExists =
                existing.some(
                  (item) =>
                    getClientMessageId(item) ===
                    clientMessageId
                );

              if (alreadyExists) {
                return previous;
              }
            }


            added = true;

            return {
              ...previous,

              [conversationKey]: [
                ...existing,
                message,
              ].slice(-100),
            };
          }
        );

        return added;
      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE NEW
  |--------------------------------------------------------------------------
  |
  | Receiver side.
  |
  | Backend:
  | message:new
  |
  */

  const handleIncomingMessage =
    useCallback(
      (data) => {

        console.log(
          "🔥 GLOBAL message:new RECEIVED:",
          data
        );


        const message =
          extractMessage(data);

        if (!message) {

          console.warn(
            "GlobalMessageManager: Invalid message:new payload:",
            data
          );

          return;
        }


        const conversationId =
          getConversationId(
            data,
            message
          );

        if (!conversationId) {

          console.warn(
            "GlobalMessageManager: conversationId missing:",
            message
          );

          return;
        }


        const conversationKey =
          String(conversationId);


        setLastMessage(message);


        const added =
          addMessageToConversation(
            conversationKey,
            message
          );


        /*
        |--------------------------------------------------------------------------
        | VERSION
        |--------------------------------------------------------------------------
        */

        if (added) {
          bumpMessageVersion();
        }


        /*
        |--------------------------------------------------------------------------
        | UNREAD
        |--------------------------------------------------------------------------
        */

        if (added) {

          setUnreadByConversation(
            (previous) => {

              const currentCount =
                Number(
                  previous[
                    conversationKey
                  ] || 0
                );

              return {
                ...previous,

                [conversationKey]:
                  currentCount + 1,
              };
            }
          );
        }


        /*
        |--------------------------------------------------------------------------
        | BROWSER EVENT
        |--------------------------------------------------------------------------
        */

        try {

          window.dispatchEvent(
            new CustomEvent(
              "omni:message:new",
              {
                detail: {
                  message,

                  conversationId:
                    conversationKey,
                },
              }
            )
          );

        } catch (error) {

          console.warn(
            "GlobalMessageManager: Browser event failed:",
            error
          );
        }
      },
      [
        addMessageToConversation,
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE SENT
  |--------------------------------------------------------------------------
  |
  | Sender side.
  |
  | Backend:
  | message:sent
  |
  | IMPORTANT:
  | Server se complete MongoDB message aata hai.
  |
  | clientMessageId ke through:
  |
  | optimistic message
  |        ↓
  | exact match
  |        ↓
  | real MongoDB message
  |
  */

  const handleMessageSent =
    useCallback(
      (data) => {

        console.log(
          "✅ GLOBAL message:sent RECEIVED:",
          data
        );


        const serverMessage =
          extractMessage(data);

        if (!serverMessage) {

          console.warn(
            "GlobalMessageManager: Invalid message:sent payload:",
            data
          );

          return;
        }


        const conversationId =
          getConversationId(
            data,
            serverMessage
          );

        if (!conversationId) {

          console.warn(
            "GlobalMessageManager: message:sent conversationId missing:",
            serverMessage
          );

          return;
        }


        const conversationKey =
          String(conversationId);


        const serverMessageId =
          normalizeId(
            getMessageId(
              serverMessage
            )
          );


        const serverClientMessageId =
          getClientMessageId(
            serverMessage
          );


        setLastMessage(
          serverMessage
        );


        /*
        |--------------------------------------------------------------------------
        | RECONCILE SERVER MESSAGE
        |--------------------------------------------------------------------------
        */

        setMessagesByConversation(
          (previous) => {

            const existing =
              previous[
                conversationKey
              ] || [];


            /*
            |--------------------------------------------------------------------------
            | CASE 1:
            | MongoDB message already exists
            |--------------------------------------------------------------------------
            */

            if (serverMessageId) {

              const existingIndex =
                existing.findIndex(
                  (item) =>
                    normalizeId(
                      getMessageId(item)
                    ) === serverMessageId
                );


              if (existingIndex !== -1) {

                const updated = [
                  ...existing,
                ];

                updated[
                  existingIndex
                ] = {
                  ...updated[
                    existingIndex
                  ],

                  ...serverMessage,

                  status: "sent",
                };


                return {
                  ...previous,

                  [conversationKey]:
                    updated,
                };
              }
            }


            /*
            |--------------------------------------------------------------------------
            | CASE 2:
            | Match optimistic message using clientMessageId
            |--------------------------------------------------------------------------
            */

            if (serverClientMessageId) {

              const optimisticIndex =
                existing.findIndex(
                  (item) =>
                    getClientMessageId(item) ===
                    serverClientMessageId
                );


              if (optimisticIndex !== -1) {

                const updated = [
                  ...existing,
                ];

                updated[
                  optimisticIndex
                ] = {
                  ...serverMessage,

                  status: "sent",
                };


                return {
                  ...previous,

                  [conversationKey]:
                    updated.slice(-100),
                };
              }
            }


            /*
            |--------------------------------------------------------------------------
            | CASE 3:
            | No optimistic message found.
            |
            | Reconnect / page transition / race condition
            |--------------------------------------------------------------------------
            */

            const duplicate =
              existing.some(
                (item) => {

                  const itemId =
                    normalizeId(
                      getMessageId(item)
                    );

                  const itemClientId =
                    getClientMessageId(item);

                  return (
                    (
                      serverMessageId &&
                      itemId ===
                        serverMessageId
                    ) ||
                    (
                      serverClientMessageId &&
                      itemClientId ===
                        serverClientMessageId
                    )
                  );
                }
              );


            if (duplicate) {
              return previous;
            }


            return {
              ...previous,

              [conversationKey]: [
                ...existing,
                {
                  ...serverMessage,

                  status: "sent",
                },
              ].slice(-100),
            };
          }
        );


        bumpMessageVersion();


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | Sender ko unread nahi karna.
        |--------------------------------------------------------------------------
        */


        /*
        |--------------------------------------------------------------------------
        | BROWSER EVENT
        |--------------------------------------------------------------------------
        */

        try {

          window.dispatchEvent(
            new CustomEvent(
              "omni:message:sent",
              {
                detail: {
                  message:
                    serverMessage,

                  conversationId:
                    conversationKey,
                },
              }
            )
          );

        } catch (error) {

          console.warn(
            "GlobalMessageManager: message:sent browser event failed:",
            error
          );
        }
      },
      [
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE DELIVERED
  |--------------------------------------------------------------------------
  */

  const handleMessageDelivered =
    useCallback(
      (data) => {

        console.log(
          "📬 GLOBAL message:delivered RECEIVED:",
          data
        );


        const messageId =
          normalizeId(
            data?.messageId
          );

        if (!messageId) {

          console.warn(
            "GlobalMessageManager: message:delivered messageId missing:",
            data
          );

          return;
        }


        const conversationId =
          data?.conversationId ||
          null;


        let changed = false;


        setMessagesByConversation(
          (previous) => {

            const next = {
              ...previous,
            };


            const updateConversation =
              (conversationKey) => {

                const existing =
                  next[
                    conversationKey
                  ] || [];


                let conversationChanged =
                  false;


                const updated =
                  existing.map(
                    (message) => {

                      const currentId =
                        normalizeId(
                          getMessageId(
                            message
                          )
                        );


                      if (
                        currentId !==
                        messageId
                      ) {
                        return message;
                      }


                      conversationChanged =
                        true;

                      changed = true;


                      return {
                        ...message,

                        isDelivered:
                          true,

                        deliveredAt:
                          data?.deliveredAt ||
                          message?.deliveredAt ||
                          null,

                        status:
                          message?.status ===
                            "sending"
                            ? "sent"
                            : message?.status,
                      };
                    }
                  );


                if (
                  conversationChanged
                ) {

                  next[
                    conversationKey
                  ] = updated;
                }
              };


            if (conversationId) {

              updateConversation(
                String(
                  conversationId
                )
              );

              return next;
            }


            Object.keys(next).forEach(
              updateConversation
            );


            return next;
          }
        );


        if (changed) {
          bumpMessageVersion();
        }


        try {

          window.dispatchEvent(
            new CustomEvent(
              "omni:message:delivered",
              {
                detail: data,
              }
            )
          );

        } catch (error) {

          console.warn(
            "GlobalMessageManager: message:delivered browser event failed:",
            error
          );
        }
      },
      [
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE READ
  |--------------------------------------------------------------------------
  */

  const handleMessageRead =
    useCallback(
      (data) => {

        console.log(
          "👁️ GLOBAL message:read RECEIVED:",
          data
        );


        const conversationId =
          getConversationId(
            data,
            data?.message
          );

        if (!conversationId) {

          console.warn(
            "GlobalMessageManager: message:read conversationId missing:",
            data
          );

          return;
        }


        const conversationKey =
          String(conversationId);


        setMessagesByConversation(
          (previous) => {

            const existing =
              previous[
                conversationKey
              ] || [];


            if (
              existing.length === 0
            ) {
              return previous;
            }


            const updated =
              existing.map(
                (message) => {

                  const senderId =
                    normalizeId(
                      getSenderId(
                        message
                      )
                    );


                  /*
                  |--------------------------------------------------------------------------
                  | Only incoming messages
                  |--------------------------------------------------------------------------
                  */

                  if (
                    senderId &&
                    currentUserId &&
                    senderId ===
                      normalizeId(
                        currentUserId
                      )
                  ) {
                    return message;
                  }


                  return {
                    ...message,

                    isRead:
                      true,

                    isDelivered:
                      true,

                    deliveredAt:
                      message?.deliveredAt ||
                      null,
                  };
                }
              );


            return {
              ...previous,

              [conversationKey]:
                updated,
            };
          }
        );


        setUnreadByConversation(
          (previous) => {

            if (
              !Object.prototype.hasOwnProperty.call(
                previous,
                conversationKey
              )
            ) {
              return previous;
            }


            return {
              ...previous,

              [conversationKey]: 0,
            };
          }
        );


        bumpMessageVersion();


        try {

          window.dispatchEvent(
            new CustomEvent(
              "omni:message:read",
              {
                detail: {
                  ...data,

                  conversationId:
                    conversationKey,
                },
              }
            )
          );

        } catch (error) {

          console.warn(
            "GlobalMessageManager: message:read browser event failed:",
            error
          );
        }
      },
      [
        currentUserId,
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE UPDATED
  |--------------------------------------------------------------------------
  */

  const handleMessageUpdated =
    useCallback(
      (data) => {

        console.log(
          "✏️ GLOBAL message:updated RECEIVED:",
          data
        );


        const updatedMessage =
          extractMessage(data);

        if (!updatedMessage) {
          return;
        }


        const conversationId =
          getConversationId(
            data,
            updatedMessage
          );


        const messageId =
          normalizeId(
            getMessageId(
              updatedMessage
            )
          );


        if (
          !conversationId ||
          !messageId
        ) {
          return;
        }


        const conversationKey =
          String(conversationId);


        let changed = false;


        setMessagesByConversation(
          (previous) => {

            const existing =
              previous[
                conversationKey
              ] || [];


            const updated =
              existing.map(
                (message) => {

                  if (
                    normalizeId(
                      getMessageId(
                        message
                      )
                    ) !==
                    messageId
                  ) {
                    return message;
                  }


                  changed = true;


                  return {
                    ...message,

                    ...updatedMessage,

                    edited:
                      true,

                    status:
                      "sent",
                  };
                }
              );


            if (!changed) {
              return previous;
            }


            return {
              ...previous,

              [conversationKey]:
                updated,
            };
          }
        );


        if (changed) {
          bumpMessageVersion();
        }


        try {

          window.dispatchEvent(
            new CustomEvent(
              "omni:message:updated",
              {
                detail: {
                  message:
                    updatedMessage,

                  conversationId:
                    conversationKey,
                },
              }
            )
          );

        } catch (error) {

          console.warn(
            "GlobalMessageManager: message:updated browser event failed:",
            error
          );
        }
      },
      [
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE DELETED
  |--------------------------------------------------------------------------
  */

  const handleMessageDeleted =
    useCallback(
      (data) => {

        console.log(
          "🗑️ GLOBAL message:deleted RECEIVED:",
          data
        );


        const messageId =
          normalizeId(
            data?.messageId
          );

        if (!messageId) {
          return;
        }


        const conversationId =
          data?.conversationId ||
          null;


        let changed = false;


        setMessagesByConversation(
          (previous) => {

            const next = {
              ...previous,
            };


            const deleteFromConversation =
              (conversationKey) => {

                const existing =
                  next[
                    conversationKey
                  ] || [];


                const filtered =
                  existing.filter(
                    (message) =>
                      normalizeId(
                        getMessageId(
                          message
                        )
                      ) !==
                      messageId
                  );


                if (
                  filtered.length !==
                  existing.length
                ) {

                  changed = true;

                  next[
                    conversationKey
                  ] = filtered;
                }
              };


            if (conversationId) {

              deleteFromConversation(
                String(
                  conversationId
                )
              );

              return next;
            }


            Object.keys(next).forEach(
              deleteFromConversation
            );


            return next;
          }
        );


        if (changed) {
          bumpMessageVersion();
        }


        try {

          window.dispatchEvent(
            new CustomEvent(
              "omni:message:deleted",
              {
                detail: data,
              }
            )
          );

        } catch (error) {

          console.warn(
            "GlobalMessageManager: message:deleted browser event failed:",
            error
          );
        }
      },
      [
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE ERROR
  |--------------------------------------------------------------------------
  */

  const handleMessageError =
    useCallback(
      (data) => {

        console.error(
          "🔴 GLOBAL message:error RECEIVED:",
          data
        );


        const errorMessage =
          data?.message ||
          data?.error ||
          "Failed to send message.";


        const conversationId =
          data?.conversationId ||
          data?.data?.conversationId ||
          null;


        const clientMessageId =
          data?.clientMessageId ||
          data?.data?.clientMessageId ||
          null;


        let changed = false;


        setMessagesByConversation(
          (previous) => {

            const next = {
              ...previous,
            };


            const markConversation =
              (conversationKey) => {

                const existing =
                  next[
                    conversationKey
                  ] || [];


                let conversationChanged =
                  false;


                const updated =
                  existing.map(
                    (message) => {

                      if (
                        clientMessageId &&
                        getClientMessageId(
                          message
                        ) ===
                          clientMessageId
                      ) {

                        conversationChanged =
                          true;

                        changed = true;


                        return {
                          ...message,

                          status:
                            "failed",

                          error:
                            errorMessage,
                        };
                      }


                      return message;
                    }
                  );


                if (
                  !conversationChanged
                ) {
                  return;
                }


                next[
                  conversationKey
                ] = updated;
              };


            if (conversationId) {

              markConversation(
                String(
                  conversationId
                )
              );

              return next;
            }


            /*
            |--------------------------------------------------------------------------
            | IMPORTANT:
            | clientMessageId ho tabhi exact message search karo.
            |--------------------------------------------------------------------------
            */

            if (clientMessageId) {

              Object.keys(next).forEach(
                markConversation
              );
            }


            return next;
          }
        );


        if (changed) {
          bumpMessageVersion();
        }


        try {

          window.dispatchEvent(
            new CustomEvent(
              "omni:message:error",
              {
                detail: {
                  ...data,

                  error:
                    errorMessage,

                  conversationId,

                  clientMessageId,
                },
              }
            )
          );

        } catch (error) {

          console.warn(
            "GlobalMessageManager: message:error browser event failed:",
            error
          );
        }
      },
      [
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | ATTACH GLOBAL MESSAGE LISTENERS
  |--------------------------------------------------------------------------
  */

  const attachMessageListeners =
    useCallback(
      (socket) => {

        if (!socket) {

          console.warn(
            "GlobalMessageManager: Socket is not available."
          );

          return false;
        }


        /*
        |--------------------------------------------------------------------------
        | REMOVE OLD SOCKET LISTENERS
        |--------------------------------------------------------------------------
        */

        if (
          attachedSocketRef.current &&
          attachedSocketRef.current !== socket
        ) {

          const oldSocket =
            attachedSocketRef.current;


          oldSocket.off(
            "message:new",
            handleIncomingMessage
          );

          oldSocket.off(
            "message:sent",
            handleMessageSent
          );

          oldSocket.off(
            "message:delivered",
            handleMessageDelivered
          );

          oldSocket.off(
            "message:read",
            handleMessageRead
          );

          oldSocket.off(
            "message:updated",
            handleMessageUpdated
          );

          oldSocket.off(
            "message:deleted",
            handleMessageDeleted
          );

          oldSocket.off(
            "message:error",
            handleMessageError
          );
        }


        /*
        |--------------------------------------------------------------------------
        | REMOVE SAME CALLBACKS
        |--------------------------------------------------------------------------
        */

        socket.off(
          "message:new",
          handleIncomingMessage
        );

        socket.off(
          "message:sent",
          handleMessageSent
        );

        socket.off(
          "message:delivered",
          handleMessageDelivered
        );

        socket.off(
          "message:read",
          handleMessageRead
        );

        socket.off(
          "message:updated",
          handleMessageUpdated
        );

        socket.off(
          "message:deleted",
          handleMessageDeleted
        );

        socket.off(
          "message:error",
          handleMessageError
        );


        /*
        |--------------------------------------------------------------------------
        | ATTACH ALL MESSAGE EVENTS
        |--------------------------------------------------------------------------
        */

        socket.on(
          "message:new",
          handleIncomingMessage
        );

        socket.on(
          "message:sent",
          handleMessageSent
        );

        socket.on(
          "message:delivered",
          handleMessageDelivered
        );

        socket.on(
          "message:read",
          handleMessageRead
        );

        socket.on(
          "message:updated",
          handleMessageUpdated
        );

        socket.on(
          "message:deleted",
          handleMessageDeleted
        );

        socket.on(
          "message:error",
          handleMessageError
        );


        attachedSocketRef.current =
          socket;


        console.log(
          "✅ GlobalMessageManager: All message listeners attached:",
          {
            socketId:
              socket.id,

            connected:
              socket.connected,
          }
        );


        return true;
      },
      [
        handleIncomingMessage,
        handleMessageSent,
        handleMessageDelivered,
        handleMessageRead,
        handleMessageUpdated,
        handleMessageDeleted,
        handleMessageError,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | REMOVE GLOBAL MESSAGE LISTENERS
  |--------------------------------------------------------------------------
  */

  const removeMessageListeners =
    useCallback(
      (socket) => {

        if (!socket) {
          return;
        }


        socket.off(
          "message:new",
          handleIncomingMessage
        );

        socket.off(
          "message:sent",
          handleMessageSent
        );

        socket.off(
          "message:delivered",
          handleMessageDelivered
        );

        socket.off(
          "message:read",
          handleMessageRead
        );

        socket.off(
          "message:updated",
          handleMessageUpdated
        );

        socket.off(
          "message:deleted",
          handleMessageDeleted
        );

        socket.off(
          "message:error",
          handleMessageError
        );


        if (
          attachedSocketRef.current ===
          socket
        ) {

          attachedSocketRef.current =
            null;
        }


        console.log(
          "GlobalMessageManager: Message listeners removed."
        );
      },
      [
        handleIncomingMessage,
        handleMessageSent,
        handleMessageDelivered,
        handleMessageRead,
        handleMessageUpdated,
        handleMessageDeleted,
        handleMessageError,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | GLOBAL SOCKET CONNECTION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    /*
    |--------------------------------------------------------------------------
    | NOT AUTHENTICATED
    |--------------------------------------------------------------------------
    */

    if (
      !currentUserId ||
      !token
    ) {

      console.log(
        "GlobalMessageManager: Waiting for authentication..."
      );


      if (
        attachedSocketRef.current
      ) {

        removeMessageListeners(
          attachedSocketRef.current
        );
      }


      setLastMessage(null);

      setMessageVersion(0);

      setMessagesByConversation({});

      setUnreadByConversation({});


      return undefined;
    }


    /*
    |--------------------------------------------------------------------------
    | GET SOCKET
    |--------------------------------------------------------------------------
    */

    const socket =
      getSocketClient();


    if (!socket) {

      console.warn(
        "GlobalMessageManager: Socket client is not available yet."
      );

      return undefined;
    }


    /*
    |--------------------------------------------------------------------------
    | ATTACH MESSAGE LISTENERS
    |--------------------------------------------------------------------------
    */

    attachMessageListeners(
      socket
    );


    /*
    |--------------------------------------------------------------------------
    | SOCKET CONNECT
    |--------------------------------------------------------------------------
    */

    const handleSocketConnect =
      () => {

        console.log(
          "🟢 GlobalMessageManager: Socket CONNECTED:",
          socket.id
        );


        attachMessageListeners(
          socket
        );
      };


    /*
    |--------------------------------------------------------------------------
    | SOCKET DISCONNECT
    |--------------------------------------------------------------------------
    */

    const handleSocketDisconnect =
      (reason) => {

        console.warn(
          "🟠 GlobalMessageManager: Socket disconnected:",
          reason
        );

        /*
        |
        | Socket.connect() manually nahi karna.
        | SocketContext / Socket.IO reconnect handle karega.
        |
        */
      };


    /*
    |--------------------------------------------------------------------------
    | SOCKET CONNECT ERROR
    |--------------------------------------------------------------------------
    */

    const handleSocketConnectError =
      (error) => {

        console.error(
          "🔴 GlobalMessageManager: Socket connection error:",
          error?.message ||
            error
        );
      };


    /*
    |--------------------------------------------------------------------------
    | REGISTER SOCKET LIFECYCLE LISTENERS
    |--------------------------------------------------------------------------
    */

    socket.on(
      "connect",
      handleSocketConnect
    );

    socket.on(
      "disconnect",
      handleSocketDisconnect
    );

    socket.on(
      "connect_error",
      handleSocketConnectError
    );


    /*
    |--------------------------------------------------------------------------
    | DEBUG
    |--------------------------------------------------------------------------
    */

    console.log(
      "🌐 GlobalMessageManager socket status:",
      {
        socketId:
          socket.id,

        connected:
          socket.connected,

        providerConnected:
          connected,

        userId:
          currentUserId,
      }
    );


    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {

      socket.off(
        "connect",
        handleSocketConnect
      );

      socket.off(
        "disconnect",
        handleSocketDisconnect
      );

      socket.off(
        "connect_error",
        handleSocketConnectError
      );


      removeMessageListeners(
        socket
      );
    };

  }, [
    currentUserId,
    token,
    connected,
    attachMessageListeners,
    removeMessageListeners,
  ]);


  /*
  |--------------------------------------------------------------------------
  | GET CONVERSATION MESSAGES
  |--------------------------------------------------------------------------
  */

  const getConversationMessages =
    useCallback(
      (conversationId) => {

        if (!conversationId) {
          return [];
        }


        return (
          messagesByConversation[
            String(
              conversationId
            )
          ] || []
        );
      },
      [
        messagesByConversation,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | GET UNREAD COUNT
  |--------------------------------------------------------------------------
  */

  const getUnreadCount =
    useCallback(
      (conversationId) => {

        if (!conversationId) {
          return 0;
        }


        return Number(
          unreadByConversation[
            String(
              conversationId
            )
          ] || 0
        );
      },
      [
        unreadByConversation,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | TOTAL UNREAD COUNT
  |--------------------------------------------------------------------------
  */

  const totalUnreadCount =
    useMemo(() => {

      return Object.values(
        unreadByConversation
      ).reduce(
        (
          total,
          count
        ) =>
          total +
          Number(
            count || 0
          ),
        0
      );

    }, [
      unreadByConversation,
    ]);


  /*
  |--------------------------------------------------------------------------
  | MARK CONVERSATION AS READ LOCALLY
  |--------------------------------------------------------------------------
  */

  const markConversationAsRead =
    useCallback(
      (conversationId) => {

        if (!conversationId) {
          return;
        }


        const conversationKey =
          String(
            conversationId
          );


        setUnreadByConversation(
          (previous) => {

            if (
              !Object.prototype.hasOwnProperty.call(
                previous,
                conversationKey
              )
            ) {
              return previous;
            }


            return {
              ...previous,

              [conversationKey]:
                0,
            };
          }
        );


        setMessagesByConversation(
          (previous) => {

            const existing =
              previous[
                conversationKey
              ] || [];


            if (
              existing.length === 0
            ) {
              return previous;
            }


            const updated =
              existing.map(
                (message) => {

                  const senderId =
                    normalizeId(
                      getSenderId(
                        message
                      )
                    );


                  if (
                    currentUserId &&
                    senderId ===
                      normalizeId(
                        currentUserId
                      )
                  ) {
                    return message;
                  }


                  return {
                    ...message,

                    isRead:
                      true,

                    isDelivered:
                      true,
                  };
                }
              );


            return {
              ...previous,

              [conversationKey]:
                updated,
            };
          }
        );


        bumpMessageVersion();
      },
      [
        currentUserId,
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | CLEAR CONVERSATION MESSAGES
  |--------------------------------------------------------------------------
  */

  const clearConversationMessages =
    useCallback(
      (conversationId) => {

        if (!conversationId) {
          return;
        }


        const conversationKey =
          String(
            conversationId
          );


        setMessagesByConversation(
          (previous) => {

            if (
              !previous[
                conversationKey
              ]
            ) {
              return previous;
            }


            const next = {
              ...previous,
            };


            delete next[
              conversationKey
            ];


            return next;
          }
        );


        setUnreadByConversation(
          (previous) => {

            if (
              !Object.prototype.hasOwnProperty.call(
                previous,
                conversationKey
              )
            ) {
              return previous;
            }


            return {
              ...previous,

              [conversationKey]:
                0,
            };
          }
        );


        bumpMessageVersion();
      },
      [
        bumpMessageVersion,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value =
    useMemo(
      () => ({

        lastMessage,

        messageVersion,

        messagesByConversation,

        unreadByConversation,

        totalUnreadCount,

        getConversationMessages,

        getUnreadCount,

        markConversationAsRead,

        clearConversationMessages,
      }),
      [
        lastMessage,
        messageVersion,
        messagesByConversation,
        unreadByConversation,
        totalUnreadCount,
        getConversationMessages,
        getUnreadCount,
        markConversationAsRead,
        clearConversationMessages,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | PROVIDER
  |--------------------------------------------------------------------------
  */

  return (
    <GlobalMessageContext.Provider
      value={value}
    >
      {children}
    </GlobalMessageContext.Provider>
  );
}


/*
|--------------------------------------------------------------------------
| useGlobalMessages
|--------------------------------------------------------------------------
*/

export function useGlobalMessages() {

  const context =
    useContext(
      GlobalMessageContext
    );


  if (!context) {

    throw new Error(
      "useGlobalMessages must be used inside GlobalMessageProvider."
    );
  }


  return context;
}


/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default GlobalMessageProvider;