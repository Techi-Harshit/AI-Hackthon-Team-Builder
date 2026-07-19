const mongoose = require("mongoose");

const bookmarkFolderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    folderName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bookmark"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Ensure folderName is unique per user
bookmarkFolderSchema.index({ userId: 1, folderName: 1 }, { unique: true });

module.exports = mongoose.model("BookmarkFolder", bookmarkFolderSchema);
