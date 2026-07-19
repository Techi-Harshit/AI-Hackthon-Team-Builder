const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");
  const user = await User.findOne({ name: /Rahul/i });
  console.log("User:", user ? { _id: user._id, name: user.name, email: user.email } : "Not found");
  process.exit(0);
}
run();
