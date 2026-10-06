// =========================================
// OMNIX - FORMATTERS
// =========================================


// Format number
export const formatNumber = (number = 0) => {
  const value = Number(number);

  if (Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(value);
};


// Compact number
// 1000 -> 1K
// 1000000 -> 1M
export const formatCompactNumber = (number = 0) => {
  const value = Number(number);

  if (Number.isNaN(value)) {
    return "0";
  }

  if (value < 1000) {
    return String(value);
  }

  if (value < 1000000) {
    return `${(value / 1000).toFixed(
      value >= 10000 ? 0 : 1
    )}K`;
  }

  if (value < 1000000000) {
    return `${(value / 1000000).toFixed(
      value >= 10000000 ? 0 : 1
    )}M`;
  }

  return `${(value / 1000000000).toFixed(1)}B`;
};


// Format followers
export const formatFollowers = (count = 0) => {
  return `${formatCompactNumber(count)} ${
    Number(count) === 1 ? "follower" : "followers"
  }`;
};


// Format likes
export const formatLikes = (count = 0) => {
  return `${formatCompactNumber(count)} ${
    Number(count) === 1 ? "like" : "likes"
  }`;
};


// Format comments
export const formatComments = (count = 0) => {
  return `${formatCompactNumber(count)} ${
    Number(count) === 1 ? "comment" : "comments"
  }`;
};


// Format date
export const formatDate = (
  date,
  options = {}
) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    }
  ).format(parsedDate);
};


// Format date and time
export const formatDateTime = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};


// Relative time
export const formatRelativeTime = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const now = new Date();
  const difference =
    now.getTime() - parsedDate.getTime();

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(date);
};


// Format username
export const formatUsername = (username = "") => {
  return username
    .trim()
    .replace(/^@/, "");
};


// Add @ to username
export const formatMention = (username = "") => {
  const cleanUsername = formatUsername(username);

  return cleanUsername
    ? `@${cleanUsername}`
    : "";
};


// Format file size
export const formatFileSize = (bytes = 0) => {
  if (!bytes || bytes < 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const size =
    bytes / Math.pow(1024, index);

  return `${size.toFixed(
    index === 0 ? 0 : 2
  )} ${units[index] || "GB"}`;
};


// Format duration
export const formatDuration = (seconds = 0) => {
  const totalSeconds = Math.max(
    0,
    Math.floor(Number(seconds))
  );

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(
    2,
    "0"
  )}`;
};