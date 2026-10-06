import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Avatar from "../common/Avatar";

/*
 * Helpers
 * --------------------------------------------------------------------------
 */

const idOf = (value) =>
  value?._id || value?.id;

const nameOf = (user) =>
  user?.fullName ||
  user?.name ||
  user?.username ||
  "User";

const avatarOf = (user) =>
  user?.avatar ||
  user?.profileImage ||
  user?.profilePicture ||
  "";

const mediaOf = (story) =>
  story?.mediaUrl ||
  story?.media?.url ||
  story?.media ||
  story?.imageUrl ||
  story?.videoUrl ||
  "";

const isVideo = (story) =>
  story?.mediaType === "video" ||
  story?.type === "video" ||
  /\.(mp4|webm|mov)(\?.*)?$/i.test(
    mediaOf(story)
  );

const audioOf = (story) => {
  const audio = story?.audio;

  if (!audio) {
    return null;
  }

  return {
    mode: audio?.mode || "",

    musicUrl:
      audio?.music?.audioUrl ||
      audio?.music?.audio ||
      audio?.audioUrl ||
      "",

    originalUrl:
      audio?.original?.url ||
      "",

    musicVolume:
      typeof audio?.musicVolume === "number"
        ? audio.musicVolume
        : 1,

    originalVolume:
      typeof audio?.originalVolume === "number"
        ? audio.originalVolume
        : 1,

    startTime:
      typeof audio?.startTime === "number"
        ? audio.startTime
        : 0,

    endTime:
      typeof audio?.endTime === "number"
        ? audio.endTime
        : null,

    musicDuration:
      Number(audio?.music?.duration) > 0
        ? Number(audio.music.duration)
        : 0,

    originalDuration:
      Number(audio?.original?.duration) > 0
        ? Number(audio.original.duration)
        : 0,

    duration:
      Number(audio?.duration) > 0
        ? Number(audio.duration)
        : 0,
  };
};

/*
 * Stable group identity
 * --------------------------------------------------------------------------
 */

const groupIdOf = (group) =>
  group?.ownerId ||
  idOf(group?.owner) ||
  idOf(group?.stories?.[0]) ||
  null;

/*
 * Story Viewer
 * --------------------------------------------------------------------------
 */

