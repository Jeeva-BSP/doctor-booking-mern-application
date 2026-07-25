import { query, queryOne, execute } from '../config/db.js';

export const getAllDoctors = async (req, res) => {
  try {
    const {
      search,
      specialization,
      location,
      state,
      minFee,
      maxFee,
      minExperience,
      minRating,
      day,
      sortBy
    } = req.query;

    let sql = `
      SELECT 
        d.doctor_id, d.user_id, d.qualifications, d.experience, d.hospital, 
        d.location, d.state, d.consultation_fee, d.about, d.languages, d.rating, d.verification_status,
        u.name as doctor_name, u.email, u.phone, u.profile_image,
        s.specialization_id, s.specialization_name, s.icon as specialization_icon
      FROM doctors d
      JOIN users u ON d.user_id = u.user_id
      JOIN specializations s ON d.specialization_id = s.specialization_id
      WHERE d.verification_status = 'approved'
    `;

    const params = [];

    // Search query (doctor name, hospital, specialization, location, or state)
    if (search && search.trim() !== '') {
      sql += ` AND (u.name LIKE ? OR d.hospital LIKE ? OR s.specialization_name LIKE ? OR d.location LIKE ? OR d.state LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    // Specialization filter
    if (specialization && specialization !== 'all') {
      if (!isNaN(specialization)) {
        sql += ` AND d.specialization_id = ?`;
        params.push(parseInt(specialization));
      } else {
        sql += ` AND s.specialization_name LIKE ?`;
        params.push(`%${specialization}%`);
      }
    }

    // Location/City/District filter
    if (location && location.trim() !== '' && location !== 'all') {
      sql += ` AND (d.location LIKE ? OR u.address LIKE ? OR d.state LIKE ?)`;
      const locTerm = `%${location.trim()}%`;
      params.push(locTerm, locTerm, locTerm);
    }

    // State filter
    if (state && state.trim() !== '' && state !== 'all') {
      sql += ` AND d.state LIKE ?`;
      params.push(`%${state.trim()}%`);
    }

    // Fee range filter
    if (minFee) {
      sql += ` AND d.consultation_fee >= ?`;
      params.push(parseFloat(minFee));
    }
    if (maxFee) {
      sql += ` AND d.consultation_fee <= ?`;
      params.push(parseFloat(maxFee));
    }

    // Experience filter
    if (minExperience) {
      sql += ` AND d.experience >= ?`;
      params.push(parseInt(minExperience));
    }

    // Rating filter
    if (minRating) {
      sql += ` AND d.rating >= ?`;
      params.push(parseFloat(minRating));
    }

    // Day availability filter
    if (day) {
      sql += ` AND d.doctor_id IN (SELECT doctor_id FROM doctor_availability WHERE day = ?)`;
      params.push(day);
    }

    // Sorting
    if (sortBy === 'rating') {
      sql += ` ORDER BY d.rating DESC`;
    } else if (sortBy === 'experience') {
      sql += ` ORDER BY d.experience DESC`;
    } else if (sortBy === 'fee_low') {
      sql += ` ORDER BY d.consultation_fee ASC`;
    } else if (sortBy === 'fee_high') {
      sql += ` ORDER BY d.consultation_fee DESC`;
    } else {
      sql += ` ORDER BY d.rating DESC, d.experience DESC`;
    }

    const doctors = query(sql, params);

    return res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching doctor list.', error: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = queryOne(
      `SELECT 
        d.doctor_id, d.user_id, d.qualifications, d.experience, d.hospital, 
        d.location, d.state, d.consultation_fee, d.about, d.languages, d.rating, d.verification_status,
        u.name as doctor_name, u.email, u.phone, u.profile_image, u.address,
        s.specialization_id, s.specialization_name, s.description as specialization_description, s.icon as specialization_icon
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE d.doctor_id = ?`,
      [id]
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Get doctor working availability
    const availability = query('SELECT * FROM doctor_availability WHERE doctor_id = ?', [id]);

    // Get doctor reviews with patient name and image
    const reviews = query(
      `SELECT 
        r.review_id, r.rating, r.comment, r.created_at,
        u.name as patient_name, u.profile_image as patient_image
       FROM reviews r
       JOIN patients p ON r.patient_id = p.patient_id
       JOIN users u ON p.user_id = u.user_id
       WHERE r.doctor_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      doctor: {
        ...doctor,
        availability,
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching doctor profile.', error: error.message });
  }
};

export const getSpecializations = async (req, res) => {
  try {
    const specializations = query(`
      SELECT 
        s.*, 
        COUNT(d.doctor_id) as doctor_count
      FROM specializations s
      LEFT JOIN doctors d ON s.specialization_id = d.specialization_id AND d.verification_status = 'approved'
      GROUP BY s.specialization_id
      ORDER BY s.specialization_name ASC
    `);

    return res.json({
      success: true,
      specializations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch specializations.' });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const doctor = queryOne('SELECT doctor_id FROM doctors WHERE user_id = ?', [userId]);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor record not found.' });
    }

    const { schedule } = req.body; // Array of { day, start_time, end_time, appointment_duration }

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ success: false, message: 'Schedule must be an array of daily availability.' });
    }

    // Delete existing availability
    execute('DELETE FROM doctor_availability WHERE doctor_id = ?', [doctor.doctor_id]);

    // Insert new schedule
    for (const item of schedule) {
      if (item.day && item.start_time && item.end_time) {
        execute(
          'INSERT INTO doctor_availability (doctor_id, day, start_time, end_time, appointment_duration) VALUES (?, ?, ?, ?, ?)',
          [doctor.doctor_id, item.day, item.start_time, item.end_time, item.appointment_duration || 30]
        );
      }
    }

    return res.json({ success: true, message: 'Availability schedule updated successfully!' });
  } catch (error) {
    console.error('Update Availability Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
};
