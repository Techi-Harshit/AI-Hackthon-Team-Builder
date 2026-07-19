const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { leaderboardCache } = require("../middleware/leaderboardCache");

const {
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
} = require("../controllers/leaderboardController");

// Cache-backed public read queries (cache for 10 seconds)
router.get("/", leaderboardCache(10), getLeaderboard);
router.get("/top3", leaderboardCache(10), getTop3);
router.get("/search", search); // Search is dynamic (no caching)
router.get("/filter", leaderboardCache(10), filter);
router.get("/stats", leaderboardCache(10), stats);
router.get("/teams", leaderboardCache(10), teams);
router.get("/developers", leaderboardCache(10), developers);
router.get("/hackathons", leaderboardCache(10), hackathons);
router.get("/organizations", leaderboardCache(10), organizations);
router.get("/insights", leaderboardCache(10), insights);
router.get("/seasons", leaderboardCache(30), seasons);
router.get("/trending", leaderboardCache(10), trending);
router.get("/badges", leaderboardCache(30), badges);

// Auth-dependent query (myTeam status)
router.get("/my-team", protect, myTeam);

// Force calculate ranks (secured or admin)
router.post("/recalculate", protect, forceRecalculate);

module.exports = router;
