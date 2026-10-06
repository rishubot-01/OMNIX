import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import musicService from "../../../services/music.service";

/*
 * |--------------------------------------------------------------------------
 * | Music Provider
 * |--------------------------------------------------------------------------
 *
 * For the new Audio Picker design:
 *
 * - We do NOT show provider selection buttons.
 * - We do NOT show Spotify.
 * - We do NOT show quick search categories.
 *
 * The backend receives "all" and is responsible for returning:
 *
 * 5 Epidemic Sound tracks
 * 5 Jamendo tracks
 *
 * Total = 10 tracks
 */

const PROVIDER = "all";

/*
 * |--------------------------------------------------------------------------
 * | MusicSearch
 * |--------------------------------------------------------------------------
 *
 * Responsibilities:
 *
 * - Search music
 * - Debounce search
 * - Send request to backend
 * - Return results to MusicList
 * - Handle loading/error states
 *
 * Provider/category UI has intentionally been removed.
 */

const MusicSearch = ({
  onResults,
  onLoading,
  onError,
  initialQuery = "",
}) => {
  /*
   * |--------------------------------------------------------------------------
   * | State
   * |--------------------------------------------------------------------------
   */

  const [query, setQuery] = useState(
    initialQuery
  );

  /*
   * |--------------------------------------------------------------------------
   * | Request ID
   * |--------------------------------------------------------------------------
   *
   * Prevents an older request from overwriting
   * a newer search result.
   */

  const requestIdRef = useRef(0);

  /*
   * |--------------------------------------------------------------------------
   * | Search Music
   * |--------------------------------------------------------------------------
   */

  const searchMusic = useCallback(
    async (searchQuery) => {
      const trimmedQuery = String(
        searchQuery || ""
      ).trim();

      const requestId =
        ++requestIdRef.current;

      /*
       * |--------------------------------------------------------------------------
       * | Empty Search
       * |--------------------------------------------------------------------------
       */

      if (!trimmedQuery) {
        onResults?.([]);
        onLoading?.(false);
        onError?.("");

        return;
      }

      try {
        onLoading?.(true);
        onError?.("");

        /*
         * |--------------------------------------------------------------------------
         * | Backend Search
         * |--------------------------------------------------------------------------
         *
         * Provider:
         *   all
         *
         * Limit:
         *   10
         *
         * Expected backend result:
         *
         *   Epidemic Sound -> 5
         *   Jamendo        -> 5
         *
         * Total:
         *   10 tracks
         */

        const response =
          await musicService.searchMusic(
            trimmedQuery,
            1,
            10,
            PROVIDER
          );

        /*
         * |--------------------------------------------------------------------------
         * | Ignore Old Request
         * |--------------------------------------------------------------------------
         */

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        /*
         * |--------------------------------------------------------------------------
         * | Extract Tracks
         * |--------------------------------------------------------------------------
         */

        const tracks =
          Array.isArray(
            response?.data?.tracks
          )
            ? response.data.tracks
            : [];

        onResults?.(tracks);
      } catch (error) {
        /*
         * |--------------------------------------------------------------------------
         * | Ignore Old Request Error
         * |--------------------------------------------------------------------------
         */

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Music search error:",
          error
        );

        onResults?.([]);

        /*
         * |--------------------------------------------------------------------------
         * | Error Message
         * |--------------------------------------------------------------------------
         */

        onError?.(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to search music."
        );
      } finally {
        /*
         * |--------------------------------------------------------------------------
         * | Loading State
         * |--------------------------------------------------------------------------
         */

        if (
          requestId ===
          requestIdRef.current
        ) {
          onLoading?.(false);
        }
      }
    },
    [
      onResults,
      onLoading,
      onError,
    ]
  );

  /*
   * |--------------------------------------------------------------------------
   * | Debounced Search
   * |--------------------------------------------------------------------------
   *
   * Wait 400ms after the user stops typing
   * before calling the backend.
   */

  useEffect(() => {
    const trimmedQuery = String(
      query || ""
    ).trim();

    const timer = setTimeout(() => {
      searchMusic(trimmedQuery);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [
    query,
    searchMusic,
  ]);

  /*
   * |--------------------------------------------------------------------------
   * | Input Change
   * |--------------------------------------------------------------------------
   */

  const handleChange = (event) => {
    setQuery(
      event.target.value
    );
  };

  /*
   * |--------------------------------------------------------------------------
   * | Clear Search
   * |--------------------------------------------------------------------------
   */

  const handleClear = () => {
    /*
     * Cancel previous request
     */

    requestIdRef.current += 1;

    /*
     * Clear input
     */

    setQuery("");

    /*
     * Clear results
     */

    onResults?.([]);
    onLoading?.(false);
    onError?.("");
  };

  /*
   * |--------------------------------------------------------------------------
   * | Render
   * |--------------------------------------------------------------------------
   */

  return (
    <div className="music-search">

      {/* 
       * |--------------------------------------------------------------------------
       * | Search Input
       * |--------------------------------------------------------------------------
       */}

      <div className="music-search__input-wrapper">

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search music..."
          aria-label="Search music"
          className="music-search__input"
          autoComplete="off"
          spellCheck="false"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="music-search__clear"
            aria-label="Clear music search"
          >
            ×
          </button>
        )}

      </div>

    </div>
  );
};

export default MusicSearch;