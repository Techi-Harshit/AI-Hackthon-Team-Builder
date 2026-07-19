const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    // Captures the interest record that led to this team, keeping the team
    // workspace tied to its hackathon context.
    interestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HackathonInterest",
    },

    hackathonName: {
      type: String,
      default: "",
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    requiredSkills: {
      type: [String],
      default: [],
    },

    maxMembers: {
      type: Number,
      default: 4,
    },

    activityScore: {
      type: Number,
      default: 0,
    },

    profileViews: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },

    messagesCount: {
      type: Number,
      default: 0,
    },

    membersCount: {
      type: Number,
      default: 1,
    },

    hackathonsParticipated: {
      type: Number,
      default: 0,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    requiredRole: {
      type: String,
      default: "Full Stack",
    },

    experienceRequired: {
      type: String,
      default: "Intermediate",
    },

    domain: {
      type: String,
      default: "Web Development",
    },

    meetingSchedule: {
      type: String,
      default: "Flexible",
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },

    remainingSlots: {
      type: Number,
      default: 3
    },

    recruitmentStatus: {
      type: String,
      enum: ["Recruiting", "Closed", "Full"],
      default: "Recruiting"
    },

    requiredRoles: {
      type: [String],
      default: []
    },

    teamCompletion: {
      type: Number,
      default: 25
    },
    totalXP: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
    hackathonsParticipated: {
      type: Number,
      default: 0
    },
    hackathonsWon: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      default: "Web Development"
    },
    region: {
      type: String,
      default: "India"
    },
    activeStatus: {
      type: String,
      default: "Active"
    },
    lookingForMembers: {
      type: Boolean,
      default: true
    },
    currentMembers: {
      type: Number,
      default: 1
    },
    teamStatus: {
      type: String,
      default: "Active"
    },
    isRecruiting: {
      type: Boolean,
      default: true
    },
    visibility: {
      type: String,
      default: "Public"
    }
  },
  {
    timestamps: true,
  }
);

teamSchema.pre("save", function() {
  this.remainingSlots = Math.max(0, this.maxMembers - (this.members ? this.members.length : 0) - 1);
  this.recruitmentStatus = this.remainingSlots <= 0 ? "Closed" : "Recruiting";
  this.teamCompletion = Math.round(((this.maxMembers - this.remainingSlots) / this.maxMembers) * 100);
});

module.exports = mongoose.model("Team", teamSchema);
