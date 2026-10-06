import MusicItem from "./MusicItem";

/*
 * |--------------------------------------------------------------------------
 * | MusicList
 * |--------------------------------------------------------------------------
 *
 * Current Audio Picker layout:
 *
 * ---------------------------------------------------------
 * | Epidemic Sound        | Jamendo                       |
 * |-----------------------|-------------------------------|
 * | Song 1                | Song 1                        |
 * | Song 2                | Song 2                        |
 * | Song 3                | Song 3                        |
 * | Song 4                | Song 4                        |
 * | Song 5                | Song 5                        |
 * ---------------------------------------------------------
 *
 * Backend is expected to return:
 *
 * - 5 Epidemic Sound tracks
 * - 5 Jamendo tracks
 *
 * Total = 10 tracks
 */

const MusicList = ({
  tracks = [],
  selectedMusic = null,
  onSelect,
  isLoading = false,
}) => {
  /*
   * |--------------------------------------------------------------------------
   * | Create Unique Track ID
   * |--------------------------------------------------------------------------
   *
   * providerTrackId can be the same between providers.
   *
   * Example:
   *
   * epidemic-12345
   * jamendo-12345
   */

  const getTrackId = (
    track,
    index
  ) => {
    const provider = String(
      track?.provider || "unknown"
    ).toLowerCase();

    const providerTrackId =
      track?.providerTrackId ||
      track?.id;

    if (providerTrackId) {
      return `${provider}-${providerTrackId}`;
    }

    return `music-track-${index}`;
  };

  /*
   * |--------------------------------------------------------------------------
   * | Check Selected Track
   * |--------------------------------------------------------------------------
   *
   * Provider + providerTrackId are used together.
   */

  const isTrackSelected = (
    track
  ) => {
    if (
      !track ||
      !selectedMusic
    ) {
      return false;
    }

    const trackProvider =
      String(
        track?.provider || ""
      ).toLowerCase();

    const selectedProvider =
      String(
        selectedMusic?.provider || ""
      ).toLowerCase();

    const trackProviderTrackId =
      track?.providerTrackId ||
      track?.id;

    const selectedProviderTrackId =
      selectedMusic?.providerTrackId ||
      selectedMusic?.id;

    /*
     * Provider-aware comparison
     */

    if (
      trackProvider &&
      selectedProvider &&
      trackProviderTrackId &&
      selectedProviderTrackId
    ) {
      return (
        trackProvider ===
          selectedProvider &&
        String(
          trackProviderTrackId
        ) ===
          String(
            selectedProviderTrackId
          )
      );
    }

    /*
     * Backward compatibility
     */

    return (
      String(
        trackProviderTrackId || ""
      ) ===
      String(
        selectedProviderTrackId || ""
      )
    );
  };

  /*
   * |--------------------------------------------------------------------------
   * | Remove Invalid Tracks
   * |--------------------------------------------------------------------------
   */

  const validTracks =
    Array.isArray(tracks)
      ? tracks.filter(
          (track) =>
            track &&
            typeof track ===
              "object"
        )
      : [];

  /*
   * |--------------------------------------------------------------------------
   * | Separate Providers
   * |--------------------------------------------------------------------------
   *
   * Only Epidemic Sound and Jamendo
   * are shown in the new UI.
   */

  const epidemicTracks =
    validTracks
      .filter((track) => {
        const provider =
          String(
            track?.provider || ""
          ).toLowerCase();

        return (
          provider ===
            "epidemic" ||
          provider ===
            "epidemic sound" ||
          provider ===
            "epidemicsound"
        );
      })
      .slice(0, 5);

  const jamendoTracks =
    validTracks
      .filter((track) => {
        const provider =
          String(
            track?.provider || ""
          ).toLowerCase();

        return (
          provider ===
          "jamendo"
        );
      })
      .slice(0, 5);

  /*
   * |--------------------------------------------------------------------------
   * | No Results
   * |--------------------------------------------------------------------------
   *
   * Show "No music found" only when:
   *
   * - Search has finished
   * - Epidemic has no tracks
   * - Jamendo has no tracks
   */

  const hasResults =
    epidemicTracks.length > 0 ||
    jamendoTracks.length > 0;

  /*
   * |--------------------------------------------------------------------------
   * | Render Track
   * |--------------------------------------------------------------------------
   */

  const renderTrack = (
    track,
    index,
    provider
  ) => {
    return (
      <MusicItem
        key={getTrackId(
          track,
          `${provider}-${index}`
        )}
        music={track}
        isSelected={isTrackSelected(
          track
        )}
        onSelect={onSelect}
      />
    );
  };

  /*
   * |--------------------------------------------------------------------------
   * | Render
   * |--------------------------------------------------------------------------
   */

  return (
    <div
      className="music-list"
      style={{
        position: "relative",
        minHeight: hasResults
          ? "0"
          : "48px",
      }}
    >

      {/* 
       * |--------------------------------------------------------------------------
       * | Search Results
       * |--------------------------------------------------------------------------
       */}

      {hasResults && (
        <div className="music-list__providers">

          {/* 
           * ================================================================
           * | EPIDEMIC SOUND
           * ================================================================
           */}

          <section className="music-list__provider music-list__provider--epidemic">

            <div className="music-list__provider-header">

              <h3 className="music-list__provider-title">
                Epidemic Sound
              </h3>

            </div>

            <div className="music-list__items">

              {epidemicTracks.map(
                (
                  track,
                  index
                ) =>
                  renderTrack(
                    track,
                    index,
                    "epidemic"
                  )
              )}

            </div>

          </section>

          {/* 
           * ================================================================
           * | JAMENDO
           * ================================================================
           */}

          <section className="music-list__provider music-list__provider--jamendo">

            <div className="music-list__provider-header">

              <h3 className="music-list__provider-title">
                Jamendo
              </h3>

            </div>

            <div className="music-list__items">

              {jamendoTracks.map(
                (
                  track,
                  index
                ) =>
                  renderTrack(
                    track,
                    index,
                    "jamendo"
                  )
              )}

            </div>

          </section>

        </div>
      )}

      {/* 
       * |--------------------------------------------------------------------------
       * | No Music Found
       * |--------------------------------------------------------------------------
       */}

      {!isLoading &&
        !hasResults && (
          <div className="music-list__empty">
            No music found.
          </div>
        )}

      {/* 
       * |--------------------------------------------------------------------------
       * | Loading
       * |--------------------------------------------------------------------------
       */}

      {isLoading && (
        <div
          className="music-list__loading"
          aria-live="polite"
        >
          Searching music...
        </div>
      )}

    </div>
  );
};

export default MusicList;