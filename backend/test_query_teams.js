const mongoose = require("mongoose");
const User = require("./models/User");
const Hackathon = require("./models/Hackathon");
const Team = require("./models/Team");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to Mongoose Atlas");

  // Query exactly like buildMongooseQuery
  const filter = { status: "Open" };
  const count = await Team.countDocuments(filter);
  console.log("Total Count status:Open ->", count);

  const teams = await Team.find(filter)
    .populate("leader", "name email avatar preferredRole")
    .populate("members", "name email avatar preferredRole skills");
  
  console.log("Returned teams list length:", teams.length);
  console.log("Teams details:");
  teams.forEach((t, i) => {
    console.log(`${i+1}: ${t.teamName} (Leader: ${t.leader?.name || 'none'}, status: ${t.status}, requiredSkills: ${JSON.stringify(t.requiredSkills)})`);
  });

  process.exit(0);
}
run();
