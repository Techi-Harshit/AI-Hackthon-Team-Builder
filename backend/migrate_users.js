const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./config/db");
const User = require("./models/User");
const calculateProfileCompletion = require("./utils/calculateProfileCompletion");

async function migrate() {
  // 1. JSON DB Migration
  try {
    const { readCollection, writeCollection } = require("./utils/jsonDb");
    const users = readCollection("users") || [];
    if (users.length > 0) {
      console.log("Migrating JSON DB users...");
      const updated = users.map(user => {
        return {
          ...user,
          lookingForTeam: user.lookingForTeam !== undefined ? user.lookingForTeam : true,
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date(),
          profileCompletion: calculateProfileCompletion(user)
        };
      });
      writeCollection("users", updated);
      console.log(`JSON DB users migrated: ${updated.length}`);
    }
  } catch (err) {
    console.warn("JSON DB migration skipped or failed:", err.message);
  }

  // 2. Mongoose MongoDB Migration
  try {
    await connectDB();
    if (global.dbMode === "atlas" || global.dbMode === "local") {
      console.log("Migrating MongoDB users...");
      const users = await User.find();
      console.log(`Found ${users.length} users in MongoDB.`);
      for (const user of users) {
        const lookingForTeam = (user.lookingForTeam !== undefined && user.lookingForTeam !== null) ? user.lookingForTeam : true;
        const lastActive = user.lastActive || new Date();
        const profileCompletion = calculateProfileCompletion(user);

        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              lookingForTeam, 
              lastActive, 
              profileCompletion 
            } 
          }
        );
      }
      console.log("MongoDB users migration completed successfully!");
    }
  } catch (err) {
    console.error("MongoDB migration error:", err);
  }
  process.exit(0);
}

migrate();
