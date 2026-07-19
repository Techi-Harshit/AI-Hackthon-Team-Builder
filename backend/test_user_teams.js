require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./models/Team");

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = "6a400c38d63329cb2d09c9ba"; // Harshit Keshari
    console.log("Searching teams for Harshit:", userId);

    const allTeams = await Team.find();
    console.log("Total teams in system:", allTeams.length);

    const filtered = allTeams.filter(t => {
      const isLead = String(t.leader) === userId;
      const isMem = t.members && t.members.some(m => String(m) === userId);
      return isLead || isMem;
    });

    console.log("Filtered teams found for Harshit:", filtered.map(t => ({
      id: t._id,
      name: t.teamName,
      leader: t.leader,
      members: t.members
    })));

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

check();
