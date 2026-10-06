import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Radio,
  Square,
} from "lucide-react";

const LiveControls = ({
  cameraEnabled = true,
  micEnabled = true,
  isLive = false,
  loading = false,
  onToggleCamera,
  onToggleMic,
  onStartLive,
  onEndLive,
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onToggleMic}
        disabled={loading}
        aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      >
        {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <button
        type="button"
        onClick={onToggleCamera}
        disabled={loading}
        aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      >
        {cameraEnabled ? (
          <Camera size={20} />
        ) : (
          <CameraOff size={20} />
        )}
      </button>

      {!isLive ? (
        <button
          type="button"
          onClick={onStartLive}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Radio size={18} />
          <span>{loading ? "Starting..." : "Go Live"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onEndLive}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          <Square size={17} />
          <span>{loading ? "Ending..." : "End Live"}</span>
        </button>
      )}
    </div>
  );
};

export default LiveControls;