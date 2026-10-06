import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import useAudio from "../../hooks/useAudio";
import musicService from "../../services/music.service";

import MusicSearch from "./music/MusicSearch";
import MusicList from "./music/MusicList";
import MusicPreview from "./music/MusicPreview";
import MusicTrim from "./music/MusicTrim";

import AudioRecorder from "./original/AudioRecorder";
import AudioPreview from "./original/AudioPreview";
import AudioControls from "./original/AudioControls";

/*
|--------------------------------------------------------------------------
| Audio Modes
|--------------------------------------------------------------------------
*/

const AUDIO_MODES = {
  MUSIC: "music",
  ORIGINAL: "original",
  MIXED: "mixed",
};

/*
|--------------------------------------------------------------------------
| Supported Music Providers
|--------------------------------------------------------------------------
*/

const MUSIC_PROVIDERS = {
  JAMENDO: "jamendo",
  EPIDEMIC: "epidemic",
  SPOTIFY: "spotify",
};

const SUPPORTED_MUSIC_PROVIDERS = Object.values(
  MUSIC_PROVIDERS
);

/*
|--------------------------------------------------------------------------
| AudioPicker
|--------------------------------------------------------------------------
*/

const AudioPicker = ({
  onAudioChange,
  onAudioFileChange,
  initialMode = AUDIO_MODES.MUSIC,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Callback Ref
  |--------------------------------------------------------------------------
  */

  const onAudioChangeRef =
    useRef(onAudioChange);

  /*
  |--------------------------------------------------------------------------
  | useAudio
  |--------------------------------------------------------------------------
  */

  const {
    mode,
    selectedMusic,
    originalAudio,

    musicVolume,
    originalVolume,

    startTime,
    endTime,

    isPlaying,
    previewType,

    isProcessing,
    error,

    musicAudioRef,
    originalAudioRef,

    selectMusic,
    clearMusic,

    setOriginal,
    clearOriginal,

    setMode,

    setMusicVolume,
    setOriginalVolume,

    setStartTime,
    setEndTime,

    resetTrim,

    stopPreview,

    previewMusic,
    previewOriginal,

    resetAudio,

    getAudioConfig,
  } = useAudio();

  /*
  |--------------------------------------------------------------------------
  | Original Audio Object URL
  |--------------------------------------------------------------------------
  */

  const originalObjectUrlRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Music State
  |--------------------------------------------------------------------------
  */

  const [musicResults, setMusicResults] =
    useState([]);

  const [isMusicLoading, setIsMusicLoading] =
    useState(false);

  const [musicError, setMusicError] =
    useState("");

  const [
    isMusicSelecting,
    setIsMusicSelecting,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Recording State
  |--------------------------------------------------------------------------
  */

  const [isRecording, setIsRecording] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Sync Initial Mode
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      Object.values(AUDIO_MODES).includes(
        initialMode
      )
    ) {
      setMode(initialMode);
    }
  }, [
    initialMode,
    setMode,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Sync Callback
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    onAudioChangeRef.current =
      onAudioChange;
  }, [onAudioChange]);

  /*
  |--------------------------------------------------------------------------
  | Cleanup Original Object URL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (
        originalObjectUrlRef.current
      ) {
        URL.revokeObjectURL(
          originalObjectUrlRef.current
        );

        originalObjectUrlRef.current =
          null;
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Revoke Original Object URL
  |--------------------------------------------------------------------------
  */

  const revokeOriginalObjectUrl =
    () => {
      if (
        !originalObjectUrlRef.current
      ) {
        return;
      }

      URL.revokeObjectURL(
        originalObjectUrlRef.current
      );

      originalObjectUrlRef.current =
        null;
    };

  /*
  |--------------------------------------------------------------------------
  | Get Audio Duration
  |--------------------------------------------------------------------------
  */

  const getAudioDuration = (
    audioUrl
  ) => {
    return new Promise(
      (resolve) => {
        const audio =
          document.createElement(
            "audio"
          );

        audio.preload = "metadata";

        const cleanup = () => {
          audio.onloadedmetadata =
            null;

          audio.onerror = null;

          audio.removeAttribute("src");

          audio.load();
        };

        audio.onloadedmetadata = () => {
          const duration =
            Number(audio.duration);

          cleanup();

          if (
            Number.isFinite(
              duration
            ) &&
            duration > 0
          ) {
            resolve(duration);
            return;
          }

          resolve(0);
        };

        audio.onerror = () => {
          cleanup();
          resolve(0);
        };

        audio.src = audioUrl;
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Mode Change
  |--------------------------------------------------------------------------
  */

  const handleModeChange = (
    nextMode
  ) => {
    if (
      !Object.values(
        AUDIO_MODES
      ).includes(nextMode)
    ) {
      return;
    }

    /*
    * All supported music providers are
    * compatible with the common Mixed mode.
    *
    * However, Mixed mode requires an actual
    * playable audio URL.
    */

    if (
      nextMode ===
        AUDIO_MODES.MIXED &&
      selectedMusic &&
      !(
        selectedMusic.audioUrl ||
        selectedMusic.audio
      )
    ) {
      setMusicError(
        "Selected music does not have a playable audio preview. Please select another track for Mixed Audio."
      );

      return;
    }

    stopPreview();

    setMode(nextMode);

    setMusicError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Music Search Results
  |--------------------------------------------------------------------------
  */

  const handleMusicResults =
    useCallback((tracks) => {
      setMusicResults(
        Array.isArray(tracks)
          ? tracks
          : []
      );

      setMusicError("");
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Music Loading
  |--------------------------------------------------------------------------
  */

  const handleMusicLoading =
    useCallback((loading) => {
      setIsMusicLoading(
        Boolean(loading)
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Music Search Error
  |--------------------------------------------------------------------------
  */

  const handleMusicError =
    useCallback((message) => {
      setMusicError(
        message ||
          "Unable to search music."
      );

      setMusicResults([]);
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Music Select
  |--------------------------------------------------------------------------
  |
  | Supports:
  |
  | - Jamendo
  | - Epidemic Sound
  | - Spotify
  |
  */

  const handleMusicSelect =
    async (music) => {
      if (!music) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Provider
      |--------------------------------------------------------------------------
      */

      const provider =
        String(
          music.provider ||
            MUSIC_PROVIDERS.JAMENDO
        )
          .trim()
          .toLowerCase();

      if (
        !SUPPORTED_MUSIC_PROVIDERS.includes(
          provider
        )
      ) {
        setMusicError(
          "Unsupported music provider."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Provider Track ID
      |--------------------------------------------------------------------------
      */

      const providerTrackId =
        music.providerTrackId ||
        music.id;

      if (
        providerTrackId ===
          undefined ||
        providerTrackId ===
          null ||
        String(
          providerTrackId
        ).trim() === ""
      ) {
        setMusicError(
          "Selected music does not have a valid provider track ID."
        );

        return;
      }

      try {
        setIsMusicSelecting(true);

        setMusicError("");

        stopPreview();

        /*
        |--------------------------------------------------------------------------
        | Save / Select Music
        |--------------------------------------------------------------------------
        |
        | provider is passed to backend.
        |
        */

        const response =
          await musicService.selectMusic(
            providerTrackId,
            provider
          );

        /*
        |--------------------------------------------------------------------------
        | Backend Response
        |--------------------------------------------------------------------------
        */

        const savedMusic =
          response?.data?.music ||
          response?.data;

        if (!savedMusic) {
          throw new Error(
            "Unable to save selected music."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Build Selected Track
        |--------------------------------------------------------------------------
        */

        const selectedTrack = {
          /*
          * Keep original search result.
          */

          ...music,

          /*
          * MongoDB ID
          */

          musicId:
            savedMusic._id ||
            savedMusic.musicId,

          /*
          * Provider
          */

          provider:
            savedMusic.provider ||
            provider,

          /*
          * Provider Track ID
          */

          providerTrackId:
            savedMusic.providerTrackId ||
            providerTrackId,

          /*
          * Name
          */

          name:
            music.name ||
            savedMusic.title ||
            "Unknown Track",

          /*
          * Title
          */

          title:
            savedMusic.title ||
            music.title ||
            music.name ||
            "Unknown Track",

          /*
          * Artist
          */

          artistName:
            savedMusic.artistName ||
            music.artistName ||
            "Unknown Artist",

          /*
          * Album
          */

          albumName:
            savedMusic.albumName ||
            music.albumName ||
            "",

          /*
          * Artwork
          */

          albumImage:
            music.albumImage ||
            savedMusic.artworkUrl ||
            music.artworkUrl ||
            "",

          image:
            music.image ||
            savedMusic.artworkUrl ||
            music.artworkUrl ||
            "",

          artworkUrl:
            savedMusic.artworkUrl ||
            music.artworkUrl ||
            music.albumImage ||
            music.image ||
            "",

          /*
          |--------------------------------------------------------------------------
          | Common Audio URL
          |--------------------------------------------------------------------------
          |
          | All providers use the same audioUrl
          | field when a preview is available.
          |
          */

          audio:
            savedMusic.audioUrl ||
            music.audioUrl ||
            music.audio ||
            "",

          audioUrl:
            savedMusic.audioUrl ||
            music.audioUrl ||
            music.audio ||
            "",

          /*
          |--------------------------------------------------------------------------
          | External Provider URL
          |--------------------------------------------------------------------------
          |
          | Used when the provider does not expose
          | a playable preview URL.
          |
          */

          externalUrl:
            savedMusic.externalUrl ||
            music.externalUrl ||
            music.url ||
            "",

          /*
          |--------------------------------------------------------------------------
          | Spotify URI
          |--------------------------------------------------------------------------
          */

          spotifyUri:
            savedMusic.spotifyUri ||
            music.spotifyUri ||
            "",

          /*
          |--------------------------------------------------------------------------
          | License
          |--------------------------------------------------------------------------
          */

          licenseCcUrl:
            music.licenseCcUrl ||
            savedMusic.licenseUrl ||
            "",

          licenseUrl:
            savedMusic.licenseUrl ||
            music.licenseUrl ||
            music.licenseCcUrl ||
            "",

          /*
          |--------------------------------------------------------------------------
          | Duration
          |--------------------------------------------------------------------------
          */

          duration:
            Number(
              savedMusic.duration
            ) ||
            Number(
              music.duration
            ) ||
            0,
        };

        /*
        |--------------------------------------------------------------------------
        | Validate MongoDB ID
        |--------------------------------------------------------------------------
        */

        if (
          !selectedTrack.musicId
        ) {
          throw new Error(
            "Music was selected but MongoDB music ID was not returned."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Set Selected Music
        |--------------------------------------------------------------------------
        */

        selectMusic(
          selectedTrack
        );

        setMusicError("");
      } catch (
        selectionError
      ) {
        console.error(
          "Music selection error:",
          selectionError
        );

        setMusicError(
          selectionError?.message ||
            "Unable to select music."
        );
      } finally {
        setIsMusicSelecting(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Recording Complete
  |--------------------------------------------------------------------------
  */

  const handleRecordingComplete =
    async (audioBlob) => {
      if (!audioBlob) {
        return;
      }

      try {
        stopPreview();

        revokeOriginalObjectUrl();

        const audioUrl =
          URL.createObjectURL(
            audioBlob
          );

        originalObjectUrlRef.current =
          audioUrl;

        const duration =
          await getAudioDuration(
            audioUrl
          );

        setOriginal({
          file: audioBlob,
          blob: audioBlob,
          url: audioUrl,

          type:
            audioBlob.type ||
            "audio/webm",

          duration,
        });

        if (
          typeof onAudioFileChange ===
          "function"
        ) {
          onAudioFileChange(
            audioBlob
          );
        }

        setIsRecording(false);
      } catch (
        recordingError
      ) {
        console.error(
          "Recording processing error:",
          recordingError
        );

        revokeOriginalObjectUrl();

        setIsRecording(false);

        if (
          typeof onAudioFileChange ===
          "function"
        ) {
          onAudioFileChange(
            null
          );
        }
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Recording Start
  |--------------------------------------------------------------------------
  */

  const handleRecordingStart =
    () => {
      stopPreview();

      setIsRecording(true);
    };

  /*
  |--------------------------------------------------------------------------
  | Recording Stop
  |--------------------------------------------------------------------------
  */

  const handleRecordingStop =
    () => {
      setIsRecording(false);
    };

  /*
  |--------------------------------------------------------------------------
  | Clear Original
  |--------------------------------------------------------------------------
  */

  const handleClearOriginal =
    () => {
      stopPreview();

      revokeOriginalObjectUrl();

      clearOriginal();

      if (
        typeof onAudioFileChange ===
        "function"
      ) {
        onAudioFileChange(
          null
        );
      }

      setIsRecording(false);
    };

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    stopPreview();

    revokeOriginalObjectUrl();

    resetAudio();

    setMusicResults([]);

    setMusicError("");

    if (
      typeof onAudioFileChange ===
      "function"
    ) {
      onAudioFileChange(
        null
      );
    }

    setIsRecording(false);

    setIsMusicSelecting(
      false
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Audio Change Callback
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      typeof onAudioChangeRef.current !==
      "function"
    ) {
      return;
    }

    const config =
      getAudioConfig();

    onAudioChangeRef.current(
      config
    );
  }, [
    mode,
    selectedMusic,
    originalAudio,
    musicVolume,
    originalVolume,
    startTime,
    endTime,
    getAudioConfig,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Music / Original State
  |--------------------------------------------------------------------------
  */

  const hasMusic =
    Boolean(selectedMusic);

  const hasOriginal =
    Boolean(originalAudio);

  /*
  |--------------------------------------------------------------------------
  | Provider Helpers
  |--------------------------------------------------------------------------
  */

  const selectedMusicProvider =
    String(
      selectedMusic?.provider ||
        ""
    )
      .trim()
      .toLowerCase();

  const providerLabel = (() => {
    switch (
      selectedMusicProvider
    ) {
      case MUSIC_PROVIDERS.JAMENDO:
        return "Jamendo";

      case MUSIC_PROVIDERS.EPIDEMIC:
        return "Epidemic Sound";

      case MUSIC_PROVIDERS.SPOTIFY:
        return "Spotify";

      default:
        return selectedMusicProvider
          ? selectedMusicProvider
              .charAt(0)
              .toUpperCase() +
              selectedMusicProvider.slice(1)
          : "Music";
    }
  })();

  /*
  |--------------------------------------------------------------------------
  | Music Playback Availability
  |--------------------------------------------------------------------------
  */

  const selectedMusicAudioUrl =
    selectedMusic?.audioUrl ||
    selectedMusic?.audio ||
    "";

  const hasPlayableMusic =
    Boolean(
      selectedMusicAudioUrl
    );

  /*
  |--------------------------------------------------------------------------
  | Mixed Mode
  |--------------------------------------------------------------------------
  |
  | All three providers can participate in
  | Mixed Audio when an audioUrl is available.
  |
  */

  const mixedModeReady =
    hasMusic &&
    hasOriginal &&
    hasPlayableMusic;

  /*
  |--------------------------------------------------------------------------
  | Mode Selector
  |--------------------------------------------------------------------------
  */

  const renderModeSelector =
    () => {
      return (
        <div
          className="audio-picker__modes"
          role="tablist"
          aria-label="Audio mode"
        >
          {/* Music */}

          <button
            type="button"
            role="tab"
            aria-selected={
              mode ===
              AUDIO_MODES.MUSIC
            }
            className={`audio-picker__mode ${
              mode ===
              AUDIO_MODES.MUSIC
                ? "audio-picker__mode--active"
                : ""
            }`}
            onClick={() =>
              handleModeChange(
                AUDIO_MODES.MUSIC
              )
            }
          >
            Music
          </button>

          {/* Original */}

          <button
            type="button"
            role="tab"
            aria-selected={
              mode ===
              AUDIO_MODES.ORIGINAL
            }
            className={`audio-picker__mode ${
              mode ===
              AUDIO_MODES.ORIGINAL
                ? "audio-picker__mode--active"
                : ""
            }`}
            onClick={() =>
              handleModeChange(
                AUDIO_MODES.ORIGINAL
              )
            }
          >
            Original
          </button>

          {/* Mixed */}

          <button
            type="button"
            role="tab"
            aria-selected={
              mode ===
              AUDIO_MODES.MIXED
            }
            className={`audio-picker__mode ${
              mode ===
              AUDIO_MODES.MIXED
                ? "audio-picker__mode--active"
                : ""
            }`}
            disabled={
              hasMusic &&
              !hasPlayableMusic
            }
            onClick={() =>
              handleModeChange(
                AUDIO_MODES.MIXED
              )
            }
            title={
              hasMusic &&
              !hasPlayableMusic
                ? "Selected music does not have a playable preview."
                : "Mix music with original audio"
            }
          >
            Mixed
          </button>
        </div>
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Music Section
  |--------------------------------------------------------------------------
  */

  const renderMusicSection =
    () => {
      return (
        <div className="audio-picker__section">
          <div className="audio-picker__section-header">
            <div>
              <h3 className="audio-picker__section-title">
                Choose Music
              </h3>

              <p className="audio-picker__section-description">
                Search and select
                music from
                Jamendo, Epidemic
                Sound, or Spotify.
              </p>
            </div>
          </div>

          {/* Search */}

          <MusicSearch
            onResults={
              handleMusicResults
            }
            onLoading={
              handleMusicLoading
            }
            onError={
              handleMusicError
            }
          />

          {/* Search Error */}

          {musicError && (
            <div
              className="audio-picker__error"
              role="alert"
            >
              {musicError}
            </div>
          )}

          {/* Selecting */}

          {isMusicSelecting && (
            <div className="audio-picker__processing">
              Selecting music...
            </div>
          )}

          {/* Results */}

          <MusicList
            tracks={
              musicResults
            }
            selectedMusic={
              selectedMusic
            }
            onSelect={
              handleMusicSelect
            }
            isLoading={
              isMusicLoading ||
              isMusicSelecting
            }
          />

          {/* Selected Music */}

          {selectedMusic && (
            <div className="audio-picker__selected">
              {/* Preview */}

              <MusicPreview
                music={
                  selectedMusic
                }
                musicAudioRef={
                  musicAudioRef
                }
                musicVolume={
                  musicVolume
                }
                startTime={
                  startTime
                }
                endTime={
                  endTime
                }
                isPlaying={
                  isPlaying
                }
                previewType={
                  previewType
                }
                onPlay={
                  previewMusic
                }
                onPause={
                  stopPreview
                }
                onStop={
                  stopPreview
                }
              />

              {/* Trim */}

              <MusicTrim
                music={
                  selectedMusic
                }
                startTime={
                  startTime
                }
                endTime={
                  endTime
                }
                onStartTimeChange={
                  setStartTime
                }
                onEndTimeChange={
                  setEndTime
                }
                onReset={
                  resetTrim
                }
              />

              {/* Volume Controls */}

              <AudioControls
                mode="music"
                musicVolume={
                  musicVolume
                }
                originalVolume={
                  originalVolume
                }
                onMusicVolumeChange={
                  setMusicVolume
                }
                onOriginalVolumeChange={
                  setOriginalVolume
                }
              />

              {/* Provider Information */}

              <div className="audio-picker__notice">
                Provider:{" "}
                <strong>
                  {providerLabel}
                </strong>

                {!hasPlayableMusic && (
                  <>
                    {" "}
                    — preview audio is not
                    available for this
                    track.
                  </>
                )}
              </div>

              {/* External Provider Link */}

              {!hasPlayableMusic &&
                selectedMusic?.externalUrl && (
                  <a
                    href={
                      selectedMusic.externalUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="audio-picker__external-link"
                  >
                    Open on{" "}
                    {providerLabel}
                  </a>
                )}

              {/* Remove Music */}

              <button
                type="button"
                className="audio-picker__clear"
                onClick={() => {
                  stopPreview();
                  clearMusic();
                }}
                disabled={
                  isMusicSelecting
                }
              >
                Remove Music
              </button>
            </div>
          )}
        </div>
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Original Audio Section
  |--------------------------------------------------------------------------
  */

  const renderOriginalSection =
    () => {
      return (
        <div className="audio-picker__section">
          <div className="audio-picker__section-header">
            <div>
              <h3 className="audio-picker__section-title">
                Original Audio
              </h3>

              <p className="audio-picker__section-description">
                Record your own
                voice or
                original audio.
              </p>
            </div>
          </div>

          {/* Recorder */}

          {!originalAudio && (
            <AudioRecorder
              onRecordingComplete={
                handleRecordingComplete
              }
              onRecordingStart={
                handleRecordingStart
              }
              onRecordingStop={
                handleRecordingStop
              }
              disabled={
                isProcessing
              }
            />
          )}

          {/* Selected Original */}

          {originalAudio && (
            <div className="audio-picker__selected">
              <AudioPreview
                audio={
                  originalAudio.blob ||
                  originalAudio.url
                }
                volume={
                  originalVolume
                }
                onPlay={
                  previewOriginal
                }
                onPause={
                  stopPreview
                }
                onStop={
                  stopPreview
                }
              />

              <AudioControls
                mode="original"
                musicVolume={
                  musicVolume
                }
                originalVolume={
                  originalVolume
                }
                onMusicVolumeChange={
                  setMusicVolume
                }
                onOriginalVolumeChange={
                  setOriginalVolume
                }
              />

              {Number(
                originalAudio.duration
              ) > 0 && (
                <div className="audio-picker__audio-duration">
                  Duration:{" "}
                  {Math.floor(
                    Number(
                      originalAudio.duration
                    ) / 60
                  )}
                  :
                  {String(
                    Math.floor(
                      Number(
                        originalAudio.duration
                      ) % 60
                    )
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>
              )}

              <button
                type="button"
                className="audio-picker__clear"
                onClick={
                  handleClearOriginal
                }
              >
                Remove Original Audio
              </button>
            </div>
          )}

          {/* Recording Status */}

          {isRecording && (
            <div className="audio-picker__recording-status">
              Recording original
              audio...
            </div>
          )}
        </div>
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Mixed Audio Section
  |--------------------------------------------------------------------------
  */

  const renderMixedSection =
    () => {
      return (
        <div className="audio-picker__section">
          <div className="audio-picker__section-header">
            <div>
              <h3 className="audio-picker__section-title">
                Mixed Audio
              </h3>

              <p className="audio-picker__section-description">
                Use music together
                with your
                original audio.
              </p>
            </div>
          </div>

          {/* Music Required */}

          {!hasMusic && (
            <div className="audio-picker__notice">
              Select music first.
            </div>
          )}

          {/* Original Required */}

          {!hasOriginal && (
            <div className="audio-picker__notice">
              Record original
              audio first.
            </div>
          )}

          {/* Music Preview Unavailable */}

          {hasMusic &&
            !hasPlayableMusic && (
              <div
                className="audio-picker__notice"
                role="alert"
              >
                The selected{" "}
                {providerLabel} track
                does not provide a
                playable audio preview.
                Please select a track
                with an audio preview
                before using Mixed
                Audio.
              </div>
            )}

          {/* Mixed Ready */}

          {mixedModeReady && (
            <>
              <div className="audio-picker__mixed-preview">
                <div className="audio-picker__mixed-item">
                  <strong>
                    Music
                  </strong>

                  <span>
                    {selectedMusic?.name ||
                      selectedMusic?.title ||
                      "Selected music"}
                  </span>

                  <small>
                    {providerLabel}
                  </small>
                </div>

                <div className="audio-picker__mixed-item">
                  <strong>
                    Original
                  </strong>

                  <span>
                    Original audio
                  </span>
                </div>
              </div>

              {/* Music Preview */}

              <MusicPreview
                music={
                  selectedMusic
                }
                musicAudioRef={
                  musicAudioRef
                }
                musicVolume={
                  musicVolume
                }
                startTime={
                  startTime
                }
                endTime={
                  endTime
                }
                isPlaying={
                  isPlaying
                }
                previewType={
                  previewType
                }
                onPlay={
                  previewMusic
                }
                onPause={
                  stopPreview
                }
                onStop={
                  stopPreview
                }
              />

              {/* Original Preview */}

              <AudioPreview
                audio={
                  originalAudio.blob ||
                  originalAudio.url
                }
                volume={
                  originalVolume
                }
                onPlay={
                  previewOriginal
                }
                onPause={
                  stopPreview
                }
                onStop={
                  stopPreview
                }
              />

              {/* Music Trim */}

              <MusicTrim
                music={
                  selectedMusic
                }
                startTime={
                  startTime
                }
                endTime={
                  endTime
                }
                onStartTimeChange={
                  setStartTime
                }
                onEndTimeChange={
                  setEndTime
                }
                onReset={
                  resetTrim
                }
              />

              {/* Volume Controls */}

              <AudioControls
                mode="mixed"
                musicVolume={
                  musicVolume
                }
                originalVolume={
                  originalVolume
                }
                onMusicVolumeChange={
                  setMusicVolume
                }
                onOriginalVolumeChange={
                  setOriginalVolume
                }
              />
            </>
          )}
        </div>
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Main UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="audio-picker">
      {/* Header */}

      <div className="audio-picker__header">
        <div>
          <h2 className="audio-picker__title">
            Add Audio
          </h2>

          <p className="audio-picker__description">
            Add music, original
            audio, or both.
          </p>
        </div>

        <button
          type="button"
          className="audio-picker__reset"
          onClick={
            handleReset
          }
          disabled={
            isRecording
          }
        >
          Reset
        </button>
      </div>

      {/* Mode Selector */}

      {renderModeSelector()}

      {/* Music */}

      {mode ===
        AUDIO_MODES.MUSIC &&
        renderMusicSection()}

      {/* Original */}

      {mode ===
        AUDIO_MODES.ORIGINAL &&
        renderOriginalSection()}

      {/* Mixed */}

      {mode ===
        AUDIO_MODES.MIXED &&
        renderMixedSection()}

      {/* Processing */}

      {isProcessing && (
        <div className="audio-picker__processing">
          Processing audio...
        </div>
      )}

      {/* Error */}

      {error && (
        <div
          className="audio-picker__error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioPicker;