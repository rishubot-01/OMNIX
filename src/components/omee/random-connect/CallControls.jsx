

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  SkipForward,
  PhoneOff,
} from "lucide-react";

const CallControls = ({
  isMuted = false,
  isCameraEnabled = true,
  isSpeakerEnabled = true,
  onToggleMute,
  onToggleCamera,
  onToggleSpeaker,
  onNext,
  onEnd,
  loading = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Microphone */}
      <button
        type="button"
        onClick={onToggleMute}
        disabled={loading}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isMuted
            ? "bg-white text-black"
            : "bg-black/60 text-white hover:bg-black/80"
        }`}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Camera */}
      <button
        type="button"
        onClick={onToggleCamera}
        disabled={loading}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
          !isCameraEnabled
            ? "bg-white text-black"
            : "bg-black/60 text-white hover:bg-black/80"
        }`}
        title={isCameraEnabled ? "Turn camera off" : "Turn camera on"}
        aria-label={isCameraEnabled ? "Turn camera off" : "Turn camera on"}
      >
        {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Speaker */}
      <button
        type="button"
        onClick={onToggleSpeaker}
        disabled={loading}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
          !isSpeakerEnabled
            ? "bg-white text-black"
            : "bg-black/60 text-white hover:bg-black/80"
        }`}
        title={isSpeakerEnabled ? "Mute speaker" : "Unmute speaker"}
        aria-label={isSpeakerEnabled ? "Mute speaker" : "Unmute speaker"}
      >
        {isSpeakerEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        title="Next user"
        aria-label="Next user"
      >
        <SkipForward size={20} />
      </button>

      {/* End */}
      <button
        type="button"
        onClick={onEnd}
        disabled={loading}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        title="End connection"
        aria-label="End connection"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
};

export default CallControls;