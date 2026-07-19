const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const RecommendationHistory = require("../models/RecommendationHistory");
const calculateCompatibility = require("../utils/calculateCompatibility");

const sameId = (a, b) => String(a) === String(b);
const now = () => new Date();

const getRecommendations = async (userId, hackathonId) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const users = readCollection("users");
    const hackathons = readCollection("hackathons");
    const teams = readCollection("teams");
    const history = readCollection("recommendationhistory");
    const user = users.find((item) => sameId(item._id, userId));
    const hackathon = hackathons.find((item) => sameId(item._id || item.id, hackathonId));
    if (!user) throw new Error("USER_NOT_FOUND");
    if (!hackathon) throw new Error("HACKATHON_NOT_FOUND");

    const team = teams.find((item) => sameId(item.hackathonId, hackathonId) && sameId(item.leader, userId));
    if (!team) throw new Error("TEAM_NOT_FOUND");
    const memberIds = (team.members || []).map(String);
    if (memberIds.length >= (team.maxMembers || 4)) throw new Error("TEAM_FULL");
    const excluded = new Set([String(userId), ...memberIds]);
    history.filter((item) => sameId(item.userId, userId) && sameId(item.hackathonId, hackathonId) && ["invited", "accepted"].includes(item.status)).forEach((item) => excluded.add(String(item.candidateId)));
    const teamRoles = memberIds.map((id) => users.find((candidate) => sameId(candidate._id, id))?.preferredRole).filter(Boolean);
    const recommendations = users
      .filter((candidate) => !excluded.has(String(candidate._id)) && candidate.lookingForTeam !== false)
      .map((candidate) => ({ candidate, compatibility: calculateCompatibility(user, { ...hackathon, requiredSkills: team.requiredSkills?.length ? team.requiredSkills : hackathon.requiredSkills }, candidate, teamRoles) }))
      .sort((a, b) => b.compatibility.compatibilityScore - a.compatibility.compatibilityScore)
      .slice(0, 10)
      .map(({ candidate, compatibility }) => ({ id: candidate._id, name: candidate.name, avatar: candidate.avatar || "", preferredRole: candidate.preferredRole, skills: candidate.skills || [], trustScore: candidate.trustScore ?? 50, ...compatibility }));
    recommendations.forEach((item) => {
      if (!history.some((record) => sameId(record.userId, userId) && sameId(record.candidateId, item.id) && sameId(record.hackathonId, hackathonId))) {
        history.push({ _id: `${Date.now()}_${item.id}`, userId, candidateId: item.id, hackathonId, compatibilityScore: item.compatibilityScore, status: "viewed", createdAt: now(), updatedAt: now() });
      }
    });
    writeCollection("recommendationhistory", history);
    return { team, hackathon, recommendations };
  }

  const [user, hackathon, team] = await Promise.all([
    User.findById(userId),
    Hackathon.findById(hackathonId),
    Team.findOne({ hackathonId, leader: userId }).populate("members", "preferredRole"),
  ]);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (!hackathon) throw new Error("HACKATHON_NOT_FOUND");
  if (!team) throw new Error("TEAM_NOT_FOUND");
  if ((team.members || []).length >= (team.maxMembers || 4)) throw new Error("TEAM_FULL");
  const invited = await RecommendationHistory.find({ userId, hackathonId, status: { $in: ["invited", "accepted"] } }).select("candidateId");
  const excluded = [userId, team.leader, ...(team.members || []).map((item) => item._id), ...invited.map((item) => item.candidateId)];
  const candidates = await User.find({ _id: { $nin: excluded }, lookingForTeam: { $ne: false } });
  const teamRoles = (team.members || []).map((item) => item.preferredRole).filter(Boolean);
  const recommendations = candidates.map((candidate) => {
    const compatibility = calculateCompatibility(user, { ...hackathon.toObject(), requiredSkills: team.requiredSkills?.length ? team.requiredSkills : hackathon.requiredSkills }, candidate, teamRoles);
    return { id: candidate._id, name: candidate.name, avatar: candidate.avatar || "", preferredRole: candidate.preferredRole, skills: candidate.skills || [], trustScore: candidate.trustScore ?? 50, ...compatibility };
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 10);
  await Promise.all(recommendations.map((item) => RecommendationHistory.findOneAndUpdate(
    { userId, candidateId: item.id, hackathonId },
    { $setOnInsert: { compatibilityScore: item.compatibilityScore, status: "viewed", createdAt: now() }, $set: { updatedAt: now() } },
    { upsert: true }
  )));
  return { team, hackathon, recommendations };
};

