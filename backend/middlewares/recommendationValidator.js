const mongoose = require("mongoose");

const validateRecommendations = (req, res, next) => {
  const { hackathonId } = req.params;
  if (!hackathonId) {
    return res.status(400).json({ message: "Hackathon ID is required" });
  }
  if (global.dbMode !== "json" && !mongoose.Types.ObjectId.isValid(hackathonId)) {
    return res.status(400).json({ message: "Invalid Hackathon ID format" });
  }
  next();
};

const validateInvite = (req, res, next) => {
  const { hackathonId, candidateId } = req.body;
  if (!hackathonId || !candidateId) {
    return res.status(400).json({ message: "hackathonId and candidateId are required" });
  }
  if (global.dbMode !== "json") {
    if (!mongoose.Types.ObjectId.isValid(hackathonId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
  }
  next();
};

const validateFeedback = (req, res, next) => {
  const { candidateId, feedback, rating } = req.body;
  if (!candidateId) {
    return res.status(400).json({ message: "candidateId is required" });
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  next();
};

module.exports = {
  validateRecommendations,
  validateInvite,
  validateFeedback
};
