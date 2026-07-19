const Leaderboard = require("../models/Leaderboard");

const searchLeaderboard = async (queryText, season = 1) => {
  if (!queryText) return [];
  const regex = new RegExp(queryText, "i");

  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const leaderboard = readCollection("leaderboards") || [];
    const users = readCollection("users") || [];
    const teams = readCollection("teams") || [];

    // Filter by season and populate names
    let results = leaderboard.filter(l => l.season === season);
    
    const enriched = results.map(l => {
      const copy = { ...l };
      if (copy.type === "developer" || copy.type === "user") {
        const match = users.find(u => String(u._id) === String(copy.referenceId));
        copy.name = match ? match.name : "Developer";
        copy.skills = match ? (match.skills || []) : [];
      } else if (copy.type === "team") {
        const match = teams.find(t => String(t._id) === String(copy.referenceId));
        copy.name = match ? match.teamName : "Team";
        copy.category = match ? (match.category || "") : "";
      }
      return copy;
    });

    return enriched.filter(l => l.name && regex.test(l.name));
  } else {
    const User = require("../models/User");
    const Team = require("../models/Team");

    const [matchingUsers, matchingTeams] = await Promise.all([
      User.find({ name: regex }).select("_id").lean(),
      Team.find({ teamName: regex }).select("_id").lean()
    ]);

    const userIds = matchingUsers.map(u => u._id);
    const teamIds = matchingTeams.map(t => t._id);

    const results = await Leaderboard.find({
      season,
      referenceId: { $in: [...userIds, ...teamIds] }
    }).lean();

    // Populate names
    for (const r of results) {
      if (r.type === "developer") {
        const user = await User.findById(r.referenceId).select("name avatar skills").lean();
        if (user) {
          r.name = user.name;
          r.avatar = user.avatar;
          r.skills = user.skills;
        }
      } else if (r.type === "team") {
        const team = await Team.findById(r.referenceId).select("teamName teamLogo").lean();
        if (team) {
          r.name = team.teamName;
          r.logo = team.teamLogo;
        }
      }
    }

    return results;
  }
};

module.exports = {
  searchLeaderboard
};
