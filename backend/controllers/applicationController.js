const Application = require("../models/Application");
const Team = require("../models/Team");
const User = require("../models/User");

const createApplication = async (req, res) => {
  try {
    const targetTeamId = req.body.teamId;
    if (!targetTeamId) {
      return res.status(400).json({ message: "teamId is required." });
    }

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const applications = readCollection("applications");
      const teams = readCollection("teams");
      const users = readCollection("users");

      const team = teams.find((t) => String(t._id) === String(targetTeamId));
      if (!team) {
        return res.status(404).json({ message: "Team not found." });
      }

      // Check if user is leader of this team
      const rawLeaderId = typeof team.leader === "object" ? (team.leader._id || team.leader.id) : team.leader;
      if (String(rawLeaderId) === String(req.user._id)) {
        return res.status(400).json({ message: "You cannot request to join your own team." });
      }

      // Check if user is already a member of this team
      const isMember = team.members && team.members.some(m => String(m) === String(req.user._id));
      if (isMember) {
        return res.status(400).json({ message: "You are already a member of this team." });
      }

      // Check if user is already a leader or member of any other team for this hackathon
      const userAlreadyInATeam = teams.some(t => {
        const hasSameHackathon = String(t.hackathonId) === String(team.hackathonId);
        if (!hasSameHackathon) return false;
        const isLeaderOfT = String(typeof t.leader === "object" ? (t.leader._id || t.leader.id) : t.leader) === String(req.user._id);
        const isMemberOfT = t.members && t.members.some(m => String(m) === String(req.user._id));
        return isLeaderOfT || isMemberOfT;
      });
      if (userAlreadyInATeam) {
        return res.status(400).json({
          message: "You are already a member or leader of a team for this hackathon.",
        });
      }

      // Check for duplicate pending applications
      const hasPending = applications.some(
        (app) =>
          String(app.userId) === String(req.user._id) &&
          String(app.teamId) === String(targetTeamId) &&
          app.status === "pending"
      );
      if (hasPending) {
        return res.status(400).json({ message: "You already have a pending join request for this team." });
      }

      const maxLimit = team.maxMembers || 4;
      const currentCount = team.members ? team.members.length : 1;
      if (currentCount >= maxLimit) {
        return res.status(400).json({
          message: "This team has already reached its maximum member capacity.",
        });
      }

      const newApplication = {
        _id: new Date().getTime().toString(),
        userId: req.user._id,
        teamId: targetTeamId,
        message: req.body.message || "Hi, I would love to join your team!",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      applications.push(newApplication);
      writeCollection("applications", applications);

      // Push notification to team leader (JSON mode)
      if (team.leader) {
        const leaderIdStr = String(rawLeaderId).trim();
        const leaderIndex = users.findIndex((u) => String(u._id).trim() === leaderIdStr);
        const applicant = users.find((u) => String(u._id).trim() === String(req.user._id).trim());

        if (leaderIndex !== -1) {
          if (!users[leaderIndex].notifications) {
            users[leaderIndex].notifications = [];
          }
          users[leaderIndex].notifications.unshift({
            _id: new Date().getTime().toString() + "_n",
            type: "join_request",
            message: `${applicant?.name || "Someone"} wants to join your team "${team.teamName}"`,
            applicationId: newApplication._id,
            teamId: team._id,
            teamName: team.teamName,
            fromUserId: req.user._id,
            fromUserName: applicant?.name || "Unknown",
            fromUserAvatar: applicant?.avatar || "",
            read: false,
            createdAt: new Date(),
          });
          writeCollection("users", users);
        }
      }

      return res.status(201).json(newApplication);
    }

    const team = await Team.findById(targetTeamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Check if user is leader of this team
    const leaderId = team.leader._id || team.leader;
    if (String(leaderId) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot request to join your own team." });
    }

    // Check if user is already a member of this team
    const isMember = team.members && team.members.some(m => String(m) === String(req.user._id));
    if (isMember) {
      return res.status(400).json({ message: "You are already a member of this team." });
    }

    // Check if user is already a leader or member of any other team for this hackathon
    const userAlreadyInATeam = await Team.findOne({
      hackathonId: team.hackathonId,
      $or: [
        { leader: req.user._id },
        { members: req.user._id }
      ]
    });
    if (userAlreadyInATeam) {
      return res.status(400).json({
        message: "You are already a member or leader of a team for this hackathon.",
      });
    }

    // Check for duplicate pending applications
    const hasPending = await Application.findOne({
      userId: req.user._id,
      teamId: targetTeamId,
      status: "pending",
    });
    if (hasPending) {
      return res.status(400).json({ message: "You already have a pending join request for this team." });
    }

    if (team.members && team.members.length >= team.maxMembers) {
      return res.status(400).json({
        message: "This team has already reached its maximum member capacity.",
      });
    }

    const application = await Application.create({
      userId: req.user._id,
      teamId: targetTeamId,
      message: req.body.message || "Hi, I would love to join your team!",
    });

    // Push notification to team leader (MongoDB mode)
    if (team.leader) {
      const applicant = await User.findById(req.user._id).select("name avatar");
      await User.findByIdAndUpdate(leaderId, {
        $push: {
          notifications: {
            $each: [{
              type: "join_request",
              message: `${applicant?.name || "Someone"} wants to join your team "${team.teamName}"`,
              applicationId: application._id,
              teamId: team._id,
              teamName: team.teamName,
              fromUserId: req.user._id,
              fromUserName: applicant?.name || "Unknown",
              fromUserAvatar: applicant?.avatar || "",
              read: false,
              createdAt: new Date(),
            }],
            $position: 0,
          },
        },
      });
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const getTeamApplications = async (
  req,
  res
) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      const applications = readCollection("applications");
      const users = readCollection("users");
      const teams = readCollection("teams");

      const filteredApps = applications.filter((app) => app.teamId === req.params.teamId);

      const populatedApps = filteredApps.map((app) => {
        const user = users.find((u) => u._id === app.userId);
        const team = teams.find((t) => t._id === app.teamId);

        return {
          ...app,
          userId: user ? { _id: user._id, name: user.name, email: user.email } : null,
          teamId: team ? { _id: team._id, teamName: team.teamName } : null,
        };
      });

      return res.status(200).json(populatedApps);
    }

    const applications =
      await Application.find({
        teamId: req.params.teamId,
      })
        .populate("userId", "name email")
        .populate("teamId", "teamName");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const acceptApplication = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const applications = readCollection("applications");
      const teams = readCollection("teams");
      const users = readCollection("users");

      const index = applications.findIndex((app) => String(app._id) === String(req.params.id));
      if (index === -1) {
        return res.status(404).json({
          message: "Application Not Found",
        });
      }

      applications[index].status = "accepted";
      applications[index].updatedAt = new Date();
      writeCollection("applications", applications);

      const teamIndex = teams.findIndex((t) => String(t._id) === String(applications[index].teamId));
      let teamName = "a team";
      if (teamIndex !== -1) {
        const maxLimit = teams[teamIndex].maxMembers || 4;
        const currentCount = teams[teamIndex].members ? teams[teamIndex].members.length : 1;
        if (currentCount >= maxLimit) {
          return res.status(400).json({
            message: "Team has already reached its maximum member limit.",
          });
        }

        if (!teams[teamIndex].members) {
          teams[teamIndex].members = [];
        }
        if (!teams[teamIndex].members.includes(applications[index].userId)) {
          teams[teamIndex].members.push(applications[index].userId);
        }
        teams[teamIndex].updatedAt = new Date();
        writeCollection("teams", teams);
        teamName = teams[teamIndex].teamName;
      }

      // Send accepted notification to applicant (JSON mode)
      const applicantIdStr = String(applications[index].userId).trim();
      const applicantIndex = users.findIndex((u) => String(u._id).trim() === applicantIdStr);
      if (applicantIndex !== -1) {
        if (!users[applicantIndex].notifications) {
          users[applicantIndex].notifications = [];
        }
        users[applicantIndex].notifications.unshift({
          _id: new Date().getTime().toString() + "_acc",
          type: "application_accepted",
          message: `Your request to join team "${teamName}" has been accepted! 🎉`,
          applicationId: applications[index]._id,
          teamId: applications[index].teamId,
          teamName: teamName,
          fromUserId: req.user._id,
          fromUserName: req.user.name || "Team Leader",
          fromUserAvatar: req.user.avatar || "",
          read: false,
          createdAt: new Date(),
        });
        writeCollection("users", users);
      }

      return res.status(200).json({
        message: "Application Accepted",
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        message: "Application Not Found",
      });
    }

    application.status = "accepted";
    await application.save();

    const team = await Team.findById(application.teamId);
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({
        message: "Team has already reached its maximum member limit.",
      });
    }

    const applicantId = application.userId._id || application.userId;
    team.members.push(applicantId);
    await team.save();

    // Send accepted notification to applicant (MongoDB mode)
    await User.findByIdAndUpdate(applicantId, {
      $push: {
        notifications: {
          $each: [{
            type: "application_accepted",
            message: `Your request to join team "${team.teamName}" has been accepted! 🎉`,
            applicationId: application._id,
            teamId: team._id,
            teamName: team.teamName,
            fromUserId: req.user._id,
            fromUserName: req.user.name || "Team Leader",
            fromUserAvatar: req.user.avatar || "",
            read: false,
            createdAt: new Date(),
          }],
          $position: 0,
        },
      },
    });

    res.status(200).json({
      message: "Application Accepted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const rejectApplication = async (req, res) => {
  try {
    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const applications = readCollection("applications");
      const teams = readCollection("teams");
      const users = readCollection("users");

      const index = applications.findIndex((app) => String(app._id) === String(req.params.id));
      if (index === -1) {
        return res.status(404).json({
          message: "Application Not Found",
        });
      }

      applications[index].status = "rejected";
      applications[index].updatedAt = new Date();
      writeCollection("applications", applications);

      // Find team details
      const team = teams.find((t) => String(t._id) === String(applications[index].teamId));
      const teamName = team ? team.teamName : "a team";

      // Send rejected notification to applicant (JSON mode)
      const applicantIdStr = String(applications[index].userId).trim();
      const applicantIndex = users.findIndex((u) => String(u._id).trim() === applicantIdStr);
      if (applicantIndex !== -1) {
        if (!users[applicantIndex].notifications) {
          users[applicantIndex].notifications = [];
        }
        users[applicantIndex].notifications.unshift({
          _id: new Date().getTime().toString() + "_rej",
          type: "application_rejected",
          message: `Your request to join team "${teamName}" was declined.`,
          applicationId: applications[index]._id,
          teamId: applications[index].teamId,
          teamName: teamName,
          fromUserId: req.user._id,
          fromUserName: req.user.name || "Team Leader",
          fromUserAvatar: req.user.avatar || "",
          read: false,
          createdAt: new Date(),
        });
        writeCollection("users", users);
      }

      return res.status(200).json({
        message: "Application Rejected",
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        message: "Application Not Found",
      });
    }

    application.status = "rejected";
    await application.save();

    const team = await Team.findById(application.teamId);
    const applicantId = application.userId._id || application.userId;

    // Send rejected notification to applicant (MongoDB mode)
    await User.findByIdAndUpdate(applicantId, {
      $push: {
        notifications: {
          $each: [{
            type: "application_rejected",
            message: `Your request to join team "${team ? team.teamName : "a team"}" was declined.`,
            applicationId: application._id,
            teamId: application ? team._id : null,
            teamName: team ? team.teamName : "a team",
            fromUserId: req.user._id,
            fromUserName: req.user.name || "Team Leader",
            fromUserAvatar: req.user.avatar || "",
            read: false,
            createdAt: new Date(),
          }],
          $position: 0,
        },
      },
    });

    res.status(200).json({
      message: "Application Rejected",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createApplication,
  getTeamApplications,
  acceptApplication,
  rejectApplication,
};