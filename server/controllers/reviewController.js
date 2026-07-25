import { query, queryOne, execute } from '../config/db.js';

export const createReview = async (req, res) => {
  try {
    const user = req.user;
    const { appointment_id, doctor_id, rating, comment } = req.body;

    if (!appointment_id || !doctor_id || !rating) {
      return res.status(400).json({ success: false, message: 'Appointment ID, Doctor ID, and rating (1-5) are required.' });
    }

    const patient = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
    if (!patient) {
      return res.status(403).json({ success: false, message: 'Only patients can leave reviews.' });
    }

    // Verify appointment status is 'Completed'
    const appointment = queryOne(
      'SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ? AND doctor_id = ?',
      [appointment_id, patient.patient_id, doctor_id]
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment record not found.' });
    }

    if (appointment.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed appointments.' });
    }

    // Check if review already exists for this appointment
    const existingReview = queryOne('SELECT review_id FROM reviews WHERE appointment_id = ?', [appointment_id]);
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this appointment.' });
    }

    // Insert Review
    execute(
      'INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [patient.patient_id, doctor_id, appointment_id, parseInt(rating), comment || '']
    );

    // Recalculate and update doctor's average rating in SQL
    const avgResult = queryOne('SELECT AVG(rating) as avg_rating FROM reviews WHERE doctor_id = ?', [doctor_id]);
    const newRating = avgResult && avgResult.avg_rating ? parseFloat(avgResult.avg_rating.toFixed(2)) : parseFloat(rating);

    execute('UPDATE doctors SET rating = ? WHERE doctor_id = ?', [newRating, doctor_id]);

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
