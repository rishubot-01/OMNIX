import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import IncomingCall from "./IncomingCall";
import CallModal from "./CallModal";

import {
  createCallEvent,
  acceptCallEvent,
  rejectCallEvent,
  endCallEvent,
  leaveCallEvent,
} from "../../socket/socketEvents";

import {
  listenToIncomingCall,
  listenToCallJoined,
  listenToCallAccepted,
  listenToCallRejected,
  listenToCallEnded,
  listenToCallError,
  removeListeners,
} from "../../socket/socketListeners";

const GlobalCallContext = createContext(null);

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getUserId = (user) => {
  return user?._id || user?.id || null;
};

const getUserName = (user) => {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    "User"
  );
};

const buildUser = (user = {}) => {
  const fullName = getUserName(user);

  return {
    ...user,

    _id: user?._id || user?.id,
    id: user?.id || user?._id,

    name: fullName,
    fullName,

    username: user?.username || "",

    avatar:
      user?.avatar ||
      user?.profileImage ||
      user?.profilePicture ||
      null,

    profileImage:
      user?.profileImage ||
      user?.profilePicture ||
      user?.avatar ||
      null,

    profilePicture:
      user?.profilePicture ||
      user?.profileImage ||
      user?.avatar ||
      null,

    isActive: Boolean(
      user?.isActive ??
      user?.isOnline
    ),

    isOnline: Boolean(
      user?.isOnline ??
      user?.isActive
    ),
  };
};

/*
|--------------------------------------------------------------------------
| PROVIDER
|--------------------------------------------------------------------------
*/

