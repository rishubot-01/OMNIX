import { io } from "socket.io-client";

/*
|--------------------------------------------------------------------------
| OMNIX SOCKET.IO CONFIGURATION
|--------------------------------------------------------------------------
*/

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

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
| IMPORTANT:
| Ye sirf socket ke internal lifecycle listeners hain.
|
| Message listeners yahan register NAHI honge.
|
| Message events:
| message:new
| message:sent
| message:delivered
| message:read
| message:updated
| message:deleted
|
| Inko GlobalMessageManager handle karega.
|
|--------------------------------------------------------------------------
*/

const registerSocketListeners = () => {
  if (!socket) {
    return;
  }

  socket.off(
    "connect",
    handleConnect
  );

  socket.off(
    "connect_error",
    handleConnectError
  );

  socket.off(
    "disconnect",
    handleDisconnect
  );

  socket.on(
    "connect",
    handleConnect
  );

  socket.on(
    "connect_error",
    handleConnectError
  );

  socket.on(
    "disconnect",
    handleDisconnect
  );
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
    /*
    |--------------------------------------------------------------------------
    | UPDATE AUTH TOKEN
    |--------------------------------------------------------------------------
    */

    if (token) {
      socket.auth = {
        ...(socket.auth || {}),
        token,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | RESTORE INTERNAL LISTENERS
    |--------------------------------------------------------------------------
    */

    registerSocketListeners();

    /*
    |--------------------------------------------------------------------------
    | ALREADY CONNECTED
    |--------------------------------------------------------------------------
    */

    if (socket.connected) {
      connected = true;

      console.log(
        "Omnix Socket.IO: existing connected socket reused."
      );

      return socket;
    }

    /*
    |--------------------------------------------------------------------------
    | DISCONNECTED SOCKET
    |--------------------------------------------------------------------------
    */

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
    "Omnix Socket.IO: creating new socket..."
  );

  socket = io(
    SOCKET_URL,
    {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      auth: {
        token:
          token ||
          currentToken ||
          null,
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
      |--------------------------------------------------------------------------
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
    }
  );

  /*
  |--------------------------------------------------------------------------
  | REGISTER INTERNAL LISTENERS
  |--------------------------------------------------------------------------
  */

  registerSocketListeners();

  return socket;
};

/*
|--------------------------------------------------------------------------
| UPDATE SOCKET TOKEN
|--------------------------------------------------------------------------
*/

export const updateSocketToken = (
  token
) => {
  if (!token) {
    return false;
  }

  currentToken = token;

  /*
  |--------------------------------------------------------------------------
  | SOCKET NOT CREATED
  |--------------------------------------------------------------------------
  */

  if (!socket) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE SOCKET AUTH
  |--------------------------------------------------------------------------
  */

  socket.auth = {
    ...(socket.auth || {}),
    token,
  };

  /*
  |--------------------------------------------------------------------------
  | CONNECTED
  |--------------------------------------------------------------------------
  |
  | Existing connection ko destroy nahi karenge.
  |
  |--------------------------------------------------------------------------
  */

  if (socket.connected) {
    console.log(
      "Omnix Socket.IO authentication token updated."
    );

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | DISCONNECTED
  |--------------------------------------------------------------------------
  |
  | Next connection latest token ke saath hoga.
  |
  |--------------------------------------------------------------------------
  */

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
| IMPORTANT:
| Sirf logout / intentional shutdown par call karna hai.
|
|--------------------------------------------------------------------------
*/

export const disconnectSocket = () => {
  if (!socket) {
    return;
  }

  try {
    /*
    |--------------------------------------------------------------------------
    | DISABLE AUTOMATIC RECONNECTION
    |--------------------------------------------------------------------------
    |
    | Logout ke baad socket dobara automatically connect nahi hona chahiye.
    |
    |--------------------------------------------------------------------------
    */

    socket.io.opts.reconnection = false;

    /*
    |--------------------------------------------------------------------------
    | REMOVE ALL SOCKET LISTENERS
    |--------------------------------------------------------------------------
    */

    socket.removeAllListeners();

    /*
    |--------------------------------------------------------------------------
    | DISCONNECT
    |--------------------------------------------------------------------------
    */

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
|
| IMPORTANT:
| GlobalMessageManager isi function ke through message events
| subscribe karega.
|
|--------------------------------------------------------------------------
*/

export const subscribeTo = (
  event,
  callback
) => {
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

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  |
  | Same callback ko duplicate register hone se rokna.
  |
  |--------------------------------------------------------------------------
  */

  socket.off(
    event,
    callback
  );

  socket.on(
    event,
    callback
  );

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

export const unsubscribeFrom = (
  subscription
) => {
  if (
    !subscription ||
    !socket
  ) {
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
    socket.off(
      event,
      callback
    );
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
|
| Generic WebSocket sender.
|
| Example:
|
| sendSocketMessage("message:send", {
|   conversationId,
|   clientMessageId,
|   content,
|   messageType: "TEXT"
| });
|
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
    socket.emit(
      event,
      body
    );

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

export const joinConversation = (
  conversationId
) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "conversation:join",
    {
      conversationId:
        String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| LEAVE CONVERSATION
|--------------------------------------------------------------------------
*/

export const leaveConversation = (
  conversationId
) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "conversation:leave",
    {
      conversationId:
        String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| SEND MESSAGE
|--------------------------------------------------------------------------
|
| Main WhatsApp-style message sender.
|
| REST sendMessage use nahi karna.
|
|--------------------------------------------------------------------------
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
      conversationId:
        String(conversationId),

      clientMessageId:
        String(clientMessageId),

      content:
        typeof content === "string"
          ? content
          : "",

      messageType,

      mediaUrl:
        mediaUrl || null,

      mediaPublicId:
        mediaPublicId || null,

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
|
| Receiver ko message:new milne ke baad call karna hai.
|
|--------------------------------------------------------------------------
*/

export const markMessageDelivered = (
  messageId
) => {
  if (!messageId) {
    return false;
  }

  return sendSocketMessage(
    "message:delivered",
    {
      messageId:
        String(messageId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| MARK CONVERSATION AS READ
|--------------------------------------------------------------------------
|
| Chat open hone par call karna hai.
|
|--------------------------------------------------------------------------
*/

export const markConversationRead = (
  conversationId
) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "message:read",
    {
      conversationId:
        String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| START TYPING
|--------------------------------------------------------------------------
*/

export const startTyping = (
  conversationId
) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "typing:start",
    {
      conversationId:
        String(conversationId),
    }
  );
};

/*
|--------------------------------------------------------------------------
| STOP TYPING
|--------------------------------------------------------------------------
*/

export const stopTyping = (
  conversationId
) => {
  if (!conversationId) {
    return false;
  }

  return sendSocketMessage(
    "typing:stop",
    {
      conversationId:
        String(conversationId),
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
      messageId:
        String(messageId),

      content:
        String(content).trim(),
    }
  );
};

/*
|--------------------------------------------------------------------------
| DELETE MESSAGE
|--------------------------------------------------------------------------
*/

export const deleteMessage = (
  messageId
) => {
  if (!messageId) {
    return false;
  }

  return sendSocketMessage(
    "message:deleted",
    {
      messageId:
        String(messageId),
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