import db, { execute, queryOne, query } from '../config/db.js';
import bcrypt from 'bcryptjs';

export function seedDatabase(forceReSeed = false) {
  const existingUsers = query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count > 0 && !forceReSeed) {
    console.log('Database already populated. Skipping seed.');
    return;
  }

  if (forceReSeed) {
    console.log('Force re-seeding database with Indian doctors...');
    execute('DELETE FROM reviews');
    execute('DELETE FROM favorites');
    execute('DELETE FROM appointments');
    execute('DELETE FROM doctor_availability');
    execute('DELETE FROM doctors');
    execute('DELETE FROM patients');
    execute('DELETE FROM notifications');
    execute('DELETE FROM users');
    execute('DELETE FROM specializations');
  } else {
    console.log('Seeding database with Indian doctors across all Tamil Nadu districts & India states...');
  }

  // Hash standard password
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const adminPassword = bcrypt.hashSync('admin123', 10);

  // 1. Insert Specializations
  const specializationsData = [
    { name: 'Cardiology', desc: 'Heart and cardiovascular system care', icon: 'Heart' },
    { name: 'Dermatology', desc: 'Skin, hair, and nail health care', icon: 'Sparkles' },
    { name: 'Neurology', desc: 'Brain, spinal cord, and nervous system care', icon: 'Activity' },
    { name: 'Pediatrics', desc: 'Infant, child, and adolescent medicine', icon: 'Baby' },
    { name: 'Orthopedics', desc: 'Bones, joints, ligaments, and muscle care', icon: 'Bone' },
    { name: 'General Medicine', desc: 'Comprehensive adult health and diagnosis', icon: 'Stethoscope' },
    { name: 'Psychiatry', desc: 'Mental health diagnosis and treatment', icon: 'Brain' },
    { name: 'Gynecology', desc: "Women's reproductive health care", icon: 'UserCheck' }
  ];

  const specIds = {};
  for (const s of specializationsData) {
    const res = execute(
      'INSERT INTO specializations (specialization_name, description, icon) VALUES (?, ?, ?)',
      [s.name, s.desc, s.icon]
    );
    specIds[s.name] = res.lastInsertRowid;
  }

  // 2. Insert Admin User
  execute(
    'INSERT INTO users (name, email, password, phone, role, address) VALUES (?, ?, ?, ?, ?, ?)',
    ['System Administrator', 'admin@bookadoctor.com', adminPassword, '+91-9876543210', 'admin', 'Health HQ, Chennai, Tamil Nadu']
  );

  // Curated list of high quality doctor avatar URLs (Male and Female)
  const maleImages = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=400',
  ];

  const femaleImages = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1594824813566-88855ce7890b?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1594824813566-88855ce7890b?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1643297654416-05795d62e39c?auto=format&fit=crop&q=80&w=400'
  ];

  // All 38 Districts of Tamil Nadu
  const tnDistricts = [
    { district: 'Ariyalur', hospital: 'Government Head Quarters Hospital, Ariyalur' },
    { district: 'Chengalpattu', hospital: 'Chengalpattu Medical College & Hospital' },
    { district: 'Chennai', hospital: 'Apollo Hospitals, Greams Road, Chennai' },
    { district: 'Coimbatore', hospital: 'Ganga Medical Centre & Hospitals, Coimbatore' },
    { district: 'Cuddalore', hospital: 'Rajah Muthiah Medical College & Hospital, Cuddalore' },
    { district: 'Dharmapuri', hospital: 'Dharmapuri Government Medical College Hospital' },
    { district: 'Dindigul', hospital: 'City Care Specialty Hospital, Dindigul' },
    { district: 'Erode', hospital: 'Lotus Hospital & Research Centre, Erode' },
    { district: 'Kallakurichi', hospital: 'Government Medical College Hospital, Kallakurichi' },
    { district: 'Kancheepuram', hospital: 'Sri Ramachandra Specialty Clinic, Kancheepuram' },
    { district: 'Karur', hospital: 'Government Medical College Hospital, Karur' },
    { district: 'Krishnagiri', hospital: 'Kauvery Multi-Specialty Clinic, Krishnagiri' },
    { district: 'Madurai', hospital: 'Meenakshi Mission Hospital & Research Centre, Madurai' },
    { district: 'Mayiladuthurai', hospital: 'Government General Hospital, Mayiladuthurai' },
    { district: 'Nagapattinam', hospital: 'Government District Head Quarters Hospital, Nagapattinam' },
    { district: 'Namakkal', hospital: 'CMCH Specialty Center, Namakkal' },
    { district: 'The Nilgiris', hospital: 'Government Head Quarters Hospital, Ooty' },
    { district: 'Perambalur', hospital: 'Dhanalakshmi Srinivasan Medical College, Perambalur' },
    { district: 'Pudukkottai', hospital: 'Government Pudukkottai Medical College Hospital' },
    { district: 'Ramanathapuram', hospital: 'Government Medical College Hospital, Ramanathapuram' },
    { district: 'Ranipet', hospital: 'CMC Vellore Extension Clinic, Ranipet' },
    { district: 'Salem', hospital: 'Manipal Hospitals, Salem' },
    { district: 'Sivaganga', hospital: 'Government Sivagangai Medical College Hospital' },
    { district: 'Tenkasi', hospital: 'Government Head Quarters Hospital, Tenkasi' },
    { district: 'Thanjavur', hospital: 'Thanjavur Medical College Hospital' },
    { district: 'Theni', hospital: 'Government Theni Medical College Hospital' },
    { district: 'Thoothukudi', hospital: 'Government Thoothukudi Medical College Hospital' },
    { district: 'Tiruchirappalli', hospital: 'Kauvery Hospital, Cantonment, Trichy' },
    { district: 'Tirunelveli', hospital: 'Tirunelveli Medical College Hospital' },
    { district: 'Tirupathur', hospital: 'Government Head Quarters Hospital, Tirupathur' },
    { district: 'Tiruppur', hospital: 'Revathi Medical Center, Tiruppur' },
    { district: 'Tiruvallur', hospital: 'Government Medical College Hospital, Tiruvallur' },
    { district: 'Tiruvannamalai', hospital: 'Government Tiruvannamalai Medical College' },
    { district: 'Tiruvarur', hospital: 'Government Tiruvarur Medical College Hospital' },
    { district: 'Vellore', hospital: 'Christian Medical College (CMC), Vellore' },
    { district: 'Viluppuram', hospital: 'Government Villupuram Medical College Hospital' },
    { district: 'Virudhunagar', hospital: 'Government Medical College Hospital, Virudhunagar' },
    { district: 'Kanniyakumari', hospital: 'Kanyakumari Government Medical College Hospital, Nagercoil' }
  ];

  // Rest of India major states & cities
  const indiaCities = [
    { city: 'Mumbai', state: 'Maharashtra', hospital: 'Lilavati Hospital & Research Centre, Mumbai' },
    { city: 'Bengaluru', state: 'Karnataka', hospital: 'Manipal Hospital, Old Airport Road, Bengaluru' },
    { city: 'New Delhi', state: 'Delhi NCR', hospital: 'AIIMS, New Delhi' },
    { city: 'Hyderabad', state: 'Telangana', hospital: 'Yashoda Hospitals, Somajiguda, Hyderabad' },
    { city: 'Kochi', state: 'Kerala', hospital: 'Amrita Hospital, Edappally, Kochi' },
    { city: 'Kolkata', state: 'West Bengal', hospital: 'AMRI Hospital, Dhakuria, Kolkata' },
    { city: 'Jaipur', state: 'Rajasthan', hospital: 'Fortis Escorts Hospital, Malviya Nagar, Jaipur' },
    { city: 'Ahmedabad', state: 'Gujarat', hospital: 'Apollo Hospitals, Bhat, Ahmedabad' },
    { city: 'Chandigarh', state: 'Punjab & Haryana', hospital: 'Max Super Speciality Hospital, Mohali' }
  ];

  const firstNamesMale = [
    'Arun', 'Karthik', 'Senthil', 'Ramesh', 'Vijay', 'Suresh', 'Murugan', 'Venkatesh', 'Anand',
    'Rajesh', 'Prakash', 'Saravanan', 'Ganesh', 'Dinesh', 'Balaji', 'Raman', 'Sundar', 'Manikandan',
    'Vikram', 'Pradeep', 'Ashok', 'Sanjay', 'Manoj', 'Deepak', 'Naveen', 'Rohan', 'Amit', 'Rahul'
  ];

  const firstNamesFemale = [
    'Lakshmi', 'Priya', 'Meenakshi', 'Divya', 'Kavitha', 'Sangeetha', 'Radhika', 'Revathi', 'Deepa',
    'Anitha', 'Uma', 'Gayathri', 'Shanthi', 'Vidya', 'Malathi', 'Soundarya', 'Janaki', 'Bhavani',
    'Aswini', 'Nivedita', 'Pooja', 'Sneha', 'Ananya', 'Ritu', 'Swati', 'Kritika', 'Sunita'
  ];

  const lastNamesTN = [
    'Kumar', 'Rajan', 'Subramanian', 'Natarajan', 'Krishnan', 'Chandran', 'Sundaram', 'Murthy',
    'Iyer', 'Iyengar', 'Pillai', 'Mudaliar', 'Gounder', 'Naidu', 'Chettiar', 'Thevar', 'Pandian',
    'Menon', 'Rao', 'Reddy', 'Chari', 'Shankar', 'Swamy', 'Babu', 'Mani', 'Vasan'
  ];

  const specsList = Object.keys(specIds);
  const qualificationsList = [
    'MBBS, MD (General Medicine)',
    'MBBS, MS, MCh (Cardiology) - MMC Chennai',
    'MBBS, MD (Dermatology, Venereology & Leprosy)',
    'MBBS, DM (Neurology) - NIMHANS',
    'MBBS, DCH, MD (Pediatrics)',
    'MBBS, MS (Orthopedics), DNB - CMC Vellore',
    'MBBS, MD (Psychiatry) - JIPMER',
    'MBBS, MS (Obstetrics & Gynecology), DGO'
  ];

  // Consultation Fees explicitly constrained to ₹500 - ₹1,000 range
  const validFees = [500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];

  let doctorCount = 0;
  const doctorIds = [];

  // Helper to generate a doctor record
  const createDoctorData = (name, isFemale, district, state, hospital, specName, index) => {
    doctorCount++;
    const email = `${name.toLowerCase().replace(/[^a-z]/g, '')}${doctorCount}@bookadoctor.in`;
    const phone = `+91-${9800000000 + doctorCount}`;
    
    // Pick unique image URL from list or fallback generator
    const imgList = isFemale ? femaleImages : maleImages;
    const image = imgList[(doctorCount - 1) % imgList.length];
    
    const fee = validFees[(doctorCount - 1) % validFees.length];
    const exp = 5 + (doctorCount % 22); // 5 to 26 years
    const rating = 4.2 + ((doctorCount % 8) * 0.1); // 4.2 to 4.9

    return {
      name: `Dr. ${name}`,
      email,
      phone,
      image,
      address: `${hospital}, ${district}, ${state}`,
      specId: specIds[specName],
      qualifications: qualificationsList[(doctorCount - 1) % qualificationsList.length],
      experience: exp,
      hospital,
      location: district,
      state: state,
      fee,
      about: `Experienced ${specName} specialist practicing at ${hospital}. Dedicated to providing compassionate, evidence-based healthcare for patients across ${district}.`,
      languages: isFemale ? 'Tamil, English' : 'Tamil, English, Hindi',
      rating: parseFloat(rating.toFixed(1)),
      status: doctorCount <= 3 ? 'pending' : 'approved' // 3 pending for admin testing, rest approved
    };
  };

  const doctorsData = [];

  // 1. Generate doctors for ALL 38 districts of Tamil Nadu (2 to 3 doctors per district!)
  tnDistricts.forEach((item, idx) => {
    // Doctor 1 for this district
    const fn1 = firstNamesMale[idx % firstNamesMale.length];
    const ln1 = lastNamesTN[idx % lastNamesTN.length];
    const spec1 = specsList[idx % specsList.length];
    doctorsData.push(createDoctorData(`${fn1} ${ln1}`, false, item.district, 'Tamil Nadu', item.hospital, spec1, idx));

    // Doctor 2 for this district
    const fn2 = firstNamesFemale[idx % firstNamesFemale.length];
    const ln2 = lastNamesTN[(idx + 5) % lastNamesTN.length];
    const spec2 = specsList[(idx + 3) % specsList.length];
    doctorsData.push(createDoctorData(`${fn2} ${ln2}`, true, item.district, 'Tamil Nadu', item.hospital, spec2, idx));

    // Doctor 3 for major Tamil Nadu hubs (Chennai, Coimbatore, Madurai, Salem, Trichy, Tirunelveli, Vellore)
    if (['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur'].includes(item.district)) {
      const fn3 = firstNamesMale[(idx + 10) % firstNamesMale.length];
      const ln3 = lastNamesTN[(idx + 12) % lastNamesTN.length];
      const spec3 = specsList[(idx + 6) % specsList.length];
      doctorsData.push(createDoctorData(`${fn3} ${ln3}`, false, item.district, 'Tamil Nadu', item.hospital, spec3, idx));
    }
  });

  // 2. Generate doctors for rest of India major cities
  indiaCities.forEach((item, idx) => {
    const fn = (idx % 2 === 0) ? firstNamesMale[idx % firstNamesMale.length] : firstNamesFemale[idx % firstNamesFemale.length];
    const ln = (idx % 2 === 0) ? 'Sharma' : 'Verma';
    const spec = specsList[idx % specsList.length];
    doctorsData.push(createDoctorData(`${fn} ${ln}`, idx % 2 !== 0, item.city, item.state, item.hospital, spec, idx));
  });

  console.log(`Inserting ${doctorsData.length} Indian doctors into SQL database...`);

  // Insert doctors into SQL
  for (const doc of doctorsData) {
    const userRes = execute(
      'INSERT INTO users (name, email, password, phone, role, profile_image, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [doc.name, doc.email, hashedPassword, doc.phone, 'doctor', doc.image, doc.address]
    );

    const docRes = execute(
      `INSERT INTO doctors 
        (user_id, specialization_id, qualifications, experience, hospital, location, state, consultation_fee, about, languages, rating, verification_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userRes.lastInsertRowid,
        doc.specId,
        doc.qualifications,
        doc.experience,
        doc.hospital,
        doc.location,
        doc.state,
        doc.fee,
        doc.about,
        doc.languages,
        doc.rating,
        doc.status
      ]
    );

    if (doc.status === 'approved') {
      doctorIds.push(docRes.lastInsertRowid);
      
      // Set Working Availability for Approved Doctors (Monday to Saturday, 09:00 - 17:00)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (const day of days) {
        execute(
          'INSERT INTO doctor_availability (doctor_id, day, start_time, end_time, appointment_duration) VALUES (?, ?, ?, ?, ?)',
          [docRes.lastInsertRowid, day, '09:00', '17:00', 30]
        );
      }
    }
  }

  // 4. Insert Sample Patients
  const patientsData = [
    {
      name: 'John Doe',
      email: 'patient@example.com',
      phone: '+91-9876500001',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      address: '742 Anna Salai, Chennai, Tamil Nadu',
      dob: '1990-05-14',
      gender: 'Male',
      medicalInfo: 'No known drug allergies. Mild hypertension.'
    },
    {
      name: 'Emily Watson',
      email: 'emily@example.com',
      phone: '+91-9876500002',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      address: '123 Crosscut Road, Coimbatore, Tamil Nadu',
      dob: '1995-11-20',
      gender: 'Female',
      medicalInfo: 'Penicillin allergy. Regular annual health checkups.'
    }
  ];

  const patientIds = [];
  for (const pat of patientsData) {
    const userRes = execute(
      'INSERT INTO users (name, email, password, phone, role, profile_image, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [pat.name, pat.email, hashedPassword, pat.phone, 'patient', pat.image, pat.address]
    );

    const patRes = execute(
      'INSERT INTO patients (user_id, date_of_birth, gender, address, medical_information) VALUES (?, ?, ?, ?, ?)',
      [userRes.lastInsertRowid, pat.dob, pat.gender, pat.address, pat.medicalInfo]
    );
    patientIds.push(patRes.lastInsertRowid);
  }

  // 5. Sample Appointments & Reviews
  if (doctorIds.length > 0 && patientIds.length > 0) {
    execute(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientIds[0], doctorIds[0], '2026-07-28', '10:00', 'Routine heart checkup and blood pressure consultation', 'Confirmed']
    );

    const apptCompleted = execute(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientIds[0], doctorIds[1], '2026-07-15', '14:00', 'Skin consultation regarding allergic rash', 'Completed']
    );

    execute(
      `INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [patientIds[0], doctorIds[1], apptCompleted.lastInsertRowid, 5, 'Extremely attentive and prescribed medicine that worked within 2 days! Highly recommended.']
    );

    execute(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientIds[1], doctorIds[0], '2026-07-30', '11:30', 'Experiencing mild chest tightness', 'Pending']
    );

    execute('INSERT INTO favorites (patient_id, doctor_id) VALUES (?, ?)', [patientIds[0], doctorIds[0]]);
  }

  console.log(`Database seeding completed! Added ${doctorsData.length} Indian doctors across 38 TN districts & major states.`);
}

seedDatabase();
