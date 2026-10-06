import api from "./api";

/*
|--------------------------------------------------------------------------
| Story Service
|--------------------------------------------------------------------------
*/

const storyService = {
  /*
  |--------------------------------------------------------------------------
  | Get active stories
  |--------------------------------------------------------------------------
  */
  getStories: async () => {
    return api.get("/stories");
  },

  /*
  |--------------------------------------------------------------------------
  | Create story
  |--------------------------------------------------------------------------
  */
  createStory: async ({
    file,
    audio,
    audioFile,
  }) => {
    if (!file) {
      throw new Error(
        "Story file is required."
      );
    }

    const formData =
      new FormData();

    /*
     * Story image/video
     */
    formData.append(
      "file",
      file
    );

    /*
     * Optional audio configuration.
     *
     * AudioPicker configuration is sent
     * as JSON because the backend receives
     * the story media and audio settings
     * through multipart/form-data.
     */
    if (audio) {
      formData.append(
        "audioConfig",
        JSON.stringify(audio)
      );
    }

    /*
     * Optional original recorded audio.
     */
    if (audioFile) {
      formData.append(
        "audio",
        audioFile,
        audioFile.name ||
          "original-audio.webm"
      );
    }

    return api.post(
      "/stories",
      formData
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Mark story as viewed
  |--------------------------------------------------------------------------
  */
  markViewed: async (
    storyId
  ) => {
    if (
      storyId === undefined ||
      storyId === null ||
      String(storyId).trim() === ""
    ) {
      throw new Error(
        "Story ID is required."
      );
    }

    return api.post(
      `/stories/${encodeURIComponent(
        String(storyId)
      )}/view`
    );
  },
};

export default storyService;