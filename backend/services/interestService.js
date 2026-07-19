const mongoose = require("mongoose");
const HackathonInterest = require("../models/HackathonInterest");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const calculateCompatibility = require("../utils/calculateCompatibility");

const addInterest = async (userId, hackathonId) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const interests = readCollection("interests") || [];
    const users = readCollection("users") || [];
    const hackathons = readCollection("hackathons") || [];

    const user = users.find(u => String(u._id) === String(userId));
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const hack = hackathons.find(h => String(h._id || h.id) === String(hackathonId));
    if (!hack) {
      throw new Error("HACKATHON_NOT_FOUND");
    }

    // Check unique validation
    const alreadyInterested = interests.some(
      i => String(i.userId) === String(userId) && String(i.hackathonId) === String(hackathonId)
    );
    if (alreadyInterested) {
      throw new Error("ALREADY_INTERESTED");
    }

    const newInterest = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: String(userId),
      hackathonId: String(hackathonId),
      hackathonName: hack.title,
      status: "Interested",
      isActive: true,
      selectedForAI: false,
      interestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    interests.push(newInterest);

    // Update user's interestedHackathons
    const userIdx = users.findIndex(u => String(u._id) === String(userId));
    if (userIdx !== -1) {
      if (!users[userIdx].interestedHackathons) users[userIdx].interestedHackathons = [];
      if (!users[userIdx].interestedHackathons.includes(hackathonId)) {
        users[userIdx].interestedHackathons.push(hackathonId);
      }
    }

    // Update hackathon's interestCount
    const hackIdx = hackathons.findIndex(h => String(h._id || h.id) === String(hackathonId));
    if (hackIdx !== -1) {
      hackathons[hackIdx].interestCount = (hackathons[hackIdx].interestCount || 0) + 1;
    }

    writeCollection("interests", interests);
    writeCollection("users", users);
    writeCollection("hackathons", hackathons);

    return { success: true, message: "Interest added successfully.", interest: newInterest };
  }

  // Mongoose Mode
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const hack = await Hackathon.findById(hackathonId);
  if (!hack) {
    throw new Error("HACKATHON_NOT_FOUND");
  }

  const alreadyInterested = await HackathonInterest.findOne({ userId, hackathonId });
  if (alreadyInterested) {
    throw new Error("ALREADY_INTERESTED");
  }

  let newInterest;
  try {
    newInterest = await HackathonInterest.create({
    userId,
    hackathonId,
    hackathonName: hack.title,
    status: "Interested",
    isActive: true,
    selectedForAI: false,
    interestedAt: new Date(),
    skills: user.skills || [],
    role: user.preferredRole || "Full Stack",
    experienceLevel: user.experience || "Beginner"
    });
  } catch (error) {
    if (error.code === 11000) throw new Error("ALREADY_INTERESTED");
    throw error;
  }

  await User.findByIdAndUpdate(userId, { $addToSet: { interestedHackathons: hackathonId } });
  await Hackathon.findByIdAndUpdate(hackathonId, { $inc: { interestCount: 1 } });

  return { success: true, message: "Interest added successfully.", interest: newInterest.toObject() };
};

// Deletes by interest record id, scoped to the authenticated user. The scope
// is the authorization check: users cannot remove another user's interest.
const removeInterestById = async (userId, interestId) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const interests = readCollection("interests") || [];
    const users = readCollection("users") || [];
    const hackathons = readCollection("hackathons") || [];
    const index = interests.findIndex(item => String(item._id) === String(interestId) && String(item.userId) === String(userId));
    if (index === -1) throw new Error("INTEREST_NOT_FOUND");

    const [interest] = interests.splice(index, 1);
    const userIndex = users.findIndex(item => String(item._id) === String(userId));
    if (userIndex !== -1) {
      users[userIndex].interestedHackathons = (users[userIndex].interestedHackathons || [])
        .filter(id => String(id) !== String(interest.hackathonId));
    }
    const hackIndex = hackathons.findIndex(item => String(item._id || item.id) === String(interest.hackathonId));
    if (hackIndex !== -1) hackathons[hackIndex].interestCount = Math.max(0, (hackathons[hackIndex].interestCount || 0) - 1);
    writeCollection("interests", interests);
    writeCollection("users", users);
    writeCollection("hackathons", hackathons);
    return { success: true, message: "Interest removed successfully.", interest };
  }

  const interest = await HackathonInterest.findOneAndDelete({ _id: interestId, userId });
  if (!interest) throw new Error("INTEREST_NOT_FOUND");
  await User.findByIdAndUpdate(userId, { $pull: { interestedHackathons: interest.hackathonId } });
  await Hackathon.findByIdAndUpdate(interest.hackathonId, { $inc: { interestCount: -1 } });
  return { success: true, message: "Interest removed successfully.", interest: interest.toObject() };
};

