require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ name: { $regex: "harshit", $options: "i" } });
    console.log("Users found:", users.map(u => ({ id: u._id, name: u.name, email: u.email })));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

check();
