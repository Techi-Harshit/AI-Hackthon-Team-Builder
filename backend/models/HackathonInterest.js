const mongoose = require("mongoose");

const HackathonInterestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hackathon",
    required: true
  },
  hackathonName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Interested", "Not Interested"],
    default: "Interested"
  },
  skills: [String],
  role: String,
  experienceLevel: String,
  interestedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// One active interest per user/hackathon pair. This is the final guard against
// concurrent POST requests creating duplicates.
HackathonInterestSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });

// Avoid model compilation error if model already compiled
module.exports = mongoose.models.HackathonInterest || mongoose.model("HackathonInterest", HackathonInterestSchema);
