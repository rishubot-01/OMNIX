import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  /*
   * =========================================================
   * Sidebar
   * =========================================================
   */
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /*
   * =========================================================
   * Mobile sidebar
   * =========================================================
   */
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /*
   * =========================================================
   * Right sidebar
   * =========================================================
   */
  const [rightSidebarOpen, setRightSidebarOpen] =
    useState(true);

  /*
   * =========================================================
   * Search
   * =========================================================
   */
  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  /*
   * =========================================================
   * Global loading
   * =========================================================
   */
  const [globalLoading, setGlobalLoading] =
    useState(false);

  /*
   * =========================================================
   * Global notification count
   * =========================================================
   */
  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  /*
   * =========================================================
   * Modal
   * =========================================================
   */
  const [modal, setModal] =
    useState(null);

  /*
   * =========================================================
   * Appearance / Theme
   *
   * light  = Light mode
   * dark   = Dark mode
   * system = System preference
   * =========================================================
   */
  const [appearance, setAppearance] = useState(() => {
    try {
      const savedAppearance =
        localStorage.getItem("omnix-appearance");

      if (
        savedAppearance === "light" ||
        savedAppearance === "dark" ||
        savedAppearance === "system"
      ) {
        return savedAppearance;
      }

      return "light";
    } catch (error) {
      return "light";
    }
  });

  /*
   * =========================================================
   * Apply appearance to HTML document
   * =========================================================
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        "omnix-appearance",
        appearance
      );
    } catch (error) {
      console.error(
        "Unable to save appearance:",
        error
      );
    }

    const root =
      document.documentElement;

    /*
     * Remove previous theme
     */
    root.classList.remove(
      "light",
      "dark"
    );

    /*
     * Light mode
     */
    if (appearance === "light") {
      root.classList.add("light");
      return;
    }

    /*
     * Dark mode
     */
    if (appearance === "dark") {
      root.classList.add("dark");
      return;
    }

    /*
     * System mode
     */
    if (appearance === "system") {
      const systemPrefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      root.classList.add(
        systemPrefersDark
          ? "dark"
          : "light"
      );
    }
  }, [appearance]);

  /*
   * =========================================================
   * Change appearance
   * =========================================================
   */
  const changeAppearance =
    useCallback((mode) => {
      if (
        mode !== "light" &&
        mode !== "dark" &&
        mode !== "system"
      ) {
        return;
      }

      setAppearance(mode);
    }, []);

  /*
   * =========================================================
   * Sidebar functions
   * =========================================================
   */
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(
      (previous) => !previous
    );
  }, []);

  /*
   * =========================================================
   * Mobile sidebar
   * =========================================================
   */
  const openMobileSidebar =
    useCallback(() => {
      setMobileSidebarOpen(true);
    }, []);

  const closeMobileSidebar =
    useCallback(() => {
      setMobileSidebarOpen(false);
    }, []);

  const toggleMobileSidebar =
    useCallback(() => {
      setMobileSidebarOpen(
        (previous) => !previous
      );
    }, []);

  /*
   * =========================================================
   * Right sidebar
   * =========================================================
   */
  const toggleRightSidebar =
    useCallback(() => {
      setRightSidebarOpen(
        (previous) => !previous
      );
    }, []);

  /*
   * =========================================================
   * Search
   * =========================================================
   */
  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const updateSearchQuery =
    useCallback((query) => {
      setSearchQuery(query);
    }, []);

  /*
   * =========================================================
   * Global loading
   * =========================================================
   */
  const startLoading = useCallback(() => {
    setGlobalLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setGlobalLoading(false);
  }, []);

  /*
   * =========================================================
   * Notifications
   * =========================================================
   */
  const setNotificationCount =
    useCallback((count) => {
      setUnreadNotifications(
        Math.max(
          0,
          Number(count) || 0
        )
      );
    }, []);

  const incrementNotifications =
    useCallback((amount = 1) => {
      setUnreadNotifications(
        (previous) =>
          previous + amount
      );
    }, []);

  const decrementNotifications =
    useCallback((amount = 1) => {
      setUnreadNotifications(
        (previous) =>
          Math.max(
            0,
            previous - amount
          )
      );
    }, []);

  /*
   * =========================================================
   * Modal
   * =========================================================
   */
  const openModal = useCallback(
    ({
      type,
      title = "",
      data = null,
      onConfirm = null,
    }) => {
      setModal({
        type,
        title,
        data,
        onConfirm,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  /*
   * =========================================================
   * Context value
   * =========================================================
   */
  const value = useMemo(
    () => ({
      /*
       * Sidebar
       */
      sidebarOpen,
      setSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,

      /*
       * Mobile sidebar
       */
      mobileSidebarOpen,
      setMobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,

      /*
       * Right sidebar
       */
      rightSidebarOpen,
      setRightSidebarOpen,
      toggleRightSidebar,

      /*
       * Search
       */
      searchOpen,
      searchQuery,
      setSearchOpen,
      setSearchQuery,
      openSearch,
      closeSearch,
      updateSearchQuery,

      /*
       * Loading
       */
      globalLoading,
      setGlobalLoading,
      startLoading,
      stopLoading,

      /*
       * Notifications
       */
      unreadNotifications,
      setNotificationCount,
      incrementNotifications,
      decrementNotifications,

      /*
       * Modal
       */
      modal,
      openModal,
      closeModal,

      /*
       * Appearance
       */
      appearance,
      setAppearance,
      changeAppearance,
    }),
    [
      /*
       * Sidebar
       */
      sidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,

      /*
       * Mobile sidebar
       */
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,

      /*
       * Right sidebar
       */
      rightSidebarOpen,
      toggleRightSidebar,

      /*
       * Search
       */
      searchOpen,
      searchQuery,
      openSearch,
      closeSearch,
      updateSearchQuery,

      /*
       * Loading
       */
      globalLoading,
      startLoading,
      stopLoading,

      /*
       * Notifications
       */
      unreadNotifications,
      setNotificationCount,
      incrementNotifications,
      decrementNotifications,

      /*
       * Modal
       */
      modal,
      openModal,
      closeModal,

      /*
       * Appearance
       */
      appearance,
      changeAppearance,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/*
 * =========================================================
 * useApp Hook
 * =========================================================
 */
export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider."
    );
  }

  return context;
}

export default AppContext;