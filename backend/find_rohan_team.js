const mongoose = require("mongoose");
const User = require("./models/User");
const Team = require("./models/Team");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");

  const rohan = await User.findOne({ name: /Rohan/i });
  console.log("Rohan:", rohan ? { _id: rohan._id, name: rohan.name } : "not found");

  const teams = await Team.find({ $or: [{ leader: rohan?._id }, { members: rohan?._id }] });
  console.log(`Teams related to Rohan: ${teams.length}`);
  teams.forEach(t => {
    console.log(`- ${t.teamName} (Leader: ${t.leader}, members: ${JSON.stringify(t.members)})`);
  });

  process.exit(0);
}
run();
