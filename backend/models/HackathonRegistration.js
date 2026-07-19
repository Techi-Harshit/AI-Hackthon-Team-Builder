const mongoose = require("mongoose");

const hackathonRegistrationSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    registeredAsTeam: {
      type: Boolean,
      default: false,
    },
    registrationId: {
      type: String,
      unique: true,
      required: true,
    },
    teamName: {
      type: String,
      default: "",
    },
    teamLogo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    college: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      default: "IST",
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    recruitmentStatus: {
      type: String,
      enum: ["Recruiting", "Filled"],
      default: "Recruiting",
    },
    leaderDetails: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    memberDetails: [
      {
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        role: { type: String, default: "Full Stack" },
        skills: { type: [String], default: [] },
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        college: { type: String, default: "" },
        year: { type: String, default: "" },
        branch: { type: String, default: "" },
        community: { type: String, default: "" },
        status: { type: String, default: "Pending" }, // "Pending", "Accepted"
      },
    ],
    status: {
      type: String,
      enum: [
        "Draft",
        "Registered",
        "Registration Confirmed",
        "Project Submission Pending",
        "Project Submitted",
        "Under Review",
        "Qualified",
        "Finalist",
        "Winner",
        "Rejected",
      ],
      default: "Registered",
    },
    projectDetails: {
      projectTitle: { type: String, default: "" },
      githubRepo: { type: String, default: "" },
      demoLink: { type: String, default: "" },
      description: { type: String, default: "" },
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HackathonRegistration",
  hackathonRegistrationSchema
);