function StoryViewer({
  groups = [],
  activeGroup,
  onClose,
  onViewed,
}) {
  /*
   * Initial group is only used when viewer opens.
   */
  const initialGroup =
    groups[activeGroup];

  const initialGroupId =
    groupIdOf(initialGroup);

  /*
   * Current group is identified by ID.
   *
   * We do not use groupIndex as the source
   * of truth because markViewed() can reorder
   * groups.
   */
  const [currentGroupId, setCurrentGroupId] =
    useState(initialGroupId);

  /*
   * Current story inside the group.
   */
  const [storyIndex, setStoryIndex] =
    useState(0);

  /*
   * Progress percentage.
   */
  const [progress, setProgress] =
    useState(0);

  /*
   * Audio autoplay failure state.
   */
  const [audioBlocked, setAudioBlocked] =
    useState(false);

  /*
   * Media refs.
   */
  const musicAudioRef =
    useRef(null);

  const originalAudioRef =
    useRef(null);

  const videoRef =
    useRef(null);

  /*
   * Prevent duplicate navigation.
   *
   * Timer + ended + manual events
   * must never advance twice.
   */
  const hasAdvancedRef =
    useRef(false);

  /*
   * Progress timer.
   */
  const timerRef =
    useRef(null);

  /*
   * Current audio play request.
   */
  const audioPlayRequestRef =
    useRef(null);

  /*
   * Prevent duplicate viewed API calls.
   */
  const viewedStoryIdsRef =
    useRef(new Set());

  /*
   * Latest groups.
   */
  const groupsRef =
    useRef(groups);

  groupsRef.current = groups;

  /*
   * Latest current group ID.
   */
  const currentGroupIdRef =
    useRef(currentGroupId);

  currentGroupIdRef.current =
    currentGroupId;

  /*
   * Latest story index.
   */
  const storyIndexRef =
    useRef(storyIndex);

  storyIndexRef.current =
    storyIndex;

  /*
   * Latest onClose callback.
   */
  const onCloseRef =
    useRef(onClose);

  onCloseRef.current =
    onClose;

  /*
   * Resolve current group using stable ID.
   */
  const group =
    groups.find(
      (item) =>
        String(groupIdOf(item)) ===
        String(currentGroupId)
    ) || null;

  /*
   * Current story.
   */
  const story =
    group?.stories?.[storyIndex] ||
    null;

  /*
   * Current story ID.
   */
  const storyId =
    idOf(story);

  /*
   * Current group index is only used
   * for navigation UI.
   */
  const groupIndex =
    group
      ? groups.findIndex(
          (item) =>
            String(groupIdOf(item)) ===
            String(currentGroupId)
        )
      : -1;

  /*
   * Navigation
   * ----------------------------------------------------------------------
   */

  const next = useCallback(() => {
    const currentGroups =
      groupsRef.current;

    const currentGroupIdValue =
      currentGroupIdRef.current;

    const currentStoryIndex =
      storyIndexRef.current;

    const currentGroup =
      currentGroups.find(
        (item) =>
          String(groupIdOf(item)) ===
          String(currentGroupIdValue)
      );

    if (!currentGroup) {
      return;
    }

    const stories =
      Array.isArray(
        currentGroup.stories
      )
        ? currentGroup.stories
        : [];

    if (
      stories.length === 0
    ) {
      return;
    }

    /*
     * Next story of same user.
     */
    if (
      currentStoryIndex <
      stories.length - 1
    ) {
      const nextIndex =
        currentStoryIndex + 1;

      storyIndexRef.current =
        nextIndex;

      setStoryIndex(
        nextIndex
      );

      return;
    }

    /*
     * Current group index from latest
     * groups.
     */
    const currentIndex =
      currentGroups.findIndex(
        (item) =>
          String(groupIdOf(item)) ===
          String(currentGroupIdValue)
      );

    /*
     * Next user's story.
     */
    if (
      currentIndex !== -1 &&
      currentIndex <
        currentGroups.length - 1
    ) {
      const nextGroup =
        currentGroups[
          currentIndex + 1
        ];

      const nextGroupId =
        groupIdOf(nextGroup);

      if (!nextGroupId) {
        return;
      }

      currentGroupIdRef.current =
        nextGroupId;

      storyIndexRef.current =
        0;

      setCurrentGroupId(
        nextGroupId
      );

      setStoryIndex(0);

      return;
    }

    /*
     * No more stories.
     */
    onCloseRef.current?.();
  }, []);

  const previous = useCallback(() => {
    const currentGroups =
      groupsRef.current;

    const currentGroupIdValue =
      currentGroupIdRef.current;

    const currentStoryIndex =
      storyIndexRef.current;

    const currentGroup =
      currentGroups.find(
        (item) =>
          String(groupIdOf(item)) ===
          String(currentGroupIdValue)
      );

    if (!currentGroup) {
      return;
    }

    const stories =
      Array.isArray(
        currentGroup.stories
      )
        ? currentGroup.stories
        : [];

    if (
      stories.length === 0
    ) {
      return;
    }

    /*
     * Previous story of same user.
     */
    if (
      currentStoryIndex > 0
    ) {
      const previousIndex =
        currentStoryIndex - 1;

      storyIndexRef.current =
        previousIndex;

      setStoryIndex(
        previousIndex
      );

      return;
    }

    /*
     * Find current group.
     */
    const currentIndex =
      currentGroups.findIndex(
        (item) =>
          String(groupIdOf(item)) ===
          String(currentGroupIdValue)
      );

    /*
     * Previous user's story.
     */
    if (
      currentIndex > 0
    ) {
      const previousGroup =
        currentGroups[
          currentIndex - 1
        ];

      const previousGroupId =
        groupIdOf(previousGroup);

      if (!previousGroupId) {
        return;
      }

      const previousStories =
        Array.isArray(
          previousGroup.stories
        )
          ? previousGroup.stories
          : [];

      if (
        previousStories.length === 0
      ) {
        return;
      }

      const previousStoryIndex =
        previousStories.length - 1;

      currentGroupIdRef.current =
        previousGroupId;

      storyIndexRef.current =
        previousStoryIndex;

      setCurrentGroupId(
        previousGroupId
      );

      setStoryIndex(
        previousStoryIndex
      );
    }
  }, []);

  /*
   * Lock body scrolling.
   */
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /*
   * Reset viewer only when activeGroup
   * explicitly changes.
   *
   * IMPORTANT:
   *
   * groups changing because of markViewed()
   * does NOT reset the viewer.
   */
  useEffect(() => {
    const nextGroup =
      groupsRef.current[
        activeGroup
      ];

    const nextGroupId =
      groupIdOf(nextGroup);

    if (!nextGroupId) {
      return;
    }

    currentGroupIdRef.current =
      nextGroupId;

    storyIndexRef.current =
      0;

    setCurrentGroupId(
      nextGroupId
    );

    setStoryIndex(0);
  }, [activeGroup]);

  /*
   * Mark story as viewed.
   *
   * storyId is the dependency instead of
   * the complete story object.
   *
   * Therefore:
   *
   * viewed false
   * ->
   * viewed true
   *
   * does not trigger another API call.
   */
  useEffect(() => {
    if (
      !storyId ||
      !group ||
      group.isCurrentUser
    ) {
      return;
    }

    const normalizedId =
      String(storyId);

    /*
     * Already viewed by this viewer
     * session.
     */
    if (
      viewedStoryIdsRef.current.has(
        normalizedId
      )
    ) {
      return;
    }

    /*
     * If backend already says this story
     * was viewed, do not call the API again.
     */
    if (
      story.viewed === true ||
      story.isViewed === true
    ) {
      viewedStoryIdsRef.current.add(
        normalizedId
      );

      return;
    }

    /*
     * Lock immediately before calling
     * the callback.
     */
    viewedStoryIdsRef.current.add(
      normalizedId
    );

    onViewed?.(storyId);
  }, [
    storyId,
    group?.isCurrentUser,
    onViewed,
  ]);

  /*
   * Keyboard navigation.
   */
  useEffect(() => {
    const handleKey = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        onCloseRef.current?.();
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        next();
        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        previous();
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [
    next,
    previous,
  ]);

  /*
   * Story media lifecycle
   * ----------------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * This effect depends on storyId only.
   *
   * Parent groups reorder / viewed-state
   * changes cannot restart the current
   * story's audio or progress.
   */
  useEffect(() => {
    hasAdvancedRef.current =
      false;

    setProgress(0);
    setAudioBlocked(false);

    /*
     * Stop existing progress timer.
     */
    if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;
    }

    /*
     * Cancel previous audio request.
     */
    if (
      audioPlayRequestRef.current
    ) {
      audioPlayRequestRef.current.cancelled =
        true;

      audioPlayRequestRef.current
        .cleanup?.();

      audioPlayRequestRef.current =
        null;
    }

    const musicAudio =
      musicAudioRef.current;

    const originalAudio =
      originalAudioRef.current;

    const video =
      videoRef.current;

    /*
     * Stop old music.
     */
    if (musicAudio) {
      try {
        musicAudio.pause();
      } catch {}

      try {
        musicAudio.currentTime =
          0;
      } catch {}
    }

    /*
     * Stop old original audio.
     */
    if (originalAudio) {
      try {
        originalAudio.pause();
      } catch {}

      try {
        originalAudio.currentTime =
          0;
      } catch {}
    }

    /*
     * Stop old video.
     */
    if (video) {
      try {
        video.pause();
      } catch {}

      try {
        video.currentTime =
          0;
      } catch {}
    }

    /*
     * No story.
     */
    if (!story) {
      return undefined;
    }

    const audio =
      audioOf(story);

    const musicEnabled =
      (
        audio?.mode === "music" ||
        audio?.mode === "mixed"
      ) &&
      Boolean(
        audio?.musicUrl
      );

    const originalEnabled =
      (
        audio?.mode === "original" ||
        audio?.mode === "mixed"
      ) &&
      Boolean(
        audio?.originalUrl
      );

    const startTime =
      Math.max(
        0,
        Number(
          audio?.startTime
        ) || 0
      );

    const configuredEndTime =
      audio?.endTime !== null &&
      Number.isFinite(
        audio?.endTime
      )
        ? Number(
            audio.endTime
          )
        : null;

    let storyDuration =
      0;

    /*
     * Music duration.
     */
    if (musicEnabled) {
      if (
        configuredEndTime !== null &&
        configuredEndTime >
          startTime
      ) {
        storyDuration =
          configuredEndTime -
          startTime;
      } else if (
        Number(
          audio?.musicDuration
        ) > 0
      ) {
        storyDuration =
          Number(
            audio.musicDuration
          ) - startTime;
      } else if (
        Number(
          audio?.duration
        ) > 0
      ) {
        storyDuration =
          Number(
            audio.duration
          ) - startTime;
      }
    }

    /*
     * Original audio duration.
     */
    else if (originalEnabled) {
      if (
        configuredEndTime !== null &&
        configuredEndTime >
          startTime
      ) {
        storyDuration =
          configuredEndTime -
          startTime;
      } else if (
        Number(
          audio?.originalDuration
        ) > 0
      ) {
        storyDuration =
          Number(
            audio.originalDuration
          ) - startTime;
      } else if (
        Number(
          audio?.duration
        ) > 0
      ) {
        storyDuration =
          Number(
            audio.duration
          ) - startTime;
      }
    }

    const isStoryVideo =
      isVideo(story);

    /*
     * Image without audio = 5 seconds.
     */
    if (
      storyDuration <= 0 &&
      !musicEnabled &&
      !originalEnabled &&
      !isStoryVideo
    ) {
      storyDuration =
        5;
    }

    /*
     * Advance only once.
     */
    const goNextOnce =
      () => {
        if (
          hasAdvancedRef.current
        ) {
          return;
        }

        hasAdvancedRef.current =
          true;

        if (
          timerRef.current
        ) {
          clearInterval(
            timerRef.current
          );

          timerRef.current =
            null;
        }

        next();
      };

    /*
     * Progress timer.
     */
    const startProgressTimer =
      (duration) => {
        if (
          !Number.isFinite(
            duration
          ) ||
          duration <= 0
        ) {
          return;
        }

        storyDuration =
          duration;

        const startedAt =
          performance.now();

        if (
          timerRef.current
        ) {
          clearInterval(
            timerRef.current
          );
        }

        timerRef.current =
          setInterval(() => {
            if (
              hasAdvancedRef.current
            ) {
              return;
            }

            const elapsed =
              (
                performance.now() -
                startedAt
              ) / 1000;

            const percent =
              Math.min(
                100,
                (
                  elapsed /
                  storyDuration
                ) * 100
              );

            setProgress(
              percent
            );

            if (
              elapsed >=
              storyDuration
            ) {
              setProgress(100);
              goNextOnce();
            }
          }, 50);
      };

    /*
     * Music time update.
     */
    const handleMusicTimeUpdate =
      () => {
        if (
          !musicAudio ||
          !musicEnabled
        ) {
          return;
        }

        if (
          configuredEndTime !==
            null &&
          musicAudio.currentTime >=
            configuredEndTime
        ) {
          setProgress(100);
          goNextOnce();
        }
      };

    /*
     * Music ended.
     */
    const handleMusicEnded =
      () => {
        setProgress(100);
        goNextOnce();
      };

    /*
     * Original audio time update.
     */
    const handleOriginalTimeUpdate =
      () => {
        if (
          !originalAudio ||
          !originalEnabled
        ) {
          return;
        }

        if (
          audio?.mode ===
            "original" &&
          configuredEndTime !==
            null &&
          originalAudio.currentTime >=
            configuredEndTime
        ) {
          setProgress(100);
          goNextOnce();
        }
      };

    /*
     * Original audio ended.
     */
    const handleOriginalEnded =
      () => {
        if (
          audio?.mode ===
          "original"
        ) {
          setProgress(100);
          goNextOnce();
        }
      };

    /*
     * Video time update.
     */
    const handleVideoTimeUpdate =
      () => {
        if (
          video &&
          isStoryVideo &&
          !musicEnabled &&
          !originalEnabled &&
          Number.isFinite(
            video.duration
          ) &&
          video.duration > 0
        ) {
          if (
            storyDuration <= 0
          ) {
            startProgressTimer(
              video.duration
            );
          }

          const percent =
            Math.min(
              100,
              (
                video.currentTime /
                video.duration
              ) * 100
            );

          setProgress(
            percent
          );
        }
      };

    /*
     * Video ended.
     */
    const handleVideoEnded =
      () => {
        if (
          !musicEnabled &&
          !originalEnabled
        ) {
          setProgress(100);
          goNextOnce();
        }
      };

    /*
     * Safe audio playback.
     */
    const startAudioSafely =
      (
        audioElement,
        url,
        volume,
        startPosition
      ) => {
        if (
          !audioElement ||
          !url
        ) {
          return;
        }

        const request = {
          cancelled: false,
          cleanup: null,
          started: false,
        };

        audioPlayRequestRef.current =
          request;

        /*
         * Set volume.
         */
        audioElement.volume =
          Math.min(
            1,
            Math.max(
              0,
              Number(volume) || 0
            )
          );

        /*
         * Start playback exactly once.
         */
        const startPlayback =
          () => {
            if (
              request.cancelled ||
              request.started ||
              audioPlayRequestRef.current !==
                request
            ) {
              return;
            }

            request.started =
              true;

            /*
             * Seek to configured start.
             */
            if (
              Number.isFinite(
                startPosition
              ) &&
              startPosition > 0
            ) {
              try {
                if (
                  Number.isFinite(
                    audioElement.duration
                  ) &&
                  audioElement.duration >
                    0
                ) {
                  audioElement.currentTime =
                    Math.min(
                      startPosition,
                      Math.max(
                        0,
                        audioElement.duration -
                          0.05
                      )
                    );
                } else {
                  audioElement.currentTime =
                    startPosition;
                }
              } catch {}
            }

            /*
             * Exactly one play() request.
             */
            const playPromise =
              audioElement.play();

            if (
              playPromise &&
              typeof playPromise.then ===
                "function"
            ) {
              playPromise
                .then(() => {
                  if (
                    !request.cancelled
                  ) {
                    setAudioBlocked(
                      false
                    );
                  }
                })
                .catch(
                  (error) => {
                    if (
                      error?.name ===
                      "AbortError"
                    ) {
                      return;
                    }

                    console.warn(
                      "Story audio play failed:",
                      error
                    );

                    setAudioBlocked(
                      true
                    );
                  }
                );
            }
          };

        /*
         * If already loaded, play immediately.
         */
        if (
          audioElement.readyState >=
          3
        ) {
          startPlayback();
          return;
        }

        let canPlayHandled =
          false;

        const handleCanPlay =
          () => {
            if (
              canPlayHandled
            ) {
              return;
            }

            canPlayHandled =
              true;

            audioElement.removeEventListener(
              "canplay",
              handleCanPlay
            );

            startPlayback();
          };

        audioElement.addEventListener(
          "canplay",
          handleCanPlay,
          {
            once: true,
          }
        );

        /*
         * Load only the required URL.
         */
        try {
          if (
            audioElement.src !==
            url
          ) {
            audioElement.src =
              url;
          }

          audioElement.load();
        } catch (error) {
          console.warn(
            "Story audio load failed:",
            error
          );
        }

        /*
         * Cleanup.
         */
        request.cleanup =
          () => {
            request.cancelled =
              true;

            audioElement.removeEventListener(
              "canplay",
              handleCanPlay
            );
          };
      };

    /*
     * MUSIC
     */
    if (
      musicAudio &&
      musicEnabled
    ) {
      musicAudio.addEventListener(
        "timeupdate",
        handleMusicTimeUpdate
      );

      musicAudio.addEventListener(
        "ended",
        handleMusicEnded
      );

      if (
        storyDuration > 0
      ) {
        startProgressTimer(
          storyDuration
        );
      }

      startAudioSafely(
        musicAudio,
        audio.musicUrl,
        audio.musicVolume,
        startTime
      );
    }

    /*
     * ORIGINAL AUDIO
     */
    else if (
      originalAudio &&
      originalEnabled
    ) {
      originalAudio.addEventListener(
        "timeupdate",
        handleOriginalTimeUpdate
      );

      originalAudio.addEventListener(
        "ended",
        handleOriginalEnded
      );

      if (
        storyDuration > 0
      ) {
        startProgressTimer(
          storyDuration
        );
      }

      startAudioSafely(
        originalAudio,
        audio.originalUrl,
        audio.originalVolume,
        startTime
      );
    }

    /*
     * VIDEO
     */
    else if (
      isStoryVideo &&
      video
    ) {
      video.addEventListener(
        "timeupdate",
        handleVideoTimeUpdate
      );

      video.addEventListener(
        "ended",
        handleVideoEnded
      );

      if (
        Number.isFinite(
          video.duration
        ) &&
        video.duration > 0
      ) {
        startProgressTimer(
          video.duration
        );
      }
    }

    /*
     * IMAGE
     */
    else {
      startProgressTimer(5);
    }

    /*
     * Cleanup.
     */
    return () => {
      /*
       * Stop progress timer.
       */
      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }

      /*
       * Cancel pending audio.
       */
      if (
        audioPlayRequestRef.current
      ) {
        audioPlayRequestRef.current.cancelled =
          true;

        audioPlayRequestRef.current
          .cleanup?.();

        audioPlayRequestRef.current =
          null;
      }

      /*
       * Music cleanup.
       */
      if (musicAudio) {
        musicAudio.removeEventListener(
          "timeupdate",
          handleMusicTimeUpdate
        );

        musicAudio.removeEventListener(
          "ended",
          handleMusicEnded
        );

        try {
          musicAudio.pause();
        } catch {}

        try {
          musicAudio.currentTime =
            0;
        } catch {}
      }

      /*
       * Original audio cleanup.
       */
      if (originalAudio) {
        originalAudio.removeEventListener(
          "timeupdate",
          handleOriginalTimeUpdate
        );

        originalAudio.removeEventListener(
          "ended",
          handleOriginalEnded
        );

        try {
          originalAudio.pause();
        } catch {}

        try {
          originalAudio.currentTime =
            0;
        } catch {}
      }

      /*
       * Video cleanup.
       */
      if (video) {
        video.removeEventListener(
          "timeupdate",
          handleVideoTimeUpdate
        );

        video.removeEventListener(
          "ended",
          handleVideoEnded
        );

        try {
          video.pause();
        } catch {}

        try {
          video.currentTime =
            0;
        } catch {}
      }
    };
  }, [
    storyId,
    next,
  ]);

  /*
   * Retry audio after user interaction.
   */
  const retryAudio =
    async () => {
      const audio =
        audioOf(story);

      try {
        /*
         * MUSIC
         */
        if (
          (
            audio?.mode ===
              "music" ||
            audio?.mode ===
              "mixed"
          ) &&
          musicAudioRef.current &&
          audio.musicUrl
        ) {
          const musicAudio =
            musicAudioRef.current;

          if (
            musicAudio.readyState <
            2
          ) {
            if (
              musicAudio.src !==
              audio.musicUrl
            ) {
              musicAudio.src =
                audio.musicUrl;
            }

            musicAudio.load();
          }

          await musicAudio.play();

          setAudioBlocked(
            false
          );

          return;
        }

        /*
         * ORIGINAL
         */
        if (
          (
            audio?.mode ===
              "original" ||
            audio?.mode ===
              "mixed"
          ) &&
          originalAudioRef.current &&
          audio.originalUrl
        ) {
          const originalAudio =
            originalAudioRef.current;

          if (
            originalAudio.readyState <
            2
          ) {
            if (
              originalAudio.src !==
              audio.originalUrl
            ) {
              originalAudio.src =
                audio.originalUrl;
            }

            originalAudio.load();
          }

          await originalAudio.play();

          setAudioBlocked(
            false
          );
        }
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.warn(
          "Story audio play failed:",
          error
        );

        setAudioBlocked(
          true
        );
      }
    };

  /*
   * No valid story/group.
   */
  if (
    !story ||
    !group
  ) {
    return null;
  }

  /*
   * Progress bars.
   */
  const progressBars =
    group.stories.map(
      (item, index) => {
        const itemId =
          idOf(item) ||
          `${index}`;

        const width =
          index < storyIndex
            ? 100
            : index > storyIndex
            ? 0
            : progress;

        return (
          <span
            key={itemId}
            className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/35"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              style={{
                width: `${width}%`,
              }}
            />
          </span>
        );
      }
    );

  return (
    <div
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
      onClick={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          if (audioBlocked) {
            retryAudio();
          }

          onCloseRef.current?.();
        }
      }}
    >
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black sm:h-[96vh] sm:w-[min(92vw,520px)]"
        onClick={(event) => {
          event.stopPropagation();

          if (audioBlocked) {
            retryAudio();
          }
        }}
      >
        {/* Progress bars */}
        <div className="absolute left-3 right-3 top-3 z-30 flex gap-1">
          {progressBars}
        </div>

        {/* Header */}
        <div className="absolute left-4 right-4 top-6 z-30 flex items-center justify-between text-white">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              src={avatarOf(
                group.owner
              )}
              name={nameOf(
                group.owner
              )}
              size="sm"
            />

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {group.isCurrentUser
                  ? "Your story"
                  : nameOf(
                      group.owner
                    )}
              </div>

              {!group.isCurrentUser &&
                group.owner
                  ?.username && (
                  <div className="truncate text-xs text-white/60">
                    @
                    {String(
                      group.owner
                        .username
                    ).replace(
                      "@",
                      ""
                    )}
                  </div>
                )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onCloseRef.current?.()
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-3xl leading-none text-white transition hover:bg-white/20"
            aria-label="Close story"
          >
            ×
          </button>
        </div>

        {/* Music audio */}
        <audio
          ref={musicAudioRef}
          src={
            audioOf(story)
              ?.musicUrl ||
            undefined
          }
          preload="auto"
        />

        {/* Original audio */}
        <audio
          ref={originalAudioRef}
          src={
            audioOf(story)
              ?.originalUrl ||
            undefined
          }
          preload="auto"
        />

        {/* Story media */}
        <div className="flex h-full w-full items-center justify-center bg-black">
          {isVideo(story) ? (
            <video
              ref={videoRef}
              key={idOf(story)}
              src={mediaOf(story)}
              autoPlay
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              key={idOf(story)}
              src={mediaOf(story)}
              alt={`${nameOf(
                group.owner
              )}'s story`}
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {/* Previous story */}
        {(
          groupIndex > 0 ||
          storyIndex > 0
        ) && (
          <button
            type="button"
            onClick={previous}
            className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Previous story"
          >
            ‹
          </button>
        )}

        {/* Next story */}
        <button
          type="button"
          onClick={next}
          className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="Next story"
        >
          ›
        </button>

        {/* Bottom actions */}
        <div className="absolute bottom-5 left-4 right-4 z-30 flex items-center gap-3">
          <div className="flex h-11 flex-1 items-center rounded-full border border-white/30 bg-black/40 px-4 text-sm text-white/70 backdrop-blur-sm">
            Reply to story...
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-white transition hover:bg-white/10"
            aria-label="Like story"
          >
            ♡
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-white transition hover:bg-white/10"
            aria-label="Share story"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryViewer;