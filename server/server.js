import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { seedDatabase } from './database/seed.js';

import { exportDatabase } from './controllers/adminController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors({ origin: '*' }));
app.use(express.json());

// Auto-seed SQL database if empty
seedDatabase();

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Direct DB Export Route
app.get('/api/export-database', exportDatabase);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Book A Doctor API Server is running smoothly!' });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  🚀 Book A Doctor API Server running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});
