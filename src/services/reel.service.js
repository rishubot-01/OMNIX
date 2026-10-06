
import api from "./api";

/*
 * ==========================================
 * REEL ID VALIDATION
 * ==========================================
 */

const validateReelId = (reelId) => {
  if (
    reelId === undefined ||
    reelId === null ||
    String(reelId).trim() === ""
  ) {
    throw new Error("Reel ID is required.");
  }

  return String(reelId);
};

/*
 * ==========================================
 * GET REELS
 * ==========================================
 */

export const getReels = async (
  page = 1,
  limit = 10
) => {
  const response = await api.get(
    `/reels?page=${page}&limit=${limit}`
  );

  return response.data;
};

/*
 * ==========================================
 * GET SINGLE REEL
 * ==========================================
 */

export const getReelById = async (reelId) => {
  const id = validateReelId(reelId);

  const response = await api.get(
    `/reels/${id}`
  );

  return response.data;
};

/*
 * ==========================================
 * CREATE / UPLOAD REEL
 * ==========================================
 */

export const createReel = async (
  video,
  caption = "",
  onUploadProgress
) => {
  if (!video) {
    throw new Error("Reel video is required.");
  }

  const formData = new FormData();

  formData.append("video", video);

  if (caption?.trim()) {
    formData.append(
      "caption",
      caption.trim()
    );
  }

  const response = await api.post(
    "/reels",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }
  );

  return response.data;
};

/*
 * ==========================================
 * DELETE REEL
 * ==========================================
 *
 * Backend handles:
 * 1. Permission check
 * 2. Cloudinary video deletion
 * 3. Related comments deletion
 * 4. Related likes deletion
 * 5. Related notifications cleanup
 * 6. Reel deletion from MongoDB
 *
 * Frontend only calls the API and waits
 * for successful completion.
 */

export const deleteReel = async (reelId) => {
  const id = validateReelId(reelId);

  const response = await api.delete(
    `/reels/${id}`
  );

  return response.data;
};

/*
 * ==========================================
 * LIKE REEL
 * ==========================================
 */

export const likeReel = async (reelId) => {
  const id = validateReelId(reelId);

  const response = await api.post(
    `/reels/${id}/like`
  );

  return response.data;
};

/*
 * ==========================================
 * UNLIKE REEL
 * ==========================================
 */

export const unlikeReel = async (reelId) => {
  const id = validateReelId(reelId);

  const response = await api.delete(
    `/reels/${id}/like`
  );

  return response.data;
};

/*
 * ==========================================
 * RECORD REEL VIEW
 * ==========================================
 */

export const recordReelView = async (reelId) => {
  const id = validateReelId(reelId);

  const response = await api.post(
    `/reels/${id}/view`
  );

  return response.data;
};

/*
 * ==========================================
 * GET REEL COMMENTS
 * ==========================================
 */

export const getReelComments = async (reelId) => {
  const id = validateReelId(reelId);

  const response = await api.get(
    `/comments/reel/${id}`
  );

  return response.data;
};

/*
 * ==========================================
 * ADD REEL COMMENT
 * ==========================================
 */

export const addReelComment = async (
  reelId,
  content
) => {
  const id = validateReelId(reelId);

  if (!content?.trim()) {
    throw new Error("Comment is required.");
  }

  const response = await api.post(
    "/comments/reel",
    {
      reelId: id,
      content: content.trim(),
    }
  );

  return response.data;
};

/*
 * ==========================================
 * DELETE COMMENT
 * ==========================================
 */

export const deleteReelComment = async (
  commentId
) => {
  if (
    commentId === undefined ||
    commentId === null ||
    String(commentId).trim() === ""
  ) {
    throw new Error("Comment ID is required.");
  }

  const id = String(commentId);

  const response = await api.delete(
    `/comments/${id}`
  );

  return response.data;
};
