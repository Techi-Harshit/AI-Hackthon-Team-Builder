const mongoose = require("mongoose");
const Hackathon = require("./models/Hackathon");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");
  const hacks = await Hackathon.find({}, "title theme category");
  hacks.forEach(h => {
    console.log(`- ID: ${h._id}, Title: ${h.title}, Theme: ${h.theme}`);
  });
  process.exit(0);
}
run();
