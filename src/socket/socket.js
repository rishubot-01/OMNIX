
import { io } from "socket.io-client";

/*
|--------------------------------------------------------------------------
| OMNIX SOCKET.IO CONFIGURATION
|--------------------------------------------------------------------------
*/

// Production: Render backend
// Development: Local backend
const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD
    ? "https://omnix-bd.onrender.com"
    : "http://localhost:5000")
).replace(/\/+$/, "");

/*
|--------------------------------------------------------------------------
| SOCKET INSTANCE
|--------------------------------------------------------------------------
*/

let socket = null;

/*
|--------------------------------------------------------------------------
| CONNECTION STATE
|--------------------------------------------------------------------------
*/

let connected = false;

/*
|--------------------------------------------------------------------------
| CURRENT AUTHENTICATION TOKEN
|--------------------------------------------------------------------------
*/

let currentToken = null;

/*
|--------------------------------------------------------------------------
| CALLBACK HANDLERS
|--------------------------------------------------------------------------
*/

let onConnectCallback = null;
let onErrorCallback = null;
let onDisconnectCallback = null;

/*
|--------------------------------------------------------------------------
| INTERNAL SOCKET EVENT HANDLERS
|--------------------------------------------------------------------------
*/

const handleConnect = () => {
  connected = true;

  console.log(
    "Omnix Socket.IO connected:",
    socket?.id
  );

  if (onConnectCallback) {
    try {
      onConnectCallback(socket);
    } catch (error) {
      console.error(
        "Omnix Socket onConnect callback error:",
        error
      );
    }
  }
};

const handleConnectError = (error) => {
  connected = false;

  console.error(
    "Omnix Socket.IO connection error:",
    error?.message || error
  );

  if (onErrorCallback) {
    try {
      onErrorCallback(error);
    } catch (callbackError) {
      console.error(
        "Omnix Socket onError callback error:",
        callbackError
      );
    }
  }
};

