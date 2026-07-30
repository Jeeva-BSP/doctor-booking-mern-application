import mongoose from 'mongoose';

const specializationSchema = new mongoose.Schema({
  specialization_name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Stethoscope' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Specialization = mongoose.model('Specialization', specializationSchema);
export default Specialization;
