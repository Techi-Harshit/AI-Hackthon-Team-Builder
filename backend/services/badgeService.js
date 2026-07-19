const calculateBadges = (type, item, currentRank) => {
  const badges = [];
  
  if (currentRank > 0 && currentRank <= 10) {
    badges.push("Top 10");
  } else if (currentRank > 10 && currentRank <= 50) {
    badges.push("Top 50");
  }

  const winsCount = item.wins || item.hackathonsWon || 0;
  if (winsCount >= 5) {
    badges.push(type === "team" ? "Champion Team" : "Champion Developer");
  }

  const ratingVal = item.rating || item.averageRating || 0;
  if (ratingVal >= 4.5) {
    badges.push("Top Rated");
  }

  const partCount = item.hackathonsParticipated || item.totalHackathons || 0;
  if (partCount >= 8) {
    badges.push("Most Active");
  }

  if ((item.totalXP || 0) >= 15000) {
    badges.push("Expert Builder");
  }

  if ((item.totalXP || 0) >= 30000) {
    badges.push("Rising Star");
  }

  return [...new Set(badges)];
};

module.exports = {
  calculateBadges
};
