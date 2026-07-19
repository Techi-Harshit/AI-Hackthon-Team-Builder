const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  validateRecommendations,
  validateInvite,
  validateFeedback
} = require("../middlewares/recommendationValidator");
const {
  getRecommendations,
  inviteCandidate,
  getHistory,
  submitFeedback,
  getRecommendedTeams,
  getRecommendedUsers,
  getTopRecruitingTeams,
  getTrendingHackathons,
  getMatchInsights,
  getUserInvitations,
  acceptInvitation,
  rejectInvitation
} = require("../controllers/recommendationController");

router.get("/history", protect, getHistory);
router.get("/recommended-teams", protect, getRecommendedTeams);
router.get("/recommended-users", protect, getRecommendedUsers);
router.get("/top-recruiting-teams", getTopRecruitingTeams);
router.get("/trending-hackathons", getTrendingHackathons);
router.get("/match-insights", protect, getMatchInsights);
router.get("/my-invitations", protect, getUserInvitations);
router.put("/my-invitations/:id/accept", protect, acceptInvitation);
router.put("/my-invitations/:id/reject", protect, rejectInvitation);
router.get("/:hackathonId", protect, validateRecommendations, getRecommendations);
router.post("/invite", protect, validateInvite, inviteCandidate);
router.post("/feedback", protect, validateFeedback, submitFeedback);

module.exports = router;
