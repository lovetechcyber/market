import React, { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import axios from "axios";
import { Bell } from "lucide-react";

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    axios.get(`/api/notifications/${userId}`).then((res) => setNotifications(res.data));

    socket.on("new_notification", (notif) => {
      if (notif.userId === userId) {
        setNotifications((prev) => [notif, ...prev]);
      }
    });

    return () => socket.off("new_notification");
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    await axios.patch(`/api/notifications/user/${userId}/readAll`);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => setShowList(!showList)} className="relative">
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showList && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            <button
              onClick={markAllAsRead}
              className="text-blue-500 text-sm hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 text-sm ${
                    n.isRead ? "bg-gray-50" : "bg-blue-50"
                  } border-b`}
                >
                  {n.message}
                </div>
              ))
            ) : (
              <p className="p-3 text-gray-500 text-center text-sm">No notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
