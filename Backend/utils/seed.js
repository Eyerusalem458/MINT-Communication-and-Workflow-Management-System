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
