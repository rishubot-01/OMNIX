import { Eye, Radio } from "lucide-react";

const LiveViewer = ({
  videoRef,
  viewerCount = 0,
  isLive = false,
  hostName = "",
}) => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        className="h-full w-full object-cover"
      />

      {isLive && (
        <>
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white">
            <Radio size={14} />
            <span>LIVE</span>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
            <Eye size={14} />
            <span>{viewerCount}</span>
          </div>
        </>
      )}

      {!isLive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Radio size={32} className="mb-3 opacity-60" />

          <p className="text-sm text-white/70">
            {hostName
              ? `${hostName} is not live`
              : "Live has ended"}
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveViewer;