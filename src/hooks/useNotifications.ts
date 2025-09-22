import { useState, useCallback } from "react";
import type {
  Notification,
  ToastNotificationData,
} from "../types/notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotificationData[]>([]);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add notification to center
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => {
      const newNotification: Notification = {
        ...notification,
        id: generateId(),
        timestamp: new Date(),
        isRead: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  // Add toast notification
  const addToast = useCallback((toast: Omit<ToastNotificationData, "id">) => {
    const newToast: ToastNotificationData = {
      ...toast,
      id: generateId(),
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Toggle notification center
  const toggleNotificationCenter = useCallback(() => {
    setNotificationCenterOpen((prev) => !prev);
  }, []);

  // Close notification center
  const closeNotificationCenter = useCallback(() => {
    setNotificationCenterOpen(false);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Helper methods for different notification types
  const showSuccess = useCallback(
    (
      title: string,
      message: string,
      options?: {
        duration?: number;
        position?: ToastNotificationData["position"];
      }
    ) => {
      addNotification({ type: "success", title, message });
      addToast({ type: "success", title, message, ...options });
    },
    [addNotification, addToast]
  );

  const showError = useCallback(
    (
      title: string,
      message: string,
      options?: {
        duration?: number;
        position?: ToastNotificationData["position"];
      }
    ) => {
      addNotification({ type: "error", title, message });
      addToast({ type: "error", title, message, ...options });
    },
    [addNotification, addToast]
  );

  const showWarning = useCallback(
    (
      title: string,
      message: string,
      options?: {
        duration?: number;
        position?: ToastNotificationData["position"];
      }
    ) => {
      addNotification({ type: "warning", title, message });
      addToast({ type: "warning", title, message, ...options });
    },
    [addNotification, addToast]
  );

  const showInfo = useCallback(
    (
      title: string,
      message: string,
      options?: {
        duration?: number;
        position?: ToastNotificationData["position"];
      }
    ) => {
      addNotification({ type: "info", title, message });
      addToast({ type: "info", title, message, ...options });
    },
    [addNotification, addToast]
  );

  return {
    // State
    notifications,
    toasts,
    notificationCenterOpen,
    unreadCount,

    // Actions
    addNotification,
    addToast,
    removeToast,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    clearAllToasts,
    toggleNotificationCenter,
    closeNotificationCenter,

    // Helper methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
