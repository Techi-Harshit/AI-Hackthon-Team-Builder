const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "admin_super_secret_2026";

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!adminSecret || adminSecret !== ADMIN_SECRET) {
      return res.status(401).json({
        message: "Invalid Administrative Secret Passcode.",
      });
    }

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const userExists = users.find((u) => u.email === email);

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAdmin = {
        _id: new Date().getTime().toString(),
        name,
        email,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      users.push(newAdmin);
      writeCollection("users", users);

      const { password: pw, ...adminWithoutPassword } = newAdmin;
      return res.status(201).json({
        message: "Admin Registered Successfully",
        user: adminWithoutPassword,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      message: "Admin Registered Successfully",
      user: admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const user = users.find((u) => u.email === email);

      if (!user) {
        return res.status(400).json({ message: "Invalid Email or Password" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied: Not an administrator" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Email or Password" });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "harshit_hackteam_secret_2026",
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Admin Login Successful",
        token,
        user,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Not an administrator" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "harshit_hackteam_secret_2026",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Admin Login Successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Organizers List
const getOrganizers = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const organizers = users.filter((u) => u.role === "organizer");
      return res.status(200).json(organizers);
    }

    const organizers = await User.find({ role: "organizer" }).select("-password");
    res.status(200).json(organizers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Organizer Verification Status
const toggleVerifyOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const index = users.findIndex((u) => u._id === organizerId);

      if (index === -1) {
        return res.status(404).json({ message: "Organizer Not Found" });
      }

      users[index].isVerified = !users[index].isVerified;
      writeCollection("users", users);

      return res.status(200).json({ success: true, isVerified: users[index].isVerified });
    }

    const organizer = await User.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer Not Found" });
    }

    organizer.isVerified = !organizer.isVerified;
    await organizer.save();

    res.status(200).json({ success: true, isVerified: organizer.isVerified });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getOrganizers,
  toggleVerifyOrganizer,
};
