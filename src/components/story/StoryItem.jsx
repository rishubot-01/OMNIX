import Avatar from "../common/Avatar";

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

function StoryItem({
  group,
  onClick,
  compact = false,
}) {
  if (!group) {
    return null;
  }

  const owner = group.owner;

  const stories = Array.isArray(group.stories)
    ? group.stories
    : [];

  const viewed =
    stories.length > 0 &&
    stories.every(
      (story) =>
        story?.viewed === true ||
        story?.isViewed === true
    );

  const ownerId =
    group.ownerId ||
    idOf(owner) ||
    idOf(stories[0]);

  const storyName = nameOf(owner);

  const avatarSize = compact
    ? "md"
    : "md";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-16 shrink-0 text-center"
      aria-label={`View ${storyName}'s story`}
      data-story-owner-id={
        ownerId || undefined
      }
    >
      <div
        className={`
          relative
          mx-auto
          flex
          w-fit
          items-center
          justify-center
          rounded-full
          p-[2px]
          ${
            viewed
              ? "bg-white"
              : "bg-black"
          }
        `}
      >
        <Avatar
          src={avatarOf(owner)}
          name={storyName}
          size={avatarSize}
          className="rounded-full border-2 border-white"
        />
      </div>

      <span
        className={`
          mt-1.5
          block
          truncate
          text-xs
          ${
            viewed
              ? "text-gray-400"
              : "font-semibold text-gray-800"
          }
        `}
      >
        {storyName}
      </span>
    </button>
  );
}

export default StoryItem;