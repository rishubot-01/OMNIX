import {
  sendSocketMessage,
  joinConversation,
  leaveConversation,
} from "./socket";

/*
|--------------------------------------------------------------------------
| Omnix Socket.IO Events
|--------------------------------------------------------------------------
|
| Frontend se Backend ko bheje jaane wale
| real-time Socket.IO events.
|
| IMPORTANT:
| Ye Socket.IO events backend ke
| socket.events.ts ke names ke according hain.
|
*/


/*
|--------------------------------------------------------------------------
| CONVERSATION EVENTS
|--------------------------------------------------------------------------
*/

/**
 * Join conversation room
 */
export const joinConversationEvent = (
  conversationId
) => {
  if (!conversationId) {
    return false;
  }

  return joinConversation(
    conversationId
  );
};


/**
 * Leave conversation room
 */
export const leaveConversationEvent = (
  conversationId
) => {
  if (!conversationId) {
    return false;
  }

  return leaveConversation(
    conversationId
  );
};


/*
|--------------------------------------------------------------------------
| MESSAGE EVENTS
|--------------------------------------------------------------------------
*/

/**
 * Send a text message
 */
export const sendMessageEvent = ({
  conversationId,
  content,
}) => {
  if (
    !conversationId ||
    !content?.trim()
  ) {
    return false;
  }

  return sendSocketMessage(
    "message:send",
    {
      conversationId:
        String(conversationId),

      content:
        content.trim(),

      messageType: "TEXT",
    }
  );
};


/**
 * Send image message
 */
export const sendImageMessageEvent = ({
  conversationId,
  fileUrl,
}) => {
  if (
    !conversationId ||
    !fileUrl
  ) {
    return false;
  }

  return sendSocketMessage(
    "message:send",
    {
      conversationId:
        String(conversationId),

      content: fileUrl,

      messageType: "IMAGE",
    }
  );
};


/**
 * Send file message
 */
export const sendFileMessageEvent = ({
  conversationId,
  fileUrl,
  fileName,
}) => {
  if (
    !conversationId ||
    !fileUrl
  ) {
    return false;
  }

  return sendSocketMessage(
    "message:send",
    {
      conversationId:
        String(conversationId),

      content: fileUrl,

      messageType: "FILE",

      fileName:
        fileName || null,
    }
  );
};


/*
|--------------------------------------------------------------------------
| TYPING EVENTS
|--------------------------------------------------------------------------
*/

/**
 * User started typing
 */
export const sendTypingStartEvent = (
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


/**
 * User stopped typing
 */
export const sendTypingStopEvent = (
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
| MESSAGE READ / SEEN
|--------------------------------------------------------------------------
*/

/**
 * Mark message as read
 */
export const sendMessageReadEvent = ({
  conversationId,
  messageId,
}) => {
  if (
    !conversationId ||
    !messageId
  ) {
    return false;
  }

  return sendSocketMessage(
    "message:read",
    {
      conversationId:
        String(conversationId),

      messageId:
        String(messageId),
    }
  );
};


/**
 * Mark complete conversation as read
 */
export const sendConversationReadEvent = (
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
| MESSAGE DELIVERY
|--------------------------------------------------------------------------
*/

/**
 * Message delivered
 */
export const sendMessageDeliveredEvent = ({
  conversationId,
  messageId,
}) => {
  if (
    !conversationId ||
    !messageId
  ) {
    return false;
  }

  return sendSocketMessage(
    "message:delivered",
    {
      conversationId:
        String(conversationId),

      messageId:
        String(messageId),
    }
  );
};


/*
|--------------------------------------------------------------------------
| USER ONLINE / OFFLINE
|--------------------------------------------------------------------------
*/

/**
 * User comes online
 */
export const sendOnlineEvent = () => {
  return sendSocketMessage(
    "user:online",
    {}
  );
};


/**
 * User goes offline
 */
export const sendOfflineEvent = () => {
  return sendSocketMessage(
    "user:offline",
    {}
  );
};


/*
|--------------------------------------------------------------------------
| MESSAGE EDIT
|--------------------------------------------------------------------------
*/

/**
 * Edit message
 */
export const sendMessageEditEvent = ({
  messageId,
  conversationId,
  content,
}) => {
  if (
    !messageId ||
    !conversationId ||
    !content?.trim()
  ) {
    return false;
  }

  return sendSocketMessage(
    "message:updated",
    {
      messageId:
        String(messageId),

      conversationId:
        String(conversationId),

      content:
        content.trim(),
    }
  );
};


/*
|--------------------------------------------------------------------------
| MESSAGE DELETE
|--------------------------------------------------------------------------
*/

/**
 * Delete message
 */
export const sendMessageDeleteEvent = ({
  messageId,
  conversationId,
}) => {
  if (
    !messageId ||
    !conversationId
  ) {
    return false;
  }

  return sendSocketMessage(
    "message:deleted",
    {
      messageId:
        String(messageId),

      conversationId:
        String(conversationId),
    }
  );
};


/*
|--------------------------------------------------------------------------
| CALL EVENTS
|--------------------------------------------------------------------------
|
| Supports:
| - 1-to-1 audio calls
| - 1-to-1 video calls
| - Group audio calls
| - Group video calls
| - WebRTC offer / answer
| - ICE candidates
| - Call invite / join / leave
|
*/


/**
 * Create a new call
 *
 * callId:
 * Unique ID of this call/session.
 *
 * callType:
 * "audio" | "video"
 *
 * participants:
 * Array of user IDs
 */
export const createCallEvent = ({
  callId,
  callType = "audio",
  participants = [],
}) => {

  /*
   * Backend ko har call ke liye
   * unique callId required hai.
   */
  if (!callId) {
    return false;
  }


  /*
   * Call type validation.
   */
  if (
    !["audio", "video"].includes(
      callType
    )
  ) {
    return false;
  }


  /*
   * At least one participant required.
   */
  if (
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    return false;
  }


  /*
   * Send call:create event.
   */
  return sendSocketMessage(
    "call:create",
    {
      callId:
        String(callId),

      callType,

      participants:
        participants.map(
          (id) => String(id)
        ),
    }
  );
};


/**
 * Invite another user into an existing call
 *
 * Useful for group calls.
 */
export const inviteToCallEvent = ({
  callId,
  userId,
}) => {
  if (
    !callId ||
    !userId
  ) {
    return false;
  }

  return sendSocketMessage(
    "call:invite",
    {
      callId:
        String(callId),

      userId:
        String(userId),
    }
  );
};


/**
 * Join an existing call
 */
export const joinCallEvent = ({
  callId,
}) => {
  if (!callId) {
    return false;
  }

  return sendSocketMessage(
    "call:join",
    {
      callId:
        String(callId),
    }
  );
};


/**
 * Accept incoming call
 */
export const acceptCallEvent = ({
  callId,
}) => {
  if (!callId) {
    return false;
  }

  return sendSocketMessage(
    "call:accept",
    {
      callId:
        String(callId),
    }
  );
};


/**
 * Reject incoming call
 */
export const rejectCallEvent = ({
  callId,
}) => {
  if (!callId) {
    return false;
  }

  return sendSocketMessage(
    "call:reject",
    {
      callId:
        String(callId),
    }
  );
};


/**
 * Leave current call
 *
 * For group calls this removes only
 * the current user from the call.
 */
export const leaveCallEvent = ({
  callId,
}) => {
  if (!callId) {
    return false;
  }

  return sendSocketMessage(
    "call:leave",
    {
      callId:
        String(callId),
    }
  );
};


/**
 * End complete call
 *
 * Caller/host can use this to end
 * the call for everyone.
 */
export const endCallEvent = ({
  callId,
}) => {
  if (!callId) {
    return false;
  }

  return sendSocketMessage(
    "call:end",
    {
      callId:
        String(callId),
    }
  );
};


/**
 * WebRTC Offer
 *
 * targetUserId = jis user ko offer bhejna hai
 */
export const sendCallOfferEvent = ({
  callId,
  targetUserId,
  offer,
}) => {
  if (
    !callId ||
    !targetUserId ||
    !offer
  ) {
    return false;
  }

  return sendSocketMessage(
    "call:offer",
    {
      callId:
        String(callId),

      targetUserId:
        String(targetUserId),

      offer,
    }
  );
};


/**
 * WebRTC Answer
 *
 * targetUserId = jis peer ko answer bhejna hai
 */
export const sendCallAnswerEvent = ({
  callId,
  targetUserId,
  answer,
}) => {
  if (
    !callId ||
    !targetUserId ||
    !answer
  ) {
    return false;
  }

  return sendSocketMessage(
    "call:answer",
    {
      callId:
        String(callId),

      targetUserId:
        String(targetUserId),

      answer,
    }
  );
};


/**
 * WebRTC ICE Candidate
 *
 * WebRTC connection establish karne
 * ke liye candidate exchange.
 */
export const sendCallIceCandidateEvent = ({
  callId,
  targetUserId,
  candidate,
}) => {
  if (
    !callId ||
    !targetUserId ||
    !candidate
  ) {
    return false;
  }

  return sendSocketMessage(
    "call:ice-candidate",
    {
      callId:
        String(callId),

      targetUserId:
        String(targetUserId),

      candidate,
    }
  );
};


/**
 * Mark user as busy
 */
export const sendCallBusyEvent = ({
  callId,
}) => {
  if (!callId) {
    return false;
  }

  return sendSocketMessage(
    "call:busy",
    {
      callId:
        String(callId),
    }
  );
};


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default {

  /*
   * Conversation
   */
  joinConversationEvent,
  leaveConversationEvent,


  /*
   * Messages
   */
  sendMessageEvent,
  sendImageMessageEvent,
  sendFileMessageEvent,


  /*
   * Typing
   */
  sendTypingStartEvent,
  sendTypingStopEvent,


  /*
   * Read / Delivered
   */
  sendMessageReadEvent,
  sendConversationReadEvent,
  sendMessageDeliveredEvent,


  /*
   * Online / Offline
   */
  sendOnlineEvent,
  sendOfflineEvent,


  /*
   * Edit / Delete
   */
  sendMessageEditEvent,
  sendMessageDeleteEvent,


  /*
   * Calls
   */
  createCallEvent,
  inviteToCallEvent,
  joinCallEvent,
  acceptCallEvent,
  rejectCallEvent,
  leaveCallEvent,
  endCallEvent,
  sendCallOfferEvent,
  sendCallAnswerEvent,
  sendCallIceCandidateEvent,
  sendCallBusyEvent,
};