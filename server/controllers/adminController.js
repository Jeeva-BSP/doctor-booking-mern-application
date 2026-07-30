import { query, queryOne, execute } from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalPatients = queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'patient'").count;
    const totalDoctors = queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'doctor'").count;
    const approvedDoctors = queryOne("SELECT COUNT(*) as count FROM doctors WHERE verification_status = 'approved'").count;
    const pendingDoctors = queryOne("SELECT COUNT(*) as count FROM doctors WHERE verification_status = 'pending'").count;
    const totalAppointments = queryOne("SELECT COUNT(*) as count FROM appointments").count;
    const pendingAppointments = queryOne("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'").count;
    const completedAppointments = queryOne("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'").count;
    const totalSpecializations = queryOne("SELECT COUNT(*) as count FROM specializations").count;

    // Monthly appointment trend (grouped by status)
    const appointmentsByStatus = query(`
      SELECT status, COUNT(*) as count 
      FROM appointments 
      GROUP BY status
    `);

    // Top specializations by doctor count
    const topSpecializations = query(`
      SELECT s.specialization_name, COUNT(d.doctor_id) as doctor_count
      FROM specializations s
      LEFT JOIN doctors d ON s.specialization_id = d.specialization_id
      GROUP BY s.specialization_id
      ORDER BY doctor_count DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalSpecializations,
        appointmentsByStatus,
        topSpecializations
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching admin stats.' });
  }
};

export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = query(`
      SELECT 
        d.doctor_id, d.user_id, d.qualifications, d.experience, d.hospital, d.location, d.consultation_fee, d.about, d.verification_status,
        u.name as doctor_name, u.email, u.phone, u.profile_image, u.created_at,
        s.specialization_name
      FROM doctors d
      JOIN users u ON d.user_id = u.user_id
      JOIN specializations s ON d.specialization_id = s.specialization_id
      WHERE d.verification_status = 'pending'
      ORDER BY u.created_at DESC
    `);

    return res.json({ success: true, pendingDoctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pending doctor registrations.' });
  }
};

export const updateDoctorVerification = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const doctor = queryOne(
      'SELECT d.doctor_id, d.user_id, u.name as doctor_name FROM doctors d JOIN users u ON d.user_id = u.user_id WHERE d.doctor_id = ?',
      [doctorId]
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor record not found.' });
    }

    execute('UPDATE doctors SET verification_status = ? WHERE doctor_id = ?', [status, doctorId]);

    // Send Notification to Doctor User
    const title = status === 'approved' ? 'Doctor Registration Approved!' : 'Doctor Application Update';
    const message = status === 'approved' 
      ? 'Congratulations! Your doctor profile has been verified and approved. You are now listed publicly for patient bookings.'
      : 'Your doctor registration request has been reviewed and rejected by the platform administrator.';

    execute('INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)', [doctor.user_id, title, message]);

    return res.json({
      success: true,
      message: `Doctor status updated to ${status}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating doctor verification.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = query(`
      SELECT 
        u.user_id, u.name, u.email, u.phone, u.role, u.profile_image, u.created_at,
        p.patient_id,
        d.doctor_id, d.verification_status, s.specialization_name
      FROM users u
      LEFT JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN doctors d ON u.user_id = d.user_id
      LEFT JOIN specializations s ON d.specialization_id = s.specialization_id
      ORDER BY u.created_at DESC
    `);

    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
};

export const createSpecialization = async (req, res) => {
  try {
    const { specialization_name, description, icon } = req.body;
    if (!specialization_name) {
      return res.status(400).json({ success: false, message: 'Specialization name is required.' });
    }

    const result = execute(
      'INSERT INTO specializations (specialization_name, description, icon) VALUES (?, ?, ?)',
      [specialization_name, description || '', icon || 'Stethoscope']
    );

    return res.status(201).json({
      success: true,
      message: 'Specialization added successfully!',
      specialization_id: result.lastInsertRowid
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create specialization.' });
  }
};

export const deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    execute('DELETE FROM specializations WHERE specialization_id = ?', [id]);
    return res.json({ success: true, message: 'Specialization deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete specialization.' });
  }
};

export const exportDatabase = async (req, res) => {
  try {
    const tables = query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .map(t => t.name);

    const exportData = {};
    tables.forEach(table => {
      exportData[table] = query(`SELECT * FROM ${table}`);
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="book_a_doctor_full_database.json"');
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error('Database Export Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export database.' });
  }
};
