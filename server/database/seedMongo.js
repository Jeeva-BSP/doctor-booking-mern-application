import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Specialization from '../models/Specialization.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import DoctorAvailability from '../models/DoctorAvailability.js';

export async function seedMongoDatabase(forceReSeed = false) {
  try {
    const count = await User.countDocuments();
    if (count > 0 && !forceReSeed) {
      console.log('🌱 MongoDB already populated. Skipping seed.');
      return;
    }

    if (forceReSeed) {
      console.log('⚡ Force re-seeding MongoDB with Indian doctors...');
      await User.deleteMany({});
      await Specialization.deleteMany({});
      await Doctor.deleteMany({});
      await Patient.deleteMany({});
      await DoctorAvailability.deleteMany({});
    } else {
      console.log('🌱 Seeding MongoDB with Indian doctors across all Tamil Nadu districts & India states...');
    }

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

    const specDocs = {};
    for (const s of specializationsData) {
      const doc = await Specialization.create({
        specialization_name: s.name,
        description: s.desc,
        icon: s.icon
      });
      specDocs[s.name] = doc._id;
    }

    // 2. Create Admin User
    await User.create({
      name: 'System Administrator',
      email: 'admin@bookadoctor.com',
      password: adminPassword,
      phone: '+91-9876543210',
      role: 'admin',
      address: 'Health HQ, Chennai, Tamil Nadu'
    });

    // 3. Create Sample Patient User
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@example.com',
      password: hashedPassword,
      phone: '+91-9876543211',
      role: 'patient',
      address: '12 Anna Salai, Chennai, Tamil Nadu'
    });

    await Patient.create({
      user: patientUser._id,
      date_of_birth: '1992-05-15',
      gender: 'Male',
      medical_information: 'No known allergies. Routine health checks.'
    });

    // Avatar list
    const maleImages = [
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400'
    ];

    const femaleImages = [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1594824813566-88855ce7890b?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400'
    ];

    // All 38 Tamil Nadu districts
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
      { district: 'Kanniyakumari', hospital: 'Kanyakumari Medical College Hospital, Nagercoil' },
      { district: 'Karur', hospital: 'Government Medical College Hospital, Karur' },
      { district: 'Krishnagiri', hospital: 'Kauvery Multi-Specialty Clinic, Krishnagiri' },
      { district: 'Madurai', hospital: 'Meenakshi Mission Hospital & Research Centre, Madurai' },
      { district: 'Mayiladuthurai', hospital: 'Government General Hospital, Mayiladuthurai' },
      { district: 'Nagapattinam', hospital: 'Government District Head Quarters Hospital, Nagapattinam' },
      { district: 'Namakkal', hospital: 'Government Head Quarters Hospital, Namakkal' },
      { district: 'The Nilgiris', hospital: 'Government District Head Quarters Hospital, Ooty' },
      { district: 'Perambalur', hospital: 'Dhanalakshmi Srinivasan Medical College, Perambalur' },
      { district: 'Pudukkottai', hospital: 'Government Pudukkottai Medical College Hospital' },
      { district: 'Ramanathapuram', hospital: 'Government Medical College Hospital, Ramanathapuram' },
      { district: 'Ranipet', hospital: 'CMC Vellore Campus, Ranipet' },
      { district: 'Salem', hospital: 'Manipal Hospital, Dalmia Board, Salem' },
      { district: 'Sivaganga', hospital: 'Government Sivagangai Medical College Hospital' },
      { district: 'Tenkasi', hospital: 'Government District Hospital, Tenkasi' },
      { district: 'Thanjavur', hospital: 'Thanjavur Medical College Hospital, Thanjavur' },
      { district: 'Theni', hospital: 'Government Theni Medical College Hospital, Theni' },
      { district: 'Thoothukudi', hospital: 'Government Medical College Hospital, Thoothukudi' },
      { district: 'Tiruchirappalli', hospital: 'Kauvery Hospital, Cantonment, Tiruchirappalli' },
      { district: 'Tirunelveli', hospital: 'Tirunelveli Medical College Hospital, Tirunelveli' },
      { district: 'Tirupathur', hospital: 'Government Head Quarters Hospital, Tirupathur' },
      { district: 'Tiruppur', hospital: 'Revathi Medical Center, Tiruppur' },
      { district: 'Tiruvallur', hospital: 'Government Medical College Hospital, Tiruvallur' },
      { district: 'Tiruvannamalai', hospital: 'Government Medical College Hospital, Tiruvannamalai' },
      { district: 'Tiruvarur', hospital: 'Government Tiruvarur Medical College Hospital' },
      { district: 'Vellore', hospital: 'Christian Medical College (CMC), Vellore' },
      { district: 'Viluppuram', hospital: 'Government Villupuram Medical College Hospital' },
      { district: 'Virudhunagar', hospital: 'Government Medical College Hospital, Virudhunagar' }
    ];

    const indianFirstNamesM = ['Ramesh', 'Suresh', 'Karthik', 'Venkatesh', 'Anand', 'Rajesh', 'Sundar', 'Vijay', 'Arun', 'Prakash', 'Pradeep', 'Sanjay', 'Surya', 'Manoj'];
    const indianFirstNamesF = ['Priya', 'Kavitha', 'Lakshmi', 'Anitha', 'Meena', 'Deepa', 'Radha', 'Divya', 'Sangeetha', 'Revathi', 'Aarthi', 'Gayathri', 'Nithya'];
    const indianLastNames = ['Ramanathan', 'Subramanian', 'Natarajan', 'Krishnan', 'Murugan', 'Iyengar', 'Balasubramanian', 'Chettiar', 'Pillai', 'Ganesan', 'Srinivasan', 'Raghavan', 'Sundaram'];

    const specNames = Object.keys(specDocs);

    let docCount = 0;
    for (let i = 0; i < tnDistricts.length; i++) {
      const distObj = tnDistricts[i];
      const docsInDistrict = (i % 3 === 0) ? 3 : 2;

      for (let d = 0; d < docsInDistrict; d++) {
        docCount++;
        const isFemale = (docCount % 2 === 0);
        const firstName = isFemale 
          ? indianFirstNamesF[docCount % indianFirstNamesF.length] 
          : indianFirstNamesM[docCount % indianFirstNamesM.length];
        const lastName = indianLastNames[docCount % indianLastNames.length];
        const doctorName = `Dr. ${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${docCount}@bookadoctor.in`;
        const phone = `+91-9840${(100000 + docCount).toString().slice(1)}`;
        const specName = specNames[docCount % specNames.length];
        const specId = specDocs[specName];

        const imgList = isFemale ? femaleImages : maleImages;
        const profileImage = imgList[docCount % imgList.length];

        const experience = 5 + ((docCount * 3) % 25);
        const fee = 500 + ((docCount * 50) % 550); // ₹500 to ₹1000
        const rating = Number((4.5 + ((docCount % 5) * 0.1)).toFixed(1));

        const userDoc = await User.create({
          name: doctorName,
          email,
          password: hashedPassword,
          phone,
          role: 'doctor',
          profile_image: profileImage,
          address: `${distObj.hospital}, ${distObj.district}, Tamil Nadu`
        });

        const doctorObj = await Doctor.create({
          user: userDoc._id,
          specialization: specId,
          qualifications: 'MBBS, MD',
          experience,
          hospital: distObj.hospital,
          location: distObj.district,
          state: 'Tamil Nadu',
          consultation_fee: fee,
          about: `Experienced ${specName} specialist practicing at ${distObj.hospital}. Committed to compassionate, quality healthcare in ${distObj.district}.`,
          languages: 'Tamil, English',
          rating,
          verification_status: 'approved'
        });

        // Insert default doctor availability (Mon-Fri)
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (const day of days) {
          await DoctorAvailability.create({
            doctor: doctorObj._id,
            day,
            start_time: '09:00 AM',
            end_time: '05:00 PM',
            slot_duration_minutes: 30
          });
        }
      }
    }

    console.log(`✅ MongoDB Seeding completed! Seeded ${docCount} doctors across all 38 Tamil Nadu districts.`);
  } catch (err) {
    console.error('❌ MongoDB Seeding Error:', err);
  }
}
