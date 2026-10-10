
import { useCallback, useEffect, useMemo, useState } from "react";

import storyService from "../services/story.service";

const getId = (item) =>
  item?._id || item?.id;

const getExpiry = (story) =>
  story?.expiresAt ||
  story?.expires_at ||
  (story?.createdAt
    ? new Date(
        new Date(story.createdAt).getTime() +
          24 * 60 * 60 * 1000
      ).toISOString()
    : "");

const isActiveStory = (story) => {
  const expiry = getExpiry(story);

  return (
    !expiry ||
    new Date(expiry).getTime() > Date.now()
  );
};

const extractStories = (response) => {
  const firstData = response?.data ?? response;

  if (Array.isArray(firstData)) {
    return firstData.filter(isActiveStory);
  }

  if (Array.isArray(firstData?.stories)) {
    return firstData.stories.filter(isActiveStory);
  }

  if (Array.isArray(firstData?.data)) {
    return firstData.data.filter(isActiveStory);
  }

  if (Array.isArray(firstData?.data?.stories)) {
    return firstData.data.stories.filter(isActiveStory);
  }

  return [];
};

const extractCreatedStory = (response) => {
  const firstData = response?.data ?? response;

  if (getId(firstData)) {
    return firstData;
  }

  if (getId(firstData?.story)) {
    return firstData.story;
  }

  if (getId(firstData?.data)) {
    return firstData.data;
  }

  if (getId(firstData?.data?.story)) {
    return firstData.data.story;
  }

  if (getId(firstData?.data?.data)) {
    return firstData.data.data;
  }

  return null;
};

function useStories(currentUser) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await storyService.getStories();

      setStories(extractStories(response));
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to load stories."
      );

      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const createStory = useCallback(
    async ({ file, audio, audioFile }) => {
      setUploading(true);
      setError("");

      try {
        const response = await storyService.createStory({
          file,
          audio,
          audioFile,
        });

        let newStory = extractCreatedStory(response);

        if (!newStory || !getId(newStory)) {
          throw new Error("Story could not be created.");
        }

        if (
          !newStory.user &&
          !newStory.author &&
          !newStory.owner &&
          currentUser
        ) {
          newStory = {
            ...newStory,
            user: currentUser,
          };
        }

        // A newly created story must be treated as unseen
        // by other viewers until they view it.
        newStory = {
          ...newStory,
          viewed: false,
          isViewed: false,
        };

        setStories((previous) => {
          const filtered = previous.filter(
            (story) =>
              String(getId(story)) !==
              String(getId(newStory))
          );

          return [newStory, ...filtered].filter(isActiveStory);
        });

        return newStory;
      } catch (requestError) {
        const message =
          requestError?.message ||
          "Unable to upload story.";

        setError(message);

        throw new Error(message);
      } finally {
        setUploading(false);
      }
    },
    [currentUser]
  );

  const markViewed = useCallback(async (storyId) => {
    // Update immediately so the ring disappears without waiting
    // for the server response.
    setStories((previous) =>
      previous.map((story) =>
        String(getId(story)) === String(storyId)
          ? {
              ...story,
              viewed: true,
              isViewed: true,
            }
          : story
      )
    );

    try {
      await storyService.markViewed(storyId);
    } catch {
      // Keep the existing optimistic UI behavior.
    }
  }, []);

  const groups = useMemo(() => {
    const currentUserId = getId(currentUser);
    const grouped = new Map();

    stories.forEach((story) => {
      const owner =
        story.user ||
        story.author ||
        story.owner ||
        {};

      const ownerId =
        getId(owner) ||
        story.userId ||
        story.authorId;

      const normalizedOwnerId =
        ownerId ||
        (currentUserId
          ? currentUserId
          : getId(story));

      const normalizedOwner =
        ownerId ||
        !currentUserId ||
        String(ownerId) !== String(currentUserId)
          ? owner
          : currentUser;

      const key = String(normalizedOwnerId);

      const isCurrentUser =
        String(normalizedOwnerId) ===
        String(currentUserId);

      const existing = grouped.get(key);

      if (existing) {
        existing.stories.push(story);
      } else {
        grouped.set(key, {
          owner: normalizedOwner,
          ownerId: normalizedOwnerId,
          isCurrentUser,
          stories: [story],
        });
      }
    });

    return [...grouped.values()];
  }, [currentUser, stories]);

  return {
    groups,
    loading,
    uploading,
    error,
    loadStories,
    createStory,
    markViewed,
  };
}

export default useStories;
