require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./models/Team");
const User = require("./models/User");
const Application = require("./models/Application");

async function check() {
  try {
    const dbMode = process.env.DB_MODE || "mongodb";
    console.log("DB Mode:", dbMode);

    if (dbMode === "json") {
      const { readCollection } = require("./utils/jsonDb");
      const teams = readCollection("teams") || [];
      const users = readCollection("users") || [];
      const applications = readCollection("applications") || [];

      console.log("=== JSON DB TEAMS ===");
      const targetTeam = teams.find(t => t.teamName && t.teamName.toLowerCase().includes("phynix"));
      if (!targetTeam) {
        console.log("No Phynix team found.");
        return;
      }
      console.log("Team Details:", targetTeam);
      const leader = users.find(u => u._id === targetTeam.leader);
      console.log("Leader Details:", leader);

      const apps = applications.filter(a => a.teamId === targetTeam._id);
      console.log("Applications for this team:", apps);
    } else {
      const connStr = process.env.MONGO_URI;
      console.log("Connecting to:", connStr);
      await mongoose.connect(connStr);
      console.log("=== MONGODB TEAMS ===");
      
      const targetTeam = await Team.findOne({ teamName: { $regex: "phynix", $options: "i" } })
        .populate("leader", "name email");
      
      if (!targetTeam) {
        console.log("No Phynix team found.");
        return;
      }
      console.log("Team Details:", targetTeam);

      const apps = await Application.find({ teamId: targetTeam._id }).populate("userId", "name email");
      console.log("Applications for this team:", apps);
      await mongoose.connection.close();
    }
  } catch (err) {
    console.error(err);
  }
}

check();
