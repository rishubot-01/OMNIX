import api from "./api";

/*
 * ==============================================
 * MUSIC PROVIDERS
 * ==============================================
 *
 * Active / supported providers:
 *
 * - Jamendo
 * - Epidemic Sound
 * - Spotify
 *
 * "all" is used only for searching across
 * all supported providers.
 *
 * YouTube is completely removed.
 */

const PROVIDERS = {
  ALL: "all",
  JAMENDO: "jamendo",
  EPIDEMIC: "epidemic",
  SPOTIFY: "spotify",
};

/*
 * ==============================================
 * SEARCH QUERY VALIDATION
 * ==============================================
 */

const validateSearchQuery = (query) => {
  if (
    query === undefined ||
    query === null ||
    String(query).trim() === ""
  ) {
    throw new Error("Music search query is required.");
  }

  return String(query).trim();
};

/*
 * ==============================================
 * NUMBER VALIDATION
 * ==============================================
 */

const validatePositiveNumber = (value, name) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1
  ) {
    throw new Error(
      `${name} must be a valid positive number.`
    );
  }

  return number;
};

/*
 * ==============================================
 * PROVIDER VALIDATION
 * ==============================================
 *
 * Supported:
 *
 * all
 * jamendo
 * epidemic
 * spotify
 *
 * "all" is valid for SEARCH.
 *
 * Specific provider is required when
 * selecting music.
 */

const validateProvider = (provider) => {
  const normalizedProvider = String(
    provider || PROVIDERS.ALL
  )
    .trim()
    .toLowerCase();

  if (
    normalizedProvider !== PROVIDERS.ALL &&
    normalizedProvider !== PROVIDERS.JAMENDO &&
    normalizedProvider !== PROVIDERS.EPIDEMIC &&
    normalizedProvider !== PROVIDERS.SPOTIFY
  ) {
    throw new Error(
      "Provider must be one of: all, jamendo, epidemic, spotify."
    );
  }

  return normalizedProvider;
};

/*
 * ==============================================
 * PROVIDER TRACK ID VALIDATION
 * ==============================================
 */

const validateProviderTrackId = (providerTrackId) => {
  if (
    providerTrackId === undefined ||
    providerTrackId === null ||
    String(providerTrackId).trim() === ""
  ) {
    throw new Error(
      "Provider track ID is required."
    );
  }

  return String(providerTrackId).trim();
};

/*
 * ==============================================
 * MUSIC SERVICE
 * ==============================================
 */

const musicService = {
  /**
   * Search music from:
   *
   * - Jamendo
   * - Epidemic Sound
   * - Spotify
   *
   * provider:
   *
   * - all
   * - jamendo
   * - epidemic
   * - spotify
   *
   * If provider is "all", backend handles
   * searching across the supported providers.
   */
  searchMusic: async (
    query,
    page = 1,
    limit = 20,
    provider = PROVIDERS.ALL
  ) => {
    /*
     * Validate search query
     */
    const searchQuery =
      validateSearchQuery(query);

    /*
     * Validate page
     */
    const validatedPage =
      validatePositiveNumber(
        page,
        "Page"
      ) || 1;

    /*
     * Validate limit
     */
    const validatedLimit =
      validatePositiveNumber(
        limit,
        "Limit"
      ) || 20;

    /*
     * Maximum backend-supported limit
     */
    if (validatedLimit > 50) {
      throw new Error(
        "Limit cannot exceed 50."
      );
    }

    /*
     * Validate provider
     */
    const validatedProvider =
      validateProvider(provider);

    /*
     * ==========================================
     * REQUEST PARAMS
     * ==========================================
     */

    const params = new URLSearchParams();

    params.set(
      "q",
      searchQuery
    );

    params.set(
      "page",
      String(validatedPage)
    );

    params.set(
      "limit",
      String(validatedLimit)
    );

    params.set(
      "provider",
      validatedProvider
    );

    /*
     * ==========================================
     * BACKEND REQUEST
     * ==========================================
     *
     * Backend route:
     *
     * GET /api/music/search
     */

    return api.get(
      `/music/search?${params.toString()}`
    );
  },

  /**
   * Select/save a music track.
   *
   * Specific provider is required.
   *
   * Supported:
   *
   * - jamendo
   * - epidemic
   * - spotify
   *
   * Default provider:
   * jamendo
   *
   * This keeps backward compatibility for
   * existing Jamendo selection calls.
   */
  selectMusic: async (
    providerTrackId,
    provider = PROVIDERS.JAMENDO
  ) => {
    /*
     * Validate provider track ID
     */
    const validatedTrackId =
      validateProviderTrackId(
        providerTrackId
      );

    /*
     * Validate provider
     */
    const validatedProvider =
      validateProvider(provider);

    /*
     * "all" cannot be used while selecting
     * a specific track.
     */
    if (
      validatedProvider === PROVIDERS.ALL
    ) {
      throw new Error(
        "A specific provider is required when selecting music."
      );
    }

    /*
     * ==========================================
     * BACKEND REQUEST
     * ==========================================
     *
     * Backend route:
     *
     * POST /api/music/select/:providerTrackId
     *
     * Provider is passed as query parameter.
     */

    return api.post(
      `/music/select/${encodeURIComponent(
        validatedTrackId
      )}?provider=${encodeURIComponent(
        validatedProvider
      )}`
    );
  },

  /**
   * Provider constants exposed for
   * frontend components.
   */
  PROVIDERS,
};

/*
 * ==============================================
 * EXPORT
 * ==============================================
 */

export default musicService;