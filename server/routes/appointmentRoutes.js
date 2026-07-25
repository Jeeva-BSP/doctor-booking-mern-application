import express from 'express';
import {
  getAvailableSlots,
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  rescheduleAppointment
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/slots', getAvailableSlots);
router.post('/', authenticateToken, createAppointment);
router.get('/', authenticateToken, getAppointments);
router.put('/:id/status', authenticateToken, updateAppointmentStatus);
router.put('/:id/reschedule', authenticateToken, rescheduleAppointment);

export default router;
