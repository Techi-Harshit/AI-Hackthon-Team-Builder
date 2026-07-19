const Hackathon = require("../models/Hackathon");
const HackathonRegistration = require("../models/HackathonRegistration");
const User = require("../models/User");
const Team = require("../models/Team");
const { addDeveloperXP, addTeamXP } = require("../services/xpService");
const { calculateLeaderboardRanks } = require("../services/rankingService");

const computeRecruitmentMetadata = (hack, user, userTeams) => {
  const hackId = String(hack._id || hack.id);
  const isInterested = Boolean(user?.interestedHackathons?.some(id => String(id) === hackId));
  if (!user) {
    return {
      isRegistered: false,
      hasTeam: false,
      teamId: null,
      isTeamLeader: false,
      teamFull: false,
      remainingSlots: 0,
      recruitmentStatus: "Closed",
      canUseAIRecommendation: false,
      isInterested: false
    };
  }

  const hackIdStr = hackId;
  const isRegistered = user.registeredHackathons && user.registeredHackathons.some(hId => String(hId) === hackIdStr);

  const team = userTeams.find(t => String(t.hackathonId || t.hackathon) === hackIdStr);

  if (team) {
    const maxMembers = team.maxMembers || 4;
    const membersLength = team.members ? team.members.length : 0;
    const remainingSlots = Math.max(0, maxMembers - membersLength - 1);
    const teamFull = remainingSlots <= 0;
    const recruitmentStatus = team.recruitmentStatus || (teamFull ? "Closed" : "Recruiting");
    const isTeamLeader = String(team.leader?._id || team.leader) === String(user._id);

    return {
      isRegistered,
      hasTeam: true,
      teamId: team._id || team.id,
      isTeamLeader,
      teamFull,
      remainingSlots,
      recruitmentStatus,
      canUseAIRecommendation: isRegistered && isTeamLeader && recruitmentStatus === "Recruiting" && !teamFull,
      isInterested
    };
  }

  return {
    isRegistered,
    hasTeam: false,
    teamId: null,
    isTeamLeader: false,
    teamFull: false,
    remainingSlots: 0,
    recruitmentStatus: "Closed",
    canUseAIRecommendation: false,
    isInterested
  };
};

const filterAndPaginateHackathons = (hackathons, query, user) => {
  let filtered = [...hackathons];
  const type = query.type || query.hackathonType;
  const techStack = query.techStack || query.technology || query.skill;
  const sort = query.sort || query.sortBy;

  // 1. All hackathons are visible by default

  // 2. Search by title or organizer
  if (query.search) {
    const term = query.search.toLowerCase();
    filtered = filtered.filter(h => 
      (h.title && h.title.toLowerCase().includes(term)) ||
      (h.organizer && h.organizer.toLowerCase().includes(term))
    );
  }

  // 3. Tech/Technology filter
  if (techStack) {
    const tech = techStack.toLowerCase();
    filtered = filtered.filter(h => 
      [...(h.techStack || []), ...(h.requiredSkills || []), ...(h.domains || [])]
        .some(s => s.toLowerCase().includes(tech))
    );
  }

  // 4. Difficulty filter
  if (query.difficulty) {
    const diff = query.difficulty.toLowerCase();
    filtered = filtered.filter(h => 
      h.difficulty && h.difficulty.toLowerCase() === diff
    );
  }

  // 5. Mode filter
  if (query.mode) {
    const modeVal = query.mode.toLowerCase();
    filtered = filtered.filter(h => 
      h.mode && h.mode.toLowerCase() === modeVal
    );
  }

  // 6. Location filter
  if (query.location) {
    const loc = query.location.toLowerCase();
    filtered = filtered.filter(h => 
      h.location && h.location.toLowerCase().includes(loc)
    );
  }

  // 6.5 Hackathon Type filter
  if (type) {
    const typeVal = type.toLowerCase();
    filtered = filtered.filter(h => 
      h.hackathonType && h.hackathonType.toLowerCase() === typeVal
    );
  }

  // 7. Status query supports catalog lifecycle values and persisted workflow status.
  if (query.status) {
    const status = query.status.toLowerCase();
    const now = new Date();
    if (status === "upcoming") {
      filtered = filtered.filter(h => h.startDate && new Date(h.startDate) > now);
    } else if (status === "ongoing") {
      filtered = filtered.filter(h => h.startDate && h.endDate && new Date(h.startDate) <= now && new Date(h.endDate) >= now);
    } else if (status === "completed") {
      filtered = filtered.filter(h => h.endDate && new Date(h.endDate) < now);
    } else {
      filtered = filtered.filter(h => (h.status || "").toLowerCase() === status);
    }
  }

  // 8. Sorting
  if (sort) {
    if (sort === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "prize_high") {
      filtered.sort((a, b) => {
        const valA = parseFloat((a.prizePool || "").replace(/[^0-9.]/g, "")) || 0;
        const valB = parseFloat((b.prizePool || "").replace(/[^0-9.]/g, "")) || 0;
        return valB - valA;
      });
    } else if (sort === "popular") {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === "ending_soon") {
      filtered.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
    }
  }

  // 9. Pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginated = filtered.slice(startIndex, endIndex);

  return {
    hackathons: paginated,
    total: filtered.length,
    page,
    pages: Math.ceil(filtered.length / limit),
    hasMore: endIndex < filtered.length
  };
};

