const mongoose = require("mongoose");
const User = require("./models/User");
const Team = require("./models/Team");
const Application = require("./models/Application");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");

  // Find users
  const rahul = await User.findOne({ name: /Rahul/i });
  const rohan = await User.findOne({ name: /Rohan/i });
  console.log("Rahul:", rahul ? { _id: rahul._id, name: rahul.name } : "Not found");
  console.log("Rohan:", rohan ? { _id: rohan._id, name: rohan.name } : "Not found");

  // Find applications
  const apps = await Application.find({})
    .populate("userId", "name")
    .populate("teamId", "teamName leader");
  
  console.log(`Total applications: ${apps.length}`);
  apps.forEach((app, i) => {
    console.log(`${i+1}: AppID: ${app._id}, Sender: ${app.userId?.name} (${app.userId?._id}), Team: ${app.teamId?.teamName} (Leader: ${app.teamId?.leader}), Status: ${app.status}, Message: ${app.message}`);
  });

  process.exit(0);
}
run();
