import express from 'express';
import { getAllDoctors, getDoctorById, getSpecializations, updateAvailability } from '../controllers/doctorController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);
router.put('/availability', authenticateToken, authorizeRoles('doctor'), updateAvailability);

export default router;
