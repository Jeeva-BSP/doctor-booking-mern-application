import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Specialization from '../models/Specialization.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import Review from '../models/Review.js';

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

    const filter = { verification_status: 'approved' };

    // Specialization filter
    if (specialization && specialization !== 'all') {
      if (mongoose.Types.ObjectId.isValid(specialization)) {
        filter.specialization = specialization;
      } else {
        const specDoc = await Specialization.findOne({ specialization_name: new RegExp(specialization, 'i') });
        if (specDoc) filter.specialization = specDoc._id;
      }
    }

    // Location / City / District filter
    if (location && location.trim() !== '' && location !== 'all') {
      filter.$or = [
        { location: new RegExp(location.trim(), 'i') },
        { state: new RegExp(location.trim(), 'i') }
      ];
    }

    // State filter
    if (state && state.trim() !== '' && state !== 'all') {
      filter.state = new RegExp(state.trim(), 'i');
    }

    // Fee range filter
    if (minFee || maxFee) {
      filter.consultation_fee = {};
      if (minFee) filter.consultation_fee.$gte = Number(minFee);
      if (maxFee) filter.consultation_fee.$lte = Number(maxFee);
    }

    // Experience filter
    if (minExperience) {
      filter.experience = { $gte: Number(minExperience) };
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Day availability filter
    if (day) {
      const availDocs = await DoctorAvailability.find({ day: new RegExp(day, 'i') }).distinct('doctor');
      filter._id = { $in: availDocs };
    }

    let sort = { rating: -1, experience: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };
    else if (sortBy === 'experience') sort = { experience: -1 };
    else if (sortBy === 'fee_low') sort = { consultation_fee: 1 };
    else if (sortBy === 'fee_high') sort = { consultation_fee: -1 };

    let doctors = await Doctor.find(filter)
      .populate('user', 'name email phone profile_image address')
      .populate('specialization', 'specialization_name icon')
      .sort(sort);

    // Apply text search filter on doctor name / hospital / specialization
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      doctors = doctors.filter(doc => 
        (doc.user && searchRegex.test(doc.user.name)) ||
        searchRegex.test(doc.hospital) ||
        searchRegex.test(doc.location) ||
        searchRegex.test(doc.state) ||
        (doc.specialization && searchRegex.test(doc.specialization.specialization_name))
      );
    }

    // Format output objects to match expected keys
    const formattedDoctors = doctors.map(doc => ({
      doctor_id: doc._id,
      user_id: doc.user?._id,
      qualifications: doc.qualifications,
      experience: doc.experience,
      hospital: doc.hospital,
      location: doc.location,
      state: doc.state,
      consultation_fee: doc.consultation_fee,
      about: doc.about,
      languages: doc.languages,
      rating: doc.rating,
      verification_status: doc.verification_status,
      doctor_name: doc.user?.name || 'Dr. Specialist',
      email: doc.user?.email || '',
      phone: doc.user?.phone || '',
      profile_image: doc.user?.profile_image || '',
      specialization_id: doc.specialization?._id,
      specialization_name: doc.specialization?.specialization_name || 'General',
      specialization_icon: doc.specialization?.icon || 'Stethoscope'
    }));

    return res.json({
      success: true,
      count: formattedDoctors.length,
      doctors: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching doctor list.', error: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Doctor.findById(id)
      .populate('user', 'name email phone profile_image address')
      .populate('specialization', 'specialization_name description icon');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const availability = await DoctorAvailability.find({ doctor: doc._id });
    const reviews = await Review.find({ doctor: doc._id })
      .populate('patient', 'name profile_image')
      .sort({ created_at: -1 });

    const formattedReviews = reviews.map(r => ({
      review_id: r._id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      patient_name: r.patient?.name || 'Verified Patient',
      patient_image: r.patient?.profile_image || ''
    }));

    const formattedDoctor = {
      doctor_id: doc._id,
      user_id: doc.user?._id,
      qualifications: doc.qualifications,
      experience: doc.experience,
      hospital: doc.hospital,
      location: doc.location,
      state: doc.state,
      consultation_fee: doc.consultation_fee,
      about: doc.about,
      languages: doc.languages,
      rating: doc.rating,
      verification_status: doc.verification_status,
      doctor_name: doc.user?.name || 'Dr. Specialist',
      email: doc.user?.email || '',
      phone: doc.user?.phone || '',
      profile_image: doc.user?.profile_image || '',
      address: doc.user?.address || '',
      specialization_id: doc.specialization?._id,
      specialization_name: doc.specialization?.specialization_name || 'General',
      specialization_description: doc.specialization?.description || '',
      specialization_icon: doc.specialization?.icon || 'Stethoscope',
      availability,
      reviews: formattedReviews
    };

    return res.json({
      success: true,
      doctor: formattedDoctor
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching doctor profile.', error: error.message });
  }
};

export const getSpecializations = async (req, res) => {
  try {
    const specs = await Specialization.find().sort({ specialization_name: 1 });

    const formattedSpecs = await Promise.all(specs.map(async s => {
      const doctor_count = await Doctor.countDocuments({ specialization: s._id, verification_status: 'approved' });
      return {
        specialization_id: s._id,
        specialization_name: s.specialization_name,
        description: s.description,
        icon: s.icon,
        doctor_count
      };
    }));

    return res.json({
      success: true,
      specializations: formattedSpecs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch specializations.' });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const doc = await Doctor.findOne({ user: userId });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor record not found.' });
    }

    const { schedule } = req.body;
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ success: false, message: 'Schedule must be an array of daily availability.' });
    }

    await DoctorAvailability.deleteMany({ doctor: doc._id });

    for (const item of schedule) {
      if (item.day && item.start_time && item.end_time) {
        await DoctorAvailability.create({
          doctor: doc._id,
          day: item.day,
          start_time: item.start_time,
          end_time: item.end_time,
          slot_duration_minutes: item.appointment_duration || 30
        });
      }
    }

    return res.json({ success: true, message: 'Availability schedule updated successfully!' });
  } catch (error) {
    console.error('Update Availability Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
};
