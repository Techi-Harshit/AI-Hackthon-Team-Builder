const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    bookmarkType: {
      type: String,
      required: true,
      enum: ["hackathon", "team", "project", "skill", "organizer", "company", "opportunity", "profile"]
    },
    itemId: {
      type: String,
      required: true,
      index: true
    },
    itemName: {
      type: String,
      required: true
    },
    itemImage: {
      type: String
    },
    itemDescription: {
      type: String
    },
    category: {
      type: String,
      default: "Favorites"
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon"
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },
    projectId: {
      type: String
    },
    organizerId: {
      type: String
    },
    companyId: {
      type: String
    },
    profileId: {
      type: String
    },
    skillName: {
      type: String
    },
    status: {
      type: String
    },
    tags: {
      type: [String],
      default: []
    },
    folderName: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Ensure a user cannot save the exact same item multiple times
bookmarkSchema.index({ userId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
