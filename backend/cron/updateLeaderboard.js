const rankingService = require("../services/rankingService");

const initLeaderboardCron = () => {
  console.log("[Leaderboard Cron] Initializing scheduled ranks sync job (Interval: 10 minutes)...");
  
  // Recalculate once on server startup (after 5 seconds delay for DB stabilization)
  setTimeout(async () => {
    try {
      console.log("[Leaderboard Cron] Triggering startup rankings calculation...");
      await rankingService.calculateLeaderboardRanks();
      console.log("[Leaderboard Cron] Startup rankings calculated successfully.");
    } catch (err) {
      console.error("[Leaderboard Cron] Error during startup ranks calculation:", err);
    }
  }, 5000);

  // Every 10 minutes
  setInterval(async () => {
    try {
      console.log("[Leaderboard Cron] Recalculating leaderboard rankings...");
      await rankingService.calculateLeaderboardRanks();
      console.log("[Leaderboard Cron] Rankings updated successfully.");
    } catch (err) {
      console.error("[Leaderboard Cron] Error in update rankings schedule:", err);
    }
  }, 10 * 60 * 1000);
};

module.exports = {
  initLeaderboardCron
};
