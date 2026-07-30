import mongoose from 'mongoose';

const doctorAvailabilitySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  day: { type: String, required: true }, // Monday, Tuesday, etc.
  start_time: { type: String, default: '09:00 AM' },
  end_time: { type: String, default: '05:00 PM' },
  slot_duration_minutes: { type: Number, default: 30 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
export default DoctorAvailability;