const buildMongooseQuery = (query, user) => {
  const filter = {};
  const type = query.type || query.hackathonType;
  const techStack = query.techStack || query.technology || query.skill;

  // Role visibility check bypassed for catalog parity

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { organizer: { $regex: query.search, $options: "i" } }
    ];
  }

  if (techStack) {
    const techExpression = { $regex: techStack, $options: "i" };
    filter.$and = [{
      $or: [
        { techStack: techExpression },
        { requiredSkills: techExpression },
        { domains: techExpression }
      ]
    }];
  }

  if (query.difficulty) {
    filter.difficulty = query.difficulty;
  }

  if (query.mode) {
    filter.mode = query.mode;
  }

  if (query.location) {
    filter.location = { $regex: query.location, $options: "i" };
  }

  if (type) {
    filter.hackathonType = type;
  }

  if (query.status) {
    const now = new Date();
    if (query.status === "upcoming") filter.startDate = { $gt: now };
    else if (query.status === "ongoing") {
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    } else if (query.status === "completed") filter.endDate = { $lt: now };
    else filter.status = query.status;
  }

  return filter;
};

// Create Hackathon
const createHackathon = async (req, res) => {
  try {
    const createdBy = req.user?._id || "mock-user-id";
    const status = req.body.status || "Draft";
    
    let badge = "Pending Review";
    let badgeColor = "amber";
    if (status === "Draft") {
      badge = "Draft";
      badgeColor = "blue";
    } else if (status === "Approved" || status === "Published" || status === "Open") {
      badge = "Registration Open";
      badgeColor = "green";
    }

    const hackathonData = {
      ...req.body,
      createdBy,
      status,
      badge,
      badgeColor
    };

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const newHackathon = {
        _id: new Date().getTime().toString(),
        ...hackathonData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      hackathons.push(newHackathon);
      writeCollection("hackathons", hackathons);
      return res.status(201).json(newHackathon);
    }

    const hackathon = await Hackathon.create(hackathonData);
    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHackathons = async (req, res) => {
  try {
    const user = req.user;

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons") || [];
      const teams = readCollection("teams") || [];
      const userTeams = user ? teams.filter(t => 
        String(t.leader) === String(user._id) || 
        (t.members && t.members.some(m => String(m) === String(user._id)))
      ) : [];

      const paginatedResult = filterAndPaginateHackathons(hackathons, req.query, user);
      const mappedHacks = paginatedResult.hackathons.map(h => ({
        ...h,
        ...computeRecruitmentMetadata(h, user, userTeams)
      }));
      return res.status(200).json({
        ...paginatedResult,
        hackathons: mappedHacks
      });
    }

    const userTeams = user ? await Team.find({
      $or: [{ leader: user._id }, { members: user._id }]
    }) : [];

    const filter = buildMongooseQuery(req.query, user);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Build sort options
    let sortOption = { createdAt: -1 };
    const sort = req.query.sort || req.query.sortBy;
    if (sort === "prize_high") {
      sortOption = { prizePool: -1 };
    } else if (sort === "popular") {
      sortOption = { views: -1 };
    } else if (sort === "ending_soon") {
      sortOption = { registrationDeadline: 1 };
    }

    const total = await Hackathon.countDocuments(filter);
    const hackathons = await Hackathon.find(filter)
      .sort(sortOption)
      .skip(startIndex)
      .limit(limit);

    const mappedHacks = hackathons.map(h => {
      const hObj = h.toObject();
      return {
        ...hObj,
        ...computeRecruitmentMetadata(hObj, user, userTeams)
      };
    });

    res.status(200).json({
      hackathons: mappedHacks,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: startIndex + hackathons.length < total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Hackathon Details & Count Views
const getHackathonById = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const index = hackathons.findIndex((h) => h._id === hackathonId);

      if (index === -1) {
        return res.status(404).json({ message: "Hackathon Not Found" });
      }

      // Increment views
      hackathons[index].views = (hackathons[index].views || 0) + 1;
      writeCollection("hackathons", hackathons);

      return res.status(200).json(hackathons[index]);
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    // Increment views
    hackathon.views = (hackathon.views || 0) + 1;
    await hackathon.save();

    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Bookmark Hackathon
const toggleBookmarkHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const userId = req.user._id;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const index = hackathons.findIndex((h) => h._id === hackathonId);

      if (index === -1) {
        return res.status(404).json({ message: "Hackathon Not Found" });
      }

      if (!hackathons[index].bookmarks) {
        hackathons[index].bookmarks = [];
      }

      const bookmarkedIndex = hackathons[index].bookmarks.indexOf(userId);
      let isBookmarked = false;

      if (bookmarkedIndex === -1) {
        hackathons[index].bookmarks.push(userId);
        isBookmarked = true;
      } else {
        hackathons[index].bookmarks.splice(bookmarkedIndex, 1);
      }

      writeCollection("hackathons", hackathons);
      return res.status(200).json({ success: true, isBookmarked, bookmarksCount: hackathons[index].bookmarks.length });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    const bookmarkedIndex = hackathon.bookmarks.indexOf(userId);
    let isBookmarked = false;

    if (bookmarkedIndex === -1) {
      hackathon.bookmarks.push(userId);
      isBookmarked = true;
    } else {
      hackathon.bookmarks.splice(bookmarkedIndex, 1);
    }

    await hackathon.save();
    res.status(200).json({ success: true, isBookmarked, bookmarksCount: hackathon.bookmarks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register for Hackathon (User, Existing Team, or New Team)
const registerForHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const userId = req.user._id;
    const { 
      teamId, 
      registeredAsTeam, 
      teamName, 
      teamLogo, 
      college, 
      country, 
      state, 
      city, 
      leaderDetails, 
      memberDetails 
    } = req.body;

    const registrationId = "REG-" + Math.floor(100000 + Math.random() * 900000);

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const hackIndex = hackathons.findIndex((h) => h._id === hackathonId);

      if (hackIndex === -1) {
        return res.status(404).json({ message: "Hackathon Not Found" });
      }

      const hack = hackathons[hackIndex];

      // Validation 1: isRegistrationEnabled
      if (hack.isRegistrationEnabled === false) {
        return res.status(400).json({ message: "Registration is currently disabled for this hackathon." });
      }

      // Validation 2: Deadline check
      if (hack.registrationDeadline && new Date() > new Date(hack.registrationDeadline)) {
        return res.status(400).json({ message: "Registration deadline has passed." });
      }

      const registrations = readCollection("hackathonregistrations") || [];

      // Validation 3: User already registered check
      const alreadyRegistered = registrations.some(r => r.hackathonId === hackathonId && r.userId === userId);
      if (alreadyRegistered) {
        return res.status(400).json({ message: "You have already registered for this hackathon." });
      }

      // Validation 4: Member already in another team check
      if (memberDetails && memberDetails.length > 0) {
        const emailsToCheck = memberDetails.map(m => m.email.toLowerCase());
        const hasMemberConflict = registrations.some(r => 
          r.hackathonId === hackathonId && 
          r.memberDetails && 
          r.memberDetails.some(m => emailsToCheck.includes(m.email.toLowerCase()))
        );
        if (hasMemberConflict) {
          return res.status(400).json({ message: "One of the team members is already registered in another team for this hackathon." });
        }
      }

      // Validation 5: Team size min/max check
      const totalMembersCount = (memberDetails ? memberDetails.length : 0) + 1; // including leader
      const minSize = hack.teamSizeMin || 1;
      const maxSize = hack.teamSizeMax || 4;
      if (totalMembersCount < minSize || totalMembersCount > maxSize) {
        return res.status(400).json({ message: `Team size must be between ${minSize} and ${maxSize} members.` });
      }

      // Validation 6: Student eligibility checks
      if (hack.hackathonType === "Student") {
        if (hack.isCrossCollegeAllowed === false) {
          const leaderColl = (college || "").trim().toLowerCase();
          const differentCollege = memberDetails && memberDetails.some(m => (m.college || "").trim().toLowerCase() !== leaderColl);
          if (differentCollege) {
            return res.status(400).json({ message: "Cross-college participation is disabled for this hackathon." });
          }
        }
        if (hack.eligibleYears && hack.eligibleYears.length > 0) {
          const invalidYear = memberDetails && memberDetails.some(m => m.year && !hack.eligibleYears.includes(m.year));
          if (invalidYear) {
            return res.status(400).json({ message: "Some team members are not in eligible academic years." });
          }
        }
      }

      // Validation 7: College eligibility checks
      if (hack.hackathonType === "College") {
        const allowed = (hack.allowedColleges || []).map(c => c.trim().toLowerCase());
        if (allowed.length > 0) {
          const leaderColl = (college || "").trim().toLowerCase();
          if (!allowed.includes(leaderColl)) {
            return res.status(400).json({ message: `College "${college}" is not allowed to register for this event.` });
          }
          const invalidMemberColl = memberDetails && memberDetails.some(m => {
            const mc = (m.college || "").trim().toLowerCase();
            return !allowed.includes(mc);
          });
          if (invalidMemberColl) {
            return res.status(400).json({ message: "Some team members belong to unauthorized colleges." });
          }
        }
      }
 
      // Save registration
      const newReg = {
        _id: new Date().getTime().toString(),
        hackathonId,
        userId,
        teamId: teamId || null,
        registeredAsTeam: registeredAsTeam || false,
        registrationId,
        teamName: teamName || "",
        teamLogo: teamLogo || "",
        college: college || "",
        country: country || "",
        state: state || "",
        city: city || "",
        leaderDetails: leaderDetails || {},
        memberDetails: memberDetails || [],
        status: "Registered",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      registrations.push(newReg);
      writeCollection("hackathonregistrations", registrations);

      // Increment participants count
      const currentParticipants = parseInt(hack.participants || "0") + 1;
      hackathons[hackIndex].participants = currentParticipants.toString();
      writeCollection("hackathons", hackathons);

      // Add to user registered list
      const users = readCollection("users");
      const userIndex = users.findIndex(u => u._id === userId);
      if (userIndex !== -1) {
        if (!users[userIndex].registeredHackathons) users[userIndex].registeredHackathons = [];
        users[userIndex].registeredHackathons.push(hackathonId);
        writeCollection("users", users);
      }

      // Add dynamic Leaderboard XP
      addDeveloperXP(userId, "PARTICIPATION");
      if (registeredAsTeam && teamId) {
        addTeamXP(teamId, "PARTICIPATION");
      }
      calculateLeaderboardRanks().catch(console.error);

      return res.status(200).json({ success: true, registrationId, message: "Successfully Registered for Hackathon" });
    }

    // Mongoose MongoDB block
    const hack = await Hackathon.findById(hackathonId);
    if (!hack) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    if (hack.isRegistrationEnabled === false) {
      return res.status(400).json({ message: "Registration is currently disabled for this hackathon." });
    }

    if (hack.registrationDeadline && new Date() > new Date(hack.registrationDeadline)) {
      return res.status(400).json({ message: "Registration deadline has passed." });
    }

    const alreadyRegistered = await HackathonRegistration.findOne({ hackathonId, userId });
    if (alreadyRegistered) {
      return res.status(400).json({ message: "You have already registered for this hackathon." });
    }

    if (memberDetails && memberDetails.length > 0) {
      const emailsToCheck = memberDetails.map(m => m.email.toLowerCase());
      const hasMemberConflict = await HackathonRegistration.findOne({
        hackathonId,
        "memberDetails.email": { $in: emailsToCheck }
      });
      if (hasMemberConflict) {
        return res.status(400).json({ message: "One of the team members is already registered in another team for this hackathon." });
      }
    }

    const totalMembersCount = (memberDetails ? memberDetails.length : 0) + 1;
    const minSize = hack.teamSizeMin || 1;
    const maxSize = hack.teamSizeMax || 4;
    if (totalMembersCount < minSize || totalMembersCount > maxSize) {
      return res.status(400).json({ message: `Team size must be between ${minSize} and ${maxSize} members.` });
    }

    // Validation 6: Student eligibility checks
    if (hack.hackathonType === "Student") {
      if (hack.isCrossCollegeAllowed === false) {
        const leaderColl = (college || "").trim().toLowerCase();
        const differentCollege = memberDetails && memberDetails.some(m => (m.college || "").trim().toLowerCase() !== leaderColl);
        if (differentCollege) {
          return res.status(400).json({ message: "Cross-college participation is disabled for this hackathon." });
        }
      }
      if (hack.eligibleYears && hack.eligibleYears.length > 0) {
        const invalidYear = memberDetails && memberDetails.some(m => m.year && !hack.eligibleYears.includes(m.year));
        if (invalidYear) {
          return res.status(400).json({ message: "Some team members are not in eligible academic years." });
        }
      }
    }

    // Validation 7: College eligibility checks
    if (hack.hackathonType === "College") {
      const allowed = (hack.allowedColleges || []).map(c => c.trim().toLowerCase());
      if (allowed.length > 0) {
        const leaderColl = (college || "").trim().toLowerCase();
        if (!allowed.includes(leaderColl)) {
          return res.status(400).json({ message: `College "${college}" is not allowed to register for this event.` });
        }
        const invalidMemberColl = memberDetails && memberDetails.some(m => {
          const mc = (m.college || "").trim().toLowerCase();
          return !allowed.includes(mc);
        });
        if (invalidMemberColl) {
          return res.status(400).json({ message: "Some team members belong to unauthorized colleges." });
        }
      }
    }

    const registration = await HackathonRegistration.create({
      hackathonId,
      userId,
      teamId: teamId || undefined,
      registeredAsTeam: registeredAsTeam || false,
      registrationId,
      teamName,
      teamLogo,
      college,
      country,
      state,
      city,
      leaderDetails,
      memberDetails,
      status: "Registered",
    });

    const participantsCount = parseInt(hack.participants || "0") + 1;
    hack.participants = participantsCount.toString();
    await hack.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { registeredHackathons: hackathonId }
    });

    // Add dynamic Leaderboard XP
    await addDeveloperXP(userId, "PARTICIPATION");
    if (registeredAsTeam && teamId) {
      await addTeamXP(teamId, "PARTICIPATION");
    }
    await calculateLeaderboardRanks();

    res.status(200).json({ success: true, registrationId, message: "Successfully Registered for Hackathon" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Organizer Analytics & Dashboard Statistics
const getOrganizerAnalytics = async (req, res) => {
  try {
    const organizerId = req.user._id;

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const orgHacks = hackathons.filter(h => String(h.createdBy) === String(organizerId));

      const totalHacks = orgHacks.length;
      const activeHacks = orgHacks.filter(h => h.status === "Approved" || h.status === "Published").length;
      const draftHacks = orgHacks.filter(h => h.status === "Draft").length;
      const pendingReview = orgHacks.filter(h => h.status === "Pending Review").length;

      // Sum of participants across their hackathons
      const totalParticipants = orgHacks.reduce((acc, h) => acc + (parseInt(h.participants || "0")), 0);
      const totalViews = orgHacks.reduce((acc, h) => acc + (h.views || 0), 0);

      return res.status(200).json({
        totalHackathons: totalHacks,
        activeHackathons: activeHacks,
        draftHackathons: draftHacks,
        pendingReview,
        totalApplications: totalParticipants,
        totalViews,
        dailyVisitors: [120, 150, 180, 240, 210, 310, 340], // mock charts trend
      });
    }

    const orgHacks = await Hackathon.find({ createdBy: organizerId });
    const totalHacks = orgHacks.length;
    const activeHacks = orgHacks.filter(h => h.status === "Approved" || h.status === "Published").length;
    const draftHacks = orgHacks.filter(h => h.status === "Draft").length;
    const pendingReview = orgHacks.filter(h => h.status === "Pending Review").length;

    const totalParticipants = orgHacks.reduce((acc, h) => acc + (parseInt(h.participants || "0")), 0);
    const totalViews = orgHacks.reduce((acc, h) => acc + (h.views || 0), 0);

    res.status(200).json({
      totalHackathons: totalHacks,
      activeHackathons: activeHacks,
      draftHackathons: draftHacks,
      pendingReview,
      totalApplications: totalParticipants,
      totalViews,
      dailyVisitors: [120, 150, 180, 240, 210, 310, 340]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Admin Analytics & Dashboard Statistics
const getAdminAnalytics = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      const hackathons = readCollection("hackathons");

      const totalUsers = users.length;
      const totalOrganizers = users.filter(u => u.role === "organizer").length;
      const totalHacks = hackathons.length;
      const activeHacks = hackathons.filter(h => h.status === "Approved" || h.status === "Published" || h.status === "Open").length;
      const pendingReview = hackathons.filter(h => h.status === "Pending Review").length;
      const rejectedHacks = hackathons.filter(h => h.status === "Rejected").length;

      return res.status(200).json({
        totalUsers,
        totalOrganizers,
        totalHackathons: totalHacks,
        activeHackathons: activeHacks,
        pendingReview,
        rejectedHackathons: rejectedHacks,
        expiredHackathons: hackathons.filter(h => h.status === "Expired").length,
        userGrowth: [30, 45, 60, 80, 120, 150, 210], // mock chart growth trends
        organizerGrowth: [5, 8, 12, 18, 25, 32, 40],
      });
    }

    const totalUsers = await User.countDocuments();
    const totalOrganizers = await User.countDocuments({ role: "organizer" });
    const totalHacks = await Hackathon.countDocuments();
    const activeHacks = await Hackathon.countDocuments({ status: { $in: ["Approved", "Published", "Open"] } });
    const pendingReview = await Hackathon.countDocuments({ status: "Pending Review" });
    const rejectedHacks = await Hackathon.countDocuments({ status: "Rejected" });
    const expiredHacks = await Hackathon.countDocuments({ status: "Expired" });

    res.status(200).json({
      totalUsers,
      totalOrganizers,
      totalHackathons: totalHacks,
      activeHackathons: activeHacks,
      pendingReview,
      rejectedHackathons: rejectedHacks,
      expiredHackathons: expiredHacks,
      userGrowth: [30, 45, 60, 80, 120, 150, 210],
      organizerGrowth: [5, 8, 12, 18, 25, 32, 40],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Moderation: Approve Hackathon
const approveHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const index = hackathons.findIndex((h) => h._id === hackathonId);

      if (index === -1) {
        return res.status(404).json({ message: "Hackathon Not Found" });
      }

      hackathons[index].status = "Approved";
      hackathons[index].badge = "Registration Open";
      hackathons[index].badgeColor = "green";
      hackathons[index].approvedBy = req.user._id;
      hackathons[index].approvedAt = new Date();

      writeCollection("hackathons", hackathons);
      return res.status(200).json({ success: true, message: "Hackathon Approved Successfully", hackathon: hackathons[index] });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    hackathon.status = "Approved";
    hackathon.badge = "Registration Open";
    hackathon.badgeColor = "green";
    hackathon.approvedBy = req.user._id;
    hackathon.approvedAt = new Date();

    await hackathon.save();
    res.status(200).json({ success: true, message: "Hackathon Approved Successfully", hackathon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET My Registrations List
const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const registrations = readCollection("hackathonregistrations") || [];
      const hackathons = readCollection("hackathons");

      const mine = registrations.filter(r => 
        String(r.userId) === String(userId) ||
        (r.memberDetails && r.memberDetails.some(m => m.email && m.email.toLowerCase() === userEmail.toLowerCase()))
      ).map(r => {
        const hack = hackathons.find(h => String(h._id) === String(r.hackathonId));
        return {
          ...r,
          hackathonId: hack || { title: "Unknown Hackathon" }
        };
      });

      return res.status(200).json(mine);
    }

    const mine = await HackathonRegistration.find({
      $or: [
        { userId },
        { "memberDetails.email": { $regex: `^${userEmail}$`, $options: "i" } }
      ]
    }).populate("hackathonId");
    res.status(200).json(mine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST Submit Project
const submitProject = async (req, res) => {
  try {
    const registrationId = req.params.id;
    const { projectTitle, githubRepo, demoLink, description } = req.body;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const registrations = readCollection("hackathonregistrations") || [];
      const hackathons = readCollection("hackathons");

      const index = registrations.findIndex(r => r._id === registrationId || r.registrationId === registrationId);
      if (index === -1) {
        return res.status(404).json({ message: "Registration Not Found" });
      }

      const reg = registrations[index];
      const hack = hackathons.find(h => h._id === reg.hackathonId);

      if (hack && hack.isProjectSubmissionEnabled === false) {
        return res.status(400).json({ message: "Project submission is not enabled for this hackathon yet." });
      }

      registrations[index].projectDetails = {
        projectTitle,
        githubRepo,
        demoLink,
        description,
        submittedAt: new Date()
      };
      registrations[index].status = "Project Submitted";
      registrations[index].updatedAt = new Date();

      writeCollection("hackathonregistrations", registrations);

      // Add dynamic Leaderboard XP
      addDeveloperXP(reg.userId, "PROJECT_SUBMISSION");
      if (reg.registeredAsTeam && reg.teamId) {
        addTeamXP(reg.teamId, "PROJECT_SUBMISSION");
      }
      calculateLeaderboardRanks().catch(console.error);

      return res.status(200).json({ success: true, message: "Project submitted successfully!" });
    }

    const reg = await HackathonRegistration.findById(registrationId).populate("hackathonId");
    if (!reg) {
      return res.status(404).json({ message: "Registration Not Found" });
    }

    if (reg.hackathonId && reg.hackathonId.isProjectSubmissionEnabled === false) {
      return res.status(400).json({ message: "Project submission is not enabled for this hackathon yet." });
    }

    reg.projectDetails = {
      projectTitle,
      githubRepo,
      demoLink,
      description,
      submittedAt: new Date()
    };
    reg.status = "Project Submitted";
    await reg.save();

    // Add dynamic Leaderboard XP
    await addDeveloperXP(reg.userId, "PROJECT_SUBMISSION");
    if (reg.registeredAsTeam && reg.teamId) {
      await addTeamXP(reg.teamId, "PROJECT_SUBMISSION");
    }
    await calculateLeaderboardRanks();

    res.status(200).json({ success: true, message: "Project submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT Organizer Control (Registration Toggles)
const toggleOrganizerControl = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const { isRegistrationEnabled, isProjectSubmissionEnabled } = req.body;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const index = hackathons.findIndex(h => h._id === hackathonId);

      if (index === -1) {
        return res.status(404).json({ message: "Hackathon Not Found" });
      }

      if (isRegistrationEnabled !== undefined) {
        hackathons[index].isRegistrationEnabled = isRegistrationEnabled;
      }
      if (isProjectSubmissionEnabled !== undefined) {
        hackathons[index].isProjectSubmissionEnabled = isProjectSubmissionEnabled;
      }

      writeCollection("hackathons", hackathons);
      return res.status(200).json({ success: true, message: "Hackathon configuration updated successfully!" });
    }

    const hack = await Hackathon.findById(hackathonId);
    if (!hack) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    if (isRegistrationEnabled !== undefined) {
      hack.isRegistrationEnabled = isRegistrationEnabled;
    }
    if (isProjectSubmissionEnabled !== undefined) {
      hack.isProjectSubmissionEnabled = isProjectSubmissionEnabled;
    }

    await hack.save();
    res.status(200).json({ success: true, message: "Hackathon configuration updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Hackathon Registrations List (Organizer panel)
const getHackathonRegistrations = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const registrations = readCollection("hackathonregistrations") || [];
      const list = registrations.filter(r => String(r.hackathonId) === String(hackathonId));
      return res.status(200).json(list);
    }

    const list = await HackathonRegistration.find({ hackathonId }).populate("userId", "name email");
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT Moderate Registration Status (Organizer panel)
const moderateRegistration = async (req, res) => {
  try {
    const regId = req.params.id;
    const { status } = req.body;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const registrations = readCollection("hackathonregistrations") || [];
      const index = registrations.findIndex(r => r._id === regId || r.registrationId === regId);

      if (index === -1) {
        return res.status(404).json({ message: "Registration Not Found" });
      }

      registrations[index].status = status;
      registrations[index].updatedAt = new Date();
      writeCollection("hackathonregistrations", registrations);

      return res.status(200).json({ success: true, message: "Registration status updated to " + status });
    }

    const reg = await HackathonRegistration.findById(regId);
    if (!reg) {
      return res.status(404).json({ message: "Registration Not Found" });
    }

    reg.status = status;
    await reg.save();

    res.status(200).json({ success: true, message: "Registration status updated to " + status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Export Registrations CSV text
const exportRegistrationsCsv = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    let list = [];

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const registrations = readCollection("hackathonregistrations") || [];
      list = registrations.filter(r => String(r.hackathonId) === String(hackathonId));
    } else {
      list = await HackathonRegistration.find({ hackathonId }).populate("userId", "name email");
    }

    let csv = "Registration ID,Team Name,College,Leader Name,Leader Email,Leader Phone,Members Count,Status\n";
    list.forEach(r => {
      const mCount = (r.memberDetails ? r.memberDetails.length : 0) + 1;
      csv += `"${r.registrationId}","${r.teamName || 'Solo'}","${r.college || ''}","${r.leaderDetails?.name || ''}","${r.leaderDetails?.email || ''}","${r.leaderDetails?.phone || ''}",${mCount},"${r.status}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.attachment("hackathon_registrations.csv");
    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Moderation: Reject Hackathon
const rejectHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const { rejectionReason } = req.body;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const index = hackathons.findIndex((h) => h._id === hackathonId);

      if (index === -1) {
        return res.status(404).json({ message: "Hackathon Not Found" });
      }

      hackathons[index].status = "Rejected";
      hackathons[index].badge = "Rejected";
      hackathons[index].badgeColor = "red";
      hackathons[index].rejectionReason = rejectionReason || "Does not comply with terms.";

      writeCollection("hackathons", hackathons);
      return res.status(200).json({ success: true, message: "Hackathon Rejected", hackathon: hackathons[index] });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    hackathon.status = "Rejected";
    hackathon.badge = "Rejected";
    hackathon.badgeColor = "red";
    hackathon.rejectionReason = rejectionReason || "Does not comply with terms.";

    await hackathon.save();
    res.status(200).json({ success: true, message: "Hackathon Rejected", hackathon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Moderation: Toggle Featured Status
const toggleFeaturedHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      const index = hackathons.findIndex((h) => h._id === hackathonId);

      if (index === -1) {
        return res.status(404).json({ message: "Hackathon Not Found" });
      }

      hackathons[index].isFeatured = !hackathons[index].isFeatured;
      writeCollection("hackathons", hackathons);
      return res.status(200).json({ success: true, isFeatured: hackathons[index].isFeatured });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon Not Found" });
    }

    hackathon.isFeatured = !hackathon.isFeatured;
    await hackathon.save();

    res.status(200).json({ success: true, isFeatured: hackathon.isFeatured });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleInterest = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const userId = req.user._id || req.user.id;
    const mongoose = require("mongoose");

    // Load User
    let user;
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const users = readCollection("users");
      user = users.find(u => String(u._id) === String(userId));
    } else {
      user = await User.findById(userId);
    }
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // Load Hackathon
    let hack;
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const hackathons = readCollection("hackathons");
      hack = hackathons.find(h => String(h._id || h.id) === String(hackathonId));
    } else {
      hack = await Hackathon.findById(hackathonId);
    }
    if (!hack) return res.status(404).json({ message: "Hackathon Not Found" });

    let isInterested = false;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const interests = readCollection("interests") || [];
      const users = readCollection("users") || [];
      const hackathons = readCollection("hackathons") || [];
      
      const existingIdx = interests.findIndex(
        i => String(i.userId) === String(userId) && String(i.hackathonId) === String(hackathonId)
      );

      const userIdx = users.findIndex(u => String(u._id) === String(userId));
      const hackIdx = hackathons.findIndex(h => String(h._id || h.id) === String(hackathonId));

      if (existingIdx === -1) {
        // Create new interest
        const newInterest = {
          _id: new mongoose.Types.ObjectId().toString(),
          userId: String(userId),
          hackathonId: String(hackathonId),
          hackathonName: hack.title,
          status: "Interested",
          skills: user.skills || [],
          role: user.preferredRole || "Full Stack",
          experienceLevel: user.experience || "Beginner",
          createdAt: new Date().toISOString()
        };
        interests.push(newInterest);
        isInterested = true;

        if (userIdx !== -1) {
          if (!users[userIdx].interestedHackathons) users[userIdx].interestedHackathons = [];
          if (!users[userIdx].interestedHackathons.includes(hackathonId)) {
            users[userIdx].interestedHackathons.push(hackathonId);
          }
        }
        if (hackIdx !== -1) {
          hackathons[hackIdx].interestCount = (hackathons[hackIdx].interestCount || 0) + 1;
        }
      } else {
        // Remove interest
        interests.splice(existingIdx, 1);
        
        if (userIdx !== -1 && users[userIdx].interestedHackathons) {
          users[userIdx].interestedHackathons = users[userIdx].interestedHackathons.filter(id => String(id) !== String(hackathonId));
        }
        if (hackIdx !== -1) {
          hackathons[hackIdx].interestCount = Math.max(0, (hackathons[hackIdx].interestCount || 0) - 1);
        }
      }
      writeCollection("interests", interests);
      writeCollection("users", users);
      writeCollection("hackathons", hackathons);
    } else {
      const HackathonInterest = require("../models/HackathonInterest");
      const existingInterest = await HackathonInterest.findOne({ userId, hackathonId });
      
      if (!existingInterest) {
        const newInterest = new HackathonInterest({
          userId,
          hackathonId,
          hackathonName: hack.title,
          status: "Interested",
          skills: user.skills || [],
          role: user.preferredRole || "Full Stack",
          experienceLevel: user.experience || "Beginner"
        });
        await newInterest.save();
        isInterested = true;

        await User.findByIdAndUpdate(userId, { $addToSet: { interestedHackathons: hackathonId } });
        await Hackathon.findByIdAndUpdate(hackathonId, { $inc: { interestCount: 1 } });
      } else {
        await HackathonInterest.deleteOne({ _id: existingInterest._id });
        await User.findByIdAndUpdate(userId, { $pull: { interestedHackathons: hackathonId } });
        await Hackathon.findByIdAndUpdate(hackathonId, { $inc: { interestCount: -1 } });
      }
    }

    res.status(200).json({ success: true, isInterested });
  } catch (error) {
    console.error("Error in toggleInterest:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  registerForHackathon,
  toggleBookmarkHackathon,
  getOrganizerAnalytics,
  getAdminAnalytics,
  approveHackathon,
  rejectHackathon,
  toggleFeaturedHackathon,
  getMyRegistrations,
  submitProject,
  toggleOrganizerControl,
  getHackathonRegistrations,
  moderateRegistration,
  exportRegistrationsCsv,
  toggleInterest,
};