export const GlobalCallProvider = ({ children }) => {
  const {
    user: currentUser,
  } = useAuth();

  const [incomingCall, setIncomingCall] =
    useState(null);

  const [activeCall, setActiveCall] =
    useState(null);

  const [isCallCaller, setIsCallCaller] =
    useState(false);

  const [callError, setCallError] =
    useState("");

  const activeCallRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | KEEP REF IN SYNC
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    activeCallRef.current =
      activeCall;
  }, [activeCall]);

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE INCOMING CALL
  |--------------------------------------------------------------------------
  */

  const normalizeIncomingCall =
    useCallback(
      (data) => {
        if (!data) {
          return null;
        }

        const callerSource =
          data?.caller ||
          data?.fromUser ||
          data?.user ||
          data?.callerUser ||
          {};

        const caller =
          buildUser({
            ...callerSource,

            _id:
              callerSource?._id ||
              callerSource?.id ||
              data?.callerId ||
              data?.fromUserId,

            id:
              callerSource?.id ||
              callerSource?._id ||
              data?.callerId ||
              data?.fromUserId,

            fullName:
              callerSource?.fullName ||
              data?.callerName ||
              callerSource?.name ||
              callerSource?.username,
          });

        const participants =
          Array.isArray(data?.participants)
            ? data.participants
            : [];

        return {
          ...data,

          callId:
            data?.callId ||
            data?.id ||
            null,

          callType:
            data?.callType === "video"
              ? "video"
              : "audio",

          caller,

          callerName:
            caller?.fullName ||
            data?.callerName ||
            caller?.username ||
            "User",

          fromUser: caller,

          user: caller,

          participants,
        };
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | INCOMING CALL
  |--------------------------------------------------------------------------
  */

  const handleIncomingCall =
    useCallback(
      (data) => {
        console.log(
          "📞 Global incoming call:",
          data
        );

        const normalizedCall =
          normalizeIncomingCall(data);

        if (!normalizedCall?.callId) {
          console.warn(
            "Incoming call ignored: callId missing",
            data
          );

          return;
        }

        /*
         * Already active call.
         */
        if (activeCallRef.current) {
          console.warn(
            "Already in active call."
          );

          return;
        }

        setCallError("");

        setIncomingCall(
          normalizedCall
        );
      },
      [normalizeIncomingCall]
    );

  /*
  |--------------------------------------------------------------------------
  | CALL ACCEPTED
  |--------------------------------------------------------------------------
  */

  const handleCallAccepted =
    useCallback(
      (data) => {
        console.log(
          "📞 Global call accepted:",
          data
        );

        const currentCall =
          activeCallRef.current;

        if (!currentCall) {
          return;
        }

        if (
          data?.callId &&
          currentCall?.callId &&
          String(data.callId) !==
            String(currentCall.callId)
        ) {
          return;
        }

        setActiveCall(
          (previous) => ({
            ...previous,

            ...data,

            callId:
              previous?.callId ||
              data?.callId,

            callType:
              previous?.callType ||
              data?.callType ||
              "audio",

            participants:
              data?.participants ||
              previous?.participants ||
              [],
          })
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | CALL JOINED
  |--------------------------------------------------------------------------
  */

  const handleCallJoined =
    useCallback(
      (data) => {
        console.log(
          "📞 Global call joined:",
          data
        );

        const currentCall =
          activeCallRef.current;

        if (!currentCall) {
          return;
        }

        if (
          data?.callId &&
          currentCall?.callId &&
          String(data.callId) !==
            String(currentCall.callId)
        ) {
          return;
        }

        setActiveCall(
          (previous) => ({
            ...previous,

            ...data,

            callId:
              previous?.callId ||
              data?.callId,

            participants:
              data?.participants ||
              previous?.participants ||
              [],
          })
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | CALL REJECTED
  |--------------------------------------------------------------------------
  */

  const handleCallRejected =
    useCallback(
      (data) => {
        console.log(
          "📞 Global call rejected:",
          data
        );

        const currentCall =
          activeCallRef.current;

        if (
          currentCall &&
          data?.callId &&
          String(data.callId) !==
            String(currentCall.callId)
        ) {
          return;
        }

        setIncomingCall(null);

        setActiveCall(null);

        activeCallRef.current = null;

        setIsCallCaller(false);
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | CALL ENDED
  |--------------------------------------------------------------------------
  */

  const handleCallEnded =
    useCallback(
      (data) => {
        console.log(
          "📞 Global call ended:",
          data
        );

        const currentCall =
          activeCallRef.current;

        if (
          currentCall &&
          data?.callId &&
          String(data.callId) !==
            String(currentCall.callId)
        ) {
          return;
        }

        setIncomingCall(null);

        setActiveCall(null);

        activeCallRef.current = null;

        setIsCallCaller(false);

        setCallError("");
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | CALL ERROR
  |--------------------------------------------------------------------------
  */

  const handleCallError =
    useCallback(
      (data) => {
        console.error(
          "📞 Global call error:",
          data
        );

        const message =
          data?.message ||
          data?.error ||
          "Call error occurred.";

        setCallError(message);
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | GLOBAL SOCKET LISTENERS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const incomingSubscription =
      listenToIncomingCall(
        handleIncomingCall
      );

    const joinedSubscription =
      listenToCallJoined(
        handleCallJoined
      );

    const acceptedSubscription =
      listenToCallAccepted(
        handleCallAccepted
      );

    const rejectedSubscription =
      listenToCallRejected(
        handleCallRejected
      );

    const endedSubscription =
      listenToCallEnded(
        handleCallEnded
      );

    const errorSubscription =
      listenToCallError(
        handleCallError
      );

    return () => {
      removeListeners([
        incomingSubscription,
        joinedSubscription,
        acceptedSubscription,
        rejectedSubscription,
        endedSubscription,
        errorSubscription,
      ]);
    };
  }, [
    currentUser,
    handleIncomingCall,
    handleCallJoined,
    handleCallAccepted,
    handleCallRejected,
    handleCallEnded,
    handleCallError,
  ]);

  /*
  |--------------------------------------------------------------------------
  | ACCEPT INCOMING CALL
  |--------------------------------------------------------------------------
  */

  const handleAcceptIncomingCall =
    useCallback(
      () => {
        const call =
          incomingCall;

        if (!call?.callId) {
          return;
        }

        console.log(
          "📞 Accepting call:",
          call.callId
        );

        setCallError("");

        acceptCallEvent({
          callId:
            call.callId,
        });

        const caller =
          buildUser(
            call?.caller ||
            call?.fromUser ||
            call?.user ||
            {}
          );

        const normalizedCall = {
          ...call,

          caller,

          callerName:
            caller?.fullName ||
            call?.callerName ||
            "User",

          fromUser: caller,

          user: caller,

          targetUser: caller,

          participants:
            Array.isArray(
              call?.participants
            )
              ? call.participants
              : [
                  getUserId(caller),
                ].filter(Boolean),
        };

        setActiveCall(
          normalizedCall
        );

        activeCallRef.current =
          normalizedCall;

        setIsCallCaller(false);

        setIncomingCall(null);
      },
      [incomingCall]
    );

  /*
  |--------------------------------------------------------------------------
  | REJECT INCOMING CALL
  |--------------------------------------------------------------------------
  */

  const handleRejectIncomingCall =
    useCallback(
      () => {
        const call =
          incomingCall;

        if (!call?.callId) {
          return;
        }

        console.log(
          "📞 Rejecting call:",
          call.callId
        );

        rejectCallEvent({
          callId:
            call.callId,
        });

        setIncomingCall(null);

        setCallError("");
      },
      [incomingCall]
    );

  /*
  |--------------------------------------------------------------------------
  | CLOSE ACTIVE CALL
  |--------------------------------------------------------------------------
  */

  const handleCallClose =
    useCallback(
      ({
        end = false,
      } = {}) => {
        const call =
          activeCallRef.current;

        if (call?.callId) {
          if (end) {
            endCallEvent({
              callId:
                call.callId,
            });
          } else {
            leaveCallEvent({
              callId:
                call.callId,
            });
          }
        }

        setActiveCall(null);

        activeCallRef.current =
          null;

        setIncomingCall(null);

        setIsCallCaller(false);

        setCallError("");
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | GLOBAL START CALL
  |--------------------------------------------------------------------------
  */

  const startCall =
    useCallback(
      ({
        callId,
        callType = "audio",
        targetUser,
        participants = [],
      }) => {
        if (
          !callId ||
          !targetUser
        ) {
          setCallError(
            "Unable to start call."
          );

          return false;
        }

        const normalizedTarget =
          buildUser(
            targetUser
          );

        const caller =
          buildUser(
            currentUser || {}
          );

        const callerId =
          getUserId(caller);

        const targetUserId =
          getUserId(
            normalizedTarget
          );

        if (
          !callerId ||
          !targetUserId
        ) {
          setCallError(
            "Caller or receiver information is missing."
          );

          return false;
        }

        if (
          String(callerId) ===
          String(targetUserId)
        ) {
          setCallError(
            "You cannot call yourself."
          );

          return false;
        }

        const normalizedCallType =
          callType === "video"
            ? "video"
            : "audio";

        const normalizedParticipants =
          participants.length
            ? participants.map(
                (id) => String(id)
              )
            : [
                String(callerId),
                String(targetUserId),
              ];

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        | Actually send call:create to backend.
        |--------------------------------------------------------------------------
        */

        const emitted =
          createCallEvent({
            callId: String(callId),
            callType:
              normalizedCallType,
            participants:
              normalizedParticipants,
          });

        if (emitted === false) {
          setCallError(
            "Unable to send call request."
          );

          return false;
        }

        const call = {
          callId: String(callId),

          callType:
            normalizedCallType,

          caller,

          callerName:
            getUserName(
              caller
            ),

          fromUser:
            caller,

          targetUser:
            normalizedTarget,

          callee:
            normalizedTarget,

          toUser:
            normalizedTarget,

          participants:
            normalizedParticipants,
        };

        setCallError("");

        setActiveCall(call);

        activeCallRef.current =
          call;

        setIncomingCall(null);

        setIsCallCaller(true);

        return true;
      },
      [currentUser]
    );

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value =
    useMemo(
      () => ({
        incomingCall,

        activeCall,

        isCallCaller,

        callError,

        startCall,

        acceptIncomingCall:
          handleAcceptIncomingCall,

        rejectIncomingCall:
          handleRejectIncomingCall,

        closeCall:
          handleCallClose,

        setCallError,
      }),
      [
        incomingCall,
        activeCall,
        isCallCaller,
        callError,
        startCall,
        handleAcceptIncomingCall,
        handleRejectIncomingCall,
        handleCallClose,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <GlobalCallContext.Provider
      value={value}
    >
      {children}

      {/* ---------------------------------------------------------------
          GLOBAL INCOMING CALL
      ---------------------------------------------------------------- */}

      <IncomingCall
        call={incomingCall}
        visible={Boolean(incomingCall)}
        onAccept={
          handleAcceptIncomingCall
        }
        onReject={
          handleRejectIncomingCall
        }
      />

      {/* ---------------------------------------------------------------
          GLOBAL ACTIVE CALL
      ---------------------------------------------------------------- */}

      {activeCall && (
        <CallModal
          call={activeCall}

          currentUserId={
            getUserId(
              currentUser
            )
          }

          visible={Boolean(activeCall)}

          isCaller={
            isCallCaller
          }

          isGroupCall={
            Array.isArray(
              activeCall?.participants
            ) &&
            activeCall.participants.length >
              2
          }

          onClose={
            handleCallClose
          }
        />
      )}

      {/* ---------------------------------------------------------------
          GLOBAL ERROR
      ---------------------------------------------------------------- */}

      {callError && (
        <div
          className="
            fixed
            bottom-5
            left-1/2
            z-[10001]
            -translate-x-1/2
            rounded-lg
            bg-red-600
            px-4
            py-3
            text-sm
            font-medium
            text-white
            shadow-xl
          "
        >
          {callError}
        </div>
      )}
    </GlobalCallContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| HOOK
|--------------------------------------------------------------------------
*/

export const useGlobalCall = () => {
  const context =
    useContext(
      GlobalCallContext
    );

  if (!context) {
    throw new Error(
      "useGlobalCall must be used inside GlobalCallProvider"
    );
  }

  return context;
};

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
|
| IMPORTANT:
| GlobalCallManager naam ka koi component nahi hai.
| Actual component = GlobalCallProvider
|
|--------------------------------------------------------------------------
*/

export default GlobalCallProvider;