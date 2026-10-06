import { useEffect, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| AudioRecorder
|--------------------------------------------------------------------------
|
| Reusable audio recorder for OMNIX.
|
| Responsibilities:
|
| 1. Ask browser for microphone permission
| 2. Start recording
| 3. Stop recording
| 4. Create an audio Blob
| 5. Return recorded audio to parent
|
| This component does NOT:
|
| - upload audio
| - call Cloudinary
| - call backend API
| - save audio to database
| - select music
| - mix music + original audio
| - depend on any music provider
|
|--------------------------------------------------------------------------
*/

const AudioRecorder = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const mediaRecorderRef = useRef(null);

  const mediaStreamRef = useRef(null);

  const chunksRef = useRef([]);

  const timerRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [isRecording, setIsRecording] = useState(false);

  const [recordingTime, setRecordingTime] = useState(0);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Browser Support
  |--------------------------------------------------------------------------
  */

  const isMediaRecorderSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined";

  /*
  |--------------------------------------------------------------------------
  | Stop Timer
  |--------------------------------------------------------------------------
  */

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Start Timer
  |--------------------------------------------------------------------------
  */

  const startTimer = () => {
    stopTimer();

    timerRef.current = setInterval(() => {
      setRecordingTime((previousTime) => previousTime + 1);
    }, 1000);
  };

  /*
  |--------------------------------------------------------------------------
  | Cleanup Media Stream
  |--------------------------------------------------------------------------
  */

  const cleanupStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      mediaStreamRef.current = null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Select Supported MIME Type
  |--------------------------------------------------------------------------
  |
  | Different browsers support different MediaRecorder formats.
  |
  */

  const getSupportedMimeType = () => {
    if (
      typeof window === "undefined" ||
      typeof window.MediaRecorder === "undefined"
    ) {
      return "";
    }

    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
    ];

    for (const mimeType of mimeTypes) {
      if (
        window.MediaRecorder.isTypeSupported(
          mimeType
        )
      ) {
        return mimeType;
      }
    }

    return "";
  };

  /*
  |--------------------------------------------------------------------------
  | Format Recording Time
  |--------------------------------------------------------------------------
  */

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Math.floor(Number(seconds) || 0)
    );

    const minutes = Math.floor(
      safeSeconds / 60
    );

    const remainingSeconds =
      safeSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Start Recording
  |--------------------------------------------------------------------------
  */

  const startRecording = async () => {
    if (disabled) {
      return;
    }

    if (!isMediaRecorderSupported) {
      setError(
        "Audio recording is not supported by this browser."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Recording Sessions
    |--------------------------------------------------------------------------
    */

    if (isRecording) {
      return;
    }

    try {
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Request Microphone Access
      |--------------------------------------------------------------------------
      */

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      mediaStreamRef.current = stream;

      /*
      |--------------------------------------------------------------------------
      | Detect Supported Recording Format
      |--------------------------------------------------------------------------
      */

      const mimeType =
        getSupportedMimeType();

      /*
      |--------------------------------------------------------------------------
      | Create MediaRecorder
      |--------------------------------------------------------------------------
      */

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      /*
      |--------------------------------------------------------------------------
      | Clear Old Chunks
      |--------------------------------------------------------------------------
      */

      chunksRef.current = [];

      /*
      |--------------------------------------------------------------------------
      | Receive Audio Chunks
      |--------------------------------------------------------------------------
      */

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      /*
      |--------------------------------------------------------------------------
      | Recording Stopped
      |--------------------------------------------------------------------------
      */

      mediaRecorder.onstop = () => {
        try {
          const actualMimeType =
            mediaRecorder.mimeType ||
            mimeType ||
            "audio/webm";

          const audioBlob = new Blob(
            chunksRef.current,
            {
              type: actualMimeType,
            }
          );

          /*
          |--------------------------------------------------------------------------
          | Validate Recorded Audio
          |--------------------------------------------------------------------------
          */

          if (audioBlob.size === 0) {
            setError(
              "No audio was recorded."
            );

            return;
          }

          /*
          |--------------------------------------------------------------------------
          | Return Audio To Parent
          |--------------------------------------------------------------------------
          */

          onRecordingComplete?.(
            audioBlob
          );
        } finally {
          chunksRef.current = [];

          cleanupStream();
        }
      };

      /*
      |--------------------------------------------------------------------------
      | Recorder Error
      |--------------------------------------------------------------------------
      */

      mediaRecorder.onerror = () => {
        setError(
          "An error occurred while recording audio."
        );

        stopTimer();

        setIsRecording(false);

        cleanupStream();
      };

      /*
      |--------------------------------------------------------------------------
      | Start MediaRecorder
      |--------------------------------------------------------------------------
      */

      mediaRecorder.start();

      setIsRecording(true);

      setRecordingTime(0);

      startTimer();

      onRecordingStart?.();
    } catch (error) {
      console.error(
        "Audio recording error:",
        error
      );

      stopTimer();

      setIsRecording(false);

      cleanupStream();

      /*
      |--------------------------------------------------------------------------
      | Browser Microphone Errors
      |--------------------------------------------------------------------------
      */

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setError(
          "Microphone permission was denied."
        );
      } else if (
        error?.name ===
        "NotFoundError"
      ) {
        setError(
          "No microphone was found."
        );
      } else if (
        error?.name ===
        "NotReadableError"
      ) {
        setError(
          "Microphone is already being used by another application."
        );
      } else {
        setError(
          "Unable to access the microphone."
        );
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Stop Recording
  |--------------------------------------------------------------------------
  */

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state === "inactive"
    ) {
      return;
    }

    try {
      recorder.stop();
    } catch (error) {
      console.error(
        "Stop recording error:",
        error
      );

      cleanupStream();
    }

    stopTimer();

    setIsRecording(false);

    onRecordingStop?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Recording
  |--------------------------------------------------------------------------
  */

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cleanup On Unmount
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      stopTimer();

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !== "inactive"
      ) {
        try {
          recorder.stop();
        } catch {
          // Recorder may already be stopping.
        }
      }

      cleanupStream();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Unsupported Browser
  |--------------------------------------------------------------------------
  */

  if (!isMediaRecorderSupported) {
    return (
      <div className="audio-recorder">
        <div className="audio-recorder__error">
          Audio recording is not
          supported by this browser.
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
    <div className="audio-recorder">

      {/* Header */}

      <div className="audio-recorder__header">
        <div className="audio-recorder__title">
          Original Audio
        </div>

        <div className="audio-recorder__time">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Recording Status */}

      <div
        className={`audio-recorder__status ${
          isRecording
            ? "audio-recorder__status--recording"
            : ""
        }`}
      >
        {isRecording
          ? "Recording..."
          : "Ready to record"}
      </div>

      {/* Record Button */}

      <button
        type="button"
        className={`audio-recorder__button ${
          isRecording
            ? "audio-recorder__button--stop"
            : "audio-recorder__button--record"
        }`}
        onClick={toggleRecording}
        disabled={disabled}
        aria-label={
          isRecording
            ? "Stop recording"
            : "Start recording"
        }
      >
        <span className="audio-recorder__button-icon">
          {isRecording ? "■" : "●"}
        </span>

        <span>
          {isRecording
            ? "Stop"
            : "Record"}
        </span>
      </button>

      {/* Error */}

      {error && (
        <div
          className="audio-recorder__error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;