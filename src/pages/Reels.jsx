import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ReelPlayer from "../components/reel/ReelPlayer";
import ReelActions from "../components/reel/ReelActions";
import ReelInfo from "../components/reel/ReelInfo";
import ReelComments from "../components/reel/ReelComments";
import ReelUpload from "../components/reel/ReelUpload";

import api from "../services/api";

const Reels = () => {
  /* =========================================================
     REELS STATE
  ========================================================= */

  const [reels, setReels] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [hasNextPage, setHasNextPage] = useState(false);

  /* =========================================================
     UPLOAD STATE
  ========================================================= */

  const [showUpload, setShowUpload] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  /* =========================================================
     COMMENTS STATE
  ========================================================= */

  const [comments, setComments] = useState([]);

  const [commentsLoading, setCommentsLoading] = useState(false);

  const [activeCommentReel, setActiveCommentReel] =
    useState(null);

  /* =========================================================
     GLOBAL REEL MUTE STATE

     true  = reels muted
     false = reels unmuted

     When user changes mute on one reel,
     the next reel follows the same state.
  ========================================================= */

  const [isReelsMuted, setIsReelsMuted] =
    useState(true);

  /* =========================================================
     REEL ITEM REFERENCES

     Used for:
     - Previous reel
     - Next reel
     - Scroll positioning
  ========================================================= */

  const reelRefs = useRef([]);

  /* =========================================================
     VIEW TRACKING

     Stores reel IDs which have already received a
     /view request during the current page session.

     This is an additional protection against duplicate
     requests from IntersectionObserver / React re-renders.
  ========================================================= */

  const viewedReelsRef = useRef(new Set());

  /* =========================================================
     VIEW REQUESTS CURRENTLY IN PROGRESS

     Prevents the same reel from sending another request
     while its previous request is still pending.
  ========================================================= */

  const viewingReelsRef = useRef(new Set());

  /* =========================================================
     FETCH REELS
  ========================================================= */

  const fetchReels = useCallback(
    async (pageNumber = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError("");

        const result = await api.get(
          `/reels?page=${pageNumber}&limit=10`
        );

        const fetchedReels = Array.isArray(
          result?.data?.reels
        )
          ? result.data.reels
          : [];

        const pagination =
          result?.data?.pagination || {};

        /* =====================================================
           APPEND / REPLACE
        ===================================================== */

        if (append) {
          setReels((previous) => [
            ...previous,
            ...fetchedReels,
          ]);
        } else {
          setReels(fetchedReels);

          /*
           * Reset refs when replacing the complete feed.
           */
          reelRefs.current = [];

          /*
           * Keep existing view tracking protection.
           *
           * We intentionally do NOT clear viewedReelsRef here.
           * If the feed refreshes, the same reel should not
           * immediately generate another /view request.
           */
        }

        /* =====================================================
           PAGINATION
        ===================================================== */

        setHasNextPage(
          Boolean(pagination?.hasNextPage)
        );

        setPage(
          Number(
            pagination?.page || pageNumber
          )
        );
      } catch (err) {
        console.error(
          "Fetch reels error:",
          err
        );

        setError(
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

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchReels(1, false);
  }, [fetchReels]);

  /* =========================================================
     LOAD MORE
  ========================================================= */

  const handleLoadMore = useCallback(() => {
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
    loadingMore,
    hasNextPage,
    page,
    fetchReels,
  ]);

  /* =========================================================
     SCROLL TO REEL
  ========================================================= */

  const scrollToReel = useCallback(
    (index) => {
      if (
        index < 0 ||
        index >= reels.length
      ) {
        return;
      }

      const reelElement =
        reelRefs.current[index];

      if (!reelElement) {
        return;
      }

      reelElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    },
    [reels.length]
  );

  /* =========================================================
     GET CURRENT REEL INDEX

     Finds the reel currently closest to viewport center.
  ========================================================= */

  const getCurrentReelIndex = useCallback(() => {
    if (!reelRefs.current.length) {
      return 0;
    }

    let closestIndex = 0;

    let smallestDistance = Infinity;

    const viewportCenter =
      window.innerHeight / 2;

    reelRefs.current.forEach(
      (element, index) => {
        if (!element) {
          return;
        }

        const rect =
          element.getBoundingClientRect();

        const elementCenter =
          rect.top +
          rect.height / 2;

        const distance = Math.abs(
          elementCenter -
            viewportCenter
        );

        if (
          distance <
          smallestDistance
        ) {
          smallestDistance =
            distance;

          closestIndex = index;
        }
      }
    );

    return closestIndex;
  }, []);

  /* =========================================================
     SCROLL UP
  ========================================================= */

  const handleScrollUp = useCallback(() => {
    const current =
      getCurrentReelIndex();

    if (current <= 0) {
      return;
    }

    scrollToReel(
      current - 1
    );
  }, [
    getCurrentReelIndex,
    scrollToReel,
  ]);

  /* =========================================================
     SCROLL DOWN
  ========================================================= */

  const handleScrollDown = useCallback(() => {
    const current =
      getCurrentReelIndex();

    const nextIndex =
      current + 1;

    /*
     * If next reel already exists,
     * scroll to it.
     */
    if (
      nextIndex < reels.length
    ) {
      scrollToReel(
        nextIndex
      );

      return;
    }

    /*
     * If this is the last loaded reel,
     * load next page.
     */
    if (hasNextPage) {
      handleLoadMore();
    }
  }, [
    getCurrentReelIndex,
    reels.length,
    hasNextPage,
    handleLoadMore,
    scrollToReel,
  ]);

  /* =========================================================
     LIKE REEL
  ========================================================= */

  const handleLike = async (
    reelId,
    shouldLike
  ) => {
    if (!reelId) {
      return;
    }

    try {
      let response;

      if (shouldLike) {
        response = await api.post(
          `/reels/${reelId}/like`
        );
      } else {
        response = await api.delete(
          `/reels/${reelId}/like`
        );
      }

      const likesCount =
        response?.data?.likesCount;

      setReels((previous) =>
        previous.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,

                isLiked:
                  shouldLike,

                ...(typeof likesCount ===
                "number"
                  ? {
                      likesCount,
                    }
                  : {}),
              }
            : reel
        )
      );
    } catch (err) {
      console.error(
        "Like reel error:",
        err
      );

      throw err;
    }
  };

  /* =========================================================
     RECORD REEL VIEW

     IMPORTANT:

     This function is protected by TWO checks:

     1. viewedReelsRef
        -> Reel already recorded in this session.

     2. viewingReelsRef
        -> Request is currently in progress.

     Therefore the same reel cannot generate multiple
     simultaneous /view requests.
  ========================================================= */

  const handleReelView = useCallback(
    async (reelId) => {
      if (!reelId) {
        return;
      }

      /*
       * Already viewed during this session.
       */
      if (
        viewedReelsRef.current.has(
          reelId
        )
      ) {
        return;
      }

      /*
       * Request already in progress.
       */
      if (
        viewingReelsRef.current.has(
          reelId
        )
      ) {
        return;
      }

      /*
       * Lock request immediately BEFORE
       * making the API call.
       */
      viewingReelsRef.current.add(
        reelId
      );

      try {
        await api.post(
          `/reels/${reelId}/view`
        );

        /*
         * Mark as viewed only after
         * successful API request.
         */
        viewedReelsRef.current.add(
          reelId
        );
      } catch (err) {
        console.error(
          "Record reel view error:",
          err
        );
      } finally {
        /*
         * Remove pending state.
         *
         * If request failed, the reel can be
         * retried later.
         */
        viewingReelsRef.current.delete(
          reelId
        );
      }
    },
    []
  );

  /* =========================================================
     LOAD COMMENTS
  ========================================================= */

  const handleLoadComments = async (
    reelId
  ) => {
    if (!reelId) {
      return;
    }

    try {
      setCommentsLoading(true);

      const response =
        await api.get(
          `/comments/reel/${reelId}`
        );

      setComments(
        response?.data?.data || []
      );
    } catch (err) {
      console.error(
        "Load reel comments error:",
        err
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  /* =========================================================
     OPEN COMMENTS
  ========================================================= */

  const handleOpenComments = (
    reelId
  ) => {
    if (!reelId) {
      return;
    }

    setActiveCommentReel(
      reelId
    );

    handleLoadComments(
      reelId
    );
  };

  /* =========================================================
     ADD COMMENT
  ========================================================= */

  const handleAddComment = async (
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
          (previous) => [
            newComment,
            ...previous,
          ]
        );
      }

      setReels((previous) =>
        previous.map((reel) =>
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
    } catch (err) {
      console.error(
        "Add reel comment error:",
        err
      );

      throw err;
    }
  };

  /* =========================================================
     DELETE COMMENT
  ========================================================= */

  const handleDeleteComment = async (
    commentId
  ) => {
    if (!commentId) {
      return;
    }

    try {
      await api.delete(
        `/comments/${commentId}`
      );

      const deletedComment =
        comments.find(
          (comment) =>
            comment._id ===
            commentId
        );

      setComments(
        (previous) =>
          previous.filter(
            (comment) =>
              comment._id !==
              commentId
          )
      );

      if (deletedComment) {
        const reelId =
          activeCommentReel;

        setReels((previous) =>
          previous.map((reel) =>
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
      }
    } catch (err) {
      console.error(
        "Delete reel comment error:",
        err
      );

      throw err;
    }
  };

  /* =========================================================
     SHARE REEL
  ========================================================= */

  const handleShare = async (
    reelId
  ) => {
    if (!reelId) {
      return;
    }

    console.log(
      "Reel shared:",
      reelId
    );
  };

  /* =========================================================
     UPLOAD REEL
  ========================================================= */

  const handleUpload = async ({
    video,
    caption,
    audio,
    audioFile,
  }) => {
    if (!video) {
      throw new Error(
        "Video is required."
      );
    }

    const formData =
      new FormData();

    /* =======================================================
       VIDEO
    ======================================================= */

    formData.append(
      "video",
      video
    );

    /* =======================================================
       CAPTION
    ======================================================= */

    if (
      caption?.trim()
    ) {
      formData.append(
        "caption",
        caption.trim()
      );
    }

    /* =======================================================
       AUDIO CONFIGURATION
    ======================================================= */

    if (
      audio &&
      typeof audio === "object"
    ) {
      formData.append(
        "audioConfig",
        JSON.stringify(audio)
      );
    }

    /* =======================================================
       ORIGINAL AUDIO FILE
    ======================================================= */

    if (
      audioFile instanceof Blob
    ) {
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

      /* =====================================================
         UPLOAD
      ===================================================== */

      const response =
        await api.post(
          "/reels",
          formData
        );

      /* =====================================================
         SUCCESS CHECK
      ===================================================== */

      if (
        response?.success !== true
      ) {
        throw new Error(
          response?.message ||
            response?.data?.message ||
            "Reel upload failed."
        );
      }

      /* =====================================================
         COMPLETE
      ===================================================== */

      setUploadProgress(100);

      /*
       * Refresh reels after upload.
       */
      await fetchReels(
        1,
        false
      );

      /*
       * Close modal.
       */
      setShowUpload(false);
    } catch (err) {
      console.error(
        "Upload reel error:",
        err
      );

      throw err;
    } finally {
      setUploading(false);

      setUploadProgress(0);
    }
  };

  /* =========================================================
     USER PROFILE
  ========================================================= */

  const handleUserClick = (
    user
  ) => {
    if (!user?._id) {
      return;
    }

    console.log(
      "Open user profile:",
      user._id
    );
  };

  /* =========================================================
     FOLLOW USER
  ========================================================= */

  const handleFollow = (
    user
  ) => {
    if (!user?._id) {
      return;
    }

    console.log(
      "Follow user:",
      user._id
    );
  };

  /* =========================================================
     CLOSE COMMENTS
  ========================================================= */

  const handleCloseComments = () => {
    setActiveCommentReel(
      null
    );

    setComments([]);
  };

  /* =========================================================
     CLEANUP VIEW TRACKING ON UNMOUNT
  ========================================================= */

  useEffect(() => {
    return () => {
      viewedReelsRef.current.clear();
      viewingReelsRef.current.clear();
    };
  }, []);

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (
    loading &&
    reels.length === 0
  ) {
    return (
      <main className="reels-page">
        <div className="reels-loading">
          <div className="reels-loader">
            Loading reels...
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (
    error &&
    reels.length === 0
  ) {
    return (
      <main className="reels-page">
        <div className="reels-error">
          <h2>
            Unable to load reels
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchReels(
                1,
                false
              )
            }
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <main className="reels-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="reels-header">

        <div className="reels-header-content">
          <h1>
            Reels
          </h1>

          <p>
            Discover the latest reels
            on OMNIX
          </p>
        </div>

        <button
          type="button"
          className="reels-create-button"
          onClick={() =>
            setShowUpload(true)
          }
        >
          + Create Reel
        </button>

      </header>

      {/* =====================================================
          REELS MAIN AREA
      ===================================================== */}

      <div className="reels-main-area">

        {/* ===================================================
            REELS FEED
        =================================================== */}

        {reels.length === 0 ? (

          <div className="reels-empty">

            <div className="reels-empty-icon">
              🎬
            </div>

            <h2>
              No reels yet
            </h2>

            <p>
              Be the first person to
              create a reel.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowUpload(true)
              }
            >
              Create Reel
            </button>

          </div>

        ) : (

          <section
            className="reels-feed"
            aria-label="OMNIX Reels"
          >

            {reels.map(
              (reel, index) => (

                <article
                  key={reel._id}
                  ref={(element) => {
                    reelRefs.current[index] =
                      element;
                  }}
                  className="reel-item"
                  data-reel-index={index}
                  data-reel-id={reel._id}
                >

                  {/* =========================================
                      REEL VISUAL AREA
                  ========================================= */}

                  <div className="reel-visual">

                    <ReelPlayer
                      videoUrl={
                        reel.videoUrl
                      }

                      poster={
                        reel.thumbnailUrl
                      }

                      muted={
                        isReelsMuted
                      }

                      onMuteChange={
                        setIsReelsMuted
                      }

                      onView={() =>
                        handleReelView(
                          reel._id
                        )
                      }
                    />

                    {/* =======================================
                        REEL INFO
                    ======================================= */}

                    <ReelInfo
                      reel={reel}
                      onUserClick={
                        handleUserClick
                      }
                      onFollow={
                        handleFollow
                      }
                    />

                    {/* =======================================
                        REEL ACTIONS
                    ======================================= */}

                    <ReelActions
                      reelId={
                        reel._id
                      }

                      liked={
                        reel.isLiked ||
                        false
                      }

                      likesCount={
                        reel.likesCount ||
                        0
                      }

                      commentsCount={
                        reel.commentsCount ||
                        0
                      }

                      sharesCount={
                        reel.sharesCount ||
                        0
                      }

                      views={
                        reel.views ||
                        0
                      }

                      onLike={
                        handleLike
                      }

                      onComment={
                        handleOpenComments
                      }

                      onShare={
                        handleShare
                      }
                    />

                    {/* =======================================
                        COMMENTS
                    ======================================= */}

                    <ReelComments
                      reelId={
                        reel._id
                      }

                      comments={
                        activeCommentReel ===
                        reel._id
                          ? comments
                          : []
                      }

                      currentUser={
                        null
                      }

                      isOpen={
                        activeCommentReel ===
                        reel._id
                      }

                      loading={
                        commentsLoading
                      }

                      onLoadComments={
                        handleLoadComments
                      }

                      onAddComment={
                        handleAddComment
                      }

                      onDeleteComment={
                        handleDeleteComment
                      }

                      onClose={
                        handleCloseComments
                      }
                    />

                  </div>

                </article>
              )
            )}

          </section>
        )}

        {/* ===================================================
            DESKTOP SCROLL CONTROLS
        =================================================== */}

        {reels.length > 0 && (

          <div className="reels-scroll-controls">

            <button
              type="button"
              className="reels-scroll-button reels-scroll-up"
              onClick={
                handleScrollUp
              }
              aria-label="Previous reel"
              title="Previous reel"
            >
              ↑
            </button>

            <button
              type="button"
              className="reels-scroll-button reels-scroll-down"
              onClick={
                handleScrollDown
              }
              aria-label="Next reel"
              title="Next reel"
            >
              ↓
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          LOAD MORE
      ===================================================== */}

      {hasNextPage && (

        <div className="reels-load-more">

          <button
            type="button"
            onClick={
              handleLoadMore
            }
            disabled={
              loadingMore
            }
          >
            {loadingMore
              ? "Loading..."
              : "Load More"}
          </button>

        </div>
      )}

      {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

      {showUpload && (

        <div
          className="reels-upload-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Create Reel"
        >

          <div className="reels-upload-modal">

            <ReelUpload
              onUpload={
                handleUpload
              }

              uploading={
                uploading
              }

              uploadProgress={
                uploadProgress
              }

              onClose={() =>
                setShowUpload(
                  false
                )
              }
            />

          </div>

        </div>
      )}

    </main>
  );
};

export default Reels;