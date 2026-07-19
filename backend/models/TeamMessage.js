const mongoose = require("mongoose");

const TeamMessageSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  text: {
    type: String
  },
  type: {
    type: String,
    enum: ["text", "voice", "poll", "pdf", "github", "announcement"],
    default: "text"
  },
  replyTo: {
    type: String
  },
  time: {
    type: String
  },
  isMe: {
    type: Boolean,
    default: false
  },
  duration: String,
  repo: String,
  link: String,
  fileName: String,
  fileSize: String,
  options: [{
    id: String,
    text: String,
    votes: { type: Number, default: 0 }
  }],
  totalVotes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("TeamMessage", TeamMessageSchema);
