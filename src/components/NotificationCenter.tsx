import React, { useState, useEffect } from "react";
import "./NotificationCenter.css";
import type { Notification } from "../types/notifications";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  showSuccess?: (title: string, message: string) => void;
  showError?: (title: string, message: string) => void;
  showWarning?: (title: string, message: string) => void;
  showInfo?: (title: string, message: string) => void;
  isEditMode?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  isEditMode = false,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        );
      case "error":
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "warning":
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case "info":
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Notifications</h3>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={onMarkAllAsRead}>
                Mark all as read
              </button>
            )}
            <button className="clear-all-btn" onClick={onClearAll}>
              Clear all
            </button>
            <button className="close-btn" onClick={onClose}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Demo Notification Buttons - only visible in edit mode */}
        {isEditMode && showSuccess && showError && showWarning && showInfo && (
          <div className="demo-buttons-section">
            <h4>Test Notifications</h4>
            <div className="demo-buttons">
              <button
                onClick={() =>
                  showSuccess("Success!", "Operation completed successfully")
                }
                className="demo-btn demo-success"
              >
                <span>✅</span>
                Success
              </button>
              <button
                onClick={() => showError("Error!", "Something went wrong")}
                className="demo-btn demo-error"
              >
                <span>❌</span>
                Error
              </button>
              <button
                onClick={() =>
                  showWarning("Warning!", "Please check your input")
                }
                className="demo-btn demo-warning"
              >
                <span>⚠️</span>
                Warning
              </button>
              <button
                onClick={() =>
                  showInfo("Info", "Here is some useful information")
                }
                className="demo-btn demo-info"
              >
                <span>ℹ️</span>
                Info
              </button>
            </div>
          </div>
        )}

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.isRead ? "read" : "unread"
                }`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div
                  className="notification-icon"
                  style={{ color: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {formatTimestamp(notification.timestamp)}
                  </div>
                </div>
                {!notification.isRead && <div className="unread-indicator" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
