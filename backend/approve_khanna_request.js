const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const User = require("./models/User");
const Team = require("./models/Team");
const Application = require("./models/Application");
require("dotenv").config();

async function run() {
  // 1. JSON Fallback DB Update
  try {
    const appsPath = path.resolve(__dirname, "data/applications.json");
    const teamsPath = path.resolve(__dirname, "data/teams.json");
    const usersPath = path.resolve(__dirname, "data/users.json");

    if (fs.existsSync(appsPath) && fs.existsSync(teamsPath)) {
      const applications = JSON.parse(fs.readFileSync(appsPath, "utf8"));
      const teams = JSON.parse(fs.readFileSync(teamsPath, "utf8"));
      const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

      const rahul = users.find(u => u.name && u.name.includes("Rahul"));
      const rohan = users.find(u => u.name && u.name.includes("Rohan"));
      
      const appIndex = applications.findIndex(
        app => (app.status === "pending" && String(app.userId) === String(rahul?._id))
      );

      if (appIndex !== -1) {
        const app = applications[appIndex];
        app.status = "accepted";
        app.updatedAt = new Date().toISOString();

        const teamIndex = teams.findIndex(t => String(t._id) === String(app.teamId));
        if (teamIndex !== -1) {
          if (!teams[teamIndex].members) teams[teamIndex].members = [];
          if (!teams[teamIndex].members.includes(app.userId)) {
            teams[teamIndex].members.push(app.userId);
          }
          teams[teamIndex].updatedAt = new Date().toISOString();
          fs.writeFileSync(teamsPath, JSON.stringify(teams, null, 2), "utf8");
          console.log(`JSON Updated Team: ${teams[teamIndex].teamName}`);
        }

        fs.writeFileSync(appsPath, JSON.stringify(applications, null, 2), "utf8");
        console.log("JSON Application Accepted successfully!");
      } else {
        console.log("No pending JSON application from Rahul found.");
      }
    }
  } catch (err) {
    console.error("JSON Update error:", err.message);
  }

  // 2. MongoDB Atlas DB Update
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    const rahul = await User.findOne({ name: /Rahul/i });
    const rohan = await User.findOne({ name: /Rohan/i });

    if (!rahul || !rohan) {
      console.log("Users not found in MongoDB!");
      process.exit(1);
    }

    const application = await Application.findOne({
      userId: rahul._id,
      status: "pending"
    });

    if (application) {
      application.status = "accepted";
      application.updatedAt = new Date();
      await application.save();
      console.log("MongoDB Application status set to accepted.");

      const team = await Team.findById(application.teamId);
      if (team) {
        if (!team.members.includes(rahul._id)) {
          team.members.push(rahul._id);
          await team.save();
          console.log(`MongoDB Team ${team.teamName} members updated. Added Rahul Khanna.`);
        } else {
          console.log("Rahul Khanna already in team members array.");
        }

        // Send accepted notification to applicant
        await User.findByIdAndUpdate(rahul._id, {
          $push: {
            notifications: {
              $each: [{
                type: "application_accepted",
                message: `Your request to join team "${team.teamName}" has been accepted! 🎉`,
                applicationId: application._id,
                teamId: team._id,
                teamName: team.teamName,
                fromUserId: rohan._id,
                fromUserName: rohan.name,
                fromUserAvatar: rohan.avatar || "",
                read: false,
                createdAt: new Date(),
              }],
              $position: 0,
            },
          },
        });
        console.log("Notification sent successfully!");
      }
    } else {
      console.log("No pending MongoDB application from Rahul Khanna found.");
    }
  } catch (err) {
    console.error("MongoDB Update error:", err.message);
  }

  process.exit(0);
}
run();
