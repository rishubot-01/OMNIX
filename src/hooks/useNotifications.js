
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import notificationService from "../services/notification.service";

function useNotifications({
  autoFetch = true,
  pageSize = 20,
} = {}) {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [hasMore, setHasMore] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Extract Notifications
  |--------------------------------------------------------------------------
  */

  const extractNotifications = (
    response
  ) => {
    const responseData =
      response?.data ?? response;

    const data =
      responseData?.data ??
      responseData;

    const items =
      data?.notifications ??
      responseData?.notifications ??
      data;

    return Array.isArray(items)
      ? items
      : [];
  };

  /*
  |--------------------------------------------------------------------------
  | Extract Unread Count
  |--------------------------------------------------------------------------
  */

  const extractUnreadCount = (
    response
  ) => {
    const responseData =
      response?.data ?? response;

    return (
      responseData?.unreadCount ??
      responseData?.data?.unreadCount ??
      responseData?.data?.data?.unreadCount ??
      null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Notifications
  |--------------------------------------------------------------------------
  */

  const fetchNotifications =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * notification.service.js expects:
         *
         * getNotifications(page, limit)
         *
         * NOT an object.
         */
        const response =
          await notificationService.getNotifications(
            1,
            pageSize
          );

        const items =
          extractNotifications(response);

        setNotifications(items);
        setPage(1);

        /*
         * Update unread count if backend
         * provides it.
         */
        const unread =
          extractUnreadCount(response);

        if (unread !== null) {
          setUnreadCount(
            Math.max(
              0,
              Number(unread) || 0
            )
          );
        } else {
          /*
           * Fallback: calculate unread count
           * from loaded notifications.
           */
          const calculatedUnread =
            items.filter(
              (notification) =>
                !notification?.isRead &&
                !notification?.read
            ).length;

          setUnreadCount(
            calculatedUnread
          );
        }

        setHasMore(
          items.length >= pageSize
        );

        return response;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load notifications.";

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    }, [pageSize]);

  /*
  |--------------------------------------------------------------------------
  | Load More Notifications
  |--------------------------------------------------------------------------
  */

  const loadMore =
    useCallback(async () => {
      if (
        loadingMore ||
        loading ||
        !hasMore
      ) {
        return;
      }

      const nextPage =
        page + 1;

      setLoadingMore(true);
      setError(null);

      try {
        const response =
          await notificationService.getNotifications(
            nextPage,
            pageSize
          );

        const items =
          extractNotifications(response);

        /*
         * Avoid duplicate notification IDs.
         */
        setNotifications(
          (previous) => {
            const existingIds =
              new Set(
                previous.map(
                  (notification) =>
                    String(
                      notification?._id ||
                      notification?.id
                    )
                )
              );

            const newItems =
              items.filter(
                (notification) =>
                  !existingIds.has(
                    String(
                      notification?._id ||
                      notification?.id
                    )
                  )
              );

            return [
              ...previous,
              ...newItems,
            ];
          }
        );

        setPage(nextPage);

        setHasMore(
          items.length >= pageSize
        );

        return response;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load notifications.";

        setError(message);

        throw err;
      } finally {
        setLoadingMore(false);
      }
    }, [
      page,
      pageSize,
      loading,
      loadingMore,
      hasMore,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Mark One Notification As Read
  |--------------------------------------------------------------------------
  */

  const markAsRead =
    useCallback(
      async (notificationId) => {
        if (!notificationId) {
          return;
        }

        /*
         * Check current notification first
         * so unread count doesn't decrease
         * twice.
         */
        const currentNotification =
          notifications.find(
            (notification) =>
              String(
                notification?._id ||
                notification?.id
              ) ===
              String(notificationId)
          );

        const wasUnread =
          currentNotification &&
          !currentNotification.isRead &&
          !currentNotification.read;

        const response =
          await notificationService.markAsRead(
            notificationId
          );

        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                String(
                  notification?._id ||
                  notification?.id
                ) ===
                String(notificationId)
                  ? {
                      ...notification,
                      read: true,
                      isRead: true,
                    }
                  : notification
            )
        );

        if (wasUnread) {
          setUnreadCount(
            (count) =>
              Math.max(
                0,
                count - 1
              )
          );
        }

        return response;
      },
      [notifications]
    );

  /*
  |--------------------------------------------------------------------------
  | Mark All Notifications As Read
  |--------------------------------------------------------------------------
  */

  const markAllAsRead =
    useCallback(async () => {
      const response =
        await notificationService.markAllAsRead();

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
              isRead: true,
            })
          )
      );

      setUnreadCount(0);

      return response;
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Refresh Notifications
  |--------------------------------------------------------------------------
  */

  const refresh =
    useCallback(async () => {
      return fetchNotifications();
    }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Initial Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchNotifications().catch(
      () => {}
    );
  }, [
    autoFetch,
    fetchNotifications,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    notifications,
    unreadCount,

    page,
    hasMore,

    loading,
    loadingMore,
    error,

    fetchNotifications,
    refresh,
    loadMore,

    markAsRead,
    markAllAsRead,
  };
}

export default useNotifications;
