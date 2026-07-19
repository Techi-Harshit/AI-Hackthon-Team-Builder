const localCacheStore = {};

const leaderboardCache = (durationSeconds = 10) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cached = localCacheStore[key];
    const now = Date.now();

    if (cached && (now - cached.timestamp < durationSeconds * 1000)) {
      console.log(`[Cache Hit] Serving Leaderboard from localCacheStore: ${key}`);
      return res.status(200).json(cached.body);
    } else {
      res.sendResponse = res.json;
      res.json = (body) => {
        localCacheStore[key] = {
          body,
          timestamp: Date.now()
        };
        res.sendResponse(body);
      };
      next();
    }
  };
};

module.exports = {
  leaderboardCache
};
