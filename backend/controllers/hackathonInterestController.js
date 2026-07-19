const interestService = require("../services/interestService");

const userIdOf = (req) => req.user?._id || req.user?.id;
const errorResponse = (res, error) => {
  const codes = {
    HACKATHON_NOT_FOUND: [404, "Hackathon not found."],
    USER_NOT_FOUND: [401, "User account not found."],
    ALREADY_INTERESTED: [409, "You have already marked interest in this hackathon."],
    INTEREST_NOT_FOUND: [404, "Interest record not found."]
  };
  const [status, message] = codes[error.message] || [500, "Unable to process hackathon interest."];
  return res.status(status).json({ success: false, message });
};

const createInterest = async (req, res) => {
  if (!req.body.hackathonId) return res.status(400).json({ success: false, message: "hackathonId is required." });
  try {
    const result = await interestService.addInterest(userIdOf(req), req.body.hackathonId);
    return res.status(201).json(result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getMyInterests = async (req, res) => {
  try {
    const interests = await interestService.getMyInterestedHackathons(userIdOf(req));
    return res.json({ success: true, interests });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteInterest = async (req, res) => {
  try {
    const result = await interestService.removeInterestById(userIdOf(req), req.params.id);
    return res.json(result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const checkInterest = async (req, res) => {
  try {
    return res.json(await interestService.checkInterest(userIdOf(req), req.params.id));
  } catch (error) {
    return errorResponse(res, error);
  }
};

const discoverInterestedUsers = async (req, res) => {
  try {
    const builders = await interestService.getDiscoverableInterestedUsers(userIdOf(req), req.query);
    return res.json({ success: true, builders });
  } catch (error) {
    return errorResponse(res, error);
  }
};

module.exports = { createInterest, getMyInterests, deleteInterest, checkInterest, discoverInterestedUsers };
