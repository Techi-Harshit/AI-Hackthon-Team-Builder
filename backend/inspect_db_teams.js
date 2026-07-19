const { connectDB } = require("./config/db");
const mongoose = require("mongoose");
const Team = require("./models/Team");
const fs = require("fs");
const path = require("path");

async function check() {
  console.log("Checking DB mode...");
  console.log("global.dbMode =", global.dbMode);
  
  // 1. Check JSON file teams
  try {
    const jsonPath = path.resolve(__dirname, "data/teams.json");
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      console.log(`JSON teams: ${data.length}`);
    } else {
      console.log("JSON teams.json does not exist");
    }
  } catch (err) {
    console.error("JSON error:", err.message);
  }

  // 2. Check MongoDB teams
  try {
    require('dotenv').config();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");
    const count = await Team.countDocuments({});
    console.log(`MongoDB Total teams: ${count}`);
    const openCount = await Team.countDocuments({ status: "Open" });
    console.log(`MongoDB Open teams: ${openCount}`);
    const closedCount = await Team.countDocuments({ status: { $ne: "Open" } });
    console.log(`MongoDB Non-Open teams: ${closedCount}`);
    
    const sample = await Team.find({}).limit(5).lean();
    console.log("Sample team statuses:", sample.map(s => ({ name: s.teamName, status: s.status })));
  } catch (err) {
    console.error("MongoDB error:", err.message);
  }
  process.exit(0);
}

check();
