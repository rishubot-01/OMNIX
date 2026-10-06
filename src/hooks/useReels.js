import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const PAGE_SIZE = 10;

const useReels = () => {
const [reels, setReels] = useState([]);

const [loading, setLoading] = useState(true);
const [loadingMore, setLoadingMore] =
useState(false);

const [error, setError] = useState("");

const [page, setPage] = useState(1);
const [hasNextPage, setHasNextPage] =
useState(false);

const [uploading, setUploading] =
useState(false);

const [uploadProgress, setUploadProgress] =
useState(0);

const [comments, setComments] =
useState({});

const [commentsLoading, setCommentsLoading] =
useState({});

const fetchReels = useCallback(
async (
pageNumber = 1,
append = false
) => {
try {
if (append) {
setLoadingMore(true);
} else {
setLoading(true);
}


    setError("");

    const response = await api.get(
      `/reels?page=${pageNumber}&limit=${PAGE_SIZE}`
    );

    const result = response?.data;

    const fetchedReels =
      result?.data?.reels || [];

    const pagination =
      result?.data?.pagination || {};

    if (append) {
      setReels((previous) => [
        ...previous,
        ...fetchedReels,
      ]);
    } else {
      setReels(fetchedReels);
    }

    setPage(
      Number(
        pagination.page ||
          pageNumber
      )
    );

    setHasNextPage(
      Boolean(
        pagination.hasNextPage
      )
    );
  } catch (err) {
    console.error(
      "Fetch reels error:",
      err
    );

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to load reels."
    );
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
},
[]


);

useEffect(() => {
fetchReels(1, false);
}, [fetchReels]);

const loadMore = useCallback(() => {
if (
loadingMore ||
!hasNextPage
) {
return;
}


fetchReels(
  page + 1,
  true
);

}, [
fetchReels,
page,
loadingMore,
hasNextPage,
]);

const refresh = useCallback(() => {
setPage(1);
setHasNextPage(false);


return fetchReels(1, false);

}, [fetchReels]);

const likeReel = useCallback(
async (
reelId,
shouldLike
) => {
if (!reelId) {
return;
}


  setReels((previous) =>
    previous.map((reel) => {
      if (reel._id !== reelId) {
        return reel;
      }

      const currentLikes =
        reel.likesCount || 0;

      return {
        ...reel,
        isLiked: shouldLike,
        likesCount: shouldLike
          ? currentLikes + 1
          : Math.max(
              0,
              currentLikes - 1
            ),
      };
    })
  );

  try {
    if (shouldLike) {
      await api.post(
        "/likes/reel",
        {
          reelId,
        }
      );
    } else {
      await api.delete(
        "/likes/reel",
        {
          data: {
            reelId,
          },
        }
      );
    }
  } catch (err) {
    console.error(
      "Like reel error:",
      err
    );

    setReels((previous) =>
      previous.map((reel) => {
        if (
          reel._id !== reelId
        ) {
          return reel;
        }

        const currentLikes =
          reel.likesCount || 0;

        return {
          ...reel,
          isLiked: !shouldLike,
          likesCount: shouldLike
            ? Math.max(
                0,
                currentLikes - 1
              )
            : currentLikes + 1,
        };
      })
    );

    throw err;
  }
},
[]


);

const recordView = useCallback(
async (reelId) => {
if (!reelId) {
return;
}


  try {
    const response =
      await api.post(
        `/reels/${reelId}/view`
      );

    const updatedViews =
      response?.data?.data?.views;

    if (
      typeof updatedViews ===
      "number"
    ) {
      setReels((previous) =>
        previous.map(
          (reel) =>
            reel._id === reelId
              ? {
                  ...reel,
                  views:
                    updatedViews,
                }
              : reel
        )
      );
    }
  } catch (err) {
    console.error(
      "Record reel view error:",
      err
    );
  }
},
[]


);

const loadComments = useCallback(
async (reelId) => {
if (!reelId) {
return;
}


  setCommentsLoading(
    (previous) => ({
      ...previous,
      [reelId]: true,
    })
  );

  try {
    const response =
      await api.get(
        `/comments/reel/${reelId}`
      );

    const result =
      response?.data?.data || [];

    setComments(
      (previous) => ({
        ...previous,
        [reelId]: result,
      })
    );

    return result;
  } catch (err) {
    console.error(
      "Load reel comments error:",
      err
    );

    throw err;
  } finally {
    setCommentsLoading(
      (previous) => ({
        ...previous,
        [reelId]: false,
      })
    );
  }
},
[]


);

const addComment = useCallback(
async (
reelId,
content
) => {
if (
!reelId ||
!content?.trim()
) {
return;
}


  try {
    const response =
      await api.post(
        "/comments/reel",
        {
          reelId,
          content:
            content.trim(),
        }
      );

    const newComment =
      response?.data?.data;

    if (newComment) {
      setComments(
        (previous) => ({
          ...previous,
          [reelId]: [
            newComment,
            ...(previous[
              reelId
            ] || []),
          ],
        })
      );

      setReels((previous) =>
        previous.map(
          (reel) =>
            reel._id === reelId
              ? {
                  ...reel,
                  commentsCount:
                    (reel.commentsCount ||
                      0) + 1,
                }
              : reel
        )
      );
    }

    return newComment;
  } catch (err) {
    console.error(
      "Add reel comment error:",
      err
    );

    throw err;
  }
},
[]

);

const deleteComment = useCallback(
async (
commentId,
reelId
) => {
if (
!commentId ||
!reelId
) {
return;
}


  try {
    await api.delete(
      `/comments/${commentId}`
    );

    setComments(
      (previous) => ({
        ...previous,
        [reelId]: (
          previous[reelId] || []
        ).filter(
          (comment) =>
            comment._id !==
            commentId
        ),
      })
    );

    setReels((previous) =>
      previous.map(
        (reel) =>
          reel._id === reelId
            ? {
                ...reel,
                commentsCount:
                  Math.max(
                    0,
                    (reel.commentsCount ||
                      0) - 1
                  ),
              }
            : reel
      )
    );
  } catch (err) {
    console.error(
      "Delete reel comment error:",
      err
    );

    throw err;
  }
},
[]


);

const uploadReel = useCallback(
async ({
video,
caption = "",
audio,
audioFile,
}) => {
if (!video) {
throw new Error(
"Reel video is required."
);
}


  const formData =
    new FormData();

  formData.append(
    "video",
    video
  );

  const trimmedCaption =
    caption?.trim() || "";

  if (trimmedCaption) {
    formData.append(
      "caption",
      trimmedCaption
    );
  }

  if (audio) {
    formData.append(
      "audio",
      JSON.stringify(audio)
    );
  }

  if (audioFile) {
    formData.append(
      "audio",
      audioFile,
      audioFile.name ||
        "original-audio.webm"
    );
  }

  try {
    setUploading(true);
    setUploadProgress(0);

    const response =
      await api.post(
        "/reels",
        formData
      );

    setUploadProgress(100);

    const newReel =
      response?.data?.data;

    if (newReel) {
      setReels(
        (previous) => [
          newReel,
          ...previous,
        ]
      );
    }

    return newReel;
  } catch (err) {
    console.error(
      "Upload reel error:",
      err
    );

    throw new Error(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to upload reel."
    );
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
},
[]


);

const deleteReel = useCallback(
async (reelId) => {
if (!reelId) {
return;
}


  try {
    await api.delete(
      `/reels/${reelId}`
    );

    setReels((previous) =>
      previous.filter(
        (reel) =>
          reel._id !== reelId
      )
    );

    setComments(
      (previous) => {
        const updated = {
          ...previous,
        };

        delete updated[reelId];

        return updated;
      }
    );
  } catch (err) {
    console.error(
      "Delete reel error:",
      err
    );

    throw err;
  }
},
[]


);

return {
reels,
setReels,


loading,
loadingMore,

error,

page,
hasNextPage,
loadMore,

refresh,

likeReel,
recordView,
deleteReel,

comments,
commentsLoading,
loadComments,
addComment,
deleteComment,

uploadReel,
uploading,
uploadProgress,

fetchReels,


};
};

export default useReels;
