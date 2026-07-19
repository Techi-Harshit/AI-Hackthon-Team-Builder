const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  recommendHackathons,
  computeCompatibility,
  checkSkillGap,
  getHackathonMatchmaking,
  askAI,
  reviewResume,
  generateProjectIdeas,
  getUserRegisteredHackathons,
  uploadResume,
  getTeamAnalysis,
} = require("../controllers/aiController");

router.get("/matchmaking/:hackathonId", protect, getHackathonMatchmaking);
router.get("/recommend-hackathons", protect, recommendHackathons);
router.post("/team-compatibility", protect, computeCompatibility);
router.get("/skill-gap", protect, checkSkillGap);
router.get("/user-hackathons", protect, getUserRegisteredHackathons);
router.get("/team-analysis/:teamId", protect, getTeamAnalysis);

// Gemini AI endpoints
router.post("/ask", protect, askAI);
router.post("/resume-review", protect, uploadResume, reviewResume);
router.post("/generate-ideas", protect, generateProjectIdeas);

module.exports = router;
