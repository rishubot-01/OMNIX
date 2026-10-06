import { useCallback, useEffect, useRef, useState } from "react";
import liveService from "../services/live.service";

import {
  getSocketClient,
  sendSocketMessage,
  subscribeTo,
  unsubscribeFrom,
} from "../socket/socket";

const EVENTS = {
  LIVE_START: "live:start",
  LIVE_STARTED: "live:started",

  LIVE_JOIN: "live:join",
  LIVE_JOINED: "live:joined",

  LIVE_LEAVE: "live:leave",

  LIVE_END: "live:end",
  LIVE_ENDED: "live:ended",

  LIVE_SIGNAL: "live:signal",

  LIVE_COMMENT: "live:comment",
  LIVE_COMMENT_NEW: "live:comment:new",

  LIVE_REACTION: "live:reaction",
  LIVE_REACTION_NEW: "live:reaction:new",

  LIVE_VIEWER_JOINED: "live:viewer:joined",
  LIVE_VIEWER_LEFT: "live:viewer:left",
  LIVE_VIEWER_COUNT: "live:viewer:count",

  LIVE_ERROR: "live:error",
};
const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const useLive = () => {
  // ---------------------------------------------------------
  // Live state
  // ---------------------------------------------------------

  const [live, setLive] = useState(null);
  const [liveId, setLiveId] = useState(null);

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [isLive, setIsLive] = useState(false);
  const [isViewer, setIsViewer] = useState(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const [viewerCount, setViewerCount] = useState(0);

  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Refs
  // ---------------------------------------------------------

  const localStreamRef = useRef(null);

  const peerConnectionRef = useRef(null);

  const pendingIceCandidatesRef = useRef([]);

  const subscriptionsRef = useRef([]);

  const activeLiveIdRef = useRef(null);

  const isHostRef = useRef(false);

  // Host needs viewer socket id.
  const viewerSocketIdRef = useRef(null);

  // Viewer needs host socket id.
  const hostSocketIdRef = useRef(null);

  // ---------------------------------------------------------
  // Cleanup local media
  // ---------------------------------------------------------

  const stopLocalStream = useCallback(() => {
    const localStream = localStreamRef.current;

    if (!localStream) {
      return;
    }

    localStream.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;

    setStream(null);

    setMicEnabled(true);
    setCameraEnabled(true);
  }, []);

  // ---------------------------------------------------------
  // Cleanup peer connection
  // ---------------------------------------------------------

  const closePeerConnection = useCallback(() => {
    const peerConnection = peerConnectionRef.current;

    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.oniceconnectionstatechange = null;

      try {
        peerConnection.close();
      } catch (err) {
        console.error("Failed to close peer connection:", err);
      }

      peerConnectionRef.current = null;
    }

    pendingIceCandidatesRef.current = [];

    setRemoteStream(null);
  }, []);

  // ---------------------------------------------------------
  // Get camera + microphone
  // ---------------------------------------------------------
 const getMedia = useCallback(async () => {
  if (localStreamRef.current) {
    return localStreamRef.current;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Camera and microphone are not supported by this browser"
    );
  }

  let mediaStream = null;

  // 1. Try camera + microphone
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    console.log("Camera + microphone started successfully.");
  } catch (err) {
    console.warn(
      "Camera + microphone unavailable:",
      err?.name,
      err?.message
    );
  }

  // 2. Try microphone only
  if (!mediaStream) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      console.warn(
        "Camera unavailable. Starting live with microphone only."
      );
    } catch (err) {
      console.warn(
        "Microphone unavailable:",
        err?.name,
        err?.message
      );
    }
  }

  // 3. If camera + microphone both unavailable,
  // create an empty stream instead of throwing an error.
  if (!mediaStream) {
    console.warn(
      "Camera and microphone are unavailable. Starting live without local media."
    );

    mediaStream = new MediaStream();
  }

  localStreamRef.current = mediaStream;

  setStream(mediaStream);

  const audioTrack = mediaStream.getAudioTracks()[0];
  const videoTrack = mediaStream.getVideoTracks()[0];

  setMicEnabled(audioTrack ? audioTrack.enabled : false);
  setCameraEnabled(videoTrack ? videoTrack.enabled : false);

  return mediaStream;
}, []);
 
  // ---------------------------------------------------------
  // Flush queued ICE candidates
  // ---------------------------------------------------------

  const flushIceCandidates = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection) {
      return;
    }

    if (!peerConnection.remoteDescription) {
      return;
    }

    const candidates = [...pendingIceCandidatesRef.current];

    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (err) {
        console.error(
          "Failed to add queued ICE candidate:",
          err
        );
      }
    }
  }, []);

  // ---------------------------------------------------------
  // Create WebRTC peer connection
  // ---------------------------------------------------------

  const createPeerConnection = useCallback(
    async (shouldCreateOffer = false, targetSocketId = null) => {
      /*
       * For the current OMEE implementation we use one peer
       * connection at a time.
       */

      closePeerConnection();

      const peerConnection = new RTCPeerConnection(ICE_SERVERS);

      peerConnectionRef.current = peerConnection;

      // -----------------------------------------------------
      // Add local tracks
      // -----------------------------------------------------

      const localStream = localStreamRef.current;

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // -----------------------------------------------------
      // Receive remote stream
      // -----------------------------------------------------

      peerConnection.ontrack = (event) => {
        const [incomingStream] = event.streams;

        if (incomingStream) {
          setRemoteStream(incomingStream);
        }
      };

      // -----------------------------------------------------
      // ICE candidate
      // -----------------------------------------------------

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        const currentLiveId = activeLiveIdRef.current;

        if (!currentLiveId) {
          return;
        }

        let destinationSocketId = targetSocketId;

        if (!destinationSocketId) {
          if (isHostRef.current) {
            destinationSocketId = viewerSocketIdRef.current;
          } else {
            destinationSocketId = hostSocketIdRef.current;
          }
        }

        if (!destinationSocketId) {
          return;
        }

        sendSocketMessage(EVENTS.LIVE_SIGNAL, {
          liveId: currentLiveId,

          targetSocketId: destinationSocketId,

          signal: {
            type: "ice-candidate",
            candidate: event.candidate,
          },
        });
      };

      // -----------------------------------------------------
      // Connection state
      // -----------------------------------------------------

      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;

        if (
          state === "failed" ||
          state === "closed" ||
          state === "disconnected"
        ) {
          setRemoteStream(null);
        }
      };

      // -----------------------------------------------------
      // ICE connection state
      // -----------------------------------------------------

      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;

        if (
          state === "failed" ||
          state === "closed" ||
          state === "disconnected"
        ) {
          setRemoteStream(null);
        }
      };

      // -----------------------------------------------------
      // Create offer
      // -----------------------------------------------------

      if (shouldCreateOffer) {
        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);

        const currentLiveId = activeLiveIdRef.current;

        if (currentLiveId) {
          let destinationSocketId = targetSocketId;

          if (!destinationSocketId) {
            destinationSocketId =
              viewerSocketIdRef.current;
          }

          if (destinationSocketId) {
            sendSocketMessage(EVENTS.LIVE_SIGNAL, {
              liveId: currentLiveId,

              targetSocketId: destinationSocketId,

              signal: {
                type: "offer",
                sdp: offer,
              },
            });
          }
        }
      }

      return peerConnection;
    },
    [closePeerConnection]
  );

  // ---------------------------------------------------------
  // Handle incoming WebRTC signal
  // ---------------------------------------------------------

  const handleSignal = useCallback(
    async (payload) => {
      const signal = payload?.signal;

      if (!signal) {
        return;
      }

      const signalLiveId = payload?.liveId;

      const currentLiveId = activeLiveIdRef.current;

      if (
        signalLiveId &&
        currentLiveId &&
        String(signalLiveId) !== String(currentLiveId)
      ) {
        return;
      }

      try {
        let peerConnection = peerConnectionRef.current;

        // ---------------------------------------------------
        // OFFER
        // ---------------------------------------------------

        if (signal.type === "offer") {
          /*
           * Only viewer should normally receive host offer.
           */

          if (isHostRef.current) {
            return;
          }

          if (!peerConnection) {
            peerConnection = await createPeerConnection(false);
          }

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.sdp)
          );

          await flushIceCandidates();

          const answer = await peerConnection.createAnswer();

          await peerConnection.setLocalDescription(answer);

          const currentLiveId =
            activeLiveIdRef.current;

          const hostSocketId =
            hostSocketIdRef.current ||
            payload?.fromSocketId;

          if (
            currentLiveId &&
            hostSocketId
          ) {
            sendSocketMessage(EVENTS.LIVE_SIGNAL, {
              liveId: currentLiveId,

              targetSocketId: hostSocketId,

              signal: {
                type: "answer",
                sdp: answer,
              },
            });
          }

          return;
        }

        // ---------------------------------------------------
        // ANSWER
        // ---------------------------------------------------

        if (signal.type === "answer") {
          /*
           * Only host should normally receive viewer answer.
           */

          if (!isHostRef.current) {
            return;
          }

          if (!peerConnection) {
            return;
          }

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.sdp)
          );

          await flushIceCandidates();

          return;
        }

        // ---------------------------------------------------
        // ICE CANDIDATE
        // ---------------------------------------------------

        if (signal.type === "ice-candidate") {
          if (!signal.candidate) {
            return;
          }

          if (
            !peerConnection ||
            !peerConnection.remoteDescription
          ) {
            pendingIceCandidatesRef.current.push(
              signal.candidate
            );

            return;
          }

          await peerConnection.addIceCandidate(
            signal.candidate
          );
        }
      } catch (err) {
        console.error(
          "Live WebRTC signaling error:",
          err
        );

        setError(
          "Failed to establish live video connection"
        );
      }
    },
    [createPeerConnection, flushIceCandidates]
  );

  // ---------------------------------------------------------
  // Socket event subscriptions
  // ---------------------------------------------------------

  useEffect(() => {
    const socket = getSocketClient();

    if (!socket) {
      return;
    }

    const subscriptions = [];

    const subscribe = (event, callback) => {
      const subscription = subscribeTo(
        event,
        callback
      );

      if (subscription) {
        subscriptions.push(subscription);
      }
    };

    // -------------------------------------------------------
    // LIVE STARTED
    // -------------------------------------------------------

    subscribe(EVENTS.LIVE_STARTED, (payload) => {
      const newLiveId =
        payload?.liveId ||
        payload?.live?._id ||
        payload?.live?.id;

      if (!newLiveId) {
        setError("Live ID was not returned");

        return;
      }

      const normalizedLiveId =
        String(newLiveId);

      setLiveId(normalizedLiveId);

      activeLiveIdRef.current =
        normalizedLiveId;

      setLive(
        payload?.live ||
          payload ||
          null
      );

      setIsLive(true);
      setIsViewer(false);

      isHostRef.current = true;

      viewerSocketIdRef.current = null;
      hostSocketIdRef.current = null;

      setViewerCount(
        Number(
          payload?.live?.viewerCount ??
            payload?.viewerCount ??
            0
        )
      );

      setComments([]);
      setReactions([]);
      setError("");
    });

    // -------------------------------------------------------
    // LIVE JOINED
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_JOINED,
      async (payload) => {
        const joinedLiveId =
          payload?.liveId ||
          payload?.live?._id ||
          payload?.live?.id;

        if (!joinedLiveId) {
          return;
        }

        const normalizedLiveId =
          String(joinedLiveId);

        /*
         * Ignore LIVE_JOINED belonging to another live.
         */

        if (
          activeLiveIdRef.current &&
          String(activeLiveIdRef.current) !==
            normalizedLiveId
        ) {
          return;
        }

        setLiveId(normalizedLiveId);

        activeLiveIdRef.current =
          normalizedLiveId;

        setLive(
          payload?.live ||
            payload ||
            null
        );

        setIsViewer(true);
        setIsLive(true);

        isHostRef.current = false;

        /*
         * Backend sends hostSocketId so viewer can send
         * answer + ICE candidates directly to host.
         */

        hostSocketIdRef.current =
          payload?.hostSocketId ||
          payload?.hostSocket?.id ||
          null;

        viewerSocketIdRef.current = null;

        setViewerCount(
          Number(
            payload?.live?.viewerCount ??
              payload?.viewerCount ??
              0
          )
        );

        setError("");

        try {
          await createPeerConnection(false);
        } catch (err) {
          console.error(
            "Failed to create viewer peer connection:",
            err
          );

          setError(
            "Failed to connect to live stream"
          );
        }
      }
    );

    // -------------------------------------------------------
    // LIVE SIGNAL
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_SIGNAL,
      handleSignal
    );

    // -------------------------------------------------------
    // VIEWER COUNT
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_VIEWER_COUNT,
      (payload) => {
        const count = Number(
          payload?.viewerCount ??
            payload?.count ??
            payload?.live?.viewerCount ??
            0
        );

        setViewerCount(count);
      }
    );

    // -------------------------------------------------------
    // VIEWER JOINED
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_VIEWER_JOINED,
      async (payload) => {
        const count =
          payload?.viewerCount;

        if (count !== undefined) {
          setViewerCount(Number(count));
        }

        /*
         * This event is primarily for host.
         */

        if (!isHostRef.current) {
          return;
        }

        const joinedLiveId =
          payload?.liveId;

        const currentLiveId =
          activeLiveIdRef.current;

        if (
          joinedLiveId &&
          currentLiveId &&
          String(joinedLiveId) !==
            String(currentLiveId)
        ) {
          return;
        }

        const viewerSocketId =
          payload?.socketId ||
          payload?.viewerSocketId ||
          null;

        if (!viewerSocketId) {
          console.warn(
            "Viewer socket id missing from LIVE_VIEWER_JOINED"
          );

          return;
        }

        viewerSocketIdRef.current =
          viewerSocketId;

        try {
          /*
           * Create host -> viewer offer.
           */

          await createPeerConnection(
            true,
            viewerSocketId
          );
        } catch (err) {
          console.error(
            "Failed to create live offer:",
            err
          );

          setError(
            "Failed to establish live video connection"
          );
        }
      }
    );

    // -------------------------------------------------------
    // VIEWER LEFT
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_VIEWER_LEFT,
      (payload) => {
        const count =
          payload?.viewerCount;

        if (count !== undefined) {
          setViewerCount(Number(count));
        }

        /*
         * Host should remove the peer connection when
         * current viewer leaves.
         */

        if (isHostRef.current) {
          const leftSocketId =
            payload?.socketId ||
            payload?.viewerSocketId ||
            null;

          if (
            !leftSocketId ||
            leftSocketId ===
              viewerSocketIdRef.current
          ) {
            viewerSocketIdRef.current =
              null;

            closePeerConnection();
          }
        }
      }
    );

    // -------------------------------------------------------
    // NEW COMMENT
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_COMMENT_NEW,
      (payload) => {
        const comment =
          payload?.comment ||
          payload;

        if (!comment) {
          return;
        }

        setComments((previous) => [
          ...previous,
          comment,
        ]);
      }
    );

    // -------------------------------------------------------
    // NEW REACTION
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_REACTION_NEW,
      (payload) => {
        const reaction =
          payload?.reaction ||
          payload;

        if (!reaction) {
          return;
        }

        setReactions((previous) => [
          ...previous,
          reaction,
        ]);
      }
    );

    // -------------------------------------------------------
    // LIVE ENDED
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_ENDED,
      (payload) => {
        const endedLiveId =
          payload?.liveId ||
          payload?.live?._id ||
          payload?.live?.id;

        const currentLiveId =
          activeLiveIdRef.current;

        /*
         * Ignore another live's LIVE_ENDED event.
         */

        if (
          currentLiveId &&
          endedLiveId &&
          String(endedLiveId) !==
            String(currentLiveId)
        ) {
          return;
        }

        setIsLive(false);
        setIsViewer(false);

        setLive(null);
        setLiveId(null);

        setRemoteStream(null);

        setViewerCount(0);

        setComments([]);
        setReactions([]);

        activeLiveIdRef.current =
          null;

        isHostRef.current = false;

        viewerSocketIdRef.current =
          null;

        hostSocketIdRef.current =
          null;

        closePeerConnection();

        /*
         * Do not call stopLocalStream here automatically
         * because the host's local camera can be kept until
         * endLive cleanup finishes.
         */
      }
    );

    // -------------------------------------------------------
    // LIVE ERROR
    // -------------------------------------------------------

    subscribe(
      EVENTS.LIVE_ERROR,
      (payload) => {
        setError(
          payload?.message ||
            payload?.error ||
            "Live operation failed"
        );
      }
    );

    subscriptionsRef.current =
      subscriptions;

    // -------------------------------------------------------
    // Cleanup subscriptions
    // -------------------------------------------------------

    return () => {
      subscriptions.forEach(
        (subscription) => {
          unsubscribeFrom(subscription);
        }
      );

      subscriptionsRef.current = [];
    };
  }, [
    closePeerConnection,
    createPeerConnection,
    handleSignal,
  ]);

  // ---------------------------------------------------------
  // Start live
  // ---------------------------------------------------------

  const startLive = useCallback(
    async (title, visibility = "PUBLIC") => {
      if (loading) {
        return;
      }

      const cleanTitle =
        typeof title === "string"
          ? title.trim()
          : "";

      if (!cleanTitle) {
        throw new Error(
          "Live title is required"
        );
      }

      if (
        visibility !== "PUBLIC" &&
        visibility !== "FOLLOWERS"
      ) {
        throw new Error(
          "Invalid live visibility"
        );
      }

      try {
        setLoading(true);
        setError("");

        const socket =
        getSocketClient();

        if (!socket?.connected) {
          throw new Error(
            "Socket is not connected"
          );
        }

        /*
         * Get camera + microphone first.
         */

        await getMedia();

        /*
         * IMPORTANT:
         *
         * Do NOT call liveService.createLive().
         *
         * Backend LIVE_START itself creates the Live DB
         * record and returns liveId through LIVE_STARTED.
         */

        sendSocketMessage(
          EVENTS.LIVE_START,
          {
            title: cleanTitle,
            visibility,
          }
        );

        /*
         * LIVE_STARTED event will set:
         *
         * live
         * liveId
         * isLive
         * isHostRef
         *
         * Host peer connection will be created when
         * LIVE_VIEWER_JOINED arrives.
         */

        return {
          title: cleanTitle,
          visibility,
        };
      } catch (err) {
        console.error(
          "Start live error:",
          err
        );

        setError(
          err?.message ||
            "Failed to start live"
        );

        stopLocalStream();

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      getMedia,
      loading,
      stopLocalStream,
    ]
  );

  // ---------------------------------------------------------
  // Join live
  // ---------------------------------------------------------

  const joinLive = useCallback(
    async (targetLiveId) => {
      if (
        !targetLiveId ||
        loading
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const socket =
          getSocketClient();

        if (!socket?.connected) {
          throw new Error(
            "Socket is not connected"
          );
        }

        const normalizedLiveId =
          String(targetLiveId);

        /*
         * Verify live exists and is active.
         */

        const response =
          await liveService.getActiveLive(
            normalizedLiveId
          );

        const activeLive =
          response?.live ||
          response?.data ||
          response;

        if (!activeLive) {
          throw new Error(
            "Live is no longer active"
          );
        }

        /*
         * Get viewer camera + microphone.
         *
         * This is needed because viewer sends its
         * audio/video tracks to host.
         */

        await getMedia();

        setLive(activeLive);

        setLiveId(
          normalizedLiveId
        );

        activeLiveIdRef.current =
          normalizedLiveId;

        isHostRef.current = false;

        setIsViewer(true);

        setIsLive(true);

        viewerSocketIdRef.current =
          null;

        hostSocketIdRef.current =
          null;

        setViewerCount(
          Number(
            activeLive?.viewerCount ??
              0
          )
        );

        /*
         * Ask backend to join the live room.
         *
         * Backend LIVE_JOINED will give us
         * hostSocketId.
         */

        sendSocketMessage(
          EVENTS.LIVE_JOIN,
          {
            liveId:
              normalizedLiveId,
          }
        );

        return activeLive;
      } catch (err) {
        console.error(
          "Join live error:",
          err
        );

        setError(
          err?.message ||
            "Failed to join live"
        );

        stopLocalStream();

        closePeerConnection();

        activeLiveIdRef.current =
          null;

        isHostRef.current = false;

        setLiveId(null);
        setLive(null);
        setIsLive(false);
        setIsViewer(false);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      closePeerConnection,
      getMedia,
      loading,
      stopLocalStream,
    ]
  );

  // ---------------------------------------------------------
  // Leave live as viewer
  // ---------------------------------------------------------

  const leaveLive = useCallback(() => {
    const currentLiveId =
      activeLiveIdRef.current;

    /*
     * Only viewer should send LIVE_LEAVE.
     */

    if (
      currentLiveId &&
      !isHostRef.current
    ) {
      sendSocketMessage(
        EVENTS.LIVE_LEAVE,
        {
          liveId:
            currentLiveId,
        }
      );
    }

    closePeerConnection();

    stopLocalStream();

    activeLiveIdRef.current =
      null;

    isHostRef.current = false;

    viewerSocketIdRef.current =
      null;

    hostSocketIdRef.current =
      null;

    setLiveId(null);
    setLive(null);

    setIsLive(false);
    setIsViewer(false);

    setViewerCount(0);

    setComments([]);
    setReactions([]);

    setError("");
  }, [
    closePeerConnection,
    stopLocalStream,
  ]);

  // ---------------------------------------------------------
  // End live as host
  // ---------------------------------------------------------

  const endLive = useCallback(
    async () => {
      const currentLiveId =
        activeLiveIdRef.current;

      if (!currentLiveId) {
        /*
         * No active live.
         */

        closePeerConnection();
        stopLocalStream();

        setLiveId(null);
        setLive(null);

        setIsLive(false);
        setIsViewer(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        if (isHostRef.current) {
          /*
           * IMPORTANT:
           *
           * Do NOT call REST liveService.endLive()
           * here.
           *
           * Socket LIVE_END is the source of truth for
           * the active live session.
           *
           * Backend will:
           * 1. verify host
           * 2. end DB live
           * 3. emit LIVE_ENDED
           * 4. remove active live
           */

          sendSocketMessage(
            EVENTS.LIVE_END,
            {
              liveId:
                currentLiveId,
            }
          );
        } else {
          /*
           * Viewer leaves the live.
           */

          sendSocketMessage(
            EVENTS.LIVE_LEAVE,
            {
              liveId:
                currentLiveId,
            }
          );
        }
      } catch (err) {
        console.error(
          "End live error:",
          err
        );

        setError(
          err?.message ||
            "Failed to end live"
        );

        throw err;
      } finally {
        /*
         * Clean local WebRTC/media immediately.
         */

        closePeerConnection();

        stopLocalStream();

        activeLiveIdRef.current =
          null;

        isHostRef.current = false;

        viewerSocketIdRef.current =
          null;

        hostSocketIdRef.current =
          null;

        setLiveId(null);
        setLive(null);

        setIsLive(false);
        setIsViewer(false);

        setViewerCount(0);

        setComments([]);
        setReactions([]);

        setLoading(false);
      }
    },
    [
      closePeerConnection,
      stopLocalStream,
    ]
  );

  // ---------------------------------------------------------
  // Toggle microphone
  // ---------------------------------------------------------

  const toggleMic = useCallback(() => {
    const mediaStream =
      localStreamRef.current;

    if (!mediaStream) {
      return;
    }

    const audioTracks =
      mediaStream.getAudioTracks();

    if (!audioTracks.length) {
      return;
    }

    const nextState =
      !audioTracks[0].enabled;

    audioTracks.forEach(
      (track) => {
        track.enabled =
          nextState;
      }
    );

    setMicEnabled(nextState);
  }, []);

  // ---------------------------------------------------------
  // Toggle camera
  // ---------------------------------------------------------

  const toggleCamera = useCallback(() => {
    const mediaStream =
      localStreamRef.current;

    if (!mediaStream) {
      return;
    }

    const videoTracks =
      mediaStream.getVideoTracks();

    if (!videoTracks.length) {
      return;
    }

    const nextState =
      !videoTracks[0].enabled;

    videoTracks.forEach(
      (track) => {
        track.enabled =
          nextState;
      }
    );

    setCameraEnabled(nextState);
  }, []);

  // ---------------------------------------------------------
  // Send comment
  // ---------------------------------------------------------

  const sendComment = useCallback(
    (text) => {
      const currentLiveId =
        activeLiveIdRef.current;

      const cleanText =
        typeof text === "string"
          ? text.trim()
          : "";

      if (
        !currentLiveId ||
        !cleanText
      ) {
        return false;
      }

      /*
       * Backend expects:
       *
       * {
       *   liveId,
       *   content
       * }
       *
       * NOT `comment`.
       */

      return sendSocketMessage(
        EVENTS.LIVE_COMMENT,
        {
          liveId:
            currentLiveId,

          content:
            cleanText,
        }
      );
    },
    []
  );

  // ---------------------------------------------------------
  // Send reaction
  // ---------------------------------------------------------

  const sendReaction =
    useCallback(
      (reaction) => {
        const currentLiveId =
          activeLiveIdRef.current;

        if (
          !currentLiveId ||
          !reaction
        ) {
          return false;
        }

        return sendSocketMessage(
          EVENTS.LIVE_REACTION,
          {
            liveId:
              currentLiveId,

            reaction,
          }
        );
      },
      []
    );

  // ---------------------------------------------------------
  // Fetch active lives
  // ---------------------------------------------------------

  const getActiveLives =
    useCallback(
      async (
        page = 1,
        limit = 20
      ) => {
        try {
          setError("");

          return await liveService.getActiveLives(
            page,
            limit
          );
        } catch (err) {
          console.error(
            "Get active lives error:",
            err
          );

          setError(
            err?.message ||
              "Failed to load active lives"
          );

          throw err;
        }
      },
      []
    );

  // ---------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      const currentLiveId =
        activeLiveIdRef.current;

      if (currentLiveId) {
        if (isHostRef.current) {
          /*
           * Backend also has disconnect protection,
           * but explicitly ending here is useful when
           * component is removed while socket remains
           * connected.
           */

          sendSocketMessage(
            EVENTS.LIVE_END,
            {
              liveId:
                currentLiveId,
            }
          );
        } else {
          sendSocketMessage(
            EVENTS.LIVE_LEAVE,
            {
              liveId:
                currentLiveId,
            }
          );
        }
      }

      // Close peer connection.
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch (err) {
          console.error(
            "Peer cleanup error:",
            err
          );
        }

        peerConnectionRef.current =
          null;
      }

      // Stop camera + microphone.
      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        localStreamRef.current = null;
      }

      pendingIceCandidatesRef.current =
        [];

      activeLiveIdRef.current =
        null;

      isHostRef.current = false;

      viewerSocketIdRef.current =
        null;

      hostSocketIdRef.current =
        null;
    };
  }, []);

  // ---------------------------------------------------------
  // Return
  // ---------------------------------------------------------

  return {
    // -------------------------------------------------------
    // Live state
    // -------------------------------------------------------

    live,
    liveId,

    isLive,
    isViewer,

    // -------------------------------------------------------
    // Media
    // -------------------------------------------------------

    stream,
    remoteStream,

    micEnabled,
    cameraEnabled,

    // -------------------------------------------------------
    // Live data
    // -------------------------------------------------------

    viewerCount,

    comments,
    reactions,

    // -------------------------------------------------------
    // UI state
    // -------------------------------------------------------

    loading,
    error,

    // -------------------------------------------------------
    // Actions
    // -------------------------------------------------------

    startLive,
    joinLive,
    leaveLive,
    endLive,

    toggleMic,
    toggleCamera,

    sendComment,
    sendReaction,

    getActiveLives,

    // -------------------------------------------------------
    // Utility
    // -------------------------------------------------------

    getMedia,
    stopLocalStream,
    closePeerConnection,
  };
};

export default useLive;