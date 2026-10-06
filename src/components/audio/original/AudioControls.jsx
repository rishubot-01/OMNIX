import React from "react";

/*
|--------------------------------------------------------------------------
| AudioControls
|--------------------------------------------------------------------------
|
| Reusable audio controls for OMNIX.
|
| Supported controls:
|
| 1. Music volume
| 2. Original audio volume
|
| Provider-independent:
| - Jamendo
| - Epidemic Sound
| - Spotify
|
| This component does NOT:
|
| - record audio
| - upload audio
| - call backend
| - mix audio files
| - depend on any music provider
|
| It only controls audio-related values
| and sends them back to the parent.
|
|--------------------------------------------------------------------------
*/

const AudioControls = ({
  mode = "original",

  musicVolume = 1,

  originalVolume = 1,

  onMusicVolumeChange,

  onOriginalVolumeChange,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Clamp Volume
  |--------------------------------------------------------------------------
  |
  | Volume must always remain between 0 and 1.
  |
  */

  const clampVolume = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return 0;
    }

    return Math.min(1, Math.max(0, number));
  };

  /*
  |--------------------------------------------------------------------------
  | Convert Volume To Percentage
  |--------------------------------------------------------------------------
  */

  const toPercentage = (value) => {
    return Math.round(clampVolume(value) * 100);
  };

  /*
  |--------------------------------------------------------------------------
  | Music Volume Change
  |--------------------------------------------------------------------------
  */

  const handleMusicVolumeChange = (event) => {
    const value = clampVolume(event.target.value);

    onMusicVolumeChange?.(value);
  };

  /*
  |--------------------------------------------------------------------------
  | Original Audio Volume Change
  |--------------------------------------------------------------------------
  */

  const handleOriginalVolumeChange = (event) => {
    const value = clampVolume(event.target.value);

    onOriginalVolumeChange?.(value);
  };

  /*
  |--------------------------------------------------------------------------
  | Music Volume Preset
  |--------------------------------------------------------------------------
  */

  const setMusicVolume = (value) => {
    onMusicVolumeChange?.(clampVolume(value));
  };

  /*
  |--------------------------------------------------------------------------
  | Original Audio Volume Preset
  |--------------------------------------------------------------------------
  */

  const setOriginalVolume = (value) => {
    onOriginalVolumeChange?.(clampVolume(value));
  };

  /*
  |--------------------------------------------------------------------------
  | Render Music Control
  |--------------------------------------------------------------------------
  */

  const renderMusicControl = () => {
    return (
      <div className="audio-controls__group">
        <div className="audio-controls__label-row">
          <label
            htmlFor="music-volume"
            className="audio-controls__label"
          >
            Music
          </label>

          <span className="audio-controls__value">
            {toPercentage(musicVolume)}%
          </span>
        </div>

        <input
          id="music-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={clampVolume(musicVolume)}
          onChange={handleMusicVolumeChange}
          className="audio-controls__slider"
          aria-label="Music volume"
        />

        <div className="audio-controls__presets">
          <button
            type="button"
            onClick={() => setMusicVolume(0)}
          >
            Mute
          </button>

          <button
            type="button"
            onClick={() => setMusicVolume(0.5)}
          >
            50%
          </button>

          <button
            type="button"
            onClick={() => setMusicVolume(1)}
          >
            100%
          </button>
        </div>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render Original Audio Control
  |--------------------------------------------------------------------------
  */

  const renderOriginalControl = () => {
    return (
      <div className="audio-controls__group">
        <div className="audio-controls__label-row">
          <label
            htmlFor="original-volume"
            className="audio-controls__label"
          >
            Original Audio
          </label>

          <span className="audio-controls__value">
            {toPercentage(originalVolume)}%
          </span>
        </div>

        <input
          id="original-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={clampVolume(originalVolume)}
          onChange={handleOriginalVolumeChange}
          className="audio-controls__slider"
          aria-label="Original audio volume"
        />

        <div className="audio-controls__presets">
          <button
            type="button"
            onClick={() => setOriginalVolume(0)}
          >
            Mute
          </button>

          <button
            type="button"
            onClick={() => setOriginalVolume(0.5)}
          >
            50%
          </button>

          <button
            type="button"
            onClick={() => setOriginalVolume(1)}
          >
            100%
          </button>
        </div>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Original Mode
  |--------------------------------------------------------------------------
  */

  if (mode === "original") {
    return (
      <div className="audio-controls">
        <div className="audio-controls__header">
          <div className="audio-controls__title">
            Audio Controls
          </div>
        </div>

        {renderOriginalControl()}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Music Mode
  |--------------------------------------------------------------------------
  */

  if (mode === "music") {
    return (
      <div className="audio-controls">
        <div className="audio-controls__header">
          <div className="audio-controls__title">
            Audio Controls
          </div>
        </div>

        {renderMusicControl()}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Mixed Mode
  |--------------------------------------------------------------------------
  */

  if (mode === "mixed") {
    return (
      <div className="audio-controls">
        <div className="audio-controls__header">
          <div className="audio-controls__title">
            Audio Mix
          </div>

          <div className="audio-controls__description">
            Adjust music and original audio separately.
          </div>
        </div>

        {renderMusicControl()}

        {renderOriginalControl()}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Fallback
  |--------------------------------------------------------------------------
  */

  return null;
};

export default AudioControls;