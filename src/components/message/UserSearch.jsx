import React from "react";

const UserSearch = ({
  value = "",
  onChange,
  placeholder = "Search conversations...",
}) => {
  const handleClear = () => {
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className="user-search">
      {/* Search Icon */}
      <span className="user-search-icon">
        🔍
      </span>

      {/* Search Input */}
      <input
        type="text"
        className="user-search-input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label="Search users"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          className="user-search-clear"
          onClick={handleClear}
          title="Clear search"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default UserSearch;