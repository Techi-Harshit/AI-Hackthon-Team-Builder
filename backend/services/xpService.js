const User = require("../models/User");
const Team = require("../models/Team");
const { calculateEventXP } = require("../utils/calculateXP");

const addDeveloperXP = async (userId, eventType, count = 1) => {
  const xp = calculateEventXP(eventType, count);
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const users = readCollection("users") || [];
    const user = users.find(u => String(u._id) === String(userId));
    if (user) {
      user.totalXP = (user.totalXP || 0) + xp;
      if (eventType.includes("WIN")) {
        user.wins = (user.wins || 0) + 1;
        user.hackathonsWon = (user.hackathonsWon || 0) + 1;
        user.rating = (user.rating || 0) + 0.2;
      }
      if (eventType === "PARTICIPATION") {
        user.hackathonsParticipated = (user.hackathonsParticipated || 0) + 1;
      }
      user.updatedAt = new Date();
      writeCollection("users", users);
      return user;
    }
  } else {
    const update = { $inc: { totalXP: xp } };
    if (eventType.includes("WIN")) {
      update.$inc.wins = 1;
      update.$inc.hackathonsWon = 1;
      update.$inc.rating = 0.2;
    }
    if (eventType === "PARTICIPATION") {
      update.$inc.hackathonsParticipated = 1;
    }
    return await User.findByIdAndUpdate(userId, update, { new: true });
  }
};

const addTeamXP = async (teamId, eventType, count = 1) => {
  const xp = calculateEventXP(eventType, count);
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const teams = readCollection("teams") || [];
    const team = teams.find(t => String(t._id) === String(teamId));
    if (team) {
      team.totalXP = (team.totalXP || 0) + xp;
      if (eventType.includes("WIN")) {
        team.wins = (team.wins || 0) + 1;
        team.hackathonsWon = (team.hackathonsWon || 0) + 1;
        team.rating = (team.rating || 0) + 0.2;
      }
      if (eventType === "PARTICIPATION") {
        team.hackathonsParticipated = (team.hackathonsParticipated || 0) + 1;
      }
      team.updatedAt = new Date();
      writeCollection("teams", teams);
      return team;
    }
  } else {
    const update = { $inc: { totalXP: xp } };
    if (eventType.includes("WIN")) {
      update.$inc.wins = 1;
      update.$inc.hackathonsWon = 1;
      update.$inc.rating = 0.2;
    }
    if (eventType === "PARTICIPATION") {
      update.$inc.hackathonsParticipated = 1;
    }
    return await Team.findByIdAndUpdate(teamId, update, { new: true });
  }
};

module.exports = {
  addDeveloperXP,
  addTeamXP
};
