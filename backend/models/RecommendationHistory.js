const mongoose = require("mongoose");

const recommendationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true
    },
    compatibilityScore: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["viewed", "invited"],
      default: "viewed"
    },
    feedback: {
      type: String,
      default: ""
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("RecommendationHistory", recommendationHistorySchema);
