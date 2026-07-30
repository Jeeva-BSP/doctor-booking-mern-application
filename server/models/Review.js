import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
