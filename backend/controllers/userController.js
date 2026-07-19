const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DEMO_USER_EMAIL = "demo@cosmoq.app";

const buildDemoUser = (password) => ({
  name: "Aarav Sharma",
  email: DEMO_USER_EMAIL,
  password,
  college: "Indian Institute of Technology Delhi",
  branch: "Computer Science and Engineering",
  year: 3,
  skills: ["React", "Node.js", "Python", "Machine Learning", "UI/UX"],
  preferredRole: "Full Stack",
  interests: ["Artificial Intelligence", "Open Source", "Product Development"],
  interestedDomains: ["Web Development", "AI/ML", "Developer Tools"],
  availability: "Weekend",
  location: "New Delhi, India",
  github: "https://github.com/aarav-sharma-demo",
  linkedin: "https://www.linkedin.com/in/aarav-sharma-demo",
  resumeText: "Aarav Sharma - Full Stack Developer and AI enthusiast.",
  bio: "Full stack developer who enjoys building practical AI-powered products with collaborative teams.",
  experience: "Intermediate",
  experienceLevel: "Intermediate",
  avatar: "https://i.pravatar.cc/300?img=12",
  lookingForTeam: true,
  projects: [
    {
      title: "Campus Connect",
      description: "A collaboration platform for student communities.",
      technologies: ["React", "Node.js", "MongoDB"],
    },
  ],
  registeredHackathons: [],
  interestedHackathons: [],
  notifications: [],
  badges: [],
  totalHackathons: 0,
  completedHackathons: 0,
  hackathonsParticipated: 0,
  hackathonsWon: 0,
  projectsCompleted: 0,
  totalXP: 0,
  rating: 0,
  wins: 0,
  profileViews: 0,
  trustScore: 50,
  averageRating: 0,
  role: "participant",
  isVerified: true,
  profileCompletion: 100,
});

// Creates the demo account only once and logs it in through the normal JWT flow.
const demoLogin = async (req, res) => {
  try {
    let user;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      user = users.find((item) => item.email === DEMO_USER_EMAIL);

      if (!user) {
        const password = await bcrypt.hash("demo-login-account", 10);
        user = {
          _id: `demo-${Date.now()}`,
          ...buildDemoUser(password),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActive: new Date(),
        };
        users.push(user);
        writeCollection("users", users);
      } else {
        user.lastActive = new Date();
        user.updatedAt = new Date();
        writeCollection("users", users);
      }
    } else {
      user = await User.findOne({ email: DEMO_USER_EMAIL });

      if (!user) {
        const password = await bcrypt.hash("demo-login-account", 10);
        user = await User.create(buildDemoUser(password));
      } else {
        user.lastActive = new Date();
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "harshit_hackteam_secret_2026",
      { expiresIn: "7d" }
    );

    return res.status(200).json({ message: "Demo login successful", token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      college,
      branch,
      year,
      skills,
      preferredRole,
      interests,
      availability,
      location,
      github,
      linkedin,
      bio,
      experience,
    } = req.body;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const userExists = users.find((u) => u.email === email);

      if (userExists) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: new Date().getTime().toString(),
        name,
        email,
        password: hashedPassword,
        college: college || "",
        branch: branch || "",
        year: year || null,
        skills: skills || [],
        preferredRole: preferredRole || "Full Stack",
        interests: interests || [],
        availability: availability || "Anytime",
        location: location || "",
        github: github || "",
        linkedin: linkedin || "",
        bio: bio || "",
        experience: experience || "Beginner",
        trustScore: 50,
        totalHackathons: 0,
        completedHackathons: 0,
        averageRating: 0,
        role: "participant",
        avatar: req.body.avatar || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      users.push(newUser);
      writeCollection("users", users);

      // Exclude password in response
      const { password: pw, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        message: "User Registered Successfully",
        user: userWithoutPassword,
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      college,
      branch,
      year,
      skills,
      preferredRole,
      interests,
      availability,
      location,
      github,
      linkedin,
      bio,
      experience,
      avatar: req.body.avatar || "",
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const user = users.find((u) => u.email === email);

      if (!user) {
        return res.status(400).json({
          message: "Invalid Email or Password",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid Email or Password",
        });
      }

      const index = users.findIndex((u) => u.email === email);
      if (index !== -1) {
        users[index].lastActive = new Date();
        const { writeCollection } = require("../utils/jsonDb");
        writeCollection("users", users);
      }

      const token = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_SECRET || "harshit_hackteam_secret_2026",
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        message: "Login Successful",
        token,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons") || [];
      
      const populatedHackathons = (req.user.registeredHackathons || []).map((hId) => 
        hackathons.find((h) => h._id === hId)
      ).filter(Boolean);

      const populatedInterested = (req.user.interestedHackathons || []).map((hId) => 
        hackathons.find((h) => h._id === hId)
      ).filter(Boolean);

      return res.status(200).json({
        ...req.user,
        registeredHackathons: populatedHackathons,
        interestedHackathons: populatedInterested
      });
    }

    const populatedUser = await User.findById(req.user._id)
      .select("-password")
      .populate("registeredHackathons")
      .populate("interestedHackathons");

    res.status(200).json(populatedUser);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const index = users.findIndex((u) => u._id === req.user._id);

      if (index === -1) {
        return res.status(404).json({
          message: "User Not Found",
        });
      }

      const user = users[index];

      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
          return res.status(400).json({ message: "Current password is required" });
        }
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
      }

      user.name = req.body.name || user.name;
      user.college = req.body.college || user.college;
      user.branch = req.body.branch || user.branch;
      user.year = req.body.year || user.year;
      user.skills = req.body.skills || user.skills;
      user.preferredRole = req.body.preferredRole || user.preferredRole;
      user.interests = req.body.interests || user.interests;
      user.availability = req.body.availability || user.availability;
      user.location = req.body.location || user.location;
      user.github = req.body.github || user.github;
      user.linkedin = req.body.linkedin || user.linkedin;
      user.bio = req.body.bio || user.bio;
      user.experience = req.body.experience || user.experience;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      user.role = req.body.role || user.role;
      user.lookingForTeam = req.body.lookingForTeam !== undefined ? req.body.lookingForTeam : (user.lookingForTeam !== undefined ? user.lookingForTeam : true);
      user.lastActive = new Date();

      const calculateProfileCompletion = require("../utils/calculateProfileCompletion");
      user.profileCompletion = calculateProfileCompletion(user);
      user.updatedAt = new Date();

      users[index] = user;
      writeCollection("users", users);

      const { password: pw, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    user.name = req.body.name || user.name;
    user.college = req.body.college || user.college;
    user.branch = req.body.branch || user.branch;
    user.year = req.body.year || user.year;
    user.skills = req.body.skills || user.skills;

    user.preferredRole =
      req.body.preferredRole || user.preferredRole;

    user.interests =
      req.body.interests || user.interests;

    user.availability =
      req.body.availability || user.availability;

    user.location =
      req.body.location || user.location;

    user.github =
      req.body.github || user.github;

    user.linkedin =
      req.body.linkedin || user.linkedin;

    user.bio =
      req.body.bio || user.bio;

    user.experience =
      req.body.experience || user.experience;

    user.experienceLevel =
      req.body.experienceLevel || user.experienceLevel || (req.body.experience || user.experience);

    user.avatar =
      req.body.avatar !== undefined ? req.body.avatar : user.avatar;

    user.role =
      req.body.role || user.role;

    if (req.body.lookingForTeam !== undefined) {
      user.lookingForTeam = req.body.lookingForTeam;
    }

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Notifications
const getNotifications = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const user = users.find((u) => u._id === req.user._id);
      return res.status(200).json(user?.notifications || []);
    }

    const user = await User.findById(req.user._id).select("notifications");
    res.status(200).json(user?.notifications || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Notifications as Read
const markNotificationsRead = async (req, res) => {
  try {
    const { notificationId } = req.body; // if undefined, mark all as read

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const index = users.findIndex((u) => u._id === req.user._id);
      if (index === -1) {
        return res.status(404).json({ message: "User not found" });
      }

      if (users[index].notifications) {
        users[index].notifications = users[index].notifications.map((n) => {
          if (!notificationId || String(n._id) === String(notificationId)) {
            return { ...n, read: true };
          }
          return n;
        });
      }
      writeCollection("users", users);
      return res.status(200).json({ message: "Notifications marked as read" });
    }

    if (notificationId) {
      await User.updateOne(
        { _id: req.user._id, "notifications._id": notificationId },
        { $set: { "notifications.$.read": true } }
      );
    } else {
      await User.updateOne(
        { _id: req.user._id },
        { $set: { "notifications.$[].read": true } }
      );
    }

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const index = users.findIndex((u) => u._id === req.user._id);
      if (index === -1) {
        return res.status(404).json({ message: "User not found" });
      }

      if (users[index].notifications) {
        users[index].notifications = users[index].notifications.filter(
          (n) => String(n._id) !== String(notificationId)
        );
      }
      writeCollection("users", users);
      return res.status(200).json({ message: "Notification dismissed successfully" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { notifications: { _id: notificationId } },
    });

    res.status(200).json({ message: "Notification dismissed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  demoLogin,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationsRead,
  deleteNotification,
};
