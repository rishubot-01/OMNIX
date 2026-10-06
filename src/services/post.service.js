import api from "./api";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const validatePostId = (postId) => {
  if (
    postId === undefined ||
    postId === null ||
    String(postId).trim() === ""
  ) {
    throw new Error("Post ID is required.");
  }

  return String(postId);
};

const validateUserId = (userId) => {
  if (
    userId === undefined ||
    userId === null ||
    String(userId).trim() === ""
  ) {
    throw new Error("User ID is required.");
  }

  return String(userId);
};

/* -------------------------------------------------------------------------- */
/* Post Service                                                                */
/* -------------------------------------------------------------------------- */

const postService = {
  /* ------------------------------------------------------------------------ */
  /* Create Post                                                              */
  /* ------------------------------------------------------------------------ */

  createPost: async (postData = {}) => {
    const formData = new FormData();

    /* ---------------------------------------------------------------------- */
    /* Caption                                                                */
    /* ---------------------------------------------------------------------- */

    formData.append(
      "caption",
      postData?.content ||
        postData?.caption ||
        ""
    );

    /* ---------------------------------------------------------------------- */
    /* Image / Video File                                                     */
    /* ---------------------------------------------------------------------- */

    if (postData?.file) {
      formData.append(
        "file",
        postData.file,
        postData.file.name || "post-media"
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Audio Configuration                                                    */
    /*                                                                        */
    /* Contains:                                                              */
    /* - mode: music / original / mixed                                       */
    /* - music information                                                    */
    /* - original audio information                                           */
    /* - musicVolume                                                          */
    /* - originalVolume                                                       */
    /* - startTime                                                            */
    /* - endTime                                                              */
    /*                                                                        */
    /* The backend receives this as JSON in `audioConfig`.                    */
    /* ---------------------------------------------------------------------- */

    if (postData?.audio) {
      formData.append(
        "audioConfig",
        JSON.stringify(postData.audio)
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Original Audio File                                                    */
    /*                                                                        */
    /* Used when:                                                             */
    /* - mode = original                                                      */
    /* - mode = mixed                                                         */
    /*                                                                        */
    /* This is different from `audioConfig`.                                 */
    /* ---------------------------------------------------------------------- */

    if (postData?.audioFile) {
      formData.append(
        "audio",
        postData.audioFile,
        postData.audioFile.name ||
          "original-audio.webm"
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Send Request                                                           */
    /* ---------------------------------------------------------------------- */

    return api.post(
      "/posts",
      formData
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Get Single Post                                                          */
  /* ------------------------------------------------------------------------ */

  getPost: async (postId) => {
    const id = validatePostId(postId);

    return api.get(
      `/posts/${id}`
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Update Post                                                              */
  /* ------------------------------------------------------------------------ */

  updatePost: async (
    postId,
    postData
  ) => {
    const id = validatePostId(postId);

    return api.put(
      `/posts/${id}`,
      postData
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Delete Post                                                              */
  /*                                                                        */
  /* Backend handles:                                                         */
  /* 1. Ownership verification                                                */
  /* 2. Cloudinary media deletion                                             */
  /* 3. Original audio deletion                                               */
  /* 4. Related comments deletion                                             */
  /* 5. Related likes deletion                                                */
  /* 6. Related notifications cleanup                                         */
  /* 7. MongoDB post deletion                                                 */
  /* ------------------------------------------------------------------------ */

  deletePost: async (postId) => {
    const id = validatePostId(postId);

    return api.delete(
      `/posts/${id}`
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Get User Posts                                                           */
  /* ------------------------------------------------------------------------ */

  getUserPosts: async (userId) => {
    const id = validateUserId(userId);

    return api.get(
      `/posts/user/${id}`
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Get Saved Posts                                                          */
  /* ------------------------------------------------------------------------ */

  getSavedPosts: async () => {
    return api.get(
      "/posts/saved"
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Save Post                                                                */
  /* ------------------------------------------------------------------------ */

  savePost: async (postId) => {
    const id = validatePostId(postId);

    return api.post(
      `/posts/${id}/save`
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Unsave Post                                                              */
  /* ------------------------------------------------------------------------ */

  unsavePost: async (postId) => {
    const id = validatePostId(postId);

    return api.delete(
      `/posts/${id}/save`
    );
  },

  /* ------------------------------------------------------------------------ */
  /* Get Post Count                                                           */
  /* ------------------------------------------------------------------------ */

  getPostCount: async (userId) => {
    const id = validateUserId(userId);

    return api.get(
      `/posts/user/${id}/count`
    );
  },
};

export default postService;