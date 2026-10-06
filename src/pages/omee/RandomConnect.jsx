
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  SkipForward,
  PhoneOff,
  User,
  UserPlus,
  UserCheck,
  MessageCircle,
  Menu,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useRandomConnect from "../../hooks/useRandomConnect";

import followService from "../../services/follow.service";
import messageService from "../../services/message.service";

const RandomConnect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    peer,
    peerVideoRef,
    localVideoRef,

    connectionId,
    status,
    error,

    isMuted,
    isCameraOff,
    isSpeakerOff,

    startRandomConnect,
    nextRandomUser,
    endRandomConnection,

    toggleMute,
    toggleCamera,
    toggleSpeaker,
  } = useRandomConnect();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  /*
   * ---------------------------------------------------------
   * Start Random Connect
   * ---------------------------------------------------------
   */

  useEffect(() => {
    startRandomConnect();
  }, [startRandomConnect]);

  /*
   * ---------------------------------------------------------
   * Follow Status
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const checkFollowStatus = async () => {
      const peerId = peer?._id || peer?.id;

      if (!peerId) {
        setIsFollowing(false);
        return;
      }

      try {
        const response =
          await followService.checkFollowStatus(peerId);

        if (cancelled) {
          return;
        }

        setIsFollowing(
          Boolean(
            response?.isFollowing ??
              response?.following ??
              response?.data?.isFollowing ??
              response?.data?.following
          )
        );
      } catch {
        if (!cancelled) {
          setIsFollowing(false);
        }
      }
    };

    checkFollowStatus();

    return () => {
      cancelled = true;
    };
  }, [peer]);

  /*
   * ---------------------------------------------------------
   * Follow / Unfollow
   * ---------------------------------------------------------
   */

  const handleFollow = async () => {
    const peerId = peer?._id || peer?.id;

    if (!peerId || followLoading) {
      return;
    }

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await followService.unfollowUser(peerId);
        setIsFollowing(false);
      } else {
        await followService.followUser(peerId);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Message
   * ---------------------------------------------------------
   */

  const handleMessage = async () => {
    const peerId = peer?._id || peer?.id;

    if (!peerId || messageLoading) {
      return;
    }

    try {
      setMessageLoading(true);

      await messageService.createConversation(peerId);

      navigate("/messages");
    } catch (err) {
      console.error("Message error:", err);
    } finally {
      setMessageLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Profile
   * ---------------------------------------------------------
   */

  const handleProfile = () => {
    if (!peer?.username) {
      return;
    }

    navigate(
      `/user/${encodeURIComponent(peer.username)}`
    );
  };

  /*
   * ---------------------------------------------------------
   * Next
   * ---------------------------------------------------------
   */

  const handleNext = () => {
    if (!connectionId) {
      return;
    }

    nextRandomUser();
  };

  /*
   * ---------------------------------------------------------
   * End
   * ---------------------------------------------------------
   */

  const handleEnd = () => {
    endRandomConnection();
    navigate("/");
  };

  /*
   * ---------------------------------------------------------
   * Report
   * ---------------------------------------------------------
   */

  const handleReport = () => {
    console.log("Report clicked", peer);
  };

  /*
   * ---------------------------------------------------------
   * User information
   * ---------------------------------------------------------
   */

  const peerName =
    peer?.fullName ||
    peer?.name ||
    peer?.username ||
    "Random User";

  const peerUsername = peer?.username
    ? `@${peer.username}`
    : "";

  const currentUserName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    "You";

  const currentUsername = user?.username
    ? `@${user.username}`
    : "";

  const isWaiting = status === "waiting";
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";

  /*
   * ---------------------------------------------------------
   * Video Panel
   * ---------------------------------------------------------
   */

  const VideoPanel = ({
    videoRef,
    name,
    username,
    isLocal = false,
    cameraOff = false,
  }) => {
    return (
      <section className="relative min-h-0 flex-1 overflow-hidden bg-gray-950">

        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isSpeakerOff}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
            cameraOff
              ? "opacity-0"
              : "opacity-100"
          }`}
        />

        {/* Camera Off / No peer */}
        {cameraOff && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
              <User size={34} />
            </div>

            <p className="mt-4 text-lg font-semibold">
              {name}
            </p>

            {username && (
              <p className="mt-1 text-sm text-gray-400">
                {username}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Camera is off
            </p>
          </div>
        )}

        {/* User Info */}
        <div className="absolute left-4 top-4 z-10">
          <div className="rounded-full bg-black/50 px-3 py-2 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">
              {name}
            </p>

            {username && (
              <p className="text-xs text-gray-300">
                {username}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-black">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="absolute left-0 right-0 top-0 z-50 flex h-16 items-center justify-between px-4">

        <button
          type="button"
          onClick={handleEnd}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="rounded-full bg-black/50 px-4 py-2 backdrop-blur-md">
          <span className="text-sm font-semibold text-white">
            Random Connect
          </span>
        </div>

        <div className="w-10" />
      </header>


      {/* =====================================================
          VIDEO AREA
      ====================================================== */}

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">

        {/* ===================================================
            RANDOM USER - TOP ON MOBILE / LEFT ON DESKTOP
        ==================================================== */}

        <div className="relative flex min-h-0 flex-1">

          <VideoPanel
            videoRef={peerVideoRef}
            name={peerName}
            username={peerUsername}
            isLocal={false}
            cameraOff={!peer || (!isConnecting && !isConnected)}
          />

          {/* Random User Actions */}
          <div className="absolute right-4 top-[75%] z-30 flex -translate-y-1/2 flex-col gap-2">

            {/* Profile */}
            <button
              type="button"
              onClick={handleProfile}
              disabled={!peer}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 disabled:opacity-40"
              title="Profile"
              aria-label="Profile"
            >
              <User size={20} />
            </button>

            {/* Follow */}
            <button
              type="button"
              onClick={handleFollow}
              disabled={!peer || followLoading}
              className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition disabled:opacity-40 ${
                isFollowing
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black/60 text-white hover:bg-black/80"
              }`}
              title={isFollowing ? "Following" : "Follow"}
              aria-label={
                isFollowing ? "Following" : "Follow"
              }
            >
              {isFollowing ? (
                <UserCheck size={20} />
              ) : (
                <UserPlus size={20} />
              )}
            </button>

            {/* Message */}
            <button
              type="button"
              onClick={handleMessage}
              disabled={!peer || messageLoading}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 disabled:opacity-40"
              title="Message"
              aria-label="Message"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>


        {/* ===================================================
            CURRENT USER - BOTTOM ON MOBILE / RIGHT DESKTOP
        ==================================================== */}

        <div className="relative flex min-h-0 flex-1">

          <VideoPanel
            videoRef={localVideoRef}
            name={currentUserName}
            username={currentUsername}
            isLocal
            cameraOff={isCameraOff}
          />

          {/* My Actions */}
          <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">

            {/* Mute */}
            <button
              type="button"
              onClick={toggleMute}
              className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition ${
                isMuted
                  ? "bg-white text-black"
                  : "bg-black/60 text-white hover:bg-black/80"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff size={20} />
              ) : (
                <Mic size={20} />
              )}
            </button>

            {/* Camera */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition ${
                isCameraOff
                  ? "bg-white text-black"
                  : "bg-black/60 text-white hover:bg-black/80"
              }`}
              title={
                isCameraOff
                  ? "Turn camera on"
                  : "Turn camera off"
              }
              aria-label={
                isCameraOff
                  ? "Turn camera on"
                  : "Turn camera off"
              }
            >
              {isCameraOff ? (
                <CameraOff size={20} />
              ) : (
                <Camera size={20} />
              )}
            </button>

            {/* Speaker */}
            <button
              type="button"
              onClick={toggleSpeaker}
              className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition ${
                isSpeakerOff
                  ? "bg-white text-black"
                  : "bg-black/60 text-white hover:bg-black/80"
              }`}
              title={
                isSpeakerOff
                  ? "Turn speaker on"
                  : "Mute speaker"
              }
              aria-label={
                isSpeakerOff
                  ? "Turn speaker on"
                  : "Mute speaker"
              }
            >
              {isSpeakerOff ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={handleNext}
              disabled={!connectionId || isWaiting}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 disabled:opacity-40"
              title="Next"
              aria-label="Next"
            >
              <SkipForward size={20} />
            </button>

            {/* End */}
            <button
              type="button"
              onClick={handleEnd}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
              title="End"
              aria-label="End"
            >
              <PhoneOff size={20} />
            </button>

            {/* Report */}
            <button
              type="button"
              onClick={handleReport}
              disabled={!peer}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 disabled:opacity-40"
              title="Report User"
              aria-label="Report User"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </main>


      {/* =====================================================
          STATUS
      ====================================================== */}

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2">

        {isWaiting && (
          <div className="rounded-full bg-black/70 px-5 py-3 text-sm font-medium text-white backdrop-blur-md">
            Finding someone to connect...
          </div>
        )}

        {isConnecting && (
          <div className="rounded-full bg-black/70 px-5 py-3 text-sm font-medium text-white backdrop-blur-md">
            Connecting...
          </div>
        )}

        {isConnected && (
          <div className="rounded-full bg-green-600/90 px-5 py-3 text-sm font-medium text-white backdrop-blur-md">
            Connected
          </div>
        )}

        {error && (
          <div className="mt-2 rounded-full bg-red-600/90 px-5 py-3 text-sm font-medium text-white backdrop-blur-md">
            {error}
          </div>
        )}
      </div>

    </div>
  );
};

export default RandomConnect;