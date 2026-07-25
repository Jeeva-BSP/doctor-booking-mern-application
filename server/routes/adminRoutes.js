import express from 'express';
import {
  getAdminStats,
  getPendingDoctors,
  updateDoctorVerification,
  getAllUsers,
  createSpecialization,
  deleteSpecialization
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require Admin authorization
router.use(authenticateToken, authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/pending-doctors', getPendingDoctors);
router.put('/doctors/:doctorId/verification', updateDoctorVerification);
router.get('/users', getAllUsers);
router.post('/specializations', createSpecialization);
router.delete('/specializations/:id', deleteSpecialization);

export default router;
