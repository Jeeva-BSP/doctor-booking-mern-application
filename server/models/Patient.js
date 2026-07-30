import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date_of_birth: { type: String, default: '' },
  gender: { type: String, default: 'Male' },
  medical_information: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
