const mongoose = require("mongoose");
const { generateProjectIdeas } = require("./controllers/aiController");
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
  console.log("Using user profile:", user?.name);

  // Mock req and res
  const req = {
    user: user,
    body: {
      skills: ["React", "NodeJS", "MongoDB"],
      domain: "Climate Tech",
      track: "Smart Waste Management",
      hackathonId: "6a584c8f31c43454fce66238" // GreenPlanet Sustainability Hack
    }
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log("\n========================================");
      console.log("Response status:", this.statusCode || 200);
      console.log("Success:", data.success);
      if (data.ideas) {
        console.log("Generated Ideas:");
        data.ideas.forEach((idea, i) => {
          console.log(`\nIdea ${i+1}:`);
          console.log(`- Title: ${idea.title}`);
          console.log(`- Problem statement: ${idea.problemStatement}`);
          console.log(`- Why fit: ${idea.whyThisFits}`);
          console.log(`- Tech: ${JSON.stringify(idea.techStack)}`);
          console.log(`- Probability: ${idea.winningProbability}%`);
        });
      } else {
        console.log("Error details:", data.message);
      }
    }
  };

  await generateProjectIdeas(req, res);
  process.exit(0);
}

run();
