import { useCallback, useEffect, useRef, useState } from "react";

import randomConnectService from "../services/randomConnect.service";

const RANDOM_EVENTS = {
  WAITING: "random-connect:waiting",
  MATCHED: "random-connect:matched",
  SIGNAL: "random-connect:signal",
  CONNECTION_ENDED: "random-connect:connection-ended",
  ERROR: "random-connect:error",
};

const RTC_CONFIGURATION = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const useRandomConnect = () => {
  const localVideoRef = useRef(null);
  const peerVideoRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const connectionIdRef = useRef(null);
  const initiatorRef = useRef(false);

  const subscriptionsRef = useRef([]);

  const [peer, setPeer] = useState(null);
  const [connectionId, setConnectionId] = useState(null);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);

  /*
   * Close WebRTC connection
   */
  const closePeerConnection = useCallback(() => {
    const peerConnection =
      peerConnectionRef.current;

    if (peerConnection) {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.oniceconnectionstatechange = null;

      peerConnection.close();

      peerConnectionRef.current = null;
    }

    if (peerVideoRef.current) {
      peerVideoRef.current.srcObject = null;
    }
  }, []);

  /*
   * Create WebRTC peer connection
   */
  const createPeerConnection = useCallback(
    (activeConnectionId) => {
      closePeerConnection();

      const peerConnection =
        new RTCPeerConnection(
          RTC_CONFIGURATION
        );

      peerConnectionRef.current =
        peerConnection;

      /*
       * Add local tracks
       */
      const localStream =
        localStreamRef.current;

      if (localStream) {
        localStream
          .getTracks()
          .forEach((track) => {
            peerConnection.addTrack(
              track,
              localStream
            );
          });
      }

      /*
       * Receive remote tracks
       */
      peerConnection.ontrack = (event) => {
        const [remoteStream] =
          event.streams;

        if (
          remoteStream &&
          peerVideoRef.current
        ) {
          peerVideoRef.current.srcObject =
            remoteStream;
        }
      };

      /*
       * Send ICE candidate
       */
      peerConnection.onicecandidate = (
        event
      ) => {
        if (!event.candidate) {
          return;
        }

        randomConnectService.sendSignal(
          activeConnectionId,
          {
            type: "ice-candidate",
            candidate: event.candidate,
          }
        );
      };

      /*
       * Connection state
       */
      peerConnection.onconnectionstatechange =
        () => {
          const state =
            peerConnection.connectionState;

          if (state === "connected") {
            setStatus("connected");
          }

          if (
            state === "failed" ||
            state === "disconnected" ||
            state === "closed"
          ) {
            if (
              peerConnectionRef.current ===
              peerConnection
            ) {
              setStatus("ended");
            }
          }
        };

      return peerConnection;
    },
    [closePeerConnection]
  );

  /*
   * Create offer
   */
  const createOffer = useCallback(
    async (activeConnectionId) => {
      const peerConnection =
        peerConnectionRef.current;

      if (!peerConnection) {
        return;
      }

      try {
        const offer =
          await peerConnection.createOffer();

        await peerConnection.setLocalDescription(
          offer
        );

        randomConnectService.sendSignal(
          activeConnectionId,
          {
            type: "offer",
            sdp: offer.sdp,
          }
        );
      } catch (err) {
        console.error(
          "WebRTC offer error:",
          err
        );

        setError(
          "Unable to start video connection."
        );
      }
    },
    []
  );

  /*
   * Handle incoming WebRTC signal
   */
  const handleSignal = useCallback(
    async (payload) => {
      if (!payload) {
        return;
      }

      const {
        connectionId: signalConnectionId,
        signal,
      } = payload;

      if (
        !signalConnectionId ||
        !signal
      ) {
        return;
      }

      if (
        connectionIdRef.current !==
        signalConnectionId
      ) {
        return;
      }

      const peerConnection =
        peerConnectionRef.current;

      if (!peerConnection) {
        return;
      }

      try {
        /*
         * Incoming offer
         */
        if (signal.type === "offer") {
          await peerConnection.setRemoteDescription(
            {
              type: "offer",
              sdp: signal.sdp,
            }
          );

          const answer =
            await peerConnection.createAnswer();

          await peerConnection.setLocalDescription(
            answer
          );

          randomConnectService.sendSignal(
            signalConnectionId,
            {
              type: "answer",
              sdp: answer.sdp,
            }
          );

          return;
        }

        /*
         * Incoming answer
         */
        if (signal.type === "answer") {
          await peerConnection.setRemoteDescription(
            {
              type: "answer",
              sdp: signal.sdp,
            }
          );

          return;
        }

        /*
         * Incoming ICE candidate
         */
        if (
          signal.type ===
          "ice-candidate"
        ) {
          if (!signal.candidate) {
            return;
          }

          await peerConnection.addIceCandidate(
            signal.candidate
          );
        }
      } catch (err) {
        console.error(
          "WebRTC signal handling error:",
          err
        );
      }
    },
    []
  );

  /*
   * Handle matched user
   */
  const handleMatched = useCallback(
    async (payload) => {
      if (!payload) {
        return;
      }

      const {
        connectionId:
          matchedConnectionId,
        peer: matchedPeer,
        initiator,
      } = payload;

      if (!matchedConnectionId) {
        return;
      }

      connectionIdRef.current =
        matchedConnectionId;

      initiatorRef.current =
        Boolean(initiator);

      setConnectionId(
        matchedConnectionId
      );

      setPeer(matchedPeer || null);
      setError("");
      setStatus("connecting");

      const peerConnection =
        createPeerConnection(
          matchedConnectionId
        );

      if (
        peerConnection &&
        initiator
      ) {
        await createOffer(
          matchedConnectionId
        );
      }
    },
    [createPeerConnection, createOffer]
  );

  /*
   * Waiting event
   */
  const handleWaiting = useCallback(
    (payload) => {
      setStatus("waiting");
      setError(
        ""
      );

      if (
        payload?.message
      ) {
        return;
      }
    },
    []
  );

  /*
   * Connection ended event
   */
  const handleConnectionEnded =
    useCallback(
      (payload) => {
        const endedConnectionId =
          payload?.connectionId;

        if (
          endedConnectionId &&
          connectionIdRef.current &&
          endedConnectionId !==
            connectionIdRef.current
        ) {
          return;
        }

        closePeerConnection();

        connectionIdRef.current =
          null;

        initiatorRef.current =
          false;

        setConnectionId(null);
        setPeer(null);
        setStatus("ended");
      },
      [closePeerConnection]
    );

  /*
   * Socket error
   */
  const handleError = useCallback(
    (payload) => {
      setError(
        payload?.message ||
          "Random connection error occurred."
      );
    },
    []
  );

  /*
   * Subscribe to random-connect events
   */
  useEffect(() => {
    const subscriptions = [];

    const addSubscription = (
      event,
      callback
    ) => {
      const subscription =
        randomConnectService.subscribeToRandomConnectEvent(
          event,
          callback
        );

      if (subscription) {
        subscriptions.push(
          subscription
        );
      }
    };

    addSubscription(
      RANDOM_EVENTS.WAITING,
      handleWaiting
    );

    addSubscription(
      RANDOM_EVENTS.MATCHED,
      handleMatched
    );

    addSubscription(
      RANDOM_EVENTS.SIGNAL,
      handleSignal
    );

    addSubscription(
      RANDOM_EVENTS.CONNECTION_ENDED,
      handleConnectionEnded
    );

    addSubscription(
      RANDOM_EVENTS.ERROR,
      handleError
    );

    subscriptionsRef.current =
      subscriptions;

    return () => {
      subscriptions.forEach(
        (subscription) => {
          randomConnectService.unsubscribeFromRandomConnectEvent(
            subscription
          );
        }
      );

      subscriptionsRef.current = [];
    };
  }, [
    handleWaiting,
    handleMatched,
    handleSignal,
    handleConnectionEnded,
    handleError,
  ]);

  /*
   * Start local camera and microphone
   */
  const startLocalMedia = useCallback(async () => {
  if (localStreamRef.current) {
    return localStreamRef.current;
  }

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error(
      "Camera and microphone are not supported by this browser."
    );
  }

  let stream = null;

  // 1. Camera + microphone
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    console.log(
      "Random Connect: Camera + microphone started successfully."
    );
  } catch (err) {
    console.warn(
      "Random Connect: Camera + microphone unavailable:",
      err?.name,
      err?.message
    );
  }

  // 2. Microphone only
  if (!stream) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      console.warn(
        "Random Connect: Camera unavailable. Starting with microphone only."
      );
    } catch (err) {
      console.warn(
        "Random Connect: Microphone unavailable:",
        err?.name,
        err?.message
      );
    }
  }

  // 3. Nothing available
  if (!stream) {
    throw new Error(
      "Camera and microphone are unavailable. Please check your device permissions."
    );
  }

  localStreamRef.current = stream;

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = stream;
  }

  return stream;
}, []);

  /*
   * Join random queue
   */
  const startRandomConnect =
    useCallback(async () => {
      try {
        setError("");
        setStatus("starting");

        await startLocalMedia();

        const socket =
           randomConnectService.getRandomConnectSocket();

        if (!socket) {
          throw new Error(
            "Socket connection is not available."
          );
        }

        if (!socket.connected) {
          throw new Error(
            "Socket is not connected. Please try again."
          );
        }

        randomConnectService.joinRandomConnect();

        setStatus("waiting");
      } catch (err) {
        console.error(
          "Random Connect start error:",
          err
        );

        setStatus("idle");

        setError(
          err?.message ||
            "Unable to start Random Connect."
        );
      }
    }, [startLocalMedia]);

  /*
   * Next random user
   */
  const nextRandomUser =
    useCallback(() => {
      const activeConnectionId =
        connectionIdRef.current;

      if (!activeConnectionId) {
        return;
      }

      closePeerConnection();

      setPeer(null);
      setConnectionId(null);
      setError("");
      setStatus("waiting");

      connectionIdRef.current =
        null;

      initiatorRef.current =
        false;

      randomConnectService.nextRandomUser(
        activeConnectionId
      );
    }, [closePeerConnection]);

  /*
   * End random connection
   */
  const endRandomConnection =
    useCallback(() => {
      const activeConnectionId =
        connectionIdRef.current;

      if (activeConnectionId) {
        randomConnectService.endRandomConnection(
          activeConnectionId
        );
      } else {
        randomConnectService.leaveRandomConnect();
      }

      closePeerConnection();

      connectionIdRef.current =
        null;

      initiatorRef.current =
        false;

      setConnectionId(null);
      setPeer(null);
      setStatus("ended");
    }, [closePeerConnection]);

  /*
   * Toggle microphone
   */
  const toggleMute = useCallback(() => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const audioTracks =
      stream.getAudioTracks();

    if (!audioTracks.length) {
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

    setIsMuted(nextMuted);
  }, [isMuted]);

  /*
   * Toggle camera
   */
  const toggleCamera =
    useCallback(() => {
      const stream =
        localStreamRef.current;

      if (!stream) {
        return;
      }

      const videoTracks =
        stream.getVideoTracks();

      if (!videoTracks.length) {
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
    }, [isCameraOff]);

  /*
   * Toggle speaker
   */
  const toggleSpeaker =
    useCallback(() => {
      const video =
        peerVideoRef.current;

      if (!video) {
        return;
      }

      const nextSpeakerOff =
        !isSpeakerOff;

      video.muted =
        nextSpeakerOff;

      setIsSpeakerOff(
        nextSpeakerOff
      );
    }, [isSpeakerOff]);

  /*
   * Stop local media
   */
  const stopLocalMedia =
    useCallback(() => {
      const stream =
        localStreamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        localStreamRef.current =
          null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          null;
      }
    }, []);

  /*
   * Cleanup
   */
  useEffect(() => {
    return () => {
      const activeConnectionId =
        connectionIdRef.current;

      if (activeConnectionId) {
        randomConnectService.endRandomConnection(
          activeConnectionId
        );
      } else {
        randomConnectService.leaveRandomConnect();
      }

      closePeerConnection();
      stopLocalMedia();

      connectionIdRef.current =
        null;
      initiatorRef.current =
        false;
    };
  }, [
    closePeerConnection,
    stopLocalMedia,
  ]);

  return {
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
  };
};

export default useRandomConnect;