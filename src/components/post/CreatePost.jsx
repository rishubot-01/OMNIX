import { useEffect, useRef, useState } from "react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import AudioPicker from "../audio/AudioPicker";

function CreatePost({
currentUser,
onSubmit,
loading = false,
}) {
const fileInputRef = useRef(null);

const [content, setContent] = useState("");
const [file, setFile] = useState(null);
const [preview, setPreview] = useState("");
const [error, setError] = useState("");

const [audioConfig, setAudioConfig] =
useState(undefined);

const [audioFile, setAudioFile] =
useState(null);

const userName =
currentUser?.name ||
currentUser?.username ||
currentUser?.fullName ||
"User";

const avatar =
currentUser?.avatar ||
currentUser?.profileImage ||
currentUser?.profilePicture ||
"";

useEffect(() => {
if (!file) {
setPreview("");
return;
}


const objectUrl =
  URL.createObjectURL(file);

setPreview(objectUrl);

return () => {
  URL.revokeObjectURL(objectUrl);
};


}, [file]);

const handleFileChange = (event) => {
const selectedFile =
event.target.files?.[0];


if (!selectedFile) {
  return;
}

setError("");

const maxSize =
  50 * 1024 * 1024;

if (selectedFile.size > maxSize) {
  setError(
    "File size must be less than 50MB."
  );

  event.target.value = "";
  return;
}

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

if (
  !allowedTypes.includes(
    selectedFile.type
  )
) {
  setError(
    "Please select a valid image or video."
  );

  event.target.value = "";
  return;
}

setFile(selectedFile);


};

const removeFile = () => {
setFile(null);
setPreview("");


if (fileInputRef.current) {
  fileInputRef.current.value = "";
}


};

const handleAudioChange = (
config
) => {
setAudioConfig(config);
setError("");
};

const handleAudioFileChange = (
selectedAudioFile
) => {
setAudioFile(
selectedAudioFile || null
);
setError("");
};

const handleSubmit = async (event) => {
event.preventDefault();


if (!content.trim() && !file) {
  setError(
    "Write something or add a photo/video."
  );
  return;
}

setError("");

try {
  await onSubmit?.({
    content: content.trim(),
    file,
    audio: audioConfig,
    audioFile,
  });

  setContent("");
  setAudioConfig(undefined);
  setAudioFile(null);
  removeFile();
} catch (submitError) {
  setError(
    submitError?.message ||
      "Unable to create post."
  );
}

};

const isVideo =
file?.type?.startsWith("video/");

return ( <form
   onSubmit={handleSubmit}
   className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
 > <div className="flex items-start gap-3 p-4"> <Avatar
       src={avatar}
       name={userName}
       alt={userName}
       size="md"
     />


    <textarea
      value={content}
      onChange={(event) => {
        setContent(event.target.value);
        setError("");
      }}
      placeholder="What's happening on OMNIX?"
      rows={3}
      maxLength={5000}
      className="min-h-[80px] flex-1 resize-none border-none bg-transparent pt-1 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400"
    />
  </div>

  {preview && (
    <div className="relative mx-4 mb-4 overflow-hidden rounded-xl bg-gray-100">
      <button
        type="button"
        onClick={removeFile}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-lg text-white hover:bg-black"
        aria-label="Remove media"
      >
        ×
      </button>

      {isVideo ? (
        <video
          src={preview}
          controls
          className="max-h-[400px] w-full object-contain"
        />
      ) : (
        <img
          src={preview}
          alt="Post preview"
          className="max-h-[400px] w-full object-contain"
        />
      )}
    </div>
  )}

  {!preview && (
    <button
      type="button"
      onClick={() =>
        fileInputRef.current?.click()
      }
      className="mx-4 mb-4 flex min-h-[140px] w-[calc(100%-2rem)] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 text-center transition hover:border-gray-300 hover:bg-gray-100"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="mb-3 h-8 w-8 text-gray-400"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          strokeWidth="1.8"
        />

        <circle
          cx="8.5"
          cy="9"
          r="1.5"
          strokeWidth="1.8"
        />

        <path
          d="m21 15-5-5L5 20"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-sm font-semibold text-gray-600">
        Drag photos and videos here
      </span>

      <span className="mt-1 text-xs text-gray-400">
        or click to select from your device
      </span>
    </button>
  )}

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*,video/*"
    onChange={handleFileChange}
    className="hidden"
  />

  <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-gray-100">
    <AudioPicker
      onAudioChange={
        handleAudioChange
      }
      onAudioFileChange={
        handleAudioFileChange
    }
    />
  </div>

  {error && (
    <p className="px-4 pb-3 text-xs font-medium text-red-600">
      {error}
    </p>
  )}

  <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        className="flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
            strokeWidth="1.8"
          />

          <circle
            cx="8.5"
            cy="9"
            r="1.5"
            strokeWidth="1.8"
          />

          <path
            d="m21 15-5-5L5 20"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>

        Add media
      </button>
    </div>

    <Button
      type="submit"
      size="sm"
      loading={loading}
      disabled={
        loading ||
        (!content.trim() && !file)
      }
    >
      Post
    </Button>
  </div>

  <div className="px-4 pb-3 text-right text-[10px] text-gray-400">
    {content.length}/5000
  </div>
</form>

);
}

export default CreatePost;
