import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const notifications = await Notification.find({ user: userId }).sort({ created_at: -1 });
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const formatted = notifications.map(n => ({
      notification_id: n._id,
      title: n.title,
      message: n.message,
      is_read: n.is_read ? 1 : 0,
      created_at: n.created_at
    }));

    return res.json({ success: true, count: formatted.length, unreadCount, notifications: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ user: userId }, { is_read: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id, user: userId }, { is_read: true });
    }

    return res.json({ success: true, message: 'Notification(s) marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};
