import api from "./api";

const uploadService = {
  /*
  |--------------------------------------------------------------------------
  | Upload Media
  |--------------------------------------------------------------------------
  |
  | Backend:
  | POST /api/upload
  |
  | Field name:
  | file
  |
  | Backend response:
  | {
  |   success: true,
  |   url,
  |   publicId,
  |   resourceType
  | }
  |
  */

  uploadMedia: async (file) => {
    if (!file) {
      throw new Error("File is required.");
    }

    const formData = new FormData();

    formData.append("file", file);

    return api.post(
      "/upload",
      formData
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Upload Image
  |--------------------------------------------------------------------------
  |
  | Message attachments ke liye generic
  | media upload endpoint use hoga.
  |
  */

  uploadImage: async (file) => {
    if (!file) {
      throw new Error("Image file is required.");
    }

    const formData = new FormData();

    formData.append("file", file);

    return api.post(
      "/upload",
      formData
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Upload Avatar
  |--------------------------------------------------------------------------
  |
  | Backend:
  | POST /api/upload/avatar
  |
  | Field name:
  | avatar
  |
  */

  uploadAvatar: async (file) => {
    if (!file) {
      throw new Error("Avatar file is required.");
    }

    const formData = new FormData();

    formData.append(
      "avatar",
      file
    );

    return api.post(
      "/upload/avatar",
      formData
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Image
  |--------------------------------------------------------------------------
  |
  | Is endpoint ko backend routes mein
  | currently confirm nahi kiya gaya hai,
  | isliye existing function ko remove
  | nahi kar rahe hain.
  |
  */

  deleteImage: async (publicId) => {
    return api.delete(
      `/upload/image/${encodeURIComponent(
        publicId
      )}`
    );
  },
};

export default uploadService;