// =========================================
// OMNIX - VALIDATORS
// =========================================

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  FILE_LIMITS,
  VALIDATION,
} from "./constants";


// Email
export const isValidEmail = (email = "") => {
  const pattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return pattern.test(
    email.trim()
  );
};


// Username
export const isValidUsername = (
  username = ""
) => {
  const value = username.trim();

  if (
    value.length <
      VALIDATION.MIN_USERNAME_LENGTH ||
    value.length >
      VALIDATION.MAX_USERNAME_LENGTH
  ) {
    return false;
  }

  return /^[a-zA-Z0-9._]+$/.test(value);
};


// Password
export const isValidPassword = (
  password = ""
) => {
  return (
    password.length >=
      VALIDATION.MIN_PASSWORD_LENGTH &&
    password.length <=
      VALIDATION.MAX_PASSWORD_LENGTH
  );
};


// Strong password
export const isStrongPassword = (
  password = ""
) => {
  if (!isValidPassword(password)) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(
    password
  );

  const hasLowercase = /[a-z]/.test(
    password
  );

  const hasNumber = /\d/.test(password);

  const hasSpecialCharacter =
    /[!@#$%^&*(),.?":{}|<>]/.test(
      password
    );

  return (
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter
  );
};


// Confirm password
export const passwordsMatch = (
  password,
  confirmPassword
) => {
  return password === confirmPassword;
};


// Post caption
export const isValidCaption = (
  caption = ""
) => {
  return (
    caption.length <=
    VALIDATION.MAX_POST_CAPTION_LENGTH
  );
};


// Comment
export const isValidComment = (
  comment = ""
) => {
  const value = comment.trim();

  return (
    value.length > 0 &&
    value.length <=
      VALIDATION.MAX_COMMENT_LENGTH
  );
};


// Bio
export const isValidBio = (
  bio = ""
) => {
  return (
    bio.length <=
    VALIDATION.MAX_BIO_LENGTH
  );
};


// Image
export const isValidImage = (
  file
) => {
  if (!file) {
    return false;
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    return false;
  }

  if (
    file.size >
    FILE_LIMITS.MAX_IMAGE_SIZE
  ) {
    return false;
  }

  return true;
};


// Video
export const isValidVideo = (
  file
) => {
  if (!file) {
    return false;
  }

  if (
    !ALLOWED_VIDEO_TYPES.includes(
      file.type
    )
  ) {
    return false;
  }

  if (
    file.size >
    FILE_LIMITS.MAX_VIDEO_SIZE
  ) {
    return false;
  }

  return true;
};


// Generic media validator
export const isValidMedia = (
  file
) => {
  if (!file) {
    return false;
  }

  if (file.type.startsWith("image/")) {
    return isValidImage(file);
  }

  if (file.type.startsWith("video/")) {
    return isValidVideo(file);
  }

  return false;
};


// Required field
export const isRequired = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  return String(value).trim().length > 0;
};


// Login validation
export const validateLogin = ({
  email,
  password,
}) => {
  const errors = {};

  if (!isRequired(email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email =
      "Please enter a valid email";
  }

  if (!isRequired(password)) {
    errors.password =
      "Password is required";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};


// Register validation
export const validateRegister = ({
  fullName,
  username,
  email,
  password,
  confirmPassword,
}) => {
  const errors = {};

  if (!isRequired(fullName)) {
    errors.fullName = "Full name is required";
  }

  if (!isRequired(username)) {
    errors.username = "Username is required";
  } else if (!isValidUsername(username)) {
    errors.username =
      "Invalid username";
  }

  if (!isRequired(email) || !isValidEmail(email)) {
    errors.email =
      "Please enter a valid email";
  }

  if (!isRequired(password) || !isValidPassword(password)) {
    errors.password =
      `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`;
  }

  if (
    !passwordsMatch(
      password,
      confirmPassword
    )
  ) {
    errors.confirmPassword =
      "Passwords do not match";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};


// Post validation
export const validatePost = ({
  caption = "",
  media = null,
}) => {
  const errors = {};

  if (!media) {
    errors.media =
      "Please select an image or video";
  } else if (!isValidMedia(media)) {
    errors.media =
      "Invalid or oversized media file";
  }

  if (!isValidCaption(caption)) {
    errors.caption =
      `Caption cannot exceed ${VALIDATION.MAX_POST_CAPTION_LENGTH} characters`;
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};


// Comment validation
export const validateComment = (
  comment
) => {
  const errors = {};

  if (!isValidComment(comment)) {
    errors.comment =
      "Comment must contain 1-500 characters";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};
