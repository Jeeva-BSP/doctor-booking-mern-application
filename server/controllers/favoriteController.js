import Favorite from '../models/Favorite.js';
import Doctor from '../models/Doctor.js';

export const toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    const { doctor_id } = req.body;

    const existing = await Favorite.findOne({ patient: user.user_id, doctor: doctor_id });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({ success: true, isFavorite: false, message: 'Doctor removed from favorites.' });
    } else {
      await Favorite.create({ patient: user.user_id, doctor: doctor_id });
      return res.json({ success: true, isFavorite: true, message: 'Doctor added to favorites!' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle favorite status.' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = req.user;
    const favs = await Favorite.find({ patient: user.user_id })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name profile_image' },
          { path: 'specialization', select: 'specialization_name' }
        ]
      })
      .sort({ created_at: -1 });

    const formatted = favs.map(f => ({
      favorite_id: f._id,
      doctor_id: f.doctor?._id,
      qualifications: f.doctor?.qualifications,
      experience: f.doctor?.experience,
      hospital: f.doctor?.hospital,
      location: f.doctor?.location,
      consultation_fee: f.doctor?.consultation_fee,
      rating: f.doctor?.rating,
      doctor_name: f.doctor?.user?.name || 'Doctor',
      profile_image: f.doctor?.user?.profile_image || '',
      specialization_name: f.doctor?.specialization?.specialization_name || 'General'
    }));

    return res.json({ success: true, count: formatted.length, favorites: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch favorites.' });
  }
};
