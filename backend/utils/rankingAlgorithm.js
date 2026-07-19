const sortLeaderboardItems = (items) => {
  return [...items].sort((a, b) => {
    // 1. Sort by totalXP descending
    if ((b.totalXP || 0) !== (a.totalXP || 0)) {
      return (b.totalXP || 0) - (a.totalXP || 0);
    }
    // 2. Sort by wins descending
    if ((b.wins || 0) !== (a.wins || 0)) {
      return (b.wins || 0) - (a.wins || 0);
    }
    // 3. Sort by rating descending
    if ((b.rating || 0) !== (a.rating || 0)) {
      return (b.rating || 0) - (a.rating || 0);
    }
    // 4. Sort by hackathonsParticipated descending
    const aPart = a.hackathonsParticipated || a.totalParticipations || 0;
    const bPart = b.hackathonsParticipated || b.totalParticipations || 0;
    if (bPart !== aPart) {
      return bPart - aPart;
    }
    // 5. Sort by updatedAt ascending (older entry gets priority if stats same)
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return aTime - bTime;
  });
};

module.exports = {
  sortLeaderboardItems
};
