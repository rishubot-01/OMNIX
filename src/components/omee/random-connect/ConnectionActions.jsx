
import React from "react";
import {
  User,
  UserPlus,
  UserCheck,
  MessageCircle,
} from "lucide-react";

const ConnectionActions = ({
  peer,
  isFollowing = false,
  onProfile,
  onFollow,
  onMessage,
  loading = false,
}) => {
  if (!peer) {
    return null;
  }

  const username = peer.username || peer.fullName || "User";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Profile */}
      <button
        type="button"
        onClick={() => onProfile?.(peer)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
        title={`View ${username}'s profile`}
        aria-label={`View ${username}'s profile`}
      >
        <User size={21} />
      </button>

      {/* Follow / Following */}
      <button
        type="button"
        onClick={() => onFollow?.(peer)}
        disabled={loading}
        className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isFollowing
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-black/60 text-white hover:bg-black/80"
        }`}
        title={isFollowing ? "Following" : "Follow"}
        aria-label={isFollowing ? "Following" : "Follow"}
      >
        {isFollowing ? <UserCheck size={21} /> : <UserPlus size={21} />}
      </button>

      {/* Message */}
      <button
        type="button"
        onClick={() => onMessage?.(peer)}
        disabled={loading}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
        title="Message"
        aria-label="Message"
      >
        <MessageCircle size={21} />
      </button>
    </div>
  );
};

export default ConnectionActions;

// **Props ka role:**

// * `peer` → random matched user
// * `isFollowing` → current follow status
// * `onProfile(peer)` → profile open karne ke liye
// * `onFollow(peer)` → existing `followService` use karega
// * `onMessage(peer)` → existing `messageService` use karega
// * `loading` → follow/message action ke waqt button disable

// Next file hoga **`src/components/omee/random-connect/CallControls.jsx`**.
