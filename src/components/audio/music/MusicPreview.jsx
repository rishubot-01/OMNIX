import { useEffect } from "react";

/*
 * |--------------------------------------------------------------------------
 * | MusicPreview
 * |--------------------------------------------------------------------------
 *
 * Responsibilities:
 *
 * 1. Display selected music
 * 2. Play / pause music preview
 * 3. Stop preview
 * 4. Use the audio ref from useAudio()
 * 5. Respect music volume
 * 6. Respect selected trim start/end
 *
 * Supported providers:
 *
 * - Jamendo
 * - Epidemic Sound
 * - Spotify
 *
 * Provider-specific API logic is NOT handled here.
 * This component only works with the audio/preview URL
 * provided by the music service.
 *
 */

const MusicPreview = ({
  music,
  musicAudioRef,
  musicVolume = 1,
  startTime = 0,
  endTime = null,
  isPlaying = false,
  previewType = null,
  onPlay,
  onPause,
  onStop,
}) => {
  /*
   * |--------------------------------------------------------------------------
   * | No Music Selected
   * |--------------------------------------------------------------------------
   */

  if (!music) {
    return (
      <div className="music-preview">
        <div className="music-preview__empty">
          Select a song to preview it.
        </div>
      </div>
    );
  }

  /*
   * |--------------------------------------------------------------------------
   * | Provider
   * |--------------------------------------------------------------------------
   */

  const provider = String(
    music.provider || "jamendo"
  )
    .trim()
    .toLowerCase();

  /*
   * |--------------------------------------------------------------------------
   * | Track Information
   * |--------------------------------------------------------------------------
   */

  const title =
    music.name ||
    music.title ||
    "Unknown Track";

  const artist =
    music.artistName ||
    music.artist ||
    "Unknown Artist";

  const artwork =
    music.albumImage ||
    music.image ||
    music.thumbnail ||
    music.artworkUrl ||
    "";

  /*
   * |--------------------------------------------------------------------------
   * | URLs
   * |--------------------------------------------------------------------------
   *
   * The service can provide either:
   *
   * - audio
   * - audioUrl
   *
   * No provider-specific URL is generated here.
   */

  const audioUrl =
    typeof music.audioUrl === "string"
      ? music.audioUrl.trim()
      : typeof music.audio === "string"
      ? music.audio.trim()
      : "";

  const externalUrl =
    typeof music.externalUrl === "string"
      ? music.externalUrl.trim()
      : "";

  /*
   * |--------------------------------------------------------------------------
   * | Audio Availability
   * |--------------------------------------------------------------------------
   */

  const hasAudio =
    audioUrl !== "";

  /*
   * |--------------------------------------------------------------------------
   * | External URL Availability
   * |--------------------------------------------------------------------------
   */

  const hasExternalUrl =
    externalUrl !== "";

  /*
   * |--------------------------------------------------------------------------
   * | Current Preview
   * |--------------------------------------------------------------------------
   */

  const isCurrentPreview =
    previewType === "music";

  /*
   * |--------------------------------------------------------------------------
   * | Provider Label
   * |--------------------------------------------------------------------------
   */

  const getProviderLabel = () => {
    switch (provider) {
      case "jamendo":
        return "Jamendo";

      case "epidemic":
        return "Epidemic Sound";

      case "spotify":
        return "Spotify";

      default:
        return provider
          ? provider.charAt(0).toUpperCase() +
              provider.slice(1)
          : "Music";
    }
  };

  const providerLabel =
    getProviderLabel();

  /*
   * |--------------------------------------------------------------------------
   * | Provider Icon
   * |--------------------------------------------------------------------------
   */

  const getProviderIcon = () => {
    switch (provider) {
      case "jamendo":
        return "🎶";

      case "epidemic":
        return "🎵";

      case "spotify":
        return "🎧";

      default:
        return "🎵";
    }
  };

  const providerIcon =
    getProviderIcon();

  /*
   * |--------------------------------------------------------------------------
   * | Configure Audio Element
   * |--------------------------------------------------------------------------
   *
   * All providers use the same HTML audio element
   * when an audio/preview URL is available.
   */

  useEffect(() => {
    const audio =
      musicAudioRef?.current;

    if (!audio) {
      return;
    }

    /*
     * No audio/preview URL available.
     */

    if (!hasAudio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      return;
    }

    /*
     * Set volume.
     */

    audio.volume = Math.min(
      1,
      Math.max(
        0,
        Number(musicVolume) || 0
      )
    );

    /*
     * Load selected provider audio/preview.
     */

    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }

    /*
     * Cleanup when selected music changes.
     */

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [
    audioUrl,
    musicAudioRef,
    musicVolume,
    hasAudio,
  ]);

  /*
   * |--------------------------------------------------------------------------
   * | Handle Audio Time
   * |--------------------------------------------------------------------------
   *
   * Stop playback when selected trim end
   * point is reached.
   */

  useEffect(() => {
    const audio =
      musicAudioRef?.current;

    if (
      !audio ||
      !hasAudio
    ) {
      return;
    }

    const handleTimeUpdate = () => {
      if (
        endTime === null ||
        endTime === undefined
      ) {
        return;
      }

      const end =
        Number(endTime);

      if (
        Number.isFinite(end) &&
        end > 0 &&
        audio.currentTime >= end
      ) {
        audio.pause();

        /*
         * Return to selected start position.
         */

        audio.currentTime =
          Number(startTime) || 0;

        onStop?.();
      }
    };

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
    };
  }, [
    musicAudioRef,
    startTime,
    endTime,
    onStop,
    hasAudio,
  ]);

  /*
   * |--------------------------------------------------------------------------
   * | Play Audio
   * |--------------------------------------------------------------------------
   */

  const handlePlay = async () => {
    if (!hasAudio) {
      return;
    }

    const audio =
      musicAudioRef?.current;

    if (!audio) {
      return;
    }

    try {
      /*
       * Start from selected trim point.
       */

      const start =
        Number(startTime) || 0;

      /*
       * If playback has finished or
       * moved outside selected clip,
       * return to start.
       */

      if (
        audio.currentTime < start ||
        (
          endTime !== null &&
          Number.isFinite(
            Number(endTime)
          ) &&
          audio.currentTime >=
            Number(endTime)
        )
      ) {
        audio.currentTime = start;
      }

      /*
       * Set volume.
       */

      audio.volume = Math.min(
        1,
        Math.max(
          0,
          Number(musicVolume) || 0
        )
      );

      /*
       * Play preview.
       */

      await audio.play();

      onPlay?.();
    } catch (error) {
      console.error(
        "Music preview playback error:",
        error
      );
    }
  };

  /*
   * |--------------------------------------------------------------------------
   * | Pause
   * |--------------------------------------------------------------------------
   */

  const handlePause = () => {
    const audio =
      musicAudioRef?.current;

    if (!audio) {
      return;
    }

    audio.pause();

    onPause?.();
  };

  /*
   * |--------------------------------------------------------------------------
   * | Stop
   * |--------------------------------------------------------------------------
   */

  const handleStop = () => {
    const audio =
      musicAudioRef?.current;

    if (!audio) {
      return;
    }

    audio.pause();

    audio.currentTime =
      Number(startTime) || 0;

    onStop?.();
  };

  /*
   * |--------------------------------------------------------------------------
   * | Toggle Play / Pause
   * |--------------------------------------------------------------------------
   */

  const handleToggle = () => {
    const audio =
      musicAudioRef?.current;

    if (!audio || !hasAudio) {
      return;
    }

    if (audio.paused) {
      handlePlay();
    } else {
      handlePause();
    }
  };

  /*
   * |--------------------------------------------------------------------------
   * | Open External Provider URL
   * |--------------------------------------------------------------------------
   *
   * Generic external URL.
   *
   * No YouTube-specific behavior.
   */

  const handleOpenExternal = () => {
    if (!hasExternalUrl) {
      return;
    }

    window.open(
      externalUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * |--------------------------------------------------------------------------
   * | UI
   * |--------------------------------------------------------------------------
   */

  return (
    <div
      className="music-preview"
      data-provider={provider}
    >
      {/* Hidden audio element */}

      <audio
        ref={musicAudioRef}
        preload="metadata"
      />

      {/* Artwork */}

      <div className="music-preview__artwork">
        {artwork ? (
          <img
            src={artwork}
            alt={`${title} artwork`}
            className="music-preview__image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div
            className="music-preview__placeholder"
            aria-hidden="true"
          >
            {providerIcon}
          </div>
        )}
      </div>

      {/* Music Information */}

      <div className="music-preview__info">
        <div className="music-preview__title">
          {title}
        </div>

        <div className="music-preview__artist">
          {artist}
        </div>

        <div className="music-preview__provider">
          {providerLabel}
        </div>
      </div>

      {/* Controls */}

      <div className="music-preview__controls">

        {hasAudio ? (
          <>
            {/* Play / Pause */}

            <button
              type="button"
              onClick={handleToggle}
              className="music-preview__play"
              aria-label={
                isPlaying &&
                isCurrentPreview
                  ? `Pause ${title}`
                  : `Play ${title}`
              }
            >
              {isPlaying &&
              isCurrentPreview
                ? "Pause"
                : "Play"}
            </button>

            {/* Stop */}

            <button
              type="button"
              onClick={handleStop}
              className="music-preview__stop"
              aria-label={`Stop ${title}`}
            >
              Stop
            </button>
          </>
        ) : hasExternalUrl ? (
          <>
            {/* External Provider Link */}

            <button
              type="button"
              onClick={
                handleOpenExternal
              }
              className="music-preview__play"
              aria-label={`Open ${title} on ${providerLabel}`}
            >
              Open
            </button>

            <span className="music-preview__unavailable">
              Audio preview unavailable
            </span>
          </>
        ) : (
          <span className="music-preview__unavailable">
            Preview unavailable
          </span>
        )}

      </div>
    </div>
  );
};

export default MusicPreview;