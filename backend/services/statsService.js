const getLeaderboardStats = async (season = 1) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const teams = readCollection("teams") || [];
    const users = readCollection("users") || [];
    const hackathons = readCollection("hackathons") || [];

    const activeParticipants = users.filter(u => (u.totalXP || 0) > 0).length;

    return {
      totalTeams: teams.length,
      totalDevelopers: users.length,
      totalHackathons: hackathons.length,
      activeParticipants,
      currentSeason: season
    };
  } else {
    const Team = require("../models/Team");
    const User = require("../models/User");
    const Hackathon = require("../models/Hackathon");

    const [totalTeams, totalDevelopers, totalHackathons] = await Promise.all([
      Team.countDocuments(),
      User.countDocuments(),
      Hackathon.countDocuments()
    ]);

    const activeParticipants = await User.countDocuments({ totalXP: { $gt: 0 } });

    return {
      totalTeams,
      totalDevelopers,
      totalHackathons,
      activeParticipants,
      currentSeason: season
    };
  }
};

module.exports = {
  getLeaderboardStats
};
