const mongoose = require("mongoose");
const Hackathon = require("./models/Hackathon");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function migrate() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Read hackathons from JSON
    const jsonPath = path.resolve(__dirname, "data/hackathons.json");
    if (!fs.existsSync(jsonPath)) {
      console.log("JSON file not found at", jsonPath);
      process.exit(1);
    }
    const hackathonsData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    console.log(`Found ${hackathonsData.length} hackathons in JSON file.`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const hData of hackathonsData) {
      // Find by title to avoid duplicates
      let existing = await Hackathon.findOne({ title: hData.title });
      if (!existing) {
        // Clean up data for Mongoose (remove _id if it's string format, Mongoose will generate a proper ObjectId or we can convert it)
        const cleanData = { ...hData };
        delete cleanData._id;

        // Ensure date fields are proper Date objects if they are strings
        if (cleanData.startDate) cleanData.startDate = new Date(cleanData.startDate);
        if (cleanData.endDate) cleanData.endDate = new Date(cleanData.endDate);
        if (cleanData.registrationDeadline) {
          cleanData.registrationDeadline = new Date(cleanData.registrationDeadline);
        } else {
          cleanData.registrationDeadline = cleanData.startDate || new Date();
        }

        // Set status to Published or Approved so they show up
        cleanData.status = "Published";

        await Hackathon.create(cleanData);
        console.log(`Migrated: ${hData.title}`);
        addedCount++;
      } else {
        console.log(`Skipped (already exists): ${hData.title}`);
        skippedCount++;
      }
    }

    console.log(`Migration complete! Added: ${addedCount}, Skipped: ${skippedCount}`);
    
    // Let's count total in DB now
    const total = await Hackathon.countDocuments({});
    console.log(`Total Hackathons in MongoDB now: ${total}`);

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

migrate();
