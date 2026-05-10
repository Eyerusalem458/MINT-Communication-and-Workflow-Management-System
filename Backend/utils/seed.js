import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; 

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        firstName: "System",
        middleName: "",
        lastName: "Admin",
        email: "admin@mint.gov.et",
        password: "Admin@1234",
        role: "admin",
        department: "Minister's Support Staff Unit",
        gender: "Male",
        status: "Active",
        position: "System Administrator",
        phone: "0911000001",
      },
      {
        firstName: "Abebe",
        middleName: "",
        lastName: "Bekele",
        email: "manager@mint.gov.et",
        password: "Manager@1234",
        role: "manager",
        department: "Innovation and Technology Sector",
        gender: "Male",
        status: "Active",
        position: "Department Manager",
        phone: "0911000002",
      },
      {
        firstName: "Sara",
        middleName: "B.",
        lastName: "Ali",
        email: "staff@mint.gov.et",
        password: "Staff@1234",
        role: "staff",
        department: "Digital Infrastructure",
        gender: "Female",
        status: "Active",
        position: "Innovation Officer",
        phone: "0912345678",
      },
      {
        firstName: "John",
        middleName: "A.",
        lastName: "Doe",
        email: "john.doe@mint.gov.et",
        password: "Staff@1234", 
        role: "staff",
        department: "Cyber Security",
        gender: "Male",
        status: "Active",
        position: "Security Analyst",
        phone: "0923456789",
      },
      {
        firstName: "Meron",
        middleName: "",
        lastName: "Tadesse",
        email: "meron@mint.gov.et",
        password: "Manager@1234", 
        role: "manager",
        department: "Digital Economy Sector",
        gender: "Female",
        status: "Active",
        position: "Senior Manager",
        phone: "0911003061",
      },
      {
        firstName: "Eyerusalem",
        middleName: "",
        lastName: "Tariku",
        email: "jerrykinu2885@gmail.com",
        password: "eyu1234",
        role: "manager",
        department: "Digital Economy Sector",
        gender: "Female",
        status: "Active",
        position: "Senior Manager",
        phone: "0912131665",
      },
      {
        firstName: "Samuel",
        middleName: "",
        lastName: "Gebre",
        email: "samuel@mint.gov.et",
        password: "Staff@1234", 
        role: "staff",
        department: "Digital Economy Sector", // ✅ SAME as manager
        gender: "Male",
        status: "Active",
        position: "Economy Analyst",
        phone: "0912000000",
      },
      {
        firstName: "Hana",
        middleName: "",
        lastName: "Kebede",
        email: "hana@mint.gov.et",
        password: "Staff@1234", 
        role: "staff",
        department: "Innovation and Technology Sector",
        gender: "Female",
        status: "Active",
        position: "Tech Officer",
        phone: "0912000001",
      },
    ];

    await User.insertMany(users);

    console.log(`✅ Seeded ${users.length} users successfully!\n`);
    console.log("📋 Login Credentials:");
    console.log("Admin   → admin@mint.gov.et  / Admin@1234");
    console.log("Manager → manager@mint.gov.et / Manager@1234");
    console.log("Staff   → staff@mint.gov.et  / Staff@1234");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
