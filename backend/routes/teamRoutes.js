const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/authMiddleware"
);

const {
  createTeam,
  getTeams,
  getTeamById,
  getRecommendedTeams,
  removeMember,
  getMostActiveTeams,
  getNewTeams,
  getHighMatchTeams,
} = require(
  "../controllers/teamController"
);

router.post("/", protect, createTeam);

router.get("/", protect, getTeams);

router.get("/recommendations", protect, getRecommendedTeams);

router.get("/most-active", protect, getMostActiveTeams);

router.get("/new", protect, getNewTeams);

router.get("/high-match", protect, getHighMatchTeams);

router.get("/:id", getTeamById);

router.put("/:id/remove-member", protect, removeMember);

const { inviteCandidate } = require("../controllers/recommendationController");
router.post("/invite", protect, inviteCandidate);

const {
  getTeamChats,
  createTeamChat,
  voteTeamChatPoll
} = require("../controllers/teamChatController");

router.get("/:id/chats", protect, getTeamChats);
router.post("/:id/chats", protect, createTeamChat);
router.post("/:id/chats/vote", protect, voteTeamChatPoll);

module.exports = router;
