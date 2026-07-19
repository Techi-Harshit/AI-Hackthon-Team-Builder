const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const HackathonRegistration = require("./models/HackathonRegistration");

async function check() {
  await connectDB();
  console.log("DB Mode:", global.dbMode);
  const list = await HackathonRegistration.find().limit(2);
  console.log("Mongo Registrations Count:", await HackathonRegistration.countDocuments());
  console.log("Mongo Registrations Samples:", JSON.stringify(list, null, 2));
  process.exit(0);
}
check();
