import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await User.deleteMany({});

    // ✅ Use save() instead of insertMany() so pre('save') hook hashes password
    const admin = new User({
      firstName: "System",
      middleName: "",
      lastName: "Admin",
      email: "admin@mint.gov.et",
      password: "Admin@1234", // ✅ plain text — hook will hash it
      role: "admin",
      department: "Minister's Office (ሚኒስትር ፅህፈት ቤት)",
      gender: "Male",
      status: "Active",
      position: "System Administrator",
      phone: "+251911000001",
    });

    await admin.save(); // ✅ triggers pre('save') hook → hashes password

    console.log("✅ Admin user seeded successfully!\n");
    console.log("📋 Login Credentials:");
    console.log("Admin → admin@mint.gov.et / Admin@1234");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
