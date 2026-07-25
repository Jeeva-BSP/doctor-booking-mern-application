import { query, queryOne, execute } from '../config/db.js';

export const toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    const { doctor_id } = req.body;

    const patient = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
    if (!patient) {
      return res.status(403).json({ success: false, message: 'Only patients can add favorite doctors.' });
    }

    const existing = queryOne(
      'SELECT favorite_id FROM favorites WHERE patient_id = ? AND doctor_id = ?',
      [patient.patient_id, doctor_id]
    );

    if (existing) {
      execute('DELETE FROM favorites WHERE favorite_id = ?', [existing.favorite_id]);
      return res.json({ success: true, isFavorite: false, message: 'Doctor removed from favorites.' });
    } else {
      execute('INSERT INTO favorites (patient_id, doctor_id) VALUES (?, ?)', [patient.patient_id, doctor_id]);
      return res.json({ success: true, isFavorite: true, message: 'Doctor added to favorites!' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle favorite status.' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = req.user;
    const patient = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
    if (!patient) {
      return res.status(403).json({ success: false, message: 'Only patients have favorites.' });
    }

    const favorites = query(
      `SELECT 
        f.favorite_id, f.created_at as favorited_at,
        d.doctor_id, d.qualifications, d.experience, d.hospital, d.location, d.consultation_fee, d.rating,
        u.name as doctor_name, u.profile_image, s.specialization_name
       FROM favorites f
       JOIN doctors d ON f.doctor_id = d.doctor_id
       JOIN users u ON d.user_id = u.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE f.patient_id = ?
       ORDER BY f.created_at DESC`,
      [patient.patient_id]
    );

    return res.json({ success: true, count: favorites.length, favorites });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch favorites.' });
  }
};
