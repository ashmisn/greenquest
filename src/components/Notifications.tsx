import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();

  // --- THIS IS THE CORRECTED useEffect HOOK ---
  useEffect(() => {
    // Don't run if the user is not logged in
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationAPI.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

  }, [token]); // <-- The dependency array ONLY contains 'token'. This is correct.

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        await notificationAPI.markNotificationsAsRead();
        // Update the UI instantly without needing to refetch
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  return (
    <div className="relative">
      <button onClick={handleToggle} className="relative p-2">
        <Bell className="w-6 h-6 text-gray-600 hover:text-green-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-10">
          <div className="p-4 font-bold border-b">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n._id} className={`p-4 border-b text-sm ${!n.isRead ? 'bg-green-50' : ''}`}>
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;