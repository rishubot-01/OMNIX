// =========================================
// OMNIX - HELPERS
// =========================================


// Generate random ID
export const generateId = (length = 12) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(
        Math.random() * characters.length
      )
    );
  }

  return result;
};


// Debounce
export const debounce = (
  callback,
  delay = 300
) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};


// Throttle
export const throttle = (
  callback,
  delay = 300
) => {
  let lastCall = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
};


// Capitalize
export const capitalize = (value = "") => {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
};


// Convert to title case
export const titleCase = (value = "") => {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => capitalize(word))
    .join(" ");
};


// Truncate text
export const truncateText = (
  text = "",
  maxLength = 100
) => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
};


// Remove HTML
export const stripHtml = (html = "") => {
  const element =
    document.createElement("div");

  element.innerHTML = html;

  return element.textContent || "";
};


// Check empty value
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (
    typeof value === "object"
  ) {
    return Object.keys(value).length === 0;
  }

  return false;
};


// Sleep
export const sleep = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};


// Copy text
export const copyToClipboard = async (
  text
) => {
  if (!navigator?.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
};


// Check mobile device
export const isMobileDevice = () => {
  return window.innerWidth <= 768;
};


// Check online status
export const isOnline = () => {
  return navigator.onLine;
};


// Get initials
export const getInitials = (
  name = "",
  maxInitials = 2
) => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};


// Get avatar fallback
export const getAvatarFallback = (
  user = {}
) => {
  return (
    user.avatar ||
    user.profileImage ||
    user.profilePicture ||
    null
  );
};


// Scroll to top
export const scrollToTop = (
  behavior = "smooth"
) => {
  window.scrollTo({
    top: 0,
    behavior,
  });
};


// Scroll to element
export const scrollToElement = (
  id,
  behavior = "smooth"
) => {
  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior,
    block: "start",
  });
};


// Get URL query parameter
export const getQueryParam = (
  key
) => {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get(key);
};


// Build query string
export const buildQueryString = (
  params = {}
) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.append(
          key,
          value
        );
      }
    }
  );

  const query =
    searchParams.toString();

  return query ? `?${query}` : "";
};


// Shuffle array
export const shuffleArray = (
  array = []
) => {
  return [...array].sort(
    () => Math.random() - 0.5
  );
};


// Remove duplicate objects by ID
export const uniqueById = (
  items = []
) => {
  const map = new Map();

  items.forEach((item) => {
    if (item?.id) {
      map.set(item.id, item);
    }

    if (item?._id) {
      map.set(item._id, item);
    }
  });

  return Array.from(map.values());
};


// Merge arrays without duplicates
export const mergeUnique = (
  first = [],
  second = []
) => {
  return uniqueById([
    ...first,
    ...second,
  ]);
};


// Check if two IDs are equal
export const isSameId = (
  first,
  second
) => {
  if (!first || !second) {
    return false;
  }

  return String(first) === String(second);
};