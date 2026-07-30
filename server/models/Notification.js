import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
