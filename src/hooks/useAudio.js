import { useCallback, useEffect, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| Audio Modes
|--------------------------------------------------------------------------
*/

export const AUDIO_MODES = {
  MUSIC: "music",
  ORIGINAL: "original",
  MIXED: "mixed",
};

/*
|--------------------------------------------------------------------------
| Supported Music Providers
|--------------------------------------------------------------------------
*/

export const MUSIC_PROVIDERS = {
  JAMENDO: "jamendo",
  EPIDEMIC: "epidemic",
  SPOTIFY: "spotify",
};

/*
|--------------------------------------------------------------------------
| Default Values
|--------------------------------------------------------------------------
*/

const DEFAULT_MUSIC_VOLUME = 1;
const DEFAULT_ORIGINAL_VOLUME = 1;

const DEFAULT_START_TIME = 0;

/*
|--------------------------------------------------------------------------
| useAudio Hook
|--------------------------------------------------------------------------
|
| Central audio state for:
|
| 1. Music
| 2. Original Audio
| 3. Mixed Audio
|
| Supported music providers:
|
| - Jamendo
| - Epidemic Sound
| - Spotify
|
| This hook does not directly search music providers.
| Music searching is handled by music.service.js.
|
*/

const useAudio = () => {
  /*
  |--------------------------------------------------------------------------
  | Mode
  |--------------------------------------------------------------------------
  */

  const [mode, setMode] = useState(
    AUDIO_MODES.MUSIC
  );

  /*
  |--------------------------------------------------------------------------
  | Selected Music
  |--------------------------------------------------------------------------
  |
  | Expected structure:
  |
  | {
  |   musicId,
  |   provider,
  |   providerTrackId,
  |   title,
  |   artistName,
  |   albumName,
  |   artworkUrl,
  |   audioUrl,
  |   licenseUrl,
  |   duration
  | }
  |
  */

  const [selectedMusic, setSelectedMusic] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Original Audio
  |--------------------------------------------------------------------------
  |
  | Expected structure:
  |
  | {
  |   file,
  |   url,
  |   duration,
  |   publicId
  | }
  |
  | `file` is used while creating Reel.
  | `url` can be used for preview.
  |
  */

  const [originalAudio, setOriginalAudio] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Volume
  |--------------------------------------------------------------------------
  */

  const [musicVolume, setMusicVolume] =
    useState(DEFAULT_MUSIC_VOLUME);

  const [originalVolume, setOriginalVolume] =
    useState(DEFAULT_ORIGINAL_VOLUME);

  /*
  |--------------------------------------------------------------------------
  | Trim
  |--------------------------------------------------------------------------
  */

  const [startTime, setStartTime] =
    useState(DEFAULT_START_TIME);

  const [endTime, setEndTime] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Preview State
  |--------------------------------------------------------------------------
  */

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [previewType, setPreviewType] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Loading / Error State
  |--------------------------------------------------------------------------
  */

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Audio Element References
  |--------------------------------------------------------------------------
  */

  const musicAudioRef =
    useRef(null);

  const originalAudioRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Select Music
  |--------------------------------------------------------------------------
  */

  const selectMusic = useCallback(
    (music) => {
      if (!music) {
        setSelectedMusic(null);
        setStartTime(0);
        setEndTime(null);
        return;
      }

      /*
      * Only supported providers should enter
      * the common audio system.
      */

      const provider = String(
        music?.provider || ""
      )
        .trim()
        .toLowerCase();

      if (
        provider &&
        !Object.values(
          MUSIC_PROVIDERS
        ).includes(provider)
      ) {
        setError(
          `Unsupported music provider: ${provider}`
        );

        return;
      }

      setSelectedMusic(music);

      /*
      * Music duration becomes the initial
      * trim end time.
      */

      const duration =
        Number(music.duration);

      setStartTime(0);

      if (
        Number.isFinite(duration) &&
        duration > 0
      ) {
        setEndTime(duration);
      } else {
        setEndTime(null);
      }

      setError("");
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Clear Music
  |--------------------------------------------------------------------------
  */

  const clearMusic = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
      musicAudioRef.current.removeAttribute(
        "src"
      );
      musicAudioRef.current.load();
    }

    setSelectedMusic(null);

    setStartTime(0);
    setEndTime(null);

    setIsPlaying(false);
    setPreviewType(null);
    setError("");
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Set Original Audio
  |--------------------------------------------------------------------------
  */

  const setOriginal = useCallback(
    (audio) => {
      if (!audio) {
        setOriginalAudio(null);
        return;
      }

      setOriginalAudio(audio);
      setError("");
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Clear Original Audio
  |--------------------------------------------------------------------------
  */

  const clearOriginal = useCallback(() => {
    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      originalAudioRef.current.currentTime = 0;
      originalAudioRef.current.removeAttribute(
        "src"
      );
      originalAudioRef.current.load();
    }

    setOriginalAudio(null);
    setIsPlaying(false);
    setPreviewType(null);
    setError("");
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Change Mode
  |--------------------------------------------------------------------------
  */

  const changeMode = useCallback(
    (newMode) => {
      if (
        !Object.values(AUDIO_MODES).includes(
          newMode
        )
      ) {
        setError(
          "Invalid audio mode."
        );

        return;
      }

      setMode(newMode);
      setError("");
      setIsPlaying(false);
      setPreviewType(null);
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Music Volume
  |--------------------------------------------------------------------------
  */

  const changeMusicVolume =
    useCallback((value) => {
      const volume = Number(value);

      if (!Number.isFinite(volume)) {
        return;
      }

      const safeVolume = Math.min(
        1,
        Math.max(0, volume)
      );

      setMusicVolume(safeVolume);

      if (musicAudioRef.current) {
        musicAudioRef.current.volume =
          safeVolume;
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Original Volume
  |--------------------------------------------------------------------------
  */

  const changeOriginalVolume =
    useCallback((value) => {
      const volume = Number(value);

      if (!Number.isFinite(volume)) {
        return;
      }

      const safeVolume = Math.min(
        1,
        Math.max(0, volume)
      );

      setOriginalVolume(safeVolume);

      if (originalAudioRef.current) {
        originalAudioRef.current.volume =
          safeVolume;
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Start Time
  |--------------------------------------------------------------------------
  */

  const changeStartTime =
    useCallback(
      (value) => {
        const time = Number(value);

        if (
          !Number.isFinite(time) ||
          time < 0
        ) {
          return;
        }

        if (
          endTime !== null &&
          time >= endTime
        ) {
          return;
        }

        setStartTime(time);
      },
      [endTime]
    );

  /*
  |--------------------------------------------------------------------------
  | End Time
  |--------------------------------------------------------------------------
  */

  const changeEndTime =
    useCallback(
      (value) => {
        const time = Number(value);

        if (
          !Number.isFinite(time) ||
          time <= 0
        ) {
          return;
        }

        if (time <= startTime) {
          return;
        }

        const duration =
          Number(selectedMusic?.duration);

        if (
          Number.isFinite(duration) &&
          duration > 0 &&
          time > duration
        ) {
          return;
        }

        setEndTime(time);
      },
      [startTime, selectedMusic]
    );

  /*
  |--------------------------------------------------------------------------
  | Reset Trim
  |--------------------------------------------------------------------------
  */

  const resetTrim = useCallback(() => {
    setStartTime(0);

    const duration =
      Number(selectedMusic?.duration);

    if (
      Number.isFinite(duration) &&
      duration > 0
    ) {
      setEndTime(duration);
    } else {
      setEndTime(null);
    }

    setError("");
  }, [selectedMusic]);

  /*
  |--------------------------------------------------------------------------
  | Stop Preview
  |--------------------------------------------------------------------------
  */

  const stopPreview =
    useCallback(() => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current.currentTime = 0;
      }

      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        originalAudioRef.current.currentTime = 0;
      }

      setIsPlaying(false);
      setPreviewType(null);
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Preview Music
  |--------------------------------------------------------------------------
  |
  | All providers use the same HTML audio
  | preview mechanism when an audioUrl exists.
  |
  | Jamendo:
  | - audioUrl can be previewed
  |
  | Epidemic:
  | - audioUrl can be previewed when provided
  |
  | Spotify:
  | - audioUrl can be previewed when Spotify
  |   provides a preview URL
  |
  */

  const previewMusic = useCallback(
    async () => {
      if (!selectedMusic) {
        setError(
          "Please select music first."
        );

        return;
      }

      const audioUrl =
        selectedMusic.audioUrl ||
        selectedMusic.audio ||
        "";

      if (!audioUrl) {
        setError(
          "Selected music does not have a preview audio."
        );

        return;
      }

      const audio =
        musicAudioRef.current;

      if (!audio) {
        setError(
          "Music audio player is not available."
        );

        return;
      }

      try {
        /*
        * Stop original audio
        */

        if (originalAudioRef.current) {
          originalAudioRef.current.pause();
        }

        /*
        * Set provider audio URL
        */

        if (audio.src !== audioUrl) {
          audio.src = audioUrl;
          audio.load();
        }

        /*
        * Apply volume
        */

        audio.volume = musicVolume;

        /*
        * Start from selected trim point
        */

        const start =
          Number(startTime) || 0;

        try {
          audio.currentTime = start;
        } catch {
          /*
          * Browser may not allow currentTime
          * before metadata is loaded.
          */
        }

        await audio.play();

        setIsPlaying(true);
        setPreviewType(
          AUDIO_MODES.MUSIC
        );
        setError("");
      } catch (err) {
        console.error(
          "Music preview error:",
          err
        );

        setError(
          "Unable to play music preview."
        );

        setIsPlaying(false);
        setPreviewType(null);
      }
    },
    [
      selectedMusic,
      musicVolume,
      startTime,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | Preview Original Audio
  |--------------------------------------------------------------------------
  */

  const previewOriginal =
    useCallback(async () => {
      if (!originalAudio?.url) {
        setError(
          "Original audio is not available."
        );

        return;
      }

      const audio =
        originalAudioRef.current;

      if (!audio) {
        return;
      }

      try {
        /*
        * Stop music
        */

        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
        }

        audio.src =
          originalAudio.url;

        audio.volume =
          originalVolume;

        audio.currentTime = 0;

        await audio.play();

        setIsPlaying(true);
        setPreviewType(
          AUDIO_MODES.ORIGINAL
        );
        setError("");
      } catch (err) {
        console.error(
          "Original audio preview error:",
          err
        );

        setError(
          "Unable to play original audio."
        );

        setIsPlaying(false);
        setPreviewType(null);
      }
    }, [
      originalAudio,
      originalVolume,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Toggle Preview
  |--------------------------------------------------------------------------
  */

  const togglePreview =
    useCallback(async () => {
      if (
        previewType ===
          AUDIO_MODES.MUSIC &&
        musicAudioRef.current
      ) {
        if (
          musicAudioRef.current.paused
        ) {
          try {
            await musicAudioRef.current.play();
            setIsPlaying(true);
          } catch (err) {
            console.error(
              "Music resume error:",
              err
            );

            setIsPlaying(false);
          }
        } else {
          musicAudioRef.current.pause();

          setIsPlaying(false);
        }

        return;
      }

      if (
        previewType ===
          AUDIO_MODES.ORIGINAL &&
        originalAudioRef.current
      ) {
        if (
          originalAudioRef.current.paused
        ) {
          try {
            await originalAudioRef.current.play();
            setIsPlaying(true);
          } catch (err) {
            console.error(
              "Original audio resume error:",
              err
            );

            setIsPlaying(false);
          }
        } else {
          originalAudioRef.current.pause();

          setIsPlaying(false);
        }
      }
    }, [previewType]);

  /*
  |--------------------------------------------------------------------------
  | Audio Element Events
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const musicAudio =
      musicAudioRef.current;

    if (!musicAudio) {
      return;
    }

    const handleEnded = () => {
      setIsPlaying(false);
      setPreviewType(null);
    };

    musicAudio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      musicAudio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Stop Music At Trim End
  |--------------------------------------------------------------------------
  |
  | The preview should respect the selected
  | start/end range.
  |
  */

  useEffect(() => {
    const musicAudio =
      musicAudioRef.current;

    if (!musicAudio) {
      return;
    }

    const handleTimeUpdate = () => {
      const end =
        Number(endTime);

      if (
        previewType !==
          AUDIO_MODES.MUSIC ||
        !Number.isFinite(end) ||
        end <= 0
      ) {
        return;
      }

      if (
        musicAudio.currentTime >= end
      ) {
        musicAudio.pause();

        musicAudio.currentTime =
          startTime || 0;

        setIsPlaying(false);
        setPreviewType(null);
      }
    };

    musicAudio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    return () => {
      musicAudio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
    };
  }, [
    endTime,
    startTime,
    previewType,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Audio Element Events - Original
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const originalAudio =
      originalAudioRef.current;

    if (!originalAudio) {
      return;
    }

    const handleEnded = () => {
      setIsPlaying(false);
      setPreviewType(null);
    };

    originalAudio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      originalAudio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Cleanup Audio Elements
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current.removeAttribute(
          "src"
        );
        musicAudioRef.current.load();
      }

      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        originalAudioRef.current.removeAttribute(
          "src"
        );
        originalAudioRef.current.load();
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Reset All Audio
  |--------------------------------------------------------------------------
  */

  const resetAudio = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
    }

    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      originalAudioRef.current.currentTime = 0;
    }

    setMode(AUDIO_MODES.MUSIC);

    setSelectedMusic(null);

    setOriginalAudio(null);

    setMusicVolume(
      DEFAULT_MUSIC_VOLUME
    );

    setOriginalVolume(
      DEFAULT_ORIGINAL_VOLUME
    );

    setStartTime(0);
    setEndTime(null);

    setIsPlaying(false);
    setPreviewType(null);
    setIsProcessing(false);
    setError("");
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Build Audio Configuration
  |--------------------------------------------------------------------------
  |
  | This creates the object that will eventually
  | be sent to the backend as:
  |
  | formData.append(
  |   "audio",
  |   JSON.stringify(audioConfig)
  | );
  |
  */

  const getAudioConfig =
    useCallback(() => {
      /*
      * No music
      */

      if (
        mode === AUDIO_MODES.MUSIC &&
        !selectedMusic
      ) {
        return undefined;
      }

      /*
      * No original audio
      */

      if (
        mode === AUDIO_MODES.ORIGINAL &&
        !originalAudio
      ) {
        return undefined;
      }

      /*
      * Mixed mode requires both
      */

      if (
        mode === AUDIO_MODES.MIXED &&
        (!selectedMusic ||
          !originalAudio)
      ) {
        return undefined;
      }

      /*
      |--------------------------------------------------------------------------
      | Music Data
      |--------------------------------------------------------------------------
      */

      const music =
        selectedMusic
          ? {
              musicId:
                selectedMusic.musicId,

              provider:
                selectedMusic.provider ||
                MUSIC_PROVIDERS.JAMENDO,

              providerTrackId:
                selectedMusic.providerTrackId ||
                String(
                  selectedMusic.id || ""
                ),

              title:
                selectedMusic.title ||
                selectedMusic.name ||
                "",

              artistName:
                selectedMusic.artistName,

              albumName:
                selectedMusic.albumName,

              artworkUrl:
                selectedMusic.artworkUrl ||
                selectedMusic.albumImage ||
                selectedMusic.image ||
                selectedMusic.thumbnail,

              audioUrl:
                selectedMusic.audioUrl ||
                selectedMusic.audio,

              licenseUrl:
                selectedMusic.licenseUrl ||
                selectedMusic.licenseCcUrl,

              duration:
                Number(
                  selectedMusic.duration
                ) || 0,
            }
          : undefined;

      /*
      |--------------------------------------------------------------------------
      | Original Audio Data
      |--------------------------------------------------------------------------
      */

      const original =
        originalAudio
          ? {
              url:
                originalAudio.url,

              publicId:
                originalAudio.publicId,

              duration:
                Number(
                  originalAudio.duration
                ) || 0,
            }
          : undefined;

      /*
      |--------------------------------------------------------------------------
      | Music Mode
      |--------------------------------------------------------------------------
      */

      if (
        mode === AUDIO_MODES.MUSIC
      ) {
        return {
          mode: AUDIO_MODES.MUSIC,
          music,
          musicVolume,
          startTime,
          endTime,
        };
      }

      /*
      |--------------------------------------------------------------------------
      | Original Mode
      |--------------------------------------------------------------------------
      */

      if (
        mode === AUDIO_MODES.ORIGINAL
      ) {
        return {
          mode: AUDIO_MODES.ORIGINAL,
          original,
          originalVolume,
          startTime,
          endTime,
        };
      }

      /*
      |--------------------------------------------------------------------------
      | Mixed Mode
      |--------------------------------------------------------------------------
      */

      return {
        mode: AUDIO_MODES.MIXED,

        music,

        original,

        musicVolume,

        originalVolume,

        startTime,

        endTime,
      };
    }, [
      mode,
      selectedMusic,
      originalAudio,
      musicVolume,
      originalVolume,
      startTime,
      endTime,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    /*
    * Mode
    */

    mode,

    setMode: changeMode,

    /*
    * Music
    */

    selectedMusic,

    selectMusic,

    clearMusic,

    /*
    * Original Audio
    */

    originalAudio,

    setOriginal,

    clearOriginal,

    /*
    * Volume
    */

    musicVolume,

    setMusicVolume:
      changeMusicVolume,

    originalVolume,

    setOriginalVolume:
      changeOriginalVolume,

    /*
    * Trim
    */

    startTime,

    setStartTime:
      changeStartTime,

    endTime,

    setEndTime:
      changeEndTime,

    resetTrim,

    /*
    * Preview
    */

    isPlaying,

    previewType,

    previewMusic,

    previewOriginal,

    togglePreview,

    stopPreview,

    /*
    * Refs
    */

    musicAudioRef,

    originalAudioRef,

    /*
    * State
    */

    isProcessing,

    setIsProcessing,

    error,

    setError,

    /*
    * Backend Configuration
    */

    getAudioConfig,

    /*
    * Reset
    */

    resetAudio,
  };
};

export default useAudio;