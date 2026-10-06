import React from "react";

/*
|--------------------------------------------------------------------------
| CallControls
|--------------------------------------------------------------------------
|
| Reusable controls for:
| - Audio call
| - Video call
| - 1-to-1 call
| - Group call
|
| Controls:
| - Microphone mute / unmute
| - Camera on / off
| - Speaker on / off
| - Leave / End call
|
*/


const CallControls = ({
  callType = "audio",

  isMuted = false,
  isCameraOff = false,
  isSpeakerOff = false,

  onToggleMute,
  onToggleCamera,
  onToggleSpeaker,

  onEndCall,
  onLeaveCall,

  isGroupCall = false,
}) => {

  /*
  |--------------------------------------------------------------------------
  | END / LEAVE CALL
  |--------------------------------------------------------------------------
  */

  const handleEndCall = () => {
    /*
     * Group call:
     * User sirf current call se leave karega.
     *
     * One-to-one:
     * Complete call end ho sakti hai.
     */
    if (isGroupCall && onLeaveCall) {
      onLeaveCall();
      return;
    }

    if (onEndCall) {
      onEndCall();
      return;
    }

    if (onLeaveCall) {
      onLeaveCall();
    }
  };


  return (
    <div
      className="call-controls"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        width: "100%",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >

      {/*
      |--------------------------------------------------------------------------
      | MICROPHONE
      |--------------------------------------------------------------------------
      */}

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={
          isMuted
            ? "Unmute microphone"
            : "Mute microphone"
        }
        title={
          isMuted
            ? "Unmute"
            : "Mute"
        }
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          fontSize: "20px",

          backgroundColor: isMuted
            ? "#ef4444"
            : "#374151",

          color: "#ffffff",

          transition:
            "background-color 0.2s ease, transform 0.2s ease",
        }}
      >
        {isMuted ? "🔇" : "🎤"}
      </button>


      {/*
      |--------------------------------------------------------------------------
      | CAMERA
      |--------------------------------------------------------------------------
      |
      | Camera control sirf video call mein show hoga.
      |
      */}

      {callType === "video" && (
        <button
          type="button"
          onClick={onToggleCamera}
          aria-label={
            isCameraOff
              ? "Turn camera on"
              : "Turn camera off"
          }
          title={
            isCameraOff
              ? "Turn camera on"
              : "Turn camera off"
          }
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            fontSize: "20px",

            backgroundColor: isCameraOff
              ? "#ef4444"
              : "#374151",

            color: "#ffffff",

            transition:
              "background-color 0.2s ease, transform 0.2s ease",
          }}
        >
          {isCameraOff ? "📹" : "📷"}
        </button>
      )}


      {/*
      |--------------------------------------------------------------------------
      | SPEAKER
      |--------------------------------------------------------------------------
      |
      | Speaker toggle.
      |
      */}

      <button
        type="button"
        onClick={onToggleSpeaker}
        aria-label={
          isSpeakerOff
            ? "Turn speaker on"
            : "Turn speaker off"
        }
        title={
          isSpeakerOff
            ? "Speaker on"
            : "Speaker off"
        }
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          fontSize: "20px",

          backgroundColor: isSpeakerOff
            ? "#ef4444"
            : "#374151",

          color: "#ffffff",

          transition:
            "background-color 0.2s ease, transform 0.2s ease",
        }}
      >
        {isSpeakerOff ? "🔈" : "🔊"}
      </button>


      {/*
      |--------------------------------------------------------------------------
      | END / LEAVE CALL
      |--------------------------------------------------------------------------
      |
      | Red button.
      |
      | 1-to-1:
      | End call
      |
      | Group:
      | Leave call
      |
      */}

      <button
        type="button"
        onClick={handleEndCall}
        aria-label={
          isGroupCall
            ? "Leave call"
            : "End call"
        }
        title={
          isGroupCall
            ? "Leave call"
            : "End call"
        }
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          fontSize: "21px",

          backgroundColor: "#dc2626",

          color: "#ffffff",

          transition:
            "background-color 0.2s ease, transform 0.2s ease",
        }}
      >
        📞
      </button>

    </div>
  );
};


export default CallControls;