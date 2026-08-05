import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Disable buffering so Mongoose fails fast instead of freezing for 10s if connection drops
mongoose.set('bufferCommands', false);

export async function connectMongo() {
  const rawUri = (process.env.MONGODB_URI || '').trim();
  const isValidScheme = rawUri.startsWith('mongodb://') || rawUri.startsWith('mongodb+srv://');

  if (isValidScheme) {
    try {
      console.log(`📡 Connecting to MongoDB Atlas (${rawUri.includes('@') ? 'Cloud Cluster' : rawUri})...`);
      await mongoose.connect(rawUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ MongoDB Atlas Connected Successfully!`);
      await seedMongoDatabase();
      return;
    } catch (err) {
      console.warn(`⚠️ External MongoDB Atlas connection failed (${err.message}). Starting Fallback Memory MongoDB Server...`);
      try {
        await mongoose.disconnect();
      } catch (e) {}
    }
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB Server Connected Successfully! (${uri})`);
    await seedMongoDatabase(true);
  } catch (memErr) {
    console.error(`❌ Failed to start Fallback MongoDB Memory Server:`, memErr);
  }
}

export default mongoose;
