const calculateTrend = (currentRank, lastMonthRank) => {
  if (!lastMonthRank || lastMonthRank === 0) {
    return "NEW";
  }
  const diff = lastMonthRank - currentRank;
  if (diff > 0) {
    return `+${diff}`;
  } else if (diff < 0) {
    return `${diff}`;
  }
  return "SAME";
};

module.exports = {
  calculateTrend
};
