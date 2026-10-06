
import api from "./api";

/*
|--------------------------------------------------------------------------
| Message Service
|--------------------------------------------------------------------------
|
| OMNIX messaging ke saare REST API calls yahan handle honge.
|
| Backend base route:
| /api/messages
|
*/

/*
|--------------------------------------------------------------------------
| Conversations
|--------------------------------------------------------------------------
*/

/**
 * Get all conversations of logged-in user
 *
 * GET /api/messages/conversations
 */
const getConversations = async () => {
  const response = await api.get(
    "/messages/conversations"
  );

  return response.data;
};

/**
 * Get single conversation
 *
 * GET /api/messages/conversations/:conversationId
 */
const getConversation = async (
  conversationId
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  const response = await api.get(
    `/messages/conversations/${encodeURIComponent(
      String(conversationId)
    )}`
  );

  return response.data;
};

/**
 * Create or get conversation with another user
 *
 * POST /api/messages/conversations
 *
 * Body:
 * {
 *   userId: receiverId
 * }
 */
const createConversation = async (
  userId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  const response = await api.post(
    "/messages/conversations",
    {
      userId: String(userId),
    }
  );

  return response.data;
};

/**
 * Delete conversation
 *
 * DELETE /api/messages/conversations/:conversationId
 */
const deleteConversation = async (
  conversationId
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  const response = await api.delete(
    `/messages/conversations/${encodeURIComponent(
      String(conversationId)
    )}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

/**
 * Get messages of a conversation
 *
 * GET /api/messages/conversations/:conversationId/messages
 *
 * Backend page numbering:
 * page = 1, 2, 3...
 */
const getMessages = async (
  conversationId,
  page = 1,
  size = 30
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeSize = Math.min(
    Math.max(Number(size) || 30, 1),
    100
  );

  const response = await api.get(
    `/messages/conversations/${encodeURIComponent(
      String(conversationId)
    )}/messages`,
    {
      params: {
        page: safePage,
        size: safeSize,
      },
    }
  );

  return response.data;
};

/**
 * Send message
 *
 * POST /api/messages/conversations/:conversationId/messages
 *
 * Body:
 * {
 *   content,
 *   messageType,
 *   mediaUrl?,
 *   replyToMessageId?
 * }
 */
const sendMessage = async (
  conversationId,
  content,
  messageType = "TEXT",
  mediaUrl = null,
  replyToMessageId = null
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  const cleanContent =
    typeof content === "string"
      ? content.trim()
      : "";

  if (!cleanContent && !mediaUrl) {
    throw new Error(
      "Message content is required"
    );
  }

  const response = await api.post(
    `/messages/conversations/${encodeURIComponent(
      String(conversationId)
    )}/messages`,
    {
      content:
        cleanContent || null,

      messageType:
        messageType || "TEXT",

      mediaUrl:
        mediaUrl || null,

      replyToMessageId:
        replyToMessageId || null,
    }
  );

  return response.data;
};

/**
 * Mark conversation messages as read
 *
 * PUT /api/messages/conversations/:conversationId/read
 */
const markMessagesAsRead = async (
  conversationId
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  const response = await api.put(
    `/messages/conversations/${encodeURIComponent(
      String(conversationId)
    )}/read`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Individual Message
|--------------------------------------------------------------------------
*/

/**
 * Delete message
 *
 * DELETE /api/messages/:messageId
 */
const deleteMessage = async (
  messageId
) => {
  if (!messageId) {
    throw new Error(
      "Message ID is required"
    );
  }

  const response = await api.delete(
    `/messages/${encodeURIComponent(
      String(messageId)
    )}`
  );

  return response.data;
};

/**
 * Edit message
 *
 * PUT /api/messages/:messageId
 */
const updateMessage = async (
  messageId,
  content
) => {
  if (!messageId) {
    throw new Error(
      "Message ID is required"
    );
  }

  const cleanContent =
    typeof content === "string"
      ? content.trim()
      : "";

  if (!cleanContent) {
    throw new Error(
      "Message content is required"
    );
  }

  const response = await api.put(
    `/messages/${encodeURIComponent(
      String(messageId)
    )}`,
    {
      content: cleanContent,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| User Search
|--------------------------------------------------------------------------
*/

/**
 * Search users for new conversation
 *
 * GET /api/messages/users/search?query=rahul
 *
 * Backend route:
 * GET /api/messages/users/search
 */
const searchUsers = async (
  query
) => {
  const searchQuery =
    String(query || "").trim();

  if (!searchQuery) {
    return {
      success: true,
      data: [],
    };
  }

  const response = await api.get(
    "/messages/users/search",
    {
      params: {
        query: searchQuery,
      },
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

const messageService = {
  // Conversations
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,

  // Messages
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  updateMessage,

  // User Search
  searchUsers,
};

export default messageService;

