const { connectDB } = require("./config/db");
const mongoose = require("mongoose");
const Hackathon = require("./models/Hackathon");
const fs = require("fs");
const path = require("path");

async function check() {
  console.log("Checking DB mode...");
  console.log("global.dbMode =", global.dbMode);
  
  // 1. Check JSON file hackathons
  try {
    const jsonPath = path.resolve(__dirname, "data/hackathons.json");
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      console.log(`JSON hackathons: ${data.length}`);
      console.log("JSON Titles:", data.map(h => h.title));
    } else {
      console.log("JSON hackathons.json does not exist");
    }
  } catch (err) {
    console.error("JSON error:", err.message);
  }

  // 2. Check MongoDB hackathons
  try {
    require('dotenv').config();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");
    const count = await Hackathon.countDocuments({});
    console.log(`MongoDB Total hackathons: ${count}`);
    const approvedCount = await Hackathon.countDocuments({ status: "Approved" });
    console.log(`MongoDB Approved hackathons: ${approvedCount}`);
    
    const sample = await Hackathon.find({}).lean();
    console.log("MongoDB Hackathons in DB:", sample.map(s => ({ title: s.title, status: s.status })));
  } catch (err) {
    console.error("MongoDB error:", err.message);
  }
  process.exit(0);
}

check();
