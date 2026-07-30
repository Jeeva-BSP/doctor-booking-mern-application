import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { query } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportDir = path.resolve(__dirname, '../database_exports');
const jsonDir = path.join(exportDir, 'json');
const csvDir = path.join(exportDir, 'csv');

// Create export directories if not existing
[exportDir, jsonDir, csvDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Copy SQLite database file
const dbSourcePath = path.resolve(__dirname, 'database/book_a_doctor.db');
const dbBackupPath = path.join(exportDir, 'book_a_doctor_backup.db');

if (fs.existsSync(dbSourcePath)) {
  fs.copyFileSync(dbSourcePath, dbBackupPath);
  console.log(`✅ SQLite Database File Copied -> ${dbBackupPath}`);
}

// 2. Fetch all tables
const tables = query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .map(t => t.name);

console.log(`\n📦 Exporting ${tables.length} Database Tables...`);

const allData = {};

tables.forEach(tableName => {
  const rows = query(`SELECT * FROM ${tableName}`);
  allData[tableName] = rows;

  // Save JSON
  const jsonPath = path.join(jsonDir, `${tableName}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), 'utf8');

  // Save CSV
  if (rows.length > 0) {
    const headers = Object.keys(rows[0]).join(',');
    const csvRows = rows.map(r => 
      Object.values(r).map(val => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    );
    const csvContent = [headers, ...csvRows].join('\n');
    const csvPath = path.join(csvDir, `${tableName}.csv`);
    fs.writeFileSync(csvPath, csvContent, 'utf8');
  }

  console.log(`  • Table '${tableName}': exported ${rows.length} rows`);
});

// Save complete master JSON file
const masterJsonPath = path.join(exportDir, 'full_database_export.json');
fs.writeFileSync(masterJsonPath, JSON.stringify(allData, null, 2), 'utf8');
console.log(`\n🎉 Full Database JSON Exported -> ${masterJsonPath}`);
console.log(`📁 All exports saved in: ${exportDir}\n`);
