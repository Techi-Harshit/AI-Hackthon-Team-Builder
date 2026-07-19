require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./models/Team");
const User = require("./models/User");

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = "6a400c38d63329cb2d09c9ba"; // Harshit Keshari

    const teams = await Team.find()
      .populate("leader", "name email avatar preferredRole")
      .populate("members", "name email avatar preferredRole skills");

    console.log("=== POPULATED TEAMS ===");
    teams.forEach(t => {
      console.log(`Team: ${t.teamName}`);
      console.log("Leader:", t.leader ? `${t.leader.name} (${t.leader._id})` : "None");
      console.log("Members count:", t.members.length);
      t.members.forEach(m => {
        if (m) {
          console.log(` - Member: ${m.name} (${m._id})`);
        } else {
          console.log(" - Member: null");
        }
      });

      // Simulation of front-end filter
      const isLead = t.leader && String(t.leader._id || t.leader) === userId;
      const isMem = t.members && t.members.some(m => String(m?._id || m) === userId);
      console.log(` -> Filter Result: matches=${isLead || isMem} (isLead=${isLead}, isMem=${isMem})\n`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

check();
