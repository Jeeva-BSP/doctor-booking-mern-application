import { query, execute } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const notifications = query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const unreadCount = notifications.filter(n => n.is_read === 0).length;

    return res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    if (id === 'all') {
      execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      execute('UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?', [id, userId]);
    }

    return res.json({ success: true, message: 'Notification(s) marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};
