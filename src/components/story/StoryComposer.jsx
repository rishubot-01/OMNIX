import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import AudioPicker from "../audio/AudioPicker";

function StoryComposer({
  isOpen,
  uploading,
  onClose,
  onSubmit,
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const [audioConfig, setAudioConfig] =
    useState(undefined);

  const [audioFile, setAudioFile] =
    useState(null);

  /*
   * Create media preview.
   */
  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  /*
   * Reset composer whenever it is closed.
   */
  useEffect(() => {
    if (isOpen) {
      return;
    }

    setFile(null);
    setPreview("");
    setError("");
    setAudioConfig(undefined);
    setAudioFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [isOpen]);

  /*
   * Handle media selection.
   */
  const handleFile = (event) => {
    const selected =
      event.target.files?.[0];

    if (!selected) {
      return;
    }

    const isImage =
      selected.type.startsWith("image/");

    const isVideo =
      selected.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError(
        "Choose an image or video file."
      );

      event.target.value = "";
      return;
    }

    if (
      selected.size >
      50 * 1024 * 1024
    ) {
      setError(
        "Story media must be smaller than 50MB."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setFile(selected);
  };

  /*
   * Handle music/audio configuration.
   */
  const handleAudioChange = (config) => {
    setAudioConfig(config);
    setError("");
  };

  /*
   * Handle original audio file.
   */
  const handleAudioFileChange = (
    selectedAudioFile
  ) => {
    setAudioFile(
      selectedAudioFile || null
    );

    setError("");
  };

  /*
   * Remove selected media.
   */
  const removeMedia = () => {
    if (uploading) {
      return;
    }

    setFile(null);
    setPreview("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /*
   * Reset complete composer state.
   */
  const resetComposer = () => {
    setFile(null);
    setPreview("");
    setError("");
    setAudioConfig(undefined);
    setAudioFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /*
   * Close composer.
   */
  const handleClose = () => {
    if (uploading) {
      return;
    }

    resetComposer();
    onClose?.();
  };

  /*
   * Submit story.
   */
  const submit = async () => {
    if (!file) {
      setError(
        "Select a photo or video first."
      );
      return;
    }

    if (uploading) {
      return;
    }

    setError("");

    try {
      await onSubmit?.({
        file,
        audio: audioConfig,
        audioFile,
      });

      resetComposer();
      onClose?.();
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to upload story."
      );
    }
  };

  /*
   * Do not render when closed.
   */
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-20 flex items-end bg-black/60 p-0 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add story"
    >
      <div className="w-full max-h-[95vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Add to your story
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="text-2xl text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Stories disappear after 24 hours.
        </p>

        {/* Media preview */}
        {preview ? (
          <div className="relative mt-4 aspect-[9/14] overflow-hidden rounded-2xl bg-black">
            <button
              type="button"
              onClick={removeMedia}
              disabled={uploading}
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-black/60 text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Remove media"
            >
              ×
            </button>

            {file?.type.startsWith(
              "video/"
            ) ? (
              <video
                src={preview}
                controls
                playsInline
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt="Story preview"
                className="h-full w-full object-contain"
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={uploading}
            className="mt-4 flex h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Choose image or video

            <span className="mt-1 text-xs font-normal">
              Preview before posting
            </span>
          </button>
        )}

        {/* File input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
          disabled={uploading}
          className="hidden"
        />

        {/* Audio picker */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
          <AudioPicker
            onAudioChange={
              handleAudioChange
            }
            onAudioFileChange={
              handleAudioFileChange
            }
          />
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !file || uploading
            }
            onClick={submit}
            className="flex-1 rounded-xl bg-gray-950 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Posting..."
              : "Share story"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default StoryComposer;