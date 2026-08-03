import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';

async function resolveDoctorDoc(doctorId) {
  if (!doctorId) return null;
  const idStr = String(doctorId).trim();
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    const doc = await Doctor.findById(idStr).populate('user', 'name');
    if (doc) return doc;
  }
  // Fallback for legacy numeric IDs (e.g. 6 or "6")
  const doctors = await Doctor.find().populate('user', 'name');
  const index = Number(idStr) - 1;
  if (!isNaN(index) && index >= 0 && index < doctors.length) {
    return doctors[index];
  }
  return null;
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 9 * 60;
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const cleanStr = timeStr.replace(/(am|pm)/i, '').trim();
  const parts = cleanStr.split(':').map(Number);
  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function generateTimeSlots(startTimeStr, endTimeStr, durationMinutes = 30) {
  const slots = [];
  const startTotalMin = parseTimeToMinutes(startTimeStr || '09:00 AM');
  let endTotalMin = parseTimeToMinutes(endTimeStr || '05:00 PM');

  if (endTotalMin <= startTotalMin) {
    endTotalMin = 17 * 60; // 5:00 PM (17:00)
  }

  let currentMin = startTotalMin;

  while (currentMin + durationMinutes <= endTotalMin) {
    const hours = Math.floor(currentMin / 60);
    const mins = currentMin % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const hh = String(displayHour).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    slots.push(`${hh}:${mm} ${ampm}`);
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

    const doc = await resolveDoctorDoc(doctorId);
    const resolvedDocId = doc ? doc._id : doctorId;

    const dateObj = new Date(date + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dateObj.getDay()];

    const availability = await DoctorAvailability.findOne({
      doctor: resolvedDocId,
      day: new RegExp(dayName, 'i')
    });

    if (!availability) {
      return res.json({
        success: true,
        day: dayName,
        available: false,
        message: `Doctor does not work on ${dayName}s.`,
        slots: []
      });
    }

    const allSlots = generateTimeSlots(
      availability.start_time || '09:00',
      availability.end_time || '17:00',
      availability.slot_duration_minutes || 30
    );

    const bookedAppointments = await Appointment.find({
      doctor: resolvedDocId,
      appointment_date: date,
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    const bookedTimes = new Set(bookedAppointments.map(a => a.appointment_time));

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

    const todayStr = new Date().toISOString().split('T')[0];
    if (appointment_date < todayStr) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments for past dates.' });
    }

    const doc = await resolveDoctorDoc(doctor_id);
    if (!doc || doc.verification_status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Selected doctor is not available or approved.' });
    }

    const realDoctorId = doc._id;

    // Doctor double-booking check
    const existingDoctorSlot = await Appointment.findOne({
      doctor: realDoctorId,
      appointment_date,
      appointment_time,
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (existingDoctorSlot) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for this doctor. Please choose another slot.'
      });
    }

    // Patient double-booking check
    const existingPatientSlot = await Appointment.findOne({
      patient: user.user_id,
      appointment_date,
      appointment_time,
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (existingPatientSlot) {
      return res.status(400).json({
        success: false,
        message: 'You already have another appointment booked at this exact date and time.'
      });
    }

    const appt = await Appointment.create({
      patient: user.user_id,
      doctor: realDoctorId,
      appointment_date,
      appointment_time,
      reason: reason || 'General Consultation',
      status: 'Pending'
    });

    // Notify Patient
    await Notification.create({
      user: user.user_id,
      title: 'Appointment Requested',
      message: `Your appointment request with ${doc.user?.name || 'Doctor'} for ${appointment_date} at ${appointment_time} is pending confirmation.`
    });

    // Notify Doctor
    if (doc.user?._id) {
      await Notification.create({
        user: doc.user._id,
        title: 'New Appointment Request',
        message: `Patient ${user.name} has requested an appointment on ${appointment_date} at ${appointment_time}.`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment_id: appt._id
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

    const filter = {};

    if (user.role === 'patient') {
      filter.patient = user.user_id;
    } else if (user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: user.user_id });
      if (doc) filter.doctor = doc._id;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone profile_image' },
          { path: 'specialization', select: 'specialization_name' }
        ]
      })
      .populate('patient', 'name email phone profile_image gender date_of_birth medical_information')
      .sort({ appointment_date: -1, appointment_time: 1 });

    const formatted = await Promise.all(appointments.map(async a => {
      const review = await Review.findOne({ appointment: a._id });
      const patientDoc = await Patient.findOne({ user: a.patient?._id });

      return {
        appointment_id: a._id,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        reason: a.reason,
        status: a.status,
        created_at: a.created_at,

        patient_id: patientDoc?._id,
        patient_name: a.patient?.name || 'Patient',
        patient_email: a.patient?.email || '',
        patient_phone: a.patient?.phone || '',
        patient_image: a.patient?.profile_image || '',
        gender: patientDoc?.gender || 'Other',
        date_of_birth: patientDoc?.date_of_birth || '',
        medical_information: patientDoc?.medical_information || '',

        doctor_id: a.doctor?._id,
        doctor_name: a.doctor?.user?.name || 'Doctor',
        doctor_email: a.doctor?.user?.email || '',
        doctor_phone: a.doctor?.user?.phone || '',
        doctor_image: a.doctor?.user?.profile_image || '',
        hospital: a.doctor?.hospital || '',
        location: a.doctor?.location || '',
        consultation_fee: a.doctor?.consultation_fee || 0,
        specialization_name: a.doctor?.specialization?.specialization_name || 'General',

        review_id: review?._id,
        rating: review?.rating,
        comment: review?.comment
      };
    }));

    return res.json({
      success: true,
      count: formatted.length,
      appointments: formatted
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching appointments.' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const appt = await Appointment.findById(id)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('patient', 'name');

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appt.status = status;
    await appt.save();

    const doctorName = appt.doctor?.user?.name || 'Doctor';

    let title = `Appointment ${status}`;
    let message = `Your appointment with ${doctorName} for ${appt.appointment_date} at ${appt.appointment_time} has been updated to: ${status}.`;

    if (status === 'Confirmed') {
      message = `Great news! ${doctorName} has confirmed your appointment on ${appt.appointment_date} at ${appt.appointment_time}.`;
    } else if (status === 'Completed') {
      message = `Your consultation with ${doctorName} is marked as completed. Please feel free to leave a review!`;
    } else if (status === 'Rejected') {
      message = `Unfortunately, ${doctorName} was unable to accept your appointment for ${appt.appointment_date}.`;
    }

    await Notification.create({
      user: appt.patient._id,
      title,
      message
    });

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

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const conflict = await Appointment.findOne({
      doctor: appt.doctor,
      appointment_date: new_date,
      appointment_time: new_time,
      _id: { $ne: appt._id },
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (conflict) {
      return res.status(400).json({ success: false, message: 'The selected slot is already booked. Please pick another time.' });
    }

    appt.appointment_date = new_date;
    appt.appointment_time = new_time;
    appt.status = 'Pending';
    await appt.save();

    return res.json({ success: true, message: 'Appointment rescheduled successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reschedule appointment.' });
  }
};