const inviteCandidate = async (userId, hackathonId, candidateId) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const teams = readCollection("teams"); const users = readCollection("users"); const history = readCollection("recommendationhistory");
    const team = teams.find((item) => sameId(item.hackathonId, hackathonId) && sameId(item.leader, userId));
    const candidate = users.find((item) => sameId(item._id, candidateId)); const sender = users.find((item) => sameId(item._id, userId));
    if (!team) throw new Error("You must be the team leader to send requests.");
    if (!candidate) throw new Error("Candidate not found.");
    if ((team.members || []).some((id) => sameId(id, candidateId))) throw new Error("This member is already in your team.");
    if ((team.members || []).length >= (team.maxMembers || 4)) throw new Error("Your team is full.");
    if ((candidate.notifications || []).some((item) => item.type === "team_invitation" && sameId(item.teamId, team._id) && item.invitationStatus === "pending")) throw new Error("A request is already pending for this member.");
    candidate.notifications = candidate.notifications || [];
    candidate.notifications.unshift({ _id: `invite_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type: "team_invitation", invitationStatus: "pending", message: `${sender?.name || "A team leader"} sent you a request to join ${team.teamName}.`, teamId: team._id, teamName: team.teamName, fromUserId: userId, fromUserName: sender?.name || "Team leader", fromUserAvatar: sender?.avatar || "", read: false, createdAt: now() });
    const record = history.find((item) => sameId(item.userId, userId) && sameId(item.candidateId, candidateId) && sameId(item.hackathonId, hackathonId));
    if (record) { record.status = "invited"; record.updatedAt = now(); } else history.push({ _id: `${Date.now()}_${candidateId}`, userId, candidateId, hackathonId, status: "invited", createdAt: now(), updatedAt: now() });
    writeCollection("users", users); writeCollection("recommendationhistory", history);
    return { success: true, message: `Request sent to ${candidate.name}.` };
  }
  const [team, candidate, sender, hackathon] = await Promise.all([Team.findOne({ hackathonId, leader: userId }), User.findById(candidateId), User.findById(userId).select("name avatar"), Hackathon.findById(hackathonId).select("title")]);
  if (!team) throw new Error("You must be the team leader to send requests.");
  if (!candidate) throw new Error("Candidate not found.");
  if (team.members.some((id) => sameId(id, candidateId))) throw new Error("This member is already in your team.");
  if (team.members.length >= team.maxMembers) throw new Error("Your team is full.");
  const pending = candidate.notifications?.some((item) => item.type === "team_invitation" && sameId(item.teamId, team._id) && item.invitationStatus === "pending");
  if (pending) throw new Error("A request is already pending for this member.");
  candidate.notifications.push({ type: "team_invitation", invitationStatus: "pending", message: `${sender?.name || "A team leader"} sent you a request to join ${team.teamName} for ${hackathon?.title || "a hackathon"}.`, teamId: team._id, teamName: team.teamName, fromUserId: userId, fromUserName: sender?.name || "Team leader", fromUserAvatar: sender?.avatar || "", read: false, createdAt: now() });
  await candidate.save();
  await RecommendationHistory.findOneAndUpdate({ userId, candidateId, hackathonId }, { $set: { status: "invited", updatedAt: now() }, $setOnInsert: { createdAt: now(), compatibilityScore: 0 } }, { upsert: true });
  return { success: true, message: `Request sent to ${candidate.name}.` };
};

const getUserInvitations = async (candidateId) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb"); const users = readCollection("users"); const teams = readCollection("teams"); const hacks = readCollection("hackathons");
    const candidate = users.find((item) => sameId(item._id, candidateId));
    return (candidate?.notifications || []).filter((item) => item.type === "team_invitation" && (item.invitationStatus || "pending") === "pending").map((item) => {
      const team = teams.find((value) => sameId(value._id, item.teamId)); const leader = users.find((value) => sameId(value._id, item.fromUserId)); const hackathon = hacks.find((value) => sameId(value._id || value.id, team?.hackathonId));
      return { ...item, leaderName: leader?.name || item.fromUserName, hackathonName: hackathon?.title || "Hackathon", compatibilityScore: 0 };
    });
  }
  const candidate = await User.findById(candidateId).select("notifications");
  return Promise.all((candidate?.notifications || []).filter((item) => item.type === "team_invitation" && (item.invitationStatus || "pending") === "pending").map(async (item) => {
    const team = await Team.findById(item.teamId).select("hackathonId"); const hackathon = team ? await Hackathon.findById(team.hackathonId).select("title") : null;
    return { ...item.toObject(), leaderName: item.fromUserName, hackathonName: hackathon?.title || "Hackathon", compatibilityScore: 0 };
  }));
};

const respondToInvitation = async (invitationId, candidateId, accepted) => {
  const action = accepted ? "accepted" : "rejected";
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb"); const users = readCollection("users"); const teams = readCollection("teams"); const history = readCollection("recommendationhistory");
    const candidate = users.find((item) => sameId(item._id, candidateId)); const invitation = candidate?.notifications?.find((item) => sameId(item._id, invitationId) && item.type === "team_invitation" && (item.invitationStatus || "pending") === "pending");
    if (!invitation) throw new Error("Invitation not found or already processed.");
    const team = teams.find((item) => sameId(item._id, invitation.teamId)); const leader = users.find((item) => sameId(item._id, invitation.fromUserId));
    if (!team || !leader) throw new Error("The team is no longer available.");
    if (accepted && (team.members || []).length >= (team.maxMembers || 4)) throw new Error("This team is already full.");
    invitation.invitationStatus = action; invitation.read = true; invitation.respondedAt = now();
    if (accepted && !(team.members || []).some((id) => sameId(id, candidateId))) { team.members = [...(team.members || []), candidateId]; team.membersCount = team.members.length; team.currentMembers = team.members.length; team.remainingSlots = Math.max(0, (team.maxMembers || 4) - team.members.length); if (!team.remainingSlots) { team.recruitmentStatus = "Full"; team.status = "Closed"; } }
    const record = history.find((item) => sameId(item.userId, invitation.fromUserId) && sameId(item.candidateId, candidateId) && sameId(item.hackathonId, team.hackathonId)); if (record) { record.status = action; record.updatedAt = now(); }
    leader.notifications = leader.notifications || []; leader.notifications.unshift({ _id: `response_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type: `team_invitation_${action}`, message: accepted ? `${candidate.name} accepted your request and has been added to ${team.teamName}.` : `Your request for ${candidate.name} was rejected.`, teamId: team._id, teamName: team.teamName, fromUserId: candidateId, fromUserName: candidate.name, read: false, createdAt: now() });
    writeCollection("users", users); writeCollection("teams", teams); writeCollection("recommendationhistory", history);
    return { success: true, message: accepted ? "You joined the team." : "Request rejected." };
  }
  const candidate = await User.findById(candidateId); const invitation = candidate?.notifications?.id(invitationId);
  if (!invitation || invitation.type !== "team_invitation" || (invitation.invitationStatus || "pending") !== "pending") throw new Error("Invitation not found or already processed.");
  const team = await Team.findById(invitation.teamId); const leader = await User.findById(invitation.fromUserId);
  if (!team || !leader) throw new Error("The team is no longer available.");
  if (accepted && team.members.length >= team.maxMembers) throw new Error("This team is already full.");
  invitation.invitationStatus = action; invitation.read = true; invitation.respondedAt = now();
  if (accepted && !team.members.some((id) => sameId(id, candidateId))) { team.members.push(candidateId); team.membersCount = team.members.length; team.currentMembers = team.members.length; if (team.members.length >= team.maxMembers) { team.recruitmentStatus = "Full"; team.status = "Closed"; } await team.save(); }
  leader.notifications.push({ type: `team_invitation_${action}`, message: accepted ? `${candidate.name} accepted your request and has been added to ${team.teamName}.` : `Your request for ${candidate.name} was rejected.`, teamId: team._id, teamName: team.teamName, fromUserId: candidateId, fromUserName: candidate.name, read: false, createdAt: now() });
  await Promise.all([candidate.save(), leader.save(), RecommendationHistory.findOneAndUpdate({ userId: invitation.fromUserId, candidateId, hackathonId: team.hackathonId }, { $set: { status: action, updatedAt: now() } })]);
  return { success: true, message: accepted ? "You joined the team." : "Request rejected." };
};

const acceptInvitation = (invitationId, candidateId) => respondToInvitation(invitationId, candidateId, true);
const rejectInvitation = (invitationId, candidateId) => respondToInvitation(invitationId, candidateId, false);
const getHistory = async (userId) => global.dbMode === "json" ? require("../utils/jsonDb").readCollection("recommendationhistory").filter((item) => sameId(item.userId, userId)) : RecommendationHistory.find({ userId }).sort({ updatedAt: -1 });
const submitFeedback = async () => ({ success: true, message: "Feedback saved." });

module.exports = { getRecommendations, inviteCandidate, getHistory, submitFeedback, getUserInvitations, acceptInvitation, rejectInvitation };
