import { CameraOff } from "lucide-react";

const LivePreview = ({
  videoRef,
  stream = null,
  cameraEnabled = true,
}) => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      {cameraEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-white">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <CameraOff size={28} />
          </div>

          <p className="text-sm text-white/70">
            Camera is off
          </p>
        </div>
      )}

      {stream && cameraEnabled && (
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
          Camera Preview
        </div>
      )}
    </div>
  );
};

export default LivePreview;