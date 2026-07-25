import express from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/toggle', authenticateToken, toggleFavorite);
router.get('/', authenticateToken, getFavorites);

export default router;
