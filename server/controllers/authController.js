import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { execute, queryOne, query } from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, address, date_of_birth, gender, medical_information } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = queryOne('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const defaultImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';

    const userRes = execute(
      `INSERT INTO users (name, email, password, phone, role, profile_image, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), hashedPassword, phone || '', 'patient', defaultImage, address || '']
    );

    const patientRes = execute(
      `INSERT INTO patients (user_id, date_of_birth, gender, address, medical_information) 
       VALUES (?, ?, ?, ?, ?)`,
      [userRes.lastInsertRowid, date_of_birth || '', gender || 'Other', address || '', medical_information || '']
    );

    // Welcome Notification
    execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userRes.lastInsertRowid, 'Welcome to Book A Doctor!', 'Your patient account has been created successfully. Find top doctors and book your first appointment today.']
    );

    const token = jwt.sign(
      { user_id: userRes.lastInsertRowid, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully!',
      token,
      user: {
        user_id: userRes.lastInsertRowid,
        patient_id: patientRes.lastInsertRowid,
        name,
        email: email.toLowerCase().trim(),
        role: 'patient',
        profile_image: defaultImage
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

export const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      specialization_id,
      qualifications,
      experience,
      hospital,
      location,
      state,
      consultation_fee,
      about,
      languages
    } = req.body;

    if (!name || !email || !password || !specialization_id) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and specialization are required.' });
    }

    const existingUser = queryOne('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const defaultImage = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

    const userRes = execute(
      `INSERT INTO users (name, email, password, phone, role, profile_image, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), hashedPassword, phone || '', 'doctor', defaultImage, address || location || '']
    );

    const doctorRes = execute(
      `INSERT INTO doctors 
        (user_id, specialization_id, qualifications, experience, hospital, location, state, consultation_fee, about, languages, rating, verification_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userRes.lastInsertRowid,
        parseInt(specialization_id),
        qualifications || '',
        parseInt(experience || 0),
        hospital || '',
        location || '',
        state || 'Tamil Nadu',
        parseFloat(consultation_fee || 650),
        about || '',
        languages || 'English, Tamil',
        0.0,
        'pending' // Pending approval from Admin
      ]
    );

    // Set Default Availability (Mon-Fri 9:00 - 17:00)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of days) {
      execute(
        'INSERT INTO doctor_availability (doctor_id, day, start_time, end_time, appointment_duration) VALUES (?, ?, ?, ?, ?)',
        [doctorRes.lastInsertRowid, day, '09:00', '17:00', 30]
      );
    }

    // Welcome Notification
    execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userRes.lastInsertRowid, 'Doctor Registration Submitted', 'Your registration is under administrator review. Once approved, your profile will be publicly listed for patient bookings.']
    );

    const token = jwt.sign(
      { user_id: userRes.lastInsertRowid, role: 'doctor' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Doctor account submitted for admin approval!',
      token,
      user: {
        user_id: userRes.lastInsertRowid,
        doctor_id: doctorRes.lastInsertRowid,
        name,
        email: email.toLowerCase().trim(),
        role: 'doctor',
        verification_status: 'pending',
        profile_image: defaultImage
      }
    });
  } catch (error) {
    console.error('Doctor Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let roleDetails = {};
    if (user.role === 'patient') {
      const patient = queryOne('SELECT patient_id, date_of_birth, gender, medical_information FROM patients WHERE user_id = ?', [user.user_id]);
      if (patient) roleDetails = patient;
    } else if (user.role === 'doctor') {
      const doctor = queryOne(
        `SELECT d.*, s.specialization_name 
         FROM doctors d 
         JOIN specializations s ON d.specialization_id = s.specialization_id 
         WHERE d.user_id = ?`,
        [user.user_id]
      );
      if (doctor) roleDetails = doctor;
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        ...user,
        ...roleDetails
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let roleDetails = {};

    if (user.role === 'patient') {
      const patient = queryOne('SELECT patient_id, date_of_birth, gender, medical_information FROM patients WHERE user_id = ?', [user.user_id]);
      if (patient) roleDetails = patient;
    } else if (user.role === 'doctor') {
      const doctor = queryOne(
        `SELECT d.*, s.specialization_name 
         FROM doctors d 
         JOIN specializations s ON d.specialization_id = s.specialization_id 
         WHERE d.user_id = ?`,
        [user.user_id]
      );
      if (doctor) roleDetails = doctor;
    }

    return res.json({
      success: true,
      user: {
        ...user,
        ...roleDetails
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, phone, address, profile_image, medical_information, qualifications, experience, hospital, location, consultation_fee, about, languages } = req.body;

    execute(
      'UPDATE users SET name = ?, phone = ?, address = ?, profile_image = ? WHERE user_id = ?',
      [name || req.user.name, phone || req.user.phone, address || req.user.address, profile_image || req.user.profile_image, userId]
    );

    if (req.user.role === 'patient') {
      execute(
        'UPDATE patients SET address = ?, medical_information = ? WHERE user_id = ?',
        [address || req.user.address, medical_information || '', userId]
      );
    } else if (req.user.role === 'doctor') {
      execute(
        `UPDATE doctors SET 
          qualifications = ?, experience = ?, hospital = ?, location = ?, consultation_fee = ?, about = ?, languages = ? 
         WHERE user_id = ?`,
        [qualifications, experience, hospital, location, consultation_fee, about, languages, userId]
      );
    }

    return res.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
  }
};
