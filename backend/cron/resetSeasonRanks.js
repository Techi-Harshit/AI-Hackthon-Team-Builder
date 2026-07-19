const Leaderboard = require("../models/Leaderboard");

const resetSeasonRanks = async (newSeason = 2) => {
  try {
    console.log(`[Season Reset] Preparing ranks transition to Season ${newSeason}...`);
    
    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const leaderboard = readCollection("leaderboards") || [];
      
      // Archive existing entries under last season rank
      leaderboard.forEach(l => {
        l.lastMonthRank = l.currentRank;
        l.seasonRank = l.currentRank;
        l.trend = "SAME";
      });
      
      writeCollection("leaderboards", leaderboard);
    } else {
      // Backup currentRank as lastMonthRank / seasonRank
      await Leaderboard.updateMany(
        { isActive: true },
        [
          {
            $set: {
              lastMonthRank: "$currentRank",
              seasonRank: "$currentRank",
              currentRank: 0,
              totalXP: 0,
              wins: 0,
              rating: 0,
              season: newSeason
            }
          }
        ]
      );
    }

    console.log(`[Season Reset] Season transition completed successfully.`);
  } catch (err) {
    console.error(`[Season Reset] Error resetting season ranks:`, err);
  }
};

module.exports = {
  resetSeasonRanks
};
