import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export async function connectMongo() {
  const rawUri = (process.env.MONGODB_URI || '').trim();
  const isValidScheme = rawUri.startsWith('mongodb://') || rawUri.startsWith('mongodb+srv://');
  const mongoUri = isValidScheme ? rawUri : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_a_doctor');

  try {
    if (rawUri && !isValidScheme) {
      throw new Error('MONGODB_URI does not start with "mongodb://" or "mongodb+srv://".');
    }
    console.log(`📡 Connecting to MongoDB (${mongoUri.includes('@') ? 'Cloud MongoDB Atlas' : mongoUri})...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`✅ MongoDB Connected Successfully!`);
  } catch (err) {
    console.warn(`⚠️ External MongoDB connection notice (${err.message}). Starting Fallback Memory MongoDB Server...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Server Connected Successfully! (${uri})`);
    } catch (memErr) {
      console.error(`❌ Failed to start Fallback MongoDB Memory Server:`, memErr);
    }
  }
}

export default mongoose;
