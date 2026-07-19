require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Team = require("../models/Team");
const Leaderboard = require("../models/Leaderboard");
const Hackathon = require("../models/Hackathon");
const { calculateLeaderboardRanks } = require("../services/rankingService");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://cosmicHarshit:htk123@cosmichero.zzdzsxz.mongodb.net/userRoute?appName=cosmicHero";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");

    // Clear existing Leaderboard collection entries
    console.log("Clearing existing entries...");
    await Leaderboard.deleteMany({});
    await Hackathon.deleteMany({});

    console.log("Seeding sample hackathons...");
    const hack1 = await Hackathon.create({
      title: "Smart India Hackathon 2026",
      description: "National level hackathon organized by AICTE.",
      organizer: "Ministry of Education, Govt. of India",
      theme: "Web & Mobile App Development",
      mode: "Offline",
      onlineOffline: "Offline",
      location: "New Delhi, India",
      registrationDeadline: new Date("2026-09-15"),
      startDate: new Date("2026-09-25"),
      endDate: new Date("2026-09-27"),
      prizePool: "₹10,00,000",
      status: "Published",
      logo: "🇮🇳",
      logoBg: "from-orange-500 to-green-500",
      isVerified: true
    });

    const hack2 = await Hackathon.create({
      title: "HackNexus Global",
      description: "The ultimate AI & ML product challenge.",
      organizer: "GDG Cloud",
      theme: "Artificial Intelligence",
      mode: "Online",
      onlineOffline: "Online",
      location: "Global",
      registrationDeadline: new Date("2026-10-01"),
      startDate: new Date("2026-10-10"),
      endDate: new Date("2026-10-12"),
      prizePool: "$25,000",
      status: "Published",
      logo: "🌌",
      logoBg: "from-purple-500 to-indigo-500",
      isVerified: true
    });

    const hack3 = await Hackathon.create({
      title: "Web3 Solana Buildathon",
      description: "Build high-throughput decentralized protocols.",
      organizer: "Solana Labs",
      theme: "Blockchain & DeFi",
      mode: "Hybrid",
      onlineOffline: "Hybrid",
      location: "San Francisco, USA",
      registrationDeadline: new Date("2026-11-05"),
      startDate: new Date("2026-11-12"),
      endDate: new Date("2026-11-15"),
      prizePool: "$15,000",
      status: "Published",
      logo: "☀️",
      logoBg: "from-cyan-400 to-purple-600",
      isVerified: true
    });

    console.log("Seeding sample users...");
    const usersData = [
      { name: "Harshit Keshari", email: "harshit@gmail.com", password: "password123", totalXP: 22000, wins: 3, rating: 4.7, hackathonsParticipated: 6, hackathonsWon: 3, projectsCompleted: 4, region: "India", preferredRole: "Full Stack" },
      { name: "Alice Dev", email: "alice@gmail.com", password: "password123", totalXP: 28000, wins: 4, rating: 4.8, hackathonsParticipated: 8, hackathonsWon: 4, projectsCompleted: 6, region: "USA", preferredRole: "AI/ML" },
      { name: "Bob Builder", email: "bob@gmail.com", password: "password123", totalXP: 14000, wins: 1, rating: 4.3, hackathonsParticipated: 4, hackathonsWon: 1, projectsCompleted: 3, region: "India", preferredRole: "Backend" },
      { name: "Charlie Hacker", email: "charlie@gmail.com", password: "password123", totalXP: 31000, wins: 5, rating: 4.9, hackathonsParticipated: 10, hackathonsWon: 5, projectsCompleted: 8, region: "Global", preferredRole: "Full Stack" }
    ];

    const seededUsers = [];
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (user) {
        console.log(`Updating existing user: ${u.name}`);
        user.totalXP = u.totalXP;
        user.wins = u.wins;
        user.rating = u.rating;
        user.hackathonsParticipated = u.hackathonsParticipated;
        user.hackathonsWon = u.hackathonsWon;
        user.projectsCompleted = u.projectsCompleted;
        user.region = u.region;
        // Keep registration array reference clean
        user.registeredHackathons = [hack1._id, hack2._id];
        await user.save();
      } else {
        console.log(`Creating new user: ${u.name}`);
        u.registeredHackathons = [hack1._id, hack2._id];
        user = await User.create(u);
      }
      seededUsers.push(user);
    }

    console.log("Seeding sample teams...");
    const teamsData = [
      { teamName: "Code Warriors", leader: seededUsers[0]._id, members: [seededUsers[0]._id, seededUsers[1]._id], hackathonId: hack1._id, totalXP: 33000, wins: 4, rating: 4.8, hackathonsParticipated: 10, hackathonsWon: 4, category: "AI/ML", region: "India" },
      { teamName: "Tech Titans", leader: seededUsers[2]._id, members: [seededUsers[2]._id, seededUsers[3]._id], hackathonId: hack2._id, totalXP: 45000, wins: 6, rating: 4.9, hackathonsParticipated: 12, hackathonsWon: 6, category: "Web Development", region: "USA" },
      { teamName: "AI Innovators", leader: seededUsers[1]._id, members: [seededUsers[1]._id, seededUsers[3]._id], hackathonId: hack3._id, totalXP: 41000, wins: 5, rating: 4.7, hackathonsParticipated: 9, hackathonsWon: 5, category: "Blockchain", region: "India" }
    ];

    for (const t of teamsData) {
      let team = await Team.findOne({ teamName: t.teamName });
      if (team) {
        console.log(`Updating existing team: ${t.teamName}`);
        team.hackathonId = t.hackathonId;
        team.totalXP = t.totalXP;
        team.wins = t.wins;
        team.rating = t.rating;
        team.hackathonsParticipated = t.hackathonsParticipated;
        team.hackathonsWon = t.hackathonsWon;
        team.region = t.region;
        await team.save();
      } else {
        console.log(`Creating new team: ${t.teamName}`);
        await Team.create(t);
      }
    }

    console.log("Running leaderboard rankings recalculation...");
    await calculateLeaderboardRanks();
    console.log("Rankings calculated successfully!");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

seedData();
