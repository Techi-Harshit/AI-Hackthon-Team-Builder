const mongoose = require("mongoose");
const { getTeams } = require("./controllers/teamController");
const User = require("./models/User");
const Hackathon = require("./models/Hackathon");
const Team = require("./models/Team");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");
  
  global.dbMode = 'atlas';

  // Load a user for req.user
  const user = await User.findOne({});
  console.log("Using mock user:", user?.name);

  // Mock req and res
  const req = {
    user: user,
    query: {
      page: "1",
      limit: "6"
    }
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log("Response status:", this.statusCode || 200);
      console.log("Response data fields:", Object.keys(data));
      console.log("Returned teams count:", data.teams?.length);
      console.log("Pagination:", data.pagination);
      if (data.teams) {
        data.teams.forEach((t, i) => {
          console.log(`${i+1}: ${t.teamName} (status: ${t.status})`);
        });
      }
    }
  };

  await getTeams(req, res);
  process.exit(0);
}

run();
