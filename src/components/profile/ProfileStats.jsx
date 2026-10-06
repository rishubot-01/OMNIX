
function ProfileStats({
  user,
  postsCount,
  followersCount,
  followingCount,
  onPostsClick,
  onFollowersClick,
  onFollowingClick,
}) {
  /*
  |--------------------------------------------------------------------------
  | Posts Count
  |--------------------------------------------------------------------------
  */

  const posts =
    postsCount ??
    user?.postsCount ??
    user?.postCount ??
    user?.posts?.length ??
    0;

  /*
  |--------------------------------------------------------------------------
  | Followers Count
  |--------------------------------------------------------------------------
  */

  const followers =
    followersCount ??
    user?.followersCount ??
    user?.followers?.length ??
    0;

  /*
  |--------------------------------------------------------------------------
  | Following Count
  |--------------------------------------------------------------------------
  */

  const following =
    followingCount ??
    user?.followingCount ??
    user?.following?.length ??
    0;

  return (
    <div className="flex items-center gap-6">
      {/* Posts */}
      <Stat
        value={posts}
        label="Posts"
        onClick={onPostsClick}
      />

      {/* Followers */}
      <Stat
        value={followers}
        label="Followers"
        onClick={onFollowersClick}
      />

      {/* Following */}
      <Stat
        value={following}
        label="Following"
        onClick={onFollowingClick}
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Single Stat
|--------------------------------------------------------------------------
*/

function Stat({
  value,
  label,
  onClick,
}) {
  /*
   * When a click handler is provided,
   * render a button.
   *
   * This allows ProfileHeader to open
   * Followers / Following modal.
   */
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex flex-col items-center gap-0.5 transition"
        aria-label={`View ${label}`}
      >
        <span className="text-base font-bold text-gray-950 transition group-hover:opacity-60">
          {formatCount(value)}
        </span>

        <span className="text-xs text-gray-500 transition group-hover:text-gray-950">
          {label}
        </span>
      </button>
    );
  }

  /*
   * Non-clickable stat.
   */
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base font-bold text-gray-950">
        {formatCount(value)}
      </span>

      <span className="text-xs text-gray-500">
        {label}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Format Count
|--------------------------------------------------------------------------
|
| Examples:
|
| 0       → 0
| 25      → 25
| 999     → 999
| 1000    → 1.0K
| 1500    → 1.5K
| 1000000 → 1.0M
|
*/

function formatCount(number) {
  const value = Number(number) || 0;

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value;
}

export default ProfileStats;
