import { User } from "lucide-react";

const RandomUserCard = ({
  videoRef,
  peer = null,
  connected = false,
}) => {
  const userName =
    peer?.fullName ||
    peer?.username ||
    "Random User";

  const username = peer?.username || "";

  const avatar =
    peer?.avatar ||
    peer?.profileImage ||
    peer?.profilePicture ||
    "";

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-900">
      {/* Remote Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Waiting / No Video */}
      {!connected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 px-6 text-center text-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <User size={30} />
          </div>

          <p className="text-lg font-semibold">
            Looking for someone...
          </p>

          <p className="mt-1 text-sm text-white/60">
            Your next random connection will appear here.
          </p>
        </div>
      )}

      {/* User Information */}
      {connected && peer && (
        <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={userName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <User size={20} />
            </div>
          )}

          <div>
            <p className="font-semibold text-white">
              {userName}
            </p>

            {username && (
              <p className="text-xs text-white/60">
                @{username}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Connection Badge */}
      {connected && (
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Connected
        </div>
      )}
    </div>
  );
};

export default RandomUserCard;