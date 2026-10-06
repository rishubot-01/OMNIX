import {
  useCallback,
  useRef,
  useState,
} from "react";

import Avatar from "../common/Avatar";
import Loader from "../common/Loader";
import StoryComposer from "./StoryComposer";
import StoryItem from "./StoryItem";
import StoryViewer from "./StoryViewer";

/*
Helpers
--------------------------------------------------------------------------
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

const groupIdOf = (group) =>
  group?.ownerId ||
  idOf(group?.owner) ||
  idOf(group?.stories?.[0]);

const isGroupViewed = (group) => {
  const stories = Array.isArray(
    group?.stories
  )
    ? group.stories
    : [];

  return (
    stories.length > 0 &&
    stories.every(
      (story) =>
        story?.viewed === true ||
        story?.isViewed === true
    )
  );
};

/*
Stories
--------------------------------------------------------------------------
*/

function Stories({
  currentUser,
  groups = [],
  loading,
  error,
  uploading,
  onCreate,
  onViewed,
  compact = false,
}) {
  /*
   * Which story group is currently open.
   */
  const [viewerIndex, setViewerIndex] =
    useState(null);

  /*
   * Exact group snapshot used by StoryViewer.
   *
   * IMPORTANT:
   *
   * When onViewed() marks a story as viewed,
   * the parent groups can change order.
   *
   * StoryViewer must NOT switch to that new
   * order while it is already playing.
   */
  const [viewerGroups, setViewerGroups] =
    useState(null);

  const [
    isComposerOpen,
    setIsComposerOpen,
  ] = useState(false);

  /*
   * Prevent duplicate viewed callbacks
   * for the same story.
   */
  const viewedCallRef =
    useRef(new Set());

  /*
   * Current user's own story group.
   */
  const ownGroup =
    groups.find(
      (group) =>
        group?.isCurrentUser === true
    );

  /*
   * Build display order.
   *
   * Your story is always first.
   *
   * Other users:
   * - unviewed first
   * - viewed later
   */
  const orderedGroups = [
    ...groups.filter(
      (group) =>
        group?.isCurrentUser === true
    ),

    ...groups
      .filter(
        (group) =>
          group?.isCurrentUser !== true
      )
      .sort((a, b) => {
        const aViewed =
          isGroupViewed(a);

        const bViewed =
          isGroupViewed(b);

        if (
          !aViewed &&
          bViewed
        ) {
          return -1;
        }

        if (
          aViewed &&
          !bViewed
        ) {
          return 1;
        }

        return 0;
      }),
  ];

  /*
   * Open story composer.
   */
  const openComposer = () => {
    if (uploading) {
      return;
    }

    setIsComposerOpen(true);
  };

  /*
   * Close story composer.
   */
  const closeComposer = () => {
    if (uploading) {
      return;
    }

    setIsComposerOpen(false);
  };

  /*
   * Create story.
   */
  const handleStoryCreate =
    async (storyData) => {
      try {
        await onCreate?.(
          storyData
        );

        setIsComposerOpen(false);
      } catch {
        throw new Error(
          "Unable to upload story."
        );
      }
    };

  /*
   * Handle viewed story.
   *
   * The same story can trigger this callback
   * more than once because StoryViewer can
   * re-render or React StrictMode can re-run
   * effects.
   *
   * We allow it only once.
   */
  const handleViewed = useCallback(
    (storyId) => {
      if (!storyId) {
        return;
      }

      const normalizedId =
        String(storyId);

      if (
        viewedCallRef.current.has(
          normalizedId
        )
      ) {
        return;
      }

      viewedCallRef.current.add(
        normalizedId
      );

      onViewed?.(storyId);
    },
    [onViewed]
  );

  /*
   * Open a story group.
   *
   * IMPORTANT:
   *
   * We create a snapshot BEFORE opening
   * StoryViewer.
   *
   * Example:
   *
   * Before:
   *
   *   A(unviewed)
   *   B(unviewed)
   *
   * User opens A.
   *
   * After A is marked viewed, parent may
   * reorder the live groups:
   *
   *   B(unviewed)
   *   A(viewed)
   *
   * But StoryViewer continues using:
   *
   *   A(unviewed)
   *   B(unviewed)
   *
   * until the viewer closes.
   */
  const openStory = (group) => {
    if (!group) {
      return;
    }

    const targetGroupId =
      groupIdOf(group);

    if (!targetGroupId) {
      return;
    }

    const index =
      orderedGroups.findIndex(
        (item) =>
          String(
            groupIdOf(item)
          ) ===
          String(targetGroupId)
      );

    if (index === -1) {
      return;
    }

    /*
     * Snapshot the current order.
     *
     * We intentionally create a new array
     * but do not deep clone the story objects.
     */
    const snapshot =
      [...orderedGroups];

    setViewerGroups(
      snapshot
    );

    setViewerIndex(index);
  };

  /*
   * Close viewer.
   */
  const closeViewer = () => {
    setViewerIndex(null);
    setViewerGroups(null);
  };

  /*
   * Own story button.
   */
  const handleOwnStoryClick =
    () => {
      if (ownGroup) {
        openStory(ownGroup);
        return;
      }

      openComposer();
    };

  return (
    <section
      className={
        compact
          ? "min-w-0 w-full"
          : "rounded-2xl border border-gray-100 bg-white p-4"
      }
      aria-label="Stories"
    >
      {!compact && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-950">
            Stories
          </h2>

          <span className="text-xs text-gray-400">
            24 hours
          </span>
        </div>
      )}

      <div
        className={`flex overflow-x-auto overflow-y-hidden scrollbar-hide ${
          compact
            ? "gap-5 py-1"
            : "gap-4 pb-1"
        }`}
      >
        {/*
         * YOUR STORY
         */}
        <button
          type="button"
          onClick={
            handleOwnStoryClick
          }
          disabled={uploading}
          className={`${
            compact
              ? "w-19"
              : "w-19"
          } shrink-0 text-center disabled:cursor-wait disabled:opacity-60`}
          aria-label={
            ownGroup
              ? "View your story"
              : "Add story"
          }
        >
          <div
            className={`relative mx-auto flex items-center justify-center rounded-full p-[3px] shadow-sm ${
              ownGroup
                ? "bg-black"
                : "bg-gray-200"
            }`}
          >
            <Avatar
              src={avatarOf(
                currentUser
              )}
              name={nameOf(
                currentUser
              )}
              size="md"
              className="rounded-full border-2 border-white"
            />

            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();

                openComposer();
              }}
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key ===
                    " "
                ) {
                  event.preventDefault();

                  event.stopPropagation();

                  openComposer();
                }
              }}
              className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black text-white shadow-sm"
              aria-label="Add another story"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                aria-hidden="true"
                className="h-3 w-3"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </div>

          <span className="mt-1.5 block truncate text-xs font-semibold text-gray-800">
            {uploading
              ? "Posting..."
              : "Your story"}
          </span>
        </button>

        {/*
         * OTHER STORIES
         */}
        {loading ? (
          <div className="flex h-16 flex-1 items-center justify-center">
            <Loader size="sm" />
          </div>
        ) : (
          orderedGroups.map(
            (group) => {
              if (
                group?.isCurrentUser
              ) {
                return null;
              }

              const ownerId =
                groupIdOf(group);

              /*
               * No random key.
               *
               * A random key causes React to treat
               * the StoryItem as a completely new
               * component on every render.
               */
              if (!ownerId) {
                return null;
              }

              return (
                <StoryItem
                  key={String(
                    ownerId
                  )}
                  group={group}
                  compact={compact}
                  onClick={() =>
                    openStory(group)
                  }
                />
              );
            }
          )
        )}

        {!compact &&
          !loading &&
          orderedGroups.length ===
            0 && (
            <p className="py-5 text-sm text-gray-400">
              No stories yet. Share the
              first one.
            </p>
          )}
      </div>

      {!compact && error && (
        <p className="mt-3 text-xs text-red-600">
          Stories: {error}
        </p>
      )}

      {/*
       * STORY COMPOSER
       */}
      <StoryComposer
        isOpen={isComposerOpen}
        uploading={uploading}
        onClose={closeComposer}
        onSubmit={
          handleStoryCreate
        }
      />

      {/*
       * STORY VIEWER
       *
       * viewerGroups is the snapshot captured
       * when the story was opened.
       *
       * It does NOT change when markViewed()
       * updates the live stories state.
       */}
      {viewerIndex !== null &&
        viewerGroups && (
          <StoryViewer
            groups={viewerGroups}
            activeGroup={
              viewerIndex
            }
            onClose={
              closeViewer
            }
            onViewed={
              handleViewed
            }
          />
        )}
    </section>
  );
}

export default Stories;