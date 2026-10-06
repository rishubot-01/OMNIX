import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import CallControls from "./CallControls";

import {
  sendCallOfferEvent,
  sendCallAnswerEvent,
  sendCallIceCandidateEvent,
  leaveCallEvent,
  endCallEvent,
} from "../../socket/socketEvents";

import {
  listenToCallOffer,
  listenToCallAnswer,
  listenToCallIceCandidate,
  listenToCallParticipantJoined,
  listenToCallParticipantLeft,
  listenToCallEnded,
  listenToCallError,
  removeListeners,
} from "../../socket/socketListeners";


/*
|--------------------------------------------------------------------------
| CallModal
|--------------------------------------------------------------------------
|
| Actual WebRTC engine.
|
| Supports:
| - Audio call
| - Video call
| - 1-to-1 call
| - Small group calls
| - Microphone mute/unmute
| - Camera on/off
| - Speaker on/off
| - Remote streams
| - WebRTC offer
| - WebRTC answer
| - ICE candidates
|
|--------------------------------------------------------------------------
*/


const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};


const CallModal = ({
  call = null,

  currentUserId,

  visible = true,

  onClose,

  isCaller = false,

  isGroupCall = false,
}) => {

  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const localVideoRef = useRef(null);

  const remoteAudioRef = useRef(null);

  const localStreamRef = useRef(null);

  const peerConnectionsRef = useRef(
    new Map()
  );

  const remoteStreamsRef = useRef(
    new Map()
  );

  const pendingCandidatesRef = useRef(
    new Map()
  );

  // Call sound refs. No external audio asset is required.
  const soundContextRef = useRef(null);
  const soundTimerRef = useRef(null);
  const soundStartedRef = useRef(false);


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [localStream, setLocalStream] =
    useState(null);

  const [remoteStreams, setRemoteStreams] =
    useState([]);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isCameraOff, setIsCameraOff] =
    useState(false);

  const [isSpeakerOff, setIsSpeakerOff] =
    useState(false);

  const [callStatus, setCallStatus] =
    useState("connecting");

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Call Profile / Status Helpers
  |--------------------------------------------------------------------------
  */

  const getUserName = useCallback((user) => {
    if (!user) return "User";

    if (typeof user === "string" || typeof user === "number") {
      return String(user);
    }

    return (
      user?.name ||
      user?.fullName ||
      user?.username ||
      user?.displayName ||
      "User"
    );
  }, []);

  const getUserImage = useCallback((user) => {
    if (!user || typeof user === "string" || typeof user === "number") {
      return "";
    }

    return (
      user?.profileImage ||
      user?.profilePicture ||
      user?.avatar ||
      user?.avatarUrl ||
      user?.image ||
      user?.photo ||
      user?.picture ||
      user?.profile?.profileImage ||
      user?.profile?.profilePicture ||
      user?.profile?.avatar ||
      ""
    );
  }, []);


  /*
  |--------------------------------------------------------------------------
  | Call Information
  |--------------------------------------------------------------------------
  */

  const callId =
    call?.callId
      ? String(call.callId)
      : null;

  const callType =
    call?.callType === "video"
      ? "video"
      : "audio";

  const isVideoCall =
    callType === "video";

  /*
   * For an outgoing call, targetUser is the person we are calling.
   * Messages.jsx should pass this object when creating activeCall.
   *
   * For an incoming call, caller/fromUser/user is the caller.
   */
  const targetUser =
    call?.targetUser ||
    call?.receiver ||
    call?.toUser ||
    call?.callee ||
    (
      Array.isArray(call?.participants)
        ? call.participants.find(
            (participant) =>
              String(
                participant?.userId ||
                participant?._id ||
                participant?.id ||
                participant?.user?._id ||
                participant?.user?.id ||
                participant
              ) !== String(currentUserId)
          )
        : null
    );

  const callerUser =
    call?.caller ||
    call?.fromUser ||
    call?.user ||
    call?.callerUser ||
    {};

  const displayedUser =
    isCaller
      ? (targetUser || {})
      : (callerUser || {});

  const displayedName =
    getUserName(displayedUser);

  const displayedImage =
    getUserImage(displayedUser);

  const myUser =
    call?.currentUser ||
    call?.caller ||
    {};

  const myUserName =
    getUserName(myUser);

  const myUserImage =
    getUserImage(myUser);

  /*
   * Messages.jsx can pass targetIsActive / isTargetActive /
   * targetUser.isOnline. If the value is unknown, keep
   * "Connecting..." instead of falsely showing "Ringing...".
   */
  const targetIsActive =
    call?.targetIsActive ??
    call?.isTargetActive ??
    call?.targetOnline ??
    call?.isTargetOnline ??
    targetUser?.isActive ??
    targetUser?.isOnline ??
    targetUser?.online ??
    false;


  /*
  |--------------------------------------------------------------------------
  | Get Participant ID
  |--------------------------------------------------------------------------
  */

  const getParticipantId = useCallback(
    (participant) => {

      if (!participant) {
        return null;
      }

      if (
        typeof participant === "string" ||
        typeof participant === "number"
      ) {
        return String(participant);
      }

      return String(
        participant.userId ||
        participant._id ||
        participant.id ||
        participant.user?._id ||
        participant.user?.id ||
        ""
      );
    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | Get Participants
  |--------------------------------------------------------------------------
  */

  const getParticipants = useCallback(() => {

    if (
      !Array.isArray(
        call?.participants
      )
    ) {
      return [];
    }

    return call.participants
      .map(getParticipantId)
      .filter(Boolean)
      .filter(
        (id) =>
          String(id) !==
          String(currentUserId)
      );

  }, [
    call,
    currentUserId,
    getParticipantId,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Call Sound - Generated With Web Audio API
  |--------------------------------------------------------------------------
  |
  | No .mp3/.wav file is required.
  |
  */

  const stopCallSound = useCallback(() => {
    if (soundTimerRef.current) {
      clearInterval(soundTimerRef.current);
      soundTimerRef.current = null;
    }

    soundStartedRef.current = false;

    if (soundContextRef.current) {
      try {
        if (soundContextRef.current.state !== "closed") {
          soundContextRef.current.close();
        }
      } catch (err) {
        console.warn("Unable to close call sound context:", err);
      }

      soundContextRef.current = null;
    }
  }, []);

  const playTone = useCallback((frequency = 440, duration = 0.22) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      if (!soundContextRef.current) {
        soundContextRef.current =
          new AudioContextClass();
      }

      const context =
        soundContextRef.current;

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(
        0.0001,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.08,
        context.currentTime + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(
        context.currentTime + duration + 0.03
      );
    } catch (err) {
      console.warn("Call sound error:", err);
    }
  }, []);

  const startCallSound = useCallback(
    (type) => {
      if (
        soundStartedRef.current ||
        !visible ||
        callStatus === "connected" ||
        callStatus === "ended" ||
        callStatus === "failed"
      ) {
        return;
      }

      soundStartedRef.current = true;

      // First tone immediately.
      if (type === "ringing") {
        playTone(520, 0.24);
      } else {
        playTone(330, 0.18);
      }

      soundTimerRef.current =
        setInterval(() => {
          if (
            type === "ringing"
          ) {
            // Phone-like double ring.
            playTone(520, 0.24);

            setTimeout(() => {
              if (soundStartedRef.current) {
                playTone(660, 0.24);
              }
            }, 330);
          } else {
            // Softer periodic connecting tone.
            playTone(330, 0.16);
          }
        }, type === "ringing" ? 2200 : 1800);
    },
    [
      visible,
      callStatus,
      playTone,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Cleanup Peer Connection
  |--------------------------------------------------------------------------
  */

  const closePeerConnection = useCallback(
    (userId) => {

      if (!userId) {
        return;
      }

      const peer =
        peerConnectionsRef.current.get(
          String(userId)
        );

      if (peer) {

        try {
          peer.onicecandidate = null;
          peer.ontrack = null;
          peer.onconnectionstatechange = null;
          peer.close();
        } catch (err) {
          console.error(
            "Error closing peer:",
            err
          );
        }
      }

      peerConnectionsRef.current.delete(
        String(userId)
      );

      remoteStreamsRef.current.delete(
        String(userId)
      );

      pendingCandidatesRef.current.delete(
        String(userId)
      );

      setRemoteStreams(
        Array.from(
          remoteStreamsRef.current.entries()
        ).map(
          ([participantId, stream]) => ({
            participantId,
            stream,
          })
        )
      );

    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | Cleanup Everything
  |--------------------------------------------------------------------------
  */

  const cleanupCall = useCallback(() => {

    /*
     * Stop local media tracks.
     */
    if (localStreamRef.current) {

      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStreamRef.current = null;
    }


    /*
     * Close all peer connections.
     */
    peerConnectionsRef.current.forEach(
      (peer) => {

        try {
          peer.onicecandidate = null;
          peer.ontrack = null;
          peer.onconnectionstatechange = null;
          peer.close();
        } catch (err) {
          console.error(
            "Peer cleanup error:",
            err
          );
        }
      }
    );


    peerConnectionsRef.current.clear();

    remoteStreamsRef.current.clear();

    pendingCandidatesRef.current.clear();

    setRemoteStreams([]);

    setLocalStream(null);

  }, [stopCallSound]);


  /*
  |--------------------------------------------------------------------------
  | Get Local Media
  |--------------------------------------------------------------------------
  */

  const getLocalMedia = useCallback(
    async () => {

      try {

        setError("");

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
              video: isVideoCall,
            }
          );

        localStreamRef.current =
          stream;

        setLocalStream(stream);

        /*
         * Local video preview.
         */
        if (
          localVideoRef.current &&
          isVideoCall
        ) {
          localVideoRef.current.srcObject =
            stream;
        }

        /*
         * Getting local media does NOT mean the call is connected.
         * WebRTC connectionstatechange sets "connected" later.
         */
        if (isCaller) {
          setCallStatus(
            targetIsActive
              ? "ringing"
              : "connecting"
          );
        } else {
          setCallStatus("connecting");
        }

        return stream;

      } catch (err) {

        console.error(
          "getUserMedia error:",
          err
        );

        let message =
          "Unable to access microphone/camera.";

        if (
          err?.name ===
          "NotAllowedError"
        ) {
          message =
            "Microphone/camera permission denied.";
        }

        if (
          err?.name ===
          "NotFoundError"
        ) {
          message =
            "Required microphone/camera not found.";
        }

        setError(message);

        setCallStatus("failed");

        return null;
      }

    },
    [isVideoCall]
  );


  /*
  |--------------------------------------------------------------------------
  | Create Peer Connection
  |--------------------------------------------------------------------------
  */

  const createPeerConnection =
    useCallback(
      async (remoteUserId) => {

        if (!remoteUserId) {
          return null;
        }

        const peerId =
          String(remoteUserId);


        /*
         * Already exists?
         */
        const existingPeer =
          peerConnectionsRef.current.get(
            peerId
          );

        if (existingPeer) {
          return existingPeer;
        }


        const peer =
          new RTCPeerConnection(
            ICE_SERVERS
          );


        /*
         * Save peer.
         */
        peerConnectionsRef.current.set(
          peerId,
          peer
        );


        /*
         * Add local tracks.
         */
        if (localStreamRef.current) {

          localStreamRef.current
            .getTracks()
            .forEach((track) => {

              peer.addTrack(
                track,
                localStreamRef.current
              );

            });

        }


        /*
         * ICE candidate.
         */
        peer.onicecandidate = (
          event
        ) => {

          if (!event.candidate) {
            return;
          }

          sendCallIceCandidateEvent({
            callId,
            targetUserId: peerId,
            candidate:
              event.candidate,
          });

        };


        /*
         * Remote track.
         */
        peer.ontrack = (
          event
        ) => {

          const stream =
            event.streams?.[0];

          if (!stream) {
            return;
          }

          remoteStreamsRef.current.set(
            peerId,
            stream
          );

          setRemoteStreams(
            Array.from(
              remoteStreamsRef.current.entries()
            ).map(
              ([participantId, remoteStream]) => ({
                participantId,
                stream: remoteStream,
              })
            )
          );

        };


        /*
         * Connection state.
         */
        peer.onconnectionstatechange =
          () => {

            const state =
              peer.connectionState;

            if (
              state === "connected"
            ) {
              setCallStatus(
                "connected"
              );
            }

            if (
              state === "failed" ||
              state === "closed"
            ) {
              closePeerConnection(
                peerId
              );
            }

          };


        return peer;

      },
      [
        callId,
        closePeerConnection,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Create Offer
  |--------------------------------------------------------------------------
  */

  const createOfferForUser =
    useCallback(
      async (remoteUserId) => {

        if (!remoteUserId || !callId) {
          return;
        }

        const remoteId = String(remoteUserId);

        /*
         * For a 1-to-1 outgoing call, only signal the actual
         * callee. Group calls may signal any newly joined user.
         */
        if (isCaller && !isGroupCall) {
          const canonicalTargetId =
            targetUser?.userId ||
            targetUser?._id ||
            targetUser?.id ||
            call?.targetUserId ||
            call?.receiverId ||
            call?.calleeId;

          if (
            canonicalTargetId &&
            String(canonicalTargetId) !== remoteId
          ) {
            return;
          }
        }

        const peer =
          await createPeerConnection(
            remoteId
          );

        if (!peer) {
          return;
        }


        try {

          const offer =
            await peer.createOffer();

          await peer.setLocalDescription(
            offer
          );


          sendCallOfferEvent({
            callId,
            targetUserId:
              remoteId,
            offer,
          });

        } catch (err) {

          console.error(
            "Create offer error:",
            err
          );

        }

      },
      [
        callId,
        createPeerConnection,
        isCaller,
        isGroupCall,
        targetUser,
        call,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Handle Offer
  |--------------------------------------------------------------------------
  */

  const handleOffer =
    useCallback(
      async (data) => {

        if (
          !data ||
          !callId
        ) {
          return;
        }

        if (
          String(data.callId) !==
          String(callId)
        ) {
          return;
        }


        const fromUserId =
          data.fromUserId ||
          data.from ||
          data.userId;


        if (!fromUserId) {
          return;
        }


        const peer =
          await createPeerConnection(
            fromUserId
          );

        if (!peer) {
          return;
        }


        try {

          await peer.setRemoteDescription(
            new RTCSessionDescription(
              data.offer
            )
          );


          /*
           * Apply pending ICE candidates.
           */
          const pending =
            pendingCandidatesRef.current.get(
              String(fromUserId)
            ) || [];


          for (
            const candidate of pending
          ) {

            try {

              await peer.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );

            } catch (err) {

              console.error(
                "Pending ICE error:",
                err
              );

            }

          }


          pendingCandidatesRef.current.delete(
            String(fromUserId)
          );


          const answer =
            await peer.createAnswer();

          await peer.setLocalDescription(
            answer
          );


          sendCallAnswerEvent({
            callId,
            targetUserId:
              String(fromUserId),
            answer,
          });

        } catch (err) {

          console.error(
            "Handle offer error:",
            err
          );

        }

      },
      [
        callId,
        createPeerConnection,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Handle Answer
  |--------------------------------------------------------------------------
  */

  const handleAnswer =
    useCallback(
      async (data) => {

        if (
          !data ||
          !callId
        ) {
          return;
        }

        if (
          String(data.callId) !==
          String(callId)
        ) {
          return;
        }


        const fromUserId =
          data.fromUserId ||
          data.from ||
          data.userId;


        if (!fromUserId) {
          return;
        }


        const peer =
          peerConnectionsRef.current.get(
            String(fromUserId)
          );


        if (!peer) {
          return;
        }


        try {

          await peer.setRemoteDescription(
            new RTCSessionDescription(
              data.answer
            )
          );


          /*
           * Apply pending ICE candidates.
           */
          const pending =
            pendingCandidatesRef.current.get(
              String(fromUserId)
            ) || [];


          for (
            const candidate of pending
          ) {

            try {

              await peer.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );

            } catch (err) {

              console.error(
                "Pending ICE error:",
                err
              );

            }

          }


          pendingCandidatesRef.current.delete(
            String(fromUserId)
          );

        } catch (err) {

          console.error(
            "Handle answer error:",
            err
          );

        }

      },
      [callId]
    );


  /*
  |--------------------------------------------------------------------------
  | Handle ICE Candidate
  |--------------------------------------------------------------------------
  */

  const handleIceCandidate =
    useCallback(
      async (data) => {

        if (
          !data ||
          !callId
        ) {
          return;
        }

        if (
          String(data.callId) !==
          String(callId)
        ) {
          return;
        }


        const fromUserId =
          data.fromUserId ||
          data.from ||
          data.userId;


        const candidate =
          data.candidate;


        if (
          !fromUserId ||
          !candidate
        ) {
          return;
        }


        const peer =
          peerConnectionsRef.current.get(
            String(fromUserId)
          );


        /*
         * Peer not ready yet.
         */
        if (!peer) {

          const key =
            String(fromUserId);

          const existing =
            pendingCandidatesRef.current.get(
              key
            ) || [];

          existing.push(candidate);

          pendingCandidatesRef.current.set(
            key,
            existing
          );

          return;
        }


        /*
         * Remote description not ready.
         */
        if (
          !peer.remoteDescription
        ) {

          const key =
            String(fromUserId);

          const existing =
            pendingCandidatesRef.current.get(
              key
            ) || [];

          existing.push(candidate);

          pendingCandidatesRef.current.set(
            key,
            existing
          );

          return;
        }


        try {

          await peer.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

        } catch (err) {

          console.error(
            "ICE candidate error:",
            err
          );

        }

      },
      [callId]
    );


  /*
  |--------------------------------------------------------------------------
  | Handle Participant Joined
  |--------------------------------------------------------------------------
  */

  const handleParticipantJoined =
    useCallback(
      async (data) => {

        if (
          !data ||
          !callId
        ) {
          return;
        }

        if (
          String(data.callId) !==
          String(callId)
        ) {
          return;
        }


        const participant =
          data.participant ||
          data.user;


        const participantId =
          getParticipantId(
            participant
          ) ||
          data.userId;


        if (!participantId) {
          return;
        }


        if (
          String(participantId) ===
          String(currentUserId)
        ) {
          return;
        }


        /*
         * Caller/initiator creates offer
         * for newly joined participant.
         */
        if (isCaller) {

          await createOfferForUser(
            participantId
          );

        }

      },
      [
        callId,
        currentUserId,
        getParticipantId,
        isCaller,
        createOfferForUser,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Handle Participant Left
  |--------------------------------------------------------------------------
  */

  const handleParticipantLeft =
    useCallback(
      (data) => {

        if (
          !data ||
          !callId
        ) {
          return;
        }

        if (
          String(data.callId) !==
          String(callId)
        ) {
          return;
        }


        const participant =
          data.participant ||
          data.user;


        const participantId =
          getParticipantId(
            participant
          ) ||
          data.userId;


        if (!participantId) {
          return;
        }


        closePeerConnection(
          participantId
        );

      },
      [
        callId,
        getParticipantId,
        closePeerConnection,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Handle Call Ended
  |--------------------------------------------------------------------------
  */

  const handleCallEnded =
    useCallback(
      (data) => {

        if (
          data?.callId &&
          callId &&
          String(data.callId) !==
            String(callId)
        ) {
          return;
        }

        setCallStatus("ended");

        cleanupCall();

        onClose?.();

      },
      [
        callId,
        cleanupCall,
        onClose,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Handle Call Error
  |--------------------------------------------------------------------------
  */

  const handleCallError =
    useCallback(
      (data) => {

        if (
          data?.callId &&
          callId &&
          String(data.callId) !==
            String(callId)
        ) {
          return;
        }

        console.error(
          "Call error:",
          data
        );

        setError(
          data?.message ||
          "Something went wrong with the call."
        );

      },
      [callId]
    );


  /*
  |--------------------------------------------------------------------------
  | Socket Listeners
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      !visible ||
      !callId
    ) {
      return;
    }


    const subscriptions = [

      listenToCallOffer(
        handleOffer
      ),

      listenToCallAnswer(
        handleAnswer
      ),

      listenToCallIceCandidate(
        handleIceCandidate
      ),

      listenToCallParticipantJoined(
        handleParticipantJoined
      ),

      listenToCallParticipantLeft(
        handleParticipantLeft
      ),

      listenToCallEnded(
        handleCallEnded
      ),

      listenToCallError(
        handleCallError
      ),

    ];


    return () => {

      removeListeners(
        subscriptions
      );

    };

  }, [
    visible,
    callId,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleParticipantJoined,
    handleParticipantLeft,
    handleCallEnded,
    handleCallError,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Start Local Media
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      !visible ||
      !callId
    ) {
      return;
    }


    let cancelled = false;


    const start = async () => {

      const stream =
        await getLocalMedia();


      if (
        cancelled &&
        stream
      ) {

        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        return;
      }


      /*
       * IMPORTANT:
       * Do not create an offer immediately from the participant
       * list. An invited user may not have joined the call yet.
       *
       * The caller creates the offer only after the backend sends
       * CALL_PARTICIPANT_JOINED. This removes the early signaling
       * race that was causing TARGET_NOT_PARTICIPANT.
       */
      if (stream && isCaller) {
        // Offer is created by handleParticipantJoined().
      }

    };


    start();


    return () => {

      cancelled = true;

    };

  }, [
    visible,
    callId,
    isCaller,
    getLocalMedia,
    getParticipants,
    createOfferForUser,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Outgoing Call Status + Sound
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !visible ||
      !callId ||
      !isCaller
    ) {
      stopCallSound();
      return;
    }

    if (callStatus === "connected") {
      stopCallSound();
      return;
    }

    if (
      callStatus === "ended" ||
      callStatus === "failed"
    ) {
      stopCallSound();
      return;
    }

    if (targetIsActive) {
      setCallStatus("ringing");
      startCallSound("ringing");
    } else {
      setCallStatus("connecting");
      startCallSound("connecting");
    }

    return () => {
      stopCallSound();
    };
  }, [
    visible,
    callId,
    isCaller,
    targetIsActive,
    callStatus,
    startCallSound,
    stopCallSound,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Local Video
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      localVideoRef.current &&
      localStream &&
      isVideoCall
    ) {

      localVideoRef.current.srcObject =
        localStream;

    }

  }, [
    localStream,
    isVideoCall,
  ]);


  /*
  |--------------------------------------------------------------------------
  | Toggle Microphone
  |--------------------------------------------------------------------------
  */

  const handleToggleMute =
    useCallback(() => {

      if (
        !localStreamRef.current
      ) {
        return;
      }


      const audioTracks =
        localStreamRef.current
          .getAudioTracks();


      if (
        audioTracks.length === 0
      ) {
        return;
      }


      const nextMuted =
        !isMuted;


      audioTracks.forEach(
        (track) => {
          track.enabled =
            !nextMuted;
        }
      );


      setIsMuted(
        nextMuted
      );

    }, [isMuted]);


  /*
  |--------------------------------------------------------------------------
  | Toggle Camera
  |--------------------------------------------------------------------------
  */

  const handleToggleCamera =
    useCallback(() => {

      if (
        !localStreamRef.current ||
        !isVideoCall
      ) {
        return;
      }


      const videoTracks =
        localStreamRef.current
          .getVideoTracks();


      if (
        videoTracks.length === 0
      ) {
        return;
      }


      const nextCameraOff =
        !isCameraOff;


      videoTracks.forEach(
        (track) => {
          track.enabled =
            !nextCameraOff;
        }
      );


      setIsCameraOff(
        nextCameraOff
      );

    }, [
      isCameraOff,
      isVideoCall,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Toggle Speaker
  |--------------------------------------------------------------------------
  */

  const handleToggleSpeaker =
    useCallback(() => {

      const nextSpeakerOff =
        !isSpeakerOff;


      setIsSpeakerOff(
        nextSpeakerOff
      );


      /*
       * Browser audio output support.
       *
       * Not every browser/device supports
       * setSinkId().
       */
      if (
        remoteAudioRef.current &&
        typeof remoteAudioRef.current
          .setSinkId === "function"
      ) {

        /*
         * Default audio device is used
         * when speaker is enabled.
         *
         * This is kept as a UI state because
         * mobile browsers have limited
         * speaker routing control.
         */
      }

    }, [isSpeakerOff]);


  /*
  |--------------------------------------------------------------------------
  | End Call
  |--------------------------------------------------------------------------
  */

  const handleEndCall =
    useCallback(() => {

      if (callId) {

        endCallEvent({
          callId,
        });

      }

      stopCallSound();
      cleanupCall();

      setCallStatus("ended");

      onClose?.();

    }, [
      callId,
      cleanupCall,
      onClose,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Leave Group Call
  |--------------------------------------------------------------------------
  */

  const handleLeaveCall =
    useCallback(() => {

      if (callId) {

        leaveCallEvent({
          callId,
        });

      }

      stopCallSound();
      cleanupCall();

      setCallStatus("ended");

      onClose?.();

    }, [
      callId,
      cleanupCall,
      onClose,
    ]);


  /*
  |--------------------------------------------------------------------------
  | Close on Unmount
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    return () => {

      cleanupCall();

    };

  }, [cleanupCall]);


  /*
  |--------------------------------------------------------------------------
  | Visibility
  |--------------------------------------------------------------------------
  */

  if (
    !visible ||
    !call
  ) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Display Profile Information
  |--------------------------------------------------------------------------
  */

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
    "User";

  const profileUser =
    isCaller
      ? displayedUser
      : caller;

  const profileName =
    isCaller
      ? displayedName
      : callerName;

  const profileImage =
    getUserImage(profileUser);

  const statusText =
    callStatus === "connected"
      ? "Connected"
      : callStatus === "failed"
      ? "Connection failed"
      : callStatus === "ended"
      ? "Call ended"
      : isCaller
      ? (
          targetIsActive
            ? "Ringing..."
            : "Connecting..."
        )
      : "Connecting...";


  /*
  |--------------------------------------------------------------------------
  | Remote Stream Video
  |--------------------------------------------------------------------------
  */

  const RemoteVideo = ({
    stream,
    participantId,
  }) => {

    const videoRef =
      useRef(null);


    useEffect(() => {

      if (
        videoRef.current &&
        stream
      ) {

        videoRef.current.srcObject =
          stream;

      }

    }, [stream]);


    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        data-participant-id={
          participantId
        }
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "14px",
          background: "#111827",
        }}
      />
    );

  };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="call-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,

        zIndex: 9998,

        display: "flex",
        flexDirection: "column",

        background: "#111827",

        color: "#ffffff",
      }}
    >

      {/*
      |--------------------------------------------------------------------------
      | Header
      |--------------------------------------------------------------------------
      */}

      <div
        style={{
          height: "70px",

          flexShrink: 0,

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          padding:
            "0 20px",

          boxSizing:
            "border-box",

          background:
            "rgba(0, 0, 0, 0.35)",
        }}
      >

        <div>

          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            {isGroupCall
              ? "Group Call"
              : profileName}
          </div>

          <div
            style={{
              marginTop: "3px",

              fontSize: "13px",

              color:
                "#d1d5db",
            }}
          >
            {statusText}
          </div>

        </div>


        {isGroupCall && (
          <div
            style={{
              fontSize: "13px",
              color: "#d1d5db",
            }}
          >
            {remoteStreams.length + 1} connected
          </div>
        )}

      </div>


      {/*
      |--------------------------------------------------------------------------
      | Error
      |--------------------------------------------------------------------------
      */}

      {error && (
        <div
          style={{
            margin:
              "12px 20px",

            padding:
              "10px 14px",

            borderRadius:
              "10px",

            background:
              "rgba(239, 68, 68, 0.9)",

            fontSize: "13px",

            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}


      {/*
      |--------------------------------------------------------------------------
      | Video Area
      |--------------------------------------------------------------------------
      */}

      <div
        style={{
          flex: 1,

          minHeight: 0,

          position: "relative",

          padding: "16px",

          boxSizing:
            "border-box",

          display: "flex",
          flexWrap: "wrap",

          gap: "12px",

          alignItems: "center",
          justifyContent: "center",

          overflow: "auto",
        }}
      >

        {isVideoCall ? (

          <>
            {/*
             * Remote videos
             */}
            {remoteStreams.length >
            0 ? (

              remoteStreams.map(
                ({
                  participantId,
                  stream,
                }) => (
                  <div
                    key={
                      participantId
                    }
                    style={{
                      position:
                        "relative",

                      width:
                        isGroupCall
                          ? "calc(50% - 6px)"
                          : "100%",

                      maxWidth:
                        isGroupCall
                          ? "600px"
                          : "900px",

                      height:
                        isGroupCall
                          ? "300px"
                          : "100%",

                      minHeight:
                        "240px",
                    }}
                  >

                    <RemoteVideo
                      stream={
                        stream
                      }
                      participantId={
                        participantId
                      }
                    />

                    <div
                      style={{
                        position:
                          "absolute",

                        left: "10px",
                        bottom: "10px",

                        padding:
                          "5px 9px",

                        borderRadius:
                          "6px",

                        background:
                          "rgba(0, 0, 0, 0.55)",

                        fontSize:
                          "12px",
                      }}
                    >
                      {participantId}
                    </div>

                  </div>
                )
              )

            ) : (

              <div
                style={{
                  fontSize: "16px",
                  color: "#9ca3af",
                }}
              >
                Waiting for video...
              </div>

            )}


            {/*
             * Outgoing call target profile/status.
             */}
            {isCaller && (
              <div
                style={{
                  position: "absolute",
                  top: "28px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: "92px",
                    height: "92px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#374151",
                    border:
                      "3px solid rgba(255,255,255,0.3)",
                    boxShadow:
                      "0 10px 30px rgba(0,0,0,0.35)",
                  }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={profileName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "34px",
                      }}
                    >
                      👤
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background:
                      "rgba(0,0,0,0.55)",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {profileName}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#d1d5db",
                  }}
                >
                  {statusText}
                </div>
              </div>
            )}

            {/*
             * Local preview
             */}
            <div
              style={{
                position:
                  "absolute",

                right: "20px",
                bottom: "110px",

                width:
                  isGroupCall
                    ? "150px"
                    : "190px",

                height:
                  isGroupCall
                    ? "105px"
                    : "130px",

                borderRadius:
                  "12px",

                overflow:
                  "hidden",

                background:
                  "#1f2937",

                border:
                  "2px solid rgba(255,255,255,0.3)",

                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >

              {isCameraOff ? (

                <div
                  style={{
                    width: "100%",
                    height: "100%",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    fontSize: "28px",
                  }}
                >
                  📷
                </div>

              ) : (

                <video
                  ref={
                    localVideoRef
                  }
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",

                    objectFit:
                      "cover",
                  }}
                />

              )}

              <div
                style={{
                  position:
                    "absolute",

                  left: "7px",
                  bottom: "6px",

                  padding:
                    "3px 6px",

                  borderRadius:
                    "5px",

                  background:
                    "rgba(0,0,0,0.55)",

                  fontSize:
                    "10px",
                }}
              >
                You
              </div>

            </div>

          </>

        ) : (

          /*
           * Audio call UI
           */
          <div
            style={{
              display: "flex",
              flexDirection:
                "column",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: "16px",
            }}
          >

            <div
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#374151",
                fontSize: "44px",
                border:
                  "4px solid rgba(255,255,255,0.2)",
                overflow: "hidden",
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.35)",
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profileName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>
                  {isVideoCall ? "📹" : "🎤"}
                </span>
              )}
            </div>

            {isCaller && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "-6px",
                  color: "#d1d5db",
                  fontSize: "12px",
                }}
              >
                {myUserImage ? (
                  <img
                    src={myUserImage}
                    alt={myUserName}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border:
                        "1px solid rgba(255,255,255,0.25)",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#4b5563",
                    }}
                  >
                    👤
                  </span>
                )}

                <span>
                  Calling from {myUserName}
                </span>
              </div>
            )}

            <div
              style={{
                fontSize:
                  "22px",

                fontWeight:
                  700,
              }}
            >
              {callerName}
            </div>

            <div
              style={{
                fontSize:
                  "14px",

                color:
                  "#9ca3af",
              }}
            >
              {statusText}
            </div>

          </div>

        )}

      </div>


      {/*
      |--------------------------------------------------------------------------
      | Hidden Audio Element
      |--------------------------------------------------------------------------
      |
      | Audio output ke liye.
      |
      */}

      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{
          display: "none",
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | Controls
      |--------------------------------------------------------------------------
      */}

      <div
        style={{
          flexShrink: 0,

          padding:
            "8px 16px 20px",

          background:
            "rgba(0, 0, 0, 0.35)",
        }}
      >

        <CallControls
          callType={
            callType
          }

          isMuted={
            isMuted
          }

          isCameraOff={
            isCameraOff
          }

          isSpeakerOff={
            isSpeakerOff
          }

          onToggleMute={
            handleToggleMute
          }

          onToggleCamera={
            handleToggleCamera
          }

          onToggleSpeaker={
            handleToggleSpeaker
          }

          onEndCall={
            handleEndCall
          }

          onLeaveCall={
            handleLeaveCall
          }

          isGroupCall={
            isGroupCall
          }
        />

      </div>

    </div>
  );
};


export default CallModal;