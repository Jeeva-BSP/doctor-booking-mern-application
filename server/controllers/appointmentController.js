import { query, queryOne, execute } from '../config/db.js';

/**
 * Generate 24h formatted time slots (e.g., "09:00", "09:30")
 */
function generateTimeSlots(startTimeStr, endTimeStr, durationMinutes = 30) {
  const slots = [];
  const [startHour, startMin] = startTimeStr.split(':').map(Number);
  const [endHour, endMin] = endTimeStr.split(':').map(Number);

  let currentMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  while (currentMin + durationMinutes <= endTotalMin) {
    const hh = String(Math.floor(currentMin / 60)).padStart(2, '0');
    const mm = String(currentMin % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    currentMin += durationMinutes;
  }

  return slots;
}

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Doctor ID and date are required.' });
    }

    // Convert date string to day of week name (e.g., 'Monday')
    const dateObj = new Date(date + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dateObj.getDay()];

    // Get doctor availability rule for that day
    const availability = queryOne(
      'SELECT * FROM doctor_availability WHERE doctor_id = ? AND day = ?',
      [parseInt(doctorId), dayName]
    );

    if (!availability) {
      return res.json({
        success: true,
        day: dayName,
        available: false,
        message: `Doctor does not work on ${dayName}s.`,
        slots: []
      });
    }

    // Generate total possible time slots
    const allSlots = generateTimeSlots(availability.start_time, availability.end_time, availability.appointment_duration || 30);

    // Fetch already booked slots for this doctor on this date (not cancelled or rejected)
    const bookedAppointments = query(
      `SELECT appointment_time FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('Cancelled', 'Rejected')`,
      [parseInt(doctorId), date]
    );

    const bookedTimes = new Set(bookedAppointments.map(a => a.appointment_time));

    // Current date and time check to prevent booking past hours if date is today
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const slots = allSlots.map(time => {
      let isPast = false;
      if (date === todayStr && time <= currentHHMM) {
        isPast = true;
      }
      return {
        time,
        isBooked: bookedTimes.has(time) || isPast,
        isPast
      };
    });

    return res.json({
      success: true,
      day: dayName,
      available: true,
      slots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return res.status(500).json({ success: false, message: 'Error fetching available slots.', error: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const user = req.user;
    const { doctor_id, appointment_date, appointment_time, reason } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time are required.' });
    }

    // Get patient record
    const patient = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
    if (!patient) {
      return res.status(403).json({ success: false, message: 'Only registered patients can book appointments.' });
    }

    // 1. Prevent booking past dates
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointment_date < todayStr) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments for past dates.' });
    }

    // 2. Check if doctor exists and is approved
    const doctor = queryOne(
      `SELECT d.doctor_id, d.user_id, u.name as doctor_name 
       FROM doctors d 
       JOIN users u ON d.user_id = u.user_id 
       WHERE d.doctor_id = ? AND d.verification_status = 'approved'`,
      [doctor_id]
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Selected doctor is not available or approved.' });
    }

    // 3. Double-Booking Check: Doctor slot conflict
    const existingDoctorSlot = queryOne(
      `SELECT appointment_id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status NOT IN ('Cancelled', 'Rejected')`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (existingDoctorSlot) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for this doctor. Please choose another slot.'
      });
    }

    // 4. Double-Booking Check: Patient double booking conflict
    const existingPatientSlot = queryOne(
      `SELECT appointment_id FROM appointments 
       WHERE patient_id = ? AND appointment_date = ? AND appointment_time = ? AND status NOT IN ('Cancelled', 'Rejected')`,
      [patient.patient_id, appointment_date, appointment_time]
    );

    if (existingPatientSlot) {
      return res.status(400).json({
        success: false,
        message: 'You already have another appointment booked at this exact date and time.'
      });
    }

    // 5. Create Appointment in SQL
    const apptRes = execute(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [patient.patient_id, doctor_id, appointment_date, appointment_time, reason || 'General Consultation']
    );

    // Notify Patient
    execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [user.user_id, 'Appointment Requested', `Your appointment request with ${doctor.doctor_name} for ${appointment_date} at ${appointment_time} is pending confirmation.`]
    );

    // Notify Doctor
    execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [doctor.user_id, 'New Appointment Request', `Patient ${user.name} has requested an appointment on ${appointment_date} at ${appointment_time}.`]
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment_id: apptRes.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ success: false, message: 'Server error booking appointment.', error: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;

    let sql = `
      SELECT 
        a.appointment_id, a.appointment_date, a.appointment_time, a.reason, a.status, a.created_at,
        p.patient_id, pu.name as patient_name, pu.email as patient_email, pu.phone as patient_phone, pu.profile_image as patient_image, p.gender, p.date_of_birth, p.medical_information,
        d.doctor_id, du.name as doctor_name, du.email as doctor_email, du.phone as doctor_phone, du.profile_image as doctor_image,
        d.hospital, d.location, d.consultation_fee, s.specialization_name,
        r.review_id, r.rating, r.comment
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users pu ON p.user_id = pu.user_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN users du ON d.user_id = du.user_id
      JOIN specializations s ON d.specialization_id = s.specialization_id
      LEFT JOIN reviews r ON a.appointment_id = r.appointment_id
      WHERE 1=1
    `;

    const params = [];

    if (user.role === 'patient') {
      sql += ` AND p.user_id = ?`;
      params.push(user.user_id);
    } else if (user.role === 'doctor') {
      sql += ` AND d.user_id = ?`;
      params.push(user.user_id);
    } // Admin sees all appointments!

    if (status && status !== 'all') {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC`;

    const appointments = query(sql, params);

    return res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching appointments.' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Confirmed', 'Rejected', 'Completed', 'Cancelled'

    if (!['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const appt = queryOne(
      `SELECT a.*, pu.user_id as patient_user_id, du.name as doctor_name, pu.name as patient_name 
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN users pu ON p.user_id = pu.user_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN users du ON d.user_id = du.user_id
       WHERE a.appointment_id = ?`,
      [id]
    );

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    execute('UPDATE appointments SET status = ? WHERE appointment_id = ?', [status, id]);

    // Send Notification to Patient
    let title = `Appointment ${status}`;
    let message = `Your appointment with ${appt.doctor_name} for ${appt.appointment_date} at ${appt.appointment_time} has been updated to: ${status}.`;

    if (status === 'Confirmed') {
      message = `Great news! ${appt.doctor_name} has confirmed your appointment on ${appt.appointment_date} at ${appt.appointment_time}.`;
    } else if (status === 'Completed') {
      message = `Your consultation with ${appt.doctor_name} is marked as completed. Please feel free to leave a review!`;
    } else if (status === 'Rejected') {
      message = `Unfortunately, ${appt.doctor_name} was unable to accept your appointment for ${appt.appointment_date}. Please choose another time slot.`;
    }

    execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [appt.patient_user_id, title, message]
    );

    return res.json({
      success: true,
      message: `Appointment status updated to ${status}.`
    });
  } catch (error) {
    console.error('Update Appt Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date, new_time } = req.body;

    if (!new_date || !new_time) {
      return res.status(400).json({ success: false, message: 'New date and time are required.' });
    }

    const appt = queryOne('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Double Booking Check
    const conflict = queryOne(
      `SELECT appointment_id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND appointment_id != ? AND status NOT IN ('Cancelled', 'Rejected')`,
      [appt.doctor_id, new_date, new_time, id]
    );

    if (conflict) {
      return res.status(400).json({ success: false, message: 'The selected slot is already booked. Please pick another time.' });
    }

    execute(
      'UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = ? WHERE appointment_id = ?',
      [new_date, new_time, 'Pending', id]
    );

    return res.json({ success: true, message: 'Appointment rescheduled successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reschedule appointment.' });
  }
};
