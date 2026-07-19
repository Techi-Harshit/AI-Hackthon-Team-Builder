const Team = require("../models/Team");
const interestService = require("../services/interestService");

const generateOpenAITeamsCompatibility = async (req, teamsList) => {
  if (!req.query || req.query.ai !== "true" || !process.env.OPENAI_API_KEY || teamsList.length === 0) return null;
  const user = req.user;

  try {
    console.log("Using OpenAI to calculate team match scores...");

    const teamsData = teamsList.slice(0, 12).map(t => ({
      id: String(t._id || t.id),
      teamName: t.teamName,
      description: t.description || "",
      requiredSkills: t.requiredSkills || [],
      requiredRoles: t.requiredRoles || []
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI Hackathon team compatibility scoring engine. Evaluate how well a user's skills and interests fit into candidate teams."
          },
          {
            role: "user",
            content: `
User Profile:
- Name: "${user.name}"
- Skills: ${JSON.stringify(user.skills)}
- Preferred Role: "${user.preferredRole}"
- Experience: "${user.experience}"
- Interests: ${JSON.stringify(user.interests || user.interestedDomains || [])}

Candidate Teams:
${JSON.stringify(teamsData)}

Evaluate compatibility for each team. Output a valid JSON object ONLY. No markdown fences. Format is:
{
  "compatibility": [
    {
      "id": "team_id",
      "matchScore": 88,
      "whyMatches": "Short personalized sentence detailing how the user fits the team's needs and required skills."
    }
  ]
}
`
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI responded with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());
      return parsed.compatibility || parsed || [];
    }
  } catch (err) {
    console.error("OpenAI team compatibility matching failed:", err);
  }
  return null;
};

const createTeam = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { interestId: _ignoredInterestId, hackathonName: _ignoredHackathonName, ...teamPayload } = req.body;
    if (!teamPayload.hackathonId) {
      return res.status(400).json({ message: "hackathonId is required to create a team." });
    }

    // A team always has an interest record. This also makes direct team API
    // calls follow the same flow as the UI's “Create Team” choice.
    let interestState = await interestService.checkInterest(userId, teamPayload.hackathonId);
    if (!interestState.isInterested) {
      await interestService.addInterest(userId, teamPayload.hackathonId);
      interestState = await interestService.checkInterest(userId, teamPayload.hackathonId);
    }
    const interest = interestState.interest;
    const hackathonName = interest?.hackathonName || "";

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const newTeam = {
        _id: new Date().getTime().toString(),
        ...teamPayload,
        interestId: interest?._id || null,
        hackathonName,
        leader: userId,
        members: [userId],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      teams.push(newTeam);
      writeCollection("teams", teams);
      return res.status(201).json(newTeam);
    }

    const team = await Team.create({
      ...teamPayload,
      interestId: interest?._id,
      hackathonName,
      leader: userId,
      members: [userId],
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const calculateActivityScore = (team) => {
  const apps = team.applicationsCount || 0;
  const msgs = team.messagesCount || 0;
  const views = team.profileViews || 0;
  const members = team.members ? team.members.length : (team.membersCount || 1);
  const hacks = team.hackathonsParticipated || 0;

  let bonus = 0;
  if (team.lastActiveAt) {
    const activeDate = new Date(team.lastActiveAt);
    const diffMs = new Date() - activeDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) bonus = 20;
    else if (diffDays <= 3) bonus = 10;
    else if (diffDays <= 7) bonus = 5;
  }

  return (apps * 5) + (msgs * 2) + (views * 1) + (members * 4) + (hacks * 6) + bonus;
};

const calculateCompatibility = (user, team) => {
  const userSkills = user.skills || [];
  const teamSkills = team.requiredSkills || [];

  // 1. Skills Match (50%)
  let skillsScore = 50;
  const matchingSkills = [];
  const missingSkills = [];

  if (teamSkills.length > 0) {
    teamSkills.forEach(skill => {
      const match = userSkills.some(us => us.toLowerCase() === skill.toLowerCase());
      if (match) {
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });
    skillsScore = Math.round((matchingSkills.length / teamSkills.length) * 50);
  }

  // 2. Experience Match (20%)
  let expScore = 0;
  const expLevels = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
  const userExpVal = expLevels[user.experience || "Beginner"] || 1;
  const teamExpVal = expLevels[team.experienceRequired || "Intermediate"] || 2;

  if (userExpVal >= teamExpVal) {
    expScore = 20;
  } else if (teamExpVal - userExpVal === 1) {
    expScore = 10;
  }

  // 3. Preferred Role Match (15%)
  let roleScore = 0;
  const userRole = (user.preferredRole || "").toLowerCase();
  const teamRole = (team.requiredRole || "").toLowerCase();

  if (userRole === teamRole || userRole === "full stack") {
    roleScore = 15;
  }

  // 4. Domain Match (10%)
  let domainScore = 0;
  const userDomains = (user.interestedDomains || user.interests || []).map(d => d.toLowerCase());
  const teamDomain = (team.domain || "").toLowerCase();

  if (userDomains.includes(teamDomain) || userDomains.some(ud => teamDomain.includes(ud) || ud.includes(teamDomain))) {
    domainScore = 10;
  }

  // 5. Availability Match (5%)
  let availScore = 0;
  const userAvail = (user.availability || "").toLowerCase();
  const teamSchedule = (team.meetingSchedule || "").toLowerCase();

  if (userAvail === "anytime" || userAvail === teamSchedule || teamSchedule === "flexible") {
    availScore = 5;
  }

  const matchScore = skillsScore + expScore + roleScore + domainScore + availScore;

  // Generate a descriptive reason
  let whyMatches = `You are a ${matchScore}% match.`;
  if (matchingSkills.length > 0) {
    whyMatches += ` You match ${matchingSkills.length} required skill${matchingSkills.length === 1 ? "" : "s"}.`;
  }
  if (roleScore > 0) {
    whyMatches += ` Your preferred role aligns with the team.`;
  }

  return {
    matchScore,
    matchingSkills,
    missingSkills,
    whyMatches
  };
};

const filterAndPaginateTeams = (teams, query) => {
  let filtered = [...teams];

  // Only return recruiting (Open) teams
  filtered = filtered.filter(t => t.status === "Open" || !t.status);

  // Filter by hackathonId
  if (query.hackathonId) {
    filtered = filtered.filter(t => String(t.hackathonId || t.hackathon) === String(query.hackathonId));
  }

  // Search by name
  if (query.search) {
    const term = query.search.toLowerCase();
    filtered = filtered.filter(t => 
      (t.teamName && t.teamName.toLowerCase().includes(term)) ||
      (t.description && t.description.toLowerCase().includes(term))
    );
  }

  // Search by skill / Filter by technology
  if (query.skill || query.technology) {
    const skillTerm = (query.skill || query.technology).toLowerCase();
    filtered = filtered.filter(t => 
      t.requiredSkills && t.requiredSkills.some(s => s.toLowerCase().includes(skillTerm))
    );
  }

  // Filter by domain
  if (query.domain) {
    const domainTerm = query.domain.toLowerCase();
    filtered = filtered.filter(t => 
      t.domain && t.domain.toLowerCase() === domainTerm
    );
  }

  // Filter by experience
  if (query.experience) {
    const expTerm = query.experience.toLowerCase();
    filtered = filtered.filter(t => 
      t.experienceRequired && t.experienceRequired.toLowerCase() === expTerm
    );
  }

  // Server-side pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginated = filtered.slice(startIndex, endIndex);

  return {
    teams: paginated,
    total: filtered.length,
    page,
    pages: Math.ceil(filtered.length / limit),
    hasMore: endIndex < filtered.length
  };
};

const buildMongooseQuery = (query) => {
  const filter = { status: "Open" };

  if (query.hackathonId) {
    filter.hackathonId = query.hackathonId;
  }

  if (query.search) {
    filter.$or = [
      { teamName: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } }
    ];
  }

  if (query.skill || query.technology) {
    const skillVal = query.skill || query.technology;
    filter.requiredSkills = { $regex: skillVal, $options: "i" };
  }

  if (query.domain) {
    filter.domain = { $regex: `^${query.domain}$`, $options: "i" };
  }

  if (query.experience) {
    filter.experienceRequired = { $regex: `^${query.experience}$`, $options: "i" };
  }

  return filter;
};

const getTeams = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const users = readCollection("users");

      const aiMatches = await generateOpenAITeamsCompatibility(req, teams);

      const populatedTeams = teams.map((team) => {
        const leaderUser = users.find((u) => u._id === team.leader);
        const memberUsers = team.members
          ? team.members.map((mId) => users.find((u) => u._id === mId)).filter(Boolean)
          : [];

        const compat = calculateCompatibility(req.user, team);
        const aiMatch = aiMatches ? aiMatches.find(am => String(am.id) === String(team._id)) : null;

        return {
          ...team,
          matchScore: aiMatch ? aiMatch.matchScore : compat.matchScore,
          matchingSkills: compat.matchingSkills,
          missingSkills: compat.missingSkills,
          whyMatches: aiMatch ? aiMatch.whyMatches : (compat.whyMatches?.[0] || ""),
          leader: leaderUser
            ? { _id: leaderUser._id, name: leaderUser.name, email: leaderUser.email, avatar: leaderUser.avatar || "" }
            : null,
          members: memberUsers.map((u) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            avatar: u.avatar || "",
            preferredRole: u.preferredRole || "Full Stack",
            skills: u.skills || [],
          })),
        };
      });

      const isBackwardsCompatible = !req.query.page && !req.query.search && !req.query.skill && !req.query.technology && !req.query.domain && !req.query.experience;
      if (isBackwardsCompatible) {
        return res.status(200).json(populatedTeams);
      }

      const paginated = filterAndPaginateTeams(populatedTeams, req.query);
      return res.status(200).json({
        success: true,
        teams: paginated.teams,
        pagination: {
          page: paginated.page,
          pages: paginated.pages,
          total: paginated.total,
          hasMore: paginated.hasMore
        }
      });
    }

    const isBackwardsCompatible = !req.query.page && !req.query.search && !req.query.skill && !req.query.technology && !req.query.domain && !req.query.experience;
    if (isBackwardsCompatible) {
      const teams = await Team.find()
        .populate("leader", "name email avatar preferredRole")
        .populate("members", "name email avatar preferredRole skills");

      const aiMatches = await generateOpenAITeamsCompatibility(req, teams);

      const mapped = teams.map((team) => {
        const teamObj = team.toObject();
        const compat = calculateCompatibility(req.user, teamObj);
        const aiMatch = aiMatches ? aiMatches.find(am => String(am.id) === String(teamObj._id)) : null;

        return {
          ...teamObj,
          matchScore: aiMatch ? aiMatch.matchScore : compat.matchScore,
          matchingSkills: compat.matchingSkills,
          missingSkills: compat.missingSkills,
          whyMatches: aiMatch ? aiMatch.whyMatches : (compat.whyMatches?.[0] || "")
        };
      });
      return res.status(200).json(mapped);
    }

    const filter = buildMongooseQuery(req.query);
    const teamsCount = await Team.countDocuments(filter);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const teams = await Team.find(filter)
      .populate("leader", "name email avatar preferredRole")
      .populate("members", "name email avatar preferredRole skills")
      .skip(startIndex)
      .limit(limit);

    const aiMatches = await generateOpenAITeamsCompatibility(req, teams);

    const mappedTeams = teams.map((team) => {
      const teamObj = team.toObject();
      const compat = calculateCompatibility(req.user, teamObj);
      const aiMatch = aiMatches ? aiMatches.find(am => String(am.id) === String(teamObj._id)) : null;

      return {
        ...teamObj,
        matchScore: aiMatch ? aiMatch.matchScore : compat.matchScore,
        matchingSkills: compat.matchingSkills,
        missingSkills: compat.missingSkills,
        whyMatches: aiMatch ? aiMatch.whyMatches : (compat.whyMatches?.[0] || "")
      };
    });

    res.status(200).json({
      success: true,
      teams: mappedTeams,
      pagination: {
        page,
        pages: Math.ceil(teamsCount / limit),
        total: teamsCount,
        hasMore: startIndex + teams.length < teamsCount
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTeamById = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const users = readCollection("users");
      const index = teams.findIndex((t) => t._id === req.params.id);

      if (index === -1) {
        return res.status(404).json({
          message: "Team Not Found",
        });
      }

      // Auto update score on view
      const team = teams[index];
      team.profileViews = (team.profileViews || 0) + 1;
      team.lastActiveAt = new Date();
      team.activityScore = calculateActivityScore(team);
      teams[index] = team;
      writeCollection("teams", teams);

      const leaderUser = users.find((u) => u._id === team.leader);
      const memberUsers = team.members
        ? team.members.map((mId) => users.find((u) => u._id === mId)).filter(Boolean)
        : [];

      const populatedTeam = {
        ...team,
        leader: leaderUser
          ? { _id: leaderUser._id, name: leaderUser.name, email: leaderUser.email, avatar: leaderUser.avatar || "" }
          : null,
        members: memberUsers.map((u) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || "",
          preferredRole: u.preferredRole || "Full Stack",
          skills: u.skills || [],
        })),
      };

      return res.status(200).json(populatedTeam);
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        message: "Team Not Found",
      });
    }

    // Auto update score on view in MongoDB
    team.profileViews += 1;
    team.lastActiveAt = new Date();
    team.activityScore = calculateActivityScore(team.toObject());
    await team.save();

    const populatedTeam = await Team.findById(req.params.id)
      .populate("leader", "name email avatar preferredRole")
      .populate("members", "name email avatar preferredRole skills");

    res.status(200).json(populatedTeam);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMostActiveTeams = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const users = readCollection("users");

      const populated = teams.map((team) => {
        const leaderUser = users.find((u) => u._id === team.leader);
        const memberUsers = team.members
          ? team.members.map((mId) => users.find((u) => u._id === mId)).filter(Boolean)
          : [];

        const score = calculateActivityScore(team);
        return {
          ...team,
          activityScore: score,
          leader: leaderUser
            ? { _id: leaderUser._id, name: leaderUser.name, email: leaderUser.email, avatar: leaderUser.avatar || "" }
            : null,
          members: memberUsers.map((u) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            avatar: u.avatar || "",
            preferredRole: u.preferredRole || "Full Stack",
            skills: u.skills || [],
          })),
        };
      });

      // Sort populated teams by score descending
      populated.sort((a, b) => b.activityScore - a.activityScore);

      // Filter and paginate
      const paginated = filterAndPaginateTeams(populated, req.query);

      return res.status(200).json({
        success: true,
        teams: paginated.teams,
        pagination: {
          page: paginated.page,
          pages: paginated.pages,
          total: paginated.total,
          hasMore: paginated.hasMore
        }
      });
    }

    const filter = buildMongooseQuery(req.query);
    const teams = await Team.find(filter)
      .populate("leader", "name email avatar preferredRole")
      .populate("members", "name email avatar preferredRole skills");

    const teamsWithScore = teams.map((team) => {
      const teamObj = team.toObject();
      teamObj.activityScore = calculateActivityScore(teamObj);
      return teamObj;
    });

    // Sort by score descending
    teamsWithScore.sort((a, b) => b.activityScore - a.activityScore);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTeams = teamsWithScore.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      teams: paginatedTeams,
      pagination: {
        page,
        pages: Math.ceil(teamsWithScore.length / limit),
        total: teamsWithScore.length,
        hasMore: endIndex < teamsWithScore.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNewTeams = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const users = readCollection("users");

      const populated = teams.map((team) => {
        const leaderUser = users.find((u) => u._id === team.leader);
        const memberUsers = team.members
          ? team.members.map((mId) => users.find((u) => u._id === mId)).filter(Boolean)
          : [];

        const createdDate = new Date(team.createdAt || team.createdAtDate || new Date());
        const diffMs = new Date() - createdDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const isNew = diffDays <= 7;

        return {
          ...team,
          isNew,
          leader: leaderUser
            ? { _id: leaderUser._id, name: leaderUser.name, email: leaderUser.email, avatar: leaderUser.avatar || "" }
            : null,
          members: memberUsers.map((u) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            avatar: u.avatar || "",
            preferredRole: u.preferredRole || "Full Stack",
            skills: u.skills || [],
          })),
        };
      });

      // Sort by createdAt descending
      populated.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      // Filter and paginate
      const paginated = filterAndPaginateTeams(populated, req.query);

      return res.status(200).json({
        success: true,
        teams: paginated.teams,
        pagination: {
          page: paginated.page,
          pages: paginated.pages,
          total: paginated.total,
          hasMore: paginated.hasMore
        }
      });
    }

    const filter = buildMongooseQuery(req.query);
    const teams = await Team.find(filter)
      .populate("leader", "name email avatar preferredRole")
      .populate("members", "name email avatar preferredRole skills")
      .sort({ createdAt: -1 });

    const teamsWithIsNew = teams.map((team) => {
      const teamObj = team.toObject();
      const createdDate = new Date(teamObj.createdAt);
      const diffMs = new Date() - createdDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      teamObj.isNew = diffDays <= 7;
      return teamObj;
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTeams = teamsWithIsNew.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      teams: paginatedTeams,
      pagination: {
        page,
        pages: Math.ceil(teamsWithIsNew.length / limit),
        total: teamsWithIsNew.length,
        hasMore: endIndex < teamsWithIsNew.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHighMatchTeams = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const users = readCollection("users");

      const aiMatches = await generateOpenAITeamsCompatibility(req, teams);

      const matched = teams
        .map((team) => {
          const leaderUser = users.find((u) => u._id === team.leader);
          const memberUsers = team.members
            ? team.members.map((mId) => users.find((u) => u._id === mId)).filter(Boolean)
            : [];

          const compat = calculateCompatibility(user, team);
          const aiMatch = aiMatches ? aiMatches.find(am => String(am.id) === String(team._id)) : null;

          return {
            ...team,
            matchScore: aiMatch ? aiMatch.matchScore : compat.matchScore,
            matchingSkills: compat.matchingSkills,
            missingSkills: compat.missingSkills,
            whyMatches: aiMatch ? aiMatch.whyMatches : (compat.whyMatches?.[0] || ""),
            leader: leaderUser
              ? { _id: leaderUser._id, name: leaderUser.name, email: leaderUser.email, avatar: leaderUser.avatar || "" }
              : null,
            members: memberUsers.map((u) => ({
              _id: u._id,
              name: u.name,
              email: u.email,
              avatar: u.avatar || "",
              preferredRole: u.preferredRole || "Full Stack",
              skills: u.skills || [],
            })),
          };
        })
        .filter((t) => t.matchScore >= 55);

      // Sort by matchScore descending
      matched.sort((a, b) => b.matchScore - a.matchScore);

      // Filter and paginate
      const paginated = filterAndPaginateTeams(matched, req.query);

      return res.status(200).json({
        success: true,
        teams: paginated.teams,
        pagination: {
          page: paginated.page,
          pages: paginated.pages,
          total: paginated.total,
          hasMore: paginated.hasMore
        }
      });
    }

    const filter = buildMongooseQuery(req.query);
    const teams = await Team.find(filter)
      .populate("leader", "name email avatar preferredRole")
      .populate("members", "name email avatar preferredRole skills");

    const aiMatches = await generateOpenAITeamsCompatibility(req, teams);

    const matchedTeams = teams
      .map((team) => {
        const teamObj = team.toObject();
        const compat = calculateCompatibility(user, teamObj);
        const aiMatch = aiMatches ? aiMatches.find(am => String(am.id) === String(teamObj._id)) : null;

        return {
          ...teamObj,
          matchScore: aiMatch ? aiMatch.matchScore : compat.matchScore,
          matchingSkills: compat.matchingSkills,
          missingSkills: compat.missingSkills,
          whyMatches: aiMatch ? aiMatch.whyMatches : (compat.whyMatches?.[0] || "")
        };
      })
      .filter((t) => t.matchScore >= 55);

    // Sort by matchScore descending
    matchedTeams.sort((a, b) => b.matchScore - a.matchScore);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTeams = matchedTeams.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      teams: paginatedTeams,
      pagination: {
        page,
        pages: Math.ceil(matchedTeams.length / limit),
        total: matchedTeams.length,
        hasMore: endIndex < matchedTeams.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendedTeams = async (req, res) => {
  try {
    const User = require("../models/User");
    const Hackathon = require("../models/Hackathon");

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const userSkills = user.skills || [];

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const hackathons = readCollection("hackathons");
      const users = readCollection("users");

      // Filter out teams where user is leader or member
      const candidateTeams = teams.filter((team) => {
        const isLeader = team.leader === user._id;
        const isMember = team.members && team.members.includes(user._id);
        return !isLeader && !isMember && team.status === "Open";
      });

      // Calculate compatibility scores
      const recommendations = candidateTeams.map((team) => {
        const reqSkills = team.requiredSkills || [];
        const matchCount = reqSkills.filter((s) => 
          userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
        ).length;

        const matchScore = reqSkills.length > 0 
          ? Math.round((matchCount / reqSkills.length) * 100)
          : 70; // fallback matching index

        const hackathon = hackathons.find((h) => h._id === team.hackathonId);
        const leaderUser = users.find((u) => u._id === team.leader);

        return {
          _id: team._id,
          teamName: team.teamName,
          description: team.description,
          hackathonName: hackathon ? hackathon.title : "Global Hackathon",
          requiredSkills: reqSkills,
          maxMembers: team.maxMembers || 4,
          membersCount: team.members ? team.members.length : 1,
          matchScore,
          leaderName: leaderUser ? leaderUser.name : "Teammate",
        };
      });

      // Sort by score descending
      recommendations.sort((a, b) => b.matchScore - a.matchScore);

      return res.status(200).json(recommendations.slice(0, 8));
    }

    // Mongoose/MongoDB mode
    const allTeams = await Team.find({
      leader: { $ne: req.user._id },
      members: { $ne: req.user._id },
      status: "Open",
    }).populate("hackathonId", "title");

    const recommendations = allTeams.map((team) => {
      const reqSkills = team.requiredSkills || [];
      const matchCount = reqSkills.filter((s) => 
        userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
      ).length;

      const matchScore = reqSkills.length > 0 
        ? Math.round((matchCount / reqSkills.length) * 100)
        : 70; // fallback matching index

      return {
        _id: team._id,
        teamName: team.teamName,
        description: team.description,
        hackathonName: team.hackathonId ? team.hackathonId.title : "Global Hackathon",
        requiredSkills: reqSkills,
        maxMembers: team.maxMembers || 4,
        membersCount: team.members ? team.members.length : 1,
        matchScore,
      };
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(recommendations.slice(0, 8));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const teamId = req.params.id;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const teams = readCollection("teams");
      const index = teams.findIndex((t) => t._id === teamId);

      if (index === -1) {
        return res.status(404).json({ message: "Team Not Found" });
      }

      const team = teams[index];

      // Verify leader
      if (team.leader !== req.user._id) {
        return res.status(403).json({ message: "Only the team leader can remove members" });
      }

      if (memberId === team.leader) {
        return res.status(400).json({ message: "The leader cannot be removed from the team" });
      }

      // Filter out member
      team.members = (team.members || []).filter((mId) => mId !== memberId);
      team.updatedAt = new Date();
      teams[index] = team;

      writeCollection("teams", teams);

      return res.status(200).json({ message: "Member removed successfully" });
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team Not Found" });
    }

    // Verify leader
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the team leader can remove members" });
    }

    if (memberId === team.leader.toString()) {
      return res.status(400).json({ message: "The leader cannot be removed from the team" });
    }

    // Filter out member
    team.members = team.members.filter((m) => m.toString() !== memberId.toString());
    await team.save();

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  getRecommendedTeams,
  removeMember,
  getMostActiveTeams,
  getNewTeams,
  getHighMatchTeams,
};
