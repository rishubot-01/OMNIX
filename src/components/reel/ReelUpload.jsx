import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import AudioPicker from "../audio/AudioPicker";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const ReelUpload = ({
  onUpload,
  uploading = false,
  uploadProgress = 0,
  onClose,
}) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoPreviewRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [caption, setCaption] = useState("");

  const [error, setError] = useState("");

  const [audioConfig, setAudioConfig] =
    useState(undefined);

  const [audioFile, setAudioFile] =
    useState(null);

  /* =========================================================
     VIDEO PREVIEW STATE
  ========================================================= */

  const [videoRatio, setVideoRatio] =
    useState(9 / 16);

  const [videoDuration, setVideoDuration] =
    useState(0);

  const [isPreviewPlaying, setIsPreviewPlaying] =
    useState(false);

  const [isPreviewMuted, setIsPreviewMuted] =
    useState(true);

  const [previewProgress, setPreviewProgress] =
    useState(0);

  /* =========================================================
     CLEANUP OBJECT URL
  ========================================================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =========================================================
     PROCESS VIDEO FILE
  ========================================================= */

  const processVideoFile = (
    file,
    inputRef
  ) => {
    setError("");

    if (!file) {
      return;
    }

    /* -------------------------------------------------------
       TYPE VALIDATION
    ------------------------------------------------------- */

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Only MP4, WebM, and MOV videos are allowed."
      );

      if (inputRef?.current) {
        inputRef.current.value = "";
      }

      return;
    }

    /* -------------------------------------------------------
       SIZE VALIDATION
    ------------------------------------------------------- */

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Reel video cannot exceed 50 MB."
      );

      if (inputRef?.current) {
        inputRef.current.value = "";
      }

      return;
    }

    /* -------------------------------------------------------
       REVOKE OLD PREVIEW URL
    ------------------------------------------------------- */

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    /* -------------------------------------------------------
       CREATE NEW PREVIEW URL
    ------------------------------------------------------- */

    const newPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);

    /* -------------------------------------------------------
       RESET PREVIEW STATE
    ------------------------------------------------------- */

    setVideoRatio(9 / 16);
    setVideoDuration(0);
    setIsPreviewPlaying(false);
    setIsPreviewMuted(true);
    setPreviewProgress(0);
  };

  /* =========================================================
     GALLERY FILE CHANGE
  ========================================================= */

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    processVideoFile(
      file,
      fileInputRef
    );
  };

  /* =========================================================
     CAMERA FILE CHANGE
  ========================================================= */

  const handleCameraChange = (event) => {
    const file =
      event.target.files?.[0];

    processVideoFile(
      file,
      cameraInputRef
    );
  };

  /* =========================================================
     REMOVE VIDEO
  ========================================================= */

  const handleRemoveVideo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");

    setError("");

    setVideoRatio(9 / 16);
    setVideoDuration(0);
    setIsPreviewPlaying(false);
    setIsPreviewMuted(true);
    setPreviewProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  /* =========================================================
     CAPTION CHANGE
  ========================================================= */

  const handleCaptionChange = (event) => {
    const value =
      event.target.value;

    if (value.length <= 2200) {
      setCaption(value);
      setError("");
    }
  };

  /* =========================================================
     AUDIO CHANGE
  ========================================================= */

  const handleAudioChange = (config) => {
    setAudioConfig(config);

    if (
      config?.mode === "original" ||
      config?.mode === "mixed"
    ) {
      const original =
        config?.original;

      if (original?.blob) {
        setAudioFile(original.blob);
      } else {
        setAudioFile(null);
      }
    } else {
      setAudioFile(null);
    }
  };

  /* =========================================================
     VIDEO METADATA
     
     Detect:
     - Width
     - Height
     - Aspect ratio
     - Duration
  ========================================================= */

  const handleLoadedMetadata = (event) => {
    const video =
      event.currentTarget;

    if (!video) {
      return;
    }

    const width =
      video.videoWidth;

    const height =
      video.videoHeight;

    /* -------------------------------------------------------
       ACTUAL VIDEO RATIO
    ------------------------------------------------------- */

    if (width && height) {
      const ratio =
        width / height;

      setVideoRatio(ratio);
    }

    /* -------------------------------------------------------
       VIDEO DURATION
    ------------------------------------------------------- */

    if (
      Number.isFinite(video.duration)
    ) {
      setVideoDuration(
        video.duration
      );
    }

    /* -------------------------------------------------------
       DEFAULT PREVIEW STATE
    ------------------------------------------------------- */

    video.muted = true;

    setIsPreviewMuted(true);
  };

  /* =========================================================
     PREVIEW PLAY
  ========================================================= */

  const handlePreviewPlay = async () => {
    const video =
      videoPreviewRef.current;

    if (!video) {
      return;
    }

    try {
      await video.play();

      setIsPreviewPlaying(true);
    } catch (playError) {
      console.error(
        "Preview play error:",
        playError
      );

      setIsPreviewPlaying(false);
    }
  };

  /* =========================================================
     PREVIEW PAUSE
  ========================================================= */

  const handlePreviewPause = () => {
    const video =
      videoPreviewRef.current;

    if (!video) {
      return;
    }

    video.pause();

    setIsPreviewPlaying(false);
  };

  /* =========================================================
     TOGGLE PREVIEW PLAY / PAUSE
  ========================================================= */

  const togglePreviewPlay = (
    event
  ) => {
    event?.stopPropagation();

    const video =
      videoPreviewRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      handlePreviewPlay();
    } else {
      handlePreviewPause();
    }
  };

  /* =========================================================
     TOGGLE PREVIEW MUTE
  ========================================================= */

  const togglePreviewMute = (
    event
  ) => {
    event?.stopPropagation();

    const video =
      videoPreviewRef.current;

    if (!video) {
      return;
    }

    const newMuted =
      !video.muted;

    video.muted = newMuted;

    setIsPreviewMuted(newMuted);
  };

  /* =========================================================
     VIDEO TIME UPDATE
  ========================================================= */

  const handlePreviewTimeUpdate = (
    event
  ) => {
    const video =
      event.currentTarget;

    if (
      !video.duration ||
      !Number.isFinite(video.duration)
    ) {
      return;
    }

    const progress =
      (video.currentTime /
        video.duration) *
      100;

    setPreviewProgress(progress);
  };

  /* =========================================================
     VIDEO END
  ========================================================= */

  const handlePreviewEnded = () => {
    setIsPreviewPlaying(false);
    setPreviewProgress(0);
  };

  /* =========================================================
     OPEN GALLERY
  ========================================================= */

  const handleSelectFromGallery =
    () => {
      if (uploading) {
        return;
      }

      fileInputRef.current?.click();
    };

  /* =========================================================
     OPEN CAMERA
  ========================================================= */

  const handleOpenCamera = () => {
    if (uploading) {
      return;
    }

    cameraInputRef.current?.click();
  };

  /* =========================================================
     FORMAT DURATION
  ========================================================= */

  const formatDuration = (
    seconds
  ) => {
    if (
      !Number.isFinite(seconds) ||
      seconds <= 0
    ) {
      return "0:00";
    }

    const totalSeconds =
      Math.floor(seconds);

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const remainingSeconds =
      totalSeconds % 60;

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /* =========================================================
     FORMAT VIDEO RATIO
  ========================================================= */

  const getRatioLabel = () => {
    if (!videoRatio) {
      return "9:16";
    }

    if (
      Math.abs(
        videoRatio - 9 / 16
      ) < 0.04
    ) {
      return "9:16";
    }

    if (
      Math.abs(
        videoRatio - 16 / 9
      ) < 0.04
    ) {
      return "16:9";
    }

    if (
      Math.abs(
        videoRatio - 1
      ) < 0.04
    ) {
      return "1:1";
    }

    if (
      Math.abs(
        videoRatio - 4 / 5
      ) < 0.04
    ) {
      return "4:5";
    }

    return `${videoRatio.toFixed(2)}:1`;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!selectedFile) {
      setError(
        "Please select or record a video for your reel."
      );

      return;
    }

    if (
      caption.trim().length >
      2200
    ) {
      setError(
        "Caption cannot exceed 2200 characters."
      );

      return;
    }

    if (!onUpload) {
      setError(
        "Upload handler is not configured."
      );

      return;
    }

    try {
      await onUpload({
        video: selectedFile,
        caption: caption.trim(),
        audio: audioConfig,
        audioFile,
      });

      /* -----------------------------------------------------
         RESET AFTER SUCCESSFUL UPLOAD
      ----------------------------------------------------- */

      handleRemoveVideo();

      setCaption("");
      setAudioConfig(undefined);
      setAudioFile(null);
    } catch (uploadError) {
      console.error(
        "Reel upload error:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Failed to upload reel."
      );
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="reel-upload">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="reel-upload-header">
        <div>
          <h2 className="reel-upload-title">
            Create Reel
          </h2>

          {!selectedFile && (
            <p className="reel-upload-subtitle">
              Share a video with the
              OMNIX community
            </p>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            className="reel-upload-close"
            onClick={onClose}
            disabled={uploading}
            aria-label="Close reel upload"
          >
            ✕
          </button>
        )}
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="reel-upload-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        className="reel-upload-form"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            NO VIDEO SELECTED
        =================================================== */}

        {!previewUrl ? (
          <>
            <div className="reel-create-options">

              {/* ---------------------------------------------
                  GALLERY
              --------------------------------------------- */}

              <button
                type="button"
                className="reel-create-option"
                onClick={
                  handleSelectFromGallery
                }
                disabled={uploading}
              >
                <span className="reel-create-option-icon">
                  📁
                </span>

                <span className="reel-create-option-title">
                  Choose from Gallery
                </span>

                <span className="reel-create-option-text">
                  Select a video from your device
                </span>
              </button>

              {/* ---------------------------------------------
                  CAMERA
              --------------------------------------------- */}

              <button
                type="button"
                className="reel-create-option"
                onClick={
                  handleOpenCamera
                }
                disabled={uploading}
              >
                <span className="reel-create-option-icon">
                  📷
                </span>

                <span className="reel-create-option-title">
                  Open Camera
                </span>

                <span className="reel-create-option-text">
                  Record a new reel
                </span>
              </button>
            </div>

            {/* ---------------------------------------------
                FORMAT INFO
            --------------------------------------------- */}

            <div className="reel-upload-format-info">
              <span>MP4</span>
              <span>WebM</span>
              <span>MOV</span>
              <span>Max 50 MB</span>
            </div>

            {/* ---------------------------------------------
                GALLERY INPUT
            --------------------------------------------- */}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={
                handleFileChange
              }
              disabled={uploading}
              hidden
            />

            {/* ---------------------------------------------
                CAMERA INPUT
            --------------------------------------------- */}

            <input
              ref={cameraInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              onChange={
                handleCameraChange
              }
              disabled={uploading}
              hidden
            />
          </>
        ) : (

          /* =================================================
             VIDEO SELECTED
          ================================================= */

          <div className="reel-upload-preview">

            {/* -----------------------------------------------
                VIDEO CONTAINER
            ----------------------------------------------- */}

            <div
              className="reel-upload-preview-player"
              style={{
                "--upload-video-ratio":
                  videoRatio,
              }}
            >
              <video
                ref={videoPreviewRef}
                src={previewUrl}
                className="reel-upload-preview-video"
                playsInline
                preload="metadata"
                muted={isPreviewMuted}
                onLoadedMetadata={
                  handleLoadedMetadata
                }
                onTimeUpdate={
                  handlePreviewTimeUpdate
                }
                onPlay={() =>
                  setIsPreviewPlaying(
                    true
                  )
                }
                onPause={() =>
                  setIsPreviewPlaying(
                    false
                  )
                }
                onEnded={
                  handlePreviewEnded
                }
              />

              {/* -------------------------------------------
                  CLICK AREA
              ------------------------------------------- */}

              <button
                type="button"
                className="reel-upload-preview-click"
                onClick={
                  togglePreviewPlay
                }
                aria-label={
                  isPreviewPlaying
                    ? "Pause preview"
                    : "Play preview"
                }
              />

              {/* -------------------------------------------
                  CENTER PLAY
              ------------------------------------------- */}

              {!isPreviewPlaying && (
                <button
                  type="button"
                  className="reel-upload-preview-play"
                  onClick={
                    togglePreviewPlay
                  }
                  aria-label="Play preview"
                >
                  ▶
                </button>
              )}

              {/* -------------------------------------------
                  MUTE BUTTON
              ------------------------------------------- */}

              <button
                type="button"
                className="reel-upload-preview-mute"
                onClick={
                  togglePreviewMute
                }
                aria-label={
                  isPreviewMuted
                    ? "Unmute preview"
                    : "Mute preview"
                }
              >
                {isPreviewMuted
                  ? "🔇"
                  : "🔊"}
              </button>

              {/* -------------------------------------------
                  VIDEO META
              ------------------------------------------- */}

              <div className="reel-upload-preview-meta">

                <span>
                  {getRatioLabel()}
                </span>

                <span>
                  {formatDuration(
                    videoDuration
                  )}
                </span>

              </div>

              {/* -------------------------------------------
                  PROGRESS
              ------------------------------------------- */}

              <div className="reel-upload-preview-progress">
                <div
                  className="reel-upload-preview-progress-bar"
                  style={{
                    width: `${previewProgress}%`,
                  }}
                />
              </div>
            </div>

            {/* -----------------------------------------------
                REMOVE VIDEO
            ----------------------------------------------- */}

            <button
              type="button"
              className="reel-upload-remove"
              onClick={
                handleRemoveVideo
              }
              disabled={uploading}
            >
              Remove Video
            </button>

            {/* -----------------------------------------------
                FILE INFO
            ----------------------------------------------- */}

            {selectedFile && (
              <div className="reel-upload-file-info">

                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {(
                    selectedFile.size /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </span>

              </div>
            )}
          </div>
        )}

        {/* ===================================================
            CAPTION
        =================================================== */}

        {selectedFile && (
          <>
            <div className="reel-upload-caption">

              <label htmlFor="reel-caption">
                Caption
              </label>

              <textarea
                id="reel-caption"
                value={caption}
                onChange={
                  handleCaptionChange
                }
                placeholder="Write a caption..."
                maxLength={2200}
                disabled={uploading}
                rows={4}
              />

              <div className="reel-upload-caption-count">
                {caption.length}/2200
              </div>

            </div>

            {/* =============================================
                AUDIO
            ============================================= */}

            <div className="reel-upload-audio">
              <AudioPicker
                onAudioChange={
                  handleAudioChange
                }
              />
            </div>
          </>
        )}

        {/* ===================================================
            UPLOAD PROGRESS
        =================================================== */}

        {uploading && (
          <div className="reel-upload-progress">

            <div className="reel-upload-progress-header">

              <span>
                Uploading reel...
              </span>

              <span>
                {Math.round(
                  uploadProgress
                )}
                %
              </span>

            </div>

            <div className="reel-upload-progress-track">

              <div
                className="reel-upload-progress-bar"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      uploadProgress
                    )
                  )}%`,
                }}
              />

            </div>

          </div>
        )}

        {/* ===================================================
            SUBMIT
        =================================================== */}

        {selectedFile && (
          <button
            type="submit"
            className="reel-upload-submit"
            disabled={
              uploading ||
              !selectedFile
            }
          >
            {uploading
              ? "Uploading..."
              : "Upload Reel"}
          </button>
        )}

      </form>
    </div>
  );
};

export default ReelUpload;