
const MusicItem = ({
  music,
  isSelected = false,
  onSelect,
  onPlay,
  isPlaying = false,
}) => {
  if (!music) {
    return null;
  }

  /*
   * |--------------------------------------------------------------------------
   * | Provider
   * |--------------------------------------------------------------------------
   */

  const provider = String(
    music.provider || "jamendo"
  )
    .trim()
    .toLowerCase();

  /*
   * |--------------------------------------------------------------------------
   * | Track Information
   * |--------------------------------------------------------------------------
   */

  const title =
    music.name ||
    music.title ||
    "Unknown Track";

  const artist =
    music.artistName ||
    music.artist ||
    "Unknown Artist";

  const artwork =
    music.albumImage ||
    music.image ||
    music.thumbnail ||
    music.artworkUrl ||
    music.artwork ||
    "";

  /*
   * |--------------------------------------------------------------------------
   * | Duration
   * |--------------------------------------------------------------------------
   */

  const durationInSeconds =
    Number(music.duration) || 0;

  const minutes = Math.floor(
    durationInSeconds / 60
  );

  const seconds = Math.floor(
    durationInSeconds % 60
  )
    .toString()
    .padStart(2, "0");

  const formattedDuration =
    durationInSeconds > 0
      ? `${minutes}:${seconds}`
      : "--:--";

  /*
   * |--------------------------------------------------------------------------
   * | Provider Track ID
   * |--------------------------------------------------------------------------
   */

  const providerTrackId =
    music.providerTrackId ||
    music.trackId ||
    music.id ||
    "";

  /*
   * |--------------------------------------------------------------------------
   * | External URL
   * |--------------------------------------------------------------------------
   */

  const externalUrl =
    music.externalUrl ||
    music.url ||
    "";

  /*
   * |--------------------------------------------------------------------------
   * | Audio / Preview URL
   * |--------------------------------------------------------------------------
   */

  const audioUrl =
    music.audio ||
    music.audioUrl ||
    music.previewUrl ||
    music.preview ||
    music.streamUrl ||
    music.stream ||
    "";

  const hasAudio =
    Boolean(audioUrl);

  /*
   * |--------------------------------------------------------------------------
   * | Select Track
   * |--------------------------------------------------------------------------
   */

  const handleSelect = () => {
    if (
      typeof onSelect === "function"
    ) {
      onSelect(music);
    }
  };

  /*
   * |--------------------------------------------------------------------------
   * | Play / Preview Track
   * |--------------------------------------------------------------------------
   */

  const handlePlay = (event) => {
    event.stopPropagation();

    if (
      !hasAudio ||
      typeof onPlay !== "function"
    ) {
      return;
    }

    onPlay(music);
  };

  /*
   * |--------------------------------------------------------------------------
   * | Open External Music
   * |--------------------------------------------------------------------------
   */

  const handleOpenExternal = (
    event
  ) => {
    event.stopPropagation();

    if (!externalUrl) {
      return;
    }

    window.open(
      externalUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * |--------------------------------------------------------------------------
   * | Provider Label
   * |--------------------------------------------------------------------------
   */

  const getProviderLabel = () => {
    switch (provider) {
      case "jamendo":
        return "Jamendo";

      case "epidemic":
        return "Epidemic Sound";

      case "spotify":
        return "Spotify";

      default:
        return provider
          ? provider.charAt(0).toUpperCase() +
              provider.slice(1)
          : "Music";
    }
  };

  const providerLabel =
    getProviderLabel();

  /*
   * |--------------------------------------------------------------------------
   * | Provider Class
   * |--------------------------------------------------------------------------
   */

  const providerClass =
    provider === "epidemic"
      ? "music-item--epidemic"
      : provider === "jamendo"
        ? "music-item--jamendo"
        : `music-item--${provider}`;

  /*
   * |--------------------------------------------------------------------------
   * | Provider Icon
   * |--------------------------------------------------------------------------
   */

  const getProviderIcon = () => {
    switch (provider) {
      case "jamendo":
        return "♪";

      case "epidemic":
        return "♫";

      case "spotify":
        return "●";

      default:
        return "♪";
    }
  };

  const providerIcon =
    getProviderIcon();

  /*
   * |--------------------------------------------------------------------------
   * | UI
   * |--------------------------------------------------------------------------
   */

  return (
    <div
      className={[
        "music-item",
        providerClass,
        isSelected
          ? "music-item--selected"
          : "",
        isPlaying
          ? "music-item--playing"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-provider={provider}
      data-provider-track-id={
        providerTrackId
      }
    >
      {/* --------------------------------------------------------------- */}
      {/* Artwork                                                         */}
      {/* --------------------------------------------------------------- */}

      <div className="music-item__artwork">
        {artwork ? (
          <img
            src={artwork}
            alt={`${title} artwork`}
            className="music-item__image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div
            className="music-item__placeholder"
            aria-hidden="true"
          >
            {providerIcon}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Track Information                                               */}
      {/* --------------------------------------------------------------- */}

      <div className="music-item__info">
        <div
          className="music-item__title"
          title={title}
        >
          {title}
        </div>

        <div
          className="music-item__artist"
          title={artist}
        >
          {artist}
        </div>

        <div className="music-item__meta">
          <span className="music-item__duration">
            {formattedDuration}
          </span>

          <span className="music-item__provider">
            {providerLabel}
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Actions                                                         */}
      {/* --------------------------------------------------------------- */}

      <div className="music-item__actions">
        {/* Play / Preview */}

        {hasAudio && (
          <button
            type="button"
            onClick={handlePlay}
            className={`music-item__play ${
              isPlaying
                ? "music-item__play--playing"
                : ""
            }`}
            aria-label={
              isPlaying
                ? `Pause ${title}`
                : `Play ${title}`
            }
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
        )}

        {/* External Provider Link */}

        {externalUrl && (
          <button
            type="button"
            onClick={
              handleOpenExternal
            }
            className="music-item__external"
            aria-label={`Open ${title} on ${providerLabel}`}
          >
            ↗
          </button>
        )}

        {/* Select / Use */}

        <button
          type="button"
          onClick={handleSelect}
          className={`music-item__select ${
            isSelected
              ? "music-item__select--selected"
              : ""
          }`}
          aria-label={
            isSelected
              ? `Selected ${title}`
              : `Use ${title}`
          }
          data-has-audio={
            hasAudio
          }
        >
          {isSelected
            ? "Selected"
            : "Use"}
        </button>
      </div>
    </div>
  );
};

export default MusicItem;