import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialization', required: true },
  qualifications: { type: String, default: 'MBBS, MD' },
  experience: { type: Number, default: 5 },
  hospital: { type: String, default: 'Specialty Hospital' },
  location: { type: String, default: 'Chennai' },
  state: { type: String, default: 'Tamil Nadu' },
  consultation_fee: { type: Number, default: 650 },
  about: { type: String, default: '' },
  languages: { type: String, default: 'Tamil, English' },
  rating: { type: Number, default: 4.8 },
  verification_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
