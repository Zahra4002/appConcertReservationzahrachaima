
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  async function loadNotifications() {
    try {
      const { data } = await api.get("/admin/notifications");
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadNotifications();

    const timer = setInterval(loadNotifications, 10000);

    return () => clearInterval(timer);
  }, []);

  async function markRead(id) {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  }

  const unread = notifications.filter(n => !n.lu).length;

  function handleToggle() {
    setOpen(!open);
    if (!open) loadNotifications();
  }

  return (
    <div className="admin-notifications">

      {/* Icône de notification */}
      <button
        className="notification-button"
        onClick={handleToggle}
        title="Notifications"
      >
        <Bell size={24} />

        {unread > 0 && (
          <span className="notification-badge">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Menu déroulant */}
      {open && (
        <div className="notification-list">

          <div className="notification-header">
            <h3>Notifications</h3>
            <span className="notification-count">
              {unread} non lue(s)
            </span>
          </div>

          <div className="notification-items">

            {notifications.length > 0 ? (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={
                    n.lu
                      ? "notification read"
                      : "notification unread"
                  }
                >
                  <Link
                    to={n.lien || "/admin"}
                    onClick={() => {
                      markRead(n._id);
                      setOpen(false);
                    }}
                  >
                    <div className="notification-content">
                      <span className="notification-dot"></span>

                      <div>
                        <p>{n.message}</p>

                        <small>
                          {new Date(n.createdAt).toLocaleString("fr-FR")}
                        </small>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="no-notifications">
                Aucune notification.
              </p>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
