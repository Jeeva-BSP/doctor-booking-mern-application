import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectMongo } from './config/dbMongo.js';
import { seedMongoDatabase } from './database/seedMongo.js';

import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Specialization from './models/Specialization.js';
import DoctorAvailability from './models/DoctorAvailability.js';
import Appointment from './models/Appointment.js';
import Review from './models/Review.js';
import Favorite from './models/Favorite.js';
import Notification from './models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportDir = path.resolve(__dirname, '../database_exports');
const jsonDir = path.join(exportDir, 'json');
const csvDir = path.join(exportDir, 'csv');

[exportDir, jsonDir, csvDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function runExport() {
  await connectMongo();
  await seedMongoDatabase();

  console.log('\n📦 Exporting MongoDB Collections to your folder...\n');

  const models = [
    { name: 'users', model: User },
    { name: 'doctors', model: Doctor },
    { name: 'patients', model: Patient },
    { name: 'specializations', model: Specialization },
    { name: 'doctor_availability', model: DoctorAvailability },
    { name: 'appointments', model: Appointment },
    { name: 'reviews', model: Review },
    { name: 'favorites', model: Favorite },
    { name: 'notifications', model: Notification }
  ];

  const fullData = {};

  for (const item of models) {
    const docs = await item.model.find().lean();
    fullData[item.name] = docs;

    // 1. Export JSON File
    const jsonPath = path.join(jsonDir, `${item.name}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(docs, null, 2), 'utf8');

    // 2. Export CSV File
    if (docs.length > 0) {
      const keys = Object.keys(docs[0]);
      const headers = keys.join(',');
      const rows = docs.map(doc => 
        keys.map(k => {
          const val = doc[k];
          if (val === null || val === undefined) return '""';
          const str = String(typeof val === 'object' ? JSON.stringify(val) : val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      const csvPath = path.join(csvDir, `${item.name}.csv`);
      fs.writeFileSync(csvPath, csvContent, 'utf8');
    }

    console.log(`  • Collection '${item.name}': exported ${docs.length} documents`);
  }

  // Master JSON file
  const masterJsonPath = path.join(exportDir, 'full_mongodb_export.json');
  fs.writeFileSync(masterJsonPath, JSON.stringify(fullData, null, 2), 'utf8');

  console.log(`\n🎉 MongoDB Data Exported to Folder -> ${exportDir}`);
  process.exit(0);
}

runExport().catch(err => {
  console.error('Export Error:', err);
  process.exit(1);
});
