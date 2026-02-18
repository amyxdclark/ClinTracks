import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import {
  Bell,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Check,
  Trash2,
} from 'lucide-react';

const typeConfig: Record<string, { icon: typeof Bell; bg: string; iconColor: string }> = {
  approval: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', iconColor: 'text-green-500' },
  rejection: { icon: XCircle, bg: 'bg-red-50 border-red-200', iconColor: 'text-red-500' },
  reminder: { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-500' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-500' },
};

const Notifications = () => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();

  const myNotifications = useMemo(
    () =>
      [...state.notifications]
        .filter(n => n.userId === state.activeProfileId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.notifications, state.activeProfileId],
  );

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  };

  const markAllAsRead = () => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.userId === prev.activeProfileId ? { ...n, read: true } : n,
      ),
    }));
  };

  const clearAll = () => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.userId !== prev.activeProfileId),
    }));
  };

  const handleClick = (id: string, linkTo?: string) => {
    markAsRead(id);
    if (linkTo) navigate(linkTo);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary-500" /> Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>
        {myNotifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <Check className="w-4 h-4" /> Mark All Read
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {myNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h3>
            <p className="text-gray-500">
              Notifications will appear here when your submissions are reviewed or important events occur.
            </p>
          </div>
        ) : (
          myNotifications.map(notif => {
            const config = typeConfig[notif.type] ?? typeConfig.info;
            const Icon = config.icon;
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif.id, notif.linkTo)}
                className={`w-full text-left border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                  notif.read ? 'bg-white border-gray-200' : `${config.bg} border shadow-sm`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${notif.read ? 'text-gray-400' : config.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-semibold text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm mt-0.5 ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notif.message}
                    </p>
                    {!notif.read && (
                      <span className="inline-block mt-2 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
