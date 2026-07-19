const mongoose = require("mongoose");
require("dotenv").config();

const Hackathon = require("./models/Hackathon");

const correct = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://cosmicHarshit:htk123@cosmichero.zzdzsxz.mongodb.net/userRoute?appName=cosmicHero";
    await mongoose.connect(uri);

    const result = await Hackathon.updateMany(
      { title: /Virtual Universe Hackathon/i },
      { status: "Pending Review", badge: "Pending Review", badgeColor: "amber" }
    );
    console.log("Updated records count:", result.modifiedCount);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

correct();
