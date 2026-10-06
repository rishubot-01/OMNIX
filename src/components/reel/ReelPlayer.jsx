import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const ReelPlayer = ({
  videoUrl,
  poster,
  autoPlay = true,

  // Global mute state coming from Reels.jsx
  muted: initialMuted = true,
  onMuteChange,

  loop = true,
  onPlay,
  onPause,
  onEnded,
  onView,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

  /*
   * =========================================================
   * VIEW TRACKING
   *
   * Prevent repeated /view API requests.
   *
   * One reel visibility cycle = one view.
   * When reel leaves viewport, the lock resets.
   * =========================================================
   */
  const hasTrackedViewRef = useRef(false);

  /*
   * Prevent duplicate play() calls while a play request
   * is already running.
   */
  const playPromiseRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [hasError, setHasError] = useState(false);

  // Instagram-style temporary play icon
  const [showPlayIndicator, setShowPlayIndicator] =
    useState(false);

  // Controls visibility
  const [showControls, setShowControls] = useState(false);

  // Video progress
  const [progress, setProgress] = useState(0);

  // Actual video aspect ratio
  const [videoRatio, setVideoRatio] = useState(9 / 16);

  /* =========================================================
     CLEAR CONTROL HIDE TIMER
  ========================================================= */

  const clearHideControlsTimer = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
  }, []);

  /* =========================================================
     HIDE CONTROLS
  ========================================================= */

  const scheduleHideControls = useCallback(() => {
    clearHideControlsTimer();

    hideControlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
      hideControlsTimerRef.current = null;
    }, 2200);
  }, [clearHideControlsTimer]);

  /* =========================================================
     SHOW CONTROLS
  ========================================================= */

  const revealControls = useCallback(() => {
    setShowControls(true);

    if (isPlaying) {
      scheduleHideControls();
    }
  }, [isPlaying, scheduleHideControls]);

  /* =========================================================
     PLAY VIDEO
  ========================================================= */

  const playVideo = useCallback(async () => {
    const video = videoRef.current;

    if (!video || hasError) {
      return;
    }

    /*
     * Already playing.
     */
    if (!video.paused) {
      setIsPlaying(true);
      return;
    }

    /*
     * A play request is already running.
     * Do not call video.play() again.
     */
    if (playPromiseRef.current) {
      return playPromiseRef.current;
    }

    const playRequest = (async () => {
      try {
        await video.play();

        setIsPlaying(true);
        setShowPlayIndicator(false);

        if (onPlay) {
          onPlay();
        }

        scheduleHideControls();
      } catch (error) {
        /*
         * Browser autoplay restrictions can cause this.
         * Do not treat it as a video loading error.
         */
        console.error(
          "Reel video play error:",
          error
        );

        setIsPlaying(false);
      } finally {
        playPromiseRef.current = null;
      }
    })();

    playPromiseRef.current = playRequest;

    return playRequest;
  }, [
    hasError,
    onPlay,
    scheduleHideControls,
  ]);

  /* =========================================================
     PAUSE VIDEO
  ========================================================= */

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    /*
     * If play() is currently pending, pause safely.
     */
    if (!video.paused) {
      video.pause();
    }

    setIsPlaying(false);
    setShowControls(true);

    if (onPause) {
      onPause();
    }

    clearHideControlsTimer();
  }, [
    onPause,
    clearHideControlsTimer,
  ]);

  /* =========================================================
     TOGGLE PLAY / PAUSE
  ========================================================= */

  const togglePlay = useCallback(
    (event) => {
      if (event) {
        event.stopPropagation();
      }

      const video = videoRef.current;

      if (!video) {
        return;
      }

      if (video.paused) {
        setShowPlayIndicator(false);
        playVideo();
      } else {
        pauseVideo();

        // Show large center play icon after pause
        setShowPlayIndicator(true);
      }
    },
    [playVideo, pauseVideo]
  );

  /* =========================================================
     VIDEO CLICK
  ========================================================= */

  const handleVideoClick = (event) => {
    event.stopPropagation();

    togglePlay(event);
  };

  /* =========================================================
     MUTE / UNMUTE
  ========================================================= */

  const toggleMute = (event) => {
    event.stopPropagation();

    const video = videoRef.current;

    if (!video) {
      return;
    }

    const newMuted = !video.muted;

    video.muted = newMuted;

    setIsMuted(newMuted);

    if (onMuteChange) {
      onMuteChange(newMuted);
    }

    revealControls();
  };

  /* =========================================================
     VIDEO METADATA
     
     Detect actual uploaded video ratio.
  ========================================================= */

  const handleLoadedMetadata = (event) => {
    const video = event.currentTarget;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width && height) {
      const ratio = width / height;

      setVideoRatio(ratio);
    }

    /*
     * Apply global mute state.
     */
    video.muted = initialMuted;

    setIsMuted(initialMuted);
  };

  /* =========================================================
     VIDEO TIME UPDATE
  ========================================================= */

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video || !video.duration) {
      return;
    }

    const currentProgress =
      (video.currentTime / video.duration) * 100;

    setProgress(currentProgress);
  };

  /* =========================================================
     VIDEO ENDED
  ========================================================= */

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setShowControls(true);
    setShowPlayIndicator(true);

    /*
     * Allow tracking again only if the reel becomes visible
     * again after leaving the viewport.
     */
    hasTrackedViewRef.current = true;

    if (onEnded) {
      onEnded();
    }
  };

  /* =========================================================
     VIDEO ERROR
  ========================================================= */

  const handleError = () => {
    console.error(
      "Unable to load reel video:",
      videoUrl
    );

    setHasError(true);
    setIsPlaying(false);

    /*
     * Prevent pending view tracking for a broken video.
     */
    hasTrackedViewRef.current = false;
  };

  /* =========================================================
     INTERSECTION OBSERVER
     
     Instagram-style:

     Reel visible
       -> play
       -> track view ONCE

     Reel leaves viewport
       -> pause
       -> reset view lock
  ========================================================= */

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        /*
         * =====================================================
         * REEL IS VISIBLE
         * =====================================================
         */

        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.6
        ) {
          if (autoPlay) {
            playVideo();
          }

          /*
           * IMPORTANT:
           *
           * Do NOT call onView every time the observer
           * callback runs.
           *
           * Track only once during this visibility cycle.
           */
          if (
            onView &&
            !hasTrackedViewRef.current
          ) {
            hasTrackedViewRef.current = true;

            onView();
          }

          return;
        }

        /*
         * =====================================================
         * REEL IS NOT VISIBLE
         * =====================================================
         */

        pauseVideo();

        /*
         * Once the reel leaves the viewport, allow another
         * view when the user comes back to it.
         */
        hasTrackedViewRef.current = false;
      },
      {
        threshold: [0, 0.6, 1],
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [
    autoPlay,
    playVideo,
    pauseVideo,
  ]);

  /* =========================================================
     GLOBAL MUTE STATE
  ========================================================= */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = initialMuted;

    setIsMuted(initialMuted);
  }, [initialMuted]);

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      clearHideControlsTimer();

      /*
       * Stop any currently playing video when component
       * unmounts.
       */
      const video = videoRef.current;

      if (video) {
        video.pause();
      }

      playPromiseRef.current = null;
    };
  }, [clearHideControlsTimer]);

  /* =========================================================
     SHOW CONTROLS WHEN PAUSED
  ========================================================= */

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      clearHideControlsTimer();
    }
  }, [
    isPlaying,
    clearHideControlsTimer,
  ]);

  /* =========================================================
     INVALID VIDEO
  ========================================================= */

  if (!videoUrl || hasError) {
    return (
      <div
        ref={containerRef}
        className="reel-player reel-player-error"
      >
        <div className="reel-player-error-content">
          <span className="reel-player-error-icon">
            ⚠️
          </span>

          <p>
            Unable to load this reel
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PLAYER
  ========================================================= */

  return (
    <div
      ref={containerRef}
      className={`reel-player ${
        isPlaying
          ? "reel-player-playing"
          : "reel-player-paused"
      }`}
      style={{
        "--reel-player-ratio": videoRatio,
      }}
      onMouseEnter={() => {
        revealControls();
      }}
      onMouseMove={() => {
        revealControls();
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          scheduleHideControls();
        }
      }}
      onTouchStart={() => {
        revealControls();
      }}
    >
      {/* =====================================================
          VIDEO
      ===================================================== */}

      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="reel-player-video"
        playsInline
        muted={isMuted}
        loop={loop}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onClick={handleVideoClick}
      />

      {/* =====================================================
          CLICK / TOUCH OVERLAY
      ===================================================== */}

      <button
        type="button"
        className="reel-player-video-button"
        onClick={handleVideoClick}
        aria-label={
          isPlaying
            ? "Pause reel"
            : "Play reel"
        }
      />

      {/* =====================================================
          CENTER PLAY INDICATOR
          
          Appears when video is paused.
      ===================================================== */}

      {!isPlaying && showPlayIndicator && (
        <div
          className="reel-player-center-play"
          aria-hidden="true"
        >
          <span>▶</span>
        </div>
      )}

      {/* =====================================================
          RIGHT-BOTTOM MUTE BUTTON
      ===================================================== */}

      <button
        type="button"
        className={`reel-player-mute-button ${
          showControls
            ? "reel-player-control-visible"
            : ""
        }`}
        onClick={toggleMute}
        aria-label={
          isMuted
            ? "Unmute reel"
            : "Mute reel"
        }
      >
        <span className="reel-player-mute-icon">
          {isMuted ? "🔇" : "🔊"}
        </span>
      </button>

      {/* =====================================================
          BOTTOM PROGRESS BAR
      ===================================================== */}

      <div
        className={`reel-player-progress ${
          showControls
            ? "reel-player-progress-visible"
            : ""
        }`}
      >
        <div className="reel-player-progress-track">
          <div
            className="reel-player-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* =====================================================
          PAUSED STATE
      ===================================================== */}

      {!isPlaying && (
        <div
          className="reel-player-paused-overlay"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ReelPlayer;