const removeInterest = async (userId, hackathonId) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const interests = readCollection("interests") || [];
    const users = readCollection("users") || [];
    const hackathons = readCollection("hackathons") || [];

    const existingIdx = interests.findIndex(
      i => String(i.userId) === String(userId) && String(i.hackathonId) === String(hackathonId)
    );

    if (existingIdx === -1) {
      throw new Error("INTEREST_NOT_FOUND");
    }

    interests.splice(existingIdx, 1);

    // Update user
    const userIdx = users.findIndex(u => String(u._id) === String(userId));
    if (userIdx !== -1 && users[userIdx].interestedHackathons) {
      users[userIdx].interestedHackathons = users[userIdx].interestedHackathons.filter(
        id => String(id) !== String(hackathonId)
      );
    }

    // Update hackathon
    const hackIdx = hackathons.findIndex(h => String(h._id || h.id) === String(hackathonId));
    if (hackIdx !== -1) {
      hackathons[hackIdx].interestCount = Math.max(0, (hackathons[hackIdx].interestCount || 0) - 1);
    }

    writeCollection("interests", interests);
    writeCollection("users", users);
    writeCollection("hackathons", hackathons);

    return { success: true, message: "Removed Successfully" };
  }

  // Mongoose Mode
  const existingInterest = await HackathonInterest.findOne({ userId, hackathonId });
  if (!existingInterest) {
    throw new Error("INTEREST_NOT_FOUND");
  }

  await HackathonInterest.deleteOne({ _id: existingInterest._id });
  await User.findByIdAndUpdate(userId, { $pull: { interestedHackathons: hackathonId } });
  await Hackathon.findByIdAndUpdate(hackathonId, { $inc: { interestCount: -1 } });

  return { success: true, message: "Removed Successfully" };
};

const getMyInterestedHackathons = async (userId) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const interests = readCollection("interests") || [];
    const hackathons = readCollection("hackathons") || [];

    const myInterests = interests.filter(
      i => String(i.userId) === String(userId) && i.status === "Interested"
    );

    const result = myInterests.map(interest => {
      const hack = hackathons.find(h => String(h._id || h.id) === String(interest.hackathonId));
      return {
        ...interest,
        hackathon: hack || null
      };
    });

    return result;
  }

  // Mongoose Mode
  const interests = await HackathonInterest.find({ userId, status: "Interested" }).populate("hackathonId");
  
  // Format to match JSON payload output
  return interests.map(i => {
    const obj = i.toObject();
    obj.hackathon = obj.hackathonId; // mapping populated field
    return obj;
  });
};

const checkInterest = async (userId, hackathonId) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const interests = readCollection("interests") || [];
    const isInterested = interests.some(
      i => String(i.userId) === String(userId) && String(i.hackathonId) === String(hackathonId) && i.status === "Interested"
    );
    const interest = interests.find(i => String(i.userId) === String(userId) && String(i.hackathonId) === String(hackathonId) && i.status === "Interested");
    return { success: true, isInterested: Boolean(interest), interest: interest || null };
  }

  const existing = await HackathonInterest.findOne({ userId, hackathonId, status: "Interested" });
  return { success: true, isInterested: !!existing, interest: existing ? existing.toObject() : null };
};

const scoreCandidate = (viewer, team, candidate, hackathon, teamRoles = []) => {
  const compatibility = calculateCompatibility(
    viewer,
    {
      ...hackathon,
      requiredSkills: team?.requiredSkills?.length ? team.requiredSkills : (hackathon?.requiredSkills || []),
    },
    candidate,
    teamRoles
  );

  return {
    matchScore: compatibility.compatibilityScore,
    matchingSkills: compatibility.matchedSkills,
    missingSkills: compatibility.missingSkills,
    whyMatches: compatibility.matchedSkills.length
      ? `Strong fit for ${compatibility.matchedSkills.slice(0, 2).join(" and ")}.`
      : `Recommended for a complementary ${compatibility.recommendedRole} role.`,
  };
};

