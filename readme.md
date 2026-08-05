# 🩺 Doctor Booking MERN Application

A full-stack Doctor Appointment Booking System built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**. The application allows patients to browse doctors, book appointments, manage bookings, while administrators manage doctors, users, and appointments through a dedicated dashboard.

---

## 🚀 Features

### 👨‍⚕️ Patient
- User Registration & Login
- Browse Doctors
- View Doctor Details
- Book Appointments
- View Appointment History
- Update Profile

### 👨‍💼 Admin
- Secure Admin Login
- Manage Doctors
- Manage Patients
- Manage Appointments
- Dashboard Overview

### 🔐 Authentication
- JWT Authentication
- Protected Routes
- Role-based Authorization

---

# 🛠 Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS / Tailwind / Bootstrap (depending on project)

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT
- bcrypt

---

# 📂 Project Structure

```
doctor-booking-mern-application/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │
│   ├── components/
│   │   ├── Navbar
│   │   ├── Footer
│   │   ├── DoctorCard
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Home
│   │   ├── Login
│   │   ├── Register
│   │   ├── Doctors
│   │   ├── Appointment
│   │   └── Profile
│   │
│   ├── services/
│   ├── context/
│   ├── assets/
│   └── App.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   │
│   ├── routes/
│   │
│   ├── utils/
│   │
│   ├── server.js
│   └── package.json
│
├── README.md
└── package.json
```

---

# ⚙️ Prerequisites

Install the following before running the project.

- Node.js (v18 or above)
- npm
- MongoDB Community Server or MongoDB Atlas
- Git

---

# 📥 Installation

## 1. Clone Repository

```bash
git clone https://github.com/Jeeva-BSP/doctor-booking-mern-application.git

cd doctor-booking-mern-application
```

---

## 2. Install Backend Dependencies

```bash
cd backend

npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../frontend

npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the **backend** directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key
```

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/doctor_booking
JWT_SECRET=mySecretKey
```

---

# ▶️ Running the Project

## Start Backend

```bash
cd backend

npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

## Start Frontend

Open another terminal.

```bash
cd frontend

npm start
```

or

```bash
npm run dev
```

depending on your React setup.

Frontend runs at:

```
http://localhost:3000
```

or

```
http://localhost:5173
```

---

# 🔄 Application Flow

```
                User Opens Website
                        │
                        ▼
              Register / Login
                        │
                        ▼
          JWT Authentication Successful
                        │
                        ▼
             Browse Available Doctors
                        │
                        ▼
            View Doctor Details/Profile
                        │
                        ▼
              Book Appointment
                        │
                        ▼
      Appointment Stored in MongoDB
                        │
                        ▼
         User Views Appointment History
                        │
                        ▼
          Admin Manages Appointments
                        │
                        ▼
       Doctor/Appointment Information Updated
```

---

# 🗄 Database Flow

```
React Frontend
      │
      ▼
Axios API Calls
      │
      ▼
Express Routes
      │
      ▼
Controllers
      │
      ▼
Mongoose Models
      │
      ▼
MongoDB Database
```

---

# 🔐 Authentication Flow

```
User Login
     │
     ▼
Backend verifies credentials
     │
     ▼
Password compared using bcrypt
     │
     ▼
JWT Token Generated
     │
     ▼
Token sent to Frontend
     │
     ▼
Protected APIs accessed using JWT
```

---

# 📡 API Workflow

```
Frontend
    │
    ▼
Axios Request
    │
    ▼
Express Route
    │
    ▼
Controller
    │
    ▼
MongoDB
    │
    ▼
JSON Response
    │
    ▼
React UI Updated
```

---

# 📦 Main Modules

- Authentication
- Doctor Management
- Appointment Booking
- User Management
- Admin Dashboard
- Profile Management

---

# 📸 Screens

- Home Page
- Login
- Register
- Doctor Listing
- Doctor Details
- Appointment Booking
- User Dashboard
- Admin Dashboard

---

# 🚀 Future Improvements

- Online Payments
- Email Notifications
- SMS Reminders
- Doctor Availability Calendar
- Video Consultation
- Medical Reports Upload
- Search & Filters
- Rating and Reviews

---

# 👨‍💻 Author

**Jeeva BSP**

GitHub:
https://github.com/Jeeva-BSP

---

# 📄 License

This project is licensed under the MIT License.

---

⭐ If you found this project useful, consider giving it a **Star** on GitHub!
