const Leaderboard = require("../models/Leaderboard");

const filterLeaderboard = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    let list = readCollection("leaderboards") || [];

    // Apply criteria filters
    if (filters.type) {
      list = list.filter(l => l.type === filters.type);
    }
    if (filters.category) {
      list = list.filter(l => l.category && l.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.region) {
      list = list.filter(l => l.region && l.region.toLowerCase() === filters.region.toLowerCase());
    }
    if (filters.season) {
      list = list.filter(l => l.season === Number(filters.season));
    }

    // Sort by currentRank ascending
    list.sort((a, b) => (a.currentRank || 999) - (b.currentRank || 999));

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    return {
      items: paginated,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } else {
    const query = { isActive: true };
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.region) {
      query.region = filters.region;
    }
    if (filters.season) {
      query.season = Number(filters.season);
    }

    const total = await Leaderboard.countDocuments(query);
    const items = await Leaderboard.find(query)
      .sort({ currentRank: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
};

module.exports = {
  filterLeaderboard
};