const teamInviteData = (team) => {
  if (!team) return { canInvite: false, team: null };
  const memberCount = Math.max(team.membersCount || 0, (team.members || []).length || 0, 1);
  const maxMembers = team.maxMembers || 4;
  const hasSlot = memberCount < maxMembers && team.status !== "Closed" && team.recruitmentStatus !== "Closed" && team.recruitmentStatus !== "Full";
  return { canInvite: hasSlot, team: { _id: team._id || team.id, teamName: team.teamName, memberCount, maxMembers, requiredSkills: team.requiredSkills || [] } };
};

const getDiscoverableInterestedUsers = async (viewerId, query = {}) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    const interests = readCollection("interests") || [];
    const users = readCollection("users") || [];
    const hackathons = readCollection("hackathons") || [];
    const teams = readCollection("teams") || [];
    const viewer = users.find((user) => String(user._id) === String(viewerId));
    if (!viewer) throw new Error("USER_NOT_FOUND");
    const viewerTeams = teams.filter((team) => String(team.leader) === String(viewerId));
    return interests.filter((interest) => String(interest.userId) !== String(viewerId) && interest.status === "Interested" && (!query.hackathonId || String(interest.hackathonId) === String(query.hackathonId)))
      .map((interest) => {
        const user = users.find((item) => String(item._id) === String(interest.userId));
        const hackathon = hackathons.find((item) => String(item._id || item.id) === String(interest.hackathonId));
        if (!user || !hackathon) return null;
        const alreadyInTeam = teams.some((team) => String(team.hackathonId) === String(interest.hackathonId) && ((team.members || []).some((id) => String(id) === String(user._id)) || String(team.leader) === String(user._id)));
        if (alreadyInTeam) return null;
        const team = viewerTeams.find((item) => String(item.hackathonId) === String(interest.hackathonId));
        // Solo builders are only relevant when the viewer owns a team for the
        // same hackathon. This keeps suggestions tied to the user's workspace.
        if (!team) return null;
        const teamRoles = (team.members || []).map((id) => users.find((member) => String(member._id) === String(id))?.preferredRole).filter(Boolean);
        const score = scoreCandidate(viewer, team, user, hackathon, teamRoles);
        return { interestId: interest._id, hackathon: { _id: hackathon._id || hackathon.id, title: hackathon.title }, user: { _id: user._id, name: user.name, avatar: user.avatar || "", bio: user.bio || "", skills: user.skills || [], preferredRole: user.preferredRole, experience: user.experience, college: user.college, location: user.location, availability: user.availability, github: user.github, linkedin: user.linkedin, trustScore: user.trustScore }, ...teamInviteData(team), ...score };
      }).filter(Boolean).sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  }

  const viewer = await User.findById(viewerId).lean();
  if (!viewer) throw new Error("USER_NOT_FOUND");
  const viewerTeams = await Team.find({ leader: viewerId }).populate("members", "preferredRole").lean();
  const mongoInterestFilter = { userId: { $ne: viewerId }, status: "Interested" };
  if (query.hackathonId) mongoInterestFilter.hackathonId = query.hackathonId;
  const interests = await HackathonInterest.find(mongoInterestFilter).populate("userId", "name avatar bio skills interests preferredRole experience college location availability github linkedin trustScore completedHackathons profileCompletion lastActive").populate("hackathonId", "title requiredSkills").lean();
  const results = [];
  for (const interest of interests) {
    if (!interest.userId || !interest.hackathonId) continue;
    const alreadyInTeam = await Team.exists({ hackathonId: interest.hackathonId._id, $or: [{ leader: interest.userId._id }, { members: interest.userId._id }] });
    if (alreadyInTeam) continue;
    const team = viewerTeams.find((item) => String(item.hackathonId) === String(interest.hackathonId._id));
    if (!team) continue;
    const teamRoles = (team.members || []).map((member) => member.preferredRole).filter(Boolean);
    const score = scoreCandidate(viewer, team, interest.userId, interest.hackathonId, teamRoles);
    results.push({ interestId: interest._id, hackathon: interest.hackathonId, user: interest.userId, ...teamInviteData(team), ...score });
  }
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
};

module.exports = {
  addInterest,
  removeInterest,
  removeInterestById,
  getMyInterestedHackathons,
  checkInterest,
  getDiscoverableInterestedUsers
};
