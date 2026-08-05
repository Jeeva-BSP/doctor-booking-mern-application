import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Specialization from '../models/Specialization.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import Notification from '../models/Notification.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, address, date_of_birth, gender, medical_information } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const defaultImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: 'patient',
      profile_image: defaultImage,
      address: address || ''
    });

    const patient = await Patient.create({
      user: user._id,
      date_of_birth: date_of_birth || '',
      gender: gender || 'Other',
      medical_information: medical_information || ''
    });

    // Welcome Notification
    await Notification.create({
      user: user._id,
      title: 'Welcome to Book A Doctor!',
      message: 'Your patient account has been created successfully. Find top doctors and book your first appointment today.'
    });

    const token = jwt.sign(
      { user_id: user._id, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully!',
      token,
      user: {
        user_id: user._id,
        patient_id: patient._id,
        name: user.name,
        email: user.email,
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

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    let specDoc = null;
    if (mongoose.Types.ObjectId.isValid(specialization_id)) {
      specDoc = await Specialization.findById(specialization_id);
    } else {
      specDoc = await Specialization.findOne({ specialization_name: specialization_id });
    }

    if (!specDoc) {
      specDoc = await Specialization.findOne();
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const defaultImage = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: 'doctor',
      profile_image: defaultImage,
      address: address || location || ''
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialization: specDoc._id,
      qualifications: qualifications || 'MBBS, MD',
      experience: Number(experience || 5),
      hospital: hospital || 'Specialty Clinic',
      location: location || 'Chennai',
      state: state || 'Tamil Nadu',
      consultation_fee: Number(consultation_fee || 650),
      about: about || '',
      languages: languages || 'Tamil, English',
      rating: 0,
      verification_status: 'pending' // Pending Admin approval
    });

    // Default availability Mon-Fri
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of days) {
      await DoctorAvailability.create({
        doctor: doctor._id,
        day,
        start_time: '09:00 AM',
        end_time: '05:00 PM',
        slot_duration_minutes: 30
      });
    }

    // Welcome Notification
    await Notification.create({
      user: user._id,
      title: 'Doctor Registration Submitted',
      message: 'Your registration is under administrator review. Once approved, your profile will be publicly listed.'
    });

    const token = jwt.sign(
      { user_id: user._id, role: 'doctor' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Doctor account submitted for admin approval!',
      token,
      user: {
        user_id: user._id,
        doctor_id: doctor._id,
        name: user.name,
        email: user.email,
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let roleDetails = {};
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) roleDetails = { patient_id: patient._id, date_of_birth: patient.date_of_birth, gender: patient.gender, medical_information: patient.medical_information };
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id }).populate('specialization');
      if (doctor) {
        roleDetails = {
          doctor_id: doctor._id,
          qualifications: doctor.qualifications,
          experience: doctor.experience,
          hospital: doctor.hospital,
          location: doctor.location,
          state: doctor.state,
          consultation_fee: doctor.consultation_fee,
          about: doctor.about || '',
          languages: doctor.languages || 'Tamil, English',
          rating: doctor.rating,
          verification_status: doctor.verification_status,
          specialization_name: doctor.specialization?.specialization_name || 'General'
        };
      }
    }

    const token = jwt.sign(
      { user_id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;
    userObj.user_id = user._id;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        ...userObj,
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
      const patient = await Patient.findOne({ user: user.user_id });
      if (patient) roleDetails = { patient_id: patient._id, date_of_birth: patient.date_of_birth, gender: patient.gender, medical_information: patient.medical_information };
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user.user_id }).populate('specialization');
      if (doctor) {
        roleDetails = {
          doctor_id: doctor._id,
          qualifications: doctor.qualifications,
          experience: doctor.experience,
          hospital: doctor.hospital,
          location: doctor.location,
          state: doctor.state,
          consultation_fee: doctor.consultation_fee,
          about: doctor.about || '',
          languages: doctor.languages || 'Tamil, English',
          rating: doctor.rating,
          verification_status: doctor.verification_status,
          specialization_name: doctor.specialization?.specialization_name || 'General'
        };
      }
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
    const {
      name,
      phone,
      address,
      profile_image,
      date_of_birth,
      gender,
      medical_information,
      qualifications,
      experience,
      hospital,
      location,
      consultation_fee,
      about,
      languages
    } = req.body;

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (address !== undefined) userUpdates.address = address;
    if (profile_image !== undefined) userUpdates.profile_image = profile_image;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdates);
    }

    if (req.user.role === 'patient') {
      const patientUpdates = {};
      if (date_of_birth !== undefined) patientUpdates.date_of_birth = date_of_birth;
      if (gender !== undefined) patientUpdates.gender = gender;
      if (medical_information !== undefined) patientUpdates.medical_information = medical_information;

      if (Object.keys(patientUpdates).length > 0) {
        await Patient.findOneAndUpdate({ user: userId }, patientUpdates);
      }
    } else if (req.user.role === 'doctor') {
      const doctorUpdates = {};
      if (qualifications !== undefined) doctorUpdates.qualifications = qualifications;
      if (experience !== undefined) doctorUpdates.experience = Number(experience);
      if (hospital !== undefined) doctorUpdates.hospital = hospital;
      if (location !== undefined) doctorUpdates.location = location;
      if (consultation_fee !== undefined) doctorUpdates.consultation_fee = Number(consultation_fee);
      if (about !== undefined) doctorUpdates.about = about;
      if (languages !== undefined) doctorUpdates.languages = languages;

      if (Object.keys(doctorUpdates).length > 0) {
        await Doctor.findOneAndUpdate({ user: userId }, doctorUpdates);
      }
    }

    return res.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
  }
};
