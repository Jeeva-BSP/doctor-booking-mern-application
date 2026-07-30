import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

export const createReview = async (req, res) => {
  try {
    const user = req.user;
    const { appointment_id, doctor_id, rating, comment } = req.body;

    if (!appointment_id || !doctor_id || !rating) {
      return res.status(400).json({ success: false, message: 'Appointment ID, Doctor ID, and rating (1-5) are required.' });
    }

    const appt = await Appointment.findById(appointment_id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment record not found.' });
    }

    if (appt.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed appointments.' });
    }

    const existing = await Review.findOne({ appointment: appointment_id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this appointment.' });
    }

    const rev = await Review.create({
      appointment: appointment_id,
      patient: user.user_id,
      doctor: doctor_id,
      rating: Number(rating),
      comment: comment || ''
    });

    const reviews = await Review.find({ doctor: doctor_id });
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const newRating = Number((sum / reviews.length).toFixed(1));

    await Doctor.findByIdAndUpdate(doctor_id, { rating: newRating });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review posted successfully.',
      newDoctorRating: newRating
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    return res.status(500).json({ success: false, message: 'Server error posting review.' });
  }
};
