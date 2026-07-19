const Leaderboard = require("../models/Leaderboard");
const User = require("../models/User");
const Team = require("../models/Team");
const { sortLeaderboardItems } = require("../utils/rankingAlgorithm");
const { calculateTrend } = require("./trendService");
const { calculateBadges } = require("./badgeService");
const { getCurrentSeason } = require("./seasonService");

const calculateLeaderboardRanks = async () => {
  const season = getCurrentSeason();

  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const users = readCollection("users") || [];
    const teams = readCollection("teams") || [];
    let leaderboard = readCollection("leaderboards") || [];

    // Developers Subset
    const devCandidates = users
      .filter(u => (u.totalXP || 0) > 0)
      .map(u => ({
        type: "developer",
        referenceId: String(u._id),
        totalXP: u.totalXP || 0,
        wins: u.wins || 0,
        rating: u.rating || 0,
        hackathonsParticipated: u.hackathonsParticipated || 0,
        category: u.preferredRole || "Full Stack",
        region: u.region || "India",
        originalEntity: u
      }));

    // Teams Subset
    const teamCandidates = teams
      .filter(t => (t.totalXP || 0) > 0)
      .map(t => ({
        type: "team",
        referenceId: String(t._id),
        totalXP: t.totalXP || 0,
        wins: t.wins || 0,
        rating: t.rating || 0,
        hackathonsParticipated: t.hackathonsParticipated || 0,
        category: t.category || t.domain || "Web Development",
        region: t.region || "India",
        members: t.members || [],
        originalEntity: t
      }));

    // Sort Developers
    const sortedDevs = sortLeaderboardItems(devCandidates);
    sortedDevs.forEach((dev, idx) => {
      const newRank = idx + 1;
      const exist = leaderboard.find(l => l.season === season && l.type === "developer" && String(l.referenceId) === String(dev.referenceId));
      const oldRank = exist ? exist.currentRank : 0;
      
      const newEntry = {
        _id: exist ? exist._id : "lead_" + Math.random().toString(36).substr(2, 9),
        type: "developer",
        referenceId: dev.referenceId,
        currentRank: newRank,
        lastMonthRank: exist ? exist.lastMonthRank : newRank,
        totalXP: dev.totalXP,
        wins: dev.wins,
        rating: dev.rating,
        hackathonsParticipated: dev.hackathonsParticipated,
        category: dev.category,
        region: dev.region,
        trend: calculateTrend(newRank, oldRank || newRank),
        badges: calculateBadges("developer", dev.originalEntity, newRank),
        season,
        isActive: true,
        updatedAt: new Date()
      };

      if (exist) {
        Object.assign(exist, newEntry);
      } else {
        leaderboard.push(newEntry);
      }
    });

    // Sort Teams
    const sortedTeams = sortLeaderboardItems(teamCandidates);
    sortedTeams.forEach((team, idx) => {
      const newRank = idx + 1;
      const exist = leaderboard.find(l => l.season === season && l.type === "team" && String(l.referenceId) === String(team.referenceId));
      const oldRank = exist ? exist.currentRank : 0;

      const newEntry = {
        _id: exist ? exist._id : "lead_" + Math.random().toString(36).substr(2, 9),
        type: "team",
        referenceId: team.referenceId,
        currentRank: newRank,
        lastMonthRank: exist ? exist.lastMonthRank : newRank,
        totalXP: team.totalXP,
        wins: team.wins,
        rating: team.rating,
        hackathonsParticipated: team.hackathonsParticipated,
        category: team.category,
        region: team.region,
        members: team.members,
        trend: calculateTrend(newRank, oldRank || newRank),
        badges: calculateBadges("team", team.originalEntity, newRank),
        season,
        isActive: true,
        updatedAt: new Date()
      };

      if (exist) {
        Object.assign(exist, newEntry);
      } else {
        leaderboard.push(newEntry);
      }
    });

    writeCollection("leaderboards", leaderboard);
    return true;
  } else {
    // MongoDB updates
    const [users, teams] = await Promise.all([
      User.find({ totalXP: { $gt: 0 } }).lean(),
      Team.find({ totalXP: { $gt: 0 } }).lean()
    ]);

    // Developers Subset
    const devCandidates = users.map(u => ({
      type: "developer",
      referenceId: u._id,
      totalXP: u.totalXP || 0,
      wins: u.wins || 0,
      rating: u.rating || 0,
      hackathonsParticipated: u.hackathonsParticipated || 0,
      category: u.preferredRole || "Full Stack",
      region: u.region || "India",
      originalEntity: u
    }));

    // Teams Subset
    const teamCandidates = teams.map(t => ({
      type: "team",
      referenceId: t._id,
      totalXP: t.totalXP || 0,
      wins: t.wins || 0,
      rating: t.rating || 0,
      hackathonsParticipated: t.hackathonsParticipated || 0,
      category: t.category || t.domain || "Web Development",
      region: t.region || "India",
      members: t.members || [],
      originalEntity: t
    }));

    // Sort and Update Developers
    const sortedDevs = sortLeaderboardItems(devCandidates);
    for (let i = 0; i < sortedDevs.length; i++) {
      const dev = sortedDevs[i];
      const newRank = i + 1;
      const exist = await Leaderboard.findOne({ season, type: "developer", referenceId: dev.referenceId });
      const oldRank = exist ? exist.currentRank : 0;

      await Leaderboard.findOneAndUpdate(
        { season, type: "developer", referenceId: dev.referenceId },
        {
          currentRank: newRank,
          lastMonthRank: exist ? exist.lastMonthRank : newRank,
          totalXP: dev.totalXP,
          wins: dev.wins,
          rating: dev.rating,
          hackathonsParticipated: dev.hackathonsParticipated,
          category: dev.category,
          region: dev.region,
          trend: calculateTrend(newRank, oldRank || newRank),
          badges: calculateBadges("developer", dev.originalEntity, newRank),
          isActive: true
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    // Sort and Update Teams
    const sortedTeams = sortLeaderboardItems(teamCandidates);
    for (let i = 0; i < sortedTeams.length; i++) {
      const team = sortedTeams[i];
      const newRank = i + 1;
      const exist = await Leaderboard.findOne({ season, type: "team", referenceId: team.referenceId });
      const oldRank = exist ? exist.currentRank : 0;

      await Leaderboard.findOneAndUpdate(
        { season, type: "team", referenceId: team.referenceId },
        {
          currentRank: newRank,
          lastMonthRank: exist ? exist.lastMonthRank : newRank,
          totalXP: team.totalXP,
          wins: team.wins,
          rating: team.rating,
          hackathonsParticipated: team.hackathonsParticipated,
          category: team.category,
          region: team.region,
          members: team.members,
          trend: calculateTrend(newRank, oldRank || newRank),
          badges: calculateBadges("team", team.originalEntity, newRank),
          isActive: true
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    return true;
  }
};

module.exports = {
  calculateLeaderboardRanks
};
