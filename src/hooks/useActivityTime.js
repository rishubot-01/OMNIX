import { useCallback, useEffect, useRef } from "react";

import activitySessionService from "../services/activity-session.service";
import { STORAGE_KEYS } from "../utils/constants";

const HEARTBEAT_INTERVAL = 30 * 1000;

const useActivityTime = () => {
  const sessionIdRef = useRef(null);
  const activeSecondsRef = useRef(0);
  const lastActiveAtRef = useRef(null);
  const isActiveRef = useRef(
    document.visibilityState === "visible"
  );
  const isEndingRef = useRef(false);

  const hasToken = useCallback(() => {
    return Boolean(
      localStorage.getItem(
        STORAGE_KEYS.TOKEN
      )
    );
  }, []);

  const startSession = useCallback(
    async () => {
      if (
        !hasToken() ||
        sessionIdRef.current ||
        isEndingRef.current
      ) {
        return;
      }

      try {
        const response =
          await activitySessionService.startSession();

        const session =
          response?.data;

        if (!session?._id) {
          throw new Error(
            "Activity session ID was not returned."
          );
        }

        sessionIdRef.current =
          session._id;

        activeSecondsRef.current = 0;

        lastActiveAtRef.current =
          Date.now();
      } catch (error) {
        console.error(
          "Start activity session error:",
          error
        );
      }
    },
    [hasToken]
  );

  const calculateActiveSeconds =
    useCallback(() => {
      if (
        !isActiveRef.current ||
        !lastActiveAtRef.current
      ) {
        return 0;
      }

      const now = Date.now();

      const elapsedSeconds = Math.floor(
        (now - lastActiveAtRef.current) /
          1000
      );

      if (elapsedSeconds <= 0) {
        return 0;
      }

      lastActiveAtRef.current =
        now;

      activeSecondsRef.current +=
        elapsedSeconds;

      return elapsedSeconds;
    }, []);

  const updateSession = useCallback(
    async () => {
      if (!sessionIdRef.current) {
        return;
      }

      const elapsedSeconds =
        calculateActiveSeconds();

      if (elapsedSeconds <= 0) {
        return;
      }

      try {
        await activitySessionService.updateSession(
          sessionIdRef.current,
          elapsedSeconds
        );
      } catch (error) {
        console.error(
          "Update activity session error:",
          error
        );
      }
    },
    [calculateActiveSeconds]
  );

  const endSession = useCallback(
    async () => {
      if (
        !sessionIdRef.current ||
        isEndingRef.current
      ) {
        return;
      }

      isEndingRef.current = true;

      const sessionId =
        sessionIdRef.current;

      const elapsedSeconds =
        calculateActiveSeconds();

      try {
        await activitySessionService.endSession(
          sessionId,
          elapsedSeconds
        );
      } catch (error) {
        console.error(
          "End activity session error:",
          error
        );
      } finally {
        sessionIdRef.current =
          null;

        activeSecondsRef.current = 0;

        lastActiveAtRef.current =
          null;

        isEndingRef.current = false;
      }
    },
    [calculateActiveSeconds]
  );

  useEffect(() => {
    if (!hasToken()) {
      return undefined;
    }

    startSession();

    const heartbeat =
      window.setInterval(() => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          updateSession();
        }
      }, HEARTBEAT_INTERVAL);

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          isActiveRef.current = true;

          lastActiveAtRef.current =
            Date.now();

          if (!sessionIdRef.current) {
            startSession();
          }

          return;
        }

        isActiveRef.current = false;

        updateSession();
      };

    const handleBeforeUnload = () => {
      if (!sessionIdRef.current) {
        return;
      }

      const elapsedSeconds =
        calculateActiveSeconds();

      /*
       * The normal end-session request is
       * handled when the application can
       * complete an async request.
       *
       * beforeunload itself does not wait
       * for a normal async request.
       */
      if (elapsedSeconds > 0) {
        activeSecondsRef.current =
          elapsedSeconds;
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.clearInterval(
        heartbeat
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

      endSession();
    };
  }, [
    calculateActiveSeconds,
    endSession,
    hasToken,
    startSession,
    updateSession,
  ]);

  return {
    sessionId:
      sessionIdRef.current,
    activeSeconds:
      activeSecondsRef.current,
  };
};

export default useActivityTime;