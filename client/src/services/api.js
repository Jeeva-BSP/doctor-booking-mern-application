import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto-logout on token expiration
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerPatient: (data) => api.post('/auth/register/patient', data),
  registerDoctor: (data) => api.post('/auth/register/doctor', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Doctor Services
export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
  updateAvailability: (schedule) => api.put('/doctors/availability', { schedule }),
};

// Appointment Services
export const appointmentService = {
  getSlots: (doctorId, date) => api.get('/appointments/slots', { params: { doctorId, date } }),
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: (params) => api.get('/appointments', { params }),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  reschedule: (id, new_date, new_time) => api.put(`/appointments/${id}/reschedule`, { new_date, new_time }),
};

// Review Services
export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
};

// Favorite Services
export const favoriteService = {
  toggleFavorite: (doctorId) => api.post('/favorites/toggle', { doctor_id: doctorId }),
  getFavorites: () => api.get('/favorites'),
};

// Notification Services
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// Admin Services
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getPendingDoctors: () => api.get('/admin/pending-doctors'),
  updateDoctorVerification: (doctorId, status) => api.put(`/admin/doctors/${doctorId}/verification`, { status }),
  getAllUsers: () => api.get('/admin/users'),
  createSpecialization: (data) => api.post('/admin/specializations', data),
  deleteSpecialization: (id) => api.delete(`/admin/specializations/${id}`),
};

export default api;
