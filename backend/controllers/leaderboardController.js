const filterService = require("../services/filterService");
const leaderboardService = require("../services/leaderboardService");
const searchService = require("../services/searchService");
const statsService = require("../services/statsService");
const seasonService = require("../services/seasonService");
const rankingService = require("../services/rankingService");

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || "team";
    const season = seasonService.getCurrentSeason();

    const data = await filterService.filterLeaderboard({ type, season }, page, limit);

    // Populate names for response output
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users") || [];
      const teams = readCollection("teams") || [];

      data.items = data.items.map(item => {
        const copy = { ...item };
        if (copy.type === "developer") {
          const u = users.find(x => String(x._id) === String(copy.referenceId));
          copy.name = u ? u.name : "Developer";
          copy.avatar = u ? u.avatar : "";
          copy.skills = u ? (u.skills || []) : [];
        } else {
          const t = teams.find(x => String(x._id) === String(copy.referenceId));
          copy.name = t ? t.teamName : "Team";
          copy.logo = t ? t.teamLogo : "";
        }
        return copy;
      });
    } else {
      const User = require("../models/User");
      const Team = require("../models/Team");

      for (const item of data.items) {
        if (item.type === "developer") {
          const u = await User.findById(item.referenceId).select("name avatar skills").lean();
          if (u) {
            item.name = u.name;
            item.avatar = u.avatar;
            item.skills = u.skills;
          }
        } else {
          const t = await Team.findById(item.referenceId).select("teamName teamLogo").lean();
          if (t) {
            item.name = t.teamName;
            item.logo = t.teamLogo;
          }
        }
      }
    }

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/top3
const getTop3 = async (req, res) => {
  try {
    const type = req.query.type || "team";
    const season = seasonService.getCurrentSeason();
    const data = await leaderboardService.getTopThree(type, season);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("getTop3 error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/search
const search = async (req, res) => {
  try {
    const queryText = req.query.q || "";
    const season = seasonService.getCurrentSeason();
    const list = await searchService.searchLeaderboard(queryText, season);
    res.status(200).json({ success: true, items: list });
  } catch (error) {
    console.error("search error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/filter
const filter = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, region, type } = req.query;
    const season = seasonService.getCurrentSeason();

    const data = await filterService.filterLeaderboard({ category, region, type, season }, page, limit);

    // Populate names for response output
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users") || [];
      const teams = readCollection("teams") || [];

      data.items = data.items.map(item => {
        const copy = { ...item };
        if (copy.type === "developer") {
          const u = users.find(x => String(x._id) === String(copy.referenceId));
          copy.name = u ? u.name : "Developer";
          copy.avatar = u ? u.avatar : "";
          copy.skills = u ? (u.skills || []) : [];
        } else {
          const t = teams.find(x => String(x._id) === String(copy.referenceId));
          copy.name = t ? t.teamName : "Team";
          copy.logo = t ? t.teamLogo : "";
        }
        return copy;
      });
    } else {
      const User = require("../models/User");
      const Team = require("../models/Team");

      for (const item of data.items) {
        if (item.type === "developer") {
          const u = await User.findById(item.referenceId).select("name avatar skills").lean();
          if (u) {
            item.name = u.name;
            item.avatar = u.avatar;
            item.skills = u.skills;
          }
        } else {
          const t = await Team.findById(item.referenceId).select("teamName teamLogo").lean();
          if (t) {
            item.name = t.teamName;
            item.logo = t.teamLogo;
          }
        }
      }
    }

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("filter error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/stats
const stats = async (req, res) => {
  try {
    const season = seasonService.getCurrentSeason();
    const data = await statsService.getLeaderboardStats(season);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/teams
const teams = async (req, res) => {
  req.query.type = "team";
  return getLeaderboard(req, res);
};

// GET /api/leaderboard/developers
const developers = async (req, res) => {
  req.query.type = "developer";
  return getLeaderboard(req, res);
};

// GET /api/leaderboard/hackathons
const hackathons = async (req, res) => {
  req.query.type = "hackathon";
  return getLeaderboard(req, res);
};

// GET /api/leaderboard/organizations
const organizations = async (req, res) => {
  req.query.type = "organization";
  return getLeaderboard(req, res);
};

// GET /api/leaderboard/insights
const insights = async (req, res) => {
  try {
    const season = seasonService.getCurrentSeason();
    const data = await leaderboardService.getLeaderboardInsights(season);
    res.status(200).json({ success: true, insights: data });
  } catch (error) {
    console.error("insights error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/my-team
const myTeam = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const season = seasonService.getCurrentSeason();
    const data = await leaderboardService.getMyTeamRank(userId, season);
    res.status(200).json({ success: true, myRank: data || null });
  } catch (error) {
    console.error("myTeam error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/seasons
const seasons = async (req, res) => {
  res.status(200).json({ success: true, seasons: [1, 2, 3], currentSeason: seasonService.getCurrentSeason() });
};

// GET /api/leaderboard/trending
const trending = async (req, res) => {
  try {
    const season = seasonService.getCurrentSeason();
    const list = await filterService.filterLeaderboard({ season }, 1, 5);
    res.status(200).json({ success: true, items: list.items });
  } catch (error) {
    console.error("trending error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leaderboard/badges
const badges = async (req, res) => {
  res.status(200).json({
    success: true,
    badges: ["Top 10", "Top 50", "Champion Team", "Top Rated", "Most Active", "Expert Builder", "Rising Star"]
  });
};

// Manual Force Trigger rank recalculations
const forceRecalculate = async (req, res) => {
  try {
    await rankingService.calculateLeaderboardRanks();
    res.status(200).json({ success: true, message: "Leaderboard ranks calculated successfully." });
  } catch (error) {
    console.error("forceRecalculate error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getTop3,
  search,
  filter,
  stats,
  teams,
  developers,
  hackathons,
  organizations,
  insights,
  myTeam,
  seasons,
  trending,
  badges,
  forceRecalculate
};
