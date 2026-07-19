const Leaderboard = require("../models/Leaderboard");
const Team = require("../models/Team");
const User = require("../models/User");
const { getCurrentSeason } = require("./seasonService");

// Get dynamic podium ranks (1, 2, 3)
const getTopThree = async (type = "team", season = 1) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const leaderboard = readCollection("leaderboards") || [];
    const users = readCollection("users") || [];
    const teams = readCollection("teams") || [];

    const filtered = leaderboard.filter(l => l.season === season && l.type === type);
    filtered.sort((a, b) => (a.currentRank || 999) - (b.currentRank || 999));

    const top3 = filtered.slice(0, 3).map(l => {
      const copy = { ...l };
      if (type === "developer") {
        const u = users.find(item => String(item._id) === String(l.referenceId));
        copy.name = u ? u.name : "Developer";
        copy.avatar = u ? u.avatar : "";
      } else {
        const t = teams.find(item => String(item._id) === String(l.referenceId));
        copy.name = t ? t.teamName : "Team";
        copy.logo = t ? t.teamLogo : "";
      }
      return copy;
    });

    return {
      rank1: top3[0] || null,
      rank2: top3[1] || null,
      rank3: top3[2] || null
    };
  } else {
    const top3 = await Leaderboard.find({ season, type })
      .sort({ currentRank: 1 })
      .limit(3)
      .lean();

    // Populate Names
    for (const r of top3) {
      if (type === "developer") {
        const u = await User.findById(r.referenceId).select("name avatar").lean();
        if (u) {
          r.name = u.name;
          r.avatar = u.avatar;
        }
      } else {
        const t = await Team.findById(r.referenceId).select("teamName teamLogo").lean();
        if (t) {
          r.name = t.teamName;
          r.logo = t.teamLogo;
        }
      }
    }

    return {
      rank1: top3[0] || null,
      rank2: top3[1] || null,
      rank3: top3[2] || null
    };
  }
};

// Retrieve User's Active Team Placement
const getMyTeamRank = async (userId, season = 1) => {
  let userTeam = null;

  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const teams = readCollection("teams") || [];
    userTeam = teams.find(t => String(t.leader) === String(userId) || (t.members || []).some(m => String(m) === String(userId)));
    if (!userTeam) return null;

    const leaderboard = readCollection("leaderboards") || [];
    const match = leaderboard.find(l => l.season === season && l.type === "team" && String(l.referenceId) === String(userTeam._id));
    
    if (match) {
      const allTeams = leaderboard.filter(l => l.season === season && l.type === "team");
      const betterTeams = allTeams.filter(l => l.currentRank < match.currentRank).length;
      const percentile = allTeams.length > 0 ? Math.round((betterTeams / allTeams.length) * 100) : 100;
      
      return {
        teamName: userTeam.teamName,
        rank: match.currentRank,
        xp: match.totalXP,
        growth: 4.8,
        message: percentile <= 10 ? `Top ${percentile || 5}% Teams` : "Keep building to reach the top!"
      };
    }
  } else {
    userTeam = await Team.findOne({
      $or: [{ leader: userId }, { members: userId }]
    }).lean();

    if (!userTeam) return null;

    const match = await Leaderboard.findOne({ season, type: "team", referenceId: userTeam._id }).lean();
    if (match) {
      const totalTeams = await Leaderboard.countDocuments({ season, type: "team" });
      const betterTeams = await Leaderboard.countDocuments({ season, type: "team", currentRank: { $lt: match.currentRank } });
      const percentile = totalTeams > 0 ? Math.round((betterTeams / totalTeams) * 100) : 100;

      return {
        teamName: userTeam.teamName,
        rank: match.currentRank,
        xp: match.totalXP,
        growth: 5.2,
        message: percentile <= 10 ? `Top ${percentile || 5}% Teams` : "Keep building to reach the top!"
      };
    }
  }
  return null;
};

// Compile Leaderboard top categories insights dynamically
const getLeaderboardInsights = async (season = 1) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const leaderboard = readCollection("leaderboards") || [];
    const users = readCollection("users") || [];
    const teams = readCollection("teams") || [];

    const activeList = leaderboard.filter(l => l.season === season);
    if (activeList.length === 0) return {};

    // Sort helper
    const sortEntities = (type, key) => {
      const subset = activeList.filter(l => l.type === type);
      subset.sort((a, b) => (b[key] || 0) - (a[key] || 0));
      return subset[0] || null;
    };

    const mostActiveL = sortEntities("developer", "hackathonsParticipated") || sortEntities("team", "hackathonsParticipated");
    const topWinnersL = sortEntities("team", "wins") || sortEntities("developer", "wins");
    const topRatedL = sortEntities("team", "rating") || sortEntities("developer", "rating");

    const populateName = (l) => {
      if (!l) return null;
      const copy = { ...l };
      if (l.type === "developer") {
        const u = users.find(item => String(item._id) === String(l.referenceId));
        copy.name = u ? u.name : "Developer";
      } else {
        const t = teams.find(item => String(item._id) === String(l.referenceId));
        copy.name = t ? t.teamName : "Team";
      }
      return copy;
    };

    return {
      mostActive: populateName(mostActiveL),
      topWinners: populateName(topWinnersL),
      topRated: populateName(topRatedL),
      fastestGrowing: populateName(activeList.find(l => l.trend && l.trend.startsWith("+"))) || null
    };
  } else {
    const mostActive = await Leaderboard.findOne({ season }).sort({ hackathonsParticipated: -1 }).lean();
    const topWinners = await Leaderboard.findOne({ season }).sort({ wins: -1 }).lean();
    const topRated = await Leaderboard.findOne({ season }).sort({ rating: -1 }).lean();
    const fastestGrowing = await Leaderboard.findOne({ season, trend: { $regex: /^\+/ } }).sort({ currentRank: 1 }).lean();

    const populateName = async (r) => {
      if (!r) return null;
      if (r.type === "developer") {
        const u = await User.findById(r.referenceId).select("name avatar").lean();
        if (u) {
          r.name = u.name;
          r.avatar = u.avatar;
        }
      } else {
        const t = await Team.findById(r.referenceId).select("teamName teamLogo").lean();
        if (t) {
          r.name = t.teamName;
          r.logo = t.teamLogo;
        }
      }
      return r;
    };

    return {
      mostActive: await populateName(mostActive),
      topWinners: await populateName(topWinners),
      topRated: await populateName(topRated),
      fastestGrowing: await populateName(fastestGrowing)
    };
  }
};

module.exports = {
  getTopThree,
  getMyTeamRank,
  getLeaderboardInsights
};
