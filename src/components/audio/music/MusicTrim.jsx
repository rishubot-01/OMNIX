import { useEffect, useMemo, useState } from "react";

/*
|--------------------------------------------------------------------------
| MusicTrim
|--------------------------------------------------------------------------
|
| Responsibilities:
|
| 1. Show selected music duration
| 2. Allow start time selection
| 3. Allow end time selection
| 4. Keep start < end
| 5. Reset trim
| 6. Send values back through callbacks
|
| Supported Providers:
|
| Jamendo:
| - Trimming enabled
|
| Epidemic Sound:
| - Trimming enabled when duration is available
|
| Spotify:
| - Trimming enabled when duration is available
|
| The component is provider-agnostic.
| All providers use the same trim system.
|
*/

const MusicTrim = ({
  music = null,

  startTime = 0,

  endTime = null,

  onStartTimeChange,

  onEndTimeChange,

  onReset,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Provider
  |--------------------------------------------------------------------------
  */

  const provider = String(
    music?.provider || "jamendo"
  )
    .trim()
    .toLowerCase();

  const providerLabel = useMemo(() => {
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
  }, [provider]);

  /*
  |--------------------------------------------------------------------------
  | Music Duration
  |--------------------------------------------------------------------------
  */

  const duration = useMemo(() => {
    const value = Number(music?.duration);

    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }

    return value;
  }, [music]);

  /*
  |--------------------------------------------------------------------------
  | Local Input State
  |--------------------------------------------------------------------------
  */

  const [startInput, setStartInput] = useState(
    String(startTime ?? 0)
  );

  const [endInput, setEndInput] = useState(
    endTime !== null &&
      endTime !== undefined
      ? String(endTime)
      : duration > 0
      ? String(duration)
      : ""
  );

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Sync Start Time
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setStartInput(String(startTime ?? 0));
  }, [startTime]);

  /*
  |--------------------------------------------------------------------------
  | Sync End Time
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      endTime !== null &&
      endTime !== undefined
    ) {
      setEndInput(String(endTime));
      return;
    }

    if (duration > 0) {
      setEndInput(String(duration));
    } else {
      setEndInput("");
    }
  }, [endTime, duration]);

  /*
  |--------------------------------------------------------------------------
  | Reset Local State When Music Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!music) {
      setStartInput("0");
      setEndInput("");
      setError("");
      return;
    }

    setStartInput(String(startTime ?? 0));

    setEndInput(
      endTime !== null &&
        endTime !== undefined
        ? String(endTime)
        : duration > 0
        ? String(duration)
        : ""
    );

    setError("");
  }, [
    music,
    duration,
    startTime,
    endTime,
  ]);

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

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Parse Time
  |--------------------------------------------------------------------------
  */

  const parseTime = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return null;
    }

    return number;
  };

  /*
  |--------------------------------------------------------------------------
  | Validate Trim
  |--------------------------------------------------------------------------
  */

  const validateTrim = (start, end) => {
    /*
     * Start must be >= 0
     */

    if (
      start === null ||
      start < 0
    ) {
      return "Start time cannot be negative.";
    }

    /*
     * End must be >= 0
     */

    if (
      end === null ||
      end < 0
    ) {
      return "End time cannot be negative.";
    }

    /*
     * End must be greater than start.
     */

    if (end <= start) {
      return "End time must be greater than start time.";
    }

    /*
     * If duration is known,
     * don't allow values outside track.
     */

    if (
      duration > 0 &&
      end > duration
    ) {
      return "End time cannot exceed music duration.";
    }

    if (
      duration > 0 &&
      start > duration
    ) {
      return "Start time cannot exceed music duration.";
    }

    return "";
  };

  /*
  |--------------------------------------------------------------------------
  | Start Time Input
  |--------------------------------------------------------------------------
  */

  const handleStartInputChange = (
    event
  ) => {
    const value = event.target.value;

    setStartInput(value);
    setError("");

    /*
     * Allow temporary empty input.
     */

    if (value === "") {
      return;
    }

    const start = parseTime(value);
    const end = parseTime(endInput);

    if (start === null) {
      return;
    }

    /*
     * Validate relationship.
     */

    if (end !== null) {
      const validationError =
        validateTrim(
          start,
          end
        );

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onStartTimeChange?.(start);
  };

  /*
  |--------------------------------------------------------------------------
  | End Time Input
  |--------------------------------------------------------------------------
  */

  const handleEndInputChange = (
    event
  ) => {
    const value = event.target.value;

    setEndInput(value);
    setError("");

    /*
     * Allow temporary empty input.
     */

    if (value === "") {
      return;
    }

    const end = parseTime(value);
    const start = parseTime(startInput);

    if (end === null) {
      return;
    }

    /*
     * Validate relationship.
     */

    if (start !== null) {
      const validationError =
        validateTrim(
          start,
          end
        );

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onEndTimeChange?.(end);
  };

  /*
  |--------------------------------------------------------------------------
  | Slider - Start
  |--------------------------------------------------------------------------
  */

  const handleStartSliderChange = (
    event
  ) => {
    const value = Number(
      event.target.value
    );

    const end = Number(endInput);

    const validationError =
      validateTrim(
        value,
        end
      );

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    setStartInput(String(value));

    onStartTimeChange?.(value);
  };

  /*
  |--------------------------------------------------------------------------
  | Slider - End
  |--------------------------------------------------------------------------
  */

  const handleEndSliderChange = (
    event
  ) => {
    const value = Number(
      event.target.value
    );

    const start = Number(startInput);

    const validationError =
      validateTrim(
        start,
        value
      );

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    setEndInput(String(value));

    onEndTimeChange?.(value);
  };

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    const resetStart = 0;

    const resetEnd =
      duration > 0
        ? duration
        : null;

    setStartInput(
      String(resetStart)
    );

    setEndInput(
      resetEnd !== null
        ? String(resetEnd)
        : ""
    );

    setError("");

    /*
     * Parent hook handles actual reset.
     */

    onReset?.();

    /*
     * If parent does not provide onReset,
     * synchronize individual callbacks.
     */

    if (!onReset) {
      onStartTimeChange?.(
        resetStart
      );

      if (
        resetEnd !== null
      ) {
        onEndTimeChange?.(
          resetEnd
        );
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | No Music
  |--------------------------------------------------------------------------
  */

  if (!music) {
    return (
      <div className="music-trim">
        <div className="music-trim__empty">
          Select music before trimming.
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | No Duration
  |--------------------------------------------------------------------------
  */

  if (duration <= 0) {
    return (
      <div
        className="music-trim"
        data-provider={provider}
      >
        <div className="music-trim__header">
          <div>
            <div className="music-trim__title">
              Trim music
            </div>

            <div className="music-trim__track">
              {music.name ||
                music.title ||
                "Selected music"}
            </div>

            <div className="music-trim__provider">
              {providerLabel}
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="music-trim__reset"
          >
            Reset
          </button>
        </div>

        <div className="music-trim__empty">
          Music duration is unavailable.
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Current Values
  |--------------------------------------------------------------------------
  */

  const currentStart =
    Number(startInput) || 0;

  const currentEnd =
    Number(endInput) || duration;

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="music-trim"
      data-provider={provider}
    >
      {/* Header */}

      <div className="music-trim__header">
        <div>
          <div className="music-trim__title">
            Trim music
          </div>

          <div className="music-trim__track">
            {music.name ||
              music.title ||
              "Selected music"}
          </div>

          <div className="music-trim__provider">
            {providerLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="music-trim__reset"
        >
          Reset
        </button>
      </div>

      {/* Current Range */}

      <div className="music-trim__range">
        <span>
          {formatTime(currentStart)}
        </span>

        <span>
          {formatTime(currentEnd)}
        </span>
      </div>

      {/* Start Slider */}

      <div className="music-trim__control">
        <label htmlFor="music-trim-start">
          Start
        </label>

        <input
          id="music-trim-start"
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={Math.min(
            currentStart,
            duration
          )}
          onChange={
            handleStartSliderChange
          }
        />

        <input
          type="number"
          min="0"
          max={duration}
          step="0.1"
          value={startInput}
          onChange={
            handleStartInputChange
          }
          aria-label="Music start time"
        />
      </div>

      {/* End Slider */}

      <div className="music-trim__control">
        <label htmlFor="music-trim-end">
          End
        </label>

        <input
          id="music-trim-end"
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={Math.min(
            currentEnd,
            duration
          )}
          onChange={
            handleEndSliderChange
          }
        />

        <input
          type="number"
          min="0"
          max={duration}
          step="0.1"
          value={endInput}
          onChange={
            handleEndInputChange
          }
          aria-label="Music end time"
        />
      </div>

      {/* Duration */}

      <div className="music-trim__duration">
        Selected:{" "}
        {formatTime(
          Math.max(
            0,
            currentEnd -
              currentStart
          )
        )}

        {" / "}

        {formatTime(duration)}
      </div>

      {/* Validation Error */}

      {error && (
        <div
          className="music-trim__error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default MusicTrim;