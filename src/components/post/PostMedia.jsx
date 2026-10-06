import {
  useEffect,
  useRef,
} from "react";

function PostMedia({
  media,
  mediaUrl,
  type,
  audio,
  alt = "OMNIX post",
}) {
  const source = mediaUrl || media;

  const musicAudioRef =
    useRef(null);

  const originalAudioRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const musicTimerRef =
    useRef(null);

  const hasAudio =
    Boolean(audio);

  const mediaType =
    type ||
    (source
      ? detectMediaType(source)
      : "image");

  const music =
    audio?.music;

  const original =
    audio?.original;

  const musicStart =
    Number(audio?.startTime) || 0;

  const musicEnd =
    audio?.endTime !== undefined &&
    audio?.endTime !== null
      ? Number(audio.endTime)
      : null;

  const musicVolume =
    audio?.musicVolume !== undefined
      ? Math.max(
          0,
          Math.min(
            1,
            Number(audio.musicVolume)
          )
        )
      : 1;

  const originalVolume =
    audio?.originalVolume !== undefined
      ? Math.max(
          0,
          Math.min(
            1,
            Number(audio.originalVolume)
          )
        )
      : 1;

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [
    source,
    audio,
  ]);

  useEffect(() => {
    if (!hasAudio) {
      return;
    }

    return () => {
      stopAudio();
    };
  }, [hasAudio]);

  if (!source) {
    return null;
  }

  const stopAudio = () => {
    if (
      musicTimerRef.current
    ) {
      clearInterval(
        musicTimerRef.current
      );

      musicTimerRef.current =
        null;
    }

    if (
      musicAudioRef.current
    ) {
      musicAudioRef.current.pause();

      musicAudioRef.current.currentTime =
        0;
    }

    if (
      originalAudioRef.current
    ) {
      originalAudioRef.current.pause();

      originalAudioRef.current.currentTime =
        0;
    }
  };

  const prepareMusicAudio = () => {
    const audioElement =
      musicAudioRef.current;

    if (
      !audioElement ||
      !music?.audioUrl
    ) {
      return null;
    }

    audioElement.volume =
      musicVolume;

    audioElement.currentTime =
      Math.max(
        0,
        musicStart
      );

    return audioElement;
  };

  const prepareOriginalAudio =
    () => {
      const audioElement =
        originalAudioRef.current;

      if (
        !audioElement ||
        !original?.url
      ) {
        return null;
      }

      audioElement.volume =
        originalVolume;

      audioElement.currentTime =
        0;

      return audioElement;
    };

  const startAudio = async () => {
    stopAudio();

    if (
      audio?.mode === "music"
    ) {
      const musicElement =
        prepareMusicAudio();

      if (!musicElement) {
        return;
      }

      try {
        await musicElement.play();
      } catch (error) {
        console.error(
          "Music playback failed:",
          error
        );
      }

      startMusicTimer();

      return;
    }

    if (
      audio?.mode === "original"
    ) {
      const originalElement =
        prepareOriginalAudio();

      if (!originalElement) {
        return;
      }

      try {
        await originalElement.play();
      } catch (error) {
        console.error(
          "Original audio playback failed:",
          error
        );
      }

      return;
    }

    if (
      audio?.mode === "mixed"
    ) {
      const musicElement =
        prepareMusicAudio();

      const originalElement =
        prepareOriginalAudio();

      if (musicElement) {
        try {
          await musicElement.play();
        } catch (error) {
          console.error(
            "Music playback failed:",
            error
          );
        }
      }

      if (originalElement) {
        try {
          await originalElement.play();
        } catch (error) {
          console.error(
            "Original audio playback failed:",
            error
          );
        }
      }

      startMusicTimer();
    }
  };

  const startMusicTimer = () => {
    if (
      musicEnd === null
    ) {
      return;
    }

    if (
      musicTimerRef.current
    ) {
      clearInterval(
        musicTimerRef.current
      );
    }

    musicTimerRef.current =
      setInterval(() => {
        const musicElement =
          musicAudioRef.current;

        if (!musicElement) {
          return;
        }

        if (
          musicElement.currentTime >=
          musicEnd
        ) {
          musicElement.pause();

          musicElement.currentTime =
            musicStart;

          if (
            musicTimerRef.current
          ) {
            clearInterval(
              musicTimerRef.current
            );

            musicTimerRef.current =
              null;
          }
        }
      }, 100);
  };

  const handleVideoPlay =
    async () => {
      if (!hasAudio) {
        return;
      }

      await startAudio();
    };

  const handleVideoPause =
    () => {
      if (!hasAudio) {
        return;
      }

      if (
        musicAudioRef.current
      ) {
        musicAudioRef.current.pause();
      }

      if (
        originalAudioRef.current
      ) {
        originalAudioRef.current.pause();
      }

      if (
        musicTimerRef.current
      ) {
        clearInterval(
          musicTimerRef.current
        );

        musicTimerRef.current =
          null;
      }
    };

  const handleVideoEnded =
    () => {
      stopAudio();
    };

  const handleImageAudioStart =
    async () => {
      if (!hasAudio) {
        return;
      }

      await startAudio();
    };

  const handleMusicEnded =
    () => {
      if (
        musicTimerRef.current
      ) {
        clearInterval(
          musicTimerRef.current
        );

        musicTimerRef.current =
          null;
      }

      if (
        audio?.mode === "music"
      ) {
        const musicElement =
          musicAudioRef.current;

        if (musicElement) {
          musicElement.currentTime =
            musicStart;
        }
      }
    };

  if (
    mediaType === "video"
  ) {
    return (
      <div className="overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={source}
          controls
          playsInline
          preload="metadata"
          muted={hasAudio}
          onPlay={
            handleVideoPlay
          }
          onPause={
            handleVideoPause
          }
          onEnded={
            handleVideoEnded
          }
          className="max-h-[700px] w-full object-contain"
        />

        {music?.audioUrl && (
          <audio
            ref={musicAudioRef}
            src={music.audioUrl}
            preload="metadata"
            onEnded={
              handleMusicEnded
            }
          />
        )}

        {original?.url && (
          <audio
            ref={
              originalAudioRef
            }
            src={original.url}
            preload="metadata"
          />
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-gray-50">
      <img
        src={source}
        alt={alt}
        loading="lazy"
        className="max-h-[700px] w-full object-contain"
      />

      {music?.audioUrl && (
        <audio
          ref={musicAudioRef}
          src={music.audioUrl}
          preload="metadata"
          onEnded={
            handleMusicEnded
          }
        />
      )}

      {original?.url && (
        <audio
          ref={
            originalAudioRef
          }
          src={original.url}
          preload="metadata"
        />
      )}

      {hasAudio && (
        <button
          type="button"
          onClick={
            handleImageAudioStart
          }
          className="mt-2 px-4 py-2 text-sm"
        >
          Play Audio
        </button>
      )}
    </div>
  );
}

function detectMediaType(url) {
  const cleanUrl =
    url
      .split("?")[0]
      .toLowerCase();

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.includes("/video/")
  ) {
    return "video";
  }

  return "image";
}

export default PostMedia;