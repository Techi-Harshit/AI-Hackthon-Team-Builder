const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["team", "developer", "hackathon", "organization"],
      index: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    currentRank: {
      type: Number,
      default: 0,
      index: true
    },
    lastMonthRank: {
      type: Number,
      default: 0
    },
    seasonRank: {
      type: Number,
      default: 0
    },
    totalXP: {
      type: Number,
      default: 0,
      index: true
    },
    wins: {
      type: Number,
      default: 0,
      index: true
    },
    rating: {
      type: Number,
      default: 0,
      index: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    projectsCompleted: {
      type: Number,
      default: 0
    },
    hackathonsWon: {
      type: Number,
      default: 0
    },
    hackathonsParticipated: {
      type: Number,
      default: 0,
      index: true
    },
    badges: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: "General",
      index: true
    },
    region: {
      type: String,
      default: "Global",
      index: true
    },
    trend: {
      type: String,
      default: "NEW" // "+X", "-X", "NEW", "SAME"
    },
    growthPercentage: {
      type: Number,
      default: 0.0
    },
    season: {
      type: Number,
      default: 1,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Unique constraint per season, type, and referenceId to avoid duplicates
leaderboardSchema.index({ season: 1, type: 1, referenceId: 1 }, { unique: true });

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