const handleDisconnect = (reason) => {
  connected = false;

  console.log(
    "Omnix Socket.IO disconnected:",
    reason
  );

  if (onDisconnectCallback) {
    try {
      onDisconnectCallback(reason);
    } catch (callbackError) {
      console.error(
        "Omnix Socket onDisconnect callback error:",
        callbackError
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| REGISTER INTERNAL SOCKET LISTENERS
|--------------------------------------------------------------------------
|
| Message listeners are handled by GlobalMessageManager.
|
*/

const registerSocketListeners = () => {
  if (!socket) {
    return;
  }

  socket.off("connect", handleConnect);
  socket.off("connect_error", handleConnectError);
  socket.off("disconnect", handleDisconnect);

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);
  socket.on("disconnect", handleDisconnect);
};

/*
|--------------------------------------------------------------------------
| CONNECT SOCKET
|--------------------------------------------------------------------------
*/

export const connectSocket = ({
  token = null,
  onConnect,
  onError,
  onDisconnect,
} = {}) => {
  /*
  |--------------------------------------------------------------------------
  | STORE TOKEN
  |--------------------------------------------------------------------------
  */

  if (token) {
    currentToken = token;
  }

  /*
  |--------------------------------------------------------------------------
  | STORE CALLBACKS
  |--------------------------------------------------------------------------
  */

  if (typeof onConnect === "function") {
    onConnectCallback = onConnect;
  }

  if (typeof onError === "function") {
    onErrorCallback = onError;
  }

  if (typeof onDisconnect === "function") {
    onDisconnectCallback = onDisconnect;
  }

  /*
  |--------------------------------------------------------------------------
  | EXISTING SOCKET
  |--------------------------------------------------------------------------
  */

  if (socket) {
    if (token) {
      socket.auth = {
        ...(socket.auth || {}),
        token,
      };
    }

    registerSocketListeners();

    if (socket.connected) {
      connected = true;

      console.log(
        "Omnix Socket.IO: existing connected socket reused."
      );

      return socket;
    }

    if (socket.disconnected) {
      console.log(
        "Omnix Socket.IO: reconnecting existing socket..."
      );

      socket.connect();
    }

    return socket;
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE NEW SOCKET
  |--------------------------------------------------------------------------
  */

  console.log(
    "Omnix Socket.IO: connecting to:",
    SOCKET_URL
  );

  socket = io(SOCKET_URL, {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    auth: {
      token: token || currentToken || null,
    },

    /*
    |--------------------------------------------------------------------------
    | CREDENTIALS
    |--------------------------------------------------------------------------
    */

    withCredentials: true,

    /*
    |--------------------------------------------------------------------------
    | TRANSPORT
    |--------------------------------------------------------------------------
    |
    | WebSocket preferred.
    | Polling fallback available.
    |
    */

    transports: [
      "websocket",
      "polling",
    ],

    /*
    |--------------------------------------------------------------------------
    | RECONNECTION
    |--------------------------------------------------------------------------
    */

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,

    /*
    |--------------------------------------------------------------------------
    | AUTO CONNECT
    |--------------------------------------------------------------------------
    */

    autoConnect: true,
  });

  registerSocketListeners();

  return socket;
};

/*
|--------------------------------------------------------------------------
| UPDATE SOCKET TOKEN
|--------------------------------------------------------------------------
*/

export const updateSocketToken = (token) => {
  if (!token) {
    return false;
  }

  currentToken = token;

  if (!socket) {
    return false;
  }

  socket.auth = {
    ...(socket.auth || {}),
    token,
  };

  if (socket.connected) {
    console.log(
      "Omnix Socket.IO authentication token updated."
    );

    return true;
  }

  if (socket.disconnected) {
    console.log(
      "Omnix Socket.IO reconnecting with updated token..."
    );

    socket.connect();
  }

  return true;
};

/*
|--------------------------------------------------------------------------
| DISCONNECT SOCKET
|--------------------------------------------------------------------------
|
| Call on logout or intentional shutdown.
|
*/

export const disconnectSocket = () => {
  if (!socket) {
    return;
  }

  try {
    socket.io.opts.reconnection = false;
    socket.removeAllListeners();
    socket.disconnect();
  } catch (error) {
    console.error(
      "Failed to disconnect Socket.IO:",
      error
    );
  } finally {
    socket = null;
    connected = false;
    currentToken = null;

    onConnectCallback = null;
    onErrorCallback = null;
    onDisconnectCallback = null;
  }
};

/*
|--------------------------------------------------------------------------
| CHECK SOCKET CONNECTION
|--------------------------------------------------------------------------
*/

export const isSocketConnected = () => {
  return Boolean(
    connected &&
    socket?.connected
  );
};

/*
|--------------------------------------------------------------------------
| GET SOCKET INSTANCE
|--------------------------------------------------------------------------
*/

export const getSocketClient = () => {
  return socket;
};

/*
|--------------------------------------------------------------------------
| SUBSCRIBE TO SOCKET EVENT
|--------------------------------------------------------------------------
*/

export const subscribeTo = (event, callback) => {
  if (!socket) {
    console.warn(
      "Socket instance is not available."
    );

    return null;
  }

  if (!event) {
    console.warn(
      "Socket event is required."
    );

    return null;
  }

  if (typeof callback !== "function") {
    console.warn(
      "Socket callback must be a function."
    );

    return null;
  }

  // Prevent duplicate registration of the same callback.
  socket.off(event, callback);
  socket.on(event, callback);

  return {
    event,
    callback,
  };
};

/*
|--------------------------------------------------------------------------
| UNSUBSCRIBE FROM SOCKET EVENT
|--------------------------------------------------------------------------
*/

export const unsubscribeFrom = (subscription) => {
  if (!subscription || !socket) {
    return;
  }

  const {
    event,
    callback,
  } = subscription;

  if (
    !event ||
    typeof callback !== "function"
  ) {
    return;
  }

  try {
    socket.off(event, callback);
  } catch (error) {
    console.error(
      "Failed to unsubscribe:",
      error
    );
  }
};

/*
|--------------------------------------------------------------------------
| SEND SOCKET EVENT
|--------------------------------------------------------------------------
*/

export const sendSocketMessage = (
  event,
  body = {}
) => {
  if (!socket) {
    console.warn(
      "Cannot send socket event. Socket instance is not available."
    );

    return false;
  }

  if (!socket.connected) {
    console.warn(
      "Cannot send socket event. Socket is not connected."
    );

    return false;
  }

  if (!event) {
    console.warn(
      "Socket event is required."
    );

    return false;
  }

  try {
    socket.emit(event, body);
    return true;
  } catch (error) {
    console.error(
      "Failed to send socket event:",
      error
    );

    return false;
  }
};

/*
|--------------------------------------------------------------------------
| JOIN CONVERSATION
|--------------------------------------------------------------------------
*/

export const joinConversation = (conversationId) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "conversation:join",
    {
      conversationId: String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| LEAVE CONVERSATION
|--------------------------------------------------------------------------
*/

export const leaveConversation = (conversationId) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "conversation:leave",
    {
      conversationId: String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| SEND MESSAGE
|--------------------------------------------------------------------------
|
| Main socket-based message sender.
|
*/

export const sendMessage = ({
  conversationId,
  clientMessageId,
  content = "",
  messageType = "TEXT",
  mediaUrl = null,
  mediaPublicId = null,
  replyToMessageId = null,
}) => {
  if (!conversationId) {
    console.warn(
      "conversationId is required."
    );

    return false;
  }

  if (!clientMessageId) {
    console.warn(
      "clientMessageId is required."
    );

    return false;
  }

  return sendSocketMessage(
    "message:send",
    {
      conversationId: String(conversationId),

      clientMessageId: String(clientMessageId),

      content:
        typeof content === "string"
          ? content
          : "",

      messageType,

      mediaUrl: mediaUrl || null,

      mediaPublicId: mediaPublicId || null,

      replyToMessageId:
        replyToMessageId
          ? String(replyToMessageId)
          : null,
    }
  );
};

/*
|--------------------------------------------------------------------------
| MARK MESSAGE AS DELIVERED
|--------------------------------------------------------------------------
*/

export const markMessageDelivered = (messageId) => {
  if (!messageId) {
    return false;
  }

  return sendSocketMessage(
    "message:delivered",
    {
      messageId: String(messageId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| MARK CONVERSATION AS READ
|--------------------------------------------------------------------------
*/

export const markConversationRead = (conversationId) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "message:read",
    {
      conversationId: String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| START TYPING
|--------------------------------------------------------------------------
*/

export const startTyping = (conversationId) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "typing:start",
    {
      conversationId: String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| STOP TYPING
|--------------------------------------------------------------------------
*/

export const stopTyping = (conversationId) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "typing:stop",
    {
      conversationId: String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| UPDATE MESSAGE
|--------------------------------------------------------------------------
*/

export const updateMessage = ({
  messageId,
  content,
}) => {
  if (!messageId || !content) {
    return false;
  }

  return sendSocketMessage(
    "message:updated",
    {
      messageId: String(messageId),
      content: String(content).trim(),
    }
  );
};

/*
|--------------------------------------------------------------------------
| DELETE MESSAGE
|--------------------------------------------------------------------------
*/

export const deleteMessage = (messageId) => {
  if (!messageId) {
    return false;
  }

  return sendSocketMessage(
    "message:deleted",
    {
      messageId: String(messageId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default {
  connectSocket,
  disconnectSocket,
  updateSocketToken,
  isSocketConnected,
  getSocketClient,
  subscribeTo,
  unsubscribeFrom,
  sendSocketMessage,
  joinConversation,
  leaveConversation,
  sendMessage,
  markMessageDelivered,
  markConversationRead,
  startTyping,
  stopTyping,
  updateMessage,
  deleteMessage,
};