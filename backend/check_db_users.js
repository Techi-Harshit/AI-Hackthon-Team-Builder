require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const { readCollection } = require("./utils/jsonDb");

async function check() {
  console.log("=== DB MODE ===", global.dbMode || process.env.DB_MODE || "default");
  
  // 1. JSON DB
  try {
    const jsonUsers = readCollection("users") || [];
    console.log(`\n=== JSON DB Users (${jsonUsers.length}) ===`);
    jsonUsers.forEach(u => console.log(`- ${u.name} (ID: ${u._id})`));
  } catch (err) {
    console.log("No JSON DB users found or error:", err.message);
  }

  // 2. MONGODB
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      const mongoUsers = await User.find({});
      console.log(`\n=== MongoDB Users (${mongoUsers.length}) ===`);
      mongoUsers.forEach(u => console.log(`- ${u.name} (ID: ${u._id})`));
      await mongoose.connection.close();
    } else {
      console.log("\nNo MONGO_URI env set.");
    }
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
  }
}

check();
