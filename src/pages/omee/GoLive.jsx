
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import useLive from "../../hooks/useLive";

import LivePreview from "../../components/omee/live/LivePreview";
import LiveControls from "../../components/omee/live/LiveControls";

const GoLive = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const videoRef = useRef(null);

  const {
    stream,
    isLive,
    liveId,
    micEnabled,
    cameraEnabled,
    viewerCount,
    loading,
    error,
    startLive,
    endLive,
    toggleMic,
    toggleCamera,
  } = useLive();

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [localError, setLocalError] = useState("");

  const currentUserName =
    user?.fullName ||
    user?.username ||
    "You";

  /*
   * ---------------------------------------------------------
   * Attach local stream to video preview
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (!stream) {
      videoRef.current.srcObject = null;
      return;
    }

    videoRef.current.srcObject = stream;
  }, [stream]);

  /*
   * ---------------------------------------------------------
   * Start Live
   * ---------------------------------------------------------
   */
  const handleStartLive = async () => {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setLocalError("Please enter a live title.");
      return;
    }

    try {
      setLocalError("");

      await startLive(
        cleanTitle,
        visibility
      );
    } catch (err) {
      console.error(
        "Start live error:",
        err
      );

      setLocalError(
        err?.message ||
          "Unable to start live. Please try again."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * End Live
   * ---------------------------------------------------------
   */
  const handleEndLive = async () => {
    try {
      setLocalError("");

      await endLive();
    } catch (err) {
      console.error(
        "End live error:",
        err
      );

      setLocalError(
        err?.message ||
          "Unable to end live. Please try again."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * Back
   * ---------------------------------------------------------
   */
  const handleBack = async () => {
    if (loading) {
      return;
    }

    if (isLive) {
      try {
        await endLive();
      } catch (err) {
        console.error(
          "End live before navigation error:",
          err
        );

        return;
      }
    }

    navigate(-1);
  };

  const displayError =
    localError || error;

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-gray-200 bg-white/95 px-4 backdrop-blur dark:border-gray-800 dark:bg-black/95">
        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          aria-label="Go back"
          className="mr-3 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft
            size={21}
            className="text-gray-900 dark:text-white"
          />
        </button>

        <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
          {isLive ? "You are Live" : "Go Live"}
        </h1>

        <button
          type="button"
          disabled={loading}
          aria-label="Live settings"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
        >
          <Settings
            size={20}
            className="text-gray-900 dark:text-white"
          />
        </button>
      </div>

      <div className="space-y-5 p-4">
        {/* Preview */}
        <LivePreview
          videoRef={videoRef}
          stream={stream}
          cameraEnabled={cameraEnabled}
        />

        {/* Error */}
        {displayError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {displayError}
          </div>
        )}

        {/* Live information */}
        {!isLive && (
          <>
            <div>
              <label
                htmlFor="live-title"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Live title
              </label>

              <input
                id="live-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setLocalError("");
                }}
                placeholder="What do you want to talk about?"
                maxLength={150}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="live-visibility"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Who can watch?
              </label>

              <select
                id="live-visibility"
                value={visibility}
                onChange={(event) => {
                  setVisibility(
                    event.target.value
                  );
                  setLocalError("");
                }}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-black dark:text-white"
              >
                <option value="PUBLIC">
                  Everyone
                </option>

                <option value="FOLLOWERS">
                  Followers
                </option>
              </select>
            </div>
          </>
        )}

        {/* Live status */}
        {isLive && (
          <div className="rounded-xl border border-gray-200 px-4 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  LIVE
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Users size={17} />

                <span>
                  {viewerCount}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {title ||
                `${currentUserName}'s Live`}
            </p>

            {liveId && (
              <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                Live ID: {liveId}
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <LiveControls
          cameraEnabled={cameraEnabled}
          micEnabled={micEnabled}
          isLive={isLive}
          loading={loading}
          onToggleCamera={toggleCamera}
          onToggleMic={toggleMic}
          onStartLive={handleStartLive}
          onEndLive={handleEndLive}
        />
      </div>
    </div>
  );
};

export default GoLive;
