import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
