import React, { useCallback, useEffect, useRef } from "react";

/*
|--------------------------------------------------------------------------
| IncomingCall
|--------------------------------------------------------------------------
|
| Incoming audio/video call ke liye popup.
|
| Supports:
| - 1-to-1 audio call
| - 1-to-1 video call
| - Group audio call
| - Group video call
|
| Actions:
| - Accept
| - Reject
|
|--------------------------------------------------------------------------
*/


const IncomingCall = ({
  call = null,

  onAccept,
  onReject,

  visible = true,
}) => {

  /*
  |--------------------------------------------------------------------------
  | Incoming Ringtone
  |--------------------------------------------------------------------------
  | Generated with Web Audio API. No external audio asset is required.
  */

  const audioContextRef = useRef(null);
  const ringtoneTimerRef = useRef(null);
  const ringtoneStartedRef = useRef(false);

  const stopRingtone = useCallback(() => {
    if (ringtoneTimerRef.current) {
      clearInterval(ringtoneTimerRef.current);
      ringtoneTimerRef.current = null;
    }

    ringtoneStartedRef.current = false;

    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (err) {
        console.warn("Unable to close ringtone context:", err);
      }

      audioContextRef.current = null;
    }
  }, []);

  const playRingtoneTone = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current =
          new AudioContextClass();
      }

      const context = audioContextRef.current;

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const play = (frequency, startOffset = 0) => {
        const oscillator =
          context.createOscillator();
        const gain =
          context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value =
          frequency;

        const start =
          context.currentTime + startOffset;

        gain.gain.setValueAtTime(
          0.0001,
          start
        );

        gain.gain.exponentialRampToValueAtTime(
          0.10,
          start + 0.025
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 0.42
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.45);
      };

      // Two-tone phone-like ring.
      play(660, 0);
      play(880, 0.48);
    } catch (err) {
      console.warn("Incoming ringtone error:", err);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Visibility
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Start / Stop Incoming Ringtone
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !visible ||
      !call?.callId
    ) {
      stopRingtone();
      return;
    }

    if (ringtoneStartedRef.current) {
      return;
    }

    ringtoneStartedRef.current = true;

    playRingtoneTone();

    ringtoneTimerRef.current =
      setInterval(() => {
        if (ringtoneStartedRef.current) {
          playRingtoneTone();
        }
      }, 2200);

    return () => {
      stopRingtone();
    };
  }, [
    visible,
    call?.callId,
    playRingtoneTone,
    stopRingtone,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Visibility
  |--------------------------------------------------------------------------
  | IMPORTANT: this return must stay AFTER all hooks.
  */

  if (!visible || !call) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Call Information
  |--------------------------------------------------------------------------
  */

  const callType =
    call?.callType === "video"
      ? "video"
      : "audio";

  const isVideoCall =
    callType === "video";

  const caller =
    call?.caller ||
    call?.fromUser ||
    call?.user ||
    {};

  const callerName =
    caller?.name ||
    caller?.fullName ||
    caller?.username ||
    call?.callerName ||
    "Unknown User";

  const callerUsername =
    caller?.username
      ? `@${caller.username}`
      : "";

  const callerAvatar =
    caller?.profileImage ||
    caller?.profilePicture ||
    caller?.avatar ||
    caller?.avatarUrl ||
    caller?.image ||
    caller?.photo ||
    caller?.picture ||
    caller?.profile?.profileImage ||
    caller?.profile?.profilePicture ||
    caller?.profile?.avatar ||
    call?.callerAvatar ||
    call?.callerProfileImage ||
    null;


  /*
  |--------------------------------------------------------------------------
  | Participants
  |--------------------------------------------------------------------------
  */

  const participants =
    Array.isArray(call?.participants)
      ? call.participants
      : [];

  const isGroupCall =
    participants.length > 2;


  /*
  |--------------------------------------------------------------------------
  | Accept
  |--------------------------------------------------------------------------
  */

  const handleAccept = () => {
    if (!call?.callId) {
      return;
    }

    stopRingtone();
    onAccept?.(call);
  };


  /*
  |--------------------------------------------------------------------------
  | Reject
  |--------------------------------------------------------------------------
  */

  const handleReject = () => {
    if (!call?.callId) {
      return;
    }

    stopRingtone();
    onReject?.(call);
  };


  return (
    <div
      className="incoming-call-overlay"
      style={{
        position: "fixed",
        inset: 0,

        zIndex: 9999,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "20px",

        background:
          "rgba(0, 0, 0, 0.65)",

        backdropFilter:
          "blur(6px)",
      }}
    >

      <div
        className="incoming-call-card"
        style={{
          width: "100%",
          maxWidth: "380px",

          background:
            "#ffffff",

          borderRadius: "20px",

          padding: "28px 24px",

          boxSizing: "border-box",

          textAlign: "center",

          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >

        {/*
        |--------------------------------------------------------------------------
        | Call Type
        |--------------------------------------------------------------------------
        */}

        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#6b7280",

            marginBottom: "20px",
          }}
        >
          {isGroupCall
            ? "Incoming Group Call"
            : "Incoming Call"}
        </div>


        {/*
        |--------------------------------------------------------------------------
        | Caller Avatar
        |--------------------------------------------------------------------------
        */}

        <div
          style={{
            width: "88px",
            height: "88px",

            margin:
              "0 auto 16px",

            borderRadius: "50%",

            overflow: "hidden",

            background:
              "#e5e7eb",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            border:
              "4px solid #f3f4f6",
          }}
        >

          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              style={{
                width: "100%",
                height: "100%",

                objectFit: "cover",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#6b7280",
              }}
            >
              {callerName
                ?.charAt(0)
                ?.toUpperCase()}
            </span>
          )}

        </div>


        {/*
        |--------------------------------------------------------------------------
        | Caller Name
        |--------------------------------------------------------------------------
        */}

        <h3
          style={{
            margin: "0",

            fontSize: "22px",
            fontWeight: 700,

            color: "#111827",
          }}
        >
          {callerName}
        </h3>


        {callerUsername && (
          <div
            style={{
              marginTop: "5px",

              fontSize: "14px",

              color: "#6b7280",
            }}
          >
            {callerUsername}
          </div>
        )}


        {/*
        |--------------------------------------------------------------------------
        | Call Type
        |--------------------------------------------------------------------------
        */}

        <div
          style={{
            marginTop: "16px",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            gap: "8px",

            fontSize: "15px",
            fontWeight: 500,

            color: "#374151",
          }}
        >
          <span
            style={{
              fontSize: "20px",
            }}
          >
            {isVideoCall
              ? "📹"
              : "🎤"}
          </span>

          <span>
            {isVideoCall
              ? "Incoming video call"
              : "Incoming audio call"}
          </span>
        </div>


        {/*
        |--------------------------------------------------------------------------
        | Group Participants
        |--------------------------------------------------------------------------
        */}

        {isGroupCall && (
          <div
            style={{
              marginTop: "10px",

              fontSize: "13px",

              color: "#6b7280",
            }}
          >
            {participants.length} participants
          </div>
        )}


        {/*
        |--------------------------------------------------------------------------
        | Call Actions
        |--------------------------------------------------------------------------
        */}

        <div
          style={{
            display: "flex",

            alignItems: "center",
            justifyContent: "center",

            gap: "28px",

            marginTop: "28px",
          }}
        >

          {/*
          |--------------------------------------------------------------------------
          | Reject
          |--------------------------------------------------------------------------
          */}

          <button
            type="button"
            onClick={handleReject}
            aria-label="Reject call"
            title="Reject call"
            style={{
              width: "58px",
              height: "58px",

              borderRadius: "50%",

              border: "none",

              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: "23px",

              background:
                "#ef4444",

              color: "#ffffff",

              boxShadow:
                "0 6px 16px rgba(239, 68, 68, 0.3)",
            }}
          >
            📞
          </button>


          {/*
          |--------------------------------------------------------------------------
          | Accept
          |--------------------------------------------------------------------------
          */}

          <button
            type="button"
            onClick={handleAccept}
            aria-label="Accept call"
            title="Accept call"
            style={{
              width: "58px",
              height: "58px",

              borderRadius: "50%",

              border: "none",

              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: "23px",

              background:
                "#22c55e",

              color: "#ffffff",

              boxShadow:
                "0 6px 16px rgba(34, 197, 94, 0.3)",
            }}
          >
            📞
          </button>

        </div>


        {/*
        |--------------------------------------------------------------------------
        | Action Labels
        |--------------------------------------------------------------------------
        */}

        <div
          style={{
            display: "flex",

            justifyContent: "center",

            gap: "38px",

            marginTop: "10px",

            fontSize: "12px",

            color: "#6b7280",
          }}
        >
          <span>
            Decline
          </span>

          <span>
            Accept
          </span>
        </div>

      </div>

    </div>
  );
};


export default IncomingCall;