const mongoose = require("mongoose");
require("dotenv").config();

const Hackathon = require("./models/Hackathon");

const dump = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://cosmicHarshit:htk123@cosmichero.zzdzsxz.mongodb.net/userRoute?appName=cosmicHero";
    console.log("Connecting to URI:", uri);
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const hacks = await Hackathon.find({});
    console.log("Total hackathons found:", hacks.length);
    hacks.forEach(h => {
      console.log(`- Title: "${h.title}" | Status: "${h.status}" | Badge: "${h.badge}" | CreatedBy: "${h.createdBy}"`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

dump();
