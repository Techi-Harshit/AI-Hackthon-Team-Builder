const service = require("../services/recommendationService");

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hackathonId } = req.params;
    const isWizard = req.query.wizard === "true";
    const result = await service.getRecommendations(userId, hackathonId, isWizard);
    res.status(200).json({
      success: true,
      team: result.team,
      hackathon: result.hackathon,
      recommendations: result.recommendations
    });
  } catch (error) {
    const errMsg = error.message;
    let statusCode = 500;
    let errorCode = "SERVER_ERROR";
    let message = "Something went wrong.";

    if (errMsg === "HACKATHON_NOT_FOUND") {
      statusCode = 404;
      errorCode = "HACKATHON_NOT_FOUND";
      message = "Hackathon Not Found";
    } else if (errMsg === "USER_NOT_FOUND") {
      statusCode = 404;
      errorCode = "USER_NOT_FOUND";
      message = "User Not Found";
    } else if (errMsg === "TEAM_NOT_FOUND") {
      statusCode = 404;
      errorCode = "TEAM_NOT_FOUND";
      message = "Team Not Found";
    } else if (errMsg === "USER_NOT_REGISTERED") {
      statusCode = 403;
      errorCode = "USER_NOT_REGISTERED";
      message = "You must show interest in this hackathon before using AI Recommendations.";
    } else if (errMsg === "NOT_TEAM_LEADER") {
      statusCode = 403;
      errorCode = "NOT_TEAM_LEADER";
      message = "Only the team leader can access AI Recommendations.";
    } else if (errMsg === "TEAM_NOT_RECRUITING") {
      statusCode = 403;
      errorCode = "TEAM_NOT_RECRUITING";
      message = "This team is not currently recruiting.";
    } else if (errMsg === "TEAM_FULL") {
      statusCode = 403;
      errorCode = "TEAM_FULL";
      message = "This team is already full.";
    } else if (errMsg === "UNAUTHORIZED") {
      statusCode = 401;
      errorCode = "UNAUTHORIZED";
      message = "Unauthorized access.";
    }

    res.status(statusCode).json({
      success: false,
      errorCode,
      message
    });
  }
};

const inviteCandidate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hackathonId, candidateId } = req.body;
    const result = await service.inviteCandidate(userId, hackathonId, candidateId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await service.getHistory(userId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { candidateId, feedback, rating } = req.body;
    const result = await service.submitFeedback(userId, candidateId, feedback, rating);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendedTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    const teams = await service.getRecommendedTeams(userId);
    res.status(200).json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecommendedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await service.getRecommendedUsers(userId);
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopRecruitingTeams = async (req, res) => {
  try {
    const teams = await service.getTopRecruitingTeams();
    res.status(200).json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTrendingHackathons = async (req, res) => {
  try {
    const hackathons = await service.getTrendingHackathons();
    res.status(200).json({ success: true, hackathons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMatchInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const insights = await service.getMatchInsights(userId);
    res.status(200).json({ success: true, insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserInvitations = async (req, res) => {
  try {
    const userId = req.user._id;
    const invitations = await service.getUserInvitations(userId);
    res.status(200).json({ success: true, invitations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const invitationId = req.params.id;
    const result = await service.acceptInvitation(invitationId, candidateId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const invitationId = req.params.id;
    const result = await service.rejectInvitation(invitationId, candidateId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
