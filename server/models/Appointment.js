import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment_date: { type: String, required: true },
  appointment_time: { type: String, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'], default: 'Pending' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
