// =========================================
// OMNIX - APPLICATION CONSTANTS
// =========================================


// API
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://omnix-bd.onrender.com/api"
    : "http://localhost:5000/api")
).replace(/\/+$/, "");

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
};


// Routes
export const ROUTES = {
  HOME: "/",
  EXPLORE: "/explore",
  CREATE: "/create",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  SAVED: "/saved",
  SETTINGS: "/settings",
  REPORT: "/report",

  USER_PROFILE: "/user/:username",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_POSTS: "/admin/posts",
  ADMIN_REPORTS: "/admin/reports",
};


// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  FEED_LIMIT: 10,
  EXPLORE_LIMIT: 12,
  COMMENTS_LIMIT: 20,
  USERS_LIMIT: 20,
};


// File Upload
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50 MB
};


// Allowed File Types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];


// Post Types
export const POST_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  TEXT: "text",
};


// Report Types
export const REPORT_TARGET_TYPES = {
  POST: "post",
  USER: "user",
  COMMENT: "comment",
};


// Report Reasons
export const REPORT_REASONS = {
  SPAM: "spam",
  HARASSMENT: "harassment",
  HATE_SPEECH: "hate_speech",
  VIOLENCE: "violence",
  NUDITY: "nudity",
  FALSE_INFORMATION: "false_information",
  SCAM: "scam",
  OTHER: "other",
};


// Report Status
export const REPORT_STATUS = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  RESOLVED: "resolved",
  REJECTED: "rejected",
};


// User Status
export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
};


// Notification Types
export const NOTIFICATION_TYPES = {
  LIKE: "like",
  COMMENT: "comment",
  FOLLOW: "follow",
  MENTION: "mention",
  SYSTEM: "system",
};


// Theme
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};


// Validation
export const VALIDATION = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,

  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,

  MIN_BIO_LENGTH: 0,
  MAX_BIO_LENGTH: 150,

  MAX_POST_CAPTION_LENGTH: 2200,
  MAX_COMMENT_LENGTH: 500,
};


// Debounce
export const DEBOUNCE = {
  SEARCH: 400,
  INPUT: 300,
};


// Application
export const APP = {
  NAME: "OMNIX",
  VERSION: "1.0.0",
};