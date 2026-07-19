const XP_VALUES = {
  HACKATHON_WIN_1ST: 5000,
  HACKATHON_WIN_2ND: 3000,
  HACKATHON_WIN_3RD: 1500,
  PARTICIPATION: 500,
  PROJECT_SUBMISSION: 300,
  PROFILE_COMPLETION: 100,
  WINNING_STREAK: 1000,
  TOP_RATED_TEAM: 500,
  MENTOR_CHOICE: 2000,
  TOP_10_FINISH: 1000
};

const calculateEventXP = (eventType, count = 1) => {
  const value = XP_VALUES[eventType] || 0;
  return value * count;
};

module.exports = {
  XP_VALUES,
  calculateEventXP
};
