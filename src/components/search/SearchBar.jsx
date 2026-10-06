import { useEffect, useRef, useState } from "react";

function SearchBar({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search OMNIX",
  loading = false,
  autoFocus = false,
}) {
  const [query, setQuery] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (event) => {
    const newValue = event.target.value;

    setQuery(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    onSearch?.(trimmedQuery);
  };

  const clearSearch = () => {
    setQuery("");
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full"
    >
      {/* Search icon */}
      <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            strokeWidth="1.8"
          />

          <path
            d="m20 20-4-4"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-20 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
      />

      {/* Right controls */}
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {loading && (
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900"
            aria-label="Searching"
          />
        )}

        {!loading && query && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        {!loading && query.trim() && (
          <button
            type="submit"
            className="hidden h-8 rounded-full bg-gray-950 px-3 text-xs font-semibold text-white transition hover:bg-gray-800 sm:block"
          >
            Search
          </button>
        )}
      </div>
    </form>
  );
}

export default SearchBar;