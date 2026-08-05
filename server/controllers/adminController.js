import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Specialization from '../models/Specialization.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import Favorite from '../models/Favorite.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const approvedDoctors = await Doctor.countDocuments({ verification_status: 'approved' });
    const pendingDoctors = await Doctor.countDocuments({ verification_status: 'pending' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });
    const totalSpecializations = await Specialization.countDocuments();

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
        appointmentsByStatus: [],
        topSpecializations: []
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching admin stats.' });
  }
};

export const getPendingDoctors = async (req, res) => {
  try {
    const docs = await Doctor.find({ verification_status: 'pending' })
      .populate('user', 'name email phone profile_image created_at')
      .populate('specialization', 'specialization_name')
      .sort({ created_at: -1 });

    const formatted = docs.map(d => ({
      doctor_id: d._id,
      user_id: d.user?._id,
      qualifications: d.qualifications,
      experience: d.experience,
      hospital: d.hospital,
      location: d.location,
      state: d.state,
      consultation_fee: d.consultation_fee,
      about: d.about,
      verification_status: d.verification_status,
      doctor_name: d.user?.name || 'Doctor Candidate',
      email: d.user?.email || '',
      phone: d.user?.phone || '',
      profile_image: d.user?.profile_image || '',
      specialization_name: d.specialization?.specialization_name || 'General'
    }));

    return res.json({ success: true, pendingDoctors: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pending doctor registrations.' });
  }
};

export const updateDoctorVerification = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const doc = await Doctor.findById(doctorId).populate('user', 'name');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor record not found.' });
    }

    doc.verification_status = status;
    await doc.save();

    const title = status === 'approved' ? 'Doctor Registration Approved!' : 'Doctor Application Update';
    const message = status === 'approved' 
      ? 'Congratulations! Your doctor profile has been verified and approved.'
      : 'Your doctor registration request has been reviewed and rejected.';

    await Notification.create({ user: doc.user._id, title, message });

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
    const users = await User.find().sort({ created_at: -1 });

    const formatted = await Promise.all(users.map(async u => {
      let patient_id = null;
      let doctor_id = null;
      let verification_status = null;
      let specialization_name = null;

      if (u.role === 'patient') {
        const p = await Patient.findOne({ user: u._id });
        if (p) patient_id = p._id;
      } else if (u.role === 'doctor') {
        const d = await Doctor.findOne({ user: u._id }).populate('specialization');
        if (d) {
          doctor_id = d._id;
          verification_status = d.verification_status;
          specialization_name = d.specialization?.specialization_name;
        }
      }

      return {
        user_id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        profile_image: u.profile_image,
        created_at: u.created_at,
        patient_id,
        doctor_id,
        verification_status,
        specialization_name
      };
    }));

    return res.json({ success: true, users: formatted });
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

    const spec = await Specialization.create({
      specialization_name,
      description: description || '',
      icon: icon || 'Stethoscope'
    });

    return res.status(201).json({
      success: true,
      message: 'Specialization added successfully!',
      specialization_id: spec._id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create specialization.' });
  }
};

export const deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    await Specialization.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Specialization deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete specialization.' });
  }
};

export const exportDatabase = async (req, res) => {
  try {
    const users = await User.find();
    const doctors = await Doctor.find().populate('user').populate('specialization');
    const patients = await Patient.find().populate('user');
    const specializations = await Specialization.find();
    const appointments = await Appointment.find().populate('patient').populate('doctor');
    const reviews = await Review.find();
    const favorites = await Favorite.find();

    const exportData = {
      users,
      doctors,
      patients,
      specializations,
      appointments,
      reviews,
      favorites
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="book_a_doctor_mongodb_export.json"');
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error('Database Export Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export database.' });
  }
};
