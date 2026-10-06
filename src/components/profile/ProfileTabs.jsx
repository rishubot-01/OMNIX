function ProfileTabs({
  activeTab = "posts",
  onChange,
  isOwnProfile = false,
}) {
  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: "grid",
    },
    {
      id: "media",
      label: "Media",
      icon: "media",
    },
  ];

  if (isOwnProfile) {
    tabs.push({
      id: "saved",
      label: "Saved",
      icon: "bookmark",
    });
  }

  return (
    <div className="border-b border-gray-100">
      <div className="flex">
        {tabs.map((tab) => {
          const active =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                onChange?.(tab.id)
              }
              className={`
                relative flex flex-1 items-center
                justify-center gap-2 py-4
                text-xs font-semibold
                transition
                sm:flex-none sm:px-8
                ${
                  active
                    ? "text-gray-950"
                    : "text-gray-400 hover:text-gray-700"
                }
              `}
            >
              <TabIcon
                type={tab.icon}
                active={active}
              />

              <span>{tab.label}</span>

              {active && (
                <span className="absolute bottom-0 left-0 right-0 mx-auto h-0.5 w-10 rounded-full bg-gray-950" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabIcon({
  type,
  active,
}) {
  const className = `
    h-4 w-4
    ${active ? "text-gray-950" : "text-gray-400"}
  `;

  if (type === "bookmark") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        className={className}
      >
        <path
          d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "media") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          strokeWidth="1.7"
        />

        <circle
          cx="8.5"
          cy="9"
          r="1.3"
          strokeWidth="1.7"
        />

        <path
          d="m21 15-5-5L5 20"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        strokeWidth="1.7"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default ProfileTabs;