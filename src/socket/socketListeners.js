import {
  subscribeTo,
  unsubscribeFrom,
} from "./socket";

/*
|--------------------------------------------------------------------------
| OMNIX SOCKET.IO LISTENERS
|--------------------------------------------------------------------------
|
| IMPORTANT ARCHITECTURE
|
| socket.js
|     ↓
| Socket.IO connection
|     ↓
| socketListeners.js
|     ↓
| GlobalMessageManager
|     ↓
| MessageContext
|     ↓
| useMessages / UI
|
| IMPORTANT:
|
| Message events ko yahan conversation-level par unnecessarily
| subscribe nahi karna hai.
|
| GlobalMessageManager ek hi baar:
|
| message:new
| message:sent
| message:delivered
| message:read
| message:updated
| message:deleted
| message:error
|
| listen karega.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
|
| Kisi socket event ke data se conversation ID safely nikalne ke liye.
|
|--------------------------------------------------------------------------
*/

const getConversationId = (data) => {
  return (
    data?.conversationId ||
    data?.conversation?._id ||
    data?.conversation?.id ||
    null
  );
};


/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
|
| Kisi event ke data se message ID safely nikalne ke liye.
|
|--------------------------------------------------------------------------
*/

const getMessageId = (data) => {
  return (
    data?.messageId ||
    data?._id ||
    data?.id ||
    data?.message?._id ||
    data?.message?.id ||
    null
  );
};


/*
|--------------------------------------------------------------------------
| CONVERSATION EVENTS
|--------------------------------------------------------------------------
*/


/**
 * Listen for conversation created
 *
 * Backend:
 * conversation:created
 */
export const listenToConversationCreated = (
  onCreated
) => {
  return subscribeTo(
    "conversation:created",
    (data) => {
      onCreated?.(data);
    }
  );
};


/**
 * Listen for conversation updated
 *
 * Backend:
 * conversation:updated
 */
export const listenToConversationUpdated = (
  onUpdated
) => {
  return subscribeTo(
    "conversation:updated",
    (data) => {
      onUpdated?.(data);
    }
  );
};


/**
 * Listen for conversation updates
 *
 * Useful for:
 * - last message
 * - unread count
 * - conversation ordering
 * - latest activity
 */
export const listenToConversationUpdates = (
  onUpdate
) => {
  return subscribeTo(
    "conversation:updated",
    (data) => {
      onUpdate?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| MESSAGE EVENTS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Ye listeners GLOBAL hain.
|
| Conversation ID filter yahan nahi lagaya gaya.
|
| GlobalMessageManager incoming message ko conversationId ke
| according appropriate conversation state mein dalega.
|
|--------------------------------------------------------------------------
*/


/**
 * Listen for NEW MESSAGE
 *
 * Backend:
 * message:new
 *
 * Receiver ko real-time message milta hai.
 *
 * IMPORTANT:
 * Is listener ko ek hi global manager register karega.
 */
export const listenToMessages = (
  onMessage
) => {
  return subscribeTo(
    "message:new",
    (data) => {
      onMessage?.(data);
    }
  );
};


/**
 * Listen for MESSAGE SENT
 *
 * Backend:
 * message:sent
 *
 * Sender ko server/database confirmation milta hai.
 *
 * Is event ka use optimistic message ko
 * clientMessageId ke through reconcile karne ke liye hoga.
 */
export const listenToMessageSent = (
  onSent
) => {
  return subscribeTo(
    "message:sent",
    (data) => {
      onSent?.(data);
    }
  );
};


/**
 * Listen for MESSAGE DELIVERED
 *
 * Backend:
 * message:delivered
 *
 * Receiver message receive karne ke baad backend ko
 * message:delivered bhejega.
 *
 * Backend sender ko delivery confirmation bhejega.
 */
export const listenToMessageDelivered = (
  onDelivered
) => {
  return subscribeTo(
    "message:delivered",
    (data) => {
      onDelivered?.(data);
    }
  );
};


/**
 * Listen for MESSAGE READ
 *
 * Backend:
 * message:read
 *
 * Conversation ke messages read/seen hone par event.
 */
export const listenToMessageRead = (
  onRead
) => {
  return subscribeTo(
    "message:read",
    (data) => {
      onRead?.(data);
    }
  );
};


/**
 * Listen for MESSAGE UPDATED
 *
 * Backend:
 * message:updated
 */
export const listenToMessageEdit = (
  onMessageEdit
) => {
  return subscribeTo(
    "message:updated",
    (data) => {
      onMessageEdit?.(data);
    }
  );
};


/**
 * Listen for MESSAGE DELETED
 *
 * Backend:
 * message:deleted
 */
export const listenToMessageDelete = (
  onMessageDelete
) => {
  return subscribeTo(
    "message:deleted",
    (data) => {
      onMessageDelete?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| MESSAGE ERROR
|--------------------------------------------------------------------------
|
| Backend:
| message:error
|
| Ye global listener hai.
|
|--------------------------------------------------------------------------
*/

export const listenToMessageError = (
  onError
) => {
  return subscribeTo(
    "message:error",
    (data) => {
      onError?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| MESSAGE EVENT GROUP
|--------------------------------------------------------------------------
|
| GlobalMessageManager ke liye convenient helper.
|
| Ye ek hi call mein saare message listeners register karta hai.
|
|--------------------------------------------------------------------------
*/

export const listenToAllMessageEvents = ({
  onMessage,
  onSent,
  onDelivered,
  onRead,
  onUpdated,
  onDeleted,
  onError,
} = {}) => {
  const subscriptions = [];

  /*
  |--------------------------------------------------------------------------
  | NEW MESSAGE
  |--------------------------------------------------------------------------
  */

  if (typeof onMessage === "function") {
    const subscription =
      listenToMessages(
        onMessage
      );

    if (subscription) {
      subscriptions.push(
        subscription
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MESSAGE SENT
  |--------------------------------------------------------------------------
  */

  if (typeof onSent === "function") {
    const subscription =
      listenToMessageSent(
        onSent
      );

    if (subscription) {
      subscriptions.push(
        subscription
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MESSAGE DELIVERED
  |--------------------------------------------------------------------------
  */

  if (typeof onDelivered === "function") {
    const subscription =
      listenToMessageDelivered(
        onDelivered
      );

    if (subscription) {
      subscriptions.push(
        subscription
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MESSAGE READ
  |--------------------------------------------------------------------------
  */

  if (typeof onRead === "function") {
    const subscription =
      listenToMessageRead(
        onRead
      );

    if (subscription) {
      subscriptions.push(
        subscription
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MESSAGE UPDATED
  |--------------------------------------------------------------------------
  */

  if (typeof onUpdated === "function") {
    const subscription =
      listenToMessageEdit(
        onUpdated
      );

    if (subscription) {
      subscriptions.push(
        subscription
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MESSAGE DELETED
  |--------------------------------------------------------------------------
  */

  if (typeof onDeleted === "function") {
    const subscription =
      listenToMessageDelete(
        onDeleted
      );

    if (subscription) {
      subscriptions.push(
        subscription
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MESSAGE ERROR
  |--------------------------------------------------------------------------
  */

  if (typeof onError === "function") {
    const subscription =
      listenToMessageError(
        onError
      );

    if (subscription) {
      subscriptions.push(
        subscription
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RETURN CLEANUP
  |--------------------------------------------------------------------------
  */

  return subscriptions;
};


/*
|--------------------------------------------------------------------------
| MESSAGE EVENT DEBUG HELPERS
|--------------------------------------------------------------------------
|
| Ye functions optional hain, lekin future debugging ke liye useful hain.
|
|--------------------------------------------------------------------------
*/


/**
 * Get conversation ID from message event.
 */
export const extractConversationId = (
  data
) => {
  return getConversationId(
    data
  );
};


/**
 * Get message ID from message event.
 */
export const extractMessageId = (
  data
) => {
  return getMessageId(
    data
  );
};


/*
|--------------------------------------------------------------------------
| NOTIFICATION EVENTS
|--------------------------------------------------------------------------
*/


/**
 * Listen for new notification
 *
 * Backend:
 * notification:new
 *
 * Message notification bhi isi event se aa sakti hai.
 */
export const listenToNotifications = (
  onNotification
) => {
  return subscribeTo(
    "notification:new",
    (data) => {
      console.log(
        "New notification received:",
        data
      );

      onNotification?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| TYPING EVENTS
|--------------------------------------------------------------------------
|
| Typing events conversation room ke through aate hain.
|
| Yahan bhi listener global rakha gaya hai.
| GlobalMessageManager / chat UI conversationId filter kar sakta hai.
|
|--------------------------------------------------------------------------
*/


/**
 * Listen when another user starts typing.
 *
 * Backend:
 * typing:start
 */
export const listenToTypingStart = (
  onTypingStart
) => {
  return subscribeTo(
    "typing:start",
    (data) => {
      onTypingStart?.(data);
    }
  );
};


/**
 * Listen when another user stops typing.
 *
 * Backend:
 * typing:stop
 */
export const listenToTypingStop = (
  onTypingStop
) => {
  return subscribeTo(
    "typing:stop",
    (data) => {
      onTypingStop?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| USER ONLINE / OFFLINE
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Ye listeners specific user ko filter karne ki jagah global event
| receive karte hain.
|
| PresenceContext / GlobalMessageManager / user state khud decide
| karega ki kis user ka status update karna hai.
|
|--------------------------------------------------------------------------
*/


/**
 * Listen for user online.
 *
 * Backend:
 * user:online
 */
export const listenToUserOnline = (
  onOnline
) => {
  return subscribeTo(
    "user:online",
    (data) => {
      onOnline?.(data);
    }
  );
};


/**
 * Listen for user offline.
 *
 * Backend:
 * user:offline
 */
export const listenToUserOffline = (
  onOffline
) => {
  return subscribeTo(
    "user:offline",
    (data) => {
      onOffline?.(data);
    }
  );
};


/**
 * Listen for user status.
 *
 * Backend:
 * user:status
 */
export const listenToUserStatus = (
  onStatus
) => {
  return subscribeTo(
    "user:status",
    (data) => {
      onStatus?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| CALL EVENTS
|--------------------------------------------------------------------------
|
| Messaging refactor ke saath call events ko touch nahi kar rahe.
|
| Existing WebRTC architecture ke liye listeners preserved hain.
|
|--------------------------------------------------------------------------
*/


/**
 * Listen for incoming call.
 */
export const listenToIncomingCall = (
  onIncomingCall
) => {
  return subscribeTo(
    "call:incoming",
    (data) => {
      onIncomingCall?.(data);
    }
  );
};


/**
 * Listen for call joined confirmation.
 */
export const listenToCallJoined = (
  onJoined
) => {
  return subscribeTo(
    "call:joined",
    (data) => {
      onJoined?.(data);
    }
  );
};


/**
 * Listen when another participant joins.
 */
export const listenToCallParticipantJoined = (
  onParticipantJoined
) => {
  return subscribeTo(
    "call:participant:joined",
    (data) => {
      onParticipantJoined?.(data);
    }
  );
};


/**
 * Listen when participant leaves.
 */
export const listenToCallParticipantLeft = (
  onParticipantLeft
) => {
  return subscribeTo(
    "call:participant:left",
    (data) => {
      onParticipantLeft?.(data);
    }
  );
};


/**
 * Listen for call accepted.
 */
export const listenToCallAccepted = (
  onAccepted
) => {
  return subscribeTo(
    "call:accept",
    (data) => {
      onAccepted?.(data);
    }
  );
};


/**
 * Listen for call rejected.
 */
export const listenToCallRejected = (
  onRejected
) => {
  return subscribeTo(
    "call:reject",
    (data) => {
      onRejected?.(data);
    }
  );
};


/**
 * Listen for WebRTC offer.
 */
export const listenToCallOffer = (
  onOffer
) => {
  return subscribeTo(
    "call:offer",
    (data) => {
      onOffer?.(data);
    }
  );
};


/**
 * Listen for WebRTC answer.
 */
export const listenToCallAnswer = (
  onAnswer
) => {
  return subscribeTo(
    "call:answer",
    (data) => {
      onAnswer?.(data);
    }
  );
};


/**
 * Listen for WebRTC ICE candidate.
 */
export const listenToCallIceCandidate = (
  onIceCandidate
) => {
  return subscribeTo(
    "call:ice-candidate",
    (data) => {
      onIceCandidate?.(data);
    }
  );
};


/**
 * Listen when call ends.
 */
export const listenToCallEnded = (
  onEnded
) => {
  return subscribeTo(
    "call:ended",
    (data) => {
      onEnded?.(data);
    }
  );
};


/**
 * Listen for call busy.
 */
export const listenToCallBusy = (
  onBusy
) => {
  return subscribeTo(
    "call:busy",
    (data) => {
      onBusy?.(data);
    }
  );
};


/**
 * Listen for call errors.
 */
export const listenToCallError = (
  onError
) => {
  return subscribeTo(
    "call:error",
    (data) => {
      onError?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| SOCKET ERROR
|--------------------------------------------------------------------------
*/


/**
 * Listen for generic socket errors.
 *
 * Backend:
 * socket:error
 */
export const listenToSocketError = (
  onError
) => {
  return subscribeTo(
    "socket:error",
    (data) => {
      onError?.(data);
    }
  );
};


/*
|--------------------------------------------------------------------------
| UNSUBSCRIBE HELPERS
|--------------------------------------------------------------------------
*/


/**
 * Remove one listener.
 */
export const removeListener = (
  subscription
) => {
  if (!subscription) {
    return;
  }

  unsubscribeFrom(
    subscription
  );
};


/**
 * Remove multiple listeners.
 */
export const removeListeners = (
  subscriptions = []
) => {
  if (!Array.isArray(subscriptions)) {
    return;
  }

  subscriptions.forEach(
    (subscription) => {
      if (subscription) {
        unsubscribeFrom(
          subscription
        );
      }
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
  |--------------------------------------------------------------------------
  | Conversation
  |--------------------------------------------------------------------------
  */

  listenToConversationCreated,
  listenToConversationUpdated,
  listenToConversationUpdates,

  /*
  |--------------------------------------------------------------------------
  | Messages
  |--------------------------------------------------------------------------
  */

  listenToMessages,
  listenToMessageSent,
  listenToMessageDelivered,
  listenToMessageRead,
  listenToMessageEdit,
  listenToMessageDelete,
  listenToMessageError,
  listenToAllMessageEvents,

  /*
  |--------------------------------------------------------------------------
  | Message Helpers
  |--------------------------------------------------------------------------
  */

  extractConversationId,
  extractMessageId,

  /*
  |--------------------------------------------------------------------------
  | Notifications
  |--------------------------------------------------------------------------
  */

  listenToNotifications,

  /*
  |--------------------------------------------------------------------------
  | Typing
  |--------------------------------------------------------------------------
  */

  listenToTypingStart,
  listenToTypingStop,

  /*
  |--------------------------------------------------------------------------
  | User Presence
  |--------------------------------------------------------------------------
  */

  listenToUserOnline,
  listenToUserOffline,
  listenToUserStatus,

  /*
  |--------------------------------------------------------------------------
  | Calls
  |--------------------------------------------------------------------------
  */

  listenToIncomingCall,
  listenToCallJoined,
  listenToCallParticipantJoined,
  listenToCallParticipantLeft,
  listenToCallAccepted,
  listenToCallRejected,
  listenToCallOffer,
  listenToCallAnswer,
  listenToCallIceCandidate,
  listenToCallEnded,
  listenToCallBusy,
  listenToCallError,

  /*
  |--------------------------------------------------------------------------
  | Errors
  |--------------------------------------------------------------------------
  */

  listenToSocketError,

  /*
  |--------------------------------------------------------------------------
  | Cleanup
  |--------------------------------------------------------------------------
  */

  removeListener,
  removeListeners,
};