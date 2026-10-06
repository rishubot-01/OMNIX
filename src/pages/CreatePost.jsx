import { useState } from "react";
import CreatePostComponent from "../components/post/CreatePost";
import postService from "../services/post.service";
import { useAuth } from "../context/AuthContext";

function CreatePost() {
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const handleCreatePost = async ({
    content,
    file,
    audio,
    audioFile,
  }) => {
    try {
      setLoading(true);

      const response =
        await postService.createPost({
          content,
          file,
          audio,
          audioFile,
        });

      console.log(
        "Post created successfully:",
        response
      );

      alert("Post created successfully");
    } catch (error) {
      console.error(
        "Create post error:",
        error
      );

      alert(
        error?.message ||
          "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          Create Post
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Share something with the OMNIX community.
        </p>
      </div>

      <CreatePostComponent
        currentUser={user}
        onSubmit={handleCreatePost}
        loading={loading}
      />
    </div>
  );
}

export default CreatePost;