const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "🏆",
    },
    logoBg: {
      type: String,
      default: "from-purple-500 to-blue-500",
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      default: "",
    },
    organizer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    theme: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    mode: {
      type: String,
      default: "Online",
    },
    onlineOffline: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    location: {
      type: String,
      default: "Global",
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    prizePool: {
      type: String,
      required: true,
    },
    prize: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "USD",
    },
    teamSizeMin: {
      type: Number,
      default: 1,
    },
    teamSizeMax: {
      type: Number,
      default: 4,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    eligibility: {
      type: String,
      default: "All open-source enthusiasts, designers, and programmers.",
    },
    problemStatements: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],
    timeline: [
      {
        title: { type: String, default: "" },
        date: { type: Date },
        description: { type: String, default: "" },
      },
    ],
    rules: {
      type: [String],
      default: [],
    },
    faqs: [
      {
        question: { type: String, default: "" },
        answer: { type: String, default: "" },
      },
    ],
    judges: [
      {
        name: { type: String, default: "" },
        role: { type: String, default: "" },
        avatar: { type: String, default: "" },
      },
    ],
    sponsors: [
      {
        name: { type: String, default: "" },
        logo: { type: String, default: "" },
        tier: { type: String, default: "Bronze" },
      },
    ],
    contactEmail: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    registrationLink: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Pending Review", "Approved", "Rejected", "Published", "Expired", "Cancelled"],
      default: "Draft",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: [String],
      default: [],
    },
    applications: {
      type: [String],
      default: [],
    },
    registeredTeams: {
      type: [String],
      default: [],
    },
    winner: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    approvedAt: {
      type: Date,
    },
    badge: {
      type: String,
      default: "Pending Review",
    },
    badgeColor: {
      type: String,
      default: "amber",
    },
    date: {
      type: String,
      default: "",
    },
    participants: {
      type: String,
      default: "0",
    },
    tags: {
      type: [String],
      default: [],
    },
    extraTags: {
      type: Number,
      default: 0,
    },
    button: {
      type: String,
      default: "View Details",
    },
    buttonStyle: {
      type: String,
      default: "outline",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isRegistrationEnabled: {
      type: Boolean,
      default: true,
    },
    isProjectSubmissionEnabled: {
      type: Boolean,
      default: false,
    },
    hackathonType: {
      type: String,
      enum: ["Open", "Student", "College", "Community"],
      default: "Open",
    },
    isCrossCollegeAllowed: {
      type: Boolean,
      default: true,
    },
    eligibleYears: {
      type: [String],
      default: ["1st", "2nd", "3rd", "4th"],
    },
    allowedColleges: {
      type: [String],
      default: [],
    },
    communityName: {
      type: String,
      default: "",
    },
    domains: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    interestCount: {
      type: Number,
      default: 0,
    },
    teamCount: {
      type: Number,
      default: 0,
    },
    lookingForMembers: {
      type: Boolean,
      default: true,
    },
    soloDevelopers: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Hackathon",
  hackathonSchema
);