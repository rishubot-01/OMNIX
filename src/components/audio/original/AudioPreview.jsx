import { useEffect, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| AudioPreview
|--------------------------------------------------------------------------
|
| Reusable preview component for OMNIX original audio.
|
| Responsibilities:
|
| 1. Create a temporary URL from recorded audio Blob/File
| 2. Play recorded audio
| 3. Pause recorded audio
| 4. Stop recorded audio
| 5. Show playback progress
| 6. Show current time / duration
| 7. Control playback volume
| 8. Clean up temporary Object URL
|
| This component does NOT:
|
| - upload audio
| - call backend API
| - call Cloudinary
| - save audio to database
| - depend on any music provider
|
|--------------------------------------------------------------------------
*/

const AudioPreview = ({
  audio = null,

  volume = 1,

  onPlay,

  onPause,

  onStop,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const audioRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [audioUrl, setAudioUrl] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  const [duration, setDuration] = useState(0);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Create Audio URL
  |--------------------------------------------------------------------------
  |
  | Audio can be:
  |
  | - Blob
  | - File
  | - Existing URL string
  |
  */

  useEffect(() => {
    /*
    |--------------------------------------------------------------------------
    | No Audio
    |--------------------------------------------------------------------------
    */

    if (!audio) {
      setAudioUrl("");

      setCurrentTime(0);

      setDuration(0);

      setIsPlaying(false);

      setError("");

      return undefined;
    }

    /*
    |--------------------------------------------------------------------------
    | Existing URL
    |--------------------------------------------------------------------------
    */

    if (typeof audio === "string") {
      setAudioUrl(audio);

      setCurrentTime(0);

      setDuration(0);

      setIsPlaying(false);

      setError("");

      return undefined;
    }

    /*
    |--------------------------------------------------------------------------
    | Blob / File
    |--------------------------------------------------------------------------
    */

    if (audio instanceof Blob) {
      const objectUrl = URL.createObjectURL(audio);

      setAudioUrl(objectUrl);

      setCurrentTime(0);

      setDuration(0);

      setIsPlaying(false);

      setError("");

      /*
      |--------------------------------------------------------------------------
      | Cleanup Object URL
      |--------------------------------------------------------------------------
      */

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Unsupported Audio
    |--------------------------------------------------------------------------
    */

    setAudioUrl("");

    setCurrentTime(0);

    setDuration(0);

    setIsPlaying(false);

    setError("Invalid audio preview.");

    return undefined;
  }, [audio]);

  /*
  |--------------------------------------------------------------------------
  | Apply Volume
  |--------------------------------------------------------------------------
  |
  | Browser audio volume accepts values between 0 and 1.
  |
  */

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    const numericVolume = Number(volume);

    const safeVolume = Number.isFinite(numericVolume)
      ? Math.min(1, Math.max(0, numericVolume))
      : 0;

    audioElement.volume = safeVolume;
  }, [volume, audioUrl]);

  /*
  |--------------------------------------------------------------------------
  | Audio Event Handlers
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Metadata Loaded
    |--------------------------------------------------------------------------
    */

    const handleLoadedMetadata = () => {
      const audioDuration = Number(audioElement.duration);

      if (
        Number.isFinite(audioDuration) &&
        audioDuration > 0
      ) {
        setDuration(audioDuration);
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Time Update
    |--------------------------------------------------------------------------
    */

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    /*
    |--------------------------------------------------------------------------
    | Play
    |--------------------------------------------------------------------------
    */

    const handlePlay = () => {
      setIsPlaying(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Pause
    |--------------------------------------------------------------------------
    */

    const handlePause = () => {
      setIsPlaying(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Ended
    |--------------------------------------------------------------------------
    */

    const handleEnded = () => {
      setIsPlaying(false);

      setCurrentTime(audioElement.duration || 0);
    };

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    const handleError = () => {
      setIsPlaying(false);

      setError("Unable to play this audio.");
    };

    /*
    |--------------------------------------------------------------------------
    | Register Events
    |--------------------------------------------------------------------------
    */

    audioElement.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audioElement.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audioElement.addEventListener(
      "play",
      handlePlay
    );

    audioElement.addEventListener(
      "pause",
      handlePause
    );

    audioElement.addEventListener(
      "ended",
      handleEnded
    );

    audioElement.addEventListener(
      "error",
      handleError
    );

    /*
    |--------------------------------------------------------------------------
    | Cleanup Events
    |--------------------------------------------------------------------------
    */

    return () => {
      audioElement.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audioElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audioElement.removeEventListener(
        "play",
        handlePlay
      );

      audioElement.removeEventListener(
        "pause",
        handlePause
      );

      audioElement.removeEventListener(
        "ended",
        handleEnded
      );

      audioElement.removeEventListener(
        "error",
        handleError
      );
    };
  }, [audioUrl]);

  /*
  |--------------------------------------------------------------------------
  | Format Time
  |--------------------------------------------------------------------------
  */

  const formatTime = (value) => {
    const seconds = Math.max(
      0,
      Math.floor(Number(value) || 0)
    );

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Play
  |--------------------------------------------------------------------------
  */

  const handlePlay = async () => {
    const audioElement = audioRef.current;

    if (!audioElement || !audioUrl) {
      return;
    }

    try {
      setError("");

      await audioElement.play();

      onPlay?.();
    } catch (playError) {
      console.error(
        "Audio play error:",
        playError
      );

      setIsPlaying(false);

      setError(
        "Unable to play audio. Please try again."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Pause
  |--------------------------------------------------------------------------
  */

  const handlePause = () => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.pause();

    onPause?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Stop
  |--------------------------------------------------------------------------
  */

  const handleStop = () => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.pause();

    audioElement.currentTime = 0;

    setCurrentTime(0);

    setIsPlaying(false);

    onStop?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Play / Pause
  |--------------------------------------------------------------------------
  */

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Seek
  |--------------------------------------------------------------------------
  */

  const handleSeek = (event) => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    const value = Number(event.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    audioElement.currentTime = value;

    setCurrentTime(value);
  };

  /*
  |--------------------------------------------------------------------------
  | No Audio
  |--------------------------------------------------------------------------
  */

  if (!audio) {
    return (
      <div className="audio-preview">
        <div className="audio-preview__empty">
          No recorded audio available.
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="audio-preview">

      {/* Hidden Native Audio */}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* Header */}

      <div className="audio-preview__header">
        <div className="audio-preview__title">
          Original Audio
        </div>

        <div className="audio-preview__status">
          {isPlaying
            ? "Playing"
            : "Paused"}
        </div>
      </div>

      {/* Progress */}

      <div className="audio-preview__progress">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={Math.min(
            currentTime,
            duration || 0
          )}
          onChange={handleSeek}
          disabled={!duration}
          aria-label="Audio progress"
        />
      </div>

      {/* Time */}

      <div className="audio-preview__time">
        <span>
          {formatTime(currentTime)}
        </span>

        <span>
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}

      <div className="audio-preview__controls">

        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={!audioUrl}
          className="audio-preview__play-button"
          aria-label={
            isPlaying
              ? "Pause audio"
              : "Play audio"
          }
        >
          {isPlaying
            ? "Pause"
            : "Play"}
        </button>

        <button
          type="button"
          onClick={handleStop}
          disabled={!audioUrl}
          className="audio-preview__stop-button"
          aria-label="Stop audio"
        >
          Stop
        </button>

      </div>

      {/* Error */}

      {error && (
        <div
          className="audio-preview__error"
          role="alert"
        >
          {error}
        </div>
      )}

    </div>
  );
};

export default AudioPreview